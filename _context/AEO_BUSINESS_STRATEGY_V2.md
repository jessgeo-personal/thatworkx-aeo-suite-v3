# AEO by Thatworkx Business Strategy

## Fundamental

### Why AEO
* Answer Engine Optimization or GenerativeAI Engine Optimization is the next evolution of search and this is a market that consitutes the most as far as marketing budgets are concerned.  The rules however are different and most people and businesses with a web presence havent migrated to the new data requirements.

### Objective
* Though most people will come to AEO/GEO with the intention of being listed and cited at the top of any Answer engine across AI summaries, the objective of the AEO and whatever our tools provide is to be confident that their web presense is optimized, accessible, credible and citable when a question comes through.  We do not want brand, content or personal data to end up with hallucinative or muddled answers due to a lack of well formed, attributable content.  In order to acheive this, we support businesses and individuals with tools that can continously monitor and maintain web presences and content with an approach to content publishing by ensuring core assets are AI-Optimized, and scaling up to fully AI-Ready status through dedicated machine manifests..

### Dashboard Container Track Categorizations
To guide the user along an educational onboarding path, all capabilities and diagnostic results are dynamically grouped into the following visual containers:

#### 🔍 AIVisualize Sections (The Inquiry Grid)
* **Section 1: Gateway & Access (Are you blocking out AI?)**
  - Audits robots.txt existence, CDN/Edge firewall blocks, and X-Robots-Tag headers.
  - *Conflict Resolution Rule:* Do NOT evaluate `sitemap.xml` in this section.
* **Section 2: Presence & Hygiene (Is your web presence optimized for AI?)**
  - Audits XML sitemaps (`sitemap.xml` missing penalties apply strictly here), HTTP response headers, Single Page App (SPA) hydration traps, and HTTPS SSL secure encryption.
* **Section 3: Content AI-Readiness**
  - Assesses title tag length sweet spots, meta description presence, heading nesting outline trees, and Flesch readability ratings.
* **Section 4: Machine Manifest Readiness (Are you setup to be AI-Ready?)**
  - Audits presence of machine directories (`/llms.txt`), corporate profiles (`/ai-context.md`), narrative profiles (`/about.md`), etc.

#### 🎛️ Dual-Mode Presentation
* **Executive Mode (`?mode=executive`):** Translates the 32 capabilities into plain-English business questions and high-level readiness graphics.
* **DIY (Developer) Mode (`?mode=developer`):** Displays granular technical data, Flesch syntactic scores, and expandable DOM routes.
* **Monetization Hooks:** Both modes must aggressively feature "Upgrade to AIV Pro / AIO Pro" hooks embedded directly in the server-rendered HTML for locked capabilities (e.g., automated `ai-context.md` generation).

#### ⚡ AIOptimize Tracks (The Remediation Sandbox)
* **Track 1: AI-Optimized Page Fixes**
  - Interactive sandboxes for Robots.txt editing, Cloudflare WAF Workers (SPA bypass), Edge Scripts (custom header injection), and organization JSON-LD entity schema.
* **Track 2: AI-Ready File Generators**
  - Dynamic copy-pasteable generators for `/llms.txt`, `/ai-context.md`, `/about.md`, `/docs.md`, `/content.md`, and sitemap.xml files.

### What is AI-Ready when it comes to AEO/GEO
* AI-Ready involves creating websites keeping in mind the limitations of AI-bots and RAG systems in being token economical, content intensive and credibility enforcing.  The alternative is to create the following framework that will parallely support AI-bots and RAG systems with this file heirarchy:

* **FILE HEIRARCHY**

🌐 Inbound AI Bot Connection Request
   │
   ├──► 🔒 LEVEL 1: PROTOCOL GATES (The Gatekeepers)
   │     └── robots.txt (Permissions Verification)
   │
   ├──► 🗺️ LEVEL 2: MACHINE WELCOME MATS (The Directories)
   │     ├── llms.txt (Modern AI Directory Index)
   │     └── sitemap.xml (Structural URL Web Tree)
   │
   ├──► 🤝 LEVEL 3: THE BLUEPRINT MANIFEST (The Orchestrator)
   │     └── ai-context.md (System Prompts & Context Map)
   │
   └──► 🗂️ LEVEL 4: GRANULAR WORKSPACES (The Semantic Chunks)
         ├── README.md (Rapid Portal Summary)
         ├── about.md  (Identity, Trust & E-E-A-T Signatures)
         ├── docs.md   (Hard Metrics, Specs & Technical Blueprints)
         └── content.md (Long-Form Case Studies & Narrative Vault)

