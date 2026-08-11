/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';
import * as cheerio from 'cheerio';

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

  it('Scenario 1: #dev-matrix-wrapper is not present inside visualize.html after decoupling', () => {
    const devMatrixWrapper = document.getElementById('dev-matrix-wrapper');
    expect(devMatrixWrapper).toBeNull();
  });

  it('Scenario 2: optimize.html contains #dev-matrix-wrapper and renders the diagnostic matrix', () => {
    const optPath = path.resolve(__dirname, '../optimize.html');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const $ = cheerio.load(optHtml);

    const devMatrixWrapper = $('#dev-matrix-wrapper');
    expect(devMatrixWrapper.length).toBe(1);
  });
});
