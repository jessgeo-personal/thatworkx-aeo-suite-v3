/**
 * AEO Suite V3 - V4 Diagnostic Cockpit State & Rendering Engine
 * Ingests live POST /api/scan payloads via v4PayloadAdapter.
 * Governance: Strict Dual-Pillar enforcement ("AI-Optimized" vs "AI-Ready").
 * Zero mock defaults. Zero dummy data fallbacks. Zero occurrences of "AI-first".
 */

import { mapBackendScanToV4State } from './v4PayloadAdapter.js';

export const STAGE_MATRIX = [
  {
    step: 1,
    shortTitle: "AI Bot Blocks",
    fullTitle: "AI Bot Blocks & Crawler Gateway Permissions",
    tooltip: "AI Bot block checks",
    scanMsg: "Scanning for blocks to AI Bots accessing your website (GPTBot, ClaudeBot, PerplexityBot, Googlebot...)",
    classification: "AI-Optimized",
    desc: "WAF rules, Cloudflare challenge detection, and User-Agent blocking verification across 20+ AI crawlers."
  },
  {
    step: 2,
    shortTitle: "Essential Content",
    fullTitle: "Identifiable Essential Pages & Core Anchors",
    tooltip: "AI Essential content checks",
    scanMsg: "Scanning for Identifiable Essential pages for AI (About, Contact, Pricing, Privacy, Terms)...",
    classification: "AI-Optimized",
    desc: "AI uses essential pages and core anchors to verify your company credentials like company identity(/about), direct contact details(/contact), privacy commitments(/privacy) and terms of service(/terms)."
  },
  {
    step: 3,
    shortTitle: "Content Availability",
    fullTitle: "Content Availability & Semantic Text Density",
    tooltip: "AI Bot Content Availability checks",
    scanMsg: "Scanning for Content Availability for AI-bots accessing your website and evaluating citation extractability...",
    classification: "AI-Optimized",
    desc: "Per-webpage AI Citation Audit, DOM text density, semantic heading structure, and information gain."
  },
  {
    step: 4,
    shortTitle: "Trust & Privacy",
    fullTitle: "Entity Authority, E-E-A-T & Privacy Indicators",
    tooltip: "AI Trust and Privacy checks",
    scanMsg: "Scanning for AI trust and privacy indicators (E-E-A-T footprint, Knowledge Graph grounding)...",
    classification: "AI-Optimized",
    desc: "Knowledge Graph entity grounding, author authority schemas, and organizational trustworthiness."
  },
  {
    step: 5,
    shortTitle: "AI-Ready Files",
    fullTitle: "Machine Manifest Protocol Explorer",
    tooltip: "AI-ready file checks",
    scanMsg: "Scanning for existing machine-readable AI-Ready files on your website (llms.txt, llms-full.txt, OpenAPI)...",
    classification: "AI-Ready",
    desc: "Machine endpoints, llms.txt manifest hierarchy, and machine ingestion schemas with AIOptimize context."
  },
  {
    step: 6,
    shortTitle: "Executive Summary",
    fullTitle: "Executive Summary & Action Triage",
    tooltip: "Executive summary and Action items",
    scanMsg: "Compiling Boardroom Summary & Action Triage across all 5 completed diagnostic modules...",
    classification: "Executive Boardroom",
    desc: "Overall Health Index Dial, Dual-Pillar Readiness Breakdown, and Top 5 Urgent Action Items."
  }
];

export const AUDIT_DATA = {
  domain: "--",
  timestamp: "--",
  scanDuration: "--",
  totalPages: 0,
  healthIndex: 0,
  statusLabel: "UNAUDITED",
  humanWebReadiness: 0,
  machineWebReadiness: 0
};

let currentTargetUrl = '--';
let currentCockpitState = mapBackendScanToV4State(null);
const cockpitErrorLogs = [];
let currentStep = 6;

/**
 * Returns a defensive copy of the internal quality tracking error logs.
 * @returns {Array<object>}
 */
export function getCockpitErrorLogs() {
  return [...cockpitErrorLogs];
}

/**
 * Logs an error entry into the internal quality & tracking registry.
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
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const rawPayload = await response.json();
    currentCockpitState = mapBackendScanToV4State(rawPayload);
    renderCockpit(currentCockpitState);

    if (rescanBtn) rescanBtn.disabled = false;
    return currentCockpitState;
  } catch (err) {
    resetCockpitToNeutral();
    setErrorBanner(`Scan failed: ${err.message}`);
    logCockpitError(cleanUrl, err.message);

    if (rescanBtn) rescanBtn.disabled = false;
  }
}

/**
 * Handles user-confirmed rescan trigger.
 */
