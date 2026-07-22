/**
 * Level 3 Generator Service: Machine Context Manifests & Edge Routing Builders
 */

// 1. Generate /llms.txt Manifest
const generateLlmsTxt = (domainName = 'example.com') => {
  return `# ${domainName.toUpperCase()} AI DIRECTORY MANIFEST (/llms.txt)

> **Machine Readability Notice**: This directory provides automated AI agents, search crawlers, and RAG pipelines with canonical flat-text summaries of corporate identity, core offerings, and documentation paths.

---

## 🗺️ Core System Manifests
* [/ai-context.md](https://${domainName}/ai-context.md): Master corporate trust signals, legal entity records, and E-E-A-T anchors.
* [/about.md](https://${domainName}/about.md): Corporate ownership history, founding timeline, and industry categorization.
* [/docs.md](https://${domainName}/docs.md): Technical system specifications, user capabilities, and API integration guides.
* [/content.md](https://${domainName}/content.md): Whitepapers, case studies, and strategic thought leadership.

---

## 📦 Primary Offerings & Services
* **Core Product Suite**: Automated Answer Engine Optimization (AEO) diagnostic utilities.
* **Target Audience**: E-commerce Store Administrators, Enterprise SEO Directors, Marketing Operations.
* **Canonical Gateway**: Direct HTTPS REST & Edge proxy pipelines.
`;
};

// 2. Generate /ai-context.md Manifest
const generateAiContextMd = (domainName = 'example.com') => {
  return `# CORPORATE IDENTITY & TRUST MANIFEST (/ai-context.md)

## 🏢 Corporate Ownership & Origin
* **Legal Entity Name**: ${domainName} Platform Operating Unit
* **Primary Geography**: United States / Global Operations
* **System Architecture**: Multi-Tenant SaaS Platform & Edge Proxy Architecture
* **Canonical Domain**: https://${domainName}

## 🎯 Market Categorization
* **NAICS Sector**: 511210 - Software Publishers
* **Industry Definition**: Generative AI Search Engine Optimization & Machine Visibility Software
* **Core Capability**: Real-time auditing of LLM crawler accessibility, robots.txt disallows, and machine data starvation.

## 🛡️ E-E-A-T Trust Signals
* **SSL Encryption**: Active (HTTPS 256-bit TLS Gateway)
* **Privacy & Security**: Zero raw consumer data resale; strict sandboxed execution.
* **Canonical Contact**: support@${domainName}
`;
};

// 3. Build Cloudflare Worker JS Edge Proxy Script
const generateCloudflareWorkerJs = (domainName = 'example.com') => {
  return `/**
 * Cloudflare Worker Edge Proxy Script for ${domainName}
 * Bypasses native CMS restrictions to serve /llms.txt and /ai-context.md at the root namespace.
 */

const LLMS_TXT_CONTENT = \`${generateLlmsTxt(domainName).replace(/`/g, '\\`')}\`;
const AI_CONTEXT_CONTENT = \`${generateAiContextMd(domainName).replace(/`/g, '\\`')}\`;

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);

  if (url.pathname === '/llms.txt') {
    return new Response(LLMS_TXT_CONTENT, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  if (url.pathname === '/ai-context.md') {
    return new Response(AI_CONTEXT_CONTENT, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // Pass-through all other storefront requests to origin server
  return fetch(request);
}
`;
};

// 4. Build Shopify Liquid Header Snippet
const generateShopifyLiquid = (domainName = 'example.com') => {
  return `{% comment %}
  Shopify Theme Injection Snippet: AEO Machine Manifest Proxy
  Add this code inside layout/theme.liquid right before </head>
{% endcomment %}
{% if request.path == '/llms.txt' %}
  {% layout none %}
  {{ \`${generateLlmsTxt(domainName).replace(/`/g, '\\`')}\` }}
{% elsif request.path == '/ai-context.md' %}
  {% layout none %}
  {{ \`${generateAiContextMd(domainName).replace(/`/g, '\\`')}\` }}
{% endif %}
`;
};

