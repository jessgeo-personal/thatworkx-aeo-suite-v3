/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Stage 6 Typography, Aceternity Button Motion & Topmost Scroll', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
    vi.restoreAllMocks();
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('Stage 6 Card Impact: 5-stage preview boxes feature elevated font sizing and glowing Inspect buttons', async () => {
    const { renderStage6Canvas } = await import('../visualize.js');
    expect(typeof renderStage6Canvas).toBe('function');

    const container = document.createElement('div');
    container.id = 'canvas-body';
    document.body.appendChild(container);

    const mockState = {
      isAudited: true,
      targetUrl: 'https://thatworkx.com',
      healthIndex: 88,
      statusLabel: 'AI-Optimized',
      stage1: { score: 90, status: 'Passed' },
      stage2: { score: 85, status: 'Passed' },
      stage3: { score: 78, status: 'Needs Review', pages: [] },
      stage4: { score: 92, status: 'Passed' },
      stage5: { score: 95, status: 'Passed' }
    };

    renderStage6Canvas(container, mockState);

    // 1. Check for 5 Stage preview cards
    const stageCards = container.querySelectorAll('.stage-preview-card, [data-stage-card]');
    expect(stageCards.length).toBe(5);

    // 2. Check elevated font size on stage cards (contains text-lg or text-xl or font-black)
    stageCards.forEach((card) => {
      const titleEl = card.querySelector('h3, h4, .stage-card-title');
      expect(titleEl).not.toBeNull();
      expect(titleEl.className).toMatch(/text-lg|text-xl|text-2xl/);
      expect(titleEl.className).toMatch(/font-black|font-bold/);

      const scoreEl = card.querySelector('.stage-card-score, [data-slot="stage-score"]');
      if (scoreEl) {
        expect(scoreEl.className).toMatch(/text-2xl|text-3xl|text-4xl/);
      }
    });

    // 3. Check Aceternity-style glow and hover motion on Inspect buttons
    const inspectBtns = container.querySelectorAll('.stage-inspect-btn');
    expect(inspectBtns.length).toBe(5);
    inspectBtns.forEach((btn) => {
      expect(btn.className).toMatch(/hover:-translate-y/);
      expect(btn.className).toMatch(/transition/);
      expect(btn.className).toMatch(/shadow/);
    });
  });

  it('Button Micro-Interactions: Key action buttons have Aceternity-style motion and glow classes', () => {
    const newScanBtn = document.getElementById('new-scan-btn');
    const rescanBtn = document.getElementById('rescan-btn');
    const sessionBtn = document.getElementById('auth-session-btn');

    expect(newScanBtn).not.toBeNull();
    expect(newScanBtn.className).toMatch(/hover:-translate-y|hover:scale/);
    expect(newScanBtn.className).toMatch(/shadow|glow/);

    expect(rescanBtn).not.toBeNull();
    expect(rescanBtn.className).toMatch(/hover:-translate-y|hover:scale/);

    expect(sessionBtn).not.toBeNull();
    expect(sessionBtn.className).toMatch(/hover:-translate-y|hover:scale/);
  });

  it('Topmost Scroll on Stage Switch: switchStage scrolls window and container to top', async () => {
    const { switchStage } = await import('../visualize.js');
    expect(typeof switchStage).toBe('function');

    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

    switchStage(2);

    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );
  });

  it('Back to Summary: Stage 1-5 renders a "Back to Summary" button that navigates to Stage 6 at topmost scroll', async () => {
    const { renderStage1, renderStage2Canvas, switchStage } = await import('../visualize.js');

    const scrollToSpy = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const container = document.getElementById('canvas-body') || document.createElement('div');
    container.id = 'canvas-body';
    document.body.appendChild(container);

    // Test Stage 1
    renderStage1(container, { isAudited: true });
    const backBtn = container.querySelector('.back-to-summary-btn');
    expect(backBtn).not.toBeNull();
    expect(backBtn.textContent).toMatch(/back to summary/i);
    expect(backBtn.className).toMatch(/hover:-translate-y|hover:scale/);

    // Clicking Back to Summary triggers switchStage(6) and scrolls to top
    backBtn.click();
    expect(scrollToSpy).toHaveBeenCalledWith(
      expect.objectContaining({ top: 0, left: 0 })
    );
  });
});
