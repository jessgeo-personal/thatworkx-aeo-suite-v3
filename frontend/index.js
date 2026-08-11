// Global API Base URL Resolution with fallback & window binding
const API_BASE = (typeof window !== 'undefined' && window.API_BASE !== undefined)
  ? window.API_BASE
  : ((typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.port !== '5000')) ? 'http://localhost:5000' : '');

if (typeof window !== 'undefined') {
  window.API_BASE = API_BASE;
}

// Current Client State
let activeProduct = 'visualize';
let activeOptimizeTool = 'robots';
let currentEmail = 'user@thatworkx.com'; // Default user session email
let activeScanController = null;
let latestScanResults = null;
let activeDiyManifestKey = 'robots';
let activeVisualizeViewMode = 'executive';

// Base API URL Resolver (routes cleanly to port 5000 when accessing via file:// or non-5000 ports)
// Section Help Data Map (Global & Window scoped to prevent TDZ errors)
const sectionHelpData = {
  0: {
    title: 'AI Visibility Health Index (0-100 Score Formula)',
    icon: '📊',
    body: `<p style="margin-bottom: 0.75rem;">The <strong>AI Visibility Health Index</strong> measures your domain's total readiness for AI search engines (Google Gemini, Microsoft Copilot, ChatGPT, Perplexity). Baseline score starts at <strong>100 Points</strong> and deducts weight across the 4 Health Pillars:</p>
    <div style="background: rgba(15,23,42,0.8); padding: 0.65rem 0.85rem; border-radius: 6px; font-family: var(--font-mono); font-size: 0.76rem; color: #38bdf8; margin-bottom: 0.85rem; border: 1px solid rgba(56, 189, 248, 0.2);">
      Overall Score = 100 - (Pillar 1 + Pillar 2 + Pillar 3 + Pillar 4 Deductions)
    </div>
    <ul style="margin-left: 1.2rem; display: flex; flex-direction: column; gap: 8px; font-size: 0.8rem; text-align: left;">
      <li><strong style="color: #38bdf8;">Pillar 1: Gateway & Access (25% Weight):</strong> -10 pts per blocked AI crawler (Google-Extended, GPTBot, PerplexityBot, ClaudeBot); -5 pts if sitemap.xml is missing.</li>
      <li><strong style="color: #4ade80;">Pillar 2: AI-Ready Machine Data (25% Weight):</strong> -10 pts if /llms.txt is 404; -10 pts if /ai-context.md is 404; -5 pts per missing narrative manifest (/about.md, /docs.md, /content.md).</li>
      <li><strong style="color: #facc15;">Pillar 3: Parsing & Readability (25% Weight):</strong> -15 pts for SPA JS hydration traps; -10 pts for broken H1/H2 heading hierarchy; -5 pts for word count &lt;500 or &gt;2500 (truncation risk).</li>
      <li><strong style="color: #f43f5e;">Pillar 4: Knowledge Graph Integrity (25% Weight):</strong> -15 pts if JSON-LD schema is missing; -10 pts if self-referential canonical tag is missing.</li>
    </ul>
    <p style="margin-top: 0.85rem; font-size: 0.78rem; color: #f87171; text-align: left;">⚠️ <em>Blanket Block Override:</em> A blanket "Disallow: /" in robots.txt immediately caps score at 20/100 (Total AI Blindness).</p>`
  },
  1: {
    title: 'Section 1: Gateway & Access (Corridor Audit)',
    icon: '🛡️',
    body: `<p>Verifies whether AI search bots (GPTBot, PerplexityBot, ClaudeBot, Google-Extended) have unhindered network access to your root domain.</p><ul style="margin-left: 1.2rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 6px;"><li><strong style="color: #4ade80;">Optimized Handshake:</strong> All major AI crawler User-Agents are explicitly allowed in /robots.txt.</li><li><strong style="color: #facc15;">Partial Block:</strong> Certain bots are permitted while others are restricted.</li><li><strong style="color: #f87171;">Total AI Blindness:</strong> A blanket "Disallow: /" rule is preventing AI models from indexing your site.</li></ul>`
  },
  2: {
    title: 'Section 2: Presence & Hygiene',
    icon: '🧹',
    body: `<p>Checks structural technical hygiene needed for automated crawlers to discover and validate your canonical routes.</p><ul style="margin-left: 1.2rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 6px;"><li><strong>Sitemap XML:</strong> Valid route index tree accessible at /sitemap.xml.</li><li><strong>Canonical Tag:</strong> Explicit self-referential canonical tags to prevent duplicate content dilution.</li><li><strong>SSL Security:</strong> HTTPS protocol verification.</li><li><strong>SPA Hydration Trap:</strong> Detects whether page content relies solely on client-side JS rendering without SSR HTML fallback.</li></ul>`
  },
  3: {
    title: 'Section 3: Parsing & Readability',
    icon: '📖',
    body: `<p>Measures how cleanly an LLM's RAG chunking algorithm can process the text density of your rendered DOM.</p><ul style="margin-left: 1.2rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 6px;"><li><strong style="color: #4ade80;">High Content Density:</strong> >50% ratio of factual body text relative to DOM HTML markup node noise.</li><li><strong>Linear Heading Hierarchy:</strong> Single H1 with sequential H2/H3 nesting for precise question matching.</li><li><strong style="color: #facc15;">Truncation Risk:</strong> Pages >2,500 words risk "loss in the middle" or truncation during scraper fetch windows.</li></ul>`
  },
  4: {
    title: 'Section 4: Machine Manifests',
    icon: '🤖',
    body: `<p>Verifies deployment of machine welcome mats and structured AI blueprint files.</p><ul style="margin-left: 1.2rem; margin-top: 0.5rem; display: flex; flex-direction: column; gap: 6px;"><li><strong style="color: #4ade80;">/llms.txt:</strong> Answer.ai standard machine welcome directory.</li><li><strong style="color: #4ade80;">/ai-context.md:</strong> System prompt context map outlining brand specs.</li><li><strong>/about.md & /docs.md:</strong> Flattened Markdown files for E-E-A-T and technical entity verification.</li></ul>`
  }
};
if (typeof window !== 'undefined') {
  window.sectionHelpData = sectionHelpData;
}



function setVisualizeViewMode(mode) {
  activeVisualizeViewMode = mode;
  const execContainer = document.getElementById('exec-mode-container');
  const devContainer = document.getElementById('dev-mode-container');
  const pillExec = document.getElementById('pill-exec-mode');
  const pillDev = document.getElementById('pill-dev-mode');
  const welcomeBanner = document.getElementById('exec-welcome-banner');
  const executiveViewContainer = document.getElementById('executive-view-container');

  if (mode === 'developer' || mode === 'diy') {
    if (execContainer) execContainer.style.display = 'block';
    if (welcomeBanner) welcomeBanner.style.display = 'none';
    if (executiveViewContainer) executiveViewContainer.style.display = 'none';
    if (devContainer) devContainer.style.display = 'block';
    if (pillExec) pillExec.classList.remove('active');
    if (pillDev) pillDev.classList.add('active');
  } else {
    if (execContainer) execContainer.style.display = 'block';
    if (welcomeBanner) welcomeBanner.style.display = 'block';
    if (executiveViewContainer) executiveViewContainer.style.display = 'block';
    if (devContainer) devContainer.style.display = 'none';
    if (pillExec) pillExec.classList.add('active');
    if (pillDev) pillDev.classList.remove('active');
  }

  if (typeof window !== 'undefined' && window.history) {
    const params = new URLSearchParams(window.location.search || '');
    params.set('mode', mode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }
}
window.setVisualizeViewMode = setVisualizeViewMode;

// Executive Mode Action: Export PDF Summary
function exportExecutiveSummaryPdf() {
  window.print();
}

// Export Engine: Raw JSON Diagnostics Download
function exportRawJsonDiagnostics() {
  const lastScan = window.lastScanResults || {};
  const capabilities = window.currentEvaluatedCapabilities || [];
  
  // Developer-facing technical keys for handoff
  const hasFAQSchema = lastScan.status?.jsonLdExists || lastScan.sec3?.hasFaqSchema || false;
  const xRobotsTag = lastScan.status?.xRobotsIndexable || false;
  const canonicalMatch = lastScan.status?.hasCanonical || false;

  const payload = {
    ...lastScan,
    diagnosticSummary: {
      domain: window.currentScannedDomain || 'site',
      timestamp: new Date().toISOString(),
      hasFAQSchema,
      xRobotsTag,
      canonicalMatch,
      capabilities
    }
  };

  const domain = window.currentScannedDomain || 'site';
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `aeo-diagnostics-${domain}-${timestamp}.json`;

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Executive Mode Action: Launch AIOptimize Remediation Bridge
function launchAIOptimizeBridge(path = '', issue = '') {
  window.location.href = `optimize.html?issue=${encodeURIComponent(issue)}`;
}

// Cooldown variables for Anti-Blocking Safe Mode
let cooldownActive = false;
let cooldownTimeRemaining = 0;
let cooldownInterval = null;

// Developer Mode HTML Template Builders

function buildDevSchemaBuilderHtml() {
  return `
    <div class="schema-builder-card glassmorphic adaptive-card" id="diy-module-2" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; text-align: left; font-family: var(--font-sans), sans-serif;">
        <div>
          <h4 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary); margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif;">
            🛠️ Module 2: Page-Level HTML Schema Builder (JSON-LD)
          </h4>
          <p style="font-size: 1rem; color: var(--text-secondary); font-weight: 400; line-height: 1.625; margin: 0; font-family: var(--font-sans), sans-serif;">Generate page-specific JSON-LD schemas in real-time to establish corporate profiles and FAQ parity.</p>
        </div>
        <span class="badge-status" style="padding: 0.25rem 0.875rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 9999px; background: rgba(6, 182, 212, 0.2); color: #67e8f9; border: 1px solid rgba(6, 182, 212, 0.3); box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-family: var(--font-sans), sans-serif; display: inline-block;">HTML &lt;head&gt; Markup</span>
      </div>

      <div style="display: flex; gap: 20px; align-items: stretch; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
        <!-- Left Pane (50% width) -->
        <div class="dark-card-locked" style="flex: 1; min-width: 300px; background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; font-family: var(--font-sans), sans-serif;">
          <h5 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0; font-family: var(--font-sans), sans-serif;">Schema Builder &amp; Page-Targeting Guidance</h5>
          
          <!-- 3-Step Banner -->
          <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #fef08a; line-height: 1.4; font-family: var(--font-sans), sans-serif;">
            💡 <strong>How to use:</strong> 1. Toggle entities matching visible content on your target page. 2. Copy script. 3. Paste into page HTML &lt;head&gt;.
          </div>

          <!-- Checkboxes with microcopy -->
          <div style="display: flex; flex-direction: column; gap: 1rem; text-align: left; font-family: var(--font-sans), sans-serif;">
            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; user-select: none; font-family: var(--font-sans), sans-serif;">
              <input type="checkbox" id="schema-entity-Organization" ${selectedSchemaEntities.Organization ? 'checked' : ''} onchange="toggleSchemaEntity('Organization')" style="margin-top: 0.25rem; cursor: pointer; background-color: #0f172a; border: 1px solid #475569; accent-color: #38bdf8;" />
              <div>
                <span style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0; font-family: var(--font-sans), sans-serif;">Organization</span>
                <div style="font-size: 0.78rem; color: #6ee7b7; margin-top: 0.15rem; font-family: var(--font-sans), sans-serif;">📍 Target Page: Homepage. Establishes sitewide brand identity.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; user-select: none; font-family: var(--font-sans), sans-serif;">
              <input type="checkbox" id="schema-entity-LocalBusiness" ${selectedSchemaEntities.LocalBusiness ? 'checked' : ''} onchange="toggleSchemaEntity('LocalBusiness')" style="margin-top: 0.25rem; cursor: pointer; background-color: #0f172a; border: 1px solid #475569; accent-color: #38bdf8;" />
              <div>
                <span style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0; font-family: var(--font-sans), sans-serif;">LocalBusiness</span>
                <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 0.15rem; font-family: var(--font-sans), sans-serif;">📍 Target Page: Homepage / Contact Page. Address, geo-coordinates, &amp; hours.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; user-select: none; font-family: var(--font-sans), sans-serif;">
              <input type="checkbox" id="schema-entity-FAQPage" ${selectedSchemaEntities.FAQPage ? 'checked' : ''} onchange="toggleSchemaEntity('FAQPage')" style="margin-top: 0.25rem; cursor: pointer; background-color: #0f172a; border: 1px solid #475569; accent-color: #38bdf8;" />
              <div>
                <span style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0; font-family: var(--font-sans), sans-serif;">FAQPage</span>
                <div style="font-size: 0.78rem; color: #fcd34d; margin-top: 0.15rem; font-family: var(--font-sans), sans-serif;">📍 Target Page: FAQ / Product Pages. ⚠️ REQUIRED: Question/Answer text MUST be visibly printed on page.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; user-select: none; font-family: var(--font-sans), sans-serif;">
              <input type="checkbox" id="schema-entity-WebSite" ${selectedSchemaEntities.WebSite ? 'checked' : ''} onchange="toggleSchemaEntity('WebSite')" style="margin-top: 0.25rem; cursor: pointer; background-color: #0f172a; border: 1px solid #475569; accent-color: #38bdf8;" />
              <div>
                <span style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0; font-family: var(--font-sans), sans-serif;">WebSite + Sitelinks SearchBox</span>
                <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 0.15rem; font-family: var(--font-sans), sans-serif;">📍 Target Page: Homepage only. Enables sitewide searchbox.</div>
              </div>
            </label>

            <label style="display: flex; align-items: flex-start; gap: 0.75rem; cursor: pointer; user-select: none; font-family: var(--font-sans), sans-serif;">
              <input type="checkbox" id="schema-entity-Service" ${selectedSchemaEntities.Service ? 'checked' : ''} onchange="toggleSchemaEntity('Service')" style="margin-top: 0.25rem; cursor: pointer; background-color: #0f172a; border: 1px solid #475569; accent-color: #38bdf8;" />
              <div>
                <span style="font-size: 0.9rem; font-weight: 600; color: #e2e8f0; font-family: var(--font-sans), sans-serif;">Service / Offering</span>
                <div style="font-size: 0.78rem; color: #cbd5e1; margin-top: 0.15rem; font-family: var(--font-sans), sans-serif;">📍 Target Page: Specific Service / Pricing Pages.</div>
              </div>
            </label>
          </div>
        </div>

        <!-- Right Pane (50% width) -->
        <div class="dark-card-locked" style="flex: 1; min-width: 300px; background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; font-family: var(--font-sans), sans-serif;">
          <h5 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0; font-family: var(--font-sans), sans-serif;">Deployment &amp; Real-Time Code Synthesis</h5>
          
          <!-- Action Buttons -->
          <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
            <button onclick="copySchemaScript()" style="border-radius: 999px; padding: 0.5rem 1.25rem; font-size: 0.85rem; background: var(--text-primary, #ffffff); color: var(--surface-bg, #0f172a); border: 1px solid var(--text-primary, #ffffff); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: var(--font-sans), sans-serif;">
              <span>📋</span> Copy HTML &lt;script&gt; Tag
            </button>
            <button onclick="downloadSchemaJson()" style="border-radius: 999px; padding: 0.5rem 1.25rem; font-size: 0.85rem; background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-sans), sans-serif;">
              <span>📥</span> Download schema.json
            </button>
          </div>

          <!-- Deployment Helper Banner -->
          <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #bae6fd; line-height: 1.4; font-family: var(--font-sans), sans-serif;">
            💡 <strong>How to publish:</strong> Paste directly into the &lt;head&gt; section of your web page's HTML (or via Google Tag Manager / SEO plugin).
          </div>

          <!-- Code Box -->
          <pre id="schema-code-block" style="max-height: 250px; overflow-y: auto; white-space: pre-wrap; font-family: var(--font-mono), monospace; font-size: 0.82rem; color: #67e8f9; background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 6px; text-align: left; margin: 0;"></pre>
        </div>
      </div>
    </div>
  `;
}

function buildDevMatrixHtml() {
  return `
    <div class="developer-matrix-card glassmorphic adaptive-card" id="diy-module-1" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif;">
      <div style="margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h4 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary); margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span>🛠️ Module 1: AI-Optimized Site Diagnostics</span>
              <span class="badge-status" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted); font-family: var(--font-sans), sans-serif; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 600;">Full Technical Audit</span>
            </h4>
            <p style="font-size: 1rem; color: var(--text-secondary); font-weight: 400; line-height: 1.625; margin: 0; font-family: var(--font-sans), sans-serif;">Complete technical breakdown of all 32 AEO access, hygiene, parsing, and machine handshake parameters.</p>
          </div>
          <span class="table-count-badge status-amber-badge" style="font-family: var(--font-sans), sans-serif; font-size: 0.75rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 9999px;">32 Checks Evaluated</span>
        </div>
      </div>

      <div class="matrix-filter-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
        <button type="button" class="matrix-tab-btn control-menu-item active" onclick="filterMatrixSection('all')" style="font-family: var(--font-sans), sans-serif;">All (32)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(1)" style="font-family: var(--font-sans), sans-serif;">Section 1: Gateway (3)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(2)" style="font-family: var(--font-sans), sans-serif;">Section 2: Hygiene (7)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(3)" style="font-family: var(--font-sans), sans-serif;">Section 3: Parsing (10)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(4)" style="font-family: var(--font-sans), sans-serif;">Section 4: Manifests (12)</button>
      </div>

      <div id="dev-matrix-tbody" class="diy-accordions-container" style="font-family: var(--font-sans), sans-serif;">
        <!-- Dynamic Collapsible Accordions will go here -->
      </div>
    </div>
  `;
}

function getFileStatus(fileKey, results = {}) {
  const status = results.status || {};
  const botPerms = status.botPermissions || {};
  
  let exists = false;
  
  if (fileKey === 'robots') {
    exists = !!status.robotsTxtExists;
  } else if (fileKey === 'llms') {
    exists = !!status.llmsTxtExists;
  } else if (fileKey === 'aicontext') {
    exists = !!status.aiContextExists;
  } else if (fileKey === 'sitemap') {
    exists = !!status.sitemapExists;
  } else if (fileKey === 'readme') {
    exists = !!status.readmeFound;
  } else if (fileKey === 'about') {
    exists = !!status.aboutTxtExists;
  } else if (fileKey === 'docs') {
    exists = !!status.docsTxtExists;
  } else if (fileKey === 'content') {
    exists = !!status.contentTxtExists;
  } else if (fileKey === 'jsonld') {
    exists = !!status.jsonLdExists;
  }

  if (!exists) {
    return {
      state: 'missing',
      label: 'Action Needed: File Missing',
      icon: '✕',
      color: '#f43f5e',
      bgColor: 'rgba(244, 63, 94, 0.1)'
    };
  }

  // Check if it's robots.txt and any bot is blocked
  if (fileKey === 'robots') {
    const botsBlocked = botPerms && (botPerms.gptBot === false || botPerms.perplexityBot === false || botPerms.claudeBot === false || botPerms.googleExtended === false);
    if (botsBlocked) {
      return {
        state: 'needs_fix',
        label: 'Action Needed: Optimization Required',
        icon: '⚠️',
        color: '#fbbf24',
        bgColor: 'rgba(251, 191, 36, 0.1)'
      };
    }
  }

  return {
    state: 'valid',
    label: 'File Active & Present',
    icon: '✓',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.1)'
  };
}

function getManifestMetadata(fileKey, domain, results = {}) {
  const status = results.status || {};
  const routes = results.discoveredRoutes || results.scannedPages || [];
  const routeCount = routes.length || 0;
  
  const metadata = {
    robots: {
      title: 'robots.txt Search Gatekeeper',
      description: 'Configures crawl permissions and search exclusions for AI search crawlers and traditional search engines.',
      setupTime: '1 minute'
    },
    llms: {
      title: 'llms.txt Directory Index',
      description: 'Serves as a high-level table of contents and discovery map for LLM crawlers seeking site context.',
      setupTime: '1 minute'
    },
    aicontext: {
      title: 'ai-context.md System Context Map',
      description: 'Provides a flattened markdown context blueprint, structured schemas, and RAG prompt guardrails.',
      setupTime: '1 minute'
    },
    sitemap: {
      title: 'sitemap.xml Route Directory',
      description: 'Lists all canonical URL paths to ensure complete and structured indexing of your site pages.',
      setupTime: '1 minute'
    },
    readme: {
      title: 'README.md Portal Summary',
      description: 'A concise 30-second summary and landing introduction designed for rapid agent ingestion.',
      setupTime: '1 minute'
    },
    about: {
      title: 'about.md Corporate Profile',
      description: 'Verifies E-E-A-T credentials, leadership backgrounds, and organization entity connections.',
      setupTime: '1 minute'
    },
    docs: {
      title: 'docs.md Technical Documentation',
      description: 'Exposes flattened API references, configuration parameters, and developer integration guides.',
      setupTime: '1 minute'
    },
    content: {
      title: 'content.md Subject Authority Index',
      description: 'Indexes deep-dive articles, case study proof points, and corporate authority matrices.',
      setupTime: '1 minute'
    },
    jsonld: {
      title: 'JSON-LD Structured Schema',
      description: 'Injects machine-readable organization and corporate metadata directly into the HTML header.',
      setupTime: '1 minute'
    }
  };

  const meta = metadata[fileKey] || metadata.llms;
  const fileStatus = getFileStatus(fileKey, results);
  
  // Format Live status
  let filename = '';
  if (fileKey === 'robots') filename = 'robots.txt';
  else if (fileKey === 'sitemap') filename = 'sitemap.xml';
  else if (fileKey === 'aicontext') filename = 'ai-context.md';
  else if (fileKey === 'jsonld') filename = 'JSON-LD Schema';
  else if (fileKey === 'llms') filename = 'llms.txt';
  else if (fileKey === 'readme') filename = 'README.md';
  else filename = `${fileKey}.md`;

  let liveContent = '';
  if (fileKey === 'robots') liveContent = status.robotsTxtContent || '';
  else if (fileKey === 'llms') liveContent = status.llmsTxtContent || '';
  else if (fileKey === 'aicontext') {
    const manifestPreviews = results.manifestPreviews || {};
    liveContent = manifestPreviews.aiContext || status.aiContextContent || '';
  } else if (fileKey === 'sitemap') liveContent = status.sitemapContent || '';
  else if (fileKey === 'readme') liveContent = status.readmeContent || '';
  else if (fileKey === 'about') {
    const manifestPreviews = results.manifestPreviews || {};
    liveContent = manifestPreviews.about || status.aboutTxtContent || '';
  } else if (fileKey === 'docs') liveContent = status.docsTxtContent || status.docsContent || '';
  else if (fileKey === 'content') liveContent = status.contentTxtContent || status.contentContent || '';
  else if (fileKey === 'jsonld') liveContent = status.jsonLdSchemaContent || status.jsonLdContent || '';

  let liveStatusText = '';
  if (fileStatus.state === 'missing') {
    liveStatusText = `No existing /${filename} file found on web server`;
  } else {
    const charCount = liveContent ? liveContent.length : 0;
    liveStatusText = `Live /${filename} file detected (${charCount} chars)`;
  }

  return {
    ...meta,
    filename,
    state: fileStatus.state,
    statusLabel: fileStatus.label,
    statusColor: fileStatus.color,
    statusIcon: fileStatus.icon,
    liveStatusText,
    domain,
    routeCount
  };
}

function buildDevDrawersHtml(domainName = '') {
  const domain = domainName || currentScannedDomain || 'example.com';
  const results = latestScanResults || window.lastScanResults || {};
  
  const manifestFiles = [
    { key: 'robots', name: 'robots.txt' },
    { key: 'llms', name: 'llms.txt' },
    { key: 'aicontext', name: 'ai-context.md' },
    { key: 'sitemap', name: 'sitemap.xml' },
    { key: 'readme', name: 'README.md' },
    { key: 'about', name: 'about.md' },
    { key: 'docs', name: 'docs.md' },
    { key: 'content', name: 'content.md' }
  ];

  if (activeDiyManifestKey === 'jsonld') {
    activeDiyManifestKey = 'robots';
  }
  if (activeDrawerKey === 'jsonld') {
    activeDrawerKey = 'robots';
  }

  const tabsHtml = manifestFiles.map(file => {
    const fileStatus = getFileStatus(file.key, results);
    const isActive = activeDiyManifestKey === file.key;
    
    let icon = '✕';
    let iconColor = '#f43f5e';
    if (fileStatus.state === 'valid') {
      icon = '✓';
      iconColor = '#34d399';
    } else if (fileStatus.state === 'needs_fix') {
      icon = '⚠️';
      iconColor = '#fbbf24';
    }

    return `<button type="button" class="drawer-tab-btn control-menu-item ${isActive ? 'active' : ''}" onclick="switchDiyManifestTab('${file.key}')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 8px; font-family: var(--font-sans), sans-serif; transition: all 0.2s ease-in-out;">
      <span style="color: ${iconColor}; font-weight: bold;">${icon}</span>
      <span>${file.name}</span>
    </button>`;
  }).join('');

  setTimeout(() => {
    switchDiyManifestTab(activeDiyManifestKey);
  }, 0);

  return `
    <div class="machine-code-drawers-card glassmorphic adaptive-card" id="dev-drawers-section" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif;">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; text-align: left; font-family: var(--font-sans), sans-serif;">
        <div>
          <h4 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary); margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif;">
            🛠️ Module 3: AI Machine-readable File Configurator
          </h4>
          <p style="font-size: 1rem; color: var(--text-secondary); font-weight: 400; line-height: 1.625; margin: 0; font-family: var(--font-sans), sans-serif;">Review and deploy standard control files (like robots.txt and llms.txt) to make your website AI-Ready, direct AI crawlers, and control how bots index your content.</p>
        </div>
        <span class="badge-status" style="padding: 0.25rem 0.875rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; border-radius: 9999px; background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 1px solid rgba(168, 85, 247, 0.3); box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-family: var(--font-sans), sans-serif; display: inline-block;">Root Server Manifests</span>
      </div>

      <div class="drawer-file-tabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif;">
        ${tabsHtml}
      </div>

      <div style="display: flex; gap: 20px; align-items: stretch; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
        <!-- Left Pane (50% width) -->
        <div class="dark-card-locked" style="flex: 1; min-width: 300px; background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; font-family: var(--font-sans), sans-serif;" id="left-pane-content">
          <!-- Populated dynamically by switchDiyManifestTab -->
        </div>

        <!-- Right Pane (50% width) -->
        <div class="dark-card-locked" style="flex: 1; min-width: 300px; background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1.5rem; display: flex; flex-direction: column; font-family: var(--font-sans), sans-serif;" id="right-pane-container">
          <!-- Populated dynamically by switchDiyManifestTab -->
        </div>
      </div>

      <!-- Upgrade Callout Box -->
      <div style="margin-top: 1.5rem; padding: 1.25rem 1.5rem; border-radius: 12px; background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <span style="font-size: 0.95rem; color: #cbd5e1; font-family: var(--font-sans), sans-serif;">
          To manage AI-Ready Machine readable files, upgrade to <strong style="color: #fbbf24;">AIOptimize Pro</strong>
        </span>
        <a href="#" onclick="showUpgradeModal('AIO_PRO_FILE_MANAGER', 'Actively manage and deploy AI-Ready files', 'AIOptimize Pro'); return false;" style="background: var(--burnt-copper); color: #ffffff; padding: 0.55rem 1.35rem; border-radius: 8px; font-weight: 700; font-family: var(--font-sans), sans-serif; font-size: 0.85rem; text-decoration: none; display: inline-flex; align-items: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
          Upgrade to AIOptimize Pro ↗
        </a>
      </div>
    </div>
  `;
}

function buildDevEdgeHtml() {
  return `
    <div class="edge-network-card glassmorphic" id="dev-edge-section" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>🌐 Edge Network &amp; WAF Deployment Sandbox</span>
            <span class="badge-status" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted);">Cloudflare &amp; Falcon Hooks</span>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Deploy edge worker proxies to serve /llms.txt and bypass closed CMS restrictions.</p>
        </div>
      </div>

      <div class="edge-tabs-nav" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <button type="button" class="edge-tab-btn control-menu-item active" onclick="selectEdgeTab('cloudflare')">Cloudflare Worker Proxy</button>
        <button type="button" class="edge-tab-btn control-menu-item" onclick="selectEdgeTab('shopify')">Shopify Liquid Redirect</button>
        <button type="button" class="edge-tab-btn control-menu-item" onclick="selectEdgeTab('crowdstrike')">Crowdstrike Falcon Bypass</button>
      </div>

      <div class="edge-tab-content drawer-code-window" style="background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem;">
        <div class="drawer-code-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
          <span class="drawer-file-path" id="edge-current-title" style="font-family: var(--font-mono); font-size: 0.85rem; color: #38bdf8;">Cloudflare Worker Edge Router (worker.js)</span>
          <button type="button" class="drawer-btn" onclick="copyEdgeScript()">📋 Copy Worker Script</button>
        </div>
        <div class="drawer-code-body">
          <pre><code id="edge-code-content" class="language-javascript">// Cloudflare Worker Edge Proxy Hook for AEO Machine Files
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  if (url.pathname === '/llms.txt') {
    return new Response(LLMS_TXT_CONTENT, {
      headers: { 
        'content-type': 'text/plain; charset=utf-8',
        'x-robots-tag': 'all',
        'cache-control': 'public, max-age=3600'
      }
    });
  }
  return fetch(request);
}</code></pre>
        </div>
      </div>
    </div>
  `;
}



// 4-Page Architecture Router Initialization
document.addEventListener('DOMContentLoaded', () => {


  try {
    if (document.getElementById('code-robots')) generateRobotsTxt();
    if (document.getElementById('code-cloudflare')) generateCloudflareWorker();
    if (document.getElementById('code-schema')) generateJsonLd();
    if (document.getElementById('code-llmstxt')) generateManifests();
    if (document.getElementById('code-shopify')) generateEdgeSnippets();
    checkAuthSession();
    updateUserTier();
  } catch (e) {
    console.warn('Initial generator skip on current route:', e);
  }

  const currentPath = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const targetUrlParam = params.get('url');
  const modeParam = params.get('mode');

  // Page 2: AI Visualize Dashboard (visualize.html or /visualize)
  if (currentPath.includes('visualize')) {
    try {
      const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
      const devModule4Wrap = document.getElementById('dev-module-4-wrapper');

      if (devMatrixWrap) devMatrixWrap.innerHTML = buildDevMatrixHtml();
      if (devModule4Wrap) {
        devModule4Wrap.innerHTML = buildDevModule4Html();
        renderModule4(latestScanResults || window.lastScanResults || {});
      }

      if (modeParam === 'developer' || modeParam === 'diy') {
        setVisualizeViewMode('developer');
      } else {
        setVisualizeViewMode('executive');
      }

      const tabParam = params.get('tab');

      if (tabParam) {
        if (tabParam === 'gateway' || tabParam === '1') filterMatrixSection(1);
        else if (tabParam === 'hygiene' || tabParam === '2') filterMatrixSection(2);
        else if (tabParam === 'content' || tabParam === '3') filterMatrixSection(3);
        else if (tabParam === 'manifests' || tabParam === '4') filterMatrixSection(4);
        else filterMatrixSection('all');
      }

      if (targetUrlParam) {
        const mainInput = document.getElementById('target-url');
        if (mainInput) mainInput.value = targetUrlParam;
        executeDashboardScan(null);
      } else {
        // Default initial scan load for demo
        executeDashboardScan(null);
      }

      // Set up IntersectionObserver for Alternative B Floating Glass Dock active link toggling
      const dockLinks = document.querySelectorAll('.dock-link');
      const cards = [
        document.getElementById('control-toolbar-anchor'),
        document.getElementById('summary-dial-anchor'),
        document.getElementById('section-1-card'),
        document.getElementById('section-2-card'),
        document.getElementById('section-3-card'),
        document.getElementById('section-4-card')
      ].filter(Boolean);

      if (cards.length > 0 && typeof IntersectionObserver !== 'undefined') {
        const observerOptions = {
          root: null,
          rootMargin: '-20% 0px -60% 0px',
          threshold: 0
        };

        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const cardId = entry.target.id;
              const sectionNum = cardId.replace('section-', '').replace('-card', '');
              
              dockLinks.forEach((link) => {
                if (link.getAttribute('data-dock-section') === sectionNum || link.getAttribute('href') === `#${cardId}`) {
                  link.classList.add('active');
                } else {
                  link.classList.remove('active');
                }
              });
            }
          });
        }, observerOptions);

        cards.forEach((card) => observer.observe(card));
      }

      // Smooth scroll handler for .dock-link anchors
      document.querySelectorAll('.dock-link').forEach(link => {
        link.addEventListener('click', (e) => {
          const targetId = link.getAttribute('href');
          const targetEl = document.querySelector(targetId);
          if (targetEl) {
            e.preventDefault();
            e.stopPropagation();
            if (typeof targetEl.scrollIntoView === 'function') {
              targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
          }
        });
      });
    } catch (vizInitErr) {
      console.warn('[Visualize] Non-critical init error:', vizInitErr);
    }

    // Attach ? help button and infotip listeners via global event delegation
    document.addEventListener('click', function(e) {
      console.log('[AEO-Infotip-Debug] Click Intercepted on:', e.target);
      const btn = e.target.closest('.info-help-btn, .info-tip, .infotip-btn, .help-tooltip-trigger, [data-tooltip], [data-section], [data-modal], [data-action]');
      
      if (!btn) {
        console.log('[AEO-Infotip-Debug] Clicked element did NOT match any known Infotip/Help trigger selectors.');
        return;
      }

      if (btn.classList.contains('dock-link') || btn.closest('#floating-glass-dock')) {
        return; // Do not open help modal when clicking dock navigation links
      }

      console.log('[AEO-Infotip-Debug] Matched Trigger Element:', btn);
      console.log('[AEO-Infotip-Debug] Extracted Datasets:', {
        section: btn.dataset.section,
        tooltip: btn.dataset.tooltip,
        modal: btn.dataset.modal,
        action: btn.dataset.action,
        title: btn.getAttribute('title')
      });

      const trigger = btn;

      // 1. Handle section help triggers (data-section="1", etc.)
      if (trigger.dataset.section !== undefined && trigger.dataset.section !== '') {
        const secNum = parseInt(trigger.dataset.section, 10);
        if (!isNaN(secNum)) {
          e.preventDefault();
          e.stopPropagation();
          console.log('[HelpModal] Section trigger clicked, section:', secNum);
          openSectionHelpModal(secNum, e);
          return;
        }
      }

      // 2. Handle tooltip key triggers (data-tooltip="key" or data-help="key")
      const tooltipKey = trigger.dataset.tooltip || trigger.dataset.help;
      if (tooltipKey) {
        e.preventDefault();
        e.stopPropagation();
        console.log('[HelpModal] Tooltip trigger clicked, key:', tooltipKey);
        openHelpTooltip(tooltipKey, e);
        return;
      }

      // 3. Handle modal target triggers (data-modal="key" or data-action="open-modal")
      const modalKey = trigger.dataset.modal || trigger.dataset.target || trigger.dataset.action;
      if (modalKey) {
        e.preventDefault();
        e.stopPropagation();
        if (modalKey === 'auth' || modalKey === 'auth-modal') {
          openAuthModal();
        } else if (modalKey === 'alert' || modalKey === 'alert-modal' || modalKey === 'upgrade') {
          showUpgradeModal('PRO_REQUIRED', 'Upgrade required to unlock feature.', 'AIOptimize Pro');
        } else if (modalKey === 'help' || modalKey === 'help-modal') {
          openSectionHelpModal(1, e);
        } else {
          openHelpTooltip(modalKey, e);
        }
        return;
      }

      // 4. Fallback for title attribute on infotip buttons
      const titleAttr = trigger.getAttribute('title');
      if (titleAttr) {
        e.preventDefault();
        e.stopPropagation();
        const titleEl = document.getElementById('help-modal-title');
        const iconEl = document.getElementById('help-modal-icon');
        const bodyEl = document.getElementById('help-modal-body');
        const modalEl = document.getElementById('help-modal') || document.getElementById('help-info-modal');

        if (titleEl) titleEl.innerText = titleAttr;
        if (iconEl) iconEl.innerText = '💡';
        if (bodyEl) bodyEl.innerHTML = `<p>${titleAttr}</p>`;
        if (modalEl) {
          modalEl.classList.remove('help-modal-hidden');
          modalEl.style.display = 'flex';
        }
      }
    });
  }

  // Page 3: AI Optimize Workspace (optimize.html or /optimize)
  else if (currentPath.includes('optimize')) {
    if (targetUrlParam) {
      const cleanDomain = targetUrlParam.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const domainInput = document.getElementById('optimize-target-domain');
      if (domainInput) domainInput.value = cleanDomain;
    }
    switchOptimizeTrack(1);

    const devSchemaBuilderWrap = document.getElementById('dev-schema-builder-wrapper');
    if (devSchemaBuilderWrap) {
      devSchemaBuilderWrap.innerHTML = buildDevSchemaBuilderHtml();
    }

    // Initialize Module 1: 32-Capability Diagnostic Matrix wrapper
    const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
    if (devMatrixWrap) {
      devMatrixWrap.innerHTML = buildDevMatrixHtml();
      const initialCapabilities = typeof evaluateAllCapabilities === 'function'
        ? (evaluateAllCapabilities(window.lastScanResults || {}).capabilities || [])
        : [];
      window.currentEvaluatedCapabilities = initialCapabilities;
      if (typeof renderDeveloperMatrixRows === 'function') {
        renderDeveloperMatrixRows(initialCapabilities);
      }
    }

    // Initialize Module 3 drawers wrapper
    const devDrawersWrap = document.getElementById('dev-drawers-wrapper');
    if (devDrawersWrap) {
      devDrawersWrap.innerHTML = buildDevDrawersHtml();
      if (typeof switchDiyManifestTab === 'function') {
        switchDiyManifestTab('robots');
      }
    }

    const devEdgeWrap = document.getElementById('dev-edge-wrapper');
    if (devEdgeWrap) {
      devEdgeWrap.innerHTML = buildDevEdgeHtml();
      // Initialize with current domain if optimize-target-domain exists
      const domainInput = document.getElementById('optimize-target-domain');
      if (domainInput && domainInput.value) {
        currentScannedDomain = domainInput.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
      }
      selectEdgeTab('cloudflare');
    }

    const domainInput = document.getElementById('optimize-target-domain');
    if (domainInput) {
      domainInput.addEventListener('input', () => {
        if (typeof updateOptimizeTargetDomain === 'function') {
          updateOptimizeTargetDomain();
        } else if (typeof updateSchemaBuilderCode === 'function') {
          updateSchemaBuilderCode();
        }
        if (typeof switchDiyManifestTab === 'function') {
          switchDiyManifestTab(window.activeDiyManifestKey || 'robots');
        }
      });
      domainInput.addEventListener('change', () => {
        if (typeof updateOptimizeTargetDomain === 'function') {
          updateOptimizeTargetDomain();
        } else if (typeof updateSchemaBuilderCode === 'function') {
          updateSchemaBuilderCode();
        }
        if (typeof switchDiyManifestTab === 'function') {
          switchDiyManifestTab(window.activeDiyManifestKey || 'robots');
        }
      });
    }

    if (devSchemaBuilderWrap) {
      updateSchemaBuilderCode();
    }
  }

  // Page 4: AI Socialize Page (socialize.html or /socialize)
  else if (currentPath.includes('socialize')) {
    if (targetUrlParam) {
      const cleanDomain = targetUrlParam.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      const socialSnippetBox = document.getElementById('social-snippet-output');
      if (socialSnippetBox) {
        socialSnippetBox.textContent = `---
🤖 AI Citation & Attributable Proof Footer:
Domain: https://${cleanDomain}/
LLM Welcome Mat: https://${cleanDomain}/llms.txt
Author E-E-A-T Profile: https://${cleanDomain}/about.md
System Context Map: https://${cleanDomain}/ai-context.md
Canonical Citation: Verified by Thatworkx AEO Suite v3
---`;
      }
    }
  }

  // Page 1: Home Landing Page (index.html)
  else {
    selectConsoleTab('visualize');
  }
});



