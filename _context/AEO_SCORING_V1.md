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
    </urlset>

    ```