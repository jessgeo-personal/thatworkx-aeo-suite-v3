import { describe, it, expect, vi } from 'vitest';
import { probeEssentialRoutes, isInternalLink } from '../services/crawlerService.js';

describe('crawlerService: Enterprise Timeouts & Parallel Probing', () => {
  describe('isInternalLink Scoping', () => {
    it('should stay on primary apex and www for general pages', () => {
      const base = 'https://microsoft.com';
      expect(isInternalLink('https://www.microsoft.com/en-us/windows', base)).toBe(true);
      expect(isInternalLink('https://microsoft.com/surface', base)).toBe(true);
    });

    it('should allow legitimate support/privacy subdomains for essential anchors', () => {
      const base = 'https://microsoft.com';
      expect(isInternalLink('https://support.microsoft.com/en-us/contactus', base)).toBe(true);
      expect(isInternalLink('https://privacy.microsoft.com/en-ca/privacystatement', base)).toBe(true);
    });

    it('should reject noisy subdomains that trigger redirect loops (login, account, appsource)', () => {
      const base = 'https://microsoft.com';
      expect(isInternalLink('https://login.microsoft.com/oauth2/authorize', base)).toBe(false);
      expect(isInternalLink('https://account.microsoft.com/profile', base)).toBe(false);
      expect(isInternalLink('https://appsource.microsoft.com/marketplace', base)).toBe(false);
    });
  });

  describe('probeEssentialRoutes Concurrency & Timeout Safety', () => {
    it('should complete within the specified timeout threshold even if endpoints hang', async () => {
      const slowFetch = vi.fn((url, options) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve({ ok: false, status: 504 });
          }, 10000);

          if (options && options.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              reject(new Error('The operation was aborted due to timeout'));
            });
          }
        });
      });

      const startTime = Date.now();
      const targetUrl = 'https://microsoft.com';
      const existingPages = [];
      const discoveredRoutes = [];

      // Test with a 2000ms timeout parameter to confirm abort handling
      await probeEssentialRoutes(targetUrl, existingPages, discoveredRoutes, slowFetch, 2000);
      const elapsed = Date.now() - startTime;

      expect(elapsed, 'Probe must abort hanging endpoints within ~2.5s').toBeLessThan(2500);
    });
  });
});
