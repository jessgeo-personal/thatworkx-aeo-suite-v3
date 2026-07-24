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
  const titleText = $('title').text().trim() || $('h1').first().text().trim() || '';
  const descText = $('meta[name="description"]').attr('content')?.trim() || '';

  // Clean raw text extraction using root text fallback
  const $clean = cheerio.load(htmlContent);
  $clean('script, style, svg, noscript, nav, footer, iframe, header').remove();
  const rawText = ($clean('body').length > 0 ? $clean('body').text() : $clean.root().text()).replace(/\s+/g, ' ').trim();
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

    // Compute dynamic AI Visibility Health Index (0-100) with 4-Pillar Sub-Scores
    const disallowRegex = /User-agent:\s*\*\s*Disallow:\s*\/\s*(?!\w)/i;
    const isBlanketBlock = disallowRegex.test(robotsContent || '');

    // Pillar 1: Gateway & Access (Max 25 pts)
    let p1Score = 25;
    let p1Notes = [];
    const blockedBots = Object.values(result.status.botPermissions || {}).filter(allowed => !allowed).length;
    if (blockedBots > 0) {
      p1Score -= (blockedBots * 10);
      p1Notes.push(`${blockedBots} AI bot(s) blocked (-${blockedBots * 10} pts)`);
    }
    if (!result.status.sitemapExists) {
      p1Score -= 5;
      p1Notes.push('Sitemap.xml missing (-5 pts)');
    }
    p1Score = Math.max(0, p1Score);
    const p1NoteText = p1Notes.length > 0 ? p1Notes.join(', ') : 'All AI crawlers allowed and sitemap active.';

    // Pillar 2: AI-Ready Machine Data (Max 25 pts)
    let p2Score = 25;
    let p2Notes = [];
    if (!result.status.llmsTxtExists) {
      p2Score -= 10;
      p2Notes.push('Missing /llms.txt (-10 pts)');
    }
    if (!result.status.aiContextExists) {
      p2Score -= 10;
      p2Notes.push('Missing /ai-context.md (-10 pts)');
    }
    const missingNarratives = [!result.status.aboutTxtExists, !result.status.docsTxtExists, !result.status.contentTxtExists].filter(Boolean).length;
    if (missingNarratives > 0) {
      p2Score -= 5;
      p2Notes.push(`Missing ${missingNarratives} narrative manifest(s) (-5 pts)`);
    }
    p2Score = Math.max(0, p2Score);
    const p2NoteText = p2Notes.length > 0 ? p2Notes.join(', ') : 'All machine welcome mats and brand manifests active.';

    // Pillar 3: Parsing & Readability (Max 25 pts)
    let p3Score = 25;
    let p3Notes = [];
    if (result.status.spaTrapDetected) {
      p3Score -= 15;
      p3Notes.push('Client-Side SPA JS trap detected (-15 pts)');
    }
    if (!result.status.hasProperHierarchy) {
      p3Score -= 10;
      p3Notes.push('H1 tag or heading hierarchy missing (-10 pts)');
    }
    if (parsedMetrics.wordCount < 500) {
      p3Score -= 5;
      p3Notes.push('Word count under 500 words (-5 pts)');
    } else if (parsedMetrics.wordCount > 2500) {
      p3Score -= 5;
      p3Notes.push('Word count over 2,500 words truncation risk (-5 pts)');
    }
    p3Score = Math.max(0, p3Score);
    const p3NoteText = p3Notes.length > 0 ? p3Notes.join(', ') : 'High content density and linear heading structure.';

    // Pillar 4: Knowledge Graph Integrity (Max 25 pts)
    let p4Score = 25;
    let p4Notes = [];
    if (!result.status.jsonLdExists) {
      p4Score -= 15;
      p4Notes.push('JSON-LD schema markup missing (-15 pts)');
    }
    const canonicalCount = $('link[rel="canonical"]').length;
    if (canonicalCount === 0) {
      p4Score -= 10;
      p4Notes.push('Self-referential canonical tag missing (-10 pts)');
    }
    p4Score = Math.max(0, p4Score);
    const p4NoteText = p4Notes.length > 0 ? p4Notes.join(', ') : 'JSON-LD schema active and canonical tag verified.';

    // Overall Score (Sum of 4 Pillars, max 100)
    let totalOverallScore = isBlanketBlock ? 20 : (p1Score + p2Score + p3Score + p4Score);
    totalOverallScore = Math.max(15, Math.min(100, totalOverallScore));

    result.scoreCard = {
      overallScore: totalOverallScore,
      classification: totalOverallScore >= 80 ? 'Good' : totalOverallScore >= 50 ? 'Bad' : 'Ugly',
      pillars: {
        p1: { score: p1Score, max: 25, badge: isBlanketBlock ? 'BLOCKED GATEWAY' : (p1Score === 25 ? 'OPTIMIZED HANDSHAKE' : p1Score >= 15 ? 'PARTIAL GATEWAY' : 'RESTRICTED CRAWL'), note: isBlanketBlock ? 'Blanket Disallow: / active in robots.txt (-80 pts).' : p1NoteText },
        p2: { score: p2Score, max: 25, badge: p2Score === 25 ? 'WELCOME MAT ACTIVE' : p2Score >= 15 ? 'PARTIAL MANIFESTS' : '404 MISSING', note: p2NoteText },
        p3: { score: p3Score, max: 25, badge: p3Score === 25 ? 'HIGH DENSITY' : p3Score >= 15 ? 'READABILITY GAPS' : 'POOR READABILITY', note: p3NoteText },
        p4: { score: p4Score, max: 25, badge: p4Score === 25 ? 'SCHEMA VERIFIED' : p4Score >= 15 ? 'SCHEMA GAPS' : 'NO KNOWLEDGE GRAPH', note: p4NoteText }
      }
    };

  } catch (err) {
    console.error('Crawler Service Execution Warning:', err.message);
  }

  return result;
};

module.exports = { analyzeUrl };
