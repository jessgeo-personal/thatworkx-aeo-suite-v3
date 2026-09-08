/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Payload Adapter Test Harness (frontend/test-adapter.html & test-adapter.js)', () => {
  let adapterHarnessModule;
  let htmlTemplate;

  // Mock full 20-bot backend payload
  const mockFull20BotBackendPayload = {
    status: 'completed',
    targetUrl: 'https://enterprise-aeo.io',
    timestamp: '2026-09-06T10:00:00Z',
    pages: [
      {
        url: 'https://enterprise-aeo.io/',
        wordCount: 1250,
        textCodeRatio: 0.35,
        schema: {
          detectedTypes: ['Organization', 'WebSite', 'Corporation'],
          hasAuthorBio: false,
          graphEntities: 3
        }
      },
      {
        url: 'https://enterprise-aeo.io/about',
        wordCount: 750,
        textCodeRatio: 0.22,
        schema: {
          detectedTypes: ['AboutPage', 'Person'],
          hasAuthorBio: true,
          graphEntities: 2
        }
      },
      {
        url: 'https://enterprise-aeo.io/contact',
        wordCount: 280,
        textCodeRatio: 0.10,
        schema: {
          detectedTypes: ['ContactPage'],
          hasAuthorBio: false,
          graphEntities: 1
        }
      },
      {
        url: 'https://enterprise-aeo.io/pricing',
        wordCount: 520,
        textCodeRatio: 0.18,
        schema: {
          detectedTypes: ['OfferCatalog'],
          hasAuthorBio: false,
          graphEntities: 1
        }
      }
    ],
    missingEssentialPages: ['/privacy-policy', '/terms-of-service'],
    capabilities: {
      crawlers: {
        gptBot: { allowed: true, status: 200 },
        chatGptUser: { allowed: true, status: 200 },
        oaiSearchBot: { allowed: true, status: 200 },
        claudeBot: { allowed: false, status: 403 },
        claudeWeb: { allowed: false, status: 403 },
        claudeSearchBot: { allowed: false, status: 403 },
        googleExtended: { allowed: true, status: 200 },
        googlebot: { allowed: true, status: 200 },
        bingbot: { allowed: true, status: 200 },
        perplexityBot: { allowed: true, status: 200 },
        applebotExtended: { allowed: true, status: 200 },
        metaExternalAgent: { allowed: false, status: 403 },
        metaWebIndexer: { allowed: true, status: 200 },
        amazonbot: { allowed: true, status: 200 },
        bytespider: { allowed: false, status: 403 },
        ccBot: { allowed: true, status: 200 },
        cohereAi: { allowed: true, status: 200 },
        mistralBot: { allowed: true, status: 200 },
        qwenBot: { allowed: true, status: 200 },
        baiduAnsur: { allowed: false, status: 403 }
      },
      manifests: {
        robotsTxt: { exists: true, status: 200 },
        llmsTxt: { exists: true, status: 200 },
        aiContextMd: { exists: false, status: 404 }
      },
      scores: {
        overallHealthIndex: 84,
        aiOptimizedScore: 23,
        aiReadyScore: 21,
        triageFlags: [
          'Blocked ClaudeBot crawl permissions',
          'Missing machine manifest: /ai-context.md',
          'Missing Essential Routes: /privacy-policy, /terms-of-service'
        ]
      }
    },
    stages: {
      stage1: { score: '80%', status: 'PASS', summaryText: 'Bot Access: 16/20 Verified', classification: 'AI-Optimized' },
      stage2: { score: '60%', status: 'WARN', summaryText: 'Essential Anchors: 3/5 Found', classification: 'AI-Optimized' },
      stage3: { score: '75%', status: 'PASS', summaryText: 'Content Availability: 75% Optimal', classification: 'AI-Optimized' },
      stage4: { score: '90%', status: 'PASS', summaryText: 'Entity Trust: High Authority', classification: 'AI-Optimized' },
      stage5: { score: '67%', status: 'WARN', summaryText: 'Machine Manifests: 2/3 Valid', classification: 'AI-Ready', governanceGate: 'AI-Ready' },
      stage6: { score: '84%', status: 'PASS', summaryText: 'Executive Triage: 3 Priorities', classification: 'Executive Boardroom', healthIndex: 84, humanWebReadiness: 23, machineWebReadiness: 21, priorityCount: 3 }
    }
  };

  beforeEach(async () => {
    const htmlPath = path.join(__dirname, '../test-adapter.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlTemplate;

    delete window.location;
    window.location = new URL('http://localhost:5000/test-adapter');

    adapterHarnessModule = await import('../test-adapter.js');
    adapterHarnessModule.initListeners();
    adapterHarnessModule.resetViewState();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Requirement 1 & 2: Initial neutral state renders un-audited defaults with zero mocks', () => {
    expect(document.getElementById('meta-target-url').textContent).toBe('--');
    expect(document.getElementById('meta-status-badge').textContent).toBe('UNAUDITED');
    expect(document.getElementById('crawl-failure-banner').classList.contains('hidden')).toBe(true);

    expect(document.getElementById('stage1-crawlers-count').textContent).toBe('0 Crawlers');
    expect(document.getElementById('stage2-discovered-count').textContent).toBe('0');
    expect(document.getElementById('stage2-missing-count').textContent).toBe('0');
    expect(document.getElementById('stage3-pages-count').textContent).toBe('0 Pages');
    expect(document.getElementById('stage4-total-entities').textContent).toBe('0');
    expect(document.getElementById('stage4-author-bio-badge').textContent).toContain('Missing');
    expect(document.getElementById('stage5-governance-badge').textContent).toBe('Governance: AI-Ready');
    expect(document.getElementById('stage6-overall-score').textContent).toBe('0');
    expect(document.getElementById('stage6-optimized-score').textContent).toBe('0');
    expect(document.getElementById('stage6-ready-score').textContent).toBe('0');
    expect(document.getElementById('raw-input-json-view').textContent).toBe('--');
    expect(document.getElementById('adapted-output-json-view').textContent).toBe('--');
  });

  it('Requirement 3: Adapts 20 discrete crawler cards across Stage 1', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage1.crawlers).toHaveLength(20);
    expect(document.getElementById('stage1-crawlers-count').textContent).toBe('20 Crawlers');

    const crawlerCards = document.querySelectorAll('.crawler-card');
    expect(crawlerCards.length).toBe(20);

    const gptBotCard = Array.from(crawlerCards).find(c => c.textContent.includes('GPTBot'));
    expect(gptBotCard).toBeDefined();
    expect(gptBotCard.textContent).toContain('gptBot');
    expect(gptBotCard.textContent).toContain('ALLOWED (200)');

    const claudeBotCard = Array.from(crawlerCards).find(c => c.textContent.includes('ClaudeBot'));
    expect(claudeBotCard).toBeDefined();
    expect(claudeBotCard.textContent).toContain('claudeBot');
    expect(claudeBotCard.textContent).toContain('BLOCKED (403)');
  });

  it('Requirement 4: Stage 2 renders 5 discrete essential route cards with discovered/missing counts', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage2.routes).toHaveLength(5);
    expect(document.getElementById('stage2-discovered-count').textContent).toBe('3');
    expect(document.getElementById('stage2-missing-count').textContent).toBe('2');

    const routeCards = document.querySelectorAll('.route-card');
    expect(routeCards.length).toBe(5);

    const aboutCard = Array.from(routeCards).find(c => c.textContent.includes('/about'));
    expect(aboutCard.textContent).toContain('discovered');

    const privacyCard = Array.from(routeCards).find(c => c.textContent.includes('/privacy-policy'));
    expect(privacyCard.textContent).toContain('missing');
  });

  it('Requirement 5: Stage 3 renders itemized page cards with word count, text ratio, and density ratings', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage3.pages).toHaveLength(4);
    expect(document.getElementById('stage3-pages-count').textContent).toBe('4 Pages');

    const pageCards = document.querySelectorAll('.page-card');
    expect(pageCards.length).toBe(4);

    // Page 1: 1250 words -> Optimal
    expect(state.stage3.pages[0].densityRating).toBe('Optimal');
    expect(state.stage3.pages[0].textCodeRatioPercent).toBe(35);
    expect(pageCards[0].textContent).toContain('Optimal');
    expect(pageCards[0].textContent).toContain('1,250');
    expect(pageCards[0].textContent).toContain('35%');

    // Page 2: 750 words -> Moderate
    expect(state.stage3.pages[1].densityRating).toBe('Moderate');
    expect(pageCards[1].textContent).toContain('Moderate');
    expect(pageCards[1].textContent).toContain('750');

    // Page 3: 280 words -> Thin
    expect(state.stage3.pages[2].densityRating).toBe('Thin');
    expect(pageCards[2].textContent).toContain('Thin');
    expect(pageCards[2].textContent).toContain('280');
  });

  it('Requirement 6: Stage 4 renders Schema types, author bio status, and graph entity totals', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage4.hasAuthorBio).toBe(true);
    expect(document.getElementById('stage4-author-bio-badge').textContent).toBe('Author Bio: Verified');
    expect(document.getElementById('stage4-total-entities').textContent).toBe('7');

    const typePills = document.querySelectorAll('.schema-type-pill');
    expect(typePills.length).toBe(7); // Organization, WebSite, Corporation, AboutPage, Person, ContactPage, OfferCatalog
    const pillTexts = Array.from(typePills).map(p => p.textContent);
    expect(pillTexts).toContain('Organization');
    expect(pillTexts).toContain('Person');
  });

  it('Requirement 7: Stage 5 renders AI-Ready classification and 3 discrete machine manifest cards', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage5.governanceGate).toBe('AI-Ready');
    expect(document.getElementById('stage5-governance-badge').textContent).toBe('Governance: AI-Ready');

    const manifestCards = document.querySelectorAll('.manifest-card');
    expect(manifestCards.length).toBe(3);

    const robotsCard = Array.from(manifestCards).find(c => c.textContent.includes('/robots.txt'));
    expect(robotsCard.textContent).toContain('Found (200)');

    const llmsCard = Array.from(manifestCards).find(c => c.textContent.includes('/llms.txt'));
    expect(llmsCard.textContent).toContain('Found (200)');

    const aiContextCard = Array.from(manifestCards).find(c => c.textContent.includes('/ai-context.md'));
    expect(aiContextCard.textContent).toContain('Missing (404)');
  });

  it('Requirement 8: Stage 6 renders dual-pillar scores (AI-Ready mapped from P4) and triage flags', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    expect(state.stage6.overallHealthIndex).toBe(84);
    expect(document.getElementById('stage6-overall-score').textContent).toBe('84');

    expect(state.stage6.aiOptimizedScore).toBe(23);
    expect(document.getElementById('stage6-optimized-score').textContent).toBe('23');

    // Assert strictly mapped to P4 / aiReadyScore
    expect(state.stage6.aiReadyScore).toBe(21);
    expect(document.getElementById('stage6-ready-score').textContent).toBe('21');

    const flagItems = document.querySelectorAll('.triage-flag-item');
    expect(flagItems.length).toBe(3);
    expect(flagItems[0].textContent).toContain('Blocked ClaudeBot crawl permissions');
  });

  it('Requirement 9: Ingests raw JSON via textarea ingestion trigger', () => {
    const textarea = document.getElementById('raw-json-input');
    textarea.value = JSON.stringify(mockFull20BotBackendPayload);

    const ingestBtn = document.getElementById('btn-ingest-json');
    ingestBtn.click();

    expect(document.getElementById('meta-target-url').textContent).toBe('https://enterprise-aeo.io');
    expect(document.getElementById('stage1-crawlers-count').textContent).toBe('20 Crawlers');
    expect(document.getElementById('stage6-overall-score').textContent).toBe('84');
  });

  it('Requirement 10: Crawl failure envelope clamps scores to 0, UNAUDITED status, and displays failure banner', async () => {
    const failedPayload = {
      status: 'failed',
      targetUrl: 'https://unreachable-domain-xyz.com',
      error: 'Target domain could not be resolved or reached (DNS NXDOMAIN)'
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => failedPayload
    });

    const urlInput = document.getElementById('target-url-input');
    urlInput.value = 'https://unreachable-domain-xyz.com';

    await adapterHarnessModule.executeLiveScan();

    expect(document.getElementById('meta-target-url').textContent).toBe('https://unreachable-domain-xyz.com');
    expect(document.getElementById('meta-status-badge').textContent).toBe('UNAUDITED');
    
    const banner = document.getElementById('crawl-failure-banner');
    expect(banner.classList.contains('hidden')).toBe(false);
    expect(document.getElementById('crawl-failure-message').textContent).toContain('DNS NXDOMAIN');

    expect(document.getElementById('stage6-overall-score').textContent).toBe('0');
    expect(document.getElementById('stage6-optimized-score').textContent).toBe('0');
    expect(document.getElementById('stage6-ready-score').textContent).toBe('0');
  });

  it('Requirement 11: Mode toggle switches between Scan and JSON panels', () => {
    const scanPanel = document.getElementById('panel-live-scan');
    const jsonPanel = document.getElementById('panel-json-injection');

    expect(scanPanel.classList.contains('hidden')).toBe(false);
    expect(jsonPanel.classList.contains('hidden')).toBe(true);

    adapterHarnessModule.setMode('json');
    expect(scanPanel.classList.contains('hidden')).toBe(true);
    expect(jsonPanel.classList.contains('hidden')).toBe(false);

    adapterHarnessModule.setMode('scan');
    expect(scanPanel.classList.contains('hidden')).toBe(false);
    expect(jsonPanel.classList.contains('hidden')).toBe(true);
  });

  it('Requirement 13: Renders Canonical 6-Stage Adapter Mapping Verification cards and assertion pills', () => {
    const state = adapterHarnessModule.mapBackendScanToV4State(mockFull20BotBackendPayload);
    adapterHarnessModule.renderAll(mockFull20BotBackendPayload, state);

    // 1. Stage Cards
    const stageCards = document.querySelectorAll('.stage-card');
    expect(stageCards.length).toBe(6);

    const stage1Card = Array.from(stageCards).find(c => c.dataset.stageKey === 'stage1');
    expect(stage1Card).toBeDefined();
    expect(stage1Card.textContent).toContain('80%');
    expect(stage1Card.textContent).toContain('PASS');

    const stage3Card = Array.from(stageCards).find(c => c.dataset.stageKey === 'stage3');
    expect(stage3Card).toBeDefined();
    expect(stage3Card.textContent).toContain('75%');

    // 2. Assertion check pills
    expect(document.querySelector('#assertion-root-stages .assertion-pill').textContent).toBe('VERIFIED');
    expect(document.querySelector('#assertion-stage3-passthrough .assertion-pill').textContent).toBe('VERIFIED');
    expect(document.querySelector('#assertion-pages-coexistence .assertion-pill').textContent).toBe('VERIFIED');

    // 3. JSON dump
    const dumpText = document.getElementById('stages-json-dump').textContent;
    expect(dumpText).toContain('"score": "80%"');
    expect(dumpText).toContain('"score": "75%"');
  });

  it('Requirement 12: Strict Governance Rule: Zero occurrences of banned term "AI-first"', () => {
    const bannedTermRegex = /ai-first/i;
    
    const htmlFile = fs.readFileSync(path.join(__dirname, '../test-adapter.html'), 'utf8');
    const jsFile = fs.readFileSync(path.join(__dirname, '../test-adapter.js'), 'utf8');
    const adapterFile = fs.readFileSync(path.join(__dirname, '../v4PayloadAdapter.js'), 'utf8');

    expect(bannedTermRegex.test(htmlFile)).toBe(false);
    expect(bannedTermRegex.test(jsFile)).toBe(false);
    expect(bannedTermRegex.test(adapterFile)).toBe(false);
  });
});
