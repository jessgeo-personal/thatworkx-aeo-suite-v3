/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Header User Session, Logout & Repositioned New Scan Button', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(__dirname, '../visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.documentElement.innerHTML = htmlContent;
    localStorage.clear();
    sessionStorage.clear();
    vi.restoreAllMocks();
  });

  it('Gate Check: Zero occurrences of banned term "AI-first"', () => {
    expect(htmlContent).not.toMatch(/ai-first/i);
  });

  it('DOM Cleanliness: "Scan" button is removed and "+ New Scan" is adjacent to target URL input', () => {
    // 1. Old Scan button must be removed
    const scanBtn = document.getElementById('cockpit-search-btn');
    expect(scanBtn).toBeNull();

    // 2. Target URL input must exist
    const urlInput = document.getElementById('target-url-input');
    expect(urlInput).not.toBeNull();

    // 3. "+ New Scan" button must exist and be next to URL input
    const newScanBtn = document.getElementById('new-scan-btn');
    expect(newScanBtn).not.toBeNull();

    // Verify DOM adjacency: nextElementSibling of input or sibling in parent container
    const isAdjacent =
      urlInput.nextElementSibling === newScanBtn ||
      newScanBtn.previousElementSibling === urlInput ||
      urlInput.parentElement.contains(newScanBtn);

    expect(isAdjacent).toBe(true);
  });

  it('DOM Structure: Header contains session email badge and logout button', () => {
    const sessionEmailBadge = document.getElementById('session-email-badge');
    expect(sessionEmailBadge).not.toBeNull();

    const logoutBtn = document.getElementById('auth-logout-btn');
    expect(logoutBtn).not.toBeNull();
    expect(logoutBtn.textContent).toMatch(/logout|sign out/i);
  });

  it('Session Synchronization: updateAuthSessionDisplay renders verified email in header badge', async () => {
    const { updateAuthSessionDisplay, setAuthSession } = await import('../visualize.js');
    expect(typeof updateAuthSessionDisplay).toBe('function');

    // Pre-populate verified email
    setAuthSession('founder@thatworkx.com');
    updateAuthSessionDisplay();

    const badge = document.getElementById('session-email-badge');
    expect(badge.textContent).toContain('founder@thatworkx.com');

    const container = document.getElementById('auth-session-container');
    if (container) {
      expect(container.classList.contains('hidden')).toBe(false);
    }
  });

  it('Logout Functionality: handleLogout clears session and resets header badge', async () => {
    const { handleLogout, setAuthSession, getAuthSession } = await import('../visualize.js');
    expect(typeof handleLogout).toBe('function');

    setAuthSession('founder@thatworkx.com');
    expect(getAuthSession()).toBe('founder@thatworkx.com');

    handleLogout();

    expect(getAuthSession()).toBeNull();
    expect(localStorage.getItem('aeo_auth_email')).toBeNull();
    expect(sessionStorage.getItem('aeo_auth_email')).toBeNull();

    const badge = document.getElementById('session-email-badge');
    expect(badge.textContent.trim()).toBe('Login');
  });

  it('Execution Parity: Clicking "+ New Scan" triggers scan for URL entered in input box', async () => {
    const { initCockpit, setAuthSession } = await import('../visualize.js');
    setAuthSession('test@thatworkx.com');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'success', overallScore: 80, pages: [] })
    });

    initCockpit();

    const urlInput = document.getElementById('target-url-input');
    const newScanBtn = document.getElementById('new-scan-btn');

    urlInput.value = 'https://thatworkx.com';
    newScanBtn.click();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/scan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: 'https://thatworkx.com',
          email: 'test@thatworkx.com'
        })
      })
    );
  });
});
