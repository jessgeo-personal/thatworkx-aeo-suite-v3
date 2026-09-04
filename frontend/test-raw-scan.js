/**
 * AEO Suite V3 - Deep Raw Scan Inspection Harness Controller
 * Phase 1 Diagnostic Tool: Maps live data from crawlerService, parserService, and capabilityEvaluator.
 * Governance: Strict Dual-Pillar rules ("AI-Optimized" vs "AI-Ready"). Zero mock fallbacks. Zero banned terms.
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
 * Safely extracts a normalized pathname string from any page representation.
 */
function extractPathname(pageItem, baseDomain) {
  if (!pageItem) return '';
  const raw = typeof pageItem === 'string' ? pageItem : (pageItem.url || pageItem.route || pageItem.path || '');
  if (!raw || typeof raw !== 'string') return '';

  const fallbackBase = baseDomain && baseDomain.startsWith('http') ? baseDomain : 'https://example.com';
  try {
    const parsed = new URL(raw, fallbackBase);
    return parsed.pathname.toLowerCase().replace(/\/$/, '') || '/';
  } catch {
    return raw.toLowerCase().replace(/\/$/, '') || '/';
  }
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
 * Renders raw backend schema fields with explicit source path labels and per-stage JSON blocks.
 */
function renderScanData(rawResponse, targetUrl) {
  // Unpack envelope wrapper
  const data = (rawResponse && rawResponse.results) ? rawResponse.results : (rawResponse || {});

  // Complete JSON dump
  const dumpEl = document.getElementById('raw-json-dump');
  if (dumpEl) {
    dumpEl.textContent = JSON.stringify(rawResponse, null, 2);
  }

  // 0. Telemetry & Meta
  const metaEl = document.getElementById('meta-telemetry-output');
  const metaJsonEl = document.getElementById('meta-telemetry-json');
  const scanUrl = data.url || data.targetUrl || targetUrl;
  const scanStatus = data.status?.status || (typeof data.status === 'string' ? data.status : rawResponse.status) || 'complete';
  const totalPages = data.totalPagesFound || data.scanMetrics?.totalPages || (Array.isArray(data.pages) ? data.pages.length : 0);
  const totalWords = data.scanMetrics?.totalWords || 0;
  const depth = data.pageDepthCrawled ?? 'N/A';
  const tier = rawResponse.stats?.tier || 'Standard';

  if (metaEl) {
    metaEl.textContent = [
      `[source: meta / results]`,
      `Target URL: ${scanUrl}`,
      `Scan Status: ${scanStatus}`,
      `Crawled Pages Count: ${totalPages}`,
      `Crawled Total Words: ${totalWords}`,
      `Crawl Depth: ${depth}`,
      `Tier: ${tier}`,
      `Timestamp: ${data.timestamp || new Date().toISOString()}`
    ].join('\n');
  }
  if (metaJsonEl) {
    metaJsonEl.textContent = JSON.stringify({
      targetUrl: scanUrl,
      status: scanStatus,
      stats: rawResponse.stats || null,
      scanMetrics: data.scanMetrics || null,
      totalPagesFound: data.totalPagesFound,
      pageDepthCrawled: data.pageDepthCrawled
    }, null, 2);
  }

  // 1. Stage 1: AI Crawler Bot Permissions
  const s1El = document.getElementById('stage1-crawlers-output');
  const s1JsonEl = document.getElementById('stage1-crawlers-json');

  const rawCrawlers =
    data.status?.botPermissions ||
    data.capabilities?.crawlers ||
    data.capabilities?.crawlerRadar ||
    data.crawlers ||
    {};

  if (s1El) {
    let crawlerLines = [];
    let count = 0;

    if (Array.isArray(rawCrawlers)) {
      count = rawCrawlers.length;
      crawlerLines = rawCrawlers.map((item) => {
        const name = item.name || item.bot || 'Unknown Bot';
        const allowed = item.allowed ?? (item.status === 200 || !item.blocked);
        const statusCode = item.statusCode || item.status || (allowed ? 200 : 403);
        return `• ${name}: ${allowed ? 'ALLOWED' : 'BLOCKED'} (${statusCode})`;
      });
    } else if (typeof rawCrawlers === 'object' && rawCrawlers !== null) {
      const entries = Object.entries(rawCrawlers);
      count = entries.length;
      crawlerLines = entries.map(([bot, info]) => {
        const isObj = typeof info === 'object' && info !== null;
        const allowed = isObj ? Boolean(info.allowed ?? (info.status === 200)) : Boolean(info);
        const status = isObj ? (info.status || (allowed ? 200 : 403)) : (allowed ? 200 : 403);
        const latency = isObj && info.latencyMs ? ` | Latency: ${info.latencyMs}ms` : '';
        const rule = isObj && info.matchedDirective ? ` | Rule: "${info.matchedDirective}"` : '';
        return `• ${bot}: ${allowed ? 'ALLOWED' : 'BLOCKED'} (${status})${latency}${rule}`;
      });
    }

    s1El.textContent = [
      `[source: results.status.botPermissions / results.capabilities.crawlers]`,
      `Evaluated Bots Count: ${count}`,
      ``,
      ...(crawlerLines.length > 0 ? crawlerLines : ['No crawler bots evaluated in payload.'])
    ].join('\n');
  }
  if (s1JsonEl) {
    s1JsonEl.textContent = JSON.stringify(rawCrawlers, null, 2);
  }

  // 2. Stage 2: Canonical Routes (Discovered vs Missing Essential)
  const s2El = document.getElementById('stage2-routes-output');
  const s2JsonEl = document.getElementById('stage2-routes-json');
  const missing = data.missingEssentialPages || [];
  const crawledPages = Array.isArray(data.pages) ? data.pages : [];
  const discoveredRoutes = data.discoveredRoutes || [];

  const allDetectedPaths = [
    ...new Set([
      ...discoveredRoutes.map((r) => extractPathname(r, targetUrl)),
      ...crawledPages.map((p) => extractPathname(p, targetUrl))
    ])
  ].filter(Boolean);

  const discoveredEssential = CANONICAL_ESSENTIAL_ROUTES.filter((route) =>
    allDetectedPaths.some((p) => p === route || p.endsWith(route))
  );

  if (s2El) {
    const lines = [
      `[source: results.discoveredRoutes & results.missingEssentialPages]`,
      `--- Canonical Essential Routes Audit ---`,
      `Discovered Essential Routes (${discoveredEssential.length}): ${discoveredEssential.length > 0 ? discoveredEssential.join(', ') : 'None detected'}`,
      `Missing: ${missing.length > 0 ? missing.join(', ') : 'None (all essential canonical routes detected)'}`,
      ``,
      `--- All Crawled Routes Detected (${allDetectedPaths.length}) ---`,
      ...allDetectedPaths.map((p) => `• ${p}`)
    ];
    s2El.textContent = lines.join('\n');
  }
  if (s2JsonEl) {
    s2JsonEl.textContent = JSON.stringify({
      discoveredEssentialRoutes: discoveredEssential,
      missingEssentialPages: missing,
      allDetectedPaths,
      rawDiscoveredRoutes: discoveredRoutes
    }, null, 2);
  }

  // 3. Stage 3: Crawled Pages, Scraped Content & LLM Markdown
  const s3El = document.getElementById('stage3-pages-output');
  const s3JsonEl = document.getElementById('stage3-pages-json');

  if (s3El) {
    if (crawledPages.length === 0) {
      s3El.textContent = `[source: results.pages]\nNo crawled pages returned.`;
    } else {
      const pageSections = crawledPages.map((p, idx) => {
        const isObj = typeof p === 'object' && p !== null;
        const route = isObj ? (p.route || p.url || `Page ${idx + 1}`) : String(p);
        const words = isObj ? (p.wordCount || 0) : 0;
        const ratio = isObj ? Math.round((Number(p.textCodeRatio || data.status?.contentDensityRatio) || 0) * 100) : 0;
        const title = isObj ? (p.title || 'N/A') : 'N/A';
        const desc = isObj ? (p.metaDescription || p.description || 'N/A') : 'N/A';

        let headingsStr = 'Headings: N/A';
        if (isObj && p.headingAudit) {
          headingsStr = `H1: ${p.headingAudit.h1 ?? 0} | H2: ${p.headingAudit.h2 ?? 0} | Hierarchy Valid: ${p.headingAudit.isHierarchyValid ? 'Yes' : 'No'}`;
        } else if (isObj && Array.isArray(p.headings)) {
          headingsStr = `Headings Count: ${p.headings.length}`;
        }

        const scrapedText = isObj
          ? (p.content || p.rawText || p.bodySnippet || data.scrapedContentPreview || '[No body text captured]')
          : '[Content not available]';

        const markdown = isObj
          ? (p.markdown || p.rawText || p.content || '[Markdown not available]')
          : '[Markdown not available]';

        return [
          `================================================================================`,
          `Page ${idx + 1}: ${route} - Words: ${words} | Ratio: ${ratio}%`,
          `Title: ${title}`,
          `Description: ${desc}`,
          `Structure: ${headingsStr}`,
          `Canonical: ${p.hasCanonical ? p.canonicalUrl : 'None'}`,
          `--------------------------------------------------------------------------------`,
          `[SCRAPED PLAIN-TEXT CONTENT PREVIEW]:`,
          scrapedText.slice(0, 1200) + (scrapedText.length > 1200 ? '\n... [truncated]' : ''),
          `--------------------------------------------------------------------------------`,
          `[LLM MARKDOWN VERSION]:`,
          markdown.slice(0, 1500) + (markdown.length > 1500 ? '\n... [truncated]' : '')
        ].join('\n');
      });

      s3El.textContent = `[source: results.pages]\nTotal Crawled Pages: ${crawledPages.length}\n\n` + pageSections.join('\n\n');
    }
  }
  if (s3JsonEl) {
    s3JsonEl.textContent = JSON.stringify(crawledPages, null, 2);
  }

  // 4. Stage 4: Schema.org Graph & E-E-A-T Trust Signals
  const s4El = document.getElementById('stage4-schema-output');
  const s4JsonEl = document.getElementById('stage4-schema-json');

  const jsonLdTypes = data.status?.jsonLdTypes || [];
  const jsonLdExists = Boolean(data.status?.jsonLdExists ?? jsonLdTypes.length > 0);
  const eeat = data.eeatMetrics || {};

  if (s4El) {
    const pageTypes = [
      ...new Set([
        ...jsonLdTypes,
        ...crawledPages.flatMap((p) => (typeof p === 'object' && p?.schema?.detectedTypes) || [])
      ])
    ];

    const hasAuthorBio = Boolean(
      crawledPages.some((p) => p?.schema?.hasAuthorBio === true || p?.eeat?.hasAuthorBio === true) ||
      eeat.hasAuthorBio
    );

    s4El.textContent = [
      `[source: results.status.jsonLdTypes & results.eeatMetrics]`,
      `JSON-LD Structured Data: ${jsonLdExists ? 'EXISTS' : 'NOT FOUND'}`,
      `Detected Types: ${pageTypes.length > 0 ? pageTypes.join(', ') : 'None detected'}`,
      `Author Bio Entity Detected: ${hasAuthorBio ? 'true' : 'false'}`,
      ``,
      `--- E-E-A-T Trust & Credibility Signals ---`,
      `• SSL / Secure Protocol: ${eeat.isSecure ? 'SECURE (HTTPS)' : 'INSECURE'}`,
      `• Contact Information Present: ${eeat.hasContactInfo ? 'YES' : 'MISSING'}`,
      `• Privacy Policy Linked: ${eeat.hasPrivacyPolicy ? 'YES' : 'MISSING'}`,
      `• Authority Status: ${eeat.authorityStatus || 'Unrated'}`,
      `• Experience Rating: ${data.status?.experienceScore ?? 'N/A'}`,
      `• Readability Rating: ${data.status?.readabilityRating || 'N/A'}`,
      `• Content Density Ratio: ${data.status?.contentDensityRatio ?? 'N/A'}%`
    ].join('\n');
  }
  if (s4JsonEl) {
    s4JsonEl.textContent = JSON.stringify({
      jsonLdExists,
      jsonLdTypes,
      eeatMetrics: eeat,
      pageSchemas: crawledPages.map((p) => ({ route: p.route || p.url, schema: p.schema || null }))
    }, null, 2);
  }

  // 5. Stage 5: Machine Manifest Hierarchy (AI-Ready Directives)
  const s5El = document.getElementById('stage5-manifests-output');
  const s5JsonEl = document.getElementById('stage5-manifests-json');

  const statusObj = data.status || {};
  const previews = data.manifestPreviews || {};

  const manifestMap = [
    { path: '/robots.txt', exists: Boolean(statusObj.robotsTxtExists ?? data.capabilities?.manifests?.robotsTxt?.exists), preview: previews.robotsTxt },
    { path: '/sitemap.xml', exists: Boolean(statusObj.sitemapExists ?? data.capabilities?.manifests?.sitemapXml?.exists), preview: previews.sitemap },
    { path: '/llms.txt', exists: Boolean(statusObj.llmsTxtExists ?? data.capabilities?.manifests?.llmsTxt?.exists), preview: previews.llmsTxt },
    { path: '/ai-context.md', exists: Boolean(statusObj.aiContextExists ?? data.capabilities?.manifests?.aiContextMd?.exists), preview: previews.aiContext },
    { path: '/about.txt', exists: Boolean(statusObj.aboutTxtExists), preview: null },
    { path: '/docs.txt', exists: Boolean(statusObj.docsTxtExists), preview: null },
    { path: '/content.txt', exists: Boolean(statusObj.contentTxtExists), preview: null }
  ];

  if (s5El) {
    const lines = manifestMap.map((m) => {
      const statusText = m.exists ? '200 OK' : '404 NOT FOUND';
      const snippet = m.preview ? `\n    Content Preview: "${String(m.preview).slice(0, 100).replace(/\n/g, ' ')}..."` : '';
      return `• ${m.path}: ${statusText}${snippet}`;
    });

    s5El.textContent = [
      `[source: results.capabilities.manifests] AI-Ready Manifests:`,
      `Total Manifest Directives Checked: ${manifestMap.length}`,
      ...lines
    ].join('\n');
  }
  if (s5JsonEl) {
    s5JsonEl.textContent = JSON.stringify({
      manifestPresence: statusObj,
      manifestPreviews: previews,
      capabilitiesManifests: data.capabilities?.manifests || null
    }, null, 2);
  }

  // 6. Stage 6: Capability Evaluator, Scores & 32-Capability Matrix
  const s6El = document.getElementById('stage6-scores-output');
  const s6JsonEl = document.getElementById('stage6-scores-json');

  const scoreCard = data.scoreCard || {};
  const overall = data.overallScore ?? scoreCard.overallScore ?? data.capabilities?.scores?.overallHealthIndex ?? 0;
  const pScores = data.pillarScores || scoreCard.pillars || {};

  const p1 = Number(pScores.P1 ?? pScores.p1?.score ?? data.capabilities?.scores?.aiOptimizedScore ?? 0);
  const p2 = Number(pScores.P2 ?? pScores.p2?.score ?? 0);
  const p3 = Number(pScores.P3 ?? pScores.p3?.score ?? 0);
  const p4 = Number(pScores.P4 ?? pScores.p4?.score ?? data.capabilities?.scores?.aiReadyScore ?? 0);

  const capMatrix = Array.isArray(data.capabilityMatrix) ? data.capabilityMatrix : (rawResponse.capabilityMatrix || []);
  const alerts = data.alerts || data.capabilities?.scores?.triageFlags || [];

  if (s6El) {
    const matrixLines = capMatrix.slice(0, 15).map((cap, i) => {
      const name = cap.name || cap.title || `Capability ${i + 1}`;
      const score = cap.score ?? cap.value ?? 'N/A';
      const status = cap.status ? ` [${cap.status}]` : '';
      return `  ${i + 1}. ${name}: ${score}${status}`;
    });

    s6El.textContent = [
      `[source: results.capabilities.scores]`,
      `--- Composite & Dual-Pillar Scores ---`,
      `Health Index: ${overall}/100`,
      `AI-Optimized (Crawlability): ${p1}/100`,
      `AI-Ready (Manifests): ${p4}/100`,
      ``,
      `--- 4-Pillar Score Breakdown ---`,
      `• Pillar 1 (AI Crawlability & Indexing): ${p1}/100`,
      `• Pillar 2 (Content & Architecture): ${p2}/100`,
      `• Pillar 3 (Authority & E-E-A-T): ${p3}/100`,
      `• Pillar 4 (AI Context & Machine Manifests): ${p4}/100`,
      ``,
      `--- Evaluated Capability Matrix (${capMatrix.length} Total Capabilities) ---`,
      ...(matrixLines.length > 0 ? matrixLines : ['No capability matrix entries returned.']),
      ...(capMatrix.length > 15 ? [`  ... [${capMatrix.length - 15} additional capabilities in JSON drawer]`] : []),
      ``,
      `--- High-Impact Triage Warnings (${alerts.length}) ---`,
      ...(alerts.length > 0
        ? alerts.map((a, i) => `${i + 1}. ${typeof a === 'string' ? a : a.title || a.message || JSON.stringify(a)}`)
        : ['No active triage flags registered.'])
    ].join('\n');
  }
  if (s6JsonEl) {
    s6JsonEl.textContent = JSON.stringify({
      overallScore: overall,
      pillarScores: pScores,
      scoreCard,
      alerts,
      totalCapabilitiesEvaluated: capMatrix.length,
      capabilityMatrix: capMatrix
    }, null, 2);
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