/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4Stage4AddressModalAndContactFix.test.js
 * @description BDD RED Phase Test Suite for Phone/Address Deshadowing and Address Guide Modal
 * 
 * STRICT ARCHITECTURAL GATES:
 * - "AI-Optimized" Gate: Human-centric presence and organizational trust signals.
 * - Banned Terms Gate: ZERO occurrences of "AI-first".
 * - Data Integrity Gate: Zero mock defaults; pre-scan states must show "--".
 * - DOM Pre-rendering Gate: Address guide modal must be pre-rendered in static DOM.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 4: Phone/Address Ingestion & Address Guide Modal', () => {
  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  describe('1. Address Guidance Modal DOM Pre-rendering Gate', () => {
    it('should pre-render #address-guide-modal container in visualize.html', () => {
      const modal = document.getElementById('address-guide-modal');
      expect(modal, 'Address guide modal #address-guide-modal must be pre-rendered in DOM').not.toBeNull();
      expect(modal.classList.contains('hidden') || modal.style.display === 'none').toBe(true);
    });

    it('should provide copyable Schema.org PostalAddress snippet and semantic HTML <address> snippet', () => {
      const modal = document.getElementById('address-guide-modal');
      const schemaSnippet = modal.querySelector('#address-schema-snippet');
      const htmlSnippet = modal.querySelector('#address-html-snippet');

      expect(schemaSnippet, 'Schema.org PostalAddress snippet must exist').not.toBeNull();
      expect(schemaSnippet.textContent).toContain('"@type": "PostalAddress"');

      expect(htmlSnippet, 'HTML <address> snippet must exist').not.toBeNull();
      expect(htmlSnippet.textContent).toContain('<address');
    });

    it('should contain copy buttons and modal close triggers', () => {
      const modal = document.getElementById('address-guide-modal');
      const copyButtons = modal.querySelectorAll('[data-action="copy-address-snippet"]');
      const closeBtn = modal.querySelector('[data-action="close-address-modal"]');

      expect(copyButtons.length).toBeGreaterThanOrEqual(1);
      expect(closeBtn).not.toBeNull();
    });

    it('should not contain any occurrence of banned term "AI-first"', () => {
      const modal = document.getElementById('address-guide-modal');
      expect(modal.innerHTML).not.toMatch(/AI-first/i);
    });
  });

  describe('2. Card 5 Dynamic Modal Trigger for Missing Address', () => {
    let visualizeModule;

    beforeEach(async () => {
      visualizeModule = await import('../visualize.js');
    });

    it('should surface a dedicated address guide link when address is not detected', () => {
      const mockState = {
        targetUrl: 'https://thatworkx.com',
        stage4: {
          contact: {
            email: 'info@thatworkx.com',
            phone: '+971529342175',
            address: null,
            trustAnchorCount: 2
          }
        }
      };

      visualizeModule.renderStage4Canvas(document.body, mockState);

      const card = document.getElementById('stage4-card-contact-anchors');
      const guideTrigger = card.querySelector('[data-action="open-address-guide"]');
      expect(guideTrigger, 'Card 5 must render a guide trigger when address is missing').not.toBeNull();
      expect(guideTrigger.textContent).toMatch(/Add Address for AI/i);
    });

    it('should open and close the address modal via global cockpit functions', () => {
      expect(typeof window.AEO_COCKPIT?.openAddressModal).toBe('function');
      expect(typeof window.AEO_COCKPIT?.closeAddressModal).toBe('function');

      const modal = document.getElementById('address-guide-modal');
      window.AEO_COCKPIT.openAddressModal();
      expect(modal.classList.contains('hidden')).toBe(false);

      window.AEO_COCKPIT.closeAddressModal();
      expect(modal.classList.contains('hidden') || modal.classList.contains('opacity-0')).toBe(true);
    });
  });

  describe('3. Phone and Address Deshadowing in Adapter Layer', () => {
    let adapterModule;

    beforeEach(async () => {
      adapterModule = await import('../v4PayloadAdapter.js');
    });

    it('should correctly ingest international phone from tel: links even if root contactDetails is "--"', () => {
      const rawScanPayload = {
        status: 'completed',
        targetUrl: 'https://thatworkx.com',
        contactDetails: {
          email: '--',
          phone: '--',
          address: '--'
        },
        pages: [
          {
            url: 'https://thatworkx.com',
            links: ['tel:+971529342175', 'mailto:info@thatworkx.com']
          }
        ]
      };

      const adapted = adapterModule.mapBackendScanToV4State(rawScanPayload);
      expect(adapted.stage4.contact.phone).toBe('+971529342175');
      expect(adapted.stage4.contact.email).toBe('info@thatworkx.com');
    });

    it('should correctly ingest address from HTML <address> tags attached to crawled pages', () => {
      const rawScanPayload = {
        status: 'completed',
        targetUrl: 'https://thatworkx.com',
        pages: [
          {
            url: 'https://thatworkx.com/contact',
            links: ['tel:+971529342175'],
            addressText: 'Dubai Internet City, Building 1, Dubai, UAE'
          }
        ]
      };

      const adapted = adapterModule.mapBackendScanToV4State(rawScanPayload);
      expect(adapted.stage4.contact.address).toBe('Dubai Internet City, Building 1, Dubai, UAE');
      expect(adapted.stage4.contact.trustAnchorCount).toBe(2);
    });
  });
});
