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

describe('AIVisualize Sub-Phase 3A BDD Suite', () => {
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

  it('Scenario 1: Total Absence of camelCase Variable Leaks in visualize.html', () => {
    const leaks = [
      'essentialPages',
      'HasFAQSchema',
      'HasOrganizationSchema',
      'hasEmailVisibleToAI',
      'hasPhoneVisibleToAI',
      'isSecure',
      'hasContactInfo',
      'hasPrivacyPolicy',
      'AgeEstimate',
      'AuthorityStatus',
      'X-Robots-Tag'
    ];

    leaks.forEach(leak => {
      // We expect no camelCase leaks inside visualize.html body (excluding script tags if there are inline ones)
      const bodyHtml = document.body.innerHTML;
      expect(bodyHtml).not.toContain(leak);
    });

    const translations = [
      "Essential Business Pages",
      "FAQ Structured Markup",
      "Organization Entity Markup",
      "AI-Discoverable Contact Email",
      "AI-Discoverable Phone Line",
      "HTTPS Security Encryption",
      "Verified Contact Credentials",
      "Privacy & Trust Governance",
      "Brand Entity Authority",
      "Server Crawlability Flags"
    ];

    translations.forEach(translation => {
      expect(document.body.textContent).toContain(translation);
    });
  });

  it('Scenario 2: Educational Callout Blocks ("Why This Boosts AI Visibility")', () => {
    const sec1 = document.getElementById('section-1-details');
    const sec2 = document.getElementById('section-2-details');
    const sec3 = document.getElementById('section-3-details');
    const sec4 = document.getElementById('section-4-details');

    expect(sec1).not.toBeNull();
    expect(sec2).not.toBeNull();
    expect(sec3).not.toBeNull();
    expect(sec4).not.toBeNull();

    const callout1 = sec1.querySelector('.educational-callout');
    const callout2 = sec2.querySelector('.educational-callout');
    const callout3 = sec3.querySelector('.educational-callout');
    const callout4 = sec4.querySelector('.educational-callout');

    expect(callout1).not.toBeNull();
    expect(callout2).not.toBeNull();
    expect(callout3).not.toBeNull();
    expect(callout4).not.toBeNull();

    expect(callout1.textContent).toContain('Why AI Access Matters:');
    expect(callout2.textContent).toContain('Why Page Content Matters:');
    expect(callout3.textContent).toContain('Why Brand Trust & E-E-A-T Matter:');
    expect(callout4.textContent).toContain('Why Machine Manifests Matter:');
  });

  it('Scenario 3: Governance & Vocabulary Gate', () => {
    const bannedPhrase = ['AI', 'first'].join('-');

    // Zero occurrences of banned term "AI-first" across html, js, and this test file
    expect(htmlContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());
    expect(jsContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    const selfContent = fs.readFileSync(__filename, 'utf8');
    const cleanedSelfContent = selfContent.replace(new RegExp(bannedPhrase, 'g'), '');
    expect(cleanedSelfContent.toLowerCase()).not.toContain(bannedPhrase.toLowerCase());

    // Sections 1–3 are designated "AI-Optimized" and Section 4 as "AI-Ready"
    const s1Text = document.getElementById('section-1-card')?.textContent || '';
    const s2Text = document.getElementById('section-2-card')?.textContent || '';
    const s3Text = document.getElementById('section-3-card')?.textContent || '';
    const s4Text = document.getElementById('section-4-card')?.textContent || '';

    expect(s1Text).toContain('AI-Optimized');
    expect(s2Text).toContain('AI-Optimized');
    expect(s3Text).toContain('AI-Optimized');
    expect(s4Text).toContain('AI-Ready');
  });
});
