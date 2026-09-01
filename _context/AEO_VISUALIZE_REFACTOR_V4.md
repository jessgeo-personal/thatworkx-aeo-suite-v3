# SPECIFICATION DOCUMENT: AEO VISUALIZE DASHBOARD V4 REFACTOR

**File Reference:** `_context/AEO_VISUALIZE_REFACTOR_V4.md`

**Target File:** `frontend/visualize.html` (Clean-slate rebuild; archive legacy view to `frontend/visualize.legacy.html`)

**Associated Target Assets:** `frontend/visualize.css` (or modular `visualize-v4.css`), `frontend/visualize.js`

**Unaffected Core Files:** Backend services, API controllers, and `frontend/index.html` remain untouched.

---

## 1. Architectural Objective & Paradigm Shift

The V4 refactor transitions `frontend/visualize.html` from a congested multi-column dashboard grid into a **Linear Workflow Workbench**. Inspired by modern AI execution environments, this interface replaces vertical scrolling fatigue with a guided 6-stage progressive diagnostic pipeline.

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ TOP UTILITY & WAYFINDER BAR                                                                                      │
│ [ Thatworkx Logo ]   (1)──(2)──(3)──(4)──(5)──[ ● 6 Executive Summary ]    [ URL • Aug 20, 2026 ] [ JSON | PDF ] │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────┬───────────────────────────────────────────────────────────────────────┐
│ PERSISTENT TERMINAL SIDEBAR              │ ACTIVE WORKSPACE CANVAS (STEP 1 - 5 WORKBENCH)                        │
│                                          │                                                                       │
│ ┌──────────────────────────────────────┐ │ ┌───────────────────────────────────┬───────────────────────────────┐ │
│ │ ACTIVE SCANNING CAPSULE              │ │ │ Discovered Entities / Pages List  │ Selected Entity Deep-Dive     │ │
│ │ "Scanning for AI trust indicators..."│ │ │ • /about (Entity Schema OK)       │ • Live JSON-LD Graph Trace    │ │
│ └──────────────────────────────────────┘ │ │ • /privacy (Valid Terms)          │ • Remediations & Directives   │ │
│                                          │ │ • /pricing (Missing E-E-A-T)      │ • Raw Engine Response Headers │ │
│ • Section 1: AI Bot Blocks [PASS]      │ │ └───────────────────────────────────┴───────────────────────────────┘ │
│ • Section 2: Essential Pages [PASS]    │ ├───────────────────────────────────────────────────────────────────────┤
│ • Section 3: Content Available [WARN]  │ │ FLOATING DRILL-DOWN CONTROL                                           │
│ • Section 4: Trust & Privacy [SCANNING]│ │ [ ← Back to Executive Summary ]                                       │
│ • Section 5: AI-Ready Files [LOCKED]   │ └───────────────────────────────────────────────────────────────────────┘
│ ────────────────────────────────────── │                                                                         │
│ System Status: OK • Quota Charged: YES │                                                                         │
└──────────────────────────────────────────┴───────────────────────────────────────────────────────────────────────┘

