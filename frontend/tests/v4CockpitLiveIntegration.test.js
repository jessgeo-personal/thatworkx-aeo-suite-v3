/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Diagnostic Cockpit Live Backend Integration (Phase 3 RED)', () => {
  let cockpitModule;

  const mockScanPayload = {
    status: 'completed',
    targetUrl: 'https://acme-corp.ai',
    timestamp: '2026-09-04T12:00:00Z',
    pages: [
      {
        url: 'https://acme-corp.ai/',
        wordCount: 1650,
        textCodeRatio: 0.31,
        schema: {
          detectedTypes: ['Organization', 'WebSite'],
          hasAuthorBio: false,
          graphEntities: 2
        }
      },
      {
        url: 'https://acme-corp.ai/about',
        wordCount: 780,
        textCodeRatio: 0.22,
        schema: {
          detectedTypes: ['AboutPage', 'Person'],
          hasAuthorBio: true,
          graphEntities: 2
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
        overallHealthIndex: 71,
        aiOptimizedScore: 78,
        aiReadyScore: 48,
        triageFlags: [
          'Missing machine manifest /llms.txt',
          'ClaudeBot crawling access denied'
        ]
      }
    }
  };

  beforeEach(async () => {
    // Load static HTML structure from visualize.html
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;

    // Ensure error notification banner exists in DOM
    if (!document.getElementById('cockpit-error-banner')) {
      const banner = document.createElement('div');
      banner.id = 'cockpit-error-banner';
      banner.className = 'hidden';
      document.body.prepend(banner);
    }

    // Reset location
    delete window.location;
    window.location = new URL('http://localhost:3000/visualize.html');

    // Import live cockpit module
    cockpitModule = await import('../visualize.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.innerHTML = '';
  });

  it('Gate 1: Pre-scan un-audited state displays neutral placeholders without static mock strings', () => {
    // When no URL query parameter is supplied
    cockpitModule.initCockpit();

    const targetUrlDisplay = document.querySelector('.cockpit-domain-display, #current-target-domain');
    if (targetUrlDisplay) {
      expect(targetUrlDisplay.textContent).toMatch(/--|UNAUDITED|Enter domain/i);
      expect(targetUrlDisplay.textContent).not.toContain('thatworkx.com');
    }

    // Health score must be zero or neutral placeholder, not mock 84
    const healthScoreEl = document.querySelector('.health-score-value, #health-score');
    if (healthScoreEl) {
      expect(healthScoreEl.textContent).toMatch(/--|0/);
      expect(healthScoreEl.textContent).not.toBe('84');
    }
  });

  it('Gate 2: Parses URL parameter ?url=... and calls POST /api/scan with exact body', async () => {
    window.location.search = '?url=https://acme-corp.ai';

    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScanPayload
    });

    await cockpitModule.initCockpit();

    expect(fetchSpy).toHaveBeenCalledWith('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'https://acme-corp.ai', email: '' })
    });
  });

  it('Gate 3: Dynamically maps Stage 1–6 live backend metrics into V4 cockpit DOM', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScanPayload
    });

    await cockpitModule.executeCockpitScan('https://acme-corp.ai');

    // Dual-Pillar Scores & Health Index
    const healthScore = document.querySelector('.health-score-value, #health-score');
    expect(healthScore.textContent).toContain('71');

    const aiOptimizedCard = document.querySelector('#ai-optimized-score, .score-optimized');
    if (aiOptimizedCard) {
      expect(aiOptimizedCard.textContent).toContain('78');
    }

    const aiReadyCard = document.querySelector('#ai-ready-score, .score-ready');
    if (aiReadyCard) {
      expect(aiReadyCard.textContent).toContain('48');
    }

    // Stage 1 Bot Permissions
    const stage1Container = document.querySelector('#stage-1, [data-stage="1"]');
    expect(stage1Container.textContent).toContain('GPTBot');
    expect(stage1Container.textContent).toContain('ClaudeBot');

    // Stage 2 Missing Routes
    const stage2Container = document.querySelector('#stage-2, [data-stage="2"]');
    expect(stage2Container.textContent).toContain('/pricing');
    expect(stage2Container.textContent).toContain('/privacy-policy');

    // Stage 3 Crawled Pages & Semantic Density
    const stage3Container = document.querySelector('#stage-3, [data-stage="3"]');
    expect(stage3Container.textContent).toContain('https://acme-corp.ai/');
    expect(stage3Container.textContent).toContain('1650');

    // Stage 5 Manifests under AI-Ready Governance Gate
    const stage5Container = document.querySelector('#stage-5, [data-stage="5"]');
    expect(stage5Container.textContent).toContain('AI-Ready');
    expect(stage5Container.textContent).toContain('/robots.txt');
    expect(stage5Container.textContent).toContain('/llms.txt');
  });

  it('Gate 4: Unreachable host triggers error banner, logs to error tracker, and displays zero fallback values', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 502,
      statusText: 'Bad Gateway'
    });

    await cockpitModule.executeCockpitScan('https://broken-domain.org');

    const errorBanner = document.getElementById('cockpit-error-banner');
    expect(errorBanner.classList.contains('hidden')).toBe(false);
    expect(errorBanner.textContent).toContain('502 Bad Gateway');

    // Quality Error Log must register the failure
    const errorLogs = cockpitModule.getCockpitErrorLogs();
    expect(errorLogs.length).toBeGreaterThanOrEqual(1);
    expect(errorLogs[errorLogs.length - 1].targetUrl).toBe('https://broken-domain.org');

    // Cockpit must show neutral defaults, not mock data
    const healthScore = document.querySelector('.health-score-value, #health-score');
    expect(healthScore.textContent).toMatch(/--|0/);
    expect(healthScore.textContent).not.toBe('84');
  });

  it('Gate 5: Rescan button requests explicit user confirmation before executing fetch', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScanPayload
    });

    const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);

    await cockpitModule.initCockpit();
    await cockpitModule.handleCockpitRescan();

    expect(confirmSpy).toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();

    confirmSpy.mockReturnValue(true);
    await cockpitModule.handleCockpitRescan();

    expect(fetchSpy).toHaveBeenCalled();
  });

  it('Gate 6: DOM Pre-rendering & Governance Gate: Static FAQ pre-rendered and zero "AI-first" terms', () => {
    const fullHtml = document.documentElement.innerHTML;

    // Pre-rendering Gate: FAQ accordions must remain static in HTML
    expect(fullHtml).toContain('faq-accordion');

    // Banned Terms Gate
    expect(fullHtml).not.toMatch(/AI-first/i);
  });
});
