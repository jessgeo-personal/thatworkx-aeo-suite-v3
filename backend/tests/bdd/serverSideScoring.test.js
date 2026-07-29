const { evaluateCapabilities, CAPABILITY_MATRIX } = require('../../services/capabilityEvaluator');

describe('Server-Side Diagnostic Scoring & Categorization Fix (BDD Phase 1)', () => {

  it('Scenario A: Missing sitemap.xml leaves Section 1 score intact (25/25) while penalizing Section 2', () => {
    const scanData = {
      url: 'https://example.com',
      status: {
        robotsTxtExists: true,
        xRobotsIndexable: true,
        botPermissions: {
          gptBot: true,
          perplexityBot: true,
          claudeBot: true,
          googleExtended: true
        },
        sitemapExists: false, // missing sitemap.xml
        llmsTxtExists: true,
        aiContextExists: true,
        aboutTxtExists: true,
        docsTxtExists: true,
        contentTxtExists: true,
        seoOptimalTitle: true,
        seoOptimalDesc: true,
        hasProperHierarchy: true,
        spaTrapDetected: false,
        wordCount: 1000
      }
    };

    const evaluation = evaluateCapabilities(scanData);

    // Section 1 (Gateway & Access) score must be 25/25
    expect(evaluation.pillarScores.P1).toBe(25);

    // Section 2 (Presence & Hygiene) score must be penalized due to missing sitemap.xml
    expect(evaluation.pillarScores.P2).toBe(15);
  });

  it('Scenario B: Sum of P1+P2+P3+P4 equals overallScore', () => {
    const testDataSets = [
      {
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
        status: {
          robotsTxtExists: false,
          xRobotsIndexable: false,
          sitemapExists: false,
          llmsTxtExists: false,
          aiContextExists: false,
          aboutTxtExists: false,
          docsTxtExists: false,
          seoOptimalTitle: false,
          seoOptimalDesc: false,
          hasProperHierarchy: false,
          spaTrapDetected: true,
          wordCount: 200
        }
      },
      {
        status: {
          robotsTxtExists: true,
          xRobotsIndexable: true,
          sitemapExists: false,
          llmsTxtExists: true,
          aiContextExists: false,
          aboutTxtExists: false,
          docsTxtExists: true,
          seoOptimalTitle: true,
          seoOptimalDesc: false,
          hasProperHierarchy: true,
          spaTrapDetected: true,
          wordCount: 800
        }
      }
    ];

    for (const testData of testDataSets) {
      const evaluation = evaluateCapabilities(testData);
      const pillarSum = evaluation.pillarScores.P1 + evaluation.pillarScores.P2 + evaluation.pillarScores.P3 + evaluation.pillarScores.P4;
      expect(evaluation.overallScore).toBe(pillarSum);
    }
  });

  it('Scenario C: Zero occurrences of the string "AI-first" in exported payloads', () => {
    const evaluation = evaluateCapabilities({
      url: 'https://example.com',
      status: { robotsTxtExists: true, sitemapExists: true }
    });

    const payloadString = JSON.stringify({ evaluation, CAPABILITY_MATRIX });
    const containsAiFirst = /AI-first/i.test(payloadString);

    expect(containsAiFirst).toBe(false);
  });

});
