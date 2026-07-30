// Initialize theme from localStorage immediately to minimize styling flashes
try {
  const savedTheme = localStorage.getItem('aeo-theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    const themeToggleIcon = document.getElementById('theme-toggle-icon');
    if (themeToggleIcon) themeToggleIcon.innerText = '☀️';
  }
} catch (e) {
  console.warn('Early theme initialization issue:', e);
}

// Current Client State
let activeProduct = 'visualize';
let activeOptimizeTool = 'robots';
let activeVisualizeViewMode = 'executive'; // Default active state: Executive Mode
let currentEmail = 'user@thatworkx.com'; // Default user session email
let activeScanController = null;

// Base API URL Resolver (routes cleanly to port 5000 when accessing via file:// or non-5000 ports)
const API_BASE = (typeof window !== 'undefined' && (window.location.protocol === 'file:' || window.location.port !== '5000')) 
  ? 'http://localhost:5000' 
  : '';

// AIVisualize Dual-View Switcher Handler (Executive vs Developer / DIY Mode)
function setVisualizeViewMode(mode) {
  activeVisualizeViewMode = mode;
  
  const execContainer = document.getElementById('exec-mode-container');
  const devContainer = document.getElementById('dev-mode-container');
  const pillExec = document.getElementById('pill-exec-mode') || document.getElementById('btn-mode-executive');
  const pillDev = document.getElementById('pill-dev-mode') || document.getElementById('btn-mode-developer');

  if (mode === 'developer' || mode === 'diy') {
    if (execContainer) execContainer.style.display = 'none';
    if (devContainer) devContainer.style.display = 'block';
    if (pillExec) pillExec.classList.remove('active');
    if (pillDev) pillDev.classList.add('active');
  } else {
    if (execContainer) execContainer.style.display = 'block';
    if (devContainer) devContainer.style.display = 'none';
    if (pillExec) pillExec.classList.add('active');
    if (pillDev) pillDev.classList.remove('active');
  }

  const panel = document.getElementById('panel-visualize');
  if (panel) {
    panel.setAttribute('data-visualize-mode', mode);
  }

  // Update URL parameters without reloading
  if (typeof window !== 'undefined' && window.history) {
    const params = new URLSearchParams(window.location.search || '');
    params.set('mode', mode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }
}

// Executive Mode Action: Export PDF Summary
function exportExecutiveSummaryPdf() {
  window.print();
}

// Export Engine: Raw JSON Diagnostics Download
function exportRawJsonDiagnostics() {
  const payload = window.lastScanResults || currentEvaluatedCapabilities || {};
  const domain = currentScannedDomain || 'site';
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
function buildDevManifestTreeHtml() {
  return `
    <div class="table-card glassmorphic mb-6" id="dev-manifest-tree-card" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>🤖 AI-Ready File (Machine Manifest) Diagnostics</span>
            <span class="badge-status" id="dev-manifest-count-badge" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted);">8 Manifests Tracked</span>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Inspect robots.txt directives, bot permissions, and Level 1–4 machine welcome mats.</p>
        </div>
      </div>

      <div class="table-responsive-wrapper" style="overflow-x: auto;">
        <table class="exec-table dev-manifest-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); text-align: left; color: #94a3b8;">
              <th style="padding: 0.6rem;">Machine File</th>
              <th style="padding: 0.6rem;">Status</th>
              <th style="padding: 0.6rem;">In Robots.txt</th>
              <th style="padding: 0.6rem;">ChatGPT</th>
              <th style="padding: 0.6rem;">Gemini-bot</th>
              <th style="padding: 0.6rem;">Perplexity-bot</th>
              <th style="padding: 0.6rem;">Words / Chars</th>
              <th style="padding: 0.6rem; text-align: right;">Inspection</th>
            </tr>
          </thead>
          <tbody id="dev-manifest-tbody">
            <!-- Dynamic Level 1-4 Manifest Rows -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function buildDevMatrixHtml() {
  return `
    <div class="developer-matrix-card glassmorphic" id="dev-matrix-section" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>🛠️ AI-Optimized Site Diagnostics</span>
            <span class="badge-status" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted);">Full Technical Audit</span>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Complete technical breakdown of all 32 AEO access, hygiene, parsing, and machine handshake parameters.</p>
        </div>
        <span class="table-count-badge status-amber-badge">32 Checks Evaluated</span>
      </div>

      <div class="matrix-filter-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <button type="button" class="matrix-tab-btn control-menu-item active" onclick="filterMatrixSection('all')">All (32)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(1)">Section 1: Gateway (3)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(2)">Section 2: Hygiene (7)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(3)">Section 3: Parsing (10)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(4)">Section 4: Manifests (12)</button>
      </div>

      <div class="table-responsive-wrapper" style="max-height: 480px; overflow-y: auto; position: relative;">
        <table class="exec-table dev-matrix-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead style="position: sticky; top: 0; z-index: 10; background-color: var(--surface-bg); border-bottom: 1px solid rgba(255,255,255,0.1);">
            <tr style="color: #94a3b8; text-align: left;">
              <th style="padding: 0.6rem;">#</th>
              <th style="padding: 0.6rem;">Capability &amp; Parameter</th>
              <th style="padding: 0.6rem;">Category</th>
              <th style="padding: 0.6rem;">Status</th>
              <th style="padding: 0.6rem;">Score</th>
              <th style="padding: 0.6rem;">Technical Details &amp; Character Volume</th>
              <th style="padding: 0.6rem; text-align: right;">Action</th>
            </tr>
          </thead>
          <tbody id="dev-matrix-tbody">
            <!-- Dynamic 32-capability rows -->
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function buildDevDrawersHtml(domainName = '') {
  return `
    <div class="machine-code-drawers-card glassmorphic" id="dev-drawers-section" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>💻 Machine File Code Inspection Drawers</span>
            <span class="badge-status" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted);">Syntax Highlighted</span>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Inspect, copy, and download root directory machine welcome mats and blueprint manifests.</p>
        </div>
      </div>

      <div class="drawer-file-tabs" style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
        <button type="button" class="drawer-tab-btn control-menu-item active" onclick="selectCodeDrawer('llms')">/llms.txt</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('aicontext')">/ai-context.md</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('robots')">/robots.txt</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('sitemap')">/sitemap.xml</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('readme')">/README.md</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('about')">/about.md</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('docs')">/docs.md</button>
        <button type="button" class="drawer-tab-btn control-menu-item" onclick="selectCodeDrawer('content')">/content.md</button>
      </div>

      <div class="drawer-code-window" style="background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem;">
        <div class="drawer-code-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 0.5rem;">
          <span class="drawer-file-path" id="drawer-current-filepath" style="font-family: var(--font-mono); font-size: 0.85rem; color: #38bdf8;">/llms.txt</span>
          <div class="drawer-action-btns" style="display: flex; gap: 0.5rem;">
            <button type="button" class="drawer-btn" onclick="copyDrawerCode()">📋 Copy Code</button>
            <button type="button" class="drawer-btn drawer-btn-download" onclick="downloadDrawerFile()">📥 Download File</button>
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

function buildDevRoutesHtml() {
  return `
    <div class="expandable-routes-card glassmorphic" id="dev-expandable-routes-section" style="padding: 1.5rem; border-radius: 12px; background: var(--surface-bg); border: 1px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: var(--text-primary); display: flex; align-items: center; gap: 0.5rem;">
            <span>📂 Scanned Routes Directory (Expandable DOM Metrics)</span>
            <span class="badge-status" style="font-size: 0.72rem; background: var(--surface-nested-bg); border: 1px solid var(--border-color); color: var(--text-muted);">[▶] Click to Expand</span>
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted);">Expand individual route rows to inspect raw DOM heading arrays, token counts, and canonical link tags.</p>
        </div>
        <span class="table-count-badge" id="dev-routes-count">4 Routes Tracked</span>
      </div>

      <div class="table-responsive-wrapper">
        <table class="exec-table dev-expandable-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; text-align: left;">
              <th style="width: 40px; padding: 0.6rem;"></th>
              <th style="padding: 0.6rem;">Route Path</th>
              <th style="padding: 0.6rem;">Word Count</th>
              <th style="padding: 0.6rem;">Token Count</th>
              <th style="padding: 0.6rem;">Canonical Tag</th>
              <th style="padding: 0.6rem;">Heading Hierarchy</th>
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

// 4-Page Architecture Router Initialization
document.addEventListener('DOMContentLoaded', () => {
  // Sync theme again once DOM elements are fully loaded
  try {
    const savedTheme = localStorage.getItem('aeo-theme');
    if (savedTheme === 'light') {
      document.body.classList.add('light-theme');
      const themeToggleIcon = document.getElementById('theme-toggle-icon');
      if (themeToggleIcon) themeToggleIcon.innerText = '☀️';
    } else {
      document.body.classList.remove('light-theme');
      const themeToggleIcon = document.getElementById('theme-toggle-icon');
      if (themeToggleIcon) themeToggleIcon.innerText = '🌙';
    }
  } catch (e) {
    console.warn('DOM theme initialization issue:', e);
  }

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
    const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
    const devDrawersWrap = document.getElementById('dev-drawers-wrapper');
    const devRoutesWrap = document.getElementById('dev-routes-wrapper');

    if (devMatrixWrap) devMatrixWrap.innerHTML = buildDevManifestTreeHtml() + buildDevMatrixHtml();
    if (devDrawersWrap) devDrawersWrap.innerHTML = buildDevDrawersHtml(targetUrlParam || '');
    if (devRoutesWrap) devRoutesWrap.innerHTML = buildDevRoutesHtml();

    const tabParam = params.get('tab');
    if (modeParam === 'developer' || modeParam === 'diy') {
      setVisualizeViewMode('developer');
    } else {
      setVisualizeViewMode('executive');
    }

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

    // Attach ? help button listeners via event delegation (reliable, no inline onclick needed)
    document.addEventListener('click', function(e) {
      const btn = e.target.closest('.info-help-btn[data-section]');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        const secNum = parseInt(btn.dataset.section, 10);
        console.log('[HelpModal] ? button clicked, section:', secNum);
        openSectionHelpModal(secNum, null);
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

function updateDeveloperViewData(results) {
  if (!results) return;

  const inputVal = document.getElementById('target-url')?.value.trim() || document.getElementById('onboarding-target-url')?.value.trim() || '';
  let rawUrl = results.url || results.domain || inputVal || '';
  if (rawUrl) {
    currentScannedDomain = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  }

  // Compute full 32 capability evaluations via capabilityEvaluator engine
  const evalResults = evaluateAllCapabilities(results);
  currentEvaluatedCapabilities = evalResults.capabilities || results.capabilityMatrix || [];

  renderDeveloperManifestTree(results);
  renderDeveloperMatrixRows(currentEvaluatedCapabilities);
  renderExpandableRoutesTable(results);
  selectCodeDrawer(activeDrawerKey, results);
}

function renderDeveloperManifestTree(results = {}) {
  const tbody = document.getElementById('dev-manifest-tbody');
  const countBadge = document.getElementById('dev-manifest-count-badge');
  if (!tbody) return;

  const status = results.status || {};
  const botPerms = status.botPermissions || {};

  const gptAllowed = botPerms.gptBot !== false;
  const geminiAllowed = botPerms.googleExtended !== false;
  const perplexityAllowed = botPerms.perplexityBot !== false;

  const getBotPill = (allowed) => allowed
    ? `<span class="badge-status status-green" style="font-size: 0.72rem;">🟢 Allowed</span>`
    : `<span class="badge-status status-red" style="font-size: 0.72rem;">🔴 Blocked</span>`;

  const domainUrl = `https://${currentScannedDomain}`;

  const manifests = [
    {
      path: '/robots.txt',
      fileRoute: '/robots.txt',
      exists: !!status.robotsTxtExists,
      inRobots: 'N/A',
      wordInfo: status.robotsTxtExists ? '780 chars' : '0 words (404 Missing)'
    },
    {
      path: '|--> /llms.txt',
      fileRoute: '/llms.txt',
      exists: !!status.llmsTxtExists,
      inRobots: status.robotsTxtExists ? 'Yes' : 'No',
      wordInfo: status.llmsTxtExists ? (status.llmsTxtContent ? `${status.llmsTxtContent.split(/\s+/).filter(Boolean).length} words` : '350 words') : '0 words (404 Missing)'
    },
    {
      path: '|--> /sitemap.xml',
      fileRoute: '/sitemap.xml',
      exists: !!status.sitemapExists,
      inRobots: status.sitemapExists ? 'Yes' : 'No',
      wordInfo: status.sitemapExists ? '1.4 KB' : '0 words (404 Missing)'
    },
    {
      path: '|--> /ai-context.md',
      fileRoute: '/ai-context.md',
      exists: !!status.aiContextExists,
      inRobots: status.aiContextExists ? 'Yes' : 'No',
      wordInfo: status.aiContextExists ? (status.aiContextContent ? `${status.aiContextContent.split(/\s+/).filter(Boolean).length} words` : '520 words') : '0 words (404 Missing)'
    },
    {
      path: '|--> README.md',
      fileRoute: '/README.md',
      exists: !!status.readmeFound,
      inRobots: 'No',
      wordInfo: status.readmeFound ? '290 words' : '0 words (404 Missing)'
    },
    {
      path: '|--> about.md',
      fileRoute: '/about.md',
      exists: !!status.aboutTxtExists,
      inRobots: status.aboutTxtExists ? 'Yes' : 'No',
      wordInfo: status.aboutTxtExists ? (status.aboutTxtContent ? `${status.aboutTxtContent.split(/\s+/).filter(Boolean).length} words` : '410 words') : '0 words (404 Missing)'
    },
    {
      path: '|--> docs.md',
      fileRoute: '/docs.md',
      exists: !!status.docsTxtExists,
      inRobots: status.docsTxtExists ? 'Yes' : 'No',
      wordInfo: status.docsTxtExists ? (status.docsTxtContent ? `${status.docsTxtContent.split(/\s+/).filter(Boolean).length} words` : '680 words') : '0 words (404 Missing)'
    },
    {
      path: '|--> content.md',
      fileRoute: '/content.md',
      exists: !!status.contentTxtExists,
      inRobots: status.contentTxtExists ? 'Yes' : 'No',
      wordInfo: status.contentTxtExists ? (status.contentTxtContent ? `${status.contentTxtContent.split(/\s+/).filter(Boolean).length} words` : '950 words') : '0 words (404 Missing)'
    }
  ];

  const activeCount = manifests.filter(m => m.exists).length;
  if (countBadge) countBadge.innerText = `${activeCount} / 8 Manifests Active`;

  tbody.innerHTML = manifests.map(m => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 0.6rem;"><code style="color: #4ade80;">${m.path}</code></td>
      <td style="padding: 0.6rem;">
        <span class="badge-status ${m.exists ? 'status-green' : 'status-red'}" style="font-size: 0.75rem;">
          ${m.exists ? '🟢 Active' : '🔴 Not Active'}
        </span>
      </td>
      <td style="padding: 0.6rem; color: #cbd5e1;">${m.inRobots}</td>
      <td style="padding: 0.6rem;">${getBotPill(gptAllowed)}</td>
      <td style="padding: 0.6rem;">${getBotPill(geminiAllowed)}</td>
      <td style="padding: 0.6rem;">${getBotPill(perplexityAllowed)}</td>
      <td style="padding: 0.6rem; color: #94a3b8; font-size: 0.8rem;">${m.wordInfo}</td>
      <td style="padding: 0.6rem; text-align: right;">
        <a href="${domainUrl}${m.fileRoute}" target="_blank" rel="noopener noreferrer" class="drawer-btn" style="text-decoration: none; display: inline-block; padding: 0.2rem 0.5rem; font-size: 0.78rem;">View ↗</a>
      </td>
    </tr>
  `).join('');
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

function renderDeveloperMatrixRows(capabilities) {
  const tbody = document.getElementById('dev-matrix-tbody');
  if (!tbody) return;

  const sectionCategoryNames = {
    1: 'Section 1: Gateway & Access',
    2: 'Section 2: Presence & Hygiene',
    3: 'Section 3: Content AI-Optimization',
    4: 'Section 4: Machine Manifest Readiness'
  };

  let rowsHtml = '';
  let currentSection = null;
  const isAllView = capabilities.length > 15;

  capabilities.forEach((cap, idx) => {
    if (isAllView && cap.section !== currentSection) {
      currentSection = cap.section;
      const catTitle = sectionCategoryNames[currentSection] || `Section ${currentSection}`;
      rowsHtml += `
        <tr class="category-divider" style="background: rgba(255,255,255,0.06); color: var(--burnt-copper); font-weight: 700;">
          <td colspan="7" style="padding: 0.6rem 0.8rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);">
            <strong>${catTitle}</strong>
          </td>
        </tr>
      `;
    }

    const isPass = cap.status === 'pass' || cap.status === 'active';
    const isBlocked = cap.status === 'blocked' || cap.status === 'critical';
    const statusBadge = isPass
      ? '<span class="badge-status status-green">🟢 Pass</span>'
      : (isBlocked ? '<span class="badge-status status-red">🔴 Blocked</span>' : '<span class="badge-status status-amber">🟡 Warning</span>');

    const proHook = getProUpgradeHook(cap.id);
    let actionHtml = `<button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('', '${cap.id}')"><span>⚡ Fix in AIOptimize</span></button>`;
    
    if (proHook && !isPass) {
      actionHtml = `<button type="button" class="badge-status status-amber" onclick="showUpgradeModal('PRO_REQUIRED', '${proHook.msg}', '${proHook.tier}')" style="border: none; cursor: pointer; padding: 0.35rem 0.7rem; border-radius: 6px; font-weight: 700;">${proHook.label}</button>`;
    }

    rowsHtml += `
      <tr data-section="${cap.section}">
        <td style="font-family: var(--font-mono); color: var(--text-muted);">${idx + 1}</td>
        <td>
          <strong>${cap.name || cap.title}</strong>
          <div style="font-size: 0.75rem; color: var(--text-muted);">${cap.description || cap.impact}</div>
        </td>
        <td><span class="dev-cat-badge">${cap.category}</span></td>
        <td>${statusBadge}</td>
        <td style="font-family: var(--font-mono); font-weight: 700;">${cap.score}/100</td>
        <td style="font-size: 0.8rem; color: var(--text-main);">${cap.deductionReason || cap.details}</td>
        <td style="text-align: right;">${actionHtml}</td>
      </tr>
    `;
  });

  tbody.innerHTML = rowsHtml;
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

let activeDrawerKey = 'llms';

function getDynamicDrawerTemplates(domainName, results = {}) {
  const targetUrl = `https://${domainName}`;
  const status = results.status || {};

  return {
    llms: {
      path: '/llms.txt',
      content: status.llmsTxtContent || `# ${domainName} LLMs Machine Directory Index\n> Answer.ai Standard Machine Directory File for ${domainName}.\n\n## Primary Target Domain\n- [Homepage](${targetUrl}/): Core web presence and main offerings.\n- [About](${targetUrl}/about): Corporate identity & verified entity information.\n- [Docs](${targetUrl}/docs): Technical manuals and integration guides.\n\n## System Context Blueprint Pointer\n- [AI System Context](${targetUrl}/ai-context.md): Flattened RAG system context map.`
    },
    aicontext: {
      path: '/ai-context.md',
      content: status.aiContextContent || `# ${domainName.toUpperCase()}: SYSTEM CONTEXT MAP\n> Flattened RAG System Context & Entity Blueprint Manifest.\n\n## Target Domain Architecture\n- Host Domain: ${domainName}\n- Primary Canonical Protocol: HTTPS SSL Enabled\n- Level 1 Gateway: /robots.txt directives\n- Level 2 Machine Welcome: /llms.txt index file\n- Level 3 RAG Vector Context: /ai-context.md`
    },
    robots: {
      path: '/robots.txt',
      content: status.robotsTxtContent || `# robots.txt AI Search & Bot Gateway Directives for ${domainName}\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: Google-Extended\nAllow: /\n\nSitemap: ${targetUrl}/sitemap.xml`
    },
    sitemap: {
      path: '/sitemap.xml',
      content: status.sitemapContent || `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url>\n    <loc>${targetUrl}/</loc>\n    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n    <priority>1.0</priority>\n  </url>\n</urlset>`
    },
    readme: {
      path: '/README.md',
      content: `# ${domainName} Orientation Guide\nWelcome to the machine agent orientation guide for ${domainName}.`
    },
    about: {
      path: '/about.md',
      content: `# ${domainName} Entity Verification\nCorporate entity ownership, leadership credentials, and brand verification for ${domainName}.`
    },
    docs: {
      path: '/docs.md',
      content: `# ${domainName} Technical Manual\nTechnical integration instructions and architecture specifications for ${domainName}.`
    },
    content: {
      path: '/content.md',
      content: `# ${domainName} Flat Article Index\nFlat markdown directory index summarizing core knowledge bases for ${domainName}.`
    }
  };
}

function selectCodeDrawer(key, results = null) {
  activeDrawerKey = key;
  const buttons = document.querySelectorAll('.drawer-tab-btn');
  buttons.forEach(b => b.classList.remove('active'));
  const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(`'${key}'`));
  if (targetBtn) targetBtn.classList.add('active');

  const templates = getDynamicDrawerTemplates(currentScannedDomain, results || {});
  const fileInfo = templates[key] || templates.llms;

  const pathEl = document.getElementById('drawer-current-filepath');
  if (pathEl) pathEl.innerText = fileInfo.path;

  const contentEl = document.getElementById('drawer-code-content');
  if (contentEl) contentEl.innerText = fileInfo.content;
}

function copyDrawerCode() {
  const contentEl = document.getElementById('drawer-code-content');
  if (contentEl) {
    navigator.clipboard.writeText(contentEl.innerText);
    alert('Copied drawer code to clipboard!');
  }
}

function downloadDrawerFile() {
  const templates = getDynamicDrawerTemplates(currentScannedDomain);
  const fileInfo = templates[activeDrawerKey] || templates.llms;
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

function renderExpandableRoutesTable(results) {
  const tbody = document.getElementById('dev-expandable-routes-tbody');
  const countEl = document.getElementById('dev-routes-count');
  if (!tbody) return;

  const pages = (results && results.pages && results.pages.length) ? results.pages : [
    { 
      route: '/', 
      wordCount: results?.status?.wordCount ?? 0, 
      hasCanonical: true, 
      canonicalUrl: `https://${currentScannedDomain}/`, 
      headingAudit: { isHierarchyValid: results?.status?.hasProperHierarchy ?? true, h1: 1, h2: 2 } 
    }
  ];

  if (countEl) countEl.innerText = `${pages.length} Route${pages.length === 1 ? '' : 's'} Tracked`;

  tbody.innerHTML = pages.map((p, idx) => `
    <tr>
      <td>
        <button type="button" class="btn-expand-row" onclick="toggleRouteExpandRow(${idx})">▶</button>
      </td>
      <td class="cell-path"><code>${p.route}</code></td>
      <td>${p.wordCount || 0} words</td>
      <td>~${Math.round((p.wordCount || 0) * 1.3)} tokens</td>
      <td>${p.hasCanonical !== false ? '🟢 Valid' : '🔴 Missing'}</td>
      <td>${p.headingAudit?.isHierarchyValid !== false ? '🟢 1 H1 (Sequential)' : '🔴 Hierarchy Issue'}</td>
      <td style="text-align: right;">
        <button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('${p.route}', 'tokenLoadAnalysis')">
          <span>⚡ Audit Page</span>
        </button>
      </td>
    </tr>
    <tr id="dev-expand-row-${idx}" style="display: none;">
      <td colspan="7">
        <div class="row-expanded-content">
          <strong>Raw DOM Metrics &amp; Heading Array for <code>${p.route}</code>:</strong>
          <ul style="margin: 0.5rem 0 0 1.2rem; padding: 0;">
            <li>Canonical URL: <code>${p.canonicalUrl || `https://${currentScannedDomain}${p.route}`}</code></li>
            <li>Headings Count: H1: ${p.headingAudit?.h1 ?? 1} | H2: ${p.headingAudit?.h2 ?? 0}</li>
            <li>RAG Context Window Status: ${(p.wordCount || 0) > 2500 ? '🟡 High Token Volume (Truncation Risk)' : '🟢 Ideal Vector Window'}</li>
          </ul>
        </div>
      </td>
    </tr>
  `).join('');
}

function toggleRouteExpandRow(idx) {
  const row = document.getElementById(`dev-expand-row-${idx}`);
  if (row) {
    row.style.display = row.style.display === 'none' ? 'table-row' : 'none';
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

window.setVisualizeViewMode = setVisualizeViewMode;
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

  const timestampEls = [
    document.getElementById('scan-timestamp-badge'),
    document.getElementById('dev-scan-timestamp-badge')
  ].filter(Boolean);
  timestampEls.forEach(el => {
    const lastScannedVal = results.scanMetrics?.lastScanned || results.lastScanned || new Date().toLocaleString();
    el.innerText = `Last Scanned: ${lastScannedVal}`;
  });

  const durationEls = [
    document.getElementById('scan-duration-badge'),
    document.getElementById('dev-scan-duration-badge')
  ].filter(Boolean);
  durationEls.forEach(el => {
    const scanTimeSeconds = results.scanMetrics?.scanTimeSeconds ?? results.scanTimeSeconds ?? 1.8;
    el.innerText = `Time to Scan: ${scanTimeSeconds} seconds`;
  });

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
      <div class="explainer-card glassmorphic" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(245, 158, 11, 0.25); border-left: 4px solid #f59e0b; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
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
      <div class="explainer-card glassmorphic" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(14, 165, 233, 0.25); border-left: 4px solid #0ea5e9; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
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
            <li style="display: flex; align-items: center;">${getStatusIndicator(isSecurePass)}isSecure Protocol Check</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isSpaPass)}SPA Hydration Trap &amp; Density Ratio</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isRagPass)}RAG Offset: /llms.txt &amp; /ai-context.md</li>
            <li style="display: flex; align-items: center;">${getStatusIndicator(isEntityPass)}Essential Entity Nodes Discovered</li>
          </ul>
        </div>
      </div>

      <!-- Section 3 Card: Content AI-Optimization -->
      <div class="explainer-card glassmorphic" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(139, 92, 246, 0.25); border-left: 4px solid #8b5cf6; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
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
      <div class="explainer-card glassmorphic" style="padding: 1.2rem; border-radius: 14px; background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(16, 185, 129, 0.25); border-left: 4px solid #10b981; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3); display: flex; flex-direction: column; justify-content: space-between;">
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
    secureStatusEl.innerText = isSecure ? '🟢 Passed' : '🔴 Action Needed';
    secureStatusEl.className = `badge-status ${isSecure ? 'status-green' : 'status-red'}`;
    secureStatusEl.style.setProperty('background', isSecure ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    secureStatusEl.style.setProperty('color', isSecure ? '#34d399' : '#f43f5e', 'important');
  }

  const contactStatusEl = document.getElementById('sec3-contact-status');
  if (contactStatusEl) {
    const hasContact = typeof eeat.hasContactInfo === 'boolean' ? eeat.hasContactInfo : (results.executiveSections?.section3?.hasContactInfo ?? true);
    contactStatusEl.innerText = hasContact ? '🟢 Passed' : '🔴 Action Needed';
    contactStatusEl.className = `badge-status ${hasContact ? 'status-green' : 'status-red'}`;
    contactStatusEl.style.setProperty('background', hasContact ? 'rgba(16, 185, 129, 0.18)' : 'rgba(244, 63, 94, 0.18)', 'important');
    contactStatusEl.style.setProperty('color', hasContact ? '#34d399' : '#f43f5e', 'important');
  }

  const privacyStatusEl = document.getElementById('sec3-privacy-status');
  if (privacyStatusEl) {
    const hasPrivacy = typeof eeat.hasPrivacyPolicy === 'boolean' ? eeat.hasPrivacyPolicy : (results.executiveSections?.section3?.hasPrivacyPolicy ?? true);
    privacyStatusEl.innerText = hasPrivacy ? '🟢 Passed' : '🔴 Action Needed';
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
  renderPillarCard(2, 'section2', pillars?.p2);
  renderPillarCard(3, 'section3', pillars?.p3);
  renderPillarCard(4, 'section4', pillars?.p4);

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
      return '<span class="status-red">🔴 Not available</span><a href="?mode=developer&tab=manifests" class="diy-sample-link" style="margin-left: 10px; font-size: 0.85em; text-decoration: underline;">View DIY sample ↗</a>';
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

// Show/Hide upgrade limit alerts modal
function showUpgradeModal(code, message, targetTier) {
  const modalTitle = document.getElementById('modal-title');
  if (modalTitle) modalTitle.innerText = (code || 'Limit Exceeded').replace(/_/g, ' ');

  const modalMsg = document.getElementById('modal-message');
  if (modalMsg) modalMsg.innerText = message || 'Daily scan allocation limit reached.';

  const modal = document.getElementById('alert-modal');
  if (modal) modal.style.display = 'flex';
  
  const tierSelector = document.getElementById('user-tier-selector');
  if (tierSelector && targetTier) {
    tierSelector.value = targetTier;
  }

  // Fallback alert if modal container is absent in DOM
  if (!modal) {
    alert(`[${code}] ${message}`);
  }
}

function closeAlertModal() {
  document.getElementById('alert-modal').style.display = 'none';
}

function triggerUpgrade() {
  closeAlertModal();
  updateUserTier();
  alert('Upgraded plan configuration updated. Limits have been expanded.');
}

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
  const modal = document.getElementById('help-info-modal');
  const data = helpContent[type];
  if (modal && data) {
    document.getElementById('help-modal-icon').innerText = data.icon;
    document.getElementById('help-modal-title').innerText = data.title;
    document.getElementById('help-modal-body').innerHTML = data.body;
    modal.style.display = 'flex';
  }
}

function closeHelpModal() {
  const modal = document.getElementById('help-info-modal');
  if (modal) {
    modal.style.display = 'none';
  }
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

function toggleTheme() {
  const body = document.body;
  const isLight = body.classList.toggle('light-theme');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  
  if (isLight) {
    if (themeToggleIcon) themeToggleIcon.innerText = '☀️';
    localStorage.setItem('aeo-theme', 'light');
  } else {
    if (themeToggleIcon) themeToggleIcon.innerText = '🌙';
    localStorage.setItem('aeo-theme', 'dark');
  }
}

function switchDeckCard(cardId) {
  const PANEL_META = {
    aeo:       { file: 'ai-context.json',      tag: 'AEO_VS_SEO_MATRIX',           tagColor: '#9F1239' },
    hierarchy: { file: 'llms.txt',             tag: 'DIRECTORY_HANDSHAKE',          tagColor: '#B45309' },
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


window.openUrlModal = openUrlModal;
window.closeUrlModal = closeUrlModal;
window.handleModalScanSubmit = handleModalScanSubmit;
window.generateTrack2File = generateTrack2File;
window.selectConsoleTab = selectConsoleTab;
window.executeOnboardingScan = executeOnboardingScan;
window.goBackToHome = goBackToHome;
window.switchBentoPreview = switchBentoPreview;
window.switchBentoCode = switchBentoCode;
window.toggleTheme = toggleTheme;
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
window.filterMatrixSection = filterMatrixSection;
window.selectCodeDrawer = selectCodeDrawer;
window.copyDrawerCode = copyDrawerCode;
window.downloadDrawerFile = downloadDrawerFile;
window.selectEdgeTab = selectEdgeTab;
window.copyEdgeScript = copyEdgeScript;
window.toggleRouteExpandRow = toggleRouteExpandRow;
window.updateOptimizeTargetDomain = updateOptimizeTargetDomain;

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

function openSectionHelpModal(secNum, evt) {
  if (evt) {
    if (typeof evt.preventDefault === 'function') evt.preventDefault();
    if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  }
  const data = sectionHelpData[secNum];
  if (!data) return;
  const titleEl = document.getElementById('help-modal-title');
  const iconEl = document.getElementById('help-modal-icon');
  const bodyEl = document.getElementById('help-modal-body');
  const modalEl = document.getElementById('help-modal');

  if (titleEl) titleEl.innerText = data.title;
  if (iconEl) iconEl.innerText = data.icon;
  if (bodyEl) bodyEl.innerHTML = data.body;
  if (modalEl) {
    modalEl.classList.remove('help-modal-hidden');
  }
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
  if (evt) {
    if (typeof evt.preventDefault === 'function') evt.preventDefault();
    if (typeof evt.stopPropagation === 'function') evt.stopPropagation();
  }
  const data = tooltipExplanationData[key] || helpContent[key];
  if (!data) return;
  const titleEl = document.getElementById('help-modal-title');
  const iconEl = document.getElementById('help-modal-icon');
  const bodyEl = document.getElementById('help-modal-body');
  const modalEl = document.getElementById('help-modal');

  if (titleEl) titleEl.innerText = data.title;
  if (iconEl) iconEl.innerText = data.icon;
  if (bodyEl) bodyEl.innerHTML = data.body;
  if (modalEl) {
    modalEl.classList.remove('help-modal-hidden');
  }
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






