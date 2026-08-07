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

describe('Page-Level Inspector Modal BDD Suite', () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    // Load visualize.html into JSDOM with URL to trigger visualize page route
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
      // Ignore evaluation warnings or missing dependencies in JSDOM environment
    }

    // Manually dispatch DOMContentLoaded to ensure initializers run
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it('Scenario 1: View Markdown buttons exist on rendered page rows', () => {
    // Simulate scan results payload
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/',
          wordCount: 300,
          status: 200,
          html: '<html><head><link rel="canonical" href="https://example.com/" /><script type="application/ld+json">{"@context": "https://schema.org", "@type": "Organization", "name": "Test"}</script></head><body><main><h1>Demo</h1><header></header><footer></footer></main></body></html>'
        }
      ]
    };

    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    const tbody = document.getElementById('dev-module-4-tbody');
    expect(tbody).not.toBeNull();
    
    const row = tbody.querySelector('tr');
    expect(row).not.toBeNull();

    const viewMarkdownBtn = row.querySelector('.view-markdown-btn');
    expect(viewMarkdownBtn).not.toBeNull();
    expect(viewMarkdownBtn.textContent).toContain('View Markdown');
  });

  it('Scenario 2: Clicking .view-markdown-btn opens #markdown-preview-modal and populates URL, canonical, and schema status nodes', () => {
    // Simulate scan results payload
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/about',
          wordCount: 300,
          status: 200,
          hasCanonical: true,
          canonicalUrl: 'https://example.com/about',
          html: '<html><head><link rel="canonical" href="https://example.com/about" /><script type="application/ld+json">{"@context": "https://schema.org", "@type": "AboutPage"}</script></head><body><main><h1>About Us</h1><header></header><footer></footer></main></body></html>',
          markdown: '# About Us\nThis is a team page.'
        }
      ]
    };

    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    const viewMarkdownBtn = document.querySelector('.view-markdown-btn');
    expect(viewMarkdownBtn).not.toBeNull();

    // The modal should be hidden initially
    const modal = document.getElementById('markdown-preview-modal');
    expect(modal).not.toBeNull();
    expect(modal.style.display).toBe('none');

    // Click the button
    viewMarkdownBtn.click();

    // The modal should be opened (style.display should be 'flex')
    expect(modal.style.display).toBe('flex');

    // Assert that the fields inside the modal are correctly populated
    const modalUrl = document.getElementById('markdown-modal-url');
    const modalCanonical = document.getElementById('markdown-modal-canonical');
    const modalSchema = document.getElementById('markdown-modal-schema');
    const modalBody = document.getElementById('markdown-modal-body');
    const modalSchemaAlert = document.getElementById('markdown-modal-schema-alert');

    expect(modalUrl.textContent).toBe('/about');
    expect(modalCanonical.textContent).toContain('Canonical: https://example.com/about');
    expect(modalSchema.textContent).toContain('JSON-LD Schema: Present (1)');
    expect(modalBody.textContent).toBe('# About Us\nThis is a team page.');
    expect(modalSchemaAlert.style.display).toBe('none');
  });

  it('Scenario 3: Assert missing schema warning alert displays when schema is absent', () => {
    // Simulate scan results payload with no schema
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/contact',
          wordCount: 150,
          status: 200,
          hasCanonical: false,
          html: '<html><head></head><body><main><h1>Contact Us</h1><header></header><footer></footer></main></body></html>',
          markdown: '# Contact Us'
        }
      ]
    };

    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    const viewMarkdownBtn = document.querySelector('.view-markdown-btn');
    viewMarkdownBtn.click();

    const modal = document.getElementById('markdown-preview-modal');
    expect(modal.style.display).toBe('flex');

    const modalCanonical = document.getElementById('markdown-modal-canonical');
    const modalSchema = document.getElementById('markdown-modal-schema');
    const modalSchemaAlert = document.getElementById('markdown-modal-schema-alert');

    expect(modalCanonical.textContent).toContain('Canonical: Missing');
    expect(modalSchema.textContent).toContain('JSON-LD Schema: Missing');
    expect(modalSchemaAlert.style.display).toBe('block');
  });

  it('Scenario 4: Modal closes upon clicking #markdown-modal-close-btn', () => {
    // Simulate scan results payload
    const mockResults = {
      url: 'https://example.com',
      pages: [
        {
          route: '/',
          wordCount: 100,
          status: 200,
          html: '<html><body><main></main></body></html>'
        }
      ]
    };

    if (typeof window.renderModule4 === 'function') {
      window.renderModule4(mockResults);
    }

    const viewMarkdownBtn = document.querySelector('.view-markdown-btn');
    viewMarkdownBtn.click();

    const modal = document.getElementById('markdown-preview-modal');
    expect(modal.style.display).toBe('flex');

    const closeBtn = document.getElementById('markdown-modal-close-btn');
    expect(closeBtn).not.toBeNull();

    // Click the close button
    closeBtn.click();

    // Modal should be hidden (style.display should be 'none')
    expect(modal.style.display).toBe('none');
  });
});