## Product Strategy
* **Top-of-Funnel Onboarding Hook:** Educate incoming users that an estimated **35% of the internet is unknowingly blocking AI crawlers** through CDN, edge proxy, and firewall misconfigurations. The user journey starts with this question to create immediate diagnostic urgency.
* **The 3-Pillar Onboarding Route:** The homepage guides visitors through three distinct action cards:
  1. **AI Visualize (Inquire):** Inspect visibility and check if you are blocking out AI.
  2. **AI Optimize (Treat):** Correct visibility gaps and configure your assets to be AI-Optimized and AI-First.
  3. **AI Socialize (Amplify):** Enhance external trust anchors and connect social signatures to your domain.
* **AI-Optimized vs. AI-First Categorization:**
  - **AI-Optimized:** Enforces baseline access parameters (CDN config, Robots.txt splits, x-robots tags, heading structure, SSL trust).
  - **AI-Ready:** Establishes semantic, machine-readable manifest trees (`/llms.txt`, `/ai-context.md`, flat-text folder workspaces).

* Free vs. paid: Features included in the free versions are to give users an understanding of their web presence status with regards to AEO/GEO and what they can get if they upgrade to Pro or Enterprise.  Free versions will not have heavy headless browser runs or AI summaries.  They will include programmatic and text parsed pulls only.  Free versions will also have limited tries per day and limited scope as well.  Pro versions will include higher limits per day (tries per day and number of pages) and include a certain number of headless runs per day.  Enteprise version will be for hardcore users with custom limits.  Headless runs should be done only on-demand, but if the run is made, it should update the whole site in one go and have timeouts.

* API access: the expecation is that we will have an API first approach for AIVisualize and AIOptimize so Pro and Enterprise users can access individual measures and metrics through API and incorporate them into workflows and dashboards.

### Product suite
* **AIVisualize by thatworkx:**  AIVisualize is focused on the standard business user who has the question 'What does AI/GenAI see when it is asked about my business/brand/Individual based on my web presence and content?'.  This is a simple question that has a lot of nuances.  It covers everything from technical issues like content hidden behind code, heavy pages that need client-side rendering or has too many tags, search optimization as opposed to Answer engine optimization, unclear sitemaps, uncrecognized schemas etc., to content issues like unrecognized schemas, no author bios, essential pages not complete or readable, heading heirarchy all over the place etc.  One assumption here is that, for a business user, who does not have a technical team, it might be easier to go AI-Ready by following the file-heirachy above parallely and edit it with the help of AIVisualize Pro and AIOptimize Pro.  IF not, AIVisualize Pro should be able to help unhide most of the content on the web presence to improve the overall AI visibility and EEAT scores.  Here are the different versions of AIVisualize and their features: 
    * **AIVisualize Free:**
        * 1. Scans upto a maximum of 3 pages 5 times a day but shows counts of total number of pages
        * 2. Shows content of Robots.txt, llms.txt, doc.md, about.md, content.md, ai-context.md but no optimization guidance
        * 3. Firewall blocking, robots.txt blocking(disallow) and x-robots check and basic unblocking provided with guidance
        * 4. Everything else listed, should be only checks with yes/no, no guidance
        * 5. No Export functionality
    * **AIVisualize Pro:**
        * 1. Everyting in Free + upto 40 pages 50 times a day
        * 2. No API access
        * 3. Export functionality included
    * **AIVisualize ENT:**
        * 1. Everything in PRO + upto 100 pages(by default) 50 times a day (including API)
        * 2. API access

* **AIOptimize by thatworkx:**  AIOptimize is focused on the hands-on business user/marketer/product marketer/brand manager etc., or technical teams like web dev, Devops, web managers, content managers, etc.  These are professional who can fix issues with guidance, source content from the appropriate people, or get workflows created using APIs.  The workflows referred to are to ensure the checks in AIVisualize and AIOptimize platforms can be run through as part of design-build-publish cycle of web publishing of the web presence that they manage - ensuring the file in the file heirarchy above are maintained parallely, or the core web pages are checked and corrected - after every change and before publishing.
    * **AIOptimize Free:**
        * 1. Nothing heavy using headless browser
        * 2. No Site-level EEAT
        * 3. No Export Functionality
        * 4. 5 scans a day
    * **AIOptimize Pro:**
        * 1. Everything in Free + Site-level EEAT
        * 2. Headless browser runs upto 3 in a day
        * 3. Export functionality
        * 4. AIVisualize Pro for free
        * 5. Upto 50 times a day (headless browser only 3 times a day)
    * **AIOptimize ENT:**
        * 1. Everything in Pro + API Access (upto 50 times a day)
        * 2. AIVisualize ENT Access with API access (upto 50 times a day separate from AIOptimize Pro runs)
        * 3. Headless browser runs upto 10 included - can buy more.

* **AISocialize by thatworkx:**AISOcialize is focused on content creators who generate more frequently than the business users and marketers, and primarily work on social media and other social platforms, as opposed to on their/their business's website and domain.  But since validity of the content being created is dependent on tieback to the domain and the author credentials on the main website, it is important for these creators to keep track of what goes on on their home domain.  AiSocialize helps them keep track of status on their domains and company's web presence(even if they dont manage it themselves), and compliments their content creation work by providing snippets and content to copy into the pages, markdown and text files mentioned in the AI-Ready file heirarchy above(it is possible to automate this as well - probably in a AIsocialize PRO version, currently not part of MSP)

* **Points to note about the 3 products**  AI Visualize and AIOptimize are designed to be web apps that support subscriptions where there is a AIVisualize, AIVIsualize PRO, AIVisualize ENT, AIOptimize, AIOptimize PRO(which includes AIVIsualizePRO free) and AIOptimize ENT(Which includes AIVisualize PRO for free).  To make things simple, users can come to aeo.thatworkx.com, choose using the toggle of the AIVisualize and AIOptimize options on the page, fill in the URL and when Initiate scan is pressed, the chosen tool processing is done.  AISocialize on the other hand will show up on the aeo.thatworkx.com page, but with an explanation that it is for content creators to keep track of how compliant their created and published content is, with respect to AEO/GEO.  AISocialize is a browser extension/mobile app(future) which doe not have a server function at this time, and the product is completely free to use(we might put ads to support).  AISocialize will help creators to track if the background processes and setup is correct to complement whatever creation and publishing of ocntent they are doing. 

### Scan Operations, Page Scope, and Daily Compute Restrictions

To isolate our server infrastructure from runaway compute loops and keep server usage costs linear, the backend request middleware evaluates every single scan invocation using a clear validation check array based on **Daily Iteration Caps**, **Per-Scan Page Depths**, and **Headless Runtime Allocations**:

| Subscription Plan & Tier | Daily Scan Allocation ("Tries per Day") | Page Depth Budget (Per Execution Block) | Headless Browser Allocation (Daily Runtime Sessions) |
| :--- | :--- | :--- | :--- |
| **AIVisualize Free** | Max 5 Scans / Day | Max 3 Pages / Scan (Outputs total site count summary) | 0 Sessions (Programmatic text and DOM string-parsing only) |
| **AIVisualize Pro** | Max 50 Scans / Day | Max 40 Pages / Scan | 0 Sessions (Programmatic text and DOM string-parsing only) |
| **AIVisualize ENT** | Max 50 Scans / Day (API Ingest Enabled) | Max 100 Pages / Scan (Default Baseline Cap) | 0 Sessions (Programmatic text and DOM string-parsing only) |
| **AIOptimize Free** | Max 5 Scans / Day | 1 Single Landing Page Profile | 0 Sessions (Programmatic text and DOM string-parsing only) |
| **AIOptimize Pro** | Max 50 Scans / Day | Max 40 Pages / Scan (Inherits AIV Pro Access Scope) | Max 3 On-Demand Headless Sweeps / Day |
| **AIOptimize ENT** | Max 50 Scans / Day (Dedicated API Layer) | Max 100 Pages / Scan (Separate from AIV ENT Quota allocations) | Max 10 Included Headless Sweeps / Day (Plus metered add-ons) |

### Systems Engineering Implementation Directives:
1. **Headless Execution Flow:** Headless instances (Puppeteer/Playwright loops used to capture high-density client-side rendering) are triggered strictly via user intent on an *on-demand basis*. When activated, the instance sweeps the entire web directory path mapped to that budget *in one single execution loop*, monitored by strict system time-out values to prevent ghost processes.
2. **Database Schema Requirement:** The `users` or `domains` table structure generated by the application must maintain transactional track rows logging:
   - `daily_scans_performed` (Resets at 00:00 UTC)
   - `daily_headless_runs_performed` (Resets at 00:00 UTC)
3. **Frontend Notification Trigger:** If a user reaches their execution limit or attempts to crawl a site structure deeper than their current depth allowance, the system payload intercept block blocks the action and drops a modal UI window indicating an immediate upgrade trigger.

