/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Stage 2: Enterprise Locale-Prefixed Essential Pages Resolution', () => {
  let visualize;

  beforeEach(async () => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;

    visualize = await import('../visualize.js');
  });

  describe('Locale Prefix Recognition Across All 5 Essential Pages', () => {
    it('should identify all 5 essential pages when paths have regional language/country prefixes', () => {
      const { evaluateEssentialPages } = visualize;

      // Realistic enterprise crawl payload with international locale prefixes
      const enterpriseCrawledPages = [
        { url: 'https://www.microsoft.com/en-us/about' },
        { url: 'https://www.microsoft.com/en-us/contact-us' },
        { url: 'https://www.microsoft.com/en-us/pricing' },
        { url: 'https://www.microsoft.com/en-us/privacy-policy' },
        { url: 'https://www.microsoft.com/en-us/terms-of-service' }
      ];

      const result = evaluateEssentialPages(enterpriseCrawledPages, []);

      expect(result.foundCount, 'All 5 localized enterprise pages must be found').toBe(5);
      expect(result.missingCount).toBe(0);
      expect(result.missingPages).toEqual([]);

      expect(result.pages['about'].found).toBe(true);
      expect(result.pages['about'].discoveryType).toBe('route');

      expect(result.pages['contact'].found).toBe(true);
      expect(result.pages['contact'].discoveryType).toBe('route');

      expect(result.pages['pricing'].found).toBe(true);
      expect(result.pages['pricing'].discoveryType).toBe('route');

      expect(result.pages['privacy'].found).toBe(true);
      expect(result.pages['privacy'].discoveryType).toBe('route');

      expect(result.pages['terms'].found).toBe(true);
      expect(result.pages['terms'].discoveryType).toBe('route');
    });

    it('should support 2-letter language codes and hyphenated country codes across aliases', () => {
      const { evaluateEssentialPages } = visualize;

      const variedLocalePages = [
        { url: 'https://example.com/de/company' },
        { url: 'https://example.com/fr-ca/get-in-touch' },
        { url: 'https://example.com/ja/plans' },
        { url: 'https://example.com/es-es/privacy' },
        { url: 'https://example.com/zh-cn/tos' }
      ];

      const result = evaluateEssentialPages(variedLocalePages, []);

      expect(result.foundCount).toBe(5);
      expect(result.missingCount).toBe(0);
      expect(result.pages['about'].found).toBe(true);
      expect(result.pages['contact'].found).toBe(true);
      expect(result.pages['pricing'].found).toBe(true);
      expect(result.pages['privacy'].found).toBe(true);
      expect(result.pages['terms'].found).toBe(true);
    });

    it('should accurately flag missing pages when localized routes only partially exist', () => {
      const { evaluateEssentialPages } = visualize;

      const partialLocalePages = [
        { url: 'https://www.microsoft.com/en-us/about' },
        { url: 'https://www.microsoft.com/en-us/contact' }
      ];

      const result = evaluateEssentialPages(partialLocalePages, []);

      expect(result.foundCount).toBe(2);
      expect(result.missingCount).toBe(3);
      expect(result.missingPages).toContain('pricing');
      expect(result.missingPages).toContain('privacy-policy');
      expect(result.missingPages).toContain('terms-of-service');
    });
  });

  describe('Stage 2 DOM Rendering with Localized Routes', () => {
    it('should render correct discovery label with the localized path', () => {
      const { renderStage2EssentialPages } = visualize;

      const crawledPages = [
        { url: 'https://www.microsoft.com/en-us/about' }
      ];

      renderStage2EssentialPages(crawledPages, []);

      const stage2 = document.getElementById('stage-2');
      const aboutCard = stage2.querySelector('[data-page="about"]');

      expect(aboutCard).not.toBeNull();
      expect(aboutCard.classList.contains('status-found')).toBe(true);
      expect(aboutCard.textContent).toContain('Found: Standalone Route');
      expect(aboutCard.textContent).toContain('/en-us/about');
    });
  });
});