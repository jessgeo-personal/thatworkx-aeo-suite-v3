/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO Suite V4: Authentic Prototype Cockpit Visual Components (Phase 2 RED)', () => {
  beforeEach(() => {
    // Setup clean DOM representing the prototype shell
    document.body.innerHTML = `
      <div id="app-viewport-wrapper">
        <aside id="main-terminal-sidebar" class="-translate-x-full">
          <div id="sidebar-verbose-copy"></div>
          <div id="sidebar-stage-pill"></div>
          <div id="sidebar-milestones-list"></div>
          <div id="sidebar-telemetry-stream"></div>
        </aside>
        <div id="sidebar-backdrop" class="opacity-0 pointer-events-none"></div>
        <header>
          <button id="btn-toggle-sidebar"></button>
          <input type="text" id="target-url-input" />
          <button id="cockpit-search-btn"></button>
          <button id="rescan-btn"></button>
          <strong id="target-domain-badge">--</strong>
          <strong id="timestamp-label">--</strong>
          <strong id="scan-duration-label">--</strong>
          <strong id="total-pages-label">--</strong>
          <nav id="desktop-stepper"></nav>
        </header>
        <div id="cockpit-error-banner" class="hidden" style="display: none;">
          <span class="error-msg"></span>
          <button id="banner-dismiss-btn">Dismiss</button>
        </div>
        <main id="main-workspace-canvas">
          <span id="canvas-stage-badge"></span>
          <span id="canvas-governance-badge"></span>
          <h1 id="canvas-stage-title"></h1>
          <p id="canvas-stage-desc"></p>
          <div id="canvas-score-pill">
            <span id="canvas-score-value"></span>
            <span id="canvas-score-status"></span>
          </div>
          <div id="canvas-return-anchor" class="hidden"></div>
          <div id="canvas-body"></div>
        </main>
      </div>
    `;
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('Prototype Step 6 Boardroom View: navigateToStep(6) renders circular SVG dial, dual-pillar bars, and top action items', async () => {
    const { navigateToStep, renderCockpit } = await import('../visualize.js');

    const mockState = {
      meta: { targetUrl: 'https://thatworkx.com', status: 'complete' },
      stage1: { crawlers: [{ name: 'GPTBot', allowed: true, status: 200 }] },
      stage2: { routes: [{ route: '/about', status: 'discovered' }], discoveredCount: 1, missingCount: 4 },
      stage3: { pages: [{ url: 'https://thatworkx.com/', wordCount: 850, textCodeRatioPercent: 32 }] },
      stage4: { detectedTypes: ['Organization'], hasAuthorBio: true },
      stage5: { governanceGate: 'AI-Ready', manifests: [{ path: '/robots.txt', exists: true, status: 200 }] },
      stage6: { overallHealthIndex: 97, aiOptimizedScore: 98, aiReadyScore: 96, triageFlags: [] }
    };

    renderCockpit(mockState);
    navigateToStep(6);

    const canvas = document.getElementById('canvas-body');
    expect(canvas).not.toBeNull();

    // 1. Neon circular dial SVG
    const svgDial = canvas.querySelector('svg circle[filter*="dial-neon-glow"], svg circle[stroke*="health-dial-gradient"]');
    expect(svgDial).not.toBeNull();
    expect(canvas.textContent).toContain('AEO Health Index Dial');
    expect(canvas.textContent).toContain('97');

    // 2. Dual-Pillar Readiness Breakdown
    expect(canvas.textContent).toContain('Dual-Pillar Readiness Breakdown');
    expect(canvas.textContent).toContain('Human Web Readiness');
    expect(canvas.textContent).toContain('Machine Web Readiness');

    // 3. Top 5 Urgent Action Items
    expect(canvas.textContent).toContain('Top 5 Urgent Action Items');

    // 4. 5-Section Scorecard Matrix
    expect(canvas.textContent).toContain('5-Section Scorecard Matrix');
    expect(canvas.querySelectorAll('[onclick*="navigateToStep"]').length).toBeGreaterThanOrEqual(5);
  });

  it('Prototype Step 1 Bot Access: navigateToStep(1) renders 50/50 split with Gateway Markers and 20-bot matrix', async () => {
    const { navigateToStep, renderCockpit } = await import('../visualize.js');

    const mockState = {
      meta: { targetUrl: 'https://thatworkx.com', status: 'complete' },
      stage1: {
        crawlers: [
          { name: 'GPTBot', allowed: true, status: 200 },
          { name: 'ClaudeBot', allowed: true, status: 200 },
          { name: 'PerplexityBot', allowed: true, status: 200 },
          { name: 'Googlebot', allowed: true, status: 200 }
        ]
      },
      stage6: { overallHealthIndex: 97 }
    };

    renderCockpit(mockState);
    navigateToStep(1);

    const canvas = document.getElementById('canvas-body');
    expect(canvas.textContent).toContain('What AI Search Engines See & Why It Matters');
    expect(canvas.textContent).toContain('Gateway & WAF Security Markers');
    expect(canvas.textContent).toContain('AI Crawler Allowance Matrix');
    expect(canvas.textContent).toContain('robots.txt Directives');
    expect(canvas.textContent).toContain('Cloudflare Challenge Gate');
    expect(canvas.textContent).toContain('X-Robots-Tag Server Headers');
  });

  it('Prototype Step 2 Essential Pages: navigateToStep(2) renders 5-anchor Kanban deck with status badges', async () => {
    const { navigateToStep, renderCockpit } = await import('../visualize.js');

    const mockState = {
      meta: { targetUrl: 'https://thatworkx.com', status: 'complete' },
      stage2: {
        routes: [
          { route: '/about', status: 'discovered' },
          { route: '/contact', status: 'discovered' },
          { route: '/privacy-policy', status: 'discovered' },
          { route: '/terms-of-service', status: 'discovered' },
          { route: '/pricing', status: 'missing' }
        ],
        discoveredCount: 4,
        missingCount: 1
      },
      stage6: { overallHealthIndex: 75 }
    };

    renderCockpit(mockState);
    navigateToStep(2);

    const canvas = document.getElementById('canvas-body');
    expect(canvas.textContent).toContain('5-Anchor Essential Kanban Matrix');
    expect(canvas.textContent).toContain('/about');
    expect(canvas.textContent).toContain('/contact');
    expect(canvas.textContent).toContain('/pricing');
    expect(canvas.textContent).toContain('/privacy-policy');
    expect(canvas.textContent).toContain('/terms-of-service');
  });

  it('Prototype Step 3 Content Density: navigateToStep(3) renders thermometer bars and View What AI Sees triggers', async () => {
    const { navigateToStep, renderCockpit } = await import('../visualize.js');

    const mockState = {
      meta: { targetUrl: 'https://thatworkx.com', status: 'complete' },
      stage3: {
        pages: [
          { url: 'https://thatworkx.com/solutions', wordCount: 820, textCodeRatioPercent: 32 }
        ]
      },
      stage6: { overallHealthIndex: 85 }
    };

    renderCockpit(mockState);
    navigateToStep(3);

    const canvas = document.getElementById('canvas-body');
    expect(canvas.textContent).toContain('Semantic Text Density Thermometers');
    expect(canvas.querySelector('.thermometer-track, [style*="width"]')).not.toBeNull();
    expect(canvas.textContent).toContain('View What AI sees');
  });

  it('Prototype Step 5 Manifests: navigateToStep(5) enforces 4-Level hierarchy cards under AI-Ready governance gate', async () => {
    const { navigateToStep, renderCockpit } = await import('../visualize.js');

    const mockState = {
      meta: { targetUrl: 'https://thatworkx.com', status: 'complete' },
      stage5: {
        governanceGate: 'AI-Ready',
        manifests: [
          { path: '/robots.txt', exists: true, status: 200 },
          { path: '/llms.txt', exists: false, status: 404 },
          { path: '/ai-context.md', exists: false, status: 404 }
        ]
      },
      stage6: { overallHealthIndex: 50 }
    };

    renderCockpit(mockState);
    navigateToStep(5);

    const canvas = document.getElementById('canvas-body');
    expect(canvas.textContent).toContain('4-LEVEL HIERARCHY');
    expect(canvas.textContent).toContain('LEVEL 1: PROTOCOL GATES');
    expect(canvas.textContent).toContain('LEVEL 2: THE WELCOME MAT');
    expect(canvas.textContent).toContain('LEVEL 3: CONTEXT MAPS');
    expect(canvas.textContent).toContain('LEVEL 4: WORKSPACES');
    expect(canvas.textContent).not.toMatch(/AI-first/i);
  });

  it('Sidebar Toggle: toggleSidebar opens and closes 3D drawer with overlay backdrop', async () => {
    const { toggleSidebar } = await import('../visualize.js');

    toggleSidebar(true);
    const sidebar = document.getElementById('main-terminal-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    expect(sidebar.classList.contains('-translate-x-full')).toBe(false);
    expect(backdrop.classList.contains('opacity-0')).toBe(false);

    toggleSidebar(false);
    expect(sidebar.classList.contains('-translate-x-full')).toBe(true);
    expect(backdrop.classList.contains('opacity-0')).toBe(true);
  });
});
