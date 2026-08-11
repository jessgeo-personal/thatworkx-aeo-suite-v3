import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Floating Glass Dock Burnt Copper Polish BDD Suite', () => {
  const indexCssPath = path.resolve(__dirname, '../index.css');
  const visualizeHtmlPath = path.resolve(__dirname, '../visualize.html');
  const indexJsPath = path.resolve(__dirname, '../index.js');

  const cssContent = fs.readFileSync(indexCssPath, 'utf8');
  const htmlContent = fs.readFileSync(visualizeHtmlPath, 'utf8');
  const jsContent = fs.readFileSync(indexJsPath, 'utf8');

  it('Scenario 1: Verify #floating-glass-dock in index.css applies translucent Burnt Copper glass styling', () => {
    // Verify .floating-glass-dock class definition exists
    expect(cssContent).toContain('.floating-glass-dock');

    // Verify backdrop-filter is applied for the glassmorphic blur effect
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*backdrop-filter:\s*blur\(/);

    // Verify the border uses --burnt-copper or its variants/glow
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*border:[^;]*var\(--burnt-copper/);

    // Verify the background tint utilizes a Burnt Copper based shade or translucent tint
    expect(cssContent).toMatch(/\.floating-glass-dock\s*\{[^}]*background:[^;]*(var\(--burnt-copper|rgba\(183,\s*65,\s*14,|rgba\(27,\s*12,\s*8,)/);
  });

  it('Scenario 2: Verify #floating-glass-dock link anchors map correctly to the four section cards', () => {
    // Assert the anchor href attributes match the specific IDs in order
    expect(htmlContent).toContain('href="#section-1-card"');
    expect(htmlContent).toContain('href="#section-2-card"');
    expect(htmlContent).toContain('href="#section-3-card"');
    expect(htmlContent).toContain('href="#section-4-card"');
  });

  it('Scenario 3: Verify .dock-link.active is styled using --burnt-copper with high-contrast text and glowing box-shadow', () => {
    expect(cssContent).toContain('.dock-link.active');

    // Verify active link styles use --burnt-copper variants
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*background:[^;]*var\(--burnt-copper/);
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*border:[^;]*var\(--burnt-copper/);
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*box-shadow:[^;]*var\(--burnt-copper-glow/);
    expect(cssContent).toMatch(/\.dock-link\.active\s*\{[^}]*color:\s*#fff/);
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first" across source files', () => {
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
