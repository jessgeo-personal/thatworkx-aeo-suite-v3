/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO Suite V4: Cockpit Live Data Ingestion & Rescan Engine (Phase 1 RED)', () => {
  let container;

  beforeEach(() => {
    // Setup clean DOM fixture representing visualize.html cockpit shell
    document.body.innerHTML = `
      <div id="cockpit-container">
        <div id="cockpit-error-banner" style="display: none;">
          <span class="error-msg"></span>
          <button id="banner-dismiss-btn">Dismiss</button>
        </div>
        <div class="search-bar">
          <input type="text" id="target-url-input" value="" />
          <button id="cockpit-search-btn">Scan</button>
          <button id="rescan-btn">Rescan</button>
        </div>
        <div id="status-display">
          <span id="cockpit-scanned-url">--</span>
          <span id="cockpit-scanned-date">--</span>
          <span id="cockpit-scanned-duration">--</span>
          <span id="cockpit-scanned-pages">--</span>
          <span id="cockpit-diagnostic-score">0</span>
          <span id="cockpit-diagnostic-badge">UNAUDITED</span>
        </div>
        <div id="stage1-container"></div>
        <div id="stage2-container"></div>
        <div id="stage3-container"></div>
        <div id="stage4-container"></div>
        <div id="stage5-container"></div>
        <div id="stage6-container"></div>
      </div>
    `;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gate Check: Verifies prototype fixtures AUDIT_DATA and ALL_STAGE3_PAGES are purged', async () => {
    const visualizeModule = await import('../visualize.js');
    expect(visualizeModule.AUDIT_DATA).toBeUndefined();
    expect(visualizeModule.ALL_STAGE3_PAGES).toBeUndefined();
  });

  it('Gate Check: Zero occurrences of banned term "AI-first" in visualize.js module', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const jsPath = path.resolve(__dirname, '../visualize.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');
    expect(jsContent).not.toMatch(/AI-first/i);
  });

  it('Initial State: Initializes with neutral un-audited defaults and zero mock defaults', async () => {
    const { initCockpit, getCockpitState } = await import('../visualize.js');
    delete window.location;
    window.location = new URL('https://thatworkx.com/visualize.html');
    
    initCockpit();
    const state = getCockpitState();

    expect(state.summary.healthScore).toBe(0);
    expect(state.summary.diagnosticBadge).toBe('UNAUDITED');
    expect(state.summary.scannedUrl).toBe('--');
    expect(document.getElementById('cockpit-diagnostic-score').textContent.trim()).toBe('0');
    expect(document.getElementById('cockpit-diagnostic-badge').textContent.trim()).toBe('UNAUDITED');
  });

  it('URL Ingestion: Automatically parses ?url= param and executes live scan', async () => {
    const { initCockpit, executeCockpitScan } = await import('../visualize.js');
    delete window.location;
    window.location = new URL('https://thatworkx.com/visualize.html?url=example.com');

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        targetUrl: 'https://example.com',
        status: 'complete',
        results: {
          pages: [{ url: 'https://example.com/', wordCount: 820, ratio: 0.52 }],
          missingEssentialPages: ['/pricing'],
          capabilities: {
            crawlerAccess: { gptBot: { allowed: true, status: 200 } },
            manifests: { robotsTxt: { exists: true, status: 200 } },
            schema: { detected: ['Organization'], authorCredentials: true },
            scores: { aiOptimized: 80, aiReady: 70, compositeHealth: 75 }
          }
        }
      })
    });
    global.fetch = fetchMock;

    await initCockpit();

    expect(document.getElementById('target-url-input').value).toBe('example.com');
    expect(fetchMock).toHaveBeenCalledWith('/api/scan', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'example.com', email: '' })
    }));
  });

  it('Error Ingestion Gate: Displays error banner and logs internal failure on HTTP 500 without mock fallback', async () => {
    const { executeCockpitScan, getCockpitErrorLogs, clearCockpitErrorLogs, getCockpitState } = await import('../visualize.js');
    clearCockpitErrorLogs();

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await executeCockpitScan('failed-domain.com');

    const banner = document.getElementById('cockpit-error-banner');
    expect(banner.style.display).not.toBe('none');
    expect(banner.textContent).toContain('failed-domain.com');

    const logs = getCockpitErrorLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].targetUrl).toBe('failed-domain.com');
    expect(logs[0].status).toBe(500);

    const state = getCockpitState();
    expect(state.summary.diagnosticBadge).toBe('UNAUDITED');
    expect(state.summary.healthScore).toBe(0);
  });

  it('Rescan Authorization: handleCockpitRescan prompts window.confirm and respects user cancel', async () => {
    const { handleCockpitRescan } = await import('../visualize.js');
    document.getElementById('target-url-input').value = 'secure-portal.com';

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetchMock = vi.fn();
    global.fetch = fetchMock;

    await handleCockpitRescan();

    expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('secure-portal.com'));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('Rescan Authorization: handleCockpitRescan dispatches executeCockpitScan on confirmation', async () => {
    const { handleCockpitRescan } = await import('../visualize.js');
    document.getElementById('target-url-input').value = 'approved-domain.com';

    vi.spyOn(window, 'confirm').mockReturnValue(true);
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        targetUrl: 'https://approved-domain.com',
        status: 'complete',
        results: {
          pages: [],
          missingEssentialPages: [],
          capabilities: { scores: { compositeHealth: 90 } }
        }
      })
    });
    global.fetch = fetchMock;

    await handleCockpitRescan();

    expect(fetchMock).toHaveBeenCalledWith('/api/scan', expect.objectContaining({
      body: JSON.stringify({ targetUrl: 'approved-domain.com', email: '' })
    }));
  });

  it('Zero Dummy Data Gate: Inaccessible domain (ENOTFOUND) returning HTTP 200 must trigger error banner and reset to UNAUDITED', async () => {
    const { executeCockpitScan, getCockpitErrorLogs, clearCockpitErrorLogs, getCockpitState } = await import('../visualize.js');
    clearCockpitErrorLogs();

    // Simulates the backend returning HTTP 200 with an ENOTFOUND crawl failure payload
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        targetUrl: 'https://ab.yu',
        status: 'failed',
        results: {
          status: 'failed',
          error: 'getaddrinfo ENOTFOUND ab.yu',
          pages: [],
          missingEssentialPages: ['/about', '/contact', '/pricing', '/privacy-policy', '/terms-of-service'],
          capabilities: {
            triage: ['HTTP fetch failed for https://ab.yu: getaddrinfo ENOTFOUND ab.yu'],
            scores: { aiOptimized: 0, aiReady: 10, compositeHealth: 15 }
          }
        }
      })
    });

    await executeCockpitScan('ab.yu');

    // 1. Error banner must be visible and contain the network failure message
    const banner = document.getElementById('cockpit-error-banner');
    expect(banner.style.display).not.toBe('none');
    expect(banner.textContent).toContain('ENOTFOUND');

    // 2. State must NEVER show 15/100 or NEEDS IMPROVEMENT
    const state = getCockpitState();
    expect(state.summary.healthScore).toBe(0);
    expect(state.summary.diagnosticBadge).toBe('UNAUDITED');
    expect(document.getElementById('cockpit-diagnostic-score').textContent.trim()).toBe('0');
    expect(document.getElementById('cockpit-diagnostic-badge').textContent.trim()).toBe('UNAUDITED');

    // 3. Error must be logged internally
    const logs = getCockpitErrorLogs();
    expect(logs.length).toBeGreaterThan(0);
    expect(logs[0].targetUrl).toBe('ab.yu');
    expect(logs[0].message).toContain('ENOTFOUND');
  });

  it('Banner Gate: Inaccessible domain failure must display #cockpit-error-banner without Tailwind hidden conflicts', async () => {
    const { executeCockpitScan, setErrorBanner } = await import('../visualize.js');

    setErrorBanner('Site is not accessible (getaddrinfo ENOTFOUND ab.yu)');

    const banner = document.getElementById('cockpit-error-banner');
    expect(banner).not.toBeNull();
    expect(banner.classList.contains('hidden')).toBe(false);
    expect(banner.style.display).toBe('flex');
    expect(banner.textContent).toContain('ENOTFOUND');
  });

  it('Zero Mock Gate: What-If simulator must base calculation on 0, never hardcoded 78', async () => {
    const { updateSimulator, getCockpitState, resetCockpitToNeutral } = await import('../visualize.js');
    resetCockpitToNeutral();

    const projected = updateSimulator();
    expect(projected).toBe(0);

    const projectedEl = document.getElementById('projected-health-score');
    if (projectedEl) {
      expect(projectedEl.textContent.trim()).toBe('0');
    }
  });

  it('Header Telemetry Gate: renderCockpit must populate timestamp-label, scan-duration-label, and total-pages-label', async () => {
    const { renderCockpit } = await import('../visualize.js');

    // Ensure DOM has both sets of IDs present in visualize.html
    document.body.innerHTML += `
      <strong id="timestamp-label">--</strong>
      <strong id="scan-duration-label">--</strong>
      <strong id="total-pages-label">--</strong>
    `;

    const mockState = {
      meta: {
        targetUrl: 'https://thatworkx.com',
        timestamp: '2026-09-05 11:45:00',
        scanDuration: '2.4s'
      },
      stage3: {
        pages: [{ url: 'https://thatworkx.com/' }, { url: 'https://thatworkx.com/about' }]
      },
      stage6: { overallHealthIndex: 97 }
    };

    renderCockpit(mockState);

    const timeEl = document.getElementById('timestamp-label');
    const durEl = document.getElementById('scan-duration-label');
    const pagesEl = document.getElementById('total-pages-label');

    expect(timeEl.textContent).not.toBe('--');
    expect(durEl.textContent).toBe('2.4s');
    expect(pagesEl.textContent).toBe('2');
  });

  it('Live Scan Timer: executeCockpitScan records elapsed duration and sets scan-duration-label', async () => {
    const { executeCockpitScan } = await import('../visualize.js');

    document.body.innerHTML += `
      <strong id="scan-duration-label">--</strong>
      <strong id="total-pages-label">--</strong>
      <strong id="timestamp-label">--</strong>
    `;

    global.fetch = vi.fn().mockImplementation(async () => {
      // Simulate network latency
      await new Promise(r => setTimeout(r, 50));
      return {
        ok: true,
        status: 200,
        json: async () => ({
          targetUrl: 'https://thatworkx.com',
          status: 'complete',
          results: {
            pages: [{ url: 'https://thatworkx.com/' }],
            capabilities: { scores: { compositeHealth: 97 } }
          }
        })
      };
    });

    await executeCockpitScan('thatworkx.com');

    const durEl = document.getElementById('scan-duration-label');
    expect(durEl.textContent).toMatch(/^\d+(\.\d+)?s$/);
  });
});


