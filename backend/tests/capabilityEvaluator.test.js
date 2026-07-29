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
    expect(typeof res.scrapedContentPreview).toBe('string');
    expect(res.scrapedContentPreview).toBe('Example Scraped Landing Text');

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

    expect(typeof res.scrapedContentPreview).toBe('string');

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
  });
});
