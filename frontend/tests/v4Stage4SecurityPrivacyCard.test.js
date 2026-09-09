/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4Stage4SecurityPrivacyCard.test.js
 * @description BDD RED Phase Test Suite for Stage 4 Card 4: Security & Privacy Protocols
 * 
 * STRICT GOVERNANCE COMPLIANCE:
 * - "AI-Optimized" Gate: Human-centric presence and organizational trust signals.
 * - Banned Terms Gate: Zero occurrences of "AI-first".
 * - Data Integrity Gate: Zero mock fallbacks. Pre-scan states must show "--" / "UNAUDITED".
 * - DOM Pre-rendering Gate: Educational text and compliance notes must be static DOM elements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 4 - Card 4: Security & Privacy Protocols Component', () => {
  let htmlDoc;
  let visualizeModule;

  beforeEach(async () => {
    // Reset DOM environment using the actual visualize.html markup
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
    visualizeModule = await import('../visualize.js');
  });

  describe('1. DOM Structure & Pre-rendered Static Elements Gate', () => {
    it('should pre-render the Card 4 container with correct data attributes and semantic ID', () => {
      const card = document.querySelector('[data-card="security-privacy"]');
      expect(card, 'Card 4 container [data-card="security-privacy"] must exist in DOM').not.toBeNull();
      expect(card.id).toBe('stage4-card-security-privacy');
    });

    it('should pre-render static card title and security shield/lock indicator', () => {
      const card = document.getElementById('stage4-card-security-privacy');
      const titleEl = card.querySelector('.card-title, h4, .stage4-card-header h3');
      expect(titleEl).not.toBeNull();
      expect(titleEl.textContent.trim()).toMatch(/Security & Privacy/i);

      // Icon or visual glyph for security
      const iconEl = card.querySelector('.security-icon, [data-icon="security"]');
      expect(iconEl, 'Security icon indicator must exist').not.toBeNull();
    });

    it('should pre-render educational compliance copy explaining AI search engine trust', () => {
      const card = document.getElementById('stage4-card-security-privacy');
      const noteEl = card.querySelector('.compliance-note, .card-footer-note');
      expect(noteEl, 'Static educational compliance note must be pre-rendered in DOM').not.toBeNull();
      expect(noteEl.textContent).toContain('HTTPS encryption and legal compliance anchors');
      expect(noteEl.textContent).not.toMatch(/AI-first/i);
    });
  });

  describe('2. Sub-Component Item Metrics & Slots', () => {
    it('should contain dedicated metric slots for SSL/HTTPS, Privacy Policy, and Terms of Service', () => {
      const card = document.getElementById('stage4-card-security-privacy');

      const sslSlot = card.querySelector('[data-metric="ssl-protocol"]');
      const privacySlot = card.querySelector('[data-metric="privacy-policy"]');
      const termsSlot = card.querySelector('[data-metric="terms-of-service"]');

      expect(sslSlot, 'SSL protocol metric slot must exist').not.toBeNull();
      expect(privacySlot, 'Privacy Policy metric slot must exist').not.toBeNull();
      expect(termsSlot, 'Terms of Service metric slot must exist').not.toBeNull();
    });

    it('should contain a top-level stage status pill slot', () => {
      const card = document.getElementById('stage4-card-security-privacy');
      const pill = card.querySelector('.status-pill, [data-slot="card-status-pill"]');
      expect(pill, 'Card status pill slot must exist').not.toBeNull();
    });
  });

  describe('3. Data Integrity & Zero-Mock Baseline Gate', () => {
    it('should display graceful un-audited defaults ("--") when no scan data is loaded', () => {
      const card = document.getElementById('stage4-card-security-privacy');
      
      const sslValue = card.querySelector('[data-metric="ssl-protocol"] .metric-value');
      const privacyValue = card.querySelector('[data-metric="privacy-policy"] .metric-value');
      const termsValue = card.querySelector('[data-metric="terms-of-service"] .metric-value');
      const statusPill = card.querySelector('[data-slot="card-status-pill"]');

      // Verify no optimistic boolean defaults (true, 100%, Valid) leak before scanning
      expect(sslValue.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(privacyValue.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(termsValue.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(statusPill.textContent.trim()).toMatch(/^(--|PENDING|UNAUDITED)$/);
    });
  });

  describe('4. Dynamic Renderer Binding & Compliance States', () => {
    let visualizeModule;

    beforeEach(async () => {
      // Import visualize.js to test dynamic render bindings
      visualizeModule = await import('../visualize.js');
    });

    it('should render CONFIRMED state with green pills when HTTPS is enforced and all legal pages exist', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        isHttps: true,
        sslValid: true,
        pages: [
          { url: 'https://thatworkx.com/privacy-policy' },
          { url: 'https://thatworkx.com/terms-of-service' }
        ],
        missingEssentialPages: []
      };

      if (typeof visualizeModule.renderStage4SecurityCard === 'function') {
        visualizeModule.renderStage4SecurityCard(mockState);
      } else if (typeof window.renderStage4SecurityCard === 'function') {
        window.renderStage4SecurityCard(mockState);
      }

      const card = document.getElementById('stage4-card-security-privacy');
      const statusPill = card.querySelector('[data-slot="card-status-pill"]');
      const sslVal = card.querySelector('[data-metric="ssl-protocol"] .metric-value');
      const privacyVal = card.querySelector('[data-metric="privacy-policy"] .metric-value');
      const termsVal = card.querySelector('[data-metric="terms-of-service"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('CONFIRMED');
      expect(statusPill.classList.contains('pill-success') || statusPill.classList.contains('pill-confirmed')).toBe(true);
      expect(sslVal.textContent).toMatch(/HTTPS Enforced/i);
      expect(privacyVal.textContent).toMatch(/Detected \(\/privacy-policy\)/i);
      expect(termsVal.textContent).toMatch(/Detected \(\/terms-of-service\)/i);
    });

    it('should render WARNING state when HTTPS is valid but Privacy Policy or Terms of Service is missing', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        isHttps: true,
        sslValid: true,
        pages: [],
        missingEssentialPages: ['/privacy-policy', '/terms-of-service']
      };

      if (typeof visualizeModule.renderStage4SecurityCard === 'function') {
        visualizeModule.renderStage4SecurityCard(mockState);
      } else if (typeof window.renderStage4SecurityCard === 'function') {
        window.renderStage4SecurityCard(mockState);
      }

      const card = document.getElementById('stage4-card-security-privacy');
      const statusPill = card.querySelector('[data-slot="card-status-pill"]');
      const privacyVal = card.querySelector('[data-metric="privacy-policy"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('WARNING');
      expect(statusPill.classList.contains('pill-warning')).toBe(true);
      expect(privacyVal.textContent).toMatch(/Missing \(\/privacy-policy\)/i);
    });

    it('should render CRITICAL state when protocol is insecure HTTP', () => {
      const mockState = {
        targetUrl: 'http://insecure-example.com',
        isHttps: false,
        sslValid: false,
        pages: [],
        missingEssentialPages: ['/privacy-policy']
      };

      if (typeof visualizeModule.renderStage4SecurityCard === 'function') {
        visualizeModule.renderStage4SecurityCard(mockState);
      } else if (typeof window.renderStage4SecurityCard === 'function') {
        window.renderStage4SecurityCard(mockState);
      }

      const card = document.getElementById('stage4-card-security-privacy');
      const statusPill = card.querySelector('[data-slot="card-status-pill"]');
      const sslVal = card.querySelector('[data-metric="ssl-protocol"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('CRITICAL');
      expect(statusPill.classList.contains('pill-critical') || statusPill.classList.contains('pill-danger')).toBe(true);
      expect(sslVal.textContent).toMatch(/Insecure HTTP/i);
    });
  });

  describe('5. Error Tracking & Notification Integration Gate', () => {
    it('should dispatch an error log tracking event when scan data is completely absent on render attempt', () => {
      const errorLogSpy = vi.fn();
      window.addEventListener('aeo:error-log', (e) => errorLogSpy(e.detail));

      if (typeof visualizeModule?.renderStage4SecurityCard === 'function') {
        visualizeModule.renderStage4SecurityCard(null);
      }

      expect(errorLogSpy).toHaveBeenCalledWith(expect.objectContaining({
        stage: 4,
        card: 'security-privacy',
        action: 'rescan_required'
      }));
    });
  });
});