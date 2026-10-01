/**
 * AEO Suite V3 - V4 Payload Adapter Test Harness Controller
 * Isolated verification for frontend/v4PayloadAdapter.js
 * Governance: Strict Dual-Pillar rules ("AI-Optimized" vs "AI-Ready"). Zero banned terms.
 */

import { mapBackendScanToV4State } from './v4PayloadAdapter.js';
export { mapBackendScanToV4State };

/**
 * Resets all UI elements to initial un-audited state.
 */
export function resetViewState() {
  const defaultState = mapBackendScanToV4State(null);
  renderAll(null, defaultState);
}

/**
 * Sets button loading state for live scan execution.
 */
export function setLoading(isLoading) {
  const btn = document.getElementById('btn-run-adapter');
  const spinner = document.getElementById('btn-spinner');
  const label = document.getElementById('btn-label');

  if (btn) btn.disabled = isLoading;
  if (spinner) {
    if (isLoading) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
  }
  if (label) {
    label.textContent = isLoading ? 'Running Scan & Adapting...' : 'Run Scan & Adapt';
  }
}

/**
 * Helper to get stage status badge class.
 */
function getStageBadgeClass(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'PASS' || s === 'OPTIMIZED' || s === 'ACTIVE') {
    return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  }
  if (s === 'WARN' || s === 'NEEDS IMPROVEMENT' || s === 'WARNING') {
    return 'bg-amber-950 text-amber-400 border border-amber-800';
  }
  return 'bg-red-950 text-red-400 border border-red-800';
}

/**
 * Updates an assertion check pill.
 */
function setAssertionPill(id, isValid, verifiedText = 'VERIFIED', failedText = 'FAILED') {
  const el = document.getElementById(id);
  if (!el) return;
  const pill = el.querySelector('.assertion-pill');
  if (!pill) return;

  if (isValid) {
    pill.textContent = verifiedText;
    pill.className = 'assertion-pill font-bold text-emerald-400';
  } else {
    pill.textContent = failedText;
    pill.className = 'assertion-pill font-bold text-red-400';
  }
}

/**
 * Renders Section 1.5: Canonical 6-Stage Adapter Mapping Verification & Assertions
 */
