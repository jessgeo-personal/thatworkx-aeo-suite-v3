import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 2: Left Context & Center Discovery Stream Contract', () => {
  let htmlContent;
  let dom;
  let document;

  const visualizePath = path.resolve(__dirname, '../visualize.html');

  beforeEach(() => {
    expect(fs.existsSync(visualizePath), 'frontend/visualize.html must exist').toBe(true);
    htmlContent = fs.readFileSync(visualizePath, 'utf-8');
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('1. Governance Gate & Data Integrity Defaults', () => {
    it('must have ZERO occurrences of the banned term "AI-first"', () => {
      expect(htmlContent).not.toMatch(/AI-first/i);
    });

    it('must enforce graceful default fallbacks ("--", "UNAUDITED") for domain metrics and unpopulated state displays', () => {
      const metadataBadges = document.querySelectorAll('[data-meta-default]');
      expect(metadataBadges.length).toBeGreaterThanOrEqual(3);
      metadataBadges.forEach(el => {
        expect(el.textContent.trim()).toMatch(/^(--|UNAUDITED)$/);
      });
    });
  });

  describe('2. Column 1 (Left Pane) - Domain Profile & Configuration', () => {
    it('must render the Domain Profile overview card', () => {
      const profileCard = document.querySelector('[data-testid="domain-profile-card"], .domain-profile-card');
      expect(profileCard).not.toBeNull();
    });

    it('must render domain meta fields: Audit Date, Region, and Crawl Scope', () => {
      const auditDateField = document.querySelector('[data-field="audit-date"]');
      const regionField = document.querySelector('[data-field="region"]');
      const scopeField = document.querySelector('[data-field="crawl-scope"]');

      expect(auditDateField).not.toBeNull();
      expect(regionField).not.toBeNull();
      expect(scopeField).not.toBeNull();
    });

    it('must render the Competitor Benchmark targets section with item list', () => {
      const competitorSection = document.querySelector('[data-testid="competitor-benchmark-section"]');
      expect(competitorSection).not.toBeNull();

      const competitorList = competitorSection.querySelectorAll('[data-competitor-item], .competitor-item');
      expect(competitorList.length).toBeGreaterThanOrEqual(4);
    });

    it('must render Campaign & Category scope filter buttons', () => {
      const categoryFilters = document.querySelectorAll('[data-category-filter], .category-filter-btn');
      expect(categoryFilters.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('3. Column 2 (Center Feed) - Discovery Queue & Manifest Stream', () => {
    it('must render the Center Feed filter tab switcher (Manifests, Pages, Competitors)', () => {
      const tabSwitcher = document.querySelector('[data-testid="center-feed-tabs"], .feed-tab-switcher');
      expect(tabSwitcher).not.toBeNull();

      const tabs = tabSwitcher.querySelectorAll('button[data-feed-tab]');
      expect(tabs.length).toBeGreaterThanOrEqual(3);
      
      const tabNames = Array.from(tabs).map(t => t.dataset.feedTab);
      expect(tabNames).toContain('manifests');
      expect(tabNames).toContain('pages');
      expect(tabNames).toContain('competitors');
    });

    it('must render pre-rendered manifest stream cards (robots.txt, llms.txt, ai-context.md, schema.jsonld)', () => {
      const manifestCards = document.querySelectorAll('[data-testid="discovery-card"], .discovery-card');
      expect(manifestCards.length).toBeGreaterThanOrEqual(4);

      const cardTitles = Array.from(manifestCards).map(c => c.querySelector('.card-title, [data-card-title]')?.textContent.trim());
      expect(cardTitles.some(t => t && t.includes('robots.txt'))).toBe(true);
      expect(cardTitles.some(t => t && t.includes('llms.txt'))).toBe(true);
      expect(cardTitles.some(t => t && t.includes('ai-context.md'))).toBe(true);
    });

    it('must render protocol validator badges and verification status pills on each card', () => {
      const validatorPills = document.querySelectorAll('.validator-pill, [data-validator-status]');
      expect(validatorPills.length).toBeGreaterThanOrEqual(4);

      const statusBadges = document.querySelectorAll('.card-status-badge, [data-card-status]');
      expect(statusBadges.length).toBeGreaterThanOrEqual(4);
    });
  });
});
