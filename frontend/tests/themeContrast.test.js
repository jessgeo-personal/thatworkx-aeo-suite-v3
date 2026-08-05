import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme Contrast & Infrastructure Preservation Suite', () => {
  const indexJsPath = path.resolve(__dirname, '../index.js');
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const indexHtmlPath = path.resolve(__dirname, '../index.html');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');
  const optimizeHtmlPath = path.resolve(__dirname, '../optimize.html');
  const socializeHtmlPath = path.resolve(__dirname, '../socialize.html');

  const indexJsContent = fs.readFileSync(indexJsPath, 'utf8');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');

  it('1. Asserts [AEO-Infotip-Debug] console logging and API_BASE definitions remain strictly intact in index.js', () => {
    expect(indexJsContent).toContain('[AEO-Infotip-Debug]');
    expect(indexJsContent).toContain('Click Intercepted on:');
    expect(indexJsContent).toContain('Matched Trigger Element:');
    expect(indexJsContent).toContain('Extracted Datasets:');
    expect(indexJsContent).toContain('Found Modal Element in DOM:');
    expect(indexJsContent).toContain('const API_BASE =');
    expect(indexJsContent).toContain('window.API_BASE = API_BASE;');
  });

  it('2. Asserts frontend/index.css contains .dark-card-locked, default dark variables, and zero light-theme selectors', () => {
    expect(indexCssContent).toContain('.dark-card-locked');
    expect(indexCssContent).not.toContain('body.light-theme');
    expect(indexCssContent).not.toContain('light-theme');

    // Confirm :root dark variables remain the default layout theme
    expect(indexCssContent).toContain('--canvas-bg: #202124');
    expect(indexCssContent).toContain('--surface-bg: #1f1f1f');
    expect(indexCssContent).toContain('--burnt-copper: #b7410e');
  });

  it('3. Asserts zero occurrences of legacy phrase "AI-first"', () => {
    expect(/AI-first/i.test(indexJsContent)).toBe(false);
    expect(/AI-first/i.test(indexCssContent)).toBe(false);
    expect(/AI-first/i.test(fs.readFileSync(visualizeHtmlPath, 'utf8'))).toBe(false);
  });

  it('4. Asserts strict Dark-Card isolation values remain intact in index.css', () => {
    expect(indexCssContent).toContain('background-color: #020617 !important;');
    expect(indexCssContent).toContain('color: #f8fafc !important;');
    expect(indexCssContent).toContain('color: #ffffff !important;');
    expect(indexCssContent).toContain('color: #cbd5e1 !important;');

    // DOM class tagging in index.js: outer adaptive-card wrappers & inner dark-card-locked split panes
    expect(indexJsContent).toContain('class="developer-matrix-card glassmorphic adaptive-card"');
    expect(indexJsContent).toContain('class="schema-builder-card glassmorphic adaptive-card"');
    expect(indexJsContent).toContain('class="machine-code-drawers-card glassmorphic adaptive-card"');
    expect(indexJsContent).toContain('class="dark-card-locked"');
    expect(indexJsContent).toContain('class="explainer-card glassmorphic adaptive-card"');
  });

  it('5. Asserts the theme toggle button is removed from all 4 HTML files and no structural elements are modified', () => {
    const htmlFiles = [indexHtmlPath, visualizeHtmlPath, optimizeHtmlPath, socializeHtmlPath];
    for (const filePath of htmlFiles) {
      const content = fs.readFileSync(filePath, 'utf8');
      // Verify no remaining theme toggle buttons are inside the layout
      expect(content).not.toContain('id="theme-toggle-btn"');
      expect(content).not.toContain('class="theme-toggle-btn"');

      // Verify page structures still have main sections and structures
      expect(content).toContain('<header class="app-header">');
    }
  });
});
