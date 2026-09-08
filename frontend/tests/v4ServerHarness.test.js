/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Server Scan Pipeline Test Harness (frontend/test-server.html)', () => {
  let serverHarnessModule;
  let htmlTemplate;

  const mockStandard200Payload = {
    success: true,
    status: 'complete',
    stats: {
      dailyScansPerformed: 3,
      dailyHeadlessRunsPerformed: 1,
      tier: 'AIVisualize Free'
    },
    results: {
      url: 'https://example.com',
      totalPagesFound: 12,
      pageDepthCrawled: 12,
      status: {
        robotsTxtExists: true,
        llmsTxtExists: true,
        aiContextExists: true
      },
      pages: [
        { route: '/', wordCount: 1420 },
        { route: '/about', wordCount: 650 }
      ],
      discoveredRoutes: ['/', '/about', '/pricing']
    },
    overallScore: 82,
    pillarScores: {
      P1: 23,
      P2: 20,
      P3: 19,
      P4: 20
    },
    executiveSections: {
      section1: { title: 'Can AI see your website?', status: 'active', score: 23, max: 25 },
      section2: { title: 'What can AI see?', status: 'active', score: 20, max: 25 },
      section3: { title: 'Does AI trust your web presence?', status: 'active', score: 19, max: 25 },
      section4: { title: 'Is your website AI-Ready?', status: 'active', score: 20, max: 25 }
    },
    capabilityMatrix: Array.from({ length: 32 }, (_, i) => ({
      id: `cap_${i + 1}`,
      name: `Capability ${i + 1}`,
      score: 85,
      status: 'active'
    })),
    stages: {
      stage1: { score: '100%', status: 'PASS', summaryText: 'Bot Access: 20/20 Verified' },
      stage2: { score: '80%', status: 'PASS', summaryText: 'Essential Anchors: 4/5 Found' },
      stage3: { score: '75%', status: 'WARN', summaryText: 'Content Availability: 75% Coverage' },
      stage4: { score: '90%', status: 'PASS', summaryText: 'Entity Trust: High Authority' },
      stage5: { score: '60%', status: 'WARN', summaryText: 'Manifest Hierarchy: Partial' },
      stage6: { score: '85%', status: 'PASS', summaryText: 'Action Plan: 3 Priorities' }
    }
  };

  mockStandard200Payload.results.stages = mockStandard200Payload.stages;

  const mockQueued202Payload = {
    status: 'queued',
    jobId: 'job_1725612345_abc123'
  };

  const mockDeepProcessingPayload = {
    success: true,
    status: 'processing_remainder',
    jobId: 'job_1725699999_deep456',
    stats: {
      dailyScansPerformed: 4,
      dailyHeadlessRunsPerformed: 1,
      tier: 'AIOptimize Pro'
    },
    results: {
      url: 'https://example-deep.com',
      totalPagesFound: 45,
      pageDepthCrawled: 25,
      pages: Array.from({ length: 25 }, (_, i) => ({ route: `/page-${i + 1}`, wordCount: 800 })),
      discoveredRoutes: Array.from({ length: 45 }, (_, i) => `/page-${i + 1}`)
    },
    overallScore: 75,
    pillarScores: { P1: 20, P2: 18, P3: 18, P4: 19 },
    executiveSections: {
      section1: { title: 'Can AI see your website?', status: 'active', score: 20, max: 25 },
      section4: { title: 'Is your website AI-Ready?', status: 'active', score: 19, max: 25 }
    },
    capabilityMatrix: Array.from({ length: 32 }, (_, i) => ({ id: `cap_${i + 1}` }))
  };

  beforeEach(async () => {
    vi.useFakeTimers();
    const htmlPath = path.join(__dirname, '../test-server.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlTemplate;

    delete window.location;
    window.location = new URL('http://localhost:3000/test-server.html');

    serverHarnessModule = await import('../test-server.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
    document.body.innerHTML = '';
  });

  it('Gate 1: Initial state shows neutral idle telemetry and unchecked contract checklist', () => {
    serverHarnessModule.initServerHarness();

    expect(document.getElementById('metric-http-status').textContent).toBe('--');
    expect(document.getElementById('metric-response-status').textContent).toBe('--');
    expect(document.getElementById('metric-daily-scans').textContent).toBe('--');
    expect(document.getElementById('server-error-container').classList.contains('hidden')).toBe(true);
    expect(document.getElementById('queue-monitor-container').classList.contains('hidden')).toBe(true);

    const overallPill = document.querySelector('#contract-overall-score .status-pill');
    expect(overallPill.textContent).toBe('UNCHECKED');
  });

  it('Gate 2: Renders 200 OK standard scan envelope with stats, telemetry, and contract validation', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => mockStandard200Payload
    });

    await serverHarnessModule.executeServerScan('https://example.com', 'standard');

    // Telemetry assertions
    expect(document.getElementById('metric-http-status').textContent).toBe('200');
    expect(document.getElementById('metric-response-status').textContent).toBe('complete');
    expect(document.getElementById('metric-target-url').textContent).toBe('https://example.com');
    expect(document.getElementById('metric-daily-scans').textContent).toBe('3');
    expect(document.getElementById('metric-headless-runs').textContent).toBe('1');
    expect(document.getElementById('metric-user-tier').textContent).toBe('AIVisualize Free');

    // Contract checklist assertions
    expect(document.querySelector('#contract-overall-score .status-pill').textContent).toBe('VALID');
    expect(document.querySelector('#contract-pillar-scores .status-pill').textContent).toBe('VALID');
    expect(document.querySelector('#contract-executive-sections .status-pill').textContent).toBe('VALID');
    expect(document.querySelector('#contract-capability-matrix .status-pill').textContent).toBe('VALID');
    expect(document.querySelector('#contract-results-object .status-pill').textContent).toBe('VALID');
    expect(document.querySelector('#contract-root-stages .status-pill').textContent).toBe('VERIFIED');
    expect(document.querySelector('#contract-envelope-stages .status-pill').textContent).toBe('VERIFIED');
    expect(document.querySelector('#contract-stage3-score .status-pill').textContent).toBe('75%');

    // Transmitted stage cards assertions
    const stageCards = document.querySelectorAll('#stages-cards-container [data-stage-key]');
    expect(stageCards.length).toBe(6);
    expect(document.getElementById('stages-json-dump').textContent).toContain('100%');
  });

  it('Gate 3: Handles 202 Accepted queued job response and triggers polling cycle', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch')
      // Initial scan POST
      .mockResolvedValueOnce({
        ok: true,
        status: 202,
        json: async () => mockQueued202Payload
      })
      // Polling GET 1
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobId: 'job_1725612345_abc123',
          status: 'processing',
          pagesCompleted: 5,
          totalQueued: 20,
          results: [{ route: '/page-1', wordCount: 500 }]
        })
      })
      // Polling GET 2 (complete)
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({
          jobId: 'job_1725612345_abc123',
          status: 'complete',
          pagesCompleted: 20,
          totalQueued: 20,
          results: [
            { route: '/page-1', wordCount: 500 },
            { route: '/page-2', wordCount: 750 }
          ]
        })
      });

    await serverHarnessModule.executeServerScan('https://example.com', 'headless');

    expect(document.getElementById('metric-http-status').textContent).toBe('202');
    expect(document.getElementById('metric-response-status').textContent).toBe('queued');

    const queueContainer = document.getElementById('queue-monitor-container');
    expect(queueContainer.classList.contains('hidden')).toBe(false);
    expect(document.getElementById('queue-job-id').textContent).toBe('job_1725612345_abc123');

    // Advance timers for first poll
    await vi.advanceTimersByTimeAsync(850);
    expect(document.getElementById('queue-progress-text').textContent).toContain('5 / 20');

    // Advance timers for completion poll
    await vi.advanceTimersByTimeAsync(850);
    expect(document.getElementById('queue-progress-text').textContent).toContain('20 / 20');
    expect(document.getElementById('queue-status-text').textContent).toBe('CRAWL COMPLETED');
    expect(document.getElementById('queue-pages-list').children.length).toBe(2);
  });

  it('Gate 4: Handles processing_remainder deep scan envelope and initiates background monitor', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockDeepProcessingPayload
    });

    await serverHarnessModule.executeServerScan('https://example-deep.com', 'deep');

    expect(document.getElementById('metric-http-status').textContent).toBe('200');
    expect(document.getElementById('metric-response-status').textContent).toBe('processing_remainder');
    expect(document.getElementById('queue-job-id').textContent).toBe('job_1725699999_deep456');
    expect(document.getElementById('queue-monitor-container').classList.contains('hidden')).toBe(false);
  });

  it('Gate 5: Validates contract checklist failure when required payload properties are missing or corrupted', () => {
    const brokenPayload = {
      overallScore: 'invalid_string',
      pillarScores: { P1: 20 }, // Missing P2, P3, P4
      capabilityMatrix: [{ id: 'cap_1' }] // Only 1 instead of 32
    };

    serverHarnessModule.validateContractChecklist(brokenPayload, false);

    expect(document.querySelector('#contract-overall-score .status-pill').textContent).toBe('INVALID');
    expect(document.querySelector('#contract-pillar-scores .status-pill').textContent).toBe('INVALID');
    expect(document.querySelector('#contract-capability-matrix .status-pill').textContent).toBe('INVALID');
  });

  it('Gate 6: Handles HTTP 422 unreachable target failure cleanly without unhandled exceptions', async () => {
    vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        targetUrl: 'https://unreachable-domain-999.xyz',
        status: 'failed',
        error: 'Target domain could not be resolved or reached.'
      })
    });

    await serverHarnessModule.executeServerScan('https://unreachable-domain-999.xyz', 'standard');

    expect(document.getElementById('metric-http-status').textContent).toBe('422');
    expect(document.getElementById('server-error-container').classList.contains('hidden')).toBe(false);
    expect(document.getElementById('server-error-message').textContent).toContain('[HTTP 422]');
    expect(document.getElementById('server-error-message').textContent).toContain('Target domain could not be resolved or reached.');
  });

  it('Gate 7: Strict System Governance: Zero occurrences of banned vocabulary "AI-first"', () => {
    expect(htmlTemplate).not.toMatch(/AI-first/i);
    const renderedBody = document.body.innerHTML;
    expect(renderedBody).not.toMatch(/AI-first/i);
  });
});
