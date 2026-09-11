import { describe, it, expect } from 'vitest';
import { evaluateCapabilities } from '../services/capabilityEvaluator.js';

describe('Backend capabilityEvaluator: Enterprise Privacy Statements & Terms of Use', () => {
  it('should recognize /en-ca/privacystatement and /privacy as satisfying /privacy-policy', () => {
    const mockCrawledPages = [
      { url: 'https://privacy.microsoft.com/en-ca/privacystatement', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockCrawledPages
    });

    expect(result.missingEssentialPages).not.toContain('/privacy-policy');
  });

  it('should recognize /en-ca/privacy as satisfying /privacy-policy', () => {
    const mockCrawledPages = [
      { url: 'https://www.microsoft.com/en-ca/privacy', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockCrawledPages
    });

    expect(result.missingEssentialPages).not.toContain('/privacy-policy');
  });

  it('should recognize /legal/terms-of-use and /termsofuse as satisfying /terms-of-service', () => {
    const mockCrawledPages = [
      { url: 'https://www.microsoft.com/en-us/legal/terms-of-use', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockCrawledPages
    });

    expect(result.missingEssentialPages).not.toContain('/terms-of-service');
  });
});
