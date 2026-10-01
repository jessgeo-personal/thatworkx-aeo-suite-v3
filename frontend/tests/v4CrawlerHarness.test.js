/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('V4 Crawler Service Test Harness (frontend/test-crawler.html)', () => {
  let crawlerHarnessModule;
  let htmlTemplate;

  const mockCrawlerPayload = {
    success: true,
    service: 'crawlerService',
    targetUrl: 'https://example.com',
    data: {
      url: 'https://example.com',
      totalPagesFound: 3,
      pageDepthCrawled: 2,
      status: {
        robotsTxtExists: true,
        robotsTxtContent: 'User-agent: *\nDisallow: /admin\n',
        robotsTxtStatusCode: 200,
        robotsFetchMs: 142,
        sitemapExists: true,
        sitemapContent: '<urlset><url><loc>https://example.com/</loc></url></urlset>',
        sitemapStatusCode: 200,
        llmsTxtExists: true,
        aiContextExists: false,
        aboutTxtExists: false,
        docsTxtExists: false,
        contentTxtExists: false,
        isWafBlocked: false,
        contentDensityRatio: 0.35,
        botPermissions: {
          gptBot: true,
          chatGptUser: true,
          oaiSearchBot: true,
          claudeBot: false,
          claudeWeb: true,
          claudeSearchBot: true,
          googleExtended: false,
          googlebot: true,
          bingbot: true,
          perplexityBot: true,
          applebotExtended: true,
          metaExternalAgent: true,
          metaWebIndexer: true,
          amazonbot: true,
          bytespider: true,
          ccBot: true,
          cohereAi: true,
          mistralBot: true,
          qwenBot: true,
          baiduAnsur: true
        }
      },
      manifestPreviews: {
        robotsTxt: 'User-agent: *\nDisallow: /admin\n',
        sitemap: '<urlset><url><loc>https://example.com/</loc></url></urlset>',
        llmsTxt: '# LLMs.txt for Example'
      },
      pages: [
        {
          route: '/',
          url: 'https://example.com/',
          title: 'Example Domain Title Optimally Formatted For High Authority Testing 123',
          titleLength: 76,
          metaDescription: 'Detailed meta description that provides context.',
          wordCount: 1540,
          textCodeRatio: 0.35,
          headingAudit: {
            h1: 1,
            h2: 4,
            h3: 2,
            h4: 0,
            isHierarchyValid: true
          },
          hasCanonical: true,
          canonicalUrl: 'https://example.com/',
          bodySnippet: 'Example domain body paragraph snippet text.'
        },
        {
          route: '/about',
          url: 'https://example.com/about',
          title: 'About Us',
          titleLength: 8,
          metaDescription: 'Learn more about our team and mission.',
          wordCount: 620,
          textCodeRatio: 0.22,
          headingAudit: {
            h1: 1,
            h2: 2,
            h3: 0,
            h4: 0,
            isHierarchyValid: true
          },
          hasCanonical: false,
          canonicalUrl: '',
          bodySnippet: 'About us page snippet information.'
        }
      ],
      discoveredRoutes: ['/', '/about', '/pricing']
    }
  };

  beforeEach(async () => {
    // Load actual test-crawler.html file contents
    const htmlPath = path.join(__dirname, '../test-crawler.html');
    htmlTemplate = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlTemplate;

    // Reset URL
    delete window.location;
    window.location = new URL('http://localhost:3000/test-crawler.html');

    crawlerHarnessModule = await import('../test-crawler.js');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('Gate 1: Pre-probe initial state contains neutral placeholders and clean UI', () => {
    crawlerHarnessModule.initCrawlerHarness();

    expect(document.getElementById('metric-target-url').textContent).toBe('--');
    expect(document.getElementById('metric-status-badge').textContent).toBe('--');
    expect(document.getElementById('metric-latency').textContent).toBe('--');
    expect(document.getElementById('metric-total-urls').textContent).toBe('--');
    expect(document.getElementById('metric-depth-crawled').textContent).toBe('--');
    expect(document.getElementById('metric-waf-status').textContent).toBe('--');
    expect(document.getElementById('crawler-error-banner').classList.contains('hidden')).toBe(true);
  });

  it('Gate 2: Renders all 20 discrete AI Bot permission cards with exact names and ALLOWED/BLOCKED status', () => {
    crawlerHarnessModule.renderCrawlerData(mockCrawlerPayload, 'https://example.com');

    const botsContainer = document.getElementById('bots-matrix-container');
    const botCards = botsContainer.querySelectorAll('[data-bot-key]');
    expect(botCards.length).toBe(20);

    // Verify allowed bot
    const gptBotCard = botsContainer.querySelector('[data-bot-key="gptBot"]');
    expect(gptBotCard).not.toBeNull();
    expect(gptBotCard.textContent).toContain('GPTBot');
    expect(gptBotCard.textContent).toContain('ALLOWED');

    // Verify blocked bot
    const claudeBotCard = botsContainer.querySelector('[data-bot-key="claudeBot"]');
    expect(claudeBotCard).not.toBeNull();
    expect(claudeBotCard.textContent).toContain('ClaudeBot');
    expect(claudeBotCard.textContent).toContain('BLOCKED');

    // Verify counter badges
    expect(document.getElementById('bot-allowed-count').textContent).toContain('18 Allowed');
    expect(document.getElementById('bot-blocked-count').textContent).toContain('2 Blocked');
  });

  it('Gate 3: Itemizes each crawled page with word count, H1-H4 headings breakdown, and canonical tag', () => {
    crawlerHarnessModule.renderCrawlerData(mockCrawlerPayload, 'https://example.com');

    const pagesContainer = document.getElementById('pages-list-container');
    const pageCards = pagesContainer.querySelectorAll('[data-page-route]');
    expect(pageCards.length).toBe(2);

    // First page assertions
    const page1 = pageCards[0];
    expect(page1.textContent).toContain('/');
    expect(page1.textContent).toContain('1,540 words');
    expect(page1.textContent).toContain('H1: 1');
    expect(page1.textContent).toContain('H2: 4');
    expect(page1.textContent).toContain('H3: 2');
    expect(page1.textContent).toContain('H4: 0');
    expect(page1.textContent).toContain('Valid Hierarchy');
    expect(page1.textContent).toContain('https://example.com/');
    expect(page1.textContent).toContain('Example domain body paragraph snippet text.');

    // Second page assertions
    const page2 = pageCards[1];
    expect(page2.textContent).toContain('/about');
    expect(page2.textContent).toContain('620 words');
    expect(page2.textContent).toContain('None'); // Missing canonical
    expect(page2.textContent).toContain('About us page snippet information.');
  });

  it('Gate 4: Correctly displays socket latency (robotsFetchMs) and manifest probe settlement', () => {
    crawlerHarnessModule.renderCrawlerData(mockCrawlerPayload, 'https://example.com');

    // Socket latency
    expect(document.getElementById('metric-latency').textContent).toBe('142 ms');

    // Manifest probes
    const manifestContainer = document.getElementById('manifest-probes-container');
    const robotsProbe = manifestContainer.querySelector('[data-manifest="/robots.txt"]');
    expect(robotsProbe).not.toBeNull();
    expect(robotsProbe.textContent).toContain('200 OK');
    expect(robotsProbe.textContent).toContain('User-agent: *');

    const sitemapProbe = manifestContainer.querySelector('[data-manifest="/sitemap.xml"]');
    expect(sitemapProbe).not.toBeNull();
    expect(sitemapProbe.textContent).toContain('200 OK');
    expect(sitemapProbe.textContent).toContain('<urlset>');

    const llmsProbe = manifestContainer.querySelector('[data-manifest="/llms.txt"]');
    expect(llmsProbe).not.toBeNull();
    expect(llmsProbe.textContent).toContain('200 OK');
    expect(llmsProbe.textContent).toContain('# LLMs.txt for Example');

    const aiContextProbe = manifestContainer.querySelector('[data-manifest="/ai-context.md"]');
    expect(aiContextProbe).not.toBeNull();
    expect(aiContextProbe.textContent).toContain('404 NOT FOUND');
  });

  it('Gate 5: Discovered routes pool and unfiltered JSON inspection drawer populate accurately', () => {
    crawlerHarnessModule.renderCrawlerData(mockCrawlerPayload, 'https://example.com');

    const routesContainer = document.getElementById('discovered-routes-container');
    expect(routesContainer.textContent).toContain('/');
    expect(routesContainer.textContent).toContain('/about');
    expect(routesContainer.textContent).toContain('/pricing');

    const jsonDump = document.getElementById('raw-json-dump').textContent;
    expect(jsonDump).toContain('"service": "crawlerService"');
    expect(jsonDump).toContain('"targetUrl": "https://example.com"');
  });

  it('Gate 6: Network error and HTTP 422 trigger error banner gracefully without unhandled exceptions', async () => {
    const fetchSpy = vi.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 422,
      json: async () => ({
        success: false,
        service: 'crawlerService',
        error: 'Target domain could not be resolved or reached.'
      })
    });

    await crawlerHarnessModule.runCrawlerProbe('https://unreachable-domain-12345.xyz');

    expect(fetchSpy).toHaveBeenCalledWith('/api/test/crawler', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl: 'https://unreachable-domain-12345.xyz', maxPages: 25 })
    });

    const errorBanner = document.getElementById('crawler-error-banner');
    expect(errorBanner.classList.contains('hidden')).toBe(false);
    expect(document.getElementById('crawler-error-message').textContent).toContain('Target domain could not be resolved or reached.');
  });

  it('Gate 7: Strict System Governance: Zero occurrences of banned vocabulary "AI-first"', () => {
    expect(htmlTemplate).not.toMatch(/AI-first/i);
    const renderedBody = document.body.innerHTML;
    expect(renderedBody).not.toMatch(/AI-first/i);
  });
});