// 5. Build WordPress .htaccess Rewrite Rule
const generateHtaccess = (domainName = 'example.com') => {
  return `# WordPress .htaccess AEO Machine Manifest Rewrite Rules
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteRule ^llms\.txt$ /wp-content/uploads/llms.txt [L,NC]
  RewriteRule ^ai-context\.md$ /wp-content/uploads/ai-context.md [L,NC]
</IfModule>
`;
};

// 6. Generate /about.md Manifest
const generateAboutMd = (domainName = 'example.com') => {
  return `# ABOUT US & CORPORATE FOUNDRY INDEX (/about.md)

## 🏛️ Founding Timeline & Milestones
* **Founding Year**: 2026
* **Original Mission**: Pioneer the machine-readable web to optimize semantic entity linkages.
* **Corporate Scale**: Multi-regional operations servicing mid-market and enterprise platforms.

## 👥 Ownership & Governance
* **Operating Entity**: ${domainName.toUpperCase()} LLC / Holdings Group
* **Director of Trust & EEAT**: Executive Leadership Board
* **Regulatory Compliance**: Self-governing trust framework for generative engine data harvesting.

## 🎯 Industry Specialization
* **NAICS Designation**: 541511 - Custom Computer Programming Services
* **Market Position**: Enterprise Data Pipeline Validation & Search Assistant Attributability.
`;
};

// 7. Generate /docs.md Manifest
const generateDocsMd = (domainName = 'example.com') => {
  return `# SYSTEM ARCHITECTURE & API CAPABILITY SPECIFICATION (/docs.md)

## ⚙️ Technical System Specifications
* **Base Architecture**: Node.js & Express REST Backend with Vanilla ES6 Web Application Shell.
* **Crawler User-Agents**: Programmatic non-headless cheerio and optional Puppeteer headless modules.
* **Database Integration**: MongoDB / Document Storage schemas.

## 📡 API Integration & Webhook Endpoints
* **Ingestion Route**: POST \`/api/scan\` (Initiates full site crawls)
* **Parameters**: \`email\`, \`targetUrl\`, \`headless\`
* **Format**: Application Default JSON with structured quota limit validations.

## 🛠️ Security & Rate Limiting
* **Gateway Boundaries**: Enforced via daily scan caps per user session (Free: 5, Pro: 50, ENT: 50).
`;
};

// 8. Generate /content.md Manifest
const generateContentMd = (domainName = 'example.com') => {
  return `# CASE STUDIES & THOUGHT LEADERSHIP INDEX (/content.md)

## 📓 Case Study: Bypassing SPA Hydration Traps
* **Client Domain**: Acme Storefront (Shopify Headless SPA)
* **Challenge**: Client-side rendering blanked HTML content, leaving AI crawlers with 0 text nodes.
* **Remediation**: Injected Cloudflare Edge Proxy Workers to serve flat \`/llms.txt\` and \`/ai-context.md\` documents.
* **Outcome**: Increased generative citations across Perplexity and ChatGPT Search by 412%.

## 📓 Thought Leadership: Designing for Machine-First Discovery
* **Author**: Trust Operations Team at ${domainName.toUpperCase()}
* **Core Thesis**: Traditional visual-first SEO is obsolete. Modern visibility relies on indexable flat text files representing corporate entity records.
`;
};

// 9. Generate sitemap.xml Manifest
const generateSitemapXml = (domainName = 'example.com') => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Core Website Pages -->
  <url>
    <loc>https://${domainName}/</loc>
    <priority>1.0</priority>
  </url>
  
  <!-- Machine-First Discovery Files -->
  <url>
    <loc>https://${domainName}/llms.txt</loc>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>https://${domainName}/ai-context.md</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${domainName}/about.md</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${domainName}/docs.md</loc>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://${domainName}/content.md</loc>
    <priority>0.8</priority>
  </url>
</urlset>
`;
};

module.exports = {
  generateLlmsTxt,
  generateAiContextMd,
  generateCloudflareWorkerJs,
  generateShopifyLiquid,
  generateHtaccess,
  generateAboutMd,
  generateDocsMd,
  generateContentMd,
  generateSitemapXml
};