```

---

## 2. Layout & Zone Specifications

### Zone A: Top Wayfinder & Utility Bar (Sticky Header)

1. **Brand Anchor (Left):** Minimalist Thatworkx AEO Suite badge.
2. **Dynamic Stepper (Center):** Compact numeric badges `(1)` through `(6)` connected by visual progression conduits.
* **Pre-Scan / Pre-Step State:** Inactive, locked numeric circle (`opacity: 0.35; cursor: not-allowed;`).
* **Scanning State:** Glowing emerald/cyan capsule border with spinning indicator.
* **Completed State:** Solid interactive circle with completed step number. Hovering displays the descriptive Step Tooltip.
* **Navigation Restriction:** Users can click **only** already completed steps or the currently active scanning step. Future unreached steps are locked.


3. **Executive Utility Suite (Right):**
* Target Domain Pill (`target-domain-badge`).
* Timestamp Badge (`scan-timestamp`).
* High-contrast Action Buttons: `[ Download JSON ]` and `[ Download PDF ]`.



### Zone B: Left Persistent Terminal Sidebar (Audit Log & Execution Queue)

1. **Active Scan Capsule (Top of Sidebar):** Surfaces the verbose, real-time scanning activity string (e.g., *"Scanning for existing machine-readable AI-Ready files on your website"*). Placing verbose copy here keeps the top stepper uncluttered.
2. **Progressive Section Summaries:** As each step completes, an accordion summary chip drops into the log with verified metrics (e.g., `Bot Access: 4/4 Verified`, `Essential Pages: 3 Found, 1 Missing`).
3. **Inline Diagnostic Log Stream:** Displays live telemetry messages, WAF encounters, and HTTP status codes.
4. **Failure & Quota Monitor (Base of Sidebar):**
* **Audit Fail (`[CRITICAL AUDIT GAP]`):** Rendered in high-contrast crimson. Indicates a website audit issue; regular subscription quota applies.
* **System Process Failure (`[SYSTEM ERROR - NOT CHARGED]`):** Rendered in high-contrast amber with a prominent `[ ↺ Retry Entire Audit ]` button. Indicates a network, crawler, or gateway crash; zero quota deduction.



### Zone C: Active Workspace Canvas (Contextual Step Workspace)

* **For Steps 1 through 5 (Technical Workbenches):**
* **Left Sub-Pane (35% Width):** List of scanned URLs, detected bot rules, or structured entity nodes with high-contrast status chips (`PASS`, `WARN`, `FAIL`).
* **Right Sub-Pane (65% Width):** Interactive deep-dive panel containing pre-formatted payload inspect drawers (`<details class="executive-drawer">`), header traces, and remediation snippets.
* **Zero Modal Interruptions:** Modals are strictly banned for diagnostic review; all inspections occur inline within the right sub-pane.
* **Floating Return Anchor:** Persistent `[ ← Back to Executive Summary ]` button anchored at the top-right of the workspace canvas when viewing Steps 1–5 after the full scan has completed.


* **For Step 6 (Executive Summary Canvas):**
* Transforms the entire workspace into the Boardroom Macro View (Health Index Dial, 5-Section Scorecards with direct jump links, and the Top 5 Urgent Action Items).



---

## 3. The 6-Stage Diagnostic Pipeline & Microcopy Matrix

| Stage | Active Scanning Message (Rendered in Left Sidebar) | Completed Stepper Number | Stepper Hover Tooltip | Audit Scope & Diagnostic Mapping | Terminology Gate Classification |
| --- | --- | --- | --- | --- | --- |
| **Step 1** | *Scanning for blocks to AI Bots accessing your website* | `1` | **AI Bot block checks** | WAF rules, Cloudflare challenge detection, User-Agent blocking (GPTBot, ClaudeBot, PerplexityBot, Google-Extended). | **AI-Optimized** |
| **Step 2** | *Scanning for Identifiable Essential pages for AI* | `2` | **AI Essential content checks** | "Can AI find your essential Pages", "Missing essential Pages", and "Can AI cite you in their answers" presence. | **AI-Optimized** |
| **Step 3** | *Scanning for Content Availability for AI-bots accessing your website* | `3` | **AI Bot Content Availability checks** | Per-webpage AI Citation Audit, content scannability, DOM text density, semantic heading structure, information gain. | **AI-Optimized** |
| **Step 4** | *Scanning for AI trust and privacy indicators* | `4` | **AI Trust and Privacy checks** | "Can AI trust who you are?" (E-E-A-T footprint, Knowledge Graph entity grounding, author authority, Privacy & Terms anchors). | **AI-Optimized** |
| **Step 5** | *Scanning for existing machine-readable AI-Ready files on your website* | `5` | **AI-ready file checks** | `llms.txt`, `llms-full.txt`, `robots.txt` AI directives, OpenAPI schemas, machine endpoints. Missing files trigger warnings with AIOptimize upsell context. | **AI-Ready** |
| **Step 6** | *Compiling Boardroom Summary & Action Triage* | `6` | **Executive summary and Action items** | Overall Health Index Dial, Scan Metadata (Date/Time, Scanned URL, Page Count), 5-Section Scorecards (with jump links), Top 5 Urgent Action Items, Export Suite. | **Executive Boardroom** |

---

## 4. Step 6: Executive Summary Canvas Architecture

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│ STEP 6: EXECUTIVE BOARDROOM CANVAS                                                                               │
│                                                              ──────────────────────────────────────────────────  │
│  ┌─────────────────────────┐  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │ AEO HEALTH INDEX DIAL   │  │ TOP 5 URGENT ACTION ITEMS (Ranked by Visibility Impact)                       │  │
│  │         [ 78 ]          │  │ 1. [CRITICAL] Resolve ClaudeBot WAF 403 blocking (Recover 28% visibility)     │  │
│  │       / 100             │  │ 2. [HIGH] Publish Missing /contact & /about Essential Pages                   │  │
│  │   Status: AI-Optimized  │  │ 3. [HIGH] Inject Organization Schema to resolve Knowledge Graph entity gaps   │  │
│  │ Scanned: 24 Pages       │  │ 4. [MEDIUM] Restructure H1/H2 semantic hierarchy for Citation extractability  │  │
│  │ Time: Aug 20, 11:30 AM  │  │ 5. [GROWTH] Deploy missing llms.txt manifest (AI-Ready Endpoint Warning)      │  │
│  └─────────────────────────┘  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                                                  │
│  5-SECTION SCORECARD MATRIX (Outcome-First Jump Cards)                                                           │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────────────────────┐  │
│  │ SECTION 1     │ │ SECTION 2     │ │ SECTION 3     │ │ SECTION 4     │ │ SECTION 5                           │  │
│  │ AI Bot Blocks │ │ Essential Pgs │ │ Citation Read │ │ Trust & EEAT  │ │ AI-Ready Files                      │  │
│  │ Score: 100%   │ │ Score: 75%    │ │ Score: 68%    │ │ Score: 80%    │ │ Score: 40% (Warning)                │  │
│  │ [View 1 →]    │ │ [View 2 →]    │ │ [View 3 →]    │ │ [View 4 →]    │ │ [View 5 →]                          │  │
│  └───────────────┘ └───────────────┘ └───────────────┘ └───────────────┘ └─────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────────────┘

```

