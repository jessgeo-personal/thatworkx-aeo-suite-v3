import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
const { analyzeUrl } = require('../../services/crawlerService');

describe('Backend Inaccessible Domain Zero-Fallback Gate (RED Phase)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Gate 6 & Gate 4: When target domain fails DNS resolution (ENOTFOUND), analyzeUrl must abort with status failed, 0 pages, and 0 score', async () => {
    // Mock axios to simulate DNS resolution failure for all HTTP calls to the domain
    const dnsError = new Error('getaddrinfo ENOTFOUND ab.yu');
    dnsError.code = 'ENOTFOUND';

    vi.spyOn(axios, 'get').mockRejectedValue(dnsError);

    const targetUrl = 'https://ab.yu';
    const userLimits = { tier: 'free', maxPages: 5 };

    const result = await analyzeUrl(targetUrl, userLimits);

    // 1. Status must explicitly declare failure, not complete/object
    expect(result.status).toBe('failed');

    // 2. Error message must reflect the network exception
    expect(result.error).toContain('ENOTFOUND');

    // 3. ZERO Dummy Data: Must not inject dummy page '/' or claim totalPagesFound: 1
    expect(result.pages).toHaveLength(0);
    expect(result.totalPagesFound).toBe(0);
    expect(result.pageDepthCrawled).toBe(0);

    // 4. Zero Score: Must NOT evaluate default capabilities to 15/100
    expect(result.overallScore).toBe(0);
    expect(result.pillarScores.P1).toBe(0);
    expect(result.pillarScores.P2).toBe(0);
    expect(result.pillarScores.P3).toBe(0);
    expect(result.pillarScores.P4).toBe(0);
    expect(result.scoreCard.overallScore).toBe(0);
    expect(result.scoreCard.classification).toBe('UNAUDITED');
  });

  it('Gate 2: Crawler must not default AI bot permissions to true when robots.txt is unreachable due to network failure', async () => {
    const netError = new Error('connect ECONNREFUSED 127.0.0.1:443');
    netError.code = 'ECONNREFUSED';

    vi.spyOn(axios, 'get').mockRejectedValue(netError);

    const result = await analyzeUrl('https://dead-server.invalid', { tier: 'free' });

    // Must not retain default { gptBot: true, perplexityBot: true, claudeBot: true, googleExtended: true }
    if (result.status && typeof result.status === 'object' && result.status.botPermissions) {
      expect(result.status.botPermissions.gptBot).not.toBe(true);
      expect(result.status.botPermissions.claudeBot).not.toBe(true);
    } else {
      expect(result.status).toBe('failed');
    }
  });
});
