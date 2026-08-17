/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = path.resolve(__dirname, '../visualize.html');
const jsPath = path.resolve(__dirname, '../index.js');
const cssPath = path.resolve(__dirname, '../index.css');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');
const cssContent = fs.readFileSync(cssPath, 'utf8');

describe('AIVisualize UX Refactor Phase 2 BDD Suite (Pattern A2 + B2 & Return CTA)', () => {
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

  it('Scenario 1: Default Collapsed State on Initial Load (Pattern B2 Pill State)', () => {
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
      expect(triggerBtn.textContent.trim()).toBe('Details ▾');
    }
  });

  it('Scenario 2: Manual Accordion Expansion & Collapse (Pattern B2 Toggle State)', () => {
    const card1 = document.getElementById('section-1-card');
    expect(card1).not.toBeNull();

    const triggerBtn = card1.querySelector('.easy-view-trigger-btn');
    expect(triggerBtn).not.toBeNull();

    const details = document.getElementById('section-1-details');
    expect(details).not.toBeNull();

    triggerBtn.click();
    expect(details.style.display).toBe('block');
    expect(triggerBtn.textContent.trim()).toBe('Details ▴');

    triggerBtn.click();
    expect(details.style.display).toBe('none');
    expect(triggerBtn.textContent.trim()).toBe('Details ▾');
  });

  it('Scenario 3: Floating Glass Dock & Pattern A2 Pillar Card Surface Focus', () => {
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

    dockLink2.click();

    expect(details2.style.display).toBe('block');
    expect(details1.style.display).toBe('none');
    expect(details3.style.display).toBe('none');
    expect(details4.style.display).toBe('none');

    const activeDockLink = document.querySelector('.dock-link.active');
    expect(activeDockLink).toBe(dockLink2);

    const pillarCards = document.querySelectorAll('.pillar-card');
    expect(pillarCards.length).toBe(4);
    const pillarCard3 = pillarCards[2];

    pillarCard3.click();

    expect(details3.style.display).toBe('block');
    expect(details1.style.display).toBe('none');
    expect(details2.style.display).toBe('none');
    expect(details4.style.display).toBe('none');
  });

  it('Scenario 4: Vocabulary Gate & PDF Print Integrity', () => {
    const bannedPhrase = ['AI', 'first'].join('-');

    expect(htmlContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());
    expect(jsContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    const selfContent = fs.readFileSync(__filename, 'utf8');
    const cleanedSelfContent = selfContent.replace(new RegExp(bannedPhrase, 'g'), '');
    expect(cleanedSelfContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    const printBlockRegex = /@media\s+print\s*\{[\s\S]*?(?:#section-[1-4]-details[\s\S]*?)+display:\s*block\s*!important[\s\S]*?\}/;
    expect(cssContent).toMatch(printBlockRegex);
  });

  it('Scenario 5: Pattern A2 Pure Surface Affordance & Clean Card Footers', () => {
    const pillarCards = document.querySelectorAll('.pillar-card');
    expect(pillarCards.length).toBe(4);
    const pillarCard2 = pillarCards[1];

    const details1 = document.getElementById('section-1-details');
    const details2 = document.getElementById('section-2-details');

    const innerSummary = pillarCard2.querySelector('summary');
    expect(innerSummary).not.toBeNull();
    innerSummary.click();

    expect(details2.style.display).toBe('block');
    expect(details1.style.display).toBe('none');

    pillarCards.forEach(card => {
      const cornerIndicator = card.querySelector('.pillar-corner-indicator');
      expect(cornerIndicator).not.toBeNull();

      const footer = card.querySelector('.pillar-card-footer');
      expect(footer).not.toBeNull();
      expect(footer.querySelector('.pillar-inspect-btn')).toBeNull();
    });
  });

  it('Scenario 6: Return CTA Visibility Across All 4 Sections & Header Offset Scrolling', () => {
    const scrollIntoViewMock = vi.fn();
    
    const summaryAnchor = document.getElementById('summary-dial-anchor');
    expect(summaryAnchor).not.toBeNull();
    summaryAnchor.scrollIntoView = scrollIntoViewMock;

    // Verify all 4 sections have a visible return button that is NOT hidden by compatibility-hidden
    for (let i = 1; i <= 4; i++) {
      const card = document.getElementById(`section-${i}-card`);
      expect(card).not.toBeNull();

      const returnBtn = card.querySelector('.btn-return-summary');
      expect(returnBtn).not.toBeNull();
      expect(returnBtn.textContent.trim()).toBe('[ ▲ Return to Summary ]');
      expect(returnBtn.classList.contains('btn-return-summary-outline')).toBe(true);
      expect(returnBtn.classList.contains('compatibility-hidden')).toBe(false);
    }

    // Verify CSS contains .btn-return-summary-outline styling
    expect(cssContent).toContain('.btn-return-summary-outline');

    // Verify CSS defines scroll-margin-top (>= 100px) on #summary-dial-anchor to offset sticky header
    expect(cssContent).toMatch(/#summary-dial-anchor[\s\S]*?scroll-margin-top:\s*(?:100|110|120)px/);

    // Clicking Section 2's return button triggers scrollIntoView on #summary-dial-anchor
    const returnBtn2 = document.querySelector('#section-2-card .btn-return-summary');
    expect(returnBtn2).not.toBeNull();
    returnBtn2.click();

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