### Top 5 Action Item Ranking Hierarchy (Strict Priority Rules)

1. **Rule 1: AI Bot & WAF Access Blocks** (*Unblocks raw agent discovery; top priority*).
2. **Rule 2: Missing Essential Pages** (*Establishes core domain footprint: About, Contact, Pricing, Terms*).
3. **Rule 3: E-E-A-T & Knowledge Graph Entity Gaps** (*Fixes Schema, author profiles, and brand grounding*).
4. **Rule 4: Citation Readability & DOM Scannability** (*Resolves low text density, weak heading trees, low information gain*).
5. **Rule 5: Zero AI-Ready Manifest Warnings** (*Surfaces missing `llms.txt` and OpenAPI files with Phase 2 AIOptimize remediation path*).

---

## 5. State Machine & Usability Governance Rules

```
                      ┌───────────────┐
                      │  Scan Starts  │
                      └───────┬───────┘
                              │
                              ▼
                   ┌─────────────────────┐
                   │ Step 1 Scanning...  │
                   └──────────┬──────────┘
                              │
                              ▼
                 ┌──────────────────────────┐
                 │    Step 1 Complete       │◄───────────────────┐
                 │ (Step 2 Background Run)  │                    │
                 └────────────┬─────────────┘                    │
                              │                                  │ User navigates
                              ├──────────────────────────────────┤ to inspect
                              ▼                                  │ completed step
                 ┌──────────────────────────┐                    │
                 │   Step 2-5 Complete      │                    │
                 │ (Step 6 Compiling...)    │                    │
                 └────────────┬─────────────┘                    │
                              │                                  │
                              ▼                                  │
    ┌────────────────────────────────────────────────────┐       │
    │ Scan Engine Finished?                              │       │
    ├──────────────────────────┬─────────────────────────┤       │
    │ User on Active View?     │ User browsing Step 1-5? │───────┘
    │ (No Early Navigation)    │ (Early Inspection)      │
    ▼                          ▼                         │
┌────────────────────────┐ ┌───────────────────────────┐ │
│ Auto-Advance to Step 6 │ │ Trigger Pulsing Step 6    │ │
│ Executive Summary      │ │ Badge & Non-Intrusive     │ │
│                        │ │ Floating Toast:           │ │
│                        │ │ "Audit complete.          │ │
│                        │ │ [View Summary →]"         │ │
└────────────────────────┘ └───────────────────────────┘ │

```

