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

describe('Section 4 Hierarchy Levels BDD Suite', () => {
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

  it('Scenario 1: Section 4 contains exactly 4 level-divider elements', () => {
    const section4 = document.getElementById('exec-section-4');
    expect(section4).not.toBeNull();

    const dividers = section4.querySelectorAll('.level-divider');
    expect(dividers.length).toBe(4);

    expect(dividers[0].textContent).toContain('LEVEL 1');
    expect(dividers[1].textContent).toContain('LEVEL 2');
    expect(dividers[2].textContent).toContain('LEVEL 3');
    expect(dividers[3].textContent).toContain('LEVEL 4');
  });

  it('Scenario 2: Level dividers have the correct headers', () => {
    const section4 = document.getElementById('exec-section-4');
    const dividers = Array.from(section4.querySelectorAll('.level-divider')).map(d => d.textContent.trim());

    expect(dividers[0]).toBe('LEVEL 1: Crawl & Index Directives');
    expect(dividers[1]).toBe('LEVEL 2: AI Welcome Mat & Markdown Maps');
    expect(dividers[2]).toBe('LEVEL 3: Deep System Context & Brand Blueprints');
    expect(dividers[3]).toBe('LEVEL 4: Structured Data Schemas & Machine Feeds');
  });

  it('Scenario 3: File metric rows are positioned correctly under their dividers', () => {
    const section4 = document.getElementById('exec-section-4');
    const container = section4.querySelector('.level-divider').parentElement;
    const children = Array.from(container.children);

    const orderedLabels = children.map(el => {
      if (el.classList.contains('level-divider')) {
        return el.textContent.trim();
      }
      // Get the bold filename text
      const strong = el.querySelector('span[style*="font-weight: 700"]');
      if (strong) return strong.textContent.trim();
      const boldSpan = el.querySelector('span[style*="font-weight:700"]');
      if (boldSpan) return boldSpan.textContent.trim();
      const spanBold = el.querySelector('span');
      if (spanBold && spanBold.style.fontWeight === '700') return spanBold.textContent.trim();
      return '';
    }).filter(text => text !== '');

    expect(orderedLabels[0]).toBe('LEVEL 1: Crawl & Index Directives');
    expect(orderedLabels[1]).toBe('robots.txt');
    expect(orderedLabels[2]).toBe('sitemap.xml');

    expect(orderedLabels[3]).toBe('LEVEL 2: AI Welcome Mat & Markdown Maps');
    expect(orderedLabels[4]).toBe('llms.txt');
    expect(orderedLabels[5]).toBe('llms-full.txt');

    expect(orderedLabels[6]).toBe('LEVEL 3: Deep System Context & Brand Blueprints');
    expect(orderedLabels[7]).toBe('ai-context.md');
    expect(orderedLabels[8]).toBe('ai-plugin.json');

    expect(orderedLabels[9]).toBe('LEVEL 4: Structured Data Schemas & Machine Feeds');
    expect(orderedLabels[10]).toBe('JSON-LD Entity Graph');
    expect(orderedLabels[11]).toBe('Dynamic API & Merchant Feeds');
  });
});
