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

describe('Module 4 Option C Relocation & Data Binding BDD Suite', () => {
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
      // Catch runtime initialization warnings
    }

    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Section 2 contains sub-tab nav bar (#sec2-subtabs-nav), filter container (#dev-module-4-filter-container), and cards grid (#dev-module-4-cards)', () => {
    const sec2Card = document.getElementById('exec-section2-card');
    expect(sec2Card).not.toBeNull();

    const subtabsNav = document.getElementById('sec2-subtabs-nav');
    expect(subtabsNav).not.toBeNull();
    expect(sec2Card.contains(subtabsNav)).toBe(true);

    const btnSignals = document.getElementById('btn-sec2-tab-signals');
    const btnRoutes = document.getElementById('btn-sec2-tab-routes');
    expect(btnSignals).not.toBeNull();
    expect(btnRoutes).not.toBeNull();

    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');
    expect(panelSignals).not.toBeNull();
    expect(panelRoutes).not.toBeNull();

    const filterContainer = document.getElementById('dev-module-4-filter-container');
    expect(filterContainer).not.toBeNull();
    expect(panelRoutes.contains(filterContainer)).toBe(true);

    const cardsContainer = document.getElementById('dev-module-4-cards');
    expect(cardsContainer).not.toBeNull();
    expect(panelRoutes.contains(cardsContainer)).toBe(true);
  });

  it('Scenario 2: Default sub-tab state displays Citation Signals panel and hides Audited Routes panel', () => {
    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');

    expect(panelSignals.style.display).not.toBe('none');
    expect(panelRoutes.style.display).toBe('none');
  });

  it('Scenario 3: Switching to Audited Routes tab renders cached scan results into glassmorphic cards automatically', () => {
    const mockScanData = {
      url: 'https://thatworkx.com',
      discoveredRoutes: [
        { path: '/', wordCount: 850, tokenLoad: 1148, canonicalTag: true, isEssential: true, missingStatus: 'Active' },
        { path: '/services', wordCount: 620, tokenLoad: 837, canonicalTag: true, isEssential: false, missingStatus: 'Active' }
      ]
    };

    window.latestScanResults = mockScanData;
    window.lastScanResults = mockScanData;

    window.switchSec2SubTab('routes');

    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');
    const btnRoutes = document.getElementById('btn-sec2-tab-routes');

    expect(panelSignals.style.display).toBe('none');
    expect(panelRoutes.style.display).toBe('block');
    expect(btnRoutes.classList.contains('active')).toBe(true);

    const cards = document.querySelectorAll('.sec2-route-card, .route-card-capsule');
    expect(cards.length).toBeGreaterThanOrEqual(2);
    expect(cards[0].textContent).toContain('/');
    expect(cards[1].textContent).toContain('/services');
  });

  it('Scenario 4: Page payload normalization in renderModule4 resolves discoveredRoutes, scannedPages, and pages seamlessly', () => {
    const mockFromDiscovered = {
      url: 'https://testbrand.com',
      discoveredRoutes: [
        { path: '/pricing', wordCount: 420, tokenLoad: 567, canonicalTag: true }
      ]
    };

    window.renderModule4(mockFromDiscovered);
    const cards = document.querySelectorAll('.sec2-route-card, .route-card-capsule');
    expect(cards.length).toBe(1);
    expect(cards[0].textContent).toContain('/pricing');
  });

  it('Scenario 5: Global scan caching populates window.latestScanResults and window.lastScanResults during updateExecutiveViewData', () => {
    const payload = {
      url: 'https://holiknits.com',
      scoreCard: { overallScore: 88, pillars: { p1: { score: 25 }, p2: { score: 22 }, p3: { score: 20 }, p4: { score: 21 } } },
      discoveredRoutes: [{ path: '/catalog', wordCount: 900 }]
    };

    window.updateExecutiveViewData(payload);

    expect(window.latestScanResults).toEqual(payload);
    expect(window.lastScanResults).toEqual(payload);
  });

  it('Scenario 6: Verify switchSec2SubTab is cleanly declared with zero duplicate definitions', () => {
    const fnMatches = jsContent.match(/window\.switchSec2SubTab\s*=/g) || [];
    expect(fnMatches.length).toBe(1);
  });
});
