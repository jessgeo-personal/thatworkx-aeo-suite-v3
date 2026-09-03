import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Explee 1:1 Cockpit Redesign Contract', () => {
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

  describe('1. Governance Gate & Banned Terms', () => {
    it('must have ZERO occurrences of the banned term "AI-first"', () => {
      expect(htmlContent).not.toMatch(/AI-first/i);
    });

    it('must correctly separate AI-Optimized and AI-Ready markers', () => {
      expect(htmlContent).toMatch(/AI-Ready/);
      expect(htmlContent).toMatch(/AI-Optimized/);
    });
  });

  describe('2. Edge-to-Edge Desktop Cockpit Shell (No max-w-7xl boxed wrapper)', () => {
    it('must scaffold a full-height, edge-to-edge workspace container', () => {
      const workspace = document.querySelector('[data-testid="explee-workspace"], .explee-workspace');
      expect(workspace).not.toBeNull();
      // Must not be constricted inside standard boxed web container
      expect(workspace.classList.contains('max-w-7xl')).toBe(false);
    });

    it('must render 3 distinct full-height columns with dedicated scroll areas', () => {
      const colLeft = document.querySelector('[data-testid="explee-col-left"], .explee-col-left');
      const colCenter = document.querySelector('[data-testid="explee-col-center"], .explee-col-center');
      const colRight = document.querySelector('[data-testid="explee-col-right"], .explee-col-right');

      expect(colLeft).not.toBeNull();
      expect(colCenter).not.toBeNull();
      expect(colRight).not.toBeNull();
    });
  });

  describe('3. Explee Top Progression Stepper & Action Dock', () => {
    it('must render the connected timeline steps (1 to 5) leading to active capsule Step 6', () => {
      const stepper = document.querySelector('[data-testid="explee-stepper"], .explee-stepper');
      expect(stepper).not.toBeNull();

      const numberedSteps = stepper.querySelectorAll('[data-step-circle]');
      expect(numberedSteps.length).toBeGreaterThanOrEqual(5);

      const activeCapsule = stepper.querySelector('[data-step-active="6"], .step-capsule-active');
      expect(activeCapsule).not.toBeNull();
      expect(activeCapsule.textContent).toMatch(/Outreach ready|Manifest ready|Ready/i);
    });

    it('must render "WHAT HAPPENS NEXT" label and downstream stages (7, 8, 9)', () => {
      const nextSection = document.querySelector('[data-testid="explee-what-next"], .explee-what-next');
      expect(nextSection).not.toBeNull();
      expect(nextSection.textContent).toMatch(/WHAT HAPPENS NEXT/i);

      const nextSteps = nextSection.querySelectorAll('[data-downstream-step]');
      expect(nextSteps.length).toBeGreaterThanOrEqual(3);
    });

    it('must render top credit indicator and green CTA button lockup', () => {
      const creditDock = document.querySelector('[data-testid="explee-credit-dock"], .explee-credit-dock');
      expect(creditDock).not.toBeNull();
      expect(creditDock.textContent).toMatch(/\$30 free credits|No upfront charge/i);

      const ctaBtn = creditDock.querySelector('button, .btn-explee-primary');
      expect(ctaBtn).not.toBeNull();
      expect(ctaBtn.textContent).toMatch(/Start outreach|Start AEO Outreach|Start/i);
    });
  });

  describe('4. Left Column - 3-Step Context Workflow', () => {
    it('must render "step 1 · Research your company" with company header, bio, and metadata chips', () => {
      const step1 = document.querySelector('[data-testid="step-1-research"]');
      expect(step1).not.toBeNull();
      expect(step1.textContent).toMatch(/step 1/i);

      // Company info
      const companyTitle = step1.querySelector('[data-field="company-name"]');
      const companyDomain = step1.querySelector('[data-field="company-domain"]');
      expect(companyTitle).not.toBeNull();
      expect(companyDomain).not.toBeNull();

      // Metadata chip pills row (date, size, location)
      const chips = step1.querySelectorAll('.meta-chip, [data-meta-chip]');
      expect(chips.length).toBeGreaterThanOrEqual(3);
    });

    it('must render "step 2 · Explore competitors" with gear icon, count badge, and dense competitor chip grid', () => {
      const step2 = document.querySelector('[data-testid="step-2-competitors"]');
      expect(step2).not.toBeNull();
      expect(step2.textContent).toMatch(/step 2/i);
      expect(step2.textContent).toMatch(/COMPETITORS/i);

      const competitorChips = step2.querySelectorAll('.competitor-chip, [data-competitor-chip]');
      expect(competitorChips.length).toBeGreaterThanOrEqual(6);
    });

    it('must render "step 3 · Define campaigns" with campaign selector tiles and volume badges', () => {
      const step3 = document.querySelector('[data-testid="step-3-campaigns"]');
      expect(step3).not.toBeNull();
      expect(step3.textContent).toMatch(/step 3/i);
      expect(step3.textContent).toMatch(/CAMPAIGNS/i);

      const campaignTiles = step3.querySelectorAll('.campaign-tile, [data-campaign-tile]');
      expect(campaignTiles.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('5. Center Column - Segmented Switcher & Multi-Tool Stream Cards', () => {
    it('must render the top 3-segment pill switcher (Companies/Manifests, People/Pages, Emails/Endpoints)', () => {
      const switcher = document.querySelector('[data-testid="explee-feed-switcher"], .explee-feed-switcher');
      expect(switcher).not.toBeNull();

      const tabs = switcher.querySelectorAll('button, .segment-btn');
      expect(tabs.length).toBe(3);
    });

    it('must render dense feed stream cards with avatars, lead/endpoint details, and multi-tool validator badge pills', () => {
      const feedCards = document.querySelectorAll('[data-testid="explee-stream-card"], .explee-stream-card');
      expect(feedCards.length).toBeGreaterThanOrEqual(3);

      feedCards.forEach(card => {
        // Multi-tool badges (hunter, exreacher, findymail, leadmagic, etc.)
        const toolBadges = card.querySelectorAll('.tool-badge, [data-tool-badge]');
        expect(toolBadges.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('6. Right Column - Inspector Studio Canvas & Bottom Action Bar', () => {
    it('must render the Inspector Header Bar with avatar circle, primary entity name, LinkedIn/social badge, and role', () => {
      const inspectorHeader = document.querySelector('[data-testid="inspector-entity-header"]');
      expect(inspectorHeader).not.toBeNull();

      const avatar = inspectorHeader.querySelector('.entity-avatar');
      const name = inspectorHeader.querySelector('.entity-name');
      const role = inspectorHeader.querySelector('.entity-role');

      expect(avatar).not.toBeNull();
      expect(name).not.toBeNull();
      expect(role).not.toBeNull();
    });

    it('must render distinct metadata field rows for "To" and "Subj" (or Endpoint & Directive)', () => {
      const metaRowTo = document.querySelector('[data-field="meta-to"]');
      const metaRowSubj = document.querySelector('[data-field="meta-subj"]');

      expect(metaRowTo).not.toBeNull();
      expect(metaRowSubj).not.toBeNull();
    });

    it('must render the formatted studio canvas with rich editable-style body text', () => {
      const studioBody = document.querySelector('[data-testid="inspector-studio-body"]');
      expect(studioBody).not.toBeNull();
      expect(studioBody.textContent.length).toBeGreaterThan(50);
    });

    it('must render the bottom action footer with settings gear, "Click to edit" guide, and green submission button', () => {
      const actionFooter = document.querySelector('[data-testid="inspector-footer-bar"]');
      expect(actionFooter).not.toBeNull();
      expect(actionFooter.textContent).toMatch(/Click to edit/i);

      const submitBtn = actionFooter.querySelector('button, .btn-submit-action');
      expect(submitBtn).not.toBeNull();
      expect(submitBtn.textContent).toMatch(/Claim \$30 credits|Claim|Deploy/i);
    });
  });

  describe('7. Floating Accessories', () => {
    it('must render the bottom-center notification banner pill', () => {
      const banner = document.querySelector('[data-testid="floating-update-banner"]');
      expect(banner).not.toBeNull();
      expect(banner.textContent).toMatch(/available.*Refresh/i);
    });

    it('must render the bottom-right circular help/chat trigger', () => {
      const fab = document.querySelector('[data-testid="floating-help-btn"]');
      expect(fab).not.toBeNull();
    });
  });
});
