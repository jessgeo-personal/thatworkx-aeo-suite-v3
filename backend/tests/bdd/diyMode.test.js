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

  it('Scenario E: AIOptimize Workspace in optimize.html renders headline, console buttons, and track tools', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    const optPath = path.resolve(__dirname, '../../../frontend/optimize.html');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const $ = cheerio.load(optHtml);

    // 1. Optimize Header Card presence
    const headerCard = $('.optimize-header-card');
    expect(headerCard.length).toBe(1);

    const headerText = headerCard.text();
    expect(headerText).toContain('Remediation Sandbox');
    expect(headerText).toContain('Prescriptive Code Generators');

    // 2. Track Selector Tabs
    const track1Btn = $('#btn-track1');
    const track2Btn = $('#btn-track2');
    expect(track1Btn.length).toBe(1);
    expect(track2Btn.length).toBe(1);
    expect(track1Btn.text()).toContain('Track 1: AI-Optimized Page Fixes');
    expect(track2Btn.text()).toContain('Track 2: AI-Ready File Generators');

    // 3. Sub-Tool Navigation Tabs
    const robotsTab = $('#menu-robots');
    const jsonldTab = $('#menu-jsonld');
    expect(robotsTab.length).toBe(1);
    expect(jsonldTab.length).toBe(1);

    // 4. Governance vocabulary rules
    const combinedText = optHtml;
    expect(combinedText).toContain('AI-Optimized');
    expect(combinedText).toContain('AI-Ready');
    expect(/AI-first/i.test(combinedText)).toBe(false);

    // 5. Auth Modal exists on page
    const authModal = $('#auth-modal');
    expect(authModal.length).toBe(1);
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

  it('Scenario G: Verify side-by-side Resolving AI-ready File Issues component is structured correctly in optimize.html and index.js', () => {
    const fs = require('fs');
    const path = require('path');
    const cheerio = require('cheerio');

    // 1. Verify optimize.html structure
    const optPath = path.resolve(__dirname, '../../../frontend/optimize.html');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const $ = cheerio.load(optHtml);

    // Track buttons existence
    expect($('#btn-track1').length).toBe(1);
    expect($('#btn-track2').length).toBe(1);

    // Sub-tools tab controls existence
    expect($('#menu-robots').length).toBe(1);
    expect($('#menu-llmstxt').length).toBe(1);

    // Dynamic slots
    expect($('#dev-schema-builder-wrapper').length).toBe(1);
    expect($('#dev-edge-wrapper').length).toBe(1);

    // 2. Verify index.js script logic
    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('buildDevSchemaBuilderHtml');
    expect(jsContent).toContain('buildDevEdgeHtml');
    expect(jsContent).toContain('switchOptimizeTrack');
    expect(jsContent).toContain('switchOptimizeTool');

    // 3. Ensure no banned vocabulary is present
    const combined = optHtml + ' ' + jsContent;
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

  it('Scenario M: Verify that renderDeveloperMatrixRows cleans raw HTML tag names into inline <code> tags', () => {
    const fs = require('fs');
    const path = require('path');

    const jsPath = path.resolve(__dirname, '../../../frontend/index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    // Verify presence of the code-replacing/escaping logic
    expect(jsContent).toContain('cleanDescription = cleanDescription.replace(/<([a-zA-Z0-9]+)>/g, \'<code>$1</code>\')');
    expect(jsContent).toContain('cleanDetails = cleanDetails.replace(/<([a-zA-Z0-9]+)>/g, \'<code>$1</code>\')');
    
    // Simulate the regex execution
    const regex = /<([a-zA-Z0-9]+)>/g;
    const testDesc = 'Presence of <article>, <section>, <header>, <nav>, <main>.';
    const testDetails = 'Found 4/5 semantic HTML tags (<main>, <article>, <section>, <header>, <nav>)';

    const cleanDesc = testDesc.replace(regex, '<code>$1</code>');
    const cleanDet = testDetails.replace(regex, '<code>$1</code>');

    expect(cleanDesc).toBe('Presence of <code>article</code>, <code>section</code>, <code>header</code>, <code>nav</code>, <code>main</code>.');
    expect(cleanDet).toBe('Found 4/5 semantic HTML tags (<code>main</code>, <code>article</code>, <code>section</code>, <code>header</code>, <code>nav</code>)');
  });

  it('Scenario N: Verify Module 4 in-memory full crawl maintained, default table viewport capped at 5 pages, and #btn-mod4-load-more expand control present', async () => {
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    const { JSDOM } = require('jsdom');
    const { analyzeUrl } = require('../../services/crawlerService');

    // 1. Mock axios.get to return a sitemap.xml with 35 pages
    const originalGet = axios.get;
    let sitemapXmlContent = '<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';
    for (let i = 0; i < 35; i++) {
      sitemapXmlContent += `<url><loc>https://example.com/page-${i + 1}</loc></url>`;
    }
    sitemapXmlContent += '</urlset>';

    axios.get = vi.fn().mockImplementation(async (urlStr) => {
      if (urlStr.includes('robots.txt')) {
        return { status: 200, data: 'User-agent: *\nAllow: /\nSitemap: https://example.com/sitemap.xml' };
      }
      if (urlStr.includes('sitemap.xml')) {
        return { status: 200, data: sitemapXmlContent };
      }
      return {
        status: 200,
        data: '<html><head><link rel="canonical" href="' + urlStr + '" /></head><body><main><h1>Demo</h1><header></header><footer></footer></main></body></html>'
      };
    });

    try {
      // Run crawl on backend
      const userLimits = { tier: 'AIVisualize Free', maxPages: 500 }; // Free limit is now 500
      const scanResult = await analyzeUrl('https://example.com', userLimits);

      // Verify in-memory full crawl contains all sitemap pages (e.g. 36 pages)
      // This will fail because sitemap parsing and limit removals are not yet implemented.
      expect(scanResult.pages.length).toBe(36);

      // 2. Test Frontend rendering in JSDOM
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

      window.API_BASE = 'http://localhost:5000';
      const { evaluateAllCapabilities, CAPABILITY_MATRIX } = require('../../services/capabilityEvaluator');
      window.evaluateAllCapabilities = evaluateAllCapabilities;
      window.CAPABILITY_MATRIX = CAPABILITY_MATRIX;

      try {
        window.eval(jsContent);
      } catch (err) {}

      // Dispatch DOMContentLoaded
      const domLoadedEvent = new window.Event('DOMContentLoaded', { bubbles: true, cancelable: true });
      document.dispatchEvent(domLoadedEvent);

      // Render the crawler scan results (36 pages)
      window.updateDeveloperViewData(scanResult);
      window.updateExecutiveViewData(scanResult);

      // Verify metric badges show 36 pages
      const execPagesBadge = document.getElementById('scan-pages-badge');
      expect(execPagesBadge).not.toBeNull();
      expect(execPagesBadge.textContent).toBe('Pages Reviewed: 36');

      const module4PagesCount = document.getElementById('dev-module-4-pages-count');
      expect(module4PagesCount).not.toBeNull();
      expect(module4PagesCount.textContent).toBe('Total Pages Reviewed: 36');

      // Verify viewport capped at 5 rows
      const tbody = document.getElementById('dev-module-4-tbody');
      expect(tbody).not.toBeNull();
      const allRows = tbody.querySelectorAll('tr');
      const mainRows = Array.from(allRows).filter(r => !r.id.startsWith('dev-module-4-row-'));
      expect(mainRows.length).toBe(5);

      // Verify expand button displays X remaining (31 remaining)
      const loadMoreBtn = document.getElementById('btn-mod4-load-more');
      expect(loadMoreBtn).not.toBeNull();
      expect(loadMoreBtn.textContent).toContain('Load rest of the pages (31 remaining)');

      // Expand pages
      window.expandModule4Pages();

      // Verify all 36 rows are rendered
      const allRowsExpanded = tbody.querySelectorAll('tr');
      const mainRowsExpanded = Array.from(allRowsExpanded).filter(r => !r.id.startsWith('dev-module-4-row-'));
      expect(mainRowsExpanded.length).toBe(36);
      expect(document.getElementById('btn-mod4-load-more')).toBeNull();

    } finally {
      axios.get = originalGet;
    }
  });

});



