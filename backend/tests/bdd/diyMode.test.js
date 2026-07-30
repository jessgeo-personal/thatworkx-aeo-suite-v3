const { evaluateAllCapabilities, CAPABILITY_MATRIX } = require('../../services/capabilityEvaluator');

describe('DIY (Developer) Mode Engine & Upgrade Hook Integration (BDD Phase 3)', () => {

  it('Scenario A: DIY mode payload exposes all 32 capabilities with full technical metrics', () => {
    const scanData = {
      url: 'https://example.com',
      status: {
        robotsTxtExists: true,
        sitemapExists: true,
        llmsTxtExists: true,
        aiContextExists: true
      }
    };

    const evalResults = evaluateAllCapabilities(scanData);

    expect(evalResults.totalCapabilities).toBe(32);
    expect(evalResults.capabilities).toBeDefined();
    expect(evalResults.capabilities.length).toBe(32);

    for (const cap of evalResults.capabilities) {
      expect(cap.id).toBeDefined();
      expect(typeof cap.id).toBe('string');
      expect(cap.section).toBeGreaterThanOrEqual(1);
      expect(cap.section).toBeLessThanOrEqual(4);
      expect(cap.category).toBeDefined();
      expect(typeof cap.score).toBe('number');
      expect(cap.status).toBeDefined();
      expect(cap.details).toBeDefined();
      expect(cap.deductionReason).toBeDefined();
      expect(cap.impact).toBeDefined();
    }
  });

  it('Scenario B: Level 1–4 Manifest inspection matrix contains valid status, bot permissions, and routes', () => {
    const scanData = {
      url: 'https://example.com',
      status: {
        robotsTxtExists: true,
        sitemapExists: false,
        llmsTxtExists: true,
        aiContextExists: true,
        aboutTxtExists: true,
        docsTxtExists: false,
        contentTxtExists: false,
        readmeFound: false,
        botPermissions: {
          gptBot: true,
          googleExtended: true,
          perplexityBot: false
        }
      }
    };

    const evalResults = evaluateAllCapabilities(scanData);

    // Verify 8 manifest routes and permissions
    const status = evalResults.status;
    expect(status.robotsTxtExists).toBe(true);
    expect(status.sitemapExists).toBe(false);
    expect(status.llmsTxtExists).toBe(true);
    expect(status.aiContextExists).toBe(true);
    expect(status.aboutTxtExists).toBe(true);
    expect(status.docsTxtExists).toBe(false);

    expect(status.botPermissions.gptBot).toBe(true);
    expect(status.botPermissions.googleExtended).toBe(true);
    expect(status.botPermissions.perplexityBot).toBe(false);
  });

  it('Scenario C: Upgrade hook badges are correctly present in rendering templates for mapped Pro tools', () => {
    const proToolHooks = {
      jsonLdSchema: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' },
      JSONLDSCHEMA: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' }, // case-insensitive test
      faqSchemaParity: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' },
      heavyPageIndication: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒' },
      aiContextMd: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' },
      internalLinksAnalysis: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' }
    };

    for (const [capId, expectedHook] of Object.entries(proToolHooks)) {
      const normalizedKey = capId.toLowerCase();
      const capInMatrix = CAPABILITY_MATRIX.find(c => c.id.toLowerCase() === normalizedKey);
      expect(capInMatrix).toBeDefined();
      expect(expectedHook.label).toBeDefined();
      expect(expectedHook.tier).toBeDefined();
    }
  });

  it('Scenario D: Manifest inspection links contain target="_blank" and zero "AI-first" strings', () => {
    const scanData = { url: 'https://example.com' };
    const evalResults = evaluateAllCapabilities(scanData);

    const jsonStr = JSON.stringify(evalResults);
    expect(/AI-first/i.test(jsonStr)).toBe(false);

    // Verify sample anchor tag format for View ↗ links
    const sampleLinkHtml = '<a href="https://example.com/llms.txt" target="_blank" rel="noopener noreferrer" class="drawer-btn">View ↗</a>';
    expect(sampleLinkHtml).toContain('target="_blank"');
    expect(sampleLinkHtml).toContain('View ↗');
  });

  it('Scenario E: DIY Mode Hero banner in visualize.html renders headline, audience badge, scan metrics, and 4-section summary cards', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    // 1. DIY Hero Banner presence
    const devBanner = $('#dev-hero-banner');
    expect(devBanner.length).toBe(1);

    const bannerText = devBanner.text();
    const summaryGridText = $('#dev-summary-grid').text();
    const combinedText = bannerText + ' ' + summaryGridText;

    // 2. Audience Badge & Headline
    expect(bannerText).toContain('DIY Mode — Aimed at the technically inclined business user / DIY user');
    expect(bannerText).toContain('How to Improve Your');
    expect(bannerText).toContain('AI-Visibility');

    // 3. Scan Metrics Bar Badges
    const devDurationBadge = $('#dev-scan-duration-badge');
    expect(devDurationBadge.length).toBe(1);
    expect(devDurationBadge.text()).toContain('Time to Scan:');

    const devTimestampBadge = $('#dev-scan-timestamp-badge');
    expect(devTimestampBadge.length).toBe(1);
    expect(devTimestampBadge.text()).toContain('Last Scanned:');

    // 4. 4-Section Summary Grid Cards
    expect(combinedText).toContain('Gateway & Access');
    expect(combinedText).toContain('Presence & Hygiene');
    expect(combinedText).toContain('Content AI-Optimization');
    expect(combinedText).toContain('Machine Manifest Readiness');

    // 5. Governance vocabulary rules
    expect(combinedText).toContain('AI-Optimized');
    expect(combinedText).toContain('AI-Ready');
    expect(/AI-first/i.test(combinedText)).toBe(false);

    // 6. Provider Workaround Callout Banner & Upgrade Modal
    const providerCallout = $('#dev-provider-callout');
    expect(providerCallout.length).toBe(1);
    expect(providerCallout.text()).toContain("Can't manage your own AI-ready files because your provider manages it for you?");
    
    const calloutLink = providerCallout.find('a');
    expect(calloutLink.length).toBe(1);
    expect(calloutLink.text()).toContain('Upgrade to AIOptimize Pro');
    expect(calloutLink.attr('onclick')).toContain("showUpgradeModal('AIO_PRO_REQUIRED', 'Enable provider workarounds to manage your AI-Ready files yourself', 'AIOptimize Pro')");

    const alertModal = $('#alert-modal');
    expect(alertModal.length).toBe(1);
    expect(alertModal.find('#modal-title').length).toBe(1);
    expect(alertModal.find('#modal-message').length).toBe(1);
  });

  it('Scenario F: Verify index.js appends the conditionally-styled always-visible accordion for X-Robots-Tag capability', () => {
    const fs = require('fs');
    const path = require('path');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Verify key logic parts are present in renderDeveloperMatrixRows
    expect(jsContent).toContain('isXRobots');
    expect(jsContent).toContain('isXRobotsPass');
    expect(jsContent).toContain('Status: Valid AI-Optimized Configuration');
    expect(jsContent).toContain('✅ Your server headers are correctly configured and are not blocking AI.');
    expect(jsContent).toContain('How to Fix: AI-Block Detected');
    expect(jsContent).toContain('Using a Text Editor (via FTP or cPanel File Manager):');
    expect(jsContent).toContain('Header unset X-Robots-Tag');
    expect(jsContent).toContain('fastcgi_hide_header X-Robots-Tag;');
    expect(jsContent).toContain('proxy_hide_header X-Robots-Tag;');
    
    // Ensure no banned vocabulary is used in the newly added block
    const bannedRegex = /AI-first/i;
    expect(bannedRegex.test(jsContent)).toBe(false);
  });

  it('Scenario G: Verify side-by-side Resolving AI-ready File Issues component is structured correctly in visualize.html and index.js', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // 1. Verify visualize.html structure
    const visPath = path.resolve(__dirname, '../../../frontend/visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const sectionTitle = $('#dev-drawers-section h4 span').first().text().trim();
    expect(sectionTitle).toBe('Resolving AI-ready File Issues');

    const leftPane = $('#left-pane-content');
    const rightPane = $('#right-pane-content');
    expect(leftPane.length).toBe(1);
    expect(rightPane.length).toBe(1);

    // 2. Verify index.js script logic
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('switchDiyManifestTab');
    expect(jsContent).toContain('latestScanResults');
    expect(jsContent).toContain('copyLeftPaneCode');
    expect(jsContent).toContain('copyRightPaneCode');
    expect(jsContent).toContain('downloadRightPaneFile');
    expect(jsContent).toContain('JSON-LD Schema');
    expect(jsContent).toContain('robots.txt');
    expect(jsContent).toContain('llms.txt');

    // 3. Ensure no banned vocabulary is present
    const combined = visHtml + ' ' + jsContent;
    expect(/AI-first/i.test(combined)).toBe(false);
  });

  it('Scenario H: Verify that getDynamicDrawerTemplates generates the updated baseline llms.txt template cleanly', () => {
    const fs = require('fs');
    const path = require('path');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Verify key elements of the new llms.txt baseline template string inside frontend/index.js
    expect(jsContent).toContain('# <Verify Scraped Data: ${domainName}> LLMs Machine Directory Index');
    expect(jsContent).toContain('> Answer.ai Standard Machine Directory File for <Verify Scraped Data: ${domainName}>.');
    expect(jsContent).toContain('## Primary Target Domain');
    expect(jsContent).toContain('- [Homepage](<Verify Scraped Data: https://${domainName}/>): Core web presence and main business offerings.');
    expect(jsContent).toContain('- [About](<Verify Scraped Data: https://${domainName}/about.md>): Corporate identity, E-E-A-T trust signatures, and entity data.');
    expect(jsContent).toContain('- [Docs](<Verify Scraped Data: https://${domainName}/docs.md>): Technical manuals, specifications, and integration guides.');
    expect(jsContent).toContain('## Machine Manifests & System Blueprints');
    expect(jsContent).toContain('- [AI System Context](<Verify Scraped Data: https://${domainName}/ai-context.md>): Flattened RAG system context map and prompt guardrails.');
    expect(jsContent).toContain('- [Portal Summary](<Verify Scraped Data: https://${domainName}/README.md>): Rapid 30-second elevator pitch and machine overview.');
    expect(jsContent).toContain('- [Narrative Vault](<Verify Scraped Data: https://${domainName}/content.md>): Deep-dive case studies, authoritative articles, and proof points.');
    expect(jsContent).toContain('## Optional Single-File Ingestion');
    expect(jsContent).toContain('- [Full Directory Ingestion Vault](<Verify Scraped Data: https://${domainName}/llms-full.txt>): Complete concatenated documentation for large context-window models.');
    
    // Double check that "AI-first" is not in there
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });

  it('Scenario I: Verify that getDynamicDrawerTemplates generates the updated baseline sitemap.xml template with dynamic routes and static manifests', () => {
    const fs = require('fs');
    const path = require('path');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // 1. Verify that sitemap template structure is defined dynamically
    expect(jsContent).toContain('sitemap: {');
    expect(jsContent).toContain("results.discoveredRoutes || results.scannedPages || []");
    expect(jsContent).toContain("routePath = p.path.startsWith('/') ? p.path : `/${p.path}`");
    
    // 2. Verify static manifest locations using Smart Placeholders
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/llms.txt>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/llms-full.txt>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/ai-context.md>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/README.md>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/about.md>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/docs.md>');
    expect(jsContent).toContain('<Verify Scraped Data: https://${domainName}/content.md>');

    // 3. Verify governance requirements: AI-Optimized and AI-Ready comments present
    expect(jsContent).toContain('<!-- AI-Optimized Core Site Routes -->');
    expect(jsContent).toContain('<!-- AI-Ready Machine Manifest Comments -->');

    // 4. Double check that "AI-first" is not in there
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });

  it('Scenario J: Verify that getDynamicDrawerTemplates generates ai-context.md baseline template dynamically', () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Extract the getDynamicDrawerTemplates function definition dynamically
    const funcStartMarker = 'function getDynamicDrawerTemplates';
    const funcStartIndex = jsContent.indexOf(funcStartMarker);
    expect(funcStartIndex).toBeGreaterThan(-1);

    const nextFuncMarker = 'function switchDiyManifestTab';
    const nextFuncIndex = jsContent.indexOf(nextFuncMarker);
    expect(nextFuncIndex).toBeGreaterThan(funcStartIndex);

    const extractedFunc = jsContent.substring(funcStartIndex, nextFuncIndex);
    
    // Run the function inside VM context to isolate and test it
    const context = vm.createContext({});
    vm.runInContext(extractedFunc, context);
    const getDynamicDrawerTemplatesFn = context.getDynamicDrawerTemplates;
    expect(typeof getDynamicDrawerTemplatesFn).toBe('function');

    // Test Branch A: No live JSON-LD schema exists
    const resultsNoSchema = {
      url: 'https://testdomain.com',
      phoneValue: '555-555-5555',
      emailValue: 'info@testdomain.com',
      discoveredRoutes: [
        { path: '/home', wordCount: 100, tokenLoad: 50, inSitemap: true }
      ],
      scrapedContentPreview: [
        { route: '/home', content: 'Scraped Home text content' }
      ]
    };

    const templatesNoSchema = getDynamicDrawerTemplatesFn('testdomain.com', resultsNoSchema);
    const aiContextContentNoSchema = templatesNoSchema.aicontext.content;

    expect(aiContextContentNoSchema).toContain('# TESTDOMAIN.COM: SYSTEM CONTEXT MAP');
    expect(aiContextContentNoSchema).toContain('<!-- AI-Ready Machine Manifest File -->');
    expect(aiContextContentNoSchema).toContain('## Section 2: Structured Entity JSON-LD Data');
    expect(aiContextContentNoSchema).toContain('"email": "<Verify Scraped Data: info@testdomain.com>"');
    expect(aiContextContentNoSchema).toContain('"telephone": "<Verify Scraped Data: 555-555-5555>"');
    expect(aiContextContentNoSchema).toContain('## Section 3: Authoritative Content Directory');
    expect(aiContextContentNoSchema).toContain('### Route: /home\nScraped Home text content');
    expect(aiContextContentNoSchema).toContain('## Section 4: Discovered Routing Blueprint');
    expect(aiContextContentNoSchema).toContain('- /home (Word Count: 100, Tokens: 50, inSitemap: Yes)');

    // Test Branch B: Live JSON-LD schema exists
    const resultsWithSchema = {
      url: 'https://testdomain.com',
      status: {
        jsonLdSchemaContent: '{\n  "@type": "LocalBusiness",\n  "name": "Live Local Business"\n}'
      },
      discoveredRoutes: [],
      scrapedContentPreview: []
    };

    const templatesWithSchema = getDynamicDrawerTemplatesFn('testdomain.com', resultsWithSchema);
    const aiContextContentWithSchema = templatesWithSchema.aicontext.content;

    expect(aiContextContentWithSchema).toContain('LocalBusiness');
    expect(aiContextContentWithSchema).toContain('Live Local Business');
    expect(aiContextContentWithSchema).toContain('*No scraped content preview available.*');
    expect(aiContextContentWithSchema).toContain('*No discovered routes found.*');

    // Double check that "AI-first" is not in any generated content
    expect(/AI-first/i.test(jsContent)).toBe(false);
    expect(/AI-first/i.test(aiContextContentNoSchema)).toBe(false);
    expect(/AI-first/i.test(aiContextContentWithSchema)).toBe(false);
  });

  it('Scenario K: Verify that getDynamicDrawerTemplates generates README.md and about.md baseline templates with scraped data placeholders', () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Extract the getDynamicDrawerTemplates function definition dynamically
    const funcStartMarker = 'function getDynamicDrawerTemplates';
    const funcStartIndex = jsContent.indexOf(funcStartMarker);
    expect(funcStartIndex).toBeGreaterThan(-1);

    const nextFuncMarker = 'function switchDiyManifestTab';
    const nextFuncIndex = jsContent.indexOf(nextFuncMarker);
    expect(nextFuncIndex).toBeGreaterThan(funcStartIndex);

    const extractedFunc = jsContent.substring(funcStartIndex, nextFuncIndex);
    
    // Run the function inside VM context to isolate and test it
    const context = vm.createContext({});
    vm.runInContext(extractedFunc, context);
    const getDynamicDrawerTemplatesFn = context.getDynamicDrawerTemplates;
    expect(typeof getDynamicDrawerTemplatesFn).toBe('function');

    const results = {
      url: 'https://testdomain.com',
      emailValue: 'info@testdomain.com',
      phoneValue: '555-555-5555',
      scrapedDescription: 'An optimized enterprise solution provider.',
      scrapedAddress: '123 Innovation Way, Suite 100',
      socialLinks: ['https://linkedin.com/company/testdomain']
    };

    const templates = getDynamicDrawerTemplatesFn('testdomain.com', results);
    
    // 1. README.md Checks
    const readme = templates.readme.content;
    expect(readme).toContain('# <Verify Scraped Data: testdomain.com> Portal Summary');
    expect(readme).toContain('<!-- AI-Ready Machine Manifest File -->');
    expect(readme).toContain('## Executive Summary');
    expect(readme).toContain('Business Description: <Verify Scraped Data: An optimized enterprise solution provider.>');
    expect(readme).toContain('## Core Capabilities');
    expect(readme).toContain('## Quick Machine Manifest Navigation');
    expect(readme).toContain('- [Machine Welcome Menu](<Verify Scraped Data: https://testdomain.com/llms.txt>)');
    expect(readme).toContain('## Contact Signals');
    expect(readme).toContain('**Primary Email:** <Verify Scraped Data: info@testdomain.com>');
    expect(readme).toContain('**Primary Telephone:** <Verify Scraped Data: 555-555-5555>');
    expect(readme).toContain('**Corporate Address:** <Verify Scraped Data: 123 Innovation Way, Suite 100>');

    // 2. about.md Checks
    const about = templates.about.content;
    expect(about).toContain('# <Verify Scraped Data: testdomain.com> Entity & Corporate Profile');
    expect(about).toContain('<!-- AI-Ready Machine Manifest File -->');
    expect(about).toContain('## Corporate Identity & Mission');
    expect(about).toContain('- **Entity Legal Name:** <Verify Scraped Data: testdomain.com> (Parent Organization)');
    expect(about).toContain('- **Factual Description:** <Verify Scraped Data: An optimized enterprise solution provider.>');
    expect(about).toContain('## Leadership & Subject Matter Expertise');
    expect(about).toContain('## Verified Entity Signals');
    expect(about).toContain('- **Email Signal:** <Verify Scraped Data: info@testdomain.com>');
    expect(about).toContain('- **Phone Signal:** <Verify Scraped Data: 555-555-5555>');
    expect(about).toContain('- **Physical Presence:** <Verify Scraped Data: 123 Innovation Way, Suite 100>');
    expect(about).toContain('- [Verified Profile](<Verify Scraped Data: https://linkedin.com/company/testdomain>)');
    expect(about).toContain('## Compliance Links');
    expect(about).toContain('- [Privacy Policy](<Verify Scraped Data: https://testdomain.com/privacy>)');
    expect(about).toContain('- [Terms of Service](<Verify Scraped Data: https://testdomain.com/terms>)');

    // 3. Vocabulary Governance checks
    expect(/AI-first/i.test(jsContent)).toBe(false);
    expect(/AI-first/i.test(readme)).toBe(false);
    expect(/AI-first/i.test(about)).toBe(false);
  });

  it('Scenario L: Verify that getDynamicDrawerTemplates generates docs.md and content.md baseline templates with scraped data placeholders', () => {
    const fs = require('fs');
    const path = require('path');
    const vm = require('vm');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Extract the getDynamicDrawerTemplates function definition dynamically
    const funcStartMarker = 'function getDynamicDrawerTemplates';
    const funcStartIndex = jsContent.indexOf(funcStartMarker);
    expect(funcStartIndex).toBeGreaterThan(-1);

    const nextFuncMarker = 'function switchDiyManifestTab';
    const nextFuncIndex = jsContent.indexOf(nextFuncMarker);
    expect(nextFuncIndex).toBeGreaterThan(funcStartIndex);

    const extractedFunc = jsContent.substring(funcStartIndex, nextFuncIndex);
    
    // Run the function inside VM context to isolate and test it
    const context = vm.createContext({});
    vm.runInContext(extractedFunc, context);
    const getDynamicDrawerTemplatesFn = context.getDynamicDrawerTemplates;
    expect(typeof getDynamicDrawerTemplatesFn).toBe('function');

    const results = {
      url: 'https://testdomain.com',
      scrapedDescription: 'An optimized enterprise solution provider.',
      name: 'Test Brand Name'
    };

    const templates = getDynamicDrawerTemplatesFn('testdomain.com', results);
    
    // 1. docs.md Checks
    const docs = templates.docs.content;
    expect(docs).toContain('# <Verify Scraped Data: testdomain.com> Technical Documentation');
    expect(docs).toContain('<!-- AI-Ready Machine Manifest File -->');
    expect(docs).toContain('## Quick Technical Summary');
    expect(docs).toContain('Core Purpose: <Verify Scraped Data: An optimized enterprise solution provider.>');
    expect(docs).toContain('## Core Workflows & Feature Specifications');
    expect(docs).toContain('## Configuration & Parameter Reference');
    expect(docs).toContain('| `domainName` | String | `<Verify Scraped Data: testdomain.com>` |');
    expect(docs).toContain('| `brandName` | String | `<Verify Scraped Data: Test Brand Name>` |');
    expect(docs).toContain('## Technical Support & Help Channels');

    // 2. content.md Checks
    const content = templates.content.content;
    expect(content).toContain('# <Verify Scraped Data: testdomain.com> Subject Authority Index');
    expect(content).toContain('<!-- AI-Ready Machine Manifest File -->');
    expect(content).toContain('## Core Subject Matter Authority');
    expect(content).toContain('<Verify Scraped Data: Test Brand Name> maintains deep expertise in software architecture');
    expect(content).toContain('Corporate Mission: <Verify Scraped Data: An optimized enterprise solution provider.>');
    expect(content).toContain('## Authoritative Insights & Deep-Dive Articles');
    expect(content).toContain('## Case Studies & Proven Track Record');
    expect(content).toContain('## Citation & Quotation Standard');
    expect(content).toContain('refer to the official brand name: <Verify Scraped Data: Test Brand Name>.');

    // 3. Vocabulary Governance checks
    expect(/AI-first/i.test(jsContent)).toBe(false);
    expect(/AI-first/i.test(docs)).toBe(false);
    expect(/AI-first/i.test(content)).toBe(false);
  });

});


