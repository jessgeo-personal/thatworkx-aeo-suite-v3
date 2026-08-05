

`AIVisualize` is strictly a **Diagnostic Inspector & Auditor**. It does not create, write, or deploy any manifest files. Instead, it scans the client's live website as-is, evaluates its AEO/GEO readiness, flags DOM/token bloat and missing signals, and gives the user clear, actionable pointers on how to improve visibility on their actual website.

`AIOptimize` is the **Automated Compiler & Remediation Engine** that takes those findings, extracts the underlying data, and generates/deploys the entire machine manifest ecosystem.

Here is the complete architectural specification for **AIOptimize**, detailing all 17 entities, file placements, interconnections, and extraction sources.

---

# `AIOptimize` Technical Architecture & Master Specification

## 1. The 17-Entity AEO Taxonomy

To provide 100% coverage across Google/Gemini Knowledge Graphs, ChatGPT Search, Perplexity, Claude, and Copilot, `AIOptimize` manages 17 distinct entity types:

```
1. Organization              7. About                  13. Product / Service / Offer
2. LocalBusiness             8. FAQPage                14. MerchantReturnPolicy & Shipping
3. Person (Execs/Authors)    9. HowTo                  15. AggregateRating & Review
4. ProfilePage              10. TechArticle / API      16. BreadcrumbList & PageTypes
5. ContactPoint             11. Posts / Articles / News17. Event
6. Website                  12. SoftwareApplication

```

---

## 2. File Mapping: Which File Contains What?

`AIOptimize` compiles extracted data across **5 distinct output surfaces**:

| Surface / File | Format | Primary Purpose & Contents | Token Target |
| --- | --- | --- | --- |
| **On-Page `<script>**` | `JSON-LD` | <br>**Knowledge Graph Verification:** `Organization`, `LocalBusiness`, `Person`, `ContactPoint`, `AggregateRating`, `Offer`, `BreadcrumbList`.

 | N/A (Machine-only) |
| **Level 1: `/robots.txt**` | Plain Text | <br>**Protocol Gate:** Explicit crawler permissions (`OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`).

 | ~50 tokens |
| **Level 2: `/llms.txt**` | Markdown | <br>**Directory Index:** Clean Markdown map listing links to Level 3 and Level 4 files with 1-line descriptions.

 | ~150–300 tokens |
| **Level 3: `/ai-context.md**` | Markdown | <br>**Executive Blueprint Manifest:** Master summary containing brand vision, core offerings, key terminology, pricing rules, global return policies, and authority signals.

 | ~500–1,200 tokens |
| **Level 4 Workspaces** | Markdown | <br>**Granular Deep Context:** Individual workspace files (`about.md`, `faq.md`, `docs.md`, `products.md`, `how-to.md`).

 | ~300–800 tokens per file |

---

## 3. How the Ecosystem is Interconnected

All 5 surfaces act as **reflections of One Core Brand Truth Sheet** to enforce zero anti-cloaking penalties and ensure maximum token efficiency:

```
                     ┌──────────────────────────────────────────────┐
                     │          ONE CORE BRAND TRUTH SHEET          │
                     │    (Parsed from Website / Reviewed by User)  │
                     └──────────────────────┬───────────────────────┘
                                            │ Auto-Compiles
         ┌──────────────────────────────────┼──────────────────────────────────┐
         ▼                                  ▼                                  ▼
 ┌───────────────┐                  ┌───────────────┐                  ┌───────────────┐
 │  JSON-LD      │                  │  Level 2      │                  │  Level 3      │
 │  Schema Script│                  │  /llms.txt    │                  │ /ai-context.md│
 └───────┬───────┘                  └───────┬───────┘                  └───────┬───────┘
         │                                  │                                  │
         │ Linked via                       │ Points to                        │ Summarizes
         │ @id URIs                         │ Markdown Links                   │ & Indexes
         ▼                                  ▼                                  ▼
 ┌─────────────────────────────────────────────────────────────────────────────────────┐
 │                         LEVEL 4 GRANULAR WORKSPACES                                 │
 │  /about.md   │   /faq.md   │   /docs.md   │   /products.md   │   /how-to.md        │
 └─────────────────────────────────────────────────────────────────────────────────────┘

```
* **`/llms.txt` Index:** Points AI crawlers directly to `/ai-context.md` and Level 4 files.
* **`/ai-context.md`:** Serves as a single-file summary for heavy reasoning agents (ChatGPT, Claude), linking down to specific Level 4 files for deep technical details.
* **JSON-LD `@id` Bridges:** Each JSON-LD entity includes an `@id` property (e.g., `"@id": "https://example.com/#organization"`) referenced in the Markdown manifests to establish entity consensus.
---
## 4. Automated Extraction Matrix (Where Information is Scraped From)

When `AIVisualize` pre-scans a domain, `AIOptimize` uses this matrix to automatically pull data from the existing visual website so the user doesn't have to enter it manually:

| Entity Type | Scraped Source Location on Target Site | Extraction Selector / Logic |
| --- | --- | --- |
| **`Organization` / `LocalBusiness**` | Footer, `/about`, `/contact` pages | HTML `<address>`, footer text, meta tags, and copyright notices.

 |
| **`Person` / `ProfilePage**` | `/about`, `/team`, author bio boxes | Header tags (`<h1>`/`<h2>`), author avatars, and social profile links (`linkedin.com/in/*`).

 |
| **`ContactPoint`** | Header, Footer, `/contact` page | Regex matching for `mailto:`, `tel:`, and support form endpoints.

 |
| **`FAQPage`** | `/faq`, product accordion HTML | <br>`<h2>`/`<h3>` question headings paired with adjacent `<p>` or `<div>` accordion panels.

 |
| **`HowTo`** | Blog posts, support pages | Ordered lists (`<ol>`), step-by-step headings (`Step 1: ...`), and duration estimates.

 |
| **`TechArticle` / `APIReference**` | `/docs`, `/developers`, or linked PDFs | Code block wrappers (`<pre><code>`), endpoint tables, or text extracted from binary PDFs.

 |
| **`Product` / `Offer` / `Service**` | `/products/*`, `/services/*` | OpenGraph tags (`og:price:amount`), microdata, price tags (`$`), and Add-to-Cart forms.

 |
| **`MerchantReturnPolicy` & `Shipping**` | `/shipping`, `/returns`, footer links | Keyword matching ("30-day refund", "Free shipping over $50") on policy pages.

 |
| **`AggregateRating` & `Review**` | Product pages, review widgets | Star rating SVGs, numerical text (e.g., `4.8/5`), review counts, and links to Trustpilot/G2.

 |
| **`BreadcrumbList` & PageTypes** | Top navigation bar, URL paths | Parent-child link lineage (`Home > Catalog > Item`) and URL route depth.

 |

---

## 5. Re-Confirming `AIVisualize` vs. `AIOptimize`

| Capability | `AIVisualize` (Audit) | `AIOptimize` (Remediation) |
| --- | --- | --- |
| Crawls site & inspects 32 capabilities 

 | **YES** | **YES** |
| Generates Overall AEO Score & Section Ratings 

 | **YES** | **NO** |
| Provides actionable advice for fixing visual pages & HTML 

 | **YES** | **NO** |
| Auto-prepopulates the "Brand Truth Sheet" 

 | **NO** | **YES** |
| Compiles `/llms.txt`, `/ai-context.md`, & Level 4 `.md` files 

 | **NO** | **YES** |
| Deploys files via Cloudflare Edge Worker / CMS files 

 | **NO** | **YES** |

This clean split ensures `AIVisualize` remains lightweight and operational right now, while `AIOptimize` serves as the high-value upgrade tier!

Yes, your assessment of **AIVisualize** is **100% accurate**.

`AIVisualize` is strictly a **Diagnostic Inspector & Auditor**. It does not create, write, or deploy any manifest files. Instead, it scans the client's live website as-is, evaluates its AEO/GEO readiness, flags DOM/token bloat and missing signals, and gives the user clear, actionable pointers on how to improve visibility on their actual website.

`AIOptimize` is the **Automated Compiler & Remediation Engine** that takes those findings, extracts the underlying data, and generates/deploys the entire machine manifest ecosystem.

Here is the complete architectural specification for **AIOptimize**, detailing all 17 entities, file placements, interconnections, and extraction sources.

---

# `AIVisualize` Technical Architecture & Master Specification

Here is the master specification for **`AIVisualize`**. It is designed as a standalone, read-only AEO/GEO Diagnostic Inspector and Auditor that evaluates a live website as-is without generating, writing, or deploying any files.

---

## 1. Product Identity & Core Purpose

* **Role:** Read-Only Diagnostic Inspector & AI Visibility Auditor.
* **Core Function:** Crawls a live domain, inspects 32 capabilities across 17 entity types, evaluates token density and DOM noise, and generates an actionable AEO/GEO Diagnostic Report.
* **Operational Constraint:** **Zero file creation, zero code mutation, and zero server modifications**. It strictly reports what exists, what is broken, and what is missing.
---

## 2. The 32-Capability Audit Engine (The 4 Core Sections)

`AIVisualize` evaluates site health across 4 core sections, weighted equally at 25% each to calculate the **Overall AEO Score (0–100)**:

```
                                  AIVisualize Score (100%)
                                             │
      ┌──────────────────────┬───────────────┴───────────────┬──────────────────────┐
      ▼                      ▼                               ▼                      ▼
Gateway Access (25%)   Presence Hygiene (25%)   Content AI Readiness (25%)   Machine Manifests (25%)

```

### Section 1: Gateway Access & Crawler Permissions (25% Weight)
* **Robots.txt AI Bot Access:** Checks explicit `Allow`/`Disallow` rules for search crawlers (`OAI-SearchBot`, `PerplexityBot`, `ClaudeBot`, `Bingbot`, `Googlebot`).
* **WAF & Edge Gateways:** Detects Cloudflare/Akamai HTTP `403` or `429` rate-limit blocks on AI user agents.
* **Hydration Traps (CSR vs. SSR):** Identifies client-side Single Page Application (SPA) rendering traps where core content is missing from initial HTTP static HTML payloads.

### Section 2: Presence Hygiene & Authority Signals (25% Weight)
* **E-E-A-T Contact Signals:** Scans root, `/about`, and `/contact` pages for verified telephone numbers, physical addresses, and support email endpoints.
* **Social & Entity Consensus:** Detects `sameAs` outbound authority links pointing to LinkedIn, Wikidata, Wikipedia, and official corporate profiles.
* **Legal & Trust Pages:** Verifies existence and crawlability of Privacy Policy, Terms of Service, and Copyright notices.

### Section 3: Content AI Readiness & Token Efficiency (25% Weight)
* **Direct Answer Snippets:** Scans `<h1>` and `<h2>` elements for concise 40–60 word bold direct definitions placed immediately below headings.
* **DOM Noise-to-Signal Ratio:** Measures token waste burned on navigation menus, footers, inline SVGs, and layout containers versus actual text content.
* **Structured Q&A & Accordions:** Identifies raw HTML FAQ headings and text accordions available for RAG extraction.
* **Heading Hierarchy Integrity:** Validates logical nesting (`H1` $\rightarrow$ `H2` $\rightarrow$ `H3`) with zero skipped levels.

### Section 4: Machine Manifest Readiness (25% Weight)
* **Level 1 Protocol Gate:** Checks presence and valid syntax of `/robots.txt`.
* **Level 2 Welcome Mat:** Audits `/sitemap.xml` (valid route count) and `/llms.txt` (valid Markdown index links).
* **Level 3 Blueprint Manifest:** Audits `/ai-context.md` for core brand summary and system overview.
* **Level 4 Granular Workspaces:** Checks presence of `/about.md`, `/docs.md`, `/faq.md`, and `/content.md`.
* **JSON-LD Schema Coverage:** Audits presence of valid `Organization`, `LocalBusiness`, `Product`, `FAQPage`, and `BreadcrumbList` script tags.
---
## 3. The 17-Entity Inspection Framework

During a scan, `AIVisualize` inspects live HTML, headers, and metadata to verify if these 17 entities are present, complete, and properly structured:
| Category | Entities Inspected on Live Domain | What `AIVisualize` Audits |
| --- | --- | --- |
| <br>**Brand & Local** 

 | <br>`Organization`, `LocalBusiness`, `Website`, `ContactPoint` 

 | Scans for legal name, logo, phone, address, support emails, and schema blocks.

 |
| <br>**Authority & People** 

 | <br>`Person`, `ProfilePage` 

 | Scans `/about` and team pages for founder/author names, bios, and LinkedIn profile links.

 |
| <br>**Content & Knowledge** 

 | <br>`About`, `FAQPage`, `HowTo`, `TechArticle`, `Posts/Articles/Docs` 

 | Scans for Q&A accordions, step-by-step guides, code blocks, and documentation routes.

 |
| <br>**Products & Offers** 

 | <br>`Product`, `Service`, `Offer`, `MerchantReturnPolicy`, `OfferShippingDetails` 

 | Scans product pages for price, currency, stock status, GTIN/SKU, shipping, and return policies .

 |
| <br>**Trust & Social Proof** 

 | <br>`AggregateRating`, `Review` 

 | Detects star rating text, numerical scores, review counts, and links to Trustpilot/G2.

 |
| <br>**Site Structure** 

 | <br>`BreadcrumbList`, `Pagelinks`, `CollectionPage` 

 | Audits parent-child link lineages and distinguishes standalone pages from category indexes.

 |

---
## 4: `AIVisualize` Scanning Pipeline

Here is the cleaned-up, accurate pipeline definition for `AIVisualize` with **all headless references completely purged**:

```
User Enters URL ──► POST /api/scan ──► Check Tier Limits ──► Split Pipeline:
                                                                ├── Pages <= 25: Synchronous Return (< 5s)
                                                                └── Pages > 25: Progressive Queue (Async)

```
* **Synchronous Threshold ($\le 25$ Pages):** Sites with 25 pages or fewer are crawled 100% synchronously via raw HTTP fetches in under 5 seconds. No background jobs or browser processes are created.
* **Progressive Queue ($> 25$ Pages):** For deep scans (26 to 100 pages), the server returns the first 25 pages instantly with `status: "processing_remainder"` and a `jobId`. The frontend renders the dashboard immediately while polling `GET /api/scan/status/:jobId` every 3 seconds for pages 26+.
* **Page-Level AbortController Timeout (3.5s):** Every individual static page fetch has a strict 3.5-second timeout. If a server/CDN hangs, it is recorded as `{ status: "failed", error: "heavy_page_timeout" }` without stalling the scan batch.
---
## 5. Dual-Mode Reporting Engine

`AIVisualize` renders findings through two tailored view modes driven by URL parameters (`?mode=executive` vs. `?mode=developer`):

```
                                    POST /api/scan Response
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
             mode=executive (Default)                         mode=developer (DIY)
  ┌────────────────────────────────────────┐       ┌────────────────────────────────────────┐
  │ • Overall AEO Score & Section Ratings  │       │ • Raw HTTP Status & Response Time (ms) │
  │ • Business Risk Warnings (Plain English)│       │ • Raw JSON-LD Schema Validation        │
  │ • E-E-A-T Contact Authority Signals   │       │ • Exact DOM Token Density & Noise      │
  │ • Printable Executive Summary PDF      │       │ • Missing File Route Lists & Headers   │
  └────────────────────────────────────────┘       └────────────────────────────────────────┘

```

---

## 6. Hand-off Payload to `AIOptimize`
When a user completes an `AIVisualize` scan and decides to upgrade or remediate their site, `AIVisualize` exports its structured extraction payload.
`AIOptimize` ingests this exact payload to pre-populate the **Brand Truth Sheet**, ensuring the user never has to re-type a single detail manually!
---
### Summary Comparison Table

| Dimension | `AIVisualize` (Inspector) | `AIOptimize` (Compiler) |
| --- | --- | --- |
| **Primary Goal** | Inquire & Diagnose 

 | Treat & Remediate 

 |
| **Server Action** | Read-Only Scan 

 | Write & Deploy Files 

 |
| **Output Deliverable** | Diagnostic Dashboard & Score Report 

 | <br>`/llms.txt`, `/ai-context.md`, `.md` workspaces, & JSON-LD 

 |
| **User Interaction** | Types URL $\rightarrow$ Views Audit 

 | Reviews Pre-populated Data $\rightarrow$ Clicks 1-Click Deploy 

 |

This domain-bound credit model is a **masterclass in Business UX and anti-abuse product design**.

By tying the credit pass directly to a specific domain (e.g., `www.example.com`) with a time/scan cap (e.g., up to 100 scans or 7 days, whichever comes first), you solve two major operational problems:

1. **Prevents Scraping Abuse:** An agency or user cannot buy a cheap $3.99 pass and run 100 scans across 100 different competitor sites.
2. **Encourages Iteration During Sprints:** It gives the user a 7-day "sandbox window" to make tweaks on their site and re-scan `www.example.com` multiple times to watch their AEO score improve.

---

## 7. Refining the Product Scope & Developer JSON Decision fir AIVisualize

Your decision on the Developer JSON payload is 100% correct:

* **Executive PDF (Included in Pass):** The primary deliverable for non-technical buyers. It translates the 32 capabilities into plain-English business risk summaries.
* **Lightweight Diagnostic JSON (Included in Pass):** Instead of generating bloated 17-entity JSON-LD scripts that business users will never paste into their HTML , this JSON file is strictly a **diagnostic log** (listing URL routes, HTTP status codes, missing headers, and error flags) meant for developers or CI/CD pipelines.
* **Full JSON-LD Schema Compilation:** Saved exclusively as a core feature inside **`AIOptimize`**.
---
## 8. The Upsell Bridge: How `AIVisualize` Sells `AIOptimize`

To convince a business owner that their existing website (and any basic files they already have) is insufficient, the `AIVisualize` dashboard and Executive PDF report must present a clear **"AI Coverage Gap Analysis."**

At the bottom of every `AIVisualize` audit, we insert a dedicated **Remediation & Upsell Section**:
---

### 📍 The Executive Report Upsell Section (Mockup / Spec)

```
┌────────────────────────────────────────────────────────────────────────┐
│ ⚠️ AI ENGINE COVERAGE GAP DETECTED FOR EXAMPLE.COM                    │
├────────────────────────────────────────────────────────────────────────┤
│ Your current website setup only supplies 25% of the machine data       │
│ required by ChatGPT, Perplexity, Claude, and Gemini to recommend your  │
│ brand.                                                                 │
│                                                                        │
│ [x] Human Layer (Visual HTML)    ──► 100% Complete                     │
│ [ ] Machine Index (/llms.txt)     ──► MISSING (AI crawlers timeout)    │
│ [ ] System Blueprint (/ai-context)──► MISSING (LLMs default to rivals) │
│ [ ] Entity Schema (JSON-LD)      ──► 3 of 17 Entities Verified         │
│                                                                        │
│ ---------------------------------------------------------------------- │
│ WHY YOUR EXISTING WEBSITE ISN'T ENOUGH:                                │
│ 1. Token Noise Penalty: Your HTML DOM burns ~2,400 tokens per page on  │
│    menus and CSS wrappers. AI bots drop these pages to save compute.   │
│ 2. Missing Context Maps: Without /ai-context.md, reasoning agents       │
│    hallucinate or skip your product pricing during search queries.     │
│ 3. Synchronization Risk: Updating HTML without updating schema causes   │
│    anti-cloaking penalties that suppress your search recommendations. │
│                                                                        │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🚀 RESOLVE ALL GAPS IN 60 SECONDS WITH AIOPTIMIZE                 │ │
│ │                                                                    │ │
│ │ We have already extracted your site data during this scan. Click   │ │
│ │ below to review your pre-populated Brand Truth Sheet and deploy    │ │
│ │ your full machine manifest layer instantly.                        │ │
│ │                                                                    │ │
│ │ [ UPGRADE TO AIOPTIMIZE — 1-CLICK AUTO-DEPLOY ($19/MO) ]            │ │
│ └────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘

```

---

## 9. The 3 Core Arguments to Justify the `AIOptimize` Upgrade
When business users ask: *"Why do I need `AIOptimize` if I already have a website?"*, these are the three clear, logical pillars we present in the report:

### Pillar A: The Token Density Gap (Speed & Cost for AI)
* **The Reality:** A standard website burns 2,000+ tokens per page on navigation bars, footer links, popups, and CSS styling wrappers.
* **The Problem:** AI engines (like ChatGPT Search, Claude, and Perplexity) operate on strict token budgets. If a page is too noisy, the crawler truncates the content or skips the site entirely.
* **The `AIOptimize` Value:** Automatically compiles unstyled, 100% clean Markdown manifests (`/llms.txt` and `/ai-context.md`) that AI crawlers parse in 50 milliseconds at 10x lower token cost.

### Pillar B: The 17-Entity Coverage Gap (Deep Business Intricacies)
* **The Reality:** A standard website usually only displays basic text or simple contact info.
* **The Problem:** AI engines need 17 distinct structured entities (E-E-A-T credentials, return policies, shipping specs, step-by-step How-Tos, API references, and product SKUs) to feel confident recommending a business.
* **The `AIOptimize` Value:** Generates and links all 17 entity structures automatically without touching a single line of website code.

### Pillar C: The "Set and Forget" Sync Insurance
* **The Reality:** Whenever a business owner updates their phone number, pricing, or product list on their website, they forget to update their underlying schema or text files.
* **The Problem:** Data discrepancies between visible HTML and machine files trigger **Anti-Cloaking Penalties**, causing search engines to flag the brand as unreliable.
* **The `AIOptimize` Value:** Serves as a single-source compiler. Update a detail once in the dashboard, and `AIOptimize` keeps all 5 machine surfaces in 100% sync automatically.

---

## Summary of Product Model Alignment
1. **`AIVisualize Free`:** 3-page scan, basic score on screen (Lead Generator).
2. **`AIVisualize Domain Pass` ($3.99 one-time):** Bound to `www.example.com` for 7 days / up to 100 scans. Unlocks full 40-page progressive scan, Executive PDF report, and lightweight diagnostic JSON.
3. **`AIOptimize Subscription` ($19–$49/mo):** Converts the extracted `AIVisualize` audit into a 1-click auto-compiled Brand Truth Sheet, deploying `/llms.txt`, `/ai-context.md`, and complete Schema surfaces to keep the business visible across all AI search engines.