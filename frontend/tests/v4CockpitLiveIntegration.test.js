/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 3: V4 Cockpit Live Scan Decoupling & Ingestion Pipeline', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(process.cwd(), 'frontend/visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  describe('Pre-Scan State & Static Defaults (Gates 4 & 5)', () => {
    it('verifies #audit-error-banner is pre-rendered in static HTML and hidden by default', () => {
      const banner = document.getElementById('audit-error-banner');
      expect(banner).not.toBeNull();
      expect(banner.getAttribute('role')).toBe('alert');
      expect(banner.classList.contains('hidden')).toBe(true);
    });

    it('renders graceful pre-scan defaults ("--" or "UNAUDITED") with zero mock data (Gate 4)', async () => {
      const { resetCockpitToDefault } = await import('../visualize.js');
      resetCockpitToDefault();

      const overallScore = document.getElementById('overall-score');
      const healthStatus = document.getElementById('health-status');
      const stage3Count = document.getElementById('stage3-page-count');

      if (overallScore) {
        expect(overallScore.textContent.trim()).toBe('--');
      }
      if (healthStatus) {
        expect(healthStatus.textContent.trim()).toMatch(/UNAUDITED|PENDING/i);
      }
      if (stage3Count) {
        expect(stage3Count.textContent.trim()).toMatch(/0|--/);
      }
    });

    it('strictly satisfies Banned Terms Gate (zero occurrences of "AI-first")', () => {
      const jsPath = path.resolve(process.cwd(), 'frontend/visualize.js');
      const jsContent = fs.readFileSync(jsPath, 'utf8');
      expect(jsContent).not.toMatch(/ai-first/i);
      expect(document.body.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('Live Network Ingestion & Rescan Dispatch', () => {
    it('dispatches live POST /api/scan with domain payload and adapts results', async () => {
      const { executeLiveScan } = await import('../visualize.js');

      const mockApiResponse = {
        success: true,
        data: {
          domain: 'https://enterprise-sample.com',
          manifests: {
            hasRobotsTxt: true,
            hasLlmsTxt: true,
            hasAiContext: false
          },
          summary: {
            overallScore: 94,
            healthStatus: 'AI-READY'
          },
          pages: [
            { url: 'https://enterprise-sample.com/', status: 200, tier: 'Core' },
            { url: 'https://enterprise-sample.com/about', status: 200, tier: 'Secondary' }
          ]
        }
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockApiResponse
      });

      await executeLiveScan('https://enterprise-sample.com');

      expect(global.fetch).toHaveBeenCalledWith('/api/scan', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ 'Content-Type': 'application/json' }),
        body: JSON.stringify({ domain: 'https://enterprise-sample.com' })
      }));

      const overallScore = document.getElementById('overall-score');
      if (overallScore) {
        expect(overallScore.textContent.trim()).toBe('94');
      }
    });

    it('handles 500 network failure with visible error banner and ZERO mock fallback (Gate 6)', async () => {
      const { executeLiveScan } = await import('../visualize.js');

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Crawl pipeline failed: Domain unreachable'
        })
      });

      await executeLiveScan('https://unreachable-domain.com');

      const errorBanner = document.getElementById('audit-error-banner');
      expect(errorBanner).not.toBeNull();
      expect(errorBanner.classList.contains('hidden')).toBe(false);
      expect(errorBanner.textContent).toMatch(/domain unreachable|crawl pipeline failed/i);

      // Verify ZERO fallback to mock data: score must NOT revert to legacy mock values (e.g. 78 or 82)
      const overallScore = document.getElementById('overall-score');
      if (overallScore) {
        expect(overallScore.textContent.trim()).toBe('--');
      }
    });
  });
});
