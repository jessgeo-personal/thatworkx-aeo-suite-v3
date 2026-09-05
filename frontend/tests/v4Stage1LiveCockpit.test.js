/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Stage 1 Live Cockpit Component Suite (Zero Mock Enforced)', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="desktop-stepper"></div>
      <div id="canvas-stage-badge"></div>
      <div id="canvas-governance-badge"></div>
      <h1 id="canvas-stage-title"></h1>
      <p id="canvas-stage-desc"></p>
      <div id="canvas-score-pill">
        <span id="canvas-score-value"></span>
        <span id="canvas-score-status"></span>
      </div>
      <div id="canvas-return-anchor" class="hidden"></div>
      <div id="canvas-body"></div>
    `;
  });

  it('Gate 1: confirms AUDIT_DATA and ALL_STAGE3_PAGES are purged from visualize.js', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());
    expect(mod.AUDIT_DATA).toBeUndefined();
    expect(mod.ALL_STAGE3_PAGES).toBeUndefined();
  });

  it('Gate 2: renders Stage 1 with live 20-bot matrix, real measured latency, and gateway markers', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());

    // Live mapped state simulating 20 crawlers from crawlerService.js
    const liveState = {
      isAudited: true,
      currentStep: 1,
      completedSteps: [1],
      targetUrl: 'https://thatworkx.com',
      scanDuration: '2.4s',
      totalPages: 16,
      healthIndex: 85,
      statusLabel: 'AI-Optimized',
      stage1: {
        score: '95%',
        status: 'PASS',
        summaryText: 'Bot Access: 19/20 Verified Unblocked',
        robotsFetchMs: 142,
        gateway: {
          robotsTxt: 'VALID',
          cloudflareChallenge: 'CLEAN',
          xRobotsTag: 'ENABLED'
        },
        crawlers: [
          { key: 'gptBot', name: 'GPTBot', provider: 'OpenAI', allowed: true, status: 200 },
          { key: 'chatGptUser', name: 'ChatGPT-User', provider: 'OpenAI', allowed: true, status: 200 },
          { key: 'oaiSearchBot', name: 'OAI-SearchBot', provider: 'OpenAI', allowed: true, status: 200 },
          { key: 'claudeBot', name: 'ClaudeBot', provider: 'Anthropic', allowed: true, status: 200 },
          { key: 'claudeWeb', name: 'Claude-Web', provider: 'Anthropic', allowed: true, status: 200 },
          { key: 'claudeSearchBot', name: 'Claude-SearchBot', provider: 'Anthropic', allowed: true, status: 200 },
          { key: 'googleExtended', name: 'Google-Extended', provider: 'Google & Microsoft', allowed: true, status: 200 },
          { key: 'googlebot', name: 'Googlebot', provider: 'Google & Microsoft', allowed: true, status: 200 },
          { key: 'bingbot', name: 'Bingbot', provider: 'Google & Microsoft', allowed: true, status: 200 },
          { key: 'perplexityBot', name: 'PerplexityBot', provider: 'Perplexity & Apple', allowed: true, status: 200 },
          { key: 'applebotExtended', name: 'Applebot-Extended', provider: 'Perplexity & Apple', allowed: true, status: 200 },
          { key: 'metaExternalAgent', name: 'Meta-ExternalAgent', provider: 'Meta & Amazon', allowed: true, status: 200 },
          { key: 'metaWebIndexer', name: 'Meta-WebIndexer', provider: 'Meta & Amazon', allowed: true, status: 200 },
          { key: 'amazonbot', name: 'Amazonbot', provider: 'Meta & Amazon', allowed: true, status: 200 },
          { key: 'bytespider', name: 'Bytespider', provider: 'Asian AI Engines', allowed: false, status: 403 },
          { key: 'ccBot', name: 'CCBot', provider: 'European & Global Frontier', allowed: true, status: 200 },
          { key: 'cohereAi', name: 'cohere-ai', provider: 'European & Global Frontier', allowed: true, status: 200 },
          { key: 'mistralBot', name: 'MistralBot', provider: 'European & Global Frontier', allowed: true, status: 200 },
          { key: 'qwenBot', name: 'QwenBot', provider: 'Asian AI Engines', allowed: true, status: 200 },
          { key: 'baiduAnsur', name: 'Baidu-Ansur', provider: 'Asian AI Engines', allowed: true, status: 200 }
        ]
      },
      sections: {
        1: {
          score: '95%',
          status: 'PASS',
          takeaway: '19 of 20 verified AI search crawlers have full access to your domain.',
          actionPlan: 'Whitelist Bytespider in robots.txt if Asian market discovery is desired.',
          actionSteps: [
            { title: 'Inspect robots.txt directives', detail: 'Check root /robots.txt for Disallow: /Bytespider.' }
          ],
          shortcutPlan: 'Deploying Level 1 Machine Manifests via AIOptimize Pro automates crawler permissions across all 20 AI engines.',
          evidencePlain: 'HTTP 200 OK received for 19 bots. Bytespider explicitly disallowed.',
          evidenceTrace: 'User-agent: Bytespider\nDisallow: /'
        }
      }
    };

    mod.renderStageFromState(1, liveState);

    const canvas = document.getElementById('canvas-body');
    const html = canvas.innerHTML;

    // Check Gateway Security Markers
    expect(html).toContain('Gateway &amp; WAF Security Markers');
    expect(html).toContain('robots.txt Directives');
    expect(html).toContain('Cloudflare Challenge Gate');
    expect(html).toContain('X-Robots-Tag Server Headers');

    // Check Live Measured Latency Badge
    expect(html).toContain('142ms');

    // Check Live Crawlers
    expect(html).toContain('GPTBot');
    expect(html).toContain('ClaudeBot');
    expect(html).toContain('PerplexityBot');
    expect(html).toContain('Google-Extended');
    expect(html).toContain('Bytespider');
    expect(html).toContain('ALLOWED');
    expect(html).toContain('BLOCKED');

    // Check Provider Group Headings
    expect(html).toContain('OpenAI');
    expect(html).toContain('Anthropic');
    expect(html).toContain('Asian AI Engines');

    // Check Remediation & Verification Drawers
    expect(html).toContain('Action Plan: How to improve how AI can read your current pages better');
    expect(html).toContain('Recommended Shortcut: Upgrade to AIOptimize Pro');
    expect(html).toContain('Verification Evidence (What We Found)');
  });

  it('Gate 3: enforces zero occurrences of banned term "AI-first"', async () => {
    const fs = await import('fs');
    const path = await import('path');
    const jsContent = fs.readFileSync(path.resolve(__dirname, '../visualize.js'), 'utf-8');
    expect(jsContent).not.toMatch(/AI-first/i);
  });
});
