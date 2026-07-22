const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env.development') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { checkTierLimits } = require('./middleware/rateLimiter');
const { analyzeUrl } = require('./services/crawlerService');
const {
  generateLlmsTxt,
  generateAiContextMd,
  generateCloudflareWorkerJs,
  generateShopifyLiquid,
  generateHtaccess,
  generateAboutMd,
  generateDocsMd,
  generateContentMd,
  generateSitemapXml
} = require('./services/generatorService');
const { registerUser, loginUser, getCurrentUser, verifyOtp } = require('./controllers/authController');
const User = require('./models/User');
const ScanLog = require('./models/ScanLog');
const DomainProfile = require('./models/DomainProfile');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// MongoDB Connection with native bare-metal fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thatworkx-aeo';
mongoose.connect(mongoURI)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch((err) => {
    console.warn('MongoDB local connection warning. Using memory store or mock db fallback.');
  });

// Endpoint to execute URL scan with rate-limiting and tier-gating active
app.post('/api/scan', checkTierLimits, async (req, res) => {
  try {
    let { targetUrl, headless, singlePagePath } = req.body;

    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL is required' });
    }

    targetUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }

    // Run crawler analysis service
    const scanResults = await analyzeUrl(targetUrl, req.userLimits, singlePagePath);

    if (singlePagePath) {
      return res.status(200).json({
        success: true,
        singlePage: scanResults.singlePage
      });
    }

    // Save scan transaction tracking metrics
    const user = req.userRecord;
    user.daily_scans_performed += 1;
    if (headless) {
      user.daily_headless_runs_performed += 1;
    }

    // Attempt to write database transaction records (wrapped in try/catch to survive offline DB fallback)
    try {
      if (mongoose.connection.readyState === 1) {
        await user.save();

        const parsedUrl = new url.URL(targetUrl);
        const domainName = parsedUrl.hostname;

        // Update or create DomainProfile
        await DomainProfile.findOneAndUpdate(
          { domain_name: domainName },
          {
            domain_name: domainName,
            is_secure_ssl: targetUrl.startsWith('https'),
            robots_txt_exists: scanResults.status.robotsTxtExists,
            llms_txt_exists: scanResults.status.llmsTxtExists,
            ai_context_exists: scanResults.status.aiContextExists,
            sitemap_url: scanResults.status.sitemapExists ? `${parsedUrl.origin}/sitemap.xml` : '',
            total_pages_discovered: scanResults.totalPagesFound,
            last_audited: Date.now()
          },
          { upsert: true, new: true }
        );

        // Record Scan Log
        const scanLog = new ScanLog({
          user_email: user.email,
          target_url: targetUrl,
          page_depth_budget: req.userLimits.maxPages,
          pages_actually_crawled: scanResults.pageDepthCrawled,
          headless_session_executed: headless ? true : false,
          score_achieved: scanResults.scoreCard.overallScore,
          visibility_classification: scanResults.scoreCard.classification
        });
        await scanLog.save();
      } else {
        console.warn('MongoDB offline. Bypassing database persistence write cycles.');
      }
    } catch (dbErr) {
      console.error('Database write warning:', dbErr.message);
    }

    res.json({
      success: true,
      stats: {
        dailyScansPerformed: user.daily_scans_performed,
        dailyHeadlessRunsPerformed: user.daily_headless_runs_performed,
        tier: user.subscription_tier
      },
      results: scanResults
    });

  } catch (error) {
    console.error('API Scan Route Error:', error);
    res.status(500).json({ error: 'Internal crawler server error' });
  }
});

// Endpoint to change user subscription tier (for demonstration and QA tests)
app.post('/api/user/tier', async (req, res) => {
  try {
    const { email, tier } = req.body;
    if (!email || !tier) {
      return res.status(400).json({ error: 'Email and tier fields are required' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email });
    }

    user.subscription_tier = tier;
    await user.save();

    res.json({ success: true, message: `Subscription plan updated to ${tier}`, user });
  } catch (error) {
    console.error('Update Plan Route Error:', error);
    res.status(500).json({ error: 'Failed to update subscription plan' });
  }
});

// Authentication & Session Routes
app.post('/api/auth/register', registerUser);
app.post('/api/auth/login', loginUser);
app.post('/api/auth/verify-otp', verifyOtp);
app.get('/api/auth/me', getCurrentUser);

// Endpoint to build Level 3 Context Maps and Remediation Scripts
app.post('/api/generator/build', async (req, res) => {
  try {
    const { domainName, targetType } = req.body;
    const cleanDomain = domainName ? domainName.replace(/^https?:\/\//, '').split('/')[0] : 'example.com';

    let code = '';
    switch (targetType) {
      case 'llms':
      case 'llmstxt':
        code = generateLlmsTxt(cleanDomain);
        break;
      case 'aiContext':
      case 'aicontext':
        code = generateAiContextMd(cleanDomain);
        break;
      case 'about':
        code = generateAboutMd(cleanDomain);
        break;
      case 'docs':
        code = generateDocsMd(cleanDomain);
        break;
      case 'content':
        code = generateContentMd(cleanDomain);
        break;
      case 'sitemap':
        code = generateSitemapXml(cleanDomain);
        break;
      case 'cloudflare':
        code = generateCloudflareWorkerJs(cleanDomain);
        break;
      case 'shopify':
        code = generateShopifyLiquid(cleanDomain);
        break;
      case 'htaccess':
        code = generateHtaccess(cleanDomain);
        break;
      default:
        code = generateLlmsTxt(cleanDomain);
    }

    res.json({ success: true, domain: cleanDomain, targetType, code });
  } catch (err) {
    console.error('Generator Route Error:', err);
    res.status(500).json({ error: 'Failed to generate remediation code' });
  }
});

// Serve frontend assets
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Thatworkx AEO Suite backend running on http://localhost:${PORT}`);
});

module.exports = app;
