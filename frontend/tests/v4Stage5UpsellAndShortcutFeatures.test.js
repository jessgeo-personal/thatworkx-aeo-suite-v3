/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Stage 5 Upsell Transformation & Stages 1-4 Feature List', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Stage 5: Transforms Action Plan into AIOptimize Pro upsell and omits separate shortcut box', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');
    expect(typeof buildEvidenceAndActionDrawers).toBe('function');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      stage: 5,
      evidencePlain: 'Level 1-4 manifests verified.',
      evidenceTrace: 'GET /llms.txt 200 OK'
    });
    document.body.appendChild(container);

    // 1. Heading must state "Upgrade to AIOptimize Pro to automatically create AI-ready files"
    const heading = container.querySelector('.action-plan-heading, .stage5-upsell-heading');
    expect(heading).not.toBeNull();
    expect(heading.textContent).toContain('Upgrade to AIOptimize Pro to automatically create AI-ready files');

    // 2. Must contain the 4 feature items
    const textContent = container.textContent || '';
    expect(textContent).toContain('/llms.txt and /ai-context.md');
    expect(textContent).toContain('updated automatically everytime you make a change');
    expect(textContent).toContain('AISocialize');
    expect(textContent).toContain('Content Management Systems(CMS)');

    // 3. Must contain centered gradient CTA button & subtext
    const btn = container.querySelector('.shortcut-card-btn');
    expect(btn).not.toBeNull();
    expect(btn.textContent).toContain('Make My Website AI-Ready with AIOptimize Pro');
    const subtext = container.querySelector('.shortcut-card-subtext');
    expect(subtext).not.toBeNull();
    expect(subtext.textContent).toContain('Instant 2–Minute Setup');

    // 4. Must NOT have a separate duplicate .shortcut-card
    const shortcutCards = container.querySelectorAll('.shortcut-card');
    expect(shortcutCards.length).toBe(0);
  });

  it('Stages 1-4: Displays the 4-feature list inside the Recommended Shortcut box', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      stage: 3,
      actionPlan: 'Maintain semantic heading trees.',
      actionSteps: [{ title: 'Audit routes', detail: 'Ensure 25% density.' }]
    });

    // 1. Manual Action Plan remains intact
    const actionPlanCard = container.querySelector('.action-plan-urgent-card');
    expect(actionPlanCard).not.toBeNull();
    expect(actionPlanCard.textContent).toContain('Maintain semantic heading trees');

    // 2. Shortcut card is present with white border
    const shortcutCard = container.querySelector('.shortcut-card');
    expect(shortcutCard).not.toBeNull();
    expect(shortcutCard.className).toMatch(/border-white/);

    // 3. Shortcut card displays the 4 features list
    const featuresList = shortcutCard.querySelector('.aioptimize-features-list, ul');
    expect(featuresList).not.toBeNull();
    const shortcutText = shortcutCard.textContent || '';
    expect(shortcutText).toContain('/llms.txt and /ai-context.md');
    expect(shortcutText).toContain('updated automatically everytime you make a change');
    expect(shortcutText).toContain('AISocialize');
    expect(shortcutText).toContain('Content Management Systems(CMS)');
  });
});
