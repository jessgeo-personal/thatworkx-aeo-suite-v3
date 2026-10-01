/**
 * @vitest-environment jsdom
 * @file frontend/tests/v4CockpitCanvasCleanupAndStepper.test.js
 * @description BDD RED Phase Test Suite for Cockpit Canvas Cleanup & Stepper Navigation
 * 
 * STRICT ARCHITECTURAL GATES:
 * - "AI-Optimized" vs "AI-Ready" Gate: Stage 5 uses distinct AI-Ready indigo styling.
 * - Banned Terms Gate: ZERO occurrences of "AI-first".
 * - Canvas Integrity Gate: Zero prototype simulator buttons in production HTML.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Phase 3.2.3: Cockpit Canvas Cleanup & Stepper Navigation', () => {
  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;
  });

  describe('1. Prototype Toolbar & Simulation Button Purge Gate', () => {
    it('should not contain the floating #debug-simulator-bar in the DOM', () => {
      const debugBar = document.getElementById('debug-simulator-bar');
      expect(debugBar, '#debug-simulator-bar must be purged from production visualize.html').toBeNull();
    });

    it('should not contain prototype simulation buttons in the DOM', () => {
      const simProgressBtn = document.getElementById('btn-sim-progress');
      const simResetBtn = document.getElementById('btn-sim-reset');
      const simFailureBtn = document.querySelector('button[onclick*="triggerSystemFailureScenario"]');
      const simEarlyBtn = document.querySelector('button[onclick*="triggerEarlyInspectionScenario"]');

      expect(simProgressBtn, 'Simulate Scan Progress button must be removed').toBeNull();
      expect(simResetBtn, 'Simulator Reset button must be removed').toBeNull();
      expect(simFailureBtn, 'Simulate System Failure button must be removed').toBeNull();
      expect(simEarlyBtn, 'Early Inspection Mode button must be removed').toBeNull();
    });
  });

  describe('2. Top Stepper Navigation Bar Structure & Accessibility Gate', () => {
    it('should contain the #desktop-stepper navigation container with aria-label', () => {
      const stepper = document.getElementById('desktop-stepper');
      expect(stepper, '#desktop-stepper must exist in header').not.toBeNull();
      expect(stepper.getAttribute('aria-label')).toMatch(/6-Stage/i);
    });

    it('should contain all 6 stage navigation triggers with correct data-step attributes', () => {
      const stepper = document.getElementById('desktop-stepper');
      const tabs = stepper.querySelectorAll('[data-step], .stepper-tab');
      expect(tabs.length).toBe(6);

      const expectedSteps = ['1', '2', '3', '4', '5', '6'];
      tabs.forEach((tab, index) => {
        expect(tab.getAttribute('data-step') || String(index + 1)).toBe(expectedSteps[index]);
      });
    });
  });

  describe('3. Dynamic Stepper State & Stage 5 "AI-Ready" Distinction Gate', () => {
    let visualizeModule;

    beforeEach(async () => {
      visualizeModule = await import('../visualize.js');
    });

    it('should render active indicator and apply indigo styling specifically to Stage 5', () => {
      const mockState = {
        isAudited: true,
        currentStep: 5,
        completedSteps: [1, 2, 3, 4, 5, 6],
        targetUrl: 'https://thatworkx.com'
      };

      visualizeModule.renderCockpit(mockState);

      const stepper = document.getElementById('desktop-stepper');
      const pills = stepper.querySelectorAll('.stepper-pill, .stepper-tab');
      const stage5Pill = pills[4];

      expect(stage5Pill.classList.contains('is-active')).toBe(true);
      expect(stage5Pill.className).toMatch(/indigo/i);
    });

    it('should switch current stage cleanly and update header metadata via navigateToStep', () => {
      const mockState = {
        isAudited: true,
        currentStep: 1,
        completedSteps: [1, 2, 3, 4, 5, 6],
        targetUrl: 'https://thatworkx.com'
      };

      visualizeModule.renderCockpit(mockState);
      visualizeModule.navigateToStep(3);

      const stageBadge = document.getElementById('canvas-stage-badge');
      const stageTitle = document.getElementById('canvas-stage-title');

      expect(stageBadge.textContent).toContain('STAGE 3 OF 6');
      expect(stageTitle.textContent).toMatch(/Content Availability/i);
      expect(visualizeModule.getCockpitState().currentStep).toBe(3);
    });
  });

  describe('4. Governance & Banned Terms Gate', () => {
    it('should verify zero occurrences of "AI-first" across the header and stepper', () => {
      const header = document.querySelector('header');
      expect(header.innerHTML).not.toMatch(/AI-first/i);
    });
  });
});
