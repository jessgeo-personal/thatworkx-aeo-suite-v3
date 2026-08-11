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

  it('Scenario 1: Section 3 and Section 4 exist and are unstacked full-width components', () => {
    const splitContainer = document.querySelector('.exec-row-split');
    expect(splitContainer).toBeNull();

    const sec3 = document.getElementById('section-3-card');
    const sec4 = document.getElementById('section-4-card');

    expect(sec3).not.toBeNull();
    expect(sec4).not.toBeNull();
  });

  it('Scenario 2: Card wrappers reside sequentially after page-level-inspector-container and before upsell banner', () => {
    const execContainer = document.getElementById('executive-view-container');
    expect(execContainer).not.toBeNull();

    const inspector = document.getElementById('page-level-inspector-container');
    expect(inspector).not.toBeNull();

    const sec3 = document.getElementById('section-3-card');
    expect(sec3).not.toBeNull();

    const sec4 = document.getElementById('section-4-card');
    expect(sec4).not.toBeNull();

    const upsellBanner = document.getElementById('aioptimize-action-banner');
    expect(upsellBanner).not.toBeNull();

    // Verify ordering
    expect(inspector.nextElementSibling).toBe(sec3);
    expect(sec3.nextElementSibling).toBe(sec4);
    expect(sec4.nextElementSibling).toBe(upsellBanner);
  });
});
