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

describe('Section 3 & 4 Split Grid Layout BDD Suite', () => {
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

  it('Scenario 1: Section 3 and Section 4 exist inside a shared split container', () => {
    const splitContainer = document.querySelector('.exec-row-split');
    expect(splitContainer).not.toBeNull();

    const sec3 = splitContainer.querySelector('#exec-section-3');
    const sec4 = splitContainer.querySelector('#exec-section-4');

    expect(sec3).not.toBeNull();
    expect(sec4).not.toBeNull();

    // Verify they are sibling children of the split container
    expect(sec3.parentElement).toBe(splitContainer);
    expect(sec4.parentElement).toBe(splitContainer);
  });

  it('Scenario 2: Split container resides between page-level-inspector-container and upsell banner', () => {
    const execContainer = document.getElementById('executive-view-container');
    expect(execContainer).not.toBeNull();

    const inspector = document.getElementById('page-level-inspector-container');
    expect(inspector).not.toBeNull();

    const splitContainer = document.querySelector('.exec-row-split');
    expect(splitContainer).not.toBeNull();

    const upsellBanner = document.getElementById('aioptimize-action-banner');
    expect(upsellBanner).not.toBeNull();

    // Verify ordering
    expect(inspector.nextElementSibling).toBe(splitContainer);
    expect(splitContainer.nextElementSibling).toBe(upsellBanner);
  });
});
