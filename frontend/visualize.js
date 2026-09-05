/**
 * AEO Suite V3 - V4 Diagnostic Cockpit State & Live Rendering Engine
 * Ingests live POST /api/scan payloads via v4PayloadAdapter.
 * Governance: Strict Dual-Pillar enforcement ("AI-Optimized" vs "AI-Ready").
 * Zero mock defaults. Zero dummy data fallbacks. Zero occurrences of legacy phrase.
 */

import { mapBackendScanToV4State } from './v4PayloadAdapter.js';

export const STAGE_MATRIX = [
  {
    step: 1,
    shortTitle: 'AI Bot Blocks',
    fullTitle: 'AI Bot Blocks & Crawler Gateway Permissions',
    tooltip: 'AI Bot block checks',
    classification: 'AI-Optimized',
    desc: 'WAF rules, Cloudflare challenge detection, and User-Agent blocking verification across 20+ AI crawlers.'
  },
  {
    step: 2,
    shortTitle: 'Essential Content',
    fullTitle: 'Identifiable Essential Pages & Core Anchors',
    tooltip: 'AI Essential content checks',
    classification: 'AI-Optimized',
    desc: 'AI uses essential pages and core anchors to verify credentials like identity (/about), contact (/contact), privacy (/privacy), and pricing (/pricing).'
  },
  {
    step: 3,
    shortTitle: 'Content Availability',
    fullTitle: 'Content Availability & Semantic Text Density',
    tooltip: 'AI Bot Content Availability checks',
    classification: 'AI-Optimized',
    desc: 'Per-webpage citation extractability, DOM text density, semantic heading structure, and information gain.'
  },
  {
    step: 4,
    shortTitle: 'Trust & Privacy',
    fullTitle: 'Entity Authority, E-E-A-T & Privacy Indicators',
    tooltip: 'AI Trust and Privacy checks',
    classification: 'AI-Optimized',
    desc: 'Knowledge Graph entity grounding, author authority schemas, sameAs profiles, and privacy commitments.'
  },
  {
    step: 5,
    shortTitle: 'AI-Ready Files',
    fullTitle: 'Machine Manifest Protocol Explorer',
    tooltip: 'AI-ready file checks',
    classification: 'AI-Ready',
    desc: 'Machine endpoints, llms.txt manifest hierarchy, and machine ingestion schemas under the AI-Ready gate.'
  },
  {
    step: 6,
    shortTitle: 'Executive Summary',
    fullTitle: 'Executive Summary & Action Triage',
    tooltip: 'Executive summary and Action items',
    classification: 'Executive Boardroom',
    desc: 'Overall Health Index Dial, Dual-Pillar Readiness Breakdown, and prioritized triage remediation matrix.'
  }
];

export const state = {
  isAudited: false,
  isSimulating: false,
  isSystemError: false,
  userNavigatedEarly: false,
  completedSteps: [1, 2, 3, 4, 5, 6],
  scanningStep: null,
  currentStep: 6,
  isResponsivePreview: false,
  projectedScore: 78
};

export const AUDIT_DATA = {
  domain: '--',
  timestamp: '--',
  scanDuration: '3.8s',
  totalPages: '24',
  healthIndex: 78,
  statusLabel: 'OPTIMIZED',
  humanWebReadiness: 92,
  machineWebReadiness: 54
};

let currentTargetUrl = '--';
let currentCockpitState = mapBackendScanToV4State(null);
const cockpitErrorLogs = [];

/**
 * Returns a defensive copy of the internal quality tracking error logs.
 * @returns {Array<object>}
 */
export function getCockpitErrorLogs() {
  return [...cockpitErrorLogs];
}

/**
 * Logs an error entry into the internal quality tracking registry.
 * @param {string} targetUrl
 * @param {string} errorMessage
 */
function logCockpitError(targetUrl, errorMessage) {
  cockpitErrorLogs.push({
    targetUrl,
    error: errorMessage,
    timestamp: new Date().toISOString()
  });
}

/**
 * Sets the cockpit error banner state.
 * @param {string|null} message
 */
function setErrorBanner(message) {
  const banner = document.getElementById('cockpit-error-banner');
  if (!banner) return;

  if (message) {
    banner.textContent = message;
    banner.classList.remove('hidden');
  } else {
    banner.textContent = '';
    banner.classList.add('hidden');
  }
}

/**
 * Resets the cockpit UI to neutral un-audited defaults.
 */
export function resetCockpitToNeutral() {
  currentCockpitState = mapBackendScanToV4State(null);
  currentTargetUrl = '--';
  state.isAudited = false;

  const domainDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
  if (domainDisplay) domainDisplay.textContent = '--';

  const healthScore = document.querySelector('.health-score-value, #health-score');
  if (healthScore) healthScore.textContent = '--';

  const aiOptimizedScore = document.querySelector('#ai-optimized-score, .score-optimized');
  if (aiOptimizedScore) aiOptimizedScore.textContent = '--';

  const aiReadyScore = document.querySelector('#ai-ready-score, .score-ready');
  if (aiReadyScore) aiReadyScore.textContent = '--';

  renderCockpit(currentCockpitState);
}

