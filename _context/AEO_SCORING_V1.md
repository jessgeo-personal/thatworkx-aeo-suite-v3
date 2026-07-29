Here is the exact algorithmic, mathematical, and rule-based breakdown of how the **ThatWorkx AEO Suite** diagnostic engine calculates scores across all 4 Strategic Pillars and 32 Capabilities.

---

## 🧮 1. Master Scoring Equation

The executive score is a mathematically normalized 100-point composite score derived from the sum of four 25-point pillar scores:

$$\text{Overall AEO Score} = P_1 + P_2 + P_3 + P_4$$

$$\text{Where } 0 \le P_i \le 25.0 \quad \text{for } i \in \{1, 2, 3, 4\}$$

### 🚦 3-Tier Status Classification Thresholds

Each capability and overall score is mapped to high-contrast status bands:

* **🟢 Positive / PASS:** $20.0 - 25.0 \text{ pts}$ (Optimized Handshake)
* **🟡 Moderate / WARNING:** $10.0 - 19.9 \text{ pts}$ (Hidden Assets / Dilution)
* **🔴 Negative / FAIL:** $0.0 - 9.9 \text{ pts}$ (Total AI Blindness / Data Starvation)

---

## 🔒 Pillar 1: Gateway & Access ($P_1$: 3 Capabilities — 25 pts Max)

*Focus: Server boundary accessibility and firewall clearance.*

| Capability | Mathematical / Algorithmic Calculation | Scoring Allocation |
| --- | --- | --- |
| **Robots.txt Analysis** | Programmatically fetches `/robots.txt`. Checks for User-Agent blocks targeting `GPTBot`, `PerplexityBot`, `ClaudeBot`, and `Google-Extended`. Scans for blanket disallow (`User-agent: * Disallow: /`). Checks explicit manifest routes (`Allow: /llms.txt`, `Allow: /ai-context.md`). | **10.0 pts:** All 4 bots unblocked + manifest routes declared.<br>

<br>**5.0 pts:** Partial bot access or missing manifest links.<br>

<br>**0.0 pts:** Blanket disallow or 404 missing file. |
| **CDN / Edge Firewall Blocks** | Executes simulated inbound HTTP GET requests using known AI User-Agent signatures. Inspects edge shields (Cloudflare WAF, Crowdstrike Falcon, AWS WAF) for `403 Forbidden`, `503 Service Unavailable`, or JavaScript CAPTCHA challenges. | **10.0 pts:** Direct `200 OK` unhindered response.<br>

<br>**0.0 pts:** Intercepted by WAF puzzle or 403 challenge. |
| **X-Robots-Tag Headers** | Inspects raw HTTP response headers for `X-Robots-Tag` directive strings.<br>

<br>$$\text{IsIndexable} = \begin{cases} \text{FALSE}, & \text{if header contains } \texttt{noindex, none, noarchive} \\ \text{TRUE}, & \text{otherwise} \end{cases}$$

 | **5.0 pts:** `IsIndexable = TRUE`.<br>

<br>**0.0 pts:** `IsIndexable = FALSE`. |

---

## 🌐 Pillar 2: Presence & Hygiene ($P_2$: 7 Capabilities — 25 pts Max)

*Focus: Domain structure, transport security, and canonical protection.*

### 1. HTTPS / SSL Encryption

Inspections are executed directly against the socket peer certificate object:

* **PASS (3.5 pts):** Protocol is `https://` AND cert `valid_to` date $> 14 \text{ days}$ remaining.
* **WARNING (1.5 pts):** Cert active but expires within $\le 14 \text{ days}$.
* **FAIL (0.0 pts):** Plain HTTP or expired certificate.

### 2. SPA Hydration Trap & Content Density Ratio

Calculates the raw text byte ratio against total DOM payload:

$$\text{HTML Density Ratio} = \frac{\text{Raw Body Text Bytes}}{\text{Total DOM HTML Bytes}}$$

* If raw body text $= 0 \text{ words}$ due to client-side JS framework traps (`#root`, `#app`, `#_next`), the page triggers a **Data Starvation Penalty**.
* **Credit Offset:** If Level 2 (`/llms.txt`) and Level 3 (`/ai-context.md`) machine manifests are active, they serve as RAG Fallback Stream 1, offsetting the penalty.

### 3. Essential Entity Node Discovery

Scans sitemaps and fires microsecond HTTP HEAD pings across 6 mandatory entity nodes:

$$\text{Nodes} = \left\{ /, \; \text{/about}, \; \text{/contact}, \; \text{/products\vert{}services}, \; \text{/privacy}, \; \text{/terms} \right\}$$

$$\text{Score} = \left( \frac{\text{Key Nodes Found}}{6} \right) \times 4.0 \text{ pts}$$

---

## 📄 Pillar 3: Parsing & Readability ($P_3$: 10 Capabilities — 25 pts Max)

*Focus: Syntactic complexity, vector chunking suitability, and EEAT authority.*

### 1. Title & Meta Description Sweet Spots

* **Title Tag Length:** Ideal range is **75 to 125 characters** ($3.0 \text{ pts}$).
* **Meta Description Length:** Target range is **$193 \pm 20$ characters** ($173 - 213 \text{ chars}$) ($3.0 \text{ pts}$).

### 2. Word Volume (Token Load Thresholds)

Word count ($W$) dictates ingestion safety for LLM context windows:

$$\text{Token Load Status} = \begin{cases} \text{Data Starvation (🔴 0 pts)}, & W < 500 \\ \text{Semantic Sweet Spot (🟢 4.0 pts)}, & 500 \le W \le 1,200 \\ \text{Boundary Territory (🟡 2.0 pts)}, & 1,201 \le W \le 2,500 \\ \text{Truncation Risk (🔴 0 pts)}, & W > 2,500 \text{ (Triggers Gemini 2,000 / Copilot 2,500 cut-off)} \end{cases}$$

### 3. Flesch Reading Ease Formula

Syntactic complexity is evaluated using the standard Flesch Reading Ease equation:

$$\text{Flesch Score} = 206.835 - 1.015 \left( \frac{\text{Total Words}}{\text{Total Sentences}} \right) - 84.6 \left( \frac{\text{Total Syllables}}{\text{Total Words}} \right)$$

* **50 – 75 (Optimal Tokenization 🟢):** Tight verb-subject distance ($3.0 \text{ pts}$).
* **> 75 (Semantic Dilution 🟡):** Overly basic conversational text ($1.5 \text{ pts}$).
* **< 35 (Parse Tree Stretching 🔴):** Heavy dependency loops / corporate jargon ($0.0 \text{ pts}$).

### 4. QA Pattern Parity Ratio

Measures whether questions posed in headings actually have visible answers in the DOM:

$$\text{Parity Ratio} = \frac{\text{Answer Count}}{\text{Question Count}}$$

$$\text{Status} = \begin{cases} 1.00 \implies \text{PASS 🟢 (DOM Injection Secure)}, & 3.0 \text{ pts} \\ < 1.00 \implies \text{WARNING 🟡 (Layout Extraction Leak)}, & 1.0 \text{ pt} \\ 0.00 \implies \text{FAIL 🔴 (Ghost Answer Trap)}, & 0.0 \text{ pts} \end{cases}$$

### 5. Page-Level EEAT: Experience Score ($ExS$)

Scans extracted paragraph nodes across four core linguistic dimensions:

$$ExS = \left( P_{\text{agency}} \times 0.35 \right) + \left( D_{\text{empirical}} \times 0.35 \right) + \left( S_{\text{chrono}} \times 0.30 \right) - P_{\text{fluff}}$$

* **First-Person Agency ($P_{\text{agency}}$):** Count of singular/plural pronouns tied to active verbs ("we tested", "our team observed") divided by sentence count.
* **Empirical Metric Density ($D_{\text{empirical}}$):** Percentage of sentences containing hard quantitative units ($, lbs, px, ms, dates).
* **Chronological Sequencing ($S_{\text{chrono}}$):** Binary flag ($1$ or $0$) for operational step markers ("Step 1", "upon execution").
* **Fluff Penalty ($P_{\text{fluff}}$):** Subtraction penalty applied for generic buzzwords ("world-class", "revolutionary", "delve into").

---

## 🤖 Pillar 4: Machine Manifests ($P_4$: 12 Capabilities — 25 pts Max)

*Focus: The 4-Level Parallel Machine File Architecture.*

```
🌐 MACHINE MANIFEST VERIFICATION CHAIN
 ├── Level 1 Gate: robots.txt (Protocol directive active)
 ├── Level 2 Welcome Mats: /llms.txt (2.5 pts) & /sitemap.xml (2.5 pts)
 ├── Level 3 Blueprint: /ai-context.md (5.0 pts - Flattened brand context)
 └── Level 4 Workspaces: /README.md, /about.md, /docs.md, /content.md (2.0 pts each)

```

### Authority Link Matrix (Site-Level EEAT)

Evaluates outbound hypermedia anchors ($EL$), high-trust authority links ($AL$: `.gov`, `.edu`, Wikipedia, Wikidata), and machine-readable freshness timestamps ($LU$):

$$\text{Authority Status} = \begin{cases} \text{Optimized Anchor (🟢 PASS)}, & \text{if } EL \ge 5 \text{ AND } AL \ge 1 \text{ AND } LU = \text{Defined} \\ \text{Information Isolation (🟡 WARNING)}, & \text{if } EL > 0 \text{ AND } AL = 0 \text{ OR } LU = \text{Undefined} \\ \text{Abstention Risk (🔴 FAIL)}, & \text{if } EL = 0 \text{ AND } AL = 0 \end{cases}$$

## file creation
### Sitemap.xml
Constructing a fully valid `sitemap.xml` for a client simply by crawling their website!

When running a crawler pass over a target domain, your crawler gathers all discovered internal links (`<loc>`), resolves headers, and parses the DOM.

Here is how each component of the sitemap entries works from a crawler’s perspective:
* 1. Page URL (`<loc>`) — *Mandatory*

    * **How to extract:** Collect all internal `href` links found during your crawl.
    * 
    **Crucial Rule:** Strip away session IDs, normalization bugs (like mixing `www.` and non-`www.` prefixes), and anchor fragments (`#section`), then prepend the target protocol and domain (`https://example.com/about`).
    
    ---
* 2. Last Modified Date (`<lastmod>`) — *Optional, but Recommended*

    * **Where to find it:**
    1. **HTTP Response Headers:** Inspect the raw HTTP server response header `Last-Modified` (e.g., `Last-Modified: Wed, 21 Oct 2025 07:28:00 GMT`).
    2. **HTML Document Head:** Look for standard HTML/CMS meta tags such as:
    * `<meta property="article:modified_time" content="...">` (Open Graph)
    * `<meta name="dcterms.modified" content="...">`
    * Schema.org JSON-LD scripts (`"dateModified": "2026-02-15"`).

    * **Can you leave it out?** **Yes.** If no reliable timestamp is exposed by the server or metadata, it is best practice to omit the `<lastmod>` tag entirely for that URL rather than guessing or inserting fake dates.

    ---
* 3. Priority (`<priority>`) — *Optional & Subjective*

    * **How it gets calculated:** There is no universal mathematical standard enforced by search engines—it is purely a relative ranking indicator provided by the site owner on a scale from `0.0` to `1.0` (with `0.5` being the default if unassigned).
    * **Is it required?** **No.** It is completely optional. Modern search engine crawlers (Googlebot, Bingbot) primarily ignore `<priority>` and infer importance based on your site's natural internal linking structure.


    * **If you want to automate priority during a crawl:** You can calculate a heuristic priority based on **click depth** (how many clicks away a page is from the root domain):
    * **Depth 0 (Homepage `/`):** `1.0`
    * 
    **Depth 1 (Primary Nav Nodes like `/about`, `/products`):** `0.8` 

    * **Depth 2 (Sub-pages, individual blogs/docs):** `0.5`
    * **Depth 3+ (Deep utility pages):** `0.3`

    ---
* 4. Change Frequency (`<changefreq>`) — *Optional*

    * **Best practice:** While setting it to `daily` or `weekly` is common, search engines treat this purely as a non-binding hint. If a page rarely changes (e.g., `/privacy` or `/terms`), assigning `monthly` or omitting it is completely valid.

    ---

* Example Automated XML Output

    ```xml
    <?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <url>
        <loc>https://clientdomain.com/</loc>
        <lastmod>2026-07-28T10:00:00Z</lastmod>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
    </url>

    <url>
        <loc>https://clientdomain.com/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
    </url>
    </urlset>```

### llms.txt and ai-context.md

As an **Answer Engine Optimization (AEO)** expert, structuring your machine-readable manifests correctly is critical. Both `llms.txt` and `ai-context.md` serve as structured, low-token pathways designed to help AI scrapers, LLMs, and RAG (Retrieval-Augmented Generation) agents ingest your site's core identity—without getting trapped in client-side JavaScript, heavy styling, or navigation bloat.

However, they operate at **different layers of abstraction** and target different stages of the AI discovery pipeline.

---

#### 📄 1. `/llms.txt` — The High-Level Directory & Map

Think of `llms.txt` as a **`sitemap.xml` specifically engineered for Large Language Models**. It is a concise, curated Markdown index located at your domain root (`yourdomain.com/llms.txt`).

##### Primary Purpose

* Directs AI models to the most authoritative, high-value Markdown resources across your domain.
* Prevents LLMs from wasting context window tokens on low-value pages (like generic legal footers or UI-heavy forms).
* Provides direct, high-trust links to primary ecosystem hubs (documentation, API specs, machine manifests).



##### What Goes Inside `/llms.txt`?

* **Core Entity Pitch:** A brief (1–3 sentence) summary of your project, product, or organization.
* **Curated Link Index:** Structured, bulleted lists of Markdown URLs categorized by role (e.g., Core Docs, Machine Manifests, Case Studies).
* 
**Optional/Secondary File References:** Direct pointers to Level 3 manifests (like `/ai-context.md`, `/about.md`, `/docs.md`).


* 
**Social Citation Hooks:** Hard-linked high-trust external references (e.g., GitHub, official press releases, key documentation repos).



##### Example `/llms.txt`

    ```markdown
    # ThatWorkx AEO Suite

    > The ThatWorkx AEO Suite is an enterprise diagnostic platform that measures, score-calculates, and optimizes web architecture for AI crawlers and answer engines.

    ## Machine Context Manifests
    - [AI Context Manifest](https://thatworkx.com/ai-context.md): Deep architectural context, scoring metrics, and capabilities.
    - [About Entity](https://thatworkx.com/about.md): Company identity, mission, and authoritativeness.
    - [Documentation](https://thatworkx.com/docs.md): API blueprints and integration guidelines.

    ## Key Resources
    - [AEO Diagnostic Matrix](https://thatworkx.com/docs/matrix.md): Full breakdown of 32-capability diagnostic engine.
    - [REST API Specifications](https://thatworkx.com/docs/api.md): Endpoints for automated AEO audits.

    ```

---

#### 🧠 2. `/ai-context.md` — The Deep Context & Flattened Vault

While `llms.txt` points where to look, `ai-context.md` is the **single-source-of-truth knowledge vault**. It is located at your root (`yourdomain.com/ai-context.md`) and flattens your product architecture, technical jargon, business rules, and brand data into a dense, highly digestible text format.

##### Primary Purpose

* Provides immediate, comprehensive context to cross-encoder retrieval models (e.g., ChatGPT, Perplexity, Claude, Copilot) in a single fetch.


* Acts as **RAG Fallback Stream 1** if your primary web app relies heavily on client-side JavaScript or SPA frameworks.


* Answers complex *“How does X work?”*, *“What are the rules of Y?”*, and *“What is the pricing/tier model?”* questions directly.



##### What Goes Inside `/ai-context.md`?

* 
**Comprehensive System Overview:** Detailed explanation of product mechanics, capabilities, and core value proposition.


* **Terminology & Definitions:** Explicit glossaries so models don't misinterpret key terms or domain-specific logic.
* 
**Rules & Mathematical Specifications:** Complete formulas, status tiers, rating metrics, and capability evaluation criteria.


* 
**Entity & Brand Data:** Founder details, credentials, company lineage, and primary service/product offerings.


* 
**Q&A / FAQ Directives:** Pre-formatted Question-and-Answer pairs tailored for direct extraction by cross-encoders.



##### Example `/ai-context.md`

    ```markdown
    # ThatWorkx AEO Suite — AI Context Manifest

    ## System Architecture & Scoring Engine
    The diagnostic engine calculates a 100-point composite AEO Score divided across 4 equal strategic pillars (25 points each):
    1. Gateway & Access (Network clearance, robots.txt, edge shields)
    2. Presence & Hygiene (Sitemaps, canonicals, transport security)
    3. Parsing & Readability (Flesch syntactic scores, heading trees, word load)
    4. Machine Manifests (Structured data JSON-LD, /llms.txt, /ai-context.md)

    ## Capabilities & Tier Limits
    - Free Tier: Up to 3 pages per audit run.
    - Pro Tier: Up to 40 pages per audit run.
    - Enterprise Tier: Full site crawl depth.

    ## Core Definitions
    - AEO (Answer Engine Optimization): The discipline of structuring web presence so AI search engines (Perplexity, ChatGPT, Copilot) accurately extract and cite content.
    - SPA Hydration Trap: A scenario where client-side JavaScript framework rendering hides HTML body text from raw HTTP scrapers.

    ```

---

### README.md

To generate a **bare minimum, machine-readable `README.md**` (a Level 4 Machine Manifest) using an automated website scraper, you can use the formula and scraper workflow below.

This model extracts **70%–80%** of the required data directly from your target domain's DOM and server headers.

---

#### 🧮 The Automated Scraper Formula for `README.md`

$$\text{Scraped README.md} = \text{Meta Pitch} + \text{Heading Specs} + \text{Scraped Tree} + \text{Inferred Env} + \text{Crawl Commands} + \text{Root Manifests}$$



##### How Each Formula Element Maps to Web Scraper Logic:

| Formula Element | Web Scraper Extraction Source / Logic | Scraper Output |
| --- | --- | --- |
| **Meta Pitch** | Extract `<title>`, `<meta name="description">`, and DOM `<h1>`.

 | Project Title & 1–3 sentence high-density system summary.

 |
| **Heading Specs** | Extract all `<h2>` and `<h3>` tags alongside `<ul>`/`<li>` list items under product/docs sections.

 | Bulleted list of system capabilities and feature specs.

 |
| **Scraped Tree** | <br>**Infer** based on discovered internal URL paths (`/docs`, `/api/v1/scan`, `/visualize`).

 | Simplified URL/module structure map.

 |
| **Inferred Env** | Inspect HTTP headers (`Server`, `X-Powered-By`) or public API docs.

 | Guessed runtime (e.g., Node.js / Express backend).

 |
| **Crawl Commands** | Static fallback templates derived from package type (`npm install`, `npm start`).

 | Standard terminal commands.

 |
| **Root Manifests** | Probe domain root paths (`/llms.txt`, `/ai-context.md`, `/sitemap.xml`) for HTTP 200 responses.

 | High-trust Markdown pointers to Level 2–3 manifests.

 |

---

#### ⚠️ What CANNOT Be Done With a Scraper (Highlighted Gaps)

A public web crawler only sees published, client-side HTML, CSS, rendered DOM elements, and HTTP response headers. It **cannot view internal server files or private execution contexts**.

The following critical sections **must be supplemented manually or via local file system inspection**:

> 1. 🚨 **Internal Source Code Directory Structure (`/backend/services/...`)**
> * **Why it fails:** Public HTTP crawlers cannot see your private backend directory layout, server files, or internal JavaScript modules.
> 
> 
> * **The Gap Fix:** A scraper can only build a *URL route map* (e.g., `/api/scan`). To get a true code directory tree (`├── backend/server.js`), you must pass the local directory output or `package.json`.
> 
> 
> 
> 
> 2. 🚨 **Local Database & Port Prerequisites (`MongoDB @ 127.0.0.1:27017`)**
> * **Why it fails:** Backend connection strings, loopback ports, and database service requirements (e.g., local bare-metal MongoDB vs. PostgreSQL) are never exposed publicly over HTTP for security reasons.
> * **The Gap Fix:** Default to standard environment assumptions (e.g., `Node.js >=18.0.0`) or prompt the user for their database engine.
> 
> 
> 3. 🚨 **Private Environment Variables (`.env`)**
> * **Why it fails:** API keys, database credentials, and internal secret tokens are concealed on the server side.
> * **The Gap Fix:** Inject placeholder blocks (`PORT=5000`, `MONGO_URI=...`) into the generated file.
> 
> 
> 4. 🚨 **Exact Terminal Commands & Testing Scripts (`npx vitest run`)**
> * **Why it fails:** Test runners and custom build flags live inside `package.json` and local test runners, which aren't exposed on production web pages.
> * **The Gap Fix:** Fall back to generic package standards (`npm install`, `npm start`, `npm test`).
> 
> 
> 
> 

---

#### 💻 Minimal Node.js Scraper Script to Build a `README.md`

Run this automated Cheerio/Axios generator to scrape a target domain and output a valid, machine-friendly `README.md`:

    ```javascript
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    const cheerio = require('cheerio');

    async function scrapeAndGenerateReadme(targetUrl) {
    const urlObj = new URL(targetUrl);
    const domain = urlObj.origin;

    console.log(`🔍 Crawling ${domain} to construct bare minimum README.md...`);

    // 1. Crawl Homepage Metadata & Capabilities
    let title = 'Project Title';
    let description = 'High-density system overview.';
    let capabilities = [];
    
    try {
        const { data: html } = await axios.get(domain);
        const $ = cheerio.load(html);

        title = $('title').text().trim() || $('h1').first().text().trim() || title;
        description = $('meta[name="description"]').attr('content')?.trim() || description;

        // Extract core bullet points or H2 section titles as capabilities
        $('h2, ul li').each((i, el) => {
        const text = $(el).text().trim();
        if (text.length > 10 && text.length < 120 && capabilities.length < 5) {
            capabilities.push(text.replace(/\s+/g, ' '));
        }
        });
    } catch (err) {
        console.warn('⚠️ Web crawl failed. Using fallback placeholders.');
    }

    // 2. Probe Root Machine Manifests
    let hasLlmsTxt = false;
    let hasAiContext = false;

    try {
        const llmsRes = await axios.get(`${domain}/llms.txt`);
        if (llmsRes.status === 200) hasLlmsTxt = true;
    } catch (e) {}

    try {
        const ctxRes = await axios.get(`${domain}/ai-context.md`);
        if (ctxRes.status === 200) hasAiContext = true;
    } catch (e) {}

    // 3. Construct Minimal Machine-Readable README.md
    const readmeContent = `# ${title}

    > ${description}

    ## 🚀 Capabilities
    ${capabilities.length > 0 
    ? capabilities.map(c => `- ${c}`).join('\n') 
    : '- Core system feature 1\n- Core system feature 2'}
    - Serves machine-readable manifests (\`/llms.txt\`, \`/ai-context.md\`) for AI crawlers.

    ## 📂 System Architecture
    > ⚠️ **NOTE:** Generated from public web crawl. Replace with your actual local file tree.
    \`\`\`text
    ├── backend/            # Server API endpoints and business logic
    ├── frontend/           # Client rendering scripts and DOM templates
    ${hasLlmsTxt ? '├── llms.txt            # Level 2 AI sitemap index\n' : ''}${hasAiContext ? '└── ai-context.md       # Level 3 deep context knowledge vault\n' : ''}\`\`\`

    ## 🛠️ Quick Start & Local Setup

    ### Prerequisites
    - **Runtime**: Node.js \`>=18.0.0\`
    - **Database**: [⚠️ MANUAL FILL: e.g., Bare-metal MongoDB at 127.0.0.1:27017]

    ### Installation
    \`\`\`bash
    # Install dependencies
    npm install

    # Start local server
    npm start
    \`\`\`

    ## 🤖 AI Manifest Pointers
    ${hasLlmsTxt ? `- [LLMs Directory Index](${domain}/llms.txt)` : '- [LLMs Directory Index](' + domain + '/llms.txt) (Pending creation)'}
    ${hasAiContext ? `- [Deep AI Context Vault](${domain}/ai-context.md)` : '- [Deep AI Context Vault](' + domain + '/ai-context.md) (Pending creation)'}
    `;

    fs.writeFileSync(path.resolve('./README.md'), readmeContent, 'utf8');
    console.log('✅ Bare minimum README.md generated successfully!');
    }

    // Example Run
    scrapeAndGenerateReadme('https://thatworkx.com');

    ```
### About.md

To generate an **`/about.md`** file (a Level 3 Entity Manifest ) automatically using a crawler, your crawler needs to combine **HTTP probing**, **HTML DOM scraping**, and **Schema.org JSON-LD extraction**.

When critical brand, team, or contact information cannot be located on the target site, the crawler should output **high-visibility action callouts** (`> ⚠️ [ACTION REQUIRED: ...]`). This makes it immediately clear to your client what they need to fix on their website or fill in manually.

---

#### 🔍 How the Crawler Pipeline Extracts Data for `/about.md`

Your crawler probes the domain using a 2-stage discovery flow:

1. **Direct File Probe:** Check if `https://domain.com/about.md` already exists. If found, pull it down to audit or refresh.


2. **Web Fallback Crawl:** If `/about.md` is missing, crawl the root page (`/`) and primary entity sub-routes (`/about`, `/team`, `/company`, `/contact`).

##### Extraction Matrix & Gap Detection Rules

| Section | Extraction Sources | What to Look For | Missing Section Fallback Banner |
| --- | --- | --- | --- |
| <br>**Entity Pitch** 

 | <br>`title`, `meta[description]`, `h1` 

 | Project title, company taglines, primary value prop. | `> ⚠️ [ACTION REQUIRED: Add a 2-3 sentence core company pitch.]` |
| <br>**Organization Specs** 

 | JSON-LD `<script type="application/ld+json">` 

 | `@type: "Organization"`, `legalName`, `foundingDate`. | `> ⚠️ [ACTION REQUIRED: Provide official legal entity name and founding year.]` |
| <br>**Founders & Team** 

 | `/about`, `/team` DOM, JSON-LD `@type: "Person"` | Executive names, bios, titles, LinkedIn URLs. | <br>`> ⚠️ [ACTION REQUIRED: List founder/leadership names and bio links for EEAT.]` 

 |
| <br>**Contact Signals** 

 | `/contact` DOM, `mailto:`, `tel:`, JSON-LD `ContactPoint` | Official email, phone, physical office address. | `> ⚠️ [ACTION REQUIRED: Add support email and physical/mailing address.]` |
| <br>**Authority Links** 

 | Outbound `<a>` tags on `/about` or root footer 

 | Outbound links to Crunchbase, GitHub, LinkedIn, Wikipedia, or Wikidata.

 | <br>`> ⚠️ [ACTION REQUIRED: Add links to your official Crunchbase, GitHub, or Wikidata entities.]` 

 |

---

#### 📄 Example Output Generated by Scraper (With Highlighted Gaps)

Here is what the generated `/about.md` file looks like when created by a crawler. The client can immediately see populated data alongside clear prompts for missing details:

    ```markdown
    # About ThatWorkx

    > Enterprise diagnostic platform that measures, score-calculates, and optimizes web architecture for AI crawlers and answer engines.

    ## 🏢 Organization Identity
    - **Legal Entity Name**: ThatWorkx Inc.
    - **Founding Year**: > ⚠️ [ACTION REQUIRED: Enter company founding year e.g. 2024]
    - **Headquarters Location**: > ⚠️ [ACTION REQUIRED: Enter city/state/country e.g., San Francisco, CA]
    - **Core Specialization**: Answer Engine Optimization (AEO), AI Crawler Diagnostics.

    ## 👤 Founders & Leadership (EEAT)
    > ⚠️ [ACTION REQUIRED: No executive leadership or Person schema was detected on /about or /team. Add key team members below to establish domain authority.]

    ### [Name] — [Title]
    - **Background**: [Brief credential summary]
    - **Profiles**: [LinkedIn Link] | [GitHub Link]

    ## 🌐 Entity Authority & Citation Hooks
    - **GitHub Organization**: https://github.com/thatworkx
    - **LinkedIn Profile**: https://linkedin.com/company/thatworkx
    - **Crunchbase Profile**: > ⚠️ [ACTION REQUIRED: Add link to Crunchbase company profile]
    - **Wikidata Entity ID**: > ⚠️ [ACTION REQUIRED: Add Wikidata entity ID if available]

    ## 📞 Verified Contact Information
    - **Support Email**: support@thatworkx.com
    - **Phone Number**: > ⚠️ [ACTION REQUIRED: No phone number detected in footer or contact page]
    - **Privacy Policy**: https://thatworkx.com/privacy
    - **Terms of Service**: https://thatworkx.com/terms

    ```

---

#### 💻 Automated Node.js Crawler Script for `/about.md`

Run this script to crawl a website, extract Schema.org JSON-LD  and HTML DOM data, and output an `/about.md` file with highlighted gaps:

    ```javascript
    const fs = require('fs');
    const path = require('path');
    const axios = require('axios');
    const cheerio = require('cheerio');

    async function generateAboutManifest(targetDomain) {
    const domain = targetDomain.replace(/\/$/, '');
    console.log(`🔍 Crawling ${domain} to construct /about.md manifest...`);

    // Data Containers
    let entity = {
        title: '',
        description: '',
        legalName: null,
        foundingDate: null,
        founders: [],
        emails: [],
        phones: [],
        authorityLinks: {
        github: null,
        linkedin: null,
        crunchbase: null,
        wikidata: null
        },
        privacyUrl: null,
        termsUrl: null
    };

    // Helper to safely fetch pages
    async function fetchPage(urlPath) {
        try {
        const { data } = await axios.get(`${domain}${urlPath}`, {
            headers: { 'User-Agent': 'AEO-Manifest-Crawler/1.0' },
            timeout: 5000
        });
        return cheerio.load(data);
        } catch (e) {
        return null;
        }
    }

    // 1. Crawl Homepage
    const $home = await fetchPage('');
    if ($home) {
        entity.title = $home('title').text().trim() || $home('h1').first().text().trim();
        entity.description = $home('meta[name="description"]').attr('content')?.trim();

        // Extract JSON-LD Schema
        $home('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($home(el).html());
            const schemas = Array.isArray(json) ? json : [json];
            schemas.forEach(s => {
            if (s['@type'] === 'Organization') {
                entity.legalName = s.legalName || s.name || entity.legalName;
                entity.foundingDate = s.foundingDate || entity.foundingDate;
            }
            if (s['@type'] === 'Person') {
                entity.founders.push({ name: s.name, jobTitle: s.jobTitle || 'Executive' });
            }
            });
        } catch (err) {}
        });
    }

    // 2. Crawl /about or /team page
    const $about = (await fetchPage('/about')) || (await fetchPage('/team'));
    if ($about) {
        // Extract Outbound Social / Authority Links
        $about('a[href]').each((_, el) => {
        const href = $about(el).attr('href');
        if (href.includes('github.com')) entity.authorityLinks.github = href;
        if (href.includes('linkedin.com')) entity.authorityLinks.linkedin = href;
        if (href.includes('crunchbase.com')) entity.authorityLinks.crunchbase = href;
        if (href.includes('wikidata.org')) entity.authorityLinks.wikidata = href;
        if (href.includes('/privacy')) entity.privacyUrl = href.startsWith('http') ? href : `${domain}${href}`;
        if (href.includes('/terms')) entity.termsUrl = href.startsWith('http') ? href : `${domain}${href}`;
        });
    }

    // 3. Crawl /contact for email and phone numbers
    const $contact = (await fetchPage('/contact')) || $home;
    if ($contact) {
        $contact('a[href^="mailto:"]').each((_, el) => {
        const email = $contact(el).attr('href').replace('mailto:', '').trim();
        if (email && !entity.emails.includes(email)) entity.emails.push(email);
        });
        $contact('a[href^="tel:"]').each((_, el) => {
        const phone = $contact(el).attr('href').replace('tel:', '').trim();
        if (phone && !entity.phones.includes(phone)) entity.phones.push(phone);
        });
    }

    // 4. Build Markdown Content with Actionable Highlight Banners
    const aboutMarkdown = `# About ${entity.title || 'Organization'}

    > ${entity.description || '> ⚠️ [ACTION REQUIRED: Add a 2-3 sentence core entity pitch describing the company mission.]'}

    ## 🏢 Organization Identity
    - **Legal Entity Name**: ${entity.legalName || entity.title || '> ⚠️ [ACTION REQUIRED: Add official registered legal entity name.]'}
    - **Founding Date / Year**: ${entity.foundingDate || '> ⚠️ [ACTION REQUIRED: Enter founding year e.g. 2024]'}
    - **Primary Specialization**: Answer Engine Optimization (AEO), AI Diagnostics & Machine Manifests.

    ## 👤 Founders & Leadership (EEAT)
    ${
    entity.founders.length > 0
        ? entity.founders.map(f => `### ${f.name} — ${f.jobTitle}\n- **Profile**: [LinkedIn]`).join('\n')
        : '> ⚠️ [ACTION REQUIRED: No executive leadership detected on /about or /team. List founder names, bios, and LinkedIn profiles here to establish EEAT authority.]'
    }

    ## 🌐 Entity Authority & Citation Hooks
    - **GitHub**: ${entity.authorityLinks.github || '> ⚠️ [ACTION REQUIRED: Add link to official GitHub Organization]'}
    - **LinkedIn**: ${entity.authorityLinks.linkedin || '> ⚠️ [ACTION REQUIRED: Add link to official LinkedIn Company Page]'}
    - **Crunchbase**: ${entity.authorityLinks.crunchbase || '> ⚠️ [ACTION REQUIRED: Add link to Crunchbase company profile]'}
    - **Wikidata Entity**: ${entity.authorityLinks.wikidata || '> ⚠️ [ACTION REQUIRED: Add Wikidata entity URL if available]'}

    ## 📞 Verified Contact Information
    - **Support Email**: ${entity.emails.length > 0 ? entity.emails.join(', ') : '> ⚠️ [ACTION REQUIRED: Add verified support/contact email]'}
    - **Phone Number**: ${entity.phones.length > 0 ? entity.phones.join(', ') : '> ⚠️ [ACTION REQUIRED: Add official business telephone number]'}
    - **Privacy Policy**: ${entity.privacyUrl || `${domain}/privacy`}
    - **Terms of Service**: ${entity.termsUrl || `${domain}/terms`}
    `;

    // Write file to disk
    fs.writeFileSync(path.resolve('./about.md'), aboutMarkdown, 'utf8');
    console.log('✅ /about.md created successfully with missing fields highlighted!');
    }

    // Example Execution
    generateAboutManifest('https://thatworkx.com');

    ```