/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Stage 6 Default Flow & Stage 1 Allowed AI Bots Card', () => {
  let htmlDoc;

  beforeEach(() => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  describe('Stage 1 DOM Specification', () => {
    it('should contain the "Allowed AI bots" directive card with correct subtitle', () => {
      const stage1 = document.getElementById('stage-1');
      expect(stage1).not.toBeNull();

      const cardTitle = Array.from(stage1.querySelectorAll('h3, h4, .card-title, .directive-title'))
        .find(el => el.textContent.trim() === 'Allowed AI bots');
      expect(cardTitle, 'Card title "Allowed AI bots" must exist in Stage 1').toBeDefined();

      const cardContainer = cardTitle.closest('.directive-card, .card, .metric-card');
      expect(cardContainer).not.toBeNull();

      const subtitle = cardContainer.querySelector('.directive-subtitle, .card-subtitle, p, span');
      expect(subtitle.textContent).toContain('Actual number of AI bots that are allowed to read your website');
    });

    it('should not contain the legacy Latency card in Stage 1 supplementary cards', () => {
      const stage1 = document.getElementById('stage-1');
      const latencyTitle = Array.from(stage1.querySelectorAll('.supplementary-card, .metric-card'))
        .find(el => el.textContent.includes('Latency'));
      expect(latencyTitle, 'Latency card should be replaced and not present').toBeUndefined();
    });

    it('should have a supplementary card slot dedicated to "bots allowed" count', () => {
      const stage1 = document.getElementById('stage-1');
      const botCountCard = stage1.querySelector('#stage1-bot-count-card, [data-metric="allowed-bots-count"]');
      expect(botCountCard, 'Supplementary slot for bot count must exist').not.toBeNull();
    });
  });

  describe('Stage 1 Bot Status Evaluation Logic', () => {
    it('should format FAIL (red) for 0 bots, PARTIAL (orange) for 1-19, and ENABLED (green) for 20/20', async () => {
      const { evaluateBotDirectiveStatus } = await import('../visualize.js');

      expect(evaluateBotDirectiveStatus(0)).toEqual({
        badgeText: 'FAIL',
        badgeClass: 'badge-fail',
        cardText: '0/20 bots allowed',
        colorClass: 'text-fail'
      });

      expect(evaluateBotDirectiveStatus(12)).toEqual({
        badgeText: 'PARTIAL',
        badgeClass: 'badge-warning',
        cardText: '12/20 bots allowed',
        colorClass: 'text-warning'
      });

      expect(evaluateBotDirectiveStatus(20)).toEqual({
        badgeText: 'ENABLED',
        badgeClass: 'badge-pass',
        cardText: '20/20 bots allowed',
        colorClass: 'text-pass'
      });
    });
  });

  describe('Post-Scan Flow', () => {
    it('should load Stage 6 by default upon scan completion', async () => {
      const { onScanComplete, getCurrentStage } = await import('../visualize.js');
      
      const mockScanResult = {
        targetUrl: 'https://example.com',
        status: 'completed',
        pages: [],
        capabilities: {}
      };

      onScanComplete(mockScanResult);

      expect(getCurrentStage()).toBe(6);
      const stage6 = document.getElementById('stage-6');
      expect(stage6.classList.contains('hidden')).toBe(false);
    });
  });
});
