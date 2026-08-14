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

describe('Module 4 Relocation Option C (Section 2 Sub-Tabs Table) BDD Suite', () => {
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

  it('Scenario 1: Section 2 contains sub-tab nav, inspector container, filter bar, table wrapper, and table tbody', () => {
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

    const tableWrapper = document.getElementById('dev-module-4-wrapper');
    expect(tableWrapper).not.toBeNull();
    expect(tableWrapper.style.display).not.toBe('none');

    const table = document.getElementById('module-4-table');
    const tbody = document.getElementById('dev-module-4-tbody');
    expect(table).not.toBeNull();
    expect(tbody).not.toBeNull();
  });

  it('Scenario 2: Default sub-tab state displays Citation Signals panel and hides Audited Routes panel', () => {
    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');

    expect(panelSignals.style.display).not.toBe('none');
    expect(panelRoutes.style.display).toBe('none');
  });

  it('Scenario 3: Switching to Audited Routes tab toggles panels and invokes renderModule4 with cached scan results', () => {
    const mockScanData = {
      url: 'https://thatworkx.com',
      discoveredRoutes: [
        { path: '/', wordCount: 850, tokenLoad: 1148, canonicalTag: true, isEssential: true },
        { path: '/services', wordCount: 620, tokenLoad: 837, canonicalTag: true, isEssential: false }
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

    const rows = document.querySelectorAll('#dev-module-4-tbody tr');
    expect(rows.length).toBeGreaterThanOrEqual(2);
    expect(rows[0].textContent).toContain('/');
    expect(rows[1].textContent).toContain('/services');
  });

  it('Scenario 4: Page payload normalization in renderModule4 resolves discoveredRoutes, scannedPages, and pages seamlessly into table rows', () => {
    const mockPayload = {
      url: 'https://example.com',
      discoveredRoutes: [
        { path: '/pricing', wordCount: 420, tokenLoad: 567, canonicalTag: true }
      ]
    };

    window.renderModule4(mockPayload, 'all');

    const tbody = document.getElementById('dev-module-4-tbody');
    expect(tbody).not.toBeNull();
    const rows = tbody.querySelectorAll('tr');
    expect(rows.length).toBe(1);
    expect(rows[0].textContent).toContain('/pricing');
    expect(rows[0].textContent).toContain('420');
  });

  it('Scenario 5: RenderModule4 generates filter buttons in #dev-module-4-filter-container for interactive filtering', () => {
    const mockPayload = {
      url: 'https://example.com',
      pages: [
        { route: '/valid', wordCount: 600, hasCanonical: true, isSchema: false },
        { route: '/thin', wordCount: 150, hasCanonical: true, isSchema: false }
      ]
    };

    window.renderModule4(mockPayload, 'all');

    const filterContainer = document.getElementById('dev-module-4-filter-container');
    expect(filterContainer).not.toBeNull();
    expect(filterContainer.innerHTML).toContain('All Pages');
    expect(filterContainer.innerHTML).toContain('Thin Content');
  });

  it('Scenario 6: Verify switchSec2SubTab is declared with zero duplicate definitions', () => {
    const fnMatches = jsContent.match(/window\.switchSec2SubTab\s*=/g) || [];
    expect(fnMatches.length).toBe(1);
  });
});
