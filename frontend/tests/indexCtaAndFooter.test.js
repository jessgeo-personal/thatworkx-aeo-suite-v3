/**
 * @vitest-environment jsdom
 * @file indexCtaAndFooter.test.js
 * @description BDD Test Suite for Slice 5:
 * - Section 8: High-Conversion Moving-Border CTA Deck (#onboarding-final-cta)
 * - Section 9: 5-Column Mega-Footer Sitemap & Compliance Bar (#global-footer)
 * Enforces strict "AI-Ready" / "AI-Optimized" governance, zero "AI-first" violations,
 * DOM pre-rendering of footer sitemap links, and accessible interactive hooks.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(__dirname, '../index.html');

describe('Slice 5: Section 8 (CTA Deck) & Section 9 (Mega-Footer Sitemap)', () => {
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  describe('1. Section 8: High-Conversion CTA Deck (#onboarding-final-cta)', () => {
    it('should pre-render #onboarding-final-cta with high-impact conversion copy', () => {
      const ctaSection = document.querySelector('#onboarding-final-cta');
      expect(ctaSection, '#onboarding-final-cta must exist in static HTML').not.toBeNull();

      const heading = ctaSection.querySelector('h2');
      expect(heading, 'CTA section must contain an H2 heading').not.toBeNull();
      expect(heading.textContent.trim().length).toBeGreaterThan(10);
    });

    it('should contain a primary scan CTA trigger and an enterprise consultation link', () => {
      const ctaSection = document.querySelector('#onboarding-final-cta');
      expect(ctaSection).not.toBeNull();

      const primaryCta = ctaSection.querySelector('#btn-cta-scan, a[href="#onboarding-scan-form"], a[href="#hero-scan"]');
      const enterpriseLink = ctaSection.querySelector('a[href*="demo"], a[href*="contact"], a[target="_blank"]');

      expect(primaryCta, 'Primary scan CTA action must exist').not.toBeNull();
      expect(enterpriseLink, 'Enterprise demo / consultation link must exist').not.toBeNull();
      
      if (enterpriseLink.getAttribute('target') === '_blank') {
        expect(enterpriseLink.getAttribute('rel')).toMatch(/noopener/);
      }
    });

    it('should pass strict terminology governance in CTA section', () => {
      const ctaSection = document.querySelector('#onboarding-final-cta');
      expect(ctaSection).not.toBeNull();

      // Zero banned terms
      expect(ctaSection.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('2. Section 9: Mega-Footer Sitemap & Compliance Bar (#global-footer)', () => {
    it('should pre-render #global-footer with structured sitemap columns', () => {
      const footer = document.querySelector('#global-footer, footer');
      expect(footer, '#global-footer or <footer> must exist in DOM').not.toBeNull();

      // Verify presence of sitemap columns (Product, Machine Manifests, Resources, Legal/Compliance)
      const columns = footer.querySelectorAll('.footer-col, .footer-column, [data-footer-col]');
      expect(columns.length).toBeGreaterThanOrEqual(4);
    });

    it('should include explicit machine manifest links in the sitemap (/robots.txt, /llms.txt, /ai-context.md)', () => {
      const footer = document.querySelector('#global-footer, footer');
      expect(footer).not.toBeNull();

      const footerHtml = footer.innerHTML;
      expect(footerHtml).toMatch(/robots\.txt/i);
      expect(footerHtml).toMatch(/llms\.txt/i);
      expect(footerHtml).toMatch(/ai-context\.md/i);
    });

    it('should include platform status indicator, copyright, and compliance/privacy links', () => {
      const footer = document.querySelector('#global-footer, footer');
      expect(footer).not.toBeNull();

      const statusBadge = footer.querySelector('.footer-status, .system-status-indicator, [data-system-status]');
      const privacyLink = footer.querySelector('a[href*="privacy"], a[href*="terms"], a[href*="security"]');

      expect(statusBadge, 'Operational status indicator must exist').not.toBeNull();
      expect(privacyLink, 'Compliance / Legal links must exist').not.toBeNull();
      expect(footer.textContent).toMatch(/Thatworkx|All rights reserved/i);
    });

    it('should pass strict terminology governance across the entire footer', () => {
      const footer = document.querySelector('#global-footer, footer');
      expect(footer).not.toBeNull();

      // Zero banned terms
      expect(footer.innerHTML).not.toMatch(/ai-first/i);
    });
  });
});
