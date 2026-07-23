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

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.5: AIVisualize Dual View Mode Switcher Pill (Milestone 1)', () => {
    it('should render Executive Mode and Developer/DIY Mode switcher buttons in panel-visualize', () => {
      const execBtn = $('#btn-mode-executive');
      const devBtn  = $('#btn-mode-developer');

      expect(execBtn.length).toBe(1);
      expect(devBtn.length).toBe(1);
      expect(execBtn.text()).toContain('Executive Mode');
      expect(devBtn.text()).toContain('Developer / DIY Mode');
    });

    it('should set Executive Mode as the default active state', () => {
      const execBtn = $('#btn-mode-executive');
      const panel   = $('#panel-visualize');

      expect(execBtn.hasClass('active')).toBe(true);
      expect(execBtn.attr('aria-selected')).toBe('true');
      expect(panel.attr('data-visualize-mode')).toBe('executive');
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  describe('Scenario 9.6: AIVisualize Executive Mode UI & Perception Simulator (Milestone 3)', () => {
    it('should render Executive Score Dial (0-100) and top Action CTAs', () => {
      const scoreVal = $('#exec-score-val');
      const statusBadge = $('#exec-status-badge');
      expect(scoreVal.length).toBe(1);
      expect(statusBadge.text()).toContain('AI-READY');
    });

    it('should render Side-by-Side Visual Perception Engine Simulator comparing Human vs Machine viewports', () => {
      const simContainer = $('.perception-simulator-container');
      const humanWin = $('.human-window');
      const machineWin = $('.machine-window');

      expect(simContainer.length).toBe(1);
      expect(humanWin.text()).toContain('What Humans See');
      expect(machineWin.text()).toContain('What ChatGPT & Perplexity Read');
    });

    it('should render 4 Strategic Health Pillar cards', () => {
      const pillars = $('.strategic-pillars-grid .pillar-card');
      expect(pillars.length).toBe(4);
    });

    it('should render Executive Route Table and Scanned AI-Ready Machine Files Table with AIOptimize bridge CTAs', () => {
      const table = $('.executive-route-table-card');
      const routeRows = $('#exec-route-tbody tr');
      const aiFileRows = $('#exec-ai-files-tbody tr');

      expect(table.length).toBe(6); // 2 Exec tables + 4 Dev tables
      expect(routeRows.length).toBeGreaterThanOrEqual(4);
      expect(aiFileRows.length).toBe(7);
    });
  });

  describe('Scenario 9.7: AIVisualize Developer / DIY Mode UI (Milestone 4)', () => {
    it('should render 32-Capability Granular Diagnostic Matrix with section filter tabs', () => {
      const devMatrixSection = $('#dev-matrix-section');
      const filterTabs = $('.matrix-tab-btn');

      expect(devMatrixSection.length).toBe(1);
      expect(filterTabs.length).toBe(5); // All, Sec 1, Sec 2, Sec 3, Sec 4
      expect(devMatrixSection.text()).toContain('32-Capability Granular Diagnostic Matrix');
    });

    it('should render Machine File Code Inspection Drawers with Copy and Download buttons', () => {
      const drawersSection = $('#dev-drawers-section');
      const drawerTabs = $('.drawer-file-tabs .drawer-tab-btn');
      const codeBar = $('.drawer-code-bar');

      expect(drawersSection.length).toBe(1);
      expect(drawerTabs.length).toBe(8); // llms, aicontext, robots, sitemap, readme, about, docs, content
      expect(codeBar.text()).toContain('Copy Code');
      expect(codeBar.text()).toContain('Download File');
    });

    it('should render Edge Network & WAF Deployment Sandbox with Cloudflare, Shopify, and Crowdstrike tabs', () => {
      const edgeSection = $('#dev-edge-section');
      const edgeTabs = $('.edge-tab-btn');

      expect(edgeSection.length).toBe(1);
      expect(edgeTabs.length).toBe(3); // Cloudflare, Shopify, Crowdstrike
      expect(edgeSection.text()).toContain('Edge Network & WAF Deployment Sandbox');
    });

    it('should render Expandable Scanned Routes Directory with [▶] row expanders', () => {
      const devRoutesSection = $('#dev-expandable-routes-section');
      const tableHeader = $('.dev-expandable-table th');

      expect(devRoutesSection.length).toBe(1);
      expect(tableHeader.length).toBe(7);
      expect(devRoutesSection.text()).toContain('Scanned Routes Directory');
    });
  });
});
