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

describe('Section 3 Polish BDD Suite', () => {
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

  it('Scenario 1: Section 3 container exists directly following page-level-inspector-container', () => {
    const inspectorContainer = document.getElementById('page-level-inspector-container');
    expect(inspectorContainer).not.toBeNull();

    const section3Container = document.getElementById('exec-section-3');
    expect(section3Container).not.toBeNull();

    // Verify Section 3 is a sibling directly following page-level inspector
    expect(inspectorContainer.nextElementSibling).toBe(section3Container);
  });

  it('Scenario 2: Section 3 contains the required E-E-A-T trust diagnostic badges', () => {
    const section3 = document.getElementById('exec-section-3');
    expect(section3).not.toBeNull();

    // Assert presence of Contact details badge
    const contactBadge = section3.querySelector('#sec3-contact-status');
    expect(contactBadge).not.toBeNull();

    // Assert presence of Organization schema badge
    const orgSchemaBadge = section3.querySelector('#sec3-org-schema-status');
    expect(orgSchemaBadge).not.toBeNull();

    // Assert presence of Trust policy links badge
    const privacyBadge = section3.querySelector('#sec3-privacy-status');
    expect(privacyBadge).not.toBeNull();
  });

  it('Scenario 3: E-E-A-T trust diagnostic badges are populated correctly when data is rendered', () => {
    const mockResults = {
      url: 'https://example.com',
      status: {
        jsonLdExists: true,
        jsonLdTypes: ['Organization', 'WebSite']
      },
      eeatMetrics: {
        isSecure: true,
        hasContactInfo: true,
        hasPrivacyPolicy: true,
        ageEstimate: '5 years',
        authorityStatus: 'Optimized Anchor',
        diagnosticSummary: 'Domain exhibits strong E-E-A-T trust signals.'
      }
    };

    if (typeof window.updateExecutiveViewData === 'function') {
      window.updateExecutiveViewData(mockResults);
    }

    const contactBadge = document.getElementById('sec3-contact-status');
    const orgSchemaBadge = document.getElementById('sec3-org-schema-status');
    const privacyBadge = document.getElementById('sec3-privacy-status');

    // After mock render runs, badges should be updated
    expect(contactBadge.textContent).toContain('Passed');
    expect(orgSchemaBadge.textContent).toContain('Passed');
    expect(privacyBadge.textContent).toContain('Passed');
  });
});
