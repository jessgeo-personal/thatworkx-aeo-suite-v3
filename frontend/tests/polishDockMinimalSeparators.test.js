import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('Floating Glass Dock & Separators Polish BDD Suite', () => {
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');
  const indexJsPath = path.resolve(__dirname, '../index.js');

  const cssContent = fs.readFileSync(indexCssPath, 'utf8');
  const htmlContent = fs.readFileSync(visualizeHtmlPath, 'utf8');
  const jsContent = fs.readFileSync(indexJsPath, 'utf8');

  it('Scenario 1: Verify #floating-glass-dock in visualize.html NO LONGER contains .dock-score-section', () => {
    const $ = cheerio.load(htmlContent);
    const scoreSection = $('#floating-glass-dock .dock-score-section');
    expect(scoreSection.length).toBe(0);
  });

  it('Scenario 2: Verify dock navigation links include 🔄 Scan and 📊 Summary icons and map to their anchors', () => {
    const $ = cheerio.load(htmlContent);
    const scanLink = $('#floating-glass-dock .dock-link').filter((i, el) => $(el).text().includes('Scan'));
    const summaryLink = $('#floating-glass-dock .dock-link').filter((i, el) => $(el).text().includes('Summary'));

    expect(scanLink.length).toBe(1);
    expect(summaryLink.length).toBe(1);

    expect(scanLink.text()).toContain('🔄');
    expect(scanLink.text()).toContain('Scan');
    expect(scanLink.attr('href')).toBe('#control-toolbar-anchor');

    expect(summaryLink.text()).toContain('📊');
    expect(summaryLink.text()).toContain('Summary');
    expect(summaryLink.attr('href')).toBe('#summary-dial-anchor');
  });

  it('Scenario 3: Verify index.css contains a pipe separator rule (.dock-link:not(:last-child)::after or .dock-link::after) with content "|"', () => {
    expect(cssContent).toMatch(/\.dock-link(:not\(:last-child\)\s*)?::after\s*\{[^}]*content:\s*["']\|["']/);
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first" across index.css, visualize.html, and index.js', () => {
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
