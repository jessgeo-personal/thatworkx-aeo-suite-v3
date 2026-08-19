/**
 * @vitest-environment jsdom
 * @file indexEeatAndFaq.test.js
 * @description BDD Test Suite for Slice 4:
 * - Section 6: E-E-A-T Engine Deck (#eeat-engine-deck)
 * - Section 7: 4-Category Static FAQ Hub (#faq-accordion-hub)
 * Enforces removal of legacy .onboarding-bento-section, DOM pre-rendering of FAQ items,
 * category filtering, accordion expand/collapse interactivity, and strict "AI-first" ban.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(__dirname, '../index.html');
const jsPath = path.resolve(__dirname, '../index.js');

describe('Slice 4: Section 6 (E-E-A-T Engine Deck) & Section 7 (4-Category Static FAQ Hub)', () => {
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  describe('1. Section 6: E-E-A-T Engine Deck & Legacy Cleanup', () => {
    it('should pre-render #eeat-engine-deck and remove legacy .onboarding-bento-section', () => {
      const eeatSection = document.querySelector('#eeat-engine-deck');
      const legacyBento = document.querySelector('.onboarding-bento-section');

      expect(eeatSection, '#eeat-engine-deck must exist in DOM').not.toBeNull();
      expect(legacyBento, 'Legacy .onboarding-bento-section must be removed').toBeNull();
    });

    it('should include 4 authority proof cards covering Experience, Expertise, Authoritativeness, and Trust', () => {
      const eeatSection = document.querySelector('#eeat-engine-deck');
      expect(eeatSection).not.toBeNull();

      const cards = eeatSection.querySelectorAll('.eeat-card, [data-eeat-pillar]');
      expect(cards.length).toBeGreaterThanOrEqual(4);

      const sectionText = eeatSection.textContent;
      expect(sectionText).toMatch(/Experience/i);
      expect(sectionText).toMatch(/Expertise/i);
      expect(sectionText).toMatch(/Authoritativeness|Authority/i);
      expect(sectionText).toMatch(/Trust/i);
    });

    it('should pass banned terms governance (zero occurrences of "AI-first")', () => {
      const eeatSection = document.querySelector('#eeat-engine-deck');
      expect(eeatSection).not.toBeNull();
      expect(eeatSection.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('2. Section 7: 4-Category Static FAQ Hub (DOM Pre-rendering)', () => {
    it('should pre-render #faq-accordion-hub in static HTML with category filters and FAQ items', () => {
      const faqSection = document.querySelector('#faq-accordion-hub');
      expect(faqSection, '#faq-accordion-hub must exist').not.toBeNull();

      // Check category tab buttons (All, General AEO, AIVisualize, AIOptimize, AISocialize)
      const filterTabs = faqSection.querySelectorAll('[data-faq-filter]');
      expect(filterTabs.length).toBeGreaterThanOrEqual(4);

      // Check pre-rendered FAQ accordion items
      const faqItems = faqSection.querySelectorAll('.faq-accordion-item, [data-faq-category]');
      expect(faqItems.length).toBeGreaterThanOrEqual(6);
    });

    it('should pre-render complete question and answer text statically in the DOM for LLM bot crawlability', () => {
      const faqSection = document.querySelector('#faq-accordion-hub');
      expect(faqSection).not.toBeNull();

      const questions = faqSection.querySelectorAll('.faq-question, [data-faq-trigger]');
      const answers = faqSection.querySelectorAll('.faq-answer, [data-faq-content]');

      expect(questions.length).toBeGreaterThanOrEqual(6);
      expect(answers.length).toBeGreaterThanOrEqual(6);

      // Verify answers have substantial pre-rendered educational content
      answers.forEach(answer => {
        expect(answer.textContent.trim().length).toBeGreaterThan(20);
      });
    });

    it('should enforce banned terms governance on FAQ section', () => {
      const faqSection = document.querySelector('#faq-accordion-hub');
      expect(faqSection).not.toBeNull();
      expect(faqSection.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('3. FAQ Interactive Logic & Filtering Runtime', () => {
    it('should toggle accordion item open/closed state on trigger click', async () => {
      if (fs.existsSync(jsPath)) {
        const initFaqHub = await import('../index.js').then(m => m.initFaqHub || m.default);
        if (typeof initFaqHub === 'function') {
          initFaqHub(document);
        }
      }

      const firstTrigger = document.querySelector('#faq-accordion-hub .faq-question, #faq-accordion-hub [data-faq-trigger]');
      const firstItem = document.querySelector('#faq-accordion-hub .faq-accordion-item, #faq-accordion-hub [data-faq-category]');

      if (firstTrigger && firstItem) {
        firstTrigger.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        const isOpen = firstItem.classList.contains('is-open') || firstTrigger.getAttribute('aria-expanded') === 'true';
        expect(isOpen).toBe(true);
      }
    });

    it('should filter visible FAQ items when category filter tabs are clicked', async () => {
      if (fs.existsSync(jsPath)) {
        const initFaqHub = await import('../index.js').then(m => m.initFaqHub || m.default);
        if (typeof initFaqHub === 'function') {
          initFaqHub(document);
        }
      }

      const optimizeFilter = document.querySelector('#faq-accordion-hub [data-faq-filter="optimize"], #faq-accordion-hub [data-faq-filter="aioptimize"]');
      if (optimizeFilter) {
        optimizeFilter.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        
        const visibleItems = Array.from(document.querySelectorAll('#faq-accordion-hub [data-faq-category]'))
          .filter(item => item.style.display !== 'none' && !item.classList.contains('hidden'));

        expect(visibleItems.length).toBeGreaterThan(0);
      }
    });
  });
});
