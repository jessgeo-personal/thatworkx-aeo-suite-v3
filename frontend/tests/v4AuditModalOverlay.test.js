/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('Audit Progress Modal Overlay & New Scan Flow Suite', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <input id="target-url-input" type="text" value="https://thatworkx.com" />
      <button id="cockpit-search-btn">Scan</button>
      <button id="rescan-btn">Rescan</button>
      <div id="cockpit-error-banner" class="hidden">
        <span id="cockpit-error-message"></span>
      </div>
      <div id="desktop-stepper"></div>
      <div id="canvas-stage-badge"></div>
      <div id="canvas-governance-badge"></div>
      <h1 id="canvas-stage-title"></h1>
      <p id="canvas-stage-desc"></p>
      <div id="canvas-score-pill"><span id="canvas-score-value"></span><span id="canvas-score-status"></span></div>
      <div id="canvas-body"></div>

      <!-- Modal Markup -->
      <div id="audit-progress-modal" class="hidden opacity-0 pointer-events-none" style="display: none;">
        <span id="modal-stage-counter"></span>
        <h3 id="modal-stage-title"></h3>
        <p id="modal-stage-desc"></p>
        <div id="modal-progress-bar" style="width: 0%;"></div>
        <div id="modal-live-log"></div>
        <span id="modal-target-display"></span>
      </div>
    `;

    vi.stubGlobal('fetch', vi.fn());
    vi.stubGlobal('prompt', vi.fn());
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('Modal Visibility: showAuditModal removes hidden, sets display flex, and un-mutes opacity', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());
    const modal = document.getElementById('audit-progress-modal');

    mod.showAuditModal('https://microsoft.com');

    expect(modal.classList.contains('hidden')).toBe(false);
    expect(modal.style.display).toBe('flex');
    expect(modal.classList.contains('opacity-100')).toBe(true);
    expect(document.getElementById('modal-target-display').innerText).toBe('https://microsoft.com');

    // Ticks stage progression
    vi.advanceTimersByTime(700);
    expect(document.getElementById('modal-stage-counter').innerText).toContain('STAGE 2');

    mod.hideAuditModal();
    vi.advanceTimersByTime(350);
    expect(modal.style.display).toBe('none');
  });

  it('Live Search Trigger: entering URL and clicking Scan executes scan with modal', async () => {
    const mod = await import('../visualize.js?t=' + Date.now());
    mod.initCockpit();

    const input = document.getElementById('target-url-input');
    const searchBtn = document.getElementById('cockpit-search-btn');
    input.value = 'https://apple.com';

    fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ targetUrl: 'https://apple.com', overallScore: 90, pages: [] })
    });

    searchBtn.click();

    const modal = document.getElementById('audit-progress-modal');
    expect(modal.style.display).toBe('flex');
    expect(document.getElementById('modal-target-display').innerText).toBe('https://apple.com');
    expect(fetch).toHaveBeenCalledWith('/api/scan', expect.objectContaining({
      method: 'POST',
      body: JSON.stringify({ targetUrl: 'https://apple.com', email: '' })
    }));
  });
});