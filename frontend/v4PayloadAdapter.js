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
      stage1: {
        crawlers: []
      },
      stage2: {
        routes: [],
        missingCount: 0,
        discoveredCount: 0
      },
      stage3: {
        pages: []
      },
      stage4: {
        detectedTypes: [],
        hasAuthorBio: false,
        totalGraphEntities: 0
      },
      stage5: {
        governanceGate: 'AI-Ready',
        manifests: []
      },
      stage6: {
        overallHealthIndex: 0,
        aiOptimizedScore: 0,
        aiReadyScore: 0,
        triageFlags: []
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
      stage1: { crawlers: [] },
      stage2: { routes: [], missingCount: 0, discoveredCount: 0 },
      stage3: { pages: [] },
      stage4: { detectedTypes: [], hasAuthorBio: false, totalGraphEntities: 0 },
      stage5: { governanceGate: 'AI-Ready', manifests: [] },
      stage6: { overallHealthIndex: 0, aiOptimizedScore: 0, aiReadyScore: 0, triageFlags: [errorMsg] }
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
        missingAltCount: 0,
        missingAltList: [],
        lastUpdated: null,
        isCrawled: true,
        schema: {}
      };
    }

    const pageUrl = p.url || (p.route ? `${targetUrl.replace(/\/$/, '')}${p.route}` : (p.path || `Page ${idx + 1}`));
    const wordCount = p.wordCount ?? p.words ?? 0;

    // 1. Thorough Ratio Normalization
    let rawRatio = p.contentDensityRatio ?? p.textCodeRatio ?? p.textToHtmlRatio ?? p.textRatio ?? p.ratio ?? 0;
    let ratio = rawRatio;
    if (typeof ratio === 'string') ratio = parseFloat(ratio.replace('%', ''));
    if (isNaN(ratio)) ratio = 0;
    if (ratio > 0 && ratio <= 1 && p.contentDensityRatio === undefined) {
      ratio = Number((ratio * 100).toFixed(1));
    } else {
      ratio = Number(Number(ratio).toFixed(1));
    }

    // 2. Schema Normalization
    const schemasList = Array.isArray(p.schemas) ? p.schemas : (Array.isArray(p.schema) ? p.schema : (Array.isArray(p.jsonLd) ? p.jsonLd : (p.schema && typeof p.schema === 'object' ? [p.schema] : [])));
    const hasSchema = p.hasSchema === true || schemasList.length > 0 || Boolean(p.schema && Object.keys(p.schema).length > 0 && (p.schema.detectedTypes?.length || p.schema.rawJsonLd?.length || p.schema.graphEntities));
    const schemaTypes = Array.isArray(p.schema?.detectedTypes)
      ? p.schema.detectedTypes
      : schemasList.map(s => s['@type'] || s.type).filter(Boolean);

    // 3. Canonical Normalization
    const canonicalUrl = p.canonicalTag || p.canonical || p.canonicalUrl || '';
    const hasCanonical = p.hasCanonical === true || Boolean(canonicalUrl);

    // 4. Safely Parse Headings (Arrays vs Numeric Counts)
    let h1List = [];
    let h2List = [];
    if (p.headings) {
      if (Array.isArray(p.headings.h1)) h1List = p.headings.h1;
      else if (Array.isArray(p.headings.H1)) h1List = p.headings.H1;
      else if (typeof p.headings.H1 !== 'undefined') h1List = [`Count: ${p.headings.H1}`];
      else if (typeof p.headings.h1 !== 'undefined') h1List = [`Count: ${p.headings.h1}`];

      if (Array.isArray(p.headings.h2)) h2List = p.headings.h2;
      else if (Array.isArray(p.headings.H2)) h2List = p.headings.H2;
      else if (typeof p.headings.H2 !== 'undefined') h2List = [`Count: ${p.headings.H2}`];
      else if (typeof p.headings.h2 !== 'undefined') h2List = [`Count: ${p.headings.h2}`];
    } else {
      if (Array.isArray(p.h1)) h1List = p.h1;
      else if (p.h1) h1List = [p.h1];
      if (Array.isArray(p.h2)) h2List = p.h2;
      else if (p.h2) h2List = [p.h2];
    }
    const headings = { h1: h1List, h2: h2List };

    // 5. Secure Extracted Content
    const extractedContent = p.bodyTextSnippet ?? p.markdown ?? p.extractedText ?? p.snippet ?? p.content ?? p.text ?? '';

    // 6. Alts & Semantic Tags
    let missingAltList = Array.isArray(p.missingAltList) ? p.missingAltList : [];
    if (missingAltList.length === 0 && Array.isArray(p.images)) {
      missingAltList = p.images.filter(img => !img.alt || img.alt.trim() === '').map(img => ({
        src: img.src,
        suggestedAlt: `${p.title || 'Page'} visual element`
      }));
    }
    const missingAltCount = p.missingAltCount ?? missingAltList.length;

    let missingRequired = Array.isArray(p.missingRequired) ? p.missingRequired : [];
    if (missingRequired.length === 0 && p.semanticTags) {
      if (!p.semanticTags.main) missingRequired.push('main');
      if (!p.semanticTags.footer) missingRequired.push('footer');
    }
    const hasAllRequired = p.hasAllRequired !== undefined ? p.hasAllRequired : (missingRequired.length === 0);

    const isThin = p.isThin !== undefined ? p.isThin : (wordCount < 250);
    const isHeavySpa = p.isHeavySpa !== undefined ? p.isHeavySpa : (p.isSpa === true || (ratio < 15 && wordCount < 300));

    return {
      ...p,
      url: pageUrl,
      wordCount,
      ratio,
      textToHtmlRatio: ratio,
      textCodeRatioPercent: Math.round(ratio),
      densityRating: evaluateDensityRating(wordCount),
      isThin,
      isHeavySpa,
      hasCanonical,
      canonicalUrl,
      hasAllRequired,
      missingRequired,
      hasSchema,
      schemaTypes,
      extractedContent,
      headings,
      missingAltCount,
      missingAltList,
      lastUpdated: p.lastUpdated || p.lastModified || null,
      isCrawled: p.isCrawled ?? (p.status ? p.status === 200 : true),
      schema: p.schema || {}
    };
  });

  // Stage 4: Schema.org Entities & Author Credentials
  const detectedTypesFromPages = rawPages.flatMap((page) =>
    (typeof page === 'object' && page?.schema?.detectedTypes) ? page.schema.detectedTypes : []
  );
  const detectedTypesFromStatus = Array.isArray(data.status?.jsonLdTypes) ? data.status.jsonLdTypes : [];
  const detectedTypes = [...new Set([...detectedTypesFromPages, ...detectedTypesFromStatus])];

  const hasAuthorBio = rawPages.some(
    (page) => typeof page === 'object' && (page?.schema?.hasAuthorBio === true || page?.eeat?.hasAuthorBio === true)
  );

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
  const rawManifests = data.capabilities?.manifests || data.manifests || {};
  const statusObj = data.status || {};
  const manifests = [
    {
      path: '/robots.txt',
      exists: Boolean(rawManifests.robotsTxt?.exists ?? statusObj.robotsTxtExists),
      status: rawManifests.robotsTxt?.status || (rawManifests.robotsTxt?.exists || statusObj.robotsTxtExists ? 200 : 404),
      label: 'Robots Directive'
    },
    {
      path: '/llms.txt',
      exists: Boolean(rawManifests.llmsTxt?.exists ?? statusObj.llmsTxtExists),
      status: rawManifests.llmsTxt?.status || (rawManifests.llmsTxt?.exists || statusObj.llmsTxtExists ? 200 : 404),
      label: 'LLM Manifest'
    },
    {
      path: '/ai-context.md',
      exists: Boolean(rawManifests.aiContextMd?.exists ?? statusObj.aiContextExists),
      status: rawManifests.aiContextMd?.status || (rawManifests.aiContextMd?.exists || statusObj.aiContextExists ? 200 : 404),
      label: 'AI Context Spec'
    }
  ];

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

  return {
    meta,
    stage1: { crawlers },
    stage2: { routes, missingCount, discoveredCount },
    stage3: { pages },
    stage4: { detectedTypes, hasAuthorBio, totalGraphEntities },
    stage5: { governanceGate: 'AI-Ready', manifests },
    stage6: { overallHealthIndex, aiOptimizedScore, aiReadyScore, triageFlags }
  };
}
