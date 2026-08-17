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

describe('AIVisualize UX Refactor Phase 2 BDD Suite (Pattern A2 + B2)', () => {
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

    // Pattern B2: Each section card renders a visible "Easy View" header with "Details ▾" pill
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

    // Click to expand details -> Details ▴
    triggerBtn.click();
    expect(details.style.display).toBe('block');
    expect(triggerBtn.textContent.trim()).toBe('Details ▴');

    // Click again to collapse details -> Details ▾
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

    // Pattern A2: Clicking anywhere on Pillar Card 3 expands #section-3-details
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

    // Pattern A2 assertions: Corner affordance indicator exists and footer inspect button is removed
    pillarCards.forEach(card => {
      const cornerIndicator = card.querySelector('.pillar-corner-indicator');
      expect(cornerIndicator).not.toBeNull();

      const footer = card.querySelector('.pillar-card-footer');
      expect(footer).not.toBeNull();
      expect(footer.querySelector('.pillar-inspect-btn')).toBeNull();
    });
  });

  it('Scenario 6: Return CTA Text & Outline Styling', () => {
    const scrollIntoViewMock = vi.fn();
    
    const summaryGrid = document.querySelector('#visualize-summary-grid') || document.getElementById('pillar-summary-wrapper');
    expect(summaryGrid).not.toBeNull();
    summaryGrid.scrollIntoView = scrollIntoViewMock;

    for (let i = 1; i <= 4; i++) {
      const detailsContainer = document.getElementById(`section-${i}-details`);
      expect(detailsContainer).not.toBeNull();

      const returnBtn = detailsContainer.querySelector('.btn-return-summary');
      expect(returnBtn).not.toBeNull();
      expect(returnBtn.textContent.trim()).toBe('[ ▲ Return to Summary ]');
      expect(returnBtn.classList.contains('btn-return-summary-outline')).toBe(true);
    }

    expect(cssContent).toContain('.btn-return-summary-outline');

    const returnBtn2 = document.querySelector('#section-2-details .btn-return-summary');
    returnBtn2.click();

    expect(scrollIntoViewMock).toHaveBeenCalled();
  });
});
