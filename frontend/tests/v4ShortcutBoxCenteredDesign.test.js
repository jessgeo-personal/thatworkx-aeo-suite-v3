/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Shortcut Box Centered Gradient Design & White Outline', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Card Outline: Shortcut card has a solid white border', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');
    expect(typeof buildEvidenceAndActionDrawers).toBe('function');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      actionPlan: 'Test action plan',
      actionSteps: [],
      shortcutPlan: 'Deploying Level 1 Machine Manifests via AIOptimize Pro automatically generates cloud edge proxy rules.'
    });

    const shortcutCard = container.querySelector('.shortcut-card');
    expect(shortcutCard).not.toBeNull();
    // Border must be explicitly white
    expect(shortcutCard.className).toMatch(/border-white/);
  });

  it('Button Styling: Rendered button is centered, gradient-styled, and contains rocket launch text', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      actionPlan: 'Test action plan',
      actionSteps: [],
      shortcutPlan: 'Test shortcut plan'
    });

    const btnContainer = container.querySelector('.shortcut-card-btn-container');
    expect(btnContainer).not.toBeNull();
    // Must be centered
    expect(btnContainer.className).toMatch(/items-center/);
    expect(btnContainer.className).toMatch(/justify-center/);
    expect(btnContainer.className).toMatch(/text-center/);

    const button = btnContainer.querySelector('.shortcut-card-btn');
    expect(button).not.toBeNull();
    // Must have gradient classes
    expect(button.className).toMatch(/bg-gradient-to-r/);
    // Button text must match the legacy design
    expect(button.textContent).toContain('Make My Website AI-Ready with AIOptimize Pro');
    expect(button.textContent).toContain('🚀');
  });

  it('Subtext: Displays centered 2-minute setup guarantee underneath button', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      actionPlan: 'Test action plan',
      actionSteps: [],
      shortcutPlan: 'Test shortcut plan'
    });

    const subtextEl = container.querySelector('.shortcut-card-subtext');
    expect(subtextEl).not.toBeNull();
    expect(subtextEl.textContent).toMatch(/Instant 2[–-]Minute Setup • Available via Unlimited Monthly Sync or Flexible Single-Pass Scans/i);
    // Check cyan/sky blue or bright readable color
    expect(subtextEl.className).toMatch(/text-\[#7dd3fc\]|text-sky-300|text-cyan-300/);
  });
});
