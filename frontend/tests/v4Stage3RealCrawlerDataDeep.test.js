/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO V4 Visualize Cockpit: Stage 3 Deep Crawler Field Safety & Extraction', () => {
  let container;

  // Exact payload structure matching the test-crawler image output
  const deepCrawlerPayload = {
    status: 'success',
    targetUrl: 'https://thatworkx.com',
    results: {
      pages: [
        {
          url: 'https://thatworkx.com/',
          wordCount: 760,
          contentDensityRatio: 587, // Unmapped key in original adapter
          titleLength: 78,
          headingHierarchy: 'Valid Hierarchy',
          headings: { H1: 1, H2: 4, H3: 5, H4: 11 }, // Object with numeric counts
          bodyTextSnippet: 'AI-Readiness Tools for your Web Presence', // Clean text
          content: '<main><h1>Massive HTML Dump</h1><script>alert("XSS")</script></main>', // Dangerous raw HTML fallback
          canonicalTag: 'https://thatworkx.com'
        }
      ]
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    container = document.createElement('div');
    container.id = 'stage3-deep-test-root';
    container.innerHTML = `
      <div id="target-domain-badge">--</div>
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

  it('1. Maps contentDensityRatio accurately and prevents false SPA warnings', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(deepCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Ratio should be 587%, not 0%
    expect(canvasBody.innerHTML).toContain('587% Density');
    // High density means NO SPA warning
    expect(canvasBody.innerHTML).not.toContain('SPA / Heavy JavaScript &amp; Deep DOM Nesting Detected');
  });

  it('2. Escapes raw HTML to prevent layout injection and prefers bodyTextSnippet', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(deepCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Should prioritize the clean snippet
    expect(canvasBody.innerHTML).toContain('AI-Readiness Tools for your Web Presence');
    
    // HTML MUST be escaped. The raw tags <main> should not exist in the DOM as active elements
    expect(canvasBody.innerHTML).not.toContain('<script>alert');
    // If the raw content is ever rendered, it must be escaped as &lt;script&gt;
  });

  it('3. Parses heading count objects (H1: 1, H2: 4) without crashing .map()', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(deepCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // It should render the numeric counts correctly since arrays are absent
    expect(canvasBody.innerHTML).toContain('H1: Count: 1');
    expect(canvasBody.innerHTML).toContain('H2: Count: 4');
  });
});