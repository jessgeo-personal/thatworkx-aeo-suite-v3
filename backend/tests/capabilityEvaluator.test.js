const { CAPABILITY_MATRIX, evaluateCapabilities, evaluateAllCapabilities } = require('../services/capabilityEvaluator.js');

describe('AIVisualize 32-Capability Evaluation Engine (Milestone 2 & Exec View Payload)', () => {
  it('should contain exactly 32 distinct capabilities in the capability matrix', () => {
    expect(CAPABILITY_MATRIX.length).toBe(32);
  });

  it('should categorize capabilities correctly into Sections 1, 2, 3, and 4', () => {
    const sec1 = CAPABILITY_MATRIX.filter(c => c.section === 1);
    const sec2 = CAPABILITY_MATRIX.filter(c => c.section === 2);
    const sec3 = CAPABILITY_MATRIX.filter(c => c.section === 3);
    const sec4 = CAPABILITY_MATRIX.filter(c => c.section === 4);

    expect(sec1.length).toBe(3);  // Gateway & Access Control (3)
    expect(sec2.length).toBe(7);  // Presence & Hygiene (7)
    expect(sec3.length).toBe(10); // Content AI-Optimization (10)
    expect(sec4.length).toBe(12); // Machine Manifest Readiness (12) -> Total: 32
  });

  it('should evaluate default scan data and return 32 capability results with overall and section scores', () => {
    const results = evaluateAllCapabilities({});
    expect(results.totalCapabilities).toBe(32);
    expect(results.capabilities.length).toBe(32);
    expect(typeof results.totalScore).toBe('number');
    expect(results.totalScore).toBeGreaterThanOrEqual(0);
    expect(results.totalScore).toBeLessThanOrEqual(100);

    expect(results.sectionScores).toHaveProperty('section1');
    expect(results.sectionScores).toHaveProperty('section2');
    expect(results.sectionScores).toHaveProperty('section3');
    expect(results.sectionScores).toHaveProperty('section4');
  });

  it('should accurately evaluate CDN firewall block in Section 1', () => {
    const blockedRes = evaluateAllCapabilities({ sec1: { cdnBlocked: true } });
    const cap = blockedRes.capabilities.find(c => c.id === 'cdnFirewallBlocking');
    expect(cap.status).toBe('critical');
    expect(cap.score).toBe(0);
  });

  it('should accurately evaluate 1:1 FAQ Q&A parity ratio in Section 3', () => {
    const res = evaluateAllCapabilities({ sec3: { faqQuestions: 4, faqAnswers: 4, hasFaqSchema: true } });
    const cap = res.capabilities.find(c => c.id === 'faqSchemaParity');
    expect(cap.status).toBe('active');
    expect(cap.details).toContain('Parity Ratio: 1:1.0');
  });

  it('should return valid non-null Executive View extension payload structures', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      scanMetrics: { scanTimeSeconds: 2.1, lastScanned: '2026-07-29T10:00:00Z' },
      scrapedContentPreview: 'Example Scraped Landing Text',
      manifestPreviews: { aiContext: 'AI Context Spec Text', about: 'About Spec Text' },
      discoveredRoutes: [
        { path: '/', wordCount: 250, tokenLoad: 325, hiddenFromAi: false, inSitemap: true, isEssential: true, missingStatus: 'Active', actionUrl: 'https://example.com/' }
      ],
      eeatMetrics: {
        isSecure: true,
        hasContactInfo: true,
        hasPrivacyPolicy: true,
        ageEstimate: '3 years 2 months',
        authorityStatus: 'Optimized Anchor',
        diagnosticSummary: 'Strong E-E-A-T trust signals detected.'
      }
    });

    // 1. scanMetrics
    expect(res).toHaveProperty('scanMetrics');
    expect(typeof res.scanMetrics.scanTimeSeconds).toBe('number');
    expect(typeof res.scanMetrics.lastScanned).toBe('string');
    expect(res.scanMetrics.scanTimeSeconds).toBe(2.1);
    expect(res.scanMetrics.lastScanned).toBe('2026-07-29T10:00:00Z');

    // 2. scrapedContentPreview
    expect(res).toHaveProperty('scrapedContentPreview');
    expect(Array.isArray(res.scrapedContentPreview)).toBe(true);
    expect(res.scrapedContentPreview).toEqual([
      { route: '/', content: 'Example Scraped Landing Text' }
    ]);

    // 3. manifestPreviews
    expect(res).toHaveProperty('manifestPreviews');
    expect(typeof res.manifestPreviews.aiContext).toBe('string');
    expect(typeof res.manifestPreviews.about).toBe('string');
    expect(res.manifestPreviews.aiContext).toBe('AI Context Spec Text');
    expect(res.manifestPreviews.about).toBe('About Spec Text');

    // 4. discoveredRoutes
    expect(res).toHaveProperty('discoveredRoutes');
    expect(Array.isArray(res.discoveredRoutes)).toBe(true);
    expect(res.discoveredRoutes.length).toBeGreaterThan(0);
    const route = res.discoveredRoutes[0];
    expect(route).toHaveProperty('path');
    expect(route).toHaveProperty('wordCount');
    expect(route).toHaveProperty('tokenLoad');
    expect(route).toHaveProperty('hiddenFromAi');
    expect(route).toHaveProperty('inSitemap');
    expect(route).toHaveProperty('isEssential');
    expect(route).toHaveProperty('missingStatus');
    expect(route).toHaveProperty('actionUrl');
    expect(route).toHaveProperty('canonicalTag');
    expect(route).toHaveProperty('headingHierarchy');
    expect(route).toHaveProperty('isMobileFriendly');
    expect(route).toHaveProperty('hasSemanticTags');
    expect(route).toHaveProperty('imagesWithoutAlt');
    expect(route).toHaveProperty('lastUpdated');
    expect(typeof route.canonicalTag).toBe('boolean');
    expect(typeof route.headingHierarchy).toBe('boolean');
    expect(typeof route.isMobileFriendly).toBe('boolean');
    expect(typeof route.hasSemanticTags).toBe('boolean');
    expect(typeof route.imagesWithoutAlt).toBe('number');
    expect(typeof route.lastUpdated).toBe('string');

    // 5. eeatMetrics
    expect(res).toHaveProperty('eeatMetrics');
    expect(typeof res.eeatMetrics.isSecure).toBe('boolean');
    expect(typeof res.eeatMetrics.hasContactInfo).toBe('boolean');
    expect(typeof res.eeatMetrics.hasPrivacyPolicy).toBe('boolean');
    expect(typeof res.eeatMetrics.ageEstimate).toBe('string');
    expect(['Optimized Anchor', 'Information Isolation', 'Abstention Risk', 'Requires Ahrefs/Moz API']).toContain(res.eeatMetrics.authorityStatus);
    expect(typeof res.eeatMetrics.diagnosticSummary).toBe('string');
  });

  it('should return valid non-null Executive View extension payloads for default empty input', () => {
    const res = evaluateAllCapabilities({});
    expect(res.scanMetrics).not.toBeNull();
    expect(res.scanMetrics.scanTimeSeconds).toBeNull();
    expect(typeof res.scanMetrics.lastScanned).toBe('string');

    expect(Array.isArray(res.scrapedContentPreview)).toBe(true);
    expect(res.scrapedContentPreview.length).toBeGreaterThan(0);
    expect(res.scrapedContentPreview[0]).toHaveProperty('route');
    expect(res.scrapedContentPreview[0]).toHaveProperty('content');

    expect(res.manifestPreviews).not.toBeNull();
    expect(typeof res.manifestPreviews.aiContext).toBe('string');
    expect(typeof res.manifestPreviews.about).toBe('string');

    expect(Array.isArray(res.discoveredRoutes)).toBe(true);
    expect(res.discoveredRoutes.length).toBe(0);

    expect(res.eeatMetrics).not.toBeNull();
    expect(typeof res.eeatMetrics.isSecure).toBe('boolean');
    expect(typeof res.eeatMetrics.hasContactInfo).toBe('boolean');
    expect(typeof res.eeatMetrics.hasPrivacyPolicy).toBe('boolean');
    expect(typeof res.eeatMetrics.ageEstimate).toBe('string');
    expect(['Optimized Anchor', 'Information Isolation', 'Abstention Risk', 'Requires Ahrefs/Moz API']).toContain(res.eeatMetrics.authorityStatus);
    expect(typeof res.eeatMetrics.diagnosticSummary).toBe('string');

    expect(res).toHaveProperty('emailValue');
    expect(typeof res.emailValue).toBe('string');
    expect(res).toHaveProperty('phoneValue');
    expect(typeof res.phoneValue).toBe('string');
    expect(res).toHaveProperty('missingEssentialPages');
    expect(Array.isArray(res.missingEssentialPages)).toBe(true);
  });

  it('should support Section 2 extensions: email/phone extraction, missing essential pages, and HTML stripping in page-split scraped content', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      scrapedContentPreview: [
        { route: '/about', content: '<p>Contact us at info@example.com or call 1-800-555-0199 for help.</p>' },
        { route: '/contact', content: '<div>Our headquarters is in California.</div>' }
      ],
      discoveredRoutes: [
        { path: '/' },
        { path: '/about' }
      ]
    });

    // 1. scrapedContentPreview formatting & tag stripping
    expect(Array.isArray(res.scrapedContentPreview)).toBe(true);
    expect(res.scrapedContentPreview).toEqual([
      { route: '/about', content: 'Contact us at info@example.com or call 1-800-555-0199 for help.' },
      { route: '/contact', content: 'Our headquarters is in California.' }
    ]);

    // 2. Contact extraction via regex
    expect(res.emailValue).toBe('info@example.com');
    expect(res.phoneValue).toBe('1-800-555-0199');

    // 3. Missing essential pages logic: '/about' is in discoveredRoutes, so only '/contact', '/pricing', '/privacy-policy', and '/terms-of-service' are missing.
    expect(Array.isArray(res.missingEssentialPages)).toBe(true);
    expect(res.missingEssentialPages).toEqual(['/contact', '/pricing', '/privacy-policy', '/terms-of-service']);
  });

  it('should fallback to default contact values when they are not present', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      scrapedContentPreview: 'No contact information here.',
      discoveredRoutes: [
        { path: '/' },
        { path: '/about' },
        { path: '/contact' },
        { path: '/pricing' },
        { path: '/privacy-policy' },
        { path: '/terms-of-service' }
      ]
    });

    expect(res.emailValue).toBe('None Detected');
    expect(res.phoneValue).toBe('None Detected');
    expect(res.missingEssentialPages).toEqual([]);
  });

  it('should prioritize explicit emailValue and phoneValue properties', () => {
    const res = evaluateAllCapabilities({
      email: 'explicit@domain.com',
      phoneValue: '+1-555-999-8888',
      scrapedContentPreview: 'Check out info@fallback.com or 555-111-2222'
    });

    expect(res.emailValue).toBe('explicit@domain.com');
    expect(res.phoneValue).toBe('+1-555-999-8888');
  });

  it('should parse structural HTML tags to Markdown and line breaks in scrapedContentPreview', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      scrapedContentPreview: [
        {
          route: '/details',
          content: '<h1>Main Header</h1><p>Paragraph text here.</p><br/><ul><li>Item One</li><li>Item Two</li></ul>'
        }
      ]
    });

    const parsedContent = res.scrapedContentPreview[0].content;
    
    expect(parsedContent).toContain('# Main Header');
    expect(parsedContent).toContain('\n');
    expect(parsedContent).toContain('- Item One');
    expect(parsedContent).toContain('- Item Two');
  });

  it('should verify and refine Executive Section 3 (E-E-A-T & Trust Metrics) Backend Payload and mapping to executiveSections[2]', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      eeatMetrics: {
        isSecure: true,
        hasContactInfo: true,
        hasPrivacyPolicy: true,
        ageEstimate: '2 years 8 months',
        authorityStatus: 'Optimized Anchor',
        diagnosticSummary: 'Dynamic summary explaining the trust rating.'
      }
    });

    // 1. Validate eeatMetrics in main payload
    expect(res.eeatMetrics).toBeDefined();
    expect(res.eeatMetrics.isSecure).toBe(true);
    expect(res.eeatMetrics.hasContactInfo).toBe(true);
    expect(res.eeatMetrics.hasPrivacyPolicy).toBe(true);
    expect(res.eeatMetrics.ageEstimate).toBe('2 years 8 months');
    expect(res.eeatMetrics.authorityStatus).toBe('Optimized Anchor');
    expect(res.eeatMetrics.diagnosticSummary).toBe('Dynamic summary explaining the trust rating.');

    // 2. Validate executiveSections mapping for Section 3 (index 2)
    expect(res.executiveSections).toBeDefined();
    expect(res.executiveSections.section3).toBeDefined();
    expect(res.executiveSections[2]).toBeDefined();
    expect(res.executiveSections[2]).toBe(res.executiveSections.section3);

    const section3 = res.executiveSections[2];
    expect(section3.category).toBe('Content AI-Optimization & Trust');
    expect(section3.isSecure).toBe(true);
    expect(section3.hasContactInfo).toBe(true);
    expect(section3.hasPrivacyPolicy).toBe(true);
    expect(section3.ageEstimate).toBe('2 years 8 months');
    expect(section3.authorityStatus).toBe('Optimized Anchor');
    expect(section3.diagnosticSummary).toBe('Dynamic summary explaining the trust rating.');

    expect(section3.eeatMetrics).toBeDefined();
    expect(section3.eeatMetrics.isSecure).toBe(true);
    expect(section3.eeatMetrics.hasContactInfo).toBe(true);
    expect(section3.eeatMetrics.hasPrivacyPolicy).toBe(true);
    expect(section3.eeatMetrics.ageEstimate).toBe('2 years 8 months');
    expect(section3.eeatMetrics.authorityStatus).toBe('Optimized Anchor');
    expect(section3.eeatMetrics.diagnosticSummary).toBe('Dynamic summary explaining the trust rating.');

    // 3. Adhere to governance rules: 0 "AI-first" strings
    const jsonStr = JSON.stringify(res);
    expect(jsonStr).not.toContain('AI-first');
    expect(jsonStr).not.toContain('ai-first');
  });
});

