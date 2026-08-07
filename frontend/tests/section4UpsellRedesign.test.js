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

describe('Section 4 Upsell Redesign BDD Suite', () => {
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

  it('Scenario 1: Section 3 contains zero upsell cards', () => {
    const section3 = document.getElementById('exec-section-3');
    expect(section3).not.toBeNull();

    // Verify neither old banner nor new card exist inside Section 3
    const oldBanner = section3.querySelector('#aioptimize-upsell-banner');
    const newUpsell = section3.querySelector('#section4-aioptimize-upsell');

    expect(oldBanner).toBeNull();
    expect(newUpsell).toBeNull();
  });

  it('Scenario 2: Section 4 contains the #section4-aioptimize-upsell container at the bottom', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    const upsell = section4.querySelector('#section4-aioptimize-upsell');
    expect(upsell).not.toBeNull();

    // Verify it is the last child element inside #exec-section-4
    expect(section4.lastElementChild).toBe(upsell);
  });

  it('Scenario 3: Section 4 upsell contains the correct copy and hooks', () => {
    const upsell = document.getElementById('section4-aioptimize-upsell');
    expect(upsell).not.toBeNull();

    const textContent = upsell.textContent;
    
    // Assert headlines and value hooks
    expect(textContent).toContain("Don't Re-Engineer Your Website for AI");
    expect(textContent).toContain("token");
    expect(textContent).toContain("manifests");

    // Assert CTA button id
    const ctaBtn = upsell.querySelector('#sec4-upgrade-btn');
    expect(ctaBtn).not.toBeNull();
    expect(ctaBtn.textContent.trim()).toBe('Generate Machine Manifests with AIOptimize Pro');

    // Assert pricing note presence
    const pricingNote = upsell.querySelector('.upsell-pricing-note');
    expect(pricingNote).not.toBeNull();
    expect(pricingNote.textContent).toContain('Available via Unlimited Monthly Sync or Flexible Per-URL Passes');
  });
});
