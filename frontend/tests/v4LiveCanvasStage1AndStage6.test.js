/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('Live Canvas Rendering: Stage 1 Directives, Bot Count & Stage 6 Default Flow', () => {
  let visualize;

  beforeEach(async () => {
    const htmlPath = resolve(__dirname, '../visualize.html');
    const htmlContent = readFileSync(htmlPath, 'utf-8');
    document.documentElement.innerHTML = htmlContent;

    visualize = await import('../visualize.js');
  });

  it('should render the "Allowed AI bots" card and "X/20 bots allowed" badge inside #canvas-body', () => {
    const canvas = document.getElementById('canvas-body');
    const mockState = {
      isAudited: true,
      currentStep: 1,
      completedSteps: [1],
      stage1: {
        score: '50%',
        status: 'WARN',
        crawlers: [
          { key: 'gptBot', name: 'GPTBot', allowed: true },
          { key: 'claudeBot', name: 'ClaudeBot', allowed: false }
        ]
      }
    };

    visualize.renderStage1(canvas, mockState);

    // 1. Assert "Allowed AI bots" directive exists in canvas-body
    const directiveCard = Array.from(canvas.querySelectorAll('.card, div'))
      .find(el => el.textContent.includes('Allowed AI bots'));
    expect(directiveCard, 'Allowed AI bots card must be rendered in canvas-body').toBeDefined();
    expect(directiveCard.textContent).toContain('Actual number of AI bots that are allowed to read your website');

    // 2. Assert Latency is NOT present in the crawler matrix header
    expect(canvas.textContent).not.toContain('LATENCY:');

    // 3. Assert "X/20 bots allowed" badge replaces latency
    expect(canvas.textContent).toMatch(/\d+\/20 bots allowed/);
  });

  it('should route executeCockpitScan directly to Stage 6 upon completion', async () => {
    global.fetch = () => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({
        targetUrl: 'https://example.com',
        status: 'completed',
        pages: [],
        missingEssentialPages: [],
        capabilities: { scores: { compositeHealth: 85 } }
      })
    });

    await visualize.executeCockpitScan('https://example.com');

    const state = visualize.getCockpitState();
    expect(state.currentStep, 'Active stage must default to Stage 6 post-scan').toBe(6);
  });
});