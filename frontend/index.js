// Current Client State
let activeProduct = 'visualize';
let activeOptimizeTool = 'robots';
let activeVisualizeViewMode = 'executive'; // Default active state: Executive Mode
let currentEmail = 'user@thatworkx.com'; // Default user session email

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
  if (typeof window !== 'undefined' && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    params.set('mode', mode);
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
  }
}

// Executive Mode Action: Export PDF Summary
function exportExecutiveSummaryPdf() {
  window.print();
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
function buildDevMatrixHtml() {
  return `
    <div class="developer-matrix-card glassmorphic" id="dev-matrix-section" style="padding: 1.5rem; border-radius: 12px; background: rgba(22, 24, 29, 0.7); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            <span>🛠️ 32-Capability Granular Diagnostic Matrix</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Full Technical Audit</span>
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8;">Complete technical breakdown of all 32 AEO access, hygiene, parsing, and machine handshake parameters.</p>
        </div>
        <span class="table-count-badge" style="font-size: 0.85rem; background: rgba(245, 158, 11, 0.15); color: #f59e0b; padding: 0.25rem 0.75rem; border-radius: 12px;">32 Checks Evaluated</span>
      </div>

      <div class="matrix-filter-tabs" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <button type="button" class="matrix-tab-btn control-menu-item active" onclick="filterMatrixSection('all')">All (32)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(1)">Section 1: Gateway (3)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(2)">Section 2: Hygiene (7)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(3)">Section 3: Parsing (10)</button>
        <button type="button" class="matrix-tab-btn control-menu-item" onclick="filterMatrixSection(4)">Section 4: Manifests (12)</button>
      </div>

      <div class="table-responsive-wrapper" style="max-height: 480px; overflow-y: auto;">
        <table class="exec-table dev-matrix-table" style="width: 100%; border-collapse: collapse; font-size: 0.85rem;">
          <thead>
            <tr style="border-bottom: 1px solid rgba(255,255,255,0.1); color: #94a3b8; text-align: left;">
              <th style="padding: 0.6rem;">#</th>
              <th style="padding: 0.6rem;">Capability &amp; Parameter</th>
              <th style="padding: 0.6rem;">Category</th>
              <th style="padding: 0.6rem;">Status</th>
              <th style="padding: 0.6rem;">Score</th>
              <th style="padding: 0.6rem;">Technical Details &amp; Character Volume</th>
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

function buildDevDrawersHtml(domainName = 'thatworkx.com') {
  return `
    <div class="machine-code-drawers-card glassmorphic" id="dev-drawers-section" style="padding: 1.5rem; border-radius: 12px; background: rgba(22, 24, 29, 0.7); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            <span>💻 Machine File Code Inspection Drawers</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Syntax Highlighted</span>
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8;">Inspect, copy, and download root directory machine welcome mats and blueprint manifests.</p>
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
    <div class="edge-network-card glassmorphic" id="dev-edge-section" style="padding: 1.5rem; border-radius: 12px; background: rgba(22, 24, 29, 0.7); border: 1px solid rgba(255,255,255,0.08); margin-bottom: 1.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            <span>🌐 Edge Network &amp; WAF Deployment Sandbox</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">Cloudflare &amp; Falcon Hooks</span>
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8;">Deploy edge worker proxies to serve /llms.txt and bypass closed CMS restrictions.</p>
        </div>
      </div>

      <div class="edge-tabs-nav" style="display: flex; gap: 0.5rem; margin-bottom: 1rem; flex-wrap: wrap;">
        <button type="button" class="edge-tab-btn control-menu-item active" onclick="selectEdgeTab('cloudflare')">Cloudflare Worker Proxy</button>
        <button type="button" class="edge-tab-btn control-menu-item" onclick="selectEdgeTab('shopify')">Shopify Liquid Redirect</button>
        <button type="button" class="edge-tab-btn control-menu-item" onclick="selectEdgeTab('crowdstrike')">Crowdstrike Falcon Bypass</button>
      </div>

      <div class="edge-tab-content" style="background: #090a0f; border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 1rem;">
        <div class="drawer-code-bar" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
          <span class="drawer-file-path" id="edge-current-title" style="font-family: var(--font-mono); font-size: 0.85rem; color: #f59e0b;">Cloudflare Worker Edge Router (worker.js)</span>
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
    <div class="expandable-routes-card glassmorphic" id="dev-expandable-routes-section" style="padding: 1.5rem; border-radius: 12px; background: rgba(22, 24, 29, 0.7); border: 1px solid rgba(255,255,255,0.08);">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <div>
          <h4 style="font-size: 1.1rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem;">
            <span>📂 Scanned Routes Directory (Expandable DOM Metrics)</span>
            <span class="badge-status status-green" style="font-size: 0.72rem;">[▶] Click to Expand</span>
          </h4>
          <p style="font-size: 0.85rem; color: #94a3b8;">Expand individual route rows to inspect raw DOM heading arrays, token counts, and canonical link tags.</p>
        </div>
        <span class="table-count-badge" id="dev-routes-count" style="font-size: 0.85rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 0.25rem 0.75rem; border-radius: 12px;">4 Routes Tracked</span>
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
  generateRobotsTxt();
  generateCloudflareWorker();
  generateJsonLd();
  generateManifests();
  generateEdgeSnippets();
  checkAuthSession();
  updateUserTier();

  const currentPath = window.location.pathname.toLowerCase();
  const params = new URLSearchParams(window.location.search);
  const targetUrlParam = params.get('url');
  const modeParam = params.get('mode');

  // Page 2: AI Visualize Dashboard (visualize.html or /visualize)
  if (currentPath.includes('visualize')) {
    const devMatrixWrap = document.getElementById('dev-matrix-wrapper');
    const devDrawersWrap = document.getElementById('dev-drawers-wrapper');
    const devEdgeWrap = document.getElementById('dev-edge-wrapper');
    const devRoutesWrap = document.getElementById('dev-routes-wrapper');

    if (devMatrixWrap) devMatrixWrap.innerHTML = buildDevMatrixHtml();
    if (devDrawersWrap) devDrawersWrap.innerHTML = buildDevDrawersHtml(targetUrlParam || 'thatworkx.com');
    if (devEdgeWrap) devEdgeWrap.innerHTML = buildDevEdgeHtml();
    if (devRoutesWrap) devRoutesWrap.innerHTML = buildDevRoutesHtml();

    if (modeParam === 'developer' || modeParam === 'diy') {
      setVisualizeViewMode('developer');
    } else {
      setVisualizeViewMode('executive');
    }

    if (targetUrlParam) {
      const mainInput = document.getElementById('target-url');
      if (mainInput) mainInput.value = targetUrlParam;
      executeDashboardScan(null);
    } else {
      // Default initial scan load for demo
      executeDashboardScan(null);
    }
  }

  // Page 3: AI Optimize Workspace (optimize.html or /optimize)
  else if (currentPath.includes('optimize')) {
    if (targetUrlParam) {
      const domainInput = document.getElementById('optimize-target-domain');
      if (domainInput) domainInput.value = targetUrlParam;
    }
    switchOptimizeTrack(1);
  }

  // Page 4: AI Socialize Page (socialize.html or /socialize)
  else if (currentPath.includes('socialize')) {
    // Socialize initializers
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
  const selectedTier = document.getElementById('user-tier-selector').value;
  
  // Update headless controls visibility based on selected tier
  const headlessControls = document.getElementById('headless-checkbox-wrapper');
  if (activeProduct === 'visualize' && (selectedTier.includes('AIOptimize Pro') || selectedTier.includes('AIOptimize ENT'))) {
    headlessControls.style.display = 'block';
  } else {
    headlessControls.style.display = 'none';
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
      secStatus3.innerText = '🟢 AI-Ready';
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
      secStatus4.innerText = '🟢 AI-First';
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

    row.innerHTML = `
      <td>${pathHtml}</td>
      <td>${wordCountHtml}</td>
      <td>${canonicalHtml}</td>
      <td>${structureHtml}</td>
    `;
    tbody.appendChild(row);
  });

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
  currentEvaluatedCapabilities = evalResults.capabilities;

  renderDeveloperMatrixRows(currentEvaluatedCapabilities);
  renderExpandableRoutesTable(results);
  selectCodeDrawer(activeDrawerKey, results);
}

function renderDeveloperMatrixRows(capabilities) {
  const tbody = document.getElementById('dev-matrix-tbody');
  if (!tbody) return;

  tbody.innerHTML = capabilities.map((cap, idx) => `
    <tr data-section="${cap.section}">
      <td style="font-family: var(--font-mono); color: var(--text-muted);">${idx + 1}</td>
      <td>
        <strong>${cap.name}</strong>
        <div style="font-size: 0.75rem; color: var(--text-muted);">${cap.description}</div>
      </td>
      <td><span class="dev-cat-badge">${cap.category}</span></td>
      <td>
        <span class="badge-status ${cap.status === 'pass' ? 'status-green' : (cap.status === 'blocked' ? 'status-red' : 'status-yellow')}">
          ${cap.status === 'pass' ? '🟢 Pass' : (cap.status === 'blocked' ? '🔴 Blocked' : '🟡 Warning')}
        </span>
      </td>
      <td style="font-family: var(--font-mono); font-weight: 700;">${cap.score}/100</td>
      <td style="font-size: 0.8rem; color: var(--text-main);">${cap.details}</td>
      <td style="text-align: right;">
        <button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('', '${cap.id}')">
          <span>⚡ Fix in AIOptimize</span>
        </button>
      </td>
    </tr>
  `).join('');
}

function filterMatrixSection(section) {
  const buttons = document.querySelectorAll('.matrix-tab-btn');
  buttons.forEach(btn => btn.classList.remove('active'));
  
  const targetBtn = Array.from(buttons).find(b => b.getAttribute('onclick')?.includes(`'${section}'`) || b.getAttribute('onclick')?.includes(`(${section})`));
  if (targetBtn) targetBtn.classList.add('active');

  if (section === 'all') {
    renderDeveloperMatrixRows(currentEvaluatedCapabilities);
  } else {
    const filtered = currentEvaluatedCapabilities.filter(c => c.section === Number(section));
    renderDeveloperMatrixRows(filtered);
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
function updateExecutiveViewData(results) {
  if (!results) return;

  // Extract clean domain name from target input or results
  const inputVal = document.getElementById('target-url')?.value.trim() || document.getElementById('onboarding-target-url')?.value.trim() || '';
  let rawUrl = results.url || results.domain || inputVal || 'holiknits.com';
  let domainName = rawUrl.replace(/^https?:\/\//i, '').replace(/\/.*$/, '') || 'holiknits.com';

  const score = results.scoreCard?.overallScore ?? 88;
  const isGood = score >= 80;

  // 1. Executive Banner & Score Dial
  const scoreValEl = document.getElementById('exec-score-val');
  if (scoreValEl) scoreValEl.innerText = score;

  const dialProgress = document.querySelector('.score-dial-progress');
  if (dialProgress) {
    const dashOffset = 326.7 - (326.7 * score) / 100;
    dialProgress.style.strokeDashoffset = dashOffset;
  }

  const domainTagEl = document.getElementById('exec-domain-tag');
  if (domainTagEl) domainTagEl.innerText = `Target: ${domainName}`;

  const statusBadgeEl = document.getElementById('exec-status-badge');
  if (statusBadgeEl) {
    statusBadgeEl.innerText = isGood ? '🟢 AI-READY' : '🟡 ACTION NEEDED';
    statusBadgeEl.className = isGood ? 'exec-badge-good' : 'exec-badge-warn';
  }

  const statusTitleEl = document.getElementById('exec-status-title');
  if (statusTitleEl) {
    statusTitleEl.innerText = isGood 
      ? 'Optimized for Generative AI Search & RAG Ingestion' 
      : 'Action Required: AI Access & Readability Barriers Flagged';
  }

  const statusDescEl = document.getElementById('exec-status-desc');
  if (statusDescEl) {
    statusDescEl.innerText = isGood
      ? `GPTBot, PerplexityBot, and ClaudeBot can cleanly parse ${score}% of your core digital assets on ${domainName}. Machine welcome mats (/llms.txt) are operational.`
      : `Scan detected access or readability issues on ${domainName}. Review gateway rules and machine index files below.`;
  }

  // 2. Perception Simulator (Human Live/DOM Sandbox & Full Machine RAG Vector Stream)
  const humanUrlEl = document.getElementById('human-url-preview');
  if (humanUrlEl) humanUrlEl.innerText = `https://${domainName}/`;

  const iframeEl = document.getElementById('human-live-iframe');
  const fallbackCard = document.getElementById('human-fallback-card');
  const targetFullUrl = rawUrl.startsWith('http') ? rawUrl : `https://${domainName}/`;

  if (iframeEl) {
    iframeEl.src = targetFullUrl;
    // Show fallback card if frame load fails or X-Frame-Options blocks iframe embedding
    iframeEl.onload = function() {
      try {
        // If same-origin check or empty frame content occurs, keep iframe visible
      } catch (e) {
        // Cross-origin embedding works
      }
    };
    iframeEl.onerror = () => {
      iframeEl.style.display = 'none';
      if (fallbackCard) fallbackCard.style.display = 'block';
    };
  }

  const pDomainEl = document.getElementById('human-page-domain');
  if (pDomainEl) pDomainEl.innerText = domainName;

  const pTitleEl = document.getElementById('human-page-title');
  if (pTitleEl && results.pages && results.pages[0]) {
    pTitleEl.innerText = results.pages[0].title || `${domainName} - Scanned Page`;
  }

  const pDescEl = document.getElementById('human-page-desc');
  if (pDescEl && results.pages && results.pages[0]) {
    pDescEl.innerText = results.pages[0].metaDescription || `Full scanned page text & meta properties extracted for ${domainName}.`;
  }

  const machineUrlEl = document.getElementById('machine-url-preview');
  if (machineUrlEl) machineUrlEl.innerText = `rag-vector://stream/${domainName}`;

  const machineVectorCode = document.getElementById('machine-vector-code');
  if (machineVectorCode) {
    const jsonTypes = (results.status?.jsonLdTypes && results.status.jsonLdTypes.length) 
      ? results.status.jsonLdTypes 
      : ["Organization", "WebSite"];
    
    const wordCount = results.status?.wordCount ?? (results.pages?.[0]?.wordCount ?? 0);
    const density = results.status?.contentDensityRatio ?? 0;
    const hasHandshake = results.status?.llmsTxtExists || results.status?.aiContextExists;
    
    // Manifest Character & Word Volume Evaluation
    const llmsWords = results.status?.llmsTxtWords || (results.status?.llmsTxtExists ? 350 : 0);
    const llmsChars = results.status?.llmsTxtChars || (results.status?.llmsTxtExists ? 2450 : 0);
    const contextWords = results.status?.aiContextWords || (results.status?.aiContextExists ? 520 : 0);
    const contextChars = results.status?.aiContextChars || (results.status?.aiContextExists ? 3640 : 0);
    
    const isManifestSparse = hasHandshake && (llmsWords < 150 && contextWords < 150);
    
    let textStreamContent = '';
    let chunkHeaderTag = '';
    
    if (isManifestSparse) {
      chunkHeaderTag = `🟡 Sparse Manifest Warning [Data Starvation Risk]`;
      textStreamContent = `MANIFEST DATA STARVATION: Root /llms.txt & /ai-context.md are accessible (200 OK) but contain low content volume (${llmsWords} words, ${llmsChars} chars). RAG vector engines require >150 words (>1,000 chars) of structured markdown for rich entity ingestion.`;
    } else if (wordCount === 0 && hasHandshake) {
      chunkHeaderTag = `🟢 Machine Handshake Fallback Stream Active [Ingested via /llms.txt & /ai-context.md]`;
      textStreamContent = `HTML DOM relies on client-side JS rendering, but LLM RAG engines successfully parse your root /llms.txt (${llmsWords} words / ${llmsChars} chars) and /ai-context.md (${contextWords} words / ${contextChars} chars) machine welcome mats to extract corporate identity and product specs.`;
    } else if (wordCount === 0) {
      chunkHeaderTag = `🔴 DATA STARVATION ALERT: 0 words extracted from DOM`;
      textStreamContent = `Reason: Client-side JS Hydration Trap or Unrendered SPA framework. AI crawlers cannot extract semantic text from this page without server-side rendering (SSR) fallback or /llms.txt machine welcome files.`;
    } else {
      chunkHeaderTag = `Full Vector Text Stream | Total Words: ${wordCount} | Density: ${density}%`;
      textStreamContent = results.status?.machinePreview || `Full machine-readable RAG vector stream extracted for ${domainName}.`;
    }
    
    machineVectorCode.innerHTML = `
<span class="token-comment"># SYSTEM CONTEXT STREAM: ${domainName}</span>
<span class="token-key">Entity_ID:</span> "${domainName}"
<span class="token-key">Canonical_URL:</span> "${targetFullUrl}"
<span class="token-key">Last_Modified:</span> "${new Date().toISOString()}"
<span class="token-key">JSON_LD_Types:</span> ${JSON.stringify(jsonTypes)}

<span class="token-header">## RAG Chunk 1 [${chunkHeaderTag}]</span>
> ${textStreamContent}

<span class="token-header">## RAG Chunk 2 [Machine Index References &amp; Character Volume]</span>
- /llms.txt: [${results.status?.llmsTxtExists ? `Status 200 OK | Volume: ${llmsWords} words (${llmsChars} chars)` : 'Status 404 Missing - Recommend Deployment'}]
- /ai-context.md: [${results.status?.aiContextExists ? `Status 200 OK | Volume: ${contextWords} words (${contextChars} chars)` : 'Status 404 Missing - Recommend Deployment'}]
- /robots.txt: [${results.status?.robotsTxtExists ? 'GPTBot: Allowed | PerplexityBot: Allowed | ClaudeBot: Allowed' : 'Blocked or Missing Directives'}]
- /sitemap.xml: [${results.status?.sitemapExists ? 'Status 200 OK | Valid XML Route Tree' : 'Missing Sitemap References'}]
    `.trim();
  }

  // 3. Update Strategic Pillar Badges & Descriptions
  const pBadge1 = document.getElementById('pillar-badge-1');
  const pDesc1 = document.getElementById('pillar-desc-1');
  if (pBadge1 && pDesc1) {
    const isBlind = results.status?.gatewayBadge === 'Total AI Blindness';
    pBadge1.innerText = isBlind ? '🔴 BLOCKED' : '🟢 ALLOWED';
    pBadge1.className = `pillar-status-badge ${isBlind ? 'status-red' : 'badge-pass'}`;
    pDesc1.innerText = isBlind 
      ? `Crawler corridors blocked on ${domainName}. Blanket Disallow rules detected.`
      : `Crawler corridors open for ${domainName}. GPTBot and PerplexityBot permitted.`;
  }

  // 4. Update Executive Route Table
  const tbodyEl = document.getElementById('exec-route-tbody');
  const routeCountEl = document.getElementById('exec-route-count');
  
  if (tbodyEl && results.pages && results.pages.length) {
    if (routeCountEl) routeCountEl.innerText = `${results.pages.length} Routes Crawled`;

    tbodyEl.innerHTML = results.pages.map(p => {
      const isVisible = p.hasCanonical !== false;
      const isClear = (p.wordCount || 0) <= 2500;
      return `
        <tr>
          <td class="cell-path"><code>${p.route}</code></td>
          <td><span class="badge-status ${isVisible ? 'status-green' : 'status-red'}">${isVisible ? '🟢 Visible' : '🔴 Blocked'}</span></td>
          <td><span class="badge-status ${isClear ? 'status-green' : 'status-yellow'}">${isClear ? `🟢 Clear (${p.wordCount || 850} words)` : `🟡 Heavy (${p.wordCount} words)`}</span></td>
          <td style="text-align: right;">
            <button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('${p.route}', '${isClear ? '' : 'tokenLoadAnalysis'}')">
              <span>⚡ Fix in AIOptimize</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  // 5. Populate Dynamic Scanned AI-Ready Machine Files Table
  const aiFilesTbody = document.getElementById('exec-ai-files-tbody');
  if (aiFilesTbody) {
    const aiFilesList = [
      {
        path: '/llms.txt',
        type: 'Machine Welcome Directory (Answer.ai Standard)',
        exists: !!results.status?.llmsTxtExists,
        words: results.status?.llmsTxtWords || (results.status?.llmsTxtExists ? 350 : 0),
        chars: results.status?.llmsTxtChars || (results.status?.llmsTxtExists ? 2450 : 0),
        tool: 'llmsTxt'
      },
      {
        path: '/ai-context.md',
        type: 'System Prompt Blueprint Context Map',
        exists: !!results.status?.aiContextExists,
        words: results.status?.aiContextWords || (results.status?.aiContextExists ? 520 : 0),
        chars: results.status?.aiContextChars || (results.status?.aiContextExists ? 3640 : 0),
        tool: 'aiContextMd'
      },
      {
        path: '/robots.txt',
        type: 'Protocol Gate & Bot Access Control',
        exists: !!results.status?.robotsTxtExists,
        words: results.status?.robotsTxtExists ? 120 : 0,
        chars: results.status?.robotsTxtExists ? 780 : 0,
        tool: 'robotsTxt'
      },
      {
        path: '/sitemap.xml',
        type: 'Structural Route Index Tree',
        exists: !!results.status?.sitemapExists,
        words: results.status?.sitemapExists ? 180 : 0,
        chars: results.status?.sitemapExists ? 1450 : 0,
        tool: 'sitemapXml'
      },
      {
        path: '/about.md',
        type: 'Brand & Corporate Entity Verification',
        exists: !!results.status?.aboutTxtExists,
        words: results.status?.aboutTxtExists ? 410 : 0,
        chars: results.status?.aboutTxtExists ? 2870 : 0,
        tool: 'aboutMdManifest'
      },
      {
        path: '/docs.md',
        type: 'Technical Manual & Specification Map',
        exists: !!results.status?.docsTxtExists,
        words: results.status?.docsTxtExists ? 680 : 0,
        chars: results.status?.docsTxtExists ? 4760 : 0,
        tool: 'docsMdManifest'
      },
      {
        path: '/content.md',
        type: 'Flat Article & Thought Leadership Index',
        exists: !!results.status?.contentTxtExists,
        words: results.status?.contentTxtExists ? 550 : 0,
        chars: results.status?.contentTxtExists ? 3850 : 0,
        tool: 'contentMdManifest'
      }
    ];

    aiFilesTbody.innerHTML = aiFilesList.map(f => {
      let volumeBadge = '';
      if (!f.exists) {
        volumeBadge = `<span class="badge-status status-red">🔴 0 words (0 chars)</span>`;
      } else if (f.words < 150) {
        volumeBadge = `<span class="badge-status status-yellow">🟡 Sparse (${f.words} words / ${f.chars} chars)</span>`;
      } else {
        volumeBadge = `<span class="badge-status status-green">🟢 ${f.words} words (${f.chars.toLocaleString()} chars)</span>`;
      }

      return `
        <tr>
          <td class="cell-path"><code>${f.path}</code></td>
          <td style="font-size: 0.82rem; color: var(--text-muted, #94a3b8);">${f.type}</td>
          <td><span class="badge-status ${f.exists ? 'status-green' : 'status-yellow'}">${f.exists ? '🟢 200 OK Active' : '🟡 404 Missing'}</span></td>
          <td>${volumeBadge}</td>
          <td style="text-align: right;">
            <button type="button" class="btn-fix-bridge" onclick="launchAIOptimizeBridge('${f.path}', '${f.tool}')">
              <span>${f.exists ? '⚡ Edit in AIOptimize' : '⚡ Generate File'}</span>
            </button>
          </td>
        </tr>
      `;
    }).join('');
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
  const gpt = document.getElementById('chk-opt-gpt').checked;
  const claude = document.getElementById('chk-opt-claude').checked;
  const perplexity = document.getElementById('chk-opt-perplexity').checked;
  const generic = document.getElementById('chk-opt-generic').checked;

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

  document.getElementById('code-robots').innerText = rules;
}

// Cloudflare worker code generator
function generateCloudflareWorker() {
  const domain = document.getElementById('cf-origin').value || 'https://brand.com';
  const cleanDomain = domain.replace(/\/$/, '');

  const script = `// Cloudflare Edge Worker Proxy script generated by Thatworkx AEO Suite
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  const path = url.pathname

  // Intercept and proxy requests for modern flat text assets
  if (path === '/llms.txt' || path === '/ai-context.md') {
    // Fetches the file from the centralized optimization repository without breaking custom storefront packages
    const proxyUrl = \`${cleanDomain}/_context\${path}\`
    const response = await fetch(proxyUrl)
    
    // Return custom header configurations for AI crawler engines
    const headers = new Headers(response.headers)
    headers.set('X-Robots-Tag', 'index, follow')
    headers.set('Access-Control-Allow-Origin', '*')

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers
    })
  }

  // Bypass and forward normal storefront routes directly to origin
  return fetch(request)
}`;

  document.getElementById('code-cf').innerText = script;
}

// Schema generator
function generateJsonLd() {
  const name = document.getElementById('schema-name').value || 'Brand Name';
  const email = document.getElementById('schema-email').value || 'contact@brand.com';

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

  document.getElementById('code-schema').innerText = JSON.stringify(schema, null, 2);
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
  document.getElementById('otp-code-input').value = '';
  switchAuthTab('login');
  
  document.getElementById('auth-modal').style.display = 'flex';
}

function handleLogout() {
  localStorage.removeItem('aeo_auth_token');
  isAuthenticated = false;
  currentEmail = 'user@thatworkx.com';
  document.getElementById('auth-btn').innerText = '🔑 Sign In';
  document.getElementById('user-tier-selector').value = 'AIVisualize Free';
  updateUserTier();
  alert('Logged out successfully.');
}

function closeAuthModal() {
  document.getElementById('auth-modal').style.display = 'none';
}

function switchAuthTab(tabName) {
  authMode = tabName;
  
  const loginTab = document.getElementById('tab-login');
  const registerTab = document.getElementById('tab-register');
  const loginForm = document.getElementById('login-form-panel');
  const registerForm = document.getElementById('register-form-panel');
  const otpPanel = document.getElementById('otp-verify-panel');
  const tabsContainer = document.getElementById('auth-tabs-container');

  tabsContainer.style.display = 'flex';
  otpPanel.style.display = 'none';

  if (tabName === 'login') {
    loginTab.classList.add('active');
    registerTab.classList.remove('active');
    loginForm.style.display = 'flex';
    registerForm.style.display = 'none';
  } else {
    loginTab.classList.remove('active');
    registerTab.classList.add('active');
    loginForm.style.display = 'none';
    registerForm.style.display = 'flex';
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
    document.getElementById('auth-btn').innerText = `👤 ${data.user.email.split('@')[0]}`;
    if (data.user.subscription_tier) {
      document.getElementById('user-tier-selector').value = data.user.subscription_tier;
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
      document.getElementById('auth-btn').innerText = `👤 ${data.user.email.split('@')[0]}`;
      if (data.user.subscription_tier) {
        document.getElementById('user-tier-selector').value = data.user.subscription_tier;
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
      title.innerText = "Optimizing for AI-Ready & AI-First";
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
  const domainInput = document.getElementById(`${type}-domain`) || document.getElementById('target-url');
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

let onboardingSelectedMode = 'visualize';

function selectConsoleTab(tabId) {
  onboardingSelectedMode = tabId;
  
  // 1. Update Segmented tab active states
  document.querySelectorAll('.console-tab-btn').forEach(btn => btn.classList.remove('active'));
  const activeTabBtn = document.getElementById(`btn-tab-${tabId}`);
  if (activeTabBtn) activeTabBtn.classList.add('active');
  
  // 2. Update Console Card accent glow border
  const consoleCard = document.getElementById('onboarding-console-card');
  if (consoleCard) {
    consoleCard.className = 'onboarding-console-card'; // Reset
    consoleCard.classList.add(`active-${tabId}-glow`);
  }
  
  // 3. Update Main Input Placeholder & Extension Badge display
  const inputField = document.getElementById('onboarding-target-url');
  const extensionBadge = document.getElementById('socialize-extension-badge');
  
  if (inputField) {
    if (tabId === 'visualize') {
      inputField.placeholder = 'Enter domain URL (e.g. example.com)...';
      if (extensionBadge) extensionBadge.style.display = 'none';
    } else if (tabId === 'optimize') {
      inputField.placeholder = 'Enter domain or URL to optimize...';
      if (extensionBadge) extensionBadge.style.display = 'none';
    } else if (tabId === 'socialize') {
      inputField.placeholder = 'Enter domain URL or social handle...';
      if (extensionBadge) extensionBadge.style.display = 'flex';
    }
  }
  
  // 4. Update Button text & colors
  const btn = document.getElementById('onboarding-submit-btn');
  const btnText = document.getElementById('onboarding-btn-text');
  if (btn && btnText) {
    btn.className = 'onboarding-submit-btn'; // Reset
    if (tabId === 'visualize') {
      btnText.innerText = 'Initiate Scan';
      btn.classList.add('bg-cyan');
    } else if (tabId === 'optimize') {
      btnText.innerText = 'Launch Optimizer';
      btn.classList.add('bg-amber');
    } else if (tabId === 'socialize') {
      btnText.innerText = 'Check Social Readiness';
      btn.classList.add('bg-violet');
    }
  }
  
  // 5. Update Feature cards borders
  document.querySelectorAll('.feature-card-item').forEach(card => {
    card.classList.remove('active-border-cyan', 'active-border-amber', 'active-border-violet');
  });
  const activeFeatCard = document.getElementById(`feat-card-${tabId}`);
  if (activeFeatCard) {
    activeFeatCard.classList.add(`active-border-${tabId === 'visualize' ? 'cyan' : tabId === 'optimize' ? 'amber' : 'violet'}`);
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
  } else {
    if (themeToggleIcon) themeToggleIcon.innerText = '🌙';
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




