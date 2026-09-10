/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Single-Stage Toggling, Navigation & Strict Containment (RED Phase)', () => {
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

  it('Single-Stage Visibility: Only one stage panel is visible at initial render', () => {
    const panels = Array.from(document.querySelectorAll('.stage-panel, [data-stage-panel]'));
    expect(panels.length).toBe(6);

    const visiblePanels = panels.filter(
      (p) => p.style.display !== 'none' && !p.classList.contains('hidden')
    );
    expect(visiblePanels.length, 'Exactly one stage panel must be visible at a time').toBe(1);
  });

  it('Top-Bar Stage Switcher: Clicking Stage 5 displays ONLY #stage-panel-5', () => {
    const step5Btn = document.querySelector('#desktop-stepper [data-step="5"], [data-step="5"]');
    expect(step5Btn, 'Top-bar Stage 5 button must exist').not.toBeNull();

    // Trigger navigation to Stage 5
    if (window.navigateToStep) {
      window.navigateToStep(5);
    } else if (step5Btn.onclick) {
      step5Btn.onclick();
    } else {
      step5Btn.click();
    }

    const panel5 = document.querySelector('#stage-panel-5');
    const panel4 = document.querySelector('#stage-panel-4');
    const panel6 = document.querySelector('#stage-panel-6');

    expect(panel5).not.toBeNull();
    expect(panel5.style.display !== 'none' && !panel5.classList.contains('hidden')).toBe(true);
    expect(panel4.style.display === 'none' || panel4.classList.contains('hidden')).toBe(true);
    expect(panel6.style.display === 'none' || panel6.classList.contains('hidden')).toBe(true);
  });

  it('Component Containment: Verifies dedicated structural placement across panels', () => {
    const panel4 = document.querySelector('#stage-panel-4');
    const panel5 = document.querySelector('#stage-panel-5');
    const panel6 = document.querySelector('#stage-panel-6');

    expect(panel4, '#stage-panel-4 must exist').not.toBeNull();
    expect(panel5, '#stage-panel-5 must exist').not.toBeNull();
    expect(panel6, '#stage-panel-6 must exist').not.toBeNull();

    // Stage 4 trust cards must exist inside #stage-panel-4
    const schemaCard = document.querySelector('#stage4-card-schema, [data-card="schema-org"]');
    expect(schemaCard, 'Schema card must exist').not.toBeNull();
    expect(panel4.contains(schemaCard), 'Schema card must be contained exclusively in #stage-panel-4').toBe(true);

    // Top urgent actions list must exist inside #stage-panel-6
    const urgentActionsList = document.querySelector('#top-urgent-actions-list');
    expect(urgentActionsList, '#top-urgent-actions-list must exist').not.toBeNull();
    expect(panel6.contains(urgentActionsList), 'Urgent actions list must be contained exclusively in #stage-panel-6').toBe(true);
  });

  it('Back to Summary Trigger: Activates #stage-panel-6 and hides #stage-panel-5', () => {
    // Navigate to Stage 5 first
    if (window.navigateToStep) {
      window.navigateToStep(5);
    }

    const backBtn = document.querySelector('#canvas-return-anchor button, button[onclick*="navigateToStep(6)"]');
    expect(backBtn, 'Back to Summary button must exist').not.toBeNull();

    // Click Back to Summary
    if (backBtn.onclick) {
      backBtn.onclick();
    } else {
      backBtn.click();
    }

    const panel5 = document.querySelector('#stage-panel-5');
    const panel6 = document.querySelector('#stage-panel-6');

    expect(panel6.style.display !== 'none' && !panel6.classList.contains('hidden')).toBe(true);
    expect(panel5.style.display === 'none' || panel5.classList.contains('hidden')).toBe(true);
  });
});
