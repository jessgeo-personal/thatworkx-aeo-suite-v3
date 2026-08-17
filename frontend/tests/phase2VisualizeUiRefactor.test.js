/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = path.resolve(__dirname, '../visualize.html');
const jsPath = path.resolve(__dirname, '../index.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

describe('Phase 2 - UI & Content Refactoring on AIVisualize BDD Test Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/visualize.html'
    });
    window = dom.window;
    document = window.document;

    window.API_BASE = 'http://localhost:5000';
    
    // Stub global dependencies
    window.evaluateAllCapabilities = (data) => {
      return {
        capabilities: [
          { id: 'robotsTxt', name: 'robots.txt presence', section: 4, status: 'pass', score: 100, description: 'robots.txt check' },
          { id: 'jsonLdSchema', name: 'JSON-LD Schema', section: 4, status: 'fail', score: 0, description: 'schema check' }
        ]
      };
    };
    window.CAPABILITY_MATRIX = [];

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings
    }

    // Manually dispatch DOMContentLoaded
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Alternative B Adaptive Floating Glass Dock exists on visualize.html containing business-friendly labels', () => {
    const dock = document.getElementById('floating-glass-dock') || document.querySelector('.floating-glass-dock');
    expect(dock).not.toBeNull();

    const text = dock.textContent;
    expect(text).toContain('1. AI Access');
    expect(text).toContain('2. Page Content');
    expect(text).toContain('3. Brand Trust');
    expect(text).toContain('4. AI Blueprint');
  });

  it('Scenario 2: visualize.html renders translated human business cards across Sections 1-3 (AI-Optimized) and Section 4 machine manifest tree (AI-Ready)', () => {
    const section1 = document.getElementById('section-1-card') || document.querySelector('[data-section-card="1"]');
    const section2 = document.getElementById('section-2-card') || document.querySelector('[data-section-card="2"]');
    const section3 = document.getElementById('section-3-card') || document.querySelector('[data-section-card="3"]');
    const section4 = document.getElementById('section-4-card') || document.querySelector('[data-section-card="4"]');

    expect(section1).not.toBeNull();
    expect(section2).not.toBeNull();
    expect(section3).not.toBeNull();
    expect(section4).not.toBeNull();

    expect(section1.textContent).toContain('AI-Optimized');
    expect(section2.textContent).toContain('AI-Optimized');
    expect(section3.textContent).toContain('AI-Optimized');
    expect(section4.textContent).toContain('AI-Ready');
  });

  it('Scenario 3: Verify Tooltip & Help Integrity - Assert that help tooltips (? buttons / .help-tooltip-trigger, .info-help-btn) retain DOM data attributes and targets on visualize.html', () => {
    const tooltipTriggers = document.querySelectorAll('.help-tooltip-trigger, .info-help-btn');
    expect(tooltipTriggers.length).toBeGreaterThan(0);

    tooltipTriggers.forEach((el) => {
      const dataTarget = el.getAttribute('data-target') || el.getAttribute('data-section') || el.getAttribute('onclick');
      expect(dataTarget).not.toBeNull();
      expect(dataTarget.length).toBeGreaterThan(0);
    });
  });

  it('Scenario 4: Verify Developer-First JSON Export Payload - Assert that "Export Raw JSON summary" retains technical diagnostic keys (hasFAQSchema, xRobotsTag, canonicalMatch, etc.) for developer handoff', () => {
    expect(jsContent).toContain('exportRawJsonDiagnostics');
    expect(jsContent).toContain('hasFaqSchema');
    expect(jsContent).toContain('xRobotsTag');
    expect(jsContent).toContain('canonicalMatch');
  });

  it('Scenario 5: Vocabulary Gate - Assert zero occurrences of the banned phrase AI-first', () => {
    expect(/AI-first/i.test(htmlContent)).toBe(false);
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });

  it("Scenario 6: Verify Control Header Card contains top-right export actions and toolbar Upgrade to AIOptimize Pro CTA", () => {
    const jsonBtn = document.getElementById("btn-export-json");
    const pdfBtn = document.getElementById("btn-export-pdf");
    const upgradeBtn = document.getElementById("btn-toolbar-upgrade-aioptimize");

    expect(jsonBtn).not.toBeNull();
    expect(pdfBtn).not.toBeNull();
    expect(upgradeBtn).not.toBeNull();
    expect(upgradeBtn.getAttribute("href")).toContain("optimize.html");
  });
});
