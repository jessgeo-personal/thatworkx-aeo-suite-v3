/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Homepage Logo Assets & Brand Consistency Contract (Gate 3 & Gate 5)', () => {
  let htmlContent;
  let frontendDir;

  beforeEach(() => {
    frontendDir = path.resolve(process.cwd(), 'frontend');
    const htmlPath = path.resolve(frontendDir, 'index.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  describe('Header Navbar Brand Logo', () => {
    it('renders the official Thatworkx AEO Suite logo in the header with verified asset path', () => {
      const headerLogo = document.querySelector('header .nav-brand img, header .logo-container img, .navbar-brand img, #site-logo');
      expect(headerLogo).not.toBeNull();

      const src = headerLogo.getAttribute('src');
      expect(src).toMatch(/ai-thatworkx-logo(-white|-dark)?\.png/i);

      // Verify asset actually exists on disk (prevents broken 404 links)
      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetExists = 
        fs.existsSync(path.resolve(frontendDir, cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src', cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src/images', path.basename(src)));
      expect(assetExists).toBe(true);

      // Gate 5: Accessibility
      expect(headerLogo.getAttribute('alt')).toMatch(/thatworkx|aeo suite/i);
    });
  });

  describe('Product Suite Module Logos (AI Optimize, AI Visualize, AI Socialize)', () => {
    it('renders the AI Optimize logo in the product showcase/bento section with verified asset path', () => {
      const aioLogo = document.querySelector('[data-product="optimize"] img, .card-optimize img, .module-aio img, img[alt*="AI Optimize"]');
      expect(aioLogo).not.toBeNull();

      const src = aioLogo.getAttribute('src');
      expect(src).toMatch(/(aio-(dark|light)-logo\.png|aioptimize-logo\.svg)/i);

      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetExists = 
        fs.existsSync(path.resolve(frontendDir, cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src', cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src/images', path.basename(src)));
      expect(assetExists).toBe(true);

      expect(aioLogo.getAttribute('alt')).toMatch(/ai optimize/i);
    });

    it('renders the AI Visualize logo in the product showcase/bento section with verified asset path', () => {
      const aivLogo = document.querySelector('[data-product="visualize"] img, .card-visualize img, .module-aiv img, img[alt*="AI Visualize"]');
      expect(aivLogo).not.toBeNull();

      const src = aivLogo.getAttribute('src');
      expect(src).toMatch(/(aiv-(dark|light)-logo\.png|aivisualize-logo\.png)/i);

      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetExists = 
        fs.existsSync(path.resolve(frontendDir, cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src', cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src/images', path.basename(src)));
      expect(assetExists).toBe(true);

      expect(aivLogo.getAttribute('alt')).toMatch(/ai visualize/i);
    });

    it('renders the AI Socialize logo in the product showcase/bento section with verified asset path', () => {
      const aisLogo = document.querySelector('[data-product="socialize"] img, .card-socialize img, .module-ais img, img[alt*="AI Socialize"]');
      expect(aisLogo).not.toBeNull();

      const src = aisLogo.getAttribute('src');
      expect(src).toMatch(/(ais-(dark|light)-logo\.png|aisocialize-logo\.png)/i);

      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetExists = 
        fs.existsSync(path.resolve(frontendDir, cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src', cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src/images', path.basename(src)));
      expect(assetExists).toBe(true);

      expect(aisLogo.getAttribute('alt')).toMatch(/ai socialize/i);
    });
  });

  describe('Footer Brand Logo', () => {
    it('renders the official brand logo in the footer with verified asset path', () => {
      const footerLogo = document.querySelector('footer .footer-brand img, footer .footer-logo img, footer img[alt*="Thatworkx"]');
      expect(footerLogo).not.toBeNull();

      const src = footerLogo.getAttribute('src');
      expect(src).toMatch(/ai-thatworkx-logo(-white|-dark)?\.png/i);

      const cleanPath = src.replace(/^\.\//, '').replace(/^\//, '');
      const assetExists = 
        fs.existsSync(path.resolve(frontendDir, cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src', cleanPath)) ||
        fs.existsSync(path.resolve(frontendDir, 'src/images', path.basename(src)));
      expect(assetExists).toBe(true);

      expect(footerLogo.getAttribute('alt')).toMatch(/thatworkx|aeo suite/i);
    });
  });

  describe('Strict Governance Audits', () => {
    it('strictly satisfies Banned Terms Gate across all logo elements (Gate 3)', () => {
      const logoImgs = document.querySelectorAll('img');
      logoImgs.forEach((img) => {
        const alt = img.getAttribute('alt') || '';
        const title = img.getAttribute('title') || '';
        expect(alt).not.toMatch(/ai-first/i);
        expect(title).not.toMatch(/ai-first/i);
      });
    });
  });
});
