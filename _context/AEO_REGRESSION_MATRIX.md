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
| **OTP User Registration & Deduplication** | Auth Controller | `authController.js` | Checks existence and sends registration verification OTP | `PASS 🟢` |
| **OTP User Login Request** | Auth Controller | `authController.js` | Generates and sends OTP if user profile exists | `PASS 🟢` |
| **OTP Code Verification & Token Issue** | Auth Controller | `authController.js` | Validates OTP and issues JWT Bearer session token | `PASS 🟢` |
| **Top Bar Auth Indicator & Modal** | UI Component | `index.html` | Renders top navigation Sign In trigger and interactive auth-modal overlay | `PASS 🟢` |
| **Sidebar Citation Attribution Widget** | UI Sidebar | `index.html` | Renders `AI Visibility & Share of Voice` sidebar card with affiliate link binding | `PASS 🟢` |
| **End-to-End Vitest Module Suite** | Automated Tests | `servicesAndControllers.test.js` | 16/16 tests pass covering generator, parser, OTP auth & crawler gating | `PASS 🟢` |
| **Twelve-Factor Staging Pre-Flight** | Deployment Package | `DIGITALOCEAN_STAGING_DEPLOYMENT_GUIDE.md` | Validates environment variables and container deployment blueprint | `PASS 🟢` |
| **URL Optional Protocol Input** | Input Validation | `index.js` & `server.js` | User can submit URL with or without http/https protocol prefix | `PASS 🟢` |
| **Resend API OTP Mail Dispatch** | Email Service | `authController.js` | Sends HTML transaction emails containing verification code via Resend | `PASS 🟢` |
| **Descriptive Path Names & Link Buttons** | Scanned Paths UI | `index.js` & `crawlerService.js` | Harvests actual internal link paths dynamically from HTML page to list | `PASS 🟢` |
| **Word Count Categorization & Color Pills** | Scanned Paths UI | `index.js` | Applies color codes to counts and details implications inside popup | `PASS 🟢` |
| **Canonical URL Visibility & Warnings** | Scanned Paths UI | `index.js` & `crawlerService.js` | Displays raw canonical string values and marks missing items in red | `PASS 🟢` |
| **Heading Hierarchy Validations** | Scanned Paths UI | `index.js` & `crawlerService.js` | Runs hierarchy checks and renders `✓` or `✗` status marks | `PASS 🟢` |
| **Informational Help Modal Overlays** | Scanned Paths UI | `index.html` & `index.js` | Opens popups outlining relevance of Word Count, Canonical, and Structure | `PASS 🟢` |
| **Polite Crawling Throttle Delay** | Crawler Engine | `crawlerService.js` | Runs 150ms delay between sub-page fetches to prevent Shopify blocks | `PASS 🟢` |
| **Safe Mode Scan Cooldown Timer** | Scan Input UI | `index.html` & `index.js` | Disables whole-site scan for 60s and displays countdown timer with help popup | `PASS 🟢` |
| **On-Demand Single Page Auditing** | Scanned Paths UI | `index.js` & `server.js` | Bypasses cooldown lock to scan individual routes and updates row dynamically | `PASS 🟢` |
| **Subdomain-Insensitive Domain Matching** | Crawler Engine | `crawlerService.js` | Strips www. prefix from host comparisons to match absolute internal links | `PASS 🟢` |
| **Multi-Agent Pod Manifest Lock** | Quality Control | `AEO_MULTI_AGENT_POD_MANIFEST.md` | Declares roles, communication rules, and constraint bounds for 5 agents | `PASS 🟢` |
| **Multi-Agent Persona Protocol** | Interface Output | Chat Console | Outputs responses prefixed with active agent headers and actor tracking | `PASS 🟢` |
| **Scanned Routes Count Badge** | Scanned Paths UI | `index.html` & `index.js` | Displays "Pulled X of Y pages" at the top of the Scanned Routes card | `PASS 🟢` |
| **AIOptimize Tabbed Remediation Controls** | Sandbox UI | `index.html` & `index.css` | Combines vertical controls sidebar into a unified card with horizontal header tabs | `PASS 🟢` |
| **Semrush Direct Query Interpolation** | Referral Gate | `index.js` | Parses the scanned domain from the results and updates the link with it | `PASS 🟢` |
| **Semrush Redirection Safety Disclaimer Modal** | Referral Gate | `index.html` & `index.js` | Shows a safety/terms modal warning users when they trigger the Semrush affiliate link | `PASS 🟢` |
| **Educational Onboarding Homepage Hero** | Onboarding UI | `index.html` & `index.css` | Displays educational landing page citing the 35% blocking statistic | `PASS 🟢` |
| **URL Ingest Modal & Dashboard Router** | Onboarding UI | `index.html` & `index.js` | Launches ingestion modal on card clicks and routes state to appropriate dashboard | `PASS 🟢` |
| **AIVisualize 4 Section Grid Cards** | Dashboard UI | `index.html` | Groups diagnostic results into Section 1-4 cards with pass/fail metrics | `PASS 🟢` |
| **AIOptimize Master Track Layout** | Sandbox UI | `index.html` | Separates remediation tools into Track 1 (Page Fixes) and Track 2 (File Generators) | `PASS 🟢` |
| **Track 2 Extended File Generators** | Generator Engine | `generatorService.js` | Generates /about.md, /docs.md, /content.md, and sitemap.xml files | `PASS 🟢` |
| **Section 4 Narrative Manifest Check** | Crawler Engine | `crawlerService.js` | Audits existence of about.md, docs.md, and content.md on target domain origin | `PASS 🟢` |
| **Mockup-Based Glow-Card Redesign** | Onboarding UI | `index.html` & `index.css` | Replicates the Slide1.png layout outlines, font tag elements, and amber banner | `PASS 🟢` |
| **Console Tab Switcher Buttons (AIVisualize, AIOptimize, AISocialize)** | Landing Page UI | `consoleTabSwitcher.test.js` | Verifies 3-column desktop grid alignment, visual text presence, active theme accents, and mobile single-column responsiveness | `PASS 🟢` |

