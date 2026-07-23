const User = require('../models/User');

const TIER_LIMITS = {
  'AIVisualize Free': {
    maxScans: parseInt(process.env.AIV_FREE_MAX_SCANS || (process.env.NODE_ENV === 'test' ? '5' : '100'), 10),
    maxPages: parseInt(process.env.AIV_FREE_MAX_PAGES || '5', 10),
    maxHeadless: 0
  },
  'AIVisualize Pro': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: parseInt(process.env.AIV_PRO_MAX_PAGES || '40', 10),
    maxHeadless: 0
  },
  'AIVisualize ENT': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: parseInt(process.env.AIV_ENT_MAX_PAGES || '100', 10),
    maxHeadless: 0
  },
  'AIOptimize Free': {
    maxScans: parseInt(process.env.AIV_FREE_MAX_SCANS || '5', 10),
    maxPages: 1,
    maxHeadless: 0
  },
  'AIOptimize Pro': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: parseInt(process.env.AIV_PRO_MAX_PAGES || '40', 10),
    maxHeadless: parseInt(process.env.AIO_PRO_MAX_HEADLESS || '3', 10)
  },
  'AIOptimize ENT': {
    maxScans: parseInt(process.env.AIV_PRO_MAX_SCANS || '50', 10),
    maxPages: parseInt(process.env.AIV_ENT_MAX_PAGES || '100', 10),
    maxHeadless: parseInt(process.env.AIO_ENT_MAX_HEADLESS || '10', 10)
  }
};

const checkTierLimits = async (req, res, next) => {
  try {
    const { email, headless } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'User email is required for quota validation' });
    }

    // Load or create a mock/database user record
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, subscription_tier: 'AIVisualize Free' });
    }

    // Reset counts on UTC day boundaries
    user.checkAndResetDailyLimits();

    const tier = user.subscription_tier;
    const limits = TIER_LIMITS[tier] || TIER_LIMITS['AIVisualize Free'];

    // 1. Verify daily scan quota
    if (user.daily_scans_performed >= limits.maxScans) {
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

      if (user.daily_headless_runs_performed >= limits.maxHeadless) {
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
    console.error('Rate Limiter Error:', error);
    res.status(500).json({ error: 'Internal validation server error' });
  }
};

module.exports = { checkTierLimits, TIER_LIMITS };
