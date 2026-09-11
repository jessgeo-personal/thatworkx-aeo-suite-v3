/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Header & Stage 3 Scanned Pages Count Synchronization', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Count Synchronization: Header "No. of pages scanned" matches deduplicated Stage 3 count', async () => {
    const { renderCockpit, renderStage3Canvas, getCockpitState } = await import('../visualize.js');

    // Mock scan payload with raw duplicates and manifest files
    const mockState = {
      targetUrl: 'https://thatworkx.com',
      isAudited: true,
      totalPages: 7, // Raw backend count
      pages: [
        { url: 'https://thatworkx.com/', path: '/', wordCount: 800, ratio: 0.55 },
        { url: 'https://thatworkx.com/about', path: '/about', wordCount: 500, ratio: 0.45 },
        { url: 'http://thatworkx.com/about', path: '/about', wordCount: 0, ratio: 0, notFound: true }, // Duplicate
        { url: 'https://thatworkx.com/contact', path: '/contact', wordCount: 300, ratio: 0.35 },
        { url: '/contact', path: '/contact', wordCount: 0, ratio: 0, notFound: true }, // Duplicate
        { url: 'https://thatworkx.com/robots.txt', path: '/robots.txt', wordCount: 90, ratio: 0.95 }, // Manifest file (.txt)
        { url: 'https://thatworkx.com/llms.txt', path: '/llms.txt', wordCount: 150, ratio: 0.90 } // Manifest file (.txt)
      ]
    };

    renderCockpit(mockState);

    const canvasBody = document.getElementById('canvas-body');
    renderStage3Canvas(canvasBody, mockState);

    // Expected deduplicated count: 3 unique HTML pages (/, /about, /contact)
    const expectedCleanCount = 3;

    // 1. Stage 3 display count check
    const stage3Thermometers = canvasBody.querySelectorAll('.thermometer-card');
    expect(stage3Thermometers.length).toBe(expectedCleanCount);

    // 2. Header count element check
    const headerTotalPagesLabel = document.getElementById('total-pages-label');
    expect(headerTotalPagesLabel).not.toBeNull();
    expect(headerTotalPagesLabel.textContent.trim()).toBe(String(expectedCleanCount));

    // 3. Cockpit state check
    const state = getCockpitState();
    expect(state.totalPages).toBe(expectedCleanCount);
  });
});
