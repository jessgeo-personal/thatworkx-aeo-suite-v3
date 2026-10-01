/**
 * @file backend/tests/contactAndAddressExtraction.test.js
 * @description BDD RED Phase Test Suite for Crawler Service Tel & Address Tag Extraction
 */

import { describe, it, expect } from 'vitest';
import * as cheerio from 'cheerio';
import { extractContactAnchors } from '../services/crawlerService.js';

describe('Backend Crawler Service: Contact & Address Anchor Extraction', () => {
  it('should extract international tel: anchor links and mailto: links from HTML DOM', () => {
    const htmlFixture = `
      <html>
        <body>
          <footer>
            <a href="mailto:info@thatworkx.com">Email Us</a>
            <a href="tel:+971529342175" class="hover:text-brand-gold">+971 529 342 175</a>
          </footer>
        </body>
      </html>
    `;

    const $ = cheerio.load(htmlFixture);
    const anchors = extractContactAnchors($);

    expect(anchors).toBeDefined();
    expect(anchors.phones).toContain('+971529342175');
    expect(anchors.emails).toContain('info@thatworkx.com');
  });

  it('should extract physical address from HTML <address> tags', () => {
    const htmlFixture = `
      <html>
        <body>
          <address>
            Thatworkx Solutions<br>
            Dubai Internet City, Building 2<br>
            Dubai, United Arab Emirates
          </address>
        </body>
      </html>
    `;

    const $ = cheerio.load(htmlFixture);
    const anchors = extractContactAnchors($);

    expect(anchors.address).toBeDefined();
    expect(anchors.address).toContain('Dubai Internet City');
    expect(anchors.address).toContain('United Arab Emirates');
  });

  it('should extract address from Microdata itemType="http://schema.org/PostalAddress"', () => {
    const htmlFixture = `
      <html>
        <body>
          <div itemprop="address" itemscope itemtype="http://schema.org/PostalAddress">
            <span itemprop="streetAddress">Sheikh Zayed Road</span>,
            <span itemprop="addressLocality">Dubai</span>,
            <span itemprop="addressCountry">AE</span>
          </div>
        </body>
      </html>
    `;

    const $ = cheerio.load(htmlFixture);
    const anchors = extractContactAnchors($);

    expect(anchors.address).toBeDefined();
    expect(anchors.address).toContain('Sheikh Zayed Road');
    expect(anchors.address).toContain('Dubai');
  });
});