describe('Canonical 6-Stage Diagnostic Pipeline Contract (BDD-TDD Red Phase)', () => {
  const sampleCrawlPayload = {
    url: 'https://example.com',
    status: {
      botPermissions: {
        'GPTBot': 'Allowed',
        'ClaudeBot': 'Allowed',
        'PerplexityBot': 'Allowed',
        'Google-Extended': 'Allowed',
        'Applebot-Extended': 'Allowed'
      },
      isWafBlocked: false,
      robotsTxtExists: true,
      sitemapExists: true,
      llmsTxtExists: true,
      aiContextExists: true,
      aboutTxtExists: true,
      docsTxtExists: true,
      contentTxtExists: true,
      jsonLdExists: true,
      jsonLdTypes: ['Organization', 'WebSite'],
      seoOptimalTitle: true,
      seoOptimalDesc: true,
      hasProperHierarchy: true,
      wordCount: 1500
    },
    discoveredRoutes: [
      { path: '/', wordCount: 500, textDensityRatio: 0.35, isCrawled: true, is404: false, statusCode: 200 },
      { path: '/about', wordCount: 300, textDensityRatio: 0.28, isCrawled: true, is404: false, statusCode: 200 },
      { path: '/contact', wordCount: 200, textDensityRatio: 0.20, isCrawled: true, is404: false, statusCode: 200 },
      { path: '/privacy-policy', wordCount: 450, textDensityRatio: 0.40, isCrawled: true, is404: false, statusCode: 200 },
      { path: '/terms-of-service', wordCount: 600, textDensityRatio: 0.42, isCrawled: true, is404: false, statusCode: 200 }
    ],
    pages: [
      { url: 'https://example.com/', wordCount: 500, textRatio: 35, isCrawled: true, is404: false, statusCode: 200 },
      { url: 'https://example.com/about', wordCount: 300, textRatio: 28, isCrawled: true, is404: false, statusCode: 200 },
      { url: 'https://example.com/contact', wordCount: 200, textRatio: 20, isCrawled: true, is404: false, statusCode: 200 },
      { url: 'https://example.com/privacy-policy', wordCount: 450, textRatio: 40, isCrawled: true, is404: false, statusCode: 200 },
      { url: 'https://example.com/terms-of-service', wordCount: 600, textRatio: 42, isCrawled: true, is404: false, statusCode: 200 }
    ],
    eeatMetrics: {
      isSecure: true,
      hasContactInfo: true,
      hasPrivacyPolicy: true,
      hasAuthorBio: true,
      hasOrgSchema: true,
      authorityStatus: 'Optimized Anchor'
    },
    sec1: { blocked: false },
    sec2: { isHttps: true, essentialPagesFound: 4 },
    sec3: { hasContactInfo: true, hasPrivacyPolicy: true, seoOptimalTitle: true, seoOptimalDesc: true, hasProperHierarchy: true, wordCount: 1500, fleschScore: 70 },
    sec4: {
      robotsTxtFound: true,
      sitemapFound: true,
      llmsTxtFound: true,
      aiContextFound: true,
      aboutMdFound: true,
      docsMdFound: true,
      contentMdFound: true
    }
  };

  it('1. Contract Schema & Property Existence: evaluateCapabilities and evaluateAllCapabilities return stages with stage1..stage6', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    expect(res).toHaveProperty('stages');
    expect(res.stages).toHaveProperty('stage1');
    expect(res.stages).toHaveProperty('stage2');
    expect(res.stages).toHaveProperty('stage3');
    expect(res.stages).toHaveProperty('stage4');
    expect(res.stages).toHaveProperty('stage5');
    expect(res.stages).toHaveProperty('stage6');

    const wrapperRes = evaluateAllCapabilities(sampleCrawlPayload);
    expect(wrapperRes).toHaveProperty('stages');
    expect(wrapperRes.stages).toHaveProperty('stage1');
    expect(wrapperRes.stages).toHaveProperty('stage6');
  });

  it('2. Stage 1 (Bot Blocks & Gateway): computes allowedCount, totalCount, score string, status, and summaryText from botPermissions', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage1 = res.stages.stage1;
    expect(stage1.allowedCount).toBe(5);
    expect(stage1.totalCount).toBe(5);
    expect(stage1.score).toBe('100%');
    expect(stage1.status).toBe('PASS');
    expect(stage1.summaryText).toBe('Bot Access: 5/5 Verified Unblocked');
  });

  it('3. Stage 2 (Essential Content Anchors): evaluates 5-anchor matrix, calculates score, status, and dynamic missing summaryText', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage2 = res.stages.stage2;
    expect(stage2.foundCount).toBe(4);
    expect(stage2.missingCount).toBe(1);
    expect(stage2.score).toBe('80%');
    expect(stage2.status).toBe('WARN');
    expect(stage2.summaryText).toContain('Essential Pages: 4 Found, 1 Missing (/pricing)');
  });

  it('4. Stage 3 (Content Availability & Density): computes non-hardcoded score based on high extractability threshold and valid pages', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage3 = res.stages.stage3;
    expect(stage3.totalValidPages).toBe(5);
    expect(stage3.highExtractabilityCount).toBe(4);
    expect(stage3.score).toBe('80%');
    expect(stage3.score).not.toBe('85%');
    expect(stage3.status).toBe('PASS');
    expect(stage3.summaryText).toBe('Citation Readability: 4/5 High Extractability');
  });

  it('5. Stage 4 (Trust & E-E-A-T): evaluates trust metrics, returns score, PASS/WARN status, and summaryText', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage4 = res.stages.stage4;
    expect(typeof stage4.score).toBe('string');
    expect(stage4.score.endsWith('%')).toBe(true);
    expect(['PASS', 'WARN']).toContain(stage4.status);
    expect(stage4.summaryText).toBeDefined();
  });

  it('6. Stage 5 (Machine Manifest Protocols): enforces governanceGate "AI-Ready", tracks 4-level machine hierarchy, computes score & status', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage5 = res.stages.stage5;
    expect(stage5.governanceGate).toBe('AI-Ready');
    expect(stage5.manifestsFound).toBe(7);
    expect(stage5.totalManifests).toBe(7);
    expect(stage5.score).toBe('100%');
    expect(stage5.status).toBe('PASS');
  });

  it('7. Stage 6 (Executive Boardroom & Action Triage): healthIndex equals overallScore, status categorized, human/machine readiness exposed', () => {
    const res = evaluateCapabilities(sampleCrawlPayload);
    const stage6 = res.stages.stage6;
    expect(stage6.healthIndex).toBe(res.overallScore);
    expect(stage6.score).toBe(`${res.overallScore}%`);
    const expectedStatus = res.overallScore >= 80 ? 'OPTIMIZED' : (res.overallScore >= 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL');
    expect(stage6.status).toBe(expectedStatus);
    expect(typeof stage6.humanWebReadiness).toBe('number');
    expect(typeof stage6.machineWebReadiness).toBe('number');
  });

  it('8. Empty / Un-scanned State: resolves all stages to safe neutral values without mock strings or fallbacks', () => {
    const res = evaluateCapabilities({});
    expect(res).toHaveProperty('stages');
    const { stage1, stage2, stage3, stage4, stage5, stage6 } = res.stages;
    expect(stage1.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL']).toContain(stage1.status);
    expect(stage2.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL']).toContain(stage2.status);
    expect(stage3.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL']).toContain(stage3.status);
    expect(stage4.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL']).toContain(stage4.status);
    expect(stage5.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL']).toContain(stage5.status);
    expect(stage6.score).toBe('0%');
    expect(['UNAUDITED', 'FAIL', 'CRITICAL']).toContain(stage6.status);

    const jsonStr = JSON.stringify(res.stages);
    expect(jsonStr).not.toContain('Mock');
    expect(jsonStr).not.toContain('AI-first');
  });
});

