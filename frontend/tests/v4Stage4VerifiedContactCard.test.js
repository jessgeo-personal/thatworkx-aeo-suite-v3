/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4Stage4VerifiedContactCard.test.js
 * @description BDD RED Phase Test Suite for Stage 4 Card 5: Verified Contact Anchors
 * 
 * STRICT GOVERNANCE COMPLIANCE:
 * - "AI-Optimized" Gate: Human-centric presence and organizational trust signals.
 * - Banned Terms Gate: ZERO occurrences of "AI-first".
 * - Data Integrity Gate: Zero mock fallbacks. Pre-scan states must show "--" / "UNAUDITED".
 * - DOM Pre-rendering Gate: Educational copy and compliance notes must be static DOM elements.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 4 - Card 5: Verified Contact Anchors Component', () => {
  let visualizeModule;

  beforeEach(async () => {
    // Reset DOM environment using the live visualize.html markup
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
    visualizeModule = await import('../visualize.js');
  });

  describe('1. DOM Structure & Pre-rendered Static Elements Gate', () => {
    it('should pre-render the Card 5 container with correct semantic attributes and ID', () => {
      const card = document.querySelector('[data-card="verified-contact"]');
      expect(card, 'Card 5 container [data-card="verified-contact"] must exist in DOM').not.toBeNull();
      expect(card.id).toBe('stage4-card-contact-anchors');
    });

    it('should pre-render static card title and contact icon indicator', () => {
      const card = document.getElementById('stage4-card-contact-anchors');
      const titleEl = card.querySelector('.card-title, h4, .stage4-card-header h3');
      expect(titleEl).not.toBeNull();
      expect(titleEl.textContent.trim()).toMatch(/Verified Contact Anchors/i);

      const iconEl = card.querySelector('.contact-icon, [data-icon="contact"]');
      expect(iconEl, 'Contact icon indicator must exist').not.toBeNull();
    });

    it('should pre-render static educational compliance copy without banned terms', () => {
      const card = document.getElementById('stage4-card-contact-anchors');
      const noteEl = card.querySelector('.compliance-note, .card-footer-note');
      expect(noteEl, 'Static educational compliance note must be pre-rendered in DOM').not.toBeNull();
      expect(noteEl.textContent).toContain('Direct organizational contact endpoints and schema PostalAddress');
      expect(noteEl.textContent).not.toMatch(/AI-first/i);
    });
  });

  describe('2. Sub-Component Metric Slots Gate', () => {
    it('should contain dedicated metric slots for Email, Phone, and Address', () => {
      const card = document.getElementById('stage4-card-contact-anchors');

      const emailSlot = card.querySelector('[data-metric="contact-email"]');
      const phoneSlot = card.querySelector('[data-metric="contact-phone"]');
      const addressSlot = card.querySelector('[data-metric="contact-address"]');

      expect(emailSlot, 'Email metric slot must exist').not.toBeNull();
      expect(phoneSlot, 'Phone metric slot must exist').not.toBeNull();
      expect(addressSlot, 'Address metric slot must exist').not.toBeNull();
    });

    it('should contain a top-level stage status pill slot', () => {
      const card = document.getElementById('stage4-card-contact-anchors');
      const pill = card.querySelector('.status-pill, [data-slot="contact-status-pill"]');
      expect(pill, 'Card contact status pill slot must exist').not.toBeNull();
    });
  });

  describe('3. Data Integrity & Zero-Mock Baseline Gate', () => {
    it('should display graceful un-audited defaults ("--") when no scan data is loaded', () => {
      const card = document.getElementById('stage4-card-contact-anchors');

      const emailVal = card.querySelector('[data-metric="contact-email"] .metric-value');
      const phoneVal = card.querySelector('[data-metric="contact-phone"] .metric-value');
      const addressVal = card.querySelector('[data-metric="contact-address"] .metric-value');
      const statusPill = card.querySelector('[data-slot="contact-status-pill"]');

      expect(emailVal.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(phoneVal.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(addressVal.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      expect(statusPill.textContent.trim()).toMatch(/^(--|PENDING|UNAUDITED)$/);
    });
  });

  describe('4. Dynamic Renderer Binding & Multi-Source Extraction States', () => {
    it('should render CONFIRMED state with green pills when email and phone or address are verified', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        contact: {
          email: 'support@thatworkx.com',
          phone: '+1 (555) 019-2834',
          address: 'San Francisco, CA, USA'
        }
      };

      if (typeof visualizeModule.renderStage4ContactCard === 'function') {
        visualizeModule.renderStage4ContactCard(mockState);
      } else if (typeof window.renderStage4ContactCard === 'function') {
        window.renderStage4ContactCard(mockState);
      }

      const card = document.getElementById('stage4-card-contact-anchors');
      const statusPill = card.querySelector('[data-slot="contact-status-pill"]');
      const emailVal = card.querySelector('[data-metric="contact-email"] .metric-value');
      const phoneVal = card.querySelector('[data-metric="contact-phone"] .metric-value');
      const addressVal = card.querySelector('[data-metric="contact-address"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('CONFIRMED');
      expect(statusPill.classList.contains('pill-confirmed') || statusPill.classList.contains('pill-success')).toBe(true);
      expect(emailVal.textContent).toContain('support@thatworkx.com');
      expect(phoneVal.textContent).toContain('+1 (555) 019-2834');
      expect(addressVal.textContent).toContain('San Francisco, CA, USA');
    });

    it('should extract contact details from mailto/tel links or Schema fallback when root object is omitted', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        pages: [
          {
            url: 'https://thatworkx.com/contact',
            links: ['mailto:info@thatworkx.com', 'tel:+18005550199'],
            schema: [
              {
                '@type': 'Organization',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Austin',
                  addressRegion: 'TX'
                }
              }
            ]
          }
        ]
      };

      if (typeof visualizeModule.renderStage4ContactCard === 'function') {
        visualizeModule.renderStage4ContactCard(mockState);
      } else if (typeof window.renderStage4ContactCard === 'function') {
        window.renderStage4ContactCard(mockState);
      }

      const card = document.getElementById('stage4-card-contact-anchors');
      const emailVal = card.querySelector('[data-metric="contact-email"] .metric-value');
      const phoneVal = card.querySelector('[data-metric="contact-phone"] .metric-value');
      const addressVal = card.querySelector('[data-metric="contact-address"] .metric-value');

      expect(emailVal.textContent).toContain('info@thatworkx.com');
      expect(phoneVal.textContent).toContain('+18005550199');
      expect(addressVal.textContent).toMatch(/Austin,\s*TX/i);
    });

    it('should render WARNING state when only email is verified but phone and address are missing', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        contact: {
          email: 'hello@thatworkx.com',
          phone: null,
          address: null
        }
      };

      if (typeof visualizeModule.renderStage4ContactCard === 'function') {
        visualizeModule.renderStage4ContactCard(mockState);
      } else if (typeof window.renderStage4ContactCard === 'function') {
        window.renderStage4ContactCard(mockState);
      }

      const card = document.getElementById('stage4-card-contact-anchors');
      const statusPill = card.querySelector('[data-slot="contact-status-pill"]');
      const phoneVal = card.querySelector('[data-metric="contact-phone"] .metric-value');
      const addressVal = card.querySelector('[data-metric="contact-address"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('WARNING');
      expect(statusPill.classList.contains('pill-warning')).toBe(true);
      expect(phoneVal.textContent).toMatch(/None Detected/i);
      expect(addressVal.textContent).toMatch(/None Detected/i);
    });

    it('should render CRITICAL state when zero contact endpoints are discovered', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        contact: {
          email: null,
          phone: null,
          address: null
        },
        pages: []
      };

      if (typeof visualizeModule.renderStage4ContactCard === 'function') {
        visualizeModule.renderStage4ContactCard(mockState);
      } else if (typeof window.renderStage4ContactCard === 'function') {
        window.renderStage4ContactCard(mockState);
      }

      const card = document.getElementById('stage4-card-contact-anchors');
      const statusPill = card.querySelector('[data-slot="contact-status-pill"]');
      const emailVal = card.querySelector('[data-metric="contact-email"] .metric-value');

      expect(statusPill.textContent.trim()).toBe('CRITICAL');
      expect(statusPill.classList.contains('pill-critical') || statusPill.classList.contains('pill-danger')).toBe(true);
      expect(emailVal.textContent).toMatch(/None Detected/i);
    });
  });

  describe('5. Error Tracking & Notification Integration Gate', () => {
    it('should dispatch an error log tracking event when scan data is completely absent on render attempt', () => {
      const errorLogSpy = vi.fn();
      window.addEventListener('aeo:error-log', (e) => errorLogSpy(e.detail));

      if (typeof visualizeModule?.renderStage4ContactCard === 'function') {
        visualizeModule.renderStage4ContactCard(null);
      } else if (typeof window.renderStage4ContactCard === 'function') {
        window.renderStage4ContactCard(null);
      }

      expect(errorLogSpy).toHaveBeenCalledWith(expect.objectContaining({
        stage: 4,
        card: 'verified-contact',
        action: 'rescan_required'
      }));
    });
  });
});
