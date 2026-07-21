# 📜 THATWORKX AEO SUITE: SEMANTIC CHANGELOG

All notable code changes, schema definitions, and infrastructure updates will be documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/), adhering to Semantic Versioning.

## [Unreleased] - Sprint 5 (Level 2 Content Density, JS Hydration & AIOptimize Teaser)

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
