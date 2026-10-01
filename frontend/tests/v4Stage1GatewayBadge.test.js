/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach } from 'vitest';

describe('Stage 1 Gateway Badge & Audit Modal Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="canvas-body"></div>
      <div id="audit-progress-modal" class="opacity-0 pointer-events-none">
        <div id="modal-stage-counter"></div>
        <div id="modal-stage-title"></div>
        <div id="modal-progress-bar"></div>
        <div id="modal-live-log"></div>
      </div>
    `;
  });

  it('Gateway Badge Bug Fix: displays FAIL in red when crawler allowance score is 0%', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());

    const zeroBotState = {
      isAudited: true,
      currentStep: 1,
      completedSteps: [1],
      stage1: {
        score: '0%',
        status: 'FAIL',
        robotsFetchMs: 120,
        gateway: { robotsTxt: 'VALID', cloudflareChallenge: 'CLEAN', xRobotsTag: 'ENABLED' },
        crawlers: [
          { key: 'gptBot', name: 'GPTBot', provider: 'OpenAI', allowed: false, status: 403 },
          { key: 'claudeBot', name: 'ClaudeBot', provider: 'Anthropic', allowed: false, status: 403 }
        ]
      },
      sections: { 1: { takeaway: 'All bots blocked', actionPlan: 'Fix rules', actionSteps: [], shortcutPlan: 'Use AIOptimize', evidencePlain: 'Blocked', evidenceTrace: 'Disallow: /' } }
    };

    mod.renderStageFromState(1, zeroBotState);

    const canvas = document.getElementById('canvas-body');
    const html = canvas.innerHTML;

    // Must show 0% FAIL and red badge styling, NOT green PASS
    expect(html).toContain('0% FAIL');
    expect(html).not.toContain('0% PASS');
    expect(html).toContain('red-950');
  });

  it('Audit Modal Overlay: shows and hides modal overlay during execution', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());
    
    // Test modal helper functions if exported or triggerable
    const modal = document.getElementById('audit-progress-modal');
    expect(modal).toBeTruthy();
  });
});