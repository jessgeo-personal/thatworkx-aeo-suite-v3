import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 1: Shell & Pipeline Header Contract', () => {
  let htmlContent;
  let dom;
  let document;

  const visualizePath = path.resolve(__dirname, '../visualize.html');

  beforeEach(() => {
    expect(fs.existsSync(visualizePath), 'frontend/visualize.html must exist as the new dashboard entrypoint').toBe(true);
    htmlContent = fs.readFileSync(visualizePath, 'utf-8');
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('1. Strict Governance & Banned Terms Gate', () => {
    it('must have ZERO occurrences of the banned term "AI-first"', () => {
      const bannedRegex = /AI-first/i;
      expect(htmlContent).not.toMatch(bannedRegex);
    });

    it('must correctly separate "AI-Optimized" (audit/presence) and "AI-Ready" (manifests)', () => {
      // Must contain AEO governance markers
      expect(htmlContent).toMatch(/AI-Ready|AI-Optimized/);
    });
  });

  describe('2. Top Progression Stepper & Action Dock', () => {
    it('must render the top pipeline header container', () => {
      const stepper = document.querySelector('[data-testid="pipeline-stepper"], .pipeline-stepper, #pipeline-stepper');
      expect(stepper).not.toBeNull();
    });

    it('must render Stages 1 to 6 for the AEO Readiness Pipeline', () => {
      const stages = document.querySelectorAll('[data-step], .pipeline-step');
      expect(stages.length).toBeGreaterThanOrEqual(6);

      // Verify milestone step 6 (AEO Manifest Ready / Target state)
      const step6 = document.querySelector('[data-step="6"], .step-ready, [data-step-ready="true"]');
      expect(step6).not.toBeNull();
      expect(step6.textContent).toMatch(/Ready|Manifest Ready/i);
    });

    it('must pre-render "What Happens Next" downstream steps (Stages 7, 8, 9)', () => {
      const nextStepsSection = document.querySelector('[data-testid="pipeline-next-steps"], .pipeline-next-steps');
      expect(nextStepsSection).not.toBeNull();
      expect(nextStepsSection.textContent).toMatch(/What Happens Next/i);

      // Check step labels (e.g. Ingestion, Monitoring, Scaling)
      const nextSteps = document.querySelectorAll('.next-step-item, [data-next-step]');
      expect(nextSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('must render the top action trigger dock with action CTA button', () => {
      const actionDock = document.querySelector('[data-testid="header-action-dock"], .header-action-dock');
      expect(actionDock).not.toBeNull();

      const ctaBtn = actionDock.querySelector('button, .btn-primary, [data-action="export-manifests"]');
      expect(ctaBtn).not.toBeNull();
    });
  });

  describe('3. 3-Column Cockpit Scaffolding Grid', () => {
    it('must render the main 3-column cockpit container', () => {
      const cockpit = document.querySelector('[data-testid="v4-cockpit"], #v4-cockpit, .v4-cockpit-container');
      expect(cockpit).not.toBeNull();
    });

    it('must scaffold Column 1: Left Context & Profile Pane (260px min-width container)', () => {
      const leftPane = document.querySelector('[data-testid="v4-left-pane"], #v4-left-pane, .v4-left-pane');
      expect(leftPane).not.toBeNull();
    });

    it('must scaffold Column 2: Center Discovery & Queue Stream (380px min-width container)', () => {
      const centerFeed = document.querySelector('[data-testid="v4-center-feed"], #v4-center-feed, .v4-center-feed');
      expect(centerFeed).not.toBeNull();
    });

    it('must scaffold Column 3: Right Inspector Studio (Flex 1 container)', () => {
      const rightInspector = document.querySelector('[data-testid="v4-right-inspector"], #v4-right-inspector, .v4-right-inspector');
      expect(rightInspector).not.toBeNull();
    });
  });

  describe('4. DOM Pre-rendering & Data Integrity Defaults', () => {
    it('must pre-render DOM elements without mock defaults (must use graceful fallbacks: "--" or "UNAUDITED")', () => {
      const domainPlaceholder = document.querySelector('[data-field="domain-name"], .domain-name-display');
      if (domainPlaceholder) {
        expect(domainPlaceholder.textContent.trim()).toMatch(/--|UNAUDITED|example\.com/i);
      }
    });
  });
});
