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

  describe('BetaSignup Model Unit Tests', () => {
    const BetaSignup = require('../models/BetaSignup');

    it('Should create BetaSignup instance with valid attributes', () => {
      const signup = new BetaSignup({
        email: 'TEST@THATWORKX.COM ',
        sourceTool: 'visualize'
      });
      expect(signup.email).toBe('test@thatworkx.com');
      expect(signup.sourceTool).toBe('visualize');
      expect(signup.createdAt).toBeInstanceOf(Date);
    });

    it('Should fail validation if sourceTool is invalid', () => {
      const signup = new BetaSignup({
        email: 'test@thatworkx.com',
        sourceTool: 'invalid-tool'
      });
      const err = signup.validateSync();
      expect(err.errors.sourceTool).toBeDefined();
    });
  });

  describe('Server API Endpoints 6-Stage Contract Transmission (BDD-TDD Red Phase)', () => {
    let app;
    let findRouteHandler;

    beforeEach(() => {
      const http = require('http');
      if (!http.Server.prototype.listen.__isMocked) {
        vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (port, cb) {
          if (typeof port === 'function') setTimeout(port, 0);
          else if (typeof cb === 'function') setTimeout(cb, 0);
          return this;
        });
        http.Server.prototype.listen.__isMocked = true;
      }

      const axios = require('axios');
      axios.get = vi.fn().mockImplementation(async (url) => {
        if (url.includes('robots.txt')) return { status: 200, data: 'User-agent: *\nAllow: /' };
        if (url.includes('deep-test-domain.com')) {
          let links = '';
          for (let i = 1; i <= 30; i++) {
            links += `<a href="/deep-page-${i}">Page ${i}</a>\n`;
          }
          return { status: 200, data: `<html><head><title>Deep Page Title With Sufficient Length</title></head><body><h1>Deep Scan</h1>${links}</body></html>` };
        }
        return { status: 200, data: '<html><head><title>Standard Page Title For Test Passing 12345</title></head><body><h1>Standard</h1><a href="/about">About</a><p>Some content with more words for testing readability.</p></body></html>' };
      });

      app = require('../server');

      findRouteHandler = (path, method) => {
        const route = app._router.stack.find(
          (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
        );
        if (!route) return null;
        return route.route.stack[route.route.stack.length - 1].handle;
      };
    });

    it('1. POST /api/scan (Standard Scan Response): returns root stages with stage1..stage6 and results.stages', async () => {
      const scanHandler = findRouteHandler('/api/scan', 'post');
      expect(scanHandler).toBeTypeOf('function');

      const req = {
        body: { targetUrl: 'https://standard-test.com', headless: false },
        userLimits: { maxPages: 25 },
        userRecord: {
          email: 'test@thatworkx.com',
          daily_scans_performed: 0,
          daily_headless_runs_performed: 0,
          subscription_tier: 'AIVisualize Free',
          save: vi.fn().mockResolvedValue(true)
        }
      };
      let responseBody = null;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => {
          responseBody = data;
          return res;
        })
      };

      await scanHandler(req, res);

      expect(responseBody).not.toBeNull();
      expect(responseBody.success).toBe(true);
      expect(responseBody).toHaveProperty('stages');
      expect(responseBody.stages).toHaveProperty('stage1');
      expect(responseBody.stages).toHaveProperty('stage2');
      expect(responseBody.stages).toHaveProperty('stage3');
      expect(responseBody.stages).toHaveProperty('stage4');
      expect(responseBody.stages).toHaveProperty('stage5');
      expect(responseBody.stages).toHaveProperty('stage6');

      expect(responseBody.results).toHaveProperty('stages');
      expect(responseBody.results.stages).toHaveProperty('stage1');
      expect(responseBody.results.stages).toHaveProperty('stage6');

      expect(typeof responseBody.stages.stage3.score).toBe('string');
      expect(responseBody.stages.stage3.score.endsWith('%')).toBe(true);
      expect(responseBody.stages.stage3.score).not.toBe('85%');
    });

    it('2. POST /api/scan (Deep Scan / Partial Remainder Response): returns root stages and results.stages when isPartial is true', async () => {
      const scanHandler = findRouteHandler('/api/scan', 'post');
      expect(scanHandler).toBeTypeOf('function');

      const axios = require('axios');
      axios.get = vi.fn().mockImplementation(async (url) => {
        if (url.includes('robots.txt')) return { status: 200, data: 'User-agent: *\nAllow: /' };
        let links = '';
        for (let i = 1; i <= 30; i++) {
          links += `<a href="/deep-page-${i}">Page ${i}</a>\n`;
        }
        return { status: 200, data: `<html><head><title>Deep Page Title With Sufficient Length For Test Pass</title></head><body><h1>Deep Scan</h1>${links}</body></html>` };
      });

      const req = {
        body: { targetUrl: 'https://deep-test-domain.com', headless: false },
        userLimits: { maxPages: 40 },
        userRecord: {
          email: 'test@thatworkx.com',
          daily_scans_performed: 0,
          daily_headless_runs_performed: 0,
          subscription_tier: 'AIOptimize Pro',
          save: vi.fn().mockResolvedValue(true)
        }
      };
      let responseBody = null;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => {
          responseBody = data;
          return res;
        })
      };

      await scanHandler(req, res);

      expect(responseBody).not.toBeNull();
      expect(responseBody.status).toBe('processing_remainder');
      expect(responseBody).toHaveProperty('stages');
      expect(responseBody.stages).toHaveProperty('stage1');
      expect(responseBody.stages).toHaveProperty('stage6');
      expect(responseBody.results).toHaveProperty('stages');
    });

    it('3. REST API v1 Endpoints (GET /api/v1/scan & POST /api/v1/scan): returns root stages and results.stages', async () => {
      const getV1Handler = findRouteHandler('/api/v1/scan', 'get');
      const postV1Handler = findRouteHandler('/api/v1/scan', 'post');
      expect(getV1Handler).toBeTypeOf('function');
      expect(postV1Handler).toBeTypeOf('function');

      // GET /api/v1/scan
      const getReq = {
        query: { url: 'https://standard-test.com' },
        userLimits: { maxPages: 25 }
      };
      let getResponseBody = null;
      const getRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => {
          getResponseBody = data;
          return getRes;
        })
      };
      await getV1Handler(getReq, getRes);

      expect(getResponseBody).not.toBeNull();
      expect(getResponseBody.success).toBe(true);
      expect(getResponseBody).toHaveProperty('stages');
      expect(getResponseBody.stages).toHaveProperty('stage1');
      expect(getResponseBody.stages).toHaveProperty('stage6');
      expect(getResponseBody.results).toHaveProperty('stages');

      // POST /api/v1/scan
      const postReq = {
        body: { targetUrl: 'https://standard-test.com' },
        userLimits: { maxPages: 25 }
      };
      let postResponseBody = null;
      const postRes = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => {
          postResponseBody = data;
          return postRes;
        })
      };
      await postV1Handler(postReq, postRes);

      expect(postResponseBody).not.toBeNull();
      expect(postResponseBody.success).toBe(true);
      expect(postResponseBody).toHaveProperty('stages');
      expect(postResponseBody.stages).toHaveProperty('stage1');
      expect(postResponseBody.stages).toHaveProperty('stage6');
      expect(postResponseBody.results).toHaveProperty('stages');
    });

    it('4. Diagnostic Test Endpoint (POST /api/test/evaluator): returns evaluationData.stages with stage1..stage6', async () => {
      const testEvaluatorHandler = findRouteHandler('/api/test/evaluator', 'post');
      expect(testEvaluatorHandler).toBeTypeOf('function');

      const req = {
        body: {
          crawlPayload: {
            url: 'https://standard-test.com',
            pages: [
              { url: 'https://standard-test.com/', wordCount: 400, textRatio: 30, statusCode: 200 }
            ],
            discoveredRoutes: [{ path: '/' }],
            status: {
              botPermissions: { 'GPTBot': true, 'ClaudeBot': true }
            }
          }
        }
      };
      let responseBody = null;
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn().mockImplementation((data) => {
          responseBody = data;
          return res;
        })
      };

      await testEvaluatorHandler(req, res);

      expect(responseBody).not.toBeNull();
      expect(responseBody.success).toBe(true);
      expect(responseBody.evaluationData).toHaveProperty('stages');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage1');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage2');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage3');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage4');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage5');
      expect(responseBody.evaluationData.stages).toHaveProperty('stage6');
    });
  });

});
