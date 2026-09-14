/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AI Optimize Pro Waitlist Modal & Pricing Contract', () => {
  let htmlContent;

  beforeEach(() => {
    const htmlPath = path.resolve(process.cwd(), 'frontend/visualize.html');
    htmlContent = fs.readFileSync(htmlPath, 'utf8');
    document.body.innerHTML = htmlContent;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  describe('Static Pre-rendering & Governance Gates (Gates 3 & 5)', () => {
    it('pre-renders static modal container in visualize.html with accessibility attributes', () => {
      const modal = document.getElementById('optimize-pro-modal');
      expect(modal).not.toBeNull();
      expect(modal.getAttribute('role')).toBe('dialog');
      expect(modal.getAttribute('aria-modal')).toBe('true');
      expect(modal.classList.contains('hidden')).toBe(true);
    });

    it('pre-renders updated Beta copy and excludes legacy crawler copy (Gate 5)', () => {
      const modal = document.getElementById('optimize-pro-modal');
      expect(modal).not.toBeNull();

      const subtitle = modal.querySelector('.modal-subtitle');
      expect(subtitle).not.toBeNull();

      // Assert new copy presence
      expect(subtitle.textContent).toMatch(/experience the ease in maintaining your web and brand presence for ai and llms/i);
      expect(subtitle.textContent).toMatch(/aioptimize pro is currently in beta/i);
      expect(subtitle.textContent).toMatch(/to experience the beta, provide us with your details to join our waitlist below/i);

      // Verify legacy copy is purged
      expect(subtitle.textContent).not.toMatch(/automated llm crawler synthesis/i);
    });

    it('styles submit button to resemble AIOptimize Pro CTAs across the site', () => {
      const submitBtn = document.getElementById('waitlist-submit-btn');
      expect(submitBtn).not.toBeNull();
      
      // Must adopt the site-wide AIOptimize Pro CTA classes
      expect(
        submitBtn.classList.contains('stage5-cta-btn') || 
        submitBtn.classList.contains('btn-ai-optimize-pro')
      ).toBe(true);
    });

    it('contains all 5 mandatory inputs: first name, last name, email, phone, country', () => {
      const modal = document.getElementById('optimize-pro-modal');
      expect(modal).not.toBeNull();

      expect(modal.querySelector('#waitlist-first-name')).not.toBeNull();
      expect(modal.querySelector('#waitlist-last-name')).not.toBeNull();
      expect(modal.querySelector('#waitlist-email')).not.toBeNull();
      expect(modal.querySelector('#waitlist-phone')).not.toBeNull();
      expect(modal.querySelector('#waitlist-country')).not.toBeNull();
      expect(modal.querySelector('#waitlist-submit-btn')).not.toBeNull();
    });

    it('strictly satisfies the Banned Terms Gate (zero occurrences of "AI-first")', () => {
      const modal = document.getElementById('optimize-pro-modal');
      expect(modal).not.toBeNull();
      expect(modal.innerHTML).not.toMatch(/ai-first/i);
    });
  });

  describe('Modal Interactivity & Submission Lifecycle', () => {
    it('toggles modal open and close states via controller triggers', async () => {
      const { initWaitlistModal, openWaitlistModal, closeWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const modal = document.getElementById('optimize-pro-modal');
      expect(modal.classList.contains('hidden')).toBe(true);

      openWaitlistModal();
      expect(modal.classList.contains('hidden')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('false');

      closeWaitlistModal();
      expect(modal.classList.contains('hidden')).toBe(true);
      expect(modal.getAttribute('aria-hidden')).toBe('true');
    });

    it('rejects incomplete submissions with visual inline error and prevents fetch', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const fetchSpy = vi.spyOn(global, 'fetch');
      const form = document.getElementById('waitlist-form');
      const errorBanner = document.getElementById('waitlist-form-error');

      // Attempt submit without populating fields
      form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(fetchSpy).not.toHaveBeenCalled();
      expect(errorBanner.classList.contains('hidden')).toBe(false);
      expect(errorBanner.textContent).toMatch(/all fields are required/i);
    });

    it('dispatches valid submissions to POST /api/waitlist and renders confirmation message', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 201,
        json: async () => ({
          success: true,
          message: 'Successfully registered for the AI Optimize Pro waitlist.'
        })
      });

      document.getElementById('waitlist-first-name').value = 'Alexander';
      document.getElementById('waitlist-last-name').value = 'Wright';
      document.getElementById('waitlist-email').value = 'a.wright@enterprise.com';
      document.getElementById('waitlist-phone').value = '+16505550143';
      document.getElementById('waitlist-country').value = 'United States';

      const form = document.getElementById('waitlist-form');
      const successBanner = document.getElementById('waitlist-form-success');

      await form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(global.fetch).toHaveBeenCalledWith('/api/waitlist', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: 'Alexander',
          lastName: 'Wright',
          email: 'a.wright@enterprise.com',
          phone: '+16505550143',
          country: 'United States',
          tier: 'AI Optimize Pro'
        })
      }));

      expect(successBanner.classList.contains('hidden')).toBe(false);
      expect(successBanner.textContent).toMatch(/successfully registered/i);
    });

    it('handles server failure without fallback dummy data (Gate 6 compliance)', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({
          success: false,
          error: 'Registration queue unavailable. Please retry.'
        })
      });

      document.getElementById('waitlist-first-name').value = 'Alexander';
      document.getElementById('waitlist-last-name').value = 'Wright';
      document.getElementById('waitlist-email').value = 'a.wright@enterprise.com';
      document.getElementById('waitlist-phone').value = '+16505550143';
      document.getElementById('waitlist-country').value = 'United States';

      const form = document.getElementById('waitlist-form');
      const errorBanner = document.getElementById('waitlist-form-error');

      await form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));

      expect(errorBanner.classList.contains('hidden')).toBe(false);
      expect(errorBanner.textContent).toMatch(/registration queue unavailable/i);
    });
  });

  describe('Global Delegation & Dynamic Button Triggers', () => {
    it('exposes openWaitlistModal and closeWaitlistModal to window object', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      expect(typeof window.openWaitlistModal).toBe('function');
      expect(typeof window.closeWaitlistModal).toBe('function');
    });

    it('opens modal when clicking dynamically added "Upgrade to AIOptimize" buttons via event delegation', async () => {
      const { initWaitlistModal } = await import('../waitlistModal.js');
      initWaitlistModal();

      const modal = document.getElementById('optimize-pro-modal');
      expect(modal.classList.contains('hidden')).toBe(true);

      // Simulate a button rendered dynamically after DOM load by Stage 5
      const dynamicBtn = document.createElement('button');
      dynamicBtn.id = 'stage5-upgrade-btn';
      dynamicBtn.className = 'stage5-cta-btn btn-upgrade';
      dynamicBtn.textContent = 'Upgrade to AIOptimize Pro';
      document.body.appendChild(dynamicBtn);

      dynamicBtn.click();

      expect(modal.classList.contains('hidden')).toBe(false);
      expect(modal.getAttribute('aria-hidden')).toBe('false');
    });
  });
});
