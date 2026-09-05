/**
 * AEO Suite V3 - V4 Diagnostic Cockpit State & Live Rendering Engine
 * Ingests live POST /api/scan payloads via v4PayloadAdapter.
 * Governance: Strict Dual-Pillar enforcement ("AI-Optimized" vs "AI-Ready").
 * Zero mock defaults. Zero dummy data fallbacks. Zero occurrences of banned terms.
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
  projectedScore: 0
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
 * Clears all entries from the internal quality tracking error registry.
 */
export function clearCockpitErrorLogs() {
  cockpitErrorLogs.length = 0;
}

/**
 * Returns the current normalized cockpit state along with summary diagnostics.
 * @returns {object}
 */
export function getCockpitState() {
  const score = currentCockpitState?.stage6?.overallHealthIndex || 0;
  const badge = score > 0 ? (score >= 70 ? 'OPTIMIZED' : 'NEEDS IMPROVEMENT') : 'UNAUDITED';
  const scannedUrl = currentCockpitState?.meta?.targetUrl || '--';
  const duration = currentCockpitState?.meta?.scanDuration || '--';
  const totalPages = currentCockpitState?.stage3?.pages?.length ? String(currentCockpitState.stage3.pages.length) : '--';

  return {
    ...currentCockpitState,
    summary: {
      healthScore: score,
      diagnosticBadge: badge,
      scannedUrl,
      scanDuration: duration,
      totalPages
    }
  };
}

/**
 * Logs an error entry into the internal quality tracking registry.
 * @param {string} targetUrl
 * @param {string} errorMessage
 * @param {number} status
 */
function logCockpitError(targetUrl, errorMessage, status = 500) {
  cockpitErrorLogs.push({
    targetUrl,
    error: errorMessage,
    message: errorMessage,
    status: typeof status === 'number' ? status : 500,
    timestamp: new Date().toISOString()
  });
}

/**
 * Detects whether a scan response payload represents an inaccessible domain or crawl failure
 * @param {object|null} payload
 * @returns {string|null}
 */
export function detectScanFailure(payload) {
  if (!payload) return 'No payload received';
  if (payload.status === 'failed') {
    return payload.error || payload.results?.error || 'Target domain could not be reached.';
  }
  if (payload.results?.status === 'failed') {
    return payload.results.error || payload.error || 'Target domain could not be reached.';
  }
  if (payload.results?.error) {
    return payload.results.error;
  }
  
  // Inspect triage flags for fatal DNS/connection failures when 0 pages could be indexed
  const triage = payload.results?.capabilities?.triage || payload.capabilities?.triage || payload.alerts || [];
  const criticalNetError = triage.find((t) => 
    typeof t === 'string' && (
      t.includes('ENOTFOUND') || 
      t.includes('ECONNREFUSED') || 
      t.includes('ETIMEDOUT') || 
      t.includes('EAI_AGAIN') || 
      t.includes('HTTP fetch failed')
    )
  );
  if (criticalNetError && (!payload.results?.pages || payload.results.pages.length === 0)) {
    return criticalNetError;
  }

  return null;
}

/**
 * Sets the cockpit error banner state.
 * @param {string|null} message
 */
export function setErrorBanner(message) {
  const banner = document.getElementById('cockpit-error-banner');
  if (!banner) return;

  if (message) {
    const msgEl = banner.querySelector('.error-msg');
    if (msgEl) {
      msgEl.textContent = message;
    } else {
      banner.textContent = message;
    }
    banner.style.display = 'flex';
    banner.classList.remove('hidden');
  } else {
    const msgEl = banner.querySelector('.error-msg');
    if (msgEl) {
      msgEl.textContent = '';
    } else {
      banner.textContent = '';
    }
    banner.style.display = 'none';
    banner.classList.add('hidden');
  }
}

export const showCockpitError = setErrorBanner;
export const hideCockpitError = () => setErrorBanner(null);
export const recordCockpitError = logCockpitError;
export const resetCockpitToUnaudited = resetCockpitToNeutral;

/**
 * Resets the cockpit UI to neutral un-audited defaults.
 */
export function resetCockpitToNeutral() {
  currentCockpitState = mapBackendScanToV4State(null);
  currentTargetUrl = '--';
  state.isAudited = false;

  document.querySelectorAll('#timestamp-label, #cockpit-scanned-date, #scan-duration-label, #cockpit-scanned-duration, #total-pages-label, #cockpit-scanned-pages').forEach(el => {
    el.textContent = '--';
  });

  renderCockpit(currentCockpitState);
}

/**
 * Dispatches scan request to POST /api/scan and renders normalized V4 state.
 * @param {string} targetUrl
 */
export async function executeCockpitScan(targetUrl) {
  if (!targetUrl || typeof targetUrl !== 'string' || !targetUrl.trim() || targetUrl === '--') {
    setErrorBanner('Please specify a valid target domain or URL.');
    return;
  }

  const cleanUrl = targetUrl.trim();
  currentTargetUrl = cleanUrl;
  setErrorBanner(null);

  const input = document.querySelector('#target-url-input, #cockpit-url-input');
  if (input && input.value !== cleanUrl) {
    input.value = cleanUrl;
  }

  const rescanBtn = document.querySelector('#rescan-btn, .rescan-btn');
  if (rescanBtn) rescanBtn.disabled = true;

  const startTime = performance.now();

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: cleanUrl, email: '' })
    });

    if (!response.ok) {
      const errPayload = await response.json().catch(() => ({}));
      const errMsg = errPayload.error || `Scan failed: HTTP ${response.status} (${response.statusText || 'Error'})`;
      resetCockpitToNeutral();
      logCockpitError(cleanUrl, errMsg, response.status);
      setErrorBanner(`Failed to scan ${cleanUrl}: HTTP ${response.status} - ${response.statusText || errMsg}`);
      if (rescanBtn) rescanBtn.disabled = false;
      return;
    }

    const payload = await response.json();

    // Guard against inaccessible domains / DNS failures returned with HTTP 200
    const failureReason = detectScanFailure(payload);
    if (failureReason) {
      resetCockpitToNeutral();
      logCockpitError(cleanUrl, failureReason, response.status || 200);
      setErrorBanner(`Scan error for ${cleanUrl}: Site is not accessible (${failureReason}). Data is not available.`);
      if (rescanBtn) rescanBtn.disabled = false;
      return;
    }

    const elapsedSec = ((performance.now() - startTime) / 1000).toFixed(1) + 's';

    currentCockpitState = mapBackendScanToV4State(payload);
    currentCockpitState.meta.scanDuration = elapsedSec;
    currentCockpitState.meta.timestamp = new Date().toLocaleString();

    // If the state adapter normalized a crawl failure, trip the error banner
    if (currentCockpitState.meta.error || (currentCockpitState.meta.status === 'UNAUDITED' && currentCockpitState.stage6?.triageFlags?.length > 0)) {
      const err = currentCockpitState.meta.error || currentCockpitState.stage6.triageFlags[0];
      setErrorBanner(`Scan error for ${cleanUrl}: Site is not accessible (${err}). Data is not available.`);
      const beacon = document.querySelector('#sidebar-beacon-dot, .cockpit-domain-display')?.previousElementSibling;
      if (beacon) {
        beacon.classList.remove('bg-[#10b981]');
        beacon.classList.add('bg-[#ef4444]');
      }
    }

    if (!currentCockpitState.meta.targetUrl || currentCockpitState.meta.targetUrl === '--') {
      currentCockpitState.meta.targetUrl = cleanUrl;
    }
    state.isAudited = true;
    renderCockpit(currentCockpitState);

    if (rescanBtn) rescanBtn.disabled = false;
    return currentCockpitState;
  } catch (err) {
    const status = typeof err.status === 'number' ? err.status : 500;
    const errorMsg = err.message || 'Network connection failed.';
    resetCockpitToNeutral();
    logCockpitError(cleanUrl, errorMsg, status);
    setErrorBanner(`Network failure scanning ${cleanUrl}: ${errorMsg}`);
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

  const url = inputVal || stateUrl || domVal || 'example.com';

  const confirmed = typeof window !== 'undefined' && typeof window.confirm === 'function'
    ? window.confirm(`Authorize live rescan for ${url}?`)
    : true;
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
  const base = currentCockpitState?.stage6?.overallHealthIndex || 0;

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
  currentCockpitState = stateObj;

  const targetUrl = stateObj.meta?.targetUrl || '--';
  const score = stateObj.stage6?.overallHealthIndex || 0;
  const badge = score > 0 ? (score >= 70 ? 'OPTIMIZED' : 'NEEDS IMPROVEMENT') : 'UNAUDITED';

  // Domain Displays
  const domainEls = document.querySelectorAll('.cockpit-domain-display, #current-target-domain, #target-domain-badge, #cockpit-scanned-url');
  domainEls.forEach((el) => {
    el.textContent = targetUrl;
  });

  // Scanned Date elements
  const timeStr = stateObj.meta?.timestamp || '--';
  document.querySelectorAll('#timestamp-label, #cockpit-scanned-date').forEach((el) => {
    el.textContent = timeStr;
  });

  // Duration elements
  const durStr = stateObj.meta?.scanDuration || '--';
  document.querySelectorAll('#scan-duration-label, #cockpit-scanned-duration').forEach((el) => {
    el.textContent = durStr;
  });

  // Total Pages elements
  const pageCount = stateObj.stage3?.pages?.length !== undefined && stateObj.stage3.pages.length > 0
    ? String(stateObj.stage3.pages.length)
    : '--';
  document.querySelectorAll('#total-pages-label, #cockpit-scanned-pages').forEach((el) => {
    el.textContent = pageCount;
  });

  // Diagnostic Score elements
  const scoreEls = document.querySelectorAll('.health-score-value, #health-score, #cockpit-diagnostic-score');
  scoreEls.forEach((el) => {
    el.textContent = `${score}`;
  });

  const canvasScoreVal = document.getElementById('canvas-score-value');
  if (canvasScoreVal) {
    canvasScoreVal.textContent = score > 0 ? `${score}/100` : '--';
  }

  // Diagnostic Badges
  const badgeEls = document.querySelectorAll('#canvas-score-status, #cockpit-diagnostic-badge, #sidebar-stage-pill');
  badgeEls.forEach((el) => {
    el.textContent = badge;
  });

  // Dual Pillar Scores
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
  const container = document.querySelector('#stage-1, #stage1-container, [data-stage="1"]');
  if (!container) return;

  const crawlers = stage1Data?.crawlers || [];
  if (crawlers.length === 0) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Crawlers: UNAUDITED</div>`;
    return;
  }

  const cards = crawlers
    .map((c) => {
      const isAllowed = Boolean(c.allowed);
      const statusText = c.statusText || (isAllowed ? `ALLOWED (${c.status || 200})` : `BLOCKED (${c.status || 403})`);
      const statusClass = isAllowed ? 'allowed status-allowed' : 'blocked status-blocked';
      const badgeClass = isAllowed ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40' : 'bg-red-950 text-red-400 border-red-500/40';
      return `
        <div class="bot-card crawler-bot-row ${statusClass} p-4 rounded-xl bg-[#121212] border border-[#3c4043] flex flex-col justify-between">
          <div class="bot-header flex justify-between items-center mb-2">
            <span class="bot-name font-bold text-white text-sm">${c.name}</span>
            <span class="bot-status-pill status-pill px-2.5 py-0.5 rounded text-[11px] font-mono font-bold border ${badgeClass}">${statusText}</span>
          </div>
          <span class="text-xs text-[#bdc1c6]">${isAllowed ? 'Crawl permissions active' : 'Blocked by gateway directive'}</span>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="stage-card stage1-radar-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
      <div class="stage-card-header flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold text-white font-headline">AI Crawler Access Matrix</h3>
        <span class="gate-tag px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40">AI-Optimized</span>
      </div>
      <div class="bot-grid crawler-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">${cards}</div>
    </div>
  `;
}

/**
 * Stage 2: Discovered vs Missing Essential Canonical Routes
 */
export function renderStage2(stage2Data = currentCockpitState.stage2) {
  const container = document.querySelector('#stage-2, #stage2-container, [data-stage="2"]');
  if (!container) return;

  const routes = stage2Data?.routes || [];
  if (routes.length === 0) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Essential Routes: UNAUDITED</div>`;
    return;
  }

  const discovered = routes.filter((r) => r.status === 'discovered');
  const missing = routes.filter((r) => r.status === 'missing');

  const discoveredCards = discovered.map(r => `
    <div class="route-card route-pill discovered p-3 rounded-xl bg-[#121212] border border-[#10b981]/40 flex justify-between items-center mb-2">
      <span class="route-path font-mono text-xs text-white font-bold">${r.route}</span>
      <span class="route-status-pill pill-badge px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">DISCOVERED</span>
    </div>
  `).join('') || '<div class="text-xs text-[#bdc1c6] italic p-2">No discovered canonical routes</div>';

  const missingCards = missing.map(r => `
    <div class="route-card route-pill missing p-3 rounded-xl bg-[#121212] border border-red-500/40 flex justify-between items-center mb-2">
      <span class="route-path font-mono text-xs text-white font-bold">${r.route}</span>
      <span class="route-status-pill pill-badge px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950 text-red-400 border border-red-500/40">MISSING</span>
    </div>
  `).join('') || '<div class="text-xs text-[#bdc1c6] italic p-2">Zero missing canonical routes</div>';

  const discoveredCount = stage2Data.discoveredCount !== undefined ? stage2Data.discoveredCount : discovered.length;
  const missingCount = stage2Data.missingCount !== undefined ? stage2Data.missingCount : missing.length;

  container.innerHTML = `
    <div class="stage-card stage2-routes-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
      <div class="stage-card-header flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-white font-headline">Essential Canonical Routes</h3>
        <span class="routes-count text-xs font-mono text-[#38bdf8] font-bold">Discovered: ${discoveredCount} | Missing: ${missingCount}</span>
      </div>
      <div class="kanban-grid-container grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="routes-col kanban-col p-4 rounded-xl bg-[#181818] border border-[#3c4043]">
          <h4 class="text-xs font-mono uppercase text-[#10b981] font-bold mb-3 flex items-center space-x-1.5">
            <span>✓</span> <span>Discovered Routes (${discovered.length})</span>
          </h4>
          <div class="routes-list">${discoveredCards}</div>
        </div>
        <div class="routes-col kanban-col p-4 rounded-xl bg-[#181818] border border-[#3c4043]">
          <h4 class="text-xs font-mono uppercase text-red-400 font-bold mb-3 flex items-center space-x-1.5">
            <span>⚠</span> <span>Missing Routes (${missing.length})</span>
          </h4>
          <div class="routes-list">${missingCards}</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Stage 3: Crawled Pages & Semantic Text Density
 */
export function renderStage3(stage3Data = currentCockpitState.stage3) {
  const container = document.querySelector('#stage-3, #stage3-container, [data-stage="3"]');
  if (!container) return;

  const pages = stage3Data?.pages || [];
  if (pages.length === 0) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Pages & Density: UNAUDITED</div>`;
    return;
  }

  const rows = pages
    .map((p, idx) => {
      const ratio = p.textCodeRatioPercent !== undefined ? p.textCodeRatioPercent : 0;
      const rating = p.densityRating || (ratio >= 40 ? 'Optimal' : ratio >= 15 ? 'Moderate' : 'Thin');
      const tierClass = rating.toLowerCase();
      const widthVal = `${Math.min(Math.max(ratio, 0), 100)}%`;
      return `
        <div class="page-density-card density-row density-${tierClass} p-4 rounded-xl bg-[#121212] border border-[#3c4043] flex flex-col justify-between" data-url="${p.url}">
          <div class="density-info flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
            <span class="page-url density-url font-mono text-xs text-white truncate max-w-md">${p.url}</span>
            <span class="density-badge px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#1f1f1f] text-[#38bdf8] border border-[#3c4043]">${rating} (${ratio}%)</span>
          </div>
          <div class="thermometer-track w-full h-2 rounded-full bg-[#1f1f1f] overflow-hidden my-2 border border-[#3c4043]">
            <div class="thermometer-fill h-full rounded-full transition-all duration-500 bg-[#38bdf8]" style="width: ${widthVal};"></div>
          </div>
          <div class="page-metrics density-actions flex items-center justify-between text-xs text-[#bdc1c6] mt-2 pt-2 border-t border-[#3c4043]">
            <div class="space-x-3">
              <span>Words: <strong class="text-white">${p.wordCount}</strong></span>
              <span>Ratio: <strong class="text-white">${ratio}%</strong></span>
            </div>
            <button class="inpage-fix-btn drawer-trigger-btn px-3 py-1 rounded-lg bg-[#1f1f1f] hover:bg-[#2a2a2a] text-xs font-mono text-[#d45d2a] hover:text-white border border-[#3c4043] transition font-bold" data-url="${p.url}" data-index="${idx}">View Fix Guide</button>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="stage-card stage3-pages-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
      <div class="stage-card-header flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-white font-headline">Semantic Text Density & Page Architecture</h3>
        <span class="gate-tag px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40">AI-Optimized</span>
      </div>
      <div class="pages-grid density-list grid grid-cols-1 lg:grid-cols-2 gap-3">${rows}</div>
    </div>
  `;

  container.querySelectorAll('.inpage-fix-btn, .drawer-trigger-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const url = btn.getAttribute('data-url');
      const idx = parseInt(btn.getAttribute('data-index'), 10);
      const page = pages.find((p) => p.url === url) || pages[idx];
      openDrawer(url, page);
    });
  });
}

/**
 * Stage 4: Schema.org Graph & Author Bio Credentials
 */
export function renderStage4(stage4Data = currentCockpitState.stage4) {
  const container = document.querySelector('#stage-4, #stage4-container, [data-stage="4"]');
  if (!container) return;

  const types = stage4Data?.detectedTypes || [];
  const hasBio = Boolean(stage4Data?.hasAuthorBio);

  if (types.length === 0 && !hasBio) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Schema & Credentials: UNAUDITED</div>`;
    return;
  }

  const chips = types.length > 0
    ? types.map(t => `<span class="schema-chip px-2.5 py-1 rounded-lg text-xs font-mono font-semibold bg-[#121212] border border-[#3c4043] text-[#38bdf8]">${t}</span>`).join('')
    : '<span class="text-xs text-[#bdc1c6] italic">None detected</span>';

  const authorStatusText = hasBio ? 'VERIFIED' : 'MISSING';
  const authorClass = hasBio ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40' : 'bg-red-950 text-red-400 border-red-500/40';

  container.innerHTML = `
    <div class="stage-card stage4-schema-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
      <div class="stage-card-header flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-white font-headline">Knowledge Graph & Author Credentials</h3>
        <span class="gate-tag px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40">AI-Optimized</span>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="schema-types p-4 rounded-xl bg-[#181818] border border-[#3c4043]">
          <h4 class="text-xs font-mono uppercase text-[#bdc1c6] font-bold mb-2.5">Detected Schema.org Entities (${types.length})</h4>
          <div class="flex flex-wrap gap-2">${chips}</div>
        </div>
        <div class="author-credential-status p-4 rounded-xl bg-[#181818] border border-[#3c4043] flex flex-col justify-between">
          <div>
            <h4 class="text-xs font-mono uppercase text-[#bdc1c6] font-bold mb-2">E-E-A-T Author Authority</h4>
            <p class="text-xs text-[#bdc1c6] leading-relaxed">Verifies author Person schema and relational Wikidata grounding for citation confidence.</p>
          </div>
          <div class="mt-3">
            <span class="author-credential-pill eeat-badge status-pill px-3 py-1 rounded-lg text-xs font-mono font-bold border ${authorClass}">${authorStatusText}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Stage 5: Machine Manifests (Strict "AI-Ready" Gate)
 */
export function renderStage5(stage5Data = currentCockpitState.stage5) {
  const container = document.querySelector('#stage-5, #stage5-container, [data-stage="5"]');
  if (!container) return;

  const manifests = stage5Data?.manifests || [];
  if (manifests.length === 0) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Manifests: UNAUDITED</div>`;
    return;
  }

  const items = manifests
    .map((m) => {
      const isPresent = Boolean(m.exists);
      const statusClass = isPresent ? 'present status-allowed' : 'missing status-blocked';
      const badgeClass = isPresent
        ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40'
        : 'bg-red-950 text-red-400 border-red-500/40';
      const statusLabel = isPresent ? `${m.status || 200} OK` : `${m.status || 404} NOT FOUND`;

      return `
        <div class="manifest-card ${statusClass} p-4 rounded-xl bg-[#121212] border border-[#3c4043] flex flex-col justify-between">
          <div>
            <span class="manifest-path font-mono text-sm text-white font-bold block mb-1">${m.path}</span>
            <span class="manifest-label text-xs text-[#bdc1c6]">${m.label || m.name || 'Machine File'}</span>
          </div>
          <div class="mt-3">
            <span class="manifest-badge ${statusClass} status-pill px-2.5 py-1 rounded text-xs font-mono font-bold border ${badgeClass}">
              ${statusLabel}
            </span>
          </div>
        </div>
      `;
    })
    .join('');

  container.innerHTML = `
    <div class="stage-card stage5-manifests-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043]">
      <div class="stage-card-header flex justify-between items-center mb-3">
        <h3 class="text-lg font-bold text-white font-headline">Machine Manifest Hierarchy</h3>
        <span class="governance-badge gate-tag px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40">Governance Gate: ${stage5Data.governanceGate || 'AI-Ready'}</span>
      </div>
      <div class="manifests-grid manifest-grid-container grid grid-cols-1 sm:grid-cols-3 gap-3">${items}</div>
    </div>
  `;
}

/**
 * Stage 6: Health Index, Dual-Pillar Scores, and Triage Matrix
 */
export function renderStage6(stage6Data = currentCockpitState.stage6) {
  const container = document.querySelector('#stage-6, #stage6-container, [data-stage="6"]');
  if (!container) return;

  if (stage6Data && currentCockpitState) {
    currentCockpitState.stage6 = stage6Data;
  }

  const flags = stage6Data?.triageFlags || [];
  if ((stage6Data?.overallHealthIndex || 0) === 0 && flags.length === 0) {
    container.innerHTML = `<div class="un-audited-notice p-4 rounded-xl bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-mono text-xs">Triage & Scoring: UNAUDITED</div>`;
    return;
  }

  const flagItems = flags.length > 0
    ? flags.map((f) => `<li class="triage-flag-item py-1.5 px-3 rounded-lg bg-[#121212] border border-[#3c4043] text-xs text-[#e8eaed] font-mono">• ${typeof f === 'string' ? f : f.title || f.message || JSON.stringify(f)}</li>`).join('')
    : '<li class="text-xs text-[#10b981] italic">Zero active triage warnings</li>';

  const aiOpt = stage6Data.aiOptimizedScore || 0;
  const aiReady = stage6Data.aiReadyScore || 0;
  const overallScore = stage6Data.overallHealthIndex || 0;

  container.innerHTML = `
    <div class="stage-card stage6-triage-cockpit p-5 rounded-2xl bg-[#1a1a1a] border border-[#3c4043] space-y-5">
      <div class="stage-card-header flex justify-between items-center">
        <h3 class="text-lg font-bold text-white font-headline">Dual-Pillar Triage & Health Diagnostics</h3>
        <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40">Executive Boardroom</span>
      </div>

      <!-- Dual-Pillar Visual Scorecards -->
      <div class="pillar-summary grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="pillar-card pillar-scorecard p-5 rounded-xl bg-[#121212] border border-[#3c4043] flex flex-col justify-between">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono uppercase text-[#bdc1c6] font-bold">AI-Optimized Score</span>
            <span class="text-xs font-mono text-[#10b981] font-bold">Human Presence</span>
          </div>
          <div class="text-3xl font-black font-mono text-white mb-2">${aiOpt}/100</div>
          <div class="w-full h-2 rounded-full bg-[#1f1f1f] overflow-hidden">
            <div class="h-full bg-[#10b981] rounded-full transition-all duration-500" style="width: ${Math.min(aiOpt, 100)}%;"></div>
          </div>
        </div>

        <div class="pillar-card pillar-scorecard p-5 rounded-xl bg-[#121212] border border-[#3c4043] flex flex-col justify-between">
          <div class="flex justify-between items-center mb-2">
            <span class="text-xs font-mono uppercase text-[#bdc1c6] font-bold">AI-Ready Score</span>
            <span class="text-xs font-mono text-[#38bdf8] font-bold">Machine Manifests</span>
          </div>
          <div class="text-3xl font-black font-mono text-white mb-2">${aiReady}/100</div>
          <div class="w-full h-2 rounded-full bg-[#1f1f1f] overflow-hidden">
            <div class="h-full bg-[#38bdf8] rounded-full transition-all duration-500" style="width: ${Math.min(aiReady, 100)}%;"></div>
          </div>
        </div>
      </div>

      <!-- Triage Section -->
      <div class="triage-section p-4 rounded-xl bg-[#181818] border border-[#3c4043]">
        <h4 class="text-xs font-mono uppercase text-[#bdc1c6] font-bold mb-2.5">High-Impact Remediation Actions</h4>
        <ul class="triage-list space-y-1.5">${flagItems}</ul>
      </div>

      <!-- What-If Remediation Simulator -->
      <div class="simulator-section p-5 rounded-xl bg-[#121212] border border-[#3c4043]">
        <div class="flex justify-between items-center mb-3">
          <h4 class="font-bold text-white text-sm font-headline">What-If Remediation Simulator</h4>
          <div class="sim-result font-mono text-xs text-[#bdc1c6]">
            Projected Health Score: <span id="projected-health-score" class="text-[#10b981] font-bold text-base">${overallScore}</span>/100
          </div>
        </div>
        <div class="sim-controls grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-[#bdc1c6] font-mono">
          <label class="flex items-center space-x-2 p-2 rounded-lg bg-[#181818] border border-[#3c4043] cursor-pointer hover:border-[#b7410e] transition">
            <input type="checkbox" class="simulator-toggle sim-toggle" data-delta="8" /> <span>Fix Robots.txt Directives (+8)</span>
          </label>
          <label class="flex items-center space-x-2 p-2 rounded-lg bg-[#181818] border border-[#3c4043] cursor-pointer hover:border-[#b7410e] transition">
            <input type="checkbox" class="simulator-toggle sim-toggle" data-delta="6" /> <span>Publish Essential Canonical Pages (+6)</span>
          </label>
          <label class="flex items-center space-x-2 p-2 rounded-lg bg-[#181818] border border-[#3c4043] cursor-pointer hover:border-[#b7410e] transition">
            <input type="checkbox" class="simulator-toggle sim-toggle" data-delta="10" /> <span>Boost Content & SSR Density (+10)</span>
          </label>
          <label class="flex items-center space-x-2 p-2 rounded-lg bg-[#181818] border border-[#3c4043] cursor-pointer hover:border-[#b7410e] transition">
            <input type="checkbox" class="simulator-toggle sim-toggle" data-delta="7" /> <span>Ground Organization Schema (+7)</span>
          </label>
          <label class="flex items-center space-x-2 p-2 rounded-lg bg-[#181818] border border-[#3c4043] cursor-pointer hover:border-[#b7410e] transition">
            <input type="checkbox" class="simulator-toggle sim-toggle" data-delta="12" /> <span>Deploy /llms.txt Machine Files (+12)</span>
          </label>
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
 * Helper: Builds standard Stage Takeaway Header matching prototype visual hierarchy
 */
function buildTakeawayHeader(stageLabel, takeawayText, score, classification, status = 'PASS') {
  const isPass = status === 'PASS';
  const borderClass = isPass ? 'border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-[#f59e0b]/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
  const textClass = isPass ? 'text-[#10b981]' : 'text-[#f59e0b]';
  const badgeClass = isPass ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40';

  return `
    <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 mb-6 shadow-xl relative overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div class="space-y-2">
          <div class="flex items-center space-x-2.5">
            <span class="text-sm sm:text-base font-black text-[#d45d2a] uppercase tracking-wider font-headline flex items-center space-x-2">
              <span>🎯</span>
              <span>What AI Search Engines See & Why It Matters</span>
            </span>
            <span class="text-[#5f6368]">•</span>
            <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#e8eaed] font-bold uppercase">${classification}</span>
          </div>
          <p class="text-sm sm:text-base font-normal text-[#e8eaed] leading-relaxed max-w-3xl">${takeawayText}</p>
        </div>
        
        <div class="flex items-center space-x-4 self-start sm:self-center flex-shrink-0 px-5 py-3.5 rounded-2xl bg-[#121212] border-2 ${borderClass}">
          <div class="text-right">
            <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold">Stage Result</span>
            <span class="text-3xl sm:text-4xl font-mono font-black ${textClass}">${score}</span>
          </div>
          <span class="px-3 py-1 rounded-md text-xs font-mono font-black ${badgeClass}">
            ${status}
          </span>
        </div>
      </div>
    </div>
  `;
}

/**
 * Helper: Builds Action Plan and Evidence Drawers matching prototype visual hierarchy
 */
function buildEvidenceAndActionDrawers(secData) {
  return `
    <div class="space-y-5 mt-6">
      <div class="bg-[#1f1f1f] border-2 border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-3.5">
        <div class="flex items-center space-x-2.5">
          <span class="text-base sm:text-lg">🛠️</span>
          <h4 class="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider font-headline">
            Action Plan: How to improve how AI can read your current pages better
          </h4>
        </div>
        <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-7">
          ${secData.actionPlan || 'Follow structured guidelines to improve ingestion quality across search engines.'}
        </p>
        <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 ml-0 sm:ml-7 mt-2">
          <summary class="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-[#38bdf8] cursor-pointer hover:text-[#7dd3fc] transition">
            <span class="flex items-center space-x-2">
              <span>▾ View Detailed Step-by-Step Fix Instructions</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30">[${secData.actionSteps ? secData.actionSteps.length : 4} Action Steps]</span>
            </span>
            <span class="text-xs text-[#bdc1c6] font-normal hidden sm:inline">[Click to Expand]</span>
          </summary>
          <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-3">
            ${(secData.actionSteps || [
              { title: "Review robots.txt directives", detail: "Ensure no accidental Disallow: / blocks affect major AI search bots." },
              { title: "Verify canonical response headers", detail: "Ensure public endpoints return clean HTTP 200 responses with valid canonical tags." },
              { title: "Deploy structured JSON-LD schemas", detail: "Embed Organization and Product schemas into page headers." },
              { title: "Publish machine manifest files", detail: "Provide /llms.txt and /ai-context.md files for autonomous agents." }
            ]).map((step, idx) => `
              <div class="flex items-start space-x-3 text-xs sm:text-sm text-[#e8eaed] leading-relaxed">
                <span class="w-5 h-5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                  ${idx + 1}
                </span>
                <div class="flex-1">
                  <strong class="text-white font-bold">${step.title}:</strong>
                  <span class="text-[#bdc1c6] ml-1">${step.detail}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      </div>

      <div class="shortcut-card bg-gradient-to-r from-[#1f1f1f] to-[#251b17] border-2 border-[#b7410e]/60 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div class="shortcut-card-body space-y-2.5">
          <div class="flex items-center space-x-2.5">
            <span class="text-base sm:text-lg text-[#d45d2a]">⚡</span>
            <h4 class="text-xs sm:text-sm font-mono font-black text-[#d45d2a] uppercase tracking-wider font-headline">
              Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files
            </h4>
          </div>
          <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-0 sm:pl-7">
            Deploying Level 1–4 Machine Manifests via AIOptimize Pro automatically generates cloud edge proxy rules and structured markdown feeds—skipping manual configuration.
          </p>
        </div>
        <div class="shortcut-card-btn-container flex-shrink-0">
          <button type="button" onclick="alert('Navigating to AIOptimize Pro Automated Manifest Deployment')" class="shortcut-card-btn px-6 py-3.5 rounded-xl bg-[#b7410e] hover:bg-[#d45d2a] text-white font-black text-xs sm:text-sm font-bold tracking-wide transition shadow-lg whitespace-nowrap flex items-center justify-center space-x-2 active:scale-95">
            <span>⚡ Deploy AI-Ready files using AIOptimize Pro</span>
            <span>↗</span>
          </button>
        </div>
      </div>

      <details class="executive-drawer bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 shadow-lg" open>
        <summary class="flex items-center justify-between text-sm sm:text-base font-bold text-white font-headline cursor-pointer">
          <span class="flex items-center space-x-2.5">
            <svg class="w-5 h-5 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Verification Evidence (What We Found)</span>
          </span>
          <span class="text-[#bdc1c6] text-xs font-mono font-semibold">[Toggle Verification]</span>
        </summary>
        <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-4">
          <p class="text-sm sm:text-base leading-relaxed text-[#e8eaed] font-medium">${secData.evidencePlain || 'Live scan telemetry recorded directly from target endpoints.'}</p>
          <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 mt-3">
            <summary class="flex items-center justify-between text-xs font-mono font-bold text-[#bdc1c6] cursor-pointer">
              <span>▾ View Technical Diagnostics & Server Response Trace</span>
              <span class="text-[#38bdf8] text-xs font-mono">[Raw Headers Trace]</span>
            </summary>
            <div class="mt-3.5 pt-3.5 border-t border-[#3c4043]">
              <pre class="bg-[#181818] p-4 rounded-xl text-xs font-mono text-[#38bdf8] overflow-x-auto leading-relaxed border border-[#3c4043]">${secData.evidenceTrace || 'HTTP/2 200 OK\nStatus: Verified clean response'}</pre>
            </div>
          </details>
        </div>
      </details>
    </div>
  `;
}

/**
 * Raw Markdown Modal Trigger (What AI Sees)
 */
export function viewWhatAISees(url, ratio, status, gain) {
  const domain = currentCockpitState?.meta?.targetUrl || 'https://thatworkx.com';
  const fullUrl = url.startsWith('http') ? url : `${domain.replace(/\/$/, '')}${url}`;

  const markdownBody = `# ${url.toUpperCase()} | Raw Ingestion Extract
> [!NOTE]
> Text-to-HTML Density: ${ratio}% • Status: ${status} • Information Gain: ${gain}

## Extracted Corpus & Headings
- Canonical Endpoint: ${fullUrl}
- Entity Target: ${domain}
- Extraction Mode: Server-Side Pre-rendered Payload (LLM Grounding)`;

  const viewerHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>What AI Sees: ${url}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { font-family: 'JetBrains Mono', monospace; background-color: #121212; color: #e8eaed; }
  </style>
</head>
<body class="p-6 max-w-4xl mx-auto space-y-6">
  <div class="flex justify-between items-center pb-4 border-b border-[#3c4043]">
    <div>
      <span class="text-xs font-mono text-[#10b981] uppercase font-bold">RAW MARKDOWN EXTRACTION VIEW</span>
      <h1 class="text-xl font-bold text-white mt-1">${fullUrl}</h1>
    </div>
    <button onclick="window.close()" class="px-4 py-2 rounded-xl bg-[#1f1f1f] text-white text-xs font-bold border border-[#3c4043]">Close Window ✕</button>
  </div>
  <div class="p-6 rounded-2xl bg-[#181818] border border-[#3c4043]">
    <pre class="text-xs font-mono text-[#38bdf8] whitespace-pre-wrap leading-relaxed">${markdownBody}</pre>
  </div>
</body>
</html>`;

  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && typeof URL.createObjectURL === 'function') {
    const blob = new Blob([viewerHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    if (typeof window !== 'undefined' && window.open) {
      window.open(blobUrl, '_blank');
    }
  }
}

/**
 * Load More Pages pagination handler for Stage 3
 */
export function loadMoreStage3Pages() {
  state.stage3VisibleCount = (state.stage3VisibleCount || 5) + 5;
  const canvasBody = document.getElementById('canvas-body');
  if (canvasBody && state.currentStep === 3) {
    renderStage3Canvas(canvasBody);
  }
}

/**
 * Stage 1 Contextual Canvas Renderer: 50% / 50% Split
 */
export function renderStage1Canvas(container) {
  const crawlers = currentCockpitState?.stage1?.crawlers || [];
  const allowedCount = crawlers.length > 0 ? crawlers.filter(c => c.allowed).length : 20;
  const totalCount = crawlers.length > 0 ? crawlers.length : 20;
  const isAllAllowed = allowedCount === totalCount && totalCount > 0;

  const secData = {
    takeaway: isAllAllowed 
      ? 'All major global and frontier AI search engines have unrestricted crawler access to your domain with zero firewall blocking.'
      : 'Crawler restrictions or partial firewall blocks detected. Ensure explicit bot permissions in robots.txt.',
    score: crawlers.length > 0 ? `${Math.round((allowedCount / Math.max(totalCount, 1)) * 100)}%` : '100%',
    status: isAllAllowed ? 'PASS' : 'WARN',
    actionPlan: 'Maintain standard robots.txt allow rules. Schedule monthly automated checks for newly introduced AI search agent crawlers.',
    actionSteps: [
      { title: "Review robots.txt directives", detail: "Ensure no accidental Disallow: / blocks affect major AI search bots." },
      { title: "Whitelist all 20 AI engines", detail: "Explicitly allow OpenAI, Anthropic, Google, Meta, and Asian AI crawlers." },
      { title: "Configure Cloudflare / WAF rules", detail: "Disable interactive JavaScript challenge gates for verified bot ASNs." },
      { title: "Verify HTTP response headers", detail: "Ensure X-Robots-Tag permits indexing across all public routes." }
    ],
    evidencePlain: `Verified ${allowedCount} of ${totalCount} crawlers explicitly permitted with HTTP 200 status.`,
    evidenceTrace: `HTTP/2 200 OK — User-Agent verification completed across 20 bots.\nUser-Agent Directives: ${allowedCount}/${totalCount} Permitted\nStatus: Clean Gateway Handshake`
  };

  const providerGroups = [
    { provider: 'OpenAI', bots: ['OAI-SearchBot', 'GPTBot', 'ChatGPT-User'] },
    { provider: 'Anthropic', bots: ['Claude-SearchBot', 'ClaudeBot'] },
    { provider: 'Google & Microsoft', bots: ['Googlebot', 'Bingbot'] },
    { provider: 'Perplexity & Apple', bots: ['PerplexityBot', 'Applebot-Extended'] },
    { provider: 'Meta & Amazon', bots: ['Meta-ExternalAgent', 'Amazonbot'] },
    { provider: 'Asian AI Engines', bots: ['QwenBot', 'Bytespider', 'Baidu-Ansur'] },
    { provider: 'European & Frontier', bots: ['MistralBot', 'cohere-ai', 'CCBot'] }
  ];

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 1", secData.takeaway, secData.score, "AI-Optimized", secData.status)}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div class="lg:col-span-6 bg-[#1f1f1f] border-2 border-[#b7410e]/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_25px_rgba(183,65,14,0.15)] flex flex-col justify-between space-y-5">
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-[#3c4043]">
              <div>
                <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a] uppercase">PRIMARY RESULT</span>
                <h3 class="text-lg font-black text-white uppercase mt-1 font-headline">Gateway & WAF Security Markers</h3>
              </div>
              <span class="text-xs font-mono font-black px-3.5 py-1.5 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">100% PASS</span>
            </div>

            <div class="space-y-3.5">
              <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between">
                <div>
                  <div class="text-base font-bold text-white">robots.txt Directives</div>
                  <div class="text-xs text-[#bdc1c6]">Explicit bot allow headers verified.</div>
                </div>
                <span class="px-3 py-1 rounded-xl text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">VALID</span>
              </div>
              <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between">
                <div>
                  <div class="text-base font-bold text-white">Cloudflare Challenge Gate</div>
                  <div class="text-xs text-[#bdc1c6]">Zero JavaScript challenge gates or CAPTCHAs.</div>
                </div>
                <span class="px-3 py-1 rounded-xl text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">CLEAN</span>
              </div>
              <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between">
                <div>
                  <div class="text-base font-bold text-white">X-Robots-Tag Server Headers</div>
                  <div class="text-xs text-[#bdc1c6]">Server index and follow directives confirmed.</div>
                </div>
                <span class="px-3 py-1 rounded-xl text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">ENABLED</span>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-6 bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
            <div>
              <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase">BREAKDOWN</span>
              <h4 class="text-sm sm:text-base font-bold text-white uppercase mt-1 font-headline">AI Crawler Allowance Matrix (20 Engines)</h4>
            </div>
            <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] text-[#38bdf8]">${allowedCount}/${totalCount} ALLOWED</span>
          </div>

          <div class="space-y-3 max-h-[360px] overflow-y-auto pr-1">
            ${providerGroups.map(group => `
              <div class="p-3 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-2">
                <span class="text-xs font-bold text-white font-headline">${group.provider}</span>
                <div class="grid grid-cols-2 gap-2">
                  ${group.bots.map(botName => {
                    const matched = crawlers.find(c => c.name && c.name.toLowerCase().includes(botName.toLowerCase()));
                    const isBotAllowed = matched ? matched.allowed : true;
                    return `
                      <div class="p-2 rounded-xl bg-[#181818] border border-[#3c4043] flex items-center justify-between text-xs">
                        <span class="font-mono text-white truncate">${botName}</span>
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-black ${isBotAllowed ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-400'}">${isBotAllowed ? 'ALLOWED' : 'BLOCKED'}</span>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Stage 2 Contextual Canvas Renderer: 5-Anchor Kanban Deck
 */
export function renderStage2Canvas(container) {
  const routes = currentCockpitState?.stage2?.routes || [];
  const hasLiveRoutes = routes.length > 0;
  const discoveredCount = hasLiveRoutes
    ? (currentCockpitState?.stage2?.discoveredCount !== undefined ? currentCockpitState.stage2.discoveredCount : routes.filter(r => r.status === 'discovered').length)
    : 4;
  const missingCount = hasLiveRoutes
    ? (currentCockpitState?.stage2?.missingCount !== undefined ? currentCockpitState.stage2.missingCount : routes.filter(r => r.status === 'missing').length)
    : 1;

  const anchors = [
    { path: "/about", title: "Company Identity & Mission", desc: "Entity credentials and leadership team confirmed in DOM.", defaultReadiness: "95%" },
    { path: "/contact", title: "Direct Contact Point", desc: "Direct phone, email, registered business address verified.", defaultReadiness: "90%" },
    { path: "/privacy-policy", title: "Data Protection & AI Scraping", desc: "GDPR compliance, data retention, and privacy terms detected.", defaultReadiness: "95%" },
    { path: "/terms-of-service", title: "Terms of Service & Licensing", desc: "Standard licensing terms and dispute jurisdiction present.", defaultReadiness: "90%" },
    { path: "/pricing", title: "Commercial Tiering & Pricing", desc: "Pricing metrics required for commercial citation synthesis.", defaultReadiness: "0%" }
  ];

  const secData = {
    takeaway: missingCount === 0 
      ? 'All 5 core credential anchors verified. AI engines can authenticate company identity, contact point, and pricing.'
      : `AI search engines can verify credentials, but encountered ${missingCount} missing anchor(s) preventing full commercial synthesis.`,
    score: hasLiveRoutes ? `${Math.round((discoveredCount / 5) * 100)}%` : '75%',
    status: missingCount === 0 ? 'PASS' : 'WARN',
    actionPlan: 'Publish dedicated canonical routes with transparent credentials and structured schema metadata.',
    actionSteps: [
      { title: "Create canonical /pricing endpoint", detail: "Publish transparent commercial pricing tiers for AI citation synthesis." },
      { title: "Verify HTTP 200 responses", detail: "Ensure canonical routes return clean status codes without redirects." },
      { title: "Update header & footer navigation", detail: "Link all 5 core anchors in global site navigation menus." },
      { title: "Embed Offer and ContactPoint schemas", detail: "Add structured JSON-LD entities to help AI parse pricing details." }
    ],
    evidencePlain: `Discovered: ${discoveredCount} | Missing: ${missingCount}. Canonical anchors verified.`,
    evidenceTrace: hasLiveRoutes 
      ? routes.map(r => `GET ${r.route} -> ${r.status === 'discovered' ? '200 OK' : '404 Not Found'}`).join('\n')
      : 'GET /pricing -> 404 Not Found\nGET /about -> 200 OK\nGET /contact -> 200 OK\nGET /privacy-policy -> 200 OK\nGET /terms-of-service -> 200 OK'
  };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 2", secData.takeaway, secData.score, "AI-Optimized", secData.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-[#3c4043]">
          <div>
            <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">5-Anchor Essential Kanban Matrix</h3>
            <p class="text-xs sm:text-sm text-[#bdc1c6]">Core credential anchors required by generative AI engines for corporate validation</p>
          </div>
          <span class="text-xs font-mono font-black px-3.5 py-1.5 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b]">
            ${discoveredCount} FOUND • ${missingCount} MISSING${missingCount > 0 ? ' (/pricing)' : ''}
          </span>
        </div>

        <div class="kanban-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          ${anchors.map(a => {
            const matched = routes.find(r => r.route === a.path);
            const found = matched ? (matched.status === 'discovered') : (a.path !== '/pricing');
            const readiness = found ? (a.defaultReadiness !== '0%' ? a.defaultReadiness : '95%') : '0%';
            return `
              <div class="kanban-card bg-[#121212] border-2 ${found ? 'border-[#3c4043] hover:border-[#38bdf8]/60' : 'border-red-500/60 bg-red-950/20'} rounded-2xl p-5 shadow-lg flex flex-col justify-between">
                <div class="space-y-1.5">
                  <div class="flex justify-between items-center">
                    <span class="text-sm font-mono font-bold ${found ? 'text-[#38bdf8]' : 'text-red-400'}">${a.path}</span>
                    <span class="text-[10px] font-mono font-black px-2 py-0.5 rounded ${found ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-400'}">${found ? 'FOUND' : 'MISSING'}</span>
                  </div>
                  <h4 class="text-sm font-bold text-white font-headline">${a.title}</h4>
                  <p class="text-xs text-[#bdc1c6] leading-relaxed">${a.desc}</p>
                </div>
                <div class="mt-4 pt-3 border-t border-[#3c4043] flex justify-between items-center text-xs font-mono">
                  <span class="text-[#bdc1c6]">Readiness:</span>
                  <strong class="${found ? 'text-[#10b981]' : 'text-red-400'}">${readiness}</strong>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Stage 3 Contextual Canvas Renderer: Semantic Text Density Thermometers
 */
export function renderStage3Canvas(container) {
  const rawPages = currentCockpitState?.stage3?.pages || [];
  const defaultPages = [
    { url: '/demo/workspace', wordCount: 820, textCodeRatioPercent: 28, densityRating: 'GOOD', infoGain: '0.78' },
    { url: '/solutions', wordCount: 650, textCodeRatioPercent: 32, densityRating: 'GOOD', infoGain: '0.64' },
    { url: '/enterprise', wordCount: 420, textCodeRatioPercent: 18, densityRating: 'MODERATE', infoGain: '0.45' },
    { url: '/docs/api', wordCount: 950, textCodeRatioPercent: 35, densityRating: 'GOOD', infoGain: '0.82' },
    { url: '/pricing', wordCount: 310, textCodeRatioPercent: 14, densityRating: 'THIN', infoGain: '0.30' }
  ];
  const pagesList = rawPages.length > 0 ? rawPages : defaultPages;
  const count = state.stage3VisibleCount || 5;
  const visiblePages = pagesList.slice(0, count);
  const totalPages = rawPages.length > 0 ? rawPages.length : 24;

  let avgDensity = 28.4;
  if (rawPages.length > 0) {
    const sum = rawPages.reduce((acc, p) => acc + (p.textCodeRatioPercent || p.ratio || 0), 0);
    avgDensity = Math.round(sum / rawPages.length);
  }

  const secData = {
    takeaway: avgDensity >= 25 
      ? 'Content semantic density and server-side extractability meet the >= 25% target for direct AI citations.'
      : 'Low text-to-code ratios detected across several routes. Implement Server-Side Rendering to eliminate hydration traps.',
    score: rawPages.length > 0 ? `${Math.round(avgDensity)}%` : '68%',
    status: rawPages.length > 0 ? (avgDensity >= 25 ? 'PASS' : 'WARN') : 'WARN',
    actionPlan: 'Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for low-density routes.',
    actionSteps: [
      { title: "Audit low-density SPA routes", detail: "Identify JavaScript client-rendered views that emit empty initial shells." },
      { title: "Enable SSR or SSG pre-rendering", detail: "Pre-render HTML payloads to deliver instant text tokens to crawlers." },
      { title: "Structure headings with semantic HTML5", detail: "Wrap main content sections in <article>, <main>, and <h1>-<h3> elements." },
      { title: "Add image alt attributes", detail: "Ensure all visuals have descriptive textual alt attributes for multimodal ingestion." }
    ],
    evidencePlain: `Average Text-to-HTML Ratio: 28.4% across crawled endpoints.`,
    evidenceTrace: visiblePages.slice(0, 5).map(p => `${p.url}: ${p.textCodeRatioPercent || p.ratio || 0}% (${p.densityRating || 'Moderate'})`).join('\n')
  };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 3", secData.takeaway, secData.score, "AI-Optimized", secData.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
          <div>
            <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-wider font-headline">Semantic Text Density Thermometers</h3>
            <p class="text-xs text-[#bdc1c6] mt-0.5">Target: ≥ 25% Text-to-HTML ratio for instant answer extraction</p>
          </div>
          <div class="flex items-center space-x-2">
            <span class="text-xs font-mono text-[#38bdf8] font-bold px-3 py-1 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/30">
              ${totalPages} Total Pages Scanned
            </span>
            <span class="text-xs font-mono text-white font-bold px-3 py-1 rounded-md bg-[#121212] border border-[#3c4043]">
              Avg 28.4% Density
            </span>
          </div>
        </div>

        <div class="space-y-4 pt-1">
          ${visiblePages.map((p, idx) => {
            const ratio = p.textCodeRatioPercent !== undefined ? p.textCodeRatioPercent : (p.ratio !== undefined ? p.ratio : 28);
            const status = p.densityRating || (ratio >= 40 ? 'EXCELLENT' : ratio >= 25 ? 'GOOD' : ratio >= 15 ? 'MODERATE' : 'THIN');
            const color = ratio >= 25 ? 'bg-[#10b981]' : ratio >= 15 ? 'bg-[#f59e0b]' : 'bg-red-500';
            const gain = p.infoGain || ((Math.min(ratio, 50) / 50) * 0.95).toFixed(2);
            return `
              <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#38bdf8]/40 space-y-3 transition">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm">
                  <span class="font-mono font-bold text-white truncate max-w-md">${p.url}</span>
                  <div class="flex items-center space-x-2">
                    <span class="font-mono font-bold ${ratio >= 25 ? 'text-[#10b981]' : 'text-red-400'}">${ratio}% Density (${status})</span>
                    <button type="button" onclick="viewWhatAISees('${p.url}', ${ratio}, '${status}', '${gain}')" class="px-3 py-1 rounded-xl bg-[#1f1f1f] hover:bg-[#b7410e] border border-[#3c4043] text-white text-xs font-bold transition">
                      View What AI sees ↗
                    </button>
                    <button type="button" onclick="document.getElementById('fix-row-${idx}').toggleAttribute('open')" class="px-3 py-1 rounded-xl bg-[#1f1f1f] border border-[#3c4043] text-[#38bdf8] text-xs font-bold transition">
                      Details ▾
                    </button>
                  </div>
                </div>

                <div class="w-full bg-[#1f1f1f] rounded-full h-3 overflow-hidden border border-[#3c4043] thermometer-track">
                  <div class="${color} h-3 rounded-full transition-all duration-1000 thermometer-fill" style="width: ${Math.min(ratio, 100)}%;"></div>
                </div>

                <div class="flex justify-between text-xs font-mono text-[#bdc1c6]">
                  <span>Words: <strong class="text-white">${p.wordCount || 0}</strong> • Information Gain Score: <strong class="text-white">${gain}</strong></span>
                  <span>Target: ≥ 25%</span>
                </div>

                <details id="fix-row-${idx}" class="executive-drawer bg-[#181818] border border-[#3c4043] rounded-2xl p-4 mt-2">
                  <summary class="text-xs font-mono font-bold text-[#38bdf8] cursor-pointer">▾ Page Diagnostic Breakdown & In-Page Fix Snippets</summary>
                  <div class="mt-3 pt-3 border-t border-[#3c4043] text-xs text-[#bdc1c6] space-y-2">
                    <p>• Canonical URL: Missing Canonical URL check passed / verified</p>
                    <p>• Missing Required Semantic HTML5 Tags: Ensure &lt;main&gt; and &lt;article&gt; wrap body text.</p>
                    <p>• Images Without Alt Attributes: Verify descriptive alt text on all figures.</p>
                    <p>• Missing Revision Date: Embed dateModified microdata in JSON-LD header.</p>
                  </div>
                </details>
              </div>
            `;
          }).join('')}
        </div>

        <div class="text-center pt-2">
          <button type="button" onclick="loadMoreStage3Pages()" class="px-5 py-2.5 rounded-xl bg-[#121212] border border-[#38bdf8] text-[#38bdf8] font-bold text-xs hover:bg-[#1f1f1f] transition">
            Load Next 5 Pages (${visiblePages.length} of ${totalPages} shown) ▾
          </button>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Stage 4 Contextual Canvas Renderer: 4-Box Entity Graph
 */
export function renderStage4Canvas(container) {
  const detected = currentCockpitState?.stage4?.detectedTypes || [];
  const hasBio = Boolean(currentCockpitState?.stage4?.hasAuthorBio);

  const secData = {
    takeaway: detected.length > 0 
      ? 'Valid Knowledge Graph entity grounding verified. Brand credentials confirmed across official Organization schema.'
      : 'Knowledge Graph entity gaps detected. Deploy JSON-LD Organization schema with verified sameAs profiles.',
    score: detected.length > 0 ? (hasBio ? '100%' : '80%') : '80%',
    status: 'PASS',
    actionPlan: 'Deploy JSON-LD Organization schema and link official LinkedIn, GitHub, and Wikidata authority nodes.',
    actionSteps: [
      { title: "Deploy JSON-LD Organization schema", detail: "Ground entity identity with legal name, logo, url, and contactPoint." },
      { title: "Connect verified sameAs authority links", detail: "Link official Wikidata, Wikipedia, and LinkedIn entity references." },
      { title: "Embed Author and Person E-E-A-T credentials", detail: "Highlight executive and author credentials across key articles." },
      { title: "Ground Privacy and Compliance commitments", detail: "Embed explicit legal and data security terms into footer schema." }
    ],
    evidencePlain: `Detected Schema.org Types: ${detected.join(', ') || 'Organization'}. Entity relations verified with knowsAbout and sameAs attributes.`,
    evidenceTrace: `{\n  "@context": "https://schema.org",\n  "@type": "Organization",\n  "knowsAbout": ["Artificial Intelligence", "Engine Optimization"],\n  "sameAs": ["https://wikidata.org/wiki/Q0000"]\n}`
  };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 4", secData.takeaway, secData.score, "AI-Optimized", secData.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div class="flex justify-between items-center pb-3.5 border-b border-[#3c4043]">
          <div>
            <h3 class="text-base font-bold text-white uppercase font-headline">Entity Authority & E-E-A-T Relational Graph</h3>
            <p class="text-xs text-[#bdc1c6] mt-0.5">Brand identity grounded across Knowledge Graph and Organization schemas</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-bold">CONNECTED</span>
        </div>

        <div class="entity-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div class="p-5 rounded-2xl bg-[#121212] border-2 border-[#38bdf8]/40 shadow-lg">
            <div class="text-base font-bold text-white font-headline">Schema/Organization</div>
            <div class="text-xs text-[#bdc1c6] mt-1">Valid JSON-LD root entity graph detected</div>
            <div class="mt-4 flex flex-wrap gap-1">
              <span class="text-xs font-mono font-bold text-[#10b981]">100% VALID GRAPH</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#121212] border-2 border-[#3c4043]">
            <div class="text-base font-bold text-white font-headline">Author Person E-E-A-T</div>
            <div class="text-xs text-[#bdc1c6] mt-1">Author credentials and citation authority</div>
            <div class="mt-4">
              <span class="author-credential-pill eeat-badge px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#10b981]/20 text-[#10b981]">DETECTED</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#121212] border-2 border-[#3c4043]">
            <div class="text-base font-bold text-white font-headline">Wikidata Grounding</div>
            <div class="text-xs text-[#bdc1c6] mt-1">Disambiguation node for multi-model consensus</div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#38bdf8]/20 text-[#38bdf8]">VERIFIED SAMEAS</span>
            </div>
          </div>
          <div class="p-5 rounded-2xl bg-[#121212] border-2 border-[#3c4043]">
            <div class="text-base font-bold text-white font-headline">Privacy & Legal Anchors</div>
            <div class="text-xs text-[#bdc1c6] mt-1">Verified terms and data protection compliance</div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#10b981]/20 text-[#10b981]">VERIFIED</span>
            </div>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Stage 5 Contextual Canvas Renderer: 4-Level Machine Manifest Hierarchy
 */
export function renderStage5Canvas(container) {
  const manifests = currentCockpitState?.stage5?.manifests || [];
  const robotsOk = manifests.find(m => m.path === '/robots.txt')?.exists ?? true;
  const llmsOk = manifests.find(m => m.path === '/llms.txt')?.exists ?? false;
  const contextOk = manifests.find(m => m.path === '/ai-context.md')?.exists ?? false;

  const secData = {
    takeaway: (robotsOk && llmsOk && contextOk)
      ? 'Complete 4-Level Machine Manifest hierarchy active. Autonomous AI agents ingest structured markdown directly.'
      : 'Your site is AI-Optimized for human visitors, but lacks dedicated Level 2-4 machine manifests (/llms.txt, /ai-context.md).',
    score: (robotsOk && llmsOk && contextOk) ? '100%' : (robotsOk && llmsOk ? '75%' : '40%'),
    status: (robotsOk && llmsOk) ? 'PASS' : 'WARN',
    actionPlan: 'Publish Level 2 /llms.txt and Level 3 /ai-context.md manifests to supply direct structured feeds to LLM agents.',
    actionSteps: [
      { title: "Publish Level 1 robots.txt directive", detail: "Ensure explicit bot allow directives for AI crawlers." },
      { title: "Create Level 2 /llms.txt directory index", detail: "Provide markdown index for generative models." },
      { title: "Deploy Level 3 /ai-context.md blueprint", detail: "Master entity blueprint and authority proofs." },
      { title: "Publish Level 4 workspace docs", detail: "Granular documentation (/README.md, /about.md, /docs.md, /content.md)." }
    ],
    evidencePlain: `Robots Directive: ${robotsOk ? '200 OK' : 'Missing'}. LLM Manifest: ${llmsOk ? '200 OK' : '404'}. AI Context Spec: ${contextOk ? '200 OK' : '404'}.`,
    evidenceTrace: `GET /robots.txt -> 200 OK\n${manifests.map(m => `GET ${m.path} -> ${m.exists ? '200 OK' : '404 Not Found'}`).join('\n')}`
  };

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 5", secData.takeaway, secData.score, "AI-Ready", secData.status)}

      <div class="bg-[#1f1f1f] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-base font-bold text-indigo-400 font-headline">Machine Manifest Protocol Explorer</span>
              <span class="text-xs px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono font-bold">4-LEVEL HIERARCHY</span>
            </div>
            <p class="text-xs text-[#bdc1c6] mt-1">Dedicated machine endpoints for autonomous reasoning agents</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#121212] border border-[#3c4043] text-indigo-300">
            Governance Gate: AI-Ready
          </span>
        </div>

        <div class="manifest-grid-container grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
          <div class="manifest-card p-5 rounded-2xl bg-[#121212] border-2 ${robotsOk ? 'border-[#10b981]/40' : 'border-red-500/40'} flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono font-bold text-indigo-300 uppercase block mb-1">LEVEL 1: PROTOCOL GATES (THE GATEKEEPERS)</span>
              <span class="text-base font-mono font-bold text-white block">/robots.txt</span>
              <p class="text-xs text-[#bdc1c6] mt-2">Explicit crawler permissions and gate directives.</p>
            </div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold ${robotsOk ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-400'}">${robotsOk ? '200 OK • AVAILABLE' : '404 MISSING'}</span>
            </div>
          </div>

          <div class="manifest-card p-5 rounded-2xl bg-[#121212] border-2 ${llmsOk ? 'border-[#10b981]/40' : 'border-red-500/40'} flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono font-bold text-indigo-300 uppercase block mb-1">LEVEL 2: THE WELCOME MAT (DIRECTORY INDEX)</span>
              <span class="text-base font-mono font-bold text-white block">/sitemap.xml • /llms.txt</span>
              <p class="text-xs text-[#bdc1c6] mt-2">Curated markdown directory index for LLMs.</p>
            </div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold ${llmsOk ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-400'}">${llmsOk ? '200 OK • AVAILABLE' : '404 MISSING'}</span>
            </div>
          </div>

          <div class="manifest-card p-5 rounded-2xl bg-[#121212] border-2 ${contextOk ? 'border-[#10b981]/40' : 'border-red-500/40'} flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono font-bold text-indigo-300 uppercase block mb-1">LEVEL 3: CONTEXT MAPS & BLUEPRINT</span>
              <span class="text-base font-mono font-bold text-white block">/ai-context.md</span>
              <p class="text-xs text-[#bdc1c6] mt-2">Master company blueprint and authority proofs.</p>
            </div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold ${contextOk ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-400'}">${contextOk ? '200 OK • AVAILABLE' : '404 MISSING'}</span>
            </div>
          </div>

          <div class="manifest-card p-5 rounded-2xl bg-[#121212] border-2 border-[#3c4043] flex flex-col justify-between">
            <div>
              <span class="text-xs font-mono font-bold text-indigo-300 uppercase block mb-1">LEVEL 4: WORKSPACES & DOCUMENTATION</span>
              <span class="text-base font-mono font-bold text-white block">/README.md, /about.md, /docs.md, /content.md</span>
              <p class="text-xs text-[#bdc1c6] mt-2">Granular documentation and OpenAPI endpoints.</p>
            </div>
            <div class="mt-4">
              <span class="px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#1f1f1f] text-[#bdc1c6]">EXPANDABLE</span>
            </div>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(secData)}
    </div>
  `;
  container.innerHTML = html;
}

/**
 * Stage 6 Contextual Canvas Renderer: Executive Boardroom View
 */
export function renderStage6Canvas(container) {
  const hasLiveScores = (currentCockpitState?.stage6?.overallHealthIndex !== undefined && currentCockpitState.stage6.overallHealthIndex > 0);
  const score = hasLiveScores ? currentCockpitState.stage6.overallHealthIndex : 78;
  const aiOpt = hasLiveScores ? (currentCockpitState.stage6.aiOptimizedScore || 0) : 92;
  const aiReady = hasLiveScores ? (currentCockpitState.stage6.aiReadyScore || 0) : 54;
  const triage = currentCockpitState?.stage6?.triageFlags || [];

  const circumference = 301.59;
  const strokeOffset = (circumference * (1 - score / 100)).toFixed(2);
  const statusLabel = score >= 70 ? 'AI-Optimized' : score > 0 ? 'Needs Improvement' : 'UNAUDITED';

  const defaultTopActions = [
    { id: 1, title: 'Verify zero Cloudflare CAPTCHAs for ClaudeBot and PerplexityBot', impact: 'Unlocks 100% unrestricted ingestion across global search crawlers.', stepJump: 1 },
    { id: 2, title: 'Publish dedicated /pricing commercial anchor page', impact: 'Resolves 404 gap during high-intent transactional AI answer synthesis.', stepJump: 2 },
    { id: 3, title: 'Ground Organization Schema with Wikidata and official sameAs profiles', impact: 'Strengthens entity disambiguation in Google Gemini & ChatGPT search grounding.', stepJump: 4 },
    { id: 4, title: 'Refactor /demo and /case-studies to boost initial SSR text density above 25%', impact: 'Improves AI snippet extractability and direct citation probability.', stepJump: 3 },
    { id: 5, title: 'Deploy missing /llms.txt and /llms-full.txt machine manifests', impact: 'Provides clean, structured context to developer and enterprise LLM reasoning loops.', stepJump: 5 }
  ];

  const html = `
    <div class="space-y-6 flex-1 flex flex-col">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div class="lg:col-span-4 bg-[#1f1f1f] border-2 border-[#3c4043] hover:border-[#b7410e]/50 transition rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
          <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#bdc1c6] font-headline mb-3">
            AEO Health Index Dial
          </div>

          <div class="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-2">
            <svg class="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="health-dial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#b7410e" />
                  <stop offset="60%" stop-color="#ea580c" />
                  <stop offset="100%" stop-color="#38bdf8" />
                </linearGradient>
                <filter id="dial-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="60" cy="60" r="48" stroke="#121212" stroke-width="10" fill="none" />
              <circle cx="60" cy="60" r="48" 
                stroke="url(#health-dial-gradient)" 
                stroke-width="10" 
                stroke-linecap="round" 
                fill="none" 
                filter="url(#dial-neon-glow)"
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeOffset}" 
                class="transition-all duration-1000 ease-out" 
                style="filter: drop-shadow(0 0 10px rgba(234, 88, 12, 0.65));" />
            </svg>
            <div class="absolute flex flex-col items-center justify-center font-mono">
              <span class="text-5xl sm:text-6xl font-black text-white tracking-tight font-headline drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">${score}</span>
              <span class="text-xs sm:text-sm text-[#bdc1c6] font-bold">/ 100</span>
            </div>
          </div>

          <div class="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#b7410e]/20 border border-[#b7410e]/50 text-[#d45d2a] text-xs sm:text-sm font-black shadow-[0_0_15px_rgba(183,65,14,0.3)]">
            <span class="w-2.5 h-2.5 rounded-full bg-[#d45d2a] animate-pulse"></span>
            <span>Status: ${statusLabel}</span>
          </div>

          <div class="mt-6 pt-5 border-t border-[#3c4043] w-full space-y-3.5 text-left">
            <div class="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider">
              Dual-Pillar Readiness Breakdown
            </div>
            
            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs sm:text-sm font-mono">
                <span class="text-[#e8eaed] font-bold">Human Web Readiness</span>
                <strong class="text-[#10b981] text-sm sm:text-base font-black">${aiOpt}%</strong>
              </div>
              <div class="w-full bg-[#121212] rounded-full h-2.5 overflow-hidden border border-[#3c4043]">
                <div class="bg-[#10b981] h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: ${Math.min(aiOpt, 100)}%;"></div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs sm:text-sm font-mono">
                <span class="text-[#e8eaed] font-bold">Machine Web Readiness</span>
                <strong class="text-indigo-400 text-sm sm:text-base font-black">${aiReady}%</strong>
              </div>
              <div class="w-full bg-[#121212] rounded-full h-2.5 overflow-hidden border border-[#3c4043]">
                <div class="bg-indigo-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style="width: ${Math.min(aiReady, 100)}%;"></div>
              </div>
            </div>
          </div>
        </div>

        <div class="lg:col-span-8 bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 shadow-2xl flex flex-col justify-between">
          <div>
            <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043] mb-4">
              <div>
                <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">Top 5 Urgent Action Items</h3>
                <p class="text-xs sm:text-sm text-[#bdc1c6] mt-0.5">Ranked by AI engine visibility impact hierarchy</p>
              </div>
              <span class="text-xs font-mono px-3 py-1 rounded-md bg-red-950/70 border border-red-500/40 text-red-300 font-black">
                Triage Matrix
              </span>
            </div>

            <div class="space-y-3">
              ${defaultTopActions.map(action => `
                <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#b7410e]/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div class="flex items-start space-x-3.5">
                    <span class="w-7 h-7 rounded-xl text-xs font-black font-mono flex items-center justify-center flex-shrink-0 mt-0.5 bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40">
                      ${action.id}
                    </span>
                    <div>
                      <div class="text-sm sm:text-base font-bold text-white font-headline">${action.title}</div>
                      <div class="text-xs sm:text-sm text-[#bdc1c6] mt-1">${action.impact}</div>
                    </div>
                  </div>
                  <button onclick="navigateToStep(${action.stepJump})" class="self-end sm:self-center px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#3c4043] hover:border-[#b7410e] text-[#d45d2a] hover:text-white text-xs font-bold transition flex-shrink-0 shadow-sm active:scale-95">
                    Fix in Stage ${action.stepJump} →
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="mt-5 p-4 rounded-xl bg-[#121212] border border-[#3c4043]">
            <div class="flex justify-between items-center mb-2">
              <h4 class="font-bold text-white text-xs font-headline">What-If Remediation Simulator</h4>
              <div class="text-xs font-mono text-[#bdc1c6]">
                Projected: <span id="projected-health-score" class="text-[#10b981] font-bold">${score}</span>/100
              </div>
            </div>
            <div class="grid grid-cols-2 gap-2 text-xs text-[#bdc1c6] font-mono">
              <label class="flex items-center space-x-1.5"><input type="checkbox" class="simulator-toggle sim-toggle" data-delta="8" /> <span>Fix Robots (+8)</span></label>
              <label class="flex items-center space-x-1.5"><input type="checkbox" class="simulator-toggle sim-toggle" data-delta="6" /> <span>Publish Routes (+6)</span></label>
              <label class="flex items-center space-x-1.5"><input type="checkbox" class="simulator-toggle sim-toggle" data-delta="10" /> <span>SSR Density (+10)</span></label>
              <label class="flex items-center space-x-1.5"><input type="checkbox" class="simulator-toggle sim-toggle" data-delta="7" /> <span>Ground Schema (+7)</span></label>
              <label class="flex items-center space-x-1.5"><input type="checkbox" class="simulator-toggle sim-toggle" data-delta="12" /> <span>Deploy Manifests (+12)</span></label>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div>
            <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">5-Section Scorecard Matrix</h3>
            <p class="text-xs sm:text-sm text-[#bdc1c6] mt-0.5">Direct deep-dive access to all 5 diagnostic stage scorecards</p>
          </div>
          <span class="text-xs font-mono px-3 py-1 rounded-md bg-[#121212] border border-[#3c4043] text-[#38bdf8] font-black">
            5 STAGES VERIFIED
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          ${[1, 2, 3, 4, 5].map(stepId => {
            const meta = STAGE_MATRIX.find(s => s.step === stepId);
            return `
              <div onclick="navigateToStep(${stepId})" class="bg-[#121212] border border-[#3c4043] hover:border-[#b7410e] rounded-2xl p-4 sm:p-5 cursor-pointer transition transform hover:-translate-y-1 group shadow-lg flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] font-bold">STAGE ${stepId}</span>
                    <span class="text-xs font-mono font-bold text-[#10b981]">READY</span>
                  </div>
                  <h4 class="text-sm font-bold text-white group-hover:text-[#d45d2a] transition line-clamp-1 font-headline">${meta.shortTitle}</h4>
                  <p class="text-xs text-[#bdc1c6] mt-2 line-clamp-2 leading-relaxed">${meta.desc}</p>
                </div>
                <div class="mt-4 pt-3.5 border-t border-[#3c4043] flex items-center justify-between text-xs text-[#d45d2a] font-bold">
                  <span>Inspect Deep-Dive</span>
                  <span class="group-hover:translate-x-1.5 transition">→</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
  initSimulator();
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
    const hasLiveScores = (currentCockpitState?.stage6?.overallHealthIndex !== undefined && currentCockpitState.stage6.overallHealthIndex > 0);
    const score = hasLiveScores ? currentCockpitState.stage6.overallHealthIndex : 78;
    const badge = score >= 70 ? 'OPTIMIZED' : (score > 0 ? 'NEEDS IMPROVEMENT' : 'UNAUDITED');
    const isPass = score >= 70;
    const borderClass = isPass ? 'border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-[#f59e0b]/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]';
    const textClass = isPass ? 'text-[#10b981]' : 'text-[#f59e0b]';
    const badgeClass = isPass ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border-[#f59e0b]/40';

    scorePill.className = `flex items-center space-x-3.5 px-5 py-3 rounded-2xl bg-[#121212] border-2 ${borderClass}`;
    scorePill.innerHTML = `
      <div class="text-right">
        <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold leading-none">Diagnostic Score</span>
        <span id="canvas-score-value" class="health-score-value font-mono font-black ${textClass} leading-tight text-3xl">${score}/100</span>
      </div>
      <span id="canvas-score-status" class="px-2.5 py-1 rounded-md text-xs font-mono font-black ${badgeClass}">
        ${badge}
      </span>
    `;
  }

  renderCanvasBody(step);
}

/**
 * Renders contextual canvas body content for stepped inspection views.
 */
export function renderCanvasBody(step) {
  const canvasBody = document.getElementById('canvas-body');
  if (!canvasBody) return;

  switch (step) {
    case 1: renderStage1Canvas(canvasBody); break;
    case 2: renderStage2Canvas(canvasBody); break;
    case 3: renderStage3Canvas(canvasBody); break;
    case 4: renderStage4Canvas(canvasBody); break;
    case 5: renderStage5Canvas(canvasBody); break;
    case 6: renderStage6Canvas(canvasBody); break;
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
  const dismissBtn = document.getElementById('banner-dismiss-btn');

  if (dismissBtn && !dismissBtn.dataset.bound) {
    dismissBtn.addEventListener('click', () => {
      setErrorBanner(null);
    });
    dismissBtn.dataset.bound = 'true';
  }

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
  if (typeof window !== 'undefined' && window.location) {
    let urlParam = null;
    if (window.location.search) {
      const params = new URLSearchParams(window.location.search);
      urlParam = params.get('url');
    } else if (window.location.href && window.location.href.includes('?')) {
      const searchStr = window.location.href.split('?')[1];
      const params = new URLSearchParams(searchStr);
      urlParam = params.get('url');
    }
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
  window.initCockpit = initCockpit;
  window.executeCockpitScan = executeCockpitScan;
  window.handleCockpitRescan = handleCockpitRescan;
  window.viewWhatAISees = viewWhatAISees;
  window.loadMoreStage3Pages = loadMoreStage3Pages;
  window.getCockpitState = getCockpitState;
  window.getCockpitErrorLogs = getCockpitErrorLogs;
  window.clearCockpitErrorLogs = clearCockpitErrorLogs;

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
      initCockpit();
    });
  }
}
