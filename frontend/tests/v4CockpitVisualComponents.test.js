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

  describe('Rich Detail Specifications for Stages 4, 5, and 6', () => {
    it('Stage 5 Manifest Explorer Rich Detail: renders 4 level hierarchy cards with level badges and individual endpoint badges', async () => {
      const { renderStage5Canvas } = await import('../visualize.js');
      const container = document.createElement('div');
      const mockState = {
        isAudited: true,
        stage5: {
          score: '75%',
          status: 'WARN',
          manifests: [
            { path: '/robots.txt', exists: true, status: 200, statusBadge: '200 OK • AVAILABLE' },
            { path: '/sitemap.xml', exists: true, status: 200, statusBadge: 'AVAILABLE' },
            { path: '/llms.txt', exists: false, status: 404, statusBadge: 'MISSING' },
            { path: '/ai-context.md', exists: false, status: 404, statusBadge: 'MISSING' },
            { path: '/README.md', exists: true, status: 200, statusBadge: 'AVAILABLE' },
            { path: '/about.md', exists: false, status: 404, statusBadge: 'MISSING' },
            { path: '/docs.md', exists: false, status: 404, statusBadge: 'MISSING' },
            { path: '/content.md', exists: false, status: 404, statusBadge: 'MISSING' }
          ],
          level1Status: 'AVAILABLE',
          level2Status: 'PARTIAL',
          level3Status: 'MISSING',
          level4Status: 'PARTIAL'
        }
      };

      renderStage5Canvas(container, mockState);

      // Level 1: /robots.txt with explicit availability status badge ("200 OK • AVAILABLE" or "404 • MISSING")
      expect(container.innerHTML).toContain('/robots.txt');
      expect(container.innerHTML).toMatch(/200 OK • AVAILABLE|404 • MISSING/);

      // Level 2: /sitemap.xml and /llms.txt with individual status badges ("AVAILABLE" or "MISSING")
      expect(container.innerHTML).toMatch(/\/sitemap\.xml[\s\S]*?(AVAILABLE|MISSING)/);
      expect(container.innerHTML).toMatch(/\/llms\.txt[\s\S]*?(AVAILABLE|MISSING)/);

      // Level 3: /ai-context.md with individual status badge
      expect(container.innerHTML).toMatch(/\/ai-context\.md[\s\S]*?(AVAILABLE|MISSING)/);

      // Level 4: /README.md, /about.md, /docs.md, and /content.md with individual status badges
      expect(container.innerHTML).toMatch(/\/README\.md[\s\S]*?(AVAILABLE|MISSING)/);
      expect(container.innerHTML).toMatch(/\/about\.md[\s\S]*?(AVAILABLE|MISSING)/);
      expect(container.innerHTML).toMatch(/\/docs\.md[\s\S]*?(AVAILABLE|MISSING)/);
      expect(container.innerHTML).toMatch(/\/content\.md[\s\S]*?(AVAILABLE|MISSING)/);

      // Each of the 4 level cards must display a level header badge indicating "AVAILABLE", "PARTIAL", or "MISSING"
      const levelCards = container.querySelectorAll('.level-card, [data-level-card]');
      expect(levelCards.length).toBe(4);
      levelCards.forEach(card => {
        expect(card.textContent).toMatch(/AVAILABLE|PARTIAL|MISSING/);
      });
    });

    it('Stage 4 Entity Authority & E-E-A-T Rich Detail: renders JSON-LD types, author verification, and confirmed contact details', async () => {
      const { renderStage4Canvas } = await import('../visualize.js');
      const container = document.createElement('div');
      const mockState = {
        isAudited: true,
        stage4: {
          score: '85%',
          status: 'PASS',
          detectedTypes: ['Organization', 'WebSite'],
          hasAuthorBio: true,
          authorCredentialsVerified: true,
          contactDetails: {
            email: 'hello@thatworkx.com',
            phone: '+1-555-0100',
            isConfirmed: true
          }
        }
      };

      renderStage4Canvas(container, mockState);

      // Card 1 (Schema.org) must list actual detected JSON-LD types
      expect(container.textContent).toContain('Organization, WebSite');

      // Card 2 (Author E-E-A-T) must display whether author credentials/sameAs are verified
      expect(container.textContent).toMatch(/VERIFIED SAMEAS|sameAs Credentials/i);

      // Card 4 (Privacy & Contact) must display confirmed contact details (email/phone) or missing contact warnings
      expect(container.textContent).toContain('hello@thatworkx.com');
      expect(container.textContent).toContain('+1-555-0100');
    });

    it('Stage 6 Action Triage & Matrix Rich Detail: renders prioritized actions with rank badges and live 5-section scorecard matrix', async () => {
      const { renderStage6Canvas } = await import('../visualize.js');
      const container = document.createElement('div');
      const mockState = {
        isAudited: true,
        stages: {
          stage1: { score: '100%', status: 'PASS', summaryText: '20/20 Bots Allowed' },
          stage2: { score: '80%', status: 'PASS', summaryText: '4/5 Anchors Found' },
          stage3: { score: '75%', status: 'WARN', summaryText: 'Density Moderate' },
          stage4: { score: '90%', status: 'PASS', summaryText: 'Schema Grounded' },
          stage5: { score: '50%', status: 'FAIL', summaryText: 'Manifests Missing' }
        },
        stage6: {
          overallHealthIndex: 79,
          aiOptimizedScore: 86,
          aiReadyScore: 50,
          top5Actions: [
            { rank: 1, title: 'Deploy /llms.txt and /ai-context.md', desc: 'Missing Level 2 and Level 3 manifests', stepJump: 5, stage: 'Stage 5' },
            { rank: 2, title: 'Optimize low density routes', desc: 'Pages under 25% text-to-code ratio', stepJump: 3, stage: 'Stage 3' },
            { rank: 3, title: 'Add missing /pricing canonical anchor', desc: 'Essential route missing', stepJump: 2, stage: 'Stage 2' },
            { rank: 4, title: 'Add author Person sameAs links', desc: 'E-E-A-T credibility boost', stepJump: 4, stage: 'Stage 4' },
            { rank: 5, title: 'Allow GPTBot in robots.txt', desc: 'OpenAI crawler permission', stepJump: 1, stage: 'Stage 1' }
          ]
        }
      };

      renderStage6Canvas(container, mockState);

      // Top 5 Action Items must render prioritized action cards with rank badges (1 to 5) and working "Fix in Stage X" buttons
      for (let r = 1; r <= 5; r++) {
        expect(container.textContent).toContain(String(r));
      }
      expect(container.textContent).toContain('Fix in Stage 5');
      expect(container.textContent).toContain('Fix in Stage 3');
      expect(container.textContent).toContain('Fix in Stage 2');
      expect(container.textContent).toContain('Fix in Stage 4');
      expect(container.textContent).toContain('Fix in Stage 1');

      // 5-Section Scorecard Matrix at the bottom must render 5 distinct stage cards showing live scores from Stages 1-5
      expect(container.textContent).toContain('100%');
      expect(container.textContent).toContain('80%');
      expect(container.textContent).toContain('75%');
      expect(container.textContent).toContain('90%');
      expect(container.textContent).toContain('50%');
    });
  });
});
