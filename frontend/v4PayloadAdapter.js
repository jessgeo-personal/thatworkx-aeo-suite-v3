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

  // Meta & Telemetry
  const meta = {
    targetUrl: payload.targetUrl || '--',
    status: payload.status || 'UNAUDITED',
    timestamp: payload.timestamp || null
  };

  // Stage 1: Bot Permissions Matrix
  const rawCrawlers = payload.capabilities?.crawlers || {};
  const crawlers = Object.entries(rawCrawlers).map(([key, botData]) => {
    const allowed = Boolean(botData?.allowed);
    const status = botData?.status || (allowed ? 200 : 403);
    return {
      key,
      name: BOT_NAME_MAP[key] || key,
      allowed,
      status,
      statusText: allowed ? `ALLOWED (${status})` : `BLOCKED (${status})`
    };
  });

  // Stage 2: Canonical & Essential Routes
  const missingPages = payload.missingEssentialPages || [];
  const routes = CANONICAL_ESSENTIAL_ROUTES.map((route) => {
    const isMissing = missingPages.includes(route);
    return {
      route,
      status: isMissing ? 'missing' : 'discovered'
    };
  });
  const missingCount = routes.filter((r) => r.status === 'missing').length;
  const discoveredCount = routes.filter((r) => r.status === 'discovered').length;

  // Stage 3: Crawled Pages & Semantic Density
  const rawPages = payload.pages || [];
  const pages = rawPages.map((page) => {
    const wordCount = Number(page.wordCount) || 0;
    const ratioPercent = Math.round((Number(page.textCodeRatio) || 0) * 100);
    return {
      url: page.url,
      wordCount,
      textCodeRatioPercent: ratioPercent,
      densityRating: evaluateDensityRating(wordCount),
      schema: page.schema || {}
    };
  });

  // Stage 4: Schema.org Entities & Author Credentials
  const detectedTypes = [
    ...new Set(rawPages.flatMap((page) => page.schema?.detectedTypes || []))
  ];
  const hasAuthorBio = rawPages.some((page) => page.schema?.hasAuthorBio === true);
  const totalGraphEntities = rawPages.reduce(
    (sum, page) => sum + (Number(page.schema?.graphEntities) || 0),
    0
  );

  // Stage 5: Machine Manifests (AI-Ready Gate)
  const rawManifests = payload.capabilities?.manifests || {};
  const manifests = [
    {
      path: '/robots.txt',
      exists: Boolean(rawManifests.robotsTxt?.exists),
      status: rawManifests.robotsTxt?.status || (rawManifests.robotsTxt?.exists ? 200 : 404),
      label: 'Robots Directive'
    },
    {
      path: '/llms.txt',
      exists: Boolean(rawManifests.llmsTxt?.exists),
      status: rawManifests.llmsTxt?.status || (rawManifests.llmsTxt?.exists ? 200 : 404),
      label: 'LLM Manifest'
    },
    {
      path: '/ai-context.md',
      exists: Boolean(rawManifests.aiContextMd?.exists),
      status: rawManifests.aiContextMd?.status || (rawManifests.aiContextMd?.exists ? 200 : 404),
      label: 'AI Context Spec'
    }
  ];

  // Stage 6: Health Index & Dual-Pillar Scores
  const rawScores = payload.capabilities?.scores || {};
  const overallHealthIndex = Number(rawScores.overallHealthIndex) || 0;
  const aiOptimizedScore = Number(rawScores.aiOptimizedScore) || 0;
  const aiReadyScore = Number(rawScores.aiReadyScore) || 0;
  const triageFlags = Array.isArray(rawScores.triageFlags) ? rawScores.triageFlags : [];

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
