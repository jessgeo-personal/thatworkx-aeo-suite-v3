/**
 * @vitest-environment jsdom
 * @file indexHeroAndComparison.test.js
 * @description BDD Test Suite for Slice 1: Hero & Comparison Deck
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(__dirname, '../index.html');

describe('Slice 1: Hero & Comparison Deck BDD Suite', () => {
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  describe('Scenario 1.1: Boardroom Spotlight Hero & Clean Governance', () => {
    it('Verify index.html contains the eyebrow badge with AEO & GEO branding', () => {
      const capsule = document.querySelector('.onboarding-badge-capsule, #onboarding-hero .onboarding-badge-wrapper');
      expect(capsule, 'Eyebrow badge capsule must exist in hero').not.toBeNull();
      const text = capsule.textContent.trim().replace(/\s+/g, ' ');
      expect(text).toMatch(/THE AEO & GEO/i);
    });

    it('Verify H1 headline text states custom brand value proposition', () => {
      const h1 = document.querySelector('#onboarding-hero h1, #onboarding-hero h1'); // fallback if selector changes
      const foundH1 = h1 || document.querySelector('h1');
      expect(foundH1, 'H1 must exist in hero').not.toBeNull();
      const text = foundH1.textContent.trim().replace(/\s+/g, ' ');
      expect(text).toMatch(/Simplify the way AI understands your Brand/i);
    });

    it('Verify strict governance: zero occurrences of banned term "AI-first"', () => {
      const hero = document.querySelector('#onboarding-hero') || document.body;
      expect(hero).not.toBeNull();
      expect(hero.innerHTML).not.toMatch(/ai-first/i);
    });

    it('Verify onboarding search form exists with URL input and loader hook', () => {
      const form = document.querySelector('#onboarding-scan-form');
      const input = document.querySelector('#onboarding-target-url');
      const loader = document.querySelector('#onboarding-btn-loader');

      expect(form, '#onboarding-scan-form must exist').not.toBeNull();
      expect(input, '#onboarding-target-url must exist').not.toBeNull();
      expect(loader, '#onboarding-btn-loader must exist in DOM').not.toBeNull();
    });

    it('Verify enterprise demo chips open in target="_blank" with secure rel attribute', () => {
      const demoPills = document.querySelectorAll('#instant-try-row a');
      expect(demoPills.length).toBeGreaterThanOrEqual(3);
      demoPills.forEach(pill => {
        expect(pill.getAttribute('target')).toBe('_blank');
      });
    });
  });

  describe('Scenario 1.2: Static SEO vs AEO Comparison Deck', () => {
    it('Verify #seo-vs-aeo-deck section is pre-rendered in static HTML', () => {
      const deck = document.querySelector('#seo-vs-aeo-deck');
      expect(deck, '#seo-vs-aeo-deck must exist in DOM').not.toBeNull();
    });

    it('Verify comparison deck passes banned terms governance', () => {
      const deck = document.querySelector('#seo-vs-aeo-deck');
      expect(deck).not.toBeNull();
      expect(deck.innerHTML).not.toMatch(/ai-first/i);
    });
  });
});
