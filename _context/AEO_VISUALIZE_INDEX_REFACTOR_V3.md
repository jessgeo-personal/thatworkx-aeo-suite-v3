# AEO Suite V3: Master UX & Architecture Specification

## 1. Executive Vision & Core Objectives
Deliver a boardroom-grade, high-converting intelligence platform for C-suite executives (CEOs, CMOs, CTOs) and non-technical business founders. The platform bridges human-facing web clarity with machine-readable discovery across generative search engines (ChatGPT Search, Perplexity, Claude, Gemini).

---

## 2. Strict Governance & Terminology Gates
1. **Terminology Rules:**
   - **"AI-Optimized"**: Strictly reserved for human-facing web presence audits, content readability, and crawlability (Sections 1, 2, and 3).
   - **"AI-Ready"**: Strictly reserved for machine-readable manifests, protocol files, and endpoints (`/robots.txt`, `/llms.txt`, `/ai-context.md`, schemas) (Section 4).
   - **0% Banned Terms**: ABSOLUTE ZERO occurrences of the legacy phrase `"AI-first"` across all copy, DOM elements, schemas, and documentation.
2. **Boardroom Copy Replacements:**
   - Replace *"public content"* with **"brand's public message and web presence"**.
   - Replace *"crawler clearance"* with **"Permissions & Access Restrictions"**.
   - Replace *"Edge Access / WAF Gates"* with **"Website Security & Gateway Settings"**.
   - Replace *"CMS"* with **"Website Editor / Platform"**.
   - Replace *"DOM-to-Text Ratio / Code Drag"* with **"Content Readability & Noise Balance"**.
   - Replace *"Module 4"* with **"Per-webpage AI Citation Audit"**.
3. **Data Integrity & Frictionless State:**
   - Pre-scan idle states must render clean placeholders (`"--"`, `"UNAUDITED"`, neutral dials) with zero fake dummy numbers.
   - Core diagnostics remain in-page without full-screen modal takeovers.

---

## 3. Visual & Aesthetic Design Standards

### 3D Tactile Glass & Metallic Telemetry Badges (`frontend/index.css`)
- **Obsidian Canvas Base**: `#020617` / `#08090C` with 1px slate borders (`rgba(255, 255, 255, 0.08)`).
- **🟢 PASS / CLEAR (Verified)**:
  - Gradient: `linear-gradient(180deg, #064e3b 0%, #022c22 100%)`
  - Border: `1px solid #10b981` (Glow: `0 0 12px rgba(16, 185, 129, 0.25)`)
  - Text: `#ffffff` bold with Emerald indicator dot.
- **🟡 DRAG / ACTION REQUIRED (Warning)**:
  - Gradient: `linear-gradient(180deg, #78350f 0%, #451a03 100%)`
  - Border: `1px solid #f59e0b` (Glow: `0 0 12px rgba(245, 158, 11, 0.25)`)
  - Text: `#ffffff` bold with Amber indicator dot.
- **🔴 BLOCKED / GATE FAILURE (Critical Finding)**:
  - Gradient: `linear-gradient(180deg, #881337 0%, #4c0519 100%)`
  - Border: `1px solid #f43f5e` (Glow: `0 0 14px rgba(244, 63, 94, 0.35)`)
  - Text: `#ffffff` bold with Ruby pulsing indicator dot.

### Typography Rules
- **Headers & Executive Summaries**: `Plus Jakarta Sans`, 700/800 Weight, `#ffffff`.
- **Metrics, HTTP Codes & File Paths**: `JetBrains Mono`, 500/700 Weight.
- **Subcopy & Secondary Explanations**: `Plus Jakarta Sans`, 400 Weight, `#94a3b8`.

---

