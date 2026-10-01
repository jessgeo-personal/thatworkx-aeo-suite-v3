/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Action Plan Urgency Hybrid (Option A + C)', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('DOM Structure: buildEvidenceAndActionDrawers renders the Hybrid Option A + C container', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');
    expect(typeof buildEvidenceAndActionDrawers).toBe('function');

    const mockData = {
      actionPlan: 'Maintain semantic heading trees and ensure client-rendered routes deliver static HTML payloads for LLM crawlers.',
      actionSteps: [
        { title: 'Audit low-density routes', detail: 'Ensure interactive app routes maintain >= 25% server-rendered text ratio.' },
        { title: 'Embed Schema.org markup', detail: 'Connect Organization and Article JSON-LD metadata across all key routes.' }
      ],
      recoveryScore: '+15',
      shortcutPlan: 'Deploying Level 1 Machine Manifests via AIOptimize Pro automatically generates cloud edge proxy rules.',
      evidencePlain: 'Verified clean HTTP 200 responses.',
      evidenceTrace: 'HTTP/2 200 OK'
    };

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers(mockData);
    document.body.appendChild(container);

    const actionPlanCard = container.querySelector('.action-plan-urgent-card, [data-component="urgent-action-plan"]');
    expect(actionPlanCard).not.toBeNull();

    // 1. Option A: High-voltage brand border and glow
    expect(actionPlanCard.className).toMatch(/border-\[#d45d2a\]|border-\[#b7410e\]/);
    expect(actionPlanCard.className).toMatch(/shadow-/);

    // 2. Option A: Pulsing beacon dot present
    const beacon = actionPlanCard.querySelector('.animate-ping');
    expect(beacon).not.toBeNull();

    // 3. Option C: Right-aligned metric recovery badge
    const recoveryBadge = actionPlanCard.querySelector('.recovery-badge, [data-slot="recovery-score"]');
    expect(recoveryBadge).not.toBeNull();
    expect(recoveryBadge.textContent).toMatch(/HEALTH SCORE RECOVERY/i);
    expect(recoveryBadge.textContent).toContain('+15');
  });

  it('Typography: Action Plan heading uses font-headline (Plus Jakarta Sans) and increased font size', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      actionPlan: 'Test core directive statement.',
      actionSteps: [{ title: 'Step 1', detail: 'Detail 1' }]
    });

    const headingEl = container.querySelector('.action-plan-heading');
    expect(headingEl).not.toBeNull();

    // Must use font-headline (Plus Jakarta Sans) and NOT font-mono
    expect(headingEl.classList.contains('font-headline')).toBe(true);
    expect(headingEl.classList.contains('font-mono')).toBe(false);

    // Must have scaled-up font size (text-lg or text-xl or text-2xl)
    const classStr = headingEl.className;
    const hasLargeFont = /text-(lg|xl|2xl)/.test(classStr);
    expect(hasLargeFont).toBe(true);
  });

  it('Typography: Core directive and step copy maintain legible body sizes', async () => {
    const { buildEvidenceAndActionDrawers } = await import('../visualize.js');

    const container = document.createElement('div');
    container.innerHTML = buildEvidenceAndActionDrawers({
      actionPlan: 'Test core directive statement.',
      actionSteps: [{ title: 'Audit routes', detail: 'Ensure 25% density.' }]
    });

    // Core directive statement font size check (text-base or text-lg, not text-xs or text-sm)
    const directiveEl = container.querySelector('.action-plan-directive');
    expect(directiveEl).not.toBeNull();
    expect(directiveEl.className).toMatch(/text-(base|lg)/);

    // Step items check: step title & detail should not be locked into tiny text-xs
    const stepTitle = container.querySelector('.action-step-title');
    const stepDetail = container.querySelector('.action-step-detail');
    expect(stepTitle).not.toBeNull();
    expect(stepDetail).not.toBeNull();

    // Step badges: glowing brand orange badge
    const stepBadge = container.querySelector('.action-step-badge');
    expect(stepBadge).not.toBeNull();
    expect(stepBadge.className).toMatch(/bg-\[#b7410e\]/);
    expect(stepBadge.className).toMatch(/shadow-/);
  });
});
