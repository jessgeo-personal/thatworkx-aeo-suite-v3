// Current Client State
let activeProduct = 'visualize';
let activeOptimizeTool = 'robots';
let currentEmail = 'user@thatworkx.com'; // Default user session email

// Initialize page content
document.addEventListener('DOMContentLoaded', () => {
  generateRobotsTxt();
  generateCloudflareWorker();
  generateJsonLd();
  generateManifests();
  generateEdgeSnippets();
  
  // Synchronize tier with backend
  updateUserTier();
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

// Optimize tool panels switcher
function switchOptimizeTool(toolName) {
  activeOptimizeTool = toolName;
  document.querySelectorAll('.control-menu-item').forEach(item => item.classList.remove('active'));
  document.getElementById(`menu-${toolName}`).classList.add('active');

  document.querySelectorAll('.optimize-tool-view').forEach(view => view.classList.remove('active'));
  document.getElementById(`opt-tool-${toolName}`).classList.add('active');
}

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
    const res = await fetch('/api/user/tier', {
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

  const urlInput = document.getElementById('target-url').value;
  const isHeadless = document.getElementById('headless-checkbox').checked;

  const btnText = document.getElementById('btn-text');
  const btnLoader = document.getElementById('btn-loader');
  const submitBtn = document.getElementById('submit-btn');

  // Loading state
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';
  submitBtn.disabled = true;

  try {
    const response = await fetch('/api/scan', {
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

  } catch (error) {
    console.error('Connection failure during scan submission:', error);
    alert('Failed to connect to backend scan services.');
  } finally {
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
  }
}

// Display analysis parameters on the dashboard
function displayScanResults(results) {
  document.getElementById('scan-placeholder').style.display = 'none';
  document.getElementById('scan-results').style.display = 'grid';

  // Overall Score
  document.getElementById('overall-score').innerText = results.scoreCard.overallScore;
  const classBadge = document.getElementById('classification-badge');
  classBadge.innerText = results.scoreCard.classification.toUpperCase();
  classBadge.className = `badge-${results.scoreCard.classification.toLowerCase()}`;

  document.getElementById('crawled-pages-text').innerText = `Crawled ${results.pageDepthCrawled} of ${results.totalPagesFound} discovered paths`;

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
  updateChecklistStatus('chk-llmstxt', results.status.llmsTxtExists);
  updateChecklistStatus('chk-aicontext', results.status.aiContextExists);
  updateChecklistStatus('chk-sitemap', results.status.sitemapExists);
  updateChecklistStatus('chk-heading', results.status.hasProperHierarchy);
  updateChecklistStatus('chk-title', results.status.seoOptimalTitle);

  // Alerts
  const alertsContainer = document.getElementById('alerts-container');
  alertsContainer.innerHTML = '';
  
  if (results.alerts.length === 0) {
    alertsContainer.innerHTML = '<div class="alert-empty">No critical firewall or gateway warnings. Your crawler corridors are clear.</div>';
  } else {
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

  // Populate scanned paths list table
  const tbody = document.getElementById('scanned-routes-tbody');
  tbody.innerHTML = '';
  results.pages.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><code>${p.route}</code></td>
      <td>${p.wordCount} words</td>
      <td>${p.hasCanonical ? '✓ Active' : '✗ Missing'}</td>
      <td>${p.headingAudit.h1} H1 / ${p.headingAudit.h2} H2</td>
    `;
    tbody.appendChild(row);
  });
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
  document.getElementById('modal-title').innerText = code.replace(/_/g, ' ');
  document.getElementById('modal-message').innerText = message;
  document.getElementById('alert-modal').style.display = 'flex';
  
  // Set target selection element to highlight targetTier if provided
  if (targetTier) {
    document.getElementById('user-tier-selector').value = targetTier;
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
    const res1 = await fetch('/api/generator/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ domainName: domain, targetType: 'llms' })
    });
    const d1 = await res1.json();
    if (d1.code) document.getElementById('code-llmstxt').innerText = d1.code;

    const res2 = await fetch('/api/generator/build', {
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

