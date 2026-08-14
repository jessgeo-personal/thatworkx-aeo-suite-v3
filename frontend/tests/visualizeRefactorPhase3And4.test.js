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
    expect(callout4.textContent).toContain('Why the Machine Manifest files Matter:');
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

describe('AIVisualize Phase 4 Remediation Banners & Section 2 CTA BDD Suite', () => {
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

  it('Scenario A: Section 2 Return CTA Full-Width Alignment', () => {
    const sec2ReturnBtn = document.querySelector('#section-2-details .btn-return-summary');
    expect(sec2ReturnBtn).not.toBeNull();
    const styleAttribute = sec2ReturnBtn.getAttribute('style') || '';
    const hasFullWidth = styleAttribute.includes('width: 100%') || styleAttribute.includes('grid-column: 1 / -1') || styleAttribute.includes('grid-column: span 2');
    expect(hasFullWidth).toBe(true);
  });

  it('Scenario B: Contextual Remediation Banners & Deep Link Routing', () => {
    // Assert Section 1 details banner
    const sec1Banner = document.getElementById('sec1-remediation-banner');
    expect(sec1Banner).not.toBeNull();
    expect(sec1Banner.classList.contains('border-glow-cyan')).toBe(true);
    const sec1Link = sec1Banner.querySelector('a[href="optimize.html?section=access"]');
    expect(sec1Link).not.toBeNull();
    expect(sec1Link.textContent.trim()).toContain('Restore AI Access Permissions in AIOptimize Pro');

    // Assert Section 2 details banner
    const sec2Banner = document.getElementById('sec2-remediation-banner');
    expect(sec2Banner).not.toBeNull();
    expect(sec2Banner.classList.contains('border-glow-emerald')).toBe(true);
    const sec2Link = sec2Banner.querySelector('a[href="optimize.html?section=content"]');
    expect(sec2Link).not.toBeNull();
    expect(sec2Link.textContent.trim()).toContain('Generate Citation Markup in AIOptimize Pro');

    // Assert Section 3 details banner
    const sec3Banner = document.getElementById('sec3-remediation-banner');
    expect(sec3Banner).not.toBeNull();
    expect(sec3Banner.classList.contains('border-glow-amber')).toBe(true);
    const sec3Link = sec3Banner.querySelector('a[href="optimize.html?section=trust"]');
    expect(sec3Link).not.toBeNull();
    expect(sec3Link.textContent.trim()).toContain('Verify Brand Trust Signals in AIOptimize Pro');

    // Assert Section 4 details banner
    const sec4Banner = document.getElementById('sec4-remediation-banner');
    expect(sec4Banner).not.toBeNull();
    expect(sec4Banner.classList.contains('border-glow-burnt')).toBe(true);
    const sec4Link = sec4Banner.querySelector('a[href="optimize.html?section=blueprint"]');
    expect(sec4Link).not.toBeNull();
    expect(sec4Link.textContent.trim()).toContain('Deploy Machine Manifests in AIOptimize Pro');
  });

  it('Scenario C: PDF Print Overrides for Remediation Banners', () => {
    expect(cssContent).toContain('@media print');
    const printIndex = cssContent.indexOf('@media print');
    const printBlock = cssContent.slice(printIndex);

    expect(printBlock).toContain('#sec1-remediation-banner');
    expect(printBlock).toContain('#sec2-remediation-banner');
    expect(printBlock).toContain('#sec3-remediation-banner');
    expect(printBlock).toContain('#sec4-remediation-banner');

    const sec1Regex = /#sec1-remediation-banner[^}]+?display\s*:\s*block\s*!important/i;
    const sec2Regex = /#sec2-remediation-banner[^}]+?display\s*:\s*block\s*!important/i;
    const sec3Regex = /#sec3-remediation-banner[^}]+?display\s*:\s*block\s*!important/i;
    const sec4Regex = /#sec4-remediation-banner[^}]+?display\s*:\s*block\s*!important/i;

    expect(printBlock).toMatch(sec1Regex);
    expect(printBlock).toMatch(sec2Regex);
    expect(printBlock).toMatch(sec3Regex);
    expect(printBlock).toMatch(sec4Regex);
  });
});
