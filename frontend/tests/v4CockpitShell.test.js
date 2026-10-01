import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 1: Cockpit Layout Shell & Navigation Contract', () => {
  let htmlContent;
  let dom;
  let document;

  const targetPath = path.resolve(__dirname, '../visualize.html');

  beforeEach(() => {
    expect(fs.existsSync(targetPath), 'frontend/visualize.html must exist as the new V4 dashboard entrypoint').toBe(true);
    htmlContent = fs.readFileSync(targetPath, 'utf-8');
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('1. Strict Governance & Architectural Gates', () => {
    it('must have ZERO occurrences of the banned term "AI-first"', () => {
      expect(htmlContent).not.toMatch(/AI-first/i);
    });

    it('must explicitly separate "AI-Optimized" (Stages 1-4) and "AI-Ready" (Stage 5)', () => {
      expect(htmlContent).toMatch(/AI-Optimized/);
      expect(htmlContent).toMatch(/AI-Ready/);
    });

    it('must enforce graceful default fallbacks ("--", "UNAUDITED") in unpopulated metadata fields', () => {
      const durationLabel = document.getElementById('scan-duration-label');
      const pagesLabel = document.getElementById('total-pages-label');
      if (durationLabel && pagesLabel) {
        expect(durationLabel.textContent.trim()).toMatch(/^(--|[0-9.]+s)$/);
        expect(pagesLabel.textContent.trim()).toMatch(/^(--|[0-9]+)$/);
      }
    });
  });

  describe('2. Streamlined Multi-Row Header Bar', () => {
    it('must render the Line 1 header actions: drawer toggle button, logo, and Rescan & New Scan buttons', () => {
      const drawerToggle = document.getElementById('btn-toggle-sidebar');
      expect(drawerToggle, 'Drawer toggle button (#btn-toggle-sidebar) must exist in Line 1').not.toBeNull();

      const buttons = Array.from(document.querySelectorAll('header button'));
      const buttonTexts = buttons.map(b => b.textContent.trim());
      expect(buttonTexts.some(t => /Rescan/i.test(t)), 'Line 1 must contain a Rescan button').toBe(true);
      expect(buttonTexts.some(t => /New Scan/i.test(t)), 'Line 1 must contain a New Scan button').toBe(true);
    });

    it('must render the Line 2 metadata badges and export controls', () => {
      const urlBadge = document.getElementById('target-domain-badge');
      const timestampLabel = document.getElementById('timestamp-label');
      const scanDurationLabel = document.getElementById('scan-duration-label');
      const totalPagesLabel = document.getElementById('total-pages-label');

      expect(urlBadge, '#target-domain-badge must exist on Line 2').not.toBeNull();
      expect(timestampLabel, '#timestamp-label must exist on Line 2').not.toBeNull();
      expect(scanDurationLabel, '#scan-duration-label must exist on Line 2').not.toBeNull();
      expect(totalPagesLabel, '#total-pages-label must exist on Line 2').not.toBeNull();

      const exportButtons = Array.from(document.querySelectorAll('header button'));
      const exportTexts = exportButtons.map(b => b.textContent.trim());
      expect(exportTexts.some(t => /JSON/i.test(t)), 'Line 2 must contain a JSON export button').toBe(true);
      expect(exportTexts.some(t => /PDF/i.test(t)), 'Line 2 must contain a PDF export button').toBe(true);
    });

    it('must render the dynamic accordion stepper navigation bar (#desktop-stepper)', () => {
      const stepper = document.getElementById('desktop-stepper');
      expect(stepper, '#desktop-stepper navigation bar must exist directly below header').not.toBeNull();
    });
  });

  describe('3. 3D Elevated Slide-Out Drawer & Backdrop', () => {
    it('must render the 3D drawer container and backdrop overlay', () => {
      const drawer = document.getElementById('main-terminal-sidebar');
      const backdrop = document.getElementById('sidebar-backdrop');

      expect(drawer, '#main-terminal-sidebar must exist').not.toBeNull();
      expect(backdrop, '#sidebar-backdrop overlay must exist').not.toBeNull();
    });

    it('must include the 4 drawer zones: Active Scan Capsule, Progressive Summaries, Live Stream, and Quota Monitor', () => {
      const verboseCopy = document.getElementById('sidebar-verbose-copy');
      const milestonesList = document.getElementById('sidebar-milestones-list');
      const telemetryStream = document.getElementById('sidebar-telemetry-stream');
      const quotaTag = document.getElementById('quota-tag');
      const systemStatus = document.getElementById('system-status-indicator');

      expect(verboseCopy, 'Active scan capsule verbose copy container must exist').not.toBeNull();
      expect(milestonesList, 'Progressive section summaries list (#sidebar-milestones-list) must exist').not.toBeNull();
      expect(telemetryStream, 'Live audit stream (#sidebar-telemetry-stream) must exist').not.toBeNull();
      expect(quotaTag, 'Quota monitor tag (#quota-tag) must exist').not.toBeNull();
      expect(systemStatus, 'System status indicator must exist').not.toBeNull();
    });
  });

  describe('4. Active Workspace Canvas Header', () => {
    it('must render standard stage hero elements: badge, governance marker, hero title, and score pill', () => {
      const stageBadge = document.getElementById('canvas-stage-badge');
      const governanceBadge = document.getElementById('canvas-governance-badge');
      const stageTitle = document.getElementById('canvas-stage-title');
      const stageDesc = document.getElementById('canvas-stage-desc');
      const scorePill = document.getElementById('canvas-score-pill');
      const canvasBody = document.getElementById('canvas-body');

      expect(stageBadge, '#canvas-stage-badge must exist').not.toBeNull();
      expect(governanceBadge, '#canvas-governance-badge must exist').not.toBeNull();
      expect(stageTitle, '#canvas-stage-title must exist').not.toBeNull();
      expect(stageDesc, '#canvas-stage-desc must exist').not.toBeNull();
      expect(scorePill, '#canvas-score-pill must exist').not.toBeNull();
      expect(canvasBody, '#canvas-body main container must exist').not.toBeNull();
    });
  });
});
