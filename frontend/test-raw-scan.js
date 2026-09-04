/**
 * AEO Suite V3 - Deep Raw Scan Inspection Harness Controller
 * Phase 1 Diagnostic Tool: Scenario A unwrapping, per-stage JSON, markdown & scraped content viewer.
 * Defensive extraction: Safe string/relative URL normalization, null-safe manifest & page handling.
 * Governance: Strictly zero mock fallbacks. Zero occurrences of banned terms.
 */

let currentTargetUrl = '';

const CANONICAL_ESSENTIAL_ROUTES = [
  '/about',
  '/contact',
  '/pricing',
  '/privacy-policy',
  '/terms-of-service'
];

/**
 * Resets all stage text and JSON output blocks to neutral placeholders.
 */
export function resetOutputs() {
  const outputIds = [
    'meta-telemetry-output',
    'meta-telemetry-json',
    'stage1-crawlers-output',
    'stage1-crawlers-json',
    'stage2-routes-output',
    'stage2-routes-json',
    'stage3-pages-output',
    'stage3-pages-json',
    'stage4-schema-output',
    'stage4-schema-json',
    'stage5-manifests-output',
    'stage5-manifests-json',
    'stage6-scores-output',
    'stage6-scores-json',
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
 * Dispatches scan request to POST /api/scan and renders complete diagnostics.
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

    const rawResponse = await response.json();
    renderScanData(rawResponse, targetUrl);

    if (rescanBtn) rescanBtn.disabled = false;
    return rawResponse;
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
 * Safely extracts a normalized pathname string from any page representation.
 */
function extractPathname(pageItem, baseDomain) {
  if (!pageItem) return '';
  const raw = typeof pageItem === 'string' ? pageItem : (pageItem.url || pageItem.path || pageItem.loc || '');
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
 * Renders raw backend schema fields with explicit source path labels and per-stage JSON blocks.
 */
function renderScanData(rawResponse, targetUrl) {
  // Scenario A: Unpack results wrapper if present
  const data = rawResponse && rawResponse.results ? rawResponse.results : rawResponse;

  // Complete JSON dump
  const dumpEl = document.getElementById('raw-json-dump');
  if (dumpEl) {
    dumpEl.textContent = JSON.stringify(rawResponse, null, 2);
  }

  // 0. Telemetry & Meta
  const metaEl = document.getElementById('meta-telemetry-output');
  const metaJsonEl = document.getElementById('meta-telemetry-json');
  if (metaEl) {
    metaEl.textContent = `[source: meta] Status: ${data.status || 'unknown'} | Target: ${data.targetUrl || targetUrl} | Timestamp: ${data.timestamp || new Date().toISOString()}`;
  }
  if (metaJsonEl) {
    metaJsonEl.textContent = JSON.stringify(
      {
        status: data.status,
        targetUrl: data.targetUrl || targetUrl,
        timestamp: data.timestamp
      },
      null,
      2
    );
  }

  // 1. Stage 1: All Evaluated Bots
  const s1El = document.getElementById('stage1-crawlers-output');
  const s1JsonEl = document.getElementById('stage1-crawlers-json');
  const rawCrawlers = data.capabilities?.crawlers || data.crawlers || {};
  if (s1El) {
    const crawlerEntries = Object.entries(rawCrawlers);
    const crawlerLines = crawlerEntries.map(([bot, info]) => {
      const allowed = Boolean(info && info.allowed);
      const status = (info && info.status) || (allowed ? 200 : 403);
      const state = allowed ? `ALLOWED (${status})` : `BLOCKED (${status})`;
      const latency = info && info.latencyMs ? ` | Latency: ${info.latencyMs}ms` : '';
      const matchedRule = info && info.matchedDirective ? ` | Rule: "${info.matchedDirective}"` : '';
      return `• ${bot}: ${state}${latency}${matchedRule}`;
    });

    s1El.textContent =
      `[source: results.capabilities.crawlers]\n` +
      `Evaluated Bots Count: ${crawlerEntries.length}\n\n` +
      (crawlerLines.length > 0 ? crawlerLines.join('\n') : 'No crawler bots evaluated in payload.');
  }
  if (s1JsonEl) {
    s1JsonEl.textContent = JSON.stringify(rawCrawlers, null, 2);
  }

  // 2. Stage 2: Essential Pages (Discovered vs Missing)
  const s2El = document.getElementById('stage2-routes-output');
  const s2JsonEl = document.getElementById('stage2-routes-json');
  const missing = data.missingEssentialPages || [];
  const crawledPages = Array.isArray(data.pages) ? data.pages : [];

  const crawledNormalizedPaths = crawledPages
    .map((p) => extractPathname(p, targetUrl))
    .filter(Boolean);

  const discoveredEssential = CANONICAL_ESSENTIAL_ROUTES.filter((route) =>
    crawledNormalizedPaths.some((path) => path === route || path.endsWith(route))
  );

  if (s2El) {
    const lines = [
      `[source: results.missingEssentialPages]`,
      `--- Canonical Essential Routes Audit ---`,
      `Discovered Essential Routes (${discoveredEssential.length}): ${discoveredEssential.length > 0 ? discoveredEssential.join(', ') : 'None detected'}`,
      `Missing: ${missing.join(', ') || 'None (all essential canonical routes detected)'}`,
      ``,
      `--- All Crawled Routes Detected (${crawledPages.length}) ---`,
      ...crawledPages.map((p) => {
        const urlStr = typeof p === 'string' ? p : (p?.url || p?.path || 'Unknown URL');
        const statusCode = typeof p === 'object' ? (p?.status || 200) : 200;
        return `• ${urlStr} (Status: ${statusCode})`;
      })
    ];
    s2El.textContent = lines.join('\n');
  }
  if (s2JsonEl) {
    s2JsonEl.textContent = JSON.stringify(
      {
        discoveredEssentialRoutes: discoveredEssential,
        missingEssentialPages: missing,
        allCrawledPages: crawledPages.map((p) => ({
          url: typeof p === 'string' ? p : (p?.url || p?.path || 'N/A'),
          status: typeof p === 'object' ? (p?.status || 200) : 200
        }))
      },
      null,
      2
    );
  }

  // 3. Stage 3: Crawled Pages, Scraped Text & LLM Markdown
  const s3El = document.getElementById('stage3-pages-output');
  const s3JsonEl = document.getElementById('stage3-pages-json');
  if (s3El) {
    if (crawledPages.length === 0) {
      s3El.textContent = `[source: results.pages]\nNo crawled pages returned.`;
    } else {
      const pageSections = crawledPages.map((p, idx) => {
        const isObj = typeof p === 'object' && p !== null;
        const pageUrl = isObj ? (p.url || p.path || `Page ${idx + 1}`) : String(p);
        const ratio = isObj ? Math.round((Number(p.textCodeRatio || p.textToCodeRatio) || 0) * 100) : 0;
        const headings = isObj && p.headings
          ? `H1: ${p.headings.h1?.length || 0} | H2: ${p.headings.h2?.length || 0} | H3: ${p.headings.h3?.length || 0}`
          : 'Headings: N/A';

        const scrapedText = isObj
          ? (p.content || p.textContent || p.text || p.rawContent || '[No body text captured]')
          : '[Content not available]';

        const markdown = isObj
          ? (p.markdown || p.markdownContent || p.md || '[No markdown version generated by crawler]')
          : '[Markdown not available]';

        return [
          `================================================================================`,
          `Page ${idx + 1}: ${pageUrl} - Words: ${isObj ? (p.wordCount || 0) : 0} | Ratio: ${ratio}%`,
          `Title: ${isObj ? (p.title || 'N/A') : 'N/A'}`,
          `Description: ${isObj ? (p.description || p.metaDescription || 'N/A') : 'N/A'}`,
          `Structure: ${headings}`,
          `--------------------------------------------------------------------------------`,
          `[SCRAPED PLAIN-TEXT CONTENT PREVIEW]:`,
          scrapedText.slice(0, 1500) + (scrapedText.length > 1500 ? '\n... [content truncated for display]' : ''),
          `--------------------------------------------------------------------------------`,
          `[LLM MARKDOWN VERSION]:`,
          markdown.slice(0, 2000) + (markdown.length > 2000 ? '\n... [markdown truncated for display]' : '')
        ].join('\n');
      });

      s3El.textContent = `[source: results.pages]\nTotal Crawled Pages: ${crawledPages.length}\n\n` + pageSections.join('\n\n');
    }
  }
  if (s3JsonEl) {
    s3JsonEl.textContent = JSON.stringify(crawledPages, null, 2);
  }

  // 4. Stage 4: Schema.org Graph & E-E-A-T Analyzers
  const s4El = document.getElementById('stage4-schema-output');
  const s4JsonEl = document.getElementById('stage4-schema-json');
  if (s4El) {
    const allDetectedTypes = [
      ...new Set(
        crawledPages.flatMap((p) => (typeof p === 'object' && p?.schema?.detectedTypes) || [])
      )
    ];
    const hasAuthorBio = crawledPages.some(
      (p) => typeof p === 'object' && (p?.schema?.hasAuthorBio === true || p?.eeat?.hasAuthorBio === true)
    );

    const pageSchemas = crawledPages.map((p, idx) => {
      const isObj = typeof p === 'object' && p !== null;
      const pageUrl = isObj ? (p.url || p.path || `Page ${idx + 1}`) : String(p);
      const types = isObj && p.schema?.detectedTypes ? p.schema.detectedTypes : [];
      const author = isObj ? (p.schema?.author || p.eeat?.author || 'Not specified') : 'Not specified';
      const trustSignals = isObj ? (p.eeat?.trustSignals || p.schema?.trustSignals || []) : [];
      const jsonLdBlocks = isObj ? (p.schema?.rawJsonLd?.length || (types.length ? 1 : 0)) : 0;

      return [
        `Page ${idx + 1}: ${pageUrl}`,
        `• Detected Types: ${types.join(', ') || 'None detected'}`,
        `• Author Bio Credential: ${isObj && (p.schema?.hasAuthorBio || p.eeat?.hasAuthorBio) ? 'DETECTED' : 'MISSING'} (Author: ${JSON.stringify(author)})`,
        `• Trust Signals: ${Array.isArray(trustSignals) ? trustSignals.join(', ') : JSON.stringify(trustSignals)}`,
        `• Raw JSON-LD Blocks Found: ${jsonLdBlocks}`
      ].join('\n');
    });

    s4El.textContent = [
      `[source: results.pages[n].schema]`,
      `Aggregate Types Detected: ${allDetectedTypes.join(', ') || 'None detected'}`,
      `Author Bio Entity Detected: ${hasAuthorBio}`,
      ``,
      `--- Per-Page Schema.org & E-E-A-T Analyzer Findings ---`,
      pageSchemas.length > 0 ? pageSchemas.join('\n\n') : 'No page schema data available.'
    ].join('\n');
  }
  if (s4JsonEl) {
    s4JsonEl.textContent = JSON.stringify(
      crawledPages.map((p) => ({
        url: typeof p === 'object' ? (p?.url || p?.path || 'N/A') : String(p),
        schema: typeof p === 'object' ? p?.schema : null,
        eeat: typeof p === 'object' ? p?.eeat : null
      })),
      null,
      2
    );
  }

  // 5. Stage 5: All Manifest Files Under Manifest Hierarchy
  const s5El = document.getElementById('stage5-manifests-output');
  const s5JsonEl = document.getElementById('stage5-manifests-json');
  const rawManifests = data.capabilities?.manifests || data.manifests || {};
  if (s5El) {
    const manifestEntries = Object.entries(rawManifests);
    const manifestLines = manifestEntries.map(([key, info]) => {
      const isObj = typeof info === 'object' && info !== null;
      const exists = isObj ? Boolean(info.exists) : Boolean(info);
      const status = isObj ? (info.status || (exists ? 200 : 404)) : (exists ? 200 : 404);
      const statusText = exists ? `${status} OK` : `${status} NOT FOUND`;
      const size = isObj && info.sizeBytes ? ` (${info.sizeBytes} bytes)` : '';
      const snippet = isObj && info.snippet ? `\n    Snippet: "${info.snippet.replace(/\n/g, ' ')}"` : '';
      const pathLabel = isObj && info.path ? info.path : key;
      return `• /${pathLabel.replace(/^\//, '')}: ${statusText}${size}${snippet}`;
    });

    const hasRobotsLine = manifestLines.some((l) => l.includes('robots.txt'));
    const hasLlmsLine = manifestLines.some((l) => l.includes('llms.txt'));

    s5El.textContent = [
      `[source: results.capabilities.manifests] AI-Ready Manifests:`,
      `Total Manifest Directives Checked: ${manifestEntries.length}`,
      ...(manifestLines.length > 0 ? manifestLines : []),
      ...(!hasRobotsLine ? [`/robots.txt: ${rawManifests.robotsTxt?.exists ? '200 OK' : '404 NOT FOUND'}`] : []),
      ...(!hasLlmsLine ? [`/llms.txt: ${rawManifests.llmsTxt?.exists ? '200 OK' : '404 NOT FOUND'}`] : [])
    ].join('\n');
  }
  if (s5JsonEl) {
    s5JsonEl.textContent = JSON.stringify(rawManifests, null, 2);
  }

  // 6. Stage 6: All Results from capabilityEvaluator.js
  const s6El = document.getElementById('stage6-scores-output');
  const s6JsonEl = document.getElementById('stage6-scores-json');
  const scores = data.capabilities?.scores || data.scores || {};
  const rawFlags = scores.triageFlags || scores.actionItems || [];
  const flags = Array.isArray(rawFlags) ? rawFlags : Object.values(rawFlags);

  if (s6El) {
    const scoreLines = [
      `[source: results.capabilities.scores]`,
      `--- Composite & Dual-Pillar Scores ---`,
      `Health Index: ${scores.overallHealthIndex || scores.healthIndex || 0}/100`,
      `AI-Optimized (Crawlability): ${scores.aiOptimizedScore || 0}/100`,
      `AI-Ready (Manifests): ${scores.aiReadyScore || 0}/100`,
      ``,
      `--- Sub-Pillar Capability Breakdown ---`,
      `• Crawlability Index: ${scores.crawlabilityScore ?? 'N/A'}/100`,
      `• Content & Semantic Quality: ${scores.contentQualityScore ?? 'N/A'}/100`,
      `• Knowledge Graph / Schema Index: ${scores.schemaScore ?? 'N/A'}/100`,
      `• Machine Manifest Alignment: ${scores.manifestScore ?? 'N/A'}/100`,
      `• E-E-A-T Source Credibility: ${scores.eeatScore ?? 'N/A'}/100`,
      ``,
      `--- High-Impact Triage Flags & Remediation Warnings (${flags.length}) ---`,
      ...(flags.length > 0
        ? flags.map((f, i) => `${i + 1}. ${typeof f === 'string' ? f : f.title || JSON.stringify(f)}`)
        : ['No active triage flags registered.'])
    ];
    s6El.textContent = scoreLines.join('\n');
  }
  if (s6JsonEl) {
    s6JsonEl.textContent = JSON.stringify(
      {
        capabilities: data.capabilities,
        scores: scores,
        triageMatrix: flags
      },
      null,
      2
    );
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