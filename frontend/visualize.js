export const STAGE_MATRIX = [
  {
    step: 1,
    shortTitle: "AI Bot Blocks",
    fullTitle: "AI Bot Blocks & Crawler Gateway Permissions",
    tooltip: "AI Bot block checks",
    scanMsg: "Scanning for blocks to AI Bots accessing your website (GPTBot, ClaudeBot, PerplexityBot, Googlebot...)",
    classification: "AI-Optimized",
    desc: "WAF rules, Cloudflare challenge detection, and User-Agent blocking verification across 20+ AI crawlers."
  },
  {
    step: 2,
    shortTitle: "Essential Content",
    fullTitle: "Identifiable Essential Pages & Core Anchors",
    tooltip: "AI Essential content checks",
    scanMsg: "Scanning for Identifiable Essential pages for AI (About, Contact, Pricing, Privacy, Terms)...",
    classification: "AI-Optimized",
    desc: "AI uses essential pages and core anchors to verify your company credentials like company identity(/about), direct contact details(/contact), privacy commitments(/privacy) and terms of service(/terms)."
  },
  {
    step: 3,
    shortTitle: "Content Availability",
    fullTitle: "Content Availability & Semantic Text Density",
    tooltip: "AI Bot Content Availability checks",
    scanMsg: "Scanning for Content Availability for AI-bots accessing your website and evaluating citation extractability...",
    classification: "AI-Optimized",
    desc: "Per-webpage AI Citation Audit, DOM text density, semantic heading structure, and information gain."
  },
  {
    step: 4,
    shortTitle: "Trust & Privacy",
    fullTitle: "Entity Authority, E-E-A-T & Privacy Indicators",
    tooltip: "AI Trust and Privacy checks",
    scanMsg: "Scanning for AI trust and privacy indicators (E-E-A-T footprint, Knowledge Graph grounding)...",
    classification: "AI-Optimized",
    desc: "Knowledge Graph entity grounding, author authority schemas, and organizational trustworthiness."
  },
  {
    step: 5,
    shortTitle: "AI-Ready Files",
    fullTitle: "Machine Manifest Protocol Explorer",
    tooltip: "AI-ready file checks",
    scanMsg: "Scanning for existing machine-readable AI-Ready files on your website (llms.txt, llms-full.txt, OpenAPI)...",
    classification: "AI-Ready",
    desc: "Machine endpoints, llms.txt manifest hierarchy, and machine ingestion schemas with AIOptimize context."
  },
  {
    step: 6,
    shortTitle: "Executive Summary",
    fullTitle: "Executive Summary & Action Triage",
    tooltip: "Executive summary and Action items",
    scanMsg: "Compiling Boardroom Summary & Action Triage across all 5 completed diagnostic modules...",
    classification: "Executive Boardroom",
    desc: "Overall Health Index Dial, Dual-Pillar Readiness Breakdown, and Top 5 Urgent Action Items."
  }
];

export const AUDIT_DATA = {
  domain: "https://thatworkx.com",
  timestamp: "Aug 20, 2026 • 11:30 AM IST",
  scanDuration: "3.8s",
  totalPages: 24,
  healthIndex: 78,
  statusLabel: "AI-Optimized",
  humanWebReadiness: 92,
  machineWebReadiness: 54
};

export const state = {
  isAudited: true,
  currentStep: 6,
  completedSteps: [1, 2, 3, 4, 5, 6],
  scanningStep: null,
  isSimulating: false,
  userNavigatedEarly: false,
  isSystemError: false,
  isResponsivePreview: false,
  isSidebarOpen: false,
  stage3VisibleCount: 5,
  simTimer: null
};

export function toggleSidebar(open) {
  const sidebar = document.getElementById('main-terminal-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  const btn = document.getElementById('btn-toggle-sidebar');
  state.isSidebarOpen = open;

  if (sidebar && backdrop) {
    if (open) {
      sidebar.classList.remove('-translate-x-full');
      backdrop.classList.remove('opacity-0', 'pointer-events-none');
      backdrop.classList.add('opacity-100', 'pointer-events-auto');
      if (btn) btn.classList.add('border-[#b7410e]', 'bg-[#b7410e]/20');
    } else {
      sidebar.classList.add('-translate-x-full');
      backdrop.classList.remove('opacity-100', 'pointer-events-auto');
      backdrop.classList.add('opacity-0', 'pointer-events-none');
      if (btn) btn.classList.remove('border-[#b7410e]', 'bg-[#b7410e]/20');
    }
  }
}

export function renderStepper() {
  const container = document.getElementById('desktop-stepper');
  if (!container) return;
  container.innerHTML = '';

  STAGE_MATRIX.forEach((stage, idx) => {
    const isCompleted = state.completedSteps.includes(stage.step);
    const isScanning = state.scanningStep === stage.step;
    const isCurrent = state.currentStep === stage.step;
    const isAccessible = isCompleted || isScanning;

    const btn = document.createElement('button');
    btn.title = `${stage.tooltip} (${stage.classification})`;
    btn.onclick = () => {
      if (isAccessible) {
        if (state.isSimulating && state.scanningStep && state.scanningStep !== 6) {
          state.userNavigatedEarly = true;
        }
        navigateToStep(stage.step);
      }
    };

    let btnClasses = "stepper-pill flex items-center px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-bold relative cursor-pointer ";
    if (isCurrent) {
      btnClasses += "is-active ";
      btnClasses += stage.step === 5 
        ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.6)] scale-105 " 
        : "bg-[#b7410e] text-white shadow-[0_0_20px_rgba(183,65,14,0.6)] scale-105 ";
    } else if (isScanning) {
      btnClasses += "is-scanning border-2 border-[#b7410e] text-[#d45d2a] bg-[#b7410e]/20 animate-copper-glow ";
    } else if (isCompleted) {
      btnClasses += "bg-[#1f1f1f] border border-[#3c4043] text-[#e8eaed] hover:border-[#b7410e]/60 hover:text-white ";
    } else {
      btnClasses += "opacity-35 cursor-not-allowed bg-[#121212] text-[#bdc1c6] border border-transparent ";
    }

    btn.className = btnClasses;
    btn.innerHTML = `
      <span class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black flex-shrink-0 ${isCurrent ? (stage.step === 5 ? 'bg-black text-indigo-300' : 'bg-black text-[#d45d2a]') : isCompleted ? 'bg-[#121212] text-[#38bdf8]' : 'bg-[#121212] text-[#bdc1c6]'}">
        ${isScanning ? '●' : stage.step}
      </span>
      <span class="stepper-label text-xs font-bold font-headline truncate">${stage.shortTitle}</span>
    `;
    container.appendChild(btn);

    if (idx < STAGE_MATRIX.length - 1) {
      const conduit = document.createElement('div');
      conduit.className = `w-2.5 sm:w-4 lg:w-5 h-0.5 flex-shrink-0 ${state.completedSteps.includes(stage.step + 1) ? 'bg-[#b7410e]/60' : 'bg-[#3c4043]'}`;
      container.appendChild(conduit);
    }
  });
}

export function navigateToStep(stepNum) {
  state.currentStep = stepNum;
  renderStepper();
  const canvas = document.getElementById('main-workspace-canvas');
  if (canvas) {
    canvas.scrollTo({ top: 0, behavior: 'instant' });
  }
}

export function appendLog(msg, type = 'info') {
  const stream = document.getElementById('sidebar-telemetry-stream');
  if (!stream) return;
  const now = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  let color = 'text-[#bdc1c6]';
  if (type === 'pass') color = 'text-[#10b981]';
  if (type === 'warn') color = 'text-[#f59e0b]';
  if (type === 'scan') color = 'text-[#d45d2a]';
  if (type === 'error') color = 'text-red-400';

  const entry = document.createElement('div');
  entry.className = `${color} leading-relaxed text-xs`;
  entry.innerHTML = `<span class="text-[#5f6368]">[${now}]</span> ${msg}`;
  stream.appendChild(entry);
  stream.scrollTop = stream.scrollHeight;
}

export function handleExport(format) {
  appendLog(`Export generated: AIVisualize Executive Audit Report [${format}]`, "scan");
  if (typeof window !== 'undefined' && window.alert) {
    window.alert(`AIVisualize Executive Audit Report exported as ${format}`);
  }
}

export function resetToUnauditedState() {
  state.isSimulating = false;
  state.isAudited = false;
  state.completedSteps = [];
  state.scanningStep = null;
  state.currentStep = 1;
  const durLabel = document.getElementById('scan-duration-label');
  if (durLabel) durLabel.innerText = "--";
  const pagesLabel = document.getElementById('total-pages-label');
  if (pagesLabel) pagesLabel.innerText = "--";
  renderStepper();
  appendLog("Workbench reset to unaudited empty state (-- / UNAUDITED). Ready for new scan.", "info");
}

export function toggleScanSimulation() {
  state.isSimulating = true;
  state.isAudited = true;
  state.completedSteps = [1, 2, 3, 4, 5, 6];
  state.currentStep = 6;
  const durLabel = document.getElementById('scan-duration-label');
  if (durLabel) durLabel.innerText = AUDIT_DATA.scanDuration;
  const pagesLabel = document.getElementById('total-pages-label');
  if (pagesLabel) pagesLabel.innerText = AUDIT_DATA.totalPages;
  renderStepper();
  appendLog("Full AEO diagnostic pipeline completed in 3.8s. Quota charged.", "pass");
}

if (typeof window !== 'undefined') {
  window.toggleSidebar = toggleSidebar;
  window.navigateToStep = navigateToStep;
  window.handleExport = handleExport;
  window.resetToUnauditedState = resetToUnauditedState;
  window.toggleScanSimulation = toggleScanSimulation;
  window.addEventListener('DOMContentLoaded', () => {
    renderStepper();
    appendLog("AIVisualize Diagnostic Cockpit V4 initialized.", "info");
  });
}
