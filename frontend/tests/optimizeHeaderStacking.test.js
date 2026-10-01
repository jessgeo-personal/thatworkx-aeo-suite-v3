/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('optimize.html Header Stacking Context & Side Drawer Elevation', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(process.cwd(), 'frontend/optimize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Header Stacking Context & Isolation', () => {
    it('header does not contain legacy .app-header class that imposes z-100', () => {
      const header = document.querySelector('header');
      expect(header).not.toBeNull();
      // .app-header in index.css sets z-index: 100, breaking drawer stacking
      expect(header.classList.contains('app-header')).toBe(false);
    });

    it('header specifies z-30 class matching visualize.html architecture', () => {
      const header = document.querySelector('header');
      expect(header).not.toBeNull();
      expect(header.classList.contains('z-30')).toBe(true);
    });

    it('links visualize.css in optimize.html for 3D glow & slider drawer elevations', () => {
      const link = document.querySelector('link[href="visualize.css"]');
      expect(link).not.toBeNull();
      expect(link.getAttribute('rel')).toBe('stylesheet');
    });
  });

  describe('Drawer & Backdrop Elevation Precedence', () => {
    it('elevates side slider drawer (z-50) and backdrop (z-40) above the header (z-30)', () => {
      const header = document.querySelector('header');
      const sidebar = document.getElementById('main-terminal-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');

      expect(header).not.toBeNull();
      expect(sidebar).not.toBeNull();
      expect(backdrop).not.toBeNull();

      const parseZIndex = (el) => {
        const match = el.className.match(/\bz-(\d+)\b/);
        return match ? parseInt(match[1], 10) : null;
      };

      const headerZ = parseZIndex(header);
      const backdropZ = parseZIndex(backdrop);
      const sidebarZ = parseZIndex(sidebar);

      expect(headerZ).toBe(30);
      expect(backdropZ).toBe(40);
      expect(sidebarZ).toBe(50);

      // Verify strict layer elevation
      expect(sidebarZ).toBeGreaterThan(backdropZ);
      expect(backdropZ).toBeGreaterThan(headerZ);
    });
  });

  describe('Strict Governance Audits', () => {
    it('strictly satisfies Banned Terms Gate (zero occurrences of "AI-first")', () => {
      const htmlPath = path.resolve(process.cwd(), 'frontend/optimize.html');
      const content = fs.readFileSync(htmlPath, 'utf8');
      expect(content).not.toMatch(/ai-first/i);
    });
  });
});
