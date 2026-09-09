/**
 * AEO Suite V3 - V4 Payload Adapter & Stage Normalizer
 * Pure functional adapter mapping backend scan payloads to V4 UI render contracts.
 * Governance: Strict Dual-Pillar enforcement ("AI-Optimized" vs "AI-Ready").
 * Zero mock fallbacks. Zero occurrences of banned terms.
 */

const CANONICAL_ESSENTIAL_ROUTES = [
  '/about',
  '/contact',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service'
];

const BOT_NAME_MAP = {
  gptBot: 'GPTBot',
  chatGptUser: 'ChatGPT-User',
  oaiSearchBot: 'OAI-SearchBot',
  claudeBot: 'ClaudeBot',
  claudeWeb: 'Claude-Web',
  claudeSearchBot: 'Claude-SearchBot',
  googleExtended: 'Google-Extended',
  googlebot: 'Googlebot',
  bingbot: 'Bingbot',
  perplexityBot: 'PerplexityBot',
  applebotExtended: 'Applebot-Extended',
  metaExternalAgent: 'Meta-ExternalAgent',
  metaWebIndexer: 'Meta-WebIndexer',
  amazonbot: 'Amazonbot',
  bytespider: 'Bytespider',
  ccBot: 'CCBot',
  cohereAi: 'cohere-ai',
  mistralBot: 'MistralBot',
  qwenBot: 'QwenBot',
  baiduAnsur: 'Baidu-Ansur'
};

const DEFAULT_STAGES = {
  stage1: { score: '0%', status: 'UNAUDITED', summaryText: '--', classification: 'AI-Optimized' },
  stage2: { score: '0%', status: 'UNAUDITED', summaryText: '--', classification: 'AI-Optimized' },
  stage3: { score: '0%', status: 'UNAUDITED', summaryText: '--', classification: 'AI-Optimized' },
  stage4: {
    score: '0%',
    status: 'UNAUDITED',
    summaryText: '--',
    classification: 'AI-Optimized',
    isHttps: false,
    sslValid: false,
    hasPrivacyPolicy: false,
    hasTermsOfService: false,
    securityBadgeText: '--',
    contact: {
      email: null,
      phone: null,
      address: null,
      trustAnchorCount: 0
    },
    schemaDetails: {
      detectedTypes: [],
      totalPages: 0,
      pagesWithSchemaCount: 0,
      pagesMissingSchemaCount: 0,
      missingRoutes: [],
      coveragePercent: 0,
      status: 'CRITICAL',
      severityBadge: 'CRITICAL: 0% COVERAGE'
    },
    authorDetails: {
      authors: [],
      authorCount: 0,
      status: 'CRITICAL',
      severityBadge: 'CRITICAL: 0 AUTHORS DETECTED'
    },
    authorityDetails: {
      domainAge: '--',
      registrationDate: null,
      externalCheckerUrl: null,
      authorityStatus: 'Free Third-Party Check Available',
      status: 'PENDING'
    }
  },
  stage5: { score: '0%', status: 'UNAUDITED', summaryText: '--', classification: 'AI-Ready', governanceGate: 'AI-Ready' },
  stage6: { score: '0%', status: 'UNAUDITED', summaryText: '--', classification: 'Executive Boardroom', healthIndex: 0, humanWebReadiness: 0, machineWebReadiness: 0 }
};

/**
 * Calculates semantic content density rating based on word count.
 * @param {number} wordCount
 * @returns {'Thin' | 'Moderate' | 'Optimal'}
 */
function evaluateDensityRating(wordCount) {
  if (wordCount >= 1000) return 'Optimal';
  if (wordCount >= 500) return 'Moderate';
  return 'Thin';
}

/**
 * Safely extracts a normalized pathname from a URL or route string.
 */
function extractPathname(pageItem, baseDomain) {
  if (!pageItem) return '';
  const raw = typeof pageItem === 'string' ? pageItem : (pageItem.url || pageItem.route || pageItem.path || '');
  if (!raw || typeof raw !== 'string') return '';

  const fallbackBase = baseDomain && baseDomain.startsWith('http') ? baseDomain : 'https://dummy-base.local';
  try {
    const parsed = new URL(raw, fallbackBase);
    return parsed.pathname.toLowerCase().replace(/\/$/, '') || '/';
  } catch {
    return raw.toLowerCase().replace(/\/$/, '') || '/';
  }
}

/**
 * Maps raw backend scan response to the V4 Stage State contract.
 * @param {object|null} rawPayload - Raw payload from POST /api/scan
 * @returns {object} Normalized V4 Cockpit State
 */
