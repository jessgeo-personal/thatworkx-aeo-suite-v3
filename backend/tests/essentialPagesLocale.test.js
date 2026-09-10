import { describe, it, expect } from 'vitest';
import { evaluateCapabilities } from '../services/capabilityEvaluator.js';

describe('Backend capabilityEvaluator: Enterprise Locale-Prefixed Essential Pages', () => {
  it('should identify localized routes and mark all 5 essential pages as present', () => {
    const mockCrawledPages = [
      { url: 'https://www.microsoft.com/en-us/about', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/contact-us', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/pricing', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/privacy-policy', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/terms-of-service', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockCrawledPages
    });

    const missingPages = result.missingEssentialPages || [];

    expect(missingPages).not.toContain('/about');
    expect(missingPages).not.toContain('/contact');
    expect(missingPages).not.toContain('/pricing');
    expect(missingPages).not.toContain('/privacy-policy');
    expect(missingPages).not.toContain('/terms-of-service');
    expect(missingPages.length).toBe(0);
  });

  it('should recognize localized trailing-slash routes as existent', () => {
    const mockTrailingSlashPages = [
      { url: 'https://www.microsoft.com/en-us/about/', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockTrailingSlashPages
    });

    expect(result.missingEssentialPages).not.toContain('/about');
  });
});