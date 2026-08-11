/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

const htmlPath = path.resolve(__dirname, '../visualize.html');
const optPath = path.resolve(__dirname, '../optimize.html');
const jsPath = path.resolve(__dirname, '../index.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const optContent = fs.readFileSync(optPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

describe('AEO Suite Surgical Repair BDD Test Suite', () => {
  it('Scenario 1: optimize.html Module Integration - Assert capabilityEvaluator.js module script and matrix rows', () => {
    // 1. Assert script tag exists in static HTML of optimize.html
    const $ = cheerio.load(optContent);
    const moduleScript = $('script[type="module"]').filter((i, el) => {
      return $(el).text().includes('capabilityEvaluator.js');
    });
    expect(moduleScript.length).toBe(1);

    // 2. Load JSDOM for optimize.html and verify populated rows
    const dom = new JSDOM(optContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/optimize.html'
    });
    const { window } = dom;
    const { document } = window;

    window.API_BASE = 'http://localhost:5000';
    // Evaluate capabilityEvaluator.js stubs
    window.evaluateAllCapabilities = () => {
      return {
        capabilities: Array.from({ length: 32 }, (_, i) => ({
          id: `cap-${i}`,
          name: `Capability ${i}`,
          section: (i % 4) + 1,
          status: 'pass',
          score: 100,
          description: `Description ${i}`
        }))
      };
    };
    window.CAPABILITY_MATRIX = Array.from({ length: 32 }, (_, i) => ({
      id: `cap-${i}`,
      name: `Capability ${i}`,
      section: (i % 4) + 1,
      helpText: `Help ${i}`
    }));

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings
    }

    // Trigger DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);

    const devMatrixTbody = document.getElementById('dev-matrix-tbody');
    expect(devMatrixTbody).not.toBeNull();
    // After render, it should contain children (representing capabilities)
    expect(devMatrixTbody.children.length).toBeGreaterThan(0);
  });

  it('Scenario 2: Glass Dock Smooth Scroll - Assert .dock-link elements target section cards and do not trigger help modal', () => {
    const dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/visualize.html'
    });
    const { window } = dom;
    const { document } = window;

    window.API_BASE = 'http://localhost:5000';
    try {
      window.eval(jsContent);
    } catch (err) {}

    // Dispatch DOMContentLoaded
    const event = new window.Event('DOMContentLoaded');
    document.dispatchEvent(event);

    const dock = document.getElementById('floating-glass-dock');
    expect(dock).not.toBeNull();

    const links = Array.from(dock.querySelectorAll('.dock-link'));
    expect(links.length).toBe(4);

    const expectedTargets = ['#section-1-card', '#section-2-card', '#section-3-card', '#section-4-card'];
    links.forEach((link, idx) => {
      expect(link.getAttribute('href')).toBe(expectedTargets[idx]);
    });

    // Verify help modal is hidden initially
    const helpModal = document.getElementById('help-modal');
    expect(helpModal.classList.contains('help-modal-hidden')).toBe(true);

    // Click a dock link and verify help modal is NOT triggered/shown
    links[0].click();
    expect(helpModal.classList.contains('help-modal-hidden')).toBe(true);
  });

  it('Scenario 3: 100% Full-Width Executive Layout - Assert proper HTML closing tags and unconstrained full-width cards', () => {
    const $ = cheerio.load(htmlContent);

    // 1. Assert score-dial-card does not contain any pillar-card
    const scoreDialCard = $('.score-dial-card');
    const childPillarCards = scoreDialCard.find('.pillar-card');
    expect(childPillarCards.length).toBe(0);

    // 2. Assert that section card wrappers are direct children under #executive-view-container (or only styled full-width elements)
    const section1 = $('#section-1-card');
    const section2 = $('#section-2-card');
    const section3 = $('#section-3-card');
    const section4 = $('#section-4-card');

    expect(section1.length).toBe(1);
    expect(section2.length).toBe(1);
    expect(section3.length).toBe(1);
    expect(section4.length).toBe(1);

    // Verify parent structure of section cards to ensure no 1/3 grid/flex column constraint
    const p1 = section1.parent();
    const p2 = section2.parent();
    const p3 = section3.parent();
    const p4 = section4.parent();

    // They should not have ancestors with .exec-row-split or display style constraining them to narrow grid cols
    expect(p1.closest('.exec-row-split').length).toBe(0);
    expect(p2.closest('.exec-row-split').length).toBe(0);
    expect(p3.closest('.exec-row-split').length).toBe(0);
    expect(p4.closest('.exec-row-split').length).toBe(0);
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase AI-first', () => {
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(optContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