export function renderStages(state, inputPayload) {
  const stages = state?.stages || {};
  const stageKeys = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6'];
  const stageTitles = {
    stage1: 'Stage 1: Bot Blocks & Gateway',
    stage2: 'Stage 2: Essential Content Anchors',
    stage3: 'Stage 3: Content Availability & Density',
    stage4: 'Stage 4: Trust & E-E-A-T',
    stage5: 'Stage 5: Machine Manifest Protocols',
    stage6: 'Stage 6: Executive Boardroom & Action Triage'
  };

  const container = document.getElementById('stages-cards-container');
  if (container) {
    const hasStages = stageKeys.some(k => stages[k] && stages[k].status !== 'UNAUDITED');
    if (!hasStages && !inputPayload) {
      container.innerHTML = '<div class="text-xs text-gray-500 italic col-span-full py-4 text-center bg-[#121212] rounded-xl border border-gray-800">No canonical stages mapped yet.</div>';
    } else {
      container.innerHTML = stageKeys.map(k => {
        const stage = stages[k] || {};
        const title = stage.title ? `${k.toUpperCase().replace('STAGE', 'Stage ')}: ${stage.title}` : (stageTitles[k] || k);
        const score = stage.score || '0%';
        const status = stage.status || 'UNAUDITED';
        const summaryText = stage.summaryText || '--';
        const classification = stage.classification || (k === 'stage5' ? 'AI-Ready' : (k === 'stage6' ? 'Executive Boardroom' : 'AI-Optimized'));
        const badgeClass = getStageBadgeClass(status);

        return `
          <div class="stage-card bg-[#121212] border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-emerald-700 transition" data-stage-key="${k}">
            <div>
              <div class="flex items-start justify-between gap-2 border-b border-gray-800 pb-2.5 mb-2.5">
                <div>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-gray-800 text-gray-400">${classification}</span>
                  <h4 class="text-xs font-bold text-white mt-1">${title}</h4>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-base font-extrabold text-emerald-400 font-mono">${score}</span>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded uppercase ${badgeClass}">${status}</span>
                </div>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed font-sans">${summaryText}</p>
            </div>
            ${stage.missingRoutes && stage.missingRoutes.length > 0 ? `
              <div class="mt-2.5 pt-2 border-t border-gray-900 text-[10px] text-amber-300 font-mono truncate">
                Missing: ${stage.missingRoutes.join(', ')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  // Render Assertions
  if (!inputPayload) {
    setAssertionPill('assertion-root-stages', false, 'UNCHECKED', 'UNCHECKED');
    setAssertionPill('assertion-stage3-passthrough', false, 'UNCHECKED', 'UNCHECKED');
    setAssertionPill('assertion-pages-coexistence', false, 'UNCHECKED', 'UNCHECKED');
  } else {
    // 1. Root state.stages check
    const hasRootStages = Boolean(state && state.stages && typeof state.stages === 'object' && stageKeys.every(k => state.stages[k]));
    setAssertionPill('assertion-root-stages', hasRootStages, 'VERIFIED', 'MISSING');

    // 2. Stage 3 Dynamic Score Pass-Through check
    const stage3Score = state?.stage3?.score;
    const hasValidScore = typeof stage3Score === 'string' && stage3Score.endsWith('%') && stage3Score !== '85%';
    const expectedScore = inputPayload?.stages?.stage3?.score || inputPayload?.results?.stages?.stage3?.score;
    const isStage3Passed = expectedScore ? (state?.stage3?.score === expectedScore) : Boolean(hasValidScore);
    setAssertionPill('assertion-stage3-passthrough', isStage3Passed, 'VERIFIED', 'MISSING');

    // 3. Per-page rich objects coexistence check
    const pages = state?.stage3?.pages || [];
    const hasPages = Array.isArray(pages) && (pages.length === 0 || pages.every(p => typeof p.ratio === 'number' && typeof p.wordCount === 'number' && p.headingCounts));
    setAssertionPill('assertion-pages-coexistence', hasPages, 'VERIFIED', 'FAILED');
  }

  // Dump JSON
  const stagesDumpEl = document.getElementById('stages-json-dump');
  if (stagesDumpEl) {
    stagesDumpEl.textContent = state?.stages ? JSON.stringify(state.stages, null, 2) : '--';
  }
}

/**
 * Renders Section 1: Meta & Failure State
 */
export function renderMeta(state) {
  const meta = state?.meta || { targetUrl: '--', status: 'UNAUDITED', timestamp: null };

  const targetUrlEl = document.getElementById('meta-target-url');
  if (targetUrlEl) targetUrlEl.textContent = meta.targetUrl || '--';

  const statusBadge = document.getElementById('meta-status-badge');
  if (statusBadge) {
    statusBadge.textContent = meta.status || 'UNAUDITED';
    if (meta.status === 'completed' || meta.status === 'complete') {
      statusBadge.className = 'inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-700';
    } else if (meta.status === 'failed' || meta.error) {
      statusBadge.className = 'inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold bg-red-950 text-red-300 border border-red-700';
    } else {
      statusBadge.className = 'inline-block mt-0.5 px-2.5 py-0.5 rounded text-xs font-bold bg-gray-800 text-gray-400 border border-gray-700';
    }
  }

  const timestampEl = document.getElementById('meta-timestamp');
  if (timestampEl) {
    timestampEl.textContent = meta.timestamp ? new Date(meta.timestamp).toLocaleString() : '--';
  }

  const failureBanner = document.getElementById('crawl-failure-banner');
  const failureMsgEl = document.getElementById('crawl-failure-message');
  if (failureBanner) {
    if (meta.error) {
      failureBanner.classList.remove('hidden');
      if (failureMsgEl) failureMsgEl.textContent = meta.error;
    } else {
      failureBanner.classList.add('hidden');
    }
  }
}

/**
 * Renders Section 2: Stage 1 Adapter Matrix (20 Crawlers)
 */
export function renderStage1(state) {
  const crawlers = state?.stage1?.crawlers || [];
  const countEl = document.getElementById('stage1-crawlers-count');
  if (countEl) countEl.textContent = `${crawlers.length} Crawlers`;

  const container = document.getElementById('stage1-crawlers-container');
  if (!container) return;

  if (crawlers.length === 0) {
    container.innerHTML = '<div class="text-xs text-gray-500 italic col-span-full py-4 text-center bg-[#181818] rounded-xl border border-gray-800">No crawler telemetry adapted yet.</div>';
    return;
  }

  container.innerHTML = crawlers
    .map((bot) => {
      const isAllowed = Boolean(bot.allowed);
      const borderCol = isAllowed ? 'border-emerald-800/60 bg-emerald-950/20' : 'border-red-900/60 bg-red-950/20';
      const pillCol = isAllowed ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-800';
      const dotCol = isAllowed ? 'bg-emerald-400' : 'bg-red-500';

      return `
        <div class="crawler-card border ${borderCol} p-3.5 rounded-xl flex flex-col justify-between gap-2.5 transition">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="text-sm font-bold text-white flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full ${dotCol}"></span>
                ${bot.name || bot.key}
              </div>
              <div class="text-[11px] font-mono text-gray-400">${bot.key}</div>
            </div>
            <span class="crawler-status-pill text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${pillCol}">
              ${bot.statusText || (isAllowed ? `ALLOWED (${bot.status})` : `BLOCKED (${bot.status})`)}
            </span>
          </div>
          <div class="text-[10px] text-gray-400 flex items-center justify-between border-t border-gray-800/80 pt-2">
            <span>HTTP Status Code</span>
            <span class="font-mono font-bold ${isAllowed ? 'text-emerald-400' : 'text-red-400'}">${bot.status}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Renders Section 3: Stage 2 Essential Routes Matrix (5 Routes)
 */
export function renderStage2(state) {
  const routes = state?.stage2?.routes || [];
  const discoveredCount = state?.stage2?.discoveredCount ?? 0;
  const missingCount = state?.stage2?.missingCount ?? 0;

  const discoveredEl = document.getElementById('stage2-discovered-count');
  if (discoveredEl) discoveredEl.textContent = String(discoveredCount);

  const missingEl = document.getElementById('stage2-missing-count');
  if (missingEl) missingEl.textContent = String(missingCount);

  const container = document.getElementById('stage2-routes-container');
  if (!container) return;

  if (routes.length === 0) {
    container.innerHTML = '<div class="text-xs text-gray-500 italic col-span-full py-4 text-center bg-[#181818] rounded-xl border border-gray-800">No essential routes evaluated yet.</div>';
    return;
  }

  container.innerHTML = routes
    .map((r) => {
      const isFound = r.status === 'discovered';
      const borderCol = isFound ? 'border-emerald-800/60 bg-emerald-950/20' : 'border-red-900/60 bg-red-950/20';
      const pillCol = isFound ? 'bg-emerald-950 text-emerald-300 border-emerald-700' : 'bg-red-950 text-red-300 border-red-800';

      return `
        <div class="route-card border ${borderCol} p-3 rounded-xl flex flex-col justify-between gap-2 transition">
          <div class="text-xs font-mono font-bold text-gray-100">${r.route}</div>
          <div class="flex items-center justify-between pt-1">
            <span class="route-status-pill text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${pillCol}">
              ${r.status}
            </span>
            <span class="text-xs">${isFound ? '🟢' : '🔴'}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Renders Section 4: Stage 3 Crawled Pages Array
 */
export function renderStage3(state) {
  const pages = state?.stage3?.pages || [];
  const countEl = document.getElementById('stage3-pages-count');
  if (countEl) countEl.textContent = `${pages.length} Pages`;

  const container = document.getElementById('stage3-pages-container');
  if (!container) return;

  if (pages.length === 0) {
    container.innerHTML = '<div class="text-xs text-gray-500 italic col-span-full py-4 text-center bg-[#181818] rounded-xl border border-gray-800">No crawled pages adapted yet.</div>';
    return;
  }

  container.innerHTML = pages
    .map((page) => {
      let densityPill = 'bg-gray-800 text-gray-400 border-gray-700';
      if (page.densityRating === 'Optimal') {
        densityPill = 'bg-emerald-950 text-emerald-300 border-emerald-700';
      } else if (page.densityRating === 'Moderate') {
        densityPill = 'bg-amber-950 text-amber-300 border-amber-700';
      } else if (page.densityRating === 'Thin') {
        densityPill = 'bg-red-950 text-red-300 border-red-800';
      }

      return `
        <div class="page-card bg-[#181818] border border-gray-800 p-4 rounded-xl space-y-3">
          <div class="flex items-start justify-between gap-2">
            <div class="text-xs font-mono font-bold text-cyan-300 truncate flex-1" title="${page.url}">
              ${page.url}
            </div>
            <span class="density-badge text-[10px] font-bold px-2 py-0.5 rounded border ${densityPill}">
              ${page.densityRating}
            </span>
          </div>
          <div class="grid grid-cols-2 gap-2 text-xs border-t border-gray-800 pt-2.5">
            <div>
              <div class="text-[10px] text-gray-400 uppercase font-semibold">Word Count</div>
              <div class="page-word-count font-bold text-white mt-0.5">${page.wordCount.toLocaleString()}</div>
            </div>
            <div>
              <div class="text-[10px] text-gray-400 uppercase font-semibold">Text/HTML Ratio</div>
              <div class="page-ratio font-bold text-white mt-0.5">${page.textCodeRatioPercent}%</div>
            </div>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Renders Section 5: Stage 4 Entity Authority Card
 */
export function renderStage4(state) {
  const stage4 = state?.stage4 || { detectedTypes: [], hasAuthorBio: false, totalGraphEntities: 0 };

  const totalEntitiesEl = document.getElementById('stage4-total-entities');
  if (totalEntitiesEl) totalEntitiesEl.textContent = String(stage4.totalGraphEntities || 0);

  const bioBadge = document.getElementById('stage4-author-bio-badge');
  if (bioBadge) {
    if (stage4.hasAuthorBio) {
      bioBadge.textContent = 'Author Bio: Verified';
      bioBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700';
    } else {
      bioBadge.textContent = 'Author Bio: Missing';
      bioBadge.className = 'text-xs font-bold px-2.5 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700';
    }
  }

  const typesContainer = document.getElementById('stage4-detected-types');
  if (typesContainer) {
    const types = stage4.detectedTypes || [];
    if (types.length === 0) {
      typesContainer.innerHTML = '<span class="text-xs text-gray-500 italic">No Schema entities detected.</span>';
    } else {
      typesContainer.innerHTML = types
        .map(
          (t) =>
            `<span class="schema-type-pill text-xs font-mono font-semibold px-2.5 py-1 rounded bg-purple-950/60 text-purple-300 border border-purple-800">${t}</span>`
        )
        .join('');
    }
  }
}

/**
 * Renders Section 6: Stage 5 Machine Manifests Matrix
 */
export function renderStage5(state) {
  const stage5 = state?.stage5 || { governanceGate: 'AI-Ready', manifests: [] };

  const govBadge = document.getElementById('stage5-governance-badge');
  if (govBadge) {
    govBadge.textContent = `Governance: ${stage5.governanceGate || 'AI-Ready'}`;
  }

  const grid = document.getElementById('stage5-manifests-grid');
  if (!grid) return;

  const manifests = stage5.manifests || [];
  if (manifests.length === 0) {
    grid.innerHTML = '<div class="text-xs text-gray-500 italic col-span-full py-4 text-center bg-[#181818] rounded-xl border border-gray-800">No machine manifests evaluated yet.</div>';
    return;
  }

  grid.innerHTML = manifests
    .map((m) => {
      const isFound = Boolean(m.exists);
      const borderCol = isFound ? 'border-teal-800/60 bg-teal-950/20' : 'border-red-900/60 bg-red-950/20';
      const pillCol = isFound ? 'bg-teal-950 text-teal-300 border-teal-700' : 'bg-red-950 text-red-300 border-red-800';

      return `
        <div class="manifest-card border ${borderCol} p-4 rounded-xl flex flex-col justify-between gap-3 transition">
          <div>
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-white uppercase tracking-wider">${m.label || m.path}</span>
              <span class="manifest-status-pill text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${pillCol}">
                ${isFound ? `Found (${m.status})` : `Missing (${m.status})`}
              </span>
            </div>
            <div class="text-xs font-mono text-cyan-400 mt-1">${m.path}</div>
          </div>
          <div class="text-[11px] text-gray-400 flex items-center justify-between border-t border-gray-800/80 pt-2">
            <span>HTTP Status</span>
            <span class="font-mono font-bold ${isFound ? 'text-teal-300' : 'text-red-400'}">${m.status}</span>
          </div>
        </div>
      `;
    })
    .join('');
}

/**
 * Renders Section 7: Stage 6 Triage & Dual-Pillar Scores
 */
export function renderStage6(state) {
  const stage6 = state?.stage6 || { overallHealthIndex: 0, aiOptimizedScore: 0, aiReadyScore: 0, triageFlags: [] };

  const overallEl = document.getElementById('stage6-overall-score');
  if (overallEl) overallEl.textContent = String(stage6.overallHealthIndex || 0);

  const optimizedEl = document.getElementById('stage6-optimized-score');
  if (optimizedEl) optimizedEl.textContent = String(stage6.aiOptimizedScore || 0);

  const readyEl = document.getElementById('stage6-ready-score');
  if (readyEl) readyEl.textContent = String(stage6.aiReadyScore || 0);

  const flagsContainer = document.getElementById('stage6-triage-flags');
  if (flagsContainer) {
    const flags = stage6.triageFlags || [];
    if (flags.length === 0) {
      flagsContainer.innerHTML = '<li class="text-gray-500 italic">No triage flags recorded.</li>';
    } else {
      flagsContainer.innerHTML = flags
        .map(
          (f) =>
            `<li class="triage-flag-item bg-[#121212] border border-gray-800 text-amber-300 px-3 py-2 rounded-lg flex items-center gap-2">
              <span class="text-amber-400">⚡</span>
              <span>${typeof f === 'object' ? JSON.stringify(f) : f}</span>
            </li>`
        )
        .join('');
    }
  }
}

/**
 * Renders Section 8: Split Raw JSON Inspector
 */
export function renderJsonInspector(inputPayload, state) {
  const rawInputEl = document.getElementById('raw-input-json-view');
  if (rawInputEl) {
    rawInputEl.textContent = inputPayload ? JSON.stringify(inputPayload, null, 2) : '--';
  }

  const adaptedOutputEl = document.getElementById('adapted-output-json-view');
  if (adaptedOutputEl) {
    adaptedOutputEl.textContent = (state && inputPayload) ? JSON.stringify(state, null, 2) : '--';
  }
}

/**
 * Master render function that dispatches state to all UI sections.
 */
export function renderAll(inputPayload, state) {
  renderMeta(state);
  renderStages(state, inputPayload);
  renderStage1(state);
  renderStage2(state);
  renderStage3(state);
  renderStage4(state);
  renderStage5(state);
  renderStage6(state);
  renderJsonInspector(inputPayload, state);
}

/**
 * Executes live scan API request and maps result into V4 state.
 */
export async function executeLiveScan() {
  const inputEl = document.getElementById('target-url-input');
  const rawTarget = inputEl ? inputEl.value.trim() : '';

  if (!rawTarget) {
    alert('Please enter a valid target URL.');
    return;
  }

  setLoading(true);

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: rawTarget })
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = {
        status: 'failed',
        error: `Server responded with HTTP ${response.status} (Non-JSON payload)`
      };
    }

    if (!response.ok || payload.status === 'failed' || payload.error) {
      if (!payload.status) payload.status = 'failed';
      if (!payload.targetUrl) payload.targetUrl = rawTarget;
    }

    const state = mapBackendScanToV4State(payload);
    renderAll(payload, state);
  } catch (networkErr) {
    const failedPayload = {
      status: 'failed',
      targetUrl: rawTarget,
      error: `Network / Gateway Error: ${networkErr.message}`
    };
    const state = mapBackendScanToV4State(failedPayload);
    renderAll(failedPayload, state);
  } finally {
    setLoading(false);
  }
}

/**
 * Ingests raw JSON pasted into the textarea and adapts it.
 */
export function executeJsonIngestion() {
  const textarea = document.getElementById('raw-json-input');
  const rawText = textarea ? textarea.value.trim() : '';

  if (!rawText) {
    alert('Please enter or paste JSON payload to ingest.');
    return;
  }

  try {
    const parsed = JSON.parse(rawText);
    const state = mapBackendScanToV4State(parsed);
    renderAll(parsed, state);
  } catch (jsonErr) {
    alert(`Invalid JSON format: ${jsonErr.message}`);
  }
}

/**
 * Switches mode UI between Live Scan and JSON Injection.
 */
export function setMode(mode) {
  const scanBtn = document.getElementById('mode-toggle-scan');
  const jsonBtn = document.getElementById('mode-toggle-json');
  const scanPanel = document.getElementById('panel-live-scan');
  const jsonPanel = document.getElementById('panel-json-injection');

  if (mode === 'scan') {
    if (scanBtn) {
      scanBtn.className = 'px-4 py-2 text-xs font-bold rounded-md transition bg-emerald-600 text-white shadow-sm';
    }
    if (jsonBtn) {
      jsonBtn.className = 'px-4 py-2 text-xs font-bold rounded-md transition text-gray-400 hover:text-white';
    }
    if (scanPanel) scanPanel.classList.remove('hidden');
    if (jsonPanel) jsonPanel.classList.add('hidden');
  } else {
    if (jsonBtn) {
      jsonBtn.className = 'px-4 py-2 text-xs font-bold rounded-md transition bg-cyan-600 text-white shadow-sm';
    }
    if (scanBtn) {
      scanBtn.className = 'px-4 py-2 text-xs font-bold rounded-md transition text-gray-400 hover:text-white';
    }
    if (scanPanel) scanPanel.classList.add('hidden');
    if (jsonPanel) jsonPanel.classList.remove('hidden');
  }
}

/**
 * Initialize event listeners on DOM load.
 */
export function initListeners() {
  const btnRun = document.getElementById('btn-run-adapter');
  if (btnRun) btnRun.addEventListener('click', executeLiveScan);

  const btnIngest = document.getElementById('btn-ingest-json');
  if (btnIngest) btnIngest.addEventListener('click', executeJsonIngestion);

  const toggleScan = document.getElementById('mode-toggle-scan');
  if (toggleScan) toggleScan.addEventListener('click', () => setMode('scan'));

  const toggleJson = document.getElementById('mode-toggle-json');
  if (toggleJson) toggleJson.addEventListener('click', () => setMode('json'));
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initListeners();
      resetViewState();
    });
  } else {
    initListeners();
    resetViewState();
  }
}
