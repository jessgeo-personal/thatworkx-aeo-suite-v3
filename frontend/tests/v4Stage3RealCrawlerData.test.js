/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AEO V4 Visualize Cockpit: Stage 3 Real Crawler Field Extraction', () => {
  let container;

  // Exact raw page schema as produced by crawlerService.js on thatworkx.com
  const realCrawlerPayload = {
    status: 'success',
    targetUrl: 'https://thatworkx.com',
    duration: 3200,
    timestamp: '2026-09-07T10:00:00.000Z',
    results: {
      pages: [
        {
          url: 'https://thatworkx.com/',
          wordCount: 1420,
          textRatio: 0.284, // 28.4% density
          content: 'Thatworkx AEO Suite audits AI search readiness across LLM crawlers.',
          canonical: 'https://thatworkx.com/',
          headings: {
            h1: ['AEO Suite V3 for Generative Search Ingestion'],
            h2: ['Why Traditional SEO Fails in AI', '4-Level Machine Manifest Architecture']
          },
          schemas: [
            { '@context': 'https://schema.org', '@type': 'Organization', name: 'Thatworkx' }
          ],
          images: [
            { src: '/images/logo.png', alt: 'Thatworkx Brand Logo' }
          ],
          semanticTags: { header: true, nav: true, main: true, footer: true }
        }
      ],
      missingEssentialPages: ['/pricing'],
      discoveredEssentialPages: ['/about', '/contact', '/privacy-policy', '/terms-of-service'],
      capabilities: [
        { id: 3, name: 'Content Availability & Semantic Density', pillar: 'AI-Optimized', score: 85, status: 'PASS' }
      ]
    }
  };

  beforeEach(() => {
    vi.restoreAllMocks();
    container = document.createElement('div');
    container.id = 'stage3-real-crawler-root';
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

  it('1. Correctly converts decimal textRatio (0.284 -> 28.4%) and avoids false SPA warning', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(realCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // 28.4% is healthy; it should NOT be flagged as SPA or Critical Low
    expect(canvasBody.innerHTML).toContain('28.4%');
    expect(canvasBody.innerHTML).not.toContain('SPA / Heavy JavaScript &amp; Deep DOM Nesting Detected');
  });

  it('2. Recognizes schemas array and canonical URL without generating false missing warnings', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(realCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Page has schema and canonical; it should not warn they are missing
    expect(canvasBody.innerHTML).not.toContain('Missing JSON-LD Schema');
    expect(canvasBody.innerHTML).not.toContain('Missing Canonical URL');
    expect(canvasBody.innerHTML).toContain('Organization');
  });

  it('3. Renders extracted content snippet and semantic headings outline from crawler data', async () => {
    const { mapBackendScanToV4State } = await import('../v4PayloadAdapter.js');
    const visualize = await import('../visualize.js');

    const mappedState = mapBackendScanToV4State(realCrawlerPayload);
    visualize.renderCockpit(mappedState);
    visualize.navigateToStep(3);

    const canvasBody = document.getElementById('canvas-body');

    // Extracted text content must be visible in the details drawer
    expect(canvasBody.innerHTML).toContain('Thatworkx AEO Suite audits AI search readiness');
    expect(canvasBody.innerHTML).toContain('AEO Suite V3 for Generative Search Ingestion');
    expect(canvasBody.innerHTML).toContain('4-Level Machine Manifest Architecture');
  });
});