const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

describe('Landing Page Console Tab Switcher (BDD Feature 9)', () => {
  let htmlContent;
  let heroSectionContent;
  let $;

  beforeAll(() => {
    const indexPath = path.resolve(__dirname, '../../../frontend/index.html');
    const heroPath = path.resolve(__dirname, '../../../frontend/src/components/HeroSection.jsx');

    htmlContent = fs.readFileSync(indexPath, 'utf8');
    heroSectionContent = fs.readFileSync(heroPath, 'utf8');
    $ = cheerio.load(htmlContent);
  });

  describe('Scenario 9.1: Console Tab Switcher Display and 3-Column Desktop Alignment', () => {
    it('should render three distinct tab switcher buttons for AIVisualize, AIOptimize, and AISocialize', () => {
      const visualizeBtn = $('#btn-tab-visualize');
      const optimizeBtn = $('#btn-tab-optimize');
      const socializeBtn = $('#btn-tab-socialize');

      expect(visualizeBtn.length).toBe(1);
      expect(optimizeBtn.length).toBe(1);
      expect(socializeBtn.length).toBe(1);
    });

    it('should configure 3-column desktop grid alignment with responsive single-column mobile fallback', () => {
      // Validate HTML layout structure
      const gridContainer = $('.console-tabs-container');
      expect(gridContainer.length).toBe(1);
      expect(gridContainer.hasClass('grid-cols-1')).toBe(true);
      expect(gridContainer.hasClass('md:grid-cols-3')).toBe(true);

      // Validate React HeroSection grid responsive classes (grid-cols-1 md:grid-cols-3)
      expect(heroSectionContent).toContain('grid grid-cols-1 md:grid-cols-3 gap-4');
    });
  });

  describe('Scenario 9.2: Visual Text Presence and Branding Content Verification', () => {
    it('should render exact visual text, subheadline, and list items for AI Visualize button', () => {
      const btn = $('#btn-tab-visualize');
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
      const btn = $('#btn-tab-optimize');
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
      const btn = $('#btn-tab-socialize');
      const text = btn.text();

      expect(text).toContain('AISocialize');
      expect(text).toContain('Go further, ensure your social footprint is Optimized for AI');
      expect(text).toContain('Is your domain AI-ready for social?');
      expect(text).toContain('- llms.txt exists');
      expect(text).toContain('- Has Author Info');
      expect(text).toContain('- Credential mentions');
      expect(text).toContain('- External links(Valid)');
      expect(text).toContain('- Authority links(valid)');
      expect(text).toContain('- LastUpdated');
      expect(text).toContain('Elevate your Social to AI-Ready');

      // Verify in HeroSection.jsx component definition
      expect(heroSectionContent).toContain("label: 'AISocialize'");
      expect(heroSectionContent).toContain("subhead: \"Go further, ensure your social footprint is Optimized for AI\"");
    });
  });

  describe('Scenario 9.3 & 9.4: Active Selection, Visual Accents & Mobile Responsiveness', () => {
    it('should define cyan, amber, and violet brand color styling classes for active states', () => {
      expect(htmlContent).toContain('text-cyan');
      expect(htmlContent).toContain('text-amber');
      expect(htmlContent).toContain('text-violet');

      expect(heroSectionContent).toContain('border-cyan-500/60');
      expect(heroSectionContent).toContain('border-amber-500/60');
      expect(heroSectionContent).toContain('border-violet-500/60');
    });

    it('should display the Chrome Extension requirement notice when AISocialize is active', () => {
      const badge = $('#socialize-extension-badge');
      expect(badge.length).toBe(1);
      expect(badge.text()).toContain('⚡ Chrome Extension Required for Snippet Generation');
      expect(badge.text()).toContain('[Install Extension]');

      expect(heroSectionContent).toContain('Chrome Extension Required for Snippet Generation');
    });
  });
});
