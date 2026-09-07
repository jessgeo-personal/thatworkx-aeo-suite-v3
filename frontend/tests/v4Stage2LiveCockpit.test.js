/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO V4 Visualize Cockpit: Stage 2 Canonical Routes Live Wiring', () => {
  let container;

  const mockScanPayload = {
    status: 'success',
    targetUrl: 'https://thatworkx.com',
    duration: 3820,
    timestamp: '2026-09-07T10:00:00.000Z',
    pages: [
      { url: 'https://thatworkx.com/about', isCrawled: true },
      { url: 'https://thatworkx.com/contact', isCrawled: true },
      { url: 'https://thatworkx.com/privacy-policy', isCrawled: true },
      { url: 'https://thatworkx.com/terms-of-service', isCrawled: true }
    ],
    discoveredEssentialPages: ['/about', '/contact', '/privacy-policy', '/terms-of-service'],
    missingEssentialPages: ['/pricing'],
    capabilities: [
      { id: 2, name: 'Essential Content Anchors', pillar: 'AI-Optimized', score: 80, status: 'WARN' }
    ]
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    container = document.createElement('div');
    container.id = 'stage2-test-root';
    container.innerHTML = `
      <span id="canvas-stage-badge"></span>
      <span id="canvas-governance-badge"></span>
      <h1 id="canvas-stage-title"></h1>
      <p id="canvas-stage-desc"></p>
      <div id="canvas-body"></div>
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('1. Maps live backend discovered and missing essential routes without hardcoded fixture fallback', async () => {
    const visualize = await import('../visualize.js');
    
    // Feed live backend payload directly into Stage 2 mapping
    visualize.updateStage2FromPayload(mockScanPayload);
    visualize.renderStage2Canvas(document.getElementById('canvas-body'));

    const canvasBody = document.getElementById('canvas-body');
    
    // Verifies all 5 canonical routes are evaluated
    expect(canvasBody.innerHTML).toContain('/about');
    expect(canvasBody.innerHTML).toContain('/contact');
    expect(canvasBody.innerHTML).toContain('/pricing');
    expect(canvasBody.innerHTML).toContain('/privacy-policy');
    expect(canvasBody.innerHTML).toContain('/terms-of-service');

    // /pricing must be marked MISSING with 0% citation score
    expect(canvasBody.innerHTML).toContain('404 Not Found');
    expect(canvasBody.innerHTML).toContain('0%');
  });

  it('2. Shows summary count of 4 FOUND and 1 MISSING (/pricing)', async () => {
    const visualize = await import('../visualize.js');
    visualize.updateStage2FromPayload(mockScanPayload);
    visualize.renderStage2Canvas(document.getElementById('canvas-body'));

    const canvasBody = document.getElementById('canvas-body');
    expect(canvasBody.innerHTML).toContain('4 FOUND • 1 MISSING (/pricing)');
  });

  it('3. Renders the V4 Prototype structure: Takeaway, Kanban Cards, Action Plan, and Evidence', async () => {
    const visualize = await import('../visualize.js');
    visualize.updateStage2FromPayload(mockScanPayload);
    visualize.renderStage2Canvas(document.getElementById('canvas-body'));

    const canvasBody = document.getElementById('canvas-body');

    // Tier 1 Takeaway header
    expect(canvasBody.innerHTML).toContain('What AI Search Engines See &amp; Why It Matters');
    // Kanban deck container
    expect(canvasBody.innerHTML).toContain('kanban-grid-container');
    // Action Plan and Shortcut Box
    expect(canvasBody.innerHTML).toContain('Action Plan:');
    expect(canvasBody.innerHTML).toContain('Recommended Shortcut:');
    // Evidence Drawer
    expect(canvasBody.innerHTML).toContain('Verification Evidence');
  });

  it('4. Strict Governance: ZERO occurrences of the banned term "AI-first"', async () => {
    const visualize = await import('../visualize.js');
    visualize.updateStage2FromPayload(mockScanPayload);
    visualize.renderStage2Canvas(document.getElementById('canvas-body'));

    const fullHtml = document.getElementById('stage2-test-root').innerHTML;
    expect(fullHtml.toLowerCase()).not.toContain('ai-first');
  });
});
