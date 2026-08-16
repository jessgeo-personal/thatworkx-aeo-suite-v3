# Phase 1 Specification: Boardroom-Grade `visualize.html` Redesign

## 1. Executive Summary & Objective
Transform `frontend/visualize.html` into a high-contrast, boardroom-grade diagnostic intelligence suite for C-suite executives and founders. The UI utilizes Aceternity UI patterns (Bento Grids, subtle card spotlights, obsidian backgrounds, and lateral floating wayfinder navigation) while preserving 100% of existing SSR data bindings and BDD test contracts.

---

## 2. Aceternity Component Reference Matrix

| Feature / UI Area | Target Aceternity Component | Reference URL | Implementation Directives |
| :--- | :--- | :--- | :--- |
| **Lateral Wayfinder Dock** | `Floating Dock` | [Aceternity Floating Dock](https://ui.aceternity.com/components/floating-dock) | Pinned right rail (desktop) / sticky top (mobile) with glassmorphism backdrop (`rgba(15,23,42,0.85)`). |
| **Score & Macro Bento** | `Bento Grid` | [Aceternity Bento Grid](https://ui.aceternity.com/components/bento-grid) | Asymmetrical 1fr + 2fr layout for Score Dial and 2x2 Pillar Cards. |
| **Telemetry & Pillar Cards** | `Card Spotlight` | [Aceternity Card Spotlight](https://ui.aceternity.com/components/card-spotlight) | Subtle 1px mouse-following radial border highlight (`--visualize-500: #0ea5e9`, `--optimize-500: #f59e0b`). |
| **Remediation CTA** | `Moving Border` | [Aceternity Moving Border](https://ui.aceternity.com/components/moving-border) | Reserved exclusively for Section 5 `#banner-activate-btn` to maximize C-suite conversion. |
| **Obsidian Card Masking** | `Grid & Dot Backgrounds` | [Aceternity Grid Backgrounds](https://ui.aceternity.com/components/grid-and-dot-backgrounds) | Replicated via pure, lightweight CSS radial gradient masks (zero heavy canvas scripts). |

---

## 3. Strict Governance & Terminology Gates
1. **Terminology Gate:**
   * Use **"AI-Optimized"** strictly for human-centric web audits (Sections 1, 2, 3).
   * Use **"AI-Ready"** strictly for machine manifest checks (Section 4).
2. **Vocabulary Gate:**
   * **Zero occurrences** of the banned phrase `"AI-first"` across all copy, DOM elements, and CSS classes.
3. **Data Integrity:**
   * Pre-scan idle states must render neutral values (`"--"`, `"UNAUDITED"`, neutral dials) with zero fake dummy numbers.
4. **Ergonomic Rule:**
   * Natural document flow with in-page accordions and tables. Zero full-screen modal takeovers for core diagnostics.

---

## 4. Component Architecture & DOM Preservation Rules

### Module 0: Top Scroll Progress Rail & Floating Lateral Dock
* **Top Scroll Progress Bar:** Fixed 1px/2px gradient rail at viewport top (`width: 0% ➔ 100%`).
* **Adaptive Floating Glass Dock (`#floating-glass-dock`):**
  * Preserve 6 anchors:
    * `[ 🔄 Scan ]` $\rightarrow$ `#control-toolbar-anchor`
    * `[ 📊 Summary ]` $\rightarrow$ `#summary-dial-anchor`
    * `[ 1. AI Access ]` $\rightarrow$ `#section-1-card`
    * `[ 2. Content ]` $\rightarrow$ `#citation-readiness-card`
    * `[ 3. Trust ]` $\rightarrow$ `#section-3-card`
    * `[ 4. AI Blueprint ]` $\rightarrow$ `#section-4-card`
    * `[ ⚡ Remediate ]` $\rightarrow$ `#aioptimize-action-banner`
  * Glassmorphic styling: `rgba(15, 23, 42, 0.85)`, `backdrop-filter: blur(12px)`.

### Module 1: Executive Spotlight Hero & Telemetry Cluster
* **Control Toolbar:** Preserve `#control-toolbar-anchor`, `#btn-new-scan`, `#btn-refresh-analysis`, `#btn-export-json`, `#btn-export-pdf`.
* **Telemetry Bubble Bar:** Preserve `#display-scanned-domain`, `#scan-timestamp-badge`, `#scan-duration-badge`, `#scan-pages-badge`.
* **Health Index Dial Gauge:** Preserve `.score-dial-card`, `.dial-svg`, `#score-dial-arc`, `#exec-overall-score`, `#exec-score-classification-pill`, `#exec-score-summary-text`.
* **2x2 Bento Pillar Grid:** Preserve `#pillar-card-1` through `#pillar-card-4` with corresponding score badges (`#pillar-sec1-score` through `#pillar-sec4-score`) and inspection buttons.

### Module 2: Section 1 (AI-Optimized Gateway & Access Gates)
* Preserve `#section-1-card`, `#exec-section1-card`, `#section-1-easy-score-badge`.
* **50/50 Subgrid (`.sec1-subgrid`):** Left column `#sec1-why-matters-box` + Right column `#sec1-protocol-results-container`.
* Protocol rows: `#exec-x-robots-status`, `#exec-robots-txt-status`, `#exec-status-sitemap`.
* Remediation banner: `#sec1-remediation-banner` linking to `optimize.html?section=access`.

### Module 3: Section 2 (AI-Optimized Content & Citation Readiness)
* Preserve `#citation-readiness-card`, `#section-2-card`, `#exec-section2-card`.
* **50/50 Subgrid (`.sec2-subgrid`):** Left column (Essential Business Pages: `#sec2-found-essential-pages`, `#sec2-missing-essential-pages`) + Right column (Citation Authority: `#sec2-faq-status`, `#sec2-parity-value`, `#sec2-org-status`, `#sec2-email-value`, `#sec2-phone-value`).
* **Module 4 In-Page Table:** Full-width container `#sec2-module-4-container`, `#module-4-table`, `#dev-module-4-wrapper`.
* Remediation banner: `#sec2-remediation-container` with trigger `#sec2-remediation-bridge-btn`.

### Module 4: Section 3 (AI-Optimized Brand Trust & E-E-A-T)
* Preserve `#section-3-card`, `#exec-section3-card`, `#section-3-easy-score-badge`.
* **Subgrid (`.sec3-subgrid`):** Left column `#sec3-protocol-results-container` (`#sec3-secure-status`, `#sec3-contact-status`, `#sec3-org-schema-status`, `#sec3-privacy-status`, `#sec3-age-estimate`, `#sec3-authority-status`, `#sec3-diagnostic-summary`) + Right column `#sec3-why-matters-box`.
* Remediation banner: `#sec3-remediation-banner` linking to `optimize.html?section=trust`.

### Module 5: Section 4 (AI-Ready Machine Manifests & 4-Tier Tree)
* Preserve `#section-4-card`, `#exec-section4-card`, `#section-4-easy-score-badge`, `#exec-machine-files-count`.
* **Subgrid (`.sec4-subgrid`):** Left column `#sec4-why-matters-box` (ASCII Circuit Flow) + Right column `#sec4-hierarchy-container` (4-Tier Tree: `#exec-status-robots`, `#exec-status-llms`, `#exec-status-sitemap-tree`, `#exec-status-aicontext`, `#exec-status-readme`, `#exec-status-about`, `#exec-status-docs`, `#exec-status-content`).
* Hidden compatibility element: preserve `<tbody id="exec-machine-files-tbody"></tbody>`.
* Remediation banner: `#sec4-remediation-banner` linking to `optimize.html?section=blueprint`.

### Module 6: Section 5 (High-Urgency Action Banner)
* Preserve `#aioptimize-action-banner`, `.comparison-card.way-hard`, `.comparison-card.way-easy`.
* Action button: `#banner-activate-btn` linking to `optimize.html?section=blueprint` with moving border animation.

---

## 5. Engineering Implementation Checklist

- [ ] **Task 1.1:** Run `npx vitest run` to verify baseline green passes across all 63 tests.
- [ ] **Task 1.2:** Update `frontend/index.css` with Aceternity design tokens, obsidian backgrounds, and glassmorphic utility classes.
- [ ] **Task 1.3:** Implement top scroll progress bar (`#scroll-progress-bar`) and polish `#floating-glass-dock`.
- [ ] **Task 1.4:** Rebuild Hero and 2x2 Bento Summary Grid preserving all data bindings.
- [ ] **Task 1.5:** Polish Sections 1, 2, 3, and 4 subgrids ensuring Module 4 full-width table integrity.
- [ ] **Task 1.6:** Polish Section 5 Action Banner (`#aioptimize-action-banner`).
- [ ] **Task 1.7:** Execute full test suite (`npx vitest run`) to verify 100% green test passes with zero regressions.