/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = path.resolve(__dirname, '../visualize.html');
const jsPath = path.resolve(__dirname, '../index.js');
const cssPath = path.resolve(__dirname, '../index.css');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

describe('Section 3 & 4 Updates BDD Suite', () => {
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

  it('Scenario 1: CSS has 1:2 split layout for exec-row-split on desktop', () => {
    // Assert CSS contains the 1fr 2fr template columns rule for .exec-row-split
    expect(cssContent).toContain('grid-template-columns: 1fr 2fr');
  });

  it('Scenario 2: Upsell banner has been relocated to the bottom of Section 3', () => {
    const section3 = document.getElementById('exec-section-3');
    expect(section3).not.toBeNull();

    const banner = section3.querySelector('#aioptimize-upsell-banner');
    expect(banner).not.toBeNull();

    // Verify it is positioned at the bottom of the section container (last child or after the card)
    const lastChild = section3.lastElementChild;
    expect(lastChild).toBe(banner);
  });

  it('Scenario 3: Section 4 subtitle copy has been updated correctly', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    const subtitle = section4.querySelector('p');
    expect(subtitle).not.toBeNull();
    expect(subtitle.textContent).toContain('Want to offer AI your content in a form thats easy for it to ingest, utilize and cite? Maintain these machine manifest files');
    expect(subtitle.textContent).not.toContain('DIY sample triggers');
  });

  it('Scenario 4: View DIY Sample links inside Section 4 are hidden via CSS rule', () => {
    // Assert CSS contains the rule to hide DIY sample links inside #exec-section-4
    const cssCleaned = cssContent.replace(/\s+/g, ' ');
    expect(cssCleaned).toContain('#exec-section-4 .diy-sample-link { display: none !important; }');
  });
});
