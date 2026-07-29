# 📜 Active Phase Plan: ThatWorkx AEO Suite (v3.0) — AIVisualize Re-Architecture
**Sprint:** 48-Hour AIVisualize Re-Architecture
**Current Branch:** `dev`
**Baseline Status:** 🟢 All Core Phases & Post-Phase 4 Refinements Complete
**Test Suite Coverage:** 63/63 Vitest Tests Passing Green across 10 Test Suites
**Governance:** Operating under strict `GEMINI.md` (Zero `"AI-first"` phrasing allowed)
---

## 🏛️ Summary of Completed Architectural Phases

### Phase 1: Server-Side Scoring Engine & Backend API
* **Status:** 🟢 100% Complete & Committed
* Centralized score calculation and evaluation logic on the backend (`capabilityEvaluator.js`).
* Established 4 core diagnostic domains: Gateway & Access, Presence & Hygiene, Content AI-Optimization, and Machine Manifest Readiness.
### Phase 2: Executive Mode SSR Cards
* **Status:** 🟢 100% Complete & Committed
* Built Executive Mode summary cards powered by server-side rendered (SSR) payload streams.
* Separated high-level executive summaries from granular developer diagnostics.
### Phase 3 & 3.1: DIY Mode SSR Engine & UX Refinements
* **Status:** 🟢 100% Complete & Committed
* Built the **"AI-Optimized Site Diagnostics"** 32-capability matrix with sticky table header locking (`position: sticky; top: 0`) and full-width category divider rows.
* Built the **"AI-Ready File (Machine Manifest) Diagnostics"** 1–4 Level Inspection Table covering all 8 root machine files with bot permission tracking (`ChatGPT`, `Gemini-bot`, `Perplexity-bot`) and new-tab inspection links (`target="_blank"`).
* Restored itemized bulleted deduction findings (`<ul class="deduction-list">`) with explicit point penalty impacts in Executive mode cards when section scores drop below 25/25.
### Phase 4: State Persistence, Export Engines & Monetization Gating
* **Status:** 🟢 100% Complete & Committed
* **URL State Synchronization:** Synced `?mode=` (`executive` | `developer`) and `?tab=` (`all`, `gateway`, `hygiene`, `content`, `manifests`) via `window.history.replaceState` and `URLSearchParams` for deep-linking.
* **Export Engines:** Integrated `exportRawJsonDiagnostics()` downloading `aeo-diagnostics-<domain>-<timestamp>.json` and added `@media print` CSS rules for executive summary exports.
* **Monetization Interceptors:** Mapped non-free capability badges (`Upgrade to AIV Pro ⚡` / `Upgrade to AIO Pro 🔒`) directly to `showUpgradeModal(code, message, targetTier)`.
---
## 🎨 Recent Post-Phase 4 Refinements & Relocations

### 1. Executive Mode Hero & Explainer Banner
* Transformed markdown headings into a landing-page-styled Hero Component.
* Added audience pill badge, URL badge, timestamp badge, and dynamic scan duration metric (`Time to Scan: X seconds`).
* Structured 2-Method Business Explainer cards highlighting **"AI-Optimized"** human-centric web presence vs. **"AI-Ready"** machine-friendly web presence.

### 2. DIY Mode Layout Restructuring & Live SSR Data Binding
* **Layout Separation:** Extracted the 4 Summary Section Cards out of the top Hero Banner into an independent 4-card grid sitting directly below the Hero box.
* **Live SSR Data Binding:** Connected all 4 summary cards directly to live backend scan results (`results` / `results.executiveSections`).
* **Dynamic Score Pills:** Added real-time score pills (`0/25 pts` to `25/25 pts`) with green pass (`var(--badge-pass)`) and red fail (`var(--badge-fail)`) states.
* **Line-Item Ticks & Crosses:** Prepend dynamic `✓` / `🟢` pass icons or `✗` / `🔴` fail icons next to every individual check based on live scan deductions.

### 3. Component Relocation to `optimize.html`
* **Sandbox Relocation:** Moved the "Edge Network & WAF Deployment Sandbox" component from `visualize.html` to `optimize.html` (under the main workspace card with `updateOptimizeTargetDomain()` domain sync).
* **Provider Workaround Banner in `visualize.html`:** Added a callout banner with an upgrade link to **AIOptimize Pro**:
> *"Can't manage your own AI-ready files because your provider manages it for you? Upgrade to AIOptimize Pro to enable workarounds and manage your AI-Ready files yourself"*

---

## 🧪 Quality Assurance & Test Suite Status

```text
npx vitest run

✓ backend/tests/bdd/consoleTabSwitcher.test.js (16 tests)
✓ backend/tests/servicesAndControllers.test.js (11 tests)
✓ backend/tests/capabilityEvaluator.test.js (7 tests)
✓ backend/tests/bddGating.test.js (6 tests)
✓ backend/tests/bdd/executiveMode.test.js (5 tests)
✓ backend/tests/bdd/phase4StateAndExport.test.js (4 tests)
✓ backend/tests/bdd/diyMode.test.js (4 tests)
✓ backend/tests/bdd/fourPageArchitecture.test.js (4 tests)
✓ backend/tests/bdd/serverSideScoring.test.js (3 tests)
✓ backend/tests/bdd/dashboardCategorization.test.js (2 tests)

Test Files: 10 passed (10)
     Tests: 63 passed (63)

```
---

## 🏛️ Governance & Vocabulary Standards
* **Banned Phrasing:** Legacy term `"AI-first"` is strictly banned across all HTML, JS, JSON exports, and test suites (`0` occurrences).
* **Core Site Terminology:** Strictly use **"AI-Optimized"** for human-centric web presence checks.
* **Machine Manifest Terminology:** Strictly use **"AI-Ready"** for machine manifest checks.
---
## 📌 Post-Launch Backlog & Next Steps

1. **[UX-104] PDF Export Layout Polish:** Refine `@media print` CSS layout, margins, and page breaks to improve PDF visual structure.
2. **Local Manual QA Pass:** Perform interactive browser walkthrough on the `dev` branch.
3. **Staging Promotion Plan:** Prepare pull request and merge strategy from `dev` to `staging`/`main`.