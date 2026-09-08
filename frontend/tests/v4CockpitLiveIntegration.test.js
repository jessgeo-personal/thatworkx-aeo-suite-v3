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

  describe('Step 4 Canonical 6-Stage End-to-End Contract Integration (RED Phase)', () => {
    it('1. Stage 1 to 3 Contract Binding & Zero Hardcoded Fallbacks: renders dynamic backend stages and never 85%', async () => {
      const { renderStageFromState } = await import('../visualize.js');
      const fs = await import('fs');
      const path = await import('path');
      const htmlPath = path.resolve(__dirname, '../visualize.html');
      document.body.innerHTML = fs.readFileSync(htmlPath, 'utf8');

      const mockState = {
        isAudited: true,
        currentStep: 3,
        completedSteps: [1, 2, 3, 4, 5, 6],
        targetUrl: 'https://thatworkx.com',
        stages: {
          stage1: { score: '95%', status: 'PASS', summaryText: 'Bot Access: 19/20 Verified Unblocked' },
          stage2: { score: '80%', status: 'PASS', summaryText: 'Essential Anchors: 4/5 Verified Routes' },
          stage3: { score: '50%', status: 'WARN', summaryText: 'Citation Readability: 5/10 High Extractability' },
          stage4: { score: '75%', status: 'PASS', summaryText: 'Entity Trust: High Authority & Verified Credentials' },
          stage5: { score: '67%', status: 'WARN', summaryText: 'Machine Manifests: 2/3 Valid Protocols' },
          stage6: { score: '85%', status: 'PASS', summaryText: 'Executive Triage: 3 Actionable Priorities Identified' }
        },
        stage1: { score: '95%', status: 'PASS', summaryText: 'Bot Access: 19/20 Verified Unblocked', crawlers: [] },
        stage2: { score: '80%', status: 'PASS', summaryText: 'Essential Anchors: 4/5 Verified Routes', routes: [] },
        stage3: {
          score: '50%',
          status: 'WARN',
          summaryText: 'Citation Readability: 5/10 High Extractability',
          pages: [
            {
              url: 'https://thatworkx.com/',
              ratio: 28,
              wordCount: 1200,
              densityRating: 'Moderate',
              textCodeRatioPercent: 28,
              is404: false,
              headingCounts: { h1: 1, h2: 3, h3: 2, h4: 0 }
            },
            {
              url: 'https://thatworkx.com/terms',
              ratio: 0,
              wordCount: 0,
              densityRating: 'Thin',
              textCodeRatioPercent: 0,
              is404: true,
              status: '404 NOT FOUND',
              headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0 }
            }
          ]
        },
        stage4: { score: '75%', status: 'PASS', summaryText: 'Entity Trust: High Authority & Verified Credentials' },
        stage5: { score: '67%', status: 'WARN', summaryText: 'Machine Manifests: 2/3 Valid Protocols' },
        stage6: { score: '85%', status: 'PASS', summaryText: 'Executive Triage: 3 Actionable Priorities Identified', healthIndex: 85 }
      };

      // Render Stage 3
      renderStageFromState(3, mockState);
      const canvasBody3 = document.getElementById('canvas-body');
      const stage3Text = canvasBody3.textContent;

      expect(stage3Text).toContain('50%');
      expect(stage3Text).toContain('WARN');
      expect(stage3Text).toContain('Citation Readability: 5/10 High Extractability');
      expect(stage3Text).not.toContain('85%');

      // Render Stage 1
      renderStageFromState(1, mockState);
      const canvasBody1 = document.getElementById('canvas-body');
      expect(canvasBody1.textContent).toContain('95%');
      expect(canvasBody1.textContent).toContain('PASS');

      // Render Stage 2
      renderStageFromState(2, mockState);
      const canvasBody2 = document.getElementById('canvas-body');
      expect(canvasBody2.textContent).toContain('80%');
      expect(canvasBody2.textContent).toContain('PASS');
    });

    it('2. Stages 4, 5, and 6 Full Production Rendering: does NOT render placeholder "Ingestion Bound" strings', async () => {
      const { renderStageFromState } = await import('../visualize.js');
      const fs = await import('fs');
      const path = await import('path');
      const htmlPath = path.resolve(__dirname, '../visualize.html');
      document.body.innerHTML = fs.readFileSync(htmlPath, 'utf8');

      const mockState = {
        isAudited: true,
        currentStep: 4,
        completedSteps: [1, 2, 3, 4, 5, 6],
        targetUrl: 'https://thatworkx.com',
        stages: {
          stage4: { score: '75%', status: 'PASS', summaryText: 'Entity Trust: High Authority & Verified Credentials' },
          stage5: { score: '67%', status: 'WARN', summaryText: 'Machine Manifests: 2/3 Valid Protocols' },
          stage6: { score: '85%', status: 'PASS', summaryText: 'Executive Triage: 3 Actionable Priorities Identified', healthIndex: 85, humanWebReadiness: 92, machineWebReadiness: 54 }
        },
        stage4: {
          score: '75%',
          status: 'PASS',
          summaryText: 'Entity Trust: High Authority & Verified Credentials',
          detectedTypes: ['Organization', 'Person', 'WebSite'],
          hasAuthorBio: true
        },
        stage5: {
          score: '67%',
          status: 'WARN',
          summaryText: 'Machine Manifests: 2/3 Valid Protocols',
          manifests: [
            { path: '/robots.txt', exists: true, status: 200 },
            { path: '/llms.txt', exists: true, status: 200 },
            { path: '/ai-context.md', exists: false, status: 404 }
          ]
        },
        stage6: {
          score: '85%',
          status: 'PASS',
          summaryText: 'Executive Triage: 3 Actionable Priorities Identified',
          healthIndex: 85,
          humanWebReadiness: 92,
          machineWebReadiness: 54,
          triageFlags: [
            'Blocked ClaudeBot crawl permissions',
            'Missing machine manifest: /ai-context.md'
          ]
        }
      };

      // Stage 4 assertions
      renderStageFromState(4, mockState);
      const canvasBody4 = document.getElementById('canvas-body');
      expect(canvasBody4.textContent).not.toContain('Stage 4 Ingestion Bound');
      expect(canvasBody4.textContent).toContain('Entity Authority & E-E-A-T Relational Graph');
      expect(canvasBody4.textContent).toContain('75%');

      // Stage 5 assertions
      renderStageFromState(5, mockState);
      const canvasBody5 = document.getElementById('canvas-body');
      expect(canvasBody5.textContent).not.toContain('Stage 5 Ingestion Bound');
      expect(canvasBody5.textContent).toContain('LEVEL 1: PROTOCOL GATES');
      expect(canvasBody5.textContent).toContain('67%');
      expect(document.getElementById('canvas-governance-badge').textContent).toContain('AI-Ready');

      // Stage 6 assertions
      renderStageFromState(6, mockState);
      const canvasBody6 = document.getElementById('canvas-body');
      expect(canvasBody6.textContent).not.toContain('Stage 6 Ingestion Bound');
      expect(canvasBody6.textContent).toContain('AEO Health Index Dial');
      expect(canvasBody6.textContent).toContain('Dual-Pillar Readiness Breakdown');
      expect(canvasBody6.textContent).toContain('Top 5 Urgent Action Items');
    });

    it('3. Interactive Features & Drawers Integrity: Stage 3 renders individual pages with drawers and handles 404 routes', async () => {
      const { renderStageFromState } = await import('../visualize.js');
      const fs = await import('fs');
      const path = await import('path');
      const htmlPath = path.resolve(__dirname, '../visualize.html');
      document.body.innerHTML = fs.readFileSync(htmlPath, 'utf8');

      const mockState = {
        isAudited: true,
        currentStep: 3,
        completedSteps: [1, 2, 3],
        targetUrl: 'https://thatworkx.com',
        stages: {
          stage3: { score: '60%', status: 'WARN', summaryText: 'Citation Readability: 6/10 High Extractability' }
        },
        stage3: {
          score: '60%',
          status: 'WARN',
          pages: [
            {
              url: 'https://thatworkx.com/',
              ratio: 32,
              wordCount: 1500,
              densityRating: 'Optimal',
              textCodeRatioPercent: 32,
              is404: false,
              headingCounts: { h1: 1, h2: 3, h3: 2, h4: 0 }
            },
            {
              url: 'https://thatworkx.com/terms',
              ratio: 0,
              wordCount: 0,
              densityRating: 'Thin',
              textCodeRatioPercent: 0,
              is404: true,
              status: '404 NOT FOUND',
              headingCounts: { h1: 0, h2: 0, h3: 0, h4: 0 }
            }
          ]
        }
      };

      renderStageFromState(3, mockState);
      const canvasBody = document.getElementById('canvas-body');

      // Check page action buttons and drawers
      expect(canvasBody.textContent).toContain('View What AI sees');
      expect(canvasBody.textContent).toContain('Details');

      // Check 404 route handling: suppresses false-positive SPA/Thin warnings and renders 404 NOT FOUND
      expect(canvasBody.textContent).toContain('404 NOT FOUND');
      expect(canvasBody.textContent).toContain('/terms');
    });

    it('4. Un-audited State & Governance: shows neutral empty states and zero occurrences of banned term "AI-first"', async () => {
      const { renderStageFromState } = await import('../visualize.js');
      const fs = await import('fs');
      const path = await import('path');
      const htmlPath = path.resolve(__dirname, '../visualize.html');
      document.body.innerHTML = fs.readFileSync(htmlPath, 'utf8');

      const unAuditedState = {
        isAudited: false,
        completedSteps: [],
        currentStep: 1,
        targetUrl: '--',
        healthIndex: 0,
        statusLabel: 'UNAUDITED'
      };

      [1, 2, 3, 4, 5, 6].forEach(step => {
        renderStageFromState(step, unAuditedState);
        const canvasBody = document.getElementById('canvas-body');
        expect(canvasBody.textContent).toContain('Awaiting Audit');
        expect(canvasBody.textContent).toContain('UNAUDITED');
      });

      const jsContent = fs.readFileSync(path.resolve(__dirname, '../visualize.js'), 'utf8');
      const htmlContent = fs.readFileSync(path.resolve(__dirname, '../visualize.html'), 'utf8');
      expect(jsContent).not.toMatch(/AI-first/i);
      expect(htmlContent).not.toMatch(/AI-first/i);
    });
  });
});


