export const STAGE_MATRIX = [
  {
    step: 1,
    shortTitle: "AI Bot Blocks",
    fullTitle: "AI Bot Blocks & Crawler Gateway Permissions",
    tooltip: "AI Bot block checks",
    scanMsg: "Scanning for blocks to AI Bots accessing your website (GPTBot, ClaudeBot, PerplexityBot, Googlebot...)",
    classification: "AI-Optimized",
    desc: "WAF rules, Cloudflare challenge detection, and User-Agent blocking verification across 20+ AI crawlers."
  },
  {
    step: 2,
    shortTitle: "Essential Content",
    fullTitle: "Identifiable Essential Pages & Core Anchors",
    tooltip: "AI Essential content checks",
    scanMsg: "Scanning for Identifiable Essential pages for AI (About, Contact, Pricing, Privacy, Terms)...",
    classification: "AI-Optimized",
    desc: "AI uses essential pages and core anchors to verify your company credentials like company identity(/about), direct contact details(/contact), privacy commitments(/privacy) and terms of service(/terms)."
  },
  {
    step: 3,
    shortTitle: "Content Availability",
    fullTitle: "Content Availability & Semantic Text Density",
    tooltip: "AI Bot Content Availability checks",
    scanMsg: "Scanning for Content Availability for AI-bots accessing your website and evaluating citation extractability...",
    classification: "AI-Optimized",
    desc: "Per-webpage AI Citation Audit, DOM text density, semantic heading structure, and information gain."
  },
  {
    step: 4,
    shortTitle: "Trust & Privacy",
    fullTitle: "Entity Authority, E-E-A-T & Privacy Indicators",
    tooltip: "AI Trust and Privacy checks",
    scanMsg: "Scanning for AI trust and privacy indicators (E-E-A-T footprint, Knowledge Graph grounding)...",
    classification: "AI-Optimized",
    desc: "Knowledge Graph entity grounding, author authority schemas, and organizational trustworthiness."
  },
  {
    step: 5,
    shortTitle: "AI-Ready Files",
    fullTitle: "Machine Manifest Protocol Explorer",
    tooltip: "AI-ready file checks",
    scanMsg: "Scanning for existing machine-readable AI-Ready files on your website (llms.txt, llms-full.txt, OpenAPI)...",
    classification: "AI-Ready",
    desc: "Machine endpoints, llms.txt manifest hierarchy, and machine ingestion schemas with AIOptimize context."
  },
  {
    step: 6,
    shortTitle: "Executive Summary",
    fullTitle: "Executive Summary & Action Triage",
    tooltip: "Executive summary and Action items",
    scanMsg: "Compiling Boardroom Summary & Action Triage across all 5 completed diagnostic modules...",
    classification: "Executive Boardroom",
    desc: "Overall Health Index Dial, Dual-Pillar Readiness Breakdown, and Top 5 Urgent Action Items."
  }
];

export const AUDIT_DATA = {
  domain: "https://thatworkx.com",
  timestamp: "Aug 20, 2026 • 11:30 AM IST",
  scanDuration: "3.8s",
  totalPages: 24,
  healthIndex: 78,
  statusLabel: "AI-Optimized",
  humanWebReadiness: 92,
  machineWebReadiness: 54,
  sections: {
    1: {
      score: "100%",
      status: "PASS",
      summaryText: "Bot Access: 20/20 Verified Unblocked",
      takeaway: "All major global, European, and Asian AI search engines (OpenAI, Anthropic, Google, Perplexity) have unrestricted crawler access to your domain with zero firewall blocking.",
      evidencePlain: "Verified clean HTTP 200 responses across 20 registered AI User-Agents. No Cloudflare CAPTCHAs, JavaScript challenge gates, or restrictive Disallow directives encountered.",
      evidenceTrace: "HTTP/2 200 OK\nServer: cloudflare\nX-Robots-Tag: all, index, follow\nUser-Agent Directives: 20/20 Explicitly Permitted\nStatus: 0 Blocks Detected",
      actionPlan: "Maintain standard robots.txt allow rules. Schedule monthly automated checks for newly introduced AI search agent crawlers.",
      actionSteps: [
        { title: "Review robots.txt directives", detail: "Check your root /robots.txt file for accidental wildcard Disallow: / directives or restrictive crawler blocks." },
        { title: "Whitelist all 20 AI engines", detail: "Add explicit Allow: / blocks for GPTBot, ClaudeBot, PerplexityBot, Googlebot, Meta-ExternalAgent, and regional AI crawlers." },
        { title: "Configure Cloudflare / WAF rules", detail: "Ensure Web Application Firewall settings bypass JavaScript challenge gates and CAPTCHAs for verified search bot IP ranges." },
        { title: "Verify HTTP response headers", detail: "Ensure public routes return X-Robots-Tag: all, index, follow to prevent stealth de-indexing by search engine crawlers." }
      ],
      shortcutPlan: "Deploying Level 1 Machine Manifests via AIOptimize Pro automatically generates cloud edge proxy rules and verified crawler permissions across all 20 AI search engines—skipping the need to manually configure server headers or debug complex WAF firewall rules."
    },
    2: {
      score: "75%",
      status: "WARN",
      summaryText: "Essential Pages: 4 Found, 1 Missing (/pricing)",
      takeaway: "AI search engines can verify your company identity, direct contact details, and privacy commitments, but cannot confirm commercial pricing tiers due to a missing /pricing anchor.",
      evidencePlain: "Discovered valid /about, /contact, /privacy-policy, and /terms-of-service pages. Detected HTTP 404 Not Found on canonical /pricing endpoint.",
      evidenceTrace: "GET /about -> 200 OK (Entity Valid)\nGET /contact -> 200 OK (ContactPoint Valid)\nGET /privacy-policy -> 200 OK\nGET /terms-of-service -> 200 OK\nGET /pricing -> 404 Not Found (Missing Anchor)",
      actionPlan: "Publish a dedicated /pricing page with structured plan tiers and transparent pricing metrics to enable high-intent commercial answer citations.",
      actionSteps: [
        { title: "Create canonical /pricing endpoint", detail: "Author a dedicated HTML page at /pricing with clear tier names, exact currencies, billing intervals, and feature tables." },
        { title: "Verify HTTP 200 responses", detail: "Ensure /about, /contact, /privacy-policy, /terms-of-service, and /pricing return direct 200 OK status without redirect chains." },
        { title: "Update header & footer navigation", detail: "Add clear, crawlable anchor links to all 5 core company pages in your site's global header and footer menus." },
        { title: "Embed Offer and ContactPoint schemas", detail: "Add JSON-LD Offer and ContactPoint metadata into page headers to allow instant commercial price citations by AI models." }
      ],
      shortcutPlan: "AIOptimize Pro automatically compiles your company credentials into dedicated Level 4 Markdown files (/about.md, /pricing.md, /terms.md) and links them via /llms.txt—bypassing the need to manually build or redesign HTML visual pages on your website."
    },
    3: {
      score: "68%",
      status: "WARN",
      summaryText: "Citation Readability: 16/24 High Extractability",
      takeaway: "Core product and blog pages demonstrate strong semantic density, but interactive app wrappers suffer from heavy client-rendered JavaScript hydration traps (<10% text-to-HTML ratio).",
      evidencePlain: "16 of 24 crawled pages deliver clean server-rendered semantic HTML with well-ordered H1->H2 heading trees. 8 client-rendered routes deliver sparse initial payloads.",
      evidenceTrace: "Average Text-to-HTML Ratio: 28.4%\n/solutions/ai-audit: 32.1% (High Gain)\n/blog/aeo-vs-seo: 41.0% (High Gain)\n/case-studies: 14.2% (Warning: SPA Hydration)\n/demo: 6.4% (Critical: Low Text Density)",
      actionPlan: "Implement Server-Side Rendering (SSR) or Static Site Generation (SSG) for /demo and /case-studies to boost initial HTML text density above 25%.",
      actionSteps: [
        { title: "Audit low-density SPA routes", detail: "Identify client-side rendered routes (/demo, /case-studies) delivering initial HTML text-to-code ratios below 10%." },
        { title: "Enable SSR or SSG pre-rendering", detail: "Pre-render key marketing and product pages on the server so AI bots receive fully hydrated semantic text on first request." },
        { title: "Eliminate render-blocking payload bloat", detail: "Strip bloated inline script arrays, unused CSS frameworks, and massive SVG vectors to achieve >= 25% text density." },
        { title: "Structure clear H1->H2->H3 heading trees", detail: "Place concise 1-2 sentence direct answers immediately below each H2 subheading for maximum snippet extraction." }
      ],
      shortcutPlan: "Instead of expensive refactoring of client-side JavaScript apps into Server-Side Rendering (SSR), AIOptimize Pro automatically generates high-density Level 3 & 4 Markdown feeds (/ai-context.md), skipping HTML hydration traps and providing 100% extractable facts directly to LLMs."
    },
    4: {
      score: "80%",
      status: "PASS",
      summaryText: "Trust & EEAT: Valid Organization & Author Schema",
      takeaway: "Strong E-E-A-T signals grounded by valid Schema.org Organization graphs and verified author citations across 100% of technical research publications.",
      evidencePlain: "Found complete JSON-LD Organization graph linked to official LinkedIn and corporate identities. Author Person schemas include sameAs authority verification.",
      evidenceTrace: "{\n  \"@context\": \"https://schema.org\",\n  \"@type\": \"Organization\",\n  \"name\": \"Thatworkx\",\n  \"url\": \"https://thatworkx.com\",\n  \"sameAs\": [\"https://linkedin.com/company/thatworkx\"],\n  \"knowsAbout\": [\"AEO\", \"LLM Ingestion\", \"Machine Manifests\"]\n}",
      actionPlan: "Expand entity footprint by registering official Wikidata and Google Knowledge Graph disambiguation nodes to solidify multi-engine brand consensus.",
      actionSteps: [
        { title: "Deploy JSON-LD Organization schema", detail: "Embed a structured Organization graph into your homepage header with canonical @id URI, brand name, and logo URL." },
        { title: "Connect verified sameAs authority links", detail: "Add official links to your verified LinkedIn, Crunchbase, GitHub, and Wikipedia/Wikidata entities in the sameAs array." },
        { title: "Implement Person author credentials", detail: "Attach Person schemas with academic/professional sameAs references to all published articles and research papers." },
        { title: "Register Google Knowledge Graph entity", detail: "Claim and verify your corporate Knowledge Panel on Google Search and Wikidata to cement cross-model consensus." }
      ],
      shortcutPlan: "AIOptimize Pro auto-generates linked JSON-LD root entity graphs and machine-readable author consensus manifests—skipping the manual overhead of hand-crafting schema scripts or managing multi-platform knowledge graph registrations."
    },
    5: {
      score: "40%",
      status: "WARN",
      summaryText: "AI-Ready Files: llms.txt Missing (Phase 2 Opportunity)",
      takeaway: "Your website is currently AI-Optimized for human visitors, but lacks dedicated Level 1–4 Machine Manifests (/llms.txt, /llms-full.txt, OpenAPI) for autonomous reasoning agents.",
      evidencePlain: "Robots.txt AI directives are active (Level 1 Gate). However, /llms.txt (Level 2 Welcome Mat) and /ai-context.md (Level 3 Blueprint) returned HTTP 404 Not Found.",
      evidenceTrace: "GET /robots.txt -> 200 OK (AI Directives Active)\nGET /llms.txt -> 404 Not Found\nGET /llms-full.txt -> 404 Not Found\nGET /.well-known/ai-plugin.json -> 404 Not Found",
      actionPlan: "Deploy standard /llms.txt and /ai-context.md machine manifests using AIOptimize Pro to provide direct structured ingestion to autonomous LLMs.",
      actionSteps: [
        { title: "Publish Level 1 robots.txt directive", detail: "Add an LLMs-txt: https://thatworkx.com/llms.txt pointer line to your root /robots.txt file." },
        { title: "Create Level 2 /llms.txt directory index", detail: "Author a clean markdown directory welcome mat pointing crawlers to your key markdown files with 1-line summaries." },
        { title: "Deploy Level 3 /ai-context.md blueprint", detail: "Publish a single master brand summary containing company mission, core offerings, pricing rules, and authority proofs." },
        { title: "Add Level 4 modular workspaces & schemas", detail: "Provide clean markdown workspace files (/about.md, /pricing.md, /docs.md) and OpenAPI specs for autonomous agent execution." }
      ],
      shortcutPlan: "AIOptimize Pro automatically publishes and syncs the entire 4-level machine manifest hierarchy (/robots.txt, /llms.txt, /ai-context.md, OpenAPI schemas) with your website in one click—upgrading your presence from AI-Optimized to 100% AI-Ready."
    }
  },
  top5Actions: [
    {
      id: 1,
      severity: "CRITICAL",
      rule: "Rule 1: AI Bot & WAF Access Blocks",
      title: "Verify zero Cloudflare CAPTCHAs for ClaudeBot and PerplexityBot",
      impact: "Unlocks 100% unrestricted ingestion across global search crawlers.",
      stepJump: 1
    },
    {
      id: 2,
      severity: "HIGH",
      rule: "Rule 2: Missing Essential Pages",
      title: "Publish dedicated /pricing commercial anchor page",
      impact: "Resolves 404 gap during high-intent transactional AI answer synthesis.",
      stepJump: 2
    },
    {
      id: 3,
      severity: "HIGH",
      rule: "Rule 3: E-E-A-T & Knowledge Graph Entity Gaps",
      title: "Ground Organization Schema with Wikidata and official sameAs profiles",
      impact: "Strengthens entity disambiguation in Google Gemini & ChatGPT search grounding.",
      stepJump: 4
    },
    {
      id: 4,
      severity: "MEDIUM",
      rule: "Rule 4: Citation Readability & DOM Scannability",
      title: "Refactor /demo and /case-studies to boost initial SSR text density above 25%",
      impact: "Improves AI snippet extractability and direct citation probability.",
      stepJump: 3
    },
    {
      id: 5,
      severity: "GROWTH",
      rule: "Rule 5: Zero AI-Ready Manifest Warnings",
      title: "Deploy missing /llms.txt and /llms-full.txt machine manifests",
      impact: "Provides clean, structured context to developer and enterprise LLM reasoning loops.",
      stepJump: 5
    }
  ]
};

export const ALL_STAGE3_PAGES = [
  { 
    url: "/demo/workspace", 
    ratio: 6, 
    status: "CRITICAL LOW", 
    color: "bg-red-500", 
    gain: "0.18",
    wordCount: 42,
    isCrawled: true,
    isThin: true,
    isHeavySpa: true,
    hasCanonical: false,
    hasAllRequired: false,
    missingRequired: ["main", "footer"],
    missingAltCount: 2,
    missingAltList: [
      { src: "/images/workspace-preview.png", suggestedAlt: "Interactive AEO diagnostic cockpit preview" },
      { src: "/images/loading-spinner.svg", suggestedAlt: "Workspace hydration loading animation" }
    ],
    lastUpdated: null,
    isSchema: true
  },
  { 
    url: "/app/interactive-analyzer", 
    ratio: 8, 
    status: "CRITICAL LOW", 
    color: "bg-red-500", 
    gain: "0.22",
    wordCount: 38,
    isCrawled: true,
    isThin: true,
    isHeavySpa: true,
    hasCanonical: false,
    hasAllRequired: false,
    missingRequired: ["header", "main", "footer"],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/analyzer-dashboard.png", suggestedAlt: "Real-time AI crawler telemetry interface" }
    ],
    lastUpdated: null,
    isSchema: true
  },
  { 
    url: "/pricing/calculator", 
    ratio: 9, 
    status: "CRITICAL LOW", 
    color: "bg-red-500", 
    gain: "0.25",
    wordCount: 110,
    isCrawled: true,
    isThin: true,
    isHeavySpa: true,
    hasCanonical: false,
    hasAllRequired: false,
    missingRequired: ["footer"],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/pricing-slider-knob.png", suggestedAlt: "Plan tier customizer slider control" }
    ],
    lastUpdated: null,
    isSchema: true
  },
  { 
    url: "/case-studies/enterprise-migration", 
    ratio: 12, 
    status: "WARNING (SPA)", 
    color: "bg-[#f59e0b]", 
    gain: "0.38",
    wordCount: 180,
    isCrawled: true,
    isThin: true,
    isHeavySpa: true,
    hasCanonical: true,
    hasAllRequired: false,
    missingRequired: ["main"],
    missingAltCount: 2,
    missingAltList: [
      { src: "/images/client-growth-chart.jpg", suggestedAlt: "Chart showing 340% citation increase across AI engines" },
      { src: "/images/enterprise-logo.png", suggestedAlt: "Enterprise client corporate identity logo" }
    ],
    lastUpdated: null,
    isSchema: false
  },
  { 
    url: "/case-studies/fintech-aeo", 
    ratio: 14, 
    status: "WARNING (SPA)", 
    color: "bg-[#f59e0b]", 
    gain: "0.45",
    wordCount: 220,
    isCrawled: true,
    isThin: true,
    isHeavySpa: true,
    hasCanonical: true,
    hasAllRequired: false,
    missingRequired: ["main"],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/fintech-architecture.png", suggestedAlt: "Fintech machine manifest ingestion flow" }
    ],
    lastUpdated: null,
    isSchema: false
  },
  { 
    url: "/products/live-visualizer", 
    ratio: 16, 
    status: "WARNING (SPA)", 
    color: "bg-[#f59e0b]", 
    gain: "0.49",
    wordCount: 290,
    isCrawled: true,
    isThin: false,
    isHeavySpa: true,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/visualizer-mockup.png", suggestedAlt: "AIVisualize 6-stage diagnostic dashboard" }
    ],
    lastUpdated: "2026-08-01",
    isSchema: false
  },
  { 
    url: "/solutions/developer-api", 
    ratio: 18, 
    status: "WARNING (SPA)", 
    color: "bg-[#f59e0b]", 
    gain: "0.52",
    wordCount: 340,
    isCrawled: true,
    isThin: false,
    isHeavySpa: true,
    hasCanonical: false,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-10",
    isSchema: true
  },
  { 
    url: "/sandbox/llms-preview", 
    ratio: 21, 
    status: "MODERATE", 
    color: "bg-[#f59e0b]", 
    gain: "0.61",
    wordCount: 420,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: false,
    missingRequired: ["footer"],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/llms-file-icon.png", suggestedAlt: "llms.txt file format specification icon" }
    ],
    lastUpdated: null,
    isSchema: false
  },
  { 
    url: "/resources/manifest-templates", 
    ratio: 24, 
    status: "MODERATE", 
    color: "bg-[#f59e0b]", 
    gain: "0.68",
    wordCount: 480,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-12",
    isSchema: false
  },
  { 
    url: "/blog/why-seo-fails-in-ai", 
    ratio: 26, 
    status: "GOOD", 
    color: "bg-[#38bdf8]", 
    gain: "0.74",
    wordCount: 850,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 1,
    missingAltList: [
      { src: "/images/seo-vs-aeo-graph.jpg", suggestedAlt: "Comparison graph between traditional SEO and generative AEO" }
    ],
    lastUpdated: "2026-08-15",
    isSchema: true
  },
  { 
    url: "/solutions/ai-audit", 
    ratio: 32, 
    status: "GOOD", 
    color: "bg-[#38bdf8]", 
    gain: "0.82",
    wordCount: 1200,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-18",
    isSchema: false
  },
  { 
    url: "/docs/quickstart", 
    ratio: 34, 
    status: "GOOD", 
    color: "bg-[#38bdf8]", 
    gain: "0.84",
    wordCount: 950,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-19",
    isSchema: false
  },
  { 
    url: "/docs/entity-disambiguation", 
    ratio: 35, 
    status: "GOOD", 
    color: "bg-[#38bdf8]", 
    gain: "0.85",
    wordCount: 1100,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/blog/machine-manifests-explained", 
    ratio: 38, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.88",
    wordCount: 1450,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/blog/aeo-vs-seo-2026", 
    ratio: 41, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.89",
    wordCount: 1680,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/docs/architecture-spec", 
    ratio: 42, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.91",
    wordCount: 1850,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/blog/eeat-knowledge-graph-grounding", 
    ratio: 44, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.92",
    wordCount: 1520,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/about", 
    ratio: 45, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.93",
    wordCount: 680,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/contact", 
    ratio: 46, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.94",
    wordCount: 520,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/terms-of-service", 
    ratio: 48, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.95",
    wordCount: 2100,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/privacy-policy", 
    ratio: 51, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.96",
    wordCount: 2350,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/faq", 
    ratio: 52, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.97",
    wordCount: 1400,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/blog/chatgpt-searchbot-optimization", 
    ratio: 54, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.98",
    wordCount: 1750,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  },
  { 
    url: "/research/generative-engine-citations", 
    ratio: 58, 
    status: "EXCELLENT", 
    color: "bg-[#10b981]", 
    gain: "0.99",
    wordCount: 2450,
    isCrawled: true,
    isThin: false,
    isHeavySpa: false,
    hasCanonical: true,
    hasAllRequired: true,
    missingRequired: [],
    missingAltCount: 0,
    missingAltList: [],
    lastUpdated: "2026-08-20",
    isSchema: false
  }
];

export const state = {
  isAudited: true,
  currentStep: 6,
  completedSteps: [1, 2, 3, 4, 5, 6],
  scanningStep: null,
  isSimulating: false,
  userNavigatedEarly: false,
  isSystemError: false,
  isResponsivePreview: false,
  isSidebarOpen: false,
  stage3VisibleCount: 5,
  simTimer: null
};

export function copyTextSnippet(btn, textToCopy) {
  if (typeof navigator !== 'undefined' && navigator.clipboard) {
    navigator.clipboard.writeText(textToCopy);
  }
  if (btn) {
    const originalHtml = btn.innerHTML;
    btn.innerHTML = "<span>Copied ✓</span>";
    btn.classList.add("bg-[#10b981]", "text-black");
    setTimeout(() => {
      btn.innerHTML = originalHtml;
      btn.classList.remove("bg-[#10b981]", "text-black");
    }, 2000);
  }
}

