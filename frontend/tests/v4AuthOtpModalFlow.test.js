/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AEO V4 Cockpit - Email-based OTP Authentication Flow', () => {
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

  it('DOM Pre-rendering Gate: Email modal and OTP modal are statically pre-rendered in visualize.html', () => {
    // 1. Email Collection Modal
    const emailModal = document.getElementById('auth-email-modal');
    expect(emailModal).not.toBeNull();
    const emailInput = document.getElementById('auth-email-input');
    expect(emailInput).not.toBeNull();
    const emailSubmitBtn = document.getElementById('auth-email-submit-btn');
    expect(emailSubmitBtn).not.toBeNull();
    const emailError = document.getElementById('auth-email-error');
    expect(emailError).not.toBeNull();

    // 2. OTP Verification Modal
    const otpModal = document.getElementById('auth-otp-modal');
    expect(otpModal).not.toBeNull();
    const otpInput = document.getElementById('auth-otp-input');
    expect(otpInput).not.toBeNull();
    const otpVerifyBtn = document.getElementById('auth-otp-verify-btn');
    expect(otpVerifyBtn).not.toBeNull();
    const otpResendBtn = document.getElementById('auth-otp-resend-btn');
    expect(otpResendBtn).not.toBeNull();
    const otpError = document.getElementById('auth-otp-error');
    expect(otpError).not.toBeNull();
    const emailDisplay = document.getElementById('auth-otp-email-display');
    expect(emailDisplay).not.toBeNull();
  });

  it('Authentication Gate: Blocks executeCockpitScan when no session exists and opens Email Modal', async () => {
    const { executeCockpitScan, getAuthSession } = await import('../visualize.js');

    expect(getAuthSession()).toBeNull();

    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    // Trigger scan without session
    executeCockpitScan('https://thatworkx.com');

    // Must NOT call /api/scan
    const scanCalls = fetchSpy.mock.calls.filter(([url]) => url === '/api/scan');
    expect(scanCalls.length).toBe(0);

    // Email modal must be shown
    const emailModal = document.getElementById('auth-email-modal');
    expect(emailModal.classList.contains('hidden')).toBe(false);
    expect(emailModal.style.display).not.toBe('none');
  });

  it('OTP Request: Submitting email calls /api/auth/send-otp and opens OTP modal', async () => {
    const { submitAuthEmail } = await import('../visualize.js');
    expect(typeof submitAuthEmail).toBe('function');

    const emailInput = document.getElementById('auth-email-input');
    emailInput.value = 'test@thatworkx.com';

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, message: 'OTP sent' })
    });

    await submitAuthEmail();

    // Verify API call
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/auth/send-otp',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test@thatworkx.com' })
      })
    );

    // Email modal closed, OTP modal opened
    const emailModal = document.getElementById('auth-email-modal');
    const otpModal = document.getElementById('auth-otp-modal');
    const emailDisplay = document.getElementById('auth-otp-email-display');

    expect(emailModal.classList.contains('hidden')).toBe(true);
    expect(otpModal.classList.contains('hidden')).toBe(false);
    expect(emailDisplay.textContent).toContain('test@thatworkx.com');
  });

  it('OTP Verification: Valid OTP establishes session and triggers pending scan with verified email', async () => {
    const { submitAuthEmail, verifyAuthOtp, getAuthSession } = await import('../visualize.js');

    // 1. Stage pending scan & email
    const emailInput = document.getElementById('auth-email-input');
    emailInput.value = 'founder@thatworkx.com';

    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      }); // send-otp

    await submitAuthEmail('https://thatworkx.com');

    // 2. Mock verify-otp success & subsequent scan
    const fetchSpy = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, token: 'mock-jwt-token', email: 'founder@thatworkx.com' })
      }) // verify-otp
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          status: 'success',
          overallScore: 85,
          pages: []
        })
      }); // /api/scan

    const otpInput = document.getElementById('auth-otp-input');
    otpInput.value = '123456';

    await verifyAuthOtp();

    // Session verified in storage
    expect(getAuthSession()).toBe('founder@thatworkx.com');
    expect(localStorage.getItem('aeo_auth_email')).toBe('founder@thatworkx.com');

    // Scan dispatched with targetUrl AND verified email
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/scan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: 'https://thatworkx.com',
          email: 'founder@thatworkx.com'
        })
      })
    );

    // OTP Modal closed
    const otpModal = document.getElementById('auth-otp-modal');
    expect(otpModal.classList.contains('hidden')).toBe(true);
  });

  it('OTP Failure: Invalid OTP displays error and does NOT establish session or trigger scan', async () => {
    const { verifyAuthOtp, getAuthSession } = await import('../visualize.js');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({ error: 'Invalid or expired OTP code' })
    });

    const otpInput = document.getElementById('auth-otp-input');
    otpInput.value = '999999';

    await verifyAuthOtp();

    // Session must remain null
    expect(getAuthSession()).toBeNull();
    expect(localStorage.getItem('aeo_auth_email')).toBeNull();

    // No scan dispatched
    const scanCalls = fetchSpy.mock.calls.filter(([url]) => url === '/api/scan');
    expect(scanCalls.length).toBe(0);

    // Error message rendered in modal
    const otpError = document.getElementById('auth-otp-error');
    expect(otpError.textContent).toContain('Invalid or expired OTP code');
    expect(otpError.classList.contains('hidden')).toBe(false);
  });

  it('Session Persistence: Active session bypasses OTP modals on subsequent scans', async () => {
    const { executeCockpitScan, setAuthSession } = await import('../visualize.js');

    // Pre-populate active verified session
    setAuthSession('returning-user@thatworkx.com');

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'success',
        overallScore: 90,
        pages: []
      })
    });

    executeCockpitScan('https://thatworkx.com');

    // Directly dispatches to /api/scan with stored session email
    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/scan',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUrl: 'https://thatworkx.com',
          email: 'returning-user@thatworkx.com'
        })
      })
    );

    // Both modals stay hidden
    const emailModal = document.getElementById('auth-email-modal');
    const otpModal = document.getElementById('auth-otp-modal');
    expect(emailModal.classList.contains('hidden')).toBe(true);
    expect(otpModal.classList.contains('hidden')).toBe(true);
  });
});
