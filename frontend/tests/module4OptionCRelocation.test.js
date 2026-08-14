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

describe('Module 4 Relocation Option C (Section 2 Sub-Tabs) BDD Suite', () => {
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
      // Ignore initial JSDOM evaluation warnings
    }

    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Assert Section 2 contains sub-tab navigation bar (#sec2-subtabs-nav) and both sub-panel containers', () => {
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

    const inspectorContainer = document.getElementById('page-level-inspector-container');
    expect(inspectorContainer).not.toBeNull();
    expect(panelRoutes.contains(inspectorContainer)).toBe(true);
  });

  it('Scenario 2: Assert default sub-tab state displays Citation Signals panel and hides Audited Routes panel', () => {
    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');

    expect(panelSignals.style.display).not.toBe('none');
    expect(panelRoutes.style.display).toBe('none');
  });

  it('Scenario 3: Assert clicking Audited Route Directory sub-tab toggles panel visibility correctly', () => {
    const btnRoutes = document.getElementById('btn-sec2-tab-routes');
    const btnSignals = document.getElementById('btn-sec2-tab-signals');
    const panelSignals = document.getElementById('sec2-tab-signals-panel');
    const panelRoutes = document.getElementById('sec2-tab-routes-panel');

    if (typeof window.switchSec2SubTab === 'function') {
      window.switchSec2SubTab('routes');
    } else {
      btnRoutes.click();
    }

    expect(panelSignals.style.display).toBe('none');
    expect(panelRoutes.style.display).toBe('block');
    expect(btnRoutes.classList.contains('active')).toBe(true);
    expect(btnSignals.classList.contains('active')).toBe(false);
  });

  it('Scenario 4: Assert rendering Module 4 generates glassmorphic route cards with neon cyan routes and inspect CTAs', () => {
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/about',
          wordCount: 450,
          status: 200,
          hasCanonical: true,
          isSchema: true,
          html: '<html><body><h1>About Us</h1></body></html>'
        }
      ]
    };

    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    const routeCard = document.querySelector('.sec2-route-card, .route-card-capsule');
    expect(routeCard).not.toBeNull();

    const routePath = routeCard.querySelector('.route-path-text, code');
    expect(routePath).not.toBeNull();
    expect(routePath.textContent).toContain('/about');

    const inspectBtn = routeCard.querySelector('.btn-inspect-text, [onclick*="viewPageMarkdown"]');
    expect(inspectBtn).not.toBeNull();
  });
});
