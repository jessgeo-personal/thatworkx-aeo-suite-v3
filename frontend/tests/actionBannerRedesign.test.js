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

describe('Action Banner Redesign BDD Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Load visualize.html into JSDOM
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/visualize.html'
    });
    window = dom.window;
    document = window.document;

    // Define standard globals needed by index.js to prevent runtime evaluation crashes
    window.API_BASE = 'http://localhost:5000';
    
    // Evaluate index.js inside the window context
    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings in JSDOM environment
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Section 3 and Section 4 contain zero internal upsell cards', () => {
    const section3 = document.getElementById('section-3-card');
    const section4 = document.getElementById('section-4-card');

    expect(section3).not.toBeNull();
    expect(section4).not.toBeNull();

    // Verify neither Section 3 nor Section 4 contains the upsell banner
    expect(section3.querySelector('#aioptimize-upsell-banner')).toBeNull();
    expect(section3.querySelector('#section4-aioptimize-upsell')).toBeNull();
    expect(section3.querySelector('#aioptimize-action-banner')).toBeNull();

    expect(section4.querySelector('#aioptimize-upsell-banner')).toBeNull();
    expect(section4.querySelector('#section4-aioptimize-upsell')).toBeNull();
    expect(section4.querySelector('#aioptimize-action-banner')).toBeNull();
  });

  it('Scenario 2: Full-width action banner exists directly after #section-4-card', () => {
    const execContainer = document.getElementById('executive-view-container');
    expect(execContainer).not.toBeNull();

    const sec4 = document.getElementById('section-4-card');
    expect(sec4).not.toBeNull();

    const actionBanner = document.getElementById('aioptimize-action-banner');
    expect(actionBanner).not.toBeNull();

    // Verify action banner is positioned immediately after Section 4
    expect(sec4.nextElementSibling).toBe(actionBanner);
  });

  it('Scenario 3: Action banner contains urgency pill, both comparison cards, and CTA button', () => {
    const actionBanner = document.getElementById('aioptimize-action-banner');
    expect(actionBanner).not.toBeNull();

    // Assert urgency pill
    const urgencyPill = actionBanner.querySelector('.urgency-pill');
    expect(urgencyPill).not.toBeNull();
    expect(urgencyPill.textContent).toContain('BUSINESS VISIBILITY ALERT');

    // Assert comparison cards
    const wayHard = actionBanner.querySelector('.comparison-card.way-hard');
    const wayEasy = actionBanner.querySelector('.comparison-card.way-easy');
    expect(wayHard).not.toBeNull();
    expect(wayEasy).not.toBeNull();
    expect(wayHard.querySelector('h4').textContent).toContain('Rebuilding Your Entire Website');
    expect(wayEasy.querySelector('h4').textContent).toContain('1-Click AI Machine Blueprints');

    // Assert CTA button
    const ctaBtn = actionBanner.querySelector('#banner-activate-btn');
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn.className).toContain('btn-urgent');
    expect(ctaBtn.textContent.trim()).toBe('🚀 Make My Website AI-Ready with AIOptimize Pro');

    // Assert headline
    const headline = actionBanner.querySelector('h2');
    expect(headline).not.toBeNull();
    expect(headline.textContent).toBe('Your Website Was Built for Human Eyes—Not AI Search Engines');
  });

  it("Scenario 4: Action banner inherits smooth hover reaction and elevation styling", () => {
    const cssFile = fs.readFileSync(path.resolve(__dirname, "../index.css"), "utf8");
    expect(cssFile).toContain("#aioptimize-action-banner:hover");
    expect(cssFile).toContain("transform: translateY(-2px)");
  });
});
