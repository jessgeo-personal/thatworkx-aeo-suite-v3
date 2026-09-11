/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Stage 3: Semantic Text Density Page Ordering & Prioritization', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Unit: sortStage3Pages correctly prioritizes Homepage (Top) -> Essential Anchors (Middle) -> Other Pages (Bottom)', async () => {
    const { sortStage3Pages } = await import('../visualize.js');
    expect(typeof sortStage3Pages).toBe('function');

    const inputPages = [
      { path: '/blog/future-of-aeo', wordCount: 1420, ratio: 0.72 },
      { path: '/contact', wordCount: 210, ratio: 0.35 },
      { path: '/features/deep-dive', wordCount: 980, ratio: 0.65 },
      { path: '/', wordCount: 850, ratio: 0.58 },
      { path: '/pricing', wordCount: 430, ratio: 0.44 },
      { path: '/about', wordCount: 520, ratio: 0.51 },
      { path: '/terms-of-service', wordCount: 1800, ratio: 0.88 },
      { path: '/docs/api-reference', wordCount: 2200, ratio: 0.81 },
      { path: '/privacy-policy', wordCount: 1650, ratio: 0.85 }
    ];

    const sorted = sortStage3Pages(inputPages);
    const sortedPaths = sorted.map((p) => p.path || p.url || p.route);

    // 1. Top item must be Homepage
    expect(sortedPaths[0]).toBe('/');

    // 2. Middle items must be the discovered essential anchor pages
    const essentialPaths = ['/about', '/contact', '/pricing', '/privacy-policy', '/terms-of-service'];
    const middleSlice = sortedPaths.slice(1, 6);
    expect(middleSlice.sort()).toEqual(essentialPaths.sort());

    // 3. Remaining crawled routes must appear at the bottom
    const remainingSlice = sortedPaths.slice(6);
    expect(remainingSlice).toEqual(
      expect.arrayContaining(['/blog/future-of-aeo', '/features/deep-dive', '/docs/api-reference'])
    );
  });

  it('Normalization: handles absolute URLs, trailing slashes, and anchor aliases', async () => {
    const { sortStage3Pages } = await import('../visualize.js');
    expect(typeof sortStage3Pages).toBe('function');

    const mixedPages = [
      { url: 'https://example.com/company/team', wordCount: 600 },
      { url: 'https://example.com/terms/', wordCount: 1200 }, // alias for terms-of-service
      { url: 'https://example.com/', wordCount: 900 },        // homepage
      { url: 'https://example.com/contact-us', wordCount: 300 }, // alias for contact
      { url: 'https://example.com/products/item-1', wordCount: 400 },
      { url: 'https://example.com/about-us/', wordCount: 750 }   // alias for about
    ];

    const sorted = sortStage3Pages(mixedPages);
    const urls = sorted.map((p) => p.url || p.path);

    // Homepage first
    expect(urls[0]).toBe('https://example.com/');

    // Essential aliases in middle
    const middleUrls = urls.slice(1, 4);
    expect(middleUrls).toEqual(
      expect.arrayContaining([
        'https://example.com/about-us/',
        'https://example.com/contact-us',
        'https://example.com/terms/'
      ])
    );

    // Other pages at the bottom
    const bottomUrls = urls.slice(4);
    expect(bottomUrls).toEqual(
      expect.arrayContaining([
        'https://example.com/company/team',
        'https://example.com/products/item-1'
      ])
    );
  });

  it('DOM Integration: rendered thermometers render in prioritized order', async () => {
    const { renderStage3Thermometers } = await import('../visualize.js');
    expect(typeof renderStage3Thermometers).toBe('function');

    const container = document.querySelector('#stage3-thermometers, [data-component="thermometers"], .stage3-page-list');
    const targetContainer = container || document.body;

    const mockPages = [
      { path: '/resources/whitepaper', wordCount: 1100, ratio: 0.6 },
      { path: '/about', wordCount: 500, ratio: 0.5 },
      { path: '/', wordCount: 800, ratio: 0.55 },
      { path: '/pricing', wordCount: 400, ratio: 0.45 }
    ];

    renderStage3Thermometers(mockPages, targetContainer);

    const renderedItems = document.querySelectorAll(
      '.thermometer-card, [data-thermometer-page], .page-density-item'
    );
    expect(renderedItems.length).toBe(4);

    const renderedPaths = Array.from(renderedItems).map(
      (el) => el.getAttribute('data-page-path') || el.dataset.page || el.querySelector('.page-path')?.textContent?.trim()
    );

    expect(renderedPaths[0]).toBe('/');
    expect(renderedPaths.slice(1, 3)).toEqual(expect.arrayContaining(['/about', '/pricing']));
    expect(renderedPaths[3]).toBe('/resources/whitepaper');
  });
});
