/**
 * AEO Suite V3 - Crawler Service Test Harness Controller
 * Isolated verification for backend/services/crawlerService.js
 * Governance: Strict Dual-Pillar rules ("AI-Optimized" vs "AI-Ready"). Zero mock fallbacks.
 */

export const AI_BOT_DEFINITIONS = [
  { key: 'gptBot', name: 'GPTBot', pattern: 'User-agent: GPTBot Disallow: /' },
  { key: 'chatGptUser', name: 'ChatGPT-User', pattern: 'User-agent: ChatGPT-User Disallow: /' },
  { key: 'oaiSearchBot', name: 'OAI-SearchBot', pattern: 'User-agent: OAI-SearchBot Disallow: /' },
  { key: 'claudeBot', name: 'ClaudeBot', pattern: 'User-agent: ClaudeBot Disallow: /' },
  { key: 'claudeWeb', name: 'Claude-Web', pattern: 'User-agent: Claude-Web Disallow: /' },
  { key: 'claudeSearchBot', name: 'Claude-SearchBot', pattern: 'User-agent: Claude-SearchBot Disallow: /' },
  { key: 'googleExtended', name: 'Google-Extended', pattern: 'User-agent: Google-Extended Disallow: /' },
  { key: 'googlebot', name: 'Googlebot', pattern: 'User-agent: Googlebot Disallow: /' },
  { key: 'bingbot', name: 'Bingbot', pattern: 'User-agent: Bingbot Disallow: /' },
  { key: 'perplexityBot', name: 'PerplexityBot', pattern: 'User-agent: PerplexityBot Disallow: /' },
  { key: 'applebotExtended', name: 'Applebot-Extended', pattern: 'User-agent: Applebot-Extended Disallow: /' },
  { key: 'metaExternalAgent', name: 'Meta-ExternalAgent', pattern: 'User-agent: Meta-ExternalAgent Disallow: /' },
  { key: 'metaWebIndexer', name: 'Meta-WebIndexer', pattern: 'User-agent: Meta-WebIndexer Disallow: /' },
  { key: 'amazonbot', name: 'Amazonbot', pattern: 'User-agent: Amazonbot Disallow: /' },
  { key: 'bytespider', name: 'Bytespider', pattern: 'User-agent: Bytespider Disallow: /' },
  { key: 'ccBot', name: 'CCBot', pattern: 'User-agent: CCBot Disallow: /' },
  { key: 'cohereAi', name: 'cohere-ai', pattern: 'User-agent: cohere-ai Disallow: /' },
  { key: 'mistralBot', name: 'MistralBot', pattern: 'User-agent: MistralBot Disallow: /' },
  { key: 'qwenBot', name: 'QwenBot', pattern: 'User-agent: QwenBot Disallow: /' },
  { key: 'baiduAnsur', name: 'Baidu-Ansur', pattern: 'User-agent: Baidu-Ansur Disallow: /' }
];

export const MANIFEST_DEFINITIONS = [
  { path: '/robots.txt', label: 'Robots.txt Directives', key: 'robotsTxtExists', contentKey: 'robotsTxtContent', previewKey: 'robotsTxt' },
  { path: '/sitemap.xml', label: 'XML Sitemap Feed', key: 'sitemapExists', contentKey: 'sitemapContent', previewKey: 'sitemap' },
  { path: '/llms.txt', label: 'LLMs Manifest (Level 1)', key: 'llmsTxtExists', contentKey: 'llmsTxtContent', previewKey: 'llmsTxt' },
  { path: '/ai-context.md', label: 'AI Context Graph (Level 2)', key: 'aiContextExists', contentKey: 'aiContextContent', previewKey: 'aiContext' },
  { path: '/about.md', label: 'Brand & Corporate Context', key: 'aboutTxtExists', contentKey: 'aboutTxtContent', previewKey: 'aboutMd' },
  { path: '/docs.md', label: 'Technical Documentation Map', key: 'docsTxtExists', contentKey: 'docsTxtContent', previewKey: 'docsMd' },
  { path: '/content.md', label: 'Deep Knowledge Content Feed', key: 'contentTxtExists', contentKey: 'contentTxtContent', previewKey: 'contentMd' }
];

/**
 * Resets all canvas sections to clean initial placeholders.
 */
