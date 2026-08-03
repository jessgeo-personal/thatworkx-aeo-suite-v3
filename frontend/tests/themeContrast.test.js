import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Theme Contrast & Infrastructure Preservation Suite', () => {
  const indexJsPath = path.resolve(__dirname, '../index.js');
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');

  const indexJsContent = fs.readFileSync(indexJsPath, 'utf8');
  const indexCssContent = fs.readFileSync(indexCssPath, 'utf8');
  const visualizeHtmlContent = fs.readFileSync(visualizeHtmlPath, 'utf8');

  it('1. Asserts [AEO-Infotip-Debug] console logging and API_BASE definitions remain strictly intact in index.js', () => {
    expect(indexJsContent).toContain('[AEO-Infotip-Debug]');
    expect(indexJsContent).toContain('Click Intercepted on:');
    expect(indexJsContent).toContain('Matched Trigger Element:');
    expect(indexJsContent).toContain('Extracted Datasets:');
    expect(indexJsContent).toContain('Found Modal Element in DOM:');
    expect(indexJsContent).toContain('const API_BASE =');
    expect(indexJsContent).toContain('window.API_BASE = API_BASE;');
  });

  it('2. Asserts frontend/index.css contains .dark-card-locked and body.light-theme section title overrides', () => {
    expect(indexCssContent).toContain('.dark-card-locked');
    expect(indexCssContent).toContain('body.light-theme .dark-card-locked');
    expect(indexCssContent).toContain('body.light-theme');
    expect(indexCssContent).toContain('color: var(--text-primary, #0f172a) !important;');
  });

  it('3. Asserts Section 1 title uses theme-aware text-primary styling and does not use hardcoded #ffffff', () => {
    expect(visualizeHtmlContent).toContain('Section 1: Can AI see your website?');
    const sec1HeaderMatch = visualizeHtmlContent.match(/<h4[^>]*>\s*<span>Section 1: Can AI see your website\?<\/span>/i);
    expect(sec1HeaderMatch).toBeTruthy();
    expect(sec1HeaderMatch[0]).toContain('color: var(--text-primary)');
    expect(sec1HeaderMatch[0]).not.toContain('color: #ffffff');
  });

  it('4. Asserts zero occurrences of legacy phrase "AI-first"', () => {
    expect(/AI-first/i.test(indexJsContent)).toBe(false);
    expect(/AI-first/i.test(indexCssContent)).toBe(false);
    expect(/AI-first/i.test(visualizeHtmlContent)).toBe(false);
  });
});
