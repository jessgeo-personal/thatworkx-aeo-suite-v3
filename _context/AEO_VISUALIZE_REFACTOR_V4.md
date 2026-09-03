# SPECIFICATION DOCUMENT: AEO VISUALIZE DASHBOARD V4 REFACTOR

**File Reference:** `_context/AEO_VISUALIZE_REFACTOR_V4.md`

**Target File:** `frontend/visualize.html` (Clean-slate rebuild; legacy view archived to `frontend/visualize.legacy.html`)

**Associated Target Assets:** `frontend/visualize.css`, `frontend/visualize.js`, `frontend/index.css`

**Unaffected Core Files:** Backend services, API controllers, and `frontend/index.html` remain untouched.

---

## 1. Architectural Objective & Greenfield Theme Synchronization

The V4 refactor transitions `frontend/visualize.html` from a congested multi-column dashboard grid into a **Linear Workflow Workbench** named **AIVisualize Diagnostic Cockpit**. The visual layer is fully synchronized with the **Greenfield CSS Design System** defined in `frontend/index.css`.

### Design Tokens & Color Palette (`frontend/index.css`):
* **Canvas Background:** `--canvas-bg: #202124;` (Google dark background grey)
* **Surface Cards:** `--surface-bg: #1f1f1f;` (Google card/container background)
* **Nested Wells & Inputs:** `--surface-nested-bg: #121212;` (Darker wells, code blocks, terminal stream)
* **Borders & Dividers:** `--border-color: #3c4043;` (Google Fonts dark divider lines)
* **Typography:**
  * Primary Text: `--text-primary: #ffffff;`
  * Secondary Text: `--text-secondary: #e8eaed;`
  * Muted Caption Text: `--text-muted: #bdc1c6;`
  * Font Families: `'Plus Jakarta Sans', sans-serif`, `'JetBrains Mono', monospace`, `'Space Mono', monospace`
* **Signature Accents:**
  * **Burnt Copper (Primary AIVisualize Brand Accent):** `--burnt-copper: #b7410e;`, `--burnt-copper-hover: #d45d2a;`, `--burnt-copper-glow: rgba(183, 65, 14, 0.35);`
  * **Sky Blue Accent:** `--sky-color: #38bdf8;`
  * **Pass / Fail Badges:** `--badge-pass: #10b981;` (`rgba(16, 185, 129, 0.15)`), `--badge-fail: #ef4444;` (`rgba(239, 68, 68, 0.15)`)
  * **Machine Manifest Indigo (Stage 5):** `#6366f1` / `#818cf8`

