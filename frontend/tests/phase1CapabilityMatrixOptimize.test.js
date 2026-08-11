/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = path.resolve(__dirname, '../optimize.html');
const jsPath = path.resolve(__dirname, '../index.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

describe('Phase 1 - Mount 32-Capability Diagnostic Matrix in optimize.html BDD Test Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Load optimize.html into JSDOM
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/optimize.html'
    });
    window = dom.window;
    document = window.document;

    // Define standard globals needed by index.js to prevent runtime evaluation crashes
    window.API_BASE = 'http://localhost:5000';
    
    // Stub evaluateAllCapabilities and CAPABILITY_MATRIX to prevent runtime crashes
    window.evaluateAllCapabilities = (data) => {
      return {
        capabilities: [
          { id: 'robotsTxt', name: 'robots.txt presence', section: 4, status: 'pass', score: 100, description: 'robots.txt check' },
          { id: 'jsonLdSchema', name: 'JSON-LD Schema', section: 4, status: 'fail', score: 0, description: 'schema check' }
        ]
      };
    };
    window.CAPABILITY_MATRIX = [
      { id: 'robotsTxt' },
      { id: 'jsonLdSchema' }
    ];

    // Evaluate index.js inside the window context
    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: optimize.html contains the #dev-matrix-wrapper DOM container', () => {
    const wrapper = document.getElementById('dev-matrix-wrapper');
    expect(wrapper).not.toBeNull();
  });

  it('Scenario 2: index.js initializes renderDeveloperMetricMatrix() (or buildDevMatrixHtml()) under the currentPath.includes(\'optimize\') router block', () => {
    const wrapper = document.getElementById('dev-matrix-wrapper');
    expect(wrapper.innerHTML).toContain('diy-module-1');
    expect(wrapper.innerHTML).toContain('All (32)');
  });

  it('Scenario 3: Verify Tooltip & Help Integrity - Assert that help tooltips (? buttons / .help-icon) retain DOM data attributes and targets', () => {
    const wrapper = document.getElementById('dev-matrix-wrapper');
    const tooltipTriggers = wrapper.querySelectorAll('.help-tooltip-trigger, .info-help-btn, .help-icon');
    expect(tooltipTriggers.length).toBeGreaterThan(0);

    tooltipTriggers.forEach((el) => {
      const dataTarget = el.getAttribute('data-target') || el.getAttribute('data-section') || el.getAttribute('onclick');
      expect(dataTarget).not.toBeNull();
      expect(dataTarget.length).toBeGreaterThan(0);
    });
  });

  it('Scenario 4: Verify Technical JSON Export Payload - Assert that raw diagnostic summary functions export technical keys (hasFAQSchema, xRobotsTag, canonicalMatch, etc.) rather than stripped business labels for developer handoff', () => {
    expect(jsContent).toContain('exportRawJsonDiagnostics');
    expect(jsContent).toContain('hasFaqSchema');
    expect(jsContent).toContain('xRobotsTag');
    expect(jsContent).toContain('canonicalMatch');
  });

  it('Scenario 5: Vocabulary Gate - Assert zero occurrences of the banned phrase AI-first', () => {
    expect(/AI-first/i.test(htmlContent)).toBe(false);
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });
});
