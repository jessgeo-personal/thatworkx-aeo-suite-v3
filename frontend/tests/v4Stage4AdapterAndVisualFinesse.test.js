/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4Stage4AdapterAndVisualFinesse.test.js
 * @description BDD RED Phase Test Suite for Stage 4 Cards 4 & 5 Adapter Mapping and Visual Finesse
 * 
 * STRICT ARCHITECTURAL GATES ENFORCED:
 * 1. "AI-Optimized" Gate: Human-centric presence, organizational trust, and crawlability.
 * 2. Banned Terms Gate: ZERO occurrences of "AI-first".
 * 3. Data Integrity Gate: Zero mock fallbacks. Pre-scan states must show "--" / "UNAUDITED".
 * 4. DOM Pre-rendering Gate: Action links, compliance copy, and card scaffolds pre-rendered.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Stage 4 Cards 4 & 5: Adapter Ingestion & Elevated Visual Tokens', () => {
  beforeEach(() => {
    // Reset DOM environment to visualize.html baseline
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  describe('1. Adapter Layer Gate: v4PayloadAdapter.js Ingestion Mapping', () => {
    let adapterModule;

    beforeEach(async () => {
      adapterModule = await import('../v4PayloadAdapter.js');
    });

    it('should map raw backend scan results into normalized Stage 4 Security & Privacy state', () => {
      const rawBackendScan = {
        status: 'completed',
        targetUrl: 'https://thatworkx.com',
        protocol: 'https:',
        pages: [
          { url: 'https://thatworkx.com' },
          { url: 'https://thatworkx.com/privacy-policy' },
          { url: 'https://thatworkx.com/terms-of-service' }
        ],
        missingEssentialPages: []
      };

      const adapted = adapterModule.mapBackendScanToV4State(rawBackendScan);

      expect(adapted.stage4).toBeDefined();
      expect(adapted.stage4.isHttps).toBe(true);
      expect(adapted.stage4.sslValid).toBe(true);
      expect(adapted.stage4.hasPrivacyPolicy).toBe(true);
      expect(adapted.stage4.hasTermsOfService).toBe(true);
      expect(adapted.stage4.securityBadgeText).toMatch(/HTTPS Enforced/i);
    });

    it('should extract contact anchors from mailto/tel links and Schema into normalized stage4.contact', () => {
      const rawBackendScan = {
        status: 'completed',
        targetUrl: 'https://thatworkx.com',
        pages: [
          {
            url: 'https://thatworkx.com/contact',
            links: ['mailto:info@thatworkx.com', 'tel:+18005550199'],
            schema: [
              {
                '@type': 'Organization',
                name: 'Thatworkx',
                address: {
                  '@type': 'PostalAddress',
                  addressLocality: 'Stockholm',
                  addressCountry: 'Sweden'
                }
              }
            ]
          }
        ],
        missingEssentialPages: []
      };

      const adapted = adapterModule.mapBackendScanToV4State(rawBackendScan);

      expect(adapted.stage4.contact).toEqual({
        email: 'info@thatworkx.com',
        phone: '+18005550199',
        address: 'Stockholm, Sweden',
        trustAnchorCount: 3
      });
    });

    it('should maintain strict zero-mock baseline when raw scan has empty/missing data', () => {
      const emptyBackendScan = {
        status: 'pending',
        targetUrl: '',
        pages: [],
        missingEssentialPages: []
      };

      const adapted = adapterModule.mapBackendScanToV4State(emptyBackendScan);

      expect(adapted.stage4.isHttps).toBe(false);
      expect(adapted.stage4.sslValid).toBe(false);
      expect(adapted.stage4.contact.email).toBeNull();
      expect(adapted.stage4.contact.phone).toBeNull();
      expect(adapted.stage4.contact.address).toBeNull();
      expect(adapted.stage4.contact.trustAnchorCount).toBe(0);
    });
  });

  describe('2. Visual Finesse Gate: Card 4 (Security & Privacy Protocols)', () => {
    let visualizeModule;

    beforeEach(async () => {
      visualizeModule = await import('../visualize.js');
    });

    it('should render elevated highlight badge, policy chips, and action drawer link', () => {
      const state = {
        targetUrl: 'https://thatworkx.com',
        stage4: {
          isHttps: true,
          sslValid: true,
          hasPrivacyPolicy: true,
          hasTermsOfService: true,
          securityBadgeText: 'TLS 1.3 / HTTPS Enforced'
        }
      };

      visualizeModule.renderStage4SecurityCard(state);

      const card = document.getElementById('stage4-card-security-privacy');

      // 1. Elevated Badge (matching Card 1/2 highlight pattern)
      const badge = card.querySelector('.badge-highlight, [data-slot="security-badge"]');
      expect(badge, 'Card 4 must render elevated badge').not.toBeNull();
      expect(badge.textContent).toContain('TLS 1.3 / HTTPS Enforced');

      // 2. Policy Chips (matching Card 1 schema entity chips)
      const chipsContainer = card.querySelector('.stage4-chip-container, .policy-chips');
      expect(chipsContainer, 'Policy chips container must exist').not.toBeNull();

      const chips = card.querySelectorAll('.chip-tag, .entity-chip');
      expect(chips.length).toBeGreaterThanOrEqual(2);
      expect(chips[0].textContent).toMatch(/Privacy Policy/i);
      expect(chips[1].textContent).toMatch(/Terms of Service/i);

      // 3. Elevated Action Link (matching Card 2 "Author E-E-A-T Guide" pattern)
      const actionLink = card.querySelector('.action-link, .guide-trigger');
      expect(actionLink, 'Security & Legal action trigger must exist').not.toBeNull();
      expect(actionLink.textContent).toMatch(/Security & Legal Anchors/i);
    });
  });

  describe('3. Visual Finesse Gate: Card 5 (Verified Contact Anchors)', () => {
    let visualizeModule;

    beforeEach(async () => {
      visualizeModule = await import('../visualize.js');
    });

    it('should render elevated trust badge, styled contact chips with icons, and route trace link', () => {
      const state = {
        targetUrl: 'https://thatworkx.com',
        stage4: {
          contact: {
            email: 'info@thatworkx.com',
            phone: '+18005550199',
            address: 'Stockholm, Sweden',
            trustAnchorCount: 3
          }
        }
      };

      visualizeModule.renderStage4ContactCard(state);

      const card = document.getElementById('stage4-card-contact-anchors');

      // 1. Trust Anchors Highlight Badge
      const badge = card.querySelector('.badge-highlight, [data-slot="contact-badge"]');
      expect(badge, 'Card 5 must render trust anchor summary badge').not.toBeNull();
      expect(badge.textContent).toMatch(/3\/3 Trust Anchors Detected/i);

      // 2. Elevated Contact Detail Chips (no unstyled monospace text)
      const emailChip = card.querySelector('[data-chip="contact-email"]');
      const phoneChip = card.querySelector('[data-chip="contact-phone"]');
      const addressChip = card.querySelector('[data-chip="contact-address"]');

      expect(emailChip, 'Email must be rendered as an elevated chip container').not.toBeNull();
      expect(phoneChip, 'Phone must be rendered as an elevated chip container').not.toBeNull();
      expect(addressChip, 'Address must be rendered as an elevated chip container').not.toBeNull();

      expect(emailChip.textContent).toContain('info@thatworkx.com');
      expect(phoneChip.textContent).toContain('+18005550199');
      expect(addressChip.textContent).toContain('Stockholm, Sweden');

      // 3. Elevated Action Link
      const actionLink = card.querySelector('.action-link, .contact-trace-trigger');
      expect(actionLink, 'Route trace trigger must exist').not.toBeNull();
      expect(actionLink.textContent).toMatch(/View \/contact Route Trace/i);
    });
  });

  describe('4. Strict Governance & Banned Terms Gate', () => {
    it('should not contain any occurrence of "AI-first" across rendered Stage 4 cards', () => {
      const card4 = document.getElementById('stage4-card-security-privacy');
      const card5 = document.getElementById('stage4-card-contact-anchors');

      expect(card4.innerHTML).not.toMatch(/AI-first/i);
      expect(card5.innerHTML).not.toMatch(/AI-first/i);
    });
  });
});
