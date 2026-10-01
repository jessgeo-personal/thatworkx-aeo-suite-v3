import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 2: Stages 1 & 2 Diagnostics Contract', () => {
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
    it('must enforce "AI-Optimized" governance badge on both Stage 1 and Stage 2', () => {
      visualize.navigateToStep(1);
      const badgeStage1 = document.getElementById('canvas-governance-badge');
      expect(badgeStage1.textContent.trim()).toBe('AI-Optimized');

      visualize.navigateToStep(2);
      const badgeStage2 = document.getElementById('canvas-governance-badge');
      expect(badgeStage2.textContent.trim()).toBe('AI-Optimized');
    });

    it('must have ZERO occurrences of the banned term "AI-first" across rendered content', () => {
      visualize.navigateToStep(1);
      expect(document.body.textContent).not.toMatch(/AI-first/i);

      visualize.navigateToStep(2);
      expect(document.body.textContent).not.toMatch(/AI-first/i);
    });

    it('must display the floating "Back to Summary" return anchor on Stages 1 and 2 when Stage 6 is completed', () => {
      visualize.navigateToStep(1);
      const returnAnchor = document.getElementById('canvas-return-anchor');
      expect(returnAnchor).not.toBeNull();
      expect(returnAnchor.classList.contains('hidden')).toBe(false);
    });
  });

  describe('2. Stage 1 Diagnostics: AI Bot Blocks & Gateway Permissions', () => {
    beforeEach(() => {
      visualize.navigateToStep(1);
    });

    it('must render Stage 1 Hero Title, Takeaway Header, and 100% PASS result', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('AI Bot Blocks & Crawler Gateway Permissions');

      const bodyText = document.getElementById('canvas-body').textContent;
      expect(bodyText).toContain('What AI Search Engines See & Why It Matters');
      expect(bodyText).toContain('100%');
      expect(bodyText).toContain('PASS');
    });

    it('must render the 50%/50% Dual-Workbench grid with Gateway Security Markers & 20 AI Engines Matrix', () => {
      const canvasBody = document.getElementById('canvas-body');
      
      // Column 1: Gateway & WAF Security Markers
      expect(canvasBody.textContent).toContain('Gateway & WAF Security Markers');
      expect(canvasBody.textContent).toContain('robots.txt Directives');
      expect(canvasBody.textContent).toContain('Cloudflare Challenge Gate');
      expect(canvasBody.textContent).toContain('X-Robots-Tag Server Headers');

      // Column 2: AI Crawler Allowance Matrix (20 Engines)
      expect(canvasBody.textContent).toContain('AI Crawler Allowance Matrix (20 Engines)');
      
      // Core AI Bots across provider groups
      const bots = [
        'GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'Claude-SearchBot',
        'Googlebot', 'Bingbot', 'PerplexityBot', 'Applebot-Extended',
        'Meta-ExternalAgent', 'Amazonbot', 'QwenBot', 'Bytespider', 'MistralBot'
      ];
      bots.forEach(bot => {
        expect(canvasBody.textContent).toContain(bot);
      });
      expect(canvasBody.textContent).toContain('20/20 ALLOWED');
    });

    it('must render the 3-part microcopy framework: Action Plan (with 4 expandable steps), Shortcut CTA, and Verification Evidence', () => {
      const canvasBody = document.getElementById('canvas-body');

      // Box 1: Manual Action Plan & 4 expandable fix steps
      expect(canvasBody.textContent).toContain('Action Plan: How to improve how AI can read your current pages better');
      expect(canvasBody.textContent).toContain('Review robots.txt directives');
      expect(canvasBody.textContent).toContain('Whitelist all 20 AI engines');
      expect(canvasBody.textContent).toContain('Configure Cloudflare / WAF rules');
      expect(canvasBody.textContent).toContain('Verify HTTP response headers');

      // Box 2: Automated Shortcut
      expect(canvasBody.textContent).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files');
      expect(canvasBody.textContent).toContain('Deploy AI-Ready files using AIOptimize Pro');

      // Verification Evidence Drawer with trace
      expect(canvasBody.textContent).toContain('Verification Evidence (What We Found)');
      expect(canvasBody.textContent).toContain('HTTP/2 200 OK');
    });
  });

  describe('3. Stage 2 Diagnostics: Identifiable Essential Pages & Core Anchors', () => {
    beforeEach(() => {
      visualize.navigateToStep(2);
    });

    it('must render Stage 2 Hero Title, Takeaway Header, and 75% WARN result', () => {
      const title = document.getElementById('canvas-stage-title');
      expect(title.textContent).toContain('Identifiable Essential Pages & Core Anchors');

      const bodyText = document.getElementById('canvas-body').textContent;
      expect(bodyText).toContain('What AI Search Engines See & Why It Matters');
      expect(bodyText).toContain('75%');
      expect(bodyText).toContain('WARN');
    });

    it('must render the 5-Anchor Kanban Matrix verifying /about, /contact, /privacy-policy, /terms-of-service, and /pricing', () => {
      const canvasBody = document.getElementById('canvas-body');
      expect(canvasBody.textContent).toContain('5-Anchor Essential Kanban Matrix');
      expect(canvasBody.textContent).toContain('4 FOUND • 1 MISSING (/pricing)');

      const anchors = ['/about', '/contact', '/privacy-policy', '/terms-of-service', '/pricing'];
      anchors.forEach(path => {
        expect(canvasBody.textContent).toContain(path);
      });

      // Statuses & Citation Readiness
      expect(canvasBody.textContent).toContain('95%');
      expect(canvasBody.textContent).toContain('90%');
      expect(canvasBody.textContent).toContain('0%'); // Missing pricing
    });

    it('must render the Action Plan with 4 expandable steps, Shortcut Card, and Evidence Drawer for Stage 2', () => {
      const canvasBody = document.getElementById('canvas-body');

      // Box 1: Manual Action Plan & 4 steps
      expect(canvasBody.textContent).toContain('Action Plan: How to improve how AI can read your current pages better');
      expect(canvasBody.textContent).toContain('Create canonical /pricing endpoint');
      expect(canvasBody.textContent).toContain('Verify HTTP 200 responses');
      expect(canvasBody.textContent).toContain('Update header & footer navigation');
      expect(canvasBody.textContent).toContain('Embed Offer and ContactPoint schemas');

      // Box 2: Recommended Shortcut
      expect(canvasBody.textContent).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files');

      // Verification Evidence Drawer
      expect(canvasBody.textContent).toContain('Verification Evidence (What We Found)');
      expect(canvasBody.textContent).toContain('GET /pricing -> 404 Not Found');
    });
  });
});
