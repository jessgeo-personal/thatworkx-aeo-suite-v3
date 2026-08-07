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

describe('Section 4 Polish BDD Suite', () => {
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

  it('Scenario 1: Section 4 container exists directly following Section 3', () => {
    const section3 = document.getElementById('exec-section-3');
    expect(section3).not.toBeNull();

    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    // Verify Section 4 is a sibling directly following Section 3
    expect(section3.nextElementSibling).toBe(section4);
  });

  it('Scenario 2: Section 4 contains the required machine manifest diagnostic indicators', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    // Assert presence of robots.txt indicator element
    const robotsEl = section4.querySelector('#exec-status-robots');
    expect(robotsEl).not.toBeNull();

    // Assert presence of llms.txt indicator element
    const llmsEl = section4.querySelector('#exec-status-llms');
    expect(llmsEl).not.toBeNull();

    // Assert presence of sitemap.xml indicator element
    const sitemapEl = section4.querySelector('#exec-status-sitemap-tree');
    expect(sitemapEl).not.toBeNull();

    // Assert presence of ai-context.md indicator element
    const aiContextEl = section4.querySelector('#exec-status-aicontext');
    expect(aiContextEl).not.toBeNull();
  });

  it('Scenario 3: Metric rows align diagnostic badges cleanly to the right', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    const robotsEl = section4.querySelector('#exec-status-robots');
    expect(robotsEl).not.toBeNull();

    const parentRow = robotsEl.parentElement;
    expect(parentRow).not.toBeNull();

    // Check style attributes to verify badges are aligned right using space-between flexbox
    const styleAttr = parentRow.getAttribute('style') || '';
    expect(styleAttr).toContain('display: flex');
    expect(styleAttr).toContain('justify-content: space-between');
  });

  it('Scenario 4: Machine manifest badges are populated correctly when data is rendered', () => {
    const mockResults = {
      url: 'https://example.com',
      status: {
        robotsTxtExists: true,
        llmsTxtExists: true,
        sitemapExists: true,
        aiContextExists: true,
        readmeFound: true,
        aboutTxtExists: true,
        docsTxtExists: true,
        contentTxtExists: true
      }
    };

    if (typeof window.updateExecutiveViewData === 'function') {
      window.updateExecutiveViewData(mockResults);
    }

    const robotsEl = document.getElementById('exec-status-robots');
    const llmsEl = document.getElementById('exec-status-llms');
    const sitemapEl = document.getElementById('exec-status-sitemap-tree');
    const aiContextEl = document.getElementById('exec-status-aicontext');

    expect(robotsEl.innerHTML).toContain('Available');
    expect(llmsEl.innerHTML).toContain('Available');
    expect(sitemapEl.innerHTML).toContain('Available');
    expect(aiContextEl.innerHTML).toContain('Available');
  });
});
