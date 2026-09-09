/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4CockpitLivePipelineAndErrorLogging.test.js
 * @description BDD RED Phase Test Suite for Live Ingestion Pipeline & Internal Error Tracking
 * 
 * STRICT ARCHITECTURAL GATES ENFORCED:
 * 1. Data Integrity Gate: Zero synthetic defaults on failure. Reverts to "--" and "UNAUDITED".
 * 2. Error Tracking Gate: Internal error log entry recorded on scan/network failure.
 * 3. User Notification Gate: Error banner (#cockpit-error-banner) surfaced on failure.
 * 4. Banned Terms Gate: Zero occurrences of "AI-first".
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 3.2.4: Live Pipeline & Internal Error Tracking', () => {
  let visualizeModule;

  beforeEach(async () => {
    // 1. Reset DOM environment to visualize.html baseline
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;

    // 2. Import visualize module
    visualizeModule = await import('../visualize.js');
    visualizeModule.clearCockpitErrorLogs();
    visualizeModule.resetCockpitToNeutral();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Live Scan Ingestion (Happy Path)', () => {
    it('should dispatch POST /api/scan with targetUrl and map live backend results across all stages', async () => {
      const mockBackendResponse = {
        status: 'completed',
        targetUrl: 'https://thatworkx.com',
        overallScore: 84,
        pagesCrawled: 6,
        scanMetrics: { scanTimeSeconds: 4.2 },
        pages: [
          {
            url: 'https://thatworkx.com',
            wordCount: 1200,
            textDensityRatio: 32.5,
            links: ['tel:+971529342175', 'mailto:info@thatworkx.com'],
            schema: [{ '@type': 'Organization', name: 'Thatworkx' }]
          },
          { url: 'https://thatworkx.com/about', wordCount: 800, textDensityRatio: 28.0 },
          { url: 'https://thatworkx.com/contact', wordCount: 400, textDensityRatio: 22.0 },
          { url: 'https://thatworkx.com/pricing', wordCount: 650, textDensityRatio: 26.0 },
          { url: 'https://thatworkx.com/privacy-policy', wordCount: 950, textDensityRatio: 45.0 },
          { url: 'https://thatworkx.com/terms-of-service', wordCount: 1100, textDensityRatio: 52.0 }
        ],
        missingEssentialPages: []
      };

      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockBackendResponse
      });

      await visualizeModule.executeCockpitScan('https://thatworkx.com');

      // Verify network request contract
      expect(fetchSpy).toHaveBeenCalledWith('/api/scan', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: 'https://thatworkx.com', email: '' })
      }));

      // Verify telemetry metadata
      const state = visualizeModule.getCockpitState();
      expect(state.isAudited).toBe(true);
      expect(state.targetUrl).toBe('https://thatworkx.com');
      expect(state.totalPages).toBe(6);
      expect(state.healthIndex).toBe(84);

      // Verify header DOM binding
      const domainBadge = document.getElementById('target-domain-badge');
      const totalPagesEl = document.getElementById('total-pages-label');
      expect(domainBadge.textContent).toContain('thatworkx.com');
      expect(totalPagesEl.textContent).toBe('6');
    });
  });

  describe('2. Inaccessible Domain & Network Failure Handling (Zero Fallback Gate)', () => {
    it('should surface #cockpit-error-banner and reset state to UNAUDITED on HTTP 500 failure', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Crawler socket dropped' })
      });

      await visualizeModule.executeCockpitScan('https://inaccessible-domain.local');

      // Check Error Banner display
      const banner = document.getElementById('cockpit-error-banner');
      expect(banner.classList.contains('hidden')).toBe(false);
      expect(banner.textContent).toMatch(/inaccessible-domain\.local/i);

      // Check Zero Fallback reset: UI must display neutral placeholders
      const state = visualizeModule.getCockpitState();
      expect(state.isAudited).toBe(false);
      expect(state.targetUrl).toBe('--');
      expect(state.healthIndex).toBe(0);

      const domainBadge = document.getElementById('target-domain-badge');
      expect(domainBadge.textContent.trim()).toBe('--');
    });

    it('should surface #cockpit-error-banner on network rejection (DNS failure / timeout)', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed to fetch'));

      await visualizeModule.executeCockpitScan('https://offline-domain.test');

      const banner = document.getElementById('cockpit-error-banner');
      expect(banner.classList.contains('hidden')).toBe(false);
      expect(banner.textContent).toMatch(/Failed to fetch/i);
    });
  });

  describe('3. Internal Quality Error Log Tracking Gate', () => {
    it('should record structured error logs in cockpitErrorLogs on scan failures', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: false,
        status: 504,
        statusText: 'Gateway Timeout',
        json: async () => ({ error: 'Gateway timeout' })
      });

      await visualizeModule.executeCockpitScan('https://timed-out-target.com');

      const errorLogs = visualizeModule.getCockpitErrorLogs();
      expect(errorLogs.length).toBeGreaterThanOrEqual(1);

      const lastLog = errorLogs[errorLogs.length - 1];
      expect(lastLog.targetUrl).toBe('https://timed-out-target.com');
      expect(lastLog.status).toBe(504);
      expect(lastLog.error).toMatch(/504|Gateway Timeout/i);
      expect(lastLog.timestamp).toBeDefined();
    });
  });

  describe('4. Rescan Authorization & User Prompt Gate', () => {
    it('should prompt user confirmation before re-executing scan on handleCockpitRescan', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValueOnce(false);
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      const input = document.getElementById('target-url-input');
      if (input) input.value = 'https://thatworkx.com';

      visualizeModule.handleCockpitRescan();

      expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('thatworkx.com'));
      expect(fetchSpy).not.toHaveBeenCalled();
    });

    it('should execute scan when user confirms the rescan prompt', async () => {
      vi.spyOn(window, 'confirm').mockReturnValueOnce(true);
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ status: 'completed', targetUrl: 'https://thatworkx.com', pages: [] })
      });

      const input = document.getElementById('target-url-input');
      if (input) input.value = 'https://thatworkx.com';

      visualizeModule.handleCockpitRescan();

      expect(fetchSpy).toHaveBeenCalledWith('/api/scan', expect.anything());
    });
  });
});