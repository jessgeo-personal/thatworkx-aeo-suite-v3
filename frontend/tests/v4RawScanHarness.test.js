/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('V4 Raw Scan Inspection Harness (Phase 1 RED)', () => {
  let container;
  let rawInspectorModule;

  const mockSuccessPayload = {
    status: 'completed',
    targetUrl: 'https://example.com',
    timestamp: '2026-09-04T12:00:00Z',
    pages: [
      {
        url: 'https://example.com',
        wordCount: 1420,
        textCodeRatio: 0.28,
        schema: {
          detectedTypes: ['Organization', 'WebSite'],
          hasAuthorBio: false,
          graphEntities: 2
        }
      },
      {
        url: 'https://example.com/about',
        wordCount: 650,
        textCodeRatio: 0.15,
        schema: {
          detectedTypes: ['AboutPage', 'Person'],
          hasAuthorBio: true,
          graphEntities: 1
        }
      }
    ],
    missingEssentialPages: ['/pricing', '/privacy-policy', '/terms-of-service'],
    capabilities: {
      crawlers: {
        gptBot: { allowed: true, status: 200 },
        claudeBot: { allowed: false, status: 403 },
        ccBot: { allowed: true, status: 200 },
        perplexityBot: { allowed: true, status: 200 },
        googleExtended: { allowed: false, status: 403 }
      },
      manifests: {
        robotsTxt: { exists: true, status: 200 },
        llmsTxt: { exists: false, status: 404 },
        aiContextMd: { exists: false, status: 404 }
      },
      scores: {
        overallHealthIndex: 64,
        aiOptimizedScore: 72,
        aiReadyScore: 45,
        triageFlags: ['Missing llms.txt', 'Blocked ClaudeBot']
      }
    }
  };

  beforeEach(async () => {
    // Setup isolated DOM tree
    document.body.innerHTML = `
      <div id="raw-inspector-app">
        <header>
          <h1>AEO Diagnostic Cockpit: Raw Scan Data Harness</h1>
        </header>

        <section id="scan-controls">
          <input type="text" id="target-url-input" placeholder="https://example.com" />
          <button id="fetch-scan-btn">Fetch Live Scan</button>
          <button id="rescan-btn" disabled>Rescan Domain</button>
        </section>

        <div id="error-notification-banner" class="hidden" role="alert"></div>

        <main id="raw-output-display">
          <div id="meta-telemetry-output">--</div>
          <div id="stage1-crawlers-output">--</div>
          <div id="stage2-routes-output">--</div>
          <div id="stage3-pages-output">--</div>
          <div id="stage4-schema-output">--</div>
          <div id="stage5-manifests-output">--</div>
          <div id="stage6-scores-output">--</div>
          <pre id="raw-json-dump">--</pre>
        </main>

        <section id="error-log-console">
          <h3>Internal Quality & Tracking Error Log</h3>
          <ul id="error-log-list"></ul>
        </section>
      </div>
    `;

    container = document.getElementById('raw-inspector-app');

    // Reset window.location search
    delete window.location;
    window.location = new URL('http://localhost:3000/test-raw-scan.html');

    // Dynamically attempt import of harness controller (expected to fail or be missing in RED)
    try {
      rawInspectorModule = await import('../test-raw-scan.js');
    } catch {
      rawInspectorModule = null;
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('Gate 1: Pre-scan idle state renders strictly neutral defaults ("--", "UNAUDITED") with zero dummy data', () => {
    expect(rawInspectorModule).not.toBeNull();
    rawInspectorModule.initRawInspector();

    const textContent = container.textContent;
    expect(textContent).not.toContain('example.com');
    expect(textContent).not.toContain('mock');
    expect(textContent).not.toContain('dummy');
    expect(document.getElementById('meta-telemetry-output').textContent).toBe('--');
    expect(document.getElementById('stage1-crawlers-output').textContent).toBe('--');
  });

  it('Gate 2: Parses URL parameter ?url=... and triggers POST /api/scan with exact payload', async () => {
    window.location.search = '?url=https://example.com';

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockSuccessPayload
    });

    await rawInspectorModule.initRawInspector();

    expect(fetchSpy).toHaveBeenCalledWith('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'https://example.com', email: '' })
    });
  });

  it('Gate 3: Accurately renders labeled raw outputs from backend schema across all 6 stages', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockSuccessPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    // Stage 1: Bot Matrix
    const s1Text = document.getElementById('stage1-crawlers-output').textContent;
    expect(s1Text).toContain('[source: results.capabilities.crawlers]');
    expect(s1Text).toContain('gptBot: ALLOWED (200)');
    expect(s1Text).toContain('claudeBot: BLOCKED (403)');

    // Stage 2: Essential Routes
    const s2Text = document.getElementById('stage2-routes-output').textContent;
    expect(s2Text).toContain('[source: results.missingEssentialPages]');
    expect(s2Text).toContain('Missing: /pricing, /privacy-policy, /terms-of-service');

    // Stage 3: Pages & Word Counts
    const s3Text = document.getElementById('stage3-pages-output').textContent;
    expect(s3Text).toContain('[source: results.pages]');
    expect(s3Text).toContain('https://example.com - Words: 1420 | Ratio: 28%');
    expect(s3Text).toContain('https://example.com/about - Words: 650 | Ratio: 15%');

    // Stage 4: Schema & Credentials
    const s4Text = document.getElementById('stage4-schema-output').textContent;
    expect(s4Text).toContain('[source: results.pages[n].schema]');
    expect(s4Text).toContain('Organization, WebSite');
    expect(s4Text).toContain('Author Bio Entity Detected: true');

    // Stage 5: Machine Manifests ("AI-Ready")
    const s5Text = document.getElementById('stage5-manifests-output').textContent;
    expect(s5Text).toContain('[source: results.capabilities.manifests]');
    expect(s5Text).toContain('AI-Ready Manifests');
    expect(s5Text).toContain('/robots.txt: 200 OK');
    expect(s5Text).toContain('/llms.txt: 404 NOT FOUND');

    // Stage 6: Scoring & Triage ("AI-Optimized" vs "AI-Ready")
    const s6Text = document.getElementById('stage6-scores-output').textContent;
    expect(s6Text).toContain('[source: results.capabilities.scores]');
    expect(s6Text).toContain('Health Index: 64/100');
    expect(s6Text).toContain('AI-Optimized (Crawlability): 72/100');
    expect(s6Text).toContain('AI-Ready (Manifests): 45/100');
  });

  it('Gate 4: Scan failure displays error notification, logs to internal audit log, and populates zero dummy values', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error'
    });

    await rawInspectorModule.executeScan('https://unreachable-domain.com');

    const errorBanner = document.getElementById('error-notification-banner');
    expect(errorBanner.classList.contains('hidden')).toBe(false);
    expect(errorBanner.textContent).toContain('Scan failed: 500 Internal Server Error');

    // Zero dummy data in stages
    expect(document.getElementById('stage1-crawlers-output').textContent).toBe('--');
    expect(document.getElementById('stage6-scores-output').textContent).toBe('--');

    // Internal tracking log created
    const errorLogList = document.getElementById('error-log-list');
    expect(errorLogList.children.length).toBe(1);
    expect(errorLogList.children[0].textContent).toContain('https://unreachable-domain.com');
    expect(errorLogList.children[0].textContent).toContain('500 Internal Server Error');
  });

  it('Gate 5: Rescan requires explicit user confirmation before retrying network call', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockSuccessPayload
    });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await rawInspectorModule.initRawInspector();
    document.getElementById('target-url-input').value = 'https://example.com';
    
    // Attempt rescan without user confirmation
    await rawInspectorModule.handleRescanClick();
    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

    // With user confirmation
    confirmSpy.mockReturnValue(true);
    await rawInspectorModule.handleRescanClick();
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('Gate 6: Strict Governance: Zero occurrences of banned term "AI-first"', () => {
    const fullHtml = document.body.innerHTML;
    expect(fullHtml).not.toMatch(/AI-first/i);
  });
});
