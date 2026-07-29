const { evaluateCapabilities } = require('../../services/capabilityEvaluator');

describe('Executive Mode Rendering Engine & Undefined Mapping (BDD Phase 2)', () => {

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

});
