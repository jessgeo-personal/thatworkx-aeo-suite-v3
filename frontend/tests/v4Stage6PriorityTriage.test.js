/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Stage 6 Priority Triage Engine & Stepper Purge (RED Phase)', () => {
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

  it('Gate Check: Ensures zero occurrences of banned term "AI-first"', () => {
    const bannedTermRegex = /AI-first/gi;
    expect(htmlContent.match(bannedTermRegex)).toBeNull();
  });

  it('Stepper Purge: #stage-stepper must NOT exist in the DOM', () => {
    const stepper = document.querySelector('#stage-stepper');
    expect(stepper, '#stage-stepper should be completely removed').toBeNull();
  });

  it('Prototype Buttons Purge: No simulation buttons exist on canvas', () => {
    const simBtns = Array.from(document.querySelectorAll('button')).filter((b) =>
      b.textContent.toLowerCase().includes('simulate')
    );
    expect(simBtns.length).toBe(0);
  });

  it('Stage 6 DOM: Top 5 Urgent Actions container exists', () => {
    const actionsContainer = document.querySelector('#top-urgent-actions-list, #triage-urgent-actions, #stage6-urgent-actions');
    expect(actionsContainer, 'Urgent Actions container missing in Stage 6').not.toBeNull();
  });

  it('Triage Engine: Audits live findings across Stages 1-5 and ranks by severity', () => {
    expect(visualizeModule?.generateDynamicTriageActions, 'generateDynamicTriageActions function must be exported').toBeDefined();

    const mockScan = {
      botPermissions: {
        GPTBot: 'blocked',
        ClaudeBot: 'allowed'
      },
      missingEssentialPages: ['/privacy-policy'],
      pages: [
        { url: 'https://example.com', wordCount: 120, textRatio: 0.08 }
      ],
      capabilities: {
        schemaOrgDetected: false,
        verifiedContactDetected: false,
        llmsTxtDetected: false,
        aiContextDetected: false
      }
    };

    const actions = visualizeModule.generateDynamicTriageActions(mockScan);
    expect(Array.isArray(actions)).toBe(true);
    expect(actions.length).toBeLessThanOrEqual(5);

    // Verify top severity is Critical
    expect(actions[0].severity).toBe('critical');
    
    // Verify required schema
    actions.forEach(action => {
      expect(action).toHaveProperty('id');
      expect(action).toHaveProperty('stage');
      expect(action).toHaveProperty('title');
      expect(['critical', 'warning', 'optimization']).toContain(action.severity);
      expect(action).toHaveProperty('impact');
      expect(action).toHaveProperty('fixLabel');
    });
  });

  it('Triage Engine: Clean scan produces zero action items (no fallback defaults)', () => {
    const cleanScan = {
      botPermissions: { GPTBot: 'allowed', ClaudeBot: 'allowed' },
      missingEssentialPages: [],
      pages: [{ url: 'https://example.com', wordCount: 1200, textRatio: 0.35 }],
      capabilities: {
        schemaOrgDetected: true,
        verifiedContactDetected: true,
        llmsTxtDetected: true,
        aiContextDetected: true
      }
    };

    const actions = visualizeModule.generateDynamicTriageActions(cleanScan);
    expect(actions.length).toBe(0);
  });
});
