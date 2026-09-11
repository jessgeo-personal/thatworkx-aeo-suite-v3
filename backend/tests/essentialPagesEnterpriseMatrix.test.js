import { describe, it, expect } from 'vitest';
import { evaluateCapabilities } from '../services/capabilityEvaluator.js';
import { isInternalLink } from '../services/crawlerService.js';

describe('Enterprise 5-Anchor Matrix (Microsoft Real-World Scenarios)', () => {
  describe('crawlerService: isInternalLink Subdomain Support', () => {
    it('should accept organizational subdomains in the main crawler link extractor', () => {
      const base = 'https://microsoft.com';
      expect(isInternalLink('https://privacy.microsoft.com/en-ca/privacystatement', base)).toBe(true);
      expect(isInternalLink('https://support.microsoft.com/en-us/contactus', base)).toBe(true);
      expect(isInternalLink('https://google.com', base)).toBe(false);
    });
  });

  describe('capabilityEvaluator: Enterprise Real-World Slug Resolution', () => {
    it('should resolve Microsoft Services Agreement as Terms of Service', () => {
      const pages = [
        { url: 'https://www.microsoft.com/en-gb/servicesagreement', statusCode: 200 }
      ];
      const res = evaluateCapabilities({ targetUrl: 'https://microsoft.com', pages });
      expect(res.missingEssentialPages).not.toContain('/terms-of-service');
    });

    it('should resolve deep nested support warranty terms as Terms of Service', () => {
      const pages = [
        { url: 'https://support.microsoft.com/en-au/surface/hardware-warranty/warranty-and-protection-plan-terms-conditions', statusCode: 200 }
      ];
      const res = evaluateCapabilities({ targetUrl: 'https://microsoft.com', pages });
      expect(res.missingEssentialPages).not.toContain('/terms-of-service');
    });

    it('should resolve /en-ca/privacy with deep or locale routing as Privacy Policy', () => {
      const pages = [
        { url: 'https://www.microsoft.com/en-ca/privacy', statusCode: 200 }
      ];
      const res = evaluateCapabilities({ targetUrl: 'https://microsoft.com', pages });
      expect(res.missingEssentialPages).not.toContain('/privacy-policy');
    });

    it('should resolve enterprise commerce paths (/store, /buy, /compare) as Pricing', () => {
      const pages = [
        { url: 'https://www.microsoft.com/en-us/store/b/home', statusCode: 200 }
      ];
      const res = evaluateCapabilities({ targetUrl: 'https://microsoft.com', pages });
      expect(res.missingEssentialPages).not.toContain('/pricing');
    });
  });
});