## 4. `frontend/visualize.html` Dashboard Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ [Top Scroll Progress Bar (1px Gradient Rail)]                                          │
│ [Top Toolbar] Target: domain.com │ Score: 78/100 │ Last Scanned: Live │ [PDF] [JSON]   │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ EXECUTIVE SPOTLIGHT HERO & MACRO BENTO                                                │
│ • Health Index Dial (0–100 Pts): Composite probability of LLM citation & discoverability│
│ • 2x2 Pillar Summary Cards:                                                             │
│   - Card 1: AI Search Permissions & Gateway Access (25 pts)                             │
│   - Card 2: Content Readability & Citation Readiness (25 pts)                           │
│   - Card 3: Brand Authority & Entity Consensus (25 pts)                                 │
│   - Card 4: Dedicated Machine Manifests (25 pts)                                        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ SECTION 1: AI SEARCH PERMISSIONS & GATEWAY ACCESS (Score: X/25)                       │
│ • Edge WAF Interception: HTTP 403/429 flags "Automated Bot Traffic Rejected" alert.     │
│ • Expandable Technical Drawer (`<details class="executive-drawer">`)                    │
│ • Remediation Link: [ ⚡ Deploy Cloudflare Edge Bypass in AIOptimize → ]                │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ SECTION 2: CONTENT READABILITY & CITATION READINESS (Score: X/25)                     │
│ • 🛠️ Tier 1 (Free In-Page Action): Copy-pasteable GenAI Optimization Prompt for         │
│   ChatGPT/Gemini + 3-step Website Editor Guide (H2 Questions + 40-word answers).        │
│ • ⚡ Tier 2 (Automation Bridge): [ Synthesize /ai-context.md in AIOptimize → ]          │
│ • Full-Width Table: "Per-webpage AI Citation Audit" (#sec2-module-4-container).         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ SECTION 3: BRAND AUTHORITY & ENTITY CONSENSUS (Score: X/25)                           │
│ • Verified Contact, HTTPS Security, Organization Schema, sameAs Knowledge Graph.        │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ SECTION 4: THE DUAL-INTERFACE ARCHITECTURAL BLUEPRINT (Score: X/25)                   │
│ • Interactive Side-by-Side:                                                             │
│   - Left: Human-Facing Web Presence (AI-Optimized) [ ➕ Trust / ➖ Code Drag ]         │
│   - Right: Machine Intelligence Interface (AI-Ready) [ ➕ 50ms Ingestion / ➖ No UI ]  │
│ • Execution Comparison: Manual Page Prompting (2–4 hrs) vs AIOptimize 1-Click Manifests │
│ • 4-Tier Tree: /robots.txt ➔ /llms.txt ➔ /ai-context.md ➔ Workspace .md files.         │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ SECTION 5: HIGH-URGENCY REMEDIATION ACTION BANNER (#aioptimize-action-banner)         │
│ • Bridge trigger to AIOptimize with moving border button.                               │
│ ✦ FIXED LATERAL WAYFINDER DOCK (#floating-glass-dock) (Desktop Right / Mobile Top)      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

```

## 5. frontend/index.html Landing Portal Architecture

┌─────────────────────────────────────────────────────────────────────────────────────────┐
│ ✦ 1. SPOTLIGHT HERO VIEWPORT                                                            │
│   • Eyebrow: [ ✦ THE AEO & GEO INFRASTRUCTURE PLATFORM ]                                │
│   • Headline: "Simplify the way AI understands your Brand."                             │
│   • Subhead: "Streamline your web presence for AI search engines and synthesize         │
│     dedicated machine-readable manifests."                                              │
│   • Single-Input Search Bar: [ Enter domain URL... ] ➔ [ Run Free AEO Diagnostic Scan ] │
│   • Instant Demo Chips: [ shopify.com ↗ ] [ stripe.com ↗ ] [ airbnb.com ↗ ]             │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ 2. 20-BOT AI CRAWLER GATE RADAR (Preserved Single-View Matrix)                        │
│   • 3-Tab Filter: [ All 20 Bots ] [ 🌐 Search Engines (8) ]                             │
│                   [ 🧠 Foundation Models (6) ] [ 🕷️ Commercial Scrapers (6) ]           │
│   • High-density status grid with individual bot verification pills.                    │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ 3. THE 3-PILLAR PRODUCT BENTO                                                         │
│   • Card 1: AIVisualize — "AI Visibility & Crawlability Diagnostic Suite"               │
│   • Card 2: AIOptimize — "Machine Manifest Synthesizer & Edge Engine"                   │
│   • Card 3: AISocialize — "Brand Authority & Trust Graph"                               │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ 4. DUAL-INTERFACE ARCHITECTURE BLUEPRINT & 4-TIER PIPELINE                            │
│   • Interactive Layer 1–4 Code Drawer sandbox + Human vs Machine Interface comparison.  │
├─────────────────────────────────────────────────────────────────────────────────────────┤
│ ✦ 5. DEFINITIVE 4-CATEGORY FAQ HUB & CONVERSION DECK                                    │
│   • 4 Filter Tabs: [ All ] [ 🌐 General AEO ] [ 🔍 AIVisualize ]                        │
│                    [ ⚙️ AIOptimize ] [ 📊 AISocialize ]                                 │
│   • Pre-rendered static HTML with Schema.org FAQPage JSON-LD markup.                    │
│   • Action Deck & 5-Column Footer with Discord, LinkedIn, and Documentation links.      │
└─────────────────────────────────────────────────────────────────────────────────────────┘