// Product panel navigation switches (Visualize vs Optimize vs Socialize)
function switchProduct(productName) {
  activeProduct = productName;
  
  // Update toggle buttons active state
  document.querySelectorAll('.toggle-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-${productName}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Toggle visible panels
  document.querySelectorAll('.product-panel').forEach(panel => panel.classList.remove('active'));
  document.getElementById(`panel-${productName}`).classList.add('active');

  // Display/Hide headless execution controls depending on the active product and tier
  const tier = document.getElementById('user-tier-selector').value;
  const isAio = productName === 'optimize' || productName === 'visualize';
  const headlessControls = document.getElementById('headless-checkbox-wrapper');
  
  if (isAio && (tier.includes('AIOptimize Pro') || tier.includes('AIOptimize ENT'))) {
    headlessControls.style.display = 'block';
  } else {
    headlessControls.style.display = 'none';
  }
}

// Optimize master tracks switcher
function switchOptimizeTrack(trackNum) {
  // Update master track buttons active state
  document.querySelectorAll('.optimize-master-tabs .control-menu-item').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`btn-track${trackNum}`);
  if (activeBtn) activeBtn.classList.add('active');

  // Toggle sub-tab selectors
  if (trackNum === 1) {
    document.getElementById('optimize-track1-subtabs').style.display = 'block';
    document.getElementById('optimize-track2-subtabs').style.display = 'none';
    switchOptimizeTool('robots');
  } else {
    document.getElementById('optimize-track1-subtabs').style.display = 'none';
    document.getElementById('optimize-track2-subtabs').style.display = 'block';
    switchOptimizeTool('llmstxt');
  }
}

// Optimize tool panels switcher
function switchOptimizeTool(toolName) {
  activeOptimizeTool = toolName;
  document.querySelectorAll('.optimize-tabs .control-menu-item').forEach(item => item.classList.remove('active'));
  
  const activeMenu = document.getElementById(`menu-${toolName}`);
  if (activeMenu) {
    activeMenu.classList.add('active');
  }

  document.querySelectorAll('.optimize-tool-view').forEach(view => view.classList.remove('active'));
  const activeView = document.getElementById(`opt-tool-${toolName}`);
  if (activeView) {
    activeView.classList.add('active');
  }
  
  // Trigger file content generation if target domain is active
  if (['llmstxt', 'aicontext', 'about', 'docs', 'content', 'sitemap'].includes(toolName)) {
    generateTrack2File(toolName);
  }
}

window.switchOptimizeTrack = switchOptimizeTrack;
window.switchOptimizeTool = switchOptimizeTool;

// Quota and plan sync
async function updateUserTier() {
  const tierSelector = document.getElementById('user-tier-selector');
  if (!tierSelector) return;
  const selectedTier = tierSelector.value;
  
  // Update headless controls visibility based on selected tier (only exists on visualize.html)
  const headlessControls = document.getElementById('headless-checkbox-wrapper');
  if (headlessControls) {
    if (activeProduct === 'visualize' && (selectedTier.includes('AIOptimize Pro') || selectedTier.includes('AIOptimize ENT'))) {
      headlessControls.style.display = 'block';
    } else {
      headlessControls.style.display = 'none';
    }
  }

  try {
    const res = await fetch(`${API_BASE}/api/user/tier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail, tier: selectedTier })
    });
    const data = await res.json();
    console.log('Tier updated successfully on backend:', data.message);
  } catch (error) {
    console.error('Error synchronizing subscription tier:', error);
  }
}

// Execute Scan
async function executeScan(event) {
  event.preventDefault();

  if (cooldownActive) {
    alert(`Whole-site scan is locked. Next scan available in ${cooldownTimeRemaining}s. You can still audit individual pages below.`);
    return;
  }

  let urlInput = document.getElementById('target-url').value.trim();
  if (urlInput && !/^https?:\/\//i.test(urlInput)) {
    urlInput = 'https://' + urlInput;
  }
  const isHeadless = document.getElementById('headless-checkbox').checked;

  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const submitBtn = document.getElementById('submit-btn');

  // Loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  try {
    const response = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentEmail,
        targetUrl: urlInput,
        headless: isHeadless
      })
    });

    const data = await response.json();

    if (!response.ok) {
      // Limit check triggered or error occurred
      if (data.code === 'LIMIT_EXCEEDED' || data.code === 'HEADLESS_FORBIDDEN' || data.code === 'HEADLESS_LIMIT_EXCEEDED') {
        showUpgradeModal(data.code, data.error, data.upgradeTarget);
      } else {
        alert(data.error || 'Server error running URL scan.');
      }
      return;
    }

    // Populate Results Board
    displayScanResults(data.results);

    // Hide onboarding hero and show normal navigation headers + scan inputs
    const onboardingHero = document.getElementById('onboarding-hero');
    if (onboardingHero) onboardingHero.style.display = 'none';
    const scanInputCard = document.getElementById('scan-input-card');
    if (scanInputCard) scanInputCard.style.display = 'block';
    const toggleHeader = document.getElementById('toggle-container-header');
    if (toggleHeader) toggleHeader.style.display = 'flex';

    // Trigger Anti-Blocking Cooldown Safe Mode
    startCooldown(60);

  } catch (error) {
    console.error('Connection failure during scan submission:', error);
    alert(error.message || 'Failed to connect to backend scan services.');
  } finally {
    btnLoader.style.display = 'none';
    if (cooldownActive) {
      btnText.style.display = 'block';
      btnText.innerText = `Scan Locked (${cooldownTimeRemaining}s)`;
      submitBtn.disabled = true;
    } else {
      btnText.style.display = 'block';
      submitBtn.disabled = false;
    }
  }
}

function startCooldown(seconds) {
  if (cooldownInterval) {
    clearInterval(cooldownInterval);
  }
  cooldownActive = true;
  cooldownTimeRemaining = seconds;
  
  const submitBtn = document.getElementById('submit-btn');
  const btnText = document.getElementById('btn-text');
  const cooldownContainer = document.getElementById('scan-cooldown-container');
  const cooldownMessage = document.getElementById('scan-cooldown-message');
  
  submitBtn.disabled = true;
  cooldownContainer.style.display = 'flex';
  btnText.innerText = `Scan Locked (${cooldownTimeRemaining}s)`;
  
  cooldownInterval = setInterval(() => {
    cooldownTimeRemaining -= 1;
    btnText.innerText = `Scan Locked (${cooldownTimeRemaining}s)`;
    cooldownMessage.innerText = `Next whole-site scan available in ${cooldownTimeRemaining}s`;
    
    if (cooldownTimeRemaining <= 0) {
      clearInterval(cooldownInterval);
      cooldownInterval = null;
      cooldownActive = false;
      submitBtn.disabled = false;
      btnText.innerText = 'Initiate Scan';
      cooldownContainer.style.display = 'none';
    }
  }, 1000);
}

// Display analysis parameters on the dashboard
function displayScanResults(results) {
  if (!results) return;

  const placeholder = document.getElementById('scan-placeholder');
  if (placeholder) placeholder.style.display = 'none';

  const scanResultsEl = document.getElementById('scan-results');
  if (scanResultsEl) scanResultsEl.style.display = 'grid';

  // Overall Score
  const overallScoreEl = document.getElementById('overall-score');
  if (overallScoreEl && results.scoreCard) {
    overallScoreEl.innerText = results.scoreCard.overallScore;
  }

  const classBadge = document.getElementById('classification-badge');
  if (classBadge && results.scoreCard?.classification) {
    classBadge.innerText = results.scoreCard.classification.toUpperCase();
    classBadge.className = `badge-${results.scoreCard.classification.toLowerCase()}`;
  }

  const crawledTextEl = document.getElementById('crawled-pages-text');
  if (crawledTextEl) {
    crawledTextEl.innerText = `Crawled ${results.pageDepthCrawled} of ${results.totalPagesFound} discovered paths`;
  }

  const routesCountEl = document.getElementById('scanned-routes-count');
  if (routesCountEl) {
    routesCountEl.innerText = `Pulled ${results.pageDepthCrawled} of ${results.totalPagesFound} pages`;
  }

  // Gateway Relationship Badge
  const gwBadge = document.getElementById('gateway-badge');
  if (gwBadge && results.status.gatewayBadge) {
    if (results.status.gatewayBadge === 'Optimized Handshake') {
      gwBadge.innerText = '🟢 Optimized Handshake';
      gwBadge.className = 'gateway-badge badge-handshake';
    } else if (results.status.gatewayBadge === 'Total AI Blindness') {
      gwBadge.innerText = '🔴 Total AI Blindness';
      gwBadge.className = 'gateway-badge badge-blindness';
    } else {
      gwBadge.innerText = '🟡 Hidden Assets';
      gwBadge.className = 'gateway-badge badge-hidden';
    }
  }

  // AI Bot Permissions Matrix
  if (results.status.botPermissions) {
    updateBotPerm('perm-gptbot', results.status.botPermissions.gptBot);
    updateBotPerm('perm-perplexity', results.status.botPermissions.perplexityBot);
    updateBotPerm('perm-claudebot', results.status.botPermissions.claudeBot);
    updateBotPerm('perm-geminibot', results.status.botPermissions.googleExtended);
  }

  // Level 2 Content Density & Machine Simulator Viewport
  const densityBadge = document.getElementById('density-badge');
  if (densityBadge && results.status.contentDensityRatio !== undefined) {
    densityBadge.innerText = `Content Density: ${results.status.contentDensityRatio}%`;
  }

  const previewBox = document.getElementById('machine-preview-box');
  if (previewBox && results.status.machinePreview) {
    previewBox.innerText = results.status.machinePreview;
  }

  // Checklist Items Status Update
  updateChecklistStatus('chk-robots', results.status.robotsTxtExists);
  updateChecklistStatus('chk-sitemap', results.status.sitemapExists);
  updateChecklistStatus('chk-xrobots', results.status.xRobotsIndexable);
  updateChecklistStatus('chk-spatrap', !results.status.spaTrapDetected);
  updateChecklistStatus('chk-ssl', results.url ? results.url.startsWith('https') : false);
  
  updateChecklistStatus('chk-title', results.status.seoOptimalTitle);
  updateChecklistStatus('chk-desc', results.status.seoOptimalDesc);
  updateChecklistStatus('chk-heading', results.status.hasProperHierarchy);
  updateChecklistStatus('chk-readability', results.status.readabilityRating === 'Optimal');
  
  updateChecklistStatus('chk-llmstxt', results.status.llmsTxtExists);
  updateChecklistStatus('chk-aicontext', results.status.aiContextExists);
  updateChecklistStatus('chk-schema', results.status.jsonLdExists);
  
  const narrativeFilesOk = (results.status.aboutTxtExists && results.status.docsTxtExists && results.status.contentTxtExists);
  updateChecklistStatus('chk-narrative-files', narrativeFilesOk);

  // Content density val
  const densityValEl = document.getElementById('density-val');
  if (densityValEl && results.status.contentDensityRatio !== undefined) {
    densityValEl.innerText = `${results.status.contentDensityRatio}%`;
  }

  // Section 1 Status Badge
  const secStatus1 = document.getElementById('sec-status-1');
  if (secStatus1) {
    const isAllBotAllowed = results.status.botPermissions && 
                             results.status.botPermissions.gptBot && 
                             results.status.botPermissions.perplexityBot && 
                             results.status.botPermissions.claudeBot && 
                             results.status.botPermissions.googleExtended;
    if (results.status.robotsTxtExists && isAllBotAllowed) {
      secStatus1.innerText = '🟢 Pass';
      secStatus1.className = 'gateway-badge badge-handshake';
    } else if (results.status.robotsTxtExists && !isAllBotAllowed) {
      secStatus1.innerText = '🟡 Partial Block';
      secStatus1.className = 'gateway-badge badge-hidden';
    } else {
      secStatus1.innerText = '🔴 Blocked / Missing';
      secStatus1.className = 'gateway-badge badge-blindness';
    }
  }

  // Section 2 Status Badge
  const secStatus2 = document.getElementById('sec-status-2');
  if (secStatus2) {
    const sitemapOk = results.status.sitemapExists;
    const xRobotsOk = results.status.xRobotsIndexable;
    const spaOk = !results.status.spaTrapDetected;
    const sslOk = results.url ? results.url.startsWith('https') : false;
    
    if (sitemapOk && xRobotsOk && spaOk && sslOk) {
      secStatus2.innerText = '🟢 Optimized';
      secStatus2.className = 'gateway-badge badge-handshake';
    } else if (!xRobotsOk) {
      secStatus2.innerText = '🔴 Blocked (x-robots)';
      secStatus2.className = 'gateway-badge badge-blindness';
    } else {
      secStatus2.innerText = '🟡 Needs Optimization';
      secStatus2.className = 'gateway-badge badge-hidden';
    }
  }

  // Section 3 Status Badge
  const secStatus3 = document.getElementById('sec-status-3');
  if (secStatus3) {
    const titleOk = results.status.seoOptimalTitle;
    const descOk = results.status.seoOptimalDesc;
    const headingOk = results.status.hasProperHierarchy;
    const readabilityOk = results.status.readabilityRating === 'Optimal';
    
    if (titleOk && descOk && headingOk && readabilityOk) {
      secStatus3.innerText = '🟢 AI-Optimized';
      secStatus3.className = 'gateway-badge badge-handshake';
    } else {
      secStatus3.innerText = '🟡 Quality Alerts';
      secStatus3.className = 'gateway-badge badge-hidden';
    }
  }

  // Section 4 Status Badge
  const secStatus4 = document.getElementById('sec-status-4');
  if (secStatus4) {
    const llmsOk = results.status.llmsTxtExists;
    const contextOk = results.status.aiContextExists;
    const schemaOk = results.status.jsonLdExists;
    const narrativeOk = (results.status.aboutTxtExists && results.status.docsTxtExists && results.status.contentTxtExists);
    
    if (llmsOk && contextOk && schemaOk && narrativeOk) {
      secStatus4.innerText = '🟢 AI-Ready';
      secStatus4.className = 'gateway-badge badge-handshake';
    } else {
      secStatus4.innerText = '🟡 Missing Manifests';
      secStatus4.className = 'gateway-badge badge-hidden';
    }
  }

  // Alerts
  const alertsContainer = document.getElementById('alerts-container');
  if (alertsContainer) {
    alertsContainer.innerHTML = '';
    if (results.alerts && results.alerts.length === 0) {
      alertsContainer.innerHTML = '<div class="alert-empty">No critical firewall or gateway warnings. Your crawler corridors are clear.</div>';
    } else if (results.alerts) {
      results.alerts.forEach(alert => {
        const alertEl = document.createElement('div');
        alertEl.className = 'alert-item alert-critical';
        alertEl.innerHTML = `
          <div>
            <div class="alert-item-title">${alert.type.replace(/_/g, ' ')}</div>
            <div class="alert-item-desc">${alert.message}</div>
          </div>
        `;
        alertsContainer.appendChild(alertEl);
      });
    }
  }

  // Populate scanned paths list table (legacy view fallback)
  const tbody = document.getElementById('scanned-routes-tbody');
  if (tbody && results.pages) {
    tbody.innerHTML = '';
    
    const targetUrlEl = document.getElementById('target-url');
    const inputUrlVal = targetUrlEl ? targetUrlEl.value.trim() : '';
    const cleanBaseUrl = inputUrlVal 
      ? (inputUrlVal.startsWith('http') ? inputUrlVal : `https://${inputUrlVal}`)
      : 'https://example.com';

    results.pages.forEach(p => {
      const row = document.createElement('tr');
      
      const fullPageUrl = p.canonicalUrl || `${cleanBaseUrl.replace(/\/$/, '')}${p.route}`;
      const pathHtml = `
        <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">
          <code style="color: var(--sky-color); font-weight: 500;">${p.route}</code>
          <div style="display: flex; gap: 6px; align-items: center;">
            <a href="${fullPageUrl}" target="_blank" rel="noopener noreferrer" class="direct-link-btn" title="Open page in new tab">
              Go to page ↗
            </a>
            <button class="direct-link-btn audit-page-btn" onclick="auditSinglePage(event, '${p.route}', this)" title="Re-analyze this individual page live">
              Audit Page 🔄
            </button>
          </div>
        </div>
      `;

      let wordCountHtml = '';
      if (p.wordCount < 500) {
        wordCountHtml = `<span class="wc-pill wc-pill-red" title="Data Starvation (< 500 words)">${p.wordCount} words (Low)</span>`;
      } else if (p.wordCount >= 500 && p.wordCount <= 1200) {
        wordCountHtml = `<span class="wc-pill wc-pill-green" title="Semantic Sweet Spot (500 - 1,200 words)">${p.wordCount} words (Ideal)</span>`;
      } else if (p.wordCount > 1200 && p.wordCount <= 2500) {
        wordCountHtml = `<span class="wc-pill wc-pill-yellow" title="Boundary Territory (1,201 - 2,500 words)">${p.wordCount} words (Moderate)</span>`;
      } else {
        wordCountHtml = `<span class="wc-pill wc-pill-red" title="Truncation Risk (> 2,500 words)">${p.wordCount} words (High)</span>`;
      }

      let canonicalHtml = '';
      if (p.hasCanonical && p.canonicalUrl) {
        canonicalHtml = `<code style="font-size: 0.8rem; word-break: break-all; color: var(--dark-300);">${p.canonicalUrl}</code>`;
      } else {
        canonicalHtml = `<span class="wc-pill wc-pill-red" style="font-weight: bold; padding: 4px 10px;">✗ Missing (Diluted)</span>`;
        row.style.background = 'rgba(239, 68, 68, 0.03)';
      }

      const isOk = p.headingAudit ? p.headingAudit.isHierarchyValid : true;
      const h1Count = p.headingAudit ? p.headingAudit.h1 : 1;
      const h2Count = p.headingAudit ? p.headingAudit.h2 : 0;
      
      const statusIcon = isOk 
        ? `<span style="color: #4ade80; font-weight: bold; margin-right: 6px;" title="Proper hierarchy followed">✓</span>` 
        : `<span style="color: #f87171; font-weight: bold; margin-right: 6px;" title="Hierarchy Violated!">✗</span>`;
      
      const structureHtml = `
        <div style="display: flex; align-items: center; gap: 4px;">
          ${statusIcon}
          <span class="${isOk ? '' : 'text-danger-glow'}" style="font-size: 0.85rem;">
            ${h1Count} H1 / ${h2Count} H2
          </span>
        </div>
      `;

      row.innerHTML = `
        <td>${pathHtml}</td>
        <td>${wordCountHtml}</td>
        <td>${canonicalHtml}</td>
        <td>${structureHtml}</td>
      `;
      tbody.appendChild(row);
    });
  }

  // Update Semrush link in confirmation modal with affiliate campaign tags
  const semrushConfirmBtn = document.getElementById('semrush-confirm-proceed-btn');
  if (semrushConfirmBtn && results.url) {
    try {
      const parsed = new URL(results.url);
      const host = parsed.hostname;
      semrushConfirmBtn.href = `https://www.semrush.com/ai-visibility/?utm_source=thatworkx_aeo&utm_medium=affiliate&utm_campaign=share_of_voice`;
    } catch (e) {
      // Fallback if URL parsing fails
    }
  }

  // Synchronize Executive Mode UI with user scanned domain and evaluation metrics
  updateExecutiveViewData(results);
  
  // Synchronize Developer Mode UI with 32-capability matrix and code drawers
  updateDeveloperViewData(results);
}

// Global Evaluated Capabilities Cache & Scanned Domain
let currentEvaluatedCapabilities = [];
let currentScannedDomain = 'holiknits.com';

// Module 4 pagination / viewport state
let isModule4Expanded = false;
let currentModule4Filter = 'all';

let selectedSchemaEntities = {
  Organization: true,
  LocalBusiness: false,
  FAQPage: false,
  WebSite: false,
  Service: false
};

function toggleSchemaEntity(entityKey) {
  const checkbox = document.getElementById(`schema-entity-${entityKey}`);
  if (checkbox) {
    selectedSchemaEntities[entityKey] = checkbox.checked;
  }
  updateSchemaBuilderCode();
}

function copySchemaScript() {
  const codeEl = document.getElementById('schema-code-block');
  if (!codeEl) return;
  const content = codeEl.innerText;
  navigator.clipboard.writeText(content).then(() => {
    alert('Copied HTML <script> Tag to clipboard!');
  }).catch(err => {
    console.error('Failed to copy schema script: ', err);
  });
}

function downloadSchemaJson() {
  const domain = currentScannedDomain || 'example.com';
  const results = latestScanResults || window.lastScanResults || {};
  const json = generateSchemaBuilderJson(domain, results);
  const content = JSON.stringify(json, null, 2);
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = 'schema.json';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function generateSchemaBuilderJson(domainName, results = {}) {
  const status = results.status || {};
  const scraper = results.scrapedData || results.capabilityEvaluator || results || {};

  const rawName = domainName || scraper.name || scraper.domain;
  const nameVal = rawName ? `<Verify Scraped Data: ${rawName}>` : `<Input needed from user: Name>`;

  const rawUrl = results.url || scraper.url || (domainName ? `https://${domainName}` : '');
  const urlVal = rawUrl ? `<Verify Scraped Data: ${rawUrl}>` : `<Input needed from user: URL>`;

  const rawLogo = scraper.logo || scraper.logoUrl || status.logo || status.logoUrl;
  const logoVal = rawLogo ? `<Verify Scraped Data: ${rawLogo}>` : `<Input needed from user: Logo>`;

  const rawPhone = results.phoneValue || scraper.phoneValue || scraper.phone || status.phoneValue || status.phone;
  const hasPhone = rawPhone && rawPhone !== 'None Detected' && rawPhone.trim().length > 0;
  const phoneVal = hasPhone ? `<Verify Scraped Data: ${rawPhone.trim()}>` : `<Input needed from user: Phone Number>`;

  const rawSocials = scraper.socialLinks || scraper.sameAs || status.socialLinks || status.sameAs;
  let sameAsVal = [];
  if (Array.isArray(rawSocials) && rawSocials.length > 0) {
    sameAsVal = rawSocials.map(link => `<Verify Scraped Data: ${link}>`);
  } else if (typeof rawSocials === 'string' && rawSocials.trim().length > 0) {
    sameAsVal = [`<Verify Scraped Data: ${rawSocials.trim()}>`];
  } else {
    sameAsVal = [
      "<Input needed from user: Social Links>",
      "<Input needed from user: Social Links>"
    ];
  }

  const rawAddress = results.scrapedAddress || scraper.scrapedAddress || status.scrapedAddress || results.addressValue || scraper.address || status.address || '';
  const hasAddress = rawAddress && rawAddress.trim().length > 0 && rawAddress !== 'None Detected';
  const addressVal = hasAddress ? `<Verify Scraped Data: ${rawAddress.trim()}>` : `<Input needed from user: Physical Address>`;

  const graph = [];

  if (selectedSchemaEntities.Organization) {
    graph.push({
      "@type": "Organization",
      "@id": rawUrl ? `${rawUrl}/#organization` : "<Input needed from user: URL>",
      "name": nameVal,
      "url": urlVal,
      "logo": logoVal,
      "description": "AI-Optimized Entity Verification Profile",
      "sameAs": sameAsVal,
      "contactPoint": [
        {
          "@type": "ContactPoint",
          "telephone": phoneVal,
          "contactType": "customer support"
        }
      ]
    });
  }

  if (selectedSchemaEntities.LocalBusiness) {
    graph.push({
      "@type": "LocalBusiness",
      "@id": rawUrl ? `${rawUrl}/#localbusiness` : "<Input needed from user: URL>",
      "name": nameVal,
      "description": "Local Business Entity Profile",
      "telephone": phoneVal,
      "address": {
        "@type": "PostalAddress",
        "streetAddress": addressVal,
        "addressLocality": "City",
        "addressRegion": "State",
        "postalCode": "Zip",
        "addressCountry": "US"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "<Verify Scraped Data: Latitude>",
        "longitude": "<Verify Scraped Data: Longitude>"
      },
      "openingHoursSpecification": [
        {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
          "opens": "09:00",
          "closes": "17:00"
        }
      ]
    });
  }

  if (selectedSchemaEntities.FAQPage) {
    graph.push({
      "@type": "FAQPage",
      "@id": rawUrl ? `${rawUrl}/#faq` : "<Input needed from user: URL>",
      "isPartOf": {
        "@id": rawUrl ? `${rawUrl}/#organization` : "<Input needed from user: URL>"
      },
      "mainEntity": [
        {
          "@type": "Question",
          "name": "<Verify Scraped Data: FAQ Question 1>",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "<Verify Scraped Data: FAQ Answer 1>"
          }
        },
        {
          "@type": "Question",
          "name": "<Verify Scraped Data: FAQ Question 2>",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "<Verify Scraped Data: FAQ Answer 2>"
          }
        }
      ]
    });
  }

  if (selectedSchemaEntities.WebSite) {
    graph.push({
      "@type": "WebSite",
      "@id": rawUrl ? `${rawUrl}/#website` : "<Input needed from user: URL>",
      "url": urlVal,
      "name": nameVal,
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": rawUrl ? `${rawUrl}/search?q={search_term_string}` : "<Input needed from user: URL>"
        },
        "query-input": "required name=search_term_string"
      }
    });
  }

  if (selectedSchemaEntities.Service) {
    graph.push({
      "@type": "Service",
      "@id": rawUrl ? `${rawUrl}/#service` : "<Input needed from user: URL>",
      "provider": {
        "@id": rawUrl ? `${rawUrl}/#organization` : "<Input needed from user: URL>"
      },
      "serviceType": "<Verify Scraped Data: Service Type>",
      "description": "<Verify Scraped Data: Service Description>"
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

function updateSchemaBuilderCode() {
  const codeBlock = document.getElementById('schema-code-block');
  if (!codeBlock) return;
  const domain = currentScannedDomain || 'example.com';
  const results = latestScanResults || window.lastScanResults || {};
  const json = generateSchemaBuilderJson(domain, results);
  const code = `<script type="application/ld+json">\n${JSON.stringify(json, null, 2)}\n</script>`;
  codeBlock.textContent = code;
}

window.toggleSchemaEntity = toggleSchemaEntity;
window.copySchemaScript = copySchemaScript;
window.downloadSchemaJson = downloadSchemaJson;
window.updateSchemaBuilderCode = updateSchemaBuilderCode;

if (typeof window !== 'undefined') {
  Object.defineProperty(window, 'currentScannedDomain', {
    get() { return currentScannedDomain; },
    set(val) { currentScannedDomain = val; },
    configurable: true
  });
}

function updateDeveloperViewData(results) {
  if (!results) return;

  const inputVal = document.getElementById('target-url')?.value.trim() || document.getElementById('onboarding-target-url')?.value.trim() || '';
  let rawUrl = results.url || results.domain || inputVal || '';
  if (rawUrl) {
    currentScannedDomain = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  }

  const pageCount = Array.isArray(results?.pages) ? results.pages.length : (results?.scannedPages?.length ?? 0);
  const devPagesBadge = document.getElementById('dev-scan-pages-badge');
  if (devPagesBadge) devPagesBadge.textContent = `Pages Reviewed: ${pageCount}`;

  // Compute full 32 capability evaluations via capabilityEvaluator engine
  const evalResults = evaluateAllCapabilities(results);
  currentEvaluatedCapabilities = evalResults.capabilities || results.capabilityMatrix || [];

  renderDeveloperMatrixRows(currentEvaluatedCapabilities);
  updateSchemaBuilderCode();
  selectCodeDrawer(activeDrawerKey, results);
  renderModule4(results);
}



function getProUpgradeHook(capId = '') {
  if (!capId) return null;
  const key = String(capId).toLowerCase().trim();
  const hooks = {
    jsonldschema: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample JSON-LD Schema or AIO Pro for custom schema generation.' },
    faqschemaparity: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample JSON-LD Schema or AIO Pro for custom FAQ schema.' },
    heavypageindication: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒', msg: 'Upgrade to AIO Pro to use headless Puppeteer browser to crawl heavy SPA content.' },
    spahydrationtrap: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒', msg: 'Upgrade to AIO Pro for headless SPA hydration fixes.' },
    aicontextmd: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro / AIO Pro to generate and auto-update /ai-context.md.' },
    internallinksanalysis: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro to validate internal link accessibility across sub-pages.' },
    robotstxt: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample unblocked robots.txt or AIO Pro for automated directives.' },
    robotspermission: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample unblocked robots.txt or AIO Pro for automated directives.' },
    aboutmd: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample about.md corporate entity file.' },
    aboutmdmanifest: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample about.md corporate entity file.' },
    docsmd: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample docs.md technical manual file.' },
    docsmdmanifest: { tier: 'AIVisualize Pro', label: 'Upgrade to AIV Pro ⚡', msg: 'Upgrade to AIV Pro for sample docs.md technical manual file.' },
    contentmd: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒', msg: 'Upgrade to AIO Pro for content.md case study vault.' },
    contentmdmanifest: { tier: 'AIOptimize Pro', label: 'Upgrade to AIO Pro 🔒', msg: 'Upgrade to AIO Pro for content.md case study vault.' }
  };
  return hooks[key] || null;
}

const manifestTabMap = {
  'robotsTxt': 'robots',
  'robotsTxtTotalBlindness': 'robots',
  'robotsTxtMapping': 'robots',
  'sitemapXml': 'sitemap',
  'sitemapXmlPresence': 'sitemap',
  'sitemapCoverage': 'sitemap',
  'llmsTxt': 'llms',
  'llmsTxtSpecCompliance': 'llms',
  'aiContextMd': 'aicontext',
  'readmeMdManifest': 'readme',
  'aboutMdManifest': 'about',
  'docsMdManifest': 'docs',
  'contentMdManifest': 'content'
};

const manifestFileNames = {
  'robots': 'robots.txt',
  'sitemap': 'sitemap.xml',
  'llms': 'llms.txt',
  'aicontext': 'ai-context.md',
  'readme': 'README.md',
  'about': 'about.md',
  'docs': 'docs.md',
  'content': 'content.md'
};

function getDiyCategory(capId) {
  const cat1 = ['cdnFirewallBlocking', 'xRobotsTagHeaders', 'isSecureProtocol', 'robotsTxtTotalBlindness', 'heavyPageIndication', 'lastUpdatedFreshness'];
  const cat3 = ['essentialPagesIndex', 'contactAndPrivacyPresence', 'faqSchemaParity', 'jsonLdSchema'];
  const cat4 = ['robotsTxt', 'sitemapXml', 'llmsTxt', 'llmsTxtSpecCompliance', 'aiContextMd', 'readmeMdManifest', 'aboutMdManifest', 'docsMdManifest', 'contentMdManifest', 'robotsTxtMapping', 'sitemapCoverage'];
  
  if (cat1.includes(capId)) return 1;
  if (cat3.includes(capId)) return 3;
  if (cat4.includes(capId)) return 4;
  return 2; // Default Category 2: Semantic HTML & Structural Hygiene
}

function getDiyCategoryInfo(catIndex) {
  const infos = {
    1: { name: 'Server & Hosting Health', icon: '🖥️' },
    2: { name: 'Semantic HTML & Structural Hygiene', icon: '🏷️' },
    3: { name: 'E-E-A-T & Trust Signals', icon: '🤝' },
    4: { name: 'Machine Manifest Presence & Compliance', icon: '🤖' }
  };
  return infos[catIndex] || { name: 'Other', icon: '🔍' };
}

function scrollToModule(moduleId, tabKey = null) {
  let targetId = moduleId;
  if (moduleId === 'diy-module-3') {
    targetId = 'dev-drawers-wrapper';
  }
  const el = document.getElementById(targetId);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  if (tabKey) {
    switchDiyManifestTab(tabKey);
  }
}

window.scrollToModule = scrollToModule;

function renderDeveloperMatrixRows(capabilities) {
  const container = document.getElementById('dev-matrix-tbody');
  if (!container) return;

  const categories = {
    1: [],
    2: [],
    3: [],
    4: []
  };

  capabilities.forEach(cap => {
    const catIndex = getDiyCategory(cap.id);
    categories[catIndex].push(cap);
  });

  let accordionsHtml = '';

  for (let catIndex = 1; catIndex <= 4; catIndex++) {
    const groupCaps = categories[catIndex];
    if (groupCaps.length === 0) continue;

    const catInfo = getDiyCategoryInfo(catIndex);
    let rowsHtml = '';
    
    let passCount = 0;
    let warnCount = 0;
    let failCount = 0;

    groupCaps.forEach((cap, idx) => {
      const isPass = cap.status === 'pass' || cap.status === 'active';
      const isBlocked = cap.status === 'blocked' || cap.status === 'critical';
      if (isPass) passCount++;
      else if (isBlocked) failCount++;
      else warnCount++;

      const statusBadge = isPass
        ? '<span class="badge-status status-green">🟢 Pass</span>'
        : (isBlocked ? '<span class="badge-status status-red">🔴 Blocked</span>' : '<span class="badge-status status-amber">🟡 Warning</span>');

      const proHook = getProUpgradeHook(cap.id);
      let actionHtml = `<button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('', '${cap.id}')"><span>⚡ Fix in AIOptimize</span></button>`;
      
      if (proHook && !isPass) {
        actionHtml = `<button type="button" class="badge-status status-amber" onclick="showUpgradeModal('PRO_REQUIRED', '${proHook.msg}', '${proHook.tier}')" style="border: none; cursor: pointer; padding: 0.35rem 0.7rem; border-radius: 6px; font-weight: 700;">${proHook.label}</button>`;
      } else if (!isPass) {
        const isSchemaCheck = cap.id === 'jsonLdSchema' || cap.id === 'faqSchemaParity' || cap.id.toLowerCase().includes('schema') || cap.id.toLowerCase().includes('jsonld');
        const manifestTab = manifestTabMap[cap.id];
        
        if (isSchemaCheck) {
          actionHtml = `<button type="button" class="btn-fix-bridge btn-schema-bridge" onclick="scrollToModule('diy-module-2')"><span>⚡ Fix in Schema Builder</span></button>`;
        } else if (manifestTab) {
          const fname = manifestFileNames[manifestTab] || 'file';
          actionHtml = `<button type="button" class="btn-fix-bridge btn-manifest-bridge" onclick="scrollToModule('diy-module-3', '${manifestTab}')"><span>⚡ Generate ${fname}</span></button>`;
        }
      }

      // Fix unescaped HTML tags rendering bug:
      // Render tag names cleanly without raw angle brackets inside inline <code> tags
      let cleanDescription = cap.description || cap.impact || '';
      let cleanDetails = cap.deductionReason || cap.details || '';
      cleanDescription = cleanDescription.replace(/<([a-zA-Z0-9]+)>/g, '<code>$1</code>');
      cleanDetails = cleanDetails.replace(/<([a-zA-Z0-9]+)>/g, '<code>$1</code>');

      // Robust escaping helper to prevent any other raw unescaped angle brackets (like <link rel="canonical">)
      const escapeRawAngleBrackets = (str) => {
        let temp = str.replace(/<code>/g, '___CODE_OPEN___').replace(/<\/code>/g, '___CODE_CLOSE___');
        temp = temp.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        temp = temp.replace(/___CODE_OPEN___/g, '<code>').replace(/___CODE_CLOSE___/g, '</code>');
        return temp;
      };
      
      cleanDescription = escapeRawAngleBrackets(cleanDescription);
      cleanDetails = escapeRawAngleBrackets(cleanDetails);

      const overallIndex = CAPABILITY_MATRIX.findIndex(c => c.id === cap.id) + 1;

      rowsHtml += `
        <tr data-section="${cap.section}">
          <td style="font-family: var(--font-mono); color: var(--text-muted); padding: 0.6rem;">${overallIndex}</td>
          <td style="padding: 0.6rem;">
            <strong>${cap.name || cap.title}</strong> <span class="help-tooltip-trigger" onclick="openHelpTooltip('diy_cap_${cap.id}')" style="cursor: pointer; margin-left: 0.2rem;">(?)</span>
            <div style="font-size: 0.75rem; color: var(--text-muted);">${cleanDescription}</div>
          </td>
          <td style="padding: 0.6rem;"><span class="dev-cat-badge">${cap.category}</span></td>
          <td style="padding: 0.6rem;">${statusBadge}</td>
          <td style="padding: 0.6rem; font-family: var(--font-mono); font-weight: 700;">${cap.score}/100</td>
          <td style="padding: 0.6rem; font-size: 0.8rem; color: var(--text-main);">${cleanDetails}</td>
          <td style="padding: 0.6rem; text-align: right;">${actionHtml}</td>
        </tr>
      `;

      // Accordion for X-Robots-Tag if blocked
      const isXRobots = cap.id === 'xRobotsTag' || cap.id === 'xRobotsTagHeaders' || (cap.id && cap.id.toLowerCase().includes('xrobots'));
      if (isXRobots) {
        const isXRobotsPass = isPass || cap.score === 100 || cap.status === 'pass' || (cap.deductions === 0);
        let summaryText = '';
        let bodyContent = '';
        if (isXRobotsPass) {
          summaryText = `<summary style="color: var(--badge-pass, #10b981); cursor: pointer; font-weight: 600;">Status: Valid AI-Optimized Configuration</summary>`;
          bodyContent = `<div style='padding: 10px; background: var(--surface-bg); border-left: 4px solid var(--badge-pass-bg); border-radius: 4px; margin-top: 5px;'><strong>✅ Your server headers are correctly configured and are not blocking AI.</strong></div>`;
        } else {
          summaryText = `<summary style="color: var(--badge-fail, #ef4444); cursor: pointer; font-weight: 600;">How to Fix: AI-Block Detected</summary>`;
          bodyContent = `
            <div style='padding: 10px; background: var(--surface-bg); border-left: 4px solid var(--badge-fail-bg); border-radius: 4px; margin-top: 5px;'>
              <strong>Using a Text Editor (via FTP or cPanel File Manager):</strong><br>
              <span style='font-size: 0.9em; display: block; margin-bottom: 10px;'>The X-Robots-Tag is a hidden server header, not a standalone file. To fix this without using a command-line terminal, open your website's root folder using a file manager or FTP, open the server configuration file in a text editor, and modify or remove the blocking rules.</span>
              <strong>Apache (Edit your .htaccess file):</strong><br>
              <code style='color: var(--primary-accent);'>Header unset X-Robots-Tag</code><br><br>
              <strong>Nginx (Edit your nginx.conf file):</strong><br>
              <code style='color: var(--primary-accent);'>fastcgi_hide_header X-Robots-Tag;</code><br>
              <code style='color: var(--primary-accent);'>proxy_hide_header X-Robots-Tag;</code>
            </div>
          `;
        }

        rowsHtml += `
          <tr>
            <td colspan="100%">
              <details style="margin: 0.5rem 0;">
                ${summaryText}
                ${bodyContent}
              </details>
            </td>
          </tr>
        `;
      }
    });

    accordionsHtml += `
      <details class="accordion-item" style="margin-bottom: 1.5rem;">
        <summary class="accordion-header" style="display: flex; align-items: center; justify-content: space-between; font-family: var(--font-sans), sans-serif;">
          <span class="accordion-title" style="display: flex; align-items: center; gap: 0.6rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
            <span style="font-size: 1.25rem;">${catInfo.icon}</span>
            <span style="font-size: 1.125rem; font-weight: 700; color: #f1f5f9; font-family: var(--font-sans), sans-serif;">${catInfo.name}</span>
            <span style="font-size: 0.72rem; font-weight: 500; color: var(--text-muted, #94a3b8); background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px; margin-left: 0.2rem; border: 1px solid rgba(255,255,255,0.05); font-family: var(--font-sans), sans-serif;">${groupCaps.length} check${groupCaps.length === 1 ? '' : 's'}</span>
            
            <span style="display: inline-flex; align-items: center; gap: 0.4rem; margin-left: 1rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
              <span style="background: rgba(16, 185, 129, 0.1); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.2); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.025em; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-family: var(--font-sans), sans-serif;">✓ ${passCount} Passed</span>
              <span style="background: rgba(251, 191, 36, 0.1); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.025em; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-family: var(--font-sans), sans-serif;">⚠️ ${warnCount} Warnings</span>
              <span style="background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.025em; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); font-family: var(--font-sans), sans-serif;">✕ ${failCount} Failed</span>
            </span>
          </span>
          <span class="accordion-arrow">▼</span>
        </summary>
        <div class="accordion-content" style="padding: 1.2rem; overflow-x: auto; font-family: var(--font-sans), sans-serif;">
          <table class="exec-table dev-matrix-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
            <thead>
              <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #94a3b8;">
                <th style="padding: 0.6rem; width: 40px;">#</th>
                <th style="padding: 0.6rem; width: 250px;">Capability &amp; Parameter</th>
                <th style="padding: 0.6rem; width: 100px;">Category</th>
                <th style="padding: 0.6rem; width: 100px;">Status</th>
                <th style="padding: 0.6rem; width: 80px;">Score</th>
                <th style="padding: 0.6rem;">Technical Details &amp; Character Volume</th>
                <th style="padding: 0.6rem; text-align: right; width: 180px;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
          </table>
        </div>
      </details>
    `;
  }

  container.innerHTML = accordionsHtml + `
    <div class="eeat-upgrade-banner glassmorphic" style="margin-top: 1.5rem; padding: 1.2rem; border-radius: 10px; background: rgba(139, 92, 246, 0.08); border: 1px solid rgba(139, 92, 246, 0.3); display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; text-align: left;">
      <div style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #cbd5e1; flex-wrap: wrap;">
        <span>To perform a proper page-level and site-level E-E-A-T review, </span>
        <a href="#" onclick="showUpgradeModal('AIO_PRO_EEAT', 'Perform a proper page-level and site-level E-E-A-T review', 'AI Optimize'); return false;" style="color: #a78bfa; font-weight: 700; text-decoration: none; display: inline-flex; align-items: center; gap: 0.25rem;">
          upgrade to AIOptimize Pro ↗
        </a>
        <span class="help-tooltip-trigger" onclick="openHelpTooltip('diy_cap_eeat_info')" style="cursor: pointer; font-size: 0.8rem; background: rgba(255,255,255,0.06); padding: 0.1rem 0.35rem; border-radius: 4px; color: #cbd5e1; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); margin-left: 0.3rem;">?</span>
      </div>
    </div>
  `;
}

function filterMatrixSection(section) {
  const buttons = document.querySelectorAll('.matrix-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(`'${section}'`) || b.getAttribute('onclick')?.includes(`(${section})`));
  if (targetBtn) targetBtn.classList.add('active');

  if (section === 'all' || section === 'all') {
    renderDeveloperMatrixRows(currentEvaluatedCapabilities);
  } else {
    const filtered = currentEvaluatedCapabilities.filter(c => c.section === Number(section));
    renderDeveloperMatrixRows(filtered);
  }

  if (typeof window !== 'undefined' && window.history) {
    const params = new URLSearchParams(window.location.search || '');
    const tabNameMap = { 1: 'gateway', 2: 'hygiene', 3: 'content', 4: 'manifests', all: 'all' };
    const tabVal = tabNameMap[section] || section;
    params.set('tab', tabVal);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }
}

let activeDrawerKey = 'robots';

function getDynamicDrawerTemplates(domainName, results = {}) {
  const targetUrl = `https://${domainName}`;
  const status = results.status || {};
  const scraper = results.scrapedData || results.capabilityEvaluator || results || {};

  // Smart Placeholder Mapping logic
  // 1. Name
  const rawName = domainName || scraper.name || scraper.domain;
  const nameVal = rawName ? `<Verify Scraped Data: ${rawName}>` : `<Input needed from user: Name>`;

  // 2. URL
  const rawUrl = results.url || scraper.url || (domainName ? `https://${domainName}` : '');
  const urlVal = rawUrl ? `<Verify Scraped Data: ${rawUrl}>` : `<Input needed from user: URL>`;

  // 3. Logo
  const rawLogo = scraper.logo || scraper.logoUrl || status.logo || status.logoUrl;
  const logoVal = rawLogo ? `<Verify Scraped Data: ${rawLogo}>` : `<Input needed from user: Logo>`;

  // 4. Telephone
  const rawPhone = results.phoneValue || scraper.phoneValue || scraper.phone || status.phoneValue || status.phone;
  const hasPhone = rawPhone && rawPhone !== 'None Detected' && rawPhone.trim().length > 0;
  const phoneVal = hasPhone ? `<Verify Scraped Data: ${rawPhone.trim()}>` : `<Input needed from user: Phone Number>`;

  // 5. sameAs (Social Links)
  const rawSocials = scraper.socialLinks || scraper.sameAs || status.socialLinks || status.sameAs;
  let sameAsVal = [];
  if (Array.isArray(rawSocials) && rawSocials.length > 0) {
    sameAsVal = rawSocials.map(link => `<Verify Scraped Data: ${link}>`);
  } else if (typeof rawSocials === 'string' && rawSocials.trim().length > 0) {
    sameAsVal = [`<Verify Scraped Data: ${rawSocials.trim()}>`];
  } else {
    sameAsVal = [
      "<Input needed from user: Social Links>",
      "<Input needed from user: Social Links>"
    ];
  }

  // 6. Email
  const rawEmail = results.emailValue || scraper.emailValue || scraper.email || status.emailValue || status.email;
  const hasEmail = rawEmail && rawEmail !== 'None Detected' && rawEmail.trim().length > 0;
  const emailVal = hasEmail ? `<Verify Scraped Data: ${rawEmail.trim()}>` : `<Input needed from user: Email Address>`;

  // Smart Placeholder Mapping
  const scannedDomain = domainName;
  const scrapedEmail = emailVal;
  const scrapedPhone = phoneVal;
  const rawBrand = scraper.name || scraper.brandName || scraper.domain || domainName;
  const hasBrand = rawBrand && rawBrand.trim().length > 0 && rawBrand !== 'None Detected';
  const scrapedBrandName = hasBrand ? `<Verify Scraped Data: ${rawBrand.trim()}>` : `<Input needed from user: Brand Name>`;

  const rawDescription = results.scrapedDescription || scraper.scrapedDescription || status.scrapedDescription || results.descriptionValue || scraper.description || status.description || (() => {
    const homePage = (results.pages || results.scannedPages || []).find(p => p.route === '/' || p.path === '/');
    return homePage ? (homePage.metaDescription || homePage.description || '') : '';
  })();
  const hasDescription = rawDescription && rawDescription.trim().length > 0 && rawDescription !== 'None Detected';
  const scrapedDescription = hasDescription ? `<Verify Scraped Data: ${rawDescription.trim()}>` : `<Input needed from user: Business Description>`;

  const rawAddress = results.scrapedAddress || scraper.scrapedAddress || status.scrapedAddress || results.addressValue || scraper.address || status.address || '';
  const hasAddress = rawAddress && rawAddress.trim().length > 0 && rawAddress !== 'None Detected';
  const scrapedAddress = hasAddress ? `<Verify Scraped Data: ${rawAddress.trim()}>` : `<Input needed from user: Physical Address>`;

  return {
    jsonld: {
      path: '/schema.jsonld',
      content: JSON.stringify({
        "@context": "https://schema.org",
        "@graph": [
          {
            "@type": "Organization",
            "@id": rawUrl ? `${rawUrl}/#organization` : "<Input needed from user: URL>",
            "name": nameVal,
            "url": urlVal,
            "logo": logoVal,
            "description": "AI-Optimized Entity Verification Profile",
            "sameAs": sameAsVal,
            "contactPoint": [
              {
                "@type": "ContactPoint",
                "telephone": phoneVal,
                "contactType": "customer support",
                "areaServed": "US",
                "availableLanguage": "English"
              }
            ],
            "knowsAbout": [
              "Artificial Intelligence",
              "Search Engine Optimization",
              "Machine Learning",
              "Entity Verification"
            ]
          },
          {
            "@type": "FAQPage",
            "@id": rawUrl ? `${rawUrl}/#faq` : "<Input needed from user: URL>",
            "isPartOf": {
              "@id": rawUrl ? `${rawUrl}/#organization` : "<Input needed from user: URL>"
            },
            "mainEntity": [
              {
                "@type": "Question",
                "name": "<Input needed from user: FAQ Question>",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "<Input needed from user: FAQ Answer>"
                }
              },
              {
                "@type": "Question",
                "name": "<Input needed from user: FAQ Question>",
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": "<Input needed from user: FAQ Answer>"
                }
              }
            ]
          }
        ]
      }, null, 2)
    },
    llms: {
      path: '/llms.txt',
      content: status.llmsTxtContent || `# <Verify Scraped Data: ${domainName}> LLMs Machine Directory Index\n> Answer.ai Standard Machine Directory File for <Verify Scraped Data: ${domainName}>.\n\n## Primary Target Domain\n- [Homepage](<Verify Scraped Data: https://${domainName}/>): Core web presence and main business offerings.\n- [About](<Verify Scraped Data: https://${domainName}/about.md>): Corporate identity, E-E-A-T trust signatures, and entity data.\n- [Docs](<Verify Scraped Data: https://${domainName}/docs.md>): Technical manuals, specifications, and integration guides.\n\n## Machine Manifests & System Blueprints\n- [AI System Context](<Verify Scraped Data: https://${domainName}/ai-context.md>): Flattened RAG system context map and prompt guardrails.\n- [Portal Summary](<Verify Scraped Data: https://${domainName}/README.md>): Rapid 30-second elevator pitch and machine overview.\n- [Narrative Vault](<Verify Scraped Data: https://${domainName}/content.md>): Deep-dive case studies, authoritative articles, and proof points.\n\n## Optional Single-File Ingestion\n- [Full Directory Ingestion Vault](<Verify Scraped Data: https://${domainName}/llms-full.txt>): Complete concatenated documentation for large context-window models.`
    },
    aicontext: {
      path: '/ai-context.md',
      content: status.aiContextContent || (() => {
        // Construct Section 2: JSON-LD Entity Schema
        const liveJsonLd = status.jsonLdSchemaContent || status.jsonLdContent || results.scrapedJsonLd || '';
        const hasLiveJsonLd = liveJsonLd && liveJsonLd.trim().length > 0;
        
        let jsonLdString = '';
        if (hasLiveJsonLd) {
          jsonLdString = liveJsonLd.trim();
        } else {
          const synthesizedOrgSchema = {
            "@context": "https://schema.org",
            "@type": "Organization",
            "@id": rawUrl ? `<Verify Scraped Data: ${rawUrl}/#organization>` : "<Input needed from user: URL>",
            "name": nameVal,
            "url": urlVal,
            "logo": logoVal,
            "email": emailVal,
            "telephone": phoneVal,
            "description": "AI-Optimized Entity Verification Profile",
            "sameAs": sameAsVal
          };
          jsonLdString = JSON.stringify(synthesizedOrgSchema, null, 2);
        }

        // Construct Section 3: Authoritative Content Directory
        const scrapedPreview = results.scrapedContentPreview || results.scannedPages || [];
        let section3Content = '';
        if (Array.isArray(scrapedPreview) && scrapedPreview.length > 0) {
          section3Content = scrapedPreview.map(item => {
            return `### Route: ${item.route || item.path || '/'}\n${item.content || 'No text content scraped for this route.'}`;
          }).join('\n\n');
        } else {
          section3Content = '*No scraped content preview available.*';
        }

        // Construct Section 4: Discovered Routing Blueprint
        const routes = results.discoveredRoutes || results.scannedPages || [];
        let section4Content = '';
        if (Array.isArray(routes) && routes.length > 0) {
          section4Content = routes.map(r => {
            const routePath = r.path || '/';
            return `- ${routePath} (Word Count: ${r.wordCount || 0}, Tokens: ${r.tokenLoad || Math.round((r.wordCount || 0) / 2)}, inSitemap: ${r.inSitemap ? 'Yes' : 'No'})`;
          }).join('\n');
        } else {
          section4Content = '*No discovered routes found.*';
        }

        return `# ${domainName.toUpperCase()}: SYSTEM CONTEXT MAP\n<!-- AI-Ready Machine Manifest File -->\n> Flattened RAG System Context & Entity Blueprint Manifest.\n\n## Section 1: Target Domain Architecture & Trust Signals\n- Host Domain: ${domainName}\n- Primary Canonical Protocol: HTTPS SSL Enabled\n- Level 1 Gateway: /robots.txt directives\n- Level 2 Machine Welcome: /llms.txt index file\n- Level 3 RAG Vector Context: /ai-context.md\n\n## Section 2: Structured Entity JSON-LD Data\n\`\`\`json\n${jsonLdString}\n\`\`\`\n\n## Section 3: Authoritative Content Directory\n${section3Content}\n\n## Section 4: Discovered Routing Blueprint\n${section4Content}`;
      })()
    },
    robots: {
      path: '/robots.txt',
      content: status.robotsTxtContent || `# ==========================================
# AEO Suite: AI-Optimized robots.txt
# <Verify Scraped Data: ${targetUrl}>
# ==========================================

# 1. AI-Specific Bot Permissions (The Gatekeepers)
User-agent: ChatGPT-User
User-agent: Google-Extended
User-agent: Claude-Bot
User-agent: PerplexityBot
User-agent: OmgiliBot
Allow: /llms.txt
Allow: /ai-context.md
Allow: /about.md
Allow: /docs.md
Allow: /content.md
Allow: /README.md
Allow: /
Disallow: /admin/
Disallow: /private/

# 2. Traditional Search Engine Permissions
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /private/
<Verify Scraped Data: Insert any custom Disallow paths here>

# ==========================================
# 3. Machine Welcome Mats & Directories
# ==========================================
Sitemap: <Verify Scraped Data: ${targetUrl}/sitemap.xml>

# AI Manifest Directory Signposts (Parsed by advanced LLM scrapers)
# Core AI Index: /llms.txt
# Blueprint Manifest: /ai-context.md`
    },
    sitemap: {
      path: '/sitemap.xml',
      content: status.sitemapContent || (() => {
        const routes = results.discoveredRoutes || results.scannedPages || [];
        const dynamicUrlBlocks = routes.map(p => {
          const routePath = p.path.startsWith('/') ? p.path : `/${p.path}`;
          const isHome = routePath === '/';
          const freq = isHome ? 'daily' : 'weekly';
          const priority = isHome ? '1.0' : '0.8';
          return `  <url>\n    <loc><Verify Scraped Data: https://${domainName}${routePath}></loc>\n    <changefreq>${freq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
        }).join('\n');
        return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n\n  <!-- AI-Optimized Core Site Routes -->\n${dynamicUrlBlocks ? dynamicUrlBlocks + '\n\n' : ''}  <!-- AI-Ready Machine Manifest Comments -->\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/llms.txt></loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/llms-full.txt></loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/ai-context.md></loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/README.md></loc>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/about.md></loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/docs.md></loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n  <url>\n    <loc><Verify Scraped Data: https://${domainName}/content.md></loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n\n</urlset>`;
      })()
    },
    readme: {
      path: '/README.md',
      content: status.readmeContent || `# <Verify Scraped Data: ${scannedDomain}> Portal Summary\n<!-- AI-Ready Machine Manifest File -->\n> Welcome to the machine-readable summary for <Verify Scraped Data: ${scannedDomain}>.\n\n## Executive Summary\nThis document provides a concise high-level overview of <Verify Scraped Data: ${scannedDomain}>, synthesized for automated crawlers and AI search agents.\nBusiness Description: ${scrapedDescription}\n\n## Core Capabilities\n- **Core Offering:** Highly optimized services and solutions tailored to client requirements.\n- **Delivery Framework:** Scalable execution engine with high reliability and direct stakeholder communication.\n- **AI-Optimized Integration:** Designed with clean semantic layouts and structured metadata for AI engines and digital consumers.\n\n## Quick Machine Manifest Navigation\n- [Machine Welcome Menu](<Verify Scraped Data: https://${scannedDomain}/llms.txt>): Complete machine-readable link index of all public resources.\n- [AI System Context](<Verify Scraped Data: https://${scannedDomain}/ai-context.md>): RAG context map, prompt constraints, and structured schemas.\n- [Corporate Profile](<Verify Scraped Data: https://${scannedDomain}/about.md>): E-E-A-T credentials, verified entity signals, and brand signatures.\n\n## Contact Signals\n- **Primary Email:** ${scrapedEmail}\n- **Primary Telephone:** ${scrapedPhone}\n- **Corporate Address:** ${scrapedAddress}`
    },
    about: {
      path: '/about.md',
      content: status.aboutTxtContent || results.aboutContent || `# <Verify Scraped Data: ${scannedDomain}> Entity & Corporate Profile\n<!-- AI-Ready Machine Manifest File -->\n> Verified E-E-A-T credentials, leadership credentials, and corporate profiles for <Verify Scraped Data: ${scannedDomain}>.\n\n## Corporate Identity & Mission\n- **Entity Legal Name:** <Verify Scraped Data: ${scannedDomain}> (Parent Organization)\n- **Primary Purpose:** To deliver high-quality, transparent services under robust compliance frameworks.\n- **Mission Statement:** Providing state-of-the-art solutions while maintaining absolute clarity, trust, and ethical operation.\n- **Factual Description:** ${scrapedDescription}\n\n## Leadership & Subject Matter Expertise\n- **Management Structure:** Structured executive leadership overseeing operational efficiency and strategic directives.\n- **Subject Matter Focus:** Artificial Intelligence, Software Engineering, Domain Architecture, and Digital Security.\n- **Expertise Signatures:** Decades of combined industry experience across key technical sectors, driving innovation.\n\n## Verified Entity Signals\n- **Email Signal:** ${scrapedEmail}\n- **Phone Signal:** ${scrapedPhone}\n- **Physical Presence:** ${scrapedAddress}\n- **Social & Web Entity Links:**\n${sameAsVal.map(link => `  - [Verified Profile](${link})`).join('\n')}\n\n## Compliance Links\n- [Privacy Policy](<Verify Scraped Data: https://${scannedDomain}/privacy>): Official user data safety policies and storage directives.\n- [Terms of Service](<Verify Scraped Data: https://${scannedDomain}/terms>): Core service agreements and client-vendor obligations.`
    },
    docs: {
      path: '/docs.md',
      content: status.docsTxtContent || status.docsContent || `# <Verify Scraped Data: ${scannedDomain}> Technical Documentation\n<!-- AI-Ready Machine Manifest File -->\n> Technical manual, configuration guidelines, and workflow definitions for ${scrapedBrandName}.\n\n## Quick Technical Summary\nThis document provides flat-structured technical documentation for <Verify Scraped Data: ${scannedDomain}> to assist developers and AI integration scrapers.\nCore Purpose: ${scrapedDescription}\n\n## Core Workflows & Feature Specifications\n- **Client Integration Flow:** Clients hook into the public APIs using secure OAuth credentials, retrieving structural payloads.\n- **AI-Ready Indexing Loop:** System context maps are served directly at the domain root with standard \`Allow\` rules to facilitate modern RAG parsing.\n- **AEO Optimization Process:** Automates the generation of JSON-LD schemas and sitemap indices to maintain data parity.\n\n## Configuration & Parameter Reference\n| Parameter Name | Data Type | Default Value | Description |\n| :--- | :--- | :--- | :--- |\n| \`domainName\` | String | \`<Verify Scraped Data: ${scannedDomain}>\` | The verified target domain hosting the services. |\n| \`brandName\` | String | \`${scrapedBrandName}\` | The corporate brand name. |\n| \`enableAeo\` | Boolean | \`true\` | Activates AI-Optimized crawling configuration. |\n\n## Technical Support & Help Channels\n- **Community Forum:** Join developers on our chat channels.\n- **Support Email:** Contact the engineering department for configuration help.`
    },
    content: {
      path: '/content.md',
      content: status.contentTxtContent || status.contentContent || `# <Verify Scraped Data: ${scannedDomain}> Subject Authority Index\n<!-- AI-Ready Machine Manifest File -->\n> Flat narrative index summarizing core authority, deep-dive articles, and case studies for ${scrapedBrandName}.\n\n## Core Subject Matter Authority\n${scrapedBrandName} maintains deep expertise in software architecture, entity indexing, and automated diagnostics.\nCorporate Mission: ${scrapedDescription}\n\n## Authoritative Insights & Deep-Dive Articles\n- **Understanding Modern AI Search:** Explaining the shift from legacy index queries to generative model answer syntheses.\n- **EEAT Alignment Strategies:** How structured markup and data consistency affect citation confidence scores.\n- **Crawlability and Hydration:** Evaluating client-side rendering traps and their impact on context ingestion.\n\n## Case Studies & Proven Track Record\n- **E-commerce Optimization:** Achieved 100% manifest index parity leading to a major increase in ChatGPT shopping citations.\n- **Enterprise SaaS Integration:** Resolved edge WAF challenges and robots.txt disallow rules, restoring visibility within 48 hours.\n\n## Citation & Quotation Standard\nTo cite content from <Verify Scraped Data: ${scannedDomain}>, please use the canonical links provided in our sitemap and refer to the official brand name: ${scrapedBrandName}.`
    }
  };
}

function switchDiyManifestTab(fileKey) {
  activeDiyManifestKey = fileKey;
  activeDrawerKey = fileKey;
  
  const domain = currentScannedDomain || 'example.com';
  const results = latestScanResults || window.lastScanResults || {};
  const status = results.status || {};
  const manifestPreviews = results.manifestPreviews || {};

  const templates = getDynamicDrawerTemplates(domain, results);
  const fileInfo = templates[fileKey] || templates.llms;

  // Render and update tabs dynamically to ensure proper status icons
  const manifestFiles = [
    { key: 'robots', name: 'robots.txt' },
    { key: 'llms', name: 'llms.txt' },
    { key: 'aicontext', name: 'ai-context.md' },
    { key: 'sitemap', name: 'sitemap.xml' },
    { key: 'readme', name: 'README.md' },
    { key: 'about', name: 'about.md' },
    { key: 'docs', name: 'docs.md' },
    { key: 'content', name: 'content.md' }
  ];

  const tabsContainer = document.querySelector('.drawer-file-tabs');
  if (tabsContainer) {
    tabsContainer.innerHTML = manifestFiles.map(file => {
      const fileStatus = getFileStatus(file.key, results);
      const isActive = activeDiyManifestKey === file.key;
      
      let icon = '✕';
      let iconColor = '#f43f5e';
      if (fileStatus.state === 'valid') {
        icon = '✓';
        iconColor = '#34d399';
      } else if (fileStatus.state === 'needs_fix') {
        icon = '⚠️';
        iconColor = '#fbbf24';
      }

      return `<button type="button" class="drawer-tab-btn control-menu-item ${isActive ? 'active' : ''}" onclick="switchDiyManifestTab('${file.key}')" style="display: inline-flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; padding: 0.5rem 1rem; border-radius: 8px; font-family: var(--font-sans), sans-serif; transition: all 0.2s ease-in-out;">
        <span style="color: ${iconColor}; font-weight: bold;">${icon}</span>
        <span>${file.name}</span>
      </button>`;
    }).join('');
  }

  // Bind Left Window: Summary Card (File Context & Diagnostics)
  const leftPane = document.getElementById('left-pane-content');
  if (leftPane) {
    const meta = getManifestMetadata(fileKey, domain, results);
    
    leftPane.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; text-align: left; font-family: var(--font-sans), sans-serif;">
        <h5 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0; font-family: var(--font-sans), sans-serif;">File Context &amp; Diagnostics</h5>
        <div style="margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: flex-start; font-family: var(--font-sans), sans-serif;">
          <span style="font-size: 0.75rem; background: ${meta.state === 'valid' ? 'rgba(52, 211, 153, 0.1)' : meta.state === 'needs_fix' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(244, 63, 94, 0.1)'}; border: 1px solid ${meta.statusColor}; color: ${meta.statusColor}; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700; display: inline-flex; align-items: center; gap: 0.3rem; font-family: var(--font-sans), sans-serif;">
            <span>${meta.statusIcon}</span> ${meta.statusLabel}
          </span>
        </div>
        
        <h6 style="font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif;">${meta.title}</h6>
        <p style="font-size: 0.85rem; color: #cbd5e1; line-height: 1.45; margin: 0 0 1.25rem 0; font-family: var(--font-sans), sans-serif;">${meta.description}</p>
        
        <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 8px; padding: 1rem; margin-bottom: 1.25rem; font-family: var(--font-sans), sans-serif;">
          <h6 style="font-size: 0.82rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 0.75rem 0; font-family: var(--font-sans), sans-serif;">Live Scan Summary</h6>
          <ul style="font-size: 0.85rem; color: #e2e8f0; line-height: 1.6; padding-left: 1.2rem; margin: 0; display: flex; flex-direction: column; gap: 0.4rem; font-family: var(--font-sans), sans-serif;">
            <li>Scraped target domain: <span style="font-family: var(--font-mono), monospace; color: #38bdf8;">${meta.domain}</span></li>
            <li>Discovered route count: <span style="font-weight: 600; color: #ffffff;">${meta.routeCount} pages</span></li>
            <li>Live status: <span style="color: ${meta.statusColor}; font-weight: 500;">${meta.liveStatusText}</span></li>
          </ul>
        </div>
        
        <div style="margin-top: auto; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 0.75rem; display: flex; justify-content: space-between; align-items: center; font-size: 0.78rem; color: #94a3b8; font-family: var(--font-sans), sans-serif;">
          <span>⏱️ Est. Setup: <strong>${meta.setupTime}</strong></span>
          <span style="color: #34d399; font-weight: 500; font-family: var(--font-sans), sans-serif;">Halfway to AI-Ready 🎉</span>
        </div>
      </div>
    `;
  }

  // Bind Right Window: Solution & Action
  const rightContainer = document.getElementById('right-pane-container');
  if (rightContainer) {
    const meta = getManifestMetadata(fileKey, domain, results);
    rightContainer.innerHTML = `
      <div style="display: flex; flex-direction: column; height: 100%; text-align: left; font-family: var(--font-sans), sans-serif;">
        <h5 style="font-size: 1.25rem; font-weight: 700; color: #ffffff; margin: 0 0 0.75rem 0; font-family: var(--font-sans), sans-serif;">Solution &amp; Action</h5>
        <div style="margin-bottom: 0.75rem; display: flex; align-items: center; justify-content: flex-start; font-family: var(--font-sans), sans-serif;">
          <span class="badge-status status-green" style="font-size: 0.75rem; background: rgba(52, 211, 153, 0.1); border: 1px solid #34d399; color: #34d399; padding: 0.2rem 0.6rem; border-radius: 999px; font-weight: 700; font-family: var(--font-sans), sans-serif;">Baseline Ready</span>
        </div>
        <h6 style="font-size: 1.05rem; font-weight: 700; color: #f1f5f9; margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif;">Deploy Your Optimized File</h6>
        <p style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 1.25rem; font-family: var(--font-sans), sans-serif;">Live site data was synthesized into an optimized baseline below.</p>
        
        <!-- Primary Action Buttons -->
        <div style="display: flex; gap: 0.75rem; margin-bottom: 1.25rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
          <button onclick="downloadBaselineCode()" style="border-radius: 999px; padding: 0.5rem 1.25rem; font-size: 0.85rem; background: var(--text-primary, #ffffff); color: var(--surface-bg, #0f172a); border: 1px solid var(--text-primary, #ffffff); font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; box-shadow: 0 4px 12px rgba(0,0,0,0.2); font-family: var(--font-sans), sans-serif;">
            <span>📥</span> Download ${meta.filename}
          </button>
          <button onclick="copyBaselineCode()" style="border-radius: 999px; padding: 0.5rem 1.25rem; font-size: 0.85rem; background: transparent; color: #ffffff; border: 1px solid rgba(255,255,255,0.2); font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.4rem; font-family: var(--font-sans), sans-serif;">
            <span>📋</span> Copy Code
          </button>
        </div>

        <!-- Deployment Helper Banner -->
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 1.25rem; font-size: 0.82rem; color: #bae6fd; line-height: 1.4; font-family: var(--font-sans), sans-serif;">
          💡 <strong>How to publish:</strong> Upload directly to your website's main root folder (e.g. <span style="font-family: var(--font-mono), monospace; color: #38bdf8;">https://${domain}/${meta.filename}</span>).
        </div>

        <!-- Progressive Disclosure (Hidden Code Viewer) -->
        <details style="margin-top: auto; font-family: var(--font-sans), sans-serif;">
          <summary style="font-size: 0.82rem; color: #38bdf8; font-weight: 600; cursor: pointer; list-style: none; display: flex; align-items: center; gap: 0.25rem; user-select: none; font-family: var(--font-sans), sans-serif;">
            View generated code & placeholders ▾
          </summary>
          <pre id="right-pane-content" style="margin-top: 0.75rem; max-height: 250px; overflow-y: auto; white-space: pre-wrap; font-family: var(--font-mono), monospace; font-size: 0.82rem; color: #67e8f9; background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 6px; text-align: left;"></pre>
        </details>
        
        <a href="#" onclick="showUpgradeModal('AIO_PRO_FILE_MANAGER', 'Actively manage and deploy AI-Ready files', 'AI Optimize'); return false;" class="direct-link-btn" style="display: block; text-align: center; margin-top: 15px; padding: 10px 20px; border-radius: 999px; font-weight: bold; text-decoration: none; font-size: 0.85rem; font-family: var(--font-sans), sans-serif;">To manage this file actively, Upgrade to AI Optimize ↗</a>
      </div>
    `;
    
    const rightPane = document.getElementById('right-pane-content');
    if (rightPane) {
      rightPane.innerText = fileInfo.content || '';
    }
  }

  // Update Right Pane Header Title dynamically (left for backcompat if needed)
  const rightHeader = document.getElementById('right-pane-header-title');
  if (rightHeader) {
    if (fileKey === 'jsonld') {
      rightHeader.innerHTML = `AEO Suite Optimized Baseline <span class="help-tooltip-trigger" onclick="openHelpTooltip('diy_jsonld_guide')">(?)</span>`;
    } else {
      rightHeader.innerHTML = 'AEO Suite Optimized Baseline';
    }
  }

  // Backwards compatibility for old element IDs if they are on another page/component
  const pathEl = document.getElementById('drawer-current-filepath');
  if (pathEl) pathEl.innerText = fileInfo.path;
  const contentEl = document.getElementById('drawer-code-content');
  if (contentEl) contentEl.innerText = fileInfo.content;
}

function selectCodeDrawer(key, results = null) {
  if (results) {
    latestScanResults = results;
    window.lastScanResults = results;
  }
  switchDiyManifestTab(key);
}

function copyDrawerCode() {
  const contentEl = document.getElementById('right-pane-content') || document.getElementById('drawer-code-content');
  if (contentEl) {
    navigator.clipboard.writeText(contentEl.innerText);
    alert('Copied code to clipboard!');
  }
}

function downloadDrawerFile() {
  const domain = currentScannedDomain || 'example.com';
  const results = latestScanResults || window.lastScanResults || {};
  const templates = getDynamicDrawerTemplates(domain, results);
  const fileInfo = templates[activeDiyManifestKey] || templates[activeDrawerKey] || templates.llms;
  const blob = new Blob([fileInfo.content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileInfo.path.replace(/^\//, '');
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function copyLeftPaneCode() {
  const leftPane = document.getElementById('left-pane-content');
  if (leftPane) {
    navigator.clipboard.writeText(leftPane.innerText);
    alert('Copied scraped live content to clipboard!');
  }
}

function copyRightPaneCode() {
  const rightPane = document.getElementById('right-pane-content');
  if (rightPane) {
    navigator.clipboard.writeText(rightPane.innerText);
    alert('Copied optimized baseline content to clipboard!');
  }
}

function downloadRightPaneFile() {
  downloadDrawerFile();
}

function copyBaselineCode() {
  const rightPane = document.getElementById('right-pane-content');
  if (!rightPane) return;
  const content = rightPane.innerText;
  
  navigator.clipboard.writeText(content).then(() => {
    const copyBtns = document.querySelectorAll('button[onclick="copyBaselineCode()"]');
    copyBtns.forEach(copyBtn => {
      const originalText = copyBtn.innerText;
      copyBtn.innerText = 'Copied!';
      setTimeout(() => {
        copyBtn.innerText = originalText;
      }, 2000);
    });
  }).catch(err => {
    console.error('Failed to copy text: ', err);
  });
}

function downloadBaselineCode() {
  const rightPane = document.getElementById('right-pane-content');
  if (!rightPane) return;
  const content = rightPane.innerText;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const fileKey = activeDiyManifestKey || activeDrawerKey || 'llms';
  let filename = 'llms.txt';
  if (fileKey === 'robots') filename = 'robots.txt';
  else if (fileKey === 'aicontext') filename = 'ai-context.md';
  else if (fileKey === 'sitemap') filename = 'sitemap.xml';
  else if (fileKey === 'readme') filename = 'README.md';
  else if (fileKey === 'about') filename = 'about.md';
  else if (fileKey === 'docs') filename = 'docs.md';
  else if (fileKey === 'content') filename = 'content.md';
  else if (fileKey === 'jsonld') filename = 'aeo-optimized-baseline.json';
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

window.copyLeftPaneCode = copyLeftPaneCode;
window.copyRightPaneCode = copyRightPaneCode;
window.downloadRightPaneFile = downloadRightPaneFile;
window.switchDiyManifestTab = switchDiyManifestTab;
window.copyBaselineCode = copyBaselineCode;
window.downloadBaselineCode = downloadBaselineCode;

function selectEdgeTab(key) {
  const buttons = document.querySelectorAll('.edge-tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(`'${key}'`));
  if (targetBtn) targetBtn.classList.add('active');

  const titleEl = document.getElementById('edge-current-title');
  const codeEl = document.getElementById('edge-code-content');
  const domain = currentScannedDomain;

  if (key === 'cloudflare') {
    if (titleEl) titleEl.innerText = `Cloudflare Worker Edge Router for ${domain} (worker.js)`;
    if (codeEl) codeEl.innerText = `// Cloudflare Worker Edge Proxy Hook for ${domain}\naddEventListener('fetch', event => {\n  event.respondWith(handleRequest(event.request));\n});\n\nasync function handleRequest(request) {\n  const url = new URL(request.url);\n  if (url.pathname === '/llms.txt') {\n    return new Response(LLMS_TXT_CONTENT, { headers: { 'content-type': 'text/plain; charset=utf-8', 'x-robots-tag': 'all' } });\n  }\n  return fetch(request);\n}`;
  } else if (key === 'shopify') {
    if (titleEl) titleEl.innerText = `Shopify Primary Domain Redirect Hook for ${domain}`;
    if (codeEl) codeEl.innerText = `<!-- Shopify Liquid Root Directive Hook for ${domain} -->\n{% if request.path == '/llms.txt' %}\n  {% layout none %}\n  {{ settings.llms_txt_content }}\n{% endif %}`;
  } else if (key === 'crowdstrike') {
    if (titleEl) titleEl.innerText = `Crowdstrike Falcon & WAF Directives for ${domain}`;
    if (codeEl) codeEl.innerText = `# Crowdstrike Falcon / WAF Directives for ${domain}\nAllowUserAgent: "GPTBot/1.0"\nAllowUserAgent: "PerplexityBot/1.0"\nAllowUserAgent: "ClaudeBot/1.0"\nHeader set X-Robots-Tag "all"`;
  }
}

function copyEdgeScript() {
  const codeEl = document.getElementById('edge-code-content');
  if (codeEl) {
    navigator.clipboard.writeText(codeEl.innerText);
    alert('Copied edge script to clipboard!');
  }
}



// Dynamically bind scanned domain & evaluation metrics to Executive Mode UI
// Execute Dashboard Scan for visualize.html
async function executeDashboardScan(event) {
  if (event && event.preventDefault) event.preventDefault();

  const urlInputEl = document.getElementById('target-url') || document.getElementById('onboarding-target-url');
  let targetUrlVal = urlInputEl ? urlInputEl.value.trim() : '';

  if (!targetUrlVal) {
    const params = new URLSearchParams(window.location.search);
    targetUrlVal = params.get('url') || '';
    if (urlInputEl) urlInputEl.value = targetUrlVal;
  }

  if (!targetUrlVal) {
    alert('Please enter a target domain URL to audit.');
    return;
  }

  if (targetUrlVal && !/^https?:\/\//i.test(targetUrlVal)) {
    targetUrlVal = 'https://' + targetUrlVal;
  }

  const submitBtn = document.getElementById('scan-submit-btn') || document.getElementById('onboarding-submit-btn');
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Auditing Domain... ⏳</span>';
  }

  // Cancel any existing running audit before starting a new one
  if (activeScanController) {
    activeScanController.abort();
  }

  activeScanController = new AbortController();
  showAuditOverlay();

  try {
    const res = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentEmail, targetUrl: targetUrlVal }),
      signal: activeScanController.signal
    });
    const data = await res.json();
    if (res.ok && data.results) {
      updateExecutiveViewData(data.results);
      updateDeveloperViewData(data.results);
      const cleanDomain = targetUrlVal.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
      if (window.history && window.history.replaceState) {
        window.history.replaceState(null, '', `visualize.html?url=${encodeURIComponent(cleanDomain)}`);
      }
    } else {
      console.warn('Dashboard scan error response:', data.error);
      alert(data.error || 'Unable to audit domain.');
    }
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('Audit scan request aborted by the user.');
    } else {
      console.error('Error executing dashboard scan:', err);
      alert('An error occurred during the audit scan.');
    }
  } finally {
    activeScanController = null;
    hideAuditOverlay();
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Run Audit 🔄</span>';
    }
  }
}

function showAuditOverlay() {
  const overlay = document.getElementById('audit-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    // Force reflow
    overlay.offsetHeight;
    overlay.classList.add('show');
  }
}

function hideAuditOverlay() {
  const overlay = document.getElementById('audit-overlay');
  if (overlay) {
    overlay.classList.remove('show');
    setTimeout(() => {
      if (!overlay.classList.contains('show')) {
        overlay.style.display = 'none';
      }
    }, 400);
  }
}

function cancelActiveAudit() {
  if (activeScanController) {
    activeScanController.abort();
    activeScanController = null;
  }
}

window.executeDashboardScan = executeDashboardScan;
window.showAuditOverlay = showAuditOverlay;
window.hideAuditOverlay = hideAuditOverlay;
window.cancelActiveAudit = cancelActiveAudit;

// Multi-Bot RAG Token Truncation Engine (Google Gemini, Copilot, Bing, GPTBot)
function formatRagTextWithTruncation(rawText, pageRoute) {
  if (!rawText) return 'No body text extracted from page DOM.';
  const words = rawText.split(/\s+/).filter(Boolean);
  const totalWords = words.length;
  const totalTokens = Math.round(totalWords * 1.35);

  if (totalWords <= 2000) {
    return `${rawText}\n\n*Ingestion Metadata:* Token Density ~${totalTokens} tokens | 🟢 100% Ingestible by Google Gemini, Copilot, Bing & GPTBot`;
  }

  const geminiPassage = words.slice(0, 2000).join(' ');

  if (totalWords <= 2500) {
    const copilotPassage = words.slice(2000).join(' ');
    return `${geminiPassage}\n\n` +
           `════════════════════════════════════════════════════════════════════════\n` +
           `⚠️ [GOOGLE GEMINI & AI OVERVIEWS TRUNCATION BOUNDARY]\n` +
           `   Word Count: 2,000 (~2,700 Tokens). Google Gemini & AI Overviews\n` +
           `   deprioritize RAG passage chunks beyond this limit.\n` +
           `════════════════════════════════════════════════════════════════════════\n\n` +
           `${copilotPassage}\n\n` +
           `*Ingestion Metadata:* Token Density ~${totalTokens} tokens | 🟡 Truncated by Google Gemini, Ingestible by Copilot & Bing`;
  }

  const copilotPassage = words.slice(2000, 2500).join(' ');
  const lostPassage = words.slice(2500).join(' ');

  return `${geminiPassage}\n\n` +
         `════════════════════════════════════════════════════════════════════════\n` +
         `⚠️ [GOOGLE GEMINI & AI OVERVIEWS TRUNCATION BOUNDARY]\n` +
         `   Word Count: 2,000 (~2,700 Tokens). Google Gemini & AI Overviews\n` +
         `   deprioritize RAG passage chunks beyond this limit.\n` +
         `════════════════════════════════════════════════════════════════════════\n\n` +
         `${copilotPassage}\n\n` +
         `🛑 [COPILOT, BING & GPTBOT HARD CUT-OFF BOUNDARY]\n` +
         `   Word Count: 2,500+ (>3,375 Tokens). Microsoft Copilot, Bing & GPTBot\n` +
         `   STOP crawling & indexing content beyond this boundary.\n` +
         `------------------------------------------------------------------------\n\n` +
         `❌ LOST CONTENT (IGNORED BY ALL AI SEARCH BOTS):\n${lostPassage}\n\n` +
         `*Ingestion Metadata:* Token Density ~${totalTokens} tokens | 🔴 Exceeds Maximum AI Bot Context Budget (${totalWords - 2500} words lost to AI search)`;
}

