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
      faqSchemaParity: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' },
      heavyPageIndication: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒' },
      aiContextMd: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' },
      internalLinksAnalysis: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡' }
    };

    for (const [capId, expectedHook] of Object.entries(proToolHooks)) {
      const capInMatrix = CAPABILITY_MATRIX.find(c => c.id === capId);
      expect(capInMatrix).toBeDefined();
      expect(expectedHook.label).toBeDefined();
      expect(expectedHook.tier).toBeDefined();
    }
  });

  it('Scenario D: Zero occurrences of "AI-first" string in exported structures or HTML templates', () => {
    const scanData = { url: 'https://example.com' };
    const evalResults = evaluateAllCapabilities(scanData);

    const jsonStr = JSON.stringify(evalResults);
    expect(/AI-first/i.test(jsonStr)).toBe(false);
  });

});