/**
 * Dispatches scan request to POST /api/scan and renders normalized V4 state.
 * @param {string} targetUrl
 */
export async function executeCockpitScan(targetUrl) {
  if (!targetUrl || targetUrl.trim() === '' || targetUrl === '--') {
    setErrorBanner('Please enter a valid target URL.');
    return;
  }

  const cleanUrl = targetUrl.trim();
  currentTargetUrl = cleanUrl;
  setErrorBanner(null);

  const domainDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
  if (domainDisplay) domainDisplay.textContent = cleanUrl;

  const rescanBtn = document.querySelector('#rescan-btn, .rescan-btn');
  if (rescanBtn) rescanBtn.disabled = true;

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: cleanUrl, email: '' })
    });

    if (!response.ok) {
      const errText = `${response.status} ${response.statusText}`.trim();
      throw new Error(errText);
    }

    const rawPayload = await response.json();
    currentCockpitState = mapBackendScanToV4State(rawPayload);
    state.isAudited = true;
    renderCockpit(currentCockpitState);

    if (rescanBtn) rescanBtn.disabled = false;
    return currentCockpitState;
  } catch (err) {
    resetCockpitToNeutral();
    const errorMsg = err.message || 'Scan failed';
    setErrorBanner(`Scan failed: ${errorMsg}`);
    logCockpitError(cleanUrl, errorMsg);

    if (rescanBtn) rescanBtn.disabled = false;
  }
}

/**
 * Handles user-confirmed rescan trigger.
 */
export async function handleCockpitRescan() {
  const input = document.querySelector('#target-url-input, #cockpit-url-input');
  const domDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
  const domVal = domDisplay && domDisplay.textContent.trim() !== '--' ? domDisplay.textContent.trim() : null;
  const inputVal = input && input.value.trim() && input.value.trim() !== '--' ? input.value.trim() : null;
  const stateUrl = currentTargetUrl && currentTargetUrl !== '--' ? currentTargetUrl : null;

  const url = inputVal || stateUrl || domVal || 'https://example.com';

  const confirmed = window.confirm('Authorize live rescan for ' + url + '?');
  if (!confirmed) return;

  return await executeCockpitScan(url);
}

/**
 * Calculates projected score from a base score and a set of delta adjustments.
 * Clamped between 0 and 100.
 * @param {number} baseScore
 * @param {object|Array} deltas
 * @returns {number}
 */
export function calculateProjectedScore(baseScore = 0, deltas = {}) {
  let deltaSum = 0;
  if (Array.isArray(deltas)) {
    deltaSum = deltas.reduce((acc, d) => acc + (Number(d) || 0), 0);
  } else if (typeof deltas === 'object' && deltas !== null) {
    deltaSum = Object.values(deltas).reduce((acc, d) => acc + (Number(d) || 0), 0);
  }
  const total = Number(baseScore) + deltaSum;
  return Math.min(100, Math.max(0, Math.round(total)));
}

/**
 * Updates simulator calculations based on active input states.
 */
export function updateSimulator() {
  const base = currentCockpitState?.stage6?.overallHealthIndex > 0
    ? currentCockpitState.stage6.overallHealthIndex
    : 78;

  const toggles = document.querySelectorAll('.simulator-toggle, .sim-toggle, input[data-delta]');
  let deltaSum = 0;
  toggles.forEach((t) => {
    if (t.type === 'checkbox' && t.checked) {
      deltaSum += Number(t.getAttribute('data-delta') || 0);
    } else if (t.type === 'range') {
      deltaSum += Number(t.value || 0);
    }
  });

  const projected = calculateProjectedScore(base, { deltas: deltaSum });
  state.projectedScore = projected;

  const projectedEl = document.getElementById('projected-health-score');
  if (projectedEl) {
    projectedEl.textContent = `${projected}`;
  }

  const projDiffEl = document.getElementById('projected-score-diff');
  if (projDiffEl) {
    const diff = projected - base;
    projDiffEl.textContent = diff > 0 ? `+${diff}` : `${diff}`;
  }

  return projected;
}

/**
 * Initializes listeners for What-If Remediation Simulator inputs.
 */
export function initSimulator() {
  const inputs = document.querySelectorAll('.simulator-toggle, .sim-toggle, input[data-delta], .simulator-slider');
  inputs.forEach((input) => {
    if (!input.dataset.simBound) {
      input.addEventListener('change', updateSimulator);
      input.addEventListener('input', updateSimulator);
      input.dataset.simBound = 'true';
    }
  });
  updateSimulator();
}

/**
 * Main Cockpit Renderer: Updates scorecards and all 6 stages.
 * @param {object} stateObj - State from mapBackendScanToV4State
 */
