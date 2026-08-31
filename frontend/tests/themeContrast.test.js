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

  it('6. Asserts 3D status badge tokens, executive drawer styles, and typography configurations exist in index.css', () => {
    // 1. Tactile 3D status badges
    expect(indexCssContent).toContain('.status-badge--pass');
    expect(indexCssContent).toContain('background: linear-gradient(180deg, #064e3b 0%, #022c22 100%);');
    expect(indexCssContent).toContain('border: 1px solid #10b981;');
    expect(indexCssContent).toContain('box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4), 0 0 12px rgba(16,185,129,0.25);');

    expect(indexCssContent).toContain('.status-badge--warning');
    expect(indexCssContent).toContain('background: linear-gradient(180deg, #78350f 0%, #451a03 100%);');
    expect(indexCssContent).toContain('border: 1px solid #f59e0b;');
    expect(indexCssContent).toContain('box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4), 0 0 12px rgba(245,158,11,0.25);');

    expect(indexCssContent).toContain('.status-badge--blocked');
    expect(indexCssContent).toContain('background: linear-gradient(180deg, #881337 0%, #4c0519 100%);');
    expect(indexCssContent).toContain('border: 1px solid #f43f5e;');
    expect(indexCssContent).toContain('box-shadow: inset 0 1px 1px rgba(255,255,255,0.15), 0 2px 4px rgba(0,0,0,0.4), 0 0 14px rgba(244,63,94,0.35);');

    // 2. Expandable executive drawers
    expect(indexCssContent).toContain('details.executive-drawer');
    expect(indexCssContent).toContain('background: rgba(15, 23, 42, 0.6);');
    expect(indexCssContent).toContain('border: 1px solid rgba(255, 255, 255, 0.08);');
    expect(indexCssContent).toContain('border-radius: 8px;');
    expect(indexCssContent).toContain('details.executive-drawer summary');
    expect(indexCssContent).toContain('color: #38bdf8;');
    expect(indexCssContent).toContain('details.executive-drawer summary:hover');
    expect(indexCssContent).toContain('color: #7dd3fc;');

    // 3. Preservation checks
    expect(indexCssContent).toContain('.score-dial-card');
    expect(indexCssContent).toContain('.executive-drawer');

    // 4. Typography rules
    // Plus Jakarta Sans for headings & body
    expect(indexCssContent).toMatch(/font-family:[^;]*'Plus Jakarta Sans'/i);
    // JetBrains Mono for values, scores, and HTTP telemetry
    expect(indexCssContent).toMatch(/font-family:[^;]*'JetBrains Mono'/i);
  });
});