export function buildLegacyMatchedPageFixPanels(p, idx) {
  const domain = AUDIT_DATA.domain ? AUDIT_DATA.domain.replace(/^https?:\/\//, '') : 'thatworkx.com';
  const tokens = Math.round((p.wordCount || 0) * 1.35);
  let panels = [];

  if (!p.isCrawled) {
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>🔴</span>
          <span>Crawl Error / Blank Page Detected</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">The page could not be crawled or returned a 0-byte DOM payload.</p>
        <div class="text-[#bdc1c6] space-y-1 pl-4 list-disc">
          <div><strong>• 404 Not Found:</strong> Set up a 301 redirect to the correct target URL or restore the page.</div>
          <div><strong>• 500 Server Error:</strong> Check server error logs to resolve backend script or hosting failures.</div>
          <div><strong>• Blank SPA Page:</strong> If this is a Single Page Application (SPA), enable Server-Side Rendering (SSR) to supply a readable static HTML payload.</div>
        </div>
      </div>
    `);
  }

  if (p.isThin) {
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>🔴</span>
          <span>Thin Content Warning (&lt; 250 words)</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          This page contains only <strong>${p.wordCount} words (~${tokens} tokens)</strong>. Pages with fewer than 250 words are treated as thin content and are often skipped by AI search engines.
        </p>
        <p class="text-[#94a3b8]">
          <strong>Fix Advice:</strong> Expand text with subheadings (<code>&lt;h2&gt;</code>), core business details, and an FAQ section to ensure sufficient semantic density.
        </p>
      </div>
    `);
  }

  if (p.isHeavySpa) {
    panels.push(`
      <div class="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs sm:text-sm space-y-3">
        <div class="font-bold text-amber-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>SPA / Heavy JavaScript & Deep DOM Nesting Detected</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          This page uses heavy client-side JavaScript hydration or contains complex deep DOM nesting, which makes it difficult for AI crawlers to parse without server-side pre-rendering.
        </p>
        <button type="button" onclick="alert('Navigating to AIOptimize Pro Automated Manifest & Server Pre-rendering'); return false;" class="px-4 py-2 rounded-xl bg-[#b7410e] hover:bg-[#d45d2a] text-white text-xs font-bold transition shadow-md flex items-center space-x-2">
          <span>⚡ Optimize Heavy SPA & Server Processing with AIOptimize Pro</span>
          <span>↗</span>
        </button>
      </div>
    `);
  }

  if (!p.hasCanonical) {
    const cleanRoute = p.url.split('?')[0].split('#')[0];
    const verifiedUrl = `https://${domain}${cleanRoute}`;
    const canonicalTag = `<link rel="canonical" href="${verifiedUrl}" />`;
    const escapedCanonical = canonicalTag.replace(/"/g, '&quot;');
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2.5">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Missing Canonical URL</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">Prevents duplicate content penalties across URL variations.</p>
        <div class="text-xs text-[#bdc1c6] space-y-1">
          <div><strong>Exact Placement:</strong> Place inside the <code>&lt;head&gt;</code> section before <code>&lt;/head&gt;</code>.</div>
          <div><strong>Exact Formatting Rules:</strong> Must be an absolute URL starting with <code>https://</code> matching canonical protocol/domain without query parameters.</div>
        </div>
        <div class="p-2.5 rounded-lg bg-[#121212] border border-[#3c4043] font-mono text-xs text-[#38bdf8] overflow-x-auto">
          ${canonicalTag.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
        <button type="button" onclick="copyTextSnippet(this, '${escapedCanonical}')" class="px-4 py-1.5 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold transition flex items-center space-x-1.5 active:scale-95">
          <span>📋 Copy Canonical Tag</span>
        </button>
      </div>
    `);
  }

  if (!p.hasAllRequired) {
    const structureSnippet = '<main><article><h1>Title</h1><p>Body text...</p></article></main>';
    const escapedStructure = structureSnippet.replace(/"/g, '&quot;');
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2.5">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Missing Required Semantic HTML5 Tags</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          To help AI crawlers map your page hierarchy, the following required semantic tags are missing: 
          <strong class="text-red-400">${p.missingRequired.map(t => '&lt;' + t + '&gt;').join(', ')}</strong>.
        </p>
        <div class="text-xs text-[#bdc1c6] space-y-1">
          <div><strong>Essential Tags:</strong> <code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, and <code>&lt;footer&gt;</code>.</div>
          <div><strong>Structural Enhancements:</strong> <code>&lt;article&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;aside&gt;</code>.</div>
        </div>
        <div class="p-2.5 rounded-lg bg-[#121212] border border-[#3c4043] font-mono text-xs text-[#38bdf8] overflow-x-auto">
          ${structureSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
        </div>
        <button type="button" onclick="copyTextSnippet(this, '${escapedStructure}')" class="px-4 py-1.5 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold transition flex items-center space-x-1.5 active:scale-95">
          <span>📋 Copy Structure Snippet</span>
        </button>
      </div>
    `);
  }

  if (p.missingAltCount > 0) {
    let altHtml = p.missingAltList.map(img => `
      <div class="p-2.5 rounded-lg bg-[#121212] border border-[#3c4043] space-y-1.5 text-xs">
        <div class="text-[#cbd5e1]"><strong>Image:</strong> <code>${img.src}</code></div>
        <div class="text-red-400 font-mono">
          <span class="text-xs text-red-500 font-bold block">Current Tag:</span>
          &lt;img src="${img.src}"&gt;
        </div>
        <div class="text-[#38bdf8] font-mono">
          <span class="text-xs text-[#10b981] font-bold block">Fixed Tag:</span>
          &lt;img src="${img.src}" alt="${img.suggestedAlt}"&gt;
        </div>
      </div>
    `).join('');

    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2.5">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Images Without Alt Attributes (${p.missingAltCount} Detected)</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          AI answer engines and multimodal crawlers read <code>alt</code> attributes to understand visual information depicted in your assets.
        </p>
        <div class="space-y-2 pt-1">${altHtml}</div>
      </div>
    `);
  }

  if (!p.lastUpdated) {
    const headMetaTagSnippet = '<meta property="article:modified_time" content="2026-08-20" />';
    const bodyTimeTagSnippet = '<time datetime="2026-08-20">Updated August 20, 2026</time>';
    const escapedHead = headMetaTagSnippet.replace(/"/g, '&quot;');
    const escapedBody = bodyTimeTagSnippet.replace(/"/g, '&quot;');
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-3">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Missing Revision Date (Freshness Signal)</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">Tells AI crawlers when this specific page was last updated to ensure fresh answer synthesis.</p>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043] space-y-2">
            <span class="text-xs font-bold text-white block">Head Tag Option (&lt;head&gt;):</span>
            <div class="font-mono text-xs text-[#38bdf8] overflow-x-auto">${headMetaTagSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <button type="button" onclick="copyTextSnippet(this, '${escapedHead}')" class="px-3 py-1 rounded bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold transition active:scale-95">
              📋 Copy Head Meta Tag
            </button>
          </div>

          <div class="p-3 rounded-lg bg-[#121212] border border-[#3c4043] space-y-2">
            <span class="text-xs font-bold text-white block">Body Tag Option (Visible Body):</span>
            <div class="font-mono text-xs text-[#38bdf8] overflow-x-auto">${bodyTimeTagSnippet.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
            <button type="button" onclick="copyTextSnippet(this, '${escapedBody}')" class="px-3 py-1 rounded bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold transition active:scale-95">
              📋 Copy Body Time Tag
            </button>
          </div>
        </div>
      </div>
    `);
  }

  if (p.isSchema) {
    panels.push(`
      <div class="p-4 rounded-xl bg-red-950/20 border border-red-500/30 text-xs sm:text-sm space-y-2.5">
        <div class="font-bold text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Missing JSON-LD Schema</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">This page lacks structured entity metadata. Deploy Organization, Offer, or Article schema to anchor AI answer graphs.</p>
        <button type="button" onclick="alert('Opening Schema Builder for ' + '${p.url}'); return false;" class="px-4 py-1.5 rounded-lg bg-[#38bdf8]/15 hover:bg-[#38bdf8]/25 border border-[#38bdf8]/40 text-[#38bdf8] text-xs font-bold transition flex items-center space-x-1.5 active:scale-95">
          <span>⚡ Configure in Schema Builder ↗</span>
        </button>
      </div>
    `);
  }

  if (panels.length === 0) {
    panels.push(`
      <div class="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 text-xs sm:text-sm space-y-1.5">
        <div class="font-bold text-[#10b981] flex items-center space-x-2">
          <span>🟢</span>
          <span>All In-Page Checks Passed Successfully</span>
        </div>
        <p class="text-[#cbd5e1] leading-relaxed">
          This page meets all indexation, structure, canonicalization, semantic tagging, alt text, and revision freshness metrics required by search engines and AI agents.
        </p>
      </div>
    `);
  }

  return panels.join('');
}

export function viewWhatAISees(url, ratio, status, gain) {
  if (typeof window === 'undefined') return;
  const domain = AUDIT_DATA.domain || "https://thatworkx.com";
  const fullUrl = domain + url;
  const viewerHtml = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <title>What AI Sees: ${url}</title>
</head>
<body style="background:#121212;color:#e8eaed;font-family:monospace;padding:24px;">
  <h1>${fullUrl}</h1>
  <p>Density: ${ratio}% • Status: ${status} • Gain: ${gain}</p>
</body>
</html>`;
  if (typeof Blob !== 'undefined' && typeof URL !== 'undefined' && URL.createObjectURL) {
    const blob = new Blob([viewerHtml], { type: 'text/html' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  }
}

export function loadMoreStage3Pages() {
  state.stage3VisibleCount = Math.min(state.stage3VisibleCount + 5, ALL_STAGE3_PAGES.length);
  renderWorkspace();
}

export function toggleSidebar(open) {
  const sidebar = document.getElementById('main-terminal-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('btn-toggle-sidebar');
  state.isSidebarOpen = open;

  if (sidebar && backdrop) {
    if (open) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      if (btn) btn.classList.add('border-[#b7410e]', 'bg-[#b7410e]/20');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      if (btn) btn.classList.remove('border-[#b7410e]', 'bg-[#b7410e]/20');
    }
  }
}

export function renderStepper() {
  const container = document.getElementById('desktop-stepper');
  if (!container) return;
  container.innerHTML = '';

  STAGE_MATRIX.forEach((stage, idx) => {
    const isCompleted = state.completedSteps.includes(stage.step);
    const isScanning = state.scanningStep === stage.step;
    const isCurrent = state.currentStep === stage.step;
    const isAccessible = isCompleted || isScanning;

    const btn = document.createElement('button');
    btn.title = `${stage.tooltip} (${stage.classification})`;
    btn.onclick = () => {
      if (isAccessible) {
        if (state.isSimulating && state.scanningStep && state.scanningStep !== 6) {
          state.userNavigatedEarly = true;
        }
        navigateToStep(stage.step);
      }
    };

    let btnClasses = "stepper-pill flex items-center px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold relative cursor-pointer ";
    if (isCurrent) {
      btnClasses += "is-active ";
      btnClasses += stage.step === 5 
        ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105 " 
        : "bg-[#b7410e] text-white shadow-[0_0_20px_rgba(183,65,14,0.6)] scale-105 ";
    } else if (isScanning) {
      btnClasses += "is-scanning border-2 border-[#b7410e] text-[#d45d2a] bg-[#b7410e]/20 animate-copper-glow ";
    } else if (isCompleted) {
      btnClasses += "bg-[#1f1f1f] border border-[#3c4043] text-[#e8eaed] hover:border-[#b7410e]/60 hover:text-white ";
    } else {
      btnClasses += "opacity-35 cursor-not-allowed bg-[#121212] text-[#bdc1c6] border border-transparent ";
    }

    btn.className = btnClasses;
    btn.innerHTML = `
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${isCurrent ? (stage.step === 5 ? 'bg-black text-indigo-300' : 'bg-black text-[#d45d2a]') : isCompleted ? 'bg-[#121212] text-[#38bdf8]' : 'bg-[#121212] text-[#bdc1c6]'}">
        ${isScanning ? '●' : stage.step}
      </span>
      <span class="stepper-label text-xs font-bold font-headline truncate">${stage.shortTitle}</span>
    `;
    container.appendChild(btn);

    if (idx < STAGE_MATRIX.length - 1) {
      const conduit = document.createElement('div');
      conduit.className = `w-2.5 sm:w-4 lg:w-5 h-0.5 flex-shrink-0 ${state.completedSteps.includes(stage.step + 1) ? 'bg-[#b7410e]/60' : 'bg-[#3c4043]'}`;
      container.appendChild(conduit);
    }
  });
}

export function renderSidebar() {
  const verboseCopy = document.getElementById('sidebar-verbose-copy');
  const stagePill = document.getElementById('sidebar-stage-pill');
  const beaconDot = document.getElementById('sidebar-beacon-dot');
  const milestonesList = document.getElementById('sidebar-milestones-list');
  const milestonesCount = document.getElementById('milestones-count');
  const systemStatusLabel = document.getElementById('system-status-label');
  const systemStatusIndicator = document.getElementById('system-status-indicator');
  const quotaTag = document.getElementById('quota-tag');

  if (state.isSystemError) {
    if (verboseCopy) verboseCopy.textContent = "[SYSTEM ERROR] Crawler connection timed out. Diagnostic pipeline halted with zero quota charge.";
    if (stagePill) {
      stagePill.textContent = "SYSTEM ERROR";
      stagePill.className = "text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#f59e0b]/20 border border-[#f59e0b] text-[#f59e0b] font-bold";
    }
    if (beaconDot) beaconDot.className = "w-2.5 h-2.5 rounded-full bg-[#f59e0b] inline-block";
    if (systemStatusLabel) {
      systemStatusLabel.textContent = "ERROR (504)";
      systemStatusLabel.className = "text-[#f59e0b]";
    }
    if (systemStatusIndicator) systemStatusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#f59e0b] shadow-[0_0_8px_#f59e0b]";
    if (quotaTag) {
      quotaTag.textContent = "Quota Charged: NO [UNCHARGED]";
      quotaTag.className = "px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#f59e0b]/20 border border-[#f59e0b]/50 text-[#f59e0b]";
    }
    return;
  }

  if (state.scanningStep) {
    const meta = STAGE_MATRIX.find(s => s.step === state.scanningStep);
    if (verboseCopy && meta) verboseCopy.textContent = meta.scanMsg;
    if (stagePill) {
      stagePill.textContent = `STAGE ${state.scanningStep} SCANNING`;
      stagePill.className = "text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#b7410e]/20 border border-[#b7410e] text-[#d45d2a] font-bold animate-pulse";
    }
    if (beaconDot) beaconDot.className = "w-2.5 h-2.5 rounded-full bg-[#b7410e] inline-block animate-ping";
    if (systemStatusLabel) {
      systemStatusLabel.textContent = "OK (SCANNING)";
      systemStatusLabel.className = "text-[#38bdf8]";
    }
    if (systemStatusIndicator) systemStatusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#38bdf8] shadow-[0_0_8px_#38bdf8]";
    if (quotaTag) {
      quotaTag.textContent = "Quota Charged: YES";
      quotaTag.className = "px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a]";
    }
  } else if (state.isAudited && state.completedSteps.length === 6) {
    if (verboseCopy) verboseCopy.textContent = "Full 6-stage diagnostic scan completed. Executive triage synthesis compiled.";
    if (stagePill) {
      stagePill.textContent = "STAGE 6 COMPILED";
      stagePill.className = "text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#10b981]/20 border border-[#10b981] text-[#10b981] font-bold";
    }
    if (beaconDot) beaconDot.className = "w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block";
    if (systemStatusLabel) {
      systemStatusLabel.textContent = "OK";
      systemStatusLabel.className = "text-white";
    }
    if (systemStatusIndicator) systemStatusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#10b981] shadow-[0_0_8px_#10b981]";
    if (quotaTag) {
      quotaTag.textContent = "Quota Charged: YES";
      quotaTag.className = "px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#10b981]/20 border border-[#10b981]/40 text-[#10b981]";
    }
  } else {
    if (verboseCopy) verboseCopy.textContent = "Diagnostic engine idle. Execute scan to verify 6-stage machine footprint.";
    if (stagePill) {
      stagePill.textContent = "UNAUDITED";
      stagePill.className = "text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#121212] border border-[#3c4043] text-[#bdc1c6] font-semibold";
    }
    if (beaconDot) beaconDot.className = "w-2.5 h-2.5 rounded-full bg-[#5f6368] inline-block";
    if (systemStatusLabel) {
      systemStatusLabel.textContent = "IDLE";
      systemStatusLabel.className = "text-[#bdc1c6]";
    }
    if (systemStatusIndicator) systemStatusIndicator.className = "w-2.5 h-2.5 rounded-full bg-[#5f6368]";
    if (quotaTag) {
      quotaTag.textContent = "Quota Charged: NO";
      quotaTag.className = "px-2.5 py-1 rounded text-xs font-mono font-bold bg-[#121212] border border-[#3c4043] text-[#bdc1c6]";
    }
  }

  if (milestonesList) {
    milestonesList.innerHTML = '';
    const validCompleted = state.completedSteps.filter(s => s <= 5 && AUDIT_DATA.sections[s]);
    if (milestonesCount) milestonesCount.textContent = `${validCompleted.length}/5 Verified`;

    if (validCompleted.length === 0) {
      milestonesList.innerHTML = '<div class="text-xs text-[#bdc1c6] italic px-2 py-1">No verified milestones yet (--).</div>';
    } else {
      validCompleted.forEach(s => {
        const sData = AUDIT_DATA.sections[s];
        const chip = document.createElement('div');
        chip.className = "flex items-center justify-between p-2.5 rounded-2xl bg-[#121212] border border-[#3c4043] text-xs hover:border-[#b7410e]/60 transition cursor-pointer";
        chip.onclick = () => {
          navigateToStep(s);
          toggleSidebar(false);
        };
        const badgeClass = sData.status === 'PASS' ? 'text-[#10b981] bg-[#10b981]/20 border-[#10b981]/40' : 'text-[#f59e0b] bg-[#f59e0b]/20 border-[#f59e0b]/40';
        chip.innerHTML = `
          <div class="flex items-center space-x-2.5 truncate">
            <span class="w-5 h-5 rounded-full bg-[#1f1f1f] text-xs font-bold flex items-center justify-center text-[#e8eaed] flex-shrink-0">${s}</span>
            <span class="text-sm text-[#e8eaed] font-medium truncate">${sData.summaryText}</span>
          </div>
          <span class="text-xs font-mono font-bold px-2 py-0.5 rounded border ${badgeClass} flex-shrink-0">${sData.status}</span>
        `;
        milestonesList.appendChild(chip);
      });
    }
  }
}

export function buildTakeawayHeader(title, takeawayText, score, classification, status = 'PASS') {
  const isPass = status === 'PASS';
  return `
    <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 mb-6 shadow-xl relative overflow-hidden">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div class="space-y-2">
          <div class="flex items-center space-x-2.5">
            <span class="text-sm sm:text-base font-black text-[#d45d2a] uppercase tracking-wider font-headline flex items-center space-x-2">
              <span>🎯</span>
              <span>What AI Search Engines See &amp; Why It Matters</span>
            </span>
            <span class="text-[#5f6368]">•</span>
            <span class="text-xs font-mono px-2.5 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#e8eaed] font-bold uppercase">${classification}</span>
          </div>
          <p class="text-sm sm:text-base font-normal text-[#e8eaed] leading-relaxed max-w-3xl">${takeawayText}</p>
        </div>
        
        <div class="flex items-center space-x-4 self-start sm:self-center flex-shrink-0 px-5 py-3.5 rounded-2xl bg-[#121212] border-2 ${isPass ? 'border-[#10b981]/50 shadow-[0_0_25px_rgba(16,185,129,0.25)]' : 'border-[#f59e0b]/50 shadow-[0_0_25px_rgba(245,158,11,0.25)]'}">
          <div class="text-right">
            <span class="text-xs font-mono uppercase text-[#bdc1c6] block font-bold">Stage Result</span>
            <span class="text-3xl sm:text-4xl font-mono font-black ${isPass ? 'text-[#10b981]' : 'text-[#f59e0b]'}">${score}</span>
          </div>
          <span class="px-3 py-1 rounded-md text-xs font-mono font-black ${isPass ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40'}">
            ${status}
          </span>
        </div>
      </div>
    </div>
  `;
}

export function buildEvidenceAndActionDrawers(secData) {
  return `
    <div class="space-y-5 mt-6">
      <div class="bg-[#1f1f1f] border-2 border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-3.5">
        <div class="flex items-center space-x-2.5">
          <span class="text-base sm:text-lg">🛠️</span>
          <h4 class="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider font-headline">
            Action Plan: How to improve how AI can read your current pages better
          </h4>
        </div>
        <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-7">
          ${secData.actionPlan}
        </p>

        <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 ml-0 sm:ml-7 mt-2">
          <summary class="flex items-center justify-between text-xs sm:text-sm font-mono font-bold text-[#38bdf8] cursor-pointer hover:text-[#7dd3fc] transition">
            <span class="flex items-center space-x-2">
              <span>▾ View Detailed Step-by-Step Fix Instructions</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-[#38bdf8]/15 border border-[#38bdf8]/30">[${secData.actionSteps ? secData.actionSteps.length : 4} Action Steps]</span>
            </span>
            <span class="text-xs text-[#bdc1c6] font-normal hidden sm:inline">[Click to Expand]</span>
          </summary>
          <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-3">
            ${(secData.actionSteps || []).map((step, idx) => `
              <div class="flex items-start space-x-3 text-xs sm:text-sm text-[#e8eaed] leading-relaxed">
                <span class="w-5 h-5 rounded-full bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 mt-0.5">
                  ${idx + 1}
                </span>
                <div class="flex-1">
                  <strong class="text-white font-bold">${step.title}:</strong>
                  <span class="text-[#bdc1c6] ml-1">${step.detail}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </details>
      </div>

      <div class="shortcut-card bg-gradient-to-r from-[#1f1f1f] to-[#251b17] border-2 border-[#b7410e]/60 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        <div class="shortcut-card-body space-y-2.5">
          <div class="flex items-center space-x-2.5">
            <span class="text-base sm:text-lg text-[#d45d2a]">⚡</span>
            <h4 class="text-xs sm:text-sm font-mono font-black text-[#d45d2a] uppercase tracking-wider font-headline">
              Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files
            </h4>
          </div>
          <p class="text-sm sm:text-base text-[#e8eaed] font-medium leading-relaxed pl-0 sm:pl-7">
            ${secData.shortcutPlan}
          </p>
        </div>
        <div class="shortcut-card-btn-container">
          <a href="#" onclick="alert('Navigating to AIOptimize Pro Automated Manifest Deployment'); return false;" class="shortcut-card-btn px-6 py-3.5 rounded-xl bg-[#b7410e] hover:bg-[#d45d2a] text-white font-black text-xs sm:text-sm font-bold tracking-wide transition shadow-lg whitespace-nowrap flex items-center justify-center space-x-2 active:scale-95 flex-shrink-0">
            <span>⚡ Deploy AI-Ready files using AIOptimize Pro</span>
            <span>↗</span>
          </a>
        </div>
      </div>

      <details class="executive-drawer bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 shadow-lg open" open>
        <summary class="flex items-center justify-between text-sm sm:text-base font-bold text-white font-headline">
          <span class="flex items-center space-x-2.5">
            <svg class="w-5 h-5 text-[#38bdf8]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Verification Evidence (What We Found)</span>
          </span>
          <span class="text-[#bdc1c6] text-xs font-mono font-semibold">[Toggle Verification]</span>
        </summary>
        <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-4">
          <p class="text-sm sm:text-base leading-relaxed text-[#e8eaed] font-medium">${secData.evidencePlain}</p>
          <details class="executive-drawer bg-[#121212] border border-[#3c4043] rounded-2xl p-4 mt-3">
            <summary class="flex items-center justify-between text-xs font-mono font-bold text-[#bdc1c6]">
              <span>▾ View Technical Diagnostics &amp; Server Response Trace</span>
              <span class="text-[#38bdf8] text-xs font-mono">[Raw Headers Trace]</span>
            </summary>
            <div class="mt-3.5 pt-3.5 border-t border-[#3c4043]">
              <pre class="bg-[#181818] p-4 rounded-xl text-xs font-mono text-[#38bdf8] overflow-x-auto leading-relaxed border border-[#3c4043]">${secData.evidenceTrace}</pre>
            </div>
          </details>
        </div>
      </details>
    </div>
  `;
}

export function renderStage1Canvas(container) {
  const sec = AUDIT_DATA.sections[1];
  const providerBotGroups = [
    {
      provider: "OpenAI",
      icon: "🤖",
      badgeColor: "border-[#10b981]/40 bg-[#10b981]/10 text-[#10b981]",
      bots: [
        { name: "OAI-SearchBot", status: "ALLOWED", latency: "118ms" },
        { name: "GPTBot", status: "ALLOWED", latency: "124ms" },
        { name: "ChatGPT-User", status: "ALLOWED", latency: "105ms" }
      ]
    },
    {
      provider: "Anthropic",
      icon: "⚡",
      badgeColor: "border-[#d45d2a]/40 bg-[#d45d2a]/10 text-[#d45d2a]",
      bots: [
        { name: "Claude-SearchBot", status: "ALLOWED", latency: "132ms" },
        { name: "ClaudeBot", status: "ALLOWED", latency: "138ms" }
      ]
    },
    {
      provider: "Google & Microsoft",
      icon: "🔍",
      badgeColor: "border-[#38bdf8]/40 bg-[#38bdf8]/10 text-[#38bdf8]",
      bots: [
        { name: "Googlebot", status: "ALLOWED", latency: "92ms" },
        { name: "Bingbot", status: "ALLOWED", latency: "110ms" }
      ]
    },
    {
      provider: "Perplexity & Apple",
      icon: "🔮",
      badgeColor: "border-purple-400/40 bg-purple-950/20 text-purple-300",
      bots: [
        { name: "PerplexityBot", status: "ALLOWED", latency: "142ms" },
        { name: "Applebot-Extended", status: "ALLOWED", latency: "128ms" }
      ]
    },
    {
      provider: "Meta & Amazon",
      icon: "🌐",
      badgeColor: "border-blue-400/40 bg-blue-950/20 text-blue-300",
      bots: [
        { name: "Meta-WebIndexer", status: "ALLOWED", latency: "155ms" },
        { name: "Meta-ExternalAgent", status: "ALLOWED", latency: "148ms" },
        { name: "Amazonbot", status: "ALLOWED", latency: "162ms" }
      ]
    },
    {
      provider: "Asian AI Engines",
      icon: "🌏",
      badgeColor: "border-amber-400/40 bg-amber-950/20 text-amber-300",
      bots: [
        { name: "QwenBot", status: "ALLOWED", latency: "160ms" },
        { name: "Baidu-Ansur", status: "ALLOWED", latency: "175ms" },
        { name: "ERNIEBot", status: "ALLOWED", latency: "168ms" },
        { name: "Bytespider", status: "ALLOWED", latency: "150ms" },
        { name: "TencentBot", status: "ALLOWED", latency: "182ms" }
      ]
    },
    {
      provider: "European & Global Frontier",
      icon: "🇪🇺",
      badgeColor: "border-indigo-400/40 bg-indigo-950/20 text-indigo-300",
      bots: [
        { name: "MistralBot", status: "ALLOWED", latency: "145ms" },
        { name: "cohere-ai", status: "ALLOWED", latency: "135ms" },
        { name: "CCBot", status: "ALLOWED", latency: "190ms" }
      ]
    }
  ];

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 1", sec.takeaway, sec.score, "AI-Optimized", sec.status)}

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div class="lg:col-span-6 bg-[#1f1f1f] border-2 border-[#b7410e]/50 rounded-3xl p-6 sm:p-7 shadow-[0_0_25px_rgba(183,65,14,0.15)] flex flex-col justify-between space-y-5 relative overflow-hidden">
          <div class="space-y-4">
            <div class="flex items-center justify-between pb-4 border-b border-[#3c4043]">
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a] uppercase tracking-wider">PRIMARY RESULT</span>
                </div>
                <h3 class="text-lg sm:text-xl font-black text-white uppercase tracking-tight font-headline">Gateway &amp; WAF Security Markers</h3>
              </div>
              <span class="text-xs sm:text-sm font-mono font-black px-3.5 py-1.5 rounded-xl bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 shadow-sm">100% PASS</span>
            </div>

            <div class="space-y-3.5">
              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">robots.txt Directives</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">Canonical machine rules &amp; explicit bot allow headers verified.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">VALID</span>
              </div>

              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">Cloudflare Challenge Gate</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">Zero JavaScript challenge pages, CAPTCHAs, or rate drops.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">CLEAN</span>
              </div>

              <div class="p-5 rounded-2xl bg-[#121212] border border-[#3c4043] flex items-center justify-between shadow-inner">
                <div class="space-y-1">
                  <div class="text-base sm:text-lg font-black text-white font-headline">X-Robots-Tag Server Headers</div>
                  <div class="text-xs sm:text-sm text-[#bdc1c6]">HTTP server level "all, index, follow" response confirmed.</div>
                </div>
                <span class="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40">ENABLED</span>
              </div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-[#181818] border border-[#3c4043] flex items-center space-x-3 text-xs text-[#bdc1c6]">
            <span class="text-base">🛡️</span>
            <span>All 3 core perimeter checks verified. AI crawlers encounter zero firewall barriers on initial handshake.</span>
          </div>
        </div>

        <div class="lg:col-span-6 bg-[#1a1a1a] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col justify-between space-y-4">
          <div class="space-y-3.5">
            <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
              <div class="space-y-1">
                <div class="flex items-center space-x-2">
                  <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#121212] border border-[#3c4043] text-[#bdc1c6] uppercase tracking-wider">SUPPLEMENTARY BREAKDOWN</span>
                </div>
                <h4 class="text-sm sm:text-base font-bold text-white uppercase tracking-wider font-headline">AI Crawler Allowance Matrix (20 Engines)</h4>
                <p class="text-xs text-[#5f6368]">Grouped by AI engine provider with live response trace</p>
              </div>
              <span class="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-[#121212] border border-[#3c4043] text-[#38bdf8]">20/20 ALLOWED</span>
            </div>

            <div class="space-y-4 max-h-[390px] overflow-y-auto pr-1">
              ${providerBotGroups.map(group => `
                <div class="p-3.5 rounded-2xl bg-[#121212] border border-[#3c4043] space-y-2.5">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-2">
                      <span class="text-base">${group.icon}</span>
                      <span class="text-xs font-bold text-white font-headline">${group.provider}</span>
                    </div>
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${group.badgeColor}">${group.bots.length} BOTS</span>
                  </div>

                  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    ${group.bots.map(bot => `
                      <div class="p-2.5 rounded-xl bg-[#181818] border border-[#3c4043] flex items-center justify-between text-xs">
                        <div>
                          <span class="font-mono font-bold text-white text-xs block">${bot.name}</span>
                          <span class="text-[10px] font-mono text-[#5f6368]">${bot.latency}</span>
                        </div>
                        <span class="px-2 py-0.5 rounded text-[10px] font-mono font-black ${bot.status === 'ALLOWED' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">
                          ${bot.status}
                        </span>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="pt-2 text-[11px] font-mono text-[#5f6368] flex items-center justify-between border-t border-[#3c4043]/50">
            <span>Directives Status: <strong class="text-[#10b981]">HTTP 200 Trace Verified</strong></span>
            <span>20 Registered Engines</span>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(sec)}
    </div>
  `;
  container.innerHTML = html;
}

export function renderStage2Canvas(container) {
  const sec = AUDIT_DATA.sections[2];
  const anchors = [
    { path: "/about", title: "Company Identity & Mission", status: "FOUND", citationScore: "95%", desc: "Entity credentials and leadership team confirmed in DOM." },
    { path: "/contact", title: "Direct Contact Point", status: "FOUND", citationScore: "90%", desc: "Direct phone, email, registered business address verified." },
    { path: "/privacy-policy", title: "Data Protection & AI Scraping", status: "FOUND", citationScore: "88%", desc: "GDPR compliance, data retention, AI synthesis terms detected." },
    { path: "/terms-of-service", title: "Terms of Service & Licensing", status: "FOUND", citationScore: "85%", desc: "Standard licensing terms and dispute jurisdiction present." },
    { path: "/pricing", title: "Commercial Tiering & Pricing", status: "MISSING", citationScore: "0%", desc: "404 Not Found. AI engines cannot confirm commercial pricing tiers." }
  ];

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 2", sec.takeaway, sec.score, "AI-Optimized", sec.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5">
        <div class="flex items-center justify-between pb-4 border-b border-[#3c4043]">
          <div class="space-y-1">
            <div class="flex items-center space-x-2">
              <span class="text-[10px] font-mono font-black px-2.5 py-0.5 rounded bg-[#b7410e]/20 border border-[#b7410e]/40 text-[#d45d2a] uppercase tracking-wider">ESSENTIAL ANCHORS</span>
            </div>
            <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">5-Anchor Essential Kanban Matrix</h3>
            <p class="text-xs sm:text-sm text-[#bdc1c6]">Core credential anchors required by generative AI engines for corporate validation</p>
          </div>
          <span class="text-xs font-mono font-black px-3.5 py-1.5 rounded-xl bg-[#f59e0b]/20 border border-[#f59e0b]/40 text-[#f59e0b] shadow-sm">
            4 FOUND • 1 MISSING (/pricing)
          </span>
        </div>

        <div class="kanban-grid-container pt-1">
          ${anchors.map(a => `
            <div class="kanban-card bg-[#121212] border-2 ${a.status === 'FOUND' ? 'border-[#3c4043] hover:border-[#38bdf8]/60' : 'border-red-500/60 bg-red-950/20'} rounded-2xl p-4 sm:p-5 lg:p-6 shadow-lg transition transform hover:-translate-y-0.5">
              <div class="space-y-1.5 flex-1">
                <div class="flex items-center justify-between sm:justify-start sm:space-x-3">
                  <span class="text-base sm:text-lg font-mono font-black ${a.status === 'FOUND' ? 'text-[#38bdf8]' : 'text-red-400'}">${a.path}</span>
                  <span class="sm:hidden text-xs font-mono font-black px-2.5 py-0.5 rounded-md ${a.status === 'FOUND' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">${a.status}</span>
                </div>
                <h4 class="text-base sm:text-lg font-black text-white font-headline">${a.title}</h4>
                <p class="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed max-w-2xl">${a.desc}</p>
              </div>

              <div class="kanban-card-metrics flex-shrink-0">
                <span class="hidden sm:inline-block text-xs font-mono font-black px-3 py-1 rounded-md ${a.status === 'FOUND' ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' : 'bg-red-950 text-red-400 border border-red-500/40'}">${a.status}</span>
                <div class="flex items-center space-x-2 text-xs sm:text-sm font-mono">
                  <span class="text-[#bdc1c6] font-semibold">Citation Readiness:</span>
                  <strong class="${a.status === 'FOUND' ? 'text-[#10b981]' : 'text-red-400'} text-base font-black">${a.citationScore}</strong>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(sec)}
    </div>
  `;
  container.innerHTML = html;
}

export function renderStage3Canvas(container) {
  const sec = AUDIT_DATA.sections[3];
  const count = state.stage3VisibleCount || 5;
  const visiblePages = ALL_STAGE3_PAGES.slice(0, count);
  const totalPages = ALL_STAGE3_PAGES.length;

  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 3", sec.takeaway, sec.score, "AI-Optimized", sec.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2.5">
              <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-wider font-headline">Semantic Text Density Thermometers</h3>
              <span class="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-[#38bdf8]/20 text-[#38bdf8] border border-[#38bdf8]/40 whitespace-nowrap">
                ${totalPages} Total Pages Scanned
              </span>
            </div>
            <p class="text-xs text-[#bdc1c6] leading-relaxed">
              Target: ≥ 25% Text-to-HTML ratio for instant answer extraction (showing pages with lowest density / most extraction issues first)
            </p>
          </div>
          <span class="text-xs font-mono text-[#38bdf8] font-bold px-3 py-1 rounded-md bg-[#38bdf8]/10 border border-[#38bdf8]/30 w-fit self-start sm:self-center flex-shrink-0">
            Avg 28.4% Density
          </span>
        </div>

        <div class="space-y-4 pt-1">
          ${visiblePages.map((bar, idx) => `
            <div class="p-4 sm:p-5 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#38bdf8]/40 space-y-3 transition shadow-lg">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm">
                <div class="flex items-center space-x-2.5 truncate max-w-[55%] sm:max-w-[45%]">
                  <span class="font-mono font-black text-white truncate">${bar.url}</span>
                </div>
                
                <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-center flex-shrink-0">
                  <span class="font-mono font-black ${bar.ratio >= 25 ? 'text-[#10b981]' : bar.ratio >= 15 ? 'text-[#f59e0b]' : 'text-red-400'}">
                    ${bar.ratio}% Density (${bar.status})
                  </span>
                  
                  <button onclick="viewWhatAISees('${bar.url}', ${bar.ratio}, '${bar.status}', '${bar.gain}')" class="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#b7410e] border border-[#3c4043] hover:border-[#b7410e] text-[#e8eaed] hover:text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 active:scale-95" title="View stripped-down Markdown content as ingested by AI crawlers">
                    <span>📄 View What AI sees</span>
                    <span class="text-[10px]">↗</span>
                  </button>

                  <button onclick="document.getElementById('details-row-${idx}').toggleAttribute('open')" class="px-3 py-1.5 rounded-xl bg-[#1f1f1f] hover:bg-[#2a2a2a] border border-[#3c4043] text-[#38bdf8] hover:text-white text-xs font-bold transition shadow-sm flex items-center space-x-1.5 active:scale-95">
                    <span>🔍 Details</span>
                    <span class="text-[10px]">▾</span>
                  </button>
                </div>
              </div>
              
              <div class="w-full bg-[#1f1f1f] rounded-full h-3 overflow-hidden border border-[#3c4043]">
                <div class="${bar.color} h-3 rounded-full transition-all duration-1000" style="width: ${bar.ratio}%"></div>
              </div>
              
              <div class="flex items-center justify-between text-xs font-mono text-[#bdc1c6]">
                <span>Information Gain Score: <strong class="text-white font-bold">${bar.gain}</strong> • Words: <strong class="text-white font-bold">${bar.wordCount}</strong></span>
                <span>Target: ≥ 25% Text-to-HTML Ratio</span>
              </div>

              <details id="details-row-${idx}" class="executive-drawer bg-[#181818] border border-[#3c4043] rounded-2xl p-4 sm:p-5 mt-3 space-y-4">
                <summary class="flex items-center justify-between text-xs font-mono font-bold text-[#38bdf8] cursor-pointer hover:text-[#7dd3fc]">
                  <span class="flex items-center space-x-2">
                    <span>▾ Page Diagnostic Breakdown &amp; In-Page Fix Snippets</span>
                    <span class="text-[10px] px-2 py-0.5 rounded ${bar.ratio >= 25 ? 'bg-[#10b981]/20 text-[#10b981]' : 'bg-red-950 text-red-300'} border border-current">
                      ${bar.ratio >= 25 ? 'VERIFIED PASSED' : 'ACTION REQUIRED'}
                    </span>
                  </span>
                  <span class="text-xs text-[#bdc1c6] font-normal">[Toggle Details]</span>
                </summary>

                <div class="mt-4 pt-4 border-t border-[#3c4043] space-y-3.5">
                  ${buildLegacyMatchedPageFixPanels(bar, idx)}
                </div>
              </details>
            </div>
          `).join('')}
        </div>

        ${count < totalPages ? `
          <div class="pt-3 text-center border-t border-[#3c4043]/60">
            <button onclick="loadMoreStage3Pages()" class="px-5 py-2.5 rounded-xl bg-[#121212] hover:bg-[#1a1a1a] border-2 border-[#38bdf8]/50 hover:border-[#38bdf8] text-[#38bdf8] font-black text-xs sm:text-sm font-bold transition shadow-lg inline-flex items-center space-x-2 active:scale-95">
              <span>Load Next 5 Pages (${visiblePages.length} of ${totalPages} shown)</span>
              <span class="text-base">▾</span>
            </button>
          </div>
        ` : `
          <div class="pt-3 text-center border-t border-[#3c4043]/60">
            <span class="text-xs font-mono text-[#10b981] font-black px-4 py-2 rounded-xl bg-[#10b981]/15 border border-[#10b981]/40 inline-flex items-center space-x-2">
              <span>✓</span>
              <span>All ${totalPages} Scanned Pages Loaded</span>
            </span>
          </div>
        `}
      </div>

      ${buildEvidenceAndActionDrawers(sec)}
    </div>
  `;
  container.innerHTML = html;
}

export function renderStage4Canvas(container) {
  const sec = AUDIT_DATA.sections[4];
  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 4", sec.takeaway, sec.score, "AI-Optimized", sec.status)}

      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-xl space-y-5">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div>
            <h3 class="text-sm sm:text-base font-black text-white uppercase tracking-wider font-headline">Entity Authority &amp; E-E-A-T Relational Graph</h3>
            <p class="text-xs text-[#bdc1c6] mt-0.5">Brand identity grounded across Wikidata, LinkedIn, and official Organization schemas</p>
          </div>
          <span class="text-xs font-mono px-2.5 py-1 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30 font-bold">CONNECTED</span>
        </div>

        <div class="entity-grid-container pt-1">
          <div class="entity-card p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-[#38bdf8]/40 shadow-[0_0_15px_rgba(56,189,248,0.15)] transition transform hover:-translate-y-0.5">
            <div class="flex items-center space-x-3.5 sm:space-x-4">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1f1f1f] border border-[#38bdf8] flex items-center justify-center text-[#38bdf8] font-bold text-base flex-shrink-0">🏢</div>
              <div class="text-left">
                <div class="text-base sm:text-lg font-black text-white font-headline">Schema/Organization</div>
                <div class="text-xs text-[#bdc1c6] mt-0.5">Valid JSON-LD root entity graph detected in DOM</div>
              </div>
            </div>
            <span class="text-xs sm:text-sm text-[#10b981] font-mono font-black px-3 py-1 rounded-md bg-[#10b981]/20 border border-[#10b981]/40 whitespace-nowrap flex-shrink-0">
              100% VALID GRAPH
            </span>
          </div>

          <div class="entity-card p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-[#3c4043] transition transform hover:-translate-y-0.5">
            <div class="flex items-center space-x-3.5 sm:space-x-4">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1f1f1f] border border-[#3c4043] flex items-center justify-center text-white font-bold text-base flex-shrink-0">👤</div>
              <div class="text-left">
                <div class="text-base sm:text-lg font-black text-white font-headline">Author Person E-E-A-T</div>
                <div class="text-xs text-[#bdc1c6] mt-0.5">sameAs citations verified on 100% of research articles</div>
              </div>
            </div>
            <span class="text-xs sm:text-sm text-[#10b981] font-mono font-black px-3 py-1 rounded-md bg-[#10b981]/20 border border-[#10b981]/40 whitespace-nowrap flex-shrink-0">
              VERIFIED SAMEAS
            </span>
          </div>

          <div class="entity-card p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-[#f59e0b]/40 transition transform hover:-translate-y-0.5">
            <div class="flex items-center space-x-3.5 sm:space-x-4">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1f1f1f] border border-[#f59e0b] flex items-center justify-center text-[#f59e0b] font-bold text-base flex-shrink-0">🌐</div>
              <div class="text-left">
                <div class="text-base sm:text-lg font-black text-white font-headline">Wikidata Grounding</div>
                <div class="text-xs text-[#bdc1c6] mt-0.5">Corporate entity disambiguation node pending registration</div>
              </div>
            </div>
            <span class="text-xs sm:text-sm text-[#f59e0b] font-mono font-black px-3 py-1 rounded-md bg-[#f59e0b]/20 border border-[#f59e0b]/40 whitespace-nowrap flex-shrink-0">
              PARTIAL NODE (0.74)
            </span>
          </div>

          <div class="entity-card p-4 sm:p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-[#3c4043] transition transform hover:-translate-y-0.5">
            <div class="flex items-center space-x-3.5 sm:space-x-4">
              <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1f1f1f] border border-[#3c4043] flex items-center justify-center text-white font-bold text-base flex-shrink-0">⚖️</div>
              <div class="text-left">
                <div class="text-base sm:text-lg font-black text-white font-headline">Privacy &amp; Legal Anchors</div>
                <div class="text-xs text-[#bdc1c6] mt-0.5">Verified GDPR compliance, terms, and dispute jurisdiction</div>
              </div>
            </div>
            <span class="text-xs sm:text-sm text-[#10b981] font-mono font-black px-3 py-1 rounded-md bg-[#10b981]/20 border border-[#10b981]/40 whitespace-nowrap flex-shrink-0">
              CONFIRMED
            </span>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(sec)}
    </div>
  `;
  container.innerHTML = html;
}

export function renderStage5Canvas(container) {
  const sec = AUDIT_DATA.sections[5];
  const html = `
    <div class="space-y-6">
      ${buildTakeawayHeader("Stage 5", sec.takeaway, sec.score, "AI-Ready", sec.status)}

      <div class="bg-[#1f1f1f] border border-indigo-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 animate-indigo-glow">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#3c4043] gap-3">
          <div class="space-y-1.5">
            <div class="flex flex-col sm:flex-row sm:items-start sm:items-center gap-2">
              <span class="text-sm sm:text-base font-black text-indigo-400 uppercase tracking-wider font-headline">Machine Manifest Protocol Explorer</span>
              <span class="text-xs px-2.5 py-0.5 rounded bg-indigo-950 border border-indigo-500/50 text-indigo-300 font-mono font-bold w-fit">4-LEVEL HIERARCHY</span>
            </div>
            <p class="text-xs sm:text-sm text-[#bdc1c6] mt-0.5">Inspecting dedicated machine endpoints for direct LLM synthesis</p>
          </div>
          <span class="text-xs font-mono font-bold px-3 py-1.5 rounded-xl bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/30 w-fit self-start sm:self-center flex-shrink-0">
            WARNING: MISSING MANIFESTS
          </span>
        </div>

        <div class="manifest-grid-container pt-1">
          <div class="manifest-card p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-[#10b981]/40 shadow-[0_0_15px_rgba(16,185,129,0.12)] transition transform hover:-translate-y-0.5">
            <div class="flex items-center justify-between pb-3 border-b border-[#3c4043]">
              <span class="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider">LEVEL 1: PROTOCOL GATES (THE GATEKEEPERS)</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40 flex-shrink-0">AVAILABLE</span>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between">
                <span class="text-base sm:text-lg font-mono font-black text-white">/robots.txt</span>
                <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">200 OK • AVAILABLE</span>
              </div>
              <p class="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed">
                Explicit crawler permissions &amp; firewall rules. Authorizes global AI search engines (OpenAI, Anthropic, Google, Perplexity) to crawl your domain with zero barriers.
              </p>
            </div>
          </div>

          <div class="manifest-card p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-amber-500/40 bg-amber-950/10 transition transform hover:-translate-y-0.5 shadow-lg">
            <div class="flex items-center justify-between pb-3 border-b border-[#3c4043]">
              <span class="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider">LEVEL 2: THE WELCOME MAT (DIRECTORY INDEX)</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-amber-950/80 text-amber-300 border border-amber-500/40 flex-shrink-0">PARTIAL</span>
            </div>
            <div class="space-y-3.5 pt-1">
              <div class="space-y-1.5">
                <div class="flex items-center justify-between">
                  <span class="text-base font-mono font-black text-white">/sitemap.xml</span>
                  <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30">200 OK • AVAILABLE</span>
                </div>
                <p class="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed">
                  Canonical XML roadmap for global search crawlers &amp; AI engine URL discovery.
                </p>
              </div>
              <div class="space-y-1.5 pt-2.5 border-t border-[#3c4043]/60">
                <div class="flex items-center justify-between">
                  <span class="text-base font-mono font-black text-red-400">/llms.txt</span>
                  <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
                </div>
                <p class="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed">
                  Curated Markdown index. Acts as a clean welcome mat pointing AI engines directly to your high-value pages without scraping noise.
                </p>
              </div>
            </div>
          </div>

          <div class="manifest-card p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-red-500/40 bg-red-950/15 transition transform hover:-translate-y-0.5 shadow-lg">
            <div class="flex items-center justify-between pb-3 border-b border-[#3c4043]">
              <span class="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider">LEVEL 3: CONTEXT MAPS &amp; BLUEPRINT</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-red-950 text-red-400 border border-red-500/40 flex-shrink-0">MISSING</span>
            </div>
            <div class="space-y-1.5 pt-1">
              <div class="flex items-center justify-between">
                <span class="text-base sm:text-lg font-mono font-black text-red-400">/ai-context.md</span>
                <span class="text-xs font-mono font-black px-2.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
              </div>
              <p class="text-xs sm:text-sm text-[#bdc1c6] leading-relaxed">
                Master brand blueprint containing company mission, core services, pricing rules, and authority signals for deep LLM reasoning loops.
              </p>
            </div>
          </div>

          <div class="manifest-card p-5 lg:p-6 rounded-2xl bg-[#121212] border-2 border-red-500/40 bg-red-950/15 transition transform hover:-translate-y-0.5 shadow-lg">
            <div class="flex items-center justify-between pb-3 border-b border-[#3c4043]">
              <span class="text-xs font-mono font-black text-indigo-300 uppercase tracking-wider">LEVEL 4: WORKSPACES &amp; DOCUMENTATION</span>
              <span class="px-2.5 py-1 rounded-md text-xs font-mono font-black bg-red-950 text-red-400 border border-red-500/40 flex-shrink-0">MISSING</span>
            </div>
            <div class="space-y-3 pt-1">
              <div class="space-y-1">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-red-400">/README.md</span>
                  <span class="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
                </div>
                <p class="text-xs text-[#bdc1c6] leading-relaxed">
                  Project overview, repository architecture, and high-level developer introduction for AI agents.
                </p>
              </div>
              <div class="space-y-1 pt-2 border-t border-[#3c4043]/50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-red-400">/about.md</span>
                  <span class="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
                </div>
                <p class="text-xs text-[#bdc1c6] leading-relaxed">
                  Corporate identity, leadership team, brand history, and verified executive credentials.
                </p>
              </div>
              <div class="space-y-1 pt-2 border-t border-[#3c4043]/50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-red-400">/docs.md</span>
                  <span class="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
                </div>
                <p class="text-xs text-[#bdc1c6] leading-relaxed">
                  Technical API documentation, integration guides, and system capabilities.
                </p>
              </div>
              <div class="space-y-1 pt-2 border-t border-[#3c4043]/50">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-mono font-bold text-red-400">/content.md</span>
                  <span class="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/30">404 • MISSING</span>
                </div>
                <p class="text-xs text-[#bdc1c6] leading-relaxed">
                  Core content corpus, published research, and topical authority articles for LLM grounding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      ${buildEvidenceAndActionDrawers(sec)}
    </div>
  `;
  container.innerHTML = html;
}

export function renderStage6Canvas(container) {
  const circumference = 301.59;
  const strokeOffset = (circumference * (1 - AUDIT_DATA.healthIndex / 100)).toFixed(2);

  const html = `
    <div class="space-y-6 flex-1 flex flex-col">
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        <!-- AEO HEALTH INDEX DIAL SCORECARD -->
        <div class="lg:col-span-4 bg-[#1f1f1f] border-2 border-[#3c4043] hover:border-[#b7410e]/50 transition rounded-3xl p-6 sm:p-7 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
          <div class="absolute -top-20 -left-20 w-52 h-52 bg-[#b7410e]/20 rounded-full blur-3xl pointer-events-none"></div>
          
          <div class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#bdc1c6] font-headline mb-3">
            AEO Health Index Dial
          </div>
          
          <div class="relative w-44 h-44 sm:w-48 sm:h-48 flex items-center justify-center my-2">
            <svg class="w-full h-full -rotate-90 transform overflow-visible" viewBox="0 0 120 120">
              <defs>
                <linearGradient id="health-dial-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#b7410e" />
                  <stop offset="60%" stop-color="#ea580c" />
                  <stop offset="100%" stop-color="#38bdf8" />
                </linearGradient>
                <filter id="dial-neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="3.5" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <circle cx="60" cy="60" r="48" stroke="#121212" stroke-width="10" fill="none" />
              <circle cx="60" cy="60" r="48" 
                stroke="url(#health-dial-gradient)" 
                stroke-width="10" 
                stroke-linecap="round" 
                fill="none" 
                filter="url(#dial-neon-glow)"
                stroke-dasharray="${circumference}" 
                stroke-dashoffset="${strokeOffset}" 
                class="transition-all duration-1000 ease-out" 
                style="filter: drop-shadow(0 0 10px rgba(234, 88, 12, 0.65));" />
            </svg>
            <div class="absolute flex flex-col items-center justify-center">
              <span class="text-5xl sm:text-6xl font-black text-white tracking-tight font-headline drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">${AUDIT_DATA.healthIndex}</span>
              <span class="text-xs sm:text-sm font-mono text-[#bdc1c6] font-bold">/ 100</span>
            </div>
          </div>

          <div class="mt-3 inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#b7410e]/20 border border-[#b7410e]/50 text-[#d45d2a] text-xs sm:text-sm font-black shadow-[0_0_15px_rgba(183,65,14,0.3)]">
            <span class="w-2.5 h-2.5 rounded-full bg-[#d45d2a] animate-pulse"></span>
            <span>Status: ${AUDIT_DATA.statusLabel}</span>
          </div>

          <div class="mt-6 pt-5 border-t border-[#3c4043] w-full space-y-3.5 text-left">
            <div class="text-xs sm:text-sm font-mono font-black text-white uppercase tracking-wider">
              Dual-Pillar Readiness Breakdown
            </div>
            
            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs sm:text-sm font-mono">
                <span class="text-[#e8eaed] font-bold">Human Web Readiness</span>
                <strong class="text-[#10b981] text-sm sm:text-base font-black">${AUDIT_DATA.humanWebReadiness}%</strong>
              </div>
              <div class="w-full bg-[#121212] rounded-full h-2.5 overflow-hidden border border-[#3c4043]">
                <div class="bg-[#10b981] h-2.5 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style="width: ${AUDIT_DATA.humanWebReadiness}%"></div>
              </div>
            </div>

            <div class="space-y-1.5">
              <div class="flex justify-between items-center text-xs sm:text-sm font-mono">
                <span class="text-[#e8eaed] font-bold">Machine Web Readiness</span>
                <strong class="text-indigo-400 text-sm sm:text-base font-black">${AUDIT_DATA.machineWebReadiness}%</strong>
              </div>
              <div class="w-full bg-[#121212] rounded-full h-2.5 overflow-hidden border border-[#3c4043]">
                <div class="bg-indigo-400 h-2.5 rounded-full shadow-[0_0_10px_rgba(129,140,248,0.5)]" style="width: ${AUDIT_DATA.machineWebReadiness}%"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- TOP 5 URGENT ACTION ITEMS CARD -->
        <div class="lg:col-span-8 bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 shadow-2xl flex flex-col">
          <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043] mb-4">
            <div>
              <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">Top 5 Urgent Action Items</h3>
              <p class="text-xs sm:text-sm text-[#bdc1c6] mt-0.5">Ranked by AI engine visibility impact hierarchy</p>
            </div>
            <span class="text-xs font-mono px-3 py-1 rounded-md bg-red-950/70 border border-red-500/40 text-red-300 font-black">
              Triage Matrix
            </span>
          </div>

          <div class="space-y-3 flex-1">
            ${AUDIT_DATA.top5Actions.map(action => `
              <div class="p-4 rounded-2xl bg-[#121212] border border-[#3c4043] hover:border-[#b7410e]/60 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="flex items-start space-x-3.5">
                  <span class="w-7 h-7 rounded-xl text-xs font-black font-mono flex items-center justify-center flex-shrink-0 mt-0.5 ${action.severity === 'CRITICAL' ? 'bg-red-950 text-red-400 border border-red-500/40' : action.severity === 'HIGH' ? 'bg-[#f59e0b]/20 text-[#f59e0b] border border-[#f59e0b]/40' : 'bg-[#b7410e]/20 text-[#d45d2a] border border-[#b7410e]/40'}">
                    ${action.id}
                  </span>
                  <div>
                    <div class="text-sm sm:text-base font-bold text-white font-headline">${action.title}</div>
                    <div class="text-xs sm:text-sm text-[#bdc1c6] mt-1">${action.impact}</div>
                  </div>
                </div>
                <button onclick="navigateToStep(${action.stepJump})" class="self-end sm:self-center px-4 py-2 rounded-xl bg-[#1f1f1f] border border-[#3c4043] hover:border-[#b7410e] text-[#d45d2a] hover:text-white text-xs font-bold transition flex-shrink-0 shadow-sm active:scale-95">
                  Fix in Stage ${action.stepJump} →
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

      <!-- 5-SECTION SCORECARD MATRIX -->
      <div class="bg-[#1f1f1f] border border-[#3c4043] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3.5 border-b border-[#3c4043]">
          <div>
            <h3 class="text-base sm:text-lg font-black text-white uppercase tracking-wider font-headline">5-Section Scorecard Matrix (Outcome-First Jump Links)</h3>
            <p class="text-xs sm:text-sm text-[#bdc1c6] mt-0.5">Stage-by-stage diagnostic performance scorecards with direct deep-dive access</p>
          </div>
          <span class="text-xs font-mono px-3 py-1 rounded-md bg-[#121212] border border-[#3c4043] text-[#38bdf8] font-black hidden sm:inline-block">
            5 STAGES VERIFIED
          </span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-1">
          ${[1, 2, 3, 4, 5].map(stepId => {
            const sec = AUDIT_DATA.sections[stepId];
            const meta = STAGE_MATRIX.find(s => s.step === stepId);
            return `
              <div onclick="navigateToStep(${stepId})" class="bg-[#121212] border border-[#3c4043] hover:border-[#b7410e] rounded-2xl p-4 sm:p-5 cursor-pointer transition transform hover:-translate-y-1 group shadow-lg flex flex-col justify-between">
                <div>
                  <div class="flex items-center justify-between mb-3">
                    <span class="text-xs font-mono px-2 py-0.5 rounded bg-[#1f1f1f] text-[#bdc1c6] font-bold">STAGE ${stepId}</span>
                    <span class="text-base font-mono font-black ${sec.status === 'PASS' ? 'text-[#10b981]' : 'text-[#f59e0b]'}">${sec.score}</span>
                  </div>
                  <h4 class="text-base sm:text-lg font-black text-white group-hover:text-[#d45d2a] transition line-clamp-1 font-headline">${meta.shortTitle}</h4>
                  <p class="text-xs text-[#bdc1c6] mt-2 line-clamp-2 leading-relaxed">${sec.summaryText}</p>
                </div>
                <div class="mt-4 pt-3.5 border-t border-[#3c4043] flex items-center justify-between text-xs text-[#d45d2a] font-bold">
                  <span>Inspect Deep-Dive</span>
                  <span class="group-hover:translate-x-1.5 transition">→</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

export function renderWorkspace() {
  const stageMeta = STAGE_MATRIX.find(s => s.step === state.currentStep);
  if (!stageMeta) return;

  const stageBadge = document.getElementById('canvas-stage-badge');
  const governanceBadge = document.getElementById('canvas-governance-badge');
  const stageTitle = document.getElementById('canvas-stage-title');
  const stageDesc = document.getElementById('canvas-stage-desc');
  const scorePill = document.getElementById('canvas-score-pill');
  const scoreVal = document.getElementById('canvas-score-value');
  const scoreStatus = document.getElementById('canvas-score-status');
  const returnAnchor = document.getElementById('canvas-return-anchor');
  const canvasBody = document.getElementById('canvas-body');

  if (stageBadge) stageBadge.textContent = `STAGE ${state.currentStep} OF 6`;
  if (governanceBadge) governanceBadge.textContent = stageMeta.classification;
  if (stageTitle) stageTitle.textContent = stageMeta.fullTitle;
  if (stageDesc) stageDesc.textContent = stageMeta.desc;

  if (scorePill) {
    if (state.currentStep === 6) {
      scorePill.classList.remove('hidden');
      if (scoreVal) scoreVal.textContent = `${AUDIT_DATA.healthIndex}/100`;
      if (scoreStatus) scoreStatus.textContent = "OPTIMIZED";
    } else {
      scorePill.classList.add('hidden');
    }
  }

  if (returnAnchor) {
    if (state.currentStep < 6 && state.completedSteps.includes(6)) {
      returnAnchor.classList.remove('hidden');
    } else {
      returnAnchor.classList.add('hidden');
    }
  }

  if (!canvasBody) return;
  canvasBody.innerHTML = '';

  switch (state.currentStep) {
    case 1:
      renderStage1Canvas(canvasBody);
      break;
    case 2:
      renderStage2Canvas(canvasBody);
      break;
    case 3:
      renderStage3Canvas(canvasBody);
      break;
    case 4:
      renderStage4Canvas(canvasBody);
      break;
    case 5:
      renderStage5Canvas(canvasBody);
      break;
    case 6:
      renderStage6Canvas(canvasBody);
      break;
    default:
      canvasBody.innerHTML = `
        <div class="p-8 text-center text-[#bdc1c6] font-mono">
          Stage ${state.currentStep} Workbench View Initialized.
        </div>
      `;
      break;
  }
}

export function navigateToStep(stepNum) {
  state.currentStep = stepNum;
  renderStepper();
  renderSidebar();
  renderWorkspace();
  const canvas = document.getElementById('main-workspace-canvas');
  if (canvas && canvas.scrollTo) {
    canvas.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export function appendLog(msg, type = 'info') {
  const stream = document.getElementById('sidebar-telemetry-stream');
  if (!stream) return;
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let color = 'text-[#bdc1c6]';
  if (type === 'pass') color = 'text-[#10b981]';
  if (type === 'warn') color = 'text-[#f59e0b]';
  if (type === 'scan') color = 'text-[#d45d2a]';
  if (type === 'error') color = 'text-red-400';

  const entry = document.createElement('div');
  entry.className = `${color} leading-relaxed text-xs`;
  entry.innerHTML = `<span class="text-[#5f6368]">[${now}]</span> ${msg}`;
  stream.appendChild(entry);
  stream.scrollTop = stream.scrollHeight;
}

export function handleExport(format) {
  appendLog(`Export generated: AIVisualize Executive Audit Report [${format}]`, "scan");
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(`AIVisualize Executive Audit Report exported as ${format}`);
  }
}

export function resetToUnauditedState() {
  if (state.simTimer) clearInterval(state.simTimer);
  state.isSimulating = false;
  state.isAudited = false;
  state.isSystemError = false;
  state.userNavigatedEarly = false;
  state.completedSteps = [];
  state.scanningStep = null;
  state.currentStep = 1;
  const simLabel = document.getElementById('sim-progress-label');
  if (simLabel) simLabel.textContent = "Simulate Scan Progress";
  const durLabel = document.getElementById('scan-duration-label');
  if (durLabel) durLabel.textContent = "--";
  const pagesLabel = document.getElementById('total-pages-label');
  if (pagesLabel) pagesLabel.textContent = "--";
  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.add('hidden');
  hideAntiHijackToast();

  renderStepper();
  renderSidebar();
  renderWorkspace();
  appendLog("Workbench reset to unaudited empty state (-- / UNAUDITED). Ready for new scan.", "info");
}

export function toggleScanSimulation() {
  state.isSimulating = true;
  state.isAudited = true;
  state.completedSteps = [1, 2, 3, 4, 5, 6];
  state.currentStep = 6;
  const durLabel = document.getElementById('scan-duration-label');
  if (durLabel) durLabel.textContent = AUDIT_DATA.scanDuration;
  const pagesLabel = document.getElementById('total-pages-label');
  if (pagesLabel) pagesLabel.textContent = AUDIT_DATA.totalPages;
  renderStepper();
  renderSidebar();
  renderWorkspace();
  appendLog("Full AEO diagnostic pipeline completed in 3.8s. Quota charged.", "pass");
}

export function triggerSystemFailureScenario() {
  if (state.simTimer) clearInterval(state.simTimer);
  state.isSimulating = false;
  state.isSystemError = true;
  state.scanningStep = null;
  const simLabel = document.getElementById('sim-progress-label');
  if (simLabel) simLabel.textContent = "Simulate Scan Progress";
  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.remove('hidden');

  appendLog("[SYSTEM ERROR 504] Crawler network socket dropped. Audit aborted with zero quota charge.", "error");
  renderStepper();
  renderSidebar();
  renderWorkspace();
}

export function retryEntireAudit() {
  state.isSystemError = false;
  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.add('hidden');
  appendLog("Retrying entire 6-stage audit from clean state...", "scan");
  toggleScanSimulation();
}

export function toggleResponsiveSimulation() {
  const wrapper = document.getElementById('app-viewport-wrapper');
  const btn = document.getElementById('btn-toggle-responsive');

  state.isResponsivePreview = !state.isResponsivePreview;

  if (state.isResponsivePreview) {
    document.body.classList.add('simulate-tablet');
    if (wrapper) wrapper.classList.add('max-w-[768px]', 'mx-auto', 'border-x', 'border-[#b7410e]/40', 'shadow-[0_0_50px_rgba(183,65,14,0.2)]');
    if (btn) {
      btn.classList.add('bg-[#b7410e]', 'text-white');
      btn.classList.remove('bg-[#121212]', 'text-[#bdc1c6]');
    }
    toggleSidebar(false);
    appendLog("Responsive Tablet/Mobile layout preview toggled ON (≤1024px mode).", "info");
  } else {
    document.body.classList.remove('simulate-tablet');
    if (wrapper) wrapper.classList.remove('max-w-[768px]', 'mx-auto', 'border-x', 'border-[#b7410e]/40', 'shadow-[0_0_50px_rgba(183,65,14,0.2)]');
    if (btn) {
      btn.classList.remove('bg-[#b7410e]', 'text-white');
      btn.classList.add('bg-[#121212]', 'text-[#bdc1c6]');
    }
    toggleSidebar(false);
    appendLog("Responsive layout preview returned to Desktop mode (max-w-[1200px]).", "info");
  }
  renderWorkspace();
}

export function triggerEarlyInspectionScenario() {
  if (state.simTimer) clearInterval(state.simTimer);
  state.isSimulating = true;
  state.isAudited = true;
  state.isSystemError = false;
  state.userNavigatedEarly = true;
  const banner = document.getElementById('system-failure-banner');
  if (banner) banner.classList.add('hidden');

  state.completedSteps = [1, 2, 3];
  state.scanningStep = 4;
  state.currentStep = 2;

  renderStepper();
  renderSidebar();
  renderWorkspace();
  appendLog("Early Inspection Activated: User inspecting Stage 2 while Stage 4 executes in background.", "warn");

  setTimeout(() => {
    state.completedSteps = [1, 2, 3, 4, 5, 6];
    state.scanningStep = null;
    state.isSimulating = false;
    const simLabel = document.getElementById('sim-progress-label');
    if (simLabel) simLabel.textContent = "Re-run Scan";
    const durLabel = document.getElementById('scan-duration-label');
    if (durLabel) durLabel.textContent = AUDIT_DATA.scanDuration;
    const pagesLabel = document.getElementById('total-pages-label');
    if (pagesLabel) pagesLabel.textContent = AUDIT_DATA.totalPages;
    appendLog("Background scan completed while user is on Stage 2. Anti-hijack guard active.", "pass");
    
    showAntiHijackToast();
    renderStepper();
    renderSidebar();
    renderWorkspace();
  }, 2500);
}

export function showAntiHijackToast() {
  const toast = document.getElementById('toast-anti-hijack');
  if (toast) toast.classList.remove('translate-y-28', 'opacity-0', 'pointer-events-none');
}

export function hideAntiHijackToast() {
  const toast = document.getElementById('toast-anti-hijack');
  if (toast) toast.classList.add('translate-y-28', 'opacity-0', 'pointer-events-none');
}

if (typeof window !== 'undefined') {
  window.toggleSidebar = toggleSidebar;
  window.navigateToStep = navigateToStep;
  window.handleExport = handleExport;
  window.resetToUnauditedState = resetToUnauditedState;
  window.toggleScanSimulation = toggleScanSimulation;
  window.copyTextSnippet = copyTextSnippet;
  window.viewWhatAISees = viewWhatAISees;
  window.loadMoreStage3Pages = loadMoreStage3Pages;
  window.triggerSystemFailureScenario = triggerSystemFailureScenario;
  window.retryEntireAudit = retryEntireAudit;
  window.toggleResponsiveSimulation = toggleResponsiveSimulation;
  window.triggerEarlyInspectionScenario = triggerEarlyInspectionScenario;
  window.showAntiHijackToast = showAntiHijackToast;
  window.hideAntiHijackToast = hideAntiHijackToast;

  window.addEventListener('DOMContentLoaded', () => {
    renderStepper();
    renderSidebar();
    renderWorkspace();
    appendLog("AIVisualize Diagnostic Cockpit V4 initialized.", "info");
  });
}
