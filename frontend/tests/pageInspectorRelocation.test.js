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

describe('Page-Level Inspector Relocation BDD Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Load visualize.html into JSDOM with visualize.html URL to trigger page detection
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
      // Ignore evaluation warnings or missing dependencies in JSDOM environment
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Assert Page-Level Inspector container exists inside #executive-view-container directly after #citation-readiness-card', () => {
    const execContainer = document.getElementById('executive-view-container');
    expect(execContainer).not.toBeNull();

    const citationCard = document.getElementById('citation-readiness-card');
    expect(citationCard).not.toBeNull();

    const inspectorContainer = document.getElementById('page-level-inspector-container');
    expect(inspectorContainer).not.toBeNull();

    const module4Table = document.getElementById('module-4-table');
    expect(module4Table).not.toBeNull();

    // Assert inspector container exists inside #executive-view-container
    expect(execContainer.contains(inspectorContainer)).toBe(true);
    expect(inspectorContainer.contains(module4Table)).toBe(true);

    // Assert inspector container is positioned directly after #citation-readiness-card
    const children = Array.from(execContainer.children);
    const citationIndex = children.indexOf(citationCard);
    const inspectorIndex = children.indexOf(inspectorContainer);

    expect(citationIndex).toBeGreaterThan(-1);
    expect(inspectorIndex).toBe(citationIndex + 1);
  });

  it('Scenario 2: Assert the container is visible when scan results render', () => {
    const inspectorContainer = document.getElementById('page-level-inspector-container');
    expect(inspectorContainer).not.toBeNull();

    // Verify it is not hidden by default
    expect(inspectorContainer.style.display).not.toBe('none');

    // Simulate scan results payload with at least one scanned page
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/',
          wordCount: 300,
          status: 200,
          html: '<html><body><main><h1>Demo</h1><header></header><footer></footer></main></body></html>'
        }
      ]
    };

    // Render results using the global function evaluated from index.js
    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    // Verify that the table body within the container is populated with elements/rows
    const tbody = document.getElementById('dev-module-4-tbody');
    expect(tbody).not.toBeNull();
    expect(tbody.children.length).toBeGreaterThan(0);

    // The container should remain visible (not hidden via style.display)
    expect(inspectorContainer.style.display).not.toBe('none');
  });
});
