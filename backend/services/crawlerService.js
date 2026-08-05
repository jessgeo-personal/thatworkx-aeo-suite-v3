const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const { parseHtmlMetrics } = require('./parserService');
const { evaluateCapabilities } = require('./capabilityEvaluator');

const fetchPageWithTimeout = async (pageUrl) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);
  try {
    const pageRes = await axios.get(pageUrl, {
      signal: controller.signal,
      timeout: 3500
    });
    clearTimeout(timeoutId);
    return { success: true, data: pageRes.data };
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError' || error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
    return {
      success: false,
      error: isTimeout ? 'heavy_page_timeout' : error.message
    };
  }
};

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
  const titleText = $('title').text().trim() || $('h1').first().text().trim() || '';
  const descText = $('meta[name="description"]').attr('content')?.trim() || '';

  // Clean raw text extraction using root text fallback
  const $clean = cheerio.load(htmlContent);
  $clean('script, style, svg, noscript, nav, footer, iframe, header').remove();
  const rawText = ($clean('body').length > 0 ? $clean('body').text() : $clean.root().text()).replace(/\s+/g, ' ').trim();
  const cleanHtml = ($clean('body').length > 0 ? $clean('body').html() : $clean.html()) || '';
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;

  const headings = [];
  $('h1, h2, h3, h4').each((_, el) => {
    const tag = el.tagName.toLowerCase();
    const text = $(el).text().trim();
    if (text) headings.push({ tag, text });
  });

  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;
  const h4Count = $('h4').length;

  const isHierarchyValid = (h1Count === 1) && 
                           (h3Count === 0 || h2Count > 0) && 
                           (h4Count === 0 || h3Count > 0);

  const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';

  const words = rawText.split(/\s+/).filter(Boolean);
  const bodySnippet = words.slice(0, 180).join(' ') + (words.length > 180 ? '...' : '');

  return {
    route: pageRoute,
    title: titleText || `Page ${pageRoute}`,
    metaDescription: descText,
    wordCount,
    rawText,
    content: cleanHtml,
    html: cleanHtml,
    bodySnippet: bodySnippet || descText || rawText || 'No body paragraph content found on this page.',
    headings,
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

const analyzeUrl = async (targetUrl, userLimits, singlePagePath = null, partialSyncLimit = null) => {
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
      overallScore: 0,
      classification: 'Pending',
      pillars: {
        p1: { score: 0, max: 25, badge: 'UNAUDITED', note: 'Pending scan.' },
        p2: { score: 0, max: 25, badge: 'UNAUDITED', note: 'Pending scan.' },
        p3: { score: 0, max: 25, badge: 'UNAUDITED', note: 'Pending scan.' },
        p4: { score: 0, max: 25, badge: 'UNAUDITED', note: 'Pending scan.' }
      }
    },
    pages: []
  };

  try {
    const parsedUrl = new url.URL(targetUrl);
    const domainOrigin = parsedUrl.origin;

    // 1. Fetch robots.txt and machine manifests in parallel
    const [robotsSettled, llmsSettled, aiContextSettled, aboutSettled, docsSettled, contentSettled, sitemapSettled] = await Promise.allSettled([
      axios.get(`${domainOrigin}/robots.txt`, { timeout: 2500 }),
      axios.get(`${domainOrigin}/llms.txt`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/ai-context.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/about.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/docs.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/content.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/sitemap.xml`, { timeout: 2000 })
    ]);

    let robotsContent = '';
    if (robotsSettled.status === 'fulfilled' && robotsSettled.value.data) {
      robotsContent = robotsSettled.value.data;
      result.status.robotsTxtExists = true;
    }

    if (llmsSettled.status === 'fulfilled' && llmsSettled.value.status === 200 && llmsSettled.value.data) {
      result.status.llmsTxtExists = true;
      result.status.llmsTxtContent = typeof llmsSettled.value.data === 'string' ? llmsSettled.value.data : JSON.stringify(llmsSettled.value.data);
    }
    if (aiContextSettled.status === 'fulfilled' && aiContextSettled.value.status === 200 && aiContextSettled.value.data) {
      result.status.aiContextExists = true;
      result.status.aiContextContent = typeof aiContextSettled.value.data === 'string' ? aiContextSettled.value.data : JSON.stringify(aiContextSettled.value.data);
    }
    if (aboutSettled.status === 'fulfilled' && aboutSettled.value.status === 200 && aboutSettled.value.data) {
      result.status.aboutTxtExists = true;
      result.status.aboutTxtContent = typeof aboutSettled.value.data === 'string' ? aboutSettled.value.data : JSON.stringify(aboutSettled.value.data);
    }
    if (docsSettled.status === 'fulfilled' && docsSettled.value.status === 200 && docsSettled.value.data) {
      result.status.docsTxtExists = true;
      result.status.docsTxtContent = typeof docsSettled.value.data === 'string' ? docsSettled.value.data : JSON.stringify(docsSettled.value.data);
    }
    if (contentSettled.status === 'fulfilled' && contentSettled.value.status === 200 && contentSettled.value.data) {
      result.status.contentTxtExists = true;
      result.status.contentTxtContent = typeof contentSettled.value.data === 'string' ? contentSettled.value.data : JSON.stringify(contentSettled.value.data);
    }
    if (sitemapSettled.status === 'fulfilled' && sitemapSettled.value.status === 200 && sitemapSettled.value.data) {
      result.status.sitemapExists = true;
    }

    // 2. Parse Robots.txt for blanket disallow vs targeted AI bot rules
    result.status.xRobotsIndexable = true;
    if (result.status.robotsTxtExists && robotsContent) {
      const normalizedRobots = robotsContent.toLowerCase();
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
      htmlContent = '';
      result.alerts.push({
        type: 'FETCH_ERROR',
        severity: 'critical',
        message: `HTTP fetch failed for ${targetUrl}: ${e.message}`
      });
    }

    // Run Level 2 Parser Service
    const parsedMetrics = parseHtmlMetrics(htmlContent);
    result.status.contentDensityRatio = parsedMetrics.contentDensityRatio;
    result.status.spaTrapDetected = parsedMetrics.spaTrapDetected;
    result.status.jsonLdExists = parsedMetrics.jsonLdExists;
    result.status.jsonLdTypes = parsedMetrics.jsonLdTypes;
    result.status.jsonLdSchemaContent = parsedMetrics.jsonLdSchemaContent;
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

    const syncLimit = (partialSyncLimit && result.pageDepthCrawled > partialSyncLimit) ? partialSyncLimit : result.pageDepthCrawled;

    if (partialSyncLimit && result.pageDepthCrawled > partialSyncLimit) {
      result.isPartial = true;
      result.remainingRoutes = uniquePaths.slice(partialSyncLimit);
    }

    const delayHelper = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    for (let i = 0; i < syncLimit; i++) {
      const pageRoute = uniquePaths[i];
      const pageUrl = `${targetUrl.replace(/\/$/, '')}${pageRoute}`;
      
      let pageHtml = '';
      if (i === 0) {
        pageHtml = htmlContent;
        const parsedPage = parsePageHtml(pageHtml, pageUrl, pageRoute);
        result.pages.push(parsedPage);
      } else {
        await delayHelper(150);
        const fetchRes = await fetchPageWithTimeout(pageUrl);
        if (fetchRes.success) {
          const parsedPage = parsePageHtml(fetchRes.data, pageUrl, pageRoute);
          result.pages.push(parsedPage);
        } else {
          result.pages.push({
            url: pageUrl,
            route: pageRoute,
            status: 'failed',
            error: fetchRes.error === 'heavy_page_timeout' ? 'heavy_page_timeout' : 'fetch_error'
          });
        }
      }
    }

    // Compute dynamic AI Visibility Health Index (0-100) with 4-Pillar Sub-Scores via capabilityEvaluator
    const evaluation = evaluateCapabilities(result);
    const totalOverallScore = evaluation.overallScore;

    result.overallScore = evaluation.overallScore;
    result.pillarScores = evaluation.pillarScores;
    result.executiveSections = evaluation.executiveSections;
    result.capabilityMatrix = evaluation.capabilityMatrix;
    result.scanMetrics = evaluation.scanMetrics;
    result.scrapedContentPreview = evaluation.scrapedContentPreview;
    result.manifestPreviews = evaluation.manifestPreviews;
    result.discoveredRoutes = evaluation.discoveredRoutes;
    result.eeatMetrics = evaluation.eeatMetrics;

    result.scoreCard = {
      overallScore: totalOverallScore,
      classification: totalOverallScore >= 80 ? 'Good' : totalOverallScore >= 50 ? 'Bad' : 'Ugly',
      pillars: {
        p1: { score: evaluation.pillarScores.P1, max: 25, badge: evaluation.pillarScores.P1 === 25 ? 'OPTIMIZED HANDSHAKE' : 'RESTRICTED CRAWL' },
        p2: { score: evaluation.pillarScores.P2, max: 25, badge: evaluation.pillarScores.P2 === 25 ? 'WELCOME MAT ACTIVE' : 'PARTIAL MANIFESTS' },
        p3: { score: evaluation.pillarScores.P3, max: 25, badge: evaluation.pillarScores.P3 === 25 ? 'HIGH DENSITY' : 'READABILITY GAPS' },
        p4: { score: evaluation.pillarScores.P4, max: 25, badge: evaluation.pillarScores.P4 === 25 ? 'SCHEMA VERIFIED' : 'NO KNOWLEDGE GRAPH' }
      }
    };

  } catch (err) {
    console.error('Crawler Service Execution Warning:', err.message);
  }

  return result;
};

module.exports = { analyzeUrl, parsePageHtml, fetchPageWithTimeout };