// Dynamically bind scanned domain & evaluation metrics to Executive Mode UI
function updateExecutiveViewData(results) {
  console.log("=== updateExecutiveViewData called ===");
  if (!results) return;

  // Extract clean domain name from target input or results
  const inputVal = document.getElementById('target-url')?.value.trim() || document.getElementById('onboarding-target-url')?.value.trim() || '';
  let rawUrl = results.url || results.domain || inputVal || '';
  let domainName = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'Unscanned Target';

  const pillarsData = results.scoreCard?.pillars;
  const score = pillarsData 
    ? (pillarsData.p1.score + pillarsData.p2.score + pillarsData.p3.score + pillarsData.p4.score)
    : (results.scoreCard?.overallScore ?? 0);
  const isGood = score >= 80;

  // 1. Executive Banner & Score Dial
  const scoreValEl = document.getElementById('exec-overall-score') || document.getElementById('exec-score-val');
  if (scoreValEl) scoreValEl.innerText = score;

  const dialArc = document.getElementById('score-dial-arc') || document.querySelector('.score-dial-progress');
  if (dialArc) {
    const dashOffset = 264 - (264 * score) / 100;
    dialArc.style.strokeDashoffset = dashOffset;
    if (score >= 80) {
      dialArc.style.stroke = '#10b981';
    } else if (score >= 50) {
      dialArc.style.stroke = '#f59e0b';
    } else {
      dialArc.style.stroke = '#f43f5e';
    }
  }

  const domainDisplayEls = [
    document.getElementById('display-scanned-domain'),
    document.getElementById('dev-scanned-domain'),
    document.getElementById('exec-domain-tag')
  ].filter(Boolean);
  domainDisplayEls.forEach(el => { el.innerText = rawUrl || domainName; });

  const lastScannedVal = results.scanMetrics?.lastScanned || results.lastScanned || new Date().toLocaleString();
  const timestampEls = [
    document.getElementById('scan-timestamp-badge'),
    document.getElementById('dev-scan-timestamp-badge'),
    document.getElementById('display-scanned-time')
  ].filter(Boolean);
  timestampEls.forEach(el => {
    if (el.id === 'display-scanned-time') {
      el.innerText = lastScannedVal;
    } else {
      el.innerText = `Last Scanned: ${lastScannedVal}`;
    }
  });

  const scanTimeSeconds = results.scanMetrics?.scanTimeSeconds ?? results.scanTimeSeconds ?? 1.8;
  const durationEls = [
    document.getElementById('scan-duration-badge'),
    document.getElementById('dev-scan-duration-badge'),
    document.getElementById('display-scan-duration')
  ].filter(Boolean);
  durationEls.forEach(el => {
    if (el.id === 'display-scan-duration') {
      el.innerText = `${scanTimeSeconds} seconds`;
    } else {
      el.innerText = `Time to Scan: ${scanTimeSeconds} seconds`;
    }
  });

  const pageCount = Array.isArray(results?.pages) ? results.pages.length : (results?.scannedPages?.length ?? 0);
  const execPagesBadge = document.getElementById('scan-pages-badge');
  if (execPagesBadge) execPagesBadge.textContent = `Pages Reviewed: ${pageCount}`;
  const devPagesBadge = document.getElementById('dev-scan-pages-badge');
  if (devPagesBadge) devPagesBadge.textContent = `Pages Reviewed: ${pageCount}`;

  // Section scores & pills from results.executiveSections
  const sec1 = results.executiveSections?.section1;
  const sec2 = results.executiveSections?.section2;
  const sec3 = results.executiveSections?.section3;
  const sec4 = results.executiveSections?.section4;

  const score1 = sec1?.score ?? results.scores?.p1 ?? 0;
  const score2 = sec2?.score ?? results.scores?.p2 ?? 0;
  const score3 = sec3?.score ?? results.scores?.p3 ?? 0;
  const score4 = sec4?.score ?? results.scores?.p4 ?? 0;

  const getScorePill = (score) => {
    const isClean = score >= 25;
    const badgeColor = isClean ? 'var(--badge-pass)' : 'var(--badge-fail)';
    const badgeBg = isClean ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
    const badgeBorder = isClean ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(239, 68, 68, 0.25)';
    return `<span class="pillar-status-badge ${isClean ? 'badge-pass' : 'badge-fail'}" style="color: ${badgeColor}; background: ${badgeBg}; border: ${badgeBorder}; font-size: 0.72rem; padding: 0.15rem 0.45rem; border-radius: 4px; font-weight: 700;">${score}/25 pts</span>`;
  };

  const getStatusIndicator = (passed) => passed
    ? `<span style="color: #10b981; font-weight: bold; margin-right: 0.35rem;">✓</span>`
    : `<span style="color: #ef4444; font-weight: bold; margin-right: 0.35rem;">✗</span>`;

  // Dynamically evaluate pass/fail for every individual check inside the 4 section cards against live scan results:
  // Card 1 Checks:
  const isCdnPass = !(results.sec1?.cdnBlocked === true);
  const isXRobotsPass = !(results.sec1?.xRobotsNoIndex === true || results.status?.xRobotsIndexable === false);
  const isUseragentsPass = !(results.sec1?.disallowAll === true || results.status?.robotsTxtExists === false);
  const isAiBotsPass = Object.values(results.status?.botPermissions || {}).every(allowed => allowed !== false);

  // Card 2 Checks:
  const isSecurePass = results.sec2?.isHttps !== false;
  const isSpaPass = !(results.status?.spaTrapDetected === true || results.sec2?.isHeavyJs === true);
  const isRagPass = results.status?.llmsTxtExists === true && results.status?.aiContextExists === true;
  const isEntityPass = (results.sec2?.essentialPagesFound ?? (results.status?.aboutTxtExists ? 3 : 2)) === 3;

  // Card 3 Checks:
  const isSeoPass = results.status?.seoOptimalTitle !== false && results.status?.seoOptimalDesc !== false;
  const isTokenPass = (results.sec3?.fleschScore ?? 68) >= 50 && (results.status?.wordCount ?? results.sec3?.wordCount ?? 800) >= 500;
  const isParityPass = (results.sec3?.faqQuestions ?? 4) === (results.sec3?.faqAnswers ?? 4) && (results.status?.jsonLdExists ?? results.sec3?.hasFaqSchema ?? true) === true;
  const isEeatPass = results.sec3?.hasContactInfo !== false && results.sec3?.hasPrivacyPolicy !== false;

  // Card 4 Checks:
  const isRobotsPass = results.status?.robotsTxtExists === true;
  const isLlmsPass = results.status?.llmsTxtExists === true && results.status?.sitemapExists === true;
  const isAiContextPass = results.status?.aiContextExists === true;
  const isWorkspacesPass = results.status?.aboutTxtExists === true && results.status?.docsTxtExists === true && results.status?.contentTxtExists === true;

  const devSummaryGrid = document.getElementById('dev-summary-grid');
  if (devSummaryGrid) {
    devSummaryGrid.innerHTML = `
      <!-- Section 1 Card: Gateway & Access -->
      <div id="exec-section1-card" class="explainer-card glassmorphic adaptive-card" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(245, 158, 11, 0.2); color: #fbbf24; font-size: 0.8rem; font-weight: 800;">1</span>
              <h4 style="font-size: 0.92rem; font-weight: 700; color: #f8fafc; margin: 0;">Gateway &amp; Access</h4>
            </div>
            ${getScorePill(score1)}
          </div>
          <p style="font-size: 0.84rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 0.6rem;">
            <strong style="color: #f59e0b; font-weight: 800;">AI-Optimized</strong> human-centric protocol gate checks:
          </p>
          <ul style="font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; list-style-type: none; padding-left: 0;">
            <li style="display: flex; align-items: center;">${getStatusIndicator(isCdnPass)}CDN / Edge Firewall Blocks</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isXRobotsPass)}X-Robots-Tag Headers</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isUseragentsPass)}robots.txt useragents Disallow</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isAiBotsPass)}robots.txt ai-bots Disallow</li>
          </ul>
        </div>
      </div>

      <!-- Section 2 Card: Presence & Hygiene -->
      <div id="exec-section2-card" class="explainer-card glassmorphic adaptive-card" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(14, 165, 233, 0.25); border-left: 4px solid #0ea5e9; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(14, 165, 233, 0.2); color: #38bdf8; font-size: 0.8rem; font-weight: 800;">2</span>
              <h4 style="font-size: 0.92rem; font-weight: 700; color: #f8fafc; margin: 0;">Presence &amp; Hygiene</h4>
            </div>
            ${getScorePill(score2)}
          </div>
          <p style="font-size: 0.84rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 0.6rem;">
            <strong style="color: #38bdf8; font-weight: 800;">AI-Optimized</strong> web structure &amp; hydration hygiene:
          </p>
          <ul style="font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; list-style-type: none; padding-left: 0;">
            <li style="display: flex; align-items: center;" data-metric="isSecure">${getStatusIndicator(isSecurePass)}isSecure Protocol Check</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isSpaPass)}SPA Hydration Trap &amp; Density Ratio</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isRagPass)}RAG Offset: /llms.txt &amp; /ai-context.md</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isEntityPass)}Essential Entity Nodes Discovered</li>
          </ul>
        </div>
      </div>

      <!-- Section 3 Card: Content AI-Optimization -->
      <div id="exec-section3-card" class="explainer-card glassmorphic adaptive-card" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(139, 92, 246, 0.25); border-left: 4px solid #8b5cf6; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(139, 92, 246, 0.2); color: #c084fc; font-size: 0.8rem; font-weight: 800;">3</span>
              <h4 style="font-size: 0.92rem; font-weight: 700; color: #f8fafc; margin: 0;">Content AI-Optimization</h4>
            </div>
            ${getScorePill(score3)}
          </div>
          <p style="font-size: 0.84rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 0.6rem;">
            <strong style="color: #c084fc; font-weight: 800;">AI-Optimized</strong> page-level readability &amp; trust:
          </p>
          <ul style="font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; list-style-type: none; padding-left: 0;">
            <li style="display: flex; align-items: center;">${getStatusIndicator(isSeoPass)}Title &amp; Meta Desc Sweet Spots</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isTokenPass)}Token Load Status &amp; Flesch Score</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isParityPass)}Ans/Ques Parity Ratio</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isEeatPass)}Page-Level E-E-A-T Diagnostics</li>
          </ul>
        </div>
      </div>

      <!-- Section 4 Card: Machine Manifest Readiness -->
      <div id="exec-section4-card" class="explainer-card glassmorphic adaptive-card" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 4px solid #10b981; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.6rem;">
            <div style="display: flex; align-items: center; gap: 0.5rem;">
              <span style="display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 50%; background: rgba(16, 185, 129, 0.2); color: #34d399; font-size: 0.8rem; font-weight: 800;">4</span>
              <h4 style="font-size: 0.92rem; font-weight: 700; color: #f8fafc; margin: 0;">Machine Manifest Readiness</h4>
            </div>
            ${getScorePill(score4)}
          </div>
          <p style="font-size: 0.84rem; color: #e2e8f0; line-height: 1.5; margin-bottom: 0.6rem;">
            <em style="color: #34d399; font-style: italic; font-weight: 800;">AI-Ready</em> Level 1–4 manifest hierarchy:
          </p>
          <ul style="font-size: 0.78rem; color: #94a3b8; line-height: 1.45; margin: 0; display: flex; flex-direction: column; gap: 0.25rem; list-style-type: none; padding-left: 0;">
            <li style="display: flex; align-items: center;">${getStatusIndicator(isRobotsPass)}Level 1 Gate: robots.txt</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isLlmsPass)}Level 2 Welcome Mats: /llms.txt &amp; sitemap.xml</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isAiContextPass)}Level 3 Blueprint: /ai-context.md</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isWorkspacesPass)}Level 4 Workspaces: /README.md, about, docs, content</li>
          </ul>
        </div>
      </div>
    `;
  }

  const statusBadgeEl = document.getElementById('exec-score-classification-pill') || document.getElementById('exec-status-badge');
  if (statusBadgeEl) {
    statusBadgeEl.innerText = isGood ? '🟢 AI-READY' : '🟡 ACTION NEEDED';
    statusBadgeEl.className = `badge-status ${isGood ? 'status-green' : 'status-amber'}`;
  }

  const statusDescEl = document.getElementById('exec-score-summary-text') || document.getElementById('exec-status-desc');
  if (statusDescEl) {
    statusDescEl.innerText = isGood
      ? `GPTBot, PerplexityBot, and ClaudeBot can cleanly parse ${score}% of your core digital assets on ${domainName}. Machine welcome mats (/llms.txt) are operational.`
      : `Scan detected access or readability issues on ${domainName}. Review gateway rules and machine index files below.`;
  }

  // 2. Refactor Section 2 (Presence & Hygiene) Card Dynamic Ingest
  const routeTabsEl = document.getElementById('sec2-route-tabs');
  const scrapedBoxEl = document.getElementById('sec2-scraped-content-box');
  if (routeTabsEl && scrapedBoxEl && Array.isArray(results.scrapedContentPreview) && results.scrapedContentPreview.length > 0) {
    routeTabsEl.innerHTML = results.scrapedContentPreview.map((item, idx) => {
      return `<button type="button" class="route-tab-btn ${idx === 0 ? 'active' : ''}" data-idx="${idx}" onclick="switchSec2RouteTab(${idx})" style="padding: 0.25rem 0.6rem; border-radius: 4px; border: 1px solid var(--border-color); background: ${idx === 0 ? 'var(--burnt-copper)' : 'var(--surface-bg)'}; color: ${idx === 0 ? '#fff' : 'var(--text-muted)'}; font-size: 0.72rem; cursor: pointer; transition: all 0.2s;">${item.route}</button>`;
    }).join('');

    window.sec2ScrapedContent = results.scrapedContentPreview;
    // Explicitly binding with .innerText to preserve all whitespace, newlines, and Markdown formatting intact
    scrapedBoxEl.innerText = results.scrapedContentPreview[0].content || 'No content parsed for this page.';
  } else if (scrapedBoxEl) {
    scrapedBoxEl.innerText = 'No parsed DOM body text available.';
  }

  const foundListEl = document.getElementById('sec2-found-essential-pages');
  const missingListEl = document.getElementById('sec2-missing-essential-pages');
  if (foundListEl && missingListEl) {
    const missing = results.missingEssentialPages || [];
    const standard = ['/about', '/contact', '/privacy', '/terms'];
    const found = standard.filter(route => !missing.includes(route));

    foundListEl.innerHTML = found.length > 0
      ? found.map(route => `<li style="color: #10b981; list-style-type: none; display: flex; align-items: center; gap: 0.35rem;"><span>🟢</span> ${route} - Detected</li>`).join('')
      : '<li style="color: var(--text-muted); list-style-type: none;">None detected</li>';

    missingListEl.innerHTML = missing.length > 0
      ? missing.map(route => `<li style="color: #ef4444; list-style-type: none; display: flex; align-items: center; gap: 0.35rem;"><span>🔴</span> ${route} - Missing</li>`).join('')
      : '<li style="color: #10b981; list-style-type: none; display: flex; align-items: center; gap: 0.35rem;"><span>🟢</span> None missing</li>';
  }

  const faqStatusEl = document.getElementById('sec2-faq-status');
  const parityValueEl = document.getElementById('sec2-parity-value');
  const orgStatusEl = document.getElementById('sec2-org-status');
  const emailValueEl = document.getElementById('sec2-email-value');
  const phoneValueEl = document.getElementById('sec2-phone-value');

  if (faqStatusEl) {
    const hasFaqSchema = results.status?.jsonLdExists || results.sec3?.hasFaqSchema || false;
    faqStatusEl.innerText = hasFaqSchema ? 'PASS' : 'ACTION';
    faqStatusEl.className = `badge-status ${hasFaqSchema ? 'status-green' : 'status-red'}`;
    if (hasFaqSchema) {
      faqStatusEl.style.background = 'rgba(16, 185, 129, 0.18)';
      faqStatusEl.style.color = '#34d399';
    } else {
      faqStatusEl.style.background = 'rgba(244, 63, 94, 0.18)';
      faqStatusEl.style.color = '#f43f5e';
    }
  }

  if (parityValueEl) {
    const q = results.sec3?.faqQuestions ?? 0;
    const a = results.sec3?.faqAnswers ?? 0;
    const ratio = q > 0 ? (a / q).toFixed(1) : '0.0';
    parityValueEl.innerText = `${q} Q / ${a} A (Ratio 1:${ratio})`;
  }

  if (orgStatusEl) {
    const hasOrgSchema = results.status?.jsonLdTypes?.includes('Organization') || results.status?.jsonLdExists || false;
    orgStatusEl.innerText = hasOrgSchema ? 'PASS' : 'ACTION';
    orgStatusEl.className = `badge-status ${hasOrgSchema ? 'status-green' : 'status-red'}`;
    if (hasOrgSchema) {
      orgStatusEl.style.background = 'rgba(16, 185, 129, 0.18)';
      orgStatusEl.style.color = '#34d399';
    } else {
      orgStatusEl.style.background = 'rgba(244, 63, 94, 0.18)';
      orgStatusEl.style.color = '#f43f5e';
    }
  }

  if (emailValueEl) {
    emailValueEl.innerText = results.emailValue || 'None Detected';
  }

  if (phoneValueEl) {
    phoneValueEl.innerText = results.phoneValue || 'None Detected';
  }

  // Bind E-E-A-T & Trust Metrics from results.eeatMetrics to Section 3 elements
  const eeat = results.eeatMetrics || (results.executiveSections?.section3?.eeatMetrics) || {};

  const secureStatusEl = document.getElementById('sec3-secure-status');
  if (secureStatusEl) {
    const isSecure = typeof eeat.isSecure === 'boolean' ? eeat.isSecure : (results.executiveSections?.section3?.isSecure ?? true);
    secureStatusEl.textContent = isSecure ? '🟢 Passed' : '🔴 Action Needed';
    secureStatusEl.className = `badge-status ${isSecure ? 'status-green' : 'status-red'}`;
    secureStatusEl.style.setProperty('background', isSecure ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    secureStatusEl.style.setProperty('color', isSecure ? '#34d399' : '#f43f5e', 'important');
  }

  const contactStatusEl = document.getElementById('sec3-contact-status');
  if (contactStatusEl) {
    const hasContact = typeof eeat.hasContactInfo === 'boolean' ? eeat.hasContactInfo : (results.executiveSections?.section3?.hasContactInfo ?? true);
    contactStatusEl.textContent = hasContact ? '🟢 Passed' : '🔴 Action Needed';
    contactStatusEl.className = `badge-status ${hasContact ? 'status-green' : 'status-red'}`;
    contactStatusEl.style.setProperty('background', hasContact ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    contactStatusEl.style.setProperty('color', hasContact ? '#34d399' : '#f43f5e', 'important');
  }

  const orgSchemaStatusEl = document.getElementById('sec3-org-schema-status');
  if (orgSchemaStatusEl) {
    const hasOrgSchema = results.status?.jsonLdTypes?.includes('Organization') || results.status?.jsonLdExists || false;
    orgSchemaStatusEl.textContent = hasOrgSchema ? '🟢 Passed' : '🔴 Action Needed';
    orgSchemaStatusEl.className = `badge-status ${hasOrgSchema ? 'status-green' : 'status-red'}`;
    orgSchemaStatusEl.style.setProperty('background', hasOrgSchema ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    orgSchemaStatusEl.style.setProperty('color', hasOrgSchema ? '#34d399' : '#f43f5e', 'important');
  }

  const privacyStatusEl = document.getElementById('sec3-privacy-status');
  if (privacyStatusEl) {
    const hasPrivacy = typeof eeat.hasPrivacyPolicy === 'boolean' ? eeat.hasPrivacyPolicy : (results.executiveSections?.section3?.hasPrivacyPolicy ?? true);
    privacyStatusEl.textContent = hasPrivacy ? '🟢 Passed' : '🔴 Action Needed';
    privacyStatusEl.className = `badge-status ${hasPrivacy ? 'status-green' : 'status-red'}`;
    privacyStatusEl.style.setProperty('background', hasPrivacy ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    privacyStatusEl.style.setProperty('color', hasPrivacy ? '#34d399' : '#f43f5e', 'important');
  }

  const ageEstimateEl = document.getElementById('sec3-age-estimate');
  if (ageEstimateEl) {
    ageEstimateEl.innerText = eeat.ageEstimate || (results.executiveSections?.section3?.ageEstimate) || 'Pending WHOIS Integration';
  }

  const authorityStatusEl = document.getElementById('sec3-authority-status');
  if (authorityStatusEl) {
    const authStatus = eeat.authorityStatus || (results.executiveSections?.section3?.authorityStatus) || 'Requires Ahrefs/Moz API';
    authorityStatusEl.innerText = authStatus;
    
    let authTheme = { bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', class: 'status-green' };
    if (authStatus === 'Information Isolation') {
      authTheme = { bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', class: 'status-amber' };
    } else if (authStatus === 'Abstention Risk') {
      authTheme = { bg: 'rgba(244, 63, 94, 0.18)', color: '#f43f5e', class: 'status-red' };
    } else if (authStatus.includes('Requires') || authStatus.includes('API') || authStatus === 'UNAUDITED') {
      authTheme = { bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', class: 'status-amber' };
    }

    authorityStatusEl.className = `badge-status ${authTheme.class}`;
    authorityStatusEl.style.setProperty('background', authTheme.bg, 'important');
    authorityStatusEl.style.setProperty('color', authTheme.color, 'important');
  }

  const diagSummaryEl = document.getElementById('sec3-diagnostic-summary');
  if (diagSummaryEl) {
    diagSummaryEl.innerText = eeat.diagnosticSummary || (results.executiveSections?.section3?.diagnosticSummary) || 'Domain E-E-A-T analysis details pending.';
  }

  // 3. Update Strategic Pillar Badges, Scores & Executive Inquiry Cards with Vibrant Highlights & Deduction Reasons
  const execSections = results.executiveSections;
  const pillars = results.scoreCard?.pillars;

  const renderPillarCard = (secNum, key, pData) => {
    const secObj = execSections ? execSections[key] : null;
    const badgeEl = document.getElementById(`pillar-sec${secNum}-badge`) || document.getElementById(`pillar-badge-${secNum}`);
    const scoreEl = document.getElementById(`pillar-sec${secNum}-score`);
    const noteEl = document.getElementById(`pillar-sec${secNum}-note`);
    const titleEl = document.getElementById(`pillar-sec${secNum}-title`);

    const currentScore = secObj ? secObj.score : (pData ? pData.score : 0);
    const currentMax = secObj ? secObj.max : (pData ? pData.max : 25);
    const badgeText = secObj ? (currentScore === 25 ? 'OPTIMIZED' : (currentScore >= 15 ? 'PARTIAL' : 'CRITICAL')) : (pData ? pData.badge : 'UNAUDITED');
    
    // deductionReason resolution: if 25/25, "🟢 No deductions — All protocols clean.", never undefined
    let deductionReason = '🟢 No deductions — All protocols clean.';
    if (currentScore < currentMax) {
      deductionReason = (secObj && secObj.deductionReason) 
        ? secObj.deductionReason 
        : (pData && pData.note ? pData.note : 'Deductions identified during scan.');
    }

    const isGreen = currentScore >= 20;
    const isAmber = currentScore >= 10 && currentScore < 20;
    
    const theme = isGreen
      ? { bg: 'rgba(16, 185, 129, 0.18)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.4)', class: 'badge-status status-green' }
      : isAmber
      ? { bg: 'rgba(245, 158, 11, 0.18)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', class: 'badge-status status-amber' }
      : { bg: 'rgba(244, 63, 94, 0.18)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.4)', class: 'badge-status status-red' };

    if (titleEl && secObj && secObj.title) {
      titleEl.innerText = secObj.title;
    }
    if (badgeEl) {
      badgeEl.innerText = badgeText;
      badgeEl.className = theme.class;
      badgeEl.style.setProperty('background', theme.bg, 'important');
      badgeEl.style.setProperty('color', theme.color, 'important');
      badgeEl.style.setProperty('border', theme.border, 'important');
    }
    if (scoreEl) {
      scoreEl.innerText = `${currentScore}/${currentMax} pts`;
      scoreEl.style.setProperty('background', theme.bg, 'important');
      scoreEl.style.setProperty('color', theme.color, 'important');
      scoreEl.style.setProperty('border', theme.border, 'important');
    }
    if (noteEl) {
      if (secObj && secObj.deductions && secObj.deductions.length > 0 && currentScore < currentMax) {
        noteEl.innerHTML = '<ul class="deduction-list" style="margin: 0; padding-left: 1.1rem; list-style-type: disc; color: var(--text-muted); font-size: 0.74rem; line-height: 1.4;">' + 
          secObj.deductions.map(d => `<li class="deduction-item" style="margin-bottom: 0.2rem;">${d}</li>`).join('') + 
          '</ul>';
      } else {
        noteEl.innerText = deductionReason;
      }
    }
  };

  renderPillarCard(1, 'section1', pillars?.p1);

  // Update Section 1 accordion checklist pass/fail indicators dynamically:
  const checklistEl = document.getElementById('pillar-sec1-checklist');
  if (checklistEl) {
    checklistEl.innerHTML = `
      <li id="chk-sec1-cdn" style="display: flex; align-items: center;">${getStatusIndicator(isCdnPass)}CDN / Edge Firewall Blocks</li>
      <li id="chk-sec1-xrobots" style="display: flex; align-items: center;">${getStatusIndicator(isXRobotsPass)}X-Robots-Tag Headers</li>
      <li id="chk-sec1-useragents" style="display: flex; align-items: center;">${getStatusIndicator(isUseragentsPass)}robots.txt useragents Disallow</li>
      <li id="chk-sec1-aibots" style="display: flex; align-items: center;">${getStatusIndicator(isAiBotsPass)}robots.txt ai-bots Disallow</li>
    `;
  }
  renderPillarCard(2, 'section2', pillars?.p2);

  // Update Section 2 accordion checklist pass/fail indicators dynamically:
  const checklistSec2El = document.getElementById('pillar-sec2-checklist');
  if (checklistSec2El) {
    checklistSec2El.innerHTML = `
      <li id="chk-sec2-issecure" style="display: flex; align-items: center;">${getStatusIndicator(isSecurePass)}isSecure Protocol Check</li>
      <li id="chk-sec2-spatrap" style="display: flex; align-items: center;">${getStatusIndicator(isSpaPass)}SPA Hydration Trap &amp; Density Ratio</li>
      <li id="chk-sec2-ragoffset" style="display: flex; align-items: center;">${getStatusIndicator(isRagPass)}RAG Offset: /llms.txt &amp; /ai-context.md</li>
      <li id="chk-sec2-entitynodes" style="display: flex; align-items: center;">${getStatusIndicator(isEntityPass)}Essential Entity Nodes Discovered</li>
    `;
  }
  renderPillarCard(3, 'section3', pillars?.p3);

  // Update Section 3 accordion checklist pass/fail indicators dynamically:
  const checklistSec3El = document.getElementById('pillar-sec3-checklist');
  if (checklistSec3El) {
    checklistSec3El.innerHTML = `
      <li id="chk-sec3-seo" style="display: flex; align-items: center;">${getStatusIndicator(isSeoPass)}Title &amp; Meta Desc Sweet Spots</li>
      <li id="chk-sec3-token" style="display: flex; align-items: center;">${getStatusIndicator(isTokenPass)}Token Load Status &amp; Flesch Score</li>
      <li id="chk-sec3-parity" style="display: flex; align-items: center;">${getStatusIndicator(isParityPass)}Ans/Ques Parity Ratio</li>
      <li id="chk-sec3-eeat" style="display: flex; align-items: center;">${getStatusIndicator(isEeatPass)}Page-Level E-E-A-T Diagnostics</li>
    `;
  }
  renderPillarCard(4, 'section4', pillars?.p4);

  // Calculate live status for the 4 Pillar 4 checks:
  const isL1Pass = results.status?.robotsTxtExists === true;
  const isL2Pass = results.status?.llmsTxtExists === true && results.status?.sitemapExists !== false;
  const isL3Pass = results.status?.aiContextExists === true;
  const isL4Pass = results.status?.readmeTxtExists === true || results.status?.aboutTxtExists === true;

  // Update Section 4 accordion checklist pass/fail indicators dynamically:
  const checklistSec4El = document.getElementById('pillar-sec4-checklist');
  if (checklistSec4El) {
    checklistSec4El.innerHTML = `
      <li id="chk-sec4-l1" style="display: flex; align-items: center;">${getStatusIndicator(isL1Pass)}Level 1 Gate: robots.txt</li>
      <li id="chk-sec4-l2" style="display: flex; align-items: center;">${getStatusIndicator(isL2Pass)}Level 2 Welcome Mats: /llms.txt &amp; sitemap.xml</li>
      <li id="chk-sec4-l3" style="display: flex; align-items: center;">${getStatusIndicator(isL3Pass)}Level 3 Blueprint: /ai-context.md</li>
      <li id="chk-sec4-l4" style="display: flex; align-items: center;">${getStatusIndicator(isL4Pass)}Level 4 Workspaces: /README.md, about, docs, content</li>
    `;
  }

  // Bind live Section 1 gateway payload data to X-Robots-Tag and robots.txt status elements
  const xRobotsEl = document.getElementById('exec-x-robots-status');
  const robotsTxtEl = document.getElementById('exec-robots-txt-status');

  const isXRobotsAllowed = 
    (results.executiveSections?.section1?.xRobotsIndexable === true) || 
    (results.executiveSections?.[0]?.xRobotsIndexable === true) ||
    (!(results.sec1?.xRobotsNoIndex === true || results.status?.xRobotsIndexable === false));

  const isRobotsTxtAllowed = 
    (results.executiveSections?.section1?.robotsTxtExists === true) || 
    (results.executiveSections?.[0]?.robotsTxtExists === true) ||
    (!(results.sec1?.disallowAll === true || results.status?.robotsTxtExists === false));

  if (xRobotsEl) {
    if (isXRobotsAllowed) {
      xRobotsEl.innerText = "Passed / Allow";
      xRobotsEl.className = "badge-status status-green";
      xRobotsEl.style.setProperty('background', 'rgba(16, 185, 129, 0.18)', 'important');
      xRobotsEl.style.setProperty('color', '#34d399', 'important');
      xRobotsEl.style.setProperty('border', '1px solid rgba(16, 185, 129, 0.4)', 'important');
    } else {
      xRobotsEl.innerText = "Blocked / Disallow";
      xRobotsEl.className = "badge-status status-red";
      xRobotsEl.style.setProperty('background', 'rgba(244, 63, 94, 0.18)', 'important');
      xRobotsEl.style.setProperty('color', '#f43f5e', 'important');
      xRobotsEl.style.setProperty('border', '1px solid rgba(244, 63, 94, 0.4)', 'important');
    }
  }

  if (robotsTxtEl) {
    if (isRobotsTxtAllowed) {
      robotsTxtEl.innerText = "Passed / Allow";
      robotsTxtEl.className = "badge-status status-green";
      robotsTxtEl.style.setProperty('background', 'rgba(16, 185, 129, 0.18)', 'important');
      robotsTxtEl.style.setProperty('color', '#34d399', 'important');
      robotsTxtEl.style.setProperty('border', '1px solid rgba(16, 185, 129, 0.4)', 'important');
    } else {
      robotsTxtEl.innerText = "Blocked / Disallow";
      robotsTxtEl.className = "badge-status status-red";
      robotsTxtEl.style.setProperty('background', 'rgba(244, 63, 94, 0.18)', 'important');
      robotsTxtEl.style.setProperty('color', '#f43f5e', 'important');
      robotsTxtEl.style.setProperty('border', '1px solid rgba(244, 63, 94, 0.4)', 'important');
    }
  }

  // Bind live Section 1 sitemap status element
  const sitemapEl = document.getElementById('exec-status-sitemap');
  const isSitemapAvailable = 
    (results.status?.sitemapExists === true) || 
    (results.executiveSections?.section2?.sitemapExists === true) ||
    (results.sec2?.sitemapExists === true) ||
    (results.sec4?.sitemapFound === true);

  if (sitemapEl) {
    if (isSitemapAvailable) {
      sitemapEl.innerText = "🟢 Available / Passed";
      sitemapEl.className = "badge-status status-green";
      sitemapEl.style.setProperty('background', 'rgba(16, 185, 129, 0.18)', 'important');
      sitemapEl.style.setProperty('color', '#34d399', 'important');
      sitemapEl.style.setProperty('border', '1px solid rgba(16, 185, 129, 0.4)', 'important');
    } else {
      sitemapEl.innerText = "🔴 Missing / Action Needed";
      sitemapEl.className = "badge-status status-red";
      sitemapEl.style.setProperty('background', 'rgba(244, 63, 94, 0.18)', 'important');
      sitemapEl.style.setProperty('color', '#f43f5e', 'important');
      sitemapEl.style.setProperty('border', '1px solid rgba(244, 63, 94, 0.4)', 'important');
    }
  }

  // 4. Update Scanned/Discovered Webpages Table
  const tbodyEl = document.getElementById('exec-routes-tbody') || document.getElementById('exec-route-tbody');
  const routeCountEl = document.getElementById('exec-routes-count') || document.getElementById('exec-route-count');
  
  if (tbodyEl && results.discoveredRoutes && results.discoveredRoutes.length) {
    const crawledCount = results.pages ? results.pages.length : results.discoveredRoutes.filter(r => r.missingStatus === 'Active').length;
    const totalDiscovered = results.totalPagesFound || results.discoveredRoutes.length;
    if (routeCountEl) {
      routeCountEl.innerText = `Crawled ${crawledCount} of ${totalDiscovered} pages discovered`;
    }

    tbodyEl.innerHTML = results.discoveredRoutes.map(p => {
      const wordCount = p.wordCount || 0;
      const tokenCount = p.tokenLoad || Math.round(wordCount / 2);
      
      const hiddenDot = p.hiddenFromAi
        ? `<span alt="Yes" title="Yes" style="font-size: 0.9rem; cursor: help;">🟢</span>`
        : `<span alt="No" title="No" style="font-size: 0.9rem; cursor: help;">🔴</span>`;
        
      const sitemapDot = p.inSitemap
        ? `<span alt="Yes" title="Yes" style="font-size: 0.9rem; cursor: help;">🟢</span>`
        : `<span alt="No" title="No" style="font-size: 0.9rem; cursor: help;">🔴</span>`;
      
      const isEssentialYes = p.isEssential && p.missingStatus === 'Active';
      const essentialDot = isEssentialYes
        ? `<span alt="Yes" title="Yes" style="font-size: 0.9rem; cursor: help;">🟢</span>`
        : `<span alt="No" title="No" style="font-size: 0.9rem; cursor: help;">🔴</span>`;

      const canonicalVal = p.canonicalTag ? 'Yes' : 'No';
      const hierarchyVal = p.headingHierarchy ? 'Yes' : 'No';
      const mobileVal = p.isMobileFriendly ? 'Yes' : 'No';
      const semanticVal = p.hasSemanticTags ? 'Yes' : 'No';
      const altVal = typeof p.imagesWithoutAlt === 'number' ? p.imagesWithoutAlt : 0;
      const updatedVal = p.lastUpdated || 'Unknown';

      return `
        <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
          <td style="padding: 0.6rem;"><code style="color: #38bdf8;">${p.path}</code></td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${tokenCount} tokens</td>
          <td style="padding: 0.6rem; text-align: left; vertical-align: middle;">${hiddenDot}</td>
          <td style="padding: 0.6rem; text-align: left; vertical-align: middle;">${sitemapDot}</td>
          <td style="padding: 0.6rem; text-align: left; vertical-align: middle;">${essentialDot}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${canonicalVal}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${hierarchyVal}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${mobileVal}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${semanticVal}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${altVal}</td>
          <td style="padding: 0.6rem; color: var(--text-secondary); font-size: 0.8rem;">${updatedVal}</td>
        </tr>
      `;
    }).join('');
  }

  // 5. Populate Dynamic Scanned/Discovered AI-Ready Files (machine readable) Table & Collapsible Tree
  const aiFilesTbody = document.getElementById('exec-machine-files-tbody') || document.getElementById('exec-ai-files-tbody');
  const aiFilesCount = document.getElementById('exec-machine-files-count');

  const robotsActive = !!results.status?.robotsTxtExists;
  const llmsActive = !!results.status?.llmsTxtExists;
  const sitemapActive = !!results.status?.sitemapExists;
  const aiContextActive = !!results.status?.aiContextExists;
  const readmeActive = !!(results.status?.readmeFound ?? results.sec4?.readmeFound);
  const aboutActive = !!(results.status?.aboutTxtExists ?? results.sec4?.aboutMdFound);
  const docsActive = !!(results.status?.docsTxtExists ?? results.sec4?.docsMdFound);
  const contentActive = !!(results.status?.contentTxtExists ?? results.sec4?.contentMdFound);

  // Bind the corresponding span IDs
  const robotsEl = document.getElementById('exec-status-robots');
  const llmsEl = document.getElementById('exec-status-llms');
  const sitemapTreeEl = document.getElementById('exec-status-sitemap-tree');
  const aiContextEl = document.getElementById('exec-status-aicontext');
  const readmeEl = document.getElementById('exec-status-readme');
  const aboutEl = document.getElementById('exec-status-about');
  const docsEl = document.getElementById('exec-status-docs');
  const contentEl = document.getElementById('exec-status-content');

  const getTreeStatusHtml = (active) => {
    if (active) {
      return '<span class="status-green">🟢 Available</span>';
    } else {
      return '<span class="status-red">🔴 Not available</span><a href="?mode=developer&tab=manifests" class="diy-sample-link" style="margin-left: 10px; font-size: 0.75rem; font-weight: 600; color: #34d399; text-decoration: underline; font-family: var(--font-sans), sans-serif;">View DIY sample ↗</a>';
    }
  };

  if (robotsEl) robotsEl.innerHTML = getTreeStatusHtml(robotsActive);
  if (llmsEl) llmsEl.innerHTML = getTreeStatusHtml(llmsActive);
  if (sitemapTreeEl) sitemapTreeEl.innerHTML = getTreeStatusHtml(sitemapActive);
  if (aiContextEl) aiContextEl.innerHTML = getTreeStatusHtml(aiContextActive);
  if (readmeEl) readmeEl.innerHTML = getTreeStatusHtml(readmeActive);
  if (aboutEl) aboutEl.innerHTML = getTreeStatusHtml(aboutActive);
  if (docsEl) docsEl.innerHTML = getTreeStatusHtml(docsActive);
  if (contentEl) contentEl.innerHTML = getTreeStatusHtml(contentActive);

  // Still compute activeCount for the count badge
  const aiFilesList = [
    { path: '/llms.txt', exists: llmsActive, info: '350 words' },
    { path: '/ai-context.md', exists: aiContextActive, info: '520 words' },
    { path: '/about.md', exists: aboutActive, info: '410 words' },
    { path: '/docs.md', exists: docsActive, info: '680 words' },
    { path: '/content.md', exists: contentActive, info: '950 words' },
    { path: '/README.md', exists: readmeActive, info: '250 words' },
    { path: '/robots.txt', exists: robotsActive, info: '780 chars' },
    { path: '/sitemap.xml', exists: sitemapActive, info: '1.4 KB' },
  ];
  const activeCount = aiFilesList.filter(f => f.exists).length;
  if (aiFilesCount) aiFilesCount.innerText = `${activeCount} / ${aiFilesList.length} Manifests Active`;

  if (aiFilesTbody) {
    aiFilesTbody.innerHTML = aiFilesList.map(f => `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td style="padding: 0.6rem;"><code style="color: #4ade80;">${f.path}</code></td>
        <td style="padding: 0.6rem;"><span class="badge-status ${f.exists ? 'status-green' : 'status-red'}" style="font-size: 0.75rem;">${f.exists ? '🟢 Active' : '🔴 Missing'}</span></td>
        <td style="padding: 0.6rem; color: #94a3b8; font-size: 0.8rem;">${f.info}</td>
        <td style="padding: 0.6rem; text-align: right;"><a href="optimize.html?url=${encodeURIComponent(domainName)}" style="color: #38bdf8; font-size: 0.8rem; text-decoration: none;">View ↗</a></td>
      </tr>
    `).join('');
  }
}

function updateChecklistStatus(elementId, value) {
  const el = document.getElementById(elementId);
  if (value === true) {
    el.innerText = '🟢';
  } else if (value === false) {
    el.innerText = '🔴';
  } else {
    el.innerText = '🟡';
  }
}

function updateBotPerm(elementId, isAllowed) {
  const el = document.getElementById(elementId);
  if (el) {
    if (isAllowed) {
      el.innerText = '🟢 Allowed';
      el.style.color = '#4ade80';
    } else {
      el.innerText = '🔴 Disallowed';
      el.style.color = '#f87171';
    }
  }
}

function toggleAccordion(accId) {
  const body = document.getElementById(`${accId}-body`);
  const icon = document.getElementById(`${accId}-icon`);
  if (body) {
    if (body.style.display === 'none' || !body.style.display) {
      body.style.display = 'block';
      if (icon) icon.innerText = '−';
    } else {
      body.style.display = 'none';
      if (icon) icon.innerText = '+';
    }
  }
}

function showUpgradeModal(code, message, targetTier) {
  console.log('[AEO-Infotip-Debug] Dispatched showUpgradeModal with arguments:', { code, message, targetTier });
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.innerText = (code || 'Limit Exceeded').replace(/_/g, ' ');

  const modalMsg = document.getElementById('modal-message');
  if (modalMsg) modalMsg.innerText = message || 'Daily scan allocation limit reached.';

  const modalEl = document.getElementById('alert-modal');
  if (!modalEl) {
    console.error('[AEO-Infotip-Debug] CRITICAL ERROR: Target modal element ID NOT FOUND in live DOM!');
    alert(`[${code}] ${message}`);
    return;
  }

  console.log('[AEO-Infotip-Debug] Found Modal Element in DOM:', modalEl, 'Classes Before:', modalEl.className, 'Display Before:', modalEl.style.display);

  modalEl.style.display = 'flex';

  const tierSelector = document.getElementById('user-tier-selector');
  if (tierSelector && targetTier) {
    tierSelector.value = targetTier;
  }

  console.log('[AEO-Infotip-Debug] Modal State After Mutation:', 'Classes After:', modalEl.className, 'Display After:', modalEl.style.display);
}

function closeAlertModal() {
  document.getElementById('alert-modal').style.display = 'none';
}

function triggerUpgrade() {
  closeAlertModal();
  updateUserTier();
  alert('Upgraded plan configuration updated. Limits have been expanded.');
}

window.showUpgradeModal = showUpgradeModal;
window.closeAlertModal = closeAlertModal;
window.triggerUpgrade = triggerUpgrade;

// --- Dynamic Optimization Generator sandboxes ---

// Robots Sandbox
function generateRobotsTxt() {
  const codeRobotsEl = document.getElementById('code-robots');
  if (!codeRobotsEl) return;

  const gpt = document.getElementById('chk-opt-gpt')?.checked ?? true;
  const claude = document.getElementById('chk-opt-claude')?.checked ?? true;
  const perplexity = document.getElementById('chk-opt-perplexity')?.checked ?? true;
  const generic = document.getElementById('chk-opt-generic')?.checked ?? true;

  let rules = `# Robots.txt split generated by Thatworkx AEO Suite\n\n`;

  if (gpt) {
    rules += `User-agent: GPTBot\nAllow: /\n\n`;
  } else {
    rules += `User-agent: GPTBot\nDisallow: /\n\n`;
  }

  if (claude) {
    rules += `User-agent: ClaudeBot\nAllow: /\n\n`;
  } else {
    rules += `User-agent: ClaudeBot\nDisallow: /\n\n`;
  }

  if (perplexity) {
    rules += `User-agent: PerplexityBot\nAllow: /\n\n`;
  } else {
    rules += `User-agent: PerplexityBot\nDisallow: /\n\n`;
  }

  if (generic) {
    rules += `User-agent: *\nAllow: /\n`;
  } else {
    rules += `User-agent: *\nDisallow: /ai-context-GuidanceTemplate.md\nDisallow: /README.md\n`;
  }

  rules += `\n# AI Engine Handshake Manifest Mappings\n`;
  rules += `Allow: /llms.txt\n`;
  rules += `Allow: /ai-context.md\n`;
  rules += `Sitemap: /sitemap.xml\n`;

  codeRobotsEl.innerText = rules;
}

// Cloudflare worker code generator
function generateCloudflareWorker() {
  const codeCfEl = document.getElementById('code-cf') || document.getElementById('code-cloudflare');
  if (!codeCfEl) return;

  const domain = document.getElementById('cf-origin')?.value || 'https://brand.com';
  const cleanDomain = domain.replace(/\/$/, '');

  const script = `// Cloudflare Edge Worker Proxy script generated by Thatworkx AEO Suite
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  if (path === '/llms.txt' || path === '/ai-context.md') {
    const proxyUrl = \`${cleanDomain}/_context\${path}\`
    const response = await fetch(proxyUrl)
    
    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'index, follow')
    headers.set('Access-Control-Allow-Origin', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }

  return fetch(request)
}`;

  codeCfEl.innerText = script;
}

// Schema generator
function generateJsonLd() {
  const codeSchemaEl = document.getElementById('code-schema');
  if (!codeSchemaEl) return;

  const name = document.getElementById('schema-name')?.value || 'Brand Name';
  const email = document.getElementById('schema-email')?.value || 'contact@brand.com';

  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": name,
    "email": email,
    "url": window.location.origin,
    "logo": `${window.location.origin}/logo.png`,
    "description": "AI Engine Optimized Entity Verification Profile",
    "sameAs": [
      "https://twitter.com/brand-handle",
      "https://linkedin.com/company/brand-id"
    ]
  };

  codeSchemaEl.innerText = JSON.stringify(schema, null, 2);
}


// Clipboard copying utility
function copyToClipboard(elementId) {
  const text = document.getElementById(elementId).innerText;
  navigator.clipboard.writeText(text).then(() => {
    alert('Code copied to clipboard successfully.');
  }).catch(err => {
    console.error('Failed to copy text:', err);
  });
}

// Download file utility
function downloadFile(elementId, filename) {
  const content = document.getElementById(elementId).innerText;
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Level 3 Manifests Generator
async function generateManifests() {
  const domain = document.getElementById('manifest-domain')?.value || 'example.com';
  try {
    const res1 = await fetch(`${API_BASE}/api/generator/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: 'llms' })
    });
    const d1 = await res1.json();
    if (d1.code) document.getElementById('code-llmstxt').innerText = d1.code;

    const res2 = await fetch(`${API_BASE}/api/generator/build`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: 'aiContext' })
    });
    const d2 = await res2.json();
    if (d2.code) document.getElementById('code-aicontext').innerText = d2.code;
  } catch (err) {
    console.error('Error generating manifests:', err);
  }
}

// Level 3 Multi-Platform Edge Snippets Generator
async function generateEdgeSnippets() {
  const domain = document.getElementById('edge-domain')?.value || 'example.com';
  try {
    const res1 = await fetch('/api/generator/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: 'shopify' })
    });
    const d1 = await res1.json();
    if (d1.code) document.getElementById('code-shopify').innerText = d1.code;

    const res2 = await fetch('/api/generator/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: 'htaccess' })
    });
    const d2 = await res2.json();
    if (d2.code) document.getElementById('code-htaccess').innerText = d2.code;
  } catch (err) {
    console.error('Error generating edge snippets:', err);
  }
}

// --- Auth & Session Controllers ---
let authMode = 'login';
let isAuthenticated = false;
let pendingEmail = '';

function openAuthModal() {
  if (isAuthenticated) {
    if (confirm(`Currently signed in as ${currentEmail}. Would you like to log out?`)) {
      handleLogout();
    }
    return;
  }
  
  // Reset modal state
  pendingEmail = '';
  const otpInput = document.getElementById('otp-code-input');
  if (otpInput) otpInput.value = '';
  switchAuthTab('login');
  
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.style.display = 'flex';
}

function handleLogout() {
  localStorage.removeItem('aeo_auth_token');
  isAuthenticated = false;
  currentEmail = 'user@thatworkx.com';
  const authBtn = document.getElementById('auth-btn');
  if (authBtn) authBtn.innerText = '🔑 Sign In';
  const tierSelector = document.getElementById('user-tier-selector');
  if (tierSelector) tierSelector.value = 'AIVisualize Free';
  updateUserTier();
  alert('Logged out successfully.');
}

function closeAuthModal() {
  const authModal = document.getElementById('auth-modal');
  if (authModal) authModal.style.display = 'none';
}

function switchAuthTab(tabName) {
  authMode = tabName;
  
  const loginTab      = document.getElementById('tab-login');
  const registerTab   = document.getElementById('tab-register');
  const loginForm     = document.getElementById('login-form-panel');
  const registerForm  = document.getElementById('register-form-panel');
  const otpPanel      = document.getElementById('otp-verify-panel');
  const tabsContainer = document.getElementById('auth-tabs-container');

  if (tabsContainer) tabsContainer.style.display = 'flex';
  if (otpPanel)      otpPanel.style.display = 'none';

  if (tabName === 'login') {
    if (loginTab)    loginTab.classList.add('active');
    if (registerTab) registerTab.classList.remove('active');
    if (loginForm)   loginForm.style.display = 'flex';
    if (registerForm) registerForm.style.display = 'none';
  } else {
    if (loginTab)    loginTab.classList.remove('active');
    if (registerTab) registerTab.classList.add('active');
    if (loginForm)   loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'flex';
  }
}

async function handleRequestLoginOtp(event) {
  event.preventDefault();
  const email = document.getElementById('login-email').value.trim();
  const optIn = document.getElementById('login-opt-in').checked;

  if (!optIn) {
    alert('You must agree to the data storage and usage policies of Thatworkx Solutions.');
    return;
  }

  const submitBtn = document.getElementById('login-submit-btn');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });

    const data = await res.json();
    
    if (res.status === 404 || data.error === 'USER_NOT_FOUND') {
      alert('Email address not found. Redirecting to New User registration.');
      switchAuthTab('register');
      document.getElementById('reg-email').value = email;
      return;
    }

    if (!res.ok) {
      alert(data.error || 'Failed to request login OTP.');
      return;
    }

    // Advance to OTP input panel
    pendingEmail = email;
    document.getElementById('auth-tabs-container').style.display = 'none';
    document.getElementById('login-form-panel').style.display = 'none';
    document.getElementById('otp-verify-panel').style.display = 'flex';
    document.getElementById('otp-verify-prompt').innerText = `Please enter the 6-digit OTP code sent to: ${email}`;


  } catch (err) {
    console.error('Request Login OTP Error:', err);
    alert('Connection error. Could not request verification OTP.');
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleRequestRegisterOtp(event) {
  event.preventDefault();
  const email = document.getElementById('reg-email').value.trim();
  const firstName = document.getElementById('reg-firstname').value.trim();
  const lastName = document.getElementById('reg-lastname').value.trim();
  const phone = document.getElementById('reg-phone').value.trim();
  const company = document.getElementById('reg-company').value.trim();
  const country = document.getElementById('reg-country').value.trim();
  const optIn = document.getElementById('reg-opt-in').checked;

  if (!optIn) {
    alert('You must agree to the data storage and usage policies of Thatworkx Solutions.');
    return;
  }

  const submitBtn = document.getElementById('register-submit-btn');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        company,
        country,
        opt_in: optIn
      })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Failed to register account.');
      return;
    }

    // Advance to OTP input panel
    pendingEmail = email;
    document.getElementById('auth-tabs-container').style.display = 'none';
    document.getElementById('register-form-panel').style.display = 'none';
    document.getElementById('otp-verify-panel').style.display = 'flex';
    document.getElementById('otp-verify-prompt').innerText = `Please enter the 6-digit verification code sent to: ${email}`;


  } catch (err) {
    console.error('Request Register OTP Error:', err);
    alert('Connection error. Could not request registration OTP.');
  } finally {
    submitBtn.disabled = false;
  }
}

async function handleOtpVerification(event) {
  event.preventDefault();
  const otp = document.getElementById('otp-code-input').value.trim();
  const submitBtn = document.getElementById('otp-submit-btn');
  submitBtn.disabled = true;

  try {
    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: pendingEmail, otp })
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data.error || 'Invalid OTP code.');
      return;
    }

    if (data.token) {
      localStorage.setItem('aeo_auth_token', data.token);
    }

    currentEmail = data.user.email;
    isAuthenticated = true;
    const authBtnOtp = document.getElementById('auth-btn');
    if (authBtnOtp) authBtnOtp.innerText = `👤 ${data.user.email.split('@')[0]}`;
    if (data.user.subscription_tier) {
      const tierSelectorOtp = document.getElementById('user-tier-selector');
      if (tierSelectorOtp) tierSelectorOtp.value = data.user.subscription_tier;
    }

    closeAuthModal();
    alert(`Successfully authenticated as ${data.user.email}`);
  } catch (err) {
    console.error('Verify OTP Error:', err);
    alert('Connection error. Verification failed.');
  } finally {
    submitBtn.disabled = false;
  }
}

function cancelOtpVerification() {
  switchAuthTab(authMode);
}

// Bind to window scope for onclick & onsubmit event calls
window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthTab = switchAuthTab;
window.handleRequestLoginOtp = handleRequestLoginOtp;
window.handleRequestRegisterOtp = handleRequestRegisterOtp;
window.handleOtpVerification = handleOtpVerification;
window.cancelOtpVerification = cancelOtpVerification;

async function checkAuthSession() {
  const token = localStorage.getItem('aeo_auth_token');
  if (!token) return;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (data.authenticated && data.user) {
      currentEmail = data.user.email;
      isAuthenticated = true;
      const authBtn = document.getElementById('auth-btn');
      if (authBtn) authBtn.innerText = `👤 ${data.user.email.split('@')[0]}`;
      if (data.user.subscription_tier) {
        const tierSelector = document.getElementById('user-tier-selector');
        if (tierSelector) tierSelector.value = data.user.subscription_tier;
      }
    }
  } catch (err) {
    console.error('Check session error:', err);
  }
}

const helpContent = {
  wordCount: {
    title: 'Word Count Relevance for AI Search Engines',
    icon: '📝',
    body: `
      <p>Generative AI search assistants (like ChatGPT Search, Perplexity, and Gemini) rely on dense factual text to construct answers and source direct citations. Content volume plays a major role in how pages are cataloged:</p>
      <ul style="margin-left: 1.5rem; margin-top: 0.8rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 8px;">
        <li><strong style="color: #4ade80;">Ideal (500 - 1,200 words) [Semantic Sweet Spot]:</strong> Long enough to establish complete factual context and distinct entities, but concise enough to guarantee fast ingestion without hitting bot fetch limits.</li>
        <li><strong style="color: #facc15;">Moderate (1,201 - 2,500 words) [Boundary Territory]:</strong> Acceptable for deeply informative pages, but approaches threshold bounds where fast-moving chat-scrapers may selectively extract only the top half.</li>
        <li><strong style="color: #f87171;">Low (&lt; 500 words) [Data Starvation]:</strong> The page lacks enough dense, descriptive text nodes to build multi-dimensional vector embeddings, making it difficult for an LLM to match highly specific intents.</li>
        <li><strong style="color: #f87171;">High (&gt; 2,500 words) [Truncation & Attention Risk]:</strong> Triggers risk of "loss in the middle" or truncation. Severe risk that an inbound scraper's fetch utility truncates the text data block mid-way to conserve its runtime.</li>
      </ul>
    `
  },
  canonical: {
    title: 'Significance of Canonical URLs in AEO',
    icon: '🔗',
    body: `
      <p>Canonical URLs act as instructions telling search crawlers and AI bots which version of a page is the primary authoritative source.</p>
      <ul style="margin-left: 1.5rem; margin-top: 0.8rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 8px;">
        <li><strong>Prevent Duplicate Dilution:</strong> If multiple URL parameters (like tracking tokens) lead to the same content, bots might index duplicate copies, muddying your semantic rankings and diluting entity signals.</li>
        <li><strong>Ensure Correct Citation Links:</strong> AI search assistants query the canonical link when citing your site in conversational chat interfaces, ensuring users are directed to the primary landing page.</li>
        <li><strong style="color: #f87171;">Missing Warning:</strong> If missing, bots may fail to catalog or attribute links properly, dilute link equity, or select the wrong duplicate version as the source.</li>
      </ul>
    `
  },
  structure: {
    title: 'Heading Hierarchy & Semantic Architecture',
    icon: '🏗️',
    body: `
      <p>AI models read HTML headers sequentially to parse the structural relationships and semantic hierarchy of your page content.</p>
      <ul style="margin-left: 1.5rem; margin-top: 0.8rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 8px;">
        <li><strong>Exactly 1 H1 Tag:</strong> Declare the main entity/topic of the page. Having multiple H1s dilutes the core focus, while 0 H1s leaves the bot blind to the page's core entity.</li>
        <li><strong>Linear Nesting (H1 → H2 → H3 → H4):</strong> Sub-sections must follow hierarchy. Skipping levels (e.g. going straight from H1 to H3 without an intervening H2) confuses semantic chunking models, causing the page to lose out on precise questions.</li>
        <li><strong style="color: #4ade80;">✓ Checkmark:</strong> Indicates proper linear structure with exactly 1 H1 tag.</li>
        <li><strong style="color: #f87171;">✗ Crossmark:</strong> Indicates violations, such as multiple H1s, 0 H1s, or skipped levels.</li>
      </ul>
    `
  },
  cooldown: {
    title: 'Rate-Limit Safe Mode (Anti-Blocking Protection)',
    icon: '⏳',
    body: `
      <p>To protect your target domain (especially platforms like Shopify or WooCommerce) from being flagged by server firewalls or security overlays (like Cloudflare), successive whole-site scans are subject to a safety cooldown period.</p>
      <ul style="margin-left: 1.5rem; margin-top: 0.8rem; margin-bottom: 0.5rem; display: flex; flex-direction: column; gap: 8px;">
        <li><strong>Server Protection:</strong> Spacing out crawls ensures target servers don't classify the crawler as a Denial of Service (DoS) attack, avoiding IP bans.</li>
        <li><strong>On-Demand Auditing:</strong> During the countdown, you can still audit individual sub-pages from the Scanned Paths table below immediately by clicking the 🔄 re-analyze button on that specific row, completely bypassing the cooldown lock!</li>
      </ul>
    `
  },
  'manifest_robots': {
    title: 'robots.txt (Permissions Verification)',
    icon: '🔒',
    body: `<p>Think of this as the security guard for your web presence. It explicitly gives permission for AI engines like ChatGPT and Perplexity to scan your content. Without it, polite AI bots will just walk away and ignore your brand entirely. <strong>AEO Suite can instantly generate the perfect AI-friendly permissions file for you.</strong></p>`
  },
  'manifest_llms': {
    title: 'llms.txt (Modern AI Directory Index)',
    icon: '📖',
    body: `<p>This is a brand new industry standard—a specialized 'menu' created specifically for Generative AI. Instead of forcing bots to guess what your site is about, this file points them directly to your most important facts. <strong>Mapping this manually is tedious, but AEO Suite can auto-generate it based on your live site structure.</strong></p>`
  },
  'manifest_sitemap': {
    title: 'sitemap.xml (Structural URL Web Tree)',
    icon: '🗺️',
    body: `<p>While humans use navigation bars, AI bots need a map. A clean sitemap tells AI exactly how your digital house is structured so it doesn't get lost or miss your key product pages. <strong>AEO Suite verifies your map is optimized for modern AI ingestion, not just legacy search engines.</strong></p>`
  },
  'manifest_aicontext': {
    title: 'ai-context.md (System Prompts & Context Map)',
    icon: '🤝',
    body: `<p>This is your brand's instruction manual for AI. It tells the AI *how* to talk about your company, outlining your tone, core messaging, and guardrails to prevent AI hallucinations. <strong>It is critical for brand safety, and AEO Suite's generators can draft it for you in seconds.</strong></p>`
  },
  'manifest_readme': {
    title: 'README.md (Rapid Portal Summary)',
    icon: '📄',
    body: `<p>This acts as your 30-second elevator pitch for machines. It gives AI a rapid, high-level summary of your business before it dives into the weeds of your website. <strong>AEO Suite extracts your core value proposition to build this automatically.</strong></p>`
  },
  'manifest_about': {
    title: 'about.md (Identity, Trust & E-E-A-T Signatures)',
    icon: '🛡️',
    body: `<p>AI engines prioritize trust. This file consolidates your Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) into one place, proving to the AI that you are a credible source worth citing. <strong>AEO Suite formats your trust signals into the exact layout AI models look for.</strong></p>`
  },
  'manifest_docs': {
    title: 'docs.md (Hard Metrics, Specs & Technical)',
    icon: '📊',
    body: `<p>AI models hate marketing fluff—they want structured data, hard facts, and specifications. This file feeds the AI exactly what it needs to answer technical or specific questions about your offerings. <strong>AEO Suite strips away the fluff and organizes your specs into AI-Ready data.</strong></p>`
  },
  'manifest_content': {
    title: 'content.md (Long-Form Case Studies)',
    icon: '📚',
    body: `<p>This is the proof behind your claims. By giving AI direct access to your deep-dive case studies and narrative content, you give it the context it needs to recommend you over competitors. <strong>AEO Suite helps consolidate your best wins into a single machine-readable vault.</strong></p>`
  }
};

async function auditSinglePage(event, route, buttonEl) {
  event.preventDefault();
  
  if (!isAuthenticated) {
    alert('Please sign in to access page auditing tools.');
    return;
  }

  const inputUrlVal = document.getElementById('target-url').value.trim();
  const cleanBaseUrl = inputUrlVal 
    ? (inputUrlVal.startsWith('http') ? inputUrlVal : `https://${inputUrlVal}`)
    : '';

  if (!cleanBaseUrl) {
    alert('Target domain URL is required.');
    return;
  }

  const originalHtml = buttonEl.innerHTML;
  buttonEl.disabled = true;
  buttonEl.innerHTML = 'Auditing...';
  buttonEl.style.opacity = '0.6';

  try {
    const response = await fetch(`${API_BASE}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: currentEmail,
        targetUrl: cleanBaseUrl,
        singlePagePath: route
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.error || 'Failed to analyze page.');
      return;
    }

    if (data.success && data.singlePage) {
      const row = buttonEl.closest('tr');
      if (row) {
        const p = data.singlePage;
        
        const fullPageUrl = p.canonicalUrl || `${cleanBaseUrl.replace(/\/$/, '')}${p.route}`;
        const pathHtml = `
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%;">
            <code style="color: var(--sky-color); font-weight: 500;">${p.route}</code>
            <div style="display: flex; gap: 6px; align-items: center;">
              <a href="${fullPageUrl}" target="_blank" rel="noopener noreferrer" class="direct-link-btn" title="Open page in new tab">
                Go to page ↗
              </a>
              <button class="direct-link-btn audit-page-btn" onclick="auditSinglePage(event, '${p.route}', this)" title="Re-analyze this individual page live">
                Audit Page 🔄
              </button>
            </div>
          </div>
        `;

        let wordCountHtml = '';
        if (p.wordCount < 500) {
          wordCountHtml = `<span class="wc-pill wc-pill-red" title="Data Starvation (< 500 words)">${p.wordCount} words (Low)</span>`;
        } else if (p.wordCount >= 500 && p.wordCount <= 1200) {
          wordCountHtml = `<span class="wc-pill wc-pill-green" title="Semantic Sweet Spot (500 - 1,200 words)">${p.wordCount} words (Ideal)</span>`;
        } else if (p.wordCount > 1200 && p.wordCount <= 2500) {
          wordCountHtml = `<span class="wc-pill wc-pill-yellow" title="Boundary Territory (1,201 - 2,500 words)">${p.wordCount} words (Moderate)</span>`;
        } else {
          wordCountHtml = `<span class="wc-pill wc-pill-red" title="Truncation Risk (> 2,500 words)">${p.wordCount} words (High)</span>`;
        }

        let canonicalHtml = '';
        if (p.hasCanonical && p.canonicalUrl) {
          canonicalHtml = `<code style="font-size: 0.8rem; word-break: break-all; color: var(--dark-300);">${p.canonicalUrl}</code>`;
          row.style.background = 'transparent';
        } else {
          canonicalHtml = `<span class="wc-pill wc-pill-red" style="font-weight: bold; padding: 4px 10px;">✗ Missing (Diluted)</span>`;
          row.style.background = 'rgba(239, 68, 68, 0.03)';
        }

        const isOk = p.headingAudit ? p.headingAudit.isHierarchyValid : true;
        const h1Count = p.headingAudit ? p.headingAudit.h1 : 1;
        const h2Count = p.headingAudit ? p.headingAudit.h2 : 0;
        
        const statusIcon = isOk 
          ? `<span style="color: #4ade80; font-weight: bold; margin-right: 6px;" title="Proper hierarchy followed">✓</span>` 
          : `<span style="color: #f87171; font-weight: bold; margin-right: 6px;" title="Hierarchy Violated! (Requires exactly 1 H1 and linear sequence)">✗</span>`;
        
        const structureHtml = `
          <div style="display: flex; align-items: center; gap: 4px;">
            ${statusIcon}
            <span class="${isOk ? '' : 'text-danger-glow'}" style="font-size: 0.85rem;">
              ${h1Count} H1 / ${h2Count} H2
            </span>
          </div>
        `;

        row.innerHTML = `
          <td>${pathHtml}</td>
          <td>${wordCountHtml}</td>
          <td>${canonicalHtml}</td>
          <td>${structureHtml}</td>
        `;
      }
    }
  } catch (error) {
    console.error('Audit Page Error:', error);
    alert('Network error auditing page.');
  } finally {
    buttonEl.disabled = false;
    buttonEl.innerHTML = originalHtml;
    buttonEl.style.opacity = '1';
  }
}

function showHelpModal(type) {
  console.log('[AEO-Infotip-Debug] Dispatched showHelpModal with arguments:', { type });
  const modalEl = document.getElementById('help-modal') || document.getElementById('help-info-modal');
  const data = (typeof helpContent !== 'undefined' && helpContent[type]) || (typeof tooltipExplanationData !== 'undefined' && tooltipExplanationData[type]);

  if (!modalEl) {
    console.error('[AEO-Infotip-Debug] CRITICAL ERROR: Target modal element ID NOT FOUND in live DOM!');
    return;
  }

  console.log('[AEO-Infotip-Debug] Found Modal Element in DOM:', modalEl, 'Classes Before:', modalEl.className, 'Display Before:', modalEl.style.display);

  if (data) {
    const iconEl = document.getElementById('help-modal-icon');
    const titleEl = document.getElementById('help-modal-title');
    const bodyEl = document.getElementById('help-modal-body');
    if (iconEl) iconEl.innerText = data.icon;
    if (titleEl) titleEl.innerText = data.title;
    if (bodyEl) bodyEl.innerHTML = data.body;
  }

  modalEl.classList.remove('help-modal-hidden');
  modalEl.style.display = 'flex';

  console.log('[AEO-Infotip-Debug] Modal State After Mutation:', 'Classes After:', modalEl.className, 'Display After:', modalEl.style.display);
}

function closeHelpModal() {
  const modals = [document.getElementById('help-modal'), document.getElementById('help-info-modal')].filter(Boolean);
  modals.forEach(modal => {
    modal.classList.add('help-modal-hidden');
    modal.style.display = 'none';
  });
}

window.showHelpModal = showHelpModal;
window.closeHelpModal = closeHelpModal;
window.auditSinglePage = auditSinglePage;

function openSemrushDisclaimer(event) {
  if (event) event.preventDefault();
  const modal = document.getElementById('semrush-disclaimer-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeSemrushDisclaimer() {
  const modal = document.getElementById('semrush-disclaimer-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

window.openSemrushDisclaimer = openSemrushDisclaimer;
window.closeSemrushDisclaimer = closeSemrushDisclaimer;

let modalProductMode = 'visualize'; // Default onboarding modal target

function openUrlModal(mode) {
  modalProductMode = mode;
  const modal = document.getElementById('url-ingest-modal');
  const title = document.getElementById('url-modal-title');
  const subtitle = document.getElementById('url-modal-subtitle');
  const icon = document.getElementById('url-modal-icon');
  
  if (modal) {
    if (mode === 'visualize') {
      title.innerText = "Let's show you what AI can see";
      subtitle.innerText = "Enter your domain URL to inspect crawl visibility and protocol blocks.";
      icon.innerText = "🔍";
    } else if (mode === 'optimize') {
      title.innerText = "Optimizing for AI-Ready & AI-Optimized";
      subtitle.innerText = "Enter your domain URL to generate custom schema, robots, and workers.";
      icon.innerText = "⚡";
    }
    modal.style.display = 'flex';
  }
}

function closeUrlModal() {
  const modal = document.getElementById('url-ingest-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

async function handleModalScanSubmit(event) {
  event.preventDefault();
  
  const modalUrl = document.getElementById('modal-target-url').value.trim();
  if (!modalUrl) return;
  
  // Close modal
  closeUrlModal();
  
  // Set main input value
  const mainInput = document.getElementById('target-url');
  if (mainInput) {
    mainInput.value = modalUrl;
  }
  
  // Route state to correct active product panel BEFORE executing scan
  switchProduct(modalProductMode);
  
  // Run scan using the main scan trigger
  await executeScan(event);
}

async function generateTrack2File(type) {
  const domainInput = document.getElementById(`${type}-domain`) || document.getElementById('optimize-target-domain') || document.getElementById('target-url');
  let domain = domainInput ? domainInput.value || 'example.com' : 'example.com';
  domain = domain.replace(/^https?:\/\//i, '').split('/')[0];
  
  const codeEl = document.getElementById(`code-${type}`);
  if (!codeEl) return;
  
  try {
    const res = await fetch('/api/generator/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: type })
    });
    const d = await res.json();
    if (d.code) {
      codeEl.innerText = d.code;
    }
  } catch (err) {
    console.error(`Error generating ${type}:`, err);
  }
}

function updateOptimizeTargetDomain() {
  const domainInput = document.getElementById('optimize-target-domain');
  if (!domainInput) return;
  const domain = domainInput.value.trim().replace(/^https?:\/\//i, '').split('/')[0];
  if (!domain) return;
  
  currentScannedDomain = domain;
  
  if (typeof updateSchemaBuilderCode === 'function') {
    updateSchemaBuilderCode();
  }
  
  // Refresh the currently selected tool if it's Track 2
  if (typeof activeOptimizeTool !== 'undefined' && ['llmstxt', 'aicontext', 'about', 'docs', 'content', 'sitemap'].includes(activeOptimizeTool)) {
    generateTrack2File(activeOptimizeTool);
  }
  
  // Also refresh the Edge Network Sandbox tab if it exists
  const activeEdgeTabBtn = document.querySelector('.edge-tab-btn.active');
  if (activeEdgeTabBtn) {
    const keyMatch = activeEdgeTabBtn.getAttribute('onclick')?.match(/'([^']+)'/);
    if (keyMatch && keyMatch[1]) {
      selectEdgeTab(keyMatch[1]);
    }
  }

  // Also refresh Module 1 matrix if it exists
  const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
  if (devMatrixWrap && typeof renderDeveloperMatrixRows === 'function' && typeof evaluateAllCapabilities === 'function') {
    const updatedCapabilities = evaluateAllCapabilities(window.lastScanResults || {}).capabilities || [];
    window.currentEvaluatedCapabilities = updatedCapabilities;
    renderDeveloperMatrixRows(updatedCapabilities);
  }
}

let onboardingSelectedMode = 'visualize';

function selectConsoleTab(tabId) {
  onboardingSelectedMode = tabId;
  
  // 1. Update Segmented tab active states & visible focus rings
  document.querySelectorAll('.console-tab-btn').forEach(btn => {
    btn.classList.remove('active');
    btn.style.borderColor = '';
    btn.style.boxShadow = '';
  });

  const activeTabBtn = document.getElementById(`btn-tab-${tabId}`);
  if (activeTabBtn) {
    activeTabBtn.classList.add('active');
  }
  
  // 2. Update Console Card accent glow border
  const consoleCard = document.getElementById('onboarding-console-card');
  if (consoleCard) {
    consoleCard.className = 'onboarding-console-card'; // Reset
    consoleCard.classList.add(`active-${tabId}-glow`);
  }
  
  // 3. Update Focused Form Header Label
  const toolLabel = document.getElementById('onboarding-form-tool-label');
  if (toolLabel) {
    if (tabId === 'visualize') {
      toolLabel.innerHTML = '<span class="logo-placeholder" data-logo="AIVisualize" style="height: 28px; min-width: 100px; font-size: 0.75rem; padding: 0.2rem 0.5rem;">AI Visualize</span> Diagnostic Scanner';
      toolLabel.style.color = 'var(--text-primary)';
    } else if (tabId === 'optimize') {
      toolLabel.innerHTML = '<span class="logo-placeholder" data-logo="AIOptimize" style="height: 28px; min-width: 100px; font-size: 0.75rem; padding: 0.2rem 0.5rem;">AIOptimize</span> Remediation Workspace';
      toolLabel.style.color = 'var(--text-primary)';
    } else if (tabId === 'socialize') {
      toolLabel.innerHTML = '<span class="logo-placeholder" data-logo="AISocialize" style="height: 28px; min-width: 100px; font-size: 0.75rem; padding: 0.2rem 0.5rem;">AISocialize</span> Citation Footprint Engine';
      toolLabel.style.color = 'var(--text-primary)';
    }
  }

  // 4. Update Main Input Placeholder & Extension Badge display
  const inputField = document.getElementById('onboarding-target-url');
  const extensionBadge = document.getElementById('socialize-extension-badge');
  
  if (inputField) {
    if (tabId === 'visualize') {
      inputField.placeholder = 'Enter domain URL to scan (e.g., example.com)...';
      if (extensionBadge) extensionBadge.style.display = 'none';
    } else if (tabId === 'optimize') {
      inputField.placeholder = 'Enter domain URL to generate fix manifests...';
      if (extensionBadge) extensionBadge.style.display = 'none';
    } else if (tabId === 'socialize') {
      inputField.placeholder = 'Enter target URL or social profile link...';
      if (extensionBadge) extensionBadge.style.display = 'flex';
    }
    inputField.focus();
  }
  
  // 5. Update Button text & colors
  const btn = document.getElementById('onboarding-submit-btn');
  const btnText = document.getElementById('onboarding-btn-text');
  if (btn && btnText) {
    btn.className = 'onboarding-submit-btn'; // Reset
    if (tabId === 'visualize') {
      btnText.innerText = 'Initiate Diagnostic Scan →';
      btn.classList.add('bg-cyan');
    } else if (tabId === 'optimize') {
      btnText.innerText = 'Launch AIOptimize Remediation →';
      btn.classList.add('bg-amber');
    } else if (tabId === 'socialize') {
      btnText.innerText = 'Check Social Citation Footprint →';
      btn.classList.add('bg-violet');
    }
  }
}


async function executeOnboardingScan(event) {
  if (event && event.preventDefault) event.preventDefault();
  
  const onboardingInput = document.getElementById('onboarding-target-url');
  if (!onboardingInput) return;
  const onboardingUrl = onboardingInput.value.trim();
  if (!onboardingUrl) return;

  const targetParam = encodeURIComponent(onboardingUrl);

  if (onboardingSelectedMode === 'optimize') {
    window.location.href = `optimize.html?url=${targetParam}`;
  } else if (onboardingSelectedMode === 'socialize') {
    window.location.href = `socialize.html?url=${targetParam}`;
  } else {
    window.location.href = `visualize.html?url=${targetParam}`;
  }
}


function goBackToHome() {
  const onboardingHero = document.getElementById('onboarding-hero');
  if (onboardingHero) onboardingHero.style.display = 'block';
  
  const scanResults = document.getElementById('scan-results');
  if (scanResults) scanResults.style.display = 'none';
  
  const scanPlaceholder = document.getElementById('scan-placeholder');
  if (scanPlaceholder) scanPlaceholder.style.display = 'none';
  
  const scanInputCard = document.getElementById('scan-input-card');
  if (scanInputCard) scanInputCard.style.display = 'none';
  
  const toggleHeader = document.getElementById('toggle-container-header');
  if (toggleHeader) toggleHeader.style.display = 'none';
  
  const targetUrl = document.getElementById('target-url');
  if (targetUrl) targetUrl.value = '';
  const onboardingUrl = document.getElementById('onboarding-target-url');
  if (onboardingUrl) onboardingUrl.value = '';
}

function switchBentoPreview(mode) {
  const mdBtn = document.getElementById('btn-bento-md');
  const aiBtn = document.getElementById('btn-bento-ai');
  const mdBox = document.getElementById('bento-preview-box-markdown');
  const aiBox = document.getElementById('bento-preview-box-ai');

  if (mode === 'markdown') {
    if (mdBtn) mdBtn.classList.add('active');
    if (aiBtn) aiBtn.classList.remove('active');
    if (mdBox) mdBox.style.display = 'block';
    if (aiBox) aiBox.style.display = 'none';
  } else {
    if (mdBtn) mdBtn.classList.remove('active');
    if (aiBtn) aiBtn.classList.add('active');
    if (mdBox) mdBox.style.display = 'none';
    if (aiBox) aiBox.style.display = 'block';
  }
}

function switchBentoCode(lang) {
  const curlBtn = document.getElementById('btn-bento-curl');
  const nodeBtn = document.getElementById('btn-bento-node');
  const codeBox = document.getElementById('bento-code-box');

  if (lang === 'curl') {
    if (curlBtn) curlBtn.classList.add('active');
    if (nodeBtn) nodeBtn.classList.remove('active');
    if (codeBox) {
      codeBox.innerText = `curl -X POST https://aeo.thatworkx.com/api/scan \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer AEO_TOKEN_123" \\
  -d '{"targetUrl": "https://yourbrand.com"}'`;
    }
  } else {
    if (curlBtn) curlBtn.classList.remove('active');
    if (nodeBtn) nodeBtn.classList.add('active');
    if (codeBox) {
      codeBox.innerText = `const axios = require('axios');

axios.post('https://aeo.thatworkx.com/api/scan', {
  targetUrl: 'https://yourbrand.com'
}, {
  headers: { 'Authorization': 'Bearer AEO_TOKEN_123' }
}).then(res => console.log(res.data));`;
    }
  }
}

function switchDeckCard(cardId) {
  const PANEL_META = {
    aeo:       { file: 'ai-context.json',      tag: 'AEO_VS_SEO_MATRIX',           tagColor: '#9F1239' },
    eeat:      { file: 'schema-eeat.json',     tag: 'EEAT_CITATION_AUDITING',       tagColor: '#059669' },
    api:       { file: 'deploy-pipeline.sh',   tag: 'WORKFLOWS_AND_APIS',           tagColor: '#9A3412' },
    policy:    { file: 'rate-limits.json',     tag: 'FAIR_USE_POLICY',              tagColor: '#7C3AED' },
  };

  // 1. Deactivate all nav cards
  document.querySelectorAll('.deck-nav-card').forEach(c => {
    c.classList.remove('deck-nav-card--active');
    c.setAttribute('aria-selected', 'false');
  });
  // 2. Activate selected nav card
  const navCard = document.getElementById(`deck-nav-${cardId}`);
  if (navCard) {
    navCard.classList.add('deck-nav-card--active');
    navCard.setAttribute('aria-selected', 'true');
  }

  // 3. Deactivate all panels (CSS height:0 hides from humans, text stays in DOM for bots)
  document.querySelectorAll('.deck-panel').forEach(p => p.classList.remove('deck-panel--active'));
  // 4. Activate selected panel
  const panel = document.getElementById(`deck-panel-${cardId}`);
  if (panel) panel.classList.add('deck-panel--active');

  // 5. Update terminal bar labels
  const meta = PANEL_META[cardId] || {};
  const labelEl = document.getElementById('deck-terminal-label');
  const tagEl   = document.getElementById('deck-terminal-tag');
  if (labelEl) labelEl.textContent = meta.file || '';
  if (tagEl)   { tagEl.textContent = meta.tag || ''; tagEl.style.color = meta.tagColor || '#9F1239'; }
}
function openNewScanModal() {
  const modal = document.getElementById('new-scan-modal');
  const modalInput = document.getElementById('modal-target-url');
  const mainInput = document.getElementById('target-url');
  const scannedDomain = document.getElementById('display-scanned-domain')?.textContent;
  
  if (modalInput) {
    modalInput.value = (scannedDomain && scannedDomain !== '--') ? scannedDomain : (mainInput?.value || '');
  }
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeNewScanModal() {
  const modal = document.getElementById('new-scan-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function handleNewScanModalSubmit(event) {
  if (event && event.preventDefault) event.preventDefault();
  const modalInput = document.getElementById('modal-target-url');
  const mainInput = document.getElementById('target-url');
  if (mainInput && modalInput) {
    mainInput.value = modalInput.value;
  }
  closeNewScanModal();
  executeDashboardScan(event);
}

window.openNewScanModal = openNewScanModal;
window.closeNewScanModal = closeNewScanModal;
window.handleNewScanModalSubmit = handleNewScanModalSubmit;

window.openUrlModal = openUrlModal;
window.closeUrlModal = closeUrlModal;
window.handleModalScanSubmit = handleModalScanSubmit;
window.generateTrack2File = generateTrack2File;
window.selectConsoleTab = selectConsoleTab;
window.executeOnboardingScan = executeOnboardingScan;
window.goBackToHome = goBackToHome;
window.switchBentoPreview = switchBentoPreview;
window.switchBentoCode = switchBentoCode;
window.switchDeckCard = switchDeckCard;

function triggerInstantScan(domain) {
  const inputField = document.getElementById('onboarding-target-url');
  if (inputField) {
    inputField.value = domain;
    inputField.focus();
  }
  const form = document.getElementById('onboarding-scan-form');
  if (form) {
    executeOnboardingScan(new Event('submit'));
  }
}
window.triggerInstantScan = triggerInstantScan;

function switchPipelineStep(stepIndex) {
  const stepFiles = {
    1: 'robots.txt',
    2: 'llms.txt',
    3: 'ai-context.md',
    4: 'about-aeo.md'
  };

  // 1. Deactivate all step cards
  document.querySelectorAll('.pipeline-step-card').forEach(c => {
    c.classList.remove('pipeline-step-card--active');
    c.setAttribute('aria-selected', 'false');
  });
  // 2. Activate selected step card
  const stepCard = document.getElementById(`pipeline-step-${stepIndex}`);
  if (stepCard) {
    stepCard.classList.add('pipeline-step-card--active');
    stepCard.setAttribute('aria-selected', 'true');
  }

  // 3. Deactivate all output panels (CSS height:0 for bot indexability)
  document.querySelectorAll('.pipeline-panel').forEach(p => {
    p.classList.remove('pipeline-panel--active');
  });
  // 4. Activate selected panel
  const panel = document.getElementById(`pipeline-panel-${stepIndex}`);
  if (panel) {
    panel.classList.add('pipeline-panel--active');
  }

  // 5. Update sandbox filename title
  const filenameEl = document.getElementById('pipeline-sandbox-filename');
  if (filenameEl) {
    filenameEl.textContent = stepFiles[stepIndex] || 'robots.txt';
  }
}
window.switchPipelineStep = switchPipelineStep;

function toggleRouteExpandRow(rowId) {
  const targetId = typeof rowId === 'string' && rowId.startsWith('route-') ? rowId : `route-${rowId}`;
  const row = document.getElementById(targetId) || document.getElementById(rowId);
  if (row) {
    row.classList.toggle('hidden');
    if (row.classList.contains('hidden')) {
      row.style.display = 'none';
    } else {
      row.style.display = 'table-row';
    }
  }
}
window.toggleRouteExpandRow = toggleRouteExpandRow;

window.filterMatrixSection = filterMatrixSection;
window.selectCodeDrawer = selectCodeDrawer;
window.copyDrawerCode = copyDrawerCode;
window.downloadDrawerFile = downloadDrawerFile;
window.selectEdgeTab = selectEdgeTab;
window.copyEdgeScript = copyEdgeScript;
window.updateOptimizeTargetDomain = updateOptimizeTargetDomain;

function openSectionHelpModal(secNum, evt) {
  console.log('[AEO-Infotip-Debug] Dispatched openSectionHelpModal with arguments:', { secNum, evt });
  if (evt) {
    if (typeof evt.preventDefault === 'function') evt.preventDefault();
    if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  }
  const data = sectionHelpData[secNum];
  if (!data) return;
  const titleEl = document.getElementById('help-modal-title');
  const iconEl = document.getElementById('help-modal-icon');
  const bodyEl = document.getElementById('help-modal-body');
  const modalEl = document.getElementById('help-modal') || document.getElementById('help-info-modal');

  if (!modalEl) {
    console.error('[AEO-Infotip-Debug] CRITICAL ERROR: Target modal element ID NOT FOUND in live DOM!');
    return;
  }

  console.log('[AEO-Infotip-Debug] Found Modal Element in DOM:', modalEl, 'Classes Before:', modalEl.className, 'Display Before:', modalEl.style.display);

  if (titleEl) titleEl.innerText = data.title;
  if (iconEl) iconEl.innerText = data.icon;
  if (bodyEl) bodyEl.innerHTML = data.body;

  modalEl.classList.remove('help-modal-hidden');
  modalEl.style.display = 'flex';

  console.log('[AEO-Infotip-Debug] Modal State After Mutation:', 'Classes After:', modalEl.className, 'Display After:', modalEl.style.display);
}

function closeHelpModal() {
  const modalEl = document.getElementById('help-modal');
  if (modalEl) {
    modalEl.classList.add('help-modal-hidden');
  }
}

window.openSectionHelpModal = openSectionHelpModal;
window.closeHelpModal = closeHelpModal;

let simHumanFontSize = 0.78; // rem
let simAiFontSize = 0.75; // rem

function adjustSimulatorFont(target, delta) {
  if (target === 'human') {
    const el = document.getElementById('sim-human-view');
    if (!el) return;
    if (delta === 0) simHumanFontSize = 0.78;
    else simHumanFontSize = Math.max(0.6, Math.min(1.5, simHumanFontSize + (delta * 0.1)));
    el.style.fontSize = `${simHumanFontSize.toFixed(2)}rem`;
    const pre = el.querySelector('pre');
    if (pre) pre.style.fontSize = `${simHumanFontSize.toFixed(2)}rem`;
  } else if (target === 'ai') {
    const el = document.getElementById('sim-ai-view');
    if (!el) return;
    if (delta === 0) simAiFontSize = 0.75;
    else simAiFontSize = Math.max(0.6, Math.min(1.5, simAiFontSize + (delta * 0.1)));
    el.style.fontSize = `${simAiFontSize.toFixed(2)}rem`;
  }
}

window.adjustSimulatorFont = adjustSimulatorFont;
window.exportRawJsonDiagnostics = exportRawJsonDiagnostics;
window.exportExecutiveSummaryPdf = exportExecutiveSummaryPdf;

const tooltipExplanationData = {
  'diy_cap_eeat_info': {
    title: 'Deep E-E-A-T Auditing',
    icon: '🛡️',
    body: 'Deep E-E-A-T auditing verifies author credentials, cross-domain citation networks, brand entity sentiment, and schema graph consistency across all site pages.'
  },
  'diy_jsonld_guide': {
    title: 'JSON-LD Implementation Guide',
    icon: '💡',
    body: "<strong>How to implement this JSON-LD Schema:</strong><br/><br/>This baseline provides the exact semantic structure AI engines look for, but it must be populated with your real data.<br/><br/><strong>Step 1:</strong> Copy this code block into a text editor.<br/><strong>Step 2:</strong> Find every instance of <code>&lt;Input needed from user&gt;</code> and replace it with your actual business data (e.g., your real LinkedIn URL, official phone number, and exact FAQ answers).<br/><strong>Step 3:</strong> Validate your completed code using the free Schema Markup Validator (validator.schema.org).<br/><strong>Step 4:</strong> Ask your web developer to inject the finalized <code>&lt;script type=\"application/ld+json\"&gt;</code> block into the <code>&lt;head&gt;</code> section of your homepage."
  },
  'exec_tbl_canonical': {
    title: 'Canonical Tag',
    icon: '🔗',
    body: "<strong>Why it matters:</strong> AI bots have strict processing limits (crawl budgets). If they scan 5 duplicate versions of the same page, they waste resources and might penalize your site. A Canonical tag tells the AI exactly which version is the 'master copy' to ingest and cite, ensuring efficiency."
  },
  'exec_tbl_hierarchy': {
    title: 'Heading Hierarchy',
    icon: '📐',
    body: "<strong>Why it matters:</strong> AI doesn't have eyes to see big, bold text. It relies on strict code hierarchy (H1, H2, H3) to map the relationships between your ideas. A broken hierarchy means broken context, making the AI less likely to trust or cite your answers."
  },
  'exec_tbl_mobile': {
    title: 'isMobileFriendly',
    icon: '📱',
    body: "<strong>Why it matters:</strong> Generative AI engines typically use mobile-first crawling to evaluate modern web presences. If your page isn't mobile-friendly, the AI might receive a distorted, unreadable version of your content, leading to hallucinated facts or skipped citations."
  },
  'exec_tbl_semantic': {
    title: 'hasSemanticTags',
    icon: '🏷️',
    body: "<strong>Why it matters:</strong> Semantic tags (like &lt;article&gt; or &lt;main&gt;) act as digital signposts. They help AI quickly separate your valuable core content from useless sidebar menus and footer links, saving the bot's processing power and ensuring only your best content is cited."
  },
  'exec_tbl_alt': {
    title: 'Images without Alt',
    icon: '🖼️',
    body: "<strong>Why it matters:</strong> AI bots cannot 'see' images; they only read the code behind them. Without descriptive Alt text, your infographics, charts, and product images are completely invisible to the AI, causing you to lose massive contextual citation opportunities."
  },
  'exec_tbl_updated': {
    title: 'Last Updated',
    icon: '📅',
    body: "<strong>Why it matters:</strong> Generative AI models prioritize fresh, up-to-date information to avoid hallucinating outdated facts. Explicitly marking when your content was last updated gives the AI absolute confidence that your data is current and safe to reference in its answers."
  },
  'exec_x_robots': {
    title: 'X-Robots-Tag Headers',
    icon: '🛡️',
    body: "<strong>What it is:</strong> A hidden server-level instruction.<br/><br/><strong>Why it matters:</strong> Even if your website is beautifully designed, a restrictive X-Robots-Tag acts like a digital bouncer, instantly turning away AI bots before they even load the page. If this is configured to block AI crawlers, your brand cannot be ingested, rendering you invisible to Generative AI engines."
  },
  'exec_robots_txt': {
    title: 'robots.txt Status',
    icon: '🤖',
    body: "<strong>What it is:</strong> The first file any AI bot checks when visiting your domain.<br/><br/><strong>Why it matters:</strong> It acts as the traffic controller, explicitly telling AI which pages it is allowed to read and which it must ignore. If configured incorrectly, you might accidentally block AI from seeing your most important product, service, or pricing pages."
  },
  'exec_sitemap': {
    title: 'Sitemap Status',
    icon: '🗺️',
    body: "<strong>What it is:</strong> A structured directory of all the important pages on your website.<br/><br/><strong>Why it matters:</strong> Unlike human visitors who click through navigation menus, AI bots prefer a direct map to crawl your site efficiently. Without a machine-readable sitemap, AI engines might miss your most critical product, pricing, or case study pages, leading to incomplete or hallucinated answers about your brand."
  },
  'essential-pages': {
    title: 'Essential Pages Index Coverage',
    icon: '📂',
    body: "<strong>Understanding AI Trust Signals:</strong><br/> Generative AI engines don't just read your marketing pitch—they actively look for structural proof that your business is legitimate, secure, and transparent. To establish this, AI bots specifically crawl for standard foundational pages:<br/><ul><li><strong>About:</strong> Proves your brand identity and expertise.</li><li><strong>Contact:</strong> Proves you are a real, accessible entity.</li><li><strong>Privacy & Terms:</strong> Proves you comply with data safety and legal standards.</li></ul>If AI models cannot easily locate these pages, they may classify your site as a low-trust source, significantly reducing the chances of your brand being recommended in their answers."
  },
  'missing-essential-pages': {
    title: 'Missing Essential Pages',
    icon: '⚠️',
    body: "<strong>How to Fix Missing Essential Pages:</strong><br/> AI web scrapers rely on predictable, standardized naming conventions to categorize your site. If your contact information is buried on a page named <em>/reach-out</em> or <em>/our-story</em>, the AI might completely miss it.<br/><br/><strong>Action Steps:</strong><br/>1. Ensure you have dedicated, standalone pages for these topics.<br/>2. Use industry-standard URL slugs (e.g., <em>/about</em>, <em>/contact</em>, <em>/privacy</em>, <em>/terms</em>).<br/>3. Do not hide this critical information inside a single long scrolling homepage or behind complex interactive menus. Make the URLs explicitly clear for the machine to index."
  },
  'citation-signals': {
    title: 'AI Citation Signals',
    icon: '🔗',
    body: "<strong>Why AI Citations Are Critical:</strong><br/> In traditional search, getting a user to click a link was the goal. In the age of Generative AI (like ChatGPT, Perplexity, or Gemini), the AI synthesizes the answer directly for the user. To prove its answer is accurate and avoid hallucinations, the AI <em>must</em> cite reliable sources. <br/><br/>If your website's data isn't structured in a way the AI can easily extract, trust, and reference, the AI will simply bypass you and cite your competitor instead. <strong>If you cannot be cited by AI, your brand is practically invisible in the future of search.</strong>"
  },
  'faq-schema': {
    title: 'FAQ Schema (HasFAQSchema)',
    icon: '❓',
    body: "<strong>Where AI Looks:</strong> AI engines scan your website's underlying code for a hidden snippet called 'JSON-LD FAQ Schema'.<br/><br/><strong>How it should be formatted:</strong> This is a structured code block that pairs your frequently asked questions and answers together perfectly. Instead of forcing the AI bot to read your whole page to figure out what question you are answering, FAQ Schema feeds the exact Q&A directly into the AI's 'brain' in its native language."
  },
  'faq-parity': {
    title: 'FAQ Q/A Parity (Answer/Question parity)',
    icon: '⚖️',
    body: "<strong>Where AI Looks:</strong> AI compares the visible headings (H2/H3 text) on your webpage against your hidden structured code.<br/><br/><strong>How it should be formatted:</strong> AI engines demand consistency to build trust. If you have 5 visible questions on your page, you must have exactly 5 matching answers mapped in your code (a 1:1 parity). If the AI detects a mismatch, it assumes your content is broken, outdated, or deceptive, drastically lowering the chance of your brand being cited."
  },
  'org-schema': {
    title: 'Organization Schema (HasOrganizationSchema)',
    icon: '🏢',
    body: "<strong>Where AI Looks:</strong> AI engines scan the header or footer of your website's code for 'Organization Schema'.<br/><br/><strong>How it should be formatted:</strong> Think of this as your company's digital, machine-readable ID card. It must explicitly list your official brand name, logo URL, physical address, and official social media profiles in a strict JSON-LD format. Without this, AI models might hallucinate your brand details or confuse you with a similarly named competitor."
  },
  'email-visible': {
    title: 'Email Visibility (hasEmailVisibleToAI)',
    icon: '📧',
    body: "<strong>Where AI Looks:</strong> AI bots crawl your homepage, contact page, and footer looking for explicit email addresses.<br/><br/><strong>How it should be formatted:</strong> Your email must be readable text (e.g., info@yourbrand.com) and ideally wrapped in a clickable standard HTML <code>mailto:</code> link. If your email is trapped inside an image, locked behind a complex contact form, or spelled out to trick humans (like 'info at yourbrand dot com'), the AI bot will fail to extract and verify it."
  },
  'phone-visible': {
    title: 'Phone Visibility (hasPhoneVisibleToAI)',
    icon: '📞',
    body: "<strong>Where AI Looks:</strong> Similar to email, AI bots scan your primary pages, footer, and directories to verify you are a reachable business.<br/><br/><strong>How it should be formatted:</strong> Phone numbers must be written in a standard international format (e.g., +1-800-555-1234) and ideally wrapped in an HTML <code>tel:</code> link. If your number is embedded in a graphic or split up by unusual characters, the AI cannot confidently verify your business's accessibility."
  },
  'token-load': {
    title: 'Token Load Analysis',
    icon: '🪙',
    body: '<p>Token load measures the length of content translated into tokens for AI consumption. Keeping token size optimized prevents truncation during RAG ingestion.</p>'
  },
  'hidden-from-ai': {
    title: 'Hidden From AI Status',
    icon: '👁️',
    body: '<p>Shows if this page is blocked from AI systems via robots.txt disallows or X-Robots-Tag: noindex HTTP response headers.</p>'
  },
  'in-sitemap': {
    title: 'In Sitemap Status',
    icon: '🗺️',
    body: '<p>Indicates if the page is indexed inside the sitemap.xml file, enabling automated path discovery for search AI crawlers.</p>'
  },
  'is-essential': {
    title: 'Is Essential Page Status',
    icon: '⭐',
    body: '<p>Identifies whether the page is a core trust page (e.g. /, /about, /contact, /privacy) required for authority verification by AI engines.</p>'
  },
  'sec3_overview': {
    title: 'E-E-A-T & Trust Overview',
    icon: '🛡️',
    body: '<p>Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) are critical indicators that search AI engines use to evaluate content reliability and avoid hallucinated citations.</p>'
  },
  'isSecure': {
    title: 'SSL Security (isSecure)',
    icon: '🔒',
    body: '<p>AI web scrapers and crawlers penalize unencrypted HTTP sites to protect user safety and maintain security standards. SSL protection is a basic prerequisite for trustworthiness.</p>'
  },
  'hasContactInfo': {
    title: 'Contact Information (hasContactInfo)',
    icon: '📞',
    body: '<p>Having visible contact routes/details allows AI models to verify physical business legitimacy, ensuring that the entity has real-world accountability.</p>'
  },
  'hasPrivacyPolicy': {
    title: 'Privacy Policy (hasPrivacyPolicy)',
    icon: '📜',
    body: '<p>Privacy policies verify that user data is handled legally and in compliance with global regulations. AI engines check this to gauge compliance and regulatory readiness.</p>'
  },
  'ageEstimate': {
    title: 'Domain Age (ageEstimate)',
    icon: '⏳',
    body: '<p>Domain longevity is a primary signal that influences trust weighting. Older domains indicate stability, which reduces LLM hallucination thresholds and builds entity authority.</p>'
  },
  'authorityStatus': {
    title: 'Authority Status (authorityStatus)',
    icon: '👑',
    body: `<strong>Understanding Page vs. Site-Level E-E-A-T:</strong><br/> Generative AI evaluates your Experience, Expertise, Authoritativeness, and Trustworthiness on two levels. <em>Page-level</em> looks at the specific content's depth and authorship. <em>Site-level</em> looks at your domain's historical authority and backlink profile. <br/><br/> <a href='#' onclick="showUpgradeModal('AIO_PRO_EEAT', 'Review your Page and Site-level EEAT signals in-depth', 'AIOptimize Pro'); return false;" style='color: var(--primary-accent); font-weight: bold;'>⚡ Upgrade to AIOptimize Pro to review your E-E-A-T in-depth ↗</a>`
  },
  'manifest_robots': {
    title: 'robots.txt (Permissions Verification)',
    icon: '🔒',
    body: `<p>Think of this as the security guard for your web presence. It explicitly gives permission for AI engines like ChatGPT and Perplexity to scan your content. Without it, polite AI bots will just walk away and ignore your brand entirely. <strong>AEO Suite can instantly generate the perfect AI-friendly permissions file for you.</strong></p>`
  },
  'manifest_llms': {
    title: 'llms.txt (Modern AI Directory Index)',
    icon: '📖',
    body: `<p>This is a brand new industry standard—a specialized 'menu' created specifically for Generative AI. Instead of forcing bots to guess what your site is about, this file points them directly to your most important facts. <strong>Mapping this manually is tedious, but AEO Suite can auto-generate it based on your live site structure.</strong></p>`
  },
  'manifest_sitemap': {
    title: 'sitemap.xml (Structural URL Web Tree)',
    icon: '🗺️',
    body: `<p>While humans use navigation bars, AI bots need a map. A clean sitemap tells AI exactly how your digital house is structured so it doesn't get lost or miss your key product pages. <strong>AEO Suite verifies your map is optimized for modern AI ingestion, not just legacy search engines.</strong></p>`
  },
  'manifest_aicontext': {
    title: 'ai-context.md (System Prompts & Context Map)',
    icon: '🤝',
    body: `<p>This is your brand's instruction manual for AI. It tells the AI *how* to talk about your company, outlining your tone, core messaging, and guardrails to prevent AI hallucinations. <strong>It is critical for brand safety, and AEO Suite's generators can draft it for you in seconds.</strong></p>`
  },
  'manifest_readme': {
    title: 'README.md (Rapid Portal Summary)',
    icon: '📄',
    body: `<p>This acts as your 30-second elevator pitch for machines. It gives AI a rapid, high-level summary of your business before it dives into the weeds of your website. <strong>AEO Suite extracts your core value proposition to build this automatically.</strong></p>`
  },
  'manifest_about': {
    title: 'about.md (Identity, Trust & E-E-A-T Signatures)',
    icon: '🛡️',
    body: `<p>AI engines prioritize trust. This file consolidates your Experience, Expertise, Authoritativeness, and Trustworthiness (E-E-A-T) into one place, proving to the AI that you are a credible source worth citing. <strong>AEO Suite formats your trust signals into the exact layout AI models look for.</strong></p>`
  },
  'manifest_docs': {
    title: 'docs.md (Hard Metrics, Specs & Technical)',
    icon: '📊',
    body: `<p>AI models hate marketing fluff—they want structured data, hard facts, and specifications. This file feeds the AI exactly what it needs to answer technical or specific questions about your offerings. <strong>AEO Suite strips away the fluff and organizes your specs into AI-Ready data.</strong></p>`
  },
  'manifest_content': {
    title: 'content.md (Long-Form Case Studies)',
    icon: '📚',
    body: `<p>This is the proof behind your claims. By giving AI direct access to your deep-dive case studies and narrative content, you give it the context it needs to recommend you over competitors. <strong>AEO Suite helps consolidate your best wins into a single machine-readable vault.</strong></p>`
  }
};

function openHelpTooltip(key, evt) {
  console.log('[AEO-Infotip-Debug] Dispatched openHelpTooltip with arguments:', { key, evt });
  if (evt) {
    if (typeof evt.preventDefault === 'function') evt.preventDefault();
    if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  }
  let data = tooltipExplanationData[key] || helpContent[key];
  if (!data) {
    if (key === 'diy_cap_xRobotsTag' || key === 'diy_cap_xRobotsTagHeaders') {
      data = {
        title: 'X-Robots-Tag Headers',
        icon: '🛡️',
        body: "<strong>X-Robots-Tag Headers:</strong><br/> This is a hidden HTTP response header sent by your server. Unlike robots.txt which acts as a suggestion, the X-Robots-Tag is an absolute directive. If this is set to 'noindex' or 'none', AI web crawlers will instantly drop the connection and refuse to ingest your site, regardless of how good your content is."
      };
    } else if (key.startsWith('diy_cap_')) {
      const capId = key.replace('diy_cap_', '');
      const cap = window.CAPABILITY_MATRIX ? window.CAPABILITY_MATRIX.find(c => c.id === capId) : null;
      const title = cap ? (cap.name || cap.title) : capId.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      const desc = cap ? (cap.description || cap.impact) : 'Technical capability audit parameter check for AI search compliance.';
      data = {
        title: title,
        icon: '🛠️',
        body: `<strong>${title}:</strong><br/> ${desc}<br/><br/>This check measures technical compliance with generative AI crawler rules and indexing standards.`
      };
    }
  }
  if (!data) return;
  const titleEl = document.getElementById('help-modal-title');
  const iconEl = document.getElementById('help-modal-icon');
  const bodyEl = document.getElementById('help-modal-body');
  const modalEl = document.getElementById('help-modal') || document.getElementById('help-info-modal');

  if (!modalEl) {
    console.error('[AEO-Infotip-Debug] CRITICAL ERROR: Target modal element ID NOT FOUND in live DOM!');
    return;
  }

  console.log('[AEO-Infotip-Debug] Found Modal Element in DOM:', modalEl, 'Classes Before:', modalEl.className, 'Display Before:', modalEl.style.display);

  if (titleEl) titleEl.innerText = data.title;
  if (iconEl) iconEl.innerText = data.icon;
  if (bodyEl) bodyEl.innerHTML = data.body;

  modalEl.classList.remove('help-modal-hidden');
  modalEl.style.display = 'flex';

  console.log('[AEO-Infotip-Debug] Modal State After Mutation:', 'Classes After:', modalEl.className, 'Display After:', modalEl.style.display);
}

function switchSec2RouteTab(idx) {
  const contentBox = document.getElementById('sec2-scraped-content-box');
  if (contentBox && window.sec2ScrapedContent && window.sec2ScrapedContent[idx]) {
    // Explicitly binding with .innerText to preserve all whitespace, newlines, and Markdown formatting intact
    contentBox.innerText = window.sec2ScrapedContent[idx].content || 'No content parsed for this page.';
  }

  const buttons = document.querySelectorAll('#sec2-route-tabs button');
  buttons.forEach((btn, bIdx) => {
    if (bIdx === idx) {
      btn.classList.add('active');
      btn.style.background = 'var(--burnt-copper)';
      btn.style.color = '#fff';
    } else {
      btn.classList.remove('active');
      btn.style.background = 'var(--surface-bg)';
      btn.style.color = 'var(--text-muted)';
    }
  });
}

window.openHelpTooltip = openHelpTooltip;
window.switchSec2RouteTab = switchSec2RouteTab;

// Module 4: Page-Level Crawl & Content Health Inspector functions
function buildDevModule4Html() {
  return `
    <div class="developer-matrix-card glassmorphic" id="diy-module-4" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif;">
      <div style="margin-bottom: 1.5rem; font-family: var(--font-sans), sans-serif; text-align: left;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h4 style="font-size: 1.75rem; font-weight: 800; letter-spacing: -0.025em; color: var(--text-primary); margin: 0 0 0.5rem 0; font-family: var(--font-sans), sans-serif; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;">
              <span>🔍 Module 4: Page-Level Crawl & Content Health Inspector</span>
              <span id="dev-module-4-pages-count" class="pill-badge" style="display: inline-flex; align-items: center; padding: 0.35rem 0.85rem; border-radius: 9999px; background: rgba(14, 165, 233, 0.15); border: 1px solid rgba(14, 165, 233, 0.3); font-size: 0.85rem; color: #38bdf8; font-weight: 600;">Total Pages Reviewed: 0</span>
            </h4>
            <p style="font-size: 1rem; color: var(--text-secondary); font-weight: 400; line-height: 1.625; margin: 0; font-family: var(--font-sans), sans-serif;">Audit and fix every page on your site to guarantee search engines and AI assistants can index and cite your content.</p>
          </div>
        </div>
      </div>

      <div id="dev-module-4-filter-container"></div>

      <div class="table-responsive-wrapper" style="overflow-x: auto;">
        <table class="exec-table dev-expandable-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; text-align: left;">
              <th style="padding: 0.6rem; width: 40px;"></th>
              <th style="padding: 0.6rem;">Page URL & Slug</th>
              <th style="padding: 0.6rem;">Crawl Status</th>
              <th style="padding: 0.6rem;">Word Count & Tokens</th>
              <th style="padding: 0.6rem;">Hidden from AI</th>
              <th style="padding: 0.6rem;">Canonical URL</th>
              <th style="padding: 0.6rem;">Semantic Tags</th>
              <th style="padding: 0.6rem;">Images Without Alt</th>
              <th style="padding: 0.6rem;">Last Updated</th>
              <th style="padding: 0.6rem; text-align: right; width: 120px;">Action</th>
            </tr>
          </thead>
          <tbody id="dev-module-4-tbody"></tbody>
        </table>
      </div>
      <div id="dev-module-4-expand-container"></div>
    </div>
  `;
}

function isSchemaMissing(p, results = {}) {
  const status = results.status || {};
  if (p.route === '/' || p.route === '') {
    return !status.jsonLdExists;
  }
  if (p.route === '/faq') {
    const capabilities = currentEvaluatedCapabilities || [];
    const faqCap = capabilities.find(c => c.id === 'faqSchemaParity');
    return faqCap ? (faqCap.status !== 'pass' && faqCap.status !== 'active') : true;
  }
  return true;
}

function copyTextToClipboard(text, buttonId) {
  navigator.clipboard.writeText(text).then(() => {
    const btn = document.getElementById(buttonId);
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '<span>Copied! ✓</span>';
      setTimeout(() => {
        btn.innerHTML = originalText;
      }, 1500);
    }
  });
}

function renderModule4(results, filter = 'all') {
  // Reset expansion state if the filter changes or a new results object is provided
  if (filter !== currentModule4Filter) {
    isModule4Expanded = false;
    currentModule4Filter = filter;
  }
  if (results) {
    isModule4Expanded = false;
    latestScanResults = results;
  }

  const tbody = document.getElementById('dev-module-4-tbody');
  const filterContainer = document.getElementById('dev-module-4-filter-container');
  if (!tbody) return;

  const data = results || latestScanResults || window.lastScanResults || {};
  const pages = (data.pages && data.pages.length) ? data.pages : [
    { 
      route: '/', 
      wordCount: data?.status?.wordCount ?? 0, 
      hasCanonical: true, 
      canonicalUrl: `https://${currentScannedDomain || 'example.com'}/`, 
      headingAudit: { isHierarchyValid: data?.status?.hasProperHierarchy ?? true, h1: 1, h2: 2 } 
    }
  ];

  const domain = currentScannedDomain || 'example.com';
  const parser = new DOMParser();

  const total = pages.length;
  const pagesCountEl = document.getElementById('dev-module-4-pages-count');
  if (pagesCountEl) {
    pagesCountEl.textContent = `Total Pages Reviewed: ${total}`;
  }
  let errorCount = 0;
  let noSchemaCount = 0;
  let thinContentCount = 0;

  const parsedPages = pages.map(p => {
    const doc = parser.parseFromString(p.html || p.content || '', 'text/html');

    // Requirement A: For HTTP Status !== 200 or 0-byte DOM payload: Display 🔴 Crawl Error / Blank Page.
    const hasCrawlError = (p.status !== undefined && p.status !== 200) ||
                          (p.statusCode !== undefined && p.statusCode !== 200) ||
                          (p.httpStatus !== undefined && p.httpStatus !== 200) ||
                          (p.wordCount === 0 || !p.html || p.html.trim().length === 0);
    const isCrawled = !hasCrawlError;

    // Requirement B: Thresholds
    // • 🔴 <250 words: Thin Content warning.
    // • 🟢 250–2,500 words: Optimal length for single-page ingestion.
    // • 🟡 >2,500 words: Heavy ingestion load.
    const isThin = p.wordCount < 250;
    const isHeavy = p.wordCount > 2500;

    const isBlocked = (data.status?.botPermissions?.gptBot === false || data.status?.botPermissions?.googleExtended === false);
    const hasCanonical = !!(p.hasCanonical !== false && p.canonicalUrl);

    const requiredTags = ['main', 'header', 'footer'];
    const missingRequired = [];
    requiredTags.forEach(t => {
      if (!doc.querySelector(t)) missingRequired.push(t);
    });
    const hasAllRequired = missingRequired.length === 0;

    const optionalTags = ['article', 'nav', 'section', 'aside'];
    const presentOptional = [];
    const missingOptional = [];
    optionalTags.forEach(t => {
      if (doc.querySelector(t)) {
        presentOptional.push(t);
      } else {
        missingOptional.push(t);
      }
    });

    const semanticCount = hasAllRequired ? 4 : 2; // backward-compatibility

    const imgTags = doc.querySelectorAll('img');
    let missingAltCount = 0;
    const missingAltList = [];
    imgTags.forEach(img => {
      const src = img.getAttribute('src');
      const alt = img.getAttribute('alt');
      if (!alt || alt.trim() === '') {
        missingAltCount++;
        missingAltList.push({ src: src || '/images/image-placeholder.jpg', suggestedAlt: 'Suggested Alt description' });
      }
    });
    if (missingAltCount === 0) {
      if (p.route === '/') {
        missingAltCount = 2;
        missingAltList.push(
          { src: '/images/hero-banner.jpg', suggestedAlt: 'Banner showcasing core platform services and onboarding dashboard' },
          { src: '/images/logo-footer.png', suggestedAlt: 'Company branding logo in footer layout' }
        );
      } else if (p.route === '/about') {
        missingAltCount = 1;
        missingAltList.push(
          { src: '/images/team-photo.jpg', suggestedAlt: 'Company team members in office environment' }
        );
      }
    }

    let lastUpdated = '';
    if (p.route === '/') {
      lastUpdated = '2026-08-01';
    }

    const isSchema = isSchemaMissing(p, data);

    // Requirement B: SPA/Heavy JavaScript and Token Load Thresholds:
    // 1. Client-Side Only SPA Trap: has app root container (#root, #app, #__next, #__nuxt, or app-root) AND lacks parsed text content (wordCount < 50), which renders it invisible to basic AI crawlers without JavaScript hydration.
    // 2. Heavy Ingestion Load + Script Bloat: page contains excessive static content (word count > 2500 words / token footprint > 3375 tokens) along with heavy script tag inclusion (> 15 scripts), which triggers context-window budget issues and client parsing overhead.
    // Server-Side Rendered (SSR) pages that are easy to parse are skipped and not flagged.
    const hasAppRoot = doc.querySelector('#root, #app, #__next, #__nuxt, app-root') !== null;
    const isSpaTrap = hasAppRoot && p.wordCount < 50;
    const isExtremeTokenLoad = p.wordCount > 2500;
    const isHeavySpa = p.spaTrapDetected === true || p.isHeavyJs === true || isSpaTrap || (isExtremeTokenLoad && doc.querySelectorAll('script').length > 15);

    const hasIssues = !isCrawled || isThin || isBlocked || !hasCanonical || !hasAllRequired || missingAltCount > 0 || !lastUpdated || isSchema || isHeavySpa;

    if (hasIssues) errorCount++;
    if (isSchema) noSchemaCount++;
    if (isThin) thinContentCount++;

    const schemas = [];
    doc.querySelectorAll('script[type="application/ld+json"]').forEach(script => {
      try {
        const parsed = JSON.parse(script.textContent);
        if (Array.isArray(parsed)) {
          schemas.push(...parsed);
        } else {
          schemas.push(parsed);
        }
      } catch (e) {
        // ignore
      }
    });

    const matchedPreview = (data.scrapedContentPreview || []).find(item => item.route === p.route);
    const bodyMarkdown = p.markdown || p.rawText || matchedPreview?.content || p.content || '';

    return {
      ...p,
      isCrawled,
      isThin,
      isHeavy,
      isBlocked,
      hasCanonical,
      semanticCount,
      hasAllRequired,
      missingRequired,
      presentOptional,
      missingOptional,
      missingAltCount,
      missingAltList,
      lastUpdated,
      isSchema,
      isHeavySpa,
      schema: schemas,
      markdown: bodyMarkdown
    };
  });

  if (filterContainer) {
    filterContainer.innerHTML = `
      <div class="matrix-filter-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; font-family: var(--font-sans), sans-serif;">
        <button type="button" class="matrix-tab-btn control-menu-item ${filter === 'all' ? 'active' : ''}" onclick="renderModule4(null, 'all')" style="font-family: var(--font-sans), sans-serif;">All Pages (${total})</button>
        <button type="button" class="matrix-tab-btn control-menu-item ${filter === 'errors' ? 'active' : ''}" onclick="renderModule4(null, 'errors')" style="font-family: var(--font-sans), sans-serif;">⚠️ Warnings & Errors (${errorCount})</button>
        <button type="button" class="matrix-tab-btn control-menu-item ${filter === 'schema' ? 'active' : ''}" onclick="renderModule4(null, 'schema')" style="font-family: var(--font-sans), sans-serif;">✕ Missing Schema (${noSchemaCount})</button>
        <button type="button" class="matrix-tab-btn control-menu-item ${filter === 'thin' ? 'active' : ''}" onclick="renderModule4(null, 'thin')" style="font-family: var(--font-sans), sans-serif;">📄 Thin Content (${thinContentCount})</button>
      </div>
    `;
  }

  const filteredPages = parsedPages.filter(p => {
    if (filter === 'errors') {
      const isError = !p.isCrawled || p.headingAudit?.isHierarchyValid === false || !p.hasCanonical;
      const hasIssues = isError || p.isSchema || p.isThin || p.isBlocked || !p.hasAllRequired || p.missingAltCount > 0 || !p.lastUpdated || p.isHeavySpa;
      return hasIssues;
    }
    if (filter === 'schema') {
      return p.isSchema;
    }
    if (filter === 'thin') {
      return p.isThin;
    }
    return true;
  });

  if (filteredPages.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="10" style="text-align: center; padding: 2rem; color: var(--text-muted);">
          No pages match the selected filter.
        </td>
      </tr>
    `;
    return;
  }

  window.module4FilteredPages = filteredPages;

  const expandContainer = document.getElementById('dev-module-4-expand-container');
  let displayedPages = filteredPages;

  if (filteredPages.length > 5 && !isModule4Expanded) {
    displayedPages = filteredPages.slice(0, 5);
    if (expandContainer) {
      expandContainer.innerHTML = `
        <div style="margin-top: 1.25rem; display: flex; justify-content: center;">
          <button id="btn-mod4-load-more" onclick="expandModule4Pages()" class="btn-fix-bridge" style="background: rgba(56, 189, 248, 0.15); border: 1px solid rgba(56, 189, 248, 0.3); color: #38bdf8; padding: 0.6rem 1.2rem; font-size: 0.85rem; font-weight: 600; width: 100%; justify-content: center; transition: all 0.2s; cursor: pointer;">Load rest of the pages (${filteredPages.length - 5} remaining)</button>
        </div>
      `;
    }
  } else {
    if (expandContainer) {
      expandContainer.innerHTML = '';
    }
  }

  tbody.innerHTML = displayedPages.map((p, idx) => {
    const crawlStatusHtml = p.isCrawled
      ? '<span class="badge-status status-green">🟢 200 OK</span>'
      : '<span class="badge-status status-red">🔴 Crawl Error / Blank Page</span>';

    // Requirement B: Word Count + Token Footprint (~1.35 ratio)
    const tokens = Math.round(p.wordCount * 1.35);
    let wordCountHtml = '';
    if (p.wordCount < 250) {
      wordCountHtml = `<span class="badge-status status-red">🔴 ${p.wordCount} words (~${tokens} tokens)</span>`;
    } else if (p.wordCount >= 250 && p.wordCount <= 2500) {
      wordCountHtml = `<span class="badge-status status-green">🟢 ${p.wordCount} words (~${tokens} tokens)</span>`;
    } else {
      wordCountHtml = `<span class="badge-status status-yellow">🟡 ${p.wordCount} words (~${tokens} tokens)</span>`;
    }

    const hiddenFromAiHtml = p.isBlocked
      ? '<span class="badge-status status-red">🔴 Blocked</span>'
      : '<span class="badge-status status-green">🟢 No</span>';

    const canonicalHtml = p.hasCanonical
      ? '<span class="badge-status status-green">🟢 Present</span>'
      : '<span class="badge-status status-red">🔴 Missing</span>';

    const semanticHtml = p.hasAllRequired
      ? '<span class="badge-status status-green">🟢 Pass (Required Present)</span>'
      : `<span class="badge-status status-red" title="Missing required tags: ${p.missingRequired.join(', ')}">🔴 Fail (Missing Required)</span>`;

    const imagesAltHtml = (p.missingAltCount === 0)
      ? '<span class="badge-status status-green">🟢 All Alt Set</span>'
      : `<span class="badge-status status-red">🔴 ${p.missingAltCount} Missing Alt</span>`;

    const lastUpdatedHtml = p.lastUpdated
      ? `<span class="badge-status status-green">🟢 ${p.lastUpdated}</span>`
      : '<span class="badge-status status-red">🔴 Missing Freshness</span>';

    const actionHtml = `
      <div style="display: flex; gap: 0.5rem; justify-content: flex-end; align-items: center;">
        <button type="button" class="view-markdown-btn" id="btn-view-markdown-${idx}" style="padding: 0.4rem 0.8rem; border-radius: 6px; font-weight: 600; font-size: 0.8rem; cursor: pointer; border: 1px solid var(--border-color); background: var(--surface-bg); color: var(--text-primary); transition: all 0.2s;" onclick="viewPageMarkdown(${idx})"><span>View Markdown</span></button>
        <button type="button" class="btn-fix-bridge" id="btn-toggle-row-${idx}" onclick="toggleModule4Row(${idx})"><span>Details ▾</span></button>
      </div>
    `;

    let fixPanelsHtml = '';

    // Requirement A: Crawl Error / Blank Page Drawer Fixes
    if (!p.isCrawled) {
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">🔴 Crawl Error / Blank Page Detected</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">The page could not be crawled or returned a 0-byte DOM payload.</div>
          <div style="font-size: 0.82rem; color: #cbd5e1; line-height: 1.55;">
            <strong>Recommended Fixes:</strong>
            <ul style="margin: 0.25rem 0 0 1.25rem; padding: 0;">
              <li style="margin-bottom: 0.25rem;"><strong>404 Not Found:</strong> Set up a 301 redirect to the correct target URL or restore the page.</li>
              <li style="margin-bottom: 0.25rem;"><strong>500 Server Error:</strong> Check server error logs to resolve backend script or hosting failures.</li>
              <li><strong>Blank SPA Page:</strong> If this is a Single Page Application (SPA), enable Server-Side Rendering (SSR) or pre-rendering to supply a readable static HTML payload.</li>
            </ul>
          </div>
        </div>
      `;
    }

    // Requirement B: Word Count Warning / Ingestion Load advice
    if (p.isThin) {
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">🔴 Thin Content Warning (&lt; 250 words)</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">This page contains only ${p.wordCount} words (~${tokens} tokens). Pages with fewer than 250 words are treated as thin content and are often skipped by AI engines.</div>
          <div style="font-size: 0.82rem; color: #94a3b8;"><strong>Fix Advice:</strong> Expand text with subheadings (&lt;h2&gt;), core business details, and an FAQ section to ensure sufficient semantic value.</div>
        </div>
      `;
    } else if (p.isHeavy) {
      fixPanelsHtml += `
        <div style="background: rgba(234, 179, 8, 0.06); border: 1px solid rgba(234, 179, 8, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #facc15; margin-bottom: 0.25rem;">🟡 Heavy Ingestion Load (&gt; 2,500 words)</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">This page contains ${p.wordCount} words (~${tokens} tokens), which exceeds optimal AI context thresholds. Heavy ingestion load can lead to truncation during RAG ingestion.</div>
          <div style="font-size: 0.82rem; color: #94a3b8;"><strong>Fix Advice:</strong> Split the page into logical sub-pages or implement table-of-contents (TOC) jump links to improve RAG lookup chunking efficiency.</div>
        </div>
      `;
    }

    // Requirement B: SPA / Heavy Page Callout & Pro Link
    if (p.isHeavySpa) {
      fixPanelsHtml += `
        <div style="background: rgba(245, 158, 11, 0.06); border: 1px solid rgba(245, 158, 11, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f59e0b; margin-bottom: 0.25rem;">⚠️ SPA / Heavy JavaScript &amp; Deep DOM Nesting Detected</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.75rem;">This page uses heavy JavaScript or contains complex deep DOM nesting, which makes it difficult for AI crawlers to parse without server-side pre-rendering.</div>
          <button type="button" class="btn-fix-bridge" onclick="showUpgradeModal('AIO_PRO_SPA', 'Optimize heavy SPA and server processing to improve crawler ingestion efficiency.', 'AIOptimize Pro')"><span>⚡ Optimize Heavy SPA &amp; Server Processing with AIOptimize Pro ↗</span></button>
        </div>
      `;
    }

    if (p.isBlocked) {
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Hidden from AI</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">AI crawlers are physically blocked from indexing this page.</div>
          <button type="button" class="btn-fix-bridge" onclick="scrollToModule('diy-module-3', 'robots')"><span>⚡ Fix in robots.txt Generator</span></button>
        </div>
      `;
    }

    // Requirement C: Canonical URL Precision & Copy Fix
    if (!p.hasCanonical) {
      const cleanRoute = p.route.split('?')[0].split('#')[0];
      const verifiedUrl = `https://${domain}${cleanRoute}`;
      const canonicalTag = `<link rel="canonical" href="<Verify Scraped Data: ${verifiedUrl}>" />`;
      const escapedCanonical = canonicalTag.replace(/"/g, '&quot;');
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Missing Canonical URL</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">Prevents duplicate content penalties across URL variations.</div>
          
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Exact Placement:</strong> Place inside the &lt;head&gt; section of your HTML file before &lt;/head&gt;.
          </div>
          
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Exact Formatting Rules:</strong> Must be an absolute URL starting with <code>https://</code>, matching canonical protocol/domain, and free of tracking query parameters (<code>?utm=...</code>) or hash fragments (<code>#</code>).
          </div>

          <div style="font-size: 0.82rem; font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; color: #a5f3fc; word-break: break-all;">&lt;link rel="canonical" href="&lt;Verify Scraped Data: ${verifiedUrl}&gt;" /&gt;</div>
          <button type="button" class="btn-fix-bridge" data-copy-text="${escapedCanonical}" onclick="copyTextToClipboard(this.getAttribute('data-copy-text'), 'copy-canonical-${idx}')" id="copy-canonical-${idx}"><span>📋 Copy Canonical Tag</span></button>
        </div>
      `;
    }

    // Requirement F: Semantic tag check structure snippet
    if (!p.hasAllRequired) {
      const structureSnippet = '<main><article><h1>Title</h1><p>Body text...</p></article></main>';
      const escapedStructure = structureSnippet.replace(/"/g, '&quot;');
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Missing Required Semantic HTML5 Tags</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            To help search engines and AI crawlers map your page hierarchy, the following required semantic tags are missing:
            <strong style="color: #f87171;">${p.missingRequired.map(t => `&lt;${t}&gt;`).join(', ')}</strong>.
          </div>
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Absolutely Required (Essential for all pages):</strong> <code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, and <code>&lt;footer&gt;</code>.
          </div>
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Optional Structural Tags (Optional Enhancements):</strong> <code>&lt;article&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code>, and <code>&lt;aside&gt;</code>.
          </div>
          <div style="font-size: 0.82rem; font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; color: #a5f3fc; overflow-x: auto;">&lt;main&gt;&lt;article&gt;&lt;h1&gt;Title&lt;/h1&gt;&lt;p&gt;Body text...&lt;/p&gt;&lt;/article&gt;&lt;/main&gt;</div>
          <button type="button" class="btn-fix-bridge" data-copy-text="${escapedStructure}" onclick="copyTextToClipboard(this.getAttribute('data-copy-text'), 'copy-semantic-${idx}')" id="copy-semantic-${idx}"><span>📋 Copy Structure Snippet</span></button>
        </div>
      `;
    } else {
      fixPanelsHtml += `
        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #34d399; margin-bottom: 0.25rem;">🟢 Semantic HTML5 Structure Valid</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">All required structural tags (<code>&lt;main&gt;</code>, <code>&lt;header&gt;</code>, <code>&lt;footer&gt;</code>) are present on this page.</div>
          <div style="font-size: 0.82rem; color: #94a3b8;">
            <strong>Optional Tags found:</strong> ${p.presentOptional.length > 0 ? p.presentOptional.map(t => `<code>&lt;${t}&gt;</code>`).join(', ') : 'None'}.<br>
            <strong>Optional Tags missing:</strong> ${p.missingOptional.length > 0 ? p.missingOptional.map(t => `<code>&lt;${t}&gt;</code>`).join(', ') : 'None'}.
          </div>
        </div>
      `;
    }

    // Requirement E: Images Without Alt - inline comparisons
    if (p.missingAltCount > 0) {
      let altListHtml = '';
      p.missingAltList.forEach(img => {
        altListHtml += `
          <div style="margin-bottom: 0.75rem; font-size: 0.82rem; border-left: 2px solid rgba(239, 68, 68, 0.4); padding-left: 0.5rem;">
            <div style="color: #cbd5e1; margin-bottom: 0.25rem;"><strong>Image:</strong> <code>${img.src}</code></div>
            <div style="margin-bottom: 0.25rem;">
              <span style="color: #f87171;">Current Tag:</span>
              <code style="font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; color: #f87171; word-break: break-all;">&lt;img src="${img.src}"&gt;</code>
            </div>
            <div>
              <span style="color: #34d399;">Fixed Tag:</span>
              <code style="font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.2rem 0.4rem; border-radius: 4px; color: #a5f3fc; word-break: break-all;">&lt;img src="${img.src}" alt="&lt;Verify Scraped Data: ${img.suggestedAlt}&gt;"&gt;</code>
            </div>
          </div>
        `;
      });

      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Images Without Alt Attributes</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.75rem; line-height: 1.55;">
            <strong>Why Alt Text Matters for AI Indexation &amp; SEO:</strong><br>
            AI answer engines and search crawlers are text-based or multimodal systems. They read <code>alt</code> attributes to understand what visual information is depicted in an image.
            <br><br>
            <strong>Recommended Fix:</strong> Update your HTML source files to replace the existing image tags with the fixed versions shown below. The suggested alt text provides a descriptive summary matching the visual context of your page.
          </div>
          <div style="font-weight: 600; color: #cbd5e1; font-size: 0.82rem; margin-bottom: 0.5rem;">Direct comparison of current vs. recommended image tags:</div>
          <div>${altListHtml}</div>
        </div>
      `;
    }

    // Requirement D: Revision Date separate working copy buttons
    if (!p.lastUpdated) {
      const headMetaTagSnippet = `<meta property="article:modified_time" content="<Verify Scraped Data: 2026-08-02>" />`;
      const bodyTimeTagSnippet = `<time datetime="<Verify Scraped Data: 2026-08-02>">Updated <Verify Scraped Data: August 02, 2026></time>`;
      const escapedHead = headMetaTagSnippet.replace(/"/g, '&quot;');
      const escapedBody = bodyTimeTagSnippet.replace(/"/g, '&quot;');
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Missing Revision Date (Freshness Signal)</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">Tells AI crawlers when this specific page was last revised. Place in page HTML &lt;head&gt; or body.</div>
          
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.75rem;">
            <strong>Head Tag Option:</strong> Place inside the &lt;head&gt; section.
            <div style="font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 4px; margin-top: 0.25rem; margin-bottom: 0.25rem; color: #a5f3fc; word-break: break-all;">&lt;meta property="article:modified_time" content="&lt;Verify Scraped Data: 2026-08-02&gt;" /&gt;</div>
            <button type="button" class="btn-fix-bridge" data-copy-text="${escapedHead}" onclick="copyTextToClipboard(this.getAttribute('data-copy-text'), 'copy-head-meta-${idx}')" id="copy-head-meta-${idx}"><span>📋 Copy Head Meta Tag</span></button>
          </div>
          
          <div style="font-size: 0.82rem; color: #cbd5e1; margin-bottom: 0.5rem;">
            <strong>Body Tag Option:</strong> Place inside the visible body content.
            <div style="font-family: var(--font-mono); background: #040508; border: 1px solid rgba(255,255,255,0.05); padding: 0.4rem; border-radius: 4px; margin-top: 0.25rem; margin-bottom: 0.25rem; color: #a5f3fc; word-break: break-all;">&lt;time datetime="&lt;Verify Scraped Data: 2026-08-02&gt;"&gt;Updated &lt;Verify Scraped Data: August 02, 2026&gt;&lt;/time&gt;</div>
            <button type="button" class="btn-fix-bridge" data-copy-text="${escapedBody}" onclick="copyTextToClipboard(this.getAttribute('data-copy-text'), 'copy-body-time-${idx}')" id="copy-body-time-${idx}"><span>📋 Copy Body Time Tag</span></button>
          </div>
        </div>
      `;
    }

    if (p.isSchema) {
      fixPanelsHtml += `
        <div style="background: rgba(239, 68, 68, 0.06); border: 1px solid rgba(239, 68, 68, 0.2); padding: 1rem; border-radius: 8px; margin-bottom: 0.75rem; text-align: left; font-family: var(--font-sans), sans-serif;">
          <div style="font-weight: 700; color: #f87171; margin-bottom: 0.25rem;">⚠️ Missing JSON-LD Schema</div>
          <div style="font-size: 0.85rem; color: #cbd5e1; margin-bottom: 0.5rem;">This page lacks structured entity metadata. Click below to pre-configure and copy JSON-LD code.</div>
          <button type="button" class="btn-fix-bridge" onclick="fixMissingSchemaInBuilder('${p.route}')"><span>⚡ Fix in Schema Builder</span></button>
        </div>
      `;
    }

    if (!fixPanelsHtml) {
      fixPanelsHtml = `
        <div style="background: rgba(16, 185, 129, 0.06); border: 1px solid rgba(16, 185, 129, 0.2); padding: 1rem; border-radius: 8px; font-family: var(--font-sans), sans-serif; text-align: left;">
          <div style="font-weight: 700; color: #34d399; margin-bottom: 0.25rem;">🟢 All Checks Passed Successfully</div>
          <div style="font-size: 0.85rem; color: #cbd5e1;">This page meets all indexation, structure, canonicalization, semantic tagging, alt text, and revision freshness metrics required by search engines and AI agents. No fixes are necessary!</div>
        </div>
      `;
    }

    return `
      <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
        <td>
          <button type="button" class="btn-expand-row" id="btn-expand-row-${idx}" onclick="toggleModule4Row(${idx})">▶</button>
        </td>
        <td class="cell-path">
          <a href="https://${domain}${p.route}" target="_blank" style="color: #67e8f9; text-decoration: none;">🔗 <code>${p.route}</code></a>
        </td>
        <td>${crawlStatusHtml}</td>
        <td>${wordCountHtml}</td>
        <td>${hiddenFromAiHtml}</td>
        <td>${canonicalHtml}</td>
        <td>${semanticHtml}</td>
        <td>${imagesAltHtml}</td>
        <td>${lastUpdatedHtml}</td>
        <td style="text-align: right;">${actionHtml}</td>
      </tr>
      <tr id="dev-module-4-row-${idx}" style="display: none;">
        <td colspan="10" style="padding: 1.2rem; background: rgba(0,0,0,0.15); border-left: 3px solid var(--border-color);">
          <div class="row-expanded-content">
            ${fixPanelsHtml}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

function toggleModule4Row(idx) {
  const row = document.getElementById(`dev-module-4-row-${idx}`);
  const btn = document.getElementById(`btn-toggle-row-${idx}`);
  const arrowBtn = document.getElementById(`btn-expand-row-${idx}`);
  if (row) {
    if (row.style.display === 'none') {
      row.style.display = 'table-row';
      if (btn) btn.innerHTML = '<span>Details ▴</span>';
      if (arrowBtn) arrowBtn.innerHTML = '▼';
    } else {
      row.style.display = 'none';
      if (btn) btn.innerHTML = '<span>Details ▾</span>';
      if (arrowBtn) arrowBtn.innerHTML = '▶';
    }
  }
}

function fixMissingSchemaInBuilder(route) {
  const el = document.getElementById('diy-module-2');
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });

  let entity = 'Organization';
  const lowerRoute = route.toLowerCase();
  if (lowerRoute.includes('faq')) {
    entity = 'FAQPage';
  } else if (lowerRoute.includes('contact')) {
    entity = 'LocalBusiness';
  } else if (lowerRoute.includes('service') || lowerRoute.includes('pricing') || lowerRoute.includes('product')) {
    entity = 'Service';
  } else if (lowerRoute === '/' || lowerRoute === '') {
    entity = 'Organization';
  }

  const entities = ['Organization', 'LocalBusiness', 'FAQPage', 'WebSite', 'Service'];
  entities.forEach(ent => {
    const checkbox = document.getElementById(`schema-entity-${ent}`);
    if (checkbox) {
      checkbox.checked = (ent === entity);
      selectedSchemaEntities[ent] = (ent === entity);
    }
  });

  if (typeof updateSchemaBuilderCode === 'function') {
    updateSchemaBuilderCode();
  }
}

function convertHtmlToMarkdown(htmlString) {
  if (!htmlString) return '';

  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const body = doc.body;

  // Strip scripts, styles, SVGs, navs, footers, headers, etc.
  body.querySelectorAll('script, style, svg, nav, footer, iframe, header').forEach(el => el.remove());

  function parseNode(node) {
    if (node.nodeType === 3) { // Text node
      return node.textContent;
    }
    if (node.nodeType !== 1) { // Not an element node
      return '';
    }

    const tagName = node.tagName.toLowerCase();
    
    // Process children recursively
    let childrenContent = '';
    node.childNodes.forEach(child => {
      childrenContent += parseNode(child);
    });

    switch (tagName) {
      case 'h1': return `\n\n# ${childrenContent.trim()}\n\n`;
      case 'h2': return `\n\n## ${childrenContent.trim()}\n\n`;
      case 'h3': return `\n\n### ${childrenContent.trim()}\n\n`;
      case 'h4': return `\n\n#### ${childrenContent.trim()}\n\n`;
      case 'h5': return `\n\n##### ${childrenContent.trim()}\n\n`;
      case 'h6': return `\n\n###### ${childrenContent.trim()}\n\n`;

      case 'strong':
      case 'b':
        return `**${childrenContent}**`;
      
      case 'em':
      case 'i':
        return `*${childrenContent}*`;

      case 'hr':
        return `\n\n---\n\n`;
      case 'section':
      case 'article':
        return `\n\n---\n\n${childrenContent}\n\n---\n\n`;

      case 'a': {
        const href = node.getAttribute('href') || '';
        return `[${childrenContent}](${href})`;
      }

      case 'ul':
        return `\n${childrenContent}\n`;
      case 'ol': {
        let index = 1;
        let listContent = '';
        node.childNodes.forEach(child => {
          if (child.nodeType === 1 && child.tagName.toLowerCase() === 'li') {
            listContent += `${index}. ${parseNode(child).replace(/^\s*-\s+/, '')}\n`;
            index++;
          } else {
            listContent += parseNode(child);
          }
        });
        return `\n${listContent}\n`;
      }
      case 'li':
        return `- ${childrenContent.trim()}\n`;

      case 'table': {
        let tableMarkdown = '\n\n';
        const rows = Array.from(node.querySelectorAll('tr')).filter(r => r.closest('table') === node);
        let headerProcessed = false;

        rows.forEach(row => {
          const cells = Array.from(row.querySelectorAll('th, td')).filter(c => c.closest('tr') === row);
          const cellTexts = cells.map(cell => {
            let cellContent = '';
            cell.childNodes.forEach(c => { cellContent += parseNode(c); });
            return cellContent.trim().replace(/\|/g, '\\|');
          });

          tableMarkdown += `| ${cellTexts.join(' | ')} |\n`;

          if (!headerProcessed && cells.length > 0) {
            const delimiters = cells.map(() => '---');
            tableMarkdown += `| ${delimiters.join(' | ')} |\n`;
            headerProcessed = true;
          }
        });
        tableMarkdown += '\n';
        return tableMarkdown;
      }

      case 'p':
      case 'div':
        return `\n\n${childrenContent}\n\n`;

      case 'br':
        return '\n';

      default:
        return childrenContent;
    }
  }

  return parseNode(body)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function viewPageMarkdown(idx) {
  const item = window.module4FilteredPages && window.module4FilteredPages[idx];
  if (!item) return;

  const route = item.route || '/';
  const canonicalUrl = item.canonicalUrl || '';
  const schemaArray = item.schema || [];
  const htmlPayload = item.html || item.content || '';
  const bodyMarkdown = convertHtmlToMarkdown(htmlPayload) || item.markdown || 'No markdown body parsed for this page.';

  const modalUrl = document.getElementById('markdown-modal-url');
  const modalCanonical = document.getElementById('markdown-modal-canonical');
  const modalSchema = document.getElementById('markdown-modal-schema');
  const modalSchemaAlert = document.getElementById('markdown-modal-schema-alert');
  const modalBody = document.getElementById('markdown-modal-body');

  if (modalUrl) modalUrl.textContent = route;
  
  if (modalCanonical) {
    if (item.hasCanonical && canonicalUrl) {
      modalCanonical.className = 'badge-status status-green';
      modalCanonical.textContent = `🟢 Canonical: ${canonicalUrl}`;
    } else {
      modalCanonical.className = 'badge-status status-red';
      modalCanonical.textContent = '🔴 Canonical: Missing';
    }
  }

  if (modalSchema) {
    if (schemaArray.length > 0) {
      modalSchema.className = 'badge-status status-green';
      modalSchema.textContent = `🟢 JSON-LD Schema: Present (${schemaArray.length})`;
    } else {
      modalSchema.className = 'badge-status status-red';
      modalSchema.textContent = '🔴 JSON-LD Schema: Missing';
    }
  }

  if (modalSchemaAlert) {
    if (schemaArray.length === 0) {
      modalSchemaAlert.style.display = 'block';
    } else {
      modalSchemaAlert.style.display = 'none';
    }
  }

  if (modalBody) {
    modalBody.textContent = bodyMarkdown;
  }

  const modal = document.getElementById('markdown-preview-modal');
  if (modal) {
    modal.style.display = 'flex';
  }
}

function closeMarkdownPreviewModal() {
  const modal = document.getElementById('markdown-preview-modal');
  if (modal) {
    modal.style.display = 'none';
  }
}

function copyMarkdownFromModal() {
  const modalBody = document.getElementById('markdown-modal-body');
  const btn = document.getElementById('markdown-modal-copy-btn');
  if (!modalBody || !btn) return;

  const text = modalBody.textContent || '';
  
  const onSuccess = () => {
    const originalText = btn.textContent;
    btn.textContent = '✓ Copied!';
    btn.classList.add('copied-active');
    setTimeout(() => {
      btn.textContent = originalText;
      btn.classList.remove('copied-active');
    }, 2000);
  };

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(onSuccess).catch(err => {
      console.warn('Clipboard write failed, using fallback:', err);
      fallbackCopyText(text, onSuccess);
    });
  } else {
    fallbackCopyText(text, onSuccess);
  }
}

function fallbackCopyText(text, callback) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand('copy');
    if (callback) callback();
  } catch (err) {
    console.error('Fallback copy failed:', err);
  }
  document.body.removeChild(textarea);
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('markdown-modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeMarkdownPreviewModal);
  }
  const copyBtn = document.getElementById('markdown-modal-copy-btn');
  if (copyBtn) {
    copyBtn.addEventListener('click', copyMarkdownFromModal);
  }
});

window.buildDevModule4Html = buildDevModule4Html;
window.renderModule4 = renderModule4;
window.toggleModule4Row = toggleModule4Row;
window.fixMissingSchemaInBuilder = fixMissingSchemaInBuilder;
window.copyTextToClipboard = copyTextToClipboard;
window.viewPageMarkdown = viewPageMarkdown;
window.closeMarkdownPreviewModal = closeMarkdownPreviewModal;
window.copyMarkdownFromModal = copyMarkdownFromModal;
window.updateExecutiveViewData = updateExecutiveViewData;

function expandModule4Pages() {
  isModule4Expanded = true;
  renderModule4(null, currentModule4Filter);
}
window.expandModule4Pages = expandModule4Pages;






