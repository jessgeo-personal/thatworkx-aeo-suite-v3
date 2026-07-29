const { CAPABILITY_MATRIX, evaluateAllCapabilities } = require('../services/capabilityEvaluator.js');

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

    // 5. eeatMetrics
    expect(res).toHaveProperty('eeatMetrics');
    expect(typeof res.eeatMetrics.isSecure).toBe('boolean');
    expect(typeof res.eeatMetrics.hasContactInfo).toBe('boolean');
    expect(typeof res.eeatMetrics.hasPrivacyPolicy).toBe('boolean');
    expect(typeof res.eeatMetrics.ageEstimate).toBe('string');
    expect(['Optimized Anchor', 'Information Isolation', 'Abstention Risk']).toContain(res.eeatMetrics.authorityStatus);
    expect(typeof res.eeatMetrics.diagnosticSummary).toBe('string');
  });

  it('should return valid non-null Executive View extension payloads for default empty input', () => {
    const res = evaluateAllCapabilities({});
    expect(res.scanMetrics).not.toBeNull();
    expect(typeof res.scanMetrics.scanTimeSeconds).toBe('number');
    expect(typeof res.scanMetrics.lastScanned).toBe('string');

    expect(Array.isArray(res.scrapedContentPreview)).toBe(true);
    expect(res.scrapedContentPreview.length).toBeGreaterThan(0);
    expect(res.scrapedContentPreview[0]).toHaveProperty('route');
    expect(res.scrapedContentPreview[0]).toHaveProperty('content');

    expect(res.manifestPreviews).not.toBeNull();
    expect(typeof res.manifestPreviews.aiContext).toBe('string');
    expect(typeof res.manifestPreviews.about).toBe('string');

    expect(Array.isArray(res.discoveredRoutes)).toBe(true);
    expect(res.discoveredRoutes.length).toBeGreaterThan(0);
    res.discoveredRoutes.forEach(route => {
      expect(route).toHaveProperty('path');
      expect(route).toHaveProperty('wordCount');
      expect(route).toHaveProperty('tokenLoad');
      expect(route).toHaveProperty('hiddenFromAi');
      expect(route).toHaveProperty('inSitemap');
      expect(route).toHaveProperty('isEssential');
      expect(route).toHaveProperty('missingStatus');
      expect(route).toHaveProperty('actionUrl');
    });

    expect(res.eeatMetrics).not.toBeNull();
    expect(typeof res.eeatMetrics.isSecure).toBe('boolean');
    expect(typeof res.eeatMetrics.hasContactInfo).toBe('boolean');
    expect(typeof res.eeatMetrics.hasPrivacyPolicy).toBe('boolean');
    expect(typeof res.eeatMetrics.ageEstimate).toBe('string');
    expect(['Optimized Anchor', 'Information Isolation', 'Abstention Risk']).toContain(res.eeatMetrics.authorityStatus);
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

    // 3. Missing essential pages logic: '/about' is in discoveredRoutes, so only '/contact', '/privacy', and '/terms' are missing.
    expect(Array.isArray(res.missingEssentialPages)).toBe(true);
    expect(res.missingEssentialPages).toEqual(['/contact', '/privacy', '/terms']);
  });

  it('should fallback to default contact values when they are not present', () => {
    const res = evaluateAllCapabilities({
      url: 'https://example.com',
      scrapedContentPreview: 'No contact information here.',
      discoveredRoutes: [
        { path: '/' },
        { path: '/about' },
        { path: '/contact' },
        { path: '/privacy' },
        { path: '/terms' }
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