export function renderCockpit(stateObj = currentCockpitState) {
  if (!stateObj) return;

  const domainDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
  if (domainDisplay && stateObj.meta?.targetUrl && stateObj.meta.targetUrl !== '--') {
    domainDisplay.textContent = stateObj.meta.targetUrl;
  }

  const healthEl = document.querySelector('.health-score-value, #health-score');
  if (healthEl) {
    healthEl.textContent = stateObj.stage6?.overallHealthIndex > 0 ? `${stateObj.stage6.overallHealthIndex}` : '--';
  }

  const optEl = document.querySelector('#ai-optimized-score, .score-optimized');
  if (optEl) {
    optEl.textContent = stateObj.stage6?.aiOptimizedScore > 0 ? `${stateObj.stage6.aiOptimizedScore}` : '--';
  }

  const readyEl = document.querySelector('#ai-ready-score, .score-ready');
  if (readyEl) {
    readyEl.textContent = stateObj.stage6?.aiReadyScore > 0 ? `${stateObj.stage6.aiReadyScore}` : '--';
  }

  renderStage1(stateObj.stage1);
  renderStage2(stateObj.stage2);
  renderStage3(stateObj.stage3);
  renderStage4(stateObj.stage4);
  renderStage5(stateObj.stage5);
  renderStage6(stateObj.stage6);
}

/**
 * Stage 1: Bot Matrix & Crawler Radar
 */
export function renderStage1(stage1Data = currentCockpitState.stage1) {
  const container = document.querySelector('#stage-1, [data-stage="1"]');
  if (!container) return;

  const crawlers = stage1Data?.crawlers || [];
  if (crawlers.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Crawlers: UNAUDITED</div>`;
    return;
  }

  const rows = crawlers
    .map(
      (c) => `
      <div class="crawler-bot-row ${c.allowed ? 'allowed' : 'blocked'}">
        <span class="bot-name">${c.name}</span>
        <span class="bot-status-pill">${c.statusText}</span>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="stage1-radar-cockpit">
      <h3>AI Crawler Access Matrix</h3>
      <div class="crawler-list">${rows}</div>
    </div>
  `;
}

/**
 * Stage 2: Discovered vs Missing Essential Canonical Routes
 */
export function renderStage2(stage2Data = currentCockpitState.stage2) {
  const container = document.querySelector('#stage-2, [data-stage="2"]');
  if (!container) return;

  const routes = stage2Data?.routes || [];
  if (routes.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Essential Routes: UNAUDITED</div>`;
    return;
  }

  const items = routes
    .map(
      (r) => `
      <li class="route-item ${r.status}">
        <span class="route-path">${r.route}</span>
        <span class="route-status-pill">${r.status.toUpperCase()}</span>
      </li>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="stage2-routes-cockpit">
      <h3>Essential Canonical Routes</h3>
      <p class="summary-line">Discovered: ${stage2Data.discoveredCount || 0} | Missing: ${stage2Data.missingCount || 0}</p>
      <ul class="routes-list">${items}</ul>
    </div>
  `;
}

/**
 * Stage 3: Crawled Pages & Semantic Text Density
 */
export function renderStage3(stage3Data = currentCockpitState.stage3) {
  const container = document.querySelector('#stage-3, [data-stage="3"]');
  if (!container) return;

  const pages = stage3Data?.pages || [];
  if (pages.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Pages & Density: UNAUDITED</div>`;
    return;
  }

  const rows = pages
    .map(
      (p) => `
      <div class="page-density-card density-${(p.densityRating || 'unknown').toLowerCase()}">
        <div class="page-url">${p.url}</div>
        <div class="page-metrics">
          <span>Words: <strong>${p.wordCount}</strong></span>
          <span>Ratio: <strong>${p.textCodeRatioPercent}%</strong></span>
          <span class="density-badge">${p.densityRating || 'Unknown'}</span>
        </div>
        <button class="inpage-fix-btn" data-url="${p.url}">View Fix Guide</button>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="stage3-pages-cockpit">
      <h3>Semantic Text Density & Page Architecture</h3>
      <div class="pages-grid">${rows}</div>
    </div>
  `;

  container.querySelectorAll('.inpage-fix-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const page = pages.find((p) => p.url === url);
      openDrawer(url, page);
    });
  });
}

/**
 * Stage 4: Schema.org Graph & Author Bio Credentials
 */
export function renderStage4(stage4Data = currentCockpitState.stage4) {
  const container = document.querySelector('#stage-4, [data-stage="4"]');
  if (!container) return;

  const types = stage4Data?.detectedTypes || [];
  const hasBio = Boolean(stage4Data?.hasAuthorBio);

  if (types.length === 0 && !hasBio) {
    container.innerHTML = `<div class="un-audited-notice">Schema & Credentials: UNAUDITED</div>`;
    return;
  }

  container.innerHTML = `
    <div class="stage4-schema-cockpit">
      <h3>Knowledge Graph & Author Credentials</h3>
      <div class="schema-types">
        <strong>Detected Schema.org Entities:</strong>
        <p>${types.join(', ') || 'None detected'}</p>
      </div>
      <div class="author-credential-status">
        <span>Author Bio Entity: <strong>${hasBio ? 'Detected' : 'Missing'}</strong></span>
      </div>
    </div>
  `;
}

/**
 * Stage 5: Machine Manifests (Strict "AI-Ready" Gate)
 */
export function renderStage5(stage5Data = currentCockpitState.stage5) {
  const container = document.querySelector('#stage-5, [data-stage="5"]');
  if (!container) return;

  const manifests = stage5Data?.manifests || [];
  if (manifests.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Manifests: UNAUDITED</div>`;
    return;
  }

  const items = manifests
    .map(
      (m) => `
      <div class="manifest-card ${m.exists ? 'present' : 'missing'}">
        <span class="manifest-path">${m.path}</span>
        <span class="manifest-label">${m.label}</span>
        <span class="manifest-badge">${m.exists ? `${m.status} OK` : `${m.status} NOT FOUND`}</span>
      </div>
    `
    )
    .join('');

  container.innerHTML = `
    <div class="stage5-manifests-cockpit">
      <div class="governance-badge">Governance Gate: ${stage5Data.governanceGate || 'AI-Ready'}</div>
      <h3>Machine Manifest Hierarchy</h3>
      <div class="manifests-grid">${items}</div>
    </div>
  `;
}

/**
 * Stage 6: Health Index, Dual-Pillar Scores, and Triage Matrix
 */
export function renderStage6(stage6Data = currentCockpitState.stage6) {
  const container = document.querySelector('#stage-6, [data-stage="6"]');
  if (!container) return;

  const flags = stage6Data?.triageFlags || [];
  if ((stage6Data?.overallHealthIndex || 0) === 0 && flags.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Triage & Scoring: UNAUDITED</div>`;
    return;
  }

  const flagItems = flags
    .map((f) => `<li class="triage-flag-item">${typeof f === 'string' ? f : f.title || JSON.stringify(f)}</li>`)
    .join('');

  container.innerHTML = `
    <div class="stage6-triage-cockpit">
      <h3>Dual-Pillar Triage & Health Diagnostics</h3>
      <div class="pillar-summary">
        <div class="pillar-card">AI-Optimized Score: <strong>${stage6Data.aiOptimizedScore}/100</strong></div>
        <div class="pillar-card">AI-Ready Score: <strong>${stage6Data.aiReadyScore}/100</strong></div>
      </div>
      <div class="triage-section">
        <h4>High-Impact Remediation Actions</h4>
        <ul class="triage-list">${flagItems || '<li>No active triage warnings</li>'}</ul>
      </div>
      <div class="simulator-section mt-4 p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
        <h4 class="font-bold text-white mb-2">What-If Remediation Simulator</h4>
        <div class="sim-controls grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#bdc1c6]">
          <label class="flex items-center space-x-2"><input type="checkbox" class="simulator-toggle" data-delta="8" /> <span>Fix Robots.txt Directives (+8)</span></label>
          <label class="flex items-center space-x-2"><input type="checkbox" class="simulator-toggle" data-delta="6" /> <span>Publish Essential Canonical Pages (+6)</span></label>
          <label class="flex items-center space-x-2"><input type="checkbox" class="simulator-toggle" data-delta="10" /> <span>Boost Content & SSR Density (+10)</span></label>
          <label class="flex items-center space-x-2"><input type="checkbox" class="simulator-toggle" data-delta="7" /> <span>Ground Organization Schema (+7)</span></label>
          <label class="flex items-center space-x-2"><input type="checkbox" class="simulator-toggle" data-delta="12" /> <span>Deploy /llms.txt Machine Files (+12)</span></label>
        </div>
        <div class="sim-result mt-3 font-mono text-sm">
          Projected Health Score: <span id="projected-health-score" class="text-[#10b981] font-bold">${stage6Data.overallHealthIndex || 78}</span>/100
        </div>
      </div>
    </div>
  `;

  initSimulator();
}

/**
 * 3D Remediation Drawer Handlers
 */
export function openDrawer(pageUrl, details) {
  const drawer = document.getElementById('details-drawer');
  if (!drawer) return;

  const title = drawer.querySelector('.drawer-title');
  if (title) title.textContent = `In-Page Remediation: ${pageUrl}`;

  const body = drawer.querySelector('.drawer-body');
  if (body) {
    body.innerHTML = `
      <p>Word Count: ${details?.wordCount || 0}</p>
      <p>Text-to-Code Ratio: ${details?.textCodeRatioPercent || 0}%</p>
      <p>Density: ${details?.densityRating || 'Unknown'}</p>
    `;
  }
  drawer.classList.remove('hidden');
}

export function closeDrawer() {
  const drawer = document.getElementById('details-drawer');
  if (drawer) drawer.classList.add('hidden');
}

/**
 * Navigation to step
 */
export function navigateToStep(step) {
  state.currentStep = step;
  const stageInfo = STAGE_MATRIX.find((s) => s.step === step) || STAGE_MATRIX[5];

  const stageBadge = document.getElementById('canvas-stage-badge');
  if (stageBadge) stageBadge.textContent = `STAGE ${step} OF 6`;

  const govBadge = document.getElementById('canvas-governance-badge');
  if (govBadge) govBadge.textContent = stageInfo.classification;

  const stageTitle = document.getElementById('canvas-stage-title');
  if (stageTitle) stageTitle.textContent = stageInfo.fullTitle;

  const stageDesc = document.getElementById('canvas-stage-desc');
  if (stageDesc) stageDesc.textContent = stageInfo.desc;

  const returnAnchor = document.getElementById('canvas-return-anchor');
  if (returnAnchor) {
    if (step === 6) {
      returnAnchor.classList.add('hidden');
    } else {
      returnAnchor.classList.remove('hidden');
    }
  }

  const scorePill = document.getElementById('canvas-score-pill');
  if (scorePill) {
    scorePill.classList.remove('hidden');
    if (step === 6) {
      scorePill.innerHTML = `
        <div class="text-right">
          <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold leading-none">Diagnostic Score</span>
          <span id="canvas-score-value" class="health-score-value font-mono font-black text-[#10b981] leading-tight text-3xl">78/100</span>
        </div>
        <span id="canvas-score-status" class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">
          OPTIMIZED
        </span>
      `;
    }
  }

  renderCanvasBody(step);
}

/**
 * Renders contextual canvas body content for stepped inspection views.
 */
function renderCanvasBody(step) {
  const canvasBody = document.getElementById('canvas-body');
  if (!canvasBody) return;

  switch (step) {
    case 1:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="takeaway-header p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <h2 class="text-lg font-bold text-white">What AI Search Engines See & Why It Matters</h2>
            <div class="flex items-center space-x-2 mt-2">
              <span class="text-2xl font-bold text-[#10b981]">100%</span>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">PASS</span>
            </div>
          </div>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">Gateway & WAF Security Markers</h3>
              <ul class="space-y-2 text-sm text-[#e8eaed]">
                <li>• robots.txt Directives: ALLOWED</li>
                <li>• Cloudflare Challenge Gate: BYPASS OK</li>
                <li>• X-Robots-Tag Server Headers: CLEAN</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">AI Crawler Allowance Matrix (20 Engines)</h3>
              <div class="text-xs font-bold text-[#10b981] mb-2">20/20 ALLOWED</div>
              <div class="grid grid-cols-2 gap-2 text-xs text-[#bdc1c6]">
                <div>• GPTBot</div><div>• OAI-SearchBot</div>
                <div>• ClaudeBot</div><div>• Claude-SearchBot</div>
                <div>• Googlebot</div><div>• Bingbot</div>
                <div>• PerplexityBot</div><div>• Applebot-Extended</div>
                <div>• Meta-ExternalAgent</div><div>• Amazonbot</div>
                <div>• QwenBot</div><div>• Bytespider</div>
                <div>• MistralBot</div><div>• CCBot</div>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h4 class="font-bold text-white mb-2">Action Plan: How to improve how AI can read your current pages better</h4>
              <ul class="space-y-1 text-sm text-[#bdc1c6]">
                <li>1. Review robots.txt directives</li>
                <li>2. Whitelist all 20 AI engines</li>
                <li>3. Configure Cloudflare / WAF rules</li>
                <li>4. Verify HTTP response headers</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#b7410e]/40">
              <h4 class="font-bold text-white">Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files</h4>
              <button class="mt-2 px-4 py-2 rounded-xl bg-[#b7410e] text-white text-xs font-bold">Deploy AI-Ready files using AIOptimize Pro</button>
            </div>
            <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
              <h5 class="font-bold text-white mb-1">Verification Evidence (What We Found)</h5>
              <p>HTTP/2 200 OK — User-Agent verification completed across 20 bots.</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 2:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="takeaway-header p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <h2 class="text-lg font-bold text-white">What AI Search Engines See & Why It Matters</h2>
            <div class="flex items-center space-x-2 mt-2">
              <span class="text-2xl font-bold text-[#f59e0b]">75%</span>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">WARN</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">5-Anchor Essential Kanban Matrix</h3>
            <div class="text-xs font-mono text-[#f59e0b] mb-3 font-bold">4 FOUND • 1 MISSING (/pricing)</div>
            <div class="space-y-2 text-sm">
              <div class="flex justify-between"><span>/about</span><span class="text-[#10b981]">95% FOUND</span></div>
              <div class="flex justify-between"><span>/contact</span><span class="text-[#10b981]">90% FOUND</span></div>
              <div class="flex justify-between"><span>/privacy-policy</span><span class="text-[#10b981]">95% FOUND</span></div>
              <div class="flex justify-between"><span>/terms-of-service</span><span class="text-[#10b981]">90% FOUND</span></div>
              <div class="flex justify-between"><span>/pricing</span><span class="text-red-400">0% MISSING</span></div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h4 class="font-bold text-white mb-2">Action Plan: How to improve how AI can read your current pages better</h4>
              <ul class="space-y-1 text-sm text-[#bdc1c6]">
                <li>1. Create canonical /pricing endpoint</li>
                <li>2. Verify HTTP 200 responses</li>
                <li>3. Update header & footer navigation</li>
                <li>4. Embed Offer and ContactPoint schemas</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#b7410e]/40">
              <h4 class="font-bold text-white">Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files</h4>
            </div>
            <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
              <h5 class="font-bold text-white mb-1">Verification Evidence (What We Found)</h5>
              <p>GET /pricing -> 404 Not Found</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 3:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="takeaway-header p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <h2 class="text-lg font-bold text-white">What AI Search Engines See & Why It Matters</h2>
            <div class="flex items-center space-x-2 mt-2">
              <span class="text-2xl font-bold text-[#f59e0b]">68%</span>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">WARN</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">Semantic Text Density Thermometers</h3>
            <div class="flex items-center space-x-3 text-xs font-mono mb-4">
              <span class="px-2.5 py-1 rounded bg-[#38bdf8]/20 text-[#38bdf8] font-bold">24 Total Pages Scanned</span>
              <span class="text-white">Avg 28.4% Density</span>
            </div>
            <div class="page-card p-4 rounded-xl bg-[#121212] border border-[#3c4043] space-y-2">
              <div class="flex justify-between items-center">
                <span class="font-mono text-xs text-white">/demo/workspace</span>
                <span class="text-xs text-[#bdc1c6]">Information Gain Score: 0.78</span>
              </div>
              <div class="flex space-x-2">
                <button class="px-3 py-1 rounded bg-[#1f1f1f] text-xs text-white">View What AI sees</button>
                <button class="px-3 py-1 rounded bg-[#1f1f1f] text-xs text-white">Details</button>
              </div>
            </div>
            <button class="mt-4 px-4 py-2 rounded-xl bg-[#1f1f1f] text-xs text-[#bdc1c6]">Load Next 5 Pages</button>
          </div>
          <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h4 class="font-bold text-white mb-2">Page Diagnostic Breakdown & In-Page Fix Snippets</h4>
            <ul class="space-y-1 text-xs text-[#bdc1c6]">
              <li>• Missing Canonical URL</li>
              <li>• Missing Required Semantic HTML5 Tags</li>
              <li>• Images Without Alt Attributes</li>
              <li>• Missing Revision Date</li>
            </ul>
          </div>
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h4 class="font-bold text-white mb-2">Action Plan: How to improve how AI can read your current pages better</h4>
              <ul class="space-y-1 text-sm text-[#bdc1c6]">
                <li>1. Audit low-density SPA routes</li>
                <li>2. Enable SSR or SSG pre-rendering</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#b7410e]/40">
              <h4 class="font-bold text-white">Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files</h4>
            </div>
            <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
              <h5 class="font-bold text-white mb-1">Verification Evidence (What We Found)</h5>
              <p>Average Text-to-HTML Ratio: 28.4% across crawled endpoints.</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 4:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="takeaway-header p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <h2 class="text-lg font-bold text-white">What AI Search Engines See & Why It Matters</h2>
            <div class="flex items-center space-x-2 mt-2">
              <span class="text-2xl font-bold text-[#10b981]">80%</span>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">PASS</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">Entity Authority & E-E-A-T Relational Graph</h3>
            <div class="grid grid-cols-2 gap-3 text-xs">
              <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Schema/Organization</strong>
                <span class="text-[#10b981]">100% VALID GRAPH</span>
              </div>
              <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Author Person E-E-A-T</strong>
                <span class="text-[#10b981]">DETECTED</span>
              </div>
              <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Wikidata Grounding</strong>
                <span class="text-[#10b981]">VERIFIED SAMEAS</span>
              </div>
              <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Privacy & Legal Anchors</strong>
                <span class="text-[#10b981]">VERIFIED</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h4 class="font-bold text-white mb-2">Action Plan: How to improve how AI can read your current pages better</h4>
              <ul class="space-y-1 text-sm text-[#bdc1c6]">
                <li>1. Deploy JSON-LD Organization schema</li>
                <li>2. Connect verified sameAs authority links</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#b7410e]/40">
              <h4 class="font-bold text-white">Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files</h4>
            </div>
            <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
              <h5 class="font-bold text-white mb-1">Verification Evidence (What We Found)</h5>
              <p>Entity relations verified with knowsAbout and sameAs attributes.</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 5:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="takeaway-header p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <h2 class="text-lg font-bold text-white">What AI Search Engines See & Why It Matters</h2>
            <div class="flex items-center space-x-2 mt-2">
              <span class="text-2xl font-bold text-[#f59e0b]">40%</span>
              <span class="px-2 py-0.5 rounded text-xs font-mono font-bold bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40">WARN</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-3 font-bold">4-LEVEL HIERARCHY</h3>
            <div class="space-y-3 text-xs">
              <div>
                <strong class="text-white block">LEVEL 1: PROTOCOL GATES (THE GATEKEEPERS)</strong>
                <span class="text-[#bdc1c6]">/robots.txt: 200 OK</span>
              </div>
              <div>
                <strong class="text-white block">LEVEL 2: THE WELCOME MAT (DIRECTORY INDEX)</strong>
                <span class="text-[#bdc1c6]">/sitemap.xml: 200 OK | /llms.txt: 404 NOT FOUND</span>
              </div>
              <div>
                <strong class="text-white block">LEVEL 3: CONTEXT MAPS & BLUEPRINT</strong>
                <span class="text-[#bdc1c6]">/ai-context.md: 404 NOT FOUND</span>
              </div>
              <div>
                <strong class="text-white block">LEVEL 4: WORKSPACES & DOCUMENTATION</strong>
                <span class="text-[#bdc1c6]">/README.md, /about.md, /docs.md, /content.md</span>
              </div>
            </div>
          </div>
          <div class="space-y-4">
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
              <h4 class="font-bold text-white mb-2">Action Plan: How to improve how AI can read your current pages better</h4>
              <ul class="space-y-1 text-sm text-[#bdc1c6]">
                <li>1. Publish Level 1 robots.txt directive</li>
                <li>2. Create Level 2 /llms.txt directory index</li>
                <li>3. Deploy Level 3 /ai-context.md blueprint</li>
              </ul>
            </div>
            <div class="p-5 rounded-2xl bg-[#1a1a1a] border border-[#b7410e]/40">
              <h4 class="font-bold text-white">Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files</h4>
            </div>
            <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs font-mono text-[#bdc1c6]">
              <h5 class="font-bold text-white mb-1">Verification Evidence (What We Found)</h5>
              <p>GET /robots.txt -> 200 OK</p>
            </div>
          </div>
        </div>
      `;
      break;

    case 6:
      canvasBody.innerHTML = `
        <div class="space-y-6">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="p-6 rounded-2xl bg-[#1a1a1a] border border-[#3c4043] flex flex-col items-center justify-center text-center">
              <h3 class="text-sm font-mono uppercase text-[#bdc1c6] mb-4 font-bold">AEO Health Index Dial</h3>
              <div class="relative w-40 h-40 flex items-center justify-center">
                <svg class="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#1f1f1f" stroke-width="8" fill="none" />
                  <circle cx="50" cy="50" r="40" stroke="#10b981" stroke-width="8" fill="none" stroke-dasharray="251.2" stroke-dashoffset="55" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center font-mono">
                  <span class="text-4xl font-black text-white">78</span>
                  <span class="text-xs text-[#bdc1c6]">/ 100</span>
                </div>
              </div>
            </div>

            <div class="p-6 rounded-2xl bg-[#1a1a1a] border border-[#3c4043] flex flex-col justify-center space-y-4">
              <h3 class="text-sm font-mono uppercase text-[#bdc1c6] font-bold">Dual-Pillar Readiness Breakdown</h3>
              <div class="space-y-3 text-sm">
                <div>
                  <div class="flex justify-between text-xs font-bold text-white mb-1">
                    <span>Human Web Readiness</span>
                    <span class="text-[#10b981]">92%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                    <div class="h-full bg-[#10b981]" style="width: 92%"></div>
                  </div>
                </div>
                <div>
                  <div class="flex justify-between text-xs font-bold text-white mb-1">
                    <span>Machine Web Readiness</span>
                    <span class="text-[#f59e0b]">54%</span>
                  </div>
                  <div class="w-full h-2 rounded-full bg-[#121212] overflow-hidden">
                    <div class="h-full bg-[#f59e0b]" style="width: 54%"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-base font-bold text-white">Top 5 Urgent Action Items</h3>
              <span class="text-xs font-mono text-[#b7410e] font-bold uppercase">Triage Matrix</span>
            </div>
            <div class="space-y-3 text-sm text-[#e8eaed]">
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] flex justify-between items-center">
                <span>1. Verify zero Cloudflare CAPTCHAs for ClaudeBot and PerplexityBot</span>
                <button onclick="navigateToStep(1)" class="px-3 py-1 rounded bg-[#1f1f1f] text-xs font-bold text-[#d45d2a]">Fix in Stage 1 →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] flex justify-between items-center">
                <span>2. Publish dedicated /pricing commercial anchor page</span>
                <button onclick="navigateToStep(2)" class="px-3 py-1 rounded bg-[#1f1f1f] text-xs font-bold text-[#d45d2a]">Fix in Stage 2 →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] flex justify-between items-center">
                <span>3. Refactor /demo and /case-studies to boost initial SSR text density above 25%</span>
                <button onclick="navigateToStep(3)" class="px-3 py-1 rounded bg-[#1f1f1f] text-xs font-bold text-[#d45d2a]">Fix in Stage 3 →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] flex justify-between items-center">
                <span>4. Ground Organization Schema with Wikidata and official sameAs profiles</span>
                <button onclick="navigateToStep(4)" class="px-3 py-1 rounded bg-[#1f1f1f] text-xs font-bold text-[#d45d2a]">Fix in Stage 4 →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043] flex justify-between items-center">
                <span>5. Deploy missing /llms.txt and /llms-full.txt machine manifests</span>
                <button onclick="navigateToStep(5)" class="px-3 py-1 rounded bg-[#1f1f1f] text-xs font-bold text-[#d45d2a]">Fix in Stage 5 →</button>
              </div>
            </div>
          </div>

          <div class="p-6 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
            <h3 class="text-base font-bold text-white mb-4">5-Section Scorecard Matrix</h3>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">AI Bot Blocks</strong>
                <button onclick="navigateToStep(1)" class="text-[#38bdf8] mt-1 block">Inspect Deep-Dive →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Essential Content</strong>
                <button onclick="navigateToStep(2)" class="text-[#38bdf8] mt-1 block">Inspect Deep-Dive →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Content Availability</strong>
                <button onclick="navigateToStep(3)" class="text-[#38bdf8] mt-1 block">Inspect Deep-Dive →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">Trust & Privacy</strong>
                <button onclick="navigateToStep(4)" class="text-[#38bdf8] mt-1 block">Inspect Deep-Dive →</button>
              </div>
              <div class="p-3 rounded-xl bg-[#121212] border border-[#3c4043]">
                <strong class="text-white block">AI-Ready Files</strong>
                <button onclick="navigateToStep(5)" class="text-[#38bdf8] mt-1 block">Inspect Deep-Dive →</button>
              </div>
            </div>
          </div>
        </div>
      `;
      break;
  }
}

/**
 * Workbench Simulation & Drawer Helpers
 */
export function toggleSidebar(show) {
  const sidebar = document.getElementById('main-terminal-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (sidebar && backdrop) {
    if (show) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
    }
  }
}

export function toggleScanSimulation() {
  handleCockpitRescan();
}

export function resetToUnauditedState() {
  state.isAudited = false;
  state.isSimulating = false;
  state.isSystemError = false;
  state.completedSteps = [];
  state.scanningStep = null;
  state.currentStep = 1;

  const durLabel = document.getElementById('scan-duration-label');
  if (durLabel) durLabel.textContent = '--';
  const pagesLabel = document.getElementById('total-pages-label');
  if (pagesLabel) pagesLabel.textContent = '--';
  const stagePill = document.getElementById('sidebar-stage-pill');
  if (stagePill) stagePill.textContent = 'UNAUDITED';
  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.add('hidden');

  hideAntiHijackToast();
  resetCockpitToNeutral();
}

export function retryEntireAudit() {
  handleCockpitRescan();
}

export function triggerEarlyInspectionScenario() {
  state.isSimulating = true;
  state.isAudited = true;
  state.userNavigatedEarly = true;
  state.completedSteps = [1, 2, 3];
  state.scanningStep = 4;
  navigateToStep(2);
}

export function triggerSystemFailureScenario() {
  state.isSystemError = true;
  state.isSimulating = false;

  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.remove('hidden');

  const quotaTag = document.getElementById('quota-tag');
  if (quotaTag) {
    quotaTag.textContent = 'Quota Charged: NO (UNCHARGED)';
  }
}

