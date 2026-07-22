const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const { parseHtmlMetrics } = require('./parserService');

const parsePageHtml = (htmlContent, pageUrl, pageRoute) => {
  if (!htmlContent) {
    return {
      route: pageRoute,
      wordCount: 0,
      hasTitle: false,
      titleLength: 0,
      hasDescription: false,
      headingAudit: { h1: 0, h2: 0, h3: 0, h4: 0, isHierarchyValid: false },
      hasCanonical: false,
      canonicalUrl: ''
    };
  }

  const $ = cheerio.load(htmlContent);
  const titleText = $('title').text() || '';
  const descText = $('meta[name="description"]').attr('content') || '';

  // Clean raw body text extraction
  const $clean = cheerio.load(htmlContent);
  $clean('script, style, svg, noscript, nav, footer, iframe').remove();
  const rawText = $clean('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;

  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;

  const isHierarchyValid = (h1Count === 1) && 
                           (h3Count === 0 || h2Count > 0) && 
                           (h4Count === 0 || h3Count > 0);

  const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';

  return {
    route: pageRoute,
    wordCount,
    hasTitle: titleText.length > 0,
    titleLength: titleText.length,
    hasDescription: descText.length > 0,
    headingAudit: {
      h1: h1Count,
      h2: h2Count,
      h3: h3Count,
      h4: h4Count,
      isHierarchyValid
    },
    hasCanonical: canonicalUrl.length > 0,
    canonicalUrl
  };
};

const analyzeUrl = async (targetUrl, userLimits, singlePagePath = null) => {
  if (singlePagePath) {
    const pageUrl = `${targetUrl.replace(/\/$/, '')}${singlePagePath}`;
    let htmlContent = '';
    try {
      const pageRes = await axios.get(pageUrl, { timeout: 4000 });
      htmlContent = pageRes.data;
    } catch (e) {
      // Handled by returning blank metadata block
    }
    const parsedPage = parsePageHtml(htmlContent, pageUrl, singlePagePath);
    return {
      success: true,
      singlePage: parsedPage
    };
  }

  const result = {
    url: targetUrl,
    tier: userLimits.tier,
    pageDepthCrawled: 0,
    totalPagesFound: 1, // Simulated total domain size
    status: {
      robotsTxtExists: false,
      llmsTxtExists: false,
      aiContextExists: false,
      aboutTxtExists: false,
      docsTxtExists: false,
      contentTxtExists: false,
      sitemapExists: false,
      xRobotsIndexable: true,
      hasProperHierarchy: true,
      experienceScore: 0,
      readabilityRating: 'Good',
      seoOptimalTitle: false,
      seoOptimalDesc: false,
      gatewayBadge: 'Hidden Assets',
      contentDensityRatio: 0,
      spaTrapDetected: false,
      jsonLdExists: false,
      jsonLdTypes: [],
      machinePreview: '',
      botPermissions: {
        gptBot: true,
        perplexityBot: true,
        claudeBot: true,
        googleExtended: true
      }
    },
    alerts: [],
    scoreCard: {
      overallScore: 100,
      classification: 'Good'
    },
    pages: []
  };

  try {
    const parsedUrl = new url.URL(targetUrl);
    const domainOrigin = parsedUrl.origin;

    // 1. Fetch robots.txt at root domain
    let robotsContent = '';
    try {
      const robotsRes = await axios.get(`${domainOrigin}/robots.txt`, { timeout: 3000 });
      robotsContent = robotsRes.data;
      result.status.robotsTxtExists = true;
    } catch (e) {
      result.status.robotsTxtExists = false;
    }

    // 2. Fetch /llms.txt and /ai-context.md in parallel
    try {
      const llmsRes = await axios.get(`${domainOrigin}/llms.txt`, { timeout: 2000 });
      if (llmsRes.status === 200 && llmsRes.data) {
        result.status.llmsTxtExists = true;
      }
    } catch (e) {
      result.status.llmsTxtExists = false;
    }

    try {
      const aiContextRes = await axios.get(`${domainOrigin}/ai-context.md`, { timeout: 2000 });
      if (aiContextRes.status === 200 && aiContextRes.data) {
        result.status.aiContextExists = true;
      }
    } catch (e) {
      result.status.aiContextExists = false;
    }

    try {
      const aboutRes = await axios.get(`${domainOrigin}/about.md`, { timeout: 2000 });
      if (aboutRes.status === 200 && aboutRes.data) {
        result.status.aboutTxtExists = true;
      }
    } catch (e) {
      result.status.aboutTxtExists = false;
    }

    try {
      const docsRes = await axios.get(`${domainOrigin}/docs.md`, { timeout: 2000 });
      if (docsRes.status === 200 && docsRes.data) {
        result.status.docsTxtExists = true;
      }
    } catch (e) {
      result.status.docsTxtExists = false;
    }

    try {
      const contentRes = await axios.get(`${domainOrigin}/content.md`, { timeout: 2000 });
      if (contentRes.status === 200 && contentRes.data) {
        result.status.contentTxtExists = true;
      }
    } catch (e) {
      result.status.contentTxtExists = false;
    }

    // Check robots.txt for total AI blindness block & specific AI Bot blocks
    if (result.status.robotsTxtExists && robotsContent) {
      const normalizedRobots = robotsContent.replace(/\s+/g, ' ');

      // Look for User-agent: * Disallow: /
      const disallowRegex = /User-agent:\s*\*\s*Disallow:\s*\/\s*(?!\w)/i;
      const blanketDisallowMatch = disallowRegex.test(normalizedRobots) || 
                                   robotsContent.includes('User-agent: *\r\nDisallow: /') ||
                                   robotsContent.includes('User-agent: *\nDisallow: /');

      if (blanketDisallowMatch) {
        result.status.xRobotsIndexable = false;
        result.alerts.push({
          type: 'TOTAL_AI_BLINDNESS',
          severity: 'critical',
          message: 'Blanket indexing block active! robots.txt is instructing all web bots to ignore your domain.'
        });
        result.scoreCard.overallScore = 20;
        result.scoreCard.classification = 'Ugly';
      }

      // Specific AI Bot Disallow Check
      result.status.botPermissions = {
        gptBot: !/User-agent:\s*GPTBot\s*Disallow:\s*\//i.test(robotsContent),
        perplexityBot: !/User-agent:\s*PerplexityBot\s*Disallow:\s*\//i.test(robotsContent),
        claudeBot: !/User-agent:\s*(ClaudeBot|Claude-Web)\s*Disallow:\s*\//i.test(robotsContent),
        googleExtended: !/User-agent:\s*Google-Extended\s*Disallow:\s*\//i.test(robotsContent)
      };

      if (!blanketDisallowMatch) {
        const blockedBots = Object.entries(result.status.botPermissions)
          .filter(([_, allowed]) => !allowed)
          .map(([bot]) => bot);
        if (blockedBots.length > 0) {
          result.alerts.push({
            type: 'AI_BOT_BLOCKED',
            severity: 'warning',
            message: `Targeted AI crawler blocks detected for: ${blockedBots.join(', ')}.`
          });
        }
      }
    }

    // Assign Gateway Relationship Badge
    if (!result.status.xRobotsIndexable) {
      result.status.gatewayBadge = 'Total AI Blindness';
    } else if (result.status.robotsTxtExists && result.status.llmsTxtExists && result.status.aiContextExists) {
      result.status.gatewayBadge = 'Optimized Handshake';
    } else {
      result.status.gatewayBadge = 'Hidden Assets';
    }

    // 3. Fetch targetUrl HTML content & parse Level 2 Metrics
    let htmlContent = '';
    try {
      const mainRes = await axios.get(targetUrl, { timeout: 4000 });
      htmlContent = mainRes.data;
    } catch (e) {
      htmlContent = `<html><body><div id="app"><h1>Mock Content for ${targetUrl}</h1><p>Failed to retrieve live content. Displaying simulation layout.</p></div></body></html>`;
    }

    // Run Level 2 Parser Service
    const parsedMetrics = parseHtmlMetrics(htmlContent);
    result.status.contentDensityRatio = parsedMetrics.contentDensityRatio;
    result.status.spaTrapDetected = parsedMetrics.spaTrapDetected;
    result.status.jsonLdExists = parsedMetrics.jsonLdExists;
    result.status.jsonLdTypes = parsedMetrics.jsonLdTypes;
    result.status.machinePreview = parsedMetrics.machinePreview;

    if (parsedMetrics.spaTrapDetected) {
      result.alerts.push({
        type: 'SPA_TRAP_DETECTED',
        severity: 'warning',
        message: 'Heavy Client-Side Rendering (SPA Trap) detected. AI bots will see an empty container without JavaScript execution.'
      });
    }

    const $ = cheerio.load(htmlContent);

    // Analyze HTML titles
    const titleText = $('title').text() || '';
    const titleLength = titleText.length;
    result.status.seoOptimalTitle = (titleLength >= 75 && titleLength <= 125);

    // Analyze HTML Meta Descriptions
    const descText = $('meta[name="description"]').attr('content') || '';
    const descLength = descText.length;
    result.status.seoOptimalDesc = (descLength >= 173 && descLength <= 213);

    const wordCount = parsedMetrics.wordCount;
    const h1Count = $('h1').length;
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;
    const h4Count = $('h4').length;

    // Check headings hierarchy
    const isHierarchyValid = (h1Count === 1) && 
                             (h3Count === 0 || h2Count > 0) && 
                             (h4Count === 0 || h3Count > 0);

    result.status.hasProperHierarchy = isHierarchyValid;

    // Analyze text length & word counts
    if (wordCount < 500) {
      result.status.readabilityRating = 'Data Starvation';
    } else if (wordCount > 2500) {
      result.status.readabilityRating = 'Truncation Risk';
    } else {
      result.status.readabilityRating = 'Optimal';
    }

    // Ingest sitemap link
    result.status.sitemapExists = robotsContent.toLowerCase().includes('sitemap:');

    // Extract actual internal links discovered on the crawled landing page HTML
    const discoveredLinks = new Set();
    discoveredLinks.add('/'); // Always include homepage route

    let targetHost = '';
    try {
      const parsedTarget = new url.URL(targetUrl);
      targetHost = parsedTarget.hostname;
    } catch (e) {
      // Fallback
    }

    $('a[href]').each((_, el) => {
      try {
        let href = $(el).attr('href');
        if (!href) return;
        href = href.trim();
        if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;

        // Resolve relative link against targetUrl
        const resolvedUrl = new url.URL(href, targetUrl);

        // Only include internal links from the same domain (subdomain-insensitive comparison)
        const cleanHost = (h) => (h || '').replace(/^www\./i, '').toLowerCase();
        if (cleanHost(resolvedUrl.hostname) === cleanHost(targetHost)) {
          let cleanPath = resolvedUrl.pathname;
          // Ensure it starts with '/'
          if (!cleanPath.startsWith('/')) {
            cleanPath = '/' + cleanPath;
          }
          // Remove trailing slash unless it's just '/'
          if (cleanPath.length > 1 && cleanPath.endsWith('/')) {
            cleanPath = cleanPath.slice(0, -1);
          }
          // Exclude media assets/documents
          if (!/\.(png|jpg|jpeg|gif|svg|pdf|css|js|woff|woff2|xml)$/i.test(cleanPath)) {
            discoveredLinks.add(cleanPath);
          }
        }
      } catch (e) {
        // Ignore parsing errors
      }
    });

    const uniquePaths = Array.from(discoveredLinks);
    result.totalPagesFound = uniquePaths.length;
    result.pageDepthCrawled = Math.min(result.totalPagesFound, userLimits.maxPages);

    const delayHelper = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < result.pageDepthCrawled; i++) {
      const pageRoute = uniquePaths[i];
      const pageUrl = `${targetUrl.replace(/\/$/, '')}${pageRoute}`;
      
      let pageHtml = '';
      if (i === 0) {
        pageHtml = htmlContent;
      } else {
        await delayHelper(150);
        try {
          const pageRes = await axios.get(pageUrl, { timeout: 4000 });
          pageHtml = pageRes.data;
        } catch (e) {
          // Leave pageHtml empty; parsedPage will gracefully return blank markers
        }
      }

      const parsedPage = parsePageHtml(pageHtml, pageUrl, pageRoute);
      result.pages.push(parsedPage);
    }

  } catch (err) {
    console.error('Crawler Service Execution Warning:', err.message);
  }

  return result;
};

module.exports = { analyzeUrl };