```
┌────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STREAMLINED MULTI-ROW HEADER BAR (MAX-WIDTH 1200PX CENTERING • GOOGLE DARK #202124 CANVAS)                             │
│ Line 1: [ ☰ ] 🔍 AIVisualize DIAGNOSTIC                                [ ↺ Rescan ]   [ + New Scan ]                   │
│ Line 2: [URL: thatworkx.com]   •   [Scanned: 11:30 AM IST]   •   [Duration: 3.8s]        [ Export JSON ] [ Export PDF ]│
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ACCORDION HORIZONTAL PROGRESS BAR (BELOW HEADER)                                                                       │
│ (1) ──── (2) ──── (3) ──── (4) ──── (5) ──── [ ● 6 Executive Summary ]   (Expands on hover / active / scanning)        │
├────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┤
│ ┌──────────────────────────────────────┐                                                                               │
│ │ 3D ELEVATED SLIDE-OUT DRAWER         │  ACTIVE WORKSPACE CANVAS (MAX-WIDTH 1200PX)                                   │
│ │ (BURNT COPPER GLOW + BACKDROP BLUR)  │                                                                               │
│ │                                      │  ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ • BRAND HEADER + [ ✕ Close ]         │  │ Topic Header: AI Bot Blocks & Gateway Permissions   [ Score: 100% PASS ] │ │
│ │ • ACTIVE SCANNING CAPSULE            │  ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ • PROGRESSIVE SECTION SUMMARIES      │  │ Top Takeaway: What AI Search Engines See & Why It Matters                │ │
│ │ • LIVE AUDIT ACTIVITY STREAM         │  ├────────────────────────────────────┬─────────────────────────────────────┤ │
│ │ • SYSTEM STATUS & QUOTA MONITOR      │  │ Visual Stage Metaphor Canvas       │ Selected Entity Deep-Dive           │ │
│ │                                      │  │ • Stage 1: AI Bot Allowance Matrix │ • Verification Evidence (<details>) │ │
│ │                                      │  │ • Stage 2: 5-Anchor Kanban Cards   │ • Plain English Summary             │ │
│ │                                      │  │ • Stage 3: Semantic Text Density   │ • Raw Server Trace Sub-Drawer       │ │
│ │                                      │  │ • Stage 4: E-E-A-T Node Map        │ • Recommended Action Plan           │ │
│ │                                      │  │ • Stage 5: Machine Manifests       │                                     │ │
│ └──────────────────────────────────────┘  └────────────────────────────────────┴─────────────────────────────────────┘ │
│                                                                                                                        │
│ FLOATING DRILL-DOWN CONTROL: [ ← Back to Executive Summary ]                                                           │
└────────────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Layout Structure & Header Refactoring

### 1. Desktop Max-Width Container:
* Desktop layout is constrained to `max-w-[1200px] mx-auto` to maintain high visual hierarchy and ergonomic scan line length on large displays.

### 2. Multi-Row Executive Header:
* **Line 1 (Top Line):**
  * **Brand Lockup & Drawer Trigger:** Left-aligned `[ ☰ ]` button + official **`AIVisualize` branding logo image** (`frontend/src/images/aivisualize-logo.png`).
  * **Primary Actions:** `[ ↺ Rescan ]` and `[ + New Scan ]` buttons placed on the **same top line on the right**.
* **Line 2 (Metadata & Export Utility Row):**
  * **Diagnostic Metadata Badges:** URL target pill (`https://thatworkx.com` with green pulsing dot), Timestamp (`Aug 20, 2026 • 11:30 AM IST`), Scan Duration (`Duration: 3.8s`), and Scanned Pages Count (`No. of pages scanned: 24`).
  * **Export Controls:** Instant one-click export buttons (`JSON` & `PDF`) right-aligned on Line 2.

### 3. Dynamic Accordion Stepper (Below the Header):
* Positioned in a dedicated sub-bar directly below the header.
* **Smart Accordion States:**
  * **Completed Stages:** Collapse to **just the stage number circle badge** (`(1)`, `(2)`, `(3)`, `(4)`, `(5)`).
  * **Hover / Mouseover:** Hovering over any stage number badge smoothly expands the label to display the full title (e.g. `(1) AI Bot Blocks`).
  * **Scanning / Processing Stage:** Actively expanded with pulsing copper indicator (`(● 3) Content Availability`).
  * **Active / Selected Stage:** Fully expanded with Burnt Copper accent fill.

### 3-Tier Business-First Typography Hierarchy:
* **Tier 1 (Instant Executive Scan — 0.5s):**
  * Canvas Topic Headlines: `text-2xl sm:text-3xl font-black text-white font-headline` (e.g., `AI Bot Blocks & Crawler Gateway Permissions`).
  * Macro Health Index & Stage Result Scores: `text-3xl sm:text-4xl font-black font-mono` (`100% PASS`, `78/100`).
  * Top Takeaway Header: `text-sm sm:text-base font-black text-[#d45d2a] uppercase tracking-wider font-headline`.
* **Tier 2 (Business Explanations & Directives — 3s):**
  * Top Takeaway Narrative: `text-sm sm:text-base font-normal text-[#e8eaed] leading-relaxed max-w-3xl` (un-bolded, elegant high-contrast reading experience).
  * Verification Evidence Plain-English Summary: `text-sm sm:text-base font-medium text-[#e8eaed] leading-relaxed`.
  * Recommended Action Plan Directives: `text-sm sm:text-base font-medium text-[#e8eaed] leading-relaxed` with bold high-contrast execution button.
  * Primary Kanban & Module Verdicts: `text-sm sm:text-base font-black text-white`.
* **Tier 3 (Supplementary Data & Server Traces — On Demand):**
  * Distinct container tags: `[PRIMARY RESULT]` vs `[SUPPLEMENTARY BREAKDOWN (20 ENGINES)]`.
  * Crawler Latencies & Per-Engine Breakdown: `text-xs font-mono`.
  * Technical Server Headers & Raw Traces: `text-xs font-mono text-[#38bdf8]` inside collapsible drawers.