## System Data Delivery Architecture

To maintain high development velocity and protect system scalability, the platform splits file delivery infrastructure into strictly segregated access tiers:

### 1. AIOptimize Pro Tier (Manual & Sandbox Export Layer)
* **Delivery Engine:** The dashboard does NOT communicate directly with user host servers. Instead, it operates entirely as an Interactive Generation Sandbox.
* **UI Interface Component:** When optimization is complete, the workspace renders a raw text display viewport component containing a `Click to Copy` button asset.
* **Platform Target Dropdown:** Below the text code display block, the UI presents a multi-choice platform selector menu containing:
  - `Generic Web / Public_HTML` (Standard markdown file downloads)
  - `Webflow / Custom Code Injections` (Header & header asset workarounds)
  - `Shopify / Cloudflare Edge Workaround Track`
* **The Shopify Cross-Domain Architecture:** For e-commerce storefronts locked down by starter packages or isolated entirely on store sub-domains (e.g., `shop.brand.com`), the platform bypasses native CMS file restrictions by generating custom Cloudflare Worker script templates. The user copies the provided Edge routing script into their Cloudflare ecosystem, safely proxying `/llms.txt` and `/ai-context.md` from the root namespace without breaking storefront operations.

### 2. AIOptimize Enterprise Tier (Programmatic System Sync Layer)
* **Delivery Engine:** Unlocks direct read/write API automation routes.
* **Core REST Endpoint Gateway:**
  - `POST /api/v1/enterprise/sync`
* **Payload Verification Framework:** Accepts clean, structured multi-route JSON arrays representing system updates. The client architecture executes its own server cron updates to fetch or push changes.
* **Future Connectors Roadmap (Post-MSP):** Scoped for V2 platform builds leveraging intermediate web hooks (Zapier, Make.com) to automate manual content-author publishing loops dynamically.

## Verified Attribution & External AI Citation Tracking Strategy

Rather than building complex, high-maintenance real-time LLM validation tracking scrapers for the initial product launch, the workspace embeds a high-converting affiliate referral engine directly into the user interface canvas to maximize secondary revenue streams.

### The UI Attribution Component Implementation
* **Dashboard Location:** Placed directly inside the master workspace metrics sidebar panel under the category title: `AI Visibility Tracking & Share of Voice`.
* **The Product Hook:** The sidebar renders a dynamic mock tracking metric widget visualizing target AI engine responses. A high-contrast callout notification displays a state indicator message:
  > *"Technical layout optimized for machine crawling. To continually log your live brand citation percentages and tracking keywords across ChatGPT Search, Claude, and Perplexity engines, activate your account validation token with our verified network analytics tracking partners."*
* **The Link Matrix:** The callout routes the customer via a tracking affiliate URL link directly to partner platform suites (e.g., Semrush's Generative AI Engine Tracking utilities).
* **Business Benefit:** Eliminates server infrastructure creep and ongoing development maintenance for proxy arrays, while establishing immediate, zero-overhead high-margin cash flow channels.

---

## TWELVE-FACTOR SPECIFICATION & RELEASE GATING RULES

### 1. Configuration Isolation Directive
* **Strict Runtime Parameterization:** All system parameters, connection strings, tier limits, and port numbers must be accessed strictly via `process.env` calls. Hardcoded URLs, magic numbers, or credentials anywhere inside application code are strictly prohibited.
* **Environment Manifest Maintenance:** A baseline template named `.env.example` must be continuously maintained in the project root directory, documenting all mandatory runtime keys without exposing secret data.

### 2. Pre-Flight Staging Release Gate
* **Git Push Intercept:** Prior to executing any Git push or deployment merge to the GitHub `staging` branch, the Control Agent must HALT pipeline execution.
* **Key Extraction Checklist:** The Control Agent must scan the incremental diff, extract all newly introduced environment variable keys, and print them to the console under the header: `⚠️ DIGITALOCEAN STAGING PRE-FLIGHT ENVIRONMENT INJECTION REQUIRED`.
* **Human Notification & Gate Prompt:** The Control Agent must trigger the native Windows notification system and hold execution under an explicit prompt:
  `> Awaiting DigitalOcean Config Sync. Type 'DEPLOY' once keys are saved in the cloud panel to initiate git sync:`
* **Deployment Release:** Only upon receiving the explicit input string `'DEPLOY'` will the Control Agent proceed to merge changes into the staging branch for automatic DigitalOcean synchronization.