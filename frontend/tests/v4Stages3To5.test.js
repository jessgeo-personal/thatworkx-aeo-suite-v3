import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 3: Stages 3, 4 & 5 Diagnostics Contract', () => {
  let dom;
  let document;
  let window;
  let visualize;

  const targetHtmlPath = path.resolve(__dirname, '../visualize.html');

  beforeEach(async () => {
    const htmlContent = fs.readFileSync(targetHtmlPath, 'utf-8');
    dom = new JSDOM(htmlContent, { runScripts: 'outside-only' });
    document = dom.window.document;
    window = dom.window;

    global.window = window;
    global.document = document;

    visualize = await import('../visualize.js');
  });

  describe('1. Governance & Classification Gates', () => {
    it('must enforce "AI-Optimized" on Stages 3 & 4, and "AI-Ready" on Stage 5', () => {
      visualize.navigateToStep(3);
      expect(document.getElementById('canvas-governance-badge').textContent.trim()).toBe('AI-Optimized');

      visualize.navigateToStep(4);
      expect(document.getElementById('canvas-governance-badge').textContent.trim()).toBe('AI-Optimized');

      visualize.navigateToStep(5);
      expect(document.getElementById('canvas-governance-badge').textContent.trim()).toBe('AI-Ready');
    });

    it('must have ZERO occurrences of the banned term "AI-first" across Stages 3, 4, and 5', () => {
      [3, 4, 5].forEach(step => {
        visualize.navigateToStep(step);
        expect(document.body.textContent).not.toMatch(/AI-first/i);
      });
    });

    it('must display the floating "Back to Summary" return anchor on Stages 3, 4, and 5', () => {
      [3, 4, 5].forEach(step => {
        visualize.navigateToStep(step);
        const returnAnchor = document.getElementById('canvas-return-anchor');
        expect(returnAnchor).not.toBeNull();
        expect(returnAnchor.classList.contains('hidden')).toBe(false);
      });
    });
  });

  describe('2. Stage 3 Diagnostics: Content Availability & Semantic Text Density', () => {
    beforeEach(() => {
      visualize.navigateToStep(3);
    });

    it('must render Stage 3 Hero Title, Takeaway Header, and 68% WARN result', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('Content Availability & Semantic Text Density');

      const bodyText = document.getElementById('canvas-body').textContent;
      expect(bodyText).toContain('What AI Search Engines See & Why It Matters');
      expect(bodyText).toContain('68%');
      expect(bodyText).toContain('WARN');
    });

    it('must render Semantic Text Density Thermometers with 24 Total Pages Scanned badge', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Semantic Text Density Thermometers');
      expect(canvasBody.textContent).toContain('24 Total Pages Scanned');
      expect(canvasBody.textContent).toContain('Avg 28.4% Density');
    });

    it('must render page cards with action buttons: "View What AI sees" and "Details"', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('View What AI sees');
      expect(canvasBody.textContent).toContain('Details');
      expect(canvasBody.textContent).toContain('/demo/workspace');
      expect(canvasBody.textContent).toContain('Information Gain Score:');
    });

    it('must render in-page remediation details matching legacy Module 4 diagnostics', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Page Diagnostic Breakdown & In-Page Fix Snippets');
      expect(canvasBody.textContent).toContain('Missing Canonical URL');
      expect(canvasBody.textContent).toContain('Missing Required Semantic HTML5 Tags');
      expect(canvasBody.textContent).toContain('Images Without Alt Attributes');
      expect(canvasBody.textContent).toContain('Missing Revision Date');
    });

    it('must render pagination control "Load Next 5 Pages"', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toMatch(/Load Next 5 Pages|All 24 Scanned Pages Loaded/i);
    });

    it('must render Stage 3 Action Plan, Shortcut Card, and Verification Evidence drawer', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Action Plan: How to improve how AI can read your current pages better');
      expect(canvasBody.textContent).toContain('Audit low-density SPA routes');
      expect(canvasBody.textContent).toContain('Enable SSR or SSG pre-rendering');
      expect(canvasBody.textContent).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files');
      expect(canvasBody.textContent).toContain('Verification Evidence (What We Found)');
      expect(canvasBody.textContent).toContain('Average Text-to-HTML Ratio: 28.4%');
    });
  });

  describe('3. Stage 4 Diagnostics: Entity Authority, E-E-A-T & Privacy Indicators', () => {
    beforeEach(() => {
      visualize.navigateToStep(4);
    });

    it('must render Stage 4 Hero Title, Takeaway Header, and 80% PASS result', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('Entity Authority, E-E-A-T & Privacy Indicators');

      const bodyText = document.getElementById('canvas-body').textContent;
      expect(bodyText).toContain('What AI Search Engines See & Why It Matters');
      expect(bodyText).toContain('80%');
      expect(bodyText).toContain('PASS');
    });

    it('must render the 4-card Entity Authority & E-E-A-T Relational Graph', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Entity Authority & E-E-A-T Relational Graph');
      expect(canvasBody.textContent).toContain('Schema/Organization');
      expect(canvasBody.textContent).toContain('Author Person E-E-A-T');
      expect(canvasBody.textContent).toContain('Wikidata Grounding');
      expect(canvasBody.textContent).toContain('Privacy & Legal Anchors');
      expect(canvasBody.textContent).toContain('100% VALID GRAPH');
      expect(canvasBody.textContent).toContain('VERIFIED SAMEAS');
    });

    it('must render Stage 4 Action Plan, Shortcut Card, and Verification Evidence drawer', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Action Plan: How to improve how AI can read your current pages better');
      expect(canvasBody.textContent).toContain('Deploy JSON-LD Organization schema');
      expect(canvasBody.textContent).toContain('Connect verified sameAs authority links');
      expect(canvasBody.textContent).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files');
      expect(canvasBody.textContent).toContain('Verification Evidence (What We Found)');
      expect(canvasBody.textContent).toContain('knowsAbout');
    });
  });

  describe('4. Stage 5 Diagnostics: Machine Manifest Protocol Explorer (AI-Ready)', () => {
    beforeEach(() => {
      visualize.navigateToStep(5);
    });

    it('must render Stage 5 Hero Title, Takeaway Header, and 40% WARN result', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('Machine Manifest Protocol Explorer');

      const bodyText = document.getElementById('canvas-body').textContent;
      expect(bodyText).toContain('What AI Search Engines See & Why It Matters');
      expect(bodyText).toContain('40%');
      expect(bodyText).toContain('WARN');
    });

    it('must render the complete 4-Level Machine Manifest Hierarchy', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('4-LEVEL HIERARCHY');
      expect(canvasBody.textContent).toContain('LEVEL 1: PROTOCOL GATES (THE GATEKEEPERS)');
      expect(canvasBody.textContent).toContain('/robots.txt');

      expect(canvasBody.textContent).toContain('LEVEL 2: THE WELCOME MAT (DIRECTORY INDEX)');
      expect(canvasBody.textContent).toContain('/sitemap.xml');
      expect(canvasBody.textContent).toContain('/llms.txt');

      expect(canvasBody.textContent).toContain('LEVEL 3: CONTEXT MAPS & BLUEPRINT');
      expect(canvasBody.textContent).toContain('/ai-context.md');

      expect(canvasBody.textContent).toContain('LEVEL 4: WORKSPACES & DOCUMENTATION');
      expect(canvasBody.textContent).toContain('/README.md');
      expect(canvasBody.textContent).toContain('/about.md');
      expect(canvasBody.textContent).toContain('/docs.md');
      expect(canvasBody.textContent).toContain('/content.md');
    });

    it('must render Stage 5 Action Plan, Shortcut Card, and Verification Evidence drawer', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('Action Plan: How to improve how AI can read your current pages better');
      expect(canvasBody.textContent).toContain('Publish Level 1 robots.txt directive');
      expect(canvasBody.textContent).toContain('Create Level 2 /llms.txt directory index');
      expect(canvasBody.textContent).toContain('Deploy Level 3 /ai-context.md blueprint');
      expect(canvasBody.textContent).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files');
      expect(canvasBody.textContent).toContain('Verification Evidence (What We Found)');
      expect(canvasBody.textContent).toContain('GET /robots.txt -> 200 OK');
    });
  });
});
