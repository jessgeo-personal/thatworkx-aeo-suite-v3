# 🧪 Behavior-Driven Development (BDD) Integration Tests

This document defines the business-logic integration tests in Given/When/Then format. These tests enforce the architectural constraints and tier boundaries defined in [AEO_BUSINESS_STRATEGY.md](file:///D:/MyApps/aeo-audit-tool-v3/_context/AEO_BUSINESS_STRATEGY.md) and [AEO_TOOL_MAPPING_V1.xlsx](file:///D:/MyApps/aeo-audit-tool-v3/_context/AEO_TOOL_MAPPING_V1.xlsx).

---

## Feature 1: Daily Scan Iteration Limits (Tries per Day)

### Scenario 1.1: AIVisualize Free Tier Daily Crawl Cap
  Given a user has an "AIVisualize Free" subscription plan
  And the user has already performed 5 scans today
  When the user submits a URL "https://example.com" for an AI Visualize scan
  Then the system intercept block blocks the scan request
  And the system does not increment the daily scan counter
  And the system returns a payload indicating execution limit has been reached
  And the frontend displays a modal UI window indicating an immediate upgrade trigger to AIVisualize Pro

### Scenario 1.2: AIOptimize Free Tier Daily Crawl Cap
  Given a user has an "AIOptimize Free" subscription plan
  And the user has already performed 5 scans today
  When the user submits a URL "https://example.com" for an AI Optimize scan
  Then the system intercept block blocks the scan request
  And the frontend displays a modal UI window indicating an immediate upgrade trigger to AIOptimize Pro

### Scenario 1.3: Pro Tier Scan Allocation Limit
  Given a user has an "AIVisualize Pro" subscription plan
  And the user has already performed 50 scans today
  When the user submits a URL "https://example.com" for an AI Visualize scan
  Then the system blocks the request and prompts an upgrade to Enterprise

---

## Feature 2: Scan Page Depth Budgets

### Scenario 2.1: AIVisualize Free Tier Page Depth Cap
  Given a user has an "AIVisualize Free" subscription plan
  When the user runs a scan on a domain with 10 total pages
  Then the crawler only processes a maximum of 3 pages
  And the scan output displays the content analyses of only those 3 pages
  And the scan output includes a count of the total number of pages (10 pages)

### Scenario 2.2: AIOptimize Free Tier Page Depth Cap
  Given a user has an "AIOptimize Free" subscription plan
  When the user runs an AI Optimize scan on a domain
  Then the system restricts the scan budget strictly to 1 Single Landing Page Profile
  And no secondary deep pages are crawled

### Scenario 2.3: AIVisualize Pro Tier Page Depth Cap
  Given a user has an "AIVisualize Pro" subscription plan
  When the user runs a scan on a domain with 50 pages
  Then the crawler processes a maximum of 40 pages
  And the remaining 10 pages are excluded from the scan results

---

## Feature 3: Headless Browser Runtime Allocations

### Scenario 3.1: AIVisualize Free and Pro Tier Headless Block
  Given a user is authenticated under "AIVisualize Free" or "AIVisualize Pro" or "AIOptimize Free"
  When the scan is executed on a user-submitted URL
  Then the backend uses programmatic text and DOM string-parsing (HTTP fetch/axios/cheerio)
  And the headless browser runtime session (Puppeteer/Playwright) is strictly disabled (0 sessions)

### Scenario 3.2: AIOptimize Pro Tier Headless Browser Caps
  Given a user has an "AIOptimize Pro" subscription plan
  And the user has already executed 3 headless browser sweeps today
  When the user requests an on-demand deep visual/CSS analysis sweep
  Then the system blocks the headless execution block
  And the system returns a notice prompting the user to upgrade to Enterprise or purchase metered add-on sweeps

### Scenario 3.3: Headless Sweeps Timeout Guardrail
  Given a user is on a paid tier with headless sweep sessions available ("AIOptimize Pro" or "AIOptimize ENT")
  When the user triggers an on-demand headless browser sweep
  Then the system executes the sweep across the allowed web directory path in a single synchronous loop
  And the system monitors the execution with a strict timeout limit to prevent ghost zombie processes
  And the session object is systematically terminated when the timeout is reached or the sweep completes

---

## Feature 4: Cloudflare Worker Edge Integration Sandbox

### Scenario 4.1: Edge Code Generation Sandbox Isolation
  Given a user is in the AIOptimize Pro dashboard trying to optimize a locked Shopify CMS site
  When the user selects "Shopify / Cloudflare Edge Workaround Track" in the target dropdown
  Then the platform does not attempt to authenticate with Cloudflare
  And the platform does not push or write files to any live Cloudflare account
  And the workspace UI generates a raw text display viewport containing a custom Cloudflare Worker script template
  And the UI renders a "Click to Copy" button asset for manual user clipboard copy

---

## Feature 5: Protocol Gates & Robots.txt Disallow Check

### Scenario 5.1: Critical Disallow Alert
  Given a user executes an AI Visualize scan on a domain
  And the domain's robots.txt contains "User-agent: *" followed by "Disallow: /"
  When the scan processes the Robots.txt protocol gate
  Then the system flags a "TOTAL AI BLINDNESS" critical alert status
  And the report marks the domain visibility score as "Ugly" (FAIL)
  And the dashboard displays a call-to-action redirecting to the AIOptimize Workspace upgrade hook to download the corrected robots.txt permission split

---

## Feature 6: Affiliate Network Referral Gating

### Scenario 6.1: External AI Citation Tracking Redirect
  Given a user is viewing the "AI Visibility Tracking & Share of Voice" dashboard component
  When the user attempts to view live brand citation percentages or track keywords across ChatGPT, Claude, and Perplexity
  Then the component displays a Call-to-Action block detailing the affiliate tracking network
  And the user-accessible link routes the user externally via an affiliate tracking URL directly to partner platform suites (e.g., Semrush's Generative AI Engine Tracking utilities)
  And the application does not execute local scraper checks for live search engine share-of-voice data

---

## Feature 7: End-to-End Vitest Regression Suite

### Scenario 7.1: Comprehensive Backend Endpoint and Module Test Coverage
  Given the full application codebase across Sprints 1 through 8
  When the automated Vitest test runner is executed against all service modules (`crawlerService.js`, `parserService.js`, `generatorService.js`, `authController.js`, `rateLimiter.js`)
  Then all unit and integration test assertions pass cleanly with 0 failures
  And all 32 core capabilities and quota boundaries function without backward regression

---

## Feature 8: Twelve-Factor Staging Deployment Pre-Flight

### Scenario 8.1: Environment Variable and Pre-Flight Staging Audit
  Given the digital staging environment configuration for DigitalOcean App Platform (`.do/app.yaml`)
  When the deployment validator inspects environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`, `NODE_ENV`, `RATE_LIMIT_FREE_DAILY`)
  Then all required 12-factor environment keys are validated
  And the staging pre-flight checklist (`DIGITALOCEAN_STAGING_DEPLOYMENT_GUIDE.md`) is verified ready for zero-downtime container launch

