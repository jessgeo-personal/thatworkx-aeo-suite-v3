const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const { parseHtmlMetrics } = require('./parserService');
const { evaluateCapabilities } = require('./capabilityEvaluator');

const AI_CRAWLERS = [
  { key: 'gptBot', name: 'GPTBot', pattern: /User-agent:\s*GPTBot\s*Disallow:\s*\//i },
  { key: 'chatGptUser', name: 'ChatGPT-User', pattern: /User-agent:\s*ChatGPT-User\s*Disallow:\s*\//i },
  { key: 'oaiSearchBot', name: 'OAI-SearchBot', pattern: /User-agent:\s*OAI-SearchBot\s*Disallow:\s*\//i },
  { key: 'claudeBot', name: 'ClaudeBot', pattern: /User-agent:\s*(ClaudeBot|Claude-Web)\s*Disallow:\s*\//i },
  { key: 'claudeWeb', name: 'Claude-Web', pattern: /User-agent:\s*Claude-Web\s*Disallow:\s*\//i },
  { key: 'claudeSearchBot', name: 'Claude-SearchBot', pattern: /User-agent:\s*Claude-SearchBot\s*Disallow:\s*\//i },
  { key: 'googleExtended', name: 'Google-Extended', pattern: /User-agent:\s*Google-Extended\s*Disallow:\s*\//i },
  { key: 'googlebot', name: 'Googlebot', pattern: /User-agent:\s*Googlebot\s*Disallow:\s*\//i },
  { key: 'bingbot', name: 'Bingbot', pattern: /User-agent:\s*Bingbot\s*Disallow:\s*\//i },
  { key: 'perplexityBot', name: 'PerplexityBot', pattern: /User-agent:\s*PerplexityBot\s*Disallow:\s*\//i },
  { key: 'applebotExtended', name: 'Applebot-Extended', pattern: /User-agent:\s*Applebot-Extended\s*Disallow:\s*\//i },
  { key: 'metaExternalAgent', name: 'Meta-ExternalAgent', pattern: /User-agent:\s*Meta-ExternalAgent\s*Disallow:\s*\//i },
  { key: 'metaWebIndexer', name: 'Meta-WebIndexer', pattern: /User-agent:\s*Meta-WebIndexer\s*Disallow:\s*\//i },
  { key: 'amazonbot', name: 'Amazonbot', pattern: /User-agent:\s*Amazonbot\s*Disallow:\s*\//i },
  { key: 'bytespider', name: 'Bytespider', pattern: /User-agent:\s*Bytespider\s*Disallow:\s*\//i },
  { key: 'ccBot', name: 'CCBot', pattern: /User-agent:\s*CCBot\s*Disallow:\s*\//i },
  { key: 'cohereAi', name: 'cohere-ai', pattern: /User-agent:\s*cohere-ai\s*Disallow:\s*\//i },
  { key: 'mistralBot', name: 'MistralBot', pattern: /User-agent:\s*MistralBot\s*Disallow:\s*\//i },
  { key: 'qwenBot', name: 'QwenBot', pattern: /User-agent:\s*QwenBot\s*Disallow:\s*\//i },
  { key: 'baiduAnsur', name: 'Baidu-Ansur', pattern: /User-agent:\s*Baidu-Ansur\s*Disallow:\s*\//i }
];

const defaultBotPermissions = () => AI_CRAWLERS.reduce((acc, bot) => {
  acc[bot.key] = true;
  return acc;
}, {});

const fetchPageWithTimeout = async (pageUrl) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);
  try {
    const pageRes = await axios.get(pageUrl, {
      signal: controller.signal,
      timeout: 3500
    });
    clearTimeout(timeoutId);
    return { success: true, data: pageRes.data, headers: pageRes.headers, status: pageRes.status, statusCode: pageRes.status };
  } catch (error) {
    clearTimeout(timeoutId);
    const isTimeout = error.name === 'AbortError' || error.code === 'ECONNABORTED' || (error.message && error.message.includes('timeout'));
    const status = error.response ? error.response.status : (isTimeout ? 408 : null);
    return {
      success: false,
      status,
      statusCode: status,
      error: isTimeout ? 'heavy_page_timeout' : error.message
    };
  }
};

const parsePageHtml = (htmlContent, pageUrl, pageRoute, responseHeaders = null) => {
  if (!htmlContent) {
    return {
      route: pageRoute,
      wordCount: 0,
      rawText: '',
      content: '',
      html: '',
      bodySnippet: '',
      bodyTextSnippet: '',
      headings: [],
      hasTitle: false,
      titleLength: 0,
      hasDescription: false,
      headingAudit: { h1: 0, h2: 0, h3: 0, h4: 0, isHierarchyValid: false },
      hasCanonical: false,
      canonicalUrl: '',
      canonicalTag: '',
      textCodeRatio: 0,
      contentDensityRatio: 0,
      textDensityRatio: 0,
      hasSchema: false,
      schemas: [],
      schemaTypes: [],
      lastUpdated: null,
      lastModified: null,
      semanticTags: { header: false, nav: false, main: false, footer: false, article: false, section: false },
      missingAltCount: 0,
      missingAltList: []
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

  // 1. Text Density Calculations
  const textCodeRatio = cleanHtml.length > 0 
    ? Number((rawText.length / cleanHtml.length).toFixed(4)) 
    : 0;
  const textDensityRatio = Math.round(textCodeRatio * 100);

  // 2. Headings Parsing
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

  // 3. Canonical URL
  const canonicalUrl = $('link[rel="canonical"]').attr('href') || '';

  // 4. Clean Body Snippet
  const words = rawText.split(/\s+/).filter(Boolean);
  const bodySnippet = words.slice(0, 180).join(' ') + (words.length > 180 ? '...' : '');

  // ---------------------------------------------------------------------------
  // 1. ROBUST JSON-LD & @graph SCHEMA EXTRACTION
  // ---------------------------------------------------------------------------
  const schemas = [];
  $('script[type*="ld+json"]').each((_, el) => {
    try {
      const raw = $(el).text() || $(el).html();
      if (!raw || !raw.trim()) return;
      const parsed = JSON.parse(raw.trim());

      if (Array.isArray(parsed)) {
        schemas.push(...parsed);
      } else if (parsed && typeof parsed === 'object') {
        // Unpack modern WordPress / Yoast / Next.js @graph wrappers
        if (Array.isArray(parsed['@graph'])) {
          schemas.push(...parsed['@graph']);
        } else {
          schemas.push(parsed);
        }
      }
    } catch (_) {}
  });

  const schemaTypes = schemas
    .map(s => s && s['@type'])
    .filter(Boolean)
    .flatMap(t => Array.isArray(t) ? t : [t]);

  const hasSchema = schemaTypes.length > 0;

  // ---------------------------------------------------------------------------
  // 2. FRESHNESS / REVISION DATE EXTRACTION (META + SCHEMA + HEADERS)
  // ---------------------------------------------------------------------------
  let lastUpdated = $('meta[property="article:modified_time"]').attr('content')
    || $('meta[property="og:updated_time"]').attr('content')
    || $('meta[name="last-modified"]').attr('content')
    || $('meta[name="date"]').attr('content')
    || $('time[datetime]').attr('datetime')
    || $('time').first().text().trim()
    || null;

  // Fallback to JSON-LD dateModified / datePublished if meta tags are absent
  if (!lastUpdated && schemas.length > 0) {
    for (const s of schemas) {
      if (s && (s.dateModified || s.datePublished)) {
        lastUpdated = s.dateModified || s.datePublished;
        break;
      }
    }
  }

  // Fallback to HTTP response headers if available in scope
  if (!lastUpdated && typeof responseHeaders === 'object' && responseHeaders) {
    lastUpdated = responseHeaders['last-modified'] || null;
  }

  // 7. Image Alt Audit
  const missingAltList = [];
  $('img').each((_, el) => {
    const src = $(el).attr('src') || '';
    const alt = $(el).attr('alt');
    if ((alt === undefined || alt.trim() === '') && src) {
      missingAltList.push({ src, suggestedAlt: `${titleText || 'Page'} visual asset` });
    }
  });

  // 8. Semantic HTML5 Tags Verification
  const semanticTags = {
    header: $('header').length > 0,
    nav: $('nav').length > 0,
    main: $('main').length > 0,
    footer: $('footer').length > 0,
    article: $('article').length > 0,
    section: $('section').length > 0
  };

  const pageObj = {
    route: pageRoute,
    title: titleText || `Page ${pageRoute}`,
    metaDescription: descText,
    wordCount,
    rawText,
    content: cleanHtml,
    html: cleanHtml,
    bodySnippet: bodySnippet || descText || rawText || 'No body paragraph content found on this page.',
    bodyTextSnippet: bodySnippet || descText || rawText || 'No body paragraph content found on this page.',
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
    canonicalUrl,
    canonicalTag: canonicalUrl,
    textCodeRatio,
    contentDensityRatio: textCodeRatio,
    textDensityRatio,
    hasSchema: hasSchema,
    schemas,
    schemaTypes,
    lastUpdated,
    lastModified: lastUpdated,
    semanticTags,
    missingAltCount: missingAltList.length,
    missingAltList
  };

  if (pageRoute === '/') {
    pageObj.inPageSections = {
      about: $('#about, #about-us, [id*="about"]').length > 0,
      contact: $('#contact, #contact-us, [id*="contact"]').length > 0,
      pricing: $('#pricing, #plans, [id*="pricing"]').length > 0,
      privacy: $('#privacy, #privacy-policy, [id*="privacy"]').length > 0,
      terms: $('#terms, #terms-of-service, [id*="terms"]').length > 0
    };
  }

  return pageObj;
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

  const scanStartTime = Date.now();
  const result = {
    url: targetUrl,
    tier: userLimits.tier,
    pageDepthCrawled: 0,
    totalPagesFound: 1, // Simulated total domain size
    status: {
      robotsTxtExists: false,
      robotsFetchMs: null,
      llmsTxtExists: false,
      aiContextExists: false,
      aboutTxtExists: false,
      docsTxtExists: false,
      contentTxtExists: false,
      sitemapExists: false,
      xRobotsIndexable: true,
      hasProperHierarchy: true,
      experienceScore: 0,
      readabilityRating: 'UNAUDITED',
      seoOptimalTitle: false,
      seoOptimalDesc: false,
      gatewayBadge: 'Hidden Assets',
      contentDensityRatio: 0,
      spaTrapDetected: false,
      jsonLdExists: false,
      jsonLdTypes: [],
      machinePreview: '',
      botPermissions: defaultBotPermissions()
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

    // 1. Fetch robots.txt and machine manifests in parallel with socket latency measurement
    const robotsStartTime = Date.now();
    const robotsPromise = axios.get(`${domainOrigin}/robots.txt`, { timeout: 2500 })
      .then(res => {
        result.status.robotsFetchMs = Date.now() - robotsStartTime;
        return res;
      })
      .catch(err => {
        result.status.robotsFetchMs = Date.now() - robotsStartTime;
        throw err;
      });

    const [robotsSettled, llmsSettled, aiContextSettled, aboutSettled, docsSettled, contentSettled, sitemapSettled] = await Promise.allSettled([
      robotsPromise,
      axios.get(`${domainOrigin}/llms.txt`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/ai-context.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/about.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/docs.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/content.md`, { timeout: 2000 }),
      axios.get(`${domainOrigin}/sitemap.xml`, { timeout: 2000 })
    ]);

    let robotsContent = '';
    let sitemapContent = '';
    if (robotsSettled.status === 'fulfilled' && robotsSettled.value.data) {
      robotsContent = typeof robotsSettled.value.data === 'string' ? robotsSettled.value.data : JSON.stringify(robotsSettled.value.data);
      result.status.robotsTxtExists = true;
      result.status.robotsTxtContent = robotsContent;
      result.status.robotsTxtStatusCode = robotsSettled.value?.status || 200;
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
      sitemapContent = typeof sitemapSettled.value.data === 'string' ? sitemapSettled.value.data : JSON.stringify(sitemapSettled.value.data);
      result.status.sitemapContent = sitemapContent;
      result.status.sitemapStatusCode = sitemapSettled.value?.status || 200;
    }

    const failedWithWaf = [robotsSettled, llmsSettled, aiContextSettled, aboutSettled, docsSettled, contentSettled, sitemapSettled].find(
      r => r.status === 'rejected' && r.reason?.response && (r.reason.response.status === 403 || r.reason.response.status === 429)
    );
    if (failedWithWaf) {
      result.status.isWafBlocked = true;
      result.status.wafStatusCode = failedWithWaf.reason.response.status;
      result.status.statusCode = failedWithWaf.reason.response.status;
      result.status.gateState = 'BLOCKED';
      result.status.disallowCount = -1;
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

      // Specific AI Bot Disallow Check across all 20 AI Crawlers
      const botPermissions = {};
      AI_CRAWLERS.forEach(bot => {
        if (blanketDisallowMatch) {
          botPermissions[bot.key] = false;
        } else {
          botPermissions[bot.key] = !bot.pattern.test(robotsContent);
        }
      });
      result.status.botPermissions = botPermissions;

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
    let mainHeaders = null;
    try {
      const mainRes = await axios.get(targetUrl, { timeout: 4000 });
      htmlContent = mainRes.data;
      mainHeaders = mainRes.headers;
    } catch (e) {
      // ZERO-FALLBACK ENFORCEMENT:
      // If the root domain cannot be resolved or reached, abort the entire audit immediately.
      // Zero fabricated pages, zero default bot allowances, zero capability evaluation.
      return {
        url: targetUrl,
        tier: userLimits ? userLimits.tier : 'free',
        status: 'failed',
        error: `HTTP fetch failed for ${targetUrl}: ${e.message}`,
        pageDepthCrawled: 0,
        totalPagesFound: 0,
        pages: [],
        discoveredRoutes: [],
        missingEssentialPages: ['/about', '/contact', '/pricing', '/privacy-policy', '/terms-of-service'],
        alerts: [{
          type: 'FETCH_ERROR',
          severity: 'critical',
          message: `HTTP fetch failed for ${targetUrl}: ${e.message}`
        }],
        scoreCard: {
          overallScore: 0,
          classification: 'UNAUDITED',
          pillars: {
            p1: { score: 0, max: 25, badge: 'UNAUDITED', note: e.message },
            p2: { score: 0, max: 25, badge: 'UNAUDITED', note: e.message },
            p3: { score: 0, max: 25, badge: 'UNAUDITED', note: e.message },
            p4: { score: 0, max: 25, badge: 'UNAUDITED', note: e.message }
          }
        },
        overallScore: 0,
        pillarScores: { P1: 0, P2: 0, P3: 0, P4: 0 },
        capabilities: {
          crawlerAccess: {},
          manifests: {},
          schema: { detected: [], authorCredentials: false },
          scores: { aiOptimized: 0, aiReady: 0, compositeHealth: 0 },
          triage: [`HTTP fetch failed for ${targetUrl}: ${e.message}`]
        },
        scanMetrics: {
          scanTimeSeconds: Number(((Date.now() - scanStartTime) / 1000).toFixed(2)),
          lastScanned: new Date().toISOString()
        }
      };
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
    result.status.sitemapExists = Boolean(sitemapSettled.status === 'fulfilled' && sitemapSettled.value.status === 200 && sitemapSettled.value.data);
    result.status.sitemapInRobots = robotsContent.toLowerCase().includes('sitemap:');

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

    if (sitemapContent) {
      const locRegex = /<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi;
      let match;
      const cleanHost = (h) => (h || '').replace(/^www\./i, '').toLowerCase();
      while ((match = locRegex.exec(sitemapContent)) !== null) {
        try {
          const resolvedUrl = new url.URL(match[1]);
          if (cleanHost(resolvedUrl.hostname) === cleanHost(targetHost)) {
            let cleanPath = resolvedUrl.pathname;
            if (!cleanPath.startsWith('/')) cleanPath = '/' + cleanPath;
            if (cleanPath.length > 1 && cleanPath.endsWith('/')) cleanPath = cleanPath.slice(0, -1);
            if (!/\.(png|jpg|jpeg|gif|svg|pdf|css|js|woff|woff2|xml)$/i.test(cleanPath)) {
              discoveredLinks.add(cleanPath);
            }
          }
        } catch (err) {
          // ignore
        }
      }
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
    result.pageDepthCrawled = Math.min(result.totalPagesFound, userLimits?.maxPages ?? 500);

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
        const parsedPage = parsePageHtml(pageHtml, pageUrl, pageRoute, mainHeaders);
        result.pages.push(parsedPage);
      } else {
        if (process.env.NODE_ENV !== 'test') {
          await delayHelper(150);
        }
        const fetchRes = await fetchPageWithTimeout(pageUrl);
        if (fetchRes.success) {
          const parsedPage = parsePageHtml(fetchRes.data, pageUrl, pageRoute, fetchRes.headers);
          result.pages.push(parsedPage);
        } else if (fetchRes.status === 404 || fetchRes.statusCode === 404) {
          result.pages.push({
            url: pageUrl,
            route: pageRoute,
            statusCode: 404,
            status: 404,
            isCrawled: false,
            is404: true,
            isMissing: true,
            wordCount: 0,
            textCodeRatio: 0,
            contentDensityRatio: 0,
            textDensityRatio: 0,
            cleanHtml: '',
            rawText: '',
            schemas: [],
            schemaTypes: [],
            headings: [],
            headingAudit: { h1: 0, h2: 0, h3: 0, h4: 0, isHierarchyValid: false },
            hasCanonical: false,
            canonicalUrl: '',
            hasSchema: false,
            lastUpdated: null,
            semanticTags: { header: false, nav: false, main: false, footer: false, article: false, section: false },
            missingAltCount: 0,
            missingAltList: []
          });
        } else {
          result.pages.push({
            url: pageUrl,
            route: pageRoute,
            statusCode: fetchRes.status || 500,
            status: 'failed',
            isCrawled: false,
            is404: false,
            error: fetchRes.error === 'heavy_page_timeout' ? 'heavy_page_timeout' : 'fetch_error'
          });
        }
      }
    }

    // Check inPageSections on homepage and push available in-page sections as discovered virtual routes
    const homepage = result.pages.find(p => p.route === '/');
    if (homepage && homepage.inPageSections) {
      const sectionToVirtualRoute = [
        { key: 'about', route: '/#about', prefixes: ['/about', '/about-us'] },
        { key: 'contact', route: '/#contact', prefixes: ['/contact', '/contact-us'] },
        { key: 'pricing', route: '/#pricing', prefixes: ['/pricing', '/plans'] },
        { key: 'privacy', route: '/#privacy', prefixes: ['/privacy', '/privacy-policy'] },
        { key: 'terms', route: '/#terms', prefixes: ['/terms', '/terms-of-service'] }
      ];

      for (const { key, route, prefixes } of sectionToVirtualRoute) {
        if (homepage.inPageSections[key]) {
          const hasDistinct = result.pages.some(p => prefixes.includes(p.route));
          if (!hasDistinct && !result.pages.some(p => p.route === route)) {
            result.pages.push({
              route,
              url: `${targetUrl.replace(/\/$/, '')}${route}`,
              title: `${homepage.title || 'Home'} - ${key.charAt(0).toUpperCase() + key.slice(1)}`,
              metaDescription: homepage.metaDescription || '',
              wordCount: Math.round(homepage.wordCount / 4) || 100,
              rawText: homepage.rawText || '',
              content: homepage.content || '',
              html: homepage.html || '',
              bodySnippet: `In-page section ${route} detected on single-page homepage.`,
              bodyTextSnippet: `In-page section ${route} detected on single-page homepage.`,
              headings: [],
              hasTitle: true,
              titleLength: homepage.titleLength || 0,
              hasDescription: homepage.hasDescription || false,
              headingAudit: { h1: 1, h2: 1, h3: 0, h4: 0, isHierarchyValid: true },
              hasCanonical: homepage.hasCanonical || false,
              canonicalUrl: homepage.canonicalUrl || '',
              canonicalTag: homepage.canonicalUrl || '',
              textCodeRatio: homepage.textCodeRatio || 0,
              contentDensityRatio: homepage.contentDensityRatio || 0,
              textDensityRatio: homepage.textDensityRatio || 0,
              hasSchema: homepage.hasSchema || false,
              schemas: homepage.schemas || [],
              schemaTypes: homepage.schemaTypes || [],
              lastUpdated: homepage.lastUpdated || null,
              lastModified: homepage.lastModified || null,
              semanticTags: homepage.semanticTags || { header: true, nav: true, main: true, footer: true, article: false, section: true },
              missingAltCount: 0,
              missingAltList: []
            });
          }
        }
      }
    }

    result.scanMetrics = {
      scanTimeSeconds: Number(((Date.now() - scanStartTime) / 1000).toFixed(2)),
      lastScanned: new Date().toISOString()
    };

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

module.exports = { analyzeUrl, parsePageHtml, fetchPageWithTimeout, AI_CRAWLERS };
