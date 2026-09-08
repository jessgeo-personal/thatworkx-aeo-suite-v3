/**
 * AEO Suite V3 - Capability Evaluator Test Harness Controller
 * Isolated verification for backend/services/capabilityEvaluator.js
 * Governance: Strict Dual-Pillar rules ("AI-Optimized" vs "AI-Ready"). Zero mock fallbacks.
 */

/**
 * Resets all canvas sections to clean initial placeholders.
 */
export function resetView() {
  const overallEl = document.getElementById('metric-overall-score');
  if (overallEl) overallEl.textContent = '--';

  ['p1', 'p2', 'p3', 'p4'].forEach((p) => {
    const el = document.getElementById(`metric-${p}-score`);
    if (el) el.textContent = '--';
  });

  const execContainer = document.getElementById('executive-inquiries-container');
  if (execContainer) {
    execContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No evaluation executed yet. Enter URL above and run probe.</div>';
  }

  const capContainer = document.getElementById('capability-matrix-container');
  if (capContainer) {
    capContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No capabilities evaluated yet.</div>';
  }

  const emailEl = document.getElementById('eeat-email-value');
  if (emailEl) emailEl.textContent = '--';

  const phoneEl = document.getElementById('eeat-phone-value');
  if (phoneEl) phoneEl.textContent = '--';

  const sslEl = document.getElementById('eeat-ssl-status');
  if (sslEl) sslEl.textContent = '--';

  const authEl = document.getElementById('eeat-authority-badge');
  if (authEl) authEl.textContent = '--';

  const contactEl = document.getElementById('eeat-contact-status');
  if (contactEl) contactEl.textContent = '--';

  const privacyEl = document.getElementById('eeat-privacy-status');
  if (privacyEl) privacyEl.textContent = '--';

  const ageEl = document.getElementById('eeat-domain-age');
  if (ageEl) ageEl.textContent = '--';

  const summaryEl = document.getElementById('eeat-diagnostic-summary');
  if (summaryEl) summaryEl.textContent = '--';

  const routesContainer = document.getElementById('evaluated-routes-container');
  if (routesContainer) {
    routesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic">No routes evaluated yet.</div>';
  }

  const stagesContainer = document.getElementById('stages-cards-container');
  if (stagesContainer) {
    stagesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No stages evaluated yet. Enter URL above and run probe.</div>';
  }

  const stagesDumpEl = document.getElementById('stages-json-dump');
  if (stagesDumpEl) stagesDumpEl.textContent = '--';

  const previewAiContext = document.getElementById('preview-ai-context');
  if (previewAiContext) previewAiContext.textContent = '--';

  const previewAbout = document.getElementById('preview-about');
  if (previewAbout) previewAbout.textContent = '--';

  const rawJsonEl = document.getElementById('raw-json-dump');
  if (rawJsonEl) rawJsonEl.textContent = '--';

  hideError();
}

/**
 * Sets button loading state.
 */
export function setLoading(isLoading) {
  const btn = document.getElementById('btn-run-evaluator');
  const spinner = document.getElementById('btn-spinner');
  const label = document.getElementById('btn-label');

  if (btn) btn.disabled = isLoading;
  if (spinner) {
    if (isLoading) spinner.classList.remove('hidden');
    else spinner.classList.add('hidden');
  }
  if (label) {
    label.textContent = isLoading ? 'Evaluating Capabilities...' : 'Run Capability Evaluator Probe';
  }
}

/**
 * Shows the error banner with error message.
 */
export function showError(message) {
  const banner = document.getElementById('evaluator-error-banner');
  const msgEl = document.getElementById('evaluator-error-message');
  if (msgEl) msgEl.textContent = message || 'An error occurred during capability evaluation probe.';
  if (banner) banner.classList.remove('hidden');
}

/**
 * Hides the error banner.
 */
export function hideError() {
  const banner = document.getElementById('evaluator-error-banner');
  if (banner) banner.classList.add('hidden');
}

/**
 * Helper to get status color badge class.
 */
