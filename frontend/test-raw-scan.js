/**
 * AEO Suite V3 - Raw Scan Inspection Harness Controller
 * Phase 1 Diagnostic Tool: Zero mock fallbacks, live data mapping, audit logging.
 */

let currentTargetUrl = '';

/**
 * Resets all stage displays to strictly neutral audit defaults.
 */
export function resetOutputs() {
  const outputIds = [
    'meta-telemetry-output',
    'stage1-crawlers-output',
    'stage2-routes-output',
    'stage3-pages-output',
    'stage4-schema-output',
    'stage5-manifests-output',
    'stage6-scores-output',
    'raw-json-dump'
  ];

  outputIds.forEach((id) => {
    const el = document.getElementById(id);
    if (el) el.textContent = '--';
  });

  const banner = document.getElementById('error-notification-banner');
  if (banner) {
    banner.classList.add('hidden');
    banner.textContent = '';
  }
}

/**
 * Logs an error entry into the internal quality tracking console.
 */
function logInternalError(targetUrl, errorMessage) {
  const errorLogList = document.getElementById('error-log-list');
  if (!errorLogList) return;

  const li = document.createElement('li');
  li.className = 'error-log-entry';
  li.textContent = `[${new Date().toISOString()}] Target: ${targetUrl} | Error: ${errorMessage}`;
  errorLogList.appendChild(li);
}

/**
 * Dispatches scan request to POST /api/scan and renders labeled plain text.
 */
export async function executeScan(targetUrl) {
  if (!targetUrl) return;
  currentTargetUrl = targetUrl;
  resetOutputs();

  const rescanBtn = document.getElementById('rescan-btn');
  if (rescanBtn) rescanBtn.disabled = true;

  try {
    const response = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, email: '' })
    });

    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    renderScanData(data, targetUrl);

    if (rescanBtn) rescanBtn.disabled = false;
    return data;
  } catch (err) {
    resetOutputs();

    const banner = document.getElementById('error-notification-banner');
    if (banner) {
      banner.classList.remove('hidden');
      banner.textContent = `Scan failed: ${err.message}`;
    }

    logInternalError(targetUrl, err.message);

    if (rescanBtn) rescanBtn.disabled = false;
  }
}

/**
 * Renders raw backend schema fields with explicit source path labels.
 */
function renderScanData(data, targetUrl) {
  // Telemetry & Meta
  const metaEl = document.getElementById('meta-telemetry-output');
  if (metaEl) {
    metaEl.textContent = `[source: meta] Status: ${data.status || 'unknown'} | Target: ${data.targetUrl || targetUrl} | Timestamp: ${data.timestamp || new Date().toISOString()}`;
  }

  // Stage 1: Crawlers
  const s1El = document.getElementById('stage1-crawlers-output');
  if (s1El) {
    const crawlers = data.capabilities?.crawlers || {};
    const crawlerLines = Object.entries(crawlers).map(([bot, info]) => {
      const state = info.allowed ? `ALLOWED (${info.status})` : `BLOCKED (${info.status})`;
      return `${bot}: ${state}`;
    });
    s1El.textContent = `[source: results.capabilities.crawlers]\n` + crawlerLines.join('\n');
  }

  // Stage 2: Missing Essential Pages
  const s2El = document.getElementById('stage2-routes-output');
  if (s2El) {
    const missing = data.missingEssentialPages || [];
    s2El.textContent = `[source: results.missingEssentialPages]\nMissing: ${missing.join(', ')}`;
  }

  // Stage 3: Pages & Word Counts
  const s3El = document.getElementById('stage3-pages-output');
  if (s3El) {
    const pages = data.pages || [];
    const pageLines = pages.map((p) => {
      const ratio = Math.round((p.textCodeRatio || 0) * 100);
      return `${p.url} - Words: ${p.wordCount} | Ratio: ${ratio}%`;
    });
    s3El.textContent = `[source: results.pages]\n` + pageLines.join('\n');
  }

  // Stage 4: Schema.org & Author Bio
  const s4El = document.getElementById('stage4-schema-output');
  if (s4El) {
    const pages = data.pages || [];
    const detectedTypes = [...new Set(pages.flatMap((p) => p.schema?.detectedTypes || []))];
    const hasAuthorBio = pages.some((p) => p.schema?.hasAuthorBio === true);
    s4El.textContent = `[source: results.pages[n].schema]\nDetected Types: ${detectedTypes.join(', ')}\nAuthor Bio Entity Detected: ${hasAuthorBio}`;
  }

  // Stage 5: AI-Ready Machine Manifests
  const s5El = document.getElementById('stage5-manifests-output');
  if (s5El) {
    const manifests = data.capabilities?.manifests || {};
    const manifestLines = [
      `[source: results.capabilities.manifests] AI-Ready Manifests:`,
      `/robots.txt: ${manifests.robotsTxt?.exists ? `${manifests.robotsTxt.status} OK` : `${manifests.robotsTxt?.status || 404} NOT FOUND`}`,
      `/llms.txt: ${manifests.llmsTxt?.exists ? `${manifests.llmsTxt.status} OK` : `${manifests.llmsTxt?.status || 404} NOT FOUND`}`,
      `/ai-context.md: ${manifests.aiContextMd?.exists ? `${manifests.aiContextMd.status} OK` : `${manifests.aiContextMd?.status || 404} NOT FOUND`}`
    ];
    s5El.textContent = manifestLines.join('\n');
  }

  // Stage 6: Scoring & Triage (Dual-Pillar)
  const s6El = document.getElementById('stage6-scores-output');
  if (s6El) {
    const scores = data.capabilities?.scores || {};
    const flags = scores.triageFlags || [];
    const scoreLines = [
      `[source: results.capabilities.scores]`,
      `Health Index: ${scores.overallHealthIndex || 0}/100`,
      `AI-Optimized (Crawlability): ${scores.aiOptimizedScore || 0}/100`,
      `AI-Ready (Manifests): ${scores.aiReadyScore || 0}/100`,
      `Triage Flags: ${flags.join(', ')}`
    ];
    s6El.textContent = scoreLines.join('\n');
  }

  // Complete JSON payload dump
  const dumpEl = document.getElementById('raw-json-dump');
  if (dumpEl) {
    dumpEl.textContent = JSON.stringify(data, null, 2);
  }
}

/**
 * Handles user-confirmed rescan trigger.
 */
export async function handleRescanClick() {
  const input = document.getElementById('target-url-input');
  const url = input ? input.value.trim() : currentTargetUrl;
  if (!url) return;

  const confirmed = window.confirm(`Authorize live rescan for ${url}?`);
  if (!confirmed) return;

  return executeScan(url);
}

/**
 * Harness entry point: initializes listeners and checks for ?url= parameter.
 */
export async function initRawInspector() {
  resetOutputs();

  const fetchBtn = document.getElementById('fetch-scan-btn');
  const rescanBtn = document.getElementById('rescan-btn');
  const input = document.getElementById('target-url-input');

  if (fetchBtn && !fetchBtn.dataset.bound) {
    fetchBtn.addEventListener('click', () => {
      const url = input ? input.value.trim() : '';
      if (url) executeScan(url);
    });
    fetchBtn.dataset.bound = 'true';
  }

  if (rescanBtn && !rescanBtn.dataset.bound) {
    rescanBtn.addEventListener('click', () => {
      handleRescanClick();
    });
    rescanBtn.dataset.bound = 'true';
  }

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      if (input) input.value = urlParam;
      return await executeScan(urlParam);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initRawInspector();
  });
}
