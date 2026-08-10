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

  it('Scenario E: Executive Mode view template (visualize.html) renders scan duration and 2-method business intro copy', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Scan duration element presence
    const durationBadge = $('#scan-duration-badge');
    expect(durationBadge.length).toBe(1);
    expect(durationBadge.text()).toContain('Time to Scan:');

    // 2. Executive Welcome Banner presence and exact copy
    const welcomeBanner = $('#exec-welcome-banner');
    expect(welcomeBanner.length).toBe(1);

    const bannerText = welcomeBanner.text();
    expect(bannerText).toContain('Let us show you what AI can See');
    expect(bannerText).toContain('Welcome to Executive Mode — aimed at the business user');
    expect(bannerText).toContain('AI uses 2 methods to source content from your web presence');
    expect(bannerText).toContain('1. Your existing human-centric web presence');
    expect(bannerText).toContain('AI-Optimized');
    expect(bannerText).toContain('2. Your complimentary Machine-friendly web presence');
    expect(bannerText).toContain('Done correctly, your web presence could become AI-Ready');
    expect(bannerText).toContain('Take a look at how your web presence is helping your brand be visible to AI engines');

    // Zero AI-first check in visualize.html banner
    expect(/AI-first/i.test(bannerText)).toBe(false);
  });

  it('Scenario F: Executive Mode Section 2 (Presence & Hygiene) UI refactoring assertions', () => {
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. Title & Subheading
    const card = $('#exec-section2-card');
    expect(card.length).toBe(1);
    
    const cardTitle = $('#exec-section2-card h4');
    expect(cardTitle.text()).toContain('2. What can AI see on your website');
    
    const subheading = $('#exec-section2-card p');
    expect(subheading.text()).toContain('take a look and see if the brand message that AI sees matches');

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
    
    expect(sectionHtml).toContain('HasFAQSchema');
    expect(sectionHtml).toContain('Answer/Question parity');
    expect(sectionHtml).toContain('HasOrganizationSchema');
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
    expect(header.text()).toContain('1. Can AI see your website?');

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
    expect(cardTitle.text()).toContain('3. Does AI trust your web presence (?)');
    expect(cardTitle.attr('onclick')).toContain("openHelpTooltip('sec3_overview')");

    const subheading = $('#exec-section3-card p');
    expect(subheading.text()).toContain('Learn how Generative AI engines value EEAT');

    // 2. Badges and signal rows checks
    expect($('#sec3-secure-status').length).toBe(1);
    expect($('#sec3-contact-status').length).toBe(1);
    expect($('#sec3-privacy-status').length).toBe(1);
    expect($('#sec3-age-estimate').length).toBe(1);
    expect($('#sec3-authority-status').length).toBe(1);
    expect($('#sec3-diagnostic-summary').length).toBe(1);

    // 3. Tooltip button mapping check
    const sectionHtml = card.html() || '';
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('isSecure'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('hasContactInfo'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('hasPrivacyPolicy'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('ageEstimate'");
    expect(sectionHtml).toContain("onclick=\"openHelpTooltip('authorityStatus'");

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
    expect(subheading.text().trim()).toContain('Want to offer AI your content in a form thats easy for it to ingest, utilize and cite? Maintain these machine manifest files.');

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
      'X-Robots-Tag Headers',
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
      'isSecure Protocol Check',
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

});
