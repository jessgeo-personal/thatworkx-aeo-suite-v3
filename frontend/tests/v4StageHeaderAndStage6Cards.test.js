/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Stage Header Synchronization & Stage 6 Horizontal Cards', () => {
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

  it('Header Title Synchronization: switchStage updates stage title and subtitle across Stages 1-6', async () => {
    const { switchStage } = await import('../visualize.js');

    // 1. Switch to Stage 1: Header must reflect Crawler Access
    switchStage(1);
    const stageTitle = document.getElementById('stage-title') || document.getElementById('stage-header-title');
    expect(stageTitle).not.toBeNull();
    expect(stageTitle.textContent).toMatch(/crawler access|allowance/i);
    expect(stageTitle.textContent).not.toMatch(/executive summary/i);

    // 2. Switch to Stage 3: Header must reflect Content Density
    switchStage(3);
    expect(stageTitle.textContent).toMatch(/content density|depth/i);
    expect(stageTitle.textContent).not.toMatch(/executive summary/i);

    // 3. Switch back to Stage 6: Header must reflect Executive Summary
    switchStage(6);
    expect(stageTitle.textContent).toMatch(/executive summary|action triage/i);
  });

  it('Stage 6 Card Layout: 2-column desktop grid with horizontal bar architecture', async () => {
    const { renderStage6Canvas } = await import('../visualize.js');

    const container = document.createElement('div');
    container.id = 'canvas-body';
    document.body.appendChild(container);

    const mockState = {
      isAudited: true,
      targetUrl: 'https://thatworkx.com',
      stage1: { score: 90, status: 'Passed' },
      stage2: { score: 65, status: 'Needs Review' },
      stage3: { score: 40, status: 'Failed', pages: [] },
      stage4: { score: 85, status: 'Passed' },
      stage5: { score: 95, status: 'Passed' }
    };

    renderStage6Canvas(container, mockState);

    // 1. Grid should be 1-col mobile / 2-col desktop (lg:grid-cols-2)
    const gridContainer = container.querySelector('.stage-preview-grid, [data-stage-grid]');
    expect(gridContainer).not.toBeNull();
    expect(gridContainer.className).toMatch(/lg:grid-cols-2/);
    expect(gridContainer.className).not.toMatch(/lg:grid-cols-3/);

    // 2. Exactly 5 stage preview cards rendered
    const cards = container.querySelectorAll('.stage-preview-card, [data-stage-card]');
    expect(cards.length).toBe(5);

    // 3. Status badges must display prominent PASS, WARN, or FAIL pills
    const statusBadges = container.querySelectorAll('.stage-status-pill, [data-slot="stage-status"]');
    expect(statusBadges.length).toBe(5);

    const badgeTexts = Array.from(statusBadges).map(b => b.textContent.trim());
    expect(badgeTexts).toContain('PASS');
    expect(badgeTexts).toContain('WARN');
    expect(badgeTexts).toContain('FAIL');

    // 4. Verify high-voltage glow styling on the badges
    statusBadges.forEach(badge => {
      expect(badge.className).toMatch(/border-2/);
      expect(badge.className).toMatch(/font-black/);
    });
  });
});
