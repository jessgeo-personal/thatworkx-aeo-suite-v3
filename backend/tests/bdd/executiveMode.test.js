const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');
const { evaluateCapabilities } = require('../../services/capabilityEvaluator');

describe('Executive Mode Rendering Engine & Undefined Mapping (BDD Phase 2 & Exec View V1)', () => {

  const hasNoUndefinedOrNull = (obj, path = '') => {
    if (obj === null || obj === undefined) {
      throw new Error(`Property at path "${path}" is ${obj}`);
    }
    if (typeof obj === 'object') {
      for (const key of Object.keys(obj)) {
        hasNoUndefinedOrNull(obj[key], path ? `${path}.${key}` : key);
      }
    }
  };

  it('Scenario A: No property in the returned executive payload is undefined or null', () => {
    const scanProfiles = [
      {
        url: 'https://example.com',
        status: {
          robotsTxtExists: true,
          xRobotsIndexable: true,
          sitemapExists: true,
          llmsTxtExists: true,
          aiContextExists: true,
          aboutTxtExists: true,
          docsTxtExists: true,
          seoOptimalTitle: true,
          seoOptimalDesc: true,
          hasProperHierarchy: true,
          spaTrapDetected: false,
          wordCount: 1200
        }
      },
      {
        url: 'https://imperfectdomain.com',
        status: {
          robotsTxtExists: true,
          xRobotsIndexable: true,
          sitemapExists: false,
          llmsTxtExists: false,
          aiContextExists: false,
          aboutTxtExists: false,
          docsTxtExists: false,
          seoOptimalTitle: false,
          seoOptimalDesc: false,
          hasProperHierarchy: false,
          spaTrapDetected: true,
          wordCount: 300
        }
      }
    ];

    for (const profile of scanProfiles) {
      const evaluation = evaluateCapabilities(profile);
      
      // Verify executiveSections payload properties
      expect(evaluation.executiveSections).toBeDefined();
      expect(evaluation.executiveSections.section1).toBeDefined();
      expect(evaluation.executiveSections.section2).toBeDefined();
      expect(evaluation.executiveSections.section3).toBeDefined();
      expect(evaluation.executiveSections.section4).toBeDefined();

      // Deep scan for undefined or null values across evaluation payload
      expect(() => hasNoUndefinedOrNull(evaluation)).not.toThrow();
    }
  });

  it('Scenario B: The 4 Section cards contain valid deductionReason strings when scores are < 25', () => {
    const scanDataWithDeductions = {
      url: 'https://partialdomain.com',
      status: {
        robotsTxtExists: true,
        xRobotsIndexable: true,
        botPermissions: { gptBot: false, perplexityBot: true, claudeBot: true, googleExtended: true },
        sitemapExists: false, // Section 2 deduction
        llmsTxtExists: false, // Section 4 deduction
        aiContextExists: false, // Section 4 deduction
        seoOptimalTitle: false, // Section 3 deduction
        hasProperHierarchy: false // Section 3 deduction
      }
    };

    const evaluation = evaluateCapabilities(scanDataWithDeductions);
    const { section1, section2, section3, section4 } = evaluation.executiveSections;

    // Verify card titles match Executive Inquiry Cards specification
    expect(section1.title).toBe('Can AI see your website?');
    expect(section2.title).toBe('What can AI see?');
    expect(section3.title).toBe('Does AI trust your web presence?');
    expect(section4.title).toBe('Is your website AI-Ready?');

    // Section 2 deduction check
    expect(section2.score).toBeLessThan(25);
    expect(section2.deductionReason).toBeDefined();
    expect(typeof section2.deductionReason).toBe('string');
    expect(section2.deductionReason).toContain('Missing /sitemap.xml');
    expect(section2.deductionReason).not.toContain('undefined');
    expect(Array.isArray(section2.deductions)).toBe(true);
    expect(section2.deductions.length).toBeGreaterThan(0);

    // Section 3 deduction check
    expect(section3.score).toBeLessThan(25);
    expect(section3.deductionReason).toBeDefined();
    expect(typeof section3.deductionReason).toBe('string');
    expect(section3.deductionReason).not.toContain('undefined');
    expect(section3.deductionReason).not.toContain('undefined');
    expect(Array.isArray(section3.deductions)).toBe(true);
    expect(section3.deductions.length).toBeGreaterThan(0);

    // Section 4 deduction check
    expect(section4.score).toBeLessThan(25);
    expect(section4.deductionReason).toBeDefined();
    expect(typeof section4.deductionReason).toBe('string');
    expect(section4.deductionReason).toContain('Missing /llms.txt');
    expect(section4.deductionReason).not.toContain('undefined');
    expect(Array.isArray(section4.deductions)).toBe(true);
    expect(section4.deductions.length).toBeGreaterThan(0);

    // When score is 25/25, deductionReason must be "🟢 No deductions — All protocols clean."
    const perfectScan = {
      url: 'https://perfectdomain.com',
      status: {
        robotsTxtExists: true,
        xRobotsIndexable: true,
        botPermissions: { gptBot: true, perplexityBot: true, claudeBot: true, googleExtended: true },
        sitemapExists: true,
        llmsTxtExists: true,
        aiContextExists: true,
        aboutTxtExists: true,
        docsTxtExists: true,
        seoOptimalTitle: true,
        seoOptimalDesc: true,
        hasProperHierarchy: true,
        spaTrapDetected: false,
        wordCount: 1200
      }
    };
    const perfectEval = evaluateCapabilities(perfectScan);
    expect(perfectEval.executiveSections.section1.score).toBe(25);
    expect(perfectEval.executiveSections.section1.deductionReason).toBe('🟢 No deductions — All protocols clean.');
  });

  it('Scenario C: Zero occurrences of "AI-first" in generated HTML or JSON strings', () => {
    const evaluation = evaluateCapabilities({
      url: 'https://example.com',
      status: { robotsTxtExists: true, sitemapExists: true }
    });

    const jsonString = JSON.stringify(evaluation);
    const containsAiFirst = /AI-first/i.test(jsonString);

    expect(containsAiFirst).toBe(false);
  });

  it('Scenario D: Executive mode payload contains scanMetrics and scanTimeSeconds', () => {
    const evaluation = evaluateCapabilities({
      url: 'https://example.com',
      scanMetrics: { scanTimeSeconds: 1.85, lastScanned: '2026-07-29T12:00:00Z' }
    });

    expect(evaluation.scanMetrics).toBeDefined();
    expect(typeof evaluation.scanMetrics.scanTimeSeconds).toBe('number');
    expect(evaluation.scanMetrics.scanTimeSeconds).toBe(1.85);
    expect(typeof evaluation.scanMetrics.lastScanned).toBe('string');
  });

  it('Scenario E: Executive Mode view template (visualize.html) renders scan duration and compact context strip with onboarding modal', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Scan duration element presence
    const durationBadge = $('#scan-duration-badge');
    expect(durationBadge.length).toBe(1);
    expect(durationBadge.text()).toContain('Time to Scan:');

    // 2. Executive Welcome Banner presence and compact context strip
    const welcomeBanner = $('#exec-welcome-banner');
    expect(welcomeBanner.length).toBe(1);

    const bannerText = welcomeBanner.text();
    expect(bannerText).toContain('Analyse how AI Visualizes your brand');
    expect(bannerText).toContain('human-friendly web presence');

    // 3. Onboarding modal presence and detailed copy
    const onboardingModal = $('#exec-onboarding-modal');
    expect(onboardingModal.length).toBe(1);

    const modalText = onboardingModal.text();
    expect(modalText).toContain('Understanding AI Sourcing Methods');
    expect(modalText).toContain('Human-Centric Web Presence (AI-Optimized)');
    expect(modalText).toContain('Machine-Friendly Web Presence (AI-Ready)');

    // Zero AI-first check in visualize.html banner & modal
    expect(/AI-first/i.test(bannerText)).toBe(false);
    expect(/AI-first/i.test(modalText)).toBe(false);
  });

  it('Scenario F: Executive Mode Section 2 (Presence & Hygiene) UI refactoring assertions', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Title & Subheading
    const card = $('#exec-section2-card');
    expect(card.length).toBe(1);
    
    const cardTitle = $('#exec-section2-card h4');
    expect(cardTitle.text()).toContain('Section 2 (AI-Optimized): Can AI cite you in their answers?');
    
    const subheading = $('#exec-section2-card p');
    expect(subheading.text()).toContain('Audits DOM cleanliness, content density, and essential business page visibility.');

    // 2. Scraped Webpage Code Box (Removed)
    const sectionHtml = $('#exec-section2-card').html();
    expect(sectionHtml).not.toContain('ai-bot readable content from actual website');
    
    const contentBox = $('#sec2-scraped-content-box');
    expect(contentBox.length).toBe(0);

    // 3. Essential Pages Sub-block
    const foundList = $('#sec2-found-essential-pages');
    const missingList = $('#sec2-missing-essential-pages');
    expect(foundList.length).toBe(1);
    expect(missingList.length).toBe(1);

    // 4. Citation signal rows
    const signalsBlock = $('#citation-signals-rows');
    expect(signalsBlock.length).toBe(1);
    
    expect(sectionHtml).toContain('FAQ Structured Markup');
    expect(sectionHtml).toContain('Answer/Question parity');
    expect(sectionHtml).toContain('Organization Entity Markup');
    expect(sectionHtml).toContain('emailValue');
    expect(sectionHtml).toContain('phoneValue');

    // 5. Zero occurrences of "AI-first" string
    const sectionText = $('#exec-section2-card').text();
    expect(/AI-first/i.test(sectionText)).toBe(false);
  });

  it('Scenario G: Executive Mode scrapedContentPreview payload contains line breaks and Markdown syntax when HTML is parsed', () => {
    const profile = {
      url: 'https://example.com',
      scrapedContentPreview: [
        {
          route: '/',
          content: '<h1>Main Title</h1><p>Welcome to our site.</p><ul><li>First Item</li></ul>'
        }
      ]
    };

    const evaluation = evaluateCapabilities(profile);
    const preview = evaluation.scrapedContentPreview;

    expect(Array.isArray(preview)).toBe(true);
    expect(preview.length).toBe(1);
    expect(preview[0].route).toBe('/');
    
    const parsedText = preview[0].content;
    
    expect(parsedText).toContain('# Main Title');
    expect(parsedText).toContain('\n');
    expect(parsedText).toContain('- First Item');
  });

  it('Scenario H: Executive Mode scrapedContentPreview integration with crawled page html', () => {
    const scanData = {
      url: 'https://example.com',
      pages: [
        {
          route: '/',
          html: '<h1>Main Page Title</h1><p>We build outstanding solutions.</p><ul><li>Feature one</li></ul>'
        }
      ]
    };

    const evaluation = evaluateCapabilities(scanData);
    const preview = evaluation.scrapedContentPreview;

    expect(Array.isArray(preview)).toBe(true);
    expect(preview.length).toBe(1);
    expect(preview[0].route).toBe('/');
    
    const parsedText = preview[0].content;
    expect(parsedText).toContain('# Main Page Title');
    expect(parsedText).toContain('\n');
    expect(parsedText).toContain('- Feature one');
  });

  it('Scenario I: Discovered webpages table renders inside Section 1 container and has correct headers and rows', () => {
    // 1. Check static template structure in visualize.html
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const sec1Card = $('#exec-section1-card');
    expect(sec1Card.length).toBe(1);

    // Verify Section 1 Header and protocol elements exist
    const header = sec1Card.find('h4');
    expect(header.text()).toContain('Section 1 (AI-Optimized): Can AI see your website?');

    const xRobotsRow = sec1Card.find('span:contains("Is your server blocking AI?")');
    expect(xRobotsRow.length).toBeGreaterThan(0);
    expect(sec1Card.find('#exec-x-robots-status').length).toBe(1);
    const xRobotsTooltip = sec1Card.find('span.help-tooltip-trigger[onclick*="openHelpTooltip(\'exec_x_robots\')"]');
    expect(xRobotsTooltip.length).toBe(1);

    const robotsTxtRow = sec1Card.find('span:contains("Is your hosting provider blocking AI?")');
    expect(robotsTxtRow.length).toBeGreaterThan(0);
    expect(sec1Card.find('#exec-robots-txt-status').length).toBe(1);
    const robotsTxtTooltip = sec1Card.find('span.help-tooltip-trigger[onclick*="openHelpTooltip(\'exec_robots_txt\')"]');
    expect(robotsTxtTooltip.length).toBe(1);

    const sitemapRow = sec1Card.find('span:contains("Does your site have a machine-readable sitemap?")');
    expect(sitemapRow.length).toBeGreaterThan(0);
    expect(sec1Card.find('#exec-status-sitemap').length).toBe(1);
    const sitemapTooltip = sec1Card.find('span.help-tooltip-trigger[onclick*="openHelpTooltip(\'exec_sitemap\')"]');
    expect(sitemapTooltip.length).toBe(1);

    // Verify table block is removed inside section 1 card
    const table = sec1Card.find('table.exec-table');
    expect(table.length).toBe(0);

    // 2. Check capabilityEvaluator discoveredRoutes calculation & validation
    const mockScan = {
      url: 'https://example.com',
      discoveredRoutes: [
        {
          path: '/test-route',
          wordCount: 300,
          tokenLoad: 150,
          hiddenFromAi: false,
          inSitemap: true,
          isEssential: false,
          missingStatus: 'Active',
          actionUrl: 'https://example.com/test-route'
        }
      ]
    };
    const evaluation = evaluateCapabilities(mockScan);
    expect(evaluation.discoveredRoutes).toBeDefined();
    expect(evaluation.discoveredRoutes.length).toBe(1);
    
    const r = evaluation.discoveredRoutes[0];
    expect(r.path).toBe('/test-route');
    expect(r.wordCount).toBe(300);
    expect(r.tokenLoad).toBe(150);
    expect(r.hiddenFromAi).toBe(false);
    expect(r.inSitemap).toBe(true);
    expect(r.isEssential).toBe(false);
    expect(r.missingStatus).toBe('Active');

    // 3. Verify zero occurrences of legacy phrase "AI-first" in section HTML and scenario
    expect(/AI-first/i.test(sec1Card.html() || '')).toBe(false);
  });

  it('Scenario J: Executive Mode Section 3 (Content AI-Optimization & Trust) UI refactoring assertions', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Container presence & headers
    const card = $('#exec-section3-card');
    expect(card.length).toBe(1);

    const cardTitle = $('#exec-section3-card h4');
    expect(cardTitle.text()).toContain('Section 3 (AI-Optimized): Can AI trust who you are?');
    expect(cardTitle.attr('onclick')).toContain("openHelpTooltip('sec3_overview')");

    const subheading = $('#exec-section3-card p');
    expect(subheading.text()).toContain('Evaluates domain history, SSL certificate parameters, and citation signals.');

    // 2. Badges and signal rows checks
    expect($('#sec3-secure-status').length).toBe(1);
    expect($('#sec3-contact-status').length).toBe(1);
    expect($('#sec3-privacy-status').length).toBe(1);
    expect($('#sec3-age-estimate').length).toBe(1);
    expect($('#sec3-authority-status').length).toBe(1);
    expect($('#sec3-diagnostic-summary').length).toBe(1);

    // 3. Tooltip button mapping check
    const sectionHtml = card.html() || '';
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('ssl-security'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('contact-info'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('privacy-policy'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('age-estimate'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('authority-status'");

    // 4. Zero occurrences of legacy phrase "AI-first"
    expect(/AI-first/i.test(card.html() || '')).toBe(false);
  });

  it('Scenario K: Executive Mode Section 4 (Machine Friendliness) UI refactoring assertions', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Container presence & headers
    const card = $('#exec-section4-card');
    expect(card.length).toBe(1);

    const cardTitle = card.find('h4');
    expect(cardTitle.text().trim()).toContain('Section 4: Is your brand blueprint AI-ready?');

    const subheading = card.find('p');
    expect(subheading.text().trim()).toContain('Verifies structure, content parity, and syntax formats of your machine-readable files.');

    // 2. Tree container and title presence (accordion details/summary removed)
    const details = card.find('details');
    expect(details.length).toBe(0);

    const treeContainer = card.find('div:contains("The 4-level file hierarchy for AI-Readiness")');
    expect(treeContainer.length).toBeGreaterThan(0);

    // 3. Spans for the tree
    expect($('#exec-status-robots').length).toBe(1);
    expect($('#exec-status-llms').length).toBe(1);
    expect($('#exec-status-sitemap-tree').length).toBe(1);
    expect($('#exec-status-aicontext').length).toBe(1);
    expect($('#exec-status-readme').length).toBe(1);
    expect($('#exec-status-about').length).toBe(1);
    expect($('#exec-status-docs').length).toBe(1);
    expect($('#exec-status-content').length).toBe(1);

    // 4. Zero occurrences of legacy phrase "AI-first"
    expect(/AI-first/i.test(card.html() || '')).toBe(false);
  });

  it('Scenario L: Verification of Section 4 business-friendly help tooltips', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const card = $('#exec-section4-card');
    
    // Check that each of the 8 file names has a corresponding trigger button/span
    const expectedMappings = {
      'manifest_robots': 'robots.txt',
      'manifest_llms': 'llms.txt',
      'manifest_sitemap': 'sitemap.xml',
      'manifest_aicontext': 'ai-context.md',
      'manifest_readme': 'README.md',
      'manifest_about': 'about.md',
      'manifest_docs': 'docs.md',
      'manifest_content': 'content.md'
    };

    for (const [key, fileName] of Object.entries(expectedMappings)) {
      const button = card.find(`button.info-help-btn[onclick*="${key}"]`);
      expect(button.length).toBe(1);
      expect(button.text()).toBe('(?)');
    }
  });

  it('Scenario M: Verification of dictionary copy in index.js', () => {
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Ensure the keys are present in index.js and match the expected copy patterns
    const expectedKeys = [
      'manifest_robots',
      'manifest_llms',
      'manifest_sitemap',
      'manifest_aicontext',
      'manifest_readme',
      'manifest_about',
      'manifest_docs',
      'manifest_content'
    ];

    for (const key of expectedKeys) {
      expect(jsContent).toContain(key);
    }

    // Ensure zero occurrences of "AI-first" in index.js
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });

  it('Scenario N: Executive Mode Section 1 Pillar Card contains an accordion with 4 protocol check labels and updates on live scan', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // a) & b) & c) Verify visualize.html structure
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const pillar1Card = $('#pillar-sec1-title').closest('.pillar-card');
    expect(pillar1Card.length).toBe(1);

    const accordion = pillar1Card.find('#pillar-sec1-accordion');
    expect(accordion.length).toBe(1);
    expect(accordion.is('details')).toBe(true);

    const summary = accordion.find('summary');
    expect(summary.length).toBe(1);
    expect(summary.text().trim()).toContain('AI-Optimized human-centric protocol gate checks');

    const checklist = accordion.find('#pillar-sec1-checklist');
    expect(checklist.length).toBe(1);
    expect(checklist.is('ul')).toBe(true);

    const items = checklist.find('li');
    expect(items.length).toBe(4);

    const expectedLabels = [
      'CDN / Edge Firewall Blocks',
      'Server Crawlability Flags',
      'robots.txt useragents Disallow',
      'robots.txt ai-bots Disallow'
    ];
    expectedLabels.forEach((label, idx) => {
      expect($(items[idx]).text().trim()).toContain(label);
    });

    // d) Verify index.js updates the pass/fail indicators on scan
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('pillar-sec1-checklist');
    expect(jsContent).toContain('isCdnPass');
    expect(jsContent).toContain('isXRobotsPass');
    expect(jsContent).toContain('isUseragentsPass');
    expect(jsContent).toContain('isAiBotsPass');
    expect(jsContent).toContain('getStatusIndicator(');
  });

  it('Scenario O: Executive Mode Section 2 Pillar Card contains an accordion with 4 protocol check labels and updates on live scan', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // a) & b) & c) Verify visualize.html structure
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const pillar2Card = $('#pillar-sec2-title').closest('.pillar-card');
    expect(pillar2Card.length).toBe(1);

    const accordion = pillar2Card.find('#pillar-sec2-accordion');
    expect(accordion.length).toBe(1);
    expect(accordion.is('details')).toBe(true);

    const summary = accordion.find('summary');
    expect(summary.length).toBe(1);
    expect(summary.text().trim()).toContain('AI-Optimized web structure & hydration hygiene');

    const checklist = accordion.find('#pillar-sec2-checklist');
    expect(checklist.length).toBe(1);
    expect(checklist.is('ul')).toBe(true);

    const items = checklist.find('li');
    expect(items.length).toBe(4);

    const expectedLabels = [
      'HTTPS Security Encryption',
      'SPA Hydration Trap & Density Ratio',
      'RAG Offset: /llms.txt & /ai-context.md',
      'Essential Entity Nodes Discovered'
    ];
    expectedLabels.forEach((label, idx) => {
      expect($(items[idx]).text().trim()).toContain(label);
    });

    // d) Verify index.js updates the pass/fail indicators on scan
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('pillar-sec2-checklist');
    expect(jsContent).toContain('isSecurePass');
    expect(jsContent).toContain('isSpaPass');
    expect(jsContent).toContain('isRagPass');
    expect(jsContent).toContain('isEntityPass');
    expect(jsContent).toContain('getStatusIndicator(');
  });

  it('Scenario P: Executive Mode Section 3 Pillar Card contains an accordion with 4 protocol check labels and updates on live scan', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // a) & b) & c) Verify visualize.html structure
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const pillar3Card = $('#pillar-sec3-title').closest('.pillar-card');
    expect(pillar3Card.length).toBe(1);

    const accordion = pillar3Card.find('#pillar-sec3-accordion');
    expect(accordion.length).toBe(1);
    expect(accordion.is('details')).toBe(true);

    const summary = accordion.find('summary');
    expect(summary.length).toBe(1);
    expect(summary.text().trim()).toContain('AI-Optimized page-level readability & trust');

    const checklist = accordion.find('#pillar-sec3-checklist');
    expect(checklist.length).toBe(1);
    expect(checklist.is('ul')).toBe(true);

    const items = checklist.find('li');
    expect(items.length).toBe(4);

    const expectedLabels = [
      'Title & Meta Desc Sweet Spots',
      'Token Load Status & Flesch Score',
      'Ans/Ques Parity Ratio',
      'Page-Level E-E-A-T Diagnostics'
    ];
    expectedLabels.forEach((label, idx) => {
      expect($(items[idx]).text().trim()).toContain(label);
    });

    // d) Verify index.js updates the pass/fail indicators on scan
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('pillar-sec3-checklist');
    expect(jsContent).toContain('isSeoPass');
    expect(jsContent).toContain('isTokenPass');
    expect(jsContent).toContain('isParityPass');
    expect(jsContent).toContain('isEeatPass');
    expect(jsContent).toContain('getStatusIndicator(');
  });

  it('Scenario Q: Executive Mode Section 4 Pillar Card contains an accordion with 4 protocol check labels and updates on live scan', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // a) & b) & c) Verify visualize.html structure
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const pillar4Card = $('#pillar-sec4-title').closest('.pillar-card');
    expect(pillar4Card.length).toBe(1);

    const accordion = pillar4Card.find('#pillar-sec4-accordion');
    expect(accordion.length).toBe(1);
    expect(accordion.is('details')).toBe(true);

    const summary = accordion.find('summary');
    expect(summary.length).toBe(1);
    expect(summary.text().trim()).toContain('AI-Ready Level 1–4 manifest hierarchy');

    const checklist = accordion.find('#pillar-sec4-checklist');
    expect(checklist.length).toBe(1);
    expect(checklist.is('ul')).toBe(true);

    const items = checklist.find('li');
    expect(items.length).toBe(4);

    const expectedLabels = [
      'Level 1 Gate: robots.txt',
      'Level 2 Welcome Mats: /llms.txt & sitemap.xml',
      'Level 3 Blueprint: /ai-context.md',
      'Level 4 Workspaces: /README.md, about, docs, content'
    ];
    expectedLabels.forEach((label, idx) => {
      expect($(items[idx]).text().trim()).toContain(label);
    });

    // d) Verify index.js updates the pass/fail indicators on scan
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('pillar-sec4-checklist');
    expect(jsContent).toContain('isL1Pass');
    expect(jsContent).toContain('isL2Pass');
    expect(jsContent).toContain('isL3Pass');
    expect(jsContent).toContain('isL4Pass');
    expect(jsContent).toContain('getStatusIndicator(');
  });

  it('Scenario R: Executive Mode Pillars 1-4 title size is 1.05rem and accordions have open attribute and indentation styling', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const targetSections = [1, 2, 3, 4];
    targetSections.forEach(sec => {
      const title = $(`#pillar-sec${sec}-title`);
      expect(title.length).toBe(1);
      const titleStyle = title.attr('style') || '';
      expect(titleStyle).toContain('font-size: 1.05rem');
      expect(titleStyle).toContain('font-weight: 800');

      const accordion = $(`#pillar-sec${sec}-accordion`);
      expect(accordion.length).toBe(1);
      expect(accordion.attr('open')).toBeDefined();
      
      const accordionStyle = accordion.attr('style') || '';
      expect(accordionStyle).toContain('margin-top: 0.85rem');
      expect(accordionStyle).toContain('margin-left: 0.75rem');
      expect(accordionStyle).toContain('padding-left: 0.5rem');
      expect(accordionStyle).toContain('border-left: 2px solid rgba(255,255,255,0.08)');
    });
  });

  it('Scenario S: Top scan metric bars contain #scan-pages-badge displaying "Pages Reviewed: X" on update', () => {
    const fs = require('fs');
    const path = require('path');
    const { JSDOM } = require('jsdom');

    const htmlPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    const dom = new JSDOM(htmlContent, {
      runScripts: 'dangerously',
      resources: 'usable',
      url: 'http://localhost/visualize.html'
    });
    const { window } = dom;
    const { document } = window;

    // Define standard globals needed by index.js
    window.API_BASE = 'http://localhost:5000';
    
    // Evaluate index.js
    try {
      window.eval(jsContent);
    } catch (err) {
      // ignore
    }

    // Dispatch DOMContentLoaded
    const domLoadedEvent = new window.Event('DOMContentLoaded', {
      bubbles: true,
      cancelable: true
    });
    document.dispatchEvent(domLoadedEvent);

    // Mock scan results with 8 pages
    const mockResults = {
      url: 'https://example.com',
      pages: Array.from({ length: 8 }, (_, i) => ({
        route: `/page-${i + 1}`,
        wordCount: 300,
        status: 200
      }))
    };

    // Verify updateExecutiveViewData exists
    expect(typeof window.updateExecutiveViewData).toBe('function');

    // Run updateExecutiveViewData
    window.updateExecutiveViewData(mockResults);

    // Assert executive scan metric bar badge is present
    const execPagesBadge = document.getElementById('scan-pages-badge');
    expect(execPagesBadge).not.toBeNull();
    expect(execPagesBadge.textContent).toBe('Pages Reviewed: 8');
  });

  it('Scenario O: Verify sleek Visualize header redesign with 4 action buttons, removed legacy hero copy, and 4 metadata pills', () => {
    const fs = require('fs');
    const path = require('path');
    const { JSDOM } = require('jsdom');

    const htmlPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const htmlContent = fs.readFileSync(htmlPath, 'utf8');

    const dom = new JSDOM(htmlContent);
    const { document } = dom.window;

    // 1. Verify legacy headline & description copy is removed
    const bodyText = document.body.textContent;
    expect(bodyText).not.toContain('Measure AI Visibility & Auditable Readiness');
    expect(bodyText).not.toContain('Discover how search engines and LLM web scrapers perceive');

    // 2. Verify existence of the 4 Top Action Buttons
    const btnNewScan = document.getElementById('btn-new-scan');
    expect(btnNewScan).not.toBeNull();
    expect(btnNewScan.textContent).toContain('New Scan');

    const btnRefresh = document.getElementById('btn-refresh-analysis');
    expect(btnRefresh).not.toBeNull();
    expect(btnRefresh.textContent).toContain('Refresh Analysis');

    const btnExportJson = document.getElementById('btn-export-json');
    expect(btnExportJson).not.toBeNull();

    const btnExportPdf = document.getElementById('btn-export-pdf');
    expect(btnExportPdf).not.toBeNull();

    // 3. Verify presence of the 4 metadata badges inside the capsule bar
    const displayDomain = document.getElementById('display-scanned-domain');
    expect(displayDomain).not.toBeNull();

    const scanTimestamp = document.getElementById('scan-timestamp-badge');
    expect(scanTimestamp).not.toBeNull();

    const scanDuration = document.getElementById('scan-duration-badge');
    expect(scanDuration).not.toBeNull();

    const scanPages = document.getElementById('scan-pages-badge');
    expect(scanPages).not.toBeNull();
  });

  it('Scenario P: Verify Executive Mode badge reordering, enlarged primary buttons, and export buttons nested in metadata bubble bar', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Check DOM order: #exec-welcome-banner appears BEFORE the control hero card ("AI VISUALIZE • EXECUTIVE DIAGNOSTIC SUITE")
    const htmlText = $('body').html();
    const idxWelcomeBanner = htmlText.indexOf('id="exec-welcome-banner"');
    const idxControlHero = htmlText.indexOf('class="aivisualize-header-logo"');

    expect(idxWelcomeBanner).toBeGreaterThan(-1);
    expect(idxControlHero).toBeGreaterThan(-1);
    expect(idxWelcomeBanner).toBeLessThan(idxControlHero);

    // 2. Check export buttons are outside .visualize-meta-bubble
    const metaBubble = $('.visualize-meta-bubble');
    expect(metaBubble.length).toBe(1);

    const btnExportJsonInBubble = metaBubble.find('#btn-export-json');
    expect(btnExportJsonInBubble.length).toBe(0);

    const btnExportPdfInBubble = metaBubble.find('#btn-export-pdf');
    expect(btnExportPdfInBubble.length).toBe(0);

    // 3. Check they are contained in a right-aligned wrapper
    const exportWrapper = $('.export-btn-container');
    expect(exportWrapper.length).toBe(1);

    const btnExportJson = exportWrapper.find('#btn-export-json');
    expect(btnExportJson.length).toBe(1);

    const btnExportPdf = exportWrapper.find('#btn-export-pdf');
    expect(btnExportPdf.length).toBe(1);

    // 4. Primary buttons must remain large
    const btnNewScan = $('#btn-new-scan');
    expect(btnNewScan.length).toBe(1);
    expect(btnNewScan.hasClass('btn-large')).toBe(true);

    const btnRefresh = $('#btn-refresh-analysis');
    expect(btnRefresh.length).toBe(1);
    expect(btnRefresh.hasClass('btn-large')).toBe(true);
  });

});