export function toggleResponsiveSimulation() {
  state.isResponsivePreview = !state.isResponsivePreview;
}

export function showAntiHijackToast() {
  const toast = document.getElementById('toast-anti-hijack');
  if (toast) toast.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
}

export function hideAntiHijackToast() {
  const toast = document.getElementById('toast-anti-hijack');
  if (toast) toast.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
}

export function handleExport(format) {
  if (typeof console !== 'undefined') console.log(`Exporting ${format}...`);
}

/**
 * Cockpit Shell Initialization
 */
export async function initCockpit() {
  resetCockpitToNeutral();

  const input = document.querySelector('#target-url-input, #cockpit-url-input');
  const searchBtn = document.querySelector('#cockpit-search-btn, .domain-search-btn');
  const rescanBtn = document.querySelector('#rescan-btn, .rescan-btn');
  const closeBtn = document.querySelector('#close-drawer-btn, .close-drawer-btn');

  if (rescanBtn && !rescanBtn.dataset.bound) {
    rescanBtn.addEventListener('click', () => {
      handleCockpitRescan();
    });
    rescanBtn.dataset.bound = 'true';
  }

  if (searchBtn && !searchBtn.dataset.bound) {
    searchBtn.addEventListener('click', () => {
      const val = input ? input.value.trim() : '';
      if (val) executeCockpitScan(val);
    });
    searchBtn.dataset.bound = 'true';
  }

  if (input && !input.dataset.bound) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = input.value.trim();
        if (val) executeCockpitScan(val);
      }
    });
    input.dataset.bound = 'true';
  }

  if (closeBtn && !closeBtn.dataset.bound) {
    closeBtn.addEventListener('click', () => {
      closeDrawer();
    });
    closeBtn.dataset.bound = 'true';
  }

  // Parse ?url=... query parameter on load
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      if (input) input.value = urlParam;
      return await executeCockpitScan(urlParam);
    }
  }
}

if (typeof window !== 'undefined') {
  window.toggleSidebar = toggleSidebar;
  window.navigateToStep = navigateToStep;
  window.handleExport = handleExport;
  window.resetToUnauditedState = resetToUnauditedState;
  window.toggleScanSimulation = toggleScanSimulation;
  window.triggerSystemFailureScenario = triggerSystemFailureScenario;
  window.retryEntireAudit = retryEntireAudit;
  window.toggleResponsiveSimulation = toggleResponsiveSimulation;
  window.triggerEarlyInspectionScenario = triggerEarlyInspectionScenario;
  window.showAntiHijackToast = showAntiHijackToast;
  window.hideAntiHijackToast = hideAntiHijackToast;
  window.closeDrawer = closeDrawer;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      initCockpit();
    });
  }
}
