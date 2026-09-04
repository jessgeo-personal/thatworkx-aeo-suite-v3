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
  claudeBot: 'ClaudeBot',
  ccBot: 'CCBot',
  perplexityBot: 'PerplexityBot',
  googleExtended: 'Google-Extended'
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
 * @param {object|null} payload - Raw payload from POST /api/scan
 * @returns {object} Normalized V4 Cockpit State
 */
export function mapBackendScanToV4State(payload) {
  if (!payload || typeof payload !== 'object') {
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

  // Unpack envelope wrapper if returned by backend res.json({ results: ... })
  const data = (payload.results && typeof payload.results === 'object')
    ? payload.results
    : (payload.data && typeof payload.data === 'object')
    ? payload.data
    : payload;

  const targetUrl = data.targetUrl || data.url || payload.targetUrl || payload.url || '--';
  const status = (typeof data.status === 'string' && data.status)
    ? data.status
    : (typeof payload.status === 'string' && payload.status)
    ? payload.status
    : (targetUrl !== '--' ? 'completed' : 'UNAUDITED');
  const timestamp = data.timestamp || payload.timestamp || null;

  // Meta & Telemetry
  const meta = {
    targetUrl,
    status,
    timestamp
  };

  // Stage 1: Bot Permissions Matrix
  const rawCrawlers =
    data.capabilities?.crawlers ||
    data.capabilities?.crawlerRadar ||
    data.capabilities?.crawlerAccess ||
    data.capabilities?.bots ||
    data.capabilities?.botPermissions ||
    data.status?.botPermissions ||
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
  const missingPages = data.missingEssentialPages || payload.missingEssentialPages || [];
  const rawPages = Array.isArray(data.pages)
    ? data.pages
    : (Array.isArray(payload.pages) ? payload.pages : []);

  const crawledPaths = rawPages
    .map((p) => extractPathname(p, targetUrl))
    .filter(Boolean);

  const routes = CANONICAL_ESSENTIAL_ROUTES.map((route) => {
    const isMissing = missingPages.includes(route);
    const isFound = crawledPaths.some((p) => p === route || p.endsWith(route));
    return {
      route,
      status: isMissing ? 'missing' : (isFound ? 'discovered' : (missingPages.length > 0 ? 'missing' : 'discovered'))
    };
  });
  const missingCount = routes.filter((r) => r.status === 'missing').length;
  const discoveredCount = routes.filter((r) => r.status === 'discovered').length;

  // Stage 3: Crawled Pages & Semantic Density
  const pages = rawPages.map((page, idx) => {
    const isObj = typeof page === 'object' && page !== null;
    const pageUrl = isObj
      ? (page.url || (page.route ? `${targetUrl.replace(/\/$/, '')}${page.route}` : `Page ${idx + 1}`))
      : String(page);
    const wordCount = isObj ? (Number(page.wordCount) || 0) : 0;
    
    let ratioPercent = 0;
    if (isObj) {
      if (page.textCodeRatio !== undefined) {
        ratioPercent = Math.round((Number(page.textCodeRatio) || 0) * 100);
      } else if (page.textToCodeRatio !== undefined) {
        ratioPercent = Math.round((Number(page.textToCodeRatio) || 0) * 100);
      } else if (page.contentDensityRatio !== undefined) {
        ratioPercent = Math.round(Number(page.contentDensityRatio) || 0);
      }
    }

    return {
      url: pageUrl,
      wordCount,
      textCodeRatioPercent: ratioPercent,
      densityRating: evaluateDensityRating(wordCount),
      schema: isObj ? (page.schema || {}) : {}
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
    rawScores.overallHealthIndex ?? data.overallScore ?? payload.overallScore ?? rawScores.overallScore ?? 0
  ) || 0;
  const aiOptimizedScore = Number(rawScores.aiOptimizedScore ?? data.pillarScores?.P1 ?? 0) || 0;
  const aiReadyScore = Number(rawScores.aiReadyScore ?? data.pillarScores?.P2 ?? 0) || 0;
  
  const rawFlags = rawScores.triageFlags || data.alerts?.map((a) => a.message) || [];
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
