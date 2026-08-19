/**
 * @vitest-environment jsdom
 * @file indexBentoAndCrawlerRadar.test.js
 * @description BDD Test Suite for Slice 2: 3-Pillar Bento & 12-Provider AI Infinite Moving Cards
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const htmlPath = path.resolve(__dirname, '../index.html');

describe('Slice 2: 3-Pillar Bento & 12-Provider AI Logo Cloud BDD Suite', () => {
  let document;

  beforeEach(() => {
    const html = fs.readFileSync(htmlPath, 'utf8');
    document = new DOMParser().parseFromString(html, 'text/html');
  });

  describe('Scenario 2.1: 3-Pillar Ecosystem Bento Grid', () => {
    it('Verify #product-bento-grid section exists and is pre-rendered', () => {
      const bentoSection = document.querySelector('#product-bento-grid');
      expect(bentoSection, '#product-bento-grid must exist in DOM').not.toBeNull();
    });

    it('Verify all 3 product pillar cards exist (#bento-aivisualize, #bento-aioptimize, #bento-aisocialize)', () => {
      const p1 = document.querySelector('#bento-aivisualize');
      const p2 = document.querySelector('#bento-aioptimize');
      const p3 = document.querySelector('#bento-aisocialize');

      expect(p1, '#bento-aivisualize must exist').not.toBeNull();
      expect(p2, '#bento-aioptimize must exist').not.toBeNull();
      expect(p3, '#bento-aisocialize must exist').not.toBeNull();
    });

    it('Verify bento grid passes banned terms governance (zero occurrences of "AI-first")', () => {
      const bentoSection = document.querySelector('#product-bento-grid');
      expect(bentoSection).not.toBeNull();
      expect(bentoSection.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('Scenario 2.2: 12-Provider Global AI Ecosystem Logo Cloud (Aceternity Infinite Cards)', () => {
    it('Verify provider cards exist in DOM (12 canonical cards + loop clones)', () => {
      const allCards = document.querySelectorAll('.provider-logo-card');
      const canonicalCards = document.querySelectorAll('.provider-logo-card:not([aria-hidden="true"])');

      // Canonical set must be exactly 12 bots
      expect(canonicalCards.length).toBe(12);
      // Total cards in infinite loop track must be >= 12 (typically 24)
      expect(allCards.length).toBeGreaterThanOrEqual(12);
    });

    it('Verify all 12 global provider brands are present in the DOM', () => {
      const section = document.querySelector('#ai-crawler-radar');
      expect(section).not.toBeNull();

      const text = section.textContent;
      const brands = [
        'ChatGPT',
        'Claude',
        'Perplexity',
        'Google Gemini',
        'Apple Intelligence',
        'MS Copilot',
        'Meta AI',
        'Mistral AI',
        'Amazon Q',
        'DeepSeek',
        'Doubao',
        'Alibaba Qwen'
      ];

      brands.forEach(brand => {
        expect(text).toContain(brand);
      });
    });

    it('Verify each .provider-logo-card element contains an inline <svg> icon with viewBox', () => {
      const cards = document.querySelectorAll('.provider-logo-card');
      expect(cards.length).toBeGreaterThanOrEqual(12);

      cards.forEach(card => {
        const svg = card.querySelector('svg');
        expect(svg, 'Each provider card must contain an SVG icon').not.toBeNull();
        expect(svg.getAttribute('viewBox')).toBeTruthy();
      });
    });

    it('Verify crawler radar passes banned terms governance', () => {
      const section = document.querySelector('#ai-crawler-radar');
      expect(section).not.toBeNull();
      expect(section.innerHTML).not.toMatch(/ai-first/i);
    });
  });
});
