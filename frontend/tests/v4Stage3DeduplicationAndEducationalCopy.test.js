/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Stage 3: Deduplication, File Filtering, Card Headings & Educational Copy', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Filter: Excludes .txt and .md files from Stage 3 processing', async () => {
    const { filterStage3Pages } = await import('../visualize.js');
    expect(typeof filterStage3Pages).toBe('function');

    const inputPages = [
      { path: '/', wordCount: 850, ratio: 0.55 },
      { path: '/robots.txt', wordCount: 95, ratio: 0.98 },
      { url: 'https://thatworkx.com/llms.txt', wordCount: 210, ratio: 0.95 },
      { path: '/ai-context.md', wordCount: 400, ratio: 0.99 },
      { path: '/about', wordCount: 500, ratio: 0.5 },
      { url: 'https://thatworkx.com/docs/README.md', wordCount: 600, ratio: 0.9 }
    ];

    const filtered = filterStage3Pages(inputPages);
    const paths = filtered.map((p) => p.path || p.url);

    expect(paths).toEqual(['/', '/about']);
    expect(paths).not.toContain('/robots.txt');
    expect(paths).not.toContain('https://thatworkx.com/llms.txt');
    expect(paths).not.toContain('/ai-context.md');
    expect(paths).not.toContain('https://thatworkx.com/docs/README.md');
  });

  it('Deduplication: Merges duplicate paths and selects the found/populated entry', async () => {
    const { deduplicateStage3Pages } = await import('../visualize.js');
    expect(typeof deduplicateStage3Pages).toBe('function');

    const rawPages = [
      // /about duplicate: relative path has content, absolute URL is not found
      { url: 'http://thatworkx.com/about', wordCount: 0, ratio: 0, status: 404, notFound: true },
      { path: '/about', wordCount: 420, ratio: 0.25, status: 200, notFound: false },

      // /contact duplicate: absolute URL has content, relative path is 404
      { path: '/contact', wordCount: 0, ratio: 0, status: 404, notFound: true },
      { url: 'http://thatworkx.com/contact', wordCount: 310, ratio: 0.4, status: 200, notFound: false },

      // /privacy-policy duplicate: both have content, should retain 1 canonical record
      { path: '/privacy-policy', wordCount: 1200, ratio: 0.75, status: 200 },
      { url: 'http://thatworkx.com/privacy-policy', wordCount: 1200, ratio: 0.75, status: 200 },

      // Homepage
      { path: '/', wordCount: 900, ratio: 0.6, status: 200 }
    ];

    const deduplicated = deduplicateStage3Pages(rawPages);
    expect(deduplicated.length).toBe(4);

    const aboutPage = deduplicated.find((p) => (p.path || p.url || '').includes('/about'));
    expect(aboutPage).toBeDefined();
    expect(aboutPage.wordCount).toBe(420);
    expect(aboutPage.ratio).toBe(0.25);

    const contactPage = deduplicated.find((p) => (p.path || p.url || '').includes('/contact'));
    expect(contactPage).toBeDefined();
    expect(contactPage.wordCount).toBe(310);
    expect(contactPage.ratio).toBe(0.4);
  });

  it('DOM Headings: Each thermometer card displays "Review Page (X of Y pages): <full URL>"', async () => {
    const { renderStage3Thermometers } = await import('../visualize.js');
    expect(typeof renderStage3Thermometers).toBe('function');

    const container = document.createElement('div');
    container.id = 'stage3-thermometers';
    document.body.appendChild(container);

    const pages = [
      { path: '/', wordCount: 850, ratio: 0.55 },
      { path: '/about', wordCount: 520, ratio: 0.48 },
      { url: 'https://thatworkx.com/contact', wordCount: 220, ratio: 0.35 }
    ];

    renderStage3Thermometers(pages, container, 'https://thatworkx.com');

    const headings = Array.from(container.querySelectorAll('.thermometer-card-heading, .review-page-heading')).map(
      (el) => el.textContent.trim()
    );

    expect(headings.length).toBe(3);
    expect(headings[0]).toBe('Review Page (1 of 3 pages): https://thatworkx.com/');
    expect(headings[1]).toBe('Review Page (2 of 3 pages): https://thatworkx.com/about');
    expect(headings[2]).toBe('Review Page (3 of 3 pages): https://thatworkx.com/contact');
  });

  it('Educational Copy: "What AI Search Engines See & Why It Matters" matches required text', async () => {
    const { renderStage3EducationalCopy } = await import('../visualize.js');
    expect(typeof renderStage3EducationalCopy).toBe('function');

    const container = document.createElement('div');
    container.id = 'stage3-explanation';
    document.body.appendChild(container);

    renderStage3EducationalCopy(
      {
        highExtractabilityCount: 4,
        totalCrawledPages: 6
      },
      container
    );

    const textContent = container.textContent || '';

    // Line 1 Check
    expect(textContent).toContain(
      'AI prefers pages that have a higher density of text to html and other markups, as it takes less effort to parse and process.'
    );

    // Line 2 Check
    expect(textContent).toContain(
      'Citation Readability: 4/6 High Extractability — Crawled 6 pages. Average text density is healthy across canonical marketing pages with direct extractable answers.'
    );
  });
});
