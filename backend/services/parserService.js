const cheerio = require('cheerio');

/**
 * Level 2 Parser Service: DOM Noise Stripping, Content Density, SPA Trap Detection & JSON-LD Extraction
 */
const parseHtmlMetrics = (htmlContent) => {
  if (!htmlContent || typeof htmlContent !== 'string') {
    return {
      rawText: '',
      wordCount: 0,
      contentDensityRatio: 0,
      spaTrapDetected: false,
      jsonLdExists: false,
      jsonLdTypes: [],
      machinePreview: ''
    };
  }

  const totalBytes = Buffer.byteLength(htmlContent, 'utf8');

  // Load Cheerio DOM instance
  const $ = cheerio.load(htmlContent);

  // 1. Extract JSON-LD Schema.org blocks before stripping script tags
  const jsonLdTypes = [];
  let jsonLdExists = false;
  let jsonLdSchemaContent = '';

  $('script[type="application/ld+json"]').each((_, el) => {
    try {
      const rawJson = $(el).html();
      if (rawJson) {
        if (!jsonLdSchemaContent) {
          jsonLdSchemaContent = rawJson.trim();
        }
        const parsed = JSON.parse(rawJson);
        jsonLdExists = true;
        if (parsed['@type']) {
          if (Array.isArray(parsed['@type'])) {
            jsonLdTypes.push(...parsed['@type']);
          } else {
            jsonLdTypes.push(parsed['@type']);
          }
        } else if (Array.isArray(parsed)) {
          parsed.forEach(item => {
            if (item['@type']) jsonLdTypes.push(item['@type']);
          });
        }
      }
    } catch (err) {
      // Invalid JSON-LD block ignored
    }
  });

  // 2. DOM Noise Stripper: Remove scripts, styles, svg, nav, footer, header
  $('script, style, svg, noscript, nav, footer, iframe').remove();

  // Extract cleaned body text
  const rawText = $('body').text().replace(/\s+/g, ' ').trim();
  const rawTextBytes = Buffer.byteLength(rawText, 'utf8');
  const wordCount = rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;

  // Calculate Content Density Ratio (Text Bytes / Total HTML Bytes * 100)
  const contentDensityRatio = totalBytes > 0 ? parseFloat(((rawTextBytes / totalBytes) * 100).toFixed(2)) : 0;

  // 3. Client-Side JavaScript Hydration / SPA Trap Detection
  const hasAppRoot = $('#root, #app, #__next, #__nuxt').length > 0;
  const spaTrapDetected = (wordCount < 50 && hasAppRoot);

  // 4. Generate Machine Text Simulator Viewport Preview (First 300 words)
  const words = rawText.split(/\s+/).filter(Boolean);
  const machinePreview = words.slice(0, 300).join(' ') + (words.length > 300 ? '...' : '');

  return {
    rawText,
    wordCount,
    contentDensityRatio,
    spaTrapDetected,
    jsonLdExists,
    jsonLdSchemaContent,
    jsonLdTypes: [...new Set(jsonLdTypes)],
    machinePreview
  };
};

module.exports = { parseHtmlMetrics };
