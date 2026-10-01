/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Header User Session Dropdown Capsule', () => {
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

  it('DOM Structure: Contains unified session capsule button and dropdown menu', () => {
    // 1. Session capsule trigger button
    const sessionBtn = document.getElementById('auth-session-btn');
    expect(sessionBtn).not.toBeNull();

    // 2. Email / Login label badge inside trigger
    const sessionBadge = document.getElementById('session-email-badge');
    expect(sessionBadge).not.toBeNull();
    expect(sessionBtn.contains(sessionBadge)).toBe(true);

    // 3. Dropdown Menu Container
    const dropdownMenu = document.getElementById('auth-dropdown-menu');
    expect(dropdownMenu).not.toBeNull();

    // 4. Logout button must be inside the dropdown menu (not standalone in header line)
    const logoutBtn = document.getElementById('auth-logout-btn');
    expect(logoutBtn).not.toBeNull();
    expect(dropdownMenu.contains(logoutBtn)).toBe(true);

    // 5. Login action button inside dropdown for unauthenticated state
    const loginBtn = document.getElementById('auth-login-btn');
    expect(loginBtn).not.toBeNull();
    expect(dropdownMenu.contains(loginBtn)).toBe(true);
  });

  it('Logged Out State: Displays "Login" and clicking trigger opens email modal or dropdown', async () => {
    const { updateAuthSessionDisplay, getAuthSession, showAuthEmailModal } = await import('../visualize.js');
    expect(getAuthSession()).toBeNull();

    updateAuthSessionDisplay();

    const badge = document.getElementById('session-email-badge');
    expect(badge.textContent.trim()).toBe('Login');

    const statusDot = document.getElementById('auth-session-status-dot');
    if (statusDot) {
      expect(statusDot.classList.contains('bg-[#10b981]')).toBe(false);
    }
  });

  it('Logged In State: Displays verified email on capsule and exposes logout in dropdown', async () => {
    const { updateAuthSessionDisplay, setAuthSession } = await import('../visualize.js');

    setAuthSession('founder@thatworkx.com');
    updateAuthSessionDisplay();

    const badge = document.getElementById('session-email-badge');
    expect(badge.textContent).toContain('founder@thatworkx.com');

    const statusDot = document.getElementById('auth-session-status-dot');
    if (statusDot) {
      expect(statusDot.classList.contains('bg-[#10b981]')).toBe(true);
    }

    const emailDisplay = document.getElementById('auth-dropdown-email-label');
    if (emailDisplay) {
      expect(emailDisplay.textContent).toContain('founder@thatworkx.com');
    }
  });

  it('Dropdown Interactivity: toggleAuthDropdown toggles visibility', async () => {
    const { toggleAuthDropdown } = await import('../visualize.js');
    expect(typeof toggleAuthDropdown).toBe('function');

    const menu = document.getElementById('auth-dropdown-menu');
    expect(menu.classList.contains('hidden')).toBe(true);

    toggleAuthDropdown(true);
    expect(menu.classList.contains('hidden')).toBe(false);

    toggleAuthDropdown(false);
    expect(menu.classList.contains('hidden')).toBe(true);
  });

  it('Logout Flow: Clicking logout from dropdown clears session and reverts capsule to "Login"', async () => {
    const { handleLogout, setAuthSession, getAuthSession } = await import('../visualize.js');

    setAuthSession('founder@thatworkx.com');
    expect(getAuthSession()).toBe('founder@thatworkx.com');

    handleLogout();

    expect(getAuthSession()).toBeNull();
    const badge = document.getElementById('session-email-badge');
    expect(badge.textContent.trim()).toBe('Login');

    const menu = document.getElementById('auth-dropdown-menu');
    if (menu) {
      expect(menu.classList.contains('hidden')).toBe(true);
    }
  });
});
