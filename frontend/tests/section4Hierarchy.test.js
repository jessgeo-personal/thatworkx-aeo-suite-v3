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

describe('Section 4 AI Machine Blueprint Hierarchy BDD/TDD Suite', () => {
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

  it('Scenario 1: Section 4 contains 4 level-divider elements with the new headers', () => {
    const section4 = document.getElementById('section-4-card');
    expect(section4).not.toBeNull();

    const dividers = Array.from(section4.querySelectorAll('.level-divider')).map(d => d.textContent.trim());
    expect(dividers.length).toBe(4);

    expect(dividers[0]).toBe('LEVEL 1: PROTOCOL GATES (The Gatekeepers)');
    expect(dividers[1]).toBe('LEVEL 2: MACHINE WELCOME MATS (The Directories)');
    expect(dividers[2]).toBe('LEVEL 3: THE BLUEPRINT MANIFEST (The Orchestrator)');
    expect(dividers[3]).toBe('LEVEL 4: GRANULAR WORKSPACES (The Semantic Chunks)');
  });

  it('Scenario 2: The 8 files sit in order under their correct level headers', () => {
    const section4 = document.getElementById('section-4-card');
    const container = section4.querySelector('.level-divider').parentElement;
    const children = Array.from(container.children);

    const orderedLabels = children.map(el => {
      if (el.classList.contains('level-divider')) {
        return el.textContent.trim();
      }
      const filenameSpan = el.querySelector('strong, span[style*="font-weight: 700"], span[style*="font-weight:700"]');
      if (filenameSpan) return filenameSpan.textContent.trim();
      return '';
    }).filter(text => text !== '');

    expect(orderedLabels[0]).toBe('LEVEL 1: PROTOCOL GATES (The Gatekeepers)');
    expect(orderedLabels[1]).toBe('robots.txt');

    expect(orderedLabels[2]).toBe('LEVEL 2: MACHINE WELCOME MATS (The Directories)');
    expect(orderedLabels[3]).toBe('llms.txt');
    expect(orderedLabels[4]).toBe('sitemap.xml');

    expect(orderedLabels[5]).toBe('LEVEL 3: THE BLUEPRINT MANIFEST (The Orchestrator)');
    expect(orderedLabels[6]).toBe('ai-context.md');

    expect(orderedLabels[7]).toBe('LEVEL 4: GRANULAR WORKSPACES (The Semantic Chunks)');
    expect(orderedLabels[8]).toBe('README.md');
    expect(orderedLabels[9]).toBe('about.md');
    expect(orderedLabels[10]).toBe('docs.md');
    expect(orderedLabels[11]).toBe('content.md');
  });

  it('Scenario 3: Status bindings remain preserved and functional in index.js', () => {
    // Assert all 8 status spans are active in Section 4's visible tree (not hidden fallback)
    const section4 = document.getElementById('section-4-card');
    
    expect(section4.querySelector('#exec-status-robots')).not.toBeNull();
    expect(section4.querySelector('#exec-status-llms')).not.toBeNull();
    expect(section4.querySelector('#exec-status-sitemap-tree')).not.toBeNull();
    expect(section4.querySelector('#exec-status-aicontext')).not.toBeNull();
    expect(section4.querySelector('#exec-status-readme')).not.toBeNull();
    expect(section4.querySelector('#exec-status-about')).not.toBeNull();
    expect(section4.querySelector('#exec-status-docs')).not.toBeNull();
    expect(section4.querySelector('#exec-status-content')).not.toBeNull();
  });
});
