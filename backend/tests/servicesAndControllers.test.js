const { generateLlmsTxt, generateAiContextMd, generateCloudflareWorkerJs, generateShopifyLiquid, generateHtaccess } = require('../services/generatorService');
const { parseHtmlMetrics } = require('../services/parserService');
const { registerUser, loginUser, getCurrentUser } = require('../controllers/authController');
const User = require('../models/User');

describe('Services & Controllers Unit Regression Suite', () => {

  describe('Generator Service Unit Tests', () => {
    it('Should generate valid /llms.txt content', () => {
      const res = generateLlmsTxt('testdomain.com');
      expect(res).toContain('TESTDOMAIN.COM AI DIRECTORY MANIFEST');
      expect(res).toContain('https://testdomain.com/ai-context.md');
    });

    it('Should generate valid /ai-context.md content', () => {
      const res = generateAiContextMd('testdomain.com');
      expect(res).toContain('CORPORATE IDENTITY & TRUST MANIFEST');
      expect(res).toContain('support@testdomain.com');
    });

    it('Should generate valid Cloudflare Worker script', () => {
      const res = generateCloudflareWorkerJs('testdomain.com');
      expect(res).toContain("url.pathname === '/llms.txt'");
      expect(res).toContain('EventListener');
    });

    it('Should generate valid Shopify Liquid and Htaccess snippets', () => {
      const shopify = generateShopifyLiquid('testdomain.com');
      const htaccess = generateHtaccess('testdomain.com');
      expect(shopify).toContain("request.path == '/llms.txt'");
      expect(htaccess).toContain('RewriteRule ^llms.txt$');
    });
  });

  describe('Parser Service Unit Tests', () => {
    it('Should strip DOM noise and calculate content density', () => {
      const sampleHtml = `
        <!DOCTYPE html>
        <html>
          <head><style>body { color: red; }</style></head>
          <body>
            <script>console.log("noise");</script>
            <nav>Nav content</nav>
            <h1>Main Heading Title</h1>
            <p>This is semantic text content for machine ingestion.</p>
            <footer>Footer content</footer>
          </body>
        </html>
      `;
      const metrics = parseHtmlMetrics(sampleHtml);
      expect(metrics.wordCount).toBeGreaterThan(0);
      expect(metrics.rawText).toContain('Main Heading Title');
      expect(metrics.rawText).not.toContain('console.log');
      expect(metrics.contentDensityRatio).toBeGreaterThan(0);
    });

    it('Should detect SPA hydration traps', () => {
      const spaHtml = `<html><body><div id="root"></div></body></html>`;
      const metrics = parseHtmlMetrics(spaHtml);
      expect(metrics.spaTrapDetected).toBe(true);
    });

    it('Should extract JSON-LD schema types', () => {
      const jsonLdHtml = `
        <html>
          <head>
            <script type="application/ld+json">
              { "@context": "https://schema.org", "@type": "Organization", "name": "Test Company" }
            </script>
          </head>
          <body><h1>Test</h1></body>
        </html>
      `;
      const metrics = parseHtmlMetrics(jsonLdHtml);
      expect(metrics.jsonLdExists).toBe(true);
      expect(metrics.jsonLdTypes).toContain('Organization');
    });
  });

  describe('Auth Controller Unit Tests', () => {
    it('Should fail registration if email or password missing', async () => {
      const req = { body: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Email and password are required' }));
    });

    it('Should fail login with invalid password', async () => {
      const mockUser = { email: 'user@test.com', password_hash: 'wronghash' };
      User.findOne = vi.fn().mockResolvedValue(mockUser);
      const req = { body: { email: 'user@test.com', password: 'secretpassword' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Invalid email or password' }));
    });
  });

});