export function resetView() {
  const targetEl = document.getElementById('metric-target-url');
  if (targetEl) targetEl.textContent = '--';

  const statusEl = document.getElementById('metric-status-badge');
  if (statusEl) {
    statusEl.textContent = '--';
    statusEl.className = 'text-sm font-semibold text-gray-300 mt-1';
  }

  const latencyEl = document.getElementById('metric-latency');
  if (latencyEl) latencyEl.textContent = '--';

  const totalUrlsEl = document.getElementById('metric-total-urls');
  if (totalUrlsEl) totalUrlsEl.textContent = '--';

  const depthEl = document.getElementById('metric-depth-crawled');
  if (depthEl) depthEl.textContent = '--';

  const wafEl = document.getElementById('metric-waf-status');
  if (wafEl) {
    wafEl.textContent = '--';
    wafEl.className = 'text-sm font-semibold text-gray-300 mt-1';
  }

  const manifestContainer = document.getElementById('manifest-probes-container');
  if (manifestContainer) {
    manifestContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic">No probe executed yet. Enter URL above and run crawler.</div>';
  }

  const botsContainer = document.getElementById('bots-matrix-container');
  if (botsContainer) {
    botsContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No bot permissions evaluated yet.</div>';
  }

  const pagesContainer = document.getElementById('pages-list-container');
  if (pagesContainer) {
    pagesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic">No pages crawled yet.</div>';
  }

  const routesContainer = document.getElementById('discovered-routes-container');
  if (routesContainer) {
    routesContainer.innerHTML = '<div class="text-gray-500 italic">No routes discovered yet.</div>';
  }

  const rawJsonEl = document.getElementById('raw-json-dump');
  if (rawJsonEl) rawJsonEl.textContent = '--';

  hideError();
}

/**
 * Sets button loading state.
 */
export function setLoading(isLoading) {
  const btn = document.getElementById('btn-run-crawler');
  const spinner = document.getElementById('btn-spinner');
  const label = document.getElementById('btn-label');

  if (btn) btn.disabled = isLoading;
  if (spinner) {
    if (isLoading) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
  }
  if (label) {
    label.textContent = isLoading ? 'Probing Target Domain...' : 'Run Raw Crawler Probe';
  }
}

/**
 * Shows the top error banner with message.
 */
export function showError(message) {
  const banner = document.getElementById('crawler-error-banner');
  const msgEl = document.getElementById('crawler-error-message');
  if (msgEl) msgEl.textContent = message || 'An error occurred during crawler probe.';
  if (banner) banner.classList.remove('hidden');
}

/**
 * Hides the top error banner.
 */
