# Phase 2 Specification: Boardroom-Grade `index.html` Redesign

## 1. Executive Summary & Objective
Transform `frontend/index.html` into a high-converting, authoritative portal for C-suite executives (CEOs, CMOs, CTOs) and non-technical founders. The homepage establishes immediate technical credibility, educates users on the shift from traditional SEO to Generative Engine Optimization (GEO/AEO), demonstrates the 3-pillar product ecosystem (AIVisualize, AIOptimize, AISocialize), and enables instant 1-click domain scanning without modal friction.

---

## 2. Aceternity Component Reference Matrix

| Feature / UI Area | Target Aceternity Component | Reference URL | Implementation Directives |
| :--- | :--- | :--- | :--- |
| **Hero Lighting & Atmosphere** | `Spotlight` | [Aceternity Spotlight](https://ui.aceternity.com/components/spotlight) | Ambient directional conic lighting casting over the value prop and 3-tool console card. |
| **3-Pillar & Capabilities Grid** | `Bento Grid` | [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid) | Asymmetrical cards highlighting AIVisualize, AIOptimize, and AISocialize with distinct accent glows. |
| **20-Bot AI Crawler Radar** | `Card Spotlight` | [Aceternity Card Spotlight](https://ui.aceternity.com/components/card-spotlight) | High-density status cards tracking cursor position with subtle 1px border highlights. |
| **Primary Conversion CTA** | `Moving Border` | [Aceternity Moving Border](https://ui.aceternity.com/components/moving-border) | High-contrast animated border gradient on `#onboarding-submit-btn`. |
| **Obsidian Card Masking** | `Grid & Dot Backgrounds` | [Aceternity Grid Backgrounds](https://ui.aceternity.com/components/grid-and-dot-backgrounds) | Lightweight CSS radial gradient masks over deep obsidian backgrounds (`#08090C`, `#020617`). |

---

## 3. Strict Governance & Terminology Gates
1. **Terminology Gate:**
   - Use **"AI-Optimized"** strictly for human-centric web audits and crawlability checks.
   - Use **"AI-Ready"** strictly for machine-readable manifests and protocol endpoints (`/robots.txt`, `/llms.txt`, `/ai-context.md`).
2. **Vocabulary Gate:**
   - **ABSOLUTE ZERO** occurrences of the legacy phrase `"AI-first"` across all copy, DOM elements, attributes, and CSS classes.
3. **Data Integrity & Zero Friction:**
   - Single-input domain scanning must transition smoothly to `visualize.html?domain=...`.
   - **Zero modal takeovers during scanning:** Preserve the clean in-button spinner (`#onboarding-btn-loader`) and existing scan state without interrupting the user.
4. **Static Crawler Indexability:**
   - All educational content in the Spatial Bento and FAQ Hub must remain fully pre-rendered in the static DOM for indexing by search bots and LLMs without requiring client-side JS execution.

---

## 4. Section-by-Section Wireframe & Architecture Blueprint

```text
┌────────────────────────────────────────────────────────────────────────┐
│ [Navbar] Logo: ThatWorkx AEO Suite     AIVisualize | AIOptimize | AISocialize │
├────────────────────────────────────────────────────────────────────────┤
│                           ✦ SPOTLIGHT HERO ✦                          │
│   [ Pill: ✦ THE AEO & GEO INFRASTRUCTURE PLATFORM ]                    │
│   Educating Brands to be AI-Ready and AI-Optimized.                    │
│   Discover how LLMs, answer engines, and agentic bots cite your brand. │
│                                                                        │
│   ┌───────────────────┬───────────────────┬───────────────────┐        │
│   │ 🔍 AIVisualize    │ ⚙️ AIOptimize     │ 📊 AISocialize    │        │
│   │ Diagnostic Engine │ Prescriptive Fix  │ Citation Engine   │        │
│   └───────────────────┴───────────────────┴───────────────────┘        │
│   ┌──────────────────────────────────────────────────┬──────────────┐  │
│   │ 🌐  [https://yourcompany.com](https://yourcompany.com)                      │ [ Scan Now ] │  │
│   └──────────────────────────────────────────────────┴──────────────┘  │
│   ⚡ Instant Enterprise Demos: [ shopify.com ↗ ] [ stripe.com ↗ ] [ airbnb.com ↗ ] │
├────────────────────────────────────────────────────────────────────────┤
│                   ✦ 20-BOT AI CRAWLER GATE RADAR ✦                     │
│   Filter: [ All 20 Bots ] [ 🌐 Search Engines ] [ 🧠 Foundation LLMs ] [ 🕷️ Commercial Scrapers ] │
│   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐│
│   │OAI-SearchBot  │ │PerplexityBot  │ │Claude-Search  │ │Google-Extended││
│   └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘│
├────────────────────────────────────────────────────────────────────────┤
│                   ✦ THE 3-PILLAR PRODUCT BENTO ✦                       │
│   ┌──────────────────────────────────┬───────────────────────────────┐ │
│   │ 🔍 AIVisualize (Diagnostic)      │ ⚙️ AIOptimize (Remediation)   │ │
│   │ 32-Capability C-Suite Scorecard  │ 1-Click Manifest Compiler     │ │
│   ├──────────────────────────────────┴───────────────────────────────┤ │
│   │ 📊 AISocialize (Social Citation Graph & Author Footprint)        │ │
│   └──────────────────────────────────────────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│       ✦ 4-LAYER MACHINE FILE HIERARCHY & DELIVERY PIPELINE ✦           │
│   ┌──────────────────────────────────┬───────────────────────────────┐ │
│   │ Layer 1: Protocol Gate (/robots) │ Live Interactive Sandbox:     │ │
│   │ Layer 2: Discovery Index (/llms) │ robots.txt / llms.txt /       │ │
│   │ Layer 3: Blueprint Manifest (.md)│ ai-context.md / markdown      │ │
│   │ Layer 4: Semantic Payload Chunks │ [ Copy ]  [ Download ]        │ │
│   └──────────────────────────────────┴───────────────────────────────┘ │
├────────────────────────────────────────────────────────────────────────┤
│              ✦ SPATIAL BENTO & SCHEMA INSPECTOR DECK ✦                 │
│   [ What is AEO? ] [ E-E-A-T Engine ] [ Enterprise API ] [ Fair Use ] │
├────────────────────────────────────────────────────────────────────────┤
│                ✦ DEFINITIVE 4-CATEGORY FAQ HUB ✦                       │
│   Tabs: [ All ] [ 🌐 General AEO ] [ 🔍 AIVisualize ] [ ⚙️ AIOptimize ] [ 📊 AISocialize ] │
│   ▼ What is the difference between SEO and AEO?                        │
│   ▶ Does running an AIVisualize scan alter any of my website code?     │
│   ▶ How does AIOptimize prevent anti-cloaking search penalties?        │
└────────────────────────────────────────────────────────────────────────┘