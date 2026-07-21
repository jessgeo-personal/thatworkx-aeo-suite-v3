# 🛡️ THATWORKX AEO SUITE: QA REGRESSION MATRIX

This document outlines the core functional behaviors and safety boundaries that must be tested by the QA Agent before merging feature code into the `dev` or `staging` branches.

---

## 🧪 Regression Verification Checklist

| Behavioral Target | Category | Test Strategy / Script | Verification Criteria | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Free Tier Daily Scan Limit** | Quota Control | `bddGating.test.js` | 6th scan request returns 403 `LIMIT_EXCEEDED` payload | `PASS 🟢` |
| **Free Tier Headless Ban** | Resource Isolation | `bddGating.test.js` | Request with `headless: true` returns 403 `HEADLESS_FORBIDDEN` | `PASS 🟢` |
| **Free Tier Page Depth Cap** | Crawl Depth | `bddGating.test.js` | Crawler returns a maximum of 3 pages for Free tier | `PASS 🟢` |
| **AIO Free Page Depth Cap** | Crawl Depth | `bddGating.test.js` | Crawler returns exactly 1 landing page profile | `PASS 🟢` |
| **Robots.txt AI Blindness** | Protocol Gates | `bddGating.test.js` | `User-agent: * Disallow: /` triggers `TOTAL_AI_BLINDNESS` alert & score `Ugly` | `PASS 🟢` |
| **Cloudflare Worker Edge Proxy** | Security Sandbox | Code Viewport | Generates copyable JS snippet; 0 direct Cloudflare API write attempts | `PASS 🟢` |
| **Semrush Affiliate Link Redirect** | Referral Gateway | UI Link Check | External redirect opens partner affiliate tracking URL | `PASS 🟢` |
| **Native MongoDB Connection** | Database Persistence | `audit-critical.js` | Connects directly to `mongodb://127.0.0.1:27017/thatworkx-aeo` | `PASS 🟢` |
| **Twelve-Factor Env Lookup** | Configuration | `rateLimiter.js` | Quota parameters read dynamically via `process.env` calls | `PASS 🟢` |
| **AI Bot Parser (GPTBot, Gemini, etc.)** | Gateway Scanner | `crawlerService.js` | Parses specific disallows for GPTBot, PerplexityBot, ClaudeBot, Google-Extended | `PASS 🟢` |
| **Gateway Relationship Badge** | UI Grid | `index.js` | Assigns `Optimized Handshake` (🟢), `Hidden Assets` (🟡), or `Total AI Blindness` (🔴) | `PASS 🟢` |
| **DOM Noise Stripper & Density** | Content Density | `parserService.js` | Strips DOM noise and calculates raw text byte ratio percentage | `PASS 🟢` |
| **SPA Hydration Trap Detector** | SPA Trap | `parserService.js` | Detects empty container JS framework traps (`#root`, `#app`) | `PASS 🟢` |
| **Machine Text Simulator Viewport** | UI Viewport | `index.js` | Displays raw text stream LLMs consume in `<pre>` viewport box | `PASS 🟢` |
| **Machine Context Manifest Builder** | Generator Engine | `generatorService.js` | Compiles flat-text `/llms.txt` and `/ai-context.md` markdown manifests | `PASS 🟢` |
| **Edge Script Generator (Shopify/Htaccess)** | Generator Engine | `generatorService.js` | Compiles Cloudflare Worker JS, Shopify Liquid, and WordPress `.htaccess` | `PASS 🟢` |
| **One-Click Manifest File Download** | UI Utility | `index.js` | Triggers client-side `.txt` and `.md` file download from code viewport | `PASS 🟢` |