function getStatusBadgeClass(status) {
  const s = String(status || '').toLowerCase();
  if (s === 'active' || s === 'good' || s === 'clean' || s === 'optimal') {
    return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  }
  if (s === 'warning' || s === 'moderate') {
    return 'bg-amber-950 text-amber-400 border border-amber-800';
  }
  return 'bg-red-950 text-red-400 border border-red-800';
}

/**
 * Helper to get stage status badge class.
 */
function getStageBadgeClass(status) {
  const s = String(status || '').toUpperCase();
  if (s === 'PASS' || s === 'OPTIMIZED' || s === 'ACTIVE') {
    return 'bg-emerald-950 text-emerald-400 border border-emerald-800';
  }
  if (s === 'WARN' || s === 'NEEDS IMPROVEMENT' || s === 'WARNING') {
    return 'bg-amber-950 text-amber-400 border border-amber-800';
  }
  return 'bg-red-950 text-red-400 border border-red-800';
}

/**
 * Helper to get score color class.
 */
function getScoreColorClass(score) {
  const num = Number(score) || 0;
  if (num >= 80) return 'text-emerald-400';
  if (num >= 50) return 'text-amber-400';
  return 'text-red-400';
}

/**
 * Renders complete evaluation output into discrete DOM components.
 */
export function renderEvaluatorData(responsePayload, targetUrlInput = '') {
  const evaluationData = responsePayload?.evaluationData || responsePayload?.evaluation || responsePayload?.data || responsePayload || {};
  const crawlData = responsePayload?.crawlData || responsePayload?.data || {};

  // 1. Pillar Scoreboard Banner
  const overallScore = evaluationData.overallScore ?? evaluationData.totalScore ?? 0;
  const pScores = evaluationData.pillarScores || evaluationData.sectionScores || {};

  const overallEl = document.getElementById('metric-overall-score');
  if (overallEl) overallEl.textContent = String(overallScore);

  const p1El = document.getElementById('metric-p1-score');
  if (p1El) p1El.textContent = String(pScores.P1 ?? pScores.section1 ?? 0);

  const p2El = document.getElementById('metric-p2-score');
  if (p2El) p2El.textContent = String(pScores.P2 ?? pScores.section2 ?? 0);

  const p3El = document.getElementById('metric-p3-score');
  if (p3El) p3El.textContent = String(pScores.P3 ?? pScores.section3 ?? 0);

  const p4El = document.getElementById('metric-p4-score');
  if (p4El) p4El.textContent = String(pScores.P4 ?? pScores.section4 ?? 0);

  // 1.5. Canonical 6-Stage Diagnostic Pipeline Scores
  const stagesContainer = document.getElementById('stages-cards-container');
  const stagesData = evaluationData.stages || crawlData.stages || {};
  const stageKeys = ['stage1', 'stage2', 'stage3', 'stage4', 'stage5', 'stage6'];
  const stageTitles = {
    stage1: 'Stage 1: Bot Blocks & Gateway',
    stage2: 'Stage 2: Essential Content Anchors',
    stage3: 'Stage 3: Content Availability & Density',
    stage4: 'Stage 4: Trust & E-E-A-T',
    stage5: 'Stage 5: Machine Manifest Protocols',
    stage6: 'Stage 6: Executive Boardroom & Action Triage'
  };

  if (stagesContainer) {
    const hasStages = stageKeys.some(k => stagesData[k]);
    if (!hasStages) {
      stagesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No canonical stages evaluated.</div>';
    } else {
      stagesContainer.innerHTML = stageKeys.map(k => {
        const stage = stagesData[k] || {};
        const title = stage.title ? `${k.toUpperCase().replace('STAGE', 'Stage ')}: ${stage.title}` : (stageTitles[k] || k);
        const score = stage.score || '0%';
        const status = stage.status || 'UNAUDITED';
        const summaryText = stage.summaryText || 'No diagnostic summary.';
        const classification = stage.classification || (k === 'stage5' ? 'AI-Ready' : (k === 'stage6' ? 'Executive Boardroom' : 'AI-Optimized'));
        const badgeClass = getStageBadgeClass(status);

        return `
          <div class="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col justify-between hover:border-cyan-700 transition" data-stage-key="${k}">
            <div>
              <div class="flex items-start justify-between gap-2 border-b border-gray-800 pb-2.5 mb-2.5">
                <div>
                  <span class="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider bg-gray-800 text-gray-400">${classification}</span>
                  <h4 class="text-sm font-bold text-white mt-1">${title}</h4>
                </div>
                <div class="text-right flex flex-col items-end">
                  <span class="text-lg font-extrabold text-cyan-400 font-mono">${score}</span>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded uppercase ${badgeClass}">${status}</span>
                </div>
              </div>
              <p class="text-xs text-gray-300 leading-relaxed font-sans">${summaryText}</p>
            </div>
            ${stage.missingRoutes && stage.missingRoutes.length > 0 ? `
              <div class="mt-3 pt-2 border-t border-gray-900 text-[11px] text-amber-300 font-mono truncate">
                Missing: ${stage.missingRoutes.join(', ')}
              </div>
            ` : ''}
          </div>
        `;
      }).join('');
    }
  }

  const stagesDumpEl = document.getElementById('stages-json-dump');
  if (stagesDumpEl) {
    stagesDumpEl.textContent = JSON.stringify(stagesData, null, 2);
  }

  // 2. Section 1: 4 Executive Inquiry Cards
  const execContainer = document.getElementById('executive-inquiries-container');
  if (execContainer) {
    const execSections = evaluationData.executiveSections || {};
    const sectionsList = [
      execSections.section1 || execSections[0],
      execSections.section2 || execSections[1],
      execSections.section3 || execSections[2],
      execSections.section4 || execSections[3]
    ].filter(Boolean);

    if (sectionsList.length === 0) {
      execContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No executive inquiry sections returned.</div>';
    } else {
      execContainer.innerHTML = sectionsList.map((sec, idx) => {
        const title = sec.title || `Inquiry ${idx + 1}`;
        const category = sec.category || `Section ${idx + 1}`;
        const score = sec.score ?? 0;
        const max = sec.max ?? 25;
        const status = sec.status || 'active';
        const deductions = Array.isArray(sec.deductions) ? sec.deductions : [];
        const deductionReason = sec.deductionReason || (score === max ? '🟢 No deductions — All protocols clean.' : 'Deductions applied.');
        const impact = sec.impact || 'Impact on domain visibility and AI crawler access.';

        return `
          <div class="bg-gray-950 border border-gray-800 rounded-xl p-5 space-y-4 hover:border-gray-700 transition" data-executive-section="${idx + 1}">
            <div class="flex items-start justify-between gap-3 border-b border-gray-800 pb-3">
              <div>
                <div class="text-[10px] text-cyan-400 font-bold uppercase tracking-wider">${category}</div>
                <h3 class="text-base font-bold text-white mt-0.5">${title}</h3>
              </div>
              <div class="text-right">
                <div class="text-lg font-extrabold ${getScoreColorClass(score * 4)}">${score}<span class="text-xs text-gray-500 font-mono">/${max}</span></div>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded uppercase ${getStatusBadgeClass(status)}">
                  ${status}
                </span>
              </div>
            </div>

            <!-- Deductions List -->
            <div class="space-y-1.5 text-xs">
              <div class="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">Deductions Audit:</div>
              ${deductions.length > 0 ? `
                <ul class="space-y-1 pl-1">
                  ${deductions.map(d => `<li class="text-amber-300 flex items-start gap-1.5"><span>•</span><span>${d}</span></li>`).join('')}
                </ul>
              ` : `
                <div class="text-emerald-400 italic">${deductionReason}</div>
              `}
            </div>

            <!-- Impact Statement -->
            <div class="bg-gray-900/90 p-3 rounded border border-gray-800 text-xs text-gray-300">
              <div class="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">Business Impact:</div>
              <p class="leading-relaxed">${impact}</p>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 3. Section 2: 32-Capability Matrix Detailed Array
  const capContainer = document.getElementById('capability-matrix-container');
  const capBadge = document.getElementById('capability-count-badge');
  const capMatrix = Array.isArray(evaluationData.capabilityMatrix)
    ? evaluationData.capabilityMatrix
    : (Array.isArray(evaluationData.capabilities) ? evaluationData.capabilities : []);

  if (capBadge) capBadge.textContent = `${capMatrix.length} Capabilities`;

  if (capContainer) {
    if (capMatrix.length === 0) {
      capContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic col-span-full">No capability matrix entries evaluated.</div>';
    } else {
      capContainer.innerHTML = capMatrix.map((cap, idx) => {
        const id = cap.id || `cap_${idx + 1}`;
        const name = cap.name || cap.title || `Capability ${idx + 1}`;
        const category = cap.category || cap.sectionName || 'General';
        const score = cap.score ?? 0;
        const status = cap.status || 'active';
        const details = cap.details || 'Evaluated successfully.';
        const deductionReason = cap.deductionReason || (score === 100 ? '🟢 No deductions — All protocols clean.' : 'Deductions applied.');
        const impact = cap.impact || 'Affects domain visibility.';
        const recommendation = cap.recommendation || 'Remediate capability configuration.';

        return `
          <div class="bg-gray-950 border border-gray-800 rounded-xl p-4 space-y-3 hover:border-gray-700 transition" data-capability-id="${id}">
            <!-- Header -->
            <div class="flex items-start justify-between gap-2 border-b border-gray-800 pb-2.5">
              <div>
                <div class="flex items-center gap-2">
                  <span class="text-[10px] text-cyan-400 font-mono font-bold bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-900">${id}</span>
                  <span class="text-[10px] text-gray-400 uppercase font-semibold">${category}</span>
                </div>
                <h4 class="text-sm font-bold text-white mt-1">${name}</h4>
              </div>
              <div class="text-right flex flex-col items-end gap-1">
                <span class="text-base font-extrabold ${getScoreColorClass(score)}">${score}<span class="text-[10px] text-gray-500 font-mono">/100</span></span>
                <span class="text-[9px] font-bold px-2 py-0.5 rounded uppercase ${getStatusBadgeClass(status)}">
                  ${status}
                </span>
              </div>
            </div>

            <!-- Details & Deduction -->
            <div class="text-xs space-y-1.5">
              <div>
                <span class="text-gray-400 font-semibold">Evaluation:</span>
                <span class="text-gray-200 ml-1">${details}</span>
              </div>
              <div>
                <span class="text-gray-400 font-semibold">Deduction Reason:</span>
                <span class="${score === 100 ? 'text-emerald-400' : 'text-amber-300'} ml-1">${deductionReason}</span>
              </div>
            </div>

            <!-- Technical Impact & Recommendation -->
            <div class="bg-gray-900/80 p-2.5 rounded border border-gray-800 space-y-1.5 text-xs">
              <div>
                <span class="text-[10px] text-gray-400 font-bold uppercase block">Technical Impact:</span>
                <p class="text-gray-300 text-[11px] leading-relaxed">${impact}</p>
              </div>
              <div>
                <span class="text-[10px] text-cyan-400 font-bold uppercase block">Actionable Recommendation:</span>
                <p class="text-cyan-200 text-[11px] leading-relaxed">${recommendation}</p>
              </div>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 4. Section 3: E-E-A-T & Entity Trust Grid
  const eeat = evaluationData.eeatMetrics || crawlData?.eeatMetrics || {};
  const emailVal = evaluationData.emailValue || crawlData?.emailValue || 'None Detected';
  const phoneVal = evaluationData.phoneValue || crawlData?.phoneValue || 'None Detected';

  const emailEl = document.getElementById('eeat-email-value');
  if (emailEl) emailEl.textContent = emailVal;

  const phoneEl = document.getElementById('eeat-phone-value');
  if (phoneEl) phoneEl.textContent = phoneVal;

  const sslEl = document.getElementById('eeat-ssl-status');
  if (sslEl) {
    const isSecure = Boolean(eeat.isSecure);
    sslEl.textContent = isSecure ? 'ENABLED (HTTPS)' : 'INSECURE (HTTP)';
    sslEl.className = isSecure ? 'text-sm font-bold text-emerald-400 mt-1' : 'text-sm font-bold text-red-400 mt-1';
  }

  const authEl = document.getElementById('eeat-authority-badge');
  if (authEl) {
    authEl.textContent = eeat.authorityStatus || 'Unrated';
    authEl.className = 'text-sm font-bold text-cyan-400 mt-1';
  }

  const contactEl = document.getElementById('eeat-contact-status');
  if (contactEl) {
    const hasContact = Boolean(eeat.hasContactInfo);
    contactEl.textContent = hasContact ? 'YES (Verified)' : 'MISSING';
    contactEl.className = hasContact ? 'text-xs font-mono font-bold text-emerald-400' : 'text-xs font-mono font-bold text-amber-400';
  }

  const privacyEl = document.getElementById('eeat-privacy-status');
  if (privacyEl) {
    const hasPrivacy = Boolean(eeat.hasPrivacyPolicy);
    privacyEl.textContent = hasPrivacy ? 'YES (Linked)' : 'MISSING';
    privacyEl.className = hasPrivacy ? 'text-xs font-mono font-bold text-emerald-400' : 'text-xs font-mono font-bold text-amber-400';
  }

  const ageEl = document.getElementById('eeat-domain-age');
  if (ageEl) ageEl.textContent = eeat.ageEstimate || 'Pending WHOIS';

  const summaryEl = document.getElementById('eeat-diagnostic-summary');
  if (summaryEl) summaryEl.textContent = eeat.diagnosticSummary || 'No diagnostic summary generated.';

  // 5. Section 4: Evaluated Discovered Routes Array
  const routesContainer = document.getElementById('evaluated-routes-container');
  const routesBadge = document.getElementById('evaluated-routes-count');
  const routesList = Array.isArray(evaluationData.discoveredRoutes) ? evaluationData.discoveredRoutes : [];

  if (routesBadge) routesBadge.textContent = `${routesList.length} Routes`;

  if (routesContainer) {
    if (routesList.length === 0) {
      routesContainer.innerHTML = '<div class="text-gray-500 text-sm py-4 italic">No evaluated routes returned.</div>';
    } else {
      routesContainer.innerHTML = routesList.map((r, idx) => {
        const path = r.path || r.route || '/';
        const words = r.wordCount ?? 0;
        const tokens = r.tokenLoad ?? Math.round(words / 2);
        const inSitemap = Boolean(r.inSitemap);
        const canonical = Boolean(r.canonicalTag);
        const hierarchy = Boolean(r.headingHierarchy);
        const missingStatus = r.missingStatus || (words === 0 ? 'Missing' : 'Active');
        const isMissing = missingStatus.toLowerCase() === 'missing';

        return `
          <div class="bg-gray-950 border border-gray-800 rounded-lg p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-gray-700 transition" data-route-path="${path}">
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-xs bg-gray-800 text-gray-400 px-1.5 py-0.2 rounded font-mono">#${idx + 1}</span>
                <span class="font-mono text-sm font-bold text-white">${path}</span>
                <span class="text-[9px] px-1.5 py-0.2 rounded uppercase font-bold ${isMissing ? 'bg-red-950 text-red-400 border border-red-800' : 'bg-emerald-950 text-emerald-400 border border-emerald-800'}">
                  ${missingStatus}
                </span>
              </div>
              <div class="flex flex-wrap items-center gap-3 text-xs text-gray-400 font-mono pt-1">
                <span>Words: <strong class="text-white">${words.toLocaleString()}</strong></span>
                <span>Tokens: <strong class="text-cyan-400">${tokens.toLocaleString()}</strong></span>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2 text-[10px]">
              <span class="px-2 py-0.5 rounded border ${inSitemap ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800' : 'bg-gray-900 text-gray-500 border-gray-800'}">
                ${inSitemap ? 'In Sitemap' : 'No Sitemap'}
              </span>
              <span class="px-2 py-0.5 rounded border ${canonical ? 'bg-cyan-950/60 text-cyan-400 border-cyan-800' : 'bg-gray-900 text-gray-500 border-gray-800'}">
                ${canonical ? 'Canonical' : 'No Canonical'}
              </span>
              <span class="px-2 py-0.5 rounded border ${hierarchy ? 'bg-purple-950/60 text-purple-400 border-purple-800' : 'bg-gray-900 text-gray-500 border-gray-800'}">
                ${hierarchy ? 'Hierarchy Valid' : 'Invalid Hierarchy'}
              </span>
            </div>
          </div>
        `;
      }).join('');
    }
  }

  // 6. Section 5: Manifest Content Previews
  const manifests = evaluationData.manifestPreviews || crawlData?.manifestPreviews || {};
  const aiContextEl = document.getElementById('preview-ai-context');
  if (aiContextEl) aiContextEl.textContent = manifests.aiContext || 'No /ai-context.md preview available.';

  const aboutEl = document.getElementById('preview-about');
  if (aboutEl) aboutEl.textContent = manifests.about || 'No /about.md preview available.';

  // 7. Section 6: Raw JSON Inspection Drawer
  const rawDumpEl = document.getElementById('raw-json-dump');
  if (rawDumpEl) {
    rawDumpEl.textContent = JSON.stringify(responsePayload, null, 2);
  }
}

/**
 * Executes capability evaluation probe via POST /api/test/evaluator.
 */
export async function runEvaluatorProbe(targetUrl, maxPages = 25) {
  if (!targetUrl) return;

  hideError();
  setLoading(true);

  try {
    const response = await fetch('/api/test/evaluator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUrl, maxPages })
    });

    const responsePayload = await response.json().catch(() => ({
      success: false,
      error: `HTTP ${response.status} ${response.statusText}`
    }));

    if (!response.ok || !responsePayload.success) {
      const errorMsg = responsePayload.error || `Capability evaluator probe failed with status ${response.status}`;
      showError(errorMsg);
      if (responsePayload.evaluationData || responsePayload.data) {
        renderEvaluatorData(responsePayload, targetUrl);
      }
      return responsePayload;
    }

    renderEvaluatorData(responsePayload, targetUrl);
    return responsePayload;
  } catch (err) {
    showError(err.message || 'Network error executing capability evaluator probe.');
  } finally {
    setLoading(false);
  }
}

/**
 * Initializes listeners and query parameter checks.
 */
export function initEvaluatorHarness() {
  resetView();

  const runBtn = document.getElementById('btn-run-evaluator');
  const inputEl = document.getElementById('target-url-input');
  const dismissBtn = document.getElementById('btn-dismiss-error');

  if (runBtn && !runBtn.dataset.bound) {
    runBtn.addEventListener('click', () => {
      const url = inputEl ? inputEl.value.trim() : '';
      if (url) runEvaluatorProbe(url);
    });
    runBtn.dataset.bound = 'true';
  }

  if (inputEl && !inputEl.dataset.bound) {
    inputEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const url = inputEl.value.trim();
        if (url) runEvaluatorProbe(url);
      }
    });
    inputEl.dataset.bound = 'true';
  }

  if (dismissBtn && !dismissBtn.dataset.bound) {
    dismissBtn.addEventListener('click', hideError);
    dismissBtn.dataset.bound = 'true';
  }

  if (typeof window !== 'undefined' && window.location && window.location.search) {
    const params = new URLSearchParams(window.location.search);
    const urlParam = params.get('url');
    if (urlParam) {
      if (inputEl) inputEl.value = urlParam;
      runEvaluatorProbe(urlParam);
    }
  }
}

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    initEvaluatorHarness();
  });
}
