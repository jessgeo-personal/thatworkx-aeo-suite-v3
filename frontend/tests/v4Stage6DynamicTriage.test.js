/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Stage 6: Dynamic Priority Triage Engine & Zero-Fallback Verification', () => {
  let visualize;

  beforeEach(async () => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;

    visualize = await import('../visualize.js');
  });

  describe('Zero-Fallback Data Integrity', () => {
    it('should NOT contain the hardcoded defaultActions prototype array', () => {
      // The defaultActions array had "Unblock Restricted AI Bot Crawlers" as rank 1
      const mockPerfectState = {
        isAudited: true,
        stage1: { score: '100%', status: 'PASS', crawlers: [{ allowed: true }] },
        stage2: { score: '100%', status: 'PASS', missingCount: 0, routes: [] },
        stage3: { score: '100%', status: 'PASS', pages: [{ ratio: 50, wordCount: 500 }] },
        stage4: { status: 'PASS', detectedTypes: ['Organization'], hasPrivacyPolicy: true, hasTermsOfService: true, contactDetails: { email: 'a@b.com' } },
        stage5: { status: 'PASS', manifests: [{ path: '/robots.txt', exists: true }] },
        stage6: { overallHealthIndex: 100 }
      };

      const canvas = document.getElementById('canvas-body');
      visualize.renderStage6Canvas(canvas, mockPerfectState);

      const html = canvas.innerHTML;
      expect(html, 'Mock default action 1 should be purged').not.toContain('Unblock Restricted AI Bot Crawlers');
      expect(html, 'Mock default action 2 should be purged').not.toContain('Deploy Missing Canonical /pricing Route');
      expect(html, 'Mock default action 3 should be purged').not.toContain('Optimize Client-Side Text Density');
    });

    it('should not contain hardcoded 80% fallback scores in the 5-Section Scorecard Matrix', () => {
      const mockState = {
        isAudited: true,
        stage1: { score: '12%', status: 'FAIL' },
        stage2: { score: '14%', status: 'FAIL' },
        stage3: { score: '16%', status: 'FAIL' },
        stage4: { score: '18%', status: 'FAIL' },
        stage5: { score: '20%', status: 'FAIL' }
      };
      
      const canvas = document.getElementById('canvas-body');
      visualize.renderStage6Canvas(canvas, mockState);

      const html = canvas.innerHTML;
      expect(html, 'Stage 4 hardcoded 80% score must be removed').not.toContain('80%');
      expect(html, 'Stage 5 hardcoded 71% score must be removed').not.toContain('71%');
      expect(html, 'Stage 3 hardcoded 85% score must be removed').not.toContain('85%');
    });
  });

  describe('Dynamic Triage Generation & Routing', () => {
    it('should rank critical blockers (Stage 1 & 2) above optimizations', () => {
      // Missing generateDynamicTriage function will trigger a RED failure here
      const { generateDynamicTriage } = visualize;
      expect(generateDynamicTriage).toBeDefined();

      const mixedState = {
        stage1: { status: 'FAIL', crawlers: [{ allowed: false }] }, // Critical
        stage2: { status: 'WARN', missingCount: 1 }, // High
        stage3: { status: 'WARN', pages: [{ ratio: 10 }] } // Medium
      };

      const triage = generateDynamicTriage(mixedState);
      expect(triage[0].stageStep).toBe(1);
      expect(triage[1].stageStep).toBe(2);
    });

    it('should replace "Fix in Stage X ->" with "Upgrade to AIOptimize" for perfectly passing stages', () => {
      const mockPerfectState = {
        isAudited: true,
        stage1: { score: '100%', status: 'PASS' },
        stage2: { score: '100%', status: 'PASS', missingCount: 0 },
        stage3: { score: '100%', status: 'PASS' },
        stage4: { status: 'PASS' },
        stage5: { status: 'PASS' }
      };

      const canvas = document.getElementById('canvas-body');
      visualize.renderStage6Canvas(canvas, mockPerfectState);

      // If all stages pass, the triage engine should still suggest 5 proactive optimizations, 
      // but their buttons must prompt an upgrade, not a fix.
      const actionCards = Array.from(canvas.querySelectorAll('.action-item-card'));
      const buttons = actionCards.map(card => card.querySelector('button').textContent.trim());

      buttons.forEach(btnText => {
        expect(btnText).toContain('Upgrade to AIOptimize');
        expect(btnText).not.toContain('Fix in Stage');
      });
    });
  });
});