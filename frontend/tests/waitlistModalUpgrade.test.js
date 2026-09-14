/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AI Optimize Pro Waitlist Modal - Field Upgrades Contract', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(process.cwd(), 'frontend/visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    document.body.innerHTML = '';
    localStorage.clear();
    vi.restoreAllMocks();
  });

  describe('Country Field: Searchable Dropdown & UAE Default (from AuthModal/LeadFormModal)', () => {
    it('initializes country selection with "United Arab Emirates" as default', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const countryInput = document.getElementById('waitlist-country');
      expect(countryInput).not.toBeNull();
      expect(countryInput.value).toBe('United Arab Emirates');
    });

    it('renders custom searchable dropdown container and filters countries on input', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const countryInput = document.getElementById('waitlist-country');
      const dropdownMenu = document.getElementById('waitlist-country-dropdown');
      
      expect(dropdownMenu).not.toBeNull();
      expect(dropdownMenu.classList.contains('hidden')).toBe(true);

      // Focus / type triggers dropdown open
      countryInput.focus();
      countryInput.dispatchEvent(new Event('focus'));
      expect(dropdownMenu.classList.contains('hidden')).toBe(false);

      // Type search term
      countryInput.value = 'Can';
      countryInput.dispatchEvent(new Event('input'));

      const visibleOptions = dropdownMenu.querySelectorAll('.country-option:not(.hidden)');
      expect(visibleOptions.length).toBeGreaterThan(0);
      const texts = Array.from(visibleOptions).map(el => el.textContent.trim());
      expect(texts.some(t => t.includes('Canada'))).toBe(true);
      expect(texts.some(t => t.includes('France'))).toBe(false);
    });

    it('closes country dropdown when clicking outside (click-outside detection)', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const countryInput = document.getElementById('waitlist-country');
      const dropdownMenu = document.getElementById('waitlist-country-dropdown');

      countryInput.dispatchEvent(new Event('focus'));
      expect(dropdownMenu.classList.contains('hidden')).toBe(false);

      // Click outside
      document.body.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      expect(dropdownMenu.classList.contains('hidden')).toBe(true);
    });
  });

  describe('Email Field: Regex Validation & Session Prefill', () => {
    it('prefills email field automatically if user session exists in localStorage', async () => {
      localStorage.setItem('aeo_user_session', JSON.stringify({ email: 'founder@enterprise.ae' }));

      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const emailInput = document.getElementById('waitlist-email');
      expect(emailInput.value).toBe('founder@enterprise.ae');
    });

    it('rejects improperly formatted email with explicit validation error matching LeadFormModal', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const fetchSpy = vi.spyOn(global, 'fetch');
      document.getElementById('waitlist-first-name').value = 'Sarah';
      document.getElementById('waitlist-last-name').value = 'Connor';
      document.getElementById('waitlist-email').value = 'invalid-email-no-at-sign';
      document.getElementById('waitlist-phone').value = '+971 50 123 4567';
      document.getElementById('waitlist-country').value = 'United Arab Emirates';

      const form = document.getElementById('waitlist-form');
      const errorBanner = document.getElementById('waitlist-form-error');

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(errorBanner.classList.contains('hidden')).toBe(false);
      expect(errorBanner.textContent).toMatch(/valid email address/i);
    });
  });

  describe('Phone Field: International Format Validation', () => {
    it('rejects non-numeric invalid phone strings', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const fetchSpy = vi.spyOn(global, 'fetch');
      document.getElementById('waitlist-first-name').value = 'Sarah';
      document.getElementById('waitlist-last-name').value = 'Connor';
      document.getElementById('waitlist-email').value = 'sarah@skynet.com';
      document.getElementById('waitlist-phone').value = 'phone-not-a-number';
      document.getElementById('waitlist-country').value = 'United Arab Emirates';

      const form = document.getElementById('waitlist-form');
      const errorBanner = document.getElementById('waitlist-form-error');

      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(errorBanner.classList.contains('hidden')).toBe(false);
      expect(errorBanner.textContent).toMatch(/valid phone number/i);
    });

    it('accepts international phone formats (+971 50 123 4567) and submits payload', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({ success: true, message: 'Waitlist confirmed.' })
      });

      document.getElementById('waitlist-first-name').value = 'Tariq';
      document.getElementById('waitlist-last-name').value = 'Mansoor';
      document.getElementById('waitlist-email').value = 'tariq@dubaiholding.ae';
      document.getElementById('waitlist-phone').value = '+971 50 123 4567';
      document.getElementById('waitlist-country').value = 'United Arab Emirates';

      const form = document.getElementById('waitlist-form');
      await form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(global.fetch).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          firstName: 'Tariq',
          lastName: 'Mansoor',
          email: 'tariq@dubaiholding.ae',
          phone: '+971 50 123 4567',
          country: 'United Arab Emirates',
          tier: 'AI Optimize Pro'
        })
      }));
    });
  });
});
