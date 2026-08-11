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

describe('Compact Exec Welcome Banner and Onboarding Modal BDD Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/visualize.html'
    });
    window = dom.window;
    document = window.document;

    window.API_BASE = 'http://localhost:5000';

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore initial load evaluation errors
    }

    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Verify #exec-welcome-banner in visualize.html is structured as a compact strip containing "AI-Optimized" and "AI-Ready" terminology labels and action triggers (#btn-open-tour-modal)', () => {
    const banner = document.getElementById('exec-welcome-banner');
    expect(banner).not.toBeNull();

    // Check terminology labels inside the banner
    const text = banner.textContent;
    expect(text).toContain('AI-Optimized');
    expect(text).toContain('AI-Ready');

    // Check open tour button
    const openBtn = document.getElementById('btn-open-tour-modal');
    expect(openBtn).not.toBeNull();
    expect(banner.contains(openBtn)).toBe(true);
  });

  it('Scenario 2: Verify visualize.html contains the Educational Onboarding Modal container (#exec-onboarding-modal) with modal close controls (#btn-close-tour-modal)', () => {
    const modal = document.getElementById('exec-onboarding-modal');
    expect(modal).not.toBeNull();

    const closeBtn = document.getElementById('btn-close-tour-modal');
    expect(closeBtn).not.toBeNull();
    expect(modal.contains(closeBtn)).toBe(true);
  });

  it('Scenario 3: Verify index.js attaches click event listeners to open and close #exec-onboarding-modal', () => {
    const modal = document.getElementById('exec-onboarding-modal');
    const openBtn = document.getElementById('btn-open-tour-modal');
    const closeBtn = document.getElementById('btn-close-tour-modal');

    expect(modal).not.toBeNull();
    expect(openBtn).not.toBeNull();
    expect(closeBtn).not.toBeNull();

    // Initial state: modal should be hidden (display: none)
    expect(modal.style.display).toBe('none');

    // Click open button
    openBtn.click();
    expect(modal.style.display).toBe('block');

    // Click close button
    closeBtn.click();
    expect(modal.style.display).toBe('none');
  });

  it('Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase "AI-first" across index.css, visualize.html, and index.js', () => {
    expect(cssContent.toLowerCase()).not.toContain('ai-first');
    expect(htmlContent.toLowerCase()).not.toContain('ai-first');
    expect(jsContent.toLowerCase()).not.toContain('ai-first');
  });
});
