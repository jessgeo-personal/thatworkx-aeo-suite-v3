/**
 * VisualizeDashboard.jsx
 * 
 * AIVisualize Dashboard Component featuring:
 * - Dual View Switcher (Executive Mode vs Developer / DIY Mode)
 * - Design System Theme Tokens
 * - Milestone 3: Executive Mode UI & Side-by-Side Visual Perception Simulator
 * - Milestone 4: Developer / DIY Mode UI, 32-Capability Granular Matrix, Code Drawers & Edge WAF Tab
 */

export const VISUALIZE_THEME_TOKENS = {
  dark: {
    canvas: '#0D0E11',
    surface: '#16181D',
    inputCode: '#1F222A',
    border: 'rgba(255, 255, 255, 0.08)',
    textMain: '#F8FAFC',
    textMuted: '#94A3B8',
    primaryAccent: '#E11D48',
    secondaryAccent: '#F59E0B',
  },
  light: {
    canvas: '#F8FAFC',
    surface: '#FFFFFF',
    inputCode: '#F1F5F9',
    border: '#E2E8F0',
    textMain: '#0F172A',
    textMuted: '#64748B',
    primaryAccent: '#9F1239',
    secondaryAccent: '#B45309',
  }
};

export const VIEW_MODES = {
  EXECUTIVE: 'executive',
  DEVELOPER: 'developer'
};

/**
 * Render Granular 32-Capability Developer Matrix Table
 */
