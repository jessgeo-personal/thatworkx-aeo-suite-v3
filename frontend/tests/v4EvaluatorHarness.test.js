/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Capability Evaluator Test Harness (frontend/test-evaluator.html)', () => {
  let evaluatorHarnessModule;
  let htmlTemplate;

  // Build full 32-capability mock array
  const mockCapabilityMatrix = Array.from({ length: 32 }, (_, i) => ({
    id: `cap_${i + 1}`,
    section: Math.floor(i / 8) + 1,
    sectionName: `Section ${Math.floor(i / 8) + 1}`,
    name: `Capability Metric ${i + 1}`,
    title: `Capability Metric ${i + 1}`,
    category: `Category ${Math.floor(i / 8) + 1}`,
    description: `Detailed description for capability item ${i + 1}`,
    status: i % 4 === 0 ? 'active' : (i % 4 === 1 ? 'warning' : 'critical'),
    score: 100 - (i * 2),
    details: `Evaluation detail note for capability ${i + 1}`,
    deductionReason: i === 0 ? '🟢 No deductions — All protocols clean.' : `Deduction for rule ${i + 1} (-${i * 2} pts)`,
    impact: `Technical impact of capability ${i + 1} on AI engine crawlability and RAG ingestion.`,
    recommendation: `Actionable recommendation step to resolve capability ${i + 1}.`
  }));

  const mockEvaluatorPayload = {
    success: true,
    service: 'capabilityEvaluator',
    targetUrl: 'https://example.com',
    crawlData: {
      url: 'https://example.com',
      totalPagesFound: 2,
      emailValue: 'contact@example.com',
      phoneValue: '+1-555-0199'
    },
    evaluationData: {
      overallScore: 78,
      pillarScores: {
        P1: 22,
        P2: 18,
        P3: 19,
        P4: 19
      },
      executiveSections: {
        section1: {
          title: 'Can AI see your website?',
          category: 'Gateway & Access',
          score: 22,
          max: 25,
          status: 'active',
          deductions: ['Minor robots.txt delay (-3 pts)'],
          deductionReason: 'Minor robots.txt delay (-3 pts)',
          impact: 'Determines whether edge firewalls, robots.txt, or HTTP headers block search crawlers.'
        },
        section2: {
          title: 'What can AI see?',
          category: 'Presence & Hygiene',
          score: 18,
          max: 25,
          status: 'warning',
          deductions: ['Missing /pricing page (-7 pts)'],
          deductionReason: 'Missing /pricing page (-7 pts)',
          impact: 'Evaluates whether AI crawlers can discover your pages via sitemap.xml.'
        },
        section3: {
          title: 'Does AI trust your web presence?',
          category: 'Content AI-Optimization & Trust',
          score: 19,
          max: 25,
          status: 'active',
          deductions: ['Heading hierarchy skip on /about (-6 pts)'],
          deductionReason: 'Heading hierarchy skip on /about (-6 pts)',
          impact: 'Assesses E-E-A-T authority, metadata quality, heading hierarchy, and reading ease.'
        },
        section4: {
          title: 'Is your website AI-Ready?',
          category: 'Machine Manifest Readiness',
          score: 19,
          max: 25,
          status: 'active',
          deductions: ['Missing /docs.md technical map (-6 pts)'],
          deductionReason: 'Missing /docs.md technical map (-6 pts)',
          impact: 'Verifies presence of machine-readable welcome files for direct RAG ingestion.'
        }
      },
      capabilityMatrix: mockCapabilityMatrix,
      eeatMetrics: {
        isSecure: true,
        hasContactInfo: true,
        hasPrivacyPolicy: true,
        ageEstimate: '6 years 4 months',
        authorityStatus: 'Optimized Anchor',
        diagnosticSummary: 'Domain exhibits strong E-E-A-T trust signals with valid SSL security and verified contact info.'
      },
      emailValue: 'contact@example.com',
      phoneValue: '+1-555-0199',
      discoveredRoutes: [
        {
          path: '/',
          wordCount: 1450,
          tokenLoad: 725,
          inSitemap: true,
          canonicalTag: true,
          headingHierarchy: true,
          missingStatus: 'Active'
        },
        {
          path: '/about',
          wordCount: 620,
          tokenLoad: 310,
          inSitemap: true,
          canonicalTag: false,
          headingHierarchy: false,
          missingStatus: 'Active'
        },
        {
          path: '/contact',
          wordCount: 0,
          tokenLoad: 0,
          inSitemap: false,
          canonicalTag: false,
          headingHierarchy: false,
          missingStatus: 'Missing'
        }
      ],
      manifestPreviews: {
        aiContext: '# AI Context Blueprint\nProduct specifications and brand boundaries.',
        about: '# About Us\nCorporate history and verified leadership credentials.'
      }
    }
  };

  beforeEach(async () => {
    const htmlPath = path.join(__dirname, '../test-evaluator.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlTemplate;

    delete window.location;
    window.location = new URL('http://localhost:3000/test-evaluator.html');

    evaluatorHarnessModule = await import('../test-evaluator.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('Gate 1: Pre-probe initial state shows neutral idle display with clean placeholders', () => {
    evaluatorHarnessModule.initEvaluatorHarness();

    expect(document.getElementById('metric-overall-score').textContent).toBe('--');
    expect(document.getElementById('metric-p1-score').textContent).toBe('--');
    expect(document.getElementById('metric-p2-score').textContent).toBe('--');
    expect(document.getElementById('metric-p3-score').textContent).toBe('--');
    expect(document.getElementById('metric-p4-score').textContent).toBe('--');
    expect(document.getElementById('eeat-email-value').textContent).toBe('--');
    expect(document.getElementById('eeat-phone-value').textContent).toBe('--');
    expect(document.getElementById('evaluator-error-banner').classList.contains('hidden')).toBe(true);
  });

  it('Gate 2: Renders all 4 pillar scores and all 4 executive inquiry cards from evaluation data', () => {
    evaluatorHarnessModule.renderEvaluatorData(mockEvaluatorPayload, 'https://example.com');

    // Pillar scores
    expect(document.getElementById('metric-overall-score').textContent).toBe('78');
    expect(document.getElementById('metric-p1-score').textContent).toBe('22');
    expect(document.getElementById('metric-p2-score').textContent).toBe('18');
    expect(document.getElementById('metric-p3-score').textContent).toBe('19');
    expect(document.getElementById('metric-p4-score').textContent).toBe('19');

    // 4 Executive inquiry cards
    const execContainer = document.getElementById('executive-inquiries-container');
    const execCards = execContainer.querySelectorAll('[data-executive-section]');
    expect(execCards.length).toBe(4);

    expect(execCards[0].textContent).toContain('Can AI see your website?');
    expect(execCards[0].textContent).toContain('Gateway & Access');
    expect(execCards[0].textContent).toContain('22');

    expect(execCards[1].textContent).toContain('What can AI see?');
    expect(execCards[1].textContent).toContain('Presence & Hygiene');
    expect(execCards[1].textContent).toContain('Missing /pricing page');

    expect(execCards[2].textContent).toContain('Does AI trust your web presence?');
    expect(execCards[3].textContent).toContain('Is your website AI-Ready?');
  });

  it('Gate 3: Renders all 32 capability cards without truncation', () => {
    evaluatorHarnessModule.renderEvaluatorData(mockEvaluatorPayload, 'https://example.com');

    const capContainer = document.getElementById('capability-matrix-container');
    const capCards = capContainer.querySelectorAll('[data-capability-id]');
    expect(capCards.length).toBe(32);

    expect(document.getElementById('capability-count-badge').textContent).toContain('32 Capabilities');

    // Check first and last capabilities
    const firstCap = capContainer.querySelector('[data-capability-id="cap_1"]');
    expect(firstCap).not.toBeNull();
    expect(firstCap.textContent).toContain('Capability Metric 1');
    expect(firstCap.textContent).toContain('Technical Impact:');
    expect(firstCap.textContent).toContain('Actionable Recommendation:');

    const lastCap = capContainer.querySelector('[data-capability-id="cap_32"]');
    expect(lastCap).not.toBeNull();
    expect(lastCap.textContent).toContain('Capability Metric 32');
  });

  it('Gate 4: Displays extracted E-E-A-T contact values and trust coordinates', () => {
    evaluatorHarnessModule.renderEvaluatorData(mockEvaluatorPayload, 'https://example.com');

    expect(document.getElementById('eeat-email-value').textContent).toBe('contact@example.com');
    expect(document.getElementById('eeat-phone-value').textContent).toBe('+1-555-0199');
    expect(document.getElementById('eeat-ssl-status').textContent).toContain('ENABLED (HTTPS)');
    expect(document.getElementById('eeat-authority-badge').textContent).toBe('Optimized Anchor');
    expect(document.getElementById('eeat-contact-status').textContent).toContain('YES');
    expect(document.getElementById('eeat-privacy-status').textContent).toContain('YES');
    expect(document.getElementById('eeat-domain-age').textContent).toBe('6 years 4 months');
    expect(document.getElementById('eeat-diagnostic-summary').textContent).toContain('Domain exhibits strong E-E-A-T trust signals');
  });

  it('Gate 5: Renders evaluated route cards displaying path, word count, and token load', () => {
    evaluatorHarnessModule.renderEvaluatorData(mockEvaluatorPayload, 'https://example.com');

    const routesContainer = document.getElementById('evaluated-routes-container');
    const routeCards = routesContainer.querySelectorAll('[data-route-path]');
    expect(routeCards.length).toBe(3);

    // Route 1
    const r1 = routeCards[0];
    expect(r1.textContent).toContain('/');
    expect(r1.textContent).toContain('1,450');
    expect(r1.textContent).toContain('725');
    expect(r1.textContent).toContain('In Sitemap');
    expect(r1.textContent).toContain('Canonical');
    expect(r1.textContent).toContain('Hierarchy Valid');

    // Route 3 (missing)
    const r3 = routeCards[2];
    expect(r3.textContent).toContain('/contact');
    expect(r3.textContent).toContain('Missing');

    // Manifest previews
    expect(document.getElementById('preview-ai-context').textContent).toContain('# AI Context Blueprint');
    expect(document.getElementById('preview-about').textContent).toContain('# About Us');
  });

  it('Gate 6: Handles HTTP 422 crawl failures cleanly by displaying error banner', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        service: 'capabilityEvaluator',
        error: 'Target domain could not be reached'
      })
    });

    await evaluatorHarnessModule.runEvaluatorProbe('https://unreachable-site-xyz.org');

    expect(fetchSpy).toHaveBeenCalledWith('/api/test/evaluator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'https://unreachable-site-xyz.org', maxPages: 25 })
    });

    const errorBanner = document.getElementById('evaluator-error-banner');
    expect(errorBanner.classList.contains('hidden')).toBe(false);
    expect(document.getElementById('evaluator-error-message').textContent).toContain('Target domain could not be reached');
  });

  it('Gate 7: Strict Governance: Zero occurrences of banned vocabulary "AI-first"', () => {
    expect(htmlTemplate).not.toMatch(/AI-first/i);
    const renderedBody = document.body.innerHTML;
    expect(renderedBody).not.toMatch(/AI-first/i);
  });
});