export function hideError() {
  const banner = document.getElementById('crawler-error-banner');
  if (banner) banner.classList.add('hidden');
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders raw backend crawler output into discrete DOM components.
 */
export function renderCrawlerData(responsePayload, targetUrlInput = '') {
  const data = responsePayload?.data || responsePayload?.results || responsePayload || {};
  const statusObj = data.status || {};
  const targetUrl = responsePayload?.targetUrl || data.url || targetUrlInput || '--';

  // 1. Telemetry Bar
  const targetEl = document.getElementById('metric-target-url');
  if (targetEl) targetEl.textContent = targetUrl;

  const statusBadgeEl = document.getElementById('metric-status-badge');
  if (statusBadgeEl) {
    const isSuccess = responsePayload?.success !== false && data.status !== 'failed' && !data.error;
    statusBadgeEl.textContent = isSuccess ? '200 OK' : 'Probe Failed';
    statusBadgeEl.className = isSuccess
      ? 'text-sm font-bold text-emerald-400 mt-1'
      : 'text-sm font-bold text-red-400 mt-1';
  }

  const latencyEl = document.getElementById('metric-latency');
  if (latencyEl) {
    const latency = statusObj.robotsFetchMs;
    latencyEl.textContent = (latency !== undefined && latency !== null) ? `${latency} ms` : 'N/A';
  }

  const totalUrlsEl = document.getElementById('metric-total-urls');
  const totalFound = data.totalPagesFound ?? data.discoveredRoutes?.length ?? data.pages?.length ?? 0;
  if (totalUrlsEl) totalUrlsEl.textContent = String(totalFound);

  const depthEl = document.getElementById('metric-depth-crawled');
  const depthCount = data.pageDepthCrawled ?? data.pages?.length ?? 0;
  if (depthEl) depthEl.textContent = String(depthCount);

  const wafEl = document.getElementById('metric-waf-status');
  if (wafEl) {
    const isBlocked = Boolean(statusObj.isWafBlocked);
    wafEl.textContent = isBlocked ? `BLOCKED (${statusObj.wafStatusCode || 403})` : 'PASS (Clear)';
    wafEl.className = isBlocked
      ? 'text-sm font-bold text-red-400 mt-1'
      : 'text-sm font-bold text-emerald-400 mt-1';
  }

  // 2. Section 1: Manifest Probes Grid
  const manifestContainer = document.getElementById('manifest-probes-container');
  if (manifestContainer) {
    const previews = data.manifestPreviews || {};
    const capManifests = data.capabilities?.manifests || {};

    manifestContainer.innerHTML = MANIFEST_DEFINITIONS.map((def) => {
      let exists = Boolean(statusObj[def.key]);
      if (!exists && capManifests[def.previewKey]) {
        exists = Boolean(capManifests[def.previewKey].exists);
      }
      const previewContent = statusObj[def.contentKey] || previews[def.previewKey] || '';
      const statusText = exists ? '200 OK' : '404 NOT FOUND';
      const badgeClass = exists ? 'bg-emerald-950 text-emerald-300 border-emerald-800' : 'bg-red-950 text-red-300 border-red-800';

      return `
        <div class="bg-gray-950/70 border border-gray-800 rounded-lg p-4 flex flex-col justify-between hover:border-gray-700 transition" data-manifest="${def.path}">
          <div>
            <div class="flex items-center justify-between gap-2 mb-2">
              <span class="font-mono text-sm text-amber-300 font-semibold truncate">${def.path}</span>
              <span class="text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${badgeClass}">
                ${statusText}
              </span>
            </div>
            <p class="text-xs text-gray-400 mb-3">${def.label}</p>
          </div>
          ${previewContent ? `
            <details class="mt-2 text-xs">
              <summary class="cursor-pointer text-emerald-400 hover:underline select-none">View Preview</summary>
              <pre class="mt-2 p-2 bg-gray-900 rounded text-[11px] font-mono text-gray-300 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">${escapeHtml(previewContent.slice(0, 500))}${previewContent.length > 500 ? '...' : ''}</pre>
            </details>
          ` : `
            <div class="text-[11px] text-gray-600 italic mt-2">No raw content payload</div>
          `}
        </div>
      `;
    }).join('');
  }

  // 3. Section 2: 20 AI Bots Permissions Matrix
  const botsContainer = document.getElementById('bots-matrix-container');
  if (botsContainer) {
    const rawBotPermissions = statusObj.botPermissions || data.capabilities?.crawlers || {};
    let allowedCount = 0;
    let blockedCount = 0;

    const cardsHtml = AI_BOT_DEFINITIONS.map((bot) => {
      let isAllowed = true;
      if (rawBotPermissions[bot.key] !== undefined) {
        const val = rawBotPermissions[bot.key];
        isAllowed = (typeof val === 'object' && val !== null) ? Boolean(val.allowed) : Boolean(val);
      }

      if (isAllowed) allowedCount++;
      else blockedCount++;

      const badgeClass = isAllowed ? 'status-badge-allowed' : 'status-badge-blocked';
      const badgeLabel = isAllowed ? 'ALLOWED' : 'BLOCKED';

      return `
        <div class="bg-gray-950/70 border border-gray-800 rounded-lg p-3 flex flex-col justify-between hover:border-gray-700 transition" data-bot-key="${bot.key}">
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <span class="font-bold text-sm text-white">${bot.name}</span>
              <span class="text-[10px] font-bold px-2 py-0.5 rounded ${badgeClass}">
                ${badgeLabel}
              </span>
            </div>
            <div class="text-[11px] font-mono text-gray-400 truncate mb-1">key: ${bot.key}</div>
          </div>
          <div class="mt-2 pt-2 border-t border-gray-900">
            <code class="text-[10px] font-mono text-gray-500 block truncate" title="${bot.pattern}">${bot.pattern}</code>
          </div>
        </div>
      `;
    }).join('');

    botsContainer.innerHTML = cardsHtml;

    const allowedBadge = document.getElementById('bot-allowed-count');
    if (allowedBadge) allowedBadge.textContent = `${allowedCount} Allowed`;

    const blockedBadge = document.getElementById('bot-blocked-count');
    if (blockedBadge) blockedBadge.textContent = `${blockedCount} Blocked`;
  }

  // 4. Section 3: Crawled Pages Detailed Array
  const pagesContainer = document.getElementById('pages-list-container');
  const pagesBadge = document.getElementById('crawled-pages-count-badge');
  const pagesList = Array.isArray(data.pages) ? data.pages : [];

  if (pagesBadge) pagesBadge.textContent = `${pagesList.length} Pages`;

  if (pagesContainer) {
    if (pagesList.length === 0) {
      pagesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic">No pages crawled or target domain returned zero readable HTML pages.</div>';
    } else {
      pagesContainer.innerHTML = pagesList.map((p, idx) => {
        const route = p.route || p.url || `Page ${idx + 1}`;
        const isFailed = p.status === 'failed';
        const wordCount = p.wordCount ?? 0;
        const textDensity = Math.round((Number(p.textCodeRatio || statusObj.contentDensityRatio) || 0) * 100);
        const title = p.title || 'N/A';
        const titleLen = p.titleLength ?? (p.title ? p.title.length : 0);
        const isOptimalTitle = (titleLen >= 75 && titleLen <= 125);
        const metaDesc = p.metaDescription || p.description || 'N/A';
        const hAudit = p.headingAudit || { h1: 0, h2: 0, h3: 0, h4: 0, isHierarchyValid: false };
        const isHierarchyValid = Boolean(hAudit.isHierarchyValid);
        const hasCanonical = Boolean(p.hasCanonical);
        const canonicalUrl = p.canonicalUrl || 'None';
        const snippet = p.bodySnippet || p.rawText || p.content || 'No body text extracted.';

        return `
          <div class="bg-gray-950 border border-gray-800 rounded-lg p-5 space-y-4 hover:border-gray-700 transition" data-page-route="${route}">
            <!-- Page Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800 pb-3">
              <div class="flex items-center gap-3">
                <span class="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded font-mono font-bold">#${idx + 1}</span>
                <span class="font-mono text-sm md:text-base font-bold text-white truncate max-w-xl">${route}</span>
              </div>
              <div>
                <span class="text-xs px-2.5 py-1 rounded font-bold uppercase ${isFailed ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
                  ${isFailed ? 'FAILED' : '200 OK'}
                </span>
              </div>
            </div>

            <!-- Page Metrics Grid -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div class="bg-[#1e1e1e] p-3 rounded border border-gray-800">
                <div class="text-gray-400 uppercase tracking-wider text-[10px]">Word Count</div>
                <div class="text-base font-bold text-white mt-0.5">${wordCount.toLocaleString()} words</div>
              </div>
              <div class="bg-[#1e1e1e] p-3 rounded border border-gray-800">
                <div class="text-gray-400 uppercase tracking-wider text-[10px]">Text Density Ratio</div>
                <div class="text-base font-bold text-emerald-400 mt-0.5">${textDensity}%</div>
              </div>
              <div class="bg-[#1e1e1e] p-3 rounded border border-gray-800">
                <div class="text-gray-400 uppercase tracking-wider text-[10px]">Title Length</div>
                <div class="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                  <span>${titleLen} chars</span>
                  <span class="text-[10px] px-1.5 py-0.2 rounded ${isOptimalTitle ? 'bg-emerald-950 text-emerald-400' : 'bg-gray-800 text-gray-400'}">${isOptimalTitle ? 'Optimal' : 'Standard'}</span>
                </div>
              </div>
              <div class="bg-[#1e1e1e] p-3 rounded border border-gray-800">
                <div class="text-gray-400 uppercase tracking-wider text-[10px]">Heading Hierarchy</div>
                <div class="text-base font-bold ${isHierarchyValid ? 'text-emerald-400' : 'text-amber-400'} mt-0.5">
                  ${isHierarchyValid ? 'Valid Hierarchy' : 'Invalid Sequence'}
                </div>
              </div>
            </div>

            <!-- Title & Meta Description -->
            <div class="space-y-2 text-xs">
              <div>
                <span class="text-gray-400 font-semibold">Title:</span>
                <span class="text-gray-200 ml-1 font-medium">${title}</span>
              </div>
              <div>
                <span class="text-gray-400 font-semibold">Meta Description:</span>
                <span class="text-gray-300 ml-1">${metaDesc}</span>
              </div>
              <div>
                <span class="text-gray-400 font-semibold">Canonical Tag:</span>
                <span class="font-mono text-cyan-400 ml-1">${hasCanonical ? canonicalUrl : '<span class="text-gray-500">None</span>'}</span>
              </div>
            </div>

            <!-- Heading Counts Tree -->
            <div class="flex items-center gap-4 text-xs font-mono bg-gray-900/60 p-2.5 rounded border border-gray-800">
              <span class="text-gray-400 font-sans font-bold">Headings:</span>
              <span class="text-emerald-400">H1: <strong class="text-white">${hAudit.h1 ?? 0}</strong></span>
              <span class="text-cyan-400">H2: <strong class="text-white">${hAudit.h2 ?? 0}</strong></span>
              <span class="text-purple-400">H3: <strong class="text-white">${hAudit.h3 ?? 0}</strong></span>
              <span class="text-amber-400">H4: <strong class="text-white">${hAudit.h4 ?? 0}</strong></span>
            </div>

            <!-- Body Snippet -->
            <div class="bg-gray-900/90 p-3 rounded border border-gray-800 text-xs font-sans text-gray-300">
              <div class="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">Body Text Snippet:</div>
              <p class="leading-relaxed">${snippet}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 5. Section 4: Discovered Routes Pool
  const routesContainer = document.getElementById('discovered-routes-container');
  const routesBadge = document.getElementById('discovered-routes-count');
  const discovered = data.discoveredRoutes || pagesList.map(p => p.route || p.url);

  if (routesBadge) routesBadge.textContent = `${discovered.length} Routes`;

  if (routesContainer) {
    if (discovered.length === 0) {
      routesContainer.innerHTML = '<div class="text-gray-500 italic">No routes discovered yet.</div>';
    } else {
      routesContainer.innerHTML = discovered.map((route, idx) => {
        const path = typeof route === 'string' ? route : (route.path || route.route || route.url || JSON.stringify(route));
        return `
        <div class="flex items-center justify-between py-1 border-b border-gray-900 last:border-0 hover:bg-gray-900 px-2 rounded">
          <span class="text-amber-300 font-mono">${path}</span>
          <span class="text-gray-600 text-[10px]">#${idx + 1}</span>
        </div>
      `;
      }).join('');
    }
  }

  // 6. Section 5: Raw JSON Inspection Drawer
  const rawDumpEl = document.getElementById('raw-json-dump');
  if (rawDumpEl) {
    rawDumpEl.textContent = JSON.stringify(responsePayload, null, 2);
  }
}

/**
 * Runs the crawler probe by posting to /api/test/crawler.
 */
export async function runCrawlerProbe(targetUrl, maxPages = 25) {
  if (!targetUrl) return;

  hideError();
  setLoading(true);

  try {
    const response = await fetch('/api/test/crawler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, maxPages })
    });

    const responsePayload = await response.json().catch(() => ({
      success: false,
      error: `HTTP ${response.status} ${response.statusText}`
    }));

    if (!response.ok || !responsePayload.success) {
      const errorMsg = responsePayload.error || `Crawler probe failed with status ${response.status}`;
      showError(errorMsg);
      if (responsePayload.data) {
        renderCrawlerData(responsePayload, targetUrl);
      }
      return responsePayload;
    }

    renderCrawlerData(responsePayload, targetUrl);
    return responsePayload;
  } catch (err) {
    showError(err.message || 'Network error executing crawler probe.');
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes listeners and query parameter checks.
 */
export function initCrawlerHarness() {
  resetView();

  const runBtn = document.getElementById('btn-run-crawler');
  const inputEl = document.getElementById('target-url-input');
  const dismissBtn = document.getElementById('btn-dismiss-error');

  if (runBtn && !runBtn.dataset.bound) {
    runBtn.addEventListener('click', () => {
      const url = inputEl ? inputEl.value.trim() : '';
      if (url) runCrawlerProbe(url);
    });
    runBtn.dataset.bound = 'true';
  }

  if (inputEl && !inputEl.dataset.bound) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const url = inputEl.value.trim();
        if (url) runCrawlerProbe(url);
      }
    });
    inputEl.dataset.bound = 'true';
  }

  if (dismissBtn && !dismissBtn.dataset.bound) {
    dismissBtn.addEventListener('click', hideError);
    dismissBtn.dataset.bound = 'true';
  }

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      if (inputEl) inputEl.value = urlParam;
      runCrawlerProbe(urlParam);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initCrawlerHarness();
  });
}