export function renderDeveloperMetricMatrix(capabilities = []) {
  return `
    <div class="developer-matrix-card dev-only-component" id="dev-matrix-section">
      <div class="table-card-header">
        <div>
          <h4 style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🛠️ 32-Capability Granular Diagnostic Matrix</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Full Technical Audit</span>
          </h4>
          <p>Complete technical breakdown of all 32 AEO access, hygiene, parsing, and machine handshake parameters.</p>
        </div>
        <span class="table-count-badge">32 Checks Evaluated</span>
      </div>

      <div class="matrix-filter-tabs">
        <button type="button" class="matrix-tab-btn active" onclick="filterMatrixSection('all')">All (32)</button>
        <button type="button" class="matrix-tab-btn" onclick="filterMatrixSection(1)">Section 1: Gateway (3)</button>
        <button type="button" class="matrix-tab-btn" onclick="filterMatrixSection(2)">Section 2: Hygiene (7)</button>
        <button type="button" class="matrix-tab-btn" onclick="filterMatrixSection(3)">Section 3: Parsing (10)</button>
        <button type="button" class="matrix-tab-btn" onclick="filterMatrixSection(4)">Section 4: Manifests (12)</button>
      </div>

      <div class="table-responsive-wrapper" style="max-height: 480px; overflow-y: auto;">
        <table class="exec-table dev-matrix-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Capability &amp; Parameter</th>
              <th>Category</th>
              <th>Status</th>
              <th>Score</th>
              <th>Technical Details &amp; Character Volume</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="dev-matrix-tbody">
            <!-- Dynamic 32-capability rows rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * Render Interactive Machine File Code Drawers (robots.txt, sitemap.xml, llms.txt, etc.)
 */
export function renderMachineCodeDrawers(domainName = 'thatworkx.com') {
  return `
    <div class="machine-code-drawers-card dev-only-component" id="dev-drawers-section" style="margin-top: 1.5rem;">
      <div class="table-card-header">
        <div>
          <h4 style="display: flex; align-items: center; gap: 0.5rem;">
            <span>💻 Machine File Code Inspection Drawers</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Syntax Highlighted</span>
          </h4>
          <p>Inspect, copy, and download root directory machine welcome mats and blueprint manifests.</p>
        </div>
      </div>

      <!-- File Selection Tabs -->
      <div class="drawer-file-tabs">
        <button type="button" class="drawer-tab-btn active" onclick="selectCodeDrawer('llms')">/llms.txt</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('aicontext')">/ai-context.md</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('robots')">/robots.txt</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('sitemap')">/sitemap.xml</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('readme')">/README.md</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('about')">/about.md</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('docs')">/docs.md</button>
        <button type="button" class="drawer-tab-btn" onclick="selectCodeDrawer('content')">/content.md</button>
      </div>

      <!-- Active Code Drawer Window -->
      <div class="drawer-code-window">
        <div class="drawer-code-bar">
          <span class="drawer-file-path" id="drawer-current-filepath">/llms.txt</span>
          <div class="drawer-action-btns">
            <button type="button" class="drawer-btn" onclick="copyDrawerCode()">
              <span>📋 Copy Code</span>
            </button>
            <button type="button" class="drawer-btn drawer-btn-download" onclick="downloadDrawerFile()">
              <span>📥 Download File</span>
            </button>
          </div>
        </div>
        <div class="drawer-code-body">
          <pre><code id="drawer-code-content" class="language-markdown"># ${domainName} LLMs Machine Directory Index
> Comprehensive AI Machine Welcome Directory following the Answer.ai Specification.

## Core Navigation Routes
- [Home Page](https://${domainName}/): Primary brand homepage & solutions overview.
- [About Us](https://${domainName}/about): Verified corporate entity & leadership credentials.
- [Documentation](https://${domainName}/docs): Technical API integration manuals and workflow guides.

## System Context Map Pointer
- [AI System Context](https://${domainName}/ai-context.md): Flattened RAG system context map.</code></pre>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render Edge Network & WAF Deployment Tab
 */
export function renderEdgeNetworkTab() {
  return `
    <div class="edge-network-card dev-only-component" id="dev-edge-section" style="margin-top: 1.5rem;">
      <div class="table-card-header">
        <div>
          <h4 style="display: flex; align-items: center; gap: 0.5rem;">
            <span>🌐 Edge Network &amp; WAF Deployment Sandbox</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Cloudflare &amp; Falcon Hooks</span>
          </h4>
          <p>Deploy edge worker proxies to serve /llms.txt and bypass closed CMS hosting restrictions (Shopify, Wix, Squarespace).</p>
        </div>
      </div>

      <div class="edge-tabs-nav">
        <button type="button" class="edge-tab-btn active" onclick="selectEdgeTab('cloudflare')">Cloudflare Worker Proxy Script</button>
        <button type="button" class="edge-tab-btn" onclick="selectEdgeTab('shopify')">Shopify Domain Redirect Hook</button>
        <button type="button" class="edge-tab-btn" onclick="selectEdgeTab('crowdstrike')">Crowdstrike Falcon WAF Bypass</button>
      </div>

      <div class="edge-tab-content drawer-code-window" style="background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem;">
        <div class="drawer-code-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
          <span class="drawer-file-path" id="edge-current-title" style="font-family: var(--font-mono); font-size: 0.85rem; color: #38bdf8;">Cloudflare Worker Edge Router (worker.js)</span>
          <button type="button" class="drawer-btn" onclick="copyEdgeScript()">
            <span>📋 Copy Worker Script</span>
          </button>
        </div>
        <div class="drawer-code-body">
          <pre><code id="edge-code-content" class="language-javascript">// Cloudflare Worker Edge Proxy Hook for AEO Machine Files
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  
  // Intercept /llms.txt edge request
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

/**
 * Render Expandable Scanned Routes Table with Raw DOM Metrics ([▶])
 */
export function renderExpandableRouteDirectory() {
  return `
    <div class="expandable-routes-card dev-only-component" id="dev-expandable-routes-section" style="margin-top: 1.5rem;">
      <div class="table-card-header">
        <div>
          <h4 style="display: flex; align-items: center; gap: 0.5rem;">
            <span>📂 Scanned Routes Directory (Expandable DOM Metrics)</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">[▶] Click to Expand</span>
          </h4>
          <p>Expand individual route rows to inspect raw DOM heading arrays, token counts, and canonical link tags.</p>
        </div>
        <span class="table-count-badge" id="dev-routes-count">4 Routes Tracked</span>
      </div>

      <div class="table-responsive-wrapper">
        <table class="exec-table dev-expandable-table">
          <thead>
            <tr>
              <th style="width: 40px;"></th>
              <th>Route Path</th>
              <th>Word Count</th>
              <th>Token Count</th>
              <th>Canonical Tag</th>
              <th>Heading Hierarchy</th>
              <th style="text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="dev-expandable-routes-tbody">
            <!-- Rendered by JS -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}
