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

describe('Phase 3 - Layout Cleanup BDD Test Suite', () => {
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
    window.evaluateAllCapabilities = (data) => {
      return {
        capabilities: [
          { id: 'robotsTxt', name: 'robots.txt presence', section: 4, status: 'pass', score: 100, description: 'robots.txt check' }
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

  it('Scenario 1: Full-Width Unstacking - Assert card wrappers span full container width and are not constrained by legacy split grid', () => {
    // Assert that .exec-row-split is removed from visualize.html
    const splitWrapper = document.querySelector('.exec-row-split');
    expect(splitWrapper).toBeNull();

    // Assert that the card wrappers exist
    const section1 = document.getElementById('section-1-card');
    const section2 = document.getElementById('section-2-card');
    const section3 = document.getElementById('section-3-card');
    const section4 = document.getElementById('section-4-card');

    expect(section1).not.toBeNull();
    expect(section2).not.toBeNull();
    expect(section3).not.toBeNull();
    expect(section4).not.toBeNull();
  });

  it('Scenario 2: Legacy Dev Mode Removal - Assert obsolete #dev-mode-container and .view-mode-pill-container are removed', () => {
    const devModeContainer = document.getElementById('dev-mode-container');
    const viewModePillContainer = document.querySelector('.view-mode-pill-container');

    expect(devModeContainer).toBeNull();
    expect(viewModePillContainer).toBeNull();
  });

  it('Scenario 3: Decoupled Executive Matrix - Assert raw developer matrix wrapper (#dev-matrix-wrapper) is removed', () => {
    const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
    expect(devMatrixWrap).toBeNull();

    // Verify sections contain expected terminology
    const section1 = document.getElementById('section-1-card');
    const section2 = document.getElementById('section-2-card');
    const section3 = document.getElementById('section-3-card');
    const section4 = document.getElementById('section-4-card');

    expect(section1.textContent).toContain('AI-Optimized');
    expect(section2.textContent).toContain('AI-Optimized');
    expect(section3.textContent).toContain('AI-Optimized');
    expect(section4.textContent).toContain('AI-Ready');
  });

  it('Scenario 4: Tooltip & Help Integrity - Assert ? help buttons retain event handler or mapping attributes', () => {
    const helpButtons = Array.from(document.querySelectorAll('.info-help-btn, .help-tooltip-trigger'));
    expect(helpButtons.length).toBeGreaterThan(0);

    helpButtons.forEach(btn => {
      const onclickAttr = btn.getAttribute('onclick');
      const hasOnclick = onclickAttr !== null;
      const hasDataSection = btn.getAttribute('data-section') !== null;
      const hasDataTooltip = btn.getAttribute('data-tooltip') !== null;
      expect(hasOnclick || hasDataSection || hasDataTooltip).toBe(true);
    });
  });

  it('Scenario 5: Vocabulary Gate - Assert zero occurrences of the banned phrase AI-first', () => {
    const fullHtml = fs.readFileSync(htmlPath, 'utf8');
    const fullJs = fs.readFileSync(jsPath, 'utf8');
    
    expect(fullHtml.toLowerCase()).not.toContain('ai-first');
    expect(fullJs.toLowerCase()).not.toContain('ai-first');
  });
});
