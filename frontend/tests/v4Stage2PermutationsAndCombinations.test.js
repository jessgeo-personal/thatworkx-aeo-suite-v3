import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Stage 2: Permutations & Combinations for Essential Pages', () => {
  let visualize;

  beforeEach(async () => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;

    visualize = await import('../visualize.js');
  });

  it('1. About: should match /about, /#about, /aboutus, /#aboutus, /about-us, /#about-us with locale prefix', () => {
    const { evaluateEssentialPages } = visualize;

    const testCases = [
      { pages: [{ url: 'https://example.com/about' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#about'] },
      { pages: [{ url: 'https://example.com/aboutus' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#aboutus'] },
      { pages: [{ url: 'https://example.com/about-us' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#about-us'] },
      { pages: [{ url: 'https://example.com/en-us/about' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/aboutus' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/about-us' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#about' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#about-us' }], anchors: [] },
      { pages: [{ url: 'https://example.com/de/aboutus' }], anchors: [] }
    ];

    testCases.forEach((tc, idx) => {
      const res = evaluateEssentialPages(tc.pages, tc.anchors);
      expect(res.pages['about'].found, `About test case #${idx + 1} failed`).toBe(true);
    });
  });

  it('2. Contact: should match /contact, /#contact, /contactus, /#contactus, /contact-us, /#contact-us with locale prefix', () => {
    const { evaluateEssentialPages } = visualize;

    const testCases = [
      { pages: [{ url: 'https://example.com/contact' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#contact'] },
      { pages: [{ url: 'https://example.com/contactus' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#contactus'] },
      { pages: [{ url: 'https://example.com/contact-us' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#contact-us'] },
      { pages: [{ url: 'https://example.com/en-us/contact' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/contactus' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/contact-us' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#contact' }], anchors: [] },
      { pages: [{ url: 'https://example.com/fr-ca/#contact-us' }], anchors: [] }
    ];

    testCases.forEach((tc, idx) => {
      const res = evaluateEssentialPages(tc.pages, tc.anchors);
      expect(res.pages['contact'].found, `Contact test case #${idx + 1} failed`).toBe(true);
    });
  });

  it('3. Pricing: should match /pricing, /#pricing, and aliases with locale prefix', () => {
    const { evaluateEssentialPages } = visualize;

    const testCases = [
      { pages: [{ url: 'https://example.com/pricing' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#pricing'] },
      { pages: [{ url: 'https://example.com/en-us/pricing' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#pricing' }], anchors: [] },
      { pages: [{ url: 'https://example.com/ja/plans' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-gb/#plans' }], anchors: [] }
    ];

    testCases.forEach((tc, idx) => {
      const res = evaluateEssentialPages(tc.pages, tc.anchors);
      expect(res.pages['pricing'].found, `Pricing test case #${idx + 1} failed`).toBe(true);
    });
  });

  it('4. Terms: should match /terms, /#terms, /usageterms, /#usageterms, /usage-terms, /#usage-terms, /limits, /#limits, /terms-and-conditions, /#terms-and-conditions with locale prefix', () => {
    const { evaluateEssentialPages } = visualize;

    const testCases = [
      { pages: [{ url: 'https://example.com/terms' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#terms'] },
      { pages: [{ url: 'https://example.com/usageterms' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#usageterms'] },
      { pages: [{ url: 'https://example.com/usage-terms' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#usage-terms'] },
      { pages: [{ url: 'https://example.com/limits' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#limits'] },
      { pages: [{ url: 'https://example.com/terms-and-conditions' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#terms-and-conditions'] },
      { pages: [{ url: 'https://example.com/en-us/terms' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/usage-terms' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#limits' }], anchors: [] },
      { pages: [{ url: 'https://example.com/es-es/terms-and-conditions' }], anchors: [] },
      { pages: [{ url: 'https://example.com/de/#usageterms' }], anchors: [] }
    ];

    testCases.forEach((tc, idx) => {
      const res = evaluateEssentialPages(tc.pages, tc.anchors);
      expect(res.pages['terms'].found, `Terms test case #${idx + 1} failed`).toBe(true);
    });
  });

  it('5. Privacy: should match /privacy, /#privacy, /data-privacy, /#data-privacy, /data-policy, /#data-policy, /privacy-policy, /#privacy-policy, /privacypolicy, /#privacypolicy with locale prefix', () => {
    const { evaluateEssentialPages } = visualize;

    const testCases = [
      { pages: [{ url: 'https://example.com/privacy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#privacy'] },
      { pages: [{ url: 'https://example.com/data-privacy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#data-privacy'] },
      { pages: [{ url: 'https://example.com/data-policy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#data-policy'] },
      { pages: [{ url: 'https://example.com/privacy-policy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#privacy-policy'] },
      { pages: [{ url: 'https://example.com/privacypolicy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/' }], anchors: ['#privacypolicy'] },
      { pages: [{ url: 'https://example.com/en-us/data-privacy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/en-us/#data-policy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/fr-ca/privacypolicy' }], anchors: [] },
      { pages: [{ url: 'https://example.com/de/#privacypolicy' }], anchors: [] }
    ];

    testCases.forEach((tc, idx) => {
      const res = evaluateEssentialPages(tc.pages, tc.anchors);
      expect(res.pages['privacy'].found, `Privacy test case #${idx + 1} failed`).toBe(true);
    });
  });
});
