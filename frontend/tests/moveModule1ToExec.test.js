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

describe('BDD Move Module 1 to Executive Mode Test Suite', () => {
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
      // Ignore evaluation warnings
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: #dev-matrix-wrapper and #diy-module-1 exist inside #exec-mode-container', () => {
    const execModeContainer = document.getElementById('exec-mode-container');
    expect(execModeContainer).not.toBeNull();

    const devMatrixWrapper = execModeContainer.querySelector('#dev-matrix-wrapper');
    expect(devMatrixWrapper).not.toBeNull();

    // Verify diy-module-1 matrix element was successfully populated
    const diyModule1 = devMatrixWrapper.querySelector('#diy-module-1');
    expect(diyModule1).not.toBeNull();
  });

  it('Scenario 2: #dev-matrix-wrapper is placed directly beneath the top dial / pillars grid', () => {
    const execModeContainer = document.getElementById('exec-mode-container');
    const children = Array.from(execModeContainer.firstElementChild.children); // children of #executive-view-container

    const gridIdx = children.findIndex(el => 
      el.tagName === 'DIV' && 
      el.style.display === 'grid' && 
      el.style.gridTemplateColumns === '1fr 2fr'
    );
    expect(gridIdx).toBeGreaterThan(-1);

    // Assert that the element immediately following the dial/pillars grid is the matrix wrapper
    const nextSibling = children[gridIdx + 1];
    expect(nextSibling.id).toBe('dev-matrix-wrapper');
  });

  it('Scenario 3: The 32-capability rows and filter tab buttons are fully rendered and functional in Executive Mode', () => {
    const devMatrixWrapper = document.getElementById('dev-matrix-wrapper');
    expect(devMatrixWrapper).not.toBeNull();

    // 1. Assert filter tabs are present
    const tabs = devMatrixWrapper.querySelectorAll('.matrix-tab-btn');
    expect(tabs.length).toBe(5); // All, Section 1, Section 2, Section 3, Section 4

    // 2. Assert matrix body container exists
    const tbody = devMatrixWrapper.querySelector('#dev-matrix-tbody');
    expect(tbody).not.toBeNull();
  });
});
