const { generateAboutMd, generateDocsMd, generateContentMd, generateSitemapXml } = require('../../services/generatorService');
const { analyzeUrl } = require('../../services/crawlerService');
const axios = require('axios');

describe('Dashboard Categorization & Expanded Manifests Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    axios.get = vi.fn().mockImplementation(async (targetUrl) => {
      if (targetUrl.includes('robots.txt')) {
        return { status: 200, data: 'User-agent: *\nAllow: /' };
      }
      if (targetUrl.includes('llms.txt') || targetUrl.includes('ai-context.md') || targetUrl.includes('about.md') || targetUrl.includes('docs.md') || targetUrl.includes('content.md')) {
        return { status: 200, data: 'Factual mock text' };
      }
      return {
        status: 200,
        data: '<html><head><title>Mocked Title That is Long Enough to Pass the Seventy-Five Character Test Sweetspot</title></head><body><h1>Hello World</h1></body></html>'
      };
    });
  });

  describe('Section & Track Structural Schema Gating', () => {

    it('Scenario 1: Crawler should verify existence of Section 4 narrative manifests (about.md, docs.md, content.md)', async () => {
      const results = await analyzeUrl('https://example.com', { maxPages: 1, tier: 'AIVisualize Pro' });
      
      expect(results.status.llmsTxtExists).toBe(true);
      expect(results.status.aiContextExists).toBe(true);
      expect(results.status.aboutTxtExists).toBe(true);
      expect(results.status.docsTxtExists).toBe(true);
      expect(results.status.contentTxtExists).toBe(true);
    });

    it('Scenario 2: Generator service should output valid contents for Track 2 expanded files (about, docs, content, sitemap)', () => {
      const about = generateAboutMd('example.com');
      expect(about).toContain('ABOUT US & CORPORATE FOUNDRY INDEX');
      expect(about).toContain('Founding Year**: 2026');

      const docs = generateDocsMd('example.com');
      expect(docs).toContain('SYSTEM ARCHITECTURE & API CAPABILITY SPECIFICATION');
      expect(docs).toContain('POST `/api/scan`');

      const content = generateContentMd('example.com');
      expect(content).toContain('CASE STUDIES & THOUGHT LEADERSHIP INDEX');
      expect(content).toContain('Designing for Machine-First Discovery');

      const sitemap = generateSitemapXml('example.com');
      expect(sitemap).toContain('<loc>https://example.com/llms.txt</loc>');
      expect(sitemap).toContain('<loc>https://example.com/about.md</loc>');
    });
  });
});