### 1. The Early Inspection & Concurrency Rule

* Users are permitted to click and inspect any **already completed step** or the **currently scanning step**.
* The background scan engine continues processing subsequent steps without interruption.
* **Navigation Anti-Hijack Guard:** If a user is actively reading Step 1–5 when the scan finishes, the UI **must not** abruptly force-redirect the screen to Step 6. Instead:
* Step 6 in the top stepper pulses with an active status badge: `[ ● 6 Summary Ready ]`.
* A non-intrusive floating toast appears in the bottom right: *"Audit complete. [View Executive Summary →]"*.
* If the user never navigated away from the active progress screen, the UI automatically transitions to Step 6.



### 2. State Store Mutation & Zero DOM Flicker

* Telemetry received from background workers updates an isolated in-memory data store.
* Background events append entries strictly to the Left Sidebar diagnostic log.
* The central workspace canvas DOM does not re-render unless the user explicitly switches steps or the current active step completes.

### 3. Rerun & Quota Policy

* **No Partial Step Reruns:** To maintain holistic data integrity, any re-audit reruns the full 6-stage pipeline.
* **Three Execution States:**
* `Analysis Pass`: Audit test passed; normal quota applies.
* `Analysis Fail`: Audit test found structural/visibility issues; normal quota applies.
* `Analysis Process Failure`: Network dropout, crawler timeout (504), or engine crash. Rendered with amber indicator `[SYSTEM ERROR - NOT CHARGED]` + `[↺ Retry Entire Audit]`; quota is restored/exempt.



### 4. Breakpoint Dynamics (Mobile & Tablet Ergonomics)

* **Desktop (>1024px):** Fixed Left Sidebar (320px) + Dynamic Stepper + 2-Column Workspace Canvas.
* **Tablet / Mobile (≤1024px):**
* Top stepper condenses into a horizontal-scrolling strip of numeric badges.
* Left Sidebar transforms into a collapsible top diagnostic drawer (`<details class="mobile-terminal-drawer">`).
* Workspace Canvas stacks into a single outcome column with collapsible technical inspection drawers.



---

## 6. Strict Terminology & Design Token Governance

```
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ GOVERNANCE GATE CHECKLIST                                                                │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [✓] ZERO occurrences of the banned phrase "AI-first" across all copy and DOM attributes. │
│ [✓] Steps 1, 2, 3, and 4 designated strictly as "AI-Optimized".                          │
│ [✓] Step 5 designated strictly as "AI-Ready".                                            │
│ [✓] Zero mock numbers or dummy stats before scan execution (render "--" / "UNAUDITED").  │
│ [✓] Zero modal takeovers for technical inspection (all drawers inline <details>).        │
└──────────────────────────────────────────────────────────────────────────────────────────┘

```

### Approved Color Palette & Tokens:

* **Canvas Background:** Deep Slate/Void (`#0B0F17`)
* **Card Surfaces:** Semi-transparent Glass Slate (`#111827` at `85% opacity`, `backdrop-filter: blur(12px)`)
* **Borders & Dividers:** Subtle Slate Glow (`#1E293B`)
* **Active Progress Glow:** Emerald / Cyan Accent (`#10B981` / `#06B6D4`)
* **Audit Gap / Critical Failure:** High-Contrast Crimson (`#EF4444`)
* **System Process Error (Uncharged):** Vibrant Amber (`#F59E0B`)
* **Typography:** Inter / System Sans-Serif; Monospace strictly for raw response headers and schema validation blocks.

---

## 7. Master Agreement Ledger (Single Source of Truth)

