import { describe, it, expect } from 'vitest';
import { isSameDomainOrSubdomain } from '../services/crawlerService.js';
import { evaluateCapabilities } from '../services/capabilityEvaluator.js';

describe('Essential Pages Subdomain Redirects & Evaluation', () => {
  describe('isSameDomainOrSubdomain Helper', () => {
    it('should recognize organizational subdomains as belonging to the target domain', () => {
      const target = 'https://microsoft.com';
      const candidate1 = 'https://support.microsoft.com/en-us/contactus/';
      const candidate2 = 'https://privacy.microsoft.com/en-us/privacystatement';
      const candidate3 = 'https://www.microsoft.com/about';
      const external = 'https://google.com/contact';
      const phishing = 'https://support-microsoft.com/contact';

      expect(isSameDomainOrSubdomain(target, candidate1), 'support.microsoft.com should be valid').toBe(true);
      expect(isSameDomainOrSubdomain(target, candidate2), 'privacy.microsoft.com should be valid').toBe(true);
      expect(isSameDomainOrSubdomain(target, candidate3), 'www.microsoft.com should be valid').toBe(true);
      expect(isSameDomainOrSubdomain(target, external), 'google.com must be rejected').toBe(false);
      expect(isSameDomainOrSubdomain(target, phishing), 'lookalike domain must be rejected').toBe(false);
    });

    it('should handle target URLs entered with www prefix', () => {
      const target = 'https://www.microsoft.com';
      const candidate = 'https://support.microsoft.com/en-us/contactus/';
      expect(isSameDomainOrSubdomain(target, candidate)).toBe(true);
    });
  });

  describe('capabilityEvaluator Subdomain Route Recognition', () => {
    it('should recognize essential pages located on organizational subdomains', () => {
      const mockCrawledPages = [
        { url: 'https://support.microsoft.com/en-us/contactus', statusCode: 200 },
        { url: 'https://www.microsoft.com/en-us/about', statusCode: 200 }
      ];

      const result = evaluateCapabilities({
        targetUrl: 'https://microsoft.com',
        pages: mockCrawledPages
      });

      expect(result.missingEssentialPages).not.toContain('/contact');
      expect(result.missingEssentialPages).not.toContain('/about');
    });
  });
});
