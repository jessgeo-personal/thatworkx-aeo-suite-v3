// Current Client State
let activeProduct = 'visualize';
let activeOptimizeTool = 'robots';
let currentEmail = 'user@thatworkx.com'; // Default user session email

// Cooldown variables for Anti-Blocking Safe Mode
let cooldownActive = false;
let cooldownTimeRemaining = 0;
let cooldownInterval = null;

// Initialize page content
document.addEventListener('DOMContentLoaded', () => {
  generateRobotsTxt();
  generateCloudflareWorker();
  generateJsonLd();
  generateManifests();
  generateEdgeSnippets();
  checkAuthSession();
  
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

    // Trigger Anti-Blocking Cooldown Safe Mode
    startCooldown(60);

  } catch (error) {
    console.error('Connection failure during scan submission:', error);
    alert('Failed to connect to backend scan services.');
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
  
  const inputUrlVal = document.getElementById('target-url').value.trim();
  const cleanBaseUrl = inputUrlVal 
    ? (inputUrlVal.startsWith('http') ? inputUrlVal : `https://${inputUrlVal}`)
    : 'https://example.com';

  results.pages.forEach(p => {
    const row = document.createElement('tr');
    
    // Page paths with direct go to page and audit individual page buttons
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

    // Word Count with dynamic pill color coding
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

    // Canonical URL showing the actual URL or flag missing
    let canonicalHtml = '';
    if (p.hasCanonical && p.canonicalUrl) {
      canonicalHtml = `<code style="font-size: 0.8rem; word-break: break-all; color: var(--dark-300);">${p.canonicalUrl}</code>`;
    } else {
      canonicalHtml = `<span class="wc-pill wc-pill-red" style="font-weight: bold; padding: 4px 10px;">✗ Missing (Diluted)</span>`;
      row.style.background = 'rgba(239, 68, 68, 0.03)';
    }

    // Structure with tick/cross and hierarchy check
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
    const response = await fetch('/api/scan', {
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


