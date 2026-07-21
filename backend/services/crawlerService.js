const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');
const { parseHtmlMetrics } = require('./parserService');

const analyzeUrl = async (targetUrl, userLimits) => {
  const result = {
    url: targetUrl,
    tier: userLimits.tier,
    pageDepthCrawled: 0,
    totalPagesFound: 1, // Simulated total domain size
    status: {
      robotsTxtExists: false,
      llmsTxtExists: false,
      aiContextExists: false,
      sitemapExists: false,
      xRobotsIndexable: true,
      hasProperHierarchy: true,
      experienceScore: 0,
      readabilityRating: 'Good',
      seoOptimalTitle: false,
      seoOptimalDesc: false,
      gatewayBadge: 'Hidden Assets',
      contentDensityRatio: 0,
      spaTrapDetected: false,
      jsonLdExists: false,
      jsonLdTypes: [],
      machinePreview: '',
      botPermissions: {
        gptBot: true,
        perplexityBot: true,
        claudeBot: true,
        googleExtended: true
      }
    },
    alerts: [],
    scoreCard: {
      overallScore: 100,
      classification: 'Good'
    },
    pages: []
  };

  try {
    const parsedUrl = new url.URL(targetUrl);
    const domainOrigin = parsedUrl.origin;

    // 1. Fetch robots.txt at root domain
    let robotsContent = '';
    try {
      const robotsRes = await axios.get(`${domainOrigin}/robots.txt`, { timeout: 3000 });
      robotsContent = robotsRes.data;
      result.status.robotsTxtExists = true;
    } catch (e) {
      result.status.robotsTxtExists = false;
    }

    // 2. Fetch /llms.txt and /ai-context.md in parallel
    try {
      const llmsRes = await axios.get(`${domainOrigin}/llms.txt`, { timeout: 2000 });
      if (llmsRes.status === 200 && llmsRes.data) {
        result.status.llmsTxtExists = true;
      }
    } catch (e) {
      result.status.llmsTxtExists = false;
    }

    try {
      const aiContextRes = await axios.get(`${domainOrigin}/ai-context.md`, { timeout: 2000 });
      if (aiContextRes.status === 200 && aiContextRes.data) {
        result.status.aiContextExists = true;
      }
    } catch (e) {
      result.status.aiContextExists = false;
    }

    // Check robots.txt for total AI blindness block & specific AI Bot blocks
    if (result.status.robotsTxtExists && robotsContent) {
      const normalizedRobots = robotsContent.replace(/\s+/g, ' ');

      // Look for User-agent: * Disallow: /
      const disallowRegex = /User-agent:\s*\*\s*Disallow:\s*\/\s*(?!\w)/i;
      const blanketDisallowMatch = disallowRegex.test(normalizedRobots) || 
                                   robotsContent.includes('User-agent: *\r\nDisallow: /') ||
                                   robotsContent.includes('User-agent: *\nDisallow: /');

      if (blanketDisallowMatch) {
        result.status.xRobotsIndexable = false;
        result.alerts.push({
          type: 'TOTAL_AI_BLINDNESS',
          severity: 'critical',
          message: 'Blanket indexing block active! robots.txt is instructing all web bots to ignore your domain.'
        });
        result.scoreCard.overallScore = 20;
        result.scoreCard.classification = 'Ugly';
      }

      // Specific AI Bot Disallow Check
      result.status.botPermissions = {
        gptBot: !/User-agent:\s*GPTBot\s*Disallow:\s*\//i.test(robotsContent),
        perplexityBot: !/User-agent:\s*PerplexityBot\s*Disallow:\s*\//i.test(robotsContent),
        claudeBot: !/User-agent:\s*(ClaudeBot|Claude-Web)\s*Disallow:\s*\//i.test(robotsContent),
        googleExtended: !/User-agent:\s*Google-Extended\s*Disallow:\s*\//i.test(robotsContent)
      };

      if (!blanketDisallowMatch) {
        const blockedBots = Object.entries(result.status.botPermissions)
          .filter(([_, allowed]) => !allowed)
          .map(([bot]) => bot);
        if (blockedBots.length > 0) {
          result.alerts.push({
            type: 'AI_BOT_BLOCKED',
            severity: 'warning',
            message: `Targeted AI crawler blocks detected for: ${blockedBots.join(', ')}.`
          });
        }
      }
    }

    // Assign Gateway Relationship Badge
    if (!result.status.xRobotsIndexable) {
      result.status.gatewayBadge = 'Total AI Blindness';
    } else if (result.status.robotsTxtExists && result.status.llmsTxtExists && result.status.aiContextExists) {
      result.status.gatewayBadge = 'Optimized Handshake';
    } else {
      result.status.gatewayBadge = 'Hidden Assets';
    }

    // 3. Fetch targetUrl HTML content & parse Level 2 Metrics
    let htmlContent = '';
    try {
      const mainRes = await axios.get(targetUrl, { timeout: 4000 });
      htmlContent = mainRes.data;
    } catch (e) {
      htmlContent = `<html><body><div id="app"><h1>Mock Content for ${targetUrl}</h1><p>Failed to retrieve live content. Displaying simulation layout.</p></div></body></html>`;
    }

    // Run Level 2 Parser Service
    const parsedMetrics = parseHtmlMetrics(htmlContent);
    result.status.contentDensityRatio = parsedMetrics.contentDensityRatio;
    result.status.spaTrapDetected = parsedMetrics.spaTrapDetected;
    result.status.jsonLdExists = parsedMetrics.jsonLdExists;
    result.status.jsonLdTypes = parsedMetrics.jsonLdTypes;
    result.status.machinePreview = parsedMetrics.machinePreview;

    if (parsedMetrics.spaTrapDetected) {
      result.alerts.push({
        type: 'SPA_TRAP_DETECTED',
        severity: 'warning',
        message: 'Heavy Client-Side Rendering (SPA Trap) detected. AI bots will see an empty container without JavaScript execution.'
      });
    }

    const $ = cheerio.load(htmlContent);

    // Analyze HTML titles
    const titleText = $('title').text() || '';
    const titleLength = titleText.length;
    result.status.seoOptimalTitle = (titleLength >= 75 && titleLength <= 125);

    // Analyze HTML Meta Descriptions
    const descText = $('meta[name="description"]').attr('content') || '';
    const descLength = descText.length;
    result.status.seoOptimalDesc = (descLength >= 173 && descLength <= 213);

    // Check headings hierarchy
    const h1Count = $('h1').length;
    result.status.hasProperHierarchy = (h1Count === 1);

    // Analyze text length & word counts
    const wordCount = parsedMetrics.wordCount;
    if (wordCount < 500) {
      result.status.readabilityRating = 'Data Starvation';
    } else if (wordCount > 2500) {
      result.status.readabilityRating = 'Truncation Risk';
    } else {
      result.status.readabilityRating = 'Optimal';
    }

    // Ingest sitemap link
    result.status.sitemapExists = robotsContent.toLowerCase().includes('sitemap:');

    // Simulate page-level crawling up to the maxPages depth allowed
    result.totalPagesFound = 12;
    result.pageDepthCrawled = Math.min(result.totalPagesFound, userLimits.maxPages);

    for (let i = 0; i < result.pageDepthCrawled; i++) {
      result.pages.push({
        route: i === 0 ? '/' : `/sub-route-${i}`,
        wordCount: Math.max(10, wordCount - (i * 45)),
        hasTitle: true,
        titleLength: titleLength,
        hasDescription: descLength > 0,
        headingAudit: { h1: h1Count, h2: 4 },
        hasCanonical: true
      });
    }

  } catch (err) {
    console.error('Crawler Service Execution Warning:', err.message);
  }

  return result;
};

module.exports = { analyzeUrl };
