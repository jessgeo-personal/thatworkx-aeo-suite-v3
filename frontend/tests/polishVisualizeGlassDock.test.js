import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Floating Glass Dock Inverted Burnt Copper Polish BDD Suite', () => {
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');
  const indexJsPath = path.resolve(__dirname, '../index.js');

  const cssContent = fs.readFileSync(indexCssPath, 'utf8');
  const htmlContent = fs.readFileSync(visualizeHtmlPath, 'utf8');
  const jsContent = fs.readFileSync(indexJsPath, 'utf8');

  it('Scenario 1: Verify #floating-glass-dock in index.css applies luminous translucent copper glass styling', () => {
    expect(cssContent).toContain('.floating-glass-dock');

    // Verify backdrop-filter is applied
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*backdrop-filter:\s*blur\(/);

    // Verify the background is a luminous translucent copper glass styling using rgba(183, 65, 14, ...)
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*background:\s*rgba\(183,\s*65,\s*14,/);

    // Verify the border is a glowing border utilizing --burnt-copper-glow or --burnt-copper
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*border:[^;]*var\(--burnt-copper/);
  });

  it('Scenario 2: Verify #floating-glass-dock link anchors map correctly to the four section cards', () => {
    expect(htmlContent).toContain('href="#section-1-card"');
    expect(htmlContent).toContain('href="#section-2-card"');
    expect(htmlContent).toContain('href="#section-3-card"');
    expect(htmlContent).toContain('href="#section-4-card"');
  });

  it('Scenario 3: Verify .dock-link.active applies high-contrast dark/white active pill styling against the copper dock background', () => {
    expect(cssContent).toContain('.dock-link.active');

    // Verify high-contrast styling (active background is white and text color is a dark neutral)
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*background:\s*(#ffffff|#fff)/);
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*color:\s*(#121212|#1f1f1f|#202124)/);
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first" across source files', () => {
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
