# API call lists

## Site-Centric

### 1. Executive mode
* **a. Scan details:**
    * 1. ScanID
    * 2. Scanned Domain
    * 3. scanTimestamp
    * 4. ExecutionTime
    * 5. httpStatus
    * 6. CDN / Edge Firewall Blocking
* **b. Scores**
    * 1. OverallScore
    * 2. Gateway & Access
        * Score:
        * Description:
        * Deductions:
    * 3. presenceHygiene
        * Score:
        * Description:
        * Deductions:
    * 4. contentAiReadiness
        * Score:
        * Description:
        * Deductions:
    * 5. machineManifestReadiness
        * Score:
        * Description:
        * Deductions:
    * 6. EEAT Score
        * Score:
        * Description:
        * Deductions:
* **c. aiBotPermissions**"
    "overallStatus": "ALLOWED_WITH_WARNINGS",
    "robotsTxtFound": true,
    "robotsTxtUrl": "https://example.com/robots.txt",
    "crawlers": {
      "GPTBot": { "status": "ALLOWED", "userAgent": "GPTBot", "pathRestrictions": [] },
      "ClaudeBot": { "status": "ALLOWED", "userAgent": "ClaudeBot", "pathRestrictions": [] },
      "PerplexityBot": { "status": "ALLOWED", "userAgent": "PerplexityBot", "pathRestrictions": [] },
      "Bytespider": { "status": "BLOCKED", "userAgent": "Bytespider", "pathRestrictions": ["/"] },
      "CCBot": { "status": "BLOCKED", "userAgent": "CCBot", "pathRestrictions": ["/"] }
* **d. Authority Details**
    * Found?
    * Contact signals
        * emailFound: "support@example.com"
        * phone: "+1-800-555-0199",
        * address": "123 Business Way, Suite 100, Austin, TX 78701",
        * socialProfiles": [
        "https://linkedin.com/company/example",
        "https://github.com/example"
* **e. Schemas**
    * Organization: {"found": true}
    * LocalBusiness: ("found": true)
    * FAQPage: {"found": true, "NoOfQuestionsFound": 12}
    * Website: ("found": true)
        * Detail 1
        * Detail 2
        * Detail 3
* **f. essentialPages Found**
    * detectedCount: 4/6
    * pages": {
        * about": { "found": true, "url": "https://example.com/about" },
        * contact": { "found": true, "url": "https://example.com/contact" },
        * privacyPolicy": { "found": true, "url": "https://example.com/privacy" },
        * termsOfService": { "found": true, "url": "https://example.com/terms" }
* **g. manifestFiles**
    * sitemapXml": { "found": true, "url": "https://example.com/sitemap.xml", "totalUrlsInSitemap": 42 },
    * robotsTxt": { "found": true, "url": "https://example.com/robots.txt" },
    * llmsTxt": { "found": true, "url": "https://example.com/llms.txt" },
    * aiContextMd": { "found": false, "url": "https://example.com/ai-context.md" },
    * readmeMd": { "found": false, "url": "https://example.com/README.md" }
    * docsMd": { "found": false, "url": "https://example.com/docs.md" }
    * aboutMd": { "found": false, "url": "https://example.com/about.md" }
    * contentsMd": { "found": false, "url": "https://example.com/contents.md" }
* **h. discoveredUrls**
    * totalCount": 14,
    * URLList": [
        * /: {"url":"https://example.com/","inSitemap": true, "internal": true}
        * /about: {"url":"https://example.com/about","inSitemap": true, "internal": true}
        * /contact: {"url":"https://example.com/contact","inSitemap": true, "internal": true}
        * /privacy: {"url":"https://example.com/","inSitemap": true, "internal": true}
        * /terms: {"url":"https://example.com/terms","inSitemap": true, "internal": true}
        * /services: {"url":"https://example.com/services","inSitemap": true, "internal": true}
        * /blog: {"url":"https://example.com/blog","inSitemap": false, "internal": true}
        * /linkedin: {"url":"https://linkedin.com/[example]","inSitemap": false, "internal": false}
* **i. diagnosticSummary**
    * status": "WARN",
    * criticalPasses": [
        * Robots.txt grants full access to major AI search crawlers (GPTBot, PerplexityBot, ClaudeBot).",
        * Valid Sitemap.xml located with 42 indexed routes.",
        * Organization E-E-A-T contact authority details detected in page footer."
        ],
    * actionableWarnings": [
        * "Missing `/ai-context.md` root manifest file.",
        * 2 generic web scrapers explicitly blocked in robots.txt."]


### 1. Executive mode