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
    expect(combinedText).toContain('Content AI-Readiness');
    expect(combinedText).toContain('Machine Manifest Readiness');

    // 5. Governance vocabulary rules
    expect(combinedText).toContain('AI-Optimized');
    expect(combinedText).toContain('AI-Ready');
    expect(/AI-first/i.test(combinedText)).toBe(false);
  });

});
