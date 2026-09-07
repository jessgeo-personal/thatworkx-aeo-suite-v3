const { parsePageHtml } = require('../services/crawlerService');

describe('backend/services/crawlerService - parsePageHtml Contract Audit', () => {
  const sampleHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <title>Thatworkx Solutions - AEO Tools & Manifests</title>
      <meta name="description" content="AEO tools and autonomous agent search ingestion optimization." />
      <meta property="article:modified_time" content="2026-08-20T10:00:00Z" />
      <link rel="canonical" href="https://thatworkx.com/" />
      <script type="application/ld+json">
        {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Thatworkx"
        }
      </script>
    </head>
    <body>
      <header><nav><a href="/">Home</a></nav></header>
      <main>
        <h1>AI-Readiness Tools for Web Presence</h1>
        <h2>Be Found, Trusted, and Cited by AI Engines</h2>
        <p>This is extracted body content with sufficient length to verify clean text parsing without raw HTML markup leaking through.</p>
        <img src="/logo.png" alt="Company Logo" />
        <img src="/badge.png" />
      </main>
      <footer><p>&copy; 2026 Thatworkx</p></footer>
    </body>
    </html>
  `;

  it('1. Extracts additive diagnostic fields on pageObj without breaking legacy properties', () => {
    const page = parsePageHtml(sampleHtml, 'https://thatworkx.com/', '/');

    // Legacy baseline checks
    expect(page.route).toBe('/');
    expect(page.wordCount).toBeGreaterThan(0);
    expect(page.hasCanonical).toBe(true);
    expect(page.canonicalUrl).toBe('https://thatworkx.com/');
    expect(page.headingAudit.h1).toBe(1);
    expect(page.headingAudit.h2).toBe(1);

    // New additive diagnostic properties
    expect(typeof page.textCodeRatio).toBe('number');
    expect(page.textDensityRatio).toBeGreaterThan(0);
    expect(page.bodyTextSnippet).toContain('AI-Readiness Tools');
    expect(page.bodyTextSnippet).not.toContain('<main>');
    
    // Schema extraction
    expect(page.hasSchema).toBe(true);
    expect(page.schemas).toHaveLength(1);
    expect(page.schemaTypes).toContain('Organization');

    // Freshness & Semantic tags
    expect(page.lastUpdated).toBe('2026-08-20T10:00:00Z');
    expect(page.semanticTags.main).toBe(true);
    expect(page.semanticTags.footer).toBe(true);

    // Image alt audit (1 with alt, 1 without)
    expect(page.missingAltCount).toBe(1);
    expect(page.missingAltList[0].src).toBe('/badge.png');
  });

  it('2. Returns safe default structures when htmlContent is empty or null', () => {
    const emptyPage = parsePageHtml('', 'https://thatworkx.com/blank', '/blank');

    expect(emptyPage.wordCount).toBe(0);
    expect(emptyPage.textCodeRatio).toBe(0);
    expect(emptyPage.textDensityRatio).toBe(0);
    expect(emptyPage.hasSchema).toBe(false);
    expect(emptyPage.schemas).toEqual([]);
    expect(emptyPage.schemaTypes).toEqual([]);
    expect(emptyPage.lastUpdated).toBeNull();
    expect(emptyPage.missingAltCount).toBe(0);
  });

  it('3. Robustly unpacks @graph JSON-LD and falls back to schema dates / HTTP headers', () => {
    const graphHtml = `
      <html>
      <head>
        <script type="application/ld+json">
          {
            "@context": "https://schema.org",
            "@graph": [
              { "@type": "WebSite", "name": "Site Graph" },
              { "@type": "Article", "datePublished": "2026-05-10T08:00:00Z" }
            ]
          }
        </script>
      </head>
      <body><h1>Title</h1><p>Body</p></body>
      </html>
    `;
    const graphPage = parsePageHtml(graphHtml, 'https://example.com', '/');
    expect(graphPage.hasSchema).toBe(true);
    expect(graphPage.schemaTypes).toEqual(expect.arrayContaining(['WebSite', 'Article']));
    expect(graphPage.lastUpdated).toBe('2026-05-10T08:00:00Z');

    const noDateHtml = `<html><body><h1>No Date Page</h1></body></html>`;
    const headerPage = parsePageHtml(noDateHtml, 'https://example.com', '/', { 'last-modified': 'Wed, 21 Oct 2026 07:28:00 GMT' });
    expect(headerPage.lastUpdated).toBe('Wed, 21 Oct 2026 07:28:00 GMT');
  });
});
