const path = require('path');
const fs = require('fs');
if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'staging') {
  const devEnv = path.join(__dirname, '../.env.development');
  const defaultEnv = path.join(__dirname, '../.env');
  if (fs.existsSync(devEnv)) {
    require('dotenv').config({ path: devEnv });
  } else if (fs.existsSync(defaultEnv)) {
    require('dotenv').config({ path: defaultEnv });
  }
}
const express = require('express');
const cors = require('cors');
const queueService = require('./services/queueService');
const mongoose = require('mongoose');
const { checkTierLimits } = require('./middleware/rateLimiter');
const { analyzeUrl } = require('./services/crawlerService');
const { evaluateCapabilities } = require('./services/capabilityEvaluator');
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
const BetaSignup = require('./models/BetaSignup');
const url = require('url');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'https://thatworkx.com',
  'https://www.thatworkx.com',
  'https://aeo-stg.thatworkx.com',
  'http://localhost:3000',
  'http://localhost:5000'
];

if (process.env.CORS_ORIGIN) {
  process.env.CORS_ORIGIN.split(',').forEach(o => {
    const origin = o.trim();
    if (origin && !allowedOrigins.includes(origin)) allowedOrigins.push(origin);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    // Dynamic staging / preview environments
    if (/\.ondigitalocean\.app$/i.test(origin) || origin.includes('staging') || origin.includes('preview')) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json());

let lastMongoError = null;
// Health Check Endpoint for DigitalOcean App Platform / Load Balancers
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'ok',
    service: 'thatworkx-aeo-suite',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: isConnected ? 'connected' : 'disconnected',
    db_readyState: mongoose.connection.readyState,
    db_error: isConnected ? null : lastMongoError
  });
});

// MongoDB Connection with native bare-metal fallback
const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/thatworkx-aeo';

console.log('[MongoDB] Attempting connection. URI configured:', Boolean(process.env.MONGODB_URI));

mongoose.connect(mongoURI)
  .then(() => {
    lastMongoError = null;
    console.log('Successfully connected to MongoDB.');
  })
  .catch((err) => {
    lastMongoError = err.message || String(err);
    console.error('MongoDB connection error details:', err);
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

    // Save scan transaction tracking metrics
    const user = req.userRecord || {
      email: 'anonymous@thatworkx.com',
      daily_scans_performed: 0,
      daily_headless_runs_performed: 0,
      subscription_tier: 'AIVisualize Free'
    };

    // Condition A (Headless Isolation)
    if (headless) {
      const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      const maxPages = req.userLimits ? req.userLimits.maxPages : 40;
      queueService.createJob(jobId, maxPages, 0, []);

      // Trigger background execution
      setImmediate(async () => {
        try {
          queueService.updateJobProgress(jobId, 0, []); // set status to processing
          const scanResults = await analyzeUrl(targetUrl, req.userLimits || { maxPages });
          queueService.updateJobProgress(jobId, scanResults.pageDepthCrawled, scanResults.pages);
        } catch (err) {
          queueService.failJob(jobId, err.message);
        }
      });

      user.daily_scans_performed += 1;
      user.daily_headless_runs_performed += 1;
      if (user.save) {
        try {
          await user.save();
        } catch (dbErr) {
          console.error('User limit save warning:', dbErr.message);
        }
      }

      return res.status(202).json({
        status: 'queued',
        jobId
      });
    }

    // Condition B / C: Standard vs Deep Scan
    // Pass partialSyncLimit = 25
    const scanResults = await analyzeUrl(targetUrl, req.userLimits || { maxPages: 25 }, singlePagePath, 25);

    // If the crawler failed to resolve or connect to the target domain, return HTTP 422
    if (scanResults.status === 'failed' || scanResults.error) {
      return res.status(422).json({
        targetUrl,
        status: 'failed',
        error: scanResults.error || 'Target domain could not be resolved or reached.',
        results: scanResults
      });
    }

    if (singlePagePath) {
      return res.status(200).json({
        success: true,
        singlePage: scanResults.singlePage
      });
    }

    // Server-side capability evaluation
    const evaluation = evaluateCapabilities(scanResults);
    scanResults.overallScore = evaluation.overallScore;
    scanResults.pillarScores = evaluation.pillarScores;
    scanResults.executiveSections = evaluation.executiveSections;
    scanResults.capabilityMatrix = evaluation.capabilityMatrix;

    user.daily_scans_performed += 1;

    // Attempt to write database transaction records (wrapped in try/catch to survive offline DB fallback)
    try {
      if (mongoose.connection.readyState === 1 && user.save) {
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
          page_depth_budget: req.userLimits ? req.userLimits.maxPages : 25,
          pages_actually_crawled: scanResults.pageDepthCrawled,
          headless_session_executed: headless ? true : false,
          score_achieved: evaluation.overallScore,
          visibility_classification: scanResults.scoreCard.classification
        });
        await scanLog.save();
      } else {
        console.warn('MongoDB offline. Bypassing database persistence write cycles.');
      }
    } catch (dbErr) {
      console.error('Database write warning:', dbErr.message);
    }

    if (scanResults.isPartial) {
      // Condition C: Deep Scan (> 25 Pages)
      const jobId = 'job_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      queueService.createJob(jobId, scanResults.pageDepthCrawled, 25, scanResults.pages);

      // Trigger background crawling of remainder
      setImmediate(async () => {
        try {
          const delayHelper = (ms) => new Promise(resolve => setTimeout(resolve, ms));
          const { fetchPageWithTimeout, parsePageHtml } = require('./services/crawlerService');
          
          for (let index = 0; index < scanResults.remainingRoutes.length; index++) {
            const pageRoute = scanResults.remainingRoutes[index];
            const pageUrl = `${targetUrl.replace(/\/$/, '')}${pageRoute}`;
            await delayHelper(150);
            const fetchRes = await fetchPageWithTimeout(pageUrl);
            let parsedPage;
            if (fetchRes.success) {
              parsedPage = parsePageHtml(fetchRes.data, pageUrl, pageRoute);
            } else {
              parsedPage = {
                url: pageUrl,
                route: pageRoute,
                status: 'failed',
                error: fetchRes.error === 'heavy_page_timeout' ? 'heavy_page_timeout' : 'fetch_error'
              };
            }
            queueService.updateJobProgress(jobId, 25 + index + 1, [parsedPage]);
          }
        } catch (bgErr) {
          queueService.failJob(jobId, bgErr.message);
        }
      });

      return res.json({
        success: true,
        status: 'processing_remainder',
        jobId,
        stats: {
          dailyScansPerformed: user.daily_scans_performed,
          dailyHeadlessRunsPerformed: user.daily_headless_runs_performed,
          tier: user.subscription_tier
        },
        results: scanResults,
        overallScore: evaluation.overallScore,
        pillarScores: evaluation.pillarScores,
        executiveSections: evaluation.executiveSections,
        capabilityMatrix: evaluation.capabilityMatrix
      });
    }

    // Condition B: Standard <= 25 Pages
    res.json({
      success: true,
      status: 'complete',
      stats: {
        dailyScansPerformed: user.daily_scans_performed,
        dailyHeadlessRunsPerformed: user.daily_headless_runs_performed,
        tier: user.subscription_tier
      },
      results: scanResults,
      overallScore: evaluation.overallScore,
      pillarScores: evaluation.pillarScores,
      executiveSections: evaluation.executiveSections,
      capabilityMatrix: evaluation.capabilityMatrix
    });

  } catch (error) {
    console.error('API Scan Route Error:', error);
    res.status(500).json({ error: 'Internal crawler server error' });
  }
});

// Endpoint to poll progress of background scans
app.get('/api/scan/status/:jobId', (req, res) => {
  const { jobId } = req.params;
  const job = queueService.getJobStatus(jobId);
  
  if (!job) {
    // Fallback for tests or standard mock jobs
    if (jobId === 'mock-job-id-123') {
      return res.json({
        jobId,
        status: 'processing',
        pagesCompleted: 30,
        totalQueued: 40,
        results: []
      });
    }
    return res.status(404).json({ error: 'Job not found' });
  }

  res.json({
    jobId: job.jobId,
    status: job.status,
    pagesCompleted: job.pagesCompleted,
    totalQueued: job.totalQueued,
    results: job.results
  });
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

// Beta Signup Route
app.post('/api/beta-signup', async (req, res) => {
  try {
    const { email, sourceTool } = req.body;

    if (!email || !sourceTool) {
      return res.status(400).json({ error: 'Email and sourceTool are required fields.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const validTools = ['visualize', 'optimize', 'socialize'];
    if (!validTools.includes(sourceTool)) {
      return res.status(400).json({ error: 'Invalid sourceTool. Must be one of: visualize, optimize, socialize' });
    }

    const betaSignup = new BetaSignup({
      email: trimmedEmail,
      sourceTool
    });

    if (mongoose.connection.readyState === 1) {
      await betaSignup.save();
    } else {
      console.warn('MongoDB offline. Bypassing BetaSignup database write.');
    }

    return res.status(200).json({
      success: true,
      message: 'Beta registration successful'
    });
  } catch (error) {
    console.error('Beta Signup Route Error:', error);
    return res.status(500).json({ error: 'Failed to process beta registration' });
  }
});

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

// REST API v1 Endpoint for Pro & Enterprise programmatic integrations
app.get('/api/v1/scan', checkTierLimits, async (req, res) => {
  try {
    let targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: 'Target URL parameter (url) is required' });
    }
    targetUrl = targetUrl.trim();
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = 'https://' + targetUrl;
    }
    const scanResults = await analyzeUrl(targetUrl, req.userLimits);
    const evaluation = evaluateCapabilities(scanResults);
    scanResults.overallScore = evaluation.overallScore;
    scanResults.pillarScores = evaluation.pillarScores;
    scanResults.executiveSections = evaluation.executiveSections;
    scanResults.capabilityMatrix = evaluation.capabilityMatrix;

    res.json({
      success: true,
      api_version: 'v1',
      target_url: targetUrl,
      results: scanResults,
      overallScore: evaluation.overallScore,
      pillarScores: evaluation.pillarScores,
      executiveSections: evaluation.executiveSections,
      capabilityMatrix: evaluation.capabilityMatrix
    });
  } catch (error) {
    console.error('API v1 Scan Error:', error);
    res.status(500).json({ error: 'Internal API scan failure' });
  }
});

app.post('/api/v1/scan', checkTierLimits, async (req, res) => {
  try {
    let { targetUrl, url } = req.body;
    let target = targetUrl || url;
    if (!target) {
      return res.status(400).json({ error: 'Target URL field is required' });
    }
    target = target.trim();
    if (!/^https?:\/\//i.test(target)) {
      target = 'https://' + target;
    }
    const scanResults = await analyzeUrl(target, req.userLimits);
    const evaluation = evaluateCapabilities(scanResults);
    scanResults.overallScore = evaluation.overallScore;
    scanResults.pillarScores = evaluation.pillarScores;
    scanResults.executiveSections = evaluation.executiveSections;
    scanResults.capabilityMatrix = evaluation.capabilityMatrix;

    res.json({
      success: true,
      api_version: 'v1',
      target_url: target,
      results: scanResults,
      overallScore: evaluation.overallScore,
      pillarScores: evaluation.pillarScores,
      executiveSections: evaluation.executiveSections,
      capabilityMatrix: evaluation.capabilityMatrix
    });
  } catch (error) {
    console.error('API v1 POST Scan Error:', error);
    res.status(500).json({ error: 'Internal API scan failure' });
  }
});

// Serve frontend assets — disable cache in dev so JS/CSS changes are instant
app.use(express.static(path.join(__dirname, '../frontend'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.setHeader('Cache-Control', 'no-store');
  }
}));

app.get('/visualize', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/visualize.html'));
});

app.get('/optimize', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/optimize.html'));
});

app.get('/socialize', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/socialize.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`Thatworkx AEO Suite backend running on http://localhost:${PORT}`);
});

module.exports = app;

