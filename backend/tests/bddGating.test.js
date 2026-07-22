// 1. Mock internal models first
vi.mock('../models/User', () => {
  return {
    default: function(data) {
      this.email = data.email || 'test@example.com';
      this.subscription_tier = data.subscription_tier || 'AIVisualize Free';
      this.daily_scans_performed = 0;
      this.daily_headless_runs_performed = 0;
      this.last_active_date = new Date();
      this.checkAndResetDailyLimits = vi.fn();
      this.save = vi.fn().mockImplementation(async function() { return this; });
    },
    findOne: vi.fn()
  };
});

// 2. Import modules
const express = require('express');
const axios = require('axios');
const { checkTierLimits, TIER_LIMITS } = require('../middleware/rateLimiter');
const { analyzeUrl } = require('../services/crawlerService');
const User = require('../models/User');

describe('AEO Suite BDD Integration Gating Tests', () => {

  beforeEach(() => {
    vi.clearAllMocks();

    // Monkey-patch axios.get to intercept crawler calls
    axios.get = vi.fn().mockImplementation(async (targetUrl) => {
      if (targetUrl.includes('robots.txt')) {
        if (targetUrl.includes('blockeddomain.com')) {
          return { data: 'User-agent: *\nDisallow: /' };
        }
        return { data: 'User-agent: *\nAllow: /' };
      }
      return { data: '<html><head><title>Mocked Title That is Long Enough to Pass the Seventy-Five Character Test Sweetspot</title></head><body><h1>Hello World</h1><a href="https://www.example.com/about">About</a></body></html>' };
    });
  });

  // --- Feature 1 & 3: Daily Scan Limits & Headless Gating ---
  describe('Feature 1 & 3: Daily Scan Quotas and Headless Allocation Checks', () => {
    
    it('Scenario 1.1: Should block scan when AIVisualize Free tier exceeds 5 scans/day', async () => {
      const mockUser = {
        email: 'free@example.com',
        subscription_tier: 'AIVisualize Free',
        daily_scans_performed: 5,
        daily_headless_runs_performed: 0,
        checkAndResetDailyLimits: vi.fn(),
        save: vi.fn()
      };
      
      User.findOne = vi.fn().mockResolvedValue(mockUser);

      const req = { body: { email: 'free@example.com' } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await checkTierLimits(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'LIMIT_EXCEEDED',
        tier: 'AIVisualize Free'
      }));
      expect(next).not.toHaveBeenCalled();
    });

    it('Scenario 3.1: Should deny headless browser execution for standard Free/Pro tiers', async () => {
      const mockUser = {
        email: 'pro@example.com',
        subscription_tier: 'AIVisualize Pro',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0,
        checkAndResetDailyLimits: vi.fn(),
        save: vi.fn()
      };
      
      User.findOne = vi.fn().mockResolvedValue(mockUser);

      const req = { body: { email: 'pro@example.com', headless: true } };
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      };
      const next = vi.fn();

      await checkTierLimits(req, res, next);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        code: 'HEADLESS_FORBIDDEN',
        upgradeTarget: 'AIOptimize Pro'
      }));
      expect(next).not.toHaveBeenCalled();
    });
  });

  // --- Feature 2: Page Depth Budget Limits ---
  describe('Feature 2: Page Depth Budget Limit Validation', () => {

    it('Scenario 2.1: Should restrict crawler depth to maximum 3 pages on Free Tier', async () => {
      const userLimits = {
        tier: 'AIVisualize Free',
        maxPages: 3
      };

      const scanResult = await analyzeUrl('https://example.com', userLimits);

      expect(scanResult.pageDepthCrawled).toBeLessThanOrEqual(3);
      expect(scanResult.pages.length).toBeLessThanOrEqual(3);
    });

    it('Scenario 2.2: Should restrict crawler depth to exactly 1 landing page on AIOptimize Free', async () => {
      const userLimits = {
        tier: 'AIOptimize Free',
        maxPages: 1
      };

      const scanResult = await analyzeUrl('https://example.com', userLimits);

      expect(scanResult.pageDepthCrawled).toBe(1);
      expect(scanResult.pages.length).toBe(1);
    });
  });

  // --- Feature 5: Protocol Gates & Robots.txt Disallow Check ---
  describe('Feature 5: Robots.txt AI Blindness Detector', () => {

    it('Scenario 5.1: Should flag TOTAL_AI_BLINDNESS and mark score as Ugly when blanket disallow exists', async () => {
      const userLimits = { tier: 'AIVisualize Pro', maxPages: 40 };
      const scanResult = await analyzeUrl('https://blockeddomain.com', userLimits);

      expect(scanResult.status.xRobotsIndexable).toBe(false);
      expect(scanResult.scoreCard.classification).toBe('Ugly');
      expect(scanResult.scoreCard.overallScore).toBe(20);
      expect(scanResult.alerts[0].type).toBe('TOTAL_AI_BLINDNESS');
    });
  });

  // --- Feature 14: Subdomain-Insensitive Domain Matcher ---
  describe('Feature 14: Subdomain-Insensitive Domain Matcher', () => {
    it('Scenario 14.1: Should extract subdomain-insensitive www. absolute links as internal routes', async () => {
      const userLimits = { tier: 'AIVisualize Pro', maxPages: 40 };
      const scanResult = await analyzeUrl('https://example.com', userLimits);

      // Verify that the link pointing to https://www.example.com/about was recognized as internal route /about
      const routes = scanResult.pages.map(p => p.route);
      expect(routes).toContain('/about');
    });
  });
});
