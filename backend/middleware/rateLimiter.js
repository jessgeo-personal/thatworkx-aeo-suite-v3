const mongoose = require('mongoose');
const User = require('../models/User');

const TIER_LIMITS = {
  'AIVisualize Free': {
    maxScans: parseInt(process.env.AIV_FREE_MAX_SCANS || (process.env.NODE_ENV === 'test' ? '5' : '100'), 10),
    maxPages: 500,
    maxHeadless: 0
  },
  'AIVisualize Pro': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: 500,
    maxHeadless: 0
  },
  'AIVisualize ENT': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: 500,
    maxHeadless: 0
  },
  'AIOptimize Free': {
    maxScans: parseInt(process.env.AIV_FREE_MAX_SCANS || '5', 10),
    maxPages: 1,
    maxHeadless: 0
  },
  'AIOptimize Pro': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: 500,
    maxHeadless: parseInt(process.env.AIO_PRO_MAX_HEADLESS || '3', 10)
  },
  'AIOptimize ENT': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: 500,
    maxHeadless: parseInt(process.env.AIO_ENT_MAX_HEADLESS || '10', 10)
  }
};

const checkTierLimits = async (req, res, next) => {
  try {
    const { email, headless } = req.body;

    const userEmail = (email && typeof email === 'string' && email.trim()) 
      ? email.trim().toLowerCase() 
      : 'user@thatworkx.com';

    let user = null;

    // Only query database if MongoDB connection is active or in test mode
    if (mongoose.connection.readyState === 1 || process.env.NODE_ENV === 'test') {
      try {
        user = await User.findOne({ email: userEmail });
      } catch (dbErr) {
        console.warn('[RateLimiter] Database query error, using memory fallback:', dbErr.message);
      }
    }

    // In-memory user fallback
    if (!user) {
      user = new User({ 
        email: userEmail, 
        subscription_tier: 'AIVisualize Free',
        daily_scans_performed: 0,
        daily_headless_runs_performed: 0
      });
    }

    // Reset counts on UTC day boundaries if available
    if (typeof user.checkAndResetDailyLimits === 'function') {
      user.checkAndResetDailyLimits();
    }

    const tier = user.subscription_tier || 'AIVisualize Free';
    const limits = TIER_LIMITS[tier] || TIER_LIMITS['AIVisualize Free'];

    // 1. Verify daily scan quota
    if ((user.daily_scans_performed || 0) >= limits.maxScans) {
      return res.status(403).json({
        code: 'LIMIT_EXCEEDED',
        error: `Daily scan allocation exceeded. Limit is ${limits.maxScans} per day.`,
        tier: tier,
        upgradeTarget: tier.includes('Visualize') ? 'AIVisualize Pro' : 'AIOptimize Pro'
      });
    }

    // 2. Verify headless browser request allocation
    if (headless) {
      if (limits.maxHeadless === 0) {
        return res.status(403).json({
          code: 'HEADLESS_FORBIDDEN',
          error: `Headless browser sweeps are not allowed on the ${tier} tier.`,
          tier: tier,
          upgradeTarget: 'AIOptimize Pro'
        });
      }

      if ((user.daily_headless_runs_performed || 0) >= limits.maxHeadless) {
        return res.status(403).json({
          code: 'HEADLESS_LIMIT_EXCEEDED',
          error: `Daily headless browser sweep allocation exceeded. Limit is ${limits.maxHeadless} sessions per day.`,
          tier: tier,
          upgradeTarget: 'AIOptimize ENT'
        });
      }
    }

    // Pass validated limits to request object
    req.userLimits = {
      maxPages: limits.maxPages,
      maxHeadless: limits.maxHeadless,
      tier: tier
    };
    req.userRecord = user;

    next();
  } catch (error) {
    console.error('[RateLimiter] Error during validation:', error);
    // Fallback: Proceed with standard Free Tier limits rather than blocking the scan
    req.userLimits = {
      maxPages: 500,
      maxHeadless: 0,
      tier: 'AIVisualize Free'
    };
    req.userRecord = {
      email: 'user@thatworkx.com',
      daily_scans_performed: 0,
      daily_headless_runs_performed: 0,
      subscription_tier: 'AIVisualize Free'
    };
    next();
  }
};

module.exports = { checkTierLimits, TIER_LIMITS };