| Dimension | Approved Architectural Specification | Status |
| --- | --- | --- |
| **Workspace Model** | Linear Workflow Workbench (Left Sidebar Terminal + Top Stepper + 2-Column Canvas). | **LOCKED** |
| **Legacy Strategy** | Fresh build of `visualize.html`. Archive legacy view to `visualize.legacy.html`. | **LOCKED** |
| **Top Stepper UX** | Compact badges `(1)` to `(6)` with hover tooltips; restricted to completed/active steps. | **LOCKED** |
| **Verbose Scan Microcopy** | Long scanning strings isolated strictly inside Left Sidebar Active Scan Capsule. | **LOCKED** |
| **Early Step Inspection** | Allowed for completed/active steps without pausing background engine. | **LOCKED** |
| **Navigation Anti-Hijack** | Pulsing Step 6 capsule + floating toast if user is browsing earlier steps on completion. | **LOCKED** |
| **DOM Stability** | In-memory store decoupling prevents workspace DOM flickers and scroll resets. | **LOCKED** |
| **Return Navigation** | Persistent `[ ← Back to Executive Summary ]` anchor on Steps 1–5. | **LOCKED** |
| **Diagnostic Drawers** | Native collapsible `<details class="executive-drawer">` inline in sub-pane; zero modals. | **LOCKED** |
| **Step 1 Scope** | AI Bot block checks (WAF, Cloudflare, User-Agents). Hover: `AI Bot block checks`. | **LOCKED** |
| **Step 2 Scope** | AI Essential content checks (Essential & Missing Pages, Citations). Hover: `AI Essential content checks`. | **LOCKED** |
| **Step 3 Scope** | AI Bot Content Availability checks (Per-page Citation, DOM density, Structure). Hover: `AI Bot Content Availability checks`. | **LOCKED** |
| **Step 4 Scope** | AI Trust and Privacy checks (E-E-A-T, Entity Graph, Author, Privacy). Hover: `AI Trust and Privacy checks`. | **LOCKED** |
| **Step 5 Scope** | AI-ready file checks (`llms.txt`, OpenAPI, manifests). Phase 2 upsell context. Hover: `AI-ready file checks`. | **LOCKED** |
| **Step 6 Scope** | Executive summary and Action items (Health Dial, Top 5 Actions, 5 Scorecards, Exports). | **LOCKED** |
| **Action Priority Order** | 1. WAF/Bot Blocks $\rightarrow$ 2. Essential Pages $\rightarrow$ 3. E-E-A-T Gaps $\rightarrow$ 4. Citation Readability $\rightarrow$ 5. AI-Ready Manifest Warnings. | **LOCKED** |
| **Execution Terminology** | Three states: `Analysis Pass`, `Analysis Fail`, and `Analysis Process Failure` (uncharged). | **LOCKED** |
| **Quota & Rerun Policy** | Full re-audit on rerun. Zero quota charge on System Process Failures. | **LOCKED** |
| **Responsive Adaptation** | Stepper horizontally scrolls; Left Sidebar collapses to top drawer on mobile. | **LOCKED** |
| **Governance Gates** | Banned phrase *"AI-first"* zero tolerance; AI-Optimized (1–4) vs AI-Ready (5); Empty states `--` / `UNAUDITED`. | **LOCKED** |

---

## 8. Engineering Handover Instructions for Chief Engineering Manager Agent

When executing this refactor via the Antigravity CLI (`agy`):

1. **Archive Legacy View:** Move current `frontend/visualize.html` to `frontend/visualize.legacy.html`.
2. **Clean-Slate Implementation:** Implement the fresh `frontend/visualize.html` adhering strictly to the DOM hierarchy, class structures, and component zones defined in this specification.
3. **Preserve Backend & Routes:** Do not alter `backend/server.js`, `crawlerService.js`, `capabilityEvaluator.js`, or `frontend/index.html`.
4. **Update Frontend Test Suite:** Adjust Vitest frontend test assertions (e.g., `visualizeRefactorV3.test.js`) to target the new 6-stage linear workbench DOM contract and verify that pre-scan empty states render `--` and `UNAUDITED`.

This specification is complete, validated, and locked for execution.