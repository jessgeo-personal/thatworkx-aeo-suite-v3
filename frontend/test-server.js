/**
 * AEO Suite V3 - Server Scan Pipeline Test Harness Controller
 * Isolated verification for backend/server.js and POST /api/scan
 * Governance: Strict Dual-Pillar rules ("AI-Optimized" vs "AI-Ready"). Zero mock fallbacks.
 */

let activePollInterval = null;

/**
 * Resets all telemetry, queue monitor, and contract checklist states.
 */
export function resetView() {
  if (activePollInterval) {
    clearInterval(activePollInterval);
    activePollInterval = null;
  }

  ['metric-http-status', 'metric-response-status', 'metric-target-url', 'metric-daily-scans', 'metric-headless-runs', 'metric-user-tier'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '--';
  });

  const queueContainer = document.getElementById('queue-monitor-container');
  if (queueContainer) queueContainer.classList.add('hidden');

  const progressBar = document.getElementById('queue-progress-bar');
  if (progressBar) progressBar.style.width = '0%';

  const progressText = document.getElementById('queue-progress-text');
  if (progressText) progressText.textContent = '0 / 0 pages';

  const pagesList = document.getElementById('queue-pages-list');
  if (pagesList) pagesList.innerHTML = '<div class="text-gray-500 italic">Waiting for initial chunk...</div>';

  const checklistItems = [
    'contract-overall-score',
    'contract-pillar-scores',
    'contract-executive-sections',
    'contract-capability-matrix',
    'contract-results-object',
    'contract-single-page'
  ];

  checklistItems.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const pill = el.querySelector('.status-pill');
      if (pill) {
        pill.textContent = id === 'contract-single-page' ? 'N/A' : 'UNCHECKED';
        pill.className = 'text-xs font-bold px-2 py-0.5 rounded text-gray-500 bg-gray-900 status-pill';
      }
    }
  });

  const rawJsonEl = document.getElementById('raw-json-dump');
  if (rawJsonEl) rawJsonEl.textContent = '--';

  hideError();
}

/**
 * Sets button loading state.
 */
export function setLoading(isLoading) {
  const btn = document.getElementById('btn-run-server-scan');
  const spinner = document.getElementById('btn-spinner');
  const label = document.getElementById('btn-label');

  if (btn) btn.disabled = isLoading;
  if (spinner) {
    if (isLoading) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
  }
  if (label) {
    label.textContent = isLoading ? 'Running Scan Pipeline...' : 'Execute Server Scan';
  }
}

/**
 * Displays error banner with status code and message.
 */
export function showError(message, statusCode = null) {
  const banner = document.getElementById('server-error-container');
  const msgEl = document.getElementById('server-error-message');
  const prefix = statusCode ? `[HTTP ${statusCode}] ` : '';
  if (msgEl) msgEl.textContent = `${prefix}${message || 'Server scan pipeline encountered an error.'}`;
  if (banner) banner.classList.remove('hidden');
}

/**
 * Hides the error banner.
 */
export function hideError() {
  const banner = document.getElementById('server-error-container');
  if (banner) banner.classList.add('hidden');
}

/**
 * Updates a specific checklist item pill.
 */
function setChecklistItem(id, isValid, isNA = false) {
  const el = document.getElementById(id);
  if (!el) return;
  const pill = el.querySelector('.status-pill');
  if (!pill) return;

  if (isNA) {
    pill.textContent = 'N/A';
    pill.className = 'text-xs font-bold px-2 py-0.5 rounded text-gray-500 bg-gray-900 status-pill';
    return;
  }

  if (isValid) {
    pill.textContent = 'VALID';
    pill.className = 'text-xs font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 status-pill';
  } else {
    pill.textContent = 'INVALID';
    pill.className = 'text-xs font-bold px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800 status-pill';
  }
}

/**
 * Validates the response payload against the 5 core contract criteria.
 */
export function validateContractChecklist(payload, isSinglePageMode = false) {
  if (!payload || typeof payload !== 'object') {
    setChecklistItem('contract-overall-score', false);
    setChecklistItem('contract-pillar-scores', false);
    setChecklistItem('contract-executive-sections', false);
    setChecklistItem('contract-capability-matrix', false);
    setChecklistItem('contract-results-object', false);
    setChecklistItem('contract-single-page', false, !isSinglePageMode);
    return;
  }

  // 1. overallScore
  const hasOverallScore = typeof payload.overallScore === 'number' && payload.overallScore >= 0 && payload.overallScore <= 100;
  setChecklistItem('contract-overall-score', hasOverallScore);

  // 2. pillarScores
  const p = payload.pillarScores || {};
  const hasPillars = typeof p.P1 === 'number' && typeof p.P2 === 'number' && typeof p.P3 === 'number' && typeof p.P4 === 'number';
  setChecklistItem('contract-pillar-scores', hasPillars);

  // 3. executiveSections
  const exec = payload.executiveSections || {};
  const hasExec = Boolean((exec.section1 || exec[0]) && (exec.section4 || exec[3]));
  setChecklistItem('contract-executive-sections', hasExec);

  // 4. capabilityMatrix
  const hasCapMatrix = Array.isArray(payload.capabilityMatrix) && payload.capabilityMatrix.length === 32;
  setChecklistItem('contract-capability-matrix', hasCapMatrix);

  // 5. results object
  const hasResults = Boolean(payload.results && typeof payload.results === 'object' && Array.isArray(payload.results.pages));
  setChecklistItem('contract-results-object', hasResults);

  // 6. singlePage object
  if (isSinglePageMode || payload.singlePage) {
    const hasSinglePage = Boolean(payload.singlePage && typeof payload.singlePage === 'object' && payload.singlePage.route);
    setChecklistItem('contract-single-page', hasSinglePage, false);
  } else {
    setChecklistItem('contract-single-page', false, true);
  }
}

/**
 * Renders telemetry bar and JSON dump.
 */
export function renderTelemetry(payload, statusCode, targetUrl) {
  const httpStatusEl = document.getElementById('metric-http-status');
  if (httpStatusEl) {
    httpStatusEl.textContent = String(statusCode);
    httpStatusEl.className = statusCode >= 200 && statusCode < 300
      ? 'text-sm font-bold text-emerald-400 mt-1'
      : 'text-sm font-bold text-red-400 mt-1';
  }

  const resStatusEl = document.getElementById('metric-response-status');
  if (resStatusEl) {
    const resStatus = payload?.status || (statusCode === 200 ? 'complete' : (statusCode === 202 ? 'queued' : 'failed'));
    resStatusEl.textContent = String(resStatus);
  }

  const targetUrlEl = document.getElementById('metric-target-url');
  if (targetUrlEl) {
    targetUrlEl.textContent = payload?.targetUrl || payload?.target_url || payload?.results?.url || targetUrl || '--';
  }

  const dailyScansEl = document.getElementById('metric-daily-scans');
  if (dailyScansEl) {
    dailyScansEl.textContent = payload?.stats?.dailyScansPerformed !== undefined ? String(payload.stats.dailyScansPerformed) : '--';
  }

  const headlessRunsEl = document.getElementById('metric-headless-runs');
  if (headlessRunsEl) {
    headlessRunsEl.textContent = payload?.stats?.dailyHeadlessRunsPerformed !== undefined ? String(payload.stats.dailyHeadlessRunsPerformed) : '--';
  }

  const userTierEl = document.getElementById('metric-user-tier');
  if (userTierEl) {
    userTierEl.textContent = payload?.stats?.tier || payload?.tier || '--';
  }

  const rawJsonEl = document.getElementById('raw-json-dump');
  if (rawJsonEl) {
    rawJsonEl.textContent = JSON.stringify(payload, null, 2);
  }
}

/**
 * Polls background queue for headless jobs or remainder deep crawling.
 */
export function pollJobStatus(jobId, onComplete = null) {
  const queueContainer = document.getElementById('queue-monitor-container');
  if (queueContainer) queueContainer.classList.remove('hidden');

  const jobIdEl = document.getElementById('queue-job-id');
  if (jobIdEl) jobIdEl.textContent = jobId;

  const statusText = document.getElementById('queue-status-text');
  const progressBar = document.getElementById('queue-progress-bar');
  const progressText = document.getElementById('queue-progress-text');
  const pagesList = document.getElementById('queue-pages-list');

  let seenRoutes = new Set();

  if (activePollInterval) clearInterval(activePollInterval);

  activePollInterval = setInterval(async () => {
    try {
      const res = await fetch(`/api/scan/status/${jobId}`);
      if (!res.ok) {
        if (statusText) statusText.textContent = `Polling Error: ${res.status}`;
        return;
      }

      const job = await res.json();
      const completed = job.pagesCompleted || 0;
      const total = job.totalQueued || 1;
      const pct = Math.min(100, Math.round((completed / total) * 100));

      if (progressBar) progressBar.style.width = `${pct}%`;
      if (progressText) progressText.textContent = `${completed} / ${total} pages (${pct}%)`;

      if (statusText) {
        statusText.textContent = job.status === 'complete'
          ? 'CRAWL COMPLETED'
          : (job.status === 'failed' ? 'JOB FAILED' : `PROCESSING (${pct}%)`);
      }

      if (Array.isArray(job.results) && pagesList) {
        job.results.forEach((p, i) => {
          const route = p.route || p.url || `Page ${i + 1}`;
          if (!seenRoutes.has(route)) {
            seenRoutes.add(route);
            if (seenRoutes.size === 1) pagesList.innerHTML = '';
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between py-1 border-b border-gray-900 text-xs';
            item.innerHTML = `
              <span class="text-purple-300 font-mono">${route}</span>
              <span class="text-gray-500 font-bold">${p.wordCount ?? 0} words</span>
            `;
            pagesList.appendChild(item);
          }
        });
      }

      if (job.status === 'complete' || job.status === 'failed') {
        clearInterval(activePollInterval);
        activePollInterval = null;
        if (onComplete) onComplete(job);
      }
    } catch (err) {
      if (statusText) statusText.textContent = `Polling exception: ${err.message}`;
    }
  }, 800);
}

/**
 * Executes server scan via POST /api/scan.
 */
export async function executeServerScan(targetUrl, mode = 'standard', singlePagePath = '', tier = 'AIVisualize Free') {
  if (!targetUrl) return;

  resetView();
  setLoading(true);

  const isSingleMode = mode === 'single';
  const isHeadless = mode === 'headless';

  const requestBody = {
    targetUrl,
    email: '',
    headless: isHeadless
  };

  if (isSingleMode && singlePagePath) {
    requestBody.singlePagePath = singlePagePath;
  }

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    const statusCode = response.status;
    const responsePayload = await response.json().catch(() => ({
      status: 'failed',
      error: `Failed to parse response body (HTTP ${statusCode})`
    }));

    renderTelemetry(responsePayload, statusCode, targetUrl);

    if (!response.ok) {
      const errorMsg = responsePayload.error || responsePayload.message || `Server request failed with HTTP ${statusCode}`;
      showError(errorMsg, statusCode);
      validateContractChecklist(responsePayload, isSingleMode);
      return responsePayload;
    }

    // Handle 202 Accepted Queued or processing_remainder deep scans
    if (statusCode === 202 && responsePayload.jobId) {
      pollJobStatus(responsePayload.jobId);
    } else if (responsePayload.status === 'processing_remainder' && responsePayload.jobId) {
      pollJobStatus(responsePayload.jobId);
    }

    validateContractChecklist(responsePayload, isSingleMode);
    return responsePayload;
  } catch (err) {
    showError(err.message || 'Network fetch exception.');
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes listeners and query parameter inspection.
 */
export function initServerHarness() {
  resetView();

  const runBtn = document.getElementById('btn-run-server-scan');
  const urlInput = document.getElementById('target-url-input');
  const modeSelect = document.getElementById('scan-mode-select');
  const singleContainer = document.getElementById('single-page-container');
  const singleInput = document.getElementById('single-page-input');
  const tierSelect = document.getElementById('tier-select');
  const dismissBtn = document.getElementById('btn-dismiss-error');

  if (modeSelect && !modeSelect.dataset.bound) {
    modeSelect.addEventListener('change', () => {
      if (modeSelect.value === 'single') {
        if (singleContainer) singleContainer.classList.remove('hidden');
      } else {
        if (singleContainer) singleContainer.classList.add('hidden');
      }
    });
    modeSelect.dataset.bound = 'true';
  }

  if (runBtn && !runBtn.dataset.bound) {
    runBtn.addEventListener('click', () => {
      const url = urlInput ? urlInput.value.trim() : '';
      const mode = modeSelect ? modeSelect.value : 'standard';
      const singlePath = singleInput ? singleInput.value.trim() : '';
      const tier = tierSelect ? tierSelect.value : 'AIVisualize Free';
      if (url) executeServerScan(url, mode, singlePath, tier);
    });
    runBtn.dataset.bound = 'true';
  }

  if (urlInput && !urlInput.dataset.bound) {
    urlInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const url = urlInput.value.trim();
        const mode = modeSelect ? modeSelect.value : 'standard';
        const singlePath = singleInput ? singleInput.value.trim() : '';
        const tier = tierSelect ? tierSelect.value : 'AIVisualize Free';
        if (url) executeServerScan(url, mode, singlePath, tier);
      }
    });
    urlInput.dataset.bound = 'true';
  }

  if (dismissBtn && !dismissBtn.dataset.bound) {
    dismissBtn.addEventListener('click', hideError);
    dismissBtn.dataset.bound = 'true';
  }

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    const modeParam = params.get('mode') || 'standard';
    if (urlParam) {
      if (urlInput) urlInput.value = urlParam;
      if (modeSelect) modeSelect.value = modeParam;
      if (modeParam === 'single' && singleContainer) singleContainer.classList.remove('hidden');
      executeServerScan(urlParam, modeParam);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initServerHarness();
  });
}
