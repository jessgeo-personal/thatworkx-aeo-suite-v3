/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Stage 6 Real Triage Card & Duplicate Box Purge (RED Phase)', () => {
  let htmlContent;
  let visualizeModule;

  beforeEach(async () => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;

    try {
      visualizeModule = await import('../visualize.js');
    } catch {
      visualizeModule = null;
    }
  });

  describe('1. Governance Gate', () => {
    it('Zero occurrences of the banned term "AI-first" across visualize.html', () => {
      const bannedTermRegex = /AI-first/gi;
      expect(htmlContent.match(bannedTermRegex)).toBeNull();
    });
  });

  describe('2. Duplicate Box Purged', () => {
    it('Ensures NO duplicate box exists at the top of Stage 6 (.urgent-actions-card with id="triage-status-badge" or containing "LIVE TRIAGE" above dial)', () => {
      const duplicateCard = document.querySelector('#stage-panel-6 .urgent-actions-card');
      const triageBadge = document.querySelector('#triage-status-badge');
      const panel6Text = document.querySelector('#stage-panel-6')?.textContent || '';

      expect(duplicateCard, 'Redundant .urgent-actions-card in stage-panel-6 must be purged').toBeNull();
      expect(triageBadge, '#triage-status-badge must be purged').toBeNull();
      expect(panel6Text.toUpperCase()).not.toContain('LIVE TRIAGE');
    });
  });

  describe('3. Existing Card Container in Stage 6', () => {
    it('Inside Stage 6, within the grid card next to the AEO Health Index Dial, an inner container exists with id="stage6-urgent-actions"', () => {
      if (visualizeModule?.switchStage) {
        visualizeModule.switchStage(6);
      } else if (visualizeModule?.navigateToStep) {
        visualizeModule.navigateToStep(6);
      }

      const stage6UrgentActions = document.querySelector('#stage6-urgent-actions');
      expect(stage6UrgentActions, '#stage6-urgent-actions container must exist next to AEO Health Index Dial').not.toBeNull();
    });
  });

  describe('4. Dynamic Rendering via renderStage6Triage', () => {
    it('Calling renderStage6Triage(scanData) with failures in Stages 1–5 populates #stage6-urgent-actions with live triage items (title, impact, switchStage button)', () => {
      if (visualizeModule?.switchStage) {
        visualizeModule.switchStage(6);
      } else if (visualizeModule?.navigateToStep) {
        visualizeModule.navigateToStep(6);
      }

      expect(visualizeModule?.renderStage6Triage, 'renderStage6Triage must be an exported function').toBeDefined();

      const failedScanData = {
        botPermissions: {
          GPTBot: 'blocked',
          ClaudeBot: 'blocked'
        },
        missingEssentialPages: ['/privacy-policy', '/terms'],
        pages: [
          { url: 'https://example.com', wordCount: 100, textRatio: 0.05 }
        ],
        capabilities: {
          schemaOrgDetected: false,
          verifiedContactDetected: false,
          llmsTxtDetected: false,
          aiContextDetected: false
        }
      };

      visualizeModule.renderStage6Triage(failedScanData);

      const urgentActionsContainer = document.querySelector('#stage6-urgent-actions');
      expect(urgentActionsContainer, '#stage6-urgent-actions must exist to receive rendered items').not.toBeNull();
      expect(urgentActionsContainer.children.length).toBeGreaterThan(0);

      // Verify each item contains title, impact description, and button calling switchStage
      const items = urgentActionsContainer.querySelectorAll('[data-action-item], .action-item-card, .triage-action-card');
      expect(items.length).toBeGreaterThan(0);

      items.forEach((item) => {
        const text = item.textContent;
        expect(text.length).toBeGreaterThan(10); // Contains title and impact text

        const btn = item.querySelector('button');
        expect(btn, 'Each triage action item must have an action button').not.toBeNull();
        const onclickAttr = btn.getAttribute('onclick') || '';
        const btnText = btn.textContent || '';
        const hasSwitchCall = onclickAttr.includes('switchStage') || onclickAttr.includes('navigateToStep') || btnText.includes('Fix in Stage');
        expect(hasSwitchCall).toBe(true);
      });
    });

    it('Calling renderStage6Triage(scanData) with a 100% clean scan clears all action items and renders an "All Clear" status (zero mock defaults)', () => {
      if (visualizeModule?.switchStage) {
        visualizeModule.switchStage(6);
      } else if (visualizeModule?.navigateToStep) {
        visualizeModule.navigateToStep(6);
      }

      expect(visualizeModule?.renderStage6Triage, 'renderStage6Triage must be defined').toBeDefined();

      const cleanScanData = {
        botPermissions: {
          GPTBot: 'allowed',
          ClaudeBot: 'allowed',
          Googlebot: 'allowed',
          PerplexityBot: 'allowed'
        },
        missingEssentialPages: [],
        pages: [
          { url: 'https://example.com', wordCount: 1500, textRatio: 0.40 }
        ],
        capabilities: {
          schemaOrgDetected: true,
          verifiedContactDetected: true,
          llmsTxtDetected: true,
          aiContextDetected: true
        }
      };

      visualizeModule.renderStage6Triage(cleanScanData);

      const urgentActionsContainer = document.querySelector('#stage6-urgent-actions');
      expect(urgentActionsContainer, '#stage6-urgent-actions must exist').not.toBeNull();
      expect(urgentActionsContainer.textContent).toMatch(/All Clear/i);
      // Ensure no default mock fallback items remain
      expect(urgentActionsContainer.textContent).not.toContain('Deploy Missing Canonical /pricing Route');
    });
  });
});
