import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('Floating Glass Dock Summary and Scan Links BDD Suite', () => {
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');
  const indexJsPath = path.resolve(__dirname, '../index.js');

  const cssContent = fs.readFileSync(indexCssPath, 'utf8');
  const htmlContent = fs.readFileSync(visualizeHtmlPath, 'utf8');
  const jsContent = fs.readFileSync(indexJsPath, 'utf8');

  it('Scenario 1: Verify #floating-glass-dock in visualize.html contains 6 navigation links', () => {
    const $ = cheerio.load(htmlContent);
    const dock = $('#floating-glass-dock');
    expect(dock.length).toBe(1);

    const links = dock.find('.dock-link');
    expect(links.length).toBe(6);

    const linkTexts = links.map((i, el) => $(el).text().trim()).get();
    expect(linkTexts.some(t => t.includes('Scan'))).toBe(true);
    expect(linkTexts.some(t => t.includes('Summary'))).toBe(true);
    expect(linkTexts).toContain('1. AI Access');
    expect(linkTexts).toContain('2. Page Content');
    expect(linkTexts).toContain('3. Brand Trust');
    expect(linkTexts).toContain('4. AI Blueprint');
  });

  it('Scenario 2: Verify Scan link targets #control-toolbar-anchor and Summary link targets #summary-dial-anchor', () => {
    const $ = cheerio.load(htmlContent);
    const scanLink = $('.dock-link').filter((i, el) => $(el).text().trim().includes('Scan'));
    const summaryLink = $('.dock-link').filter((i, el) => $(el).text().trim().includes('Summary'));

    expect(scanLink.attr('href')).toBe('#control-toolbar-anchor');
    expect(summaryLink.attr('href')).toBe('#summary-dial-anchor');
  });

  it('Scenario 3: Verify .dock-links in index.css applies overflow-x: auto and white-space: nowrap for mobile responsiveness', () => {
    expect(cssContent).toMatch(/\.dock-links\s*\{[^}]*overflow-x:\s*auto/);
    expect(cssContent).toMatch(/\.dock-links\s*\{[^}]*white-space:\s*nowrap/);
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first" across source files', () => {
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
