/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO V4 Visualize Cockpit: Stage 3 Content Availability Live Wiring', () => {
  let container;

  // Realistic backend scan payload with multiple crawled pages showing different density/issue profiles
  const mockScanPayload = {
    status: 'success',
    targetUrl: 'https://thatworkx.com',
    duration: 3820,
    timestamp: '2026-09-07T10:00:00.000Z',
    results: {
      pages: [
        {
          url: 'https://thatworkx.com/pricing',
          wordCount: 95,
          textToHtmlRatio: 8.2,
          isCrawled: true,
          isThin: true,
          isHeavySpa: true,
          hasCanonical: false,
          hasAllRequired: false,
          missingRequired: ['footer'],
          missingAltCount: 1,
          missingAltList: [{ src: '/img/pricing-slider.png', suggestedAlt: 'Interactive pricing tier calculator' }],
          lastUpdated: null,
          hasSchema: false
        },
        {
          url: 'https://thatworkx.com/case-studies/enterprise',
          wordCount: 190,
          textToHtmlRatio: 13.5,
          isCrawled: true,
          isThin: true,
          isHeavySpa: true,
          hasCanonical: true,
          hasAllRequired: false,
          missingRequired: ['main'],
          missingAltCount: 2,
          missingAltList: [
            { src: '/img/chart.png', suggestedAlt: 'AEO citation growth chart' },
            { src: '/img/logo.png', suggestedAlt: 'Enterprise partner logo' }
          ],
          lastUpdated: null,
          hasSchema: false
        },
        {
          url: 'https://thatworkx.com/blog/aeo-vs-seo',
          wordCount: 1450,
          textToHtmlRatio: 41.0,
          isCrawled: true,
          isThin: false,
          isHeavySpa: false,
          hasCanonical: true,
          hasAllRequired: true,
          missingRequired: [],
          missingAltCount: 0,
          missingAltList: [],
          lastUpdated: '2026-09-02',
          hasSchema: true
        },
        {
          url: 'https://thatworkx.com/docs/quickstart',
          wordCount: 890,
          textToHtmlRatio: 33.5,
          isCrawled: true,
          isThin: false,
          isHeavySpa: false,
          hasCanonical: true,
          hasAllRequired: true,
          missingRequired: [],
          missingAltCount: 0,
          missingAltList: [],
          lastUpdated: '2026-09-05',
          hasSchema: true
        },
        {
          url: 'https://thatworkx.com/about',
          wordCount: 620,
          textToHtmlRatio: 44.1,
          isCrawled: true,
          isThin: false,
          isHeavySpa: false,
          hasCanonical: true,
          hasAllRequired: true,
          missingRequired: [],
          missingAltCount: 0,
          missingAltList: [],
          lastUpdated: '2026-08-30',
          hasSchema: true
        },
        {
          url: 'https://thatworkx.com/contact',
          wordCount: 480,
          textToHtmlRatio: 46.0,
          isCrawled: true,
          isThin: false,
          isHeavySpa: false,
          hasCanonical: true,
          hasAllRequired: true,
          missingRequired: [],
          missingAltCount: 0,
          missingAltList: [],
          lastUpdated: '2026-08-28',
          hasSchema: true
        },
        {
          url: 'https://thatworkx.com/privacy-policy',
          wordCount: 2100,
          textToHtmlRatio: 51.2,
          isCrawled: true,
          isThin: false,
          isHeavySpa: false,
          hasCanonical: true,
          hasAllRequired: true,
          missingRequired: [],
          missingAltCount: 0,
          missingAltList: [],
          lastUpdated: '2026-08-15',
          hasSchema: true
        }
      ],
      missingEssentialPages: ['/terms-of-service'],
      discoveredEssentialPages: ['/about', '/contact', '/pricing', '/privacy-policy'],
      capabilities: [
        { id: 3, name: 'Content Availability & Semantic Density', pillar: 'AI-Optimized', score: 68, status: 'WARN' }
      ]
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();

    container = document.createElement('div');
    container.id = 'stage3-test-root';
    container.innerHTML = `
      <div id="target-domain-badge">--</div>
      <div id="timestamp-label">--</div>
      <div id="scan-duration-label">--</div>
      <div id="total-pages-label">--</div>
      <nav id="desktop-stepper"></nav>
      
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
    `;
    document.body.appendChild(container);
  });

  afterEach(() => {
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    vi.restoreAllMocks();
  });

  it('1. Maps live crawled pages from backend into semantic density thermometers without mock defaults', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(mockScanPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Verifies live crawled pages appear with real ratios and word counts
    expect(canvasBody.innerHTML).toContain('https://thatworkx.com/pricing');
    expect(canvasBody.innerHTML).toContain('8.2%');
    expect(canvasBody.innerHTML).toContain('Words:');
    expect(canvasBody.innerHTML).toContain('95');
    expect(canvasBody.innerHTML).toContain('CRITICAL LOW');

    // Verifies the total pages badge reflects live pages count (7 pages)
    expect(canvasBody.innerHTML).toContain('7 Total Pages Scanned');
  });

  it('2. Renders in-page diagnostic fix drawers for issues detected in crawl', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(mockScanPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Page 1 (/pricing): thin content (<250 words), SPA warning, missing canonical link, missing semantic tag (footer), missing alt
    expect(canvasBody.innerHTML).toContain('Thin Content Warning (&lt; 250 words)');
    expect(canvasBody.innerHTML).toContain('SPA / Heavy JavaScript &amp; Deep DOM Nesting Detected');
    expect(canvasBody.innerHTML).toContain('Missing Canonical URL');
    expect(canvasBody.innerHTML).toContain('Missing Required Semantic HTML5 Tags');
    expect(canvasBody.innerHTML).toContain('Images Without Alt Attributes');
    expect(canvasBody.innerHTML).toContain('/img/pricing-slider.png');
    expect(canvasBody.innerHTML).toContain('Interactive pricing tier calculator');
  });

  it('3. Supports pagination: shows initial 5 pages and exposes Load More for remaining pages', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(mockScanPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Out of 7 pages, first 5 should be visible initially
    expect(canvasBody.innerHTML).toContain('Load Next 5 Pages (5 of 7 shown)');

    // Trigger load more
    visualize.loadMoreStage3Pages();

    // Now all 7 pages should be loaded
    expect(canvasBody.innerHTML).toContain('All 7 Scanned Pages Loaded');
    expect(canvasBody.innerHTML).toContain('https://thatworkx.com/privacy-policy');
  });

  it('4. Provides "View What AI sees" button for crawled pages', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(mockScanPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');
    expect(canvasBody.innerHTML).toContain('View What AI sees');
  });

  it('5. Strict Governance: ZERO occurrences of the banned term "AI-first"', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(mockScanPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const fullHtml = document.getElementById('stage3-test-root').innerHTML;
    expect(fullHtml.toLowerCase()).not.toContain('ai-first');
  });
});