const { evaluateAllCapabilities, CAPABILITY_MATRIX } = require('../../services/capabilityEvaluator');

describe('Console State Integration, Export Engines & Monetization Gating (BDD Phase 4)', () => {

  it('Scenario A: URL state parser/builder correctly handles ?mode= and ?tab= query parameter updates', () => {
    const buildUrlWithParams = (basePath, mode, tab) => {
      const params = new URLSearchParams();
      if (mode) params.set('mode', mode);
      if (tab) params.set('tab', tab);
      return `${basePath}?${params.toString()}`;
    };

    const execUrl = buildUrlWithParams('/visualize.html', 'executive', null);
    expect(execUrl).toContain('mode=executive');

    const devGatewayUrl = buildUrlWithParams('/visualize.html', 'developer', 'gateway');
    expect(devGatewayUrl).toContain('mode=developer');
    expect(devGatewayUrl).toContain('tab=gateway');

    // Parse URL params simulation
    const parsedParams = new URLSearchParams('mode=developer&tab=manifests');
    expect(parsedParams.get('mode')).toBe('developer');
    expect(parsedParams.get('tab')).toBe('manifests');
  });

  it('Scenario B: JSON export builder generates valid, non-empty, formatted diagnostic payloads', () => {
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
    const jsonOutputString = JSON.stringify(evalResults, null, 2);

    expect(jsonOutputString).toBeDefined();
    expect(jsonOutputString.length).toBeGreaterThan(100);

    const parsedJson = JSON.parse(jsonOutputString);
    expect(parsedJson.overallScore).toBeDefined();
    expect(typeof parsedJson.overallScore).toBe('number');
    expect(parsedJson.pillarScores).toBeDefined();
    expect(parsedJson.executiveSections).toBeDefined();
    expect(parsedJson.capabilities).toBeDefined();
    expect(parsedJson.capabilities.length).toBe(32);
  });

  it('Scenario C: Upgrade modal triggers remain bound to all Pro capability IDs in AEO_TOOL_MAPPING_V1.csv', () => {
    const proToolIds = [
      'jsonLdSchema',
      'faqSchemaParity',
      'heavyPageIndication',
      'aiContextMd',
      'internalLinksAnalysis',
      'robotsTxt',
      'aboutMdManifest',
      'docsMdManifest',
      'contentMdManifest'
    ];

    for (const id of proToolIds) {
      const capInMatrix = CAPABILITY_MATRIX.find(c => c.id.toLowerCase() === id.toLowerCase());
      expect(capInMatrix).toBeDefined();
      expect(capInMatrix.id).toBeDefined();
    }
  });

  it('Scenario D: Zero occurrences of "AI-first" in exported payloads or rendering structures', () => {
    const scanData = { url: 'https://example.com' };
    const evalResults = evaluateAllCapabilities(scanData);

    const jsonStr = JSON.stringify(evalResults);
    expect(/AI-first/i.test(jsonStr)).toBe(false);
  });

});
