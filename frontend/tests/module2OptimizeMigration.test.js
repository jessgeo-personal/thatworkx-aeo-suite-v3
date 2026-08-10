/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const htmlPath = path.resolve(__dirname, '../optimize.html');
const jsPath = path.resolve(__dirname, '../index.js');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');
const jsContent = fs.readFileSync(jsPath, 'utf8');

describe('Module 2 Optimize Migration BDD Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Load optimize.html into JSDOM
    dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/optimize.html'
    });
    window = dom.window;
    document = window.document;

    // Define standard globals needed by index.js
    window.API_BASE = 'http://localhost:5000';
    
    // Evaluate index.js inside the window context
    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings or missing dependencies in JSDOM environment
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: Assert Module 2 container wrapper exists inside the JSON-LD tool view in optimize.html', () => {
    const wrapper = document.getElementById('dev-schema-builder-wrapper');
    expect(wrapper).not.toBeNull();

    const optToolJsonLd = document.getElementById('opt-tool-jsonld');
    expect(optToolJsonLd).not.toBeNull();
    expect(optToolJsonLd.contains(wrapper)).toBe(true);
  });

  it('Scenario 2: Assert Schema Builder renders and input fields and code display blocks are present', () => {
    const diyModule = document.getElementById('diy-module-2');
    expect(diyModule).not.toBeNull();

    // Check individual inputs
    const orgCheck = document.getElementById('schema-entity-Organization');
    const localCheck = document.getElementById('schema-entity-LocalBusiness');
    const faqCheck = document.getElementById('schema-entity-FAQPage');
    const websiteCheck = document.getElementById('schema-entity-WebSite');
    const serviceCheck = document.getElementById('schema-entity-Service');

    expect(orgCheck).not.toBeNull();
    expect(localCheck).not.toBeNull();
    expect(faqCheck).not.toBeNull();
    expect(websiteCheck).not.toBeNull();
    expect(serviceCheck).not.toBeNull();

    // Check code display block
    const codeBlock = document.getElementById('schema-code-block');
    expect(codeBlock).not.toBeNull();
    expect(codeBlock.textContent).toContain('<script type="application/ld+json">');
  });

  it('Scenario 3: Changing target domain updates currentScannedDomain and updates schema code block', () => {
    const domainInput = document.getElementById('optimize-target-domain');
    expect(domainInput).not.toBeNull();

    // Simulate user typing a new domain and triggering change event
    domainInput.value = 'mytestdomain.com';
    
    // Trigger the change handler
    if (typeof window.updateOptimizeTargetDomain === 'function') {
      window.updateOptimizeTargetDomain();
    } else {
      const event = new window.Event('change');
      domainInput.dispatchEvent(event);
    }

    // Verify currentScannedDomain is updated
    expect(window.currentScannedDomain).toBe('mytestdomain.com');

    // Verify the code block reflects the new domain
    const codeBlock = document.getElementById('schema-code-block');
    expect(codeBlock.textContent).toContain('mytestdomain.com');
  });

  it('Scenario 4: Query parameter url correctly initializes target domain and updates schema code block', () => {
    // Re-initialize with query parameters in URL
    const queryDom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/optimize.html?url=https://querydomain.org/some-path'
    });
    const qWindow = queryDom.window;
    const qDocument = qWindow.document;

    qWindow.API_BASE = 'http://localhost:5000';
    
    try {
      qWindow.eval(jsContent);
    } catch (err) {
      // Ignore
    }

    const domLoadedEvent = new qWindow.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    qDocument.dispatchEvent(domLoadedEvent);

    const domainInput = qDocument.getElementById('optimize-target-domain');
    expect(domainInput.value).toBe('querydomain.org');

    expect(qWindow.currentScannedDomain).toBe('querydomain.org');

    const codeBlock = qDocument.getElementById('schema-code-block');
    expect(codeBlock.textContent).toContain('querydomain.org');
  });
});
