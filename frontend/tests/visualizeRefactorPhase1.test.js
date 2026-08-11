import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('AIVisualize Dashboard Refactor Phase 1 BDD Suite', () => {
  const htmlPath = path.resolve(__dirname, '../visualize.html');
  const cssPath = path.resolve(__dirname, '../index.css');
  const jsPath = path.resolve(__dirname, '../index.js');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  it('Scenario 1: Verify visualize.html contains NO duplicate class attributes on navigation headers', () => {
    // Regex matching any tag with two separate class attributes inside the same tag boundaries
    const duplicateClassRegex = /<[^>]*?\bclass="[^"]*"\s+[^>]*?\bclass="[^"]*"/i;
    expect(htmlContent).not.toMatch(duplicateClassRegex);
  });

  it('Scenario 2: Verify visualize.html contains NO invalid #grid CSS color strings or orphaned style braces }', () => {
    expect(htmlContent).not.toContain('#grid');
    // Check for inline style declarations containing an orphaned closing brace
    expect(htmlContent).not.toMatch(/style="[^"]*?\}[\s;]*"/);
  });

  it('Scenario 3: Verify Section 5 #aioptimize-action-banner CTA href points to optimize.html?section=blueprint', () => {
    const $ = cheerio.load(htmlContent);
    const cta = $('#aioptimize-action-banner #banner-activate-btn');
    expect(cta.length).toBe(1);
    expect(cta.attr('href')).toBe('optimize.html?section=blueprint');
  });

  it('Scenario 4: Verify visualize.html contains NO hidden fallback spans inside section cards', () => {
    const $ = cheerio.load(htmlContent);
    const cards = $('#exec-section1-card, #exec-section2-card, #exec-section3-card, #exec-section4-card');
    expect(cards.length).toBeGreaterThan(0);

    cards.each((i, card) => {
      const hiddenSpans = $(card).find('span').filter((j, span) => {
        const style = $(span).attr('style') || '';
        return style.replace(/\s+/g, '').includes('display:none');
      });
      expect(hiddenSpans.length).toBe(0);
    });
  });

  it('Scenario 5: Verify index.css defines standardized card theme classes', () => {
    expect(cssContent).toContain('.border-glow-cyan');
    expect(cssContent).toContain('.border-glow-emerald');
    expect(cssContent).toContain('.border-glow-amber');
    expect(cssContent).toContain('.border-glow-burnt');
  });

  it('Scenario 6: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first"', () => {
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
