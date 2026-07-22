# 📜 THATWORKX AEO SUITE: SEMANTIC CHANGELOG

All notable code changes, schema definitions, and infrastructure updates will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to Semantic Versioning.

## [1.14.0-sprint8-patch] - 2026-07-22

### Changed
- **Optimize Tabbed Layout Refactor**: Combined the vertical remediation controls sidebar and the workspace canvas card into a single unified workspace card. Buttons are now styled as horizontal tabs at the top of the canvas.
- **Semrush Link Direct Interpolation**: Moved "AI Visibility & Share of Voice" to the top-right header row. Updated the dynamic click trigger to automatically parse the scanned domain from the results and pre-fill Semrush's search query parameter on click.

## [1.13.0-sprint8-patch] - 2026-07-22

### Added
- **Scanned Routes Count Badge**: Embedded a dynamic badge at the top of the "Scanned Routes Directory Path" card visual showing "Pulled X of Y pages" matching the crawl results.

## [1.12.0-sprint8-patch] - 2026-07-22

### Added
- **Multi-Agent Pod Manifest**: Established the 5 distinct agent persona roles (Control, PO, QA, Engineering, Docs) in [AEO_MULTI_AGENT_POD_MANIFEST.md](file:///D:/MyApps/aeo-audit-tool-v3/_context/AEO_MULTI_AGENT_POD_MANIFEST.md) and locked their communication/execution constraints.

## [1.11.0-sprint8-patch] - 2026-07-22

### Added
- **Removed All Simulated Scans**: Cleaned up the crawler loop to fetch and parse 100% real live metrics for all discovered page routes, removing simulated mock metrics and false warnings.
- **Polite Crawling Delays**: Injected an asynchronous 150ms delay between consecutive axios hits in the crawl loop to prevent IP bans.
- **Client-Side Safe Mode Cooldown Banner**: Introduced a 60-second cooldown period after running a whole-site scan. The scan button locks and runs a countdown timer.
- **Cooldown Informational Help Modal**: Added a help modal explaining the necessity of rate limiting and safe mode.
- **On-Demand Individual Page Auditing**: Placed an `Audit Page 🔄` button next to each path in the table. Users can bypass the cooldown lock to re-scan a specific page immediately.

### Fixed
- **Subdomain-Insensitive Internal Link Matching**: Normalized hosts by stripping any leading `www.` subdomain prefixes from both the target URL and discovered link URLs, preventing absolute internal links on pages scanned without `www.` from being discarded as external.

## [1.10.0-sprint8-patch] - 2026-07-22

### Added
- **Discovered Links Extraction Crawler**: Refactored the backend crawler in `crawlerService.js` to parse actual `<a>` links from the scanned HTML page instead of simulated common routes, filtering out external domains, asset formats, and hashes to extract only valid internal relative paths (including product and collection routes for e-commerce platforms like Shopify).
- **Verified Page Links Integrity**: Re-aligned the scanned paths table to guarantee that clicking `"Go to page ↗"` takes the user directly to a live, active page on their site.

## [1.9.0-sprint8-patch] - 2026-07-22

### Added
- **Descriptive Page Paths Simulation**: Replaced generic `/sub-route-1` names with realistic routes (`/about`, `/services`, `/blog`, `/pricing`, `/contact-us`, etc.).
- **Go To Page Deep Links**: Added a direct external link `"Go to page ↗"` next to each route path to quickly open that specific page in a new tab.
- **Word Count Relevance Auditing & Color Pills**: Added color-coded badges for Word Count (Low/Ideal/Moderate/High) in the scanned paths table and a detailed `?` informational help popup explaining the semantic implications.
- **Canonical URL Visibility**: Replaced "Active" indicator text with the actual parsed canonical URL string, highlighting missing tags with a prominent red `✗ Missing (Diluted)` badge. Added a detailed `?` help popup.
- **Heading Hierarchy Checking & Icons**: Upgraded the backend to audit linear header nesting and declare hierarchy compliance. Rendered checkmarks (`✓`) or crossmarks (`✗`) in the table rows next to counts. Added a detailed `?` hierarchy rule popup.
- **Dynamic Help Modal Overlay**: Integrated glassmorphic popups to present detailed technical insights for each scanned criteria.

### Fixed
- **Target URL input ID typo**: Fixed bug in `index.js` where `target-url-input` was reference queried instead of `target-url` during table rendering, causing a TypeError and blocking scan outputs.

## [1.8.0-sprint8-patch] - 2026-07-22

### Added
- **Resend API Email Delivery Integration**: Hooked up real email verification dispatches via the Resend API to support actual OTP verification workflows.
- **Copy-Paste Optimization**: Styled the email HTML template to leverage `user-select: all` on the 6-digit OTP code, allowing users to double-click and copy it cleanly in one step.
- **Removed Debug Prefill Bypass**: Sanitized frontend `index.js` by removing automatic alert displays and values prefilling, requiring real manual inputs during the verification panel step.

## [1.7.0-sprint8-patch] - 2026-07-22

### Added
- **One-Time Password (OTP) Authentication System**: Shifted user login/registration from password-based hashing to a secure email OTP verification cycle.
- **Backend OTP & Stripe compatible API Endpoints**:
  - `POST /api/auth/register` (Alias for `requestRegisterOtp` doing deduplication checks and sending verification code).
  - `POST /api/auth/login` (Alias for `requestLoginOtp` verifying existence and sending login code).
  - `POST /api/auth/verify-otp` (Checks verification code, sets `is_verified = true`, and returns signed Bearer session token).
- **Double-Tab Authentication Modal UI**: Redesigned the auth modal in `index.html` and `index.js` to feature tabs for "Sign In" and "New User" (capturing Company, Phone, Country, Name, and Opt-In checkbox), plus a numeric OTP entry panel.
- **Mongoose User Model Upgrade**: Expanded schema with `person`, `organization`, `notification`, and `subscription` blocks for Stripe integration readiness.

## [1.6.1-patch] - 2026-07-22

### Changed
- **URL Input Experience Improvement**: Changed target URL text input from type `url` to `text` and replaced the pre-filled `value="https://example.com"` with a placeholder to allow immediate typing without having to clear the box.
- **Optional Protocol Normalization**: Added automatic prepending of `https://` on both frontend URL submit and backend REST API scan requests if a protocol prefix is omitted.

## [1.6.0-sprint8] - 2026-07-21

### Added
- **Citation Attribution Sidebar Callout**: Rendered `AI Visibility & Share of Voice` callout box in master sidebar panel of `index.html` with zero-overhead partner affiliate referral link binding (`Semrush Generative AI Citation Tracking`).
- **Comprehensive E2E Vitest Regression Suite**: Added `backend/tests/servicesAndControllers.test.js` covering `generatorService.js`, `parserService.js`, and `authController.js` alongside `bddGating.test.js` (14/14 tests passing).
- **Twelve-Factor Staging Deployment Guide**: Created `DIGITALOCEAN_STAGING_DEPLOYMENT_GUIDE.md` documenting environment configuration parameters, container spec, and zero-downtime staging deployment steps.

## [1.5.1-sprint7] - 2026-07-21

### Added
- **Authentication Controller**: Created `authController.js` handling user registration, SHA256 password hashing, and token issuance against native MongoDB (`mongodb://127.0.0.1:27017/thatworkx-aeo`).
- **Auth Routes**: Added `POST /api/auth/register`, `POST /api/auth/login`, and `GET /api/auth/me` endpoints in `server.js`.
- **Top Navigation Auth Trigger**: Rendered top bar `Sign In` / User Account button in `index.html`.
- **Authentication Modal Overlay**: Built `auth-modal` overlay supporting seamless switching between Sign In and Account Registration modes.

### Fixed
- **Frontend User Logout Handler**: Added profile button click logout trigger in `index.js`, clearing JWT token, resetting top navigation button to `🔑 Sign In`, and restoring public guest tier UI state.

## [1.5.0-sprint6] - 2026-07-21

### Added
- **Backend Generator Engine**: Scaffolded `generatorService.js` to compile `/llms.txt`, `/ai-context.md`, Cloudflare Worker JS, Shopify Liquid, and WordPress `.htaccess` code.
- **Generator API Endpoint**: Added `POST /api/generator/build` route in `server.js`.
- **AIOptimize Treat Workspace Drawers**: Rendered interactive code drawers for `/llms.txt`, `/ai-context.md`, Shopify Liquid, and WordPress `.htaccess` in `index.html`.
- **One-Click File Downloading & Copy**: Added `downloadFile(elementId, filename)` utility in `index.js` enabling instant `.txt` and `.md` manifest downloads.

## [1.4.0-sprint5] - 2026-07-21

### Added
- **DOM Noise Stripper & Content Density Calculator**: Created `parserService.js` to strip HTML scripts, styles, navs, and footers, calculating raw text byte ratios.
- **Client-Side JS Hydration / SPA Trap Detector**: Added automatic detection for empty container JS framework traps (`#root`, `#app`, `#_next`).
- **JSON-LD Schema Extractor**: Extracted and validated JSON-LD `@type` definitions.
- **Machine Text Simulator Viewport**: Rendered live raw text preview box in `index.html` showing sanitized text stream LLMs consume.
- **AIOptimize Remediation Teaser Accordion**: Implemented interactive teaser accordion in the dashboard UI guiding users to remediation tools.

## [1.3.0-sprint4] - 2026-07-21

### Added
- **Level 1 Gateway Scanner Engine**: Added programmatic text parsing for `robots.txt`, `/llms.txt`, and `/ai-context.md` in `crawlerService.js`.
- **Targeted AI Bot Parsers**: Added rules evaluating disallow patterns for `GPTBot`, `PerplexityBot`, `ClaudeBot`, and `Google-Extended` (Gemini).
- **Gateway Relationship Grid UI**: Rendered Gateway Relationship Grid cards and status badges (`Optimized Handshake` 🟢, `Hidden Assets` 🟡, `Total AI Blindness` 🔴) in `index.html` and `index.js`.

## [1.2.0-sprint3] - 2026-07-21

### Added
- **Unified Dashboard UI Shell**: Built SPA layout at `aeo.thatworkx.com` with smooth tab toggling between `AI Visualize (Inquire)` and `AI Optimize (Treat)`.
- **Form API Bindings**: Connected single-page URL submission form directly to `POST /api/scan`.
- **Real-Time Progress & Overlays**: Implemented loading animations and `LIMIT_EXCEEDED` / `HEADLESS_FORBIDDEN` high-contrast modal overlays.
- **Pre-Flight Staging Checklist**: Documented mandatory environment variables for DigitalOcean cloud injection.

## [1.1.0-sprint2] - 2026-07-20

### Added
- **Native Bare-Metal MongoDB Integration**: Configured loopback URI `mongodb://127.0.0.1:27017/thatworkx-aeo` for local operations.
- **MongoDB Models**:
  - `User.js` (User account tier limits & UTC resets)
  - `ScanLog.js` (Audit log transactions and scoring metrics)
  - `DomainProfile.js` (Domain sitemap and SSL status caches)
- **Twelve-Factor Configuration**: Created `.env.example` and `.env.development` loading environment variables dynamically via `dotenv`.
- **Docs & Guidance Boilerplates**:
  - `AEO_README_Boilerplate.md` (System orientation README template)
  - `AEO_About_Boilerplate.md` (Corporate identity verification template)
- **Human Audit Script**: Created `audit-critical.js` in root directory for manual CLI diagnostics without relying on UI.

### Changed
- **Deprecated Docker & docker-compose**: Absolute ban enforced on local Docker containers due to hardware virtualization constraints.
- **Dynamic Rate Limiting**: Refactored `rateLimiter.js` to look up quota bounds dynamically from `process.env`.
- **Product Toggles**: Updated UI labels to `AI Visualize (Inquire)` and `AI Optimize (Treat)`.

---

## [1.0.0-sprint1] - 2026-07-19

### Added
- **Phase 0 Asset Migration**: Extracted design tokens from `aeo-audit-tool-v2` into `_context/design-tokens.json`.
- **BDD Integration Test Suite**: Created `AEO_BDD_TESTS_V1.md` containing Given/When/Then scenarios for tier limits and crawler rules.
- **Thread A (Frontend)**: Scaffolded `index.html`, `index.css` (dark glassmorphic theme), and `index.js` (tab toggle navigation and sandbox code generators).
- **Thread B (Backend)**: Created Express backend (`server.js`), rate limiter middleware (`rateLimiter.js`), and crawler service (`crawlerService.js`).
- **Thread C (Docs)**: Drafted `cloudflare-worker-guide.md` and `semrush-affiliate-links.md`.
- **Staging Deployment Specs**: Created `Dockerfile` and `.do/app.yaml` for DigitalOcean App Platform.
