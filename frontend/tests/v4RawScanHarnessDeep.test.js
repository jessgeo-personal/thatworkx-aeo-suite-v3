/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Raw Scan Deep Inspection Harness (Strict BDD RED Phase)', () => {
  let container;
  let rawInspectorModule;

  // Realistic Scenario A wrapped payload reflecting live crawlerService & capabilityEvaluator output
  const mockScenarioAPayload = {
    results: {
      status: 'completed',
      targetUrl: 'https://example.com',
      timestamp: '2026-09-04T12:00:00Z',
      pages: [
        {
          url: 'https://example.com',
          wordCount: 1420,
          textCodeRatio: 0.28,
          title: 'Example Homepage',
          description: 'A leading tech company',
          headings: { h1: ['Welcome'], h2: ['Features', 'About Us'], h3: [] },
          content: 'This is the full scraped text content of the homepage...',
          markdown: '# Welcome\n\nThis is the markdown version of the homepage content.\n\n## Features',
          schema: {
            detectedTypes: ['Organization', 'WebSite'],
            hasAuthorBio: false,
            graphEntities: 2,
            rawJsonLd: [{ '@type': 'Organization', name: 'Example Corp' }]
          },
          eeat: {
            hasAuthorBio: false,
            trustSignals: ['SSL Enabled', 'Physical Address']
          }
        },
        {
          url: '/about', // Relative path to test defensive normalization
          wordCount: 650,
          textCodeRatio: 0.18,
          title: 'About Example Corp',
          content: 'About page full text content detailing company history...',
          markdown: '# About Us\n\nFounded in 2020...',
          schema: {
            detectedTypes: ['AboutPage', 'Person'],
            hasAuthorBio: true,
            author: { name: 'Jane Doe', title: 'Founder' }
          },
          eeat: {
            hasAuthorBio: true,
            trustSignals: ['Author Bio', 'Executive Team']
          }
        }
      ],
      missingEssentialPages: ['/pricing', '/privacy-policy', '/terms-of-service'],
      capabilities: {
        crawlerRadar: { // Alternative key testing
          gptBot: { allowed: true, status: 200, latencyMs: 120 },
          claudeBot: { allowed: true, status: 200, latencyMs: 95 },
          ccBot: { allowed: true, status: 200 },
          perplexityBot: { allowed: true, status: 200 },
          googleExtended: { allowed: false, status: 403, matchedDirective: 'Disallow: /' }
        },
        manifests: {
          robotsTxt: { exists: true, status: 200, path: 'robots.txt' },
          sitemapXml: { exists: true, status: 200, path: 'sitemap.xml', sizeBytes: 4096 },
          llmsTxt: { exists: false, status: 404, path: 'llms.txt' },
          aiContextMd: { exists: false, status: 404, path: 'ai-context.md' },
          securityTxt: { exists: true, status: 200, path: '.well-known/security.txt' }
        },
        scores: {
          overallHealthIndex: 74,
          aiOptimizedScore: 82,
          aiReadyScore: 46,
          crawlabilityScore: 88,
          contentQualityScore: 78,
          schemaScore: 70,
          manifestScore: 40,
          eeatScore: 65,
          triageFlags: [
            'Missing machine manifest /llms.txt',
            'Missing essential legal compliance pages: /privacy-policy, /terms-of-service'
          ]
        }
      }
    }
  };

  beforeEach(async () => {
    // Physical file assertion: ensure test-raw-scan.html is not an in-memory phantom
    const htmlPath = path.resolve(__dirname, '../test-raw-scan.html');
    expect(fs.existsSync(htmlPath)).toBe(true);

    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
    container = document.getElementById('raw-inspector-app');

    delete window.location;
    window.location = new URL('http://localhost:3000/test-raw-scan.html');

    rawInspectorModule = await import('../test-raw-scan.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.documentElement.innerHTML = '';
  });

  it('Gate 1: Pre-scan idle state renders neutral defaults without crashing', () => {
    rawInspectorModule.initRawInspector();
    expect(document.getElementById('meta-telemetry-output').textContent).toBe('--');
    expect(document.getElementById('stage1-crawlers-output').textContent).toBe('--');
    expect(document.getElementById('stage3-pages-output').textContent).toBe('--');
  });

  it('Gate 2: Stage 1 parses crawlerRadar / alternate keys and renders all evaluated bots without returning count 0', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s1Text = document.getElementById('stage1-crawlers-output').textContent;
    expect(s1Text).not.toContain('Evaluated Bots Count: 0');
    expect(s1Text).toContain('Evaluated Bots Count: 5');
    expect(s1Text).toContain('gptBot: ALLOWED (200)');
    expect(s1Text).toContain('googleExtended: BLOCKED (403)');

    // Stage 1 raw JSON drawer must be populated
    const s1Json = document.getElementById('stage1-crawlers-json').textContent;
    expect(s1Json).toContain('"gptBot"');
  });

  it('Gate 3: Stage 2 safely extracts relative paths without throwing toLowerCase errors', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s2Text = document.getElementById('stage2-routes-output').textContent;
    expect(s2Text).toContain('Discovered Essential Routes (1): /about');
    expect(s2Text).toContain('Missing: /pricing, /privacy-policy, /terms-of-service');
  });

  it('Gate 4: Stage 3 displays scraped body copy, page fields, and LLM markdown blocks', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s3Text = document.getElementById('stage3-pages-output').textContent;
    expect(s3Text).toContain('[SCRAPED PLAIN-TEXT CONTENT PREVIEW]:');
    expect(s3Text).toContain('This is the full scraped text content');
    expect(s3Text).toContain('[LLM MARKDOWN VERSION]:');
    expect(s3Text).toContain('# Welcome');
  });

  it('Gate 5: Stage 4 renders JSON-LD types, author credentials, and E-E-A-T signals', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s4Text = document.getElementById('stage4-schema-output').textContent;
    expect(s4Text).toContain('Organization, WebSite, AboutPage, Person');
    expect(s4Text).toContain('Author Bio Entity Detected: true');
    expect(s4Text).toContain('Jane Doe');
    expect(s4Text).toContain('SSL Enabled');
  });

  it('Gate 6: Stage 5 renders all manifest files under manifest hierarchy', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s5Text = document.getElementById('stage5-manifests-output').textContent;
    expect(s5Text).toContain('/robots.txt: 200 OK');
    expect(s5Text).toContain('/sitemap.xml: 200 OK');
    expect(s5Text).toContain('/llms.txt: 404 NOT FOUND');
    expect(s5Text).toContain('/.well-known/security.txt: 200 OK');
  });

  it('Gate 7: Stage 6 renders composite scores, sub-pillar breakdown, and triage flags', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockScenarioAPayload
    });

    await rawInspectorModule.executeScan('https://example.com');

    const s6Text = document.getElementById('stage6-scores-output').textContent;
    expect(s6Text).toContain('Health Index: 74/100');
    expect(s6Text).toContain('AI-Optimized (Crawlability): 82/100');
    expect(s6Text).toContain('AI-Ready (Manifests): 46/100');
    expect(s6Text).toContain('Crawlability Index: 88/100');
    expect(s6Text).toContain('Missing machine manifest /llms.txt');
  });

  it('Gate 8: Error handling creates log entry without populating dummy data', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Crawler Error'
    });

    await rawInspectorModule.executeScan('https://failed-site.org');

    const banner = document.getElementById('error-notification-banner');
    expect(banner.classList.contains('hidden')).toBe(false);
    expect(banner.textContent).toContain('500 Internal Crawler Error');

    expect(document.getElementById('stage1-crawlers-output').textContent).toBe('--');
    expect(document.getElementById('stage6-scores-output').textContent).toBe('--');

    const logList = document.getElementById('error-log-list');
    expect(logList.children.length).toBe(1);
    expect(logList.children[0].textContent).toContain('https://failed-site.org');
  });

  it('Gate 9: Banned Terms Gate: Zero occurrences of "AI-first"', () => {
    const fullHtml = document.documentElement.innerHTML;
    expect(fullHtml).not.toMatch(/AI-first/i);
  });
});
