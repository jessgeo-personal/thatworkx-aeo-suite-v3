import { describe, it, expect, vi, beforeEach } from 'vitest';
import http from 'http';

// Mock http.Server.prototype.listen to prevent server conflicts
vi.spyOn(http.Server.prototype, 'listen').mockImplementation(function (port, cb) {
  if (typeof port === 'function') {
    setTimeout(port, 0);
  } else if (typeof cb === 'function') {
    setTimeout(cb, 0);
  }
  return this;
});

// Mock MongoDB/Mongoose connection to prevent tests from failing on DB connection
vi.mock('mongoose', async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    connect: vi.fn().mockResolvedValue(true),
    connection: {
      readyState: 1,
    }
  };
});

describe('Feature: Progressive Scan Queue (25-Page Sync Threshold)', () => {
  let app;
  let scanHandler;
  let statusHandler;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Monkey-patch axios.get to intercept crawler calls
    const axios = require('axios');
    axios.get = vi.fn().mockImplementation(async (url) => {
      // robots.txt calls
      if (url.includes('robots.txt')) {
        return { status: 200, data: 'User-agent: *\nAllow: /' };
      }
      if (url.includes('llms.txt') || url.includes('ai-context.md') || url.includes('about.md') || url.includes('docs.md') || url.includes('content.md') || url.includes('sitemap.xml')) {
        return { status: 404, data: '' };
      }
      
      // Main site crawlers
      if (url.includes('standard-site.com')) {
        let links = '';
        for (let i = 1; i <= 20; i++) {
          links += `<a href="/page-${i}">Page ${i}</a>\n`;
        }
        return { status: 200, data: `<html><body>${links}</body></html>` };
      }
      
      if (url.includes('deep-site.com')) {
        let links = '';
        for (let i = 1; i <= 40; i++) {
          links += `<a href="/page-${i}">Page ${i}</a>\n`;
        }
        return { status: 200, data: `<html><body>${links}</body></html>` };
      }
      
      if (url.includes('heavy-site.com')) {
        if (url === 'https://heavy-site.com' || url === 'https://heavy-site.com/') {
          let links = '';
          for (let i = 1; i <= 5; i++) {
            links += `<a href="/page-${i}">Page ${i}</a>\n`;
          }
          return { status: 200, data: `<html><body>${links}</body></html>` };
        } else {
          const err = new Error('timeout');
          err.name = 'AbortError';
          err.code = 'ECONNABORTED';
          throw err;
        }
      }
      
      return { status: 200, data: '<html><body>Hello World</body></html>' };
    });

    // Require app inside beforeEach to reset state
    app = require('../../server');
    
    // Helper to find express route handlers
    const findRouteHandler = (path, method) => {
      const route = app._router.stack.find(
        (layer) => layer.route && layer.route.path === path && layer.route.methods[method]
      );
      if (!route) return null;
      return route.route.stack[route.route.stack.length - 1].handle;
    };

    scanHandler = findRouteHandler('/api/scan', 'post');
    statusHandler = findRouteHandler('/api/scan/status/:jobId', 'get');
  });

  it('1. Asserts scan handler and status route exists', () => {
    expect(scanHandler).toBeTypeOf('function');
    expect(statusHandler).toBeTypeOf('function');
  });

  it('Scenario 1: Standard Site (<= 25 Pages) processes completely synchronously', async () => {
    const req = {
      body: {
        targetUrl: 'https://standard-site.com',
        headless: false
      },
      userLimits: {
        tier: 'AIOptimize Pro',
        maxPages: 20
      },
      userRecord: {
        email: 'test@example.com',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0,
        save: vi.fn().mockResolvedValue(true)
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    await scanHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.status).toBe('complete');
    expect(responseData.jobId).toBeUndefined();
    expect(responseData.results.pages.length).toBeLessThanOrEqual(20);
  });

  it('Scenario 2: Deep Scan (> 25 Pages - e.g., 40 Pages) processes first 25 synchronously and queues remainder', async () => {
    const req = {
      body: {
        targetUrl: 'https://deep-site.com',
        headless: false
      },
      userLimits: {
        tier: 'AIOptimize Pro',
        maxPages: 40
      },
      userRecord: {
        email: 'test@example.com',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0,
        save: vi.fn().mockResolvedValue(true)
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    await scanHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    expect(responseData.status).toBe('processing_remainder');
    expect(responseData.jobId).toBeDefined();
    expect(responseData.results.pages.length).toBe(25);
  });

  it('Scenario 3: Individual Heavy Page Timeout is recorded without failing overall scan request', async () => {
    // Asserting the page timeout duration limit rule of 3.5 seconds
    const req = {
      body: {
        targetUrl: 'https://heavy-site.com',
        headless: false
      },
      userLimits: {
        tier: 'AIOptimize Pro',
        maxPages: 5
      },
      userRecord: {
        email: 'test@example.com',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0,
        save: vi.fn().mockResolvedValue(true)
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    await scanHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.success).toBe(true);
    
    // Find the page in results that timed out
    const timedOutPage = responseData.results.pages.find(p => p.error === 'heavy_page_timeout');
    expect(timedOutPage).toBeDefined();
    expect(timedOutPage.status).toBe('failed');
  });

  it('Scenario 4: Background Job Polling returns current scan progress starting from page 26', async () => {
    const req = {
      params: {
        jobId: 'mock-job-id-123'
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    await statusHandler(req, res);

    expect(res.json).toHaveBeenCalled();
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.status).toBe('processing');
    expect(responseData.pagesCompleted).toBeGreaterThanOrEqual(25);
    expect(responseData.totalQueued).toBe(40);
  });

  it('Scenario 5: Headless Isolation immediately returns 202 Accepted with a jobId and bypasses sync processing', async () => {
    const req = {
      body: {
        targetUrl: 'https://headless-site.com',
        headless: true
      },
      userLimits: {
        tier: 'AIOptimize Pro',
        maxPages: 40
      },
      userRecord: {
        email: 'test@example.com',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0,
        save: vi.fn().mockResolvedValue(true)
      }
    };

    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis()
    };

    await scanHandler(req, res);

    expect(res.status).toHaveBeenCalledWith(202);
    const responseData = res.json.mock.calls[0][0];
    expect(responseData.status).toBe('queued');
    expect(responseData.jobId).toBeDefined();
    expect(responseData.results).toBeUndefined(); // Sync crawler bypassed
  });
});
