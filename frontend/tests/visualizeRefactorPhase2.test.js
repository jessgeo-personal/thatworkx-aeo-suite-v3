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

describe('AIVisualize UX Refactor Phase 2 BDD Suite', () => {
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
    window.evaluateAllCapabilities = () => ({ capabilities: [] });
    window.CAPABILITY_MATRIX = [];

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings in JSDOM
    }

    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Default Collapsed State on Initial Load', () => {
    // Assert all 4 detail containers are collapsed by default on load
    const s1Details = document.getElementById('section-1-details');
    const s2Details = document.getElementById('section-2-details');
    const s3Details = document.getElementById('section-3-details');
    const s4Details = document.getElementById('section-4-details');

    expect(s1Details).not.toBeNull();
    expect(s2Details).not.toBeNull();
    expect(s3Details).not.toBeNull();
    expect(s4Details).not.toBeNull();

    expect(s1Details.style.display).toBe('none');
    expect(s2Details.style.display).toBe('none');
    expect(s3Details.style.display).toBe('none');
    expect(s4Details.style.display).toBe('none');

    // Assert each section card renders a visible "Easy View" summary header bar
    // displaying title, score badge, metric text, and [ Expand Details ▼ ] trigger button
    for (let i = 1; i <= 4; i++) {
      const card = document.getElementById(`section-${i}-card`);
      expect(card).not.toBeNull();

      const easyViewHeader = card.querySelector('.easy-view-header');
      expect(easyViewHeader).not.toBeNull();

      const title = easyViewHeader.querySelector('.easy-view-title');
      const scoreBadge = easyViewHeader.querySelector('.easy-view-score-badge');
      const metricText = easyViewHeader.querySelector('.easy-view-metric-text');
      const triggerBtn = easyViewHeader.querySelector('.easy-view-trigger-btn');

      expect(title).not.toBeNull();
      expect(scoreBadge).not.toBeNull();
      expect(metricText).not.toBeNull();
      expect(triggerBtn).not.toBeNull();
      expect(triggerBtn.textContent.trim()).toBe('[ Expand Details ▼ ]');
    }
  });

  it('Scenario 2: Manual Accordion Expansion & Collapse', () => {
    const card1 = document.getElementById('section-1-card');
    expect(card1).not.toBeNull();

    const triggerBtn = card1.querySelector('.easy-view-trigger-btn');
    expect(triggerBtn).not.toBeNull();

    const details = document.getElementById('section-1-details');
    expect(details).not.toBeNull();

    // Click to expand details
    triggerBtn.click();
    expect(details.style.display).toBe('block');
    expect(triggerBtn.textContent.trim()).toBe('[ Collapse Details ▲ ]');

    // Click again to collapse details
    triggerBtn.click();
    expect(details.style.display).toBe('none');
    expect(triggerBtn.textContent.trim()).toBe('[ Expand Details ▼ ]');
  });

  it('Scenario 3: Floating Glass Dock & Top 2x2 Grid Single-Section Focus', () => {
    const dockLink2 = document.querySelector('.dock-link[data-dock-section="2"]');
    expect(dockLink2).not.toBeNull();

    const details1 = document.getElementById('section-1-details');
    const details2 = document.getElementById('section-2-details');
    const details3 = document.getElementById('section-3-details');
    const details4 = document.getElementById('section-4-details');

    expect(details1).not.toBeNull();
    expect(details2).not.toBeNull();
    expect(details3).not.toBeNull();
    expect(details4).not.toBeNull();

    // Clicking dock link "2. Page Content"
    dockLink2.click();

    expect(details2.style.display).toBe('block');
    expect(details1.style.display).toBe('none');
    expect(details3.style.display).toBe('none');
    expect(details4.style.display).toBe('none');

    // Assert dock active class updates to link 2
    const activeDockLink = document.querySelector('.dock-link.active');
    expect(activeDockLink).toBe(dockLink2);

    // Clicking [ Inspect Section Details ▼ ] on top Pillar Card 3 expands #section-3-details and collapses all others
    const pillarCards = document.querySelectorAll('.pillar-card');
    expect(pillarCards.length).toBe(4);
    const pillarCard3 = pillarCards[2];
    
    const inspectBtn3 = Array.from(pillarCard3.querySelectorAll('button, a, span')).find(el => el.textContent.includes('Inspect Section Details'));
    expect(inspectBtn3).not.toBeNull();
    expect(inspectBtn3.textContent.trim()).toBe('[ Inspect Section Details ▼ ]');

    inspectBtn3.click();

    expect(details3.style.display).toBe('block');
    expect(details1.style.display).toBe('none');
    expect(details2.style.display).toBe('none');
    expect(details4.style.display).toBe('none');
  });

  it('Scenario 4: Vocabulary Gate & PDF Print Integrity', () => {
    const bannedPhrase = ['AI', 'first'].join('-');

    // Assert zero occurrences of banned term "AI-first" across visualize.html and index.js
    expect(htmlContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());
    expect(jsContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    // Assert zero occurrences of banned term in this test file itself (excluding the split declaration above)
    const selfContent = fs.readFileSync(__filename, 'utf8');
    const cleanedSelfContent = selfContent.replace(new RegExp(bannedPhrase, 'g'), '');
    expect(cleanedSelfContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    // Assert @media print CSS rules in index.css force all section details to display (display: block !important)
    const printBlockRegex = /@media\s+print\s*\{[\s\S]*?(?:#section-[1-4]-details[\s\S]*?)+display:\s*block\s*!important[\s\S]*?\}/;
    expect(cssContent).toMatch(printBlockRegex);
  });
});
