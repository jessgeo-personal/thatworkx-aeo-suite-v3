const { generateLlmsTxt, generateAiContextMd, generateCloudflareWorkerJs, generateShopifyLiquid, generateHtaccess } = require('../services/generatorService');
const { parseHtmlMetrics } = require('../services/parserService');
const { registerUser, loginUser, getCurrentUser, verifyOtp } = require('../controllers/authController');
const User = require('../models/User');

describe('Services & Controllers Unit Regression Suite', () => {

  const axios = require('axios');
  beforeEach(() => {
    vi.clearAllMocks();
    axios.post = vi.fn().mockImplementation(async (url, data) => {
      if (url.includes('api.resend.com')) {
        return { data: { id: 'mock-email-id-123' } };
      }
      return { data: {} };
    });
  });

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
    it('Should fail registration if email or details are missing', async () => {
      const req = { body: {} };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Email, First Name, Last Name, and Phone Number are required fields.' }));
    });

    it('Should successfully request registration OTP', async () => {
      User.findOne = vi.fn().mockResolvedValue(null);
      User.prototype.save = vi.fn().mockImplementation(async function() { return this; });

      const req = {
        body: {
          email: 'newuser@test.com',
          first_name: 'John',
          last_name: 'Doe',
          phone_number: '1234567890',
          opt_in: true
        }
      };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await registerUser(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, message: 'OTP sent to email address successfully.' }));
    });

    it('Should fail login OTP request if email does not exist', async () => {
      User.findOne = vi.fn().mockResolvedValue(null);
      const req = { body: { email: 'nonexistent@test.com' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await loginUser(req, res);
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'USER_NOT_FOUND' }));
    });

    it('Should verify correct OTP and return session token', async () => {
      const mockUser = {
        email: 'user@test.com',
        otp_code: '123456',
        otp_expires_at: new Date(Date.now() + 600000),
        is_verified: false,
        save: vi.fn().mockImplementation(async function() { return this; })
      };
      User.findOne = vi.fn().mockResolvedValue(mockUser);
      const req = { body: { email: 'user@test.com', otp: '123456' } };
      const res = { status: vi.fn().mockReturnThis(), json: vi.fn() };
      await verifyOtp(req, res);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true, token: expect.any(String) }));
    });
  });

});
