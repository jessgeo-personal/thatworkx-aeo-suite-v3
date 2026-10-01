/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Stage 2: 5-Anchor Essential Pages with In-Page Anchor Section Fallbacks', () => {
  beforeEach(() => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  describe('evaluateEssentialPages Logic', () => {
    it('should detect standalone routes and mark all 5 as existent', async () => {
      const { evaluateEssentialPages } = await import('../visualize.js');

      const crawledPages = [
        { url: 'https://example.com/about' },
        { url: 'https://example.com/contact' },
        { url: 'https://example.com/pricing' },
        { url: 'https://example.com/privacy-policy' },
        { url: 'https://example.com/terms-of-service' }
      ];

      const result = evaluateEssentialPages(crawledPages, []);

      expect(result.foundCount).toBe(5);
      expect(result.missingCount).toBe(0);
      expect(result.missingPages).toEqual([]);
      expect(result.pages['about'].found).toBe(true);
      expect(result.pages['about'].discoveryType).toBe('route');
    });

    it('should recognize in-page anchor section fallbacks (#about, #contact, #privacy, #terms) for SPAs', async () => {
      const { evaluateEssentialPages } = await import('../visualize.js');

      // Crawled pages only has the root, but in-page anchors detected
      const crawledPages = [{ url: 'https://example.com/' }];
      const inPageAnchors = ['#about', '#contact', '#privacy', '#terms', '#pricing'];

      const result = evaluateEssentialPages(crawledPages, inPageAnchors);

      expect(result.foundCount).toBe(5);
      expect(result.missingCount).toBe(0);
      expect(result.missingPages).toEqual([]);
      
      expect(result.pages['about'].found).toBe(true);
      expect(result.pages['about'].discoveryType).toBe('anchor');
      expect(result.pages['about'].matchedAnchor).toBe('#about');

      expect(result.pages['contact'].found).toBe(true);
      expect(result.pages['contact'].discoveryType).toBe('anchor');
      expect(result.pages['contact'].matchedAnchor).toBe('#contact');

      expect(result.pages['privacy'].found).toBe(true);
      expect(result.pages['privacy'].discoveryType).toBe('anchor');

      expect(result.pages['terms'].found).toBe(true);
      expect(result.pages['terms'].discoveryType).toBe('anchor');
    });

    it('should accurately isolate true missing pages when neither route nor anchor exists', async () => {
      const { evaluateEssentialPages } = await import('../visualize.js');

      const crawledPages = [{ url: 'https://example.com/about' }];
      const inPageAnchors = ['#contact']; // pricing, privacy, and terms missing

      const result = evaluateEssentialPages(crawledPages, inPageAnchors);

      expect(result.foundCount).toBe(2);
      expect(result.missingCount).toBe(3);
      expect(result.missingPages).toContain('pricing');
      expect(result.missingPages).toContain('privacy-policy');
      expect(result.missingPages).toContain('terms-of-service');
      expect(result.pages['pricing'].found).toBe(false);
    });
  });

  describe('Stage 2 DOM Rendering', () => {
    it('should render explicit discovery labels in the essential pages list', async () => {
      const { renderStage2EssentialPages } = await import('../visualize.js');

      const crawledPages = [{ url: 'https://example.com/' }];
      const inPageAnchors = ['#about', '#contact', '#terms'];

      renderStage2EssentialPages(crawledPages, inPageAnchors);

      const stage2 = document.getElementById('stage-2');
      expect(stage2).not.toBeNull();

      // About should indicate it exists via anchor
      const aboutCard = stage2.querySelector('[data-page="about"]');
      expect(aboutCard, 'About page item must exist in Stage 2').not.toBeNull();
      expect(aboutCard.textContent).toContain('In-Page Section (#about)');
      expect(aboutCard.classList.contains('status-found')).toBe(true);

      // Pricing should indicate missing
      const pricingCard = stage2.querySelector('[data-page="pricing"]');
      expect(pricingCard, 'Pricing page item must exist in Stage 2').not.toBeNull();
      expect(pricingCard.textContent).toContain('Missing');
      expect(pricingCard.classList.contains('status-missing')).toBe(true);
    });
  });
});
