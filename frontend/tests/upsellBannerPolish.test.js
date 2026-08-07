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

describe('AIOptimize Upsell Banner Polish BDD Suite', () => {
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

  it('Scenario 1: Upsell banner exists at the bottom of executive-view-container following Section 4', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    const banner = document.getElementById('aioptimize-upsell-banner');
    expect(banner).not.toBeNull();

    // Verify it is the sibling directly following Section 4
    expect(section4.nextElementSibling).toBe(banner);
  });

  it('Scenario 2: Banner contains the primary upgrade CTA button', () => {
    const banner = document.getElementById('aioptimize-upsell-banner');
    expect(banner).not.toBeNull();

    // Assert presence of the primary upgrade button by ID
    const ctaBtn = banner.querySelector('#upgrade-aioptimize-btn');
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn.className).toContain('aioptimize-cta-btn');
    expect(ctaBtn.textContent).toContain('Upgrade to AIOptimize Pro');
  });

  it('Scenario 3: Banner displays the coverage gap checklist and risk summary bullets', () => {
    const banner = document.getElementById('aioptimize-upsell-banner');
    expect(banner).not.toBeNull();

    const htmlLower = banner.innerHTML.toLowerCase();

    // Assert it displays coverage gap keywords/checklist
    expect(htmlLower).toContain('checklist');
    expect(htmlLower).toContain('rich entity schema');
    expect(htmlLower).toContain('e-e-a-t');

    // Assert it displays risk summary details
    expect(htmlLower).toContain('risks');
    expect(htmlLower).toContain('zero-click');
    expect(htmlLower).toContain('context budget');
  });
});
