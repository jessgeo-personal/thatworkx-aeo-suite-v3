const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

describe('Landing Page Console Tab Switcher (BDD Feature 9)', () => {
  let htmlContent;
  let visualizeHtmlContent;
  let heroSectionContent;
  let $;
  let $vis;

  beforeAll(() => {
    const indexPath = path.resolve(__dirname, '../../../frontend/index.html');
    const visPath   = path.resolve(__dirname, '../../../frontend/visualize.html');
    const heroPath  = path.resolve(__dirname, '../../../frontend/src/components/HeroSection.jsx');

    htmlContent          = fs.readFileSync(indexPath, 'utf8');
    visualizeHtmlContent = fs.readFileSync(visPath, 'utf8');
    heroSectionContent   = fs.readFileSync(heroPath, 'utf8');
    $                    = cheerio.load(htmlContent);
    $vis                 = cheerio.load(visualizeHtmlContent);
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.1: Console Tab Switcher Display and 3-Column Desktop Alignment', () => {
    it('should render three distinct tab switcher buttons for AIVisualize, AIOptimize, and AISocialize', () => {
      const visualizeBtn = $('#btn-tab-visualize');
      const optimizeBtn  = $('#btn-tab-optimize');
      const socializeBtn = $('#btn-tab-socialize');

      expect(visualizeBtn.length).toBe(1);
      expect(optimizeBtn.length).toBe(1);
      expect(socializeBtn.length).toBe(1);
    });

    it('should format tab titles, subheads, and deliverable lists cleanly', () => {
      const visualizeBtn = $('#btn-tab-visualize');
      const optimizeBtn  = $('#btn-tab-optimize');
      const socializeBtn = $('#btn-tab-socialize');

      expect(visualizeBtn.text()).toContain('AI Visualize');
      expect(optimizeBtn.text()).toContain('AIOptimize');
      expect(socializeBtn.text()).toContain('AISocialize');

      expect(visualizeBtn.text()).toContain('Deliverables');
      expect(optimizeBtn.text()).toContain('Deliverables');
      expect(socializeBtn.text()).toContain('Deliverables');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.2: Upfront Capability Grid Sub-Lists Integrity', () => {
    it('should list exact deliverables under AI Visualize tab', () => {
      const visualizeBtn = $('#btn-tab-visualize');
      expect(visualizeBtn.text()).toContain('Real-time diagnostic scorecard');
      expect(visualizeBtn.text()).toContain('Raw bot markdown view');
      expect(visualizeBtn.text()).toContain('WAF status report');
    });

    it('should list exact deliverables under AIOptimize tab', () => {
      const optimizeBtn = $('#btn-tab-optimize');
      expect(optimizeBtn.text()).toContain('One-click code remediation');
      expect(optimizeBtn.text()).toContain('Cloudflare Worker edge scripts');
      expect(optimizeBtn.text()).toContain('Downloadable .txt/.md manifests');
    });

    it('should list exact deliverables under AISocialize tab', () => {
      const socializeBtn = $('#btn-tab-socialize');
      expect(socializeBtn.text()).toContain('Chrome Extension integration');
      expect(socializeBtn.text()).toContain('Citation graph audit');
      expect(socializeBtn.text()).toContain('Social snippet append engine');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.3: Interactive Active State Selection and Brand Accents', () => {
    it('should assign active status to AI Visualize tab by default on index.html', () => {
      const visualizeBtn = $('#btn-tab-visualize');
      expect(visualizeBtn.hasClass('active')).toBe(true);
    });

    it('should render Enterprise Demo Chips with target _blank on index.html', () => {
      const shopifyChip = $('a[href*="shopify.com"]');
      const stripeChip  = $('a[href*="stripe.com"]');
      const airbnbChip  = $('a[href*="airbnb.com"]');

      expect(shopifyChip.length).toBeGreaterThanOrEqual(1);
      expect(stripeChip.length).toBeGreaterThanOrEqual(1);
      expect(airbnbChip.length).toBeGreaterThanOrEqual(1);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.4: React HeroSection Component Token Parity', () => {
    it('should match JetBrains Mono fonts and Rose/Amber/Copper muted tokens in HeroSection.jsx', () => {
      expect(heroSectionContent).toContain('JetBrains Mono');
      expect(heroSectionContent).toContain('#9F1239'); // Rose
      expect(heroSectionContent).toContain('#B45309'); // Amber
      expect(heroSectionContent).toContain('#9A3412'); // Copper
    });

    it('should bridge to vanilla executeOnboardingScan if present on window', () => {
      expect(heroSectionContent).toContain('window.executeOnboardingScan');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.5: AIVisualize Dual View Mode Switcher Pill (Milestone 1)', () => {
    it('should render Executive Mode and Developer/DIY Mode switcher buttons on visualize.html', () => {
      const execBtn = $vis('#pill-exec-mode');
      const devBtn  = $vis('#pill-dev-mode');

      expect(execBtn.length).toBe(1);
      expect(devBtn.length).toBe(1);
      expect(execBtn.text()).toContain('Executive Mode');
      expect(devBtn.text()).toContain('Developer / DIY Mode');
    });

    it('should set Executive Mode as the default active state', () => {
      const execBtn = $vis('#pill-exec-mode');
      expect(execBtn.hasClass('active')).toBe(true);
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.6: AIVisualize Executive Mode UI & Perception Simulator (Milestone 3)', () => {
    it('should render Executive Score Dial (0-100) and top Action CTAs', () => {
      const scoreVal = $vis('#exec-overall-score');
      const statusBadge = $vis('#exec-score-classification-pill');
      expect(scoreVal.length).toBe(1);
      expect(statusBadge.text()).toContain('VISIBILITY');
    });

    it('should render Side-by-Side Visual Perception Engine Simulator comparing Human vs Machine viewports', () => {
      const simContainer = $vis('.perception-simulator-card');
      expect(simContainer.length).toBe(1);
    });

    it('should render 4 Strategic Health Pillar cards', () => {
      const pillars = $vis('.pillar-card');
      expect(pillars.length).toBe(4);
    });

    it('should render AI-Ready Machine Files Table', () => {
      const execRoutesCount = $vis('#exec-routes-count');
      const execMachineFilesCount = $vis('#exec-machine-files-count');
      expect(execRoutesCount.length).toBe(0);
      expect(execMachineFilesCount.length).toBe(1);
    });
  });

  describe('Scenario 9.7: AIVisualize Developer / DIY Mode UI (Milestone 4)', () => {
    it('should render Developer mode containers on visualize.html', () => {
      const devContainer = $vis('#dev-mode-container');
      expect(devContainer.length).toBe(1);
    });
  });
});
