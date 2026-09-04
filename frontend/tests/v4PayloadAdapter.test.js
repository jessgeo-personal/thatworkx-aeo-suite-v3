import { describe, it, expect } from 'vitest';
import { mapBackendScanToV4State } from '../v4PayloadAdapter.js';

describe('V4 Payload Normalizer & Stage Adapter (Phase 2 RED)', () => {
  const mockBackendPayload = {
    status: 'completed',
    targetUrl: 'https://acme-analytics.io',
    timestamp: '2026-09-04T12:00:00Z',
    pages: [
      {
        url: 'https://acme-analytics.io/',
        wordCount: 1850,
        textCodeRatio: 0.32,
        schema: {
          detectedTypes: ['Organization', 'WebSite', 'SoftwareApplication'],
          hasAuthorBio: false,
          graphEntities: 3
        }
      },
      {
        url: 'https://acme-analytics.io/about',
        wordCount: 920,
        textCodeRatio: 0.24,
        schema: {
          detectedTypes: ['AboutPage', 'Person'],
          hasAuthorBio: true,
          graphEntities: 2
        }
      },
      {
        url: 'https://acme-analytics.io/contact',
        wordCount: 310,
        textCodeRatio: 0.12,
        schema: {
          detectedTypes: ['ContactPage'],
          hasAuthorBio: false,
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
        overallHealthIndex: 68,
        aiOptimizedScore: 76,
        aiReadyScore: 42,
        triageFlags: [
          'Missing /llms.txt manifest',
          'Blocked ClaudeBot crawl permissions',
          'Missing Essential Route: /pricing'
        ]
      }
    }
  };

  it('Gate 1: Null or empty payloads produce graceful un-audited defaults with zero dummy data', () => {
    const defaultState = mapBackendScanToV4State(null);

    expect(defaultState.meta.targetUrl).toBe('--');
    expect(defaultState.meta.status).toBe('UNAUDITED');
    expect(defaultState.stage1.crawlers).toHaveLength(0);
    expect(defaultState.stage2.routes).toHaveLength(0);
    expect(defaultState.stage3.pages).toHaveLength(0);
    expect(defaultState.stage4.detectedTypes).toHaveLength(0);
    expect(defaultState.stage4.hasAuthorBio).toBe(false);
    expect(defaultState.stage5.manifests).toHaveLength(0);
    expect(defaultState.stage6.overallHealthIndex).toBe(0);
    expect(defaultState.stage6.aiOptimizedScore).toBe(0);
    expect(defaultState.stage6.aiReadyScore).toBe(0);
  });

  it('Gate 2: Stage 1 maps crawler bots to 3D Radar matrix entries with normalized status and icons', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage1.crawlers).toHaveLength(5);

    const gptBot = state.stage1.crawlers.find((c) => c.key === 'gptBot');
    expect(gptBot).toBeDefined();
    expect(gptBot.name).toBe('GPTBot');
    expect(gptBot.allowed).toBe(true);
    expect(gptBot.statusText).toBe('ALLOWED (200)');

    const claudeBot = state.stage1.crawlers.find((c) => c.key === 'claudeBot');
    expect(claudeBot).toBeDefined();
    expect(claudeBot.name).toBe('ClaudeBot');
    expect(claudeBot.allowed).toBe(false);
    expect(claudeBot.statusText).toBe('BLOCKED (403)');
  });

  it('Gate 3: Stage 2 maps discovered vs missing canonical routes', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage2.routes).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ route: '/about', status: 'discovered' }),
        expect.objectContaining({ route: '/contact', status: 'discovered' }),
        expect.objectContaining({ route: '/pricing', status: 'missing' }),
        expect.objectContaining({ route: '/privacy-policy', status: 'missing' }),
        expect.objectContaining({ route: '/terms-of-service', status: 'missing' })
      ])
    );
    expect(state.stage2.missingCount).toBe(3);
    expect(state.stage2.discoveredCount).toBe(2);
  });

  it('Gate 4: Stage 3 maps crawled pages, semantic word counts, text-code ratio, and density flags', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage3.pages).toHaveLength(3);
    const homePage = state.stage3.pages[0];
    expect(homePage.url).toBe('https://acme-analytics.io/');
    expect(homePage.wordCount).toBe(1850);
    expect(homePage.textCodeRatioPercent).toBe(32);
    expect(homePage.densityRating).toBe('Optimal');

    const contactPage = state.stage3.pages[2];
    expect(contactPage.wordCount).toBe(310);
    expect(contactPage.textCodeRatioPercent).toBe(12);
    expect(contactPage.densityRating).toBe('Thin');
  });

  it('Gate 5: Stage 4 aggregates Schema.org JSON-LD graph entities and verifies Author E-E-A-T credentials', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage4.detectedTypes).toEqual(
      expect.arrayContaining(['Organization', 'WebSite', 'SoftwareApplication', 'AboutPage', 'Person', 'ContactPage'])
    );
    expect(state.stage4.hasAuthorBio).toBe(true);
    expect(state.stage4.totalGraphEntities).toBe(6);
  });

  it('Gate 6: Stage 5 maps machine manifest status strictly under the "AI-Ready" governance gate', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage5.governanceGate).toBe('AI-Ready');
    expect(state.stage5.manifests).toEqual([
      { path: '/robots.txt', exists: true, status: 200, label: 'Robots Directive' },
      { path: '/llms.txt', exists: false, status: 404, label: 'LLM Manifest' },
      { path: '/ai-context.md', exists: false, status: 404, label: 'AI Context Spec' }
    ]);
  });

  it('Gate 7: Stage 6 enforces Dual-Pillar scoring ("AI-Optimized" vs "AI-Ready") and triage flags', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);

    expect(state.stage6.overallHealthIndex).toBe(68);
    expect(state.stage6.aiOptimizedScore).toBe(76);
    expect(state.stage6.aiReadyScore).toBe(42);
    expect(state.stage6.triageFlags).toHaveLength(3);
    expect(state.stage6.triageFlags[0]).toBe('Missing /llms.txt manifest');
  });

  it('Gate 8: Strict Governance: Zero occurrences of banned term "AI-first"', () => {
    const state = mapBackendScanToV4State(mockBackendPayload);
    const serialized = JSON.stringify(state);

    expect(serialized).not.toMatch(/AI-first/i);
  });
});
