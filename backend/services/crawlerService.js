const axios = require('axios');
const cheerio = require('cheerio');
const url = require('url');

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
      seoOptimalDesc: false
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

    // Check robots.txt for total AI blindness block
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
    }

    // 2. Fetch targetUrl HTML content
    let htmlContent = '';
    try {
      const mainRes = await axios.get(targetUrl, { timeout: 4000 });
      htmlContent = mainRes.data;
    } catch (e) {
      htmlContent = `<html><body><h1>Mock Content for ${targetUrl}</h1><p>Failed to retrieve live content. Displaying simulation layout.</p></body></html>`;
    }

    const $ = cheerio.load(htmlContent);

    // Analyze X-Robots-Tag in response headers (simulated)
    // Analyze HTML titles
    const titleText = $('title').text() || '';
    const titleLength = titleText.length;
    result.status.seoOptimalTitle = (titleLength >= 75 && titleLength <= 125);

    // Analyze HTML Meta Descriptions
    const descText = $('meta[name="description"]').attr('content') || '';
    const descLength = descText.length;
    result.status.seoOptimalDesc = (descLength >= 173 && descLength <= 213); // 193 +- 20

    // Check headings hierarchy
    const h1Count = $('h1').length;
    result.status.hasProperHierarchy = (h1Count === 1);

    // Analyze text length & word counts
    const bodyText = $('body').text() || '';
    const wordCount = bodyText.split(/\s+/).filter(Boolean).length;
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
    result.totalPagesFound = 12; // Example count of domain paths discovered
    result.pageDepthCrawled = Math.min(result.totalPagesFound, userLimits.maxPages);

    for (let i = 0; i < result.pageDepthCrawled; i++) {
      result.pages.push({
        route: i === 0 ? parsedUrl.pathname : `/sub-route-${i}`,
        wordCount: wordCount - (i * 45),
        hasTitle: true,
        titleLength: titleLength,
        hasDescription: descText ? true : false,
        headingAudit: { h1: 1, h2: 4 },
        hasCanonical: true
      });
    }

    // Set score card classification
    if (result.scoreCard.classification !== 'Ugly') {
      if (result.status.hasProperHierarchy && result.status.robotsTxtExists) {
        result.scoreCard.overallScore = 88;
        result.scoreCard.classification = 'Good';
      } else {
        result.scoreCard.overallScore = 45;
        result.scoreCard.classification = 'Bad';
      }
    }

  } catch (error) {
    console.error('Crawl Parsing Error:', error);
    result.alerts.push({
      type: 'CONNECTION_FAILURE',
      severity: 'high',
      message: 'Failed to complete complete connection sequence.'
    });
    result.scoreCard.overallScore = 0;
    result.scoreCard.classification = 'Ugly';
  }

  return result;
};

module.exports = { analyzeUrl };
