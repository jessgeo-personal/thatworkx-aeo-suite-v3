import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AIVisualize Dashboard Visual Integrity & Typography CSS BDD Suite', () => {
  const htmlPath = path.resolve(__dirname, '../visualize.html');
  const cssPath = path.resolve(__dirname, '../index.css');
  const packagePath = path.resolve(__dirname, '../../package.json');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const cssContent = fs.readFileSync(cssPath, 'utf8');
  const packageContent = fs.readFileSync(packagePath, 'utf8');

  it('Scenario 1: Single Header and Footer DOM Count', () => {
    // Count exact occurrences of header and footer tags
    const headerCount = (htmlContent.match(/<header\b[^>]*>/gi) || []).length;
    const footerCount = (htmlContent.match(/<footer\b[^>]*>/gi) || []).length;

    expect(headerCount).toBe(1);
    expect(footerCount).toBe(1);
  });

  it('Scenario 2: Package Command Decoupling from test scripts', () => {
    const pkg = JSON.parse(packageContent);
    const testScript = pkg.scripts?.test || '';
    
    // Test script must not run build-layouts.js
    expect(testScript).not.toContain('build-layouts.js');
  });

  it('Scenario 3: CSS Design Token Adherence & Typography Decay Prevention', () => {
    // Assert :root variables
    expect(cssContent).toContain('--canvas-bg: #202124');
    expect(cssContent).toContain('--surface-bg: #1f1f1f');
    expect(cssContent).toContain('--burnt-copper: #b7410e');
    expect(cssContent).toContain('--text-primary: #ffffff');

    // Typography: Check that body or main layout elements do not use compounding relative "em" or "%" for base font sizing
    // We expect rem values to prevent shrinking font sizes
    expect(cssContent).toContain('font-size: 1rem');
    expect(cssContent).toContain('font-size: 0.875rem');
  });

  it('Scenario 4: Banned vocabulary check', () => {
    expect(/AI-first/i.test(htmlContent)).toBe(false);
    expect(/AI-first/i.test(cssContent)).toBe(false);
  });
});