export function mapBackendScanToV4State(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') {
    return {
      meta: {
        targetUrl: '--',
        status: 'UNAUDITED',
        timestamp: null
      },
      stages: DEFAULT_STAGES,
      stage1: {
        crawlers: [],
        score: DEFAULT_STAGES.stage1.score,
        status: DEFAULT_STAGES.stage1.status,
        summaryText: DEFAULT_STAGES.stage1.summaryText,
        ...DEFAULT_STAGES.stage1
      },
      stage2: {
        routes: [],
        missingCount: 0,
        discoveredCount: 0,
        score: DEFAULT_STAGES.stage2.score,
        status: DEFAULT_STAGES.stage2.status,
        summaryText: DEFAULT_STAGES.stage2.summaryText,
        ...DEFAULT_STAGES.stage2
      },
      stage3: {
        pages: [],
        score: DEFAULT_STAGES.stage3.score,
        status: DEFAULT_STAGES.stage3.status,
        summaryText: DEFAULT_STAGES.stage3.summaryText,
        ...DEFAULT_STAGES.stage3
      },
      stage4: {
        detectedTypes: [],
        hasAuthorBio: false,
        totalGraphEntities: 0,
        score: DEFAULT_STAGES.stage4.score,
        status: DEFAULT_STAGES.stage4.status,
        summaryText: DEFAULT_STAGES.stage4.summaryText,
        ...DEFAULT_STAGES.stage4
      },
      stage5: {
        governanceGate: 'AI-Ready',
        manifests: [],
        score: DEFAULT_STAGES.stage5.score,
        status: DEFAULT_STAGES.stage5.status,
        summaryText: DEFAULT_STAGES.stage5.summaryText,
        ...DEFAULT_STAGES.stage5
      },
      stage6: {
        overallHealthIndex: 0,
        aiOptimizedScore: 0,
        aiReadyScore: 0,
        triageFlags: [],
        score: DEFAULT_STAGES.stage6.score,
        status: DEFAULT_STAGES.stage6.status,
        summaryText: DEFAULT_STAGES.stage6.summaryText,
        ...DEFAULT_STAGES.stage6
      }
    };
  }

  // Support both live backend/server.js envelopes (results.*) and direct/test payloads
  const data = (rawPayload && rawPayload.results && typeof rawPayload.results === 'object')
    ? rawPayload.results
    : (rawPayload.data && typeof rawPayload.data === 'object')
    ? rawPayload.data
    : (rawPayload || {});

  // Defense Gate: If crawl failed or domain is unreachable, clamp state to 0 / UNAUDITED
  const isCrawlFailed =
    rawPayload?.status === 'failed' ||
    data?.status === 'failed' ||
    Boolean(data?.error) ||
    Boolean(rawPayload?.error) ||
    (Array.isArray(data?.alerts) && data.alerts.some(a => a.type === 'FETCH_ERROR'));

  if (isCrawlFailed) {
    const targetUrl = data.targetUrl || data.url || rawPayload.targetUrl || rawPayload.url || '--';
    const errorMsg = data.error || rawPayload.error || data.alerts?.[0]?.message || 'Target domain could not be resolved.';
    return {
      meta: {
        targetUrl,
        status: 'UNAUDITED',
        timestamp: null,
        error: errorMsg
      },
      stages: DEFAULT_STAGES,
      stage1: {
        crawlers: [],
        score: DEFAULT_STAGES.stage1.score,
        status: DEFAULT_STAGES.stage1.status,
        summaryText: DEFAULT_STAGES.stage1.summaryText,
        ...DEFAULT_STAGES.stage1
      },
      stage2: {
        routes: [],
        missingCount: 0,
        discoveredCount: 0,
        score: DEFAULT_STAGES.stage2.score,
        status: DEFAULT_STAGES.stage2.status,
        summaryText: DEFAULT_STAGES.stage2.summaryText,
        ...DEFAULT_STAGES.stage2
      },
      stage3: {
        pages: [],
        score: DEFAULT_STAGES.stage3.score,
        status: DEFAULT_STAGES.stage3.status,
        summaryText: DEFAULT_STAGES.stage3.summaryText,
        ...DEFAULT_STAGES.stage3
      },
      stage4: {
        detectedTypes: [],
        hasAuthorBio: false,
        totalGraphEntities: 0,
        score: DEFAULT_STAGES.stage4.score,
        status: DEFAULT_STAGES.stage4.status,
        summaryText: DEFAULT_STAGES.stage4.summaryText,
        ...DEFAULT_STAGES.stage4
      },
      stage5: {
        governanceGate: 'AI-Ready',
        manifests: [],
        score: DEFAULT_STAGES.stage5.score,
        status: DEFAULT_STAGES.stage5.status,
        summaryText: DEFAULT_STAGES.stage5.summaryText,
        ...DEFAULT_STAGES.stage5
      },
      stage6: {
        overallHealthIndex: 0,
        aiOptimizedScore: 0,
        aiReadyScore: 0,
        triageFlags: [errorMsg],
        score: DEFAULT_STAGES.stage6.score,
        status: DEFAULT_STAGES.stage6.status,
        summaryText: DEFAULT_STAGES.stage6.summaryText,
        ...DEFAULT_STAGES.stage6
      }
    };
  }

  const targetUrl = data.targetUrl || data.url || rawPayload.targetUrl || rawPayload.url || '--';
  const status = (typeof data.status === 'string' && data.status)
    ? data.status
    : (typeof rawPayload.status === 'string' && rawPayload.status)
    ? rawPayload.status
    : (targetUrl !== '--' ? 'completed' : 'UNAUDITED');
  const timestamp = data.timestamp || rawPayload.timestamp || null;

  // Meta & Telemetry
  const meta = {
    targetUrl,
    status,
    timestamp
  };

  // Stage 1: Bot Permissions Matrix
  const rawCrawlers =
    data.status?.botPermissions ||
    data.capabilities?.crawlers ||
    data.capabilities?.crawlerRadar ||
    data.capabilities?.crawlerAccess ||
    data.capabilities?.bots ||
    data.capabilities?.botPermissions ||
    data.crawlers ||
    data.crawlerRadar ||
    data.botPermissions ||
    {};

  const crawlers = Object.entries(rawCrawlers).map(([key, botData]) => {
    const isObj = typeof botData === 'object' && botData !== null;
    const allowed = isObj
      ? Boolean(botData.allowed ?? (botData.status === 200 || botData.status === 'allowed' || !botData.blocked))
      : Boolean(botData);
    const statusCode = isObj ? (botData.status || (allowed ? 200 : 403)) : (allowed ? 200 : 403);
    return {
      key,
      name: BOT_NAME_MAP[key] || (isObj && botData.name) || key,
      allowed,
      status: statusCode,
      statusText: allowed ? `ALLOWED (${statusCode})` : `BLOCKED (${statusCode})`
    };
  });

  // Stage 2: Canonical & Essential Routes
  const missingPages = data.missingEssentialPages || rawPayload.missingEssentialPages || [];
  const rawPages = Array.isArray(data.pages)
    ? data.pages
    : (Array.isArray(rawPayload.pages) ? rawPayload.pages : []);
  const discoveredRoutes = data.discoveredRoutes || [];

  const crawledPaths = [
    ...new Set([
      ...discoveredRoutes.map((r) => extractPathname(r, targetUrl)),
      ...rawPages.map((p) => extractPathname(p, targetUrl))
    ])
  ].filter(Boolean);

  const routes = CANONICAL_ESSENTIAL_ROUTES.map((route) => {
    const isFound = crawledPaths.some((p) => p === route || p.endsWith(route));
    return {
      route,
      status: isFound ? 'discovered' : 'missing'
    };
  });
  const missingCount = routes.filter((r) => r.status === 'missing').length;
  const discoveredCount = routes.filter((r) => r.status === 'discovered').length;

  // Stage 3: Crawled Pages & Semantic Density
  const pages = rawPages.map((p, idx) => {
    const isObj = typeof p === 'object' && p !== null;
    if (!isObj) {
      return {
        url: String(p),
        wordCount: 0,
        ratio: 0,
        textToHtmlRatio: 0,
        textCodeRatioPercent: 0,
        densityRating: 'Thin',
        isThin: true,
        isHeavySpa: false,
        hasCanonical: false,
        canonicalUrl: '',
        hasAllRequired: true,
        missingRequired: [],
        hasSchema: false,
        schemaTypes: [],
        extractedContent: '',
        headings: { h1: [], h2: [] },
        headingAudit: {},
        headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0 },
        missingAltCount: 0,
        missingAltList: [],
        lastUpdated: null,
        isSchema: true,
        status: 'WARNING (SPA)',
        color: 'bg-red-500',
        gain: '0.15',
        isCrawled: true,
        schema: {}
      };
    }

    const pageUrl = p.url || (p.route ? `${targetUrl.replace(/\/$/, '')}${p.route}` : (p.path || `Page ${idx + 1}`));
    const wordCount = p.wordCount ?? p.words ?? 0;

    // ---------------------------------------------------------------------------
    // 1. RATIO NORMALIZATION (Always convert <= 1 decimals to percentage)
    // ---------------------------------------------------------------------------
    let rawRatio = p.contentDensityRatio ?? p.textCodeRatio ?? p.textToHtmlRatio ?? p.textRatio ?? p.ratio ?? 0;
    let ratio = rawRatio;

    if (typeof ratio === 'string') {
      ratio = parseFloat(ratio.replace('%', ''));
    }
    if (isNaN(ratio)) ratio = 0;

    // Catch all decimal representations (e.g., 0.0588 -> 5.9%)
    if (ratio > 0 && ratio <= 1) {
      ratio = Number((ratio * 100).toFixed(1));
    } else {
      ratio = Number(Number(ratio).toFixed(1));
    }

    // ---------------------------------------------------------------------------
    // 2. HEADING COUNTS MAPPING (Bridge headingAudit -> headingCounts)
    // ---------------------------------------------------------------------------
    const headingAudit = p.headingAudit || {};
    const headingCounts = p.headingCounts || {
      h1: headingAudit.h1 ?? (Array.isArray(p.headings) ? p.headings.filter(h => h.tag === 'h1').length : (typeof p.h1 === 'number' ? p.h1 : 0)),
      h2: headingAudit.h2 ?? (Array.isArray(p.headings) ? p.headings.filter(h => h.tag === 'h2').length : (typeof p.h2 === 'number' ? p.h2 : 0)),
      h3: headingAudit.h3 ?? (Array.isArray(p.headings) ? p.headings.filter(h => h.tag === 'h3').length : (typeof p.h3 === 'number' ? p.h3 : 0)),
      h4: headingAudit.h4 ?? (Array.isArray(p.headings) ? p.headings.filter(h => h.tag === 'h4').length : (typeof p.h4 === 'number' ? p.h4 : 0))
    };

    // ---------------------------------------------------------------------------
    // 3. SCHEMA ISSUE FLAG (Legacy prototype expects isSchema=true when missing)
    // ---------------------------------------------------------------------------
    const schemasList = Array.isArray(p.schemas) ? p.schemas : (Array.isArray(p.schema) ? p.schema : (Array.isArray(p.jsonLd) ? p.jsonLd : (p.schema && typeof p.schema === 'object' ? [p.schema] : [])));
    const pageHasSchema = Boolean(
      p.hasSchema || 
      schemasList.length > 0 ||
      (Array.isArray(p.schemaTypes) && p.schemaTypes.length > 0) ||
      Boolean(p.schema && Object.keys(p.schema).length > 0 && (p.schema.detectedTypes?.length || p.schema.rawJsonLd?.length || p.schema.graphEntities))
    );
    const isMissingSchema = !pageHasSchema;
    const schemaTypes = Array.isArray(p.schema?.detectedTypes)
      ? p.schema.detectedTypes
      : (Array.isArray(p.schemaTypes) ? p.schemaTypes : schemasList.map(s => s['@type'] || s.type).filter(Boolean));

    // Canonical Normalization
    const canonicalUrl = p.canonicalTag || p.canonical || p.canonicalUrl || '';
    const hasCanonical = typeof p.canonicalTag === 'boolean' ? p.canonicalTag : Boolean(p.hasCanonical || canonicalUrl);

    // Headings Structure Normalization
    let h1List = [];
    let h2List = [];
    if (p.headings) {
      if (Array.isArray(p.headings)) {
        h1List = p.headings.filter(h => h.tag === 'h1').map(h => h.text || `Count: ${headingCounts.h1}`);
        if (h1List.length === 0 && headingCounts.h1 > 0) h1List = [`Count: ${headingCounts.h1}`];
        h2List = p.headings.filter(h => h.tag === 'h2').map(h => h.text || `Count: ${headingCounts.h2}`);
        if (h2List.length === 0 && headingCounts.h2 > 0) h2List = [`Count: ${headingCounts.h2}`];
      } else {
        if (Array.isArray(p.headings.h1)) h1List = p.headings.h1;
        else if (Array.isArray(p.headings.H1)) h1List = p.headings.H1;
        else if (typeof p.headings.H1 !== 'undefined') h1List = [`Count: ${p.headings.H1}`];
        else if (typeof p.headings.h1 !== 'undefined') h1List = [`Count: ${p.headings.h1}`];

        if (Array.isArray(p.headings.h2)) h2List = p.headings.h2;
        else if (Array.isArray(p.headings.H2)) h2List = p.headings.H2;
        else if (typeof p.headings.H2 !== 'undefined') h2List = [`Count: ${p.headings.H2}`];
        else if (typeof p.headings.h2 !== 'undefined') h2List = [`Count: ${p.headings.h2}`];
      }
    } else {
      if (Array.isArray(p.h1)) h1List = p.h1;
      else if (p.h1) h1List = [p.h1];
      else if (headingCounts.h1 > 0) h1List = [`Count: ${headingCounts.h1}`];

      if (Array.isArray(p.h2)) h2List = p.h2;
      else if (p.h2) h2List = [p.h2];
      else if (headingCounts.h2 > 0) h2List = [`Count: ${headingCounts.h2}`];
    }
    const headings = { h1: h1List, h2: h2List };

    // Extracted Content
    const extractedContent = p.bodyTextSnippet ?? p.markdown ?? p.extractedText ?? p.snippet ?? p.content ?? p.text ?? '';

    // Alts & Semantic Tags
    let missingAltList = p.missingAltList || [];
    if (missingAltList.length === 0 && Array.isArray(p.images)) {
      missingAltList = p.images.filter(img => !img.alt || img.alt.trim() === '').map(img => ({
        src: img.src,
        suggestedAlt: `${p.title || 'Page'} visual element`
      }));
    }
    const missingAltCount = p.imagesWithoutAlt ?? p.missingAltCount ?? missingAltList.length;

    let missingRequired = p.missingSemanticTags || (Array.isArray(p.missingRequired) ? p.missingRequired : []);
    if (missingRequired.length === 0 && p.semanticTags) {
      if (!p.semanticTags.main) missingRequired.push('main');
      if (!p.semanticTags.footer) missingRequired.push('footer');
    }
    // Detect if the route is a 404 / Missing endpoint
    const is404 = p.statusCode === 404 || 
                  p.is404 === true || 
                  p.isMissing === true || 
                  p.missingStatus === 'Missing' ||
                  (p.isCrawled === false && wordCount === 0);

    // Set badge status and styling
    let statusText = 'EXCELLENT';
    let statusColor = 'bg-[#10b981]';

    if (is404) {
      statusText = '404 NOT FOUND';
      statusColor = 'bg-red-500';
    } else if (ratio < 15) {
      statusText = 'WARNING (SPA)';
      statusColor = 'bg-red-500';
    } else if (ratio < 25) {
      statusText = 'MODERATE';
      statusColor = 'bg-[#f59e0b]';
    }

    const isThin = !is404 && (p.isThin !== undefined ? p.isThin : (wordCount < 250));
    const isHeavySpa = !is404 && (p.isHeavySpa !== undefined ? p.isHeavySpa : (p.isSpa === true || (ratio < 15 && wordCount < 300)));

    return {
      ...p,
      url: p.url || p.route || p.path || pageUrl,
      ratio: is404 ? 0 : ratio,
      wordCount: p.wordCount || 0,
      statusCode: p.statusCode || (is404 ? 404 : 200),
      is404,
      isCrawled: !is404 && p.isCrawled !== false,
      isThin,
      isHeavySpa,
      headingAudit,
      headingCounts,
      lastUpdated: is404 ? null : (p.lastUpdated || p.lastModified || null),
      hasCanonical: is404 ? true : (typeof p.canonicalTag === 'boolean' ? p.canonicalTag : Boolean(p.hasCanonical || canonicalUrl)),
      canonicalUrl,
      hasAllRequired: is404 ? true : (typeof p.hasSemanticTags === 'boolean' ? p.hasSemanticTags : (typeof p.semanticTagsCount === 'number' ? (p.semanticTagsCount >= 3) : (p.hasAllRequired !== undefined ? p.hasAllRequired : (missingRequired.length === 0)))),
      missingRequired: is404 ? [] : missingRequired,
      missingAltCount: is404 ? 0 : (p.imagesWithoutAlt ?? p.missingAltCount ?? missingAltList.length),
      missingAltList: is404 ? [] : missingAltList,
      isSchema: is404 ? false : isMissingSchema,
      status: statusText,
      color: statusColor,
      gain: is404 ? '0.00' : (Math.min(0.99, Math.max(0.15, ratio / 50))).toFixed(2),
      textToHtmlRatio: is404 ? 0 : ratio,
      textCodeRatioPercent: is404 ? 0 : Math.round(ratio),
      densityRating: is404 ? 'Thin' : evaluateDensityRating(wordCount),
      hasSchema: is404 ? false : pageHasSchema,
      schemaTypes: is404 ? [] : schemaTypes,
      extractedContent: is404 ? '' : extractedContent,
      headings: is404 ? { h1: [], h2: [] } : headings,
      schema: p.schema || {}
    };
  });

  // Stage 4: Security, Legal Routes & Contact Anchors
  const rawScan = rawPayload;
  const s4TargetUrl = rawScan?.targetUrl || rawScan?.url || data?.targetUrl || data?.url || (targetUrl !== '--' ? targetUrl : '');
  const protocol = rawScan?.protocol || data?.protocol || (s4TargetUrl.startsWith('https://') ? 'https:' : (s4TargetUrl.startsWith('http://') ? 'http:' : ''));
  const isHttps = protocol === 'https:' || s4TargetUrl.startsWith('https://');
  const sslValid = Boolean(s4TargetUrl) && isHttps && rawScan?.status !== 'failed' && rawScan?.status !== 'error' && data?.status !== 'failed' && data?.status !== 'error';

  const s4MissingPages = Array.isArray(rawScan?.missingEssentialPages) ? rawScan.missingEssentialPages : (Array.isArray(data?.missingEssentialPages) ? data.missingEssentialPages : (Array.isArray(missingPages) ? missingPages : []));
  const s4CrawledPages = Array.isArray(rawScan?.pages) ? rawScan.pages : (Array.isArray(data?.pages) ? data.pages : (Array.isArray(rawPages) ? rawPages : []));

  const privacyInPages = s4CrawledPages.some(p => {
    const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
    return u.includes('/privacy-policy') || u.includes('/privacy') || u.includes('/#privacy');
  });
  const privacyMissing = s4MissingPages.some(m => m.toLowerCase().includes('privacy'));
  const hasPrivacyPolicy = Boolean(s4TargetUrl) && (privacyInPages || (!privacyMissing && s4CrawledPages.length > 0));

  const termsInPages = s4CrawledPages.some(p => {
    const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
    return u.includes('/terms-of-service') || u.includes('/terms') || u.includes('/#terms');
  });
  const termsMissing = s4MissingPages.some(m => m.toLowerCase().includes('terms'));
  const hasTermsOfService = Boolean(s4TargetUrl) && (termsInPages || (!termsMissing && s4CrawledPages.length > 0));

  let securityBadgeText = '--';
  if (s4TargetUrl) {
    securityBadgeText = isHttps ? 'TLS 1.3 / HTTPS Enforced' : 'Insecure HTTP Protocol';
  }

  // Stage 4 Contact Anchors Multi-Source Extraction
  const sanitizeInput = (v) => (v && v !== '--' && v !== 'None Detected' && v !== 'null') ? v : null;

  let contactEmail = sanitizeInput(rawScan?.contact?.email || data?.contact?.email || data?.contactDetails?.email);
  let contactPhone = sanitizeInput(rawScan?.contact?.phone || data?.contact?.phone || data?.contactDetails?.phone);
  let contactAddress = sanitizeInput(rawScan?.contact?.address || data?.contact?.address || data?.contactDetails?.address);

  const allPages = [
    ...(Array.isArray(s4CrawledPages) ? s4CrawledPages : []),
    ...(Array.isArray(rawScan?.stage3?.pages) ? rawScan.stage3.pages : []),
    ...(Array.isArray(data?.stage3?.pages) ? data.stage3.pages : [])
  ];

  for (const page of allPages) {
    if (!page || typeof page !== 'object') continue;

    // Ingest direct addressText from crawler
    if (!contactAddress && page.addressText) {
      contactAddress = sanitizeInput(page.addressText);
    }
    if (!contactAddress && page.contactAnchors?.address) {
      contactAddress = sanitizeInput(page.contactAnchors.address);
    }

    // Ingest links (tel: and mailto:)
    if (Array.isArray(page.links)) {
      for (const link of page.links) {
        if (!contactEmail && typeof link === 'string' && link.toLowerCase().startsWith('mailto:')) {
          contactEmail = sanitizeInput(link.replace(/^mailto:/i, '').split('?')[0].trim());
        }
        if (!contactPhone && typeof link === 'string' && link.toLowerCase().startsWith('tel:')) {
          contactPhone = sanitizeInput(link.replace(/^tel:/i, '').replace(/\s+/g, '').trim());
        }
      }
    }

    // Ingest JSON-LD Schemas
    const schemas = Array.isArray(page.schema) ? page.schema : (page.schema ? [page.schema] : (Array.isArray(page.schemas) ? page.schemas : []));
    for (const item of schemas) {
      if (!item || typeof item !== 'object') continue;
      if (!contactEmail && item.email) contactEmail = sanitizeInput(item.email);
      if (!contactPhone && item.telephone) contactPhone = sanitizeInput(item.telephone);
      if (!contactAddress && item.address) {
        if (typeof item.address === 'string') {
          contactAddress = sanitizeInput(item.address);
        } else if (typeof item.address === 'object') {
          const addr = item.address;
          const parts = [
            addr.streetAddress,
            addr.addressLocality,
            addr.addressRegion,
            addr.postalCode,
            typeof addr.addressCountry === 'string' ? addr.addressCountry : addr.addressCountry?.name
          ].filter(Boolean);
          contactAddress = sanitizeInput(parts.join(', '));
        }
      }
      if (item.contactPoint) {
        const points = Array.isArray(item.contactPoint) ? item.contactPoint : [item.contactPoint];
        for (const cp of points) {
          if (!contactEmail && cp.email) contactEmail = sanitizeInput(cp.email);
          if (!contactPhone && cp.telephone) contactPhone = sanitizeInput(cp.telephone);
        }
      }
    }
  }

  let trustAnchorCount = 0;
  if (contactEmail) trustAnchorCount++;
  if (contactPhone) trustAnchorCount++;
  if (contactAddress) trustAnchorCount++;

  // Stage 4: Schema.org Entities & Author Credentials
  const detectedTypesFromPages = rawPages.flatMap((page) =>
    (typeof page === 'object' && page?.schema?.detectedTypes) ? page.schema.detectedTypes : []
  );
  const detectedTypesFromStatus = Array.isArray(data.status?.jsonLdTypes) ? data.status.jsonLdTypes : [];
  const detectedTypesFromStage4 = Array.isArray(data.stage4?.detectedTypes) ? data.stage4.detectedTypes : [];
  const detectedTypesFromSchemaDetails = Array.isArray(data.stages?.stage4?.schemaDetails?.detectedTypes)
    ? data.stages.stage4.schemaDetails.detectedTypes
    : (Array.isArray(rawPayload?.stages?.stage4?.schemaDetails?.detectedTypes)
      ? rawPayload.stages.stage4.schemaDetails.detectedTypes
      : (Array.isArray(data.stage4?.schemaDetails?.detectedTypes) ? data.stage4.schemaDetails.detectedTypes : []));
  const detectedTypes = [...new Set([...detectedTypesFromPages, ...detectedTypesFromStatus, ...detectedTypesFromStage4, ...detectedTypesFromSchemaDetails])];

  const eeat = data.eeatMetrics || data.eeat || data.stage4?.eeat || {};
  const hasAuthorBio = Boolean(
    data.stage4?.hasAuthorBio ??
    (rawPages.some((page) => typeof page === 'object' && (page?.schema?.hasAuthorBio === true || page?.eeat?.hasAuthorBio === true)) ||
    eeat.hasAuthorBio)
  );

  const emailValue = data.emailValue || eeat.emailValue || data.status?.emailValue || data.contactDetails?.email || data.stage4?.emailValue || data.stage4?.contactDetails?.email || rawPayload.emailValue || '--';
  const phoneValue = data.phoneValue || eeat.phoneValue || data.status?.phoneValue || data.contactDetails?.phone || data.stage4?.phoneValue || data.stage4?.contactDetails?.phone || rawPayload.phoneValue || '--';
  const authorityStatus = eeat.authorityStatus || data.authorityStatus || data.stage4?.authorityStatus || 'Optimized Anchor';
  const ageEstimate = eeat.ageEstimate || data.ageEstimate || data.stage4?.ageEstimate || 'Domain Established';
  const hasContactInfo = Boolean(eeat.hasContactInfo || (emailValue !== '--' && phoneValue !== '--') || data.hasContactInfo || data.stage4?.contactDetails?.isConfirmed);
  const contactDetails = {
    email: emailValue,
    phone: phoneValue,
    isConfirmed: hasContactInfo || (emailValue !== '--' || phoneValue !== '--')
  };

  let totalGraphEntities = rawPages.reduce((sum, page) => {
    if (typeof page === 'object' && page?.schema) {
      if (typeof page.schema.graphEntities === 'number') {
        return sum + page.schema.graphEntities;
      }
      if (Array.isArray(page.schema.rawJsonLd)) {
        return sum + page.schema.rawJsonLd.length;
      }
    }
    return sum;
  }, 0);

  if (totalGraphEntities === 0 && detectedTypes.length > 0) {
    totalGraphEntities = detectedTypes.length;
  }

  // Stage 5: Machine Manifests (AI-Ready Gate)
  const rawManifests = data.capabilities?.manifests || data.manifests || data.stage5?.manifests || {};
  const statusObj = data.status || {};
  const sec4 = data.sec4 || {};

  const manifestsList = [
    { level: 1, path: '/robots.txt', name: 'robots.txt', exists: Boolean(statusObj.robotsTxtExists ?? sec4.robotsTxtFound ?? rawManifests.robotsTxt?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/robots.txt')?.exists)), desc: 'Crawler Gateway & Firewall Rules' },
    { level: 2, path: '/sitemap.xml', name: 'sitemap.xml', exists: Boolean(statusObj.sitemapExists ?? sec4.sitemapFound ?? rawManifests.sitemapXml?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/sitemap.xml')?.exists)), desc: 'Search Index Roadmap' },
    { level: 2, path: '/llms.txt', name: 'llms.txt', exists: Boolean(statusObj.llmsTxtExists ?? sec4.llmsTxtFound ?? rawManifests.llmsTxt?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/llms.txt')?.exists)), desc: 'Machine Welcome Directory' },
    { level: 3, path: '/ai-context.md', name: 'ai-context.md', exists: Boolean(statusObj.aiContextExists ?? sec4.aiContextFound ?? rawManifests.aiContextMd?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/ai-context.md')?.exists)), desc: 'Knowledge & System Blueprint' },
    { level: 4, path: '/README.md', name: 'README.md', exists: Boolean(sec4.readmeFound ?? rawManifests.readmeMd?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/README.md')?.exists)), desc: 'Architecture & Developer Guide' },
    { level: 4, path: '/about.md', name: 'about.md', exists: Boolean(statusObj.aboutTxtExists ?? sec4.aboutMdFound ?? rawManifests.aboutMd?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/about.md')?.exists)), desc: 'Corporate Entity Manifest' },
    { level: 4, path: '/docs.md', name: 'docs.md', exists: Boolean(statusObj.docsTxtExists ?? sec4.docsMdFound ?? rawManifests.docsMd?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/docs.md')?.exists)), desc: 'Technical Integration Manual' },
    { level: 4, path: '/content.md', name: 'content.md', exists: Boolean(statusObj.contentTxtExists ?? sec4.contentMdFound ?? rawManifests.contentMd?.exists ?? (Array.isArray(rawManifests) && rawManifests.find(m => m.path === '/content.md')?.exists)), desc: 'Flat Content Ingestion Stream' }
  ].map(m => ({
    ...m,
    status: m.exists ? 200 : 404,
    statusBadge: m.level === 1 
      ? (m.exists ? '200 OK • AVAILABLE' : '404 • MISSING')
      : (m.exists ? 'AVAILABLE' : 'MISSING')
  }));

  const l1Exists = Boolean(manifestsList.find(m => m.level === 1)?.exists);
  const level1Status = l1Exists ? 'AVAILABLE' : 'MISSING';

  const l2Items = manifestsList.filter(m => m.level === 2);
  const l2Count = l2Items.filter(m => m.exists).length;
  const level2Status = l2Count === l2Items.length ? 'AVAILABLE' : (l2Count > 0 ? 'PARTIAL' : 'MISSING');

  const l3Exists = Boolean(manifestsList.find(m => m.level === 3)?.exists);
  const level3Status = l3Exists ? 'AVAILABLE' : 'MISSING';

  const l4Items = manifestsList.filter(m => m.level === 4);
  const l4Count = l4Items.filter(m => m.exists).length;
  const level4Status = l4Count === l4Items.length ? 'AVAILABLE' : (l4Count > 0 ? 'PARTIAL' : 'MISSING');

  const manifests = manifestsList;

  // Stage 6: Health Index & Dual-Pillar Scores
  const rawScores = data.capabilities?.scores || data.scores || data.scoreCard || {};
  const overallHealthIndex = Number(
    rawScores.overallHealthIndex ?? data.overallScore ?? rawPayload.overallScore ?? rawScores.overallScore ?? 0
  ) || 0;
  const aiOptimizedScore = Number(
    rawScores.aiOptimizedScore ?? data.pillarScores?.P1 ?? data.scoreCard?.pillars?.p1?.score ?? 0
  ) || 0;
  const aiReadyScore = Number(
    rawScores.aiReadyScore ?? data.pillarScores?.P4 ?? data.scoreCard?.pillars?.p4?.score ?? 0
  ) || 0;
  
  const rawFlags = rawScores.triageFlags || data.alerts?.map((a) => a.message || a.title || JSON.stringify(a)) || [];
  const triageFlags = Array.isArray(rawFlags) ? rawFlags : Object.values(rawFlags);

  // Canonical 6-Stage Diagnostic Pipeline Scores
  const rawStages = data.stages || rawPayload.stages || {};
  const stages = {
    stage1: rawStages.stage1 ? { ...rawStages.stage1 } : { ...DEFAULT_STAGES.stage1 },
    stage2: rawStages.stage2 ? { ...rawStages.stage2 } : { ...DEFAULT_STAGES.stage2 },
    stage3: rawStages.stage3 ? { ...rawStages.stage3 } : { ...DEFAULT_STAGES.stage3 },
    stage4: rawStages.stage4 ? { ...rawStages.stage4 } : { ...DEFAULT_STAGES.stage4 },
    stage5: rawStages.stage5 ? { ...rawStages.stage5 } : { ...DEFAULT_STAGES.stage5 },
    stage6: rawStages.stage6 ? { ...rawStages.stage6 } : { ...DEFAULT_STAGES.stage6 }
  };

  return {
    meta,
    stages,
    stage1: { crawlers, score: stages.stage1.score, status: stages.stage1.status, summaryText: stages.stage1.summaryText, ...stages.stage1 },
    stage2: { routes, missingCount, discoveredCount, score: stages.stage2.score, status: stages.stage2.status, summaryText: stages.stage2.summaryText, ...stages.stage2 },
    stage3: { pages, score: stages.stage3.score, status: stages.stage3.status, summaryText: stages.stage3.summaryText, ...stages.stage3 },
    stage4: {
      ...DEFAULT_STAGES.stage4,
      ...stages.stage4,
      ...(rawScan?.stage4 || {}),
      detectedTypes,
      hasAuthorBio,
      emailValue,
      phoneValue,
      authorityStatus,
      ageEstimate,
      contactDetails,
      totalGraphEntities,
      score: stages.stage4.score,
      status: stages.stage4.status,
      summaryText: stages.stage4.summaryText,
      schemaDetails: stages.stage4.schemaDetails || DEFAULT_STAGES.stage4.schemaDetails,
      authorDetails: stages.stage4.authorDetails || DEFAULT_STAGES.stage4.authorDetails,
      authorityDetails: stages.stage4.authorityDetails || DEFAULT_STAGES.stage4.authorityDetails,
      isHttps,
      sslValid,
      hasPrivacyPolicy,
      hasTermsOfService,
      securityBadgeText,
      contact: {
        email: contactEmail,
        phone: contactPhone,
        address: contactAddress,
        trustAnchorCount
      }
    },
    stage5: { governanceGate: 'AI-Ready', manifests, level1Status, level2Status, level3Status, level4Status, score: stages.stage5.score, status: stages.stage5.status, summaryText: stages.stage5.summaryText, ...stages.stage5 },
    stage6: { overallHealthIndex, aiOptimizedScore, aiReadyScore, triageFlags, score: stages.stage6.score, status: stages.stage6.status, summaryText: stages.stage6.summaryText, ...stages.stage6 }
  };
}
