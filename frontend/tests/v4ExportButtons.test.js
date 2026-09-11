/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - JSON and PDF Export Functionality', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
    vi.restoreAllMocks();
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Scope Check: handleExport is exposed as an export and bound to window', async () => {
    const module = await import('../visualize.js');
    expect(typeof module.handleExport).toBe('function');
    expect(typeof window.handleExport).toBe('function');
  });

  it('JSON Export: downloads structured audit payload when audited', async () => {
    const { handleExport, renderCockpit } = await import('../visualize.js');

    // Populate mock audited state
    renderCockpit({
      targetUrl: 'https://thatworkx.com',
      healthScore: 88,
      statusLabel: 'AI-Optimized',
      totalPages: 12
    });

    // Mock URL.createObjectURL, URL.revokeObjectURL, and anchor click
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/mock-blob-uuid');
    const revokeObjectURLMock = vi.fn();
    globalThis.URL.createObjectURL = createObjectURLMock;
    globalThis.URL.revokeObjectURL = revokeObjectURLMock;

    let clickedAnchor = null;
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      const el = originalCreateElement(tagName);
      if (tagName.toLowerCase() === 'a') {
        el.click = vi.fn(() => {
          clickedAnchor = el;
        });
      }
      return el;
    });

    handleExport('JSON');

    expect(createObjectURLMock).toHaveBeenCalled();
    expect(clickedAnchor).not.toBeNull();
    expect(clickedAnchor.download).toMatch(/aeo-audit-thatworkx-com.*\.json/);
    expect(revokeObjectURLMock).toHaveBeenCalled();
  });

  it('PDF Export: triggers window.print()', async () => {
    const { handleExport } = await import('../visualize.js');
    const printSpy = vi.spyOn(window, 'print').mockImplementation(() => {});

    handleExport('PDF');

    expect(printSpy).toHaveBeenCalled();
  });

  it('Validation: alerts user if export is triggered while un-audited', async () => {
    const { handleExport, resetCockpitToNeutral } = await import('../visualize.js');
    resetCockpitToNeutral();

    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});

    handleExport('JSON');

    expect(alertSpy).toHaveBeenCalledWith(expect.stringMatching(/please run an audit scan first/i));
  });
});
