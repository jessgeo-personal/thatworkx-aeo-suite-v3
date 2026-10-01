import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 4: Stage 6 Boardroom View & Simulator Contract', () => {
  let dom;
  let document;
  let window;
  let visualize;

  const targetHtmlPath = path.resolve(__dirname, '../visualize.html');

  beforeEach(async () => {
    const htmlContent = fs.readFileSync(targetHtmlPath, 'utf-8');
    dom = new JSDOM(htmlContent, { runScripts: 'outside-only', url: 'http://localhost/' });
    document = dom.window.document;
    window = dom.window;

    global.window = window;
    global.document = document;

    visualize = await import('../visualize.js');
  });

  describe('1. Governance & Stage 6 Classification', () => {
    it('must enforce "Executive Boardroom" governance badge on Stage 6', () => {
      visualize.navigateToStep(6);
      expect(document.getElementById('canvas-governance-badge').textContent.trim()).toBe('Executive Boardroom');
    });

    it('must have ZERO occurrences of the banned term "AI-first" in Stage 6 content', () => {
      visualize.navigateToStep(6);
      expect(document.body.textContent).not.toMatch(/AI-first/i);
    });

    it('must hide the "Back to Summary" floating return anchor on Stage 6 itself', () => {
      visualize.navigateToStep(6);
      const returnAnchor = document.getElementById('canvas-return-anchor');
      expect(returnAnchor.classList.contains('hidden')).toBe(true);
    });
  });

  describe('2. Stage 6 Canvas: Boardroom View & Dial Scorecard', () => {
    beforeEach(() => {
      visualize.navigateToStep(6);
    });

    it('must render the Stage 6 title and prominent Diagnostic Score bubble in header', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('Executive Summary & Action Triage');

      const scorePill = document.getElementById('canvas-score-pill');
      expect(scorePill.classList.contains('hidden')).toBe(false);
      expect(scorePill.textContent).toContain('78/100');
      expect(scorePill.textContent).toContain('OPTIMIZED');
    });

    it('must render the AEO Health Index Dial with illuminated neon SVG circle and 78/100 score', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('AEO Health Index Dial');
      expect(canvasBody.textContent).toContain('78');
      expect(canvasBody.textContent).toContain('/ 100');

      const svgCircle = canvasBody.querySelector('svg circle[stroke-dasharray]');
      expect(svgCircle).not.toBeNull();
    });

    it('must render the Dual-Pillar Readiness Breakdown (Human 92% vs Machine 54%)', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Dual-Pillar Readiness Breakdown');
      expect(canvasBody.textContent).toContain('Human Web Readiness');
      expect(canvasBody.textContent).toContain('92%');
      expect(canvasBody.textContent).toContain('Machine Web Readiness');
      expect(canvasBody.textContent).toContain('54%');
    });

    it('must render the Top 5 Urgent Action Items triage card with severity badges and jump links', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Top 5 Urgent Action Items');
      expect(canvasBody.textContent).toContain('Triage Matrix');

      // 5 Ranked action items
      expect(canvasBody.textContent).toContain('Verify zero Cloudflare CAPTCHAs for ClaudeBot and PerplexityBot');
      expect(canvasBody.textContent).toContain('Publish dedicated /pricing commercial anchor page');
      expect(canvasBody.textContent).toContain('Ground Organization Schema with Wikidata and official sameAs profiles');
      expect(canvasBody.textContent).toContain('Refactor /demo and /case-studies to boost initial SSR text density above 25%');
      expect(canvasBody.textContent).toContain('Deploy missing /llms.txt and /llms-full.txt machine manifests');

      // Action navigation jump links
      const fixButtons = canvasBody.querySelectorAll('button');
      const buttonTexts = Array.from(fixButtons).map(b => b.textContent);
      expect(buttonTexts.some(t => t.includes('Fix in Stage 1'))).toBe(true);
      expect(buttonTexts.some(t => t.includes('Fix in Stage 2'))).toBe(true);
      expect(buttonTexts.some(t => t.includes('Fix in Stage 3'))).toBe(true);
      expect(buttonTexts.some(t => t.includes('Fix in Stage 4'))).toBe(true);
      expect(buttonTexts.some(t => t.includes('Fix in Stage 5'))).toBe(true);
    });

    it('must render the 5-Section Scorecard Matrix with deep-dive jump links', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('5-Section Scorecard Matrix');
      expect(canvasBody.textContent).toContain('AI Bot Blocks');
      expect(canvasBody.textContent).toContain('Essential Content');
      expect(canvasBody.textContent).toContain('Content Availability');
      expect(canvasBody.textContent).toContain('Trust & Privacy');
      expect(canvasBody.textContent).toContain('AI-Ready Files');
      expect(canvasBody.textContent).toContain('Inspect Deep-Dive');
    });
  });

  describe('3. Workbench Simulator & Telemetry Engine', () => {
    it('must render floating simulator control bar with required scenario triggers', () => {
      const btnSimProgress = document.getElementById('btn-sim-progress');
      expect(btnSimProgress).not.toBeNull();

      const buttons = Array.from(document.querySelectorAll('button'));
      const texts = buttons.map(b => b.textContent);
      expect(texts.some(t => t.includes('Early Inspection Mode'))).toBe(true);
      expect(texts.some(t => t.includes('Simulate System Failure'))).toBe(true);
      expect(texts.some(t => t.includes('Simulate Tablet/Mobile View'))).toBe(true);
      expect(texts.some(t => t.includes('Reset'))).toBe(true);
    });

    it('must render the System Failure banner when 504 gateway timeout occurs and mark quota uncharged', () => {
      visualize.triggerSystemFailureScenario();

      const banner = document.getElementById('system-failure-banner');
      expect(banner.classList.contains('hidden')).toBe(false);
      expect(banner.textContent).toContain('SYSTEM ERROR - NOT CHARGED');
      expect(banner.textContent).toContain('Retry Entire Audit');

      const quotaTag = document.getElementById('quota-tag');
      expect(quotaTag.textContent).toContain('NO');
      expect(quotaTag.textContent).toContain('UNCHARGED');
    });

    it('must render the non-intrusive floating toast when background scan completes during early inspection', () => {
      const toast = document.getElementById('toast-anti-hijack');
      expect(toast).not.toBeNull();

      visualize.showAntiHijackToast();
      expect(toast.classList.contains('opacity-0')).toBe(false);
      expect(toast.textContent).toContain('Full AEO Audit Complete');
      expect(toast.textContent).toContain('View Summary');
    });

    it('must reset state gracefully to "--" and "UNAUDITED" defaults on reset trigger', () => {
      visualize.resetToUnauditedState();

      expect(visualize.state.isAudited).toBe(false);
      expect(document.getElementById('scan-duration-label').textContent.trim()).toBe('--');
      expect(document.getElementById('total-pages-label').textContent.trim()).toBe('--');
      expect(document.getElementById('sidebar-stage-pill').textContent.trim()).toBe('UNAUDITED');
    });
  });
});