### 4. Navigation & Scroll Reset Behavior:
* Whenever a user clicks a scorecard link, action item jump link, or stepper item to navigate between stages, the active canvas view automatically resets its scroll position to the top (`scrollTo({ top: 0 })`), ensuring immediate visibility of the hero topic header and takeaway card.

---

## 3. Executive Microcopy Standard (3-Part Boardroom Framework)

Every technical diagnostic stage implements the executive-ready 3-part microcopy framework to translate complex crawler mechanics into clear business actions:

### 2. The 3-Tier Progressive Disclosure Framework:
* **Tier 1 (High Impact Summary):** Takeaway statement, overall score, and primary diagnostic visual component.
* **Tier 2 (Dual Action Framework & Human Validation):**
  * **Box 1 (Manual Remediation):** `"Action Plan: How to improve how AI can read your current pages better"` with high-level summary and an expandable sub-drawer revealing detailed 4-step remediation instructions for engineering teams.
  * **Box 2 (Automated AI-Ready Manifest Shortcut):** `"Recommended Shortcut: Upgrade to AIOptimize Pro to automatically create AI-ready files"` detailing how deploying the 4-level machine manifest hierarchy skips manual HTML fixes. Formatted with adaptive stacking (header on top, explanation in middle, full-width action button on next line on tablet/mobile; side-by-side flex on desktop) with the **`⚡ Deploy AI-Ready files using AIOptimize Pro ↗`** CTA.
  * **Verification Drawer:** `"Verification Evidence (What We Found)"` plain-English validation drawer.
* **Tier 3 (Deep Machine Context):** Collapsible technical server response header trace and raw payloads for engineers.

---

## 4. Bespoke Stage Visual Metaphors & Microcopy Matrix

| Stage | Classification | Active Scanning Microcopy (Drawer) | Stepper Tooltip | Bespoke Visual Metaphor Component | Executive 3-Part Microcopy Focus |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **AI-Optimized** | *Scanning for blocks to AI Bots accessing your website (GPTBot, ClaudeBot, PerplexityBot, Googlebot...)* | **AI Bot block checks** | **50/50 Dual-Workbench:** **Gateway & WAF Security Markers** (50% width primary result with enlarged robots.txt, Cloudflare, and X-Robots-Tag verdicts) vs **AI Crawler Allowance Matrix** (50% width supplementary breakdown with all 20 AI engines grouped by provider with icons and Allowed/Denied coloring). | **Access Risk:** Blocked crawlers cannot index or synthesize your content into generative responses. |
| **Stage 2** | **AI-Optimized** | *Scanning for Identifiable Essential pages for AI (About, Contact, Pricing, Privacy, Terms)...* | **AI Essential content checks** | **Grouped 5-Anchor Essential Kanban Card (Adaptive Responsive Layout):** 5 vertical columns on desktop (`lg:grid-cols-5`) and 5 stacked, horizontally wide boxes on tablet and mobile (`flex-row items-center justify-between` on tablet) verifying `/about`, `/contact`, `/pricing`, `/privacy-policy`, and `/terms-of-service`. | **Commercial Discovery:** AI uses essential pages and core anchors to verify your company credentials like company identity(/about), direct contact details(/contact), privacy commitments(/privacy) and terms of service(/terms). |
| **Stage 3** | **AI-Optimized** | *Scanning for Content Availability for AI-bots accessing your website and evaluating citation extractability...* | **AI Bot Content Availability checks** | **Semantic Text Density Thermometers (Paginated 24 Scanned Pages in Batches of 5):** Displays total scanned pages count badge (`24 Total Pages Scanned`), sorted with lowest density / most extraction issues first. Each URL card provides dual action triggers: **`[ 📄 View What AI sees ↗ ]`** (opens raw Markdown viewer in new tab) and **`[ 🔍 Details ▾ ]`** (expands an in-place per-page remediation drawer directly matching `visualize.legacy.html` and `index.js` Module 4: Crawl Errors, Thin Content Warnings, SPA/DOM nesting alerts, Canonical tag copy, Semantic HTML5 snippet copy, Image Alt tag comparison, Head/Body Revision date copy buttons, and Schema builder links). Initially renders top 5 pages with progressive `[ Load Next 5 Pages ]` button until all 24 URLs are revealed. | **Answer Parity:** Low-density client-rendered JS wrappers prevent AI crawlers from quoting your facts. |
| **Stage 4** | **AI-Optimized** | *Scanning for AI trust and privacy indicators (E-E-A-T footprint, Knowledge Graph grounding)...* | **AI Trust and Privacy checks** | **Entity Authority & E-E-A-T Relational Graph (Adaptive Responsive Layout):** 4 vertical columns on desktop (`lg:grid-cols-4`) and 4 stacked horizontally wide boxes on tablet/mobile verifying Schema/Organization, Author Person E-E-A-T, Wikidata Grounding, and Privacy & Legal Anchors. | **Entity Authority:** Disambiguates your brand identity across Google Gemini and ChatGPT knowledge graphs. |
| **Stage 5** | **AI-Ready** | *Scanning for existing machine-readable AI-Ready files on your website (llms.txt, llms-full.txt, OpenAPI)...* | **AI-ready file checks** | **Machine Manifest Protocol Explorer (The 4-Level Machine Manifest Hierarchy):** 4 vertical columns on desktop and 1-column single stack on mobile/tablet. 3-row layout per box (Row 1: Level Title + Status badge, Row 2: File name + colored status pill, Row 3: Plain English explanation). Detailing **Level 1: Protocol Gates (`/robots.txt`)**, **Level 2: The Welcome Mat (`/sitemap.xml` & `/llms.txt`)**, **Level 3: Context Maps & Blueprint (`/ai-context.md` only)**, and **Level 4: Workspaces & Documentation (`/README.md`, `/about.md`, `/docs.md`, `/content.md`)**. | **Autonomous Reasoning:** Provides structured machine endpoints for developer and agentic search loops. |
| **Stage 6** | **Executive Boardroom** | *Compiling Boardroom Summary & Action Triage across all 5 completed diagnostic modules...* | **Executive summary and Action items** | **Boardroom Macro View:** Illuminated Neon Glowing AEO Health Index Dial (0-100 with gradient arc and feGaussianBlur halo), **Dual-Pillar Readiness Breakdown** (Human Web Readiness % vs Machine Web Readiness %), Ranked Top 5 Urgent Action Items card, and Grouped 5-Section Scorecard Matrix with prominent stage headings. | **Executive Triage:** Macro governance score and visibility impact remediation roadmap. |

---

## 5. State Machine & Governance Rules

### 1. The Early Inspection & Concurrency Rule
* Users are permitted to click and inspect any **already completed stage** or the **currently scanning stage**.
* The background scan engine continues processing subsequent steps without interruption.
* **Anti-Hijack Guard:** If a user is actively reading Stage 1–5 when the scan finishes, the UI **must not** abruptly force-redirect the screen to Stage 6. Instead:
  * Stage 6 in the top stepper pulses with an active status badge: `[ ● 6 Summary Ready ]`.
  * A non-intrusive floating toast appears in the bottom right: *"Audit complete. [View Executive Summary →]"*.
  * If the user never navigated away from the active progress screen, the UI automatically transitions to Stage 6.

### 2. Rerun & Quota Policy
* **Three Execution States:**
  * `Analysis Pass`: Audit test passed; normal subscription quota applies.
  * `Analysis Fail`: Audit test found structural/visibility gaps; normal subscription quota applies.
  * `Analysis Process Failure`: Network dropout, crawler timeout (504), or engine crash. Rendered with amber indicator `[SYSTEM ERROR - NOT CHARGED]` + `[↺ Retry Entire Audit]`; quota is 100% exempt/restored.

### 3. Strict Terminology & Design Token Governance
* **Zero tolerance for the banned phrase `"AI-first"`** across all copy, code, and DOM attributes.
* Stages 1, 2, 3, and 4 designated strictly as **"AI-Optimized"** (human-centric web presence with no technical AI blocks).
* Stage 5 designated strictly as **"AI-Ready"** (4-level machine manifest hierarchy: `llms.txt`, `ai-context.md`, etc.).
* Zero developer jargon ("telemetry" replaced with "Live Audit Activity").
* Pre-scan empty states render `--` and `UNAUDITED`. Zero fake mock metrics before scan execution.