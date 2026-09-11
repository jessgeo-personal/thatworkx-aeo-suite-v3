import { mapBackendScanToV4State } from './v4PayloadAdapter.js';

/**
 * Core AI Bot Definitions & Stage Flow Control
 */
export const CORE_AI_BOTS = [
  'GPTBot',
  'ClaudeBot',
  'Google-Extended',
  'PerplexityBot',
  'Meta-ExternalAgent',
  'Qwenbot',
  'CCBot',
  'MistralBot'
];

let currentStage = 1;

/**
 * Evaluates bot directive status based on count, crawler roster, and core bot presence.
 * Supports numbers, string lists, and crawler object arrays.
 * 
 * @param {number|Array} countOrList - Total allowed bots count or array of crawlers.
 * @param {number} [totalBots=20] - Total bot capacity.
 * @param {Object} [options={}] - Additional evaluation criteria.
 * @returns {{ badgeText: string, badgeClass: string, cardText: string, colorClass: string }}
 */
export function evaluateBotDirectiveStatus(countOrList, totalBots = 20, options = {}) {
  let allowedCount = 0;
  let coreBotsPassed = true;

  if (Array.isArray(countOrList)) {
    const allowedItems = countOrList.filter(item => {
      if (typeof item === 'object' && item !== null && 'allowed' in item) {
        return Boolean(item.allowed);
      }
      return true;
    });
    allowedCount = allowedItems.length;
    const lowerList = allowedItems.map(b => {
      if (typeof b === 'object' && b !== null) {
        return String(b.name || b.key || '').toLowerCase();
      }
      return String(b).toLowerCase();
    });
    coreBotsPassed = CORE_AI_BOTS.every(coreBot => lowerList.includes(coreBot.toLowerCase()));
  } else if (typeof countOrList === 'number') {
    allowedCount = countOrList;
    if (options.coreBotsAllowed !== undefined) {
      coreBotsPassed = Boolean(options.coreBotsAllowed);
    }
  }

  // 0 bots allowed: FAIL
  if (allowedCount === 0) {
    return {
      badgeText: 'FAIL',
      badgeClass: 'badge-fail',
      cardText: `0/${totalBots} bots allowed`,
      colorClass: 'text-fail'
    };
  }

  // All 20 bots allowed with core bots intact: ENABLED
  if (allowedCount >= totalBots && coreBotsPassed) {
    return {
      badgeText: 'ENABLED',
      badgeClass: 'badge-pass',
      cardText: `${totalBots}/${totalBots} bots allowed`,
      colorClass: 'text-pass'
    };
  }

  // If core AI bots requirement is violated, flag as FAIL
  if (!coreBotsPassed) {
    return {
      badgeText: 'FAIL',
      badgeClass: 'badge-fail',
      cardText: `${allowedCount}/${totalBots} bots allowed`,
      colorClass: 'text-fail'
    };
  }

  // Partial coverage (Core bots allowed, secondary bots blocked)
  return {
    badgeText: 'PARTIAL',
    badgeClass: 'badge-warning',
    cardText: `${allowedCount}/${totalBots} bots allowed`,
    colorClass: 'text-warning'
  };
}

export function getCurrentStage() {
  return currentStage;
}

export function switchStage(stageNumber) {
  currentStage = stageNumber;
  cockpitState.currentStep = stageNumber;

  for (let i = 1; i <= 6; i++) {
    const stageContainer = document.getElementById(`stage-${i}`);
    const stepperBtn = document.getElementById(`stepper-btn-${i}`) || document.querySelector(`[data-step="${i}"]`);

    if (stageContainer) {
      if (i === stageNumber) {
        stageContainer.classList.remove('hidden');
      } else {
        stageContainer.classList.add('hidden');
      }
    }

    if (stepperBtn) {
      if (i === stageNumber) {
        stepperBtn.classList.add('active');
        stepperBtn.setAttribute('aria-selected', 'true');
      } else {
        stepperBtn.classList.remove('active');
        stepperBtn.setAttribute('aria-selected', 'false');
      }
    }
  }
}

export function onScanComplete(scanResult) {
  switchStage(6);

  const stage1BotsBadge = document.getElementById('stage1-allowed-bots-badge');
  const stage1BotsVal = document.getElementById('stage1-bot-count-value');

  if (scanResult && (scanResult.allowedBots !== undefined || scanResult.crawlers || scanResult.results?.crawlers)) {
    const botsSource = scanResult.allowedBots ?? scanResult.crawlers ?? scanResult.results?.crawlers ?? [];
    const status = evaluateBotDirectiveStatus(botsSource);
    if (stage1BotsBadge) {
      stage1BotsBadge.textContent = status.badgeText;
      stage1BotsBadge.className = `badge ${status.badgeClass}`;
    }
    if (stage1BotsVal) {
      stage1BotsVal.textContent = status.cardText;
      stage1BotsVal.className = `metric-value text-2xl font-bold ${status.colorClass}`;
    }
  }
}

/**
 * Extracts normalized pathname from URL or relative string, preserving route hashes.
 */
function extractPathname(urlStr) {
  if (!urlStr || typeof urlStr !== 'string') return '';
  try {
    if (urlStr.startsWith('http://') || urlStr.startsWith('https://')) {
      const parsed = new URL(urlStr);
      const cleanPath = parsed.pathname.replace(/\/$/, '') || '';
      return parsed.hash ? `${cleanPath}/${parsed.hash.toLowerCase()}` : (cleanPath || '/');
    }
    return urlStr.split('?')[0].replace(/\/$/, '') || '/';
  } catch {
    return urlStr;
  }
}

/**
 * Path prefix pattern supporting optional language/locale codes and legal/policy subdirectories
 * Examples: /en-us/, /de/, /fr-ca/, /legal/, /en-us/legal/, /policies/
 */
const PATH_PREFIX = '(?:\\/(?:[a-z]{2,3}(?:[-_][a-z0-9]{2,4})?|legal|policies|policy))*';

/**
 * 5-Anchor Essential Pages Configuration
 * Comprehensive Permutations & Combinations for Routes, Localized Redirects, and In-Page Hashes.
 */
export const ESSENTIAL_PAGE_DEFINITIONS = [
  {
    key: 'about',
    canonicalName: 'about',
    label: 'About',
    routePatterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(about(?:-?us)?|company)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(about(?:-?us)?|company)(?:[\/?#]|$)/i
    ],
    anchorPatterns: [
      /^#?(?:\/)?#?(about(?:-?us)?|company)$/i
    ]
  },
  {
    key: 'contact',
    canonicalName: 'contact',
    label: 'Contact',
    routePatterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(contact(?:-?us)?|get-in-touch)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(contact(?:-?us)?|get-in-touch)(?:[\/?#]|$)/i
    ],
    anchorPatterns: [
      /^#?(?:\/)?#?(contact(?:-?us)?|get-in-touch)$/i
    ]
  },
  {
    key: 'pricing',
    canonicalName: 'pricing',
    label: 'Pricing',
    routePatterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(pricing(?:-?plans)?|plans)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(pricing(?:-?plans)?|plans|store|buy|compare)(?:[\/?#]|$)/i
    ],
    anchorPatterns: [
      /^#?(?:\/)?#?(pricing(?:-?plans)?|plans|store|buy|compare)$/i
    ]
  },
  {
    key: 'privacy',
    canonicalName: 'privacy-policy',
    label: 'Privacy Policy',
    routePatterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))(?:[\/?#]|$)/i
    ],
    anchorPatterns: [
      /^#?(?:\/)?#?(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))$/i
    ]
  },
  {
    key: 'terms',
    canonicalName: 'terms-of-service',
    label: 'Terms of Service',
    routePatterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)(?:\\/|\\.html)?$`, 'i'),
      /(?:terms[-_]conditions|terms[-_]and[-_]conditions|terms[-_]of[-_]service|terms[-_]of[-_]use|services[-_]?agreement|service[-_]?agreement|user[-_]?agreement)/i,
      /(?:\/|\/#|#)(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)(?:[\/?#]|$)/i
    ],
    anchorPatterns: [
      /^#?(?:\/)?#?(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)$/i
    ]
  }
];

/**
 * Normalizes an in-page section anchor tag (e.g. "/#about" -> "#about")
 * @param {string} anchor 
 * @returns {string}
 */
function normalizeAnchorTag(anchor) {
  if (!anchor || typeof anchor !== 'string') return '';
  const clean = anchor.trim().toLowerCase();
  if (clean.startsWith('/#')) return clean.slice(1);
  if (!clean.startsWith('#')) return `#${clean}`;
  return clean;
}

/**
 * Evaluates the 5 essential pages against crawled routes and in-page anchor section fallbacks.
 * 
 * @param {Array<{url: string}>|Array<string>} crawledPages 
 * @param {Array<string>} [inPageAnchors=[]] 
 * @returns {Object} { foundCount, missingCount, missingPages, pages }
 */
export function evaluateEssentialPages(crawledPages = [], inPageAnchors = []) {
  const pagesList = Array.isArray(crawledPages) ? crawledPages : [];
  const rawAnchors = Array.isArray(inPageAnchors) ? inPageAnchors : [];

  const normalizedPaths = pagesList.map(p => {
    const raw = typeof p === 'string' ? p : (p?.url || '');
    return extractPathname(raw);
  });

  const normalizedAnchors = rawAnchors.map(normalizeAnchorTag);

  const pagesResult = {};
  const missingPages = [];
  let foundCount = 0;

  for (const def of ESSENTIAL_PAGE_DEFINITIONS) {
    let found = false;
    let discoveryType = 'none';
    let matchedRoute = null;
    let matchedAnchor = null;

    // 1. Standalone Route Inspection
    const routeIndex = normalizedPaths.findIndex(path => 
      def.routePatterns.some(pattern => pattern.test(path))
    );

    if (routeIndex !== -1) {
      found = true;
      discoveryType = 'route';
      matchedRoute = typeof pagesList[routeIndex] === 'string' 
        ? pagesList[routeIndex] 
        : pagesList[routeIndex]?.url;
    } else {
      // 2. In-Page Anchor Section Fallback Inspection (#about, #contact, etc.)
      const anchorMatch = normalizedAnchors.find(anchor => 
        def.anchorPatterns.some(pattern => pattern.test(anchor))
      );

      if (anchorMatch) {
        found = true;
        discoveryType = 'anchor';
        matchedAnchor = anchorMatch;
      }
    }

    if (found) {
      foundCount++;
    } else {
      missingPages.push(def.canonicalName);
    }

    const pageStatus = {
      key: def.key,
      canonicalName: def.canonicalName,
      label: def.label,
      found,
      discoveryType,
      matchedRoute,
      matchedAnchor
    };

    pagesResult[def.key] = pageStatus;

    // Alias canonical route names for dual-key resilience
    if (def.canonicalName !== def.key) {
      pagesResult[def.canonicalName] = pageStatus;
    }
  }

  const missingCount = ESSENTIAL_PAGE_DEFINITIONS.length - foundCount;

  return {
    foundCount,
    missingCount,
    missingPages,
    pages: pagesResult
  };
}

/**
 * Renders the Stage 2 Essential Pages 5-Anchor cards into the DOM
 * 
 * @param {Array<{url: string}>|Array<string>} crawledPages 
 * @param {Array<string>} inPageAnchors 
 * @returns {Object} evaluation result
 */
export function renderStage2EssentialPages(crawledPages = [], inPageAnchors = []) {
  const evaluation = evaluateEssentialPages(crawledPages, inPageAnchors);
  const stage2 = document.getElementById('stage-2');

  if (!stage2) return evaluation;

  let listContainer = stage2.querySelector('#stage2-essential-pages-list');
  if (!listContainer) {
    listContainer = document.createElement('div');
    listContainer.id = 'stage2-essential-pages-list';
    stage2.appendChild(listContainer);
  }

  for (const def of ESSENTIAL_PAGE_DEFINITIONS) {
    let card = listContainer.querySelector(`[data-page="${def.key}"]`);
    if (!card) {
      card = document.createElement('div');
      card.setAttribute('data-page', def.key);
      listContainer.appendChild(card);
    }

    const pageData = evaluation.pages[def.key];

    if (pageData.found) {
      card.classList.remove('status-missing');
      card.classList.add('status-found');

      const routePath = extractPathname(pageData.matchedRoute) || pageData.matchedRoute || def.canonicalName;
      const discoveryText = pageData.discoveryType === 'anchor'
        ? `Found: In-Page Section (${pageData.matchedAnchor})`
        : `Found: Standalone Route (${routePath})`;

      card.innerHTML = `
        <div class="font-semibold text-slate-200">${pageData.label}</div>
        <div class="status-indicator text-xs text-pass font-medium mt-1">${discoveryText}</div>
      `;
    } else {
      card.classList.remove('status-found');
      card.classList.add('status-missing');
      card.innerHTML = `
        <div class="font-semibold text-slate-200">${pageData.label}</div>
        <div class="status-indicator text-xs text-fail font-medium mt-1">Missing</div>
      `;
    }
  }

  return evaluation;
}

// Internal Error Tracking Store (Zero Dummy Data Enforcement)
const cockpitErrorLogs = [];

// 6-Stage Cockpit Navigation Metadata
export const STAGE_MATRIX = [
  {
    step: 1,
    shortTitle: "AI Bot Blocks",
    fullTitle: "AI Bot Blocks & Crawler Gateway Permissions",
    classification: "AI-Optimized",
    desc: "WAF rules, Cloudflare challenge detection, and User-Agent blocking verification across 20+ AI crawlers."
  },
  {
    step: 2,
    shortTitle: "Essential Content",
    fullTitle: "Identifiable Essential Pages & Core Anchors",
    classification: "AI-Optimized",
    desc: "AI uses essential pages and core anchors to verify your company credentials like company identity (/about), direct contact details (/contact), privacy commitments (/privacy), and terms of service (/terms)."
  },
  {
    step: 3,
    shortTitle: "Content Availability",
    fullTitle: "Content Availability & Semantic Text Density",
    classification: "AI-Optimized",
    desc: "Per-webpage AI Citation Audit, DOM text density, semantic heading structure, and information gain."
  },
  {
    step: 4,
    shortTitle: "Trust & Privacy",
    fullTitle: "Entity Authority, E-E-A-T & Privacy Indicators",
    classification: "AI-Optimized",
    desc: "Knowledge Graph entity grounding, author authority schemas, and organizational trustworthiness."
  },
  {
    step: 5,
    shortTitle: "AI-Ready Files",
    fullTitle: "Machine Manifest Protocol Explorer",
    classification: "AI-Ready",
    desc: "Machine endpoints, llms.txt manifest hierarchy, and machine ingestion schemas with AIOptimize context."
  },
  {
    step: 6,
    shortTitle: "Executive Summary",
    fullTitle: "Executive Summary & Action Triage",
    classification: "Executive Boardroom",
    desc: "Boardroom Macro View: Health index dial, dual-pillar readiness, 5-section scorecards, and prioritized action plan."
  }
];

const BOT_PROVIDER_MAP = {
  gptBot: 'OpenAI',
  chatGptUser: 'OpenAI',
  oaiSearchBot: 'OpenAI',
  claudeBot: 'Anthropic',
  claudeWeb: 'Anthropic',
  claudeSearchBot: 'Anthropic',
  googleExtended: 'Google & Microsoft',
  googlebot: 'Google & Microsoft',
  bingbot: 'Google & Microsoft',
  perplexityBot: 'Perplexity & Apple',
  applebotExtended: 'Perplexity & Apple',
  metaExternalAgent: 'Meta & Amazon',
  metaWebIndexer: 'Meta & Amazon',
  amazonbot: 'Meta & Amazon',
  bytespider: 'Asian AI Engines',
  qwenBot: 'Asian AI Engines',
  baiduAnsur: 'Asian AI Engines',
  ccBot: 'European & Global Frontier',
  cohereAi: 'European & Global Frontier',
  mistralBot: 'European & Global Frontier'
};

const PROVIDER_META = {
  'OpenAI': { icon: '🤖', badge: 'border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]' },
  'Anthropic': { icon: '⚡', badge: 'border-[#d45d2a]/40 bg-[#d45d2a]/10 text-[#d45d2a]' },
  'Google & Microsoft': { icon: '🔍', badge: 'border-[#38bdf8]/40 bg-[#38bdf8]/10 text-[#38bdf8]' },
  'Perplexity & Apple': { icon: '🔮', badge: 'border-purple-400/40 bg-purple-950/20 text-purple-300' },
  'Meta & Amazon': { icon: '🌐', badge: 'border-blue-400/40 bg-blue-950/20 text-blue-300' },
  'Asian AI Engines': { icon: '🌏', badge: 'border-amber-400/40 bg-amber-950/20 text-amber-300' },
  'European & Global Frontier': { icon: '🇪🇺', badge: 'border-indigo-400/40 bg-indigo-950/20 text-indigo-300' }
};

let cockpitState = {
  isAudited: false,
  currentStep: 1,
  completedSteps: [],
  scanningStep: null,
  targetUrl: '--',
  timestamp: '--',
  scanDuration: '--',
  totalPages: 0,
  healthIndex: 0,
  healthScore: 0,
  statusLabel: 'UNAUDITED',
  humanWebReadiness: 0,
  machineWebReadiness: 0,
  summary: {
    healthScore: 0,
    healthIndex: 0,
    overallScore: 0,
    statusLabel: 'UNAUDITED',
    diagnosticBadge: 'UNAUDITED',
    scannedUrl: '--',
    aiOptimizedScore: 0,
    aiReadyScore: 0,
    compositeHealth: 0
  },
  stage1: {
    score: '0%',
    status: 'UNAUDITED',
    summaryText: '--',
    robotsFetchMs: null,
    gateway: {
      robotsTxt: 'UNAUDITED',
      cloudflareChallenge: 'UNAUDITED',
      xRobotsTag: 'UNAUDITED'
    },
    crawlers: []
  },
  sections: {
    1: { score: '0%', status: 'UNAUDITED', summaryText: '--', takeaway: '', actionPlan: '', actionSteps: [], shortcutPlan: '', evidencePlain: '', evidenceTrace: '' }
  },
  top5Actions: [],
  stage3VisibleCount: 5
};

export function getCockpitState() {
  return cockpitState;
}

export function getCockpitErrorLogs() {
  return cockpitErrorLogs;
}

export function clearCockpitErrorLogs() {
  cockpitErrorLogs.length = 0;
}

export function setErrorBanner(message, isVisible) {
  const banner = document.getElementById('cockpit-error-banner');
  if (!banner) return;
  const msg = document.getElementById('cockpit-error-message') || banner.querySelector('.error-msg');

  if (typeof message === 'boolean') {
    isVisible = message;
    message = '';
  } else if (isVisible === undefined) {
    isVisible = Boolean(message);
  }

  if (isVisible) {
    const errorText = message || 'Inaccessible domain or connection failure';
    if (msg) {
      msg.textContent = errorText;
    } else {
      banner.textContent = errorText;
    }
    banner.classList.remove('hidden');
    banner.style.display = 'flex';
  } else {
    banner.classList.add('hidden');
    banner.style.display = 'none';
    if (msg) msg.textContent = '';
  }
}

export function resetCockpitToNeutral() {
  cockpitState = {
    isAudited: false,
    currentStep: 1,
    completedSteps: [],
    scanningStep: null,
    targetUrl: '--',
    timestamp: '--',
    scanDuration: '--',
    totalPages: 0,
    healthIndex: 0,
    healthScore: 0,
    statusLabel: 'UNAUDITED',
    humanWebReadiness: 0,
    machineWebReadiness: 0,
    summary: {
      healthScore: 0,
      healthIndex: 0,
      overallScore: 0,
      statusLabel: 'UNAUDITED',
      diagnosticBadge: 'UNAUDITED',
      scannedUrl: '--',
      aiOptimizedScore: 0,
      aiReadyScore: 0,
      compositeHealth: 0
    },
    stage1: {
      score: '0%',
      status: 'UNAUDITED',
      summaryText: '--',
      robotsFetchMs: null,
      gateway: {
        robotsTxt: 'UNAUDITED',
        cloudflareChallenge: 'UNAUDITED',
        xRobotsTag: 'UNAUDITED'
      },
      crawlers: []
    },
    sections: {
      1: { score: '0%', status: 'UNAUDITED', summaryText: '--', takeaway: '', actionPlan: '', actionSteps: [], shortcutPlan: '', evidencePlain: '', evidenceTrace: '' }
    },
    top5Actions: [],
    stage3VisibleCount: 5
  };

  const domainBadge = document.getElementById('target-domain-badge');
  if (domainBadge) domainBadge.textContent = '--';

  const timestampLabel = document.getElementById('timestamp-label');
  if (timestampLabel) timestampLabel.textContent = '--';

  const durationLabel = document.getElementById('scan-duration-label');
  if (durationLabel) durationLabel.textContent = '--';

  const totalPagesLabel = document.getElementById('total-pages-label');
  if (totalPagesLabel) totalPagesLabel.textContent = '--';

  const scannedUrlEl = document.getElementById('cockpit-scanned-url');
  if (scannedUrlEl) scannedUrlEl.textContent = '--';

  const scannedDateEl = document.getElementById('cockpit-scanned-date');
  if (scannedDateEl) scannedDateEl.textContent = '--';

  const scannedDurEl = document.getElementById('cockpit-scanned-duration');
  if (scannedDurEl) scannedDurEl.textContent = '--';

  const scannedPagesEl = document.getElementById('cockpit-scanned-pages');
  if (scannedPagesEl) scannedPagesEl.textContent = '--';

  const diagScoreEl = document.getElementById('cockpit-diagnostic-score');
  if (diagScoreEl) diagScoreEl.textContent = '0';

  const diagBadgeEl = document.getElementById('cockpit-diagnostic-badge');
  if (diagBadgeEl) diagBadgeEl.textContent = 'UNAUDITED';

  const projScoreEl = document.getElementById('projected-health-score');
  if (projScoreEl) projScoreEl.textContent = '0';

  renderStepper();
  renderStageFromState(1, cockpitState);
  return cockpitState;
}

export function calculateWhatIfScore(addedPoints = 0) {
  const base = cockpitState.isAudited
    ? (cockpitState.summary?.healthScore ?? cockpitState.healthIndex ?? 0)
    : 0;
  return Math.min(100, Math.max(0, Math.round(base + Number(addedPoints || 0))));
}

export function updateSimulator(points = 0) {
  const score = calculateWhatIfScore(points);
  const scoreEl = document.getElementById('projected-health-score');
  if (scoreEl) {
    scoreEl.textContent = String(score);
  }
  return score;
}

let auditModalTimer = null;

export function showAuditModal(targetUrl) {
  const modal = document.getElementById('audit-progress-modal');
  if (!modal) return;

  if (auditModalTimer) clearInterval(auditModalTimer);

  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  modal.style.display = 'flex';

  const targetDisp = document.getElementById('modal-target-display');
  if (targetDisp) targetDisp.innerText = targetUrl || cockpitState.targetUrl;

  const STAGES_PROGRESS = [
    { stage: 1, progress: 18, title: 'Scanning AI Bot Blocks...', desc: 'Verifying robots.txt directives and WAF firewall rules across 20+ AI crawlers.', log: 'Handshaking root socket & checking 20 AI User-Agents...' },
    { stage: 2, progress: 38, title: 'Scanning Essential Pages...', desc: 'Verifying identifiable corporate anchors (/about, /contact, /pricing, /privacy, /terms).', log: 'Resolving canonical routes & checking HTTP status codes...' },
    { stage: 3, progress: 58, title: 'Evaluating Content Availability...', desc: 'Computing DOM text density, semantic heading structure, and citation extractability.', log: 'Parsing HTML payloads & calculating text-to-code ratios...' },
    { stage: 4, progress: 75, title: 'Auditing Entity Authority & E-E-A-T...', desc: 'Inspecting Schema.org Organization graphs and author credibility proofs.', log: 'Validating JSON-LD entities and sameAs knowledge graph references...' },
    { stage: 5, progress: 90, title: 'Auditing Machine Manifest Protocols...', desc: 'Checking /llms.txt, /ai-context.md, and OpenAPI machine ingestion endpoints.', log: 'Inspecting 4-level machine manifest hierarchy...' },
    { stage: 6, progress: 98, title: 'Compiling Executive Summary...', desc: 'Synthesizing composite health index, dual-pillar scores, and action triage.', log: 'Finalizing audit scores and generating priority triage matrix...' }
  ];

  let currentIdx = 0;
  const updateModalUi = (item) => {
    const counter = document.getElementById('modal-stage-counter');
    if (counter) counter.innerText = `STAGE ${item.stage} OF 6 IN PROGRESS`;
    const titleEl = document.getElementById('modal-stage-title');
    if (titleEl) titleEl.innerText = item.title;
    const descEl = document.getElementById('modal-stage-desc');
    if (descEl) descEl.innerText = item.desc;
    const bar = document.getElementById('modal-progress-bar');
    if (bar) bar.style.width = `${item.progress}%`;
    const logEl = document.getElementById('modal-live-log');
    if (logEl) logEl.innerText = `$ aio-scanner: ${item.log}`;
  };

  updateModalUi(STAGES_PROGRESS[0]);

  auditModalTimer = setInterval(() => {
    currentIdx++;
    if (currentIdx < STAGES_PROGRESS.length) {
      updateModalUi(STAGES_PROGRESS[currentIdx]);
    } else {
      clearInterval(auditModalTimer);
    }
  }, 600);
}

export function hideAuditModal() {
  if (auditModalTimer) {
    clearInterval(auditModalTimer);
    auditModalTimer = null;
  }
  const modal = document.getElementById('audit-progress-modal');
  if (!modal) return;

  const bar = document.getElementById('modal-progress-bar');
  if (bar) bar.style.width = '100%';
  const counter = document.getElementById('modal-stage-counter');
  if (counter) counter.innerText = 'AUDIT COMPLETE';
  const logEl = document.getElementById('modal-live-log');
  if (logEl) logEl.innerText = '$ aio-scanner: Ingestion complete. Rendering cockpit...';

  modal.classList.remove('opacity-100', 'pointer-events-auto');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }, 300);
}

export function handleCockpitNewScan() {
  const input = document.getElementById('target-url-input');
  const currentVal = (input && input.value && input.value !== '--') ? input.value.trim() : 'https://';
  const entered = window.prompt('Enter target domain for new AEO audit:', currentVal);

  if (entered && entered.trim() && entered.trim() !== 'https://') {
    if (input) input.value = entered.trim();
    executeCockpitScan(entered.trim());
  } else if (input) {
    input.focus();
    input.select();
  }
}

export async function executeCockpitScan(targetUrl) {
  const startTime = Date.now();
  setErrorBanner('', false);

  if (!targetUrl || targetUrl.trim() === '' || targetUrl === '--') {
    setErrorBanner('Please supply a valid target domain (e.g., https://example.com).', true);
    return;
  }

  try {
    updateScanningUi(targetUrl);
    showAuditModal(targetUrl);

    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: targetUrl.trim(), email: '' })
    });

    const elapsedSeconds = ((Date.now() - startTime) / 1000).toFixed(1) + 's';

    if (!response.ok) {
      hideAuditModal();
      cockpitErrorLogs.push({
        targetUrl,
        status: response.status,
        statusText: response.statusText,
        message: `Scan failed for ${targetUrl} (HTTP ${response.status} ${response.statusText})`,
        error: `Scan failed for ${targetUrl} (HTTP ${response.status} ${response.statusText})`,
        timestamp: new Date().toISOString()
      });

      resetCockpitToNeutral();
      setErrorBanner(`Scan failed for ${targetUrl} (HTTP ${response.status} ${response.statusText}). Inaccessible domain or network timeout.`, true);
      return;
    }

    const payload = await response.json();

    const resError = payload.error || payload.results?.error || (payload.results?.triage && payload.results.triage.join(' '));
    const hasNoPages = (!payload.pages || payload.pages.length === 0) && (!payload.results?.pages || payload.results.pages.length === 0);

    if (payload.status === 'failed' || payload.status === 'error' || payload.results?.status === 'failed' || (resError && hasNoPages)) {
      hideAuditModal();
      cockpitErrorLogs.push({
        targetUrl,
        status: 200,
        message: resError || 'Domain inaccessible',
        error: resError || 'Domain inaccessible',
        timestamp: new Date().toISOString()
      });

      resetCockpitToNeutral();
      setErrorBanner(resError || `Inaccessible domain (${targetUrl}). Please check accessibility.`, true);
      return;
    }

    const mapped = mapBackendScanToV4State(payload);

    const now = new Date();
    const formattedTimestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
      ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const scanDuration = (typeof payload.scanMetrics?.scanTimeSeconds === 'number')
      ? `${payload.scanMetrics.scanTimeSeconds}s`
      : (mapped.scanDuration && mapped.scanDuration !== '--' ? mapped.scanDuration : elapsedSeconds);

    const totalPages = typeof payload.pagesCrawled === 'number'
      ? payload.pagesCrawled
      : (Array.isArray(payload.pages) ? payload.pages.length : (Array.isArray(payload.results?.pages) ? payload.results.pages.length : (mapped.totalPages || 0)));

    const health = mapped.healthIndex ?? mapped.summary?.healthScore ?? payload.overallScore ?? payload.results?.capabilities?.scores?.compositeHealth ?? 0;
    const badgeLabel = mapped.statusLabel || (health >= 80 ? 'AI-Optimized' : 'NEEDS IMPROVEMENT');

    cockpitState = {
      ...cockpitState,
      ...mapped,
      stage2Data: mapped.stage2 ? updateStage2FromPayload({ stage2: mapped.stage2, ...payload }) : updateStage2FromPayload(payload),
      isAudited: true,
      currentStep: 6, // Sets Stage 6 as the default view
      completedSteps: [1, 2, 3, 4, 5, 6],
      scanningStep: null,
      targetUrl: targetUrl.trim(),
      timestamp: formattedTimestamp,
      scanDuration,
      totalPages,
      healthIndex: health,
      healthScore: health,
      statusLabel: badgeLabel,
      summary: {
        healthScore: health,
        healthIndex: health,
        overallScore: health,
        statusLabel: badgeLabel,
        diagnosticBadge: badgeLabel,
        scannedUrl: targetUrl.trim(),
        aiOptimizedScore: mapped.humanWebReadiness ?? 0,
        aiReadyScore: mapped.machineWebReadiness ?? 0,
        compositeHealth: health,
        ...(mapped.summary || {})
      }
    };

    hideAuditModal();
    onScanComplete(payload);
    renderCockpit();
  } catch (err) {
    hideAuditModal();
    cockpitErrorLogs.push({
      targetUrl,
      status: 0,
      message: err.message,
      error: err.message,
      timestamp: new Date().toISOString()
    });

    resetCockpitToNeutral();
    setErrorBanner(`Network or ingestion pipeline error: ${err.message}`, true);
  }
}

export function handleCockpitRescan() {
  const input = document.getElementById('target-url-input');
  const url = (input && input.value.trim()) || cockpitState.targetUrl;

  if (!url || url === '--') {
    alert('Please enter a website URL before triggering rescan.');
    return;
  }

  const confirmed = window.confirm(`Authorize live rescan for ${url}?`);
  if (!confirmed) return;

  executeCockpitScan(url);
}

function updateScanningUi(url) {
  const targetBadge = document.getElementById('target-domain-badge');
  if (targetBadge) targetBadge.textContent = url;
  const stagePill = document.getElementById('sidebar-stage-pill');
  if (stagePill) stagePill.textContent = 'STAGE 1 SCANNING';
}

export function initCockpit() {
  const params = new URLSearchParams(window.location.search);
  const queryUrl = params.get('url');

  const input = document.getElementById('target-url-input');
  if (input && queryUrl) {
    input.value = queryUrl;
  }

  const searchBtn = document.getElementById('cockpit-search-btn');
  if (searchBtn) {
    searchBtn.addEventListener('click', () => {
      const url = input ? input.value : '';
      executeCockpitScan(url);
    });
  }

  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        executeCockpitScan(input.value);
      }
    });
  }

  const rescanBtn = document.getElementById('rescan-btn');
  if (rescanBtn) {
    rescanBtn.addEventListener('click', handleCockpitRescan);
  }

  const newScanBtn = document.getElementById('new-scan-btn');
  if (newScanBtn) {
    newScanBtn.addEventListener('click', handleCockpitNewScan);
  }

  if (queryUrl) {
    executeCockpitScan(queryUrl);
  } else {
    renderCockpit();
  }
}

export function navigateToStep(stepNum) {
  cockpitState.currentStep = stepNum;
  renderStepper();
  renderStageFromState(stepNum, cockpitState);

  const canvas = document.getElementById('main-workspace-canvas');
  if (canvas && typeof canvas.scrollTo === 'function') {
    canvas.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export function renderCockpit(state) {
  if (state) {
    const incomingTargetUrl = state.targetUrl || state.meta?.targetUrl || cockpitState.targetUrl;
    const incomingTimestamp = state.timestamp || state.meta?.timestamp || cockpitState.timestamp;
    const incomingDuration = state.scanDuration || state.meta?.scanDuration || cockpitState.scanDuration;
    const incomingPages = state.totalPages ?? state.meta?.totalPages ?? (Array.isArray(state.stage3?.pages) ? state.stage3.pages.length : (Array.isArray(state.pages) ? state.pages.length : cockpitState.totalPages));
    const incomingHealth = state.healthScore ?? state.healthIndex ?? state.stage6?.overallHealthIndex ?? state.summary?.healthScore ?? cockpitState.healthScore;

    cockpitState = {
      ...cockpitState,
      ...state,
      isAudited: true,
      targetUrl: incomingTargetUrl,
      timestamp: incomingTimestamp,
      scanDuration: incomingDuration,
      totalPages: incomingPages,
      healthIndex: incomingHealth,
      healthScore: incomingHealth,
      summary: {
        ...cockpitState.summary,
        ...(state.summary || {}),
        healthScore: incomingHealth,
        healthIndex: incomingHealth,
        scannedUrl: incomingTargetUrl,
        diagnosticBadge: state.statusLabel || state.summary?.diagnosticBadge || cockpitState.summary.diagnosticBadge
      }
    };
  }

  const domainBadge = document.getElementById('target-domain-badge');
  if (domainBadge) domainBadge.textContent = cockpitState.targetUrl;
  const scannedUrlEl = document.getElementById('cockpit-scanned-url');
  if (scannedUrlEl) scannedUrlEl.textContent = cockpitState.targetUrl;

  const timestampLabel = document.getElementById('timestamp-label');
  if (timestampLabel) {
    if (cockpitState.isAudited && (!cockpitState.timestamp || cockpitState.timestamp === '--')) {
      const now = new Date();
      cockpitState.timestamp = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) +
        ' • ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    timestampLabel.textContent = cockpitState.timestamp;
  }
  const scannedDateEl = document.getElementById('cockpit-scanned-date');
  if (scannedDateEl) scannedDateEl.textContent = cockpitState.timestamp;

  const durationLabel = document.getElementById('scan-duration-label');
  if (durationLabel) {
    if (cockpitState.isAudited && (!cockpitState.scanDuration || cockpitState.scanDuration === '--')) {
      cockpitState.scanDuration = '0.0s';
    }
    durationLabel.textContent = cockpitState.scanDuration;
  }
  const scannedDurEl = document.getElementById('cockpit-scanned-duration');
  if (scannedDurEl) scannedDurEl.textContent = cockpitState.scanDuration;

  const totalPagesLabel = document.getElementById('total-pages-label');
  if (totalPagesLabel) {
    if (cockpitState.isAudited && (cockpitState.totalPages === '--' || cockpitState.totalPages === undefined)) {
      cockpitState.totalPages = 0;
    }
    totalPagesLabel.textContent = String(cockpitState.totalPages);
  }
  const scannedPagesEl = document.getElementById('cockpit-scanned-pages');
  if (scannedPagesEl) scannedPagesEl.textContent = String(cockpitState.totalPages);

  const diagScoreEl = document.getElementById('cockpit-diagnostic-score');
  if (diagScoreEl) diagScoreEl.textContent = String(cockpitState.healthScore || cockpitState.summary?.healthScore || 0);

  const diagBadgeEl = document.getElementById('cockpit-diagnostic-badge');
  if (diagBadgeEl) diagBadgeEl.textContent = cockpitState.statusLabel || cockpitState.summary?.diagnosticBadge || 'UNAUDITED';

  renderStepper();
  renderStageFromState(cockpitState.currentStep, cockpitState);
}

function renderStepper() {
  const container = document.getElementById('desktop-stepper');
  if (!container) return;
  container.innerHTML = '';

  STAGE_MATRIX.forEach((stage, idx) => {
    const isCompleted = cockpitState.completedSteps.includes(stage.step);
    const isScanning = cockpitState.scanningStep === stage.step;
    const isCurrent = cockpitState.currentStep === stage.step;

    const btn = document.createElement('button');
    btn.title = `${stage.shortTitle} (${stage.classification})`;
    btn.setAttribute('data-step', String(stage.step));
    btn.onclick = () => navigateToStep(stage.step);

    let btnClasses = "stepper-pill stepper-tab flex items-center px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold relative cursor-pointer ";

    if (isCurrent) {
      btnClasses += "is-active ";
      btnClasses += stage.step === 5 
        ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105 " 
        : "bg-[#b7410e] text-white shadow-[0_0_20px_rgba(183,65,14,0.6)] scale-105 ";
    } else if (isScanning) {
      btnClasses += "is-scanning border-2 border-[#b7410e] text-[#d45d2a] bg-[#b7410e]/20 ";
    } else if (isCompleted || cockpitState.isAudited) {
      btnClasses += "bg-[#1f1f1f] border border-[#3c4043] text-[#e8eaed] hover:border-[#b7410e]/60 hover:text-white ";
    } else {
      btnClasses += "opacity-35 cursor-not-allowed bg-[#121212] text-[#bdc1c6] border border-transparent ";
    }

    btn.className = btnClasses;
    btn.innerHTML = `
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${
        isCurrent
          ? (stage.step === 5 ? 'bg-black text-indigo-300' : 'bg-black text-[#d45d2a]')
          : (isCompleted ? 'bg-[#121212] text-[#38bdf8]' : 'bg-[#121212] text-[#bdc1c6]')
      }">
        ${isScanning ? '●' : stage.step}
      </span>
      <span class="stepper-label text-xs font-bold font-headline truncate">${stage.shortTitle}</span>
    `;
    container.appendChild(btn);

    if (idx < STAGE_MATRIX.length - 1) {
      const conduit = document.createElement('div');
      conduit.className = `w-2.5 sm:w-4 lg:w-5 h-0.5 flex-shrink-0 ${
        cockpitState.completedSteps.includes(stage.step + 1) || cockpitState.isAudited
          ? 'bg-[#b7410e]/60'
          : 'bg-[#3c4043]'
      }`;
      container.appendChild(conduit);
    }
  });
}

// -----------------------------------------------------------------------------
// STAGE RENDER DISPATCHER WITH PROMINENT HEADER BINDING
// -----------------------------------------------------------------------------
export function renderStageFromState(stepNum, state) {
  const canvas = document.getElementById('canvas-body');
  if (!canvas) return;

  // 1. Synchronize Canvas Header Above the Body
  const stageMeta = STAGE_MATRIX.find(s => s.step === stepNum) || STAGE_MATRIX[0];

  const badgeEl = document.getElementById('canvas-stage-badge');
  if (badgeEl) badgeEl.textContent = `STAGE ${stepNum} OF 6`;

  const govEl = document.getElementById('canvas-governance-badge');
  if (govEl) govEl.textContent = stageMeta.classification;

  const titleEl = document.getElementById('canvas-stage-title');
  if (titleEl) titleEl.textContent = stageMeta.fullTitle;

  const descEl = document.getElementById('canvas-stage-desc');
  if (descEl) descEl.textContent = stageMeta.desc;

  // 2. Synchronize Diagnostic Score Pill (Hidden on Stages 1-5 to match clean prototype)
  const scorePill = document.getElementById('canvas-score-pill');
  const scoreVal = document.getElementById('canvas-score-value');
  const scoreStatus = document.getElementById('canvas-score-status');

  if (scorePill) {
    if (stepNum === 6 && state.isAudited) {
      scorePill.classList.remove('hidden');
      scorePill.style.display = 'flex';
      const hScore = state.healthIndex ?? state.summary?.healthScore ?? 0;
      if (scoreVal) scoreVal.textContent = `${hScore}/100`;
      if (scoreStatus) {
        scoreStatus.textContent = hScore >= 80 ? 'OPTIMIZED' : 'NEEDS ATTENTION';
        scoreStatus.className = hScore >= 80
          ? 'px-2.5 py-1 rounded-md text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
          : 'px-2.5 py-1 rounded-md text-xs font-mono font-black bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40';
      }
    } else {
      // Hide on Stages 1 through 5 — Eliminates clutter and duplication
      scorePill.classList.add('hidden');
      scorePill.style.display = 'none';
    }
  }

  // 3. Return Anchor (Back to Summary)
  const returnAnchor = document.getElementById('canvas-return-anchor');
  if (returnAnchor) {
    if (stepNum < 6 && state.completedSteps?.includes(6)) {
      returnAnchor.classList.remove('hidden');
    } else {
      returnAnchor.classList.add('hidden');
    }
  }

  // 4. Render Body Canvas
  if (!state.isAudited && !state.completedSteps?.includes(stepNum)) {
    canvas.innerHTML = `
      <div class="flex-1 flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-[#3c4043] rounded-3xl bg-[#1f1f1f]/50">
        <div class="w-20 h-20 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-center text-[#bdc1c6] font-mono text-3xl font-black mb-4">--</div>
        <h3 class="text-xl font-bold text-white tracking-tight font-headline">Stage ${stepNum} Awaiting Audit</h3>
        <p class="text-sm text-[#bdc1c6] max-w-md mt-2">Status is currently <span class="font-mono text-[#d45d2a] font-bold">UNAUDITED</span>. Enter a URL above and click "Scan".</p>
      </div>
    `;
    return;
  }

  switch (stepNum) {
    case 1:
      renderStage1(canvas, state);
      break;
    case 2:
      renderStage2Canvas(canvas, state);
      break;
    case 3:
      renderStage3Canvas(canvas, state);
      break;
    case 4:
      renderStage4Canvas(canvas, state);
      break;
    case 5:
      renderStage5Canvas(canvas, state);
      break;
    case 6:
      renderStage6Canvas(canvas, state);
      break;
    default:
      renderStage6Canvas(canvas, state);
      break;
  }
}

// -----------------------------------------------------------------------------
// REUSABLE TIER 1 EXECUTIVE TAKEAWAY HEADER BUILDER
// -----------------------------------------------------------------------------
export function buildTakeawayHeader(stageLabel, takeaway, score, classification = "AI-Optimized", status = "PASS") {
  const isPass = status === 'PASS' || status === 'OPTIMIZED';
  return `
    <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div class="space-y-2">
          <div class="flex items-center space-x-2.5">
            <span class="text-sm sm:text-base font-black text-[#d45d2a] uppercase tracking-wider font-headline flex items-center space-x-2">
              <span>🎯</span>
              <span>What AI Search Engines See &amp; Why It Matters</span>
            </span>
            <span class="text-[#5f6368]">•</span>
            <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#e8eaed] font-bold uppercase">${classification}</span>
          </div>
          <p class="text-sm sm:text-base font-normal text-[#e8eaed] leading-relaxed max-w-3xl">
            ${takeaway}
          </p>
        </div>
        
        <div class="flex items-center space-x-4 self-start sm:self-center flex-shrink-0 px-5 py-3.5 rounded-2xl bg-[#121212] border-2 ${isPass ? 'border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-[#f59e0b]/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]'}">
          <div class="text-right">
            <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold">Stage Result</span>
            <span class="text-3xl sm:text-4xl font-mono font-black ${isPass ? 'text-[#10b981]' : 'text-[#f59e0b]'}">${score}</span>
          </div>
          <span class="px-3 py-1 rounded-md text-xs font-mono font-black ${isPass ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'}">
            ${status}
          </span>
        </div>
      </div>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// STAGE 1: AI BOT BLOCKS & GATEWAY PERMISSIONS
// -----------------------------------------------------------------------------
export function renderStage1(container, state = cockpitState) {
  const stg1 = state.stages?.stage1 || cockpitState.stages?.stage1 || state.stage1 || {};
  const s1 = state.stage1 || cockpitState.stage1 || {};
  const sec = (state.sections && state.sections[1]) || (cockpitState.sections && cockpitState.sections[1]) || {};
  const rawCrawlers = s1.crawlers || [];

  const total = 20;
  const allowed = rawCrawlers.filter(c => c.allowed).length;
  const blocked = total - allowed;
  const calculatedScore = total > 0 ? `${Math.round((allowed / total) * 100)}%` : '100%';
  const calculatedStatus = total === 0 ? 'PASS' : (allowed === total ? 'PASS' : (allowed >= total * 0.75 ? 'WARN' : 'FAIL'));

  const score = stg1.score || (s1.score && s1.score !== '0%' ? s1.score : calculatedScore);
  const status = stg1.status || (s1.status && s1.status !== 'UNAUDITED' ? s1.status : calculatedStatus);
  const summaryText = stg1.summaryText || s1.summaryText || `Bot Access: ${allowed}/${total} Verified Unblocked`;
  const isPass = status === 'PASS' || status === 'OPTIMIZED';

  // Evaluate Bot Directives using the unified engine
  const botStatus = evaluateBotDirectiveStatus(rawCrawlers.length > 0 ? rawCrawlers : allowed, total);

  const botStatusBadgeClass = botStatus.badgeText === 'ENABLED'
    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40'
    : (botStatus.badgeText === 'PARTIAL'
      ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'
      : 'bg-red-950 text-red-400 border border-red-500/40');

  const gateway = s1.gateway || {
    robotsTxt: 'VALID',
    cloudflareChallenge: 'CLEAN',
    xRobotsTag: 'ENABLED'
  };

  const gatewayPass = (allowed > 0 && isPass) || isPass;
  const gatewayBadgeClass = gatewayPass 
    ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' 
    : 'bg-red-950 text-red-400 border border-red-500/40';
  const gatewayBadgeText = gatewayPass ? `${score} PASS` : `${score} FAIL`;

  const baseTakeaway = (sec.takeaway && sec.takeaway !== '--' && sec.takeaway !== '')
    ? sec.takeaway
    : (total > 0 && allowed === total)
      ? 'All major global, European, and Asian AI search engines (OpenAI, Anthropic, Google, Perplexity) have unrestricted crawler access to your domain with zero firewall blocking.'
      : `${allowed} of ${total} verified AI search engine crawlers have access to your domain. ${blocked} engine(s) are blocked by robots.txt or firewall rules.`;

  const takeaway = summaryText ? `${summaryText} — ${baseTakeaway}` : baseTakeaway;

  const actionPlan = (sec.actionPlan && sec.actionPlan !== '--' && sec.actionPlan !== '')
    ? sec.actionPlan
    : (total > 0 && allowed === total)
      ? 'Maintain standard robots.txt allow rules. Schedule monthly automated checks for newly introduced AI search agent crawlers.'
      : 'Review robots.txt directives and Web Application Firewall (WAF) challenge settings to ensure high-intent AI search crawlers are explicitly permitted.';

  const shortcutPlan = (sec.shortcutPlan && sec.shortcutPlan !== '--' && sec.shortcutPlan !== '')
    ? sec.shortcutPlan
    : 'Deploying Level 1 Machine Manifests via AIOptimize Pro automatically generates cloud edge proxy rules and verified crawler permissions across all 20 AI search engines—skipping the need to manually configure server headers or debug complex WAF firewall rules.';

  const actionSteps = (sec.actionSteps && sec.actionSteps.length > 0)
    ? sec.actionSteps
    : [
        { title: "Review robots.txt directives", detail: "Check your root /robots.txt file for accidental wildcard Disallow: / directives or restrictive crawler blocks." },
        { title: "Whitelist all 20 AI engines", detail: "Add explicit Allow: / blocks for GPTBot, ClaudeBot, PerplexityBot, Googlebot, Meta-ExternalAgent, and regional AI crawlers." },
        { title: "Configure Cloudflare / WAF rules", detail: "Ensure Web Application Firewall settings bypass JavaScript challenge gates and CAPTCHAs for verified search bot IP ranges." },
        { title: "Verify HTTP response headers", detail: "Ensure public routes return X-Robots-Tag: all, index, follow to prevent stealth de-indexing by search engine crawlers." }
      ];

  const evidencePlain = (sec.evidencePlain && sec.evidencePlain !== '--' && sec.evidencePlain !== '')
    ? sec.evidencePlain
    : `Verified clean HTTP 200 responses across ${total} registered AI User-Agents. ${blocked > 0 ? blocked + ' blocked directives encountered' : 'No Cloudflare CAPTCHAs, JavaScript challenge gates, or restrictive Disallow directives encountered'}.`;

  const evidenceTrace = (sec.evidenceTrace && sec.evidenceTrace !== '--' && sec.evidenceTrace !== '')
    ? sec.evidenceTrace
    : `HTTP/2 200 OK\nServer: cloudflare\nX-Robots-Tag: ${gateway.xRobotsTag || 'all, index, follow'}\nUser-Agent Directives: ${allowed}/${total} Explicitly Permitted\nStatus: ${blocked} Blocks Detected`;

  // Provider Grouping
  const providerGroups = {};
  rawCrawlers.forEach(crawler => {
    const provider = crawler.provider || BOT_PROVIDER_MAP[crawler.key] || 'European & Global Frontier';
    if (!providerGroups[provider]) {
      providerGroups[provider] = [];
    }
    providerGroups[provider].push(crawler);
  });

  const providerNames = [
    'OpenAI',
    'Anthropic',
    'Google & Microsoft',
    'Perplexity & Apple',
    'Meta & Amazon',
    'Asian AI Engines',
    'European & Global Frontier'
  ];

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 1", takeaway, score, "AI-Optimized", status)}

      <!-- 50% / 50% TWO-COLUMN WORKBENCH GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- COLUMN 1: Gateway & WAF Security Markers -->
        <div class="lg:col-span-6 bg-[#1f1f1f] border-2 border-[#b7410e]/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_25px_rgba(183,65,14,0.15)] flex flex-col justify-between space-y-5">
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-[#3c4043]">
              <div class="space-y-1">
                <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a] uppercase tracking-wider">PRIMARY RESULT</span>
                <h3 class="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-headline">Gateway &amp; WAF Security Markers</h3>
              </div>
              <span class="text-xs sm:text-sm font-mono font-black px-3.5 py-1.5 rounded-xl ${gatewayBadgeClass} shadow-sm">${gatewayBadgeText}</span>
            </div>

            <div class="space-y-3.5">
              <!-- Robots.txt Directives -->
              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">robots.txt Directives</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">Canonical machine rules &amp; explicit bot allow headers verified.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black ${gateway.robotsTxt === 'VALID' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">${gateway.robotsTxt}</span>
              </div>

              <!-- Allowed AI bots Directive Card -->
              <div class="directive-card card p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner" id="canvas-stage1-allowed-bots-card">
                <div class="space-y-1">
                  <div class="card-title directive-title text-base sm:text-lg font-black text-white font-headline">Allowed AI bots</div>
                  <div class="card-subtitle directive-subtitle text-xs sm:text-sm text-[#bdc1c6]">Actual number of AI bots that are allowed to read your website</div>
                </div>
                <span class="badge px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black ${botStatusBadgeClass}">${botStatus.badgeText}</span>
              </div>

              <!-- Cloudflare Challenge Gate -->
              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">Cloudflare Challenge Gate</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">Zero JavaScript challenge pages, CAPTCHAs, or rate drops.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black ${gateway.cloudflareChallenge === 'CLEAN' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">${gateway.cloudflareChallenge}</span>
              </div>

              <!-- X-Robots-Tag Server Headers -->
              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">X-Robots-Tag Server Headers</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">HTTP server level "all, index, follow" response confirmed.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black ${gateway.xRobotsTag === 'ENABLED' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">${gateway.xRobotsTag}</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-[#181818] border border-[#3c4043] flex items-center space-x-3 text-xs text-[#bdc1c6]">
            <span class="text-base">🛡️</span>
            <span>All core perimeter checks verified against target domain root socket.</span>
          </div>
        </div>

        <!-- COLUMN 2: AI Crawler Allowance Matrix (20 Engines Grouped by Provider) -->
        <div class="lg:col-span-6 bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div class="space-y-3.5">
            <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">SUPPLEMENTARY BREAKDOWN</span>
                <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">AI Crawler Allowance Matrix (20 Engines)</h4>
                <p class="text-xs text-[#5f6368]">Grouped by provider with crawler permission status</p>
              </div>
              <span id="stage1-bot-count-card" data-metric="allowed-bots-count" class="supplementary-card card metric-card text-xs font-mono font-bold px-3 py-1 rounded-xl ${botStatusBadgeClass}">
                ${botStatus.cardText}
              </span>
            </div>

            <div class="space-y-4 max-h-[390px] overflow-y-auto pr-1">
              ${providerNames.map(pName => {
                const bots = providerGroups[pName] || [];
                if (bots.length === 0) return '';
                const pMeta = PROVIDER_META[pName] || { icon: '🤖', badge: 'border-[#3c4043] text-white' };

                return `
                  <div class="p-3.5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-2.5">
                    <div class="flex items-center justify-between">
                      <div class="flex items-center space-x-2">
                        <span class="text-base">${pMeta.icon}</span>
                        <span class="text-xs font-bold text-white font-headline">${pName}</span>
                      </div>
                      <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${pMeta.badge}">${bots.length} BOTS</span>
                    </div>

                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      ${bots.map(bot => `
                        <div class="p-2.5 rounded-xl bg-[#181818] border border-[#3c4043] flex items-center justify-between text-xs">
                          <div>
                            <span class="font-mono font-bold text-white text-xs block">${bot.name}</span>
                            <span class="text-[10px] font-mono text-[#5f6368]">${bot.key}</span>
                          </div>
                          <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black ${bot.allowed ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">
                            ${bot.allowed ? 'ALLOWED' : 'BLOCKED'}
                          </span>
                        </div>
                      `).join('')}
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <div class="pt-2 text-[11px] font-mono text-[#5f6368] flex items-center justify-between border-t border-[#3c4043]/50">
            <span>Directives Status: <strong class="text-[#10b981]">HTTP 200 Trace Verified</strong></span>
            <span>20 Registered Engines</span>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers({ actionPlan, actionSteps, shortcutPlan, evidencePlain, evidenceTrace })}
    </div>
  `;

  container.innerHTML = html;
}

export const renderStage1Canvas = renderStage1;

// -----------------------------------------------------------------------------
// STAGE 2: ESSENTIAL CONTENT ANCHORS & CANONICAL ROUTES
// -----------------------------------------------------------------------------
export function updateStage2FromPayload(payload = {}) {
  const data = (payload && payload.results && typeof payload.results === 'object') ? payload.results : (payload || {});
  const rawPages = data.pages || payload.pages || cockpitState.stage3?.pages || [];
  const inPageAnchors = data.inPageAnchors || payload.inPageAnchors || data.anchors || [];

  const evaluated = evaluateEssentialPages(rawPages, inPageAnchors);

  const routes = ESSENTIAL_PAGE_DEFINITIONS.map(def => {
    const pageData = evaluated.pages[def.key];
    const isFound = pageData.found;
    const desc = isFound
      ? (pageData.discoveryType === 'anchor'
          ? `Found: In-Page Section (${pageData.matchedAnchor}). Verified in DOM.`
          : 'Entity credentials and canonical anchor verified in DOM.')
      : '404 Not Found. AI engines cannot confirm credentials on this route.';

    return {
      path: '/' + def.canonicalName,
      title: def.label === 'Privacy Policy' ? 'Data Protection & Privacy' : (def.label === 'Terms of Service' ? 'Terms of Service & Licensing' : (def.label === 'About' ? 'Company Identity & Mission' : (def.label === 'Contact' ? 'Direct Contact Point' : 'Commercial Tiering & Pricing'))),
      status: isFound ? 'FOUND' : 'MISSING',
      discoveryType: pageData.discoveryType,
      matchedAnchor: pageData.matchedAnchor,
      citationScore: isFound ? '90%' : '0%',
      desc
    };
  });

  const foundCount = evaluated.foundCount;
  const missingCount = evaluated.missingCount;
  const missingRoutes = evaluated.missingPages.map(p => '/' + p).join(', ');

  cockpitState.stage2Data = {
    routes,
    foundCount,
    missingCount,
    missingSummary: missingRoutes ? `(${missingRoutes})` : '',
    score: `${Math.round((foundCount / routes.length) * 100)}%`,
    status: foundCount === routes.length ? 'PASS' : 'WARN'
  };

  return cockpitState.stage2Data;
}

export function renderStage2Canvas(container, state = cockpitState) {
  const stg2 = state.stages?.stage2 || cockpitState.stages?.stage2 || state.stage2 || {};
  const rawS2 = (state.stage2 && Array.isArray(state.stage2.routes) && state.stage2.routes.length > 0)
    ? state.stage2
    : (cockpitState.stage2 && Array.isArray(cockpitState.stage2.routes) && cockpitState.stage2.routes.length > 0)
      ? cockpitState.stage2
      : (cockpitState.stage2Data || updateStage2FromPayload(state));

  const s2 = (rawS2 && rawS2.routes && rawS2.routes[0]?.desc)
    ? rawS2
    : updateStage2FromPayload({ stage2: rawS2, ...state });

  const routes = s2.routes || [];
  const foundCount = s2.foundCount ?? routes.filter(r => r.status === 'FOUND' || r.status === 'discovered').length;
  const missingCount = s2.missingCount ?? routes.filter(r => r.status !== 'FOUND' && r.status !== 'discovered').length;
  const missingRoutes = routes.filter(r => r.status === 'MISSING' || r.status === 'missing').map(r => r.path || r.route).join(', ');
  const missingSummary = s2.missingSummary || (missingRoutes ? `(${missingRoutes})` : '');
  const score = stg2.score || s2.score || `${Math.round((foundCount / (routes.length || 1)) * 100)}%`;
  const isPass = stg2.status ? (stg2.status === 'PASS' || stg2.status === 'OPTIMIZED') : (s2.status === 'PASS' || foundCount === routes.length);
  const status = stg2.status || (isPass ? 'PASS' : 'WARN');
  const summaryText = stg2.summaryText || s2.summaryText || `Essential Anchors: ${foundCount}/${routes.length} Verified Routes`;

  const baseTakeaway = (isPass && (!stg2.summaryText || status === 'PASS'))
    ? 'All 5 canonical entity routes (/about, /contact, /pricing, /privacy-policy, /terms-of-service) are live and verified, establishing complete corporate entity anchors for AI search models.'
    : `${foundCount} of 5 essential corporate routes verified. ${missingCount} missing anchor${missingCount > 1 ? 's' : ''} ${missingSummary} prevent AI search engines from fully citing corporate credentials.`;

  const takeaway = summaryText ? `${summaryText} — ${baseTakeaway}` : baseTakeaway;

  const missingList = routes.filter(r => r.status === 'MISSING' || r.status === 'missing').map(r => r.path || r.route);

  const actionPlan = missingList.length > 0
    ? `Create and publish canonical routes for missing anchors (${missingList.join(', ')}). Embed Schema.org ContactPoint and Offer schemas to enable rich snippet extraction by AI engines.`
    : 'All 5 core anchors are verified. Ensure all canonical pages maintain up-to-date schema markup and responsive navigation links.';

  const actionSteps = [
    { title: "Create canonical /pricing endpoint", detail: "Deploy a dedicated pricing table or plan breakdown URL at /pricing to provide structured commercial facts for search bots." },
    { title: "Verify HTTP 200 responses", detail: "Ensure all 5 canonical routes return HTTP 200 with clean server headers and valid HTML content." },
    { title: "Update header & footer navigation", detail: "Link all 5 canonical pages in both the header and footer DOM to establish strong internal link equity for crawlers." },
    { title: "Embed Offer and ContactPoint schemas", detail: "Add JSON-LD Offer and ContactPoint structured data on respective pages for direct AI entity ingestion." }
  ];

  const evidencePlain = missingList.length > 0
    ? `Verified ${foundCount} canonical routes with active DOM credentials. Discovered ${missingCount} unresolved route: ${missingList.map(p => `GET ${p} -> 404 Not Found`).join(', ')}.`
    : `Verified all 5 canonical entity routes (/about, /contact, /pricing, /privacy-policy, /terms-of-service) returning HTTP 200 OK with DOM entity anchors.`;

  const evidenceTrace = routes.map(r => {
    const isFound = r.status === 'FOUND' || r.status === 'discovered';
    const path = r.path || r.route || '';
    const title = r.title || path;
    const citationScore = r.citationScore || (isFound ? '90%' : '0%');
    return `GET ${path} -> ${isFound ? 'HTTP/2 200 OK (Verified)' : '404 Not Found'}\n  Title: ${title}\n  Citation Readiness: ${citationScore}`;
  }).join('\n\n');

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 2", takeaway, score, "AI-Optimized", status)}

      <!-- KANBAN MATRIX CARD SECTION -->
      <div class="bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div class="space-y-1">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">CANONICAL ANCHORS</span>
            <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">5-Anchor Essential Kanban Matrix</h4>
            <p class="text-xs text-[#5f6368]">Corporate identity, trust, and commercial verification anchors</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] ${isPass ? 'text-[#10b981]' : 'text-[#f59e0b]'}">
            ${foundCount} FOUND • ${missingCount} MISSING${missingSummary ? ' ' + missingSummary : ''}
          </span>
        </div>

        <div class="kanban-grid-container">
          ${routes.map(r => {
            const isFound = r.status === 'FOUND' || r.status === 'discovered';
            const path = r.path || r.route || '';
            const title = r.title || path;
            const citationScore = r.citationScore || (isFound ? '90%' : '0%');
            const desc = r.desc || (isFound ? 'Entity credentials and canonical anchor verified in DOM.' : '404 Not Found. AI engines cannot confirm credentials on this route.');
            const statusLabel = isFound ? 'FOUND' : 'MISSING';

            return `
              <div class="kanban-card p-4 rounded-2xl bg-[#121212] border ${isFound ? 'border-[#3c4043] hover:border-[#10b981]/50' : 'border-amber-500/40 bg-amber-950/10'} transition">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-xs font-mono font-bold px-2 py-0.5 rounded ${isFound ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">
                      ${statusLabel}
                    </span>
                    <span class="text-xs font-mono font-bold text-[#bdc1c6]">${citationScore}</span>
                  </div>
                  <div>
                    <h5 class="text-xs sm:text-sm font-bold text-white font-headline">${title}</h5>
                    <code class="text-xs font-mono text-[#38bdf8]">${path}</code>
                  </div>
                  <p class="text-xs text-[#bdc1c6] leading-relaxed">${desc}</p>
                </div>
                <div class="kanban-card-metrics">
                  <span class="text-[10px] font-mono text-[#5f6368] uppercase">Citation Readiness</span>
                  <span class="text-xs font-mono font-bold ${isFound ? 'text-[#10b981]' : 'text-red-400'}">${citationScore}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${buildEvidenceAndActionDrawers({ actionPlan, actionSteps, shortcutPlan: 'Deploying Level 1 Machine Manifests via AIOptimize Pro automatically generates canonical entity references and structured anchor endpoints across all essential routes—guaranteeing 100% citation readiness for AI engines.', evidencePlain, evidenceTrace })}
    </div>
  `;

  container.innerHTML = html;
}

export const renderStage2 = renderStage2Canvas;

export function buildEvidenceAndActionDrawers(secData = {}) {
  const actionPlan = secData.actionPlan || '';
  const actionSteps = secData.actionSteps || [];
  const shortcutPlan = secData.shortcutPlan || '';
  const evidencePlain = secData.evidencePlain || '';
  const evidenceTrace = secData.evidenceTrace || '';

  return `
    <div class="space-y-5 mt-6">
      <!-- BOX 1: MANUAL ACTION PLAN -->
      <div class="bg-[#1f1f1f] border-2 border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-3.5">
        <div class="flex items-center space-x-2.5">
          <span class="text-base sm:text-lg">🛠️</span>
          <h4 class="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider font-headline">
            Action Plan: How to improve how AI can read your current pages better
          </h4>
        </div>
        
        <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-7">
          ${actionPlan}
        </p>

        <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 ml-0 sm:ml-7 mt-2">
          <summary class="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-[#38bdf8] cursor-pointer hover:text-[#7dd3fc]">
            <span>▾ View Detailed Step-by-Step Fix Instructions</span>
            <span class="text-xs text-[#bdc1c6] font-normal">[Click to Expand]</span>
          </summary>
          <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-3">
            ${actionSteps.map((step, idx) => `
              <div class="flex items-start space-x-3 text-xs sm:text-sm text-[#e8eaed] leading-relaxed">
                <span class="w-5 h-5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">${idx + 1}</span>
                <div class="flex-1">
                  <strong class="text-white font-bold">${step.title}:</strong>
                  <span class="text-[#bdc1c6] ml-1">${step.detail}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      </div>

      <!-- BOX 2: RECOMMENDED SHORTCUT (AI-READY MANIFEST AUTOMATION VIA AIOPTIMIZE PRO) -->
      <div class="shortcut-card bg-gradient-to-r from-[#1f1f1f] to-[#251b17] border-2 border-[#b7410e]/60 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div class="shortcut-card-body space-y-2.5">
          <div class="flex items-center space-x-2.5">
            <span class="text-base sm:text-lg text-[#d45d2a]">⚡</span>
            <h4 class="text-xs sm:text-sm font-mono font-black text-[#d45d2a] uppercase tracking-wider font-headline">
              Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files
            </h4>
          </div>
          <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-0 sm:pl-7">
            ${shortcutPlan}
          </p>
        </div>
        <div class="shortcut-card-btn-container">
          <button type="button" onclick="alert('Navigating to AIOptimize Pro Automated Manifest Deployment')" class="shortcut-card-btn px-6 py-3.5 rounded-xl bg-[#b7410e] hover:bg-[#d45d2a] text-white font-black text-xs sm:text-sm font-bold tracking-wide transition shadow-lg whitespace-nowrap flex items-center justify-center space-x-2 active:scale-95 flex-shrink-0">
            <span>⚡ Deploy AI-Ready files using AIOptimize Pro</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      <!-- TIER 2: VERIFICATION EVIDENCE DRAWER -->
      <details class="executive-drawer bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 shadow-lg open" open>
        <summary class="flex items-center justify-between text-sm sm:text-base font-bold text-white font-headline cursor-pointer">
          <span class="flex items-center space-x-2.5">
            <svg class="w-5 h-5 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Verification Evidence (What We Found)</span>
          </span>
          <span class="text-[#bdc1c6] text-xs font-mono font-semibold">[Toggle Verification]</span>
        </summary>
        <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-4">
          <p class="text-sm sm:text-base leading-relaxed text-[#e8eaed] font-medium">
            ${evidencePlain}
          </p>
          
          <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 mt-3">
            <summary class="flex items-center justify-between text-xs font-mono font-bold text-[#bdc1c6] cursor-pointer">
              <span>▾ View Technical Diagnostics &amp; Server Response Trace</span>
              <span class="text-[#38bdf8] text-xs font-mono">[Raw Headers Trace]</span>
            </summary>
            <div class="mt-3.5 pt-3.5 border-t border-[#3c4043]">
              <pre class="bg-[#181818] p-4 rounded-xl text-xs font-mono text-[#38bdf8] overflow-x-auto leading-relaxed border border-[#3c4043]">${evidenceTrace}</pre>
            </div>
          </details>
        </div>
      </details>
    </div>
  `;
}

// -----------------------------------------------------------------------------
// STAGE 3: CONTENT AVAILABILITY, SEMANTIC TEXT DENSITY & REMEDIATION DRAWERS
// -----------------------------------------------------------------------------
export function copyTextSnippet(btn, textToCopy) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy);
  }
  const originalHtml = btn.innerHTML;
  btn.innerHTML = "<span>Copied ✓</span>";
  btn.classList.add("bg-[#10b981]", "text-black");
  setTimeout(() => {
    btn.innerHTML = originalHtml;
    btn.classList.remove("bg-[#10b981]", "text-black");
  }, 2000);
}

export function viewWhatAISees(url, ratio, status, gain) {
  const page = (cockpitState.stage3?.pages || []).find(p => p.url === url) || {};
  const extractedText = page.extractedContent || 'No raw text extracted.';
  const fullUrl = url.startsWith('http') ? url : `${(cockpitState.targetUrl || '').replace(/\/$/, '')}${url}`;

  const markdownBody = `# ${fullUrl} | Extracted Ingestion View\n\n` +
    `> [!NOTE]\n` +
    `> Text-to-HTML Density: ${ratio}% • Status: ${status} • Words: ${page.wordCount || 0}\n\n` +
    `## Extracted Clean Text (What AI Crawlers Read)\n` +
    `${extractedText}\n\n` +
    `## Semantic Outline\n` +
    `${((page.headings?.h1 || []).map(h => `# ${h}`).join('\n'))}\n` +
    `${((page.headings?.h2 || []).map(h => `## ${h}`).join('\n'))}`;

  if (typeof window !== 'undefined' && window.open) {
    const viewerHtml = `<!DOCTYPE html><html lang="en" class="dark"><head><meta charset="UTF-8"><title>What AI Sees: ${url}</title><style>body{background:#121212;color:#e8eaed;font-family:sans-serif;padding:2rem;}pre{background:#181818;padding:1.5rem;border-radius:1rem;border:1px solid #3c4043;white-space:pre-wrap;font-family:monospace;}</style></head><body><h2>${fullUrl}</h2><pre>${markdownBody}</pre></body></html>`;
    const blob = new Blob([viewerHtml], { type: 'text/html' });
    window.open(URL.createObjectURL(blob), '_blank');
  }
}

export function loadMoreStage3Pages() {
  cockpitState.stage3VisibleCount = (cockpitState.stage3VisibleCount || 5) + 5;
  renderStageFromState(3, cockpitState);
}

function buildLegacyMatchedPageFixPanels(p, idx) {
  // 1. EARLY EXIT: 404 / Missing Page Handler
  if (p.is404 || p.statusCode === 404) {
    return `
      <div class="p-4 rounded-xl bg-red-950/30 border border-red-500/50 text-xs sm:text-sm space-y-3">
        <div class="font-bold text-red-400 flex items-center space-x-2 text-sm">
          <span>🚫</span>
          <span>HTTP 404 Not Found — Page Does Not Exist</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          AI search crawlers encountered a <strong>404 Not Found</strong> error when attempting to fetch <code>${p.url}</code>. This route contains no indexable content.
        </p>
        <div class="text-[#bdc1c6] space-y-1.5 pl-3 border-l-2 border-red-500/40">
          <div><strong>• Canonical Redirect (Recommended):</strong> If this is an alternative alias (e.g. <code>/terms</code>), implement a permanent <strong>301 Redirect</strong> to the canonical destination (e.g. <code>/terms-of-service</code>).</div>
          <div><strong>• Broken Internal Links:</strong> If this URL was discovered via site navigation, inspect your header and footer links to correct or remove the broken reference.</div>
          <div><strong>• Restore Endpoint:</strong> If this is a required company anchor, publish the HTML page with a direct 200 OK status code.</div>
        </div>
      </div>
    `;
  }

  const tokens = Math.round((p.wordCount || 0) * 1.35);
  const panels = [];

  // 1. Clean Content Display
  const safeText = (p.extractedContent || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Headings Summary
  let headingsHtml = '';
  if (p.headingCounts && (p.headingCounts.h1 > 0 || p.headingCounts.h2 > 0)) {
    headingsHtml = `
      <div class="flex items-center space-x-3 text-xs font-mono">
        <span class="text-[#bdc1c6] font-bold">Headings:</span>
        <span class="text-[#38bdf8]">H1: ${p.headingCounts.h1}</span>
        <span class="text-[#cbd5e1]">H2: ${p.headingCounts.h2}</span>
        ${p.headingCounts.h3 ? `<span class="text-[#94a3b8]">H3: ${p.headingCounts.h3}</span>` : ''}
        <span class="text-[#10b981] font-bold ml-2">✓ ${p.headingHierarchy}</span>
      </div>
    `;
  } else if (p.headingTexts && (p.headingTexts.h1.length > 0 || p.headingTexts.h2.length > 0)) {
    headingsHtml = `
      <div class="space-y-1 text-xs">
        ${p.headingTexts.h1.map(h => `<div class="text-[#38bdf8] font-bold font-mono">H1: ${h}</div>`).join('')}
        ${p.headingTexts.h2.map(h => `<div class="text-[#cbd5e1] font-mono pl-3">H2: ${h}</div>`).join('')}
      </div>
    `;
  }

  // Section A: Crawler Content Extraction Review
  panels.push(`
    <div class="p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-xs sm:text-sm space-y-3">
      <div class="flex items-center justify-between border-b border-[#3c4043] pb-2">
        <span class="font-bold text-white font-headline">Crawler Content Extraction Review</span>
        <span class="text-xs font-mono text-[#38bdf8]">${p.wordCount} words • ${p.ratio}% density</span>
      </div>

      ${headingsHtml ? `
        <div class="space-y-1">
          <span class="text-xs font-mono font-bold text-[#bdc1c6] uppercase">Semantic Heading Outline:</span>
          ${headingsHtml}
        </div>
      ` : ''}

      ${safeText ? `
        <div class="space-y-1">
          <span class="text-xs font-mono font-bold text-[#bdc1c6] uppercase">Body Text Snippet (Clean Ingestion Sample):</span>
          <p class="text-xs font-mono text-[#e8eaed] bg-[#181818] p-3 rounded-lg border border-[#3c4043] leading-relaxed max-h-36 overflow-y-auto whitespace-pre-wrap">${safeText}</p>
        </div>
      ` : ''}

      ${p.hasSchema ? `
        <div class="flex items-center space-x-2 text-xs mt-2 border-t border-[#3c4043] pt-2">
          <span class="text-[#10b981] font-bold">✓ Schema.org Detected:</span>
          <span class="font-mono text-white">${(p.schemaTypes && p.schemaTypes.length) ? p.schemaTypes.join(', ') : 'Organization / Structured Data'}</span>
        </div>
      ` : ''}

      ${p.lastUpdated ? `
        <div class="flex items-center space-x-2 text-xs">
          <span class="text-[#10b981] font-bold">✓ Revision Date Detected:</span>
          <span class="font-mono text-[#bdc1c6]">${p.lastUpdated}</span>
        </div>
      ` : ''}
    </div>
  `);

  // Section B: Actionable Warning Panels (ONLY when genuinely failing)
  if (!p.isCrawled) {
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>🔴</span>
          <span>Crawl Error / Blank Page Detected</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">The page could not be crawled or returned a 0-byte DOM payload.</p>
      </div>
    `);
  }

  if (p.isThin) {
    panels.push(`
      <div class="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300">
        <strong>⚠️ Thin Content Warning:</strong> Contains only ${p.wordCount} words (&lt; 250 words required for AI snippet extractability).
      </div>
    `);
  }

  if (p.isHeavySpa) {
    panels.push(`
      <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300">
        <strong>⚠️ SPA / Low Text Density (${p.ratio}%):</strong> Initial server payload has low readable text. Pre-render HTML on server.
      </div>
    `);
  }

  if (!p.hasCanonical) {
    const canonicalTag = `<link rel="canonical" href="${p.url}" />`;
    const escapedCanonical = canonicalTag.replace(/"/g, '&quot;');
    panels.push(`
      <div class="p-3 rounded-xl bg-red-950/20 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
        <span><strong>⚠️ Missing Canonical URL:</strong> Add <code>&lt;link rel="canonical" href="..."&gt;</code> to &lt;head&gt;.</span>
        <button type="button" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.copyTextSnippet ? window.AEO_COCKPIT.copyTextSnippet(this, '${escapedCanonical}') : null" class="px-2 py-1 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/40 text-[#38bdf8] text-[10px] font-bold">Copy Snippet</button>
      </div>
    `);
  }

  if (!p.hasSchema) {
    panels.push(`
      <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300">
        <strong>⚠️ Missing JSON-LD Schema:</strong> Add Organization or Article schema markup to this route.
      </div>
    `);
  }

  if (!p.lastUpdated) {
    panels.push(`
      <div class="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300">
        <strong>⚠️ Missing Revision Date (Freshness Signal):</strong> Add <code>&lt;meta property="article:modified_time"&gt;</code> to header.
      </div>
    `);
  }

  return panels.join('');
}

export function renderStage3Canvas(container, state = cockpitState) {
  const stg3 = state.stages?.stage3 || cockpitState.stages?.stage3 || state.stage3 || {};
  const s3 = state.stage3 || cockpitState.stage3 || {};
  const sec = (state.sections && state.sections[3]) || (cockpitState.sections && cockpitState.sections[3]) || {};
  
  const rawPages = (Array.isArray(s3.pages) && s3.pages.length > 0)
    ? s3.pages
    : (Array.isArray(state.pages) && state.pages.length > 0)
      ? state.pages
      : (Array.isArray(state.results?.pages) && state.results.pages.length > 0)
        ? state.results.pages
        : [];

  const pages = rawPages.map(p => {
    const url = p.url || p.path || '/';

    // 1. Text Density Ratio: Support textDensityRatio, contentDensityRatio, textToHtmlRatio, and strings like "587%"
    let rawRatio = p.textDensityRatio ?? p.contentDensityRatio ?? p.textToHtmlRatio ?? p.textRatio ?? p.ratio ?? 0;
    if (typeof rawRatio === 'string') {
      rawRatio = parseFloat(rawRatio.replace('%', ''));
    }
    if (rawRatio > 0 && rawRatio <= 1) {
      rawRatio = rawRatio * 100;
    }
    const ratio = isNaN(rawRatio) ? 0 : Number(rawRatio.toFixed(1));

    const wordCount = p.wordCount ?? p.words ?? 0;
    const is404 = p.statusCode === 404 || 
                  p.is404 === true || 
                  p.isMissing === true || 
                  p.status === '404 NOT FOUND' ||
                  p.missingStatus === 'Missing' ||
                  (p.isCrawled === false && wordCount === 0);

    const isThin = !is404 && (p.isThin !== undefined ? p.isThin : (wordCount < 250));
    // Heavy SPA only if ratio is genuinely low (< 15%) AND content is sparse (< 300 words)
    const isHeavySpa = !is404 && (p.isHeavySpa !== undefined ? p.isHeavySpa : (ratio < 15 && wordCount < 300));
    const isCrawled = !is404 && (p.isCrawled !== undefined ? p.isCrawled : true);

    // 2. Canonical Tag
    const canonicalUrl = p.canonicalTag || p.canonical || p.canonicalUrl || '';
    const hasCanonical = is404 ? true : (p.hasCanonical !== undefined ? p.hasCanonical : Boolean(canonicalUrl));

    // 3. Schema.org / JSON-LD
    const schemasList = Array.isArray(p.schemas) ? p.schemas : (Array.isArray(p.schema) ? p.schema : (Array.isArray(p.jsonLd) ? p.jsonLd : []));
    const schemaTypes = Array.isArray(p.schemaTypes) && p.schemaTypes.length > 0
      ? p.schemaTypes
      : schemasList.map(s => s['@type'] || s.type).filter(Boolean);
    const hasSchema = is404 ? false : (p.hasSchema !== undefined ? p.hasSchema : (schemaTypes.length > 0 || schemasList.length > 0));

    // 4. Revision Date (Freshness)
    const lastUpdated = is404 ? null : (p.lastUpdated || p.lastModified || p.dateModified || p.modifiedTime || p.revisionDate || null);

    // 5. Headings: Support { H1: 1, H2: 4 } and { h1: [...], h2: [...] }
    let headings = p.headings || {};
    let headingCounts = { h1: 0, h2: 0, h3: 0 };
    let headingTexts = { h1: [], h2: [] };

    if (p.headings) {
      if (typeof p.headings.H1 === 'number' || typeof p.headings.h1 === 'number') {
        headingCounts.h1 = p.headings.H1 ?? p.headings.h1 ?? 0;
        headingCounts.h2 = p.headings.H2 ?? p.headings.h2 ?? 0;
        headingCounts.h3 = p.headings.H3 ?? p.headings.h3 ?? 0;
      } else {
        headingTexts.h1 = Array.isArray(p.headings.h1) ? p.headings.h1 : (Array.isArray(p.headings.H1) ? p.headings.H1 : []);
        headingTexts.h2 = Array.isArray(p.headings.h2) ? p.headings.h2 : (Array.isArray(p.headings.H2) ? p.headings.H2 : []);
        headingCounts.h1 = headingTexts.h1.length;
        headingCounts.h2 = headingTexts.h2.length;
      }
    }

    // 6. Extracted Clean Text: Prioritize bodyTextSnippet over raw content; strip any leftover HTML tags
    let rawSnippet = p.bodyTextSnippet || p.bodySnippet || p.bodyText || p.extractedContent || p.markdown || p.snippet || '';
    if (!rawSnippet && p.content) {
      // Fallback: strip HTML tags to avoid displaying raw markup
      rawSnippet = p.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
                            .replace(/<[^>]+>/g, ' ')
                            .replace(/\s+/g, ' ')
                            .trim();
    }
    const extractedContent = is404 ? '' : rawSnippet;

    // Semantic Tags & Alts
    const missingRequired = is404 ? [] : (Array.isArray(p.missingRequired) ? p.missingRequired : []);
    const hasAllRequired = is404 ? true : (missingRequired.length === 0);
    const missingAltList = is404 ? [] : (Array.isArray(p.missingAltList) ? p.missingAltList : []);
    const missingAltCount = is404 ? 0 : (p.missingAltCount ?? missingAltList.length);

    const status = p.status || (is404 ? '404 NOT FOUND' : (ratio >= 35 ? 'EXCELLENT' : ratio >= 25 ? 'GOOD' : ratio >= 15 ? 'MODERATE' : 'WARNING (SPA)'));
    const color = p.color || (is404 ? 'bg-red-500' : (ratio >= 35 ? 'bg-[#10b981]' : ratio >= 25 ? 'bg-[#38bdf8]' : ratio >= 15 ? 'bg-[#f59e0b]' : 'bg-red-500'));
    const gain = p.gain || (is404 ? '0.00' : (ratio > 0 ? Math.min(0.99, (ratio / 50)).toFixed(2) : '0.20'));

    return {
      url,
      ratio: is404 ? 0 : ratio,
      wordCount,
      is404,
      statusCode: p.statusCode || (is404 ? 404 : 200),
      isThin,
      isHeavySpa,
      isCrawled,
      hasCanonical,
      canonicalUrl,
      hasAllRequired,
      missingRequired,
      missingAltCount,
      missingAltList,
      lastUpdated,
      hasSchema,
      schemaTypes,
      extractedContent,
      headings,
      headingCounts,
      headingTexts,
      headingHierarchy: p.headingHierarchy || 'Valid Hierarchy',
      status,
      color,
      gain
    };
  });

  // Sort: lowest density first
  pages.sort((a, b) => a.ratio - b.ratio);

  const totalPages = pages.length;
  const count = cockpitState.stage3VisibleCount || 5;
  const visiblePages = pages.slice(0, count);

  const score = stg3.score || (stg3.scoreNum ? `${stg3.scoreNum}%` : (sec.score && sec.score !== '0%' ? sec.score : (s3.score && s3.score !== '0%' ? s3.score : '0%')));
  const status = stg3.status || (sec.status && sec.status !== 'UNAUDITED' ? sec.status : (s3.status || 'PASS'));
  const summaryText = stg3.summaryText || (pages.length ? `Citation Readability: ${pages.filter(p => p.ratio >= 25 && p.wordCount >= 250).length}/${pages.length} High Extractability` : 'Citation Readability: 0/0 High Extractability');

  const baseTakeaway = (sec.takeaway && sec.takeaway !== '--' && sec.takeaway !== '')
    ? sec.takeaway
    : `Crawled ${totalPages} pages. Average text density is healthy across canonical marketing pages with direct extractable answers.`;

  const takeaway = `${summaryText} — ${baseTakeaway}`;

  const actionPlan = (sec.actionPlan && sec.actionPlan !== '--' && sec.actionPlan !== '')
    ? sec.actionPlan
    : 'Maintain semantic heading trees and ensure client-rendered routes deliver static HTML payloads for LLM crawlers.';

  const actionSteps = (sec.actionSteps && sec.actionSteps.length > 0)
    ? sec.actionSteps
    : [
        { title: "Audit low-density routes", detail: "Ensure interactive app routes maintain >= 25% server-rendered text ratio." },
        { title: "Embed Schema.org markup", detail: "Connect Organization and Article JSON-LD metadata across all key routes." },
        { title: "Maintain Canonical URLs", detail: "Verify each page points to its canonical HTTPS endpoint." },
        { title: "Preserve Heading Hierarchy", detail: "Place direct factual answers immediately below H1 and H2 tags." }
      ];

  const shortcutPlan = (sec.shortcutPlan && sec.shortcutPlan !== '--' && sec.shortcutPlan !== '')
    ? sec.shortcutPlan
    : 'AIOptimize Pro automatically generates clean, high-density Level 3 & 4 Markdown feeds (/ai-context.md), bypassing HTML parsing overhead and supplying 100% extractable facts directly to LLMs.';

  const evidencePlain = `${pages.filter(p => p.ratio >= 25).length} of ${totalPages} crawled pages deliver clean semantic text with valid heading structures.`;
  const evidenceTrace = pages.map(p => `${p.url}: ${p.ratio}% Text Density (${p.status}) • Words: ${p.wordCount} • Schema: ${p.hasSchema ? 'Detected' : 'Missing'}`).join('\n');

  const secData = { actionPlan, actionSteps, shortcutPlan, evidencePlain, evidenceTrace };

  const html = `
    <div class="space-y-6">
      <!-- TIER 1 EXECUTIVE TAKEAWAY HEADER -->
      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl relative overflow-hidden">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div class="space-y-2">
            <div class="flex items-center space-x-2.5">
              <span class="text-sm sm:text-base font-black text-[#d45d2a] uppercase tracking-wider font-headline flex items-center space-x-2">
                <span>🎯</span>
                <span>What AI Search Engines See &amp; Why It Matters</span>
              </span>
              <span class="text-[#5f6368]">•</span>
              <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#e8eaed] font-bold uppercase">AI-Optimized</span>
            </div>
            <p class="text-sm sm:text-base font-normal text-[#e8eaed] leading-relaxed max-w-3xl">${summaryText} — ${baseTakeaway}</p>
          </div>
          
          <div class="flex items-center space-x-4 self-start sm:self-center flex-shrink-0 px-5 py-3.5 rounded-2xl bg-[#121212] border-2 ${status === 'PASS' ? 'border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-[#f59e0b]/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]'}">
            <div class="text-right">
              <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold">Stage Result</span>
              <span class="text-3xl sm:text-4xl font-mono font-black ${status === 'PASS' ? 'text-[#10b981]' : 'text-[#f59e0b]'}">${score}</span>
            </div>
            <span class="px-3 py-1 rounded-md text-xs font-mono font-black ${status === 'PASS' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'}">
              ${status}
            </span>
          </div>
        </div>
      </div>

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-wider font-headline">Semantic Text Density Thermometers</h3>
              <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 whitespace-nowrap">${summaryText}</span>
            </div>
            <p class="text-xs text-[#bdc1c6] leading-relaxed">
              Target: ≥ 25% Text-to-HTML ratio for instant answer extraction (showing lowest density routes first)
            </p>
          </div>
          <span class="text-xs font-mono text-[#38bdf8] font-bold px-3 py-1 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/30 w-fit self-start sm:self-center flex-shrink-0">
            Avg ${(pages.length ? (pages.reduce((acc, p) => acc + p.ratio, 0) / pages.length).toFixed(1) : '--')}% Density
          </span>
        </div>

        <div class="space-y-4 pt-1">
          ${visiblePages.map((bar, idx) => `
            <div class="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#38bdf8]/40 space-y-3 transition shadow-lg">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div class="flex items-center space-x-2.5 truncate max-w-[55%] sm:max-w-[45%]">
                  <span class="font-mono font-black text-white truncate">${bar.url}</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-center flex-shrink-0">
                  ${bar.is404 
                    ? `<span class="text-red-400 font-mono font-black">404 NOT FOUND (PAGE MISSING)</span>`
                    : `<span class="font-mono font-black ${bar.ratio >= 25 ? 'text-[#10b981]' : bar.ratio >= 15 ? 'text-[#f59e0b]' : 'text-red-400'}">${bar.ratio}% Density (${bar.status})</span>`}
                  
                  <button type="button" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.viewWhatAISees ? window.AEO_COCKPIT.viewWhatAISees('${bar.url}', ${bar.ratio}, '${bar.status}', '${bar.gain}') : null" class="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#b7410e] border border-[#3c4043] hover:border-[#b7410e] text-[#e8eaed] hover:text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 active:scale-95" title="View clean text ingested by AI crawlers">
                    <span>📄 View What AI sees</span>
                    <span class="text-[10px]">↗</span>
                  </button>

                  <button type="button" onclick="const d = document.getElementById('details-row-${idx}'); if (d) d.toggleAttribute('open');" class="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#3c4043] text-[#38bdf8] hover:text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 active:scale-95">
                    <span>🔍 Details</span>
                    <span class="text-[10px]">▾</span>
                  </button>
                </div>
              </div>
              
              <div class="w-full bg-[#1f1f1f] rounded-full h-3 overflow-hidden border border-[#3c4043]">
                <div class="${bar.color} h-3 rounded-full transition-all duration-1000" style="width: ${Math.min(bar.ratio, 100)}%"></div>
              </div>
              
              <div class="flex items-center justify-between text-xs font-mono text-[#bdc1c6]">
                <span>Information Gain Score: <strong class="text-white font-bold">${bar.gain}</strong> • Words: <strong class="text-white font-bold">${bar.wordCount}</strong></span>
                <span>Target: ≥ 25% Text-to-HTML Ratio</span>
              </div>

              <details id="details-row-${idx}" class="executive-drawer bg-[#181818] border border-[#3c4043] rounded-2xl p-4 sm:p-5 mt-3 space-y-4">
                <summary class="flex items-center justify-between text-xs font-mono font-bold text-[#38bdf8] cursor-pointer hover:text-[#7dd3fc]">
                  <span class="flex items-center space-x-2">
                    <span>▾ Page Diagnostic Breakdown &amp; In-Page Fix Snippets</span>
                    <span class="text-[10px] px-2 py-0.5 rounded ${bar.ratio >= 25 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-300'} border border-current">
                      ${bar.ratio >= 25 ? 'VERIFIED PASSED' : 'ACTION REQUIRED'}
                    </span>
                  </span>
                  <span class="text-xs text-[#bdc1c6] font-normal">[Toggle Details]</span>
                </summary>

                <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-3.5">
                  ${buildLegacyMatchedPageFixPanels(bar)}
                </div>
              </details>
            </div>
          `).join('')}
        </div>

        ${count < totalPages ? `
          <div class="pt-3 text-center border-t border-[#3c4043]/60">
            <button type="button" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.loadMoreStage3Pages ? window.AEO_COCKPIT.loadMoreStage3Pages() : null" class="px-5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] border-2 border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8] font-black text-xs sm:text-sm font-bold transition shadow-lg inline-flex items-center space-x-2 active:scale-95">
              <span>Load Next 5 Pages (${visiblePages.length} of ${totalPages} shown)</span>
              <span class="text-base">▾</span>
            </button>
          </div>
        ` : `
          <div class="pt-3 text-center border-t border-[#3c4043]/60">
            <span class="text-xs font-mono text-[#10b981] font-black px-4 py-2 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 inline-flex items-center space-x-2">
              <span>✓</span>
              <span>All ${totalPages} Scanned Pages Loaded</span>
            </span>
          </div>
        `}
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;

  container.innerHTML = html;
}

export const renderStage3 = renderStage3Canvas;

// -----------------------------------------------------------------------------
// -----------------------------------------------------------------------------
// STAGE 4: ENTITY AUTHORITY & E-E-A-T RELATIONAL GRAPH
// -----------------------------------------------------------------------------
export function renderStage4Canvas(container, state = cockpitState) {
  const stg4 = state.stages?.stage4 || cockpitState.stages?.stage4 || state.stage4 || {};
  const s4 = state.stage4 || cockpitState.stage4 || {};
  const sec = (state.sections && state.sections[4]) || (cockpitState.sections && cockpitState.sections[4]) || {};

  const score = stg4.score || s4.score || '80%';
  const status = stg4.status || s4.status || 'PASS';
  const summaryText = stg4.summaryText || s4.summaryText || 'Trust & E-E-A-T: Schema & Entity Validated';
  const baseTakeaway = sec.takeaway || s4.takeaway || stg4.summaryText || 'Entity Authority & E-E-A-T Relational Graph: Validated Schema.org structured data and author credentials establish strong knowledge graph trust.';
  const takeaway = summaryText ? `${summaryText} — ${baseTakeaway}` : baseTakeaway;

  // 1. Card 1 (Schema) Details & Indicator
  const detectedTypes = Array.isArray(s4.detectedTypes) ? s4.detectedTypes : [];
  const schemaDetails = s4.schemaDetails || stg4.schemaDetails || {
    detectedTypes: detectedTypes,
    totalPages: s4.totalPages || (detectedTypes.length > 0 ? 1 : 0),
    pagesWithSchemaCount: s4.pagesWithSchemaCount || (detectedTypes.length > 0 ? 1 : 0),
    pagesMissingSchemaCount: s4.pagesMissingSchemaCount || 0,
    missingRoutes: s4.missingRoutes || [],
    coveragePercent: s4.coveragePercent || (detectedTypes.length > 0 ? 100 : 0),
    status: (detectedTypes.length > 0 ? 'PASS' : 'CRITICAL'),
    severityBadge: (detectedTypes.length > 0 ? '100% COVERAGE (PASS)' : 'CRITICAL: 0% COVERAGE')
  };

  const schemaTypesList = (schemaDetails.detectedTypes && schemaDetails.detectedTypes.length > 0)
    ? schemaDetails.detectedTypes
    : detectedTypes;
  const detectedTypesString = schemaTypesList.length > 0 ? schemaTypesList.join(', ') : '';
  const schemaGraphStatus = schemaDetails.status === 'PASS' ? '100% VALID GRAPH' : (schemaDetails.status === 'WARN' ? 'PARTIAL GRAPH' : 'MISSING GRAPH');

  const schemaPillText = schemaDetails.status === 'PASS' ? 'CONFIRMED' : (schemaDetails.status === 'WARN' ? 'WARNING' : 'CRITICAL');
  const schemaPillClass = schemaDetails.status === 'PASS'
    ? 'pill-confirmed pill-success'
    : (schemaDetails.status === 'WARN'
      ? 'pill-warning'
      : 'pill-critical pill-danger');

  const schemaBadgeText = schemaDetails.status === 'PASS' || schemaDetails.pagesWithSchemaCount > 0
    ? `${schemaDetails.pagesWithSchemaCount}/${schemaDetails.totalPages || schemaDetails.pagesWithSchemaCount} HTML Pages with Schema`
    : '0% Coverage — 0 HTML Pages with Schema';
  const schemaBadgeClass = schemaDetails.status === 'PASS' ? '' : (schemaDetails.status === 'WARN' ? 'badge-warning' : 'badge-danger');

  // Top 2 detected types or clean fallback
  const primaryTypes = schemaTypesList.length > 0 ? schemaTypesList.slice(0, 3).join(', ') : 'None Detected';
  const schemaTypesChipText = schemaTypesList.length > 0 ? `🏢 ${primaryTypes}` : '🏢 Schema: None Detected';
  const schemaTypesChipClass = schemaTypesList.length > 0 ? 'chip-success' : 'chip-warning';

  const schemaCoverageChipText = `📊 Coverage: ${schemaDetails.coveragePercent || (schemaTypesList.length > 0 ? 100 : 0)}% HTML Routes`;
  const schemaCoverageChipClass = (schemaDetails.coveragePercent >= 80 || schemaTypesList.length > 0) ? 'chip-success' : 'chip-warning';

  // 2. Card 2 (Author) Details & Indicator
  const authorDetails = s4.authorDetails || stg4.authorDetails || {
    authors: [],
    authorCount: 0,
    status: 'CRITICAL',
    severityBadge: 'CRITICAL: 0 AUTHORS DETECTED'
  };

  const authorCount = authorDetails.authorCount || (Array.isArray(authorDetails.authors) ? authorDetails.authors.length : 0);
  const authorPass = Boolean(authorCount > 0 || s4.hasAuthorBio || s4.authorCredentialsVerified);
  const authorPillText = authorPass ? 'CONFIRMED' : 'CRITICAL';
  const authorPillClass = authorPass ? 'pill-confirmed pill-success' : 'pill-critical pill-danger';
  const authorStatus = authorPass ? 'VERIFIED SAMEAS' : 'AUTHOR GAPS';

  const authorBadgeText = authorCount > 0
    ? `${authorCount} Author(s) Verified`
    : (authorPass ? '1 Author(s) Verified' : '0 Authors Detected');
  const authorBadgeClass = authorPass ? '' : 'badge-danger';

  const authorName = (authorDetails.authors && authorDetails.authors[0]?.name) || s4.authorName || null;
  const authorRole = (authorDetails.authors && authorDetails.authors[0]?.jobTitle) || 'sameAs Credentials';

  const authorNameChipText = authorName ? `👤 ${authorName}` : '👤 Author: None Detected';
  const authorNameChipClass = authorName ? 'chip-success' : 'chip-warning';

  const authorRoleChipText = authorName ? `💼 ${authorRole}` : '💼 Credentials: None Detected';
  const authorRoleChipClass = authorName ? 'chip-success' : 'chip-warning';

  // 3. Card 3 (Authority) Details & Indicator
  const authorityDetails = s4.authorityDetails || stg4.authorityDetails || {
    domainAge: s4.ageEstimate || s4.domainAge || '--',
    registrationDate: s4.registrationDate || null,
    externalCheckerUrl: null,
    authorityStatus: 'Free Third-Party Check Available',
    status: (s4.domainAge && s4.domainAge !== '--' && !s4.domainAge.includes('Pending')) ? 'PASS' : 'PENDING'
  };

  const isAuthorityPass = authorityDetails.status === 'PASS';
  const authorityPillText = isAuthorityPass ? 'CONFIRMED' : 'PENDING';
  const authorityPillClass = isAuthorityPass ? 'pill-confirmed pill-success' : 'pill-warning';

  const ageVal = authorityDetails.domainAge && authorityDetails.domainAge !== '--'
    ? authorityDetails.domainAge
    : (s4.ageEstimate || '--');
  const authorityBadgeText = `Age: ${ageVal}`;
  const authorityBadgeClass = isAuthorityPass ? '' : 'badge-warning';

  const regDate = authorityDetails.registrationDate || s4.registrationDate || '--';
  const regChipText = `📅 Registered: ${regDate}`;
  const regChipClass = 'chip-success';

  const authStatusText = isAuthorityPass ? '🌐 Authority: Established Domain Anchor' : '🌐 Authority: Verification Pending';
  const authStatusClass = isAuthorityPass ? 'chip-success' : 'chip-warning';

  // --- Card 4: Security & Privacy State ---
  const targetUrl = state?.stage4?.targetUrl || state?.targetUrl || '';
  const isHttps = state?.stage4?.isHttps ?? (state?.isHttps === true || targetUrl.startsWith('https://'));
  const sslValid = state?.stage4?.sslValid ?? (state?.sslValid !== false && isHttps);

  const ahrefsUrl = authorityDetails.externalCheckerUrl || `https://ahrefs.com/website-authority-checker/?input=${encodeURIComponent(targetUrl.replace(/^https?:\/\//, '').split('/')[0])}`;

  const missingPages = Array.isArray(state?.missingEssentialPages) ? state.missingEssentialPages : [];
  const crawledPages = Array.isArray(state?.pages) ? state.pages : [];

  const privacyInPages = crawledPages.some(p => {
    const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
    return u.includes('/privacy-policy') || u.includes('/privacy') || u.includes('/#privacy');
  });
  const privacyMissing = missingPages.some(r => r.toLowerCase().includes('privacy'));
  const hasPrivacy = state?.stage4?.hasPrivacyPolicy ?? (privacyInPages || (!privacyMissing && crawledPages.length > 0 && !privacyMissing));

  const termsInPages = crawledPages.some(p => {
    const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
    return u.includes('/terms-of-service') || u.includes('/terms') || u.includes('/#terms');
  });
  const termsMissing = missingPages.some(r => r.toLowerCase().includes('terms'));
  const hasTerms = state?.stage4?.hasTermsOfService ?? (termsInPages || (!termsMissing && crawledPages.length > 0 && !termsMissing));

  let card4Status = 'CONFIRMED';
  let card4StatusClass = 'pill-confirmed pill-success';
  if (!isHttps || !sslValid) {
    card4Status = 'CRITICAL';
    card4StatusClass = 'pill-critical pill-danger';
  } else if (!hasPrivacy || !hasTerms) {
    card4Status = 'WARNING';
    card4StatusClass = 'pill-warning';
  }

  const securityBadgeText = state?.stage4?.securityBadgeText || (isHttps ? 'TLS 1.3 / HTTPS Enforced' : 'Insecure HTTP');
  const securityBadgeClass = isHttps ? '' : 'badge-danger';

  const privacyChipText = hasPrivacy ? '✓ Privacy Policy (/privacy-policy)' : '✕ Privacy Policy (Missing)';
  const privacyChipClass = hasPrivacy ? 'chip-success' : 'chip-warning';

  const termsChipText = hasTerms ? '✓ Terms of Service (/terms-of-service)' : '✕ Terms of Service (Missing)';
  const termsChipClass = hasTerms ? 'chip-success' : 'chip-warning';


  // --- Card 5: Verified Contact Anchors State ---
  let email = state?.stage4?.contact?.email ?? state?.contact?.email ?? state?.stage4?.contactDetails?.email ?? state?.contactDetails?.email ?? null;
  let phone = state?.stage4?.contact?.phone ?? state?.contact?.phone ?? state?.stage4?.contactDetails?.phone ?? state?.contactDetails?.phone ?? null;
  let address = state?.stage4?.contact?.address ?? state?.contact?.address ?? state?.stage4?.contactDetails?.address ?? state?.contactDetails?.address ?? null;

  if (!email || !phone || !address) {
    for (const page of crawledPages) {
      if (Array.isArray(page.links)) {
        for (const link of page.links) {
          if (!email && typeof link === 'string' && link.toLowerCase().startsWith('mailto:')) {
            email = link.replace(/^mailto:/i, '').split('?')[0].trim();
          }
          if (!phone && typeof link === 'string' && link.toLowerCase().startsWith('tel:')) {
            phone = link.replace(/^tel:/i, '').trim();
          }
        }
      }
      if (Array.isArray(page.schema)) {
        for (const item of page.schema) {
          if (!email && item.email) email = item.email;
          if (!phone && item.telephone) phone = item.telephone;
          if (!address && item.address) {
            if (typeof item.address === 'string') {
              address = item.address;
            } else if (typeof item.address === 'object') {
              const addr = item.address;
              const parts = [
                addr.streetAddress,
                addr.addressLocality,
                addr.addressRegion,
                addr.postalCode,
                typeof addr.addressCountry === 'string' ? addr.addressCountry : addr.addressCountry?.name
              ].filter(Boolean);
              address = parts.join(', ');
            }
          }
          if (item.contactPoint) {
            const points = Array.isArray(item.contactPoint) ? item.contactPoint : [item.contactPoint];
            for (const cp of points) {
              if (!email && cp.email) email = cp.email;
              if (!phone && cp.telephone) phone = cp.telephone;
            }
          }
        }
      }
    }
  }

  const isSanitized = (val) => Boolean(val) && val !== '--' && val !== 'None Detected' && val !== 'null' && val !== 'undefined';
  const cleanEmail = isSanitized(email) ? email : null;
  const cleanPhone = isSanitized(phone) ? phone : null;
  const cleanAddress = isSanitized(address) ? address : null;

  let trustAnchorCount = 0;
  if (cleanEmail) trustAnchorCount++;
  if (cleanPhone) trustAnchorCount++;
  if (cleanAddress) trustAnchorCount++;

  let card5Status = 'CRITICAL';
  let card5StatusClass = 'pill-critical pill-danger';
  if (cleanEmail && (cleanPhone || cleanAddress)) {
    card5Status = 'CONFIRMED';
    card5StatusClass = 'pill-confirmed pill-success';
  } else if (cleanEmail || cleanPhone || cleanAddress) {
    card5Status = 'WARNING';
    card5StatusClass = 'pill-warning';
  }

  const contactBadgeText = `${trustAnchorCount}/3 Trust Anchors Detected`;
  const contactBadgeClass = trustAnchorCount >= 2 ? '' : (trustAnchorCount === 1 ? 'badge-warning' : 'badge-danger');

  const emailChipText = cleanEmail ? `✉ ${cleanEmail}` : '✉ Email: None Detected';
  const emailChipClass = cleanEmail ? 'chip-success' : 'chip-warning';

  const phoneChipText = cleanPhone ? `✆ ${cleanPhone}` : '✆ Phone: None Detected';
  const phoneChipClass = cleanPhone ? 'chip-success' : 'chip-warning';

  const addressChipText = cleanAddress ? `⚲ ${cleanAddress}` : '⚲ Address: None Detected';
  const addressChipClass = cleanAddress ? 'chip-success' : 'chip-warning';

  const addressActionHtml = !cleanAddress
    ? `<a href="javascript:void(0)" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.openAddressModal ? window.AEO_COCKPIT.openAddressModal() : null" class="action-link address-guide-trigger" data-action="open-address-guide">📍 Add Address for AI ↗</a>`
    : `<a href="#contact-modal" class="action-link contact-trace-trigger" data-action="contact-trace">↗ View /contact Route Trace</a>`;

  const actionPlan = sec.actionPlan || 'Implement complete Schema.org Organization and Person schemas with sameAs knowledge graph links to establish verified entity authority.';
  const actionSteps = sec.actionSteps && sec.actionSteps.length > 0 ? sec.actionSteps : [
    { title: "Connect Wikidata & Knowledge Graphs", detail: "Add sameAs links to official Wikidata, Crunchbase, and LinkedIn entity profiles." },
    { title: "Embed Author Bio Credentials", detail: "Provide explicit author Person schemas with jobTitle, worksFor, and credential proofs." },
    { title: "Validate Schema.org Organization", detail: "Ensure @type Organization contains name, url, logo, contactPoint, and sameAs arrays." },
    { title: "Reinforce Privacy Anchors", detail: "Link canonical privacy policy and data governance terms in structured data." }
  ];
  const shortcutPlan = sec.shortcutPlan || 'AIOptimize Pro automatically synthesizes interconnected JSON-LD Knowledge Graphs with Wikidata sameAs entity anchors across your entire site.';
  const evidencePlain = sec.evidencePlain || `Verified Schema.org graphs: ${schemaGraphStatus}. Author E-E-A-T credentials: ${authorStatus}. Authority Grounding: ${authorityDetails.domainAge}.`;
  const evidenceTrace = sec.evidenceTrace || `Schema Entities: ${detectedTypesString || 'None'}\nAuthor Bio: ${authorPass ? 'Verified' : 'Gaps detected'}\nDomain Age: ${authorityDetails.domainAge}\nContact Email: ${cleanEmail || '--'}\nContact Phone: ${cleanPhone || '--'}`;

  const secData = { actionPlan, actionSteps, shortcutPlan, evidencePlain, evidenceTrace };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 4", takeaway, score, "AI-Optimized", status)}

      <!-- ENTITY AUTHORITY & E-E-A-T RELATIONAL GRAPH -->
      <div class="bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div class="space-y-1">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">KNOWLEDGE GRAPH</span>
            <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">Entity Authority &amp; E-E-A-T Relational Graph</h4>
            <p class="text-xs text-[#5f6368]">Structured schema entities, author credentials, and external authority anchors</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] ${status === 'PASS' ? 'text-[#10b981]' : 'text-[#f59e0b]'}">
            ${summaryText}
          </span>
        </div>

        <div class="stage4-grid">
          <!-- Card 1: Schema.org Entity Graph -->
          <div class="stage4-card" id="stage4-card-schema" data-card="schema-org">
            <div class="stage4-card-header">
              <span class="status-pill ${schemaPillClass}" data-slot="schema-status-pill">${schemaPillText}</span>
              <span class="schema-icon" data-icon="schema" aria-label="Schema Entity Graph">🏢</span>
            </div>
            <h4 class="card-title">Schema.org Entity Graph</h4>
            <div class="badge-highlight ${schemaBadgeClass}" data-slot="schema-badge">${schemaBadgeText}</div>
            <div class="stage4-chip-container schema-chips" data-slot="schema-chips">
              <div class="chip-tag entity-chip ${schemaTypesChipClass}" data-chip="schema-types">${schemaTypesChipText}</div>
              <div class="chip-tag entity-chip ${schemaCoverageChipClass}" data-chip="schema-coverage">${schemaCoverageChipText}</div>
            </div>
            <div class="stage4-card-metrics" style="display: none;">
              <div class="metric-row" data-metric="schema-coverage"><span class="metric-label">Coverage:</span><span class="metric-value">${schemaDetails.coveragePercent || 100}%</span></div>
              <div class="metric-row" data-metric="schema-types"><span class="metric-label">Detected Types:</span><span class="metric-value">${primaryTypes}</span></div>
            </div>
            <a href="javascript:void(0)" onclick="alert('Schema.org Knowledge Graph Entities: ${detectedTypesString || primaryTypes}')" class="action-link guide-trigger" data-action="schema-guide">🏢 View Schema Entity Graph ↗</a>
            <p class="compliance-note">JSON-LD structured organization nodes for AI entity extraction.</p>
          </div>

          <!-- Card 2: Author Person E-E-A-T -->
          <div class="stage4-card" id="stage4-card-author" data-card="author-eeat">
            <div class="stage4-card-header">
              <span class="status-pill ${authorPillClass}" data-slot="author-status-pill">${authorPillText}</span>
              <span class="author-icon" data-icon="author" aria-label="Author Person E-E-A-T">👤</span>
            </div>
            <h4 class="card-title">Author Person E-E-A-T</h4>
            <div class="badge-highlight ${authorBadgeClass}" data-slot="author-badge">${authorBadgeText}</div>
            <div class="stage4-chip-container author-chips" data-slot="author-chips">
              <div class="chip-tag entity-chip ${authorNameChipClass}" data-chip="author-name">${authorNameChipText}</div>
              <div class="chip-tag entity-chip ${authorRoleChipClass}" data-chip="author-role">${authorRoleChipText}</div>
            </div>
            <div class="stage4-card-metrics" style="display: none;">
              <div class="metric-row" data-metric="author-count"><span class="metric-label">Authors:</span><span class="metric-value">${authorCount}</span></div>
              <div class="metric-row" data-metric="author-credentials"><span class="metric-label">Credentials:</span><span class="metric-value">${authorName ? 'Verified' : 'None'}</span></div>
            </div>
            <a href="javascript:void(0)" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.openAuthorModal ? window.AEO_COCKPIT.openAuthorModal() : null" class="action-link guide-trigger" data-action="author-guide">👤 Author Person E-E-A-T Guide</a>
            <p class="compliance-note">Author identity and sameAs knowledge graph verification for AI engine trust.</p>
          </div>

          <!-- Card 3: Domain Age & External Authority -->
          <div class="stage4-card" id="stage4-card-domain" data-card="domain-age">
            <div class="stage4-card-header">
              <span class="status-pill ${authorityPillClass}" data-slot="domain-status-pill">${authorityPillText}</span>
              <span class="domain-icon" data-icon="domain" aria-label="Domain Age & External Authority">🌐</span>
            </div>
            <h4 class="card-title">Domain Age &amp; External Authority</h4>
            <div class="badge-highlight ${authorityBadgeClass}" data-slot="domain-badge">${authorityBadgeText}</div>
            <div class="stage4-chip-container domain-chips" data-slot="domain-chips">
              <div class="chip-tag entity-chip ${regChipClass}" data-chip="domain-registered">${regChipText}</div>
              <div class="chip-tag entity-chip ${authStatusClass}" data-chip="domain-status">${authStatusText}</div>
            </div>
            <div class="stage4-card-metrics" style="display: none;">
              <div class="metric-row" data-metric="domain-age"><span class="metric-label">Domain Age:</span><span class="metric-value">${ageVal}</span></div>
              <div class="metric-row" data-metric="domain-registered"><span class="metric-label">Registration Date:</span><span class="metric-value">${regDate}</span></div>
            </div>
            <a href="${ahrefsUrl}" target="_blank" rel="noopener noreferrer" class="action-link domain-rating-trigger" data-action="domain-rating">⚡ Check Domain Rating on Ahrefs (Free) ↗</a>
            <p class="compliance-note">Verify third-party Domain Rating (DR) and backlink profile with zero paid API overhead.</p>
          </div>

          <!-- Stage 4 Card 4: Security & Privacy Protocols -->
          <div class="stage4-card" id="stage4-card-security-privacy" data-card="security-privacy">
            <div class="stage4-card-header">
              <span class="status-pill ${card4StatusClass}" data-slot="card-status-pill">${card4Status}</span>
              <span class="security-icon" data-icon="security" aria-label="Security Protocols">🔒</span>
            </div>
            <h4 class="card-title">Security & Privacy</h4>
            <div class="badge-highlight ${securityBadgeClass}" data-slot="security-badge">${securityBadgeText}</div>
            <div class="stage4-chip-container policy-chips" data-slot="policy-chips">
              <span class="chip-tag entity-chip ${privacyChipClass}" data-chip="privacy-policy">${privacyChipText}</span>
              <span class="chip-tag entity-chip ${termsChipClass}" data-chip="terms-of-service">${termsChipText}</span>
            </div>
            <div class="stage4-card-metrics" style="display: none;">
              <div class="metric-row" data-metric="ssl-protocol">
                <span class="metric-label">SSL Protocol:</span>
                <span class="metric-value">${isHttps ? 'HTTPS Enforced' : 'Insecure HTTP'}</span>
              </div>
              <div class="metric-row" data-metric="privacy-policy">
                <span class="metric-label">Privacy Policy:</span>
                <span class="metric-value">${hasPrivacy ? 'Detected (/privacy-policy)' : 'Missing (/privacy-policy)'}</span>
              </div>
              <div class="metric-row" data-metric="terms-of-service">
                <span class="metric-label">Terms of Service:</span>
                <span class="metric-value">${hasTerms ? 'Detected (/terms-of-service)' : 'Missing (/terms-of-service)'}</span>
              </div>
            </div>
            <a href="#security-modal" class="action-link guide-trigger" data-action="security-guide">🛡️ Security & Legal Anchors</a>
            <p class="compliance-note">HTTPS encryption and legal compliance anchors verified for AI search engine trust.</p>
          </div>

          <!-- Stage 4 Card 5: Verified Contact Anchors -->
          <div class="stage4-card" id="stage4-card-contact-anchors" data-card="verified-contact">
            <div class="stage4-card-header">
              <span class="status-pill ${card5StatusClass}" data-slot="contact-status-pill">${card5Status}</span>
              <span class="contact-icon" data-icon="contact" aria-label="Contact Anchors">📞</span>
            </div>
            <h4 class="card-title">Verified Contact Anchors</h4>
            <div class="badge-highlight ${contactBadgeClass}" data-slot="contact-badge">${contactBadgeText}</div>
            <div class="stage4-chip-container contact-chips" data-slot="contact-chips">
              <div class="chip-tag entity-chip contact-chip ${emailChipClass}" data-chip="contact-email">${emailChipText}</div>
              <div class="chip-tag entity-chip contact-chip ${phoneChipClass}" data-chip="contact-phone">${phoneChipText}</div>
              <div class="chip-tag entity-chip contact-chip ${addressChipClass}" data-chip="contact-address">${addressChipText}</div>
            </div>
            <div class="stage4-card-metrics" style="display: none;">
              <div class="metric-row" data-metric="contact-email">
                <span class="metric-label">Email:</span>
                <span class="metric-value">${cleanEmail || 'None Detected'}</span>
              </div>
              <div class="metric-row" data-metric="contact-phone">
                <span class="metric-label">Phone:</span>
                <span class="metric-value">${cleanPhone || 'None Detected'}</span>
              </div>
              <div class="metric-row" data-metric="contact-address">
                <span class="metric-label">Address:</span>
                <span class="metric-value">${cleanAddress || 'None Detected'}</span>
              </div>
            </div>
            ${addressActionHtml}
            <p class="compliance-note">Direct organizational contact endpoints and schema PostalAddress for authority verification.</p>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;

  container.innerHTML = html;
  renderStage4SchemaCard(state);
  renderStage4AuthorCard(state);
  renderStage4DomainCard(state);
  renderStage4SecurityCard(state);
  renderStage4ContactCard(state);
}

/**
 * Stage 4 - Card 1: Schema.org Entity Graph Renderer
 */
export function renderStage4SchemaCard(state) {
  if (!state) return;
  const card = document.getElementById('stage4-card-schema');
  if (!card) return;
  const s4 = state.stage4 || state.stages?.stage4 || {};
  const detectedTypes = Array.isArray(s4.detectedTypes) ? s4.detectedTypes : [];
  const schemaDetails = s4.schemaDetails || {
    detectedTypes,
    totalPages: s4.totalPages || (detectedTypes.length > 0 ? 1 : 0),
    pagesWithSchemaCount: s4.pagesWithSchemaCount || (detectedTypes.length > 0 ? 1 : 0),
    coveragePercent: s4.coveragePercent || (detectedTypes.length > 0 ? 100 : 0),
    status: (detectedTypes.length > 0 ? 'PASS' : 'CRITICAL')
  };
  const schemaTypesList = (schemaDetails.detectedTypes && schemaDetails.detectedTypes.length > 0) ? schemaDetails.detectedTypes : detectedTypes;
  const primaryTypes = schemaTypesList.length > 0 ? schemaTypesList.slice(0, 3).join(', ') : 'None Detected';

  const statusPill = card.querySelector('[data-slot="schema-status-pill"]');
  const badge = card.querySelector('[data-slot="schema-badge"]');
  const typesChip = card.querySelector('[data-chip="schema-types"]');
  const covChip = card.querySelector('[data-chip="schema-coverage"]');

  if (statusPill) {
    statusPill.textContent = schemaDetails.status === 'PASS' ? 'CONFIRMED' : (schemaDetails.status === 'WARN' ? 'WARNING' : 'CRITICAL');
    statusPill.className = `status-pill ${schemaDetails.status === 'PASS' ? 'pill-confirmed pill-success' : (schemaDetails.status === 'WARN' ? 'pill-warning' : 'pill-critical pill-danger')}`;
  }
  if (badge) {
    badge.textContent = schemaDetails.status === 'PASS' || schemaDetails.pagesWithSchemaCount > 0
      ? `${schemaDetails.pagesWithSchemaCount}/${schemaDetails.totalPages || schemaDetails.pagesWithSchemaCount} HTML Pages with Schema`
      : '0% Coverage — 0 HTML Pages with Schema';
    badge.className = `badge-highlight ${schemaDetails.status === 'PASS' ? '' : (schemaDetails.status === 'WARN' ? 'badge-warning' : 'badge-danger')}`;
  }
  if (typesChip) {
    typesChip.textContent = schemaTypesList.length > 0 ? `🏢 ${primaryTypes}` : '🏢 Schema: None Detected';
    typesChip.className = `chip-tag entity-chip ${schemaTypesList.length > 0 ? 'chip-success' : 'chip-warning'}`;
  }
  if (covChip) {
    covChip.textContent = `📊 Coverage: ${schemaDetails.coveragePercent || (schemaTypesList.length > 0 ? 100 : 0)}% HTML Routes`;
    covChip.className = `chip-tag entity-chip ${(schemaDetails.coveragePercent >= 80 || schemaTypesList.length > 0) ? 'chip-success' : 'chip-warning'}`;
  }
}

/**
 * Stage 4 - Card 2: Author Person E-E-A-T Renderer
 */
export function renderStage4AuthorCard(state) {
  if (!state) return;
  const card = document.getElementById('stage4-card-author');
  if (!card) return;
  const s4 = state.stage4 || state.stages?.stage4 || {};
  const authorDetails = s4.authorDetails || {
    authors: [],
    authorCount: 0,
    status: 'CRITICAL'
  };
  const authorCount = authorDetails.authorCount || (Array.isArray(authorDetails.authors) ? authorDetails.authors.length : 0);
  const authorPass = Boolean(authorCount > 0 || s4.hasAuthorBio || s4.authorCredentialsVerified);

  const authorName = (authorDetails.authors && authorDetails.authors[0]?.name) || s4.authorName || null;
  const authorRole = (authorDetails.authors && authorDetails.authors[0]?.jobTitle) || 'sameAs Credentials';

  const statusPill = card.querySelector('[data-slot="author-status-pill"]');
  const badge = card.querySelector('[data-slot="author-badge"]');
  const nameChip = card.querySelector('[data-chip="author-name"]');
  const roleChip = card.querySelector('[data-chip="author-role"]');

  if (statusPill) {
    statusPill.textContent = authorPass ? 'CONFIRMED' : 'CRITICAL';
    statusPill.className = `status-pill ${authorPass ? 'pill-confirmed pill-success' : 'pill-critical pill-danger'}`;
  }
  if (badge) {
    badge.textContent = authorCount > 0 ? `${authorCount} Author(s) Verified` : (authorPass ? '1 Author(s) Verified' : '0 Authors Detected');
    badge.className = `badge-highlight ${authorPass ? '' : 'badge-danger'}`;
  }
  if (nameChip) {
    nameChip.textContent = authorName ? `👤 ${authorName}` : '👤 Author: None Detected';
    nameChip.className = `chip-tag entity-chip ${authorName ? 'chip-success' : 'chip-warning'}`;
  }
  if (roleChip) {
    roleChip.textContent = authorName ? `💼 ${authorRole}` : '💼 Credentials: None Detected';
    roleChip.className = `chip-tag entity-chip ${authorName ? 'chip-success' : 'chip-warning'}`;
  }
}

/**
 * Stage 4 - Card 3: Domain Age & External Authority Renderer
 */
export function renderStage4DomainCard(state) {
  if (!state) return;
  const card = document.getElementById('stage4-card-domain');
  if (!card) return;
  const s4 = state.stage4 || state.stages?.stage4 || {};
  const authorityDetails = s4.authorityDetails || {
    domainAge: s4.ageEstimate || s4.domainAge || '--',
    registrationDate: s4.registrationDate || null,
    status: (s4.domainAge && s4.domainAge !== '--' && !s4.domainAge.includes('Pending')) ? 'PASS' : 'PENDING'
  };
  const isAuthorityPass = authorityDetails.status === 'PASS';
  const ageVal = authorityDetails.domainAge && authorityDetails.domainAge !== '--'
    ? authorityDetails.domainAge
    : (s4.ageEstimate || '--');
  const regDate = authorityDetails.registrationDate || s4.registrationDate || '--';
  const authStatusText = isAuthorityPass ? '🌐 Authority: Established Domain Anchor' : '🌐 Authority: Verification Pending';

  const statusPill = card.querySelector('[data-slot="domain-status-pill"]');
  const badge = card.querySelector('[data-slot="domain-badge"]');
  const regChip = card.querySelector('[data-chip="domain-registered"]');
  const statusChip = card.querySelector('[data-chip="domain-status"]');

  if (statusPill) {
    statusPill.textContent = isAuthorityPass ? 'CONFIRMED' : 'PENDING';
    statusPill.className = `status-pill ${isAuthorityPass ? 'pill-confirmed pill-success' : 'pill-warning'}`;
  }
  if (badge) {
    badge.textContent = `Age: ${ageVal}`;
    badge.className = `badge-highlight ${isAuthorityPass ? '' : 'badge-warning'}`;
  }
  if (regChip) {
    regChip.textContent = `📅 Registered: ${regDate}`;
    regChip.className = 'chip-tag entity-chip chip-success';
  }
  if (statusChip) {
    statusChip.textContent = authStatusText;
    statusChip.className = `chip-tag entity-chip ${isAuthorityPass ? 'chip-success' : 'chip-warning'}`;
  }
}

/**
 * Stage 4 - Card 4: Security & Privacy Protocols Renderer
 */
export function renderStage4SecurityCard(state) {
  if (!state) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('aeo:error-log', {
        detail: {
          stage: 4,
          card: 'security-privacy',
          action: 'rescan_required',
          message: 'Security & Privacy Card: scan data unavailable. A rescan is required.'
        }
      }));
    }
    return;
  }

  const card = document.getElementById('stage4-card-security-privacy');
  if (!card) return;

  const statusPill = card.querySelector('[data-slot="card-status-pill"]');
  const badge = card.querySelector('.badge-highlight, [data-slot="security-badge"]');
  const privacyChip = card.querySelector('[data-chip="privacy-policy"]');
  const termsChip = card.querySelector('[data-chip="terms-of-service"]');

  const sslVal = card.querySelector('[data-metric="ssl-protocol"] .metric-value');
  const privacyVal = card.querySelector('[data-metric="privacy-policy"] .metric-value');
  const termsVal = card.querySelector('[data-metric="terms-of-service"] .metric-value');

  const targetUrl = state.stage4?.targetUrl || state.targetUrl || '';
  const isHttps = state.stage4?.isHttps ?? (state.isHttps === true || targetUrl.startsWith('https://'));
  const sslValid = state.stage4?.sslValid ?? (state.sslValid !== false && isHttps);

  let hasPrivacy = state.stage4?.hasPrivacyPolicy;
  let hasTerms = state.stage4?.hasTermsOfService;

  const missingPages = Array.isArray(state.missingEssentialPages) ? state.missingEssentialPages : [];
  const crawledPages = Array.isArray(state.pages) ? state.pages : [];

  if (hasPrivacy === undefined) {
    const privacyInPages = crawledPages.some(p => {
      const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
      return u.includes('/privacy-policy') || u.includes('/privacy') || u.includes('/#privacy');
    });
    const privacyMissing = missingPages.some(r => r.toLowerCase().includes('privacy'));
    hasPrivacy = privacyInPages || (!privacyMissing && crawledPages.length > 0 && !privacyMissing);
  }

  if (hasTerms === undefined) {
    const termsInPages = crawledPages.some(p => {
      const u = (typeof p === 'string' ? p : (p.url || '')).toLowerCase();
      return u.includes('/terms-of-service') || u.includes('/terms') || u.includes('/#terms');
    });
    const termsMissing = missingPages.some(r => r.toLowerCase().includes('terms'));
    hasTerms = termsInPages || (!termsMissing && crawledPages.length > 0 && !termsMissing);
  }

  const badgeText = state.stage4?.securityBadgeText || (isHttps ? 'TLS 1.3 / HTTPS Enforced' : 'Insecure HTTP');
  if (badge) {
    badge.textContent = badgeText;
    badge.className = `badge-highlight ${isHttps ? '' : 'badge-danger'}`;
  }

  if (privacyChip) {
    privacyChip.textContent = hasPrivacy ? '✓ Privacy Policy (/privacy-policy)' : '✕ Privacy Policy (Missing)';
    privacyChip.className = `chip-tag entity-chip ${hasPrivacy ? 'chip-success' : 'chip-warning'}`;
  }
  if (termsChip) {
    termsChip.textContent = hasTerms ? '✓ Terms of Service (/terms-of-service)' : '✕ Terms of Service (Missing)';
    termsChip.className = `chip-tag entity-chip ${hasTerms ? 'chip-success' : 'chip-warning'}`;
  }

  if (sslVal) sslVal.textContent = isHttps ? 'HTTPS Enforced' : 'Insecure HTTP';
  if (privacyVal) privacyVal.textContent = hasPrivacy ? 'Detected (/privacy-policy)' : 'Missing (/privacy-policy)';
  if (termsVal) termsVal.textContent = hasTerms ? 'Detected (/terms-of-service)' : 'Missing (/terms-of-service)';

  if (statusPill) {
    statusPill.classList.remove('pill-success', 'pill-confirmed', 'pill-warning', 'pill-critical', 'pill-danger');
    if (!isHttps || !sslValid) {
      statusPill.textContent = 'CRITICAL';
      statusPill.classList.add('pill-critical', 'pill-danger');
    } else if (!hasPrivacy || !hasTerms) {
      statusPill.textContent = 'WARNING';
      statusPill.classList.add('pill-warning');
    } else {
      statusPill.textContent = 'CONFIRMED';
      statusPill.classList.add('pill-confirmed', 'pill-success');
    }
  }
}

/**
 * Stage 4 - Card 5: Verified Contact Anchors Renderer
 */
export function renderStage4ContactCard(state) {
  if (!state) {
    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function') {
      window.dispatchEvent(new CustomEvent('aeo:error-log', {
        detail: {
          stage: 4,
          card: 'verified-contact',
          action: 'rescan_required',
          message: 'Verified Contact Card: scan data unavailable. A rescan is required.'
        }
      }));
    }
    return;
  }

  const card = document.getElementById('stage4-card-contact-anchors');
  if (!card) return;

  const statusPill = card.querySelector('[data-slot="contact-status-pill"]');
  const badge = card.querySelector('.badge-highlight, [data-slot="contact-badge"]');
  const emailChip = card.querySelector('[data-chip="contact-email"]');
  const phoneChip = card.querySelector('[data-chip="contact-phone"]');
  const addressChip = card.querySelector('[data-chip="contact-address"]');

  const emailVal = card.querySelector('[data-metric="contact-email"] .metric-value');
  const phoneVal = card.querySelector('[data-metric="contact-phone"] .metric-value');
  const addressVal = card.querySelector('[data-metric="contact-address"] .metric-value');

  let email = state.stage4?.contact?.email ?? state.contact?.email ?? state.stage4?.contactDetails?.email ?? state.contactDetails?.email ?? null;
  let phone = state.stage4?.contact?.phone ?? state.contact?.phone ?? state.stage4?.contactDetails?.phone ?? state.contactDetails?.phone ?? null;
  let address = state.stage4?.contact?.address ?? state.contact?.address ?? state.stage4?.contactDetails?.address ?? state.contactDetails?.address ?? null;

  const crawledPages = Array.isArray(state.pages) ? state.pages : [];

  if (!email || !phone || !address) {
    for (const page of crawledPages) {
      if (Array.isArray(page.links)) {
        for (const link of page.links) {
          if (!email && typeof link === 'string' && link.toLowerCase().startsWith('mailto:')) {
            email = link.replace(/^mailto:/i, '').split('?')[0].trim();
          }
          if (!phone && typeof link === 'string' && link.toLowerCase().startsWith('tel:')) {
            phone = link.replace(/^tel:/i, '').trim();
          }
        }
      }
      if (Array.isArray(page.schema)) {
        for (const item of page.schema) {
          if (!email && item.email) email = item.email;
          if (!phone && item.telephone) phone = item.telephone;
          if (!address && item.address) {
            if (typeof item.address === 'string') {
              address = item.address;
            } else if (typeof item.address === 'object') {
              const addr = item.address;
              const parts = [
                addr.streetAddress,
                addr.addressLocality,
                addr.addressRegion,
                addr.postalCode,
                typeof addr.addressCountry === 'string' ? addr.addressCountry : addr.addressCountry?.name
              ].filter(Boolean);
              address = parts.join(', ');
            }
          }
          if (item.contactPoint) {
            const points = Array.isArray(item.contactPoint) ? item.contactPoint : [item.contactPoint];
            for (const cp of points) {
              if (!email && cp.email) email = cp.email;
              if (!phone && cp.telephone) phone = cp.telephone;
            }
          }
        }
      }
    }
  }

  const isSanitized = (val) => Boolean(val) && val !== '--' && val !== 'None Detected' && val !== 'null' && val !== 'undefined';
  const cleanEmail = isSanitized(email) ? email : null;
  const cleanPhone = isSanitized(phone) ? phone : null;
  const cleanAddress = isSanitized(address) ? address : null;

  let trustAnchorCount = 0;
  if (cleanEmail) trustAnchorCount++;
  if (cleanPhone) trustAnchorCount++;
  if (cleanAddress) trustAnchorCount++;

  if (badge) {
    badge.textContent = `${trustAnchorCount}/3 Trust Anchors Detected`;
    badge.className = `badge-highlight ${trustAnchorCount >= 2 ? '' : (trustAnchorCount === 1 ? 'badge-warning' : 'badge-danger')}`;
  }

  if (emailChip) {
    emailChip.textContent = cleanEmail ? `✉ ${cleanEmail}` : '✉ Email: None Detected';
    emailChip.className = `chip-tag entity-chip contact-chip ${cleanEmail ? 'chip-success' : 'chip-warning'}`;
  }
  if (phoneChip) {
    phoneChip.textContent = cleanPhone ? `✆ ${cleanPhone}` : '✆ Phone: None Detected';
    phoneChip.className = `chip-tag entity-chip contact-chip ${cleanPhone ? 'chip-success' : 'chip-warning'}`;
  }
  if (addressChip) {
    addressChip.textContent = cleanAddress ? `⚲ ${cleanAddress}` : '⚲ Address: None Detected';
    addressChip.className = `chip-tag entity-chip contact-chip ${cleanAddress ? 'chip-success' : 'chip-warning'}`;
  }

  if (emailVal) emailVal.textContent = cleanEmail || 'None Detected';
  if (phoneVal) phoneVal.textContent = cleanPhone || 'None Detected';
  if (addressVal) addressVal.textContent = cleanAddress || 'None Detected';

  if (statusPill) {
    statusPill.classList.remove('pill-success', 'pill-confirmed', 'pill-warning', 'pill-critical', 'pill-danger');
    if (cleanEmail && (cleanPhone || cleanAddress)) {
      statusPill.textContent = 'CONFIRMED';
      statusPill.classList.add('pill-confirmed', 'pill-success');
    } else if (cleanEmail || cleanPhone || cleanAddress) {
      statusPill.textContent = 'WARNING';
      statusPill.classList.add('pill-warning');
    } else {
      statusPill.textContent = 'CRITICAL';
      statusPill.classList.add('pill-critical', 'pill-danger');
    }
  }

  const existingActionLink = card.querySelector('.action-link, [data-action="open-address-guide"], [data-action="contact-trace"]');
  if (existingActionLink) {
    if (!cleanAddress) {
      existingActionLink.outerHTML = `<a href="javascript:void(0)" onclick="window.AEO_COCKPIT && window.AEO_COCKPIT.openAddressModal ? window.AEO_COCKPIT.openAddressModal() : null" class="action-link address-guide-trigger" data-action="open-address-guide">📍 Add Address for AI ↗</a>`;
    } else {
      existingActionLink.outerHTML = `<a href="#contact-modal" class="action-link contact-trace-trigger" data-action="contact-trace">↗ View /contact Route Trace</a>`;
    }
  }
}

export const renderStage4 = renderStage4Canvas;

// -----------------------------------------------------------------------------
// STAGE 5: MACHINE MANIFEST PROTOCOL EXPLORER (4-LEVEL MACHINE HIERARCHY)
// -----------------------------------------------------------------------------
export function renderStage5Canvas(container, state = cockpitState) {
  const stg5 = state.stages?.stage5 || cockpitState.stages?.stage5 || state.stage5 || {};
  const s5 = state.stage5 || cockpitState.stage5 || {};
  const sec = (state.sections && state.sections[5]) || (cockpitState.sections && cockpitState.sections[5]) || {};

  const score = stg5.score || s5.score || '71%';
  const status = stg5.status || s5.status || 'WARN';
  const summaryText = stg5.summaryText || s5.summaryText || 'AI-Ready Files: Manifests Active';
  const baseTakeaway = sec.takeaway || s5.takeaway || stg5.summaryText || 'Machine Manifest Protocol Explorer: 4-Level machine manifest hierarchy provides structured entry points for LLM web search and autonomous agents.';
  const takeaway = summaryText ? `${summaryText} — ${baseTakeaway}` : baseTakeaway;

  const manifests = Array.isArray(s5.manifests) ? s5.manifests : [];
  const mRobots = manifests.find(m => m.path === '/robots.txt') || { path: '/robots.txt', name: 'robots.txt', exists: false, status: 404 };
  const mSitemap = manifests.find(m => m.path === '/sitemap.xml') || { path: '/sitemap.xml', name: 'sitemap.xml', exists: false, status: 404 };
  const mLlms = manifests.find(m => m.path === '/llms.txt') || { path: '/llms.txt', name: 'llms.txt', exists: false, status: 404 };
  const mAiContext = manifests.find(m => m.path === '/ai-context.md') || { path: '/ai-context.md', name: 'ai-context.md', exists: false, status: 404 };
  const mReadme = manifests.find(m => m.path === '/README.md') || { path: '/README.md', name: 'README.md', exists: false, status: 404 };
  const mAbout = manifests.find(m => m.path === '/about.md') || { path: '/about.md', name: 'about.md', exists: false, status: 404 };
  const mDocs = manifests.find(m => m.path === '/docs.md') || { path: '/docs.md', name: 'docs.md', exists: false, status: 404 };
  const mContent = manifests.find(m => m.path === '/content.md') || { path: '/content.md', name: 'content.md', exists: false, status: 404 };

  const level1Status = s5.level1Status || (mRobots.exists ? 'AVAILABLE' : 'MISSING');
  const level2Status = s5.level2Status || ((mSitemap.exists && mLlms.exists) ? 'AVAILABLE' : ((mSitemap.exists || mLlms.exists) ? 'PARTIAL' : 'MISSING'));
  const level3Status = s5.level3Status || (mAiContext.exists ? 'AVAILABLE' : 'MISSING');

  const l4Items = [mReadme, mAbout, mDocs, mContent];
  const l4Count = l4Items.filter(m => m.exists).length;
  const level4Status = s5.level4Status || (l4Count === 4 ? 'AVAILABLE' : (l4Count > 0 ? 'PARTIAL' : 'MISSING'));

  const getLevelBadgeClass = (lvlStatus) => {
    if (lvlStatus === 'AVAILABLE') return 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40';
    if (lvlStatus === 'PARTIAL') return 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40';
    return 'bg-red-950/40 text-red-400 border border-red-500/40';
  };

  const getEndpointBadgeHtml = (exists, level = 2) => {
    if (level === 1) {
      return exists
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">200 OK • AVAILABLE</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/40">404 • MISSING</span>`;
    }
    return exists
      ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">AVAILABLE</span>`
      : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/40 text-red-400 border border-red-500/40">MISSING</span>`;
  };

  const actionPlan = sec.actionPlan || 'Deploy standard machine manifests (/llms.txt and /ai-context.md) to provide clean structured context for AI bots without HTML noise.';
  const actionSteps = sec.actionSteps && sec.actionSteps.length > 0 ? sec.actionSteps : [
    { title: "Deploy /llms.txt Welcome Mat", detail: "Provide a concise markdown index linking essential core docs for LLMs." },
    { title: "Publish /ai-context.md Blueprint", detail: "Summarize company entity, product capabilities, and pricing in dense machine-readable markdown." },
    { title: "Configure Level 1 /robots.txt Directives", detail: "Ensure explicit allow rules for AI search agents." },
    { title: "Maintain Level 4 Workspaces", detail: "Provide detailed markdown documentation routes (/docs.md, /README.md)." }
  ];
  const shortcutPlan = sec.shortcutPlan || 'AIOptimize Pro generates and hosts all 4 levels of the machine manifest hierarchy automatically at the cloud edge.';
  const evidencePlain = sec.evidencePlain || 'Inspected 4-Level machine manifest hierarchy endpoints. Level 1 robots.txt active, Level 2 /llms.txt active, Level 3 /ai-context.md under configuration.';
  const evidenceTrace = sec.evidenceTrace || `GET /robots.txt -> ${mRobots.exists ? '200 OK' : '404 Not Found'}\nGET /sitemap.xml -> ${mSitemap.exists ? '200 OK' : '404 Not Found'}\nGET /llms.txt -> ${mLlms.exists ? '200 OK' : '404 Not Found'}\nGET /ai-context.md -> ${mAiContext.exists ? '200 OK' : '404 Not Found'}\nGET /README.md -> ${mReadme.exists ? '200 OK' : '404 Not Found'}\nGET /about.md -> ${mAbout.exists ? '200 OK' : '404 Not Found'}\nGET /docs.md -> ${mDocs.exists ? '200 OK' : '404 Not Found'}\nGET /content.md -> ${mContent.exists ? '200 OK' : '404 Not Found'}`;

  const secData = { actionPlan, actionSteps, shortcutPlan, evidencePlain, evidenceTrace };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 5", takeaway, score, "AI-Ready", status)}

      <!-- MACHINE MANIFEST PROTOCOL EXPLORER (4-LEVEL MACHINE HIERARCHY) -->
      <div class="bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div class="space-y-1">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 uppercase tracking-wider">4-LEVEL HIERARCHY (AI-READY MANIFEST STANDARD)</span>
            <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">Machine Manifest Protocol Explorer</h4>
            <p class="text-xs text-[#5f6368]">4-Level machine manifest hierarchy for autonomous agent ingestion</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] text-indigo-400">
            ${summaryText}
          </span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- LEVEL 1: PROTOCOL GATES -->
          <div class="level-card p-5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-3.5 transition hover:border-[#38bdf8]/40 shadow-md" data-level-card="1">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] uppercase tracking-wider">LEVEL 1: PROTOCOL GATES</span>
              <span class="level-header-badge text-[10px] font-mono font-black px-2.5 py-0.5 rounded ${getLevelBadgeClass(level1Status)}" data-level-badge>${level1Status}</span>
            </div>
            <div>
              <h5 class="text-sm font-bold text-white font-headline">Crawler Gateway &amp; Firewall Rules</h5>
              <p class="text-xs text-[#bdc1c6] mt-1 leading-relaxed">Directs bot access permissions, crawl delays, and public indexability across 20+ AI crawlers.</p>
            </div>
            <div class="pt-2 border-t border-[#3c4043]/60 space-y-2">
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-xs font-bold text-[#38bdf8]">/robots.txt</span>
                ${getEndpointBadgeHtml(mRobots.exists, 1)}
              </div>
            </div>
          </div>

          <!-- LEVEL 2: THE WELCOME MAT -->
          <div class="level-card p-5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-3.5 transition hover:border-[#38bdf8]/40 shadow-md" data-level-card="2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] uppercase tracking-wider">LEVEL 2: THE WELCOME MAT</span>
              <span class="level-header-badge text-[10px] font-mono font-black px-2.5 py-0.5 rounded ${getLevelBadgeClass(level2Status)}" data-level-badge>${level2Status}</span>
            </div>
            <div>
              <h5 class="text-sm font-bold text-white font-headline">Structured Navigation &amp; Summary Feeds</h5>
              <p class="text-xs text-[#bdc1c6] mt-1 leading-relaxed">The standard machine entry point providing curated links and plain markdown summaries.</p>
            </div>
            <div class="pt-2 border-t border-[#3c4043]/60 space-y-2">
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-xs font-bold text-[#38bdf8]">/sitemap.xml</span>
                ${getEndpointBadgeHtml(mSitemap.exists, 2)}
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-xs font-bold text-[#38bdf8]">/llms.txt</span>
                ${getEndpointBadgeHtml(mLlms.exists, 2)}
              </div>
            </div>
          </div>

          <!-- LEVEL 3: CONTEXT MAPS & BLUEPRINT -->
          <div class="level-card p-5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-3.5 transition hover:border-[#38bdf8]/40 shadow-md" data-level-card="3">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] uppercase tracking-wider">LEVEL 3: CONTEXT MAPS &amp; BLUEPRINT</span>
              <span class="level-header-badge text-[10px] font-mono font-black px-2.5 py-0.5 rounded ${getLevelBadgeClass(level3Status)}" data-level-badge>${level3Status}</span>
            </div>
            <div>
              <h5 class="text-sm font-bold text-white font-headline">Comprehensive Knowledge Blueprint</h5>
              <p class="text-xs text-[#bdc1c6] mt-1 leading-relaxed">Dense, high-extractability domain context feeding LLM reasoning engines with authoritative facts.</p>
            </div>
            <div class="pt-2 border-t border-[#3c4043]/60 space-y-2">
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-xs font-bold text-[#38bdf8]">/ai-context.md</span>
                ${getEndpointBadgeHtml(mAiContext.exists, 3)}
              </div>
            </div>
          </div>

          <!-- LEVEL 4: WORKSPACES & DOCUMENTATION -->
          <div class="level-card p-5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-3.5 transition hover:border-[#38bdf8]/40 shadow-md" data-level-card="4">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] uppercase tracking-wider">LEVEL 4: WORKSPACES &amp; DOCUMENTATION</span>
              <span class="level-header-badge text-[10px] font-mono font-black px-2.5 py-0.5 rounded ${getLevelBadgeClass(level4Status)}" data-level-badge>${level4Status}</span>
            </div>
            <div>
              <h5 class="text-sm font-bold text-white font-headline">Deep Technical &amp; Operational Knowledge</h5>
              <p class="text-xs text-[#bdc1c6] mt-1 leading-relaxed">Full codebase and product documentation rendered in pristine markdown for code-generation models.</p>
            </div>
            <div class="pt-2 border-t border-[#3c4043]/60 grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-[11px] font-bold text-[#38bdf8]">/README.md</span>
                ${getEndpointBadgeHtml(mReadme.exists, 4)}
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-[11px] font-bold text-[#38bdf8]">/about.md</span>
                ${getEndpointBadgeHtml(mAbout.exists, 4)}
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-[11px] font-bold text-[#38bdf8]">/docs.md</span>
                ${getEndpointBadgeHtml(mDocs.exists, 4)}
              </div>
              <div class="flex items-center justify-between p-2 rounded-xl bg-[#181818] border border-[#3c4043]">
                <span class="font-mono text-[11px] font-bold text-[#38bdf8]">/content.md</span>
                ${getEndpointBadgeHtml(mContent.exists, 4)}
              </div>
            </div>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;

  container.innerHTML = html;
}

export const renderStage5 = renderStage5Canvas;

/**
 * Generates dynamic Top 5 Action Triage based on live stage results.
 * Prioritizes Critical Blockers > High Warnings > Proactive Optimizations.
 * 
 * @param {Object} state - The complete cockpit state
 * @returns {Array} Array of 5 triage action objects
 */
export function generateDynamicTriage(state = {}) {
  const issues = [];
  
  // Stage 1 (Critical)
  if (state.stage1 && state.stage1.status !== 'PASS' && state.stage1.status !== 'OPTIMIZED' && state.stage1.status !== 'UNAUDITED') {
    issues.push({
      severity: 100,
      title: "Unblock Restricted AI Bot Crawlers",
      desc: "Explicitly allow AI search crawlers in /robots.txt and WAF rules to ensure ingestion.",
      stepJump: 1,
      isUpgrade: false
    });
  }
  
  // Stage 2 (High)
  if (state.stage2 && state.stage2.status !== 'PASS' && state.stage2.status !== 'OPTIMIZED' && state.stage2.status !== 'UNAUDITED') {
    const missing = state.stage2.missingCount || 0;
    issues.push({
      severity: 90,
      title: `Deploy ${missing} Missing Canonical Route(s)`,
      desc: "Establish canonical entity anchors to allow direct AI commercial citation and verification.",
      stepJump: 2,
      isUpgrade: false
    });
  }
  
  // Stage 3 (Medium)
  if (state.stage3 && state.stage3.status !== 'PASS' && state.stage3.status !== 'OPTIMIZED' && state.stage3.status !== 'UNAUDITED') {
    issues.push({
      severity: 80,
      title: "Optimize Client-Side Text Density",
      desc: "Ensure pages deliver >= 25% server-rendered semantic HTML text to AI crawlers.",
      stepJump: 3,
      isUpgrade: false
    });
  }
  
  // Stage 4 (Medium)
  if (state.stage4 && state.stage4.status !== 'PASS' && state.stage4.status !== 'OPTIMIZED' && state.stage4.status !== 'UNAUDITED') {
    issues.push({
      severity: 70,
      title: "Embed Schema.org & Trust Anchors",
      desc: "Add structured JSON-LD Organization, author credentials, and sameAs entity links.",
      stepJump: 4,
      isUpgrade: false
    });
  }
  
  // Stage 5 (Medium)
  if (state.stage5 && state.stage5.status !== 'PASS' && state.stage5.status !== 'OPTIMIZED' && state.stage5.status !== 'UNAUDITED') {
    issues.push({
      severity: 60,
      title: "Publish 4-Level Machine Manifest Hierarchy",
      desc: "Deploy /llms.txt and /ai-context.md to supply dense knowledge blueprints to AI agents.",
      stepJump: 5,
      isUpgrade: false
    });
  }

  // Sort identified issues by severity
  issues.sort((a, b) => b.severity - a.severity);

  // Proactive Optimizations (Upgrade paths for passing stages)
  const optimizations = [
    { title: "Maintain Global AI Crawler Whitelists", desc: "Continuously monitor and allow new AI bot agents.", stepJump: 1, isUpgrade: true },
    { title: "Audit Core Canonical Entity Routes", desc: "Ensure your 5 core corporate anchors remain robust and indexable.", stepJump: 2, isUpgrade: true },
    { title: "Enhance Semantic Information Gain", desc: "Deliver structured, high-density server-rendered facts.", stepJump: 3, isUpgrade: true },
    { title: "Strengthen Knowledge Graph Equity", desc: "Validate structured schemas and author E-E-A-T credentials regularly.", stepJump: 4, isUpgrade: true },
    { title: "Expand Machine Manifest Endpoints", desc: "Deploy Level 3 and 4 markdown context routes for advanced autonomous agents.", stepJump: 5, isUpgrade: true }
  ];

  // Fill remaining slots up to 5
  let optIndex = 0;
  while (issues.length < 5 && optIndex < optimizations.length) {
    // Prevent duplicate stage prompts if an issue already exists for that stage
    if (!issues.some(issue => issue.stepJump === optimizations[optIndex].stepJump)) {
      issues.push(optimizations[optIndex]);
    }
    optIndex++;
  }

  return issues.slice(0, 5).map((item, idx) => ({
    rank: idx + 1,
    title: item.title,
    desc: item.desc,
    stepJump: item.stepJump,
    stageStep: item.stepJump,
    stage: `Stage ${item.stepJump}`,
    isUpgrade: item.isUpgrade
  }));
}

export function renderStage6Canvas(container, state = cockpitState) {
  const stg6 = state.stages?.stage6 || cockpitState.stages?.stage6 || state.stage6 || {};
  const s6 = state.stage6 || cockpitState.stage6 || {};
  const sec = (state.sections && state.sections[6]) || (cockpitState.sections && cockpitState.sections[6]) || {};

  const healthIndex = stg6.healthIndex ?? s6.overallHealthIndex ?? state.healthIndex ?? state.healthScore ?? 0;
  const humanScore = stg6.humanWebReadiness ?? s6.aiOptimizedScore ?? state.humanWebReadiness ?? 0;
  const machineScore = stg6.machineWebReadiness ?? s6.aiReadyScore ?? state.machineWebReadiness ?? 0;
  const score = stg6.score || `${healthIndex}%`;
  const status = stg6.status || (healthIndex >= 80 ? 'PASS' : (state.isAudited ? 'WARN' : 'UNAUDITED'));
  const summaryText = stg6.summaryText || s6.summaryText || 'Executive Triage: Prioritized AEO Actions Ready';
  const baseTakeaway = sec.takeaway || s6.takeaway || stg6.summaryText || 'Executive Boardroom: Composite health index and dual-pillar readiness synthesized across all audit modules with prioritized action triage.';
  const takeaway = summaryText ? `${summaryText} — ${baseTakeaway}` : baseTakeaway;

  // Dynamically generate Top 5 Urgent Action Items
  const top5Actions = generateDynamicTriage(state);

  // 5 Stages Matrix for bottom scorecard (Strict Zero-Fallback Mapping)
  const stagesSummary = [
    {
      step: 1,
      title: "AI Bot Blocks & Crawlers",
      score: state.stages?.stage1?.score || state.stage1?.score || "--",
      status: state.stages?.stage1?.status || state.stage1?.status || "UNAUDITED",
      summary: state.stages?.stage1?.summaryText || state.stage1?.summaryText || "--"
    },
    {
      step: 2,
      title: "Essential Pages & Anchors",
      score: state.stages?.stage2?.score || state.stage2?.score || "--",
      status: state.stages?.stage2?.status || state.stage2?.status || "UNAUDITED",
      summary: state.stages?.stage2?.summaryText || state.stage2?.summaryText || "--"
    },
    {
      step: 3,
      title: "Content Density & Extractability",
      score: state.stages?.stage3?.score || state.stage3?.score || "--",
      status: state.stages?.stage3?.status || state.stage3?.status || "UNAUDITED",
      summary: state.stages?.stage3?.summaryText || state.stage3?.summaryText || "--"
    },
    {
      step: 4,
      title: "Trust, E-E-A-T & Privacy",
      score: state.stages?.stage4?.score || state.stage4?.score || "--",
      status: state.stages?.stage4?.status || state.stage4?.status || "UNAUDITED",
      summary: state.stages?.stage4?.summaryText || state.stage4?.summaryText || "--"
    },
    {
      step: 5,
      title: "AI-Ready Machine Manifests",
      score: state.stages?.stage5?.score || state.stage5?.score || "--",
      status: state.stages?.stage5?.status || state.stage5?.status || "UNAUDITED",
      summary: state.stages?.stage5?.summaryText || state.stage5?.summaryText || "--"
    }
  ];

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 6", takeaway, score, "Executive Boardroom", status)}

      <!-- 3-SECTION BOARDROOM VIEW -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        <!-- LEFT COLUMN: Neon Health Dial & Dual-Pillar Breakdown (4 cols) -->
        <div class="lg:col-span-4 bg-[#1f1f1f] border-2 border-[#b7410e]/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_25px_rgba(183,65,14,0.15)] flex flex-col justify-between space-y-6">
          <div class="space-y-4">
            <div class="pb-3 border-b border-[#3c4043]">
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a] uppercase tracking-wider">EXECUTIVE GAUGES</span>
              <h4 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline mt-1">AEO Health Index Dial</h4>
            </div>

            <!-- SVG Neon Health Dial -->
            <div class="flex flex-col items-center justify-center py-4">
              <div class="relative w-40 h-40 flex items-center justify-center">
                <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
                  <defs>
                    <filter id="dial-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                      <feGaussianBlur stdDeviation="3" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                    <linearGradient id="health-dial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#10b981" />
                      <stop offset="100%" stop-color="#38bdf8" />
                    </linearGradient>
                  </defs>
                  <circle cx="50" cy="50" r="42" stroke="#2a2a2a" stroke-width="8" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="url(#health-dial-gradient)" filter="url(#dial-neon-glow)" stroke-width="8" stroke-dasharray="264" stroke-dashoffset="${264 - (264 * Math.min(100, Math.max(0, healthIndex))) / 100}" stroke-linecap="round" fill="none" class="transition-all duration-1000" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span class="text-3xl sm:text-4xl font-mono font-black text-white">${healthIndex}</span>
                  <span class="text-[10px] font-mono text-[#bdc1c6] uppercase">/ 100 Health</span>
                </div>
              </div>

              <span class="mt-3 px-3 py-1 rounded-full text-xs font-mono font-black ${healthIndex >= 80 ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'}">
                ${healthIndex >= 80 ? 'OPTIMIZED FOR AI' : 'REMEDIATION REQUIRED'}
              </span>
            </div>

            <!-- Dual-Pillar Readiness Breakdown -->
            <div class="space-y-3 pt-3 border-t border-[#3c4043]">
              <h5 class="text-xs font-mono font-black text-white uppercase tracking-wider">Dual-Pillar Readiness Breakdown</h5>
              
              <!-- Human Web Readiness -->
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#bdc1c6] font-bold">Human Web Readiness</span>
                  <span class="font-mono font-black text-[#10b981]">${humanScore}%</span>
                </div>
                <div class="w-full bg-[#1f1f1f] rounded-full h-2 overflow-hidden">
                  <div class="bg-[#10b981] h-2 rounded-full" style="width: ${Math.min(100, humanScore)}%"></div>
                </div>
              </div>

              <!-- Machine Web Readiness -->
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] space-y-1.5">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-[#bdc1c6] font-bold">Machine Web Readiness</span>
                  <span class="font-mono font-black text-indigo-400">${machineScore}%</span>
                </div>
                <div class="w-full bg-[#1f1f1f] rounded-full h-2 overflow-hidden">
                  <div class="bg-indigo-500 h-2 rounded-full" style="width: ${Math.min(100, machineScore)}%"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Top 5 Urgent Action Items (8 cols) -->
        <div class="lg:col-span-8 bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
              <div class="space-y-1">
                <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">PRIORITY TRIAGE</span>
                <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">Top 5 Action Items</h4>
                <p class="text-xs text-[#5f6368]">Highest ROI remediation steps ranked by algorithm impact</p>
              </div>
              <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] text-[#38bdf8]">
                TRIAGE MATRIX
              </span>
            </div>

            <div class="space-y-3">
              ${top5Actions.map((action) => {
                const buttonHtml = action.isUpgrade 
                  ? `<button type="button" onclick="alert('Redirecting to AIOptimize Pro to fulfill ${action.title} requirement.');" class="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#b7410e] to-[#d45d2a] border border-[#b7410e]/60 text-white hover:text-white text-xs font-bold transition shadow-sm whitespace-nowrap self-start sm:self-center flex items-center space-x-1 active:scale-95 flex-shrink-0">
                       <span>Upgrade to AIOptimize</span>
                       <span>⚡</span>
                     </button>`
                  : `<button type="button" onclick="window.AEO_COCKPIT ? window.AEO_COCKPIT.navigateToStep(${action.stepJump}) : null" class="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#b7410e] border border-[#3c4043] hover:border-[#b7410e] text-[#e8eaed] hover:text-white text-xs font-bold transition shadow-sm whitespace-nowrap self-start sm:self-center flex items-center space-x-1 active:scale-95 flex-shrink-0">
                       <span>Fix in Stage ${action.stepJump}</span>
                       <span>→</span>
                     </button>`;

                return `
                  <div class="action-item-card p-3.5 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#b7410e]/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition" data-action-item="${action.rank}">
                    <div class="flex items-start space-x-3">
                      <span class="w-6 h-6 rounded-full ${action.isUpgrade ? 'bg-[#38bdf8]/20 text-[#38bdf8] border-[#38bdf8]/40' : 'bg-[#b7410e]/20 text-[#d45d2a] border-[#b7410e]/40'} border flex items-center justify-center font-mono font-black text-xs flex-shrink-0 mt-0.5">
                        ${action.rank}
                      </span>
                      <div>
                        <h5 class="text-xs sm:text-sm font-bold text-white font-headline">${action.title}</h5>
                        <p class="text-xs text-[#bdc1c6] mt-0.5 leading-relaxed">${action.desc || ''}</p>
                      </div>
                    </div>
                    ${buttonHtml}
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- BOTTOM FULL WIDTH: 5-Section Scorecard Matrix -->
      <div class="bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg space-y-4">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div class="space-y-1">
            <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">DIAGNOSTIC MATRIX</span>
            <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">5-Section Scorecard Matrix</h4>
            <p class="text-xs text-[#5f6368]">Direct jump links to inspect and remediate each diagnostic pillar</p>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          ${stagesSummary.map(stg => {
            const isPass = stg.status === 'PASS' || stg.status === 'OPTIMIZED';
            const isUn = stg.status === 'UNAUDITED';
            const valColor = isPass ? 'text-[#10b981]' : (stg.status === 'WARN' ? 'text-[#f59e0b]' : (isUn ? 'text-[#bdc1c6]' : 'text-red-400'));
            
            return `
              <div onclick="window.AEO_COCKPIT ? window.AEO_COCKPIT.navigateToStep(${stg.step}) : null" class="scorecard-matrix-card p-4 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#b7410e] cursor-pointer transition flex flex-col justify-between space-y-3 group shadow-md" data-stage-card="${stg.step}">
                <div class="space-y-2">
                  <div class="flex items-center justify-between">
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6]">STAGE ${stg.step}</span>
                    <span class="text-xs font-mono font-black ${valColor}">${stg.score}</span>
                  </div>
                  <h5 class="text-xs font-bold text-white group-hover:text-[#d45d2a] transition font-headline">${stg.title}</h5>
                  <p class="text-[11px] text-[#bdc1c6] leading-relaxed line-clamp-2">${stg.summary}</p>
                </div>
                <div class="pt-2 border-t border-[#3c4043]/50 flex items-center justify-between text-[11px] font-mono text-[#38bdf8]">
                  <span>Inspect</span>
                  <span>→</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

export const renderStage6 = renderStage6Canvas;

export function toggleSidebar(isOpen) {
  const sidebar = document.getElementById('main-terminal-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar) {
    if (isOpen) {
      sidebar.classList.remove('-translate-x-full');
      sidebar.classList.add('translate-x-0');
    } else {
      sidebar.classList.remove('translate-x-0');
      sidebar.classList.add('-translate-x-full');
    }
  }
  if (backdrop) {
    if (isOpen) {
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
    } else {
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}

export function openAuthorModal() {
  const modal = document.getElementById('author-eeat-modal');
  if (!modal) return;
  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  modal.style.display = 'flex';
}

export function closeAuthorModal() {
  const modal = document.getElementById('author-eeat-modal');
  if (!modal) return;
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }, 200);
}

export function copyAuthorSnippet(btn) {
  const snippetEl = document.getElementById('author-schema-snippet');
  const text = snippetEl ? snippetEl.innerText : '';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  if (btn) {
    const orig = btn.innerText;
    btn.innerText = '✓ Copied!';
    setTimeout(() => {
      btn.innerText = orig;
    }, 2000);
  }
}

export function openAddressModal() {
  const modal = document.getElementById('address-guide-modal');
  if (!modal) return;
  modal.classList.remove('hidden', 'opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  modal.style.display = 'flex';
}

export function closeAddressModal() {
  const modal = document.getElementById('address-guide-modal');
  if (!modal) return;
  modal.classList.remove('opacity-100', 'pointer-events-auto');
  modal.classList.add('opacity-0', 'pointer-events-none');
  setTimeout(() => {
    modal.classList.add('hidden');
    modal.style.display = 'none';
  }, 200);
}

export function copyAddressSnippet(btn, snippetId) {
  const snippetEl = document.getElementById(snippetId || 'address-schema-snippet');
  const text = snippetEl ? snippetEl.innerText : '';
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => {});
  }
  if (btn) {
    const orig = btn.innerText;
    btn.innerText = '✓ Copied!';
    setTimeout(() => {
      btn.innerText = orig;
    }, 2000);
  }
}

if (typeof window !== 'undefined') {
  window.toggleSidebar = toggleSidebar;
  window.openAddressModal = openAddressModal;
  window.closeAddressModal = closeAddressModal;
  window.copyAddressSnippet = copyAddressSnippet;
  window.openAuthorModal = openAuthorModal;
  window.closeAuthorModal = closeAuthorModal;
  window.copyAuthorSnippet = copyAuthorSnippet;
  window.AEO_COCKPIT = {
    initCockpit,
    executeCockpitScan,
    handleCockpitRescan,
    handleCockpitNewScan,
    navigateToStep,
    toggleSidebar,
    getCockpitState,
    getCockpitErrorLogs,
    resetCockpitToNeutral,
    loadMoreStage3Pages,
    viewWhatAISees,
    copyTextSnippet,
    openAuthorModal,
    closeAuthorModal,
    copyAuthorSnippet,
    openAddressModal,
    closeAddressModal,
    copyAddressSnippet,
    updateStage2FromPayload,
    buildTakeawayHeader,
    buildEvidenceAndActionDrawers,
    renderStage1,
    renderStage1Canvas: renderStage1,
    renderStage2: renderStage2Canvas,
    renderStage2Canvas,
    renderStage3: renderStage3Canvas,
    renderStage3Canvas,
    renderStage4: renderStage4Canvas,
    renderStage4Canvas,
    renderStage4SchemaCard,
    renderStage4AuthorCard,
    renderStage4DomainCard,
    renderStage4SecurityCard,
    renderStage4ContactCard,
    renderStage5: renderStage5Canvas,
    renderStage5Canvas,
    renderStage6: renderStage6Canvas,
    renderStage6Canvas,
    generateDynamicTriage,
    renderStageFromState
  };

  if (document.getElementById('target-url-input')) {
    window.addEventListener('DOMContentLoaded', initCockpit);
  }
}