export async function handleCockpitRescan() {
  const input = document.querySelector('#cockpit-url-input, #target-url-input');
  const domainDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
  const domUrl = domainDisplay && domainDisplay.textContent.trim() !== '--' ? domainDisplay.textContent.trim() : '';

  const url = (input && input.value.trim() && input.value.trim() !== '--')
    ? input.value.trim()
    : (currentTargetUrl && currentTargetUrl !== '--' ? currentTargetUrl : (domUrl || 'https://example.com'));

  const confirmed = window.confirm(`Authorize live rescan for ${url}?`);
  if (!confirmed) return;

  return await executeCockpitScan(url);
}

/**
 * Main Cockpit Renderer: Updates scorecards and all 6 stages.
 * @param {object} state - State from mapBackendScanToV4State
 */
export function renderCockpit(state) {
  if (!state) return;

  // Header & Health Index
  const healthEl = document.querySelector('.health-score-value, #health-score');
  if (healthEl) {
    healthEl.textContent = state.stage6.overallHealthIndex > 0 ? `${state.stage6.overallHealthIndex}` : '--';
  }

  // Dual-Pillar Scores
  const optEl = document.querySelector('#ai-optimized-score, .score-optimized');
  if (optEl) {
    optEl.textContent = state.stage6.aiOptimizedScore > 0 ? `${state.stage6.aiOptimizedScore}` : '--';
  }

  const readyEl = document.querySelector('#ai-ready-score, .score-ready');
  if (readyEl) {
    readyEl.textContent = state.stage6.aiReadyScore > 0 ? `${state.stage6.aiReadyScore}` : '--';
  }

  renderStage1(state.stage1);
  renderStage2(state.stage2);
  renderStage3(state.stage3);
  renderStage4(state.stage4);
  renderStage5(state.stage5);
  renderStage6(state.stage6);
}

/**
 * Stage 1: Bot Matrix & Crawler Radar
 */
export function renderStage1(stage1Data) {
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
export function renderStage2(stage2Data) {
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
      <p class="summary-line">Discovered: ${stage2Data.discoveredCount} | Missing: ${stage2Data.missingCount}</p>
      <ul class="routes-list">${items}</ul>
    </div>
  `;
}

/**
 * Stage 3: Crawled Pages & Semantic Text Density
 */
export function renderStage3(stage3Data) {
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
      <div class="page-density-card density-${p.densityRating.toLowerCase()}">
        <div class="page-url">${p.url}</div>
        <div class="page-metrics">
          <span>Words: <strong>${p.wordCount}</strong></span>
          <span>Ratio: <strong>${p.textCodeRatioPercent}%</strong></span>
          <span class="density-badge">${p.densityRating}</span>
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
export function renderStage4(stage4Data) {
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
 * Stage 5: Machine Manifests (AI-Ready Gate)
 */
export function renderStage5(stage5Data) {
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
export function renderStage6(stage6Data) {
  const container = document.querySelector('#stage-6, [data-stage="6"]');
  if (!container) return;

  const flags = stage6Data?.triageFlags || [];
  if (stage6Data.overallHealthIndex === 0 && flags.length === 0) {
    container.innerHTML = `<div class="un-audited-notice">Triage & Scoring: UNAUDITED</div>`;
    return;
  }

  const flagItems = flags.map((f) => `<li class="triage-flag-item">${f}</li>`).join('');

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
    </div>
  `;
}

/**
 * Navigation to step
 */
export function navigateToStep(step) {
  currentStep = step;
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
  }
}

/**
 * 3D Remediation Drawer
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
  resetCockpitToNeutral();
}

export function retryEntireAudit() {
  handleCockpitRescan();
}

export function triggerEarlyInspectionScenario() {}
export function triggerSystemFailureScenario() {}
export function toggleResponsiveSimulation() {}
export function hideAntiHijackToast() {
  const toast = document.getElementById('toast-anti-hijack');
  if (toast) toast.classList.add('opacity-0', 'pointer-events-none');
}

export function handleExport(format) {
  console.log(`Exporting ${format}...`);
}

/**
 * Cockpit Shell Initialization
 */
export async function initCockpit() {
  resetCockpitToNeutral();

  const rescanBtn = document.querySelector('#rescan-btn, .rescan-btn');
  if (rescanBtn && !rescanBtn.dataset.bound) {
    rescanBtn.addEventListener('click', () => {
      handleCockpitRescan();
    });
    rescanBtn.dataset.bound = 'true';
  }

  const searchBtn = document.querySelector('#cockpit-search-btn, .domain-search-btn');
  const input = document.querySelector('#cockpit-url-input, #target-url-input');
  if (searchBtn && !searchBtn.dataset.bound) {
    searchBtn.addEventListener('click', () => {
      const val = input ? input.value.trim() : '';
      if (val) executeCockpitScan(val);
    });
    searchBtn.dataset.bound = 'true';
  }

  // Parse URL parameter ?url=...
  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      if (input) input.value = urlParam;
      return await executeCockpitScan(urlParam);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCockpit();
    });
  } else {
    initCockpit();
  }
}
