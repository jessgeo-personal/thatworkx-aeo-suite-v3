const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

describe('Landing Page Console Tab Switcher (BDD Feature 9)', () => {
  let htmlContent;
  let heroSectionContent;
  let $;

  beforeAll(() => {
    const indexPath = path.resolve(__dirname, '../../../frontend/index.html');
    const heroPath  = path.resolve(__dirname, '../../../frontend/src/components/HeroSection.jsx');

    htmlContent        = fs.readFileSync(indexPath, 'utf8');
    heroSectionContent = fs.readFileSync(heroPath, 'utf8');
    $                  = cheerio.load(htmlContent);
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

    it('should configure 3-column desktop grid alignment with responsive single-column mobile fallback', () => {
      // HTML-side vanilla switcher container
      const gridContainer = $('.console-tabs-container');
      expect(gridContainer.length).toBe(1);
      expect(gridContainer.hasClass('grid-cols-1')).toBe(true);
      expect(gridContainer.hasClass('md:grid-cols-3')).toBe(true);

      // React HeroSection uses Tailwind grid responsive classes
      expect(heroSectionContent).toContain('grid-cols-1 md:grid-cols-3');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.2: Visual Text Presence and Branding Content Verification', () => {
    it('should render exact visual text, subheadline, and list items for AI Visualize button', () => {
      const btn  = $('#btn-tab-visualize');
      const text = btn.text();

      expect(text).toContain('AI Visualize');
      expect(text).toContain('show you what AI can see.');
      expect(text).toContain('1. Are you blocking out AI?');
      expect(text).toContain('2. Is your web presence optimized for AI?');
      expect(text).toContain('3. Is your content AI-Ready?');
      expect(text).toContain('4. Are you setup to be AI-First?');

      // Verify in HeroSection.jsx component definition
      expect(heroSectionContent).toContain("label: 'AI Visualize'");
      expect(heroSectionContent).toContain('show you what AI can see.');
    });

    it('should render exact visual text, subheadline, and list items for AIOptimize button', () => {
      const btn  = $('#btn-tab-optimize');
      const text = btn.text();

      expect(text).toContain('AIOptimize');
      expect(text.toLowerCase()).toContain('you are ai-ready');
      expect(text.toLowerCase()).toContain('optimized for ai');
      expect(text).toContain('• Optimizing for AI-Ready');
      expect(text).toContain('• Optimizing for AI-First');

      // Verify in HeroSection.jsx component definition
      expect(heroSectionContent).toContain("label: 'AIOptimize'");
      expect(heroSectionContent.toLowerCase()).toContain('optimized for ai');
    });

    it('should render exact visual text, subheadline, sections, and items for AISocialize button', () => {
      const btn  = $('#btn-tab-socialize');
      const text = btn.text();

      expect(text).toContain('AISocialize');
      expect(text).toContain('Go further, ensure your social footprint is Optimized for AI');
      expect(text).toContain('Is your domain AI-ready for social?');
      expect(text).toContain('- llms.txt exists');
      expect(text).toContain('- Has Author Info');
      expect(text).toContain('- Credential mentions');
      expect(text).toContain('Elevate your Social to AI-Ready');

      // Verify in HeroSection.jsx component definition
      expect(heroSectionContent).toContain("label: 'AISocialize'");
      expect(heroSectionContent).toContain("subhead: 'Go further, ensure your social footprint is Optimized for AI.'");
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.3: Design Token – Updated Muted Accent Palette', () => {
    it('should use Deep Rose Crimson (#9F1239) for AI Visualize accent', () => {
      expect(heroSectionContent).toContain("rose:   '#9F1239'");
      expect(heroSectionContent).toContain('accentRgb: \'159,18,57\'');
    });

    it('should use Safety Amber (#B45309) for AIOptimize accent', () => {
      expect(heroSectionContent).toContain("amber:  '#B45309'");
      expect(heroSectionContent).toContain('accentRgb: \'180,83,9\'');
    });

    it('should use Burnt Copper (#9A3412) for AISocialize accent', () => {
      expect(heroSectionContent).toContain("copper: '#9A3412'");
      expect(heroSectionContent).toContain('accentRgb: \'154,52,18\'');
    });

    it('should use dark canvas #0D0E11 and light canvas #F8FAFC', () => {
      expect(heroSectionContent).toContain("canvasDark:  '#0D0E11'");
      expect(heroSectionContent).toContain("canvasLight: '#F8FAFC'");
    });

    it('should use JetBrains Mono as primary monospace badge font', () => {
      expect(heroSectionContent).toContain('JetBrains Mono');
      expect(heroSectionContent).toContain('fontMono');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.4: Active Selection, Badges & Instant Try Pills', () => {
    it('should display the Chrome Extension notice with correct updated text when AISocialize is active', () => {
      // HTML-side vanilla badge
      const badge = $('#socialize-extension-badge');
      expect(badge.length).toBe(1);
      // Badge now uses structured spans; check for key substrings
      expect(badge.text()).toContain('Chrome Extension Required for Post Snippets');
      expect(badge.text()).toContain('[Install]');

      // React component uses same updated spec copy
      expect(heroSectionContent).toContain('Chrome Extension Required for Post Snippets');
    });

    it('should render 1-click Instant Try Pills for shopify.com, stripe.com, and airbnb.com', () => {
      expect(heroSectionContent).toContain("'shopify.com'");
      expect(heroSectionContent).toContain("'stripe.com'");
      expect(heroSectionContent).toContain("'airbnb.com'");
      expect(heroSectionContent).toContain('INSTANT_PILLS');
      expect(heroSectionContent).toContain('Try Instant Scan:');
    });

    it('should fire URL query injection on form submit with tool and url params', () => {
      expect(heroSectionContent).toContain('URLSearchParams');
      // Component uses { tool: activeTab, url: target } object form
      expect(heroSectionContent).toContain('tool: activeTab');
      expect(heroSectionContent).toContain('url: target');
      expect(heroSectionContent).toContain('window.history.pushState');
    });

    it('should bridge to vanilla executeOnboardingScan if present on window', () => {
      expect(heroSectionContent).toContain('window.executeOnboardingScan');
    });
  });
});
