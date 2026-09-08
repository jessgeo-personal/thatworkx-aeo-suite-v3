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

  it('Gate 9: Correctly maps wrapped backend scan response from server.js (res.json with results envelope)', () => {
    const backendServerPayload = {
      success: true,
      status: 'complete',
      stats: { dailyScansPerformed: 1, dailyHeadlessRunsPerformed: 0, tier: 'AIVisualize Free' },
      results: {
        url: 'https://acme-analytics.io',
        pageDepthCrawled: 3,
        totalPagesFound: 3,
        status: {
          robotsTxtExists: true,
          llmsTxtExists: false,
          aiContextExists: false,
          sitemapExists: true,
          xRobotsIndexable: true,
          botPermissions: {
            gptBot: true,
            perplexityBot: true,
            claudeBot: false,
            googleExtended: false
          },
          jsonLdTypes: ['Organization', 'WebSite']
        },
        pages: [
          {
            route: '/',
            url: 'https://acme-analytics.io/',
            wordCount: 1850,
            contentDensityRatio: 32,
            schema: { detectedTypes: ['Organization', 'WebSite'], hasAuthorBio: false, graphEntities: 2 }
          },
          {
            route: '/about',
            url: 'https://acme-analytics.io/about',
            wordCount: 920,
            contentDensityRatio: 24,
            schema: { detectedTypes: ['AboutPage', 'Person'], hasAuthorBio: true, graphEntities: 2 }
          }
        ],
        missingEssentialPages: ['/pricing', '/privacy-policy', '/terms-of-service'],
        overallScore: 74,
        pillarScores: { P1: 82, P2: 46, P3: 75, P4: 70 },
        alerts: [{ type: 'AI_BOT_BLOCKED', severity: 'warning', message: 'Targeted AI crawler blocks detected for: claudeBot, googleExtended.' }]
      },
      overallScore: 74,
      pillarScores: { P1: 82, P2: 46, P3: 75, P4: 70 }
    };

    const state = mapBackendScanToV4State(backendServerPayload);
    expect(state.meta.targetUrl).toBe('https://acme-analytics.io');
    expect(state.meta.status).toBe('complete');
    expect(state.stage1.crawlers.length).toBeGreaterThanOrEqual(4);
    expect(state.stage1.crawlers.find(c => c.key === 'gptBot')?.allowed).toBe(true);
    expect(state.stage1.crawlers.find(c => c.key === 'claudeBot')?.allowed).toBe(false);
    expect(state.stage2.discoveredCount).toBe(1); // /about
    expect(state.stage2.missingCount).toBe(4);
    expect(state.stage3.pages).toHaveLength(2);
    expect(state.stage3.pages[0].wordCount).toBe(1850);
    expect(state.stage4.detectedTypes).toContain('Organization');
    expect(state.stage4.hasAuthorBio).toBe(true);
    expect(state.stage5.manifests.find(m => m.path === '/robots.txt')?.exists).toBe(true);
    expect(state.stage5.manifests.find(m => m.path === '/llms.txt')?.exists).toBe(false);
    expect(state.stage6.overallHealthIndex).toBe(74);
    expect(state.stage6.aiOptimizedScore).toBe(82);
    expect(state.stage6.aiReadyScore).toBe(70);
  });

  it('Gate 10: Normalizes decimal ratios, bridges headingAudit -> headingCounts, and sets isSchema issue flag', () => {
    const payloadWithDecimals = {
      status: 'completed',
      targetUrl: 'https://acme-analytics.io',
      pages: [
        {
          url: 'https://acme-analytics.io/',
          wordCount: 500,
          textCodeRatio: 0.0588,
          headingAudit: { h1: 1, h2: 3, h3: 2, h4: 0 },
          hasSchema: true,
          schemas: [{ '@type': 'Organization' }]
        },
        {
          url: 'https://acme-analytics.io/sparse',
          wordCount: 150,
          textCodeRatio: 0.02,
          headingAudit: { h1: 0, h2: 0, h3: 0, h4: 0 },
          hasSchema: false,
          schemas: []
        }
      ]
    };

    const state = mapBackendScanToV4State(payloadWithDecimals);
    expect(state.stage3.pages).toHaveLength(2);

    const page1 = state.stage3.pages[0];
    expect(page1.ratio).toBe(5.9);
    expect(page1.headingCounts).toEqual({ h1: 1, h2: 3, h3: 2, h4: 0 });
    expect(page1.isSchema).toBe(false); // Schema exists, so isSchema (missing issue) is false
    expect(page1.status).toBe('WARNING (SPA)');
    expect(page1.color).toBe('bg-red-500');

    const page2 = state.stage3.pages[1];
    expect(page2.ratio).toBe(2);
    expect(page2.headingCounts).toEqual({ h1: 0, h2: 0, h3: 0, h4: 0 });
    expect(page2.isSchema).toBe(true); // Missing schema, so issue flag is true
  });

  it('Gate 11: Suppresses false-positive SPA/DOM warnings and assigns 404 NOT FOUND status on missing routes', () => {
    const payloadWith404 = {
      status: 'completed',
      targetUrl: 'https://thatworkx.com',
      pages: [
        {
          url: 'https://thatworkx.com/terms',
          statusCode: 404,
          is404: true,
          wordCount: 0,
          textCodeRatio: 0
        }
      ]
    };

    const state = mapBackendScanToV4State(payloadWith404);
    expect(state.stage3.pages).toHaveLength(1);

    const page = state.stage3.pages[0];
    expect(page.is404).toBe(true);
    expect(page.status).toBe('404 NOT FOUND');
    expect(page.color).toBe('bg-red-500');
    expect(page.isThin).toBe(false);
    expect(page.isHeavySpa).toBe(false);
    expect(page.isSchema).toBe(false);
    expect(page.gain).toBe('0.00');
  });

  it('Gate 12: Direct Stages Pass-Through - exposes root state.stages and binds stage1-stage6 scores & statuses', () => {
    const mockCanonicalStages = {
      stage1: { score: '100%', status: 'PASS', summaryText: 'Bot Access: 20/20 Verified Unblocked', classification: 'AI-Optimized', allowedCount: 20, totalCount: 20, isWafBlocked: false },
      stage2: { score: '80%', status: 'PASS', summaryText: 'Essential Anchors: 4/5 Verified Routes', classification: 'AI-Optimized', missingRoutes: ['/pricing'] },
      stage3: { score: '50%', status: 'WARN', summaryText: 'Citation Readability: 5/10 High Extractability', classification: 'AI-Optimized', highDensityCount: 5, totalPages: 10, lowRatioCount: 2, thinCount: 3 },
      stage4: { score: '75%', status: 'PASS', summaryText: 'Entity Trust: High Authority & Verified Credentials', classification: 'AI-Optimized', hasAuthorBio: true, hasContactInfo: true, hasPrivacyPolicy: true, isSecure: true },
      stage5: { score: '67%', status: 'WARN', summaryText: 'Machine Manifests: 2/3 Valid Protocols', classification: 'AI-Ready', governanceGate: 'AI-Ready', manifestsFound: 2, totalManifests: 3 },
      stage6: { score: '85%', status: 'PASS', summaryText: 'Executive Triage: 3 Actionable Priorities Identified', classification: 'Executive Boardroom', healthIndex: 85, humanWebReadiness: 23, machineWebReadiness: 21, priorityCount: 3 }
    };

    const payloadWithStages = {
      status: 'complete',
      targetUrl: 'https://acme-analytics.io',
      stages: mockCanonicalStages,
      results: {
        url: 'https://acme-analytics.io',
        stages: mockCanonicalStages,
        pages: [{ url: 'https://acme-analytics.io/', wordCount: 1500 }]
      }
    };

    const state = mapBackendScanToV4State(payloadWithStages);

    // 1. Root state.stages exposure
    expect(state.stages).toBeDefined();
    expect(state.stages.stage1).toEqual(mockCanonicalStages.stage1);
    expect(state.stages.stage2).toEqual(mockCanonicalStages.stage2);
    expect(state.stages.stage3).toEqual(mockCanonicalStages.stage3);
    expect(state.stages.stage4).toEqual(mockCanonicalStages.stage4);
    expect(state.stages.stage5).toEqual(mockCanonicalStages.stage5);
    expect(state.stages.stage6).toEqual(mockCanonicalStages.stage6);

    // 2. Direct binding to state.stage1 .. state.stage6
    expect(state.stage1.score).toBe('100%');
    expect(state.stage1.status).toBe('PASS');
    expect(state.stage1.summaryText).toBe('Bot Access: 20/20 Verified Unblocked');

    expect(state.stage2.score).toBe('80%');
    expect(state.stage2.status).toBe('PASS');
    expect(state.stage2.summaryText).toBe('Essential Anchors: 4/5 Verified Routes');

    // Strict assertion: Stage 3 score MUST match dynamic backend percentage ('50%') and not be undefined, 0%, or hardcoded '85%'
    expect(state.stage3.score).toBe('50%');
    expect(state.stage3.status).toBe('WARN');
    expect(state.stage3.summaryText).toBe('Citation Readability: 5/10 High Extractability');

    expect(state.stage4.score).toBe('75%');
    expect(state.stage4.status).toBe('PASS');
    expect(state.stage4.summaryText).toBe('Entity Trust: High Authority & Verified Credentials');

    expect(state.stage5.score).toBe('67%');
    expect(state.stage5.status).toBe('WARN');
    expect(state.stage5.summaryText).toBe('Machine Manifests: 2/3 Valid Protocols');

    expect(state.stage6.score).toBe('85%');
    expect(state.stage6.status).toBe('PASS');
    expect(state.stage6.summaryText).toBe('Executive Triage: 3 Actionable Priorities Identified');
  });

  it('Gate 13: Coexistence - rich per-page objects, crawlers, and route records are preserved alongside stages', () => {
    const payloadWithPagesAndStages = {
      status: 'complete',
      targetUrl: 'https://thatworkx.com',
      stages: {
        stage1: { score: '95%', status: 'PASS', summaryText: 'Bot Access: 19/20 Verified' },
        stage2: { score: '100%', status: 'PASS', summaryText: 'Essential Anchors: 5/5 Found' },
        stage3: { score: '60%', status: 'WARN', summaryText: 'Citation Readability: 6/10 High Extractability' },
        stage4: { score: '80%', status: 'PASS', summaryText: 'Entity Trust: Strong Authority' },
        stage5: { score: '100%', status: 'PASS', summaryText: 'Machine Manifests: 3/3 Valid' },
        stage6: { score: '90%', status: 'PASS', summaryText: 'Executive Triage: 2 Priorities' }
      },
      results: {
        url: 'https://thatworkx.com',
        status: {
          botPermissions: {
            gptBot: true,
            claudeBot: true,
            ccBot: true,
            perplexityBot: true
          }
        },
        discoveredRoutes: ['/about', '/contact', '/pricing', '/privacy-policy', '/terms-of-service'],
        pages: [
          {
            url: 'https://thatworkx.com/',
            wordCount: 1200,
            textCodeRatio: 0.28,
            canonicalTag: 'https://thatworkx.com/',
            headingAudit: { h1: 1, h2: 4, h3: 2, h4: 1 },
            lastModified: '2026-09-01T00:00:00Z',
            statusCode: 200,
            is404: false
          }
        ]
      }
    };

    const state = mapBackendScanToV4State(payloadWithPagesAndStages);

    // Verify stage scores
    expect(state.stage3.score).toBe('60%');
    expect(state.stage3.status).toBe('WARN');

    // Verify rich per-page objects are preserved intact
    expect(state.stage3.pages).toHaveLength(1);
    const p = state.stage3.pages[0];
    expect(p.ratio).toBe(28);
    expect(p.wordCount).toBe(1200);
    expect(p.is404).toBe(false);
    expect(p.hasCanonical).toBe(true);
    expect(p.headingCounts).toEqual({ h1: 1, h2: 4, h3: 2, h4: 1 });
    expect(p.lastUpdated).toBe('2026-09-01T00:00:00Z');

    // Verify crawlers and canonical routes are preserved
    expect(state.stage1.crawlers.length).toBeGreaterThanOrEqual(4);
    expect(state.stage2.routes).toHaveLength(5);
    expect(state.stage2.discoveredCount).toBe(5);
    expect(state.stage2.missingCount).toBe(0);
  });

  it('Gate 14: Graceful neutral state when un-audited or failed - stages exist with safe defaults and 0% score', () => {
    const unAuditedNull = mapBackendScanToV4State(null);
    expect(unAuditedNull.stages).toBeDefined();
    expect(unAuditedNull.stages.stage1.score).toBe('0%');
    expect(unAuditedNull.stages.stage1.status).toBe('UNAUDITED');
    expect(unAuditedNull.stages.stage3.score).toBe('0%');
    expect(unAuditedNull.stage3.score).toBe('0%');
    expect(unAuditedNull.stage3.status).toBe('UNAUDITED');

    const unAuditedEmpty = mapBackendScanToV4State({});
    expect(unAuditedEmpty.stages).toBeDefined();
    expect(unAuditedEmpty.stage3.score).toBe('0%');
    expect(unAuditedEmpty.stage3.status).toBe('UNAUDITED');

    const failedCrawl = mapBackendScanToV4State({ status: 'failed', error: 'Domain DNS lookup failed' });
    expect(failedCrawl.stages).toBeDefined();
    expect(failedCrawl.stages.stage3.score).toBe('0%');
    expect(failedCrawl.stage3.score).toBe('0%');
    expect(failedCrawl.stage3.status).toBe('UNAUDITED');
  });
});
