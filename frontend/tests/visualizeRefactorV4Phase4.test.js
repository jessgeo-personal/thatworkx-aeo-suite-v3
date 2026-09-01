import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 4: Interactivity & Governance Regression Contract', () => {
  let htmlContent;
  let dom;
  let document;
  let window;

  const visualizePath = path.resolve(__dirname, '../visualize.html');
  const jsPath = path.resolve(__dirname, '../index.js');

  beforeEach(async () => {
    expect(fs.existsSync(visualizePath), 'frontend/visualize.html must exist').toBe(true);
    htmlContent = fs.readFileSync(visualizePath, 'utf-8');
    
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/'
    });
    document = dom.window.document;
    window = dom.window;

    // Load and execute index.js in JSDOM environment if exported/initializable
    if (fs.existsSync(jsPath)) {
      const jsCode = fs.readFileSync(jsPath, 'utf-8');
      const scriptEl = document.createElement('script');
      scriptEl.textContent = jsCode;
      document.body.appendChild(scriptEl);
      // Dispatch DOMContentLoaded
      document.dispatchEvent(new window.Event('DOMContentLoaded'));
    }
  });

  describe('1. Absolute Governance & Banned Terms Regression Gate', () => {
    it('must have ZERO occurrences of the banned term "AI-first" across HTML, JS, and CSS', () => {
      const cssPath = path.resolve(__dirname, '../index.css');
      const cssContent = fs.readFileSync(cssPath, 'utf-8');
      const jsContent = fs.readFileSync(jsPath, 'utf-8');

      expect(htmlContent).not.toMatch(/AI-first/i);
      expect(cssContent).not.toMatch(/AI-first/i);
      expect(jsContent).not.toMatch(/AI-first/i);
    });

    it('must enforce AI-Ready strictly for manifests and AI-Optimized for audit/presence', () => {
      const optimizedElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent.includes('AI-Optimized')
      );
      const readyElements = Array.from(document.querySelectorAll('*')).filter(el => 
        el.textContent.includes('AI-Ready')
      );

      expect(optimizedElements.length).toBeGreaterThan(0);
      expect(readyElements.length).toBeGreaterThan(0);
    });
  });

  describe('2. Center Feed Tab Switcher Interactivity', () => {
    it('must toggle active tab class when clicking "Pages" or "Competitors"', () => {
      const manifestsTab = document.querySelector('button[data-feed-tab="manifests"]');
      const pagesTab = document.querySelector('button[data-feed-tab="pages"]');
      const competitorsTab = document.querySelector('button[data-feed-tab="competitors"]');

      expect(manifestsTab).not.toBeNull();
      expect(pagesTab).not.toBeNull();
      expect(competitorsTab).not.toBeNull();

      // Trigger click on pages tab
      pagesTab.click();

      // Verify active state classes shifted
      expect(pagesTab.classList.contains('active') || pagesTab.classList.contains('text-emerald-400') || pagesTab.getAttribute('aria-selected') === 'true').toBe(true);
    });
  });

  describe('3. Discovery Card Click -> Inspector Dynamic Update Interactivity', () => {
    it('must update Inspector target title and code viewer when a discovery card is clicked', () => {
      const robotsCard = Array.from(document.querySelectorAll('[data-testid="discovery-card"]')).find(card => 
        card.textContent.includes('/robots.txt')
      );
      expect(robotsCard).toBeDefined();

      // Click robots.txt card
      robotsCard.click();

      const targetTitle = document.querySelector('[data-testid="inspector-target-title"]');
      const codeViewer = document.querySelector('[data-testid="manifest-code-viewer"]');

      expect(targetTitle.textContent.trim()).toBe('/robots.txt');
      expect(codeViewer.textContent).toContain('User-agent:');
    });

    it('must update Inspector to schema.jsonld when schema card is clicked', () => {
      const schemaCard = Array.from(document.querySelectorAll('[data-testid="discovery-card"]')).find(card => 
        card.textContent.includes('schema.jsonld')
      );
      expect(schemaCard).toBeDefined();

      schemaCard.click();

      const targetTitle = document.querySelector('[data-testid="inspector-target-title"]');
      const codeViewer = document.querySelector('[data-testid="manifest-code-viewer"]');

      expect(targetTitle.textContent.trim()).toBe('schema.jsonld');
      expect(codeViewer.textContent).toContain('@context');
    });
  });

  describe('4. Inspector Copy Trigger Interactivity', () => {
    it('must update copy button text to "Copied!" upon trigger', () => {
      const copyBtn = document.querySelector('[data-action="copy-manifest"]');
      expect(copyBtn).not.toBeNull();

      // Mock navigator.clipboard
      window.navigator.clipboard = {
        writeText: vi.fn().mockResolvedValue()
      };

      copyBtn.click();
      expect(copyBtn.textContent.trim()).toMatch(/Copied!|Copied/i);
    });
  });
});
