import { describe, it, expect } from 'vitest';
import { evaluateCapabilities } from '../services/capabilityEvaluator.js';

describe('Backend capabilityEvaluator: 5-Anchor Permutations & Combinations', () => {
  it('should recognize all newly expanded route and anchor aliases across all 5 categories', () => {
    const mockCrawledPages = [
      { url: 'https://www.microsoft.com/en-us/aboutus', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/contactus', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/pricing', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/data-privacy', statusCode: 200 },
      { url: 'https://www.microsoft.com/en-us/usageterms', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://microsoft.com',
      pages: mockCrawledPages
    });

    const missingPages = result.missingEssentialPages || [];
    expect(missingPages).toEqual([]);
    expect(result.missingEssentialPages.length).toBe(0);
  });

  it('should recognize in-page section hashes and limits/data-policy aliases', () => {
    const mockCrawledPages = [
      { url: 'https://example.com/#about-us', statusCode: 200 },
      { url: 'https://example.com/#contact-us', statusCode: 200 },
      { url: 'https://example.com/pricing', statusCode: 200 },
      { url: 'https://example.com/en-us/#data-policy', statusCode: 200 },
      { url: 'https://example.com/en-us/limits', statusCode: 200 }
    ];

    const result = evaluateCapabilities({
      targetUrl: 'https://example.com',
      pages: mockCrawledPages
    });

    expect(result.missingEssentialPages).toEqual([]);
  });
});
