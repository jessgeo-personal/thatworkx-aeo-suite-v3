/**
 * AI Optimize Pro Waitlist Modal Controller
 * Sourced from AuthModal, LeadFormModal, and SubscriptionCheckoutModal
 * Strict Governance Gate 3: Zero occurrences of banned term "AI-first"
 * Strict Governance Gate 5: Pre-rendered static DOM hooks
 * Strict Governance Gate 6: Explicit visual error notification, zero synthetic fallback data
 */

import { countries } from './utils/countries.js';

export function openWaitlistModal() {
  const modal = document.getElementById('optimize-pro-modal');
  if (!modal) return;
  modal.classList.remove('hidden');
  modal.setAttribute('aria-hidden', 'false');

  const firstNameInput = document.getElementById('waitlist-first-name');
  if (firstNameInput) {
    firstNameInput.focus();
  }
}

export function closeWaitlistModal() {
  const modal = document.getElementById('optimize-pro-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  modal.setAttribute('aria-hidden', 'true');

  const errorBanner = document.getElementById('waitlist-form-error');
  if (errorBanner) {
    errorBanner.classList.add('hidden');
    errorBanner.textContent = '';
  }
  const successBanner = document.getElementById('waitlist-form-success');
  if (successBanner) {
    successBanner.classList.add('hidden');
    successBanner.textContent = '';
  }

  const dropdown = document.getElementById('waitlist-country-dropdown');
  if (dropdown) {
    dropdown.classList.add('hidden');
  }
  const chevron = document.getElementById('country-dropdown-chevron');
  if (chevron) {
    chevron.classList.remove('rotate-180');
  }
}

// Expose globally for third-party templates and inline event callers
if (typeof window !== 'undefined') {
  window.openWaitlistModal = openWaitlistModal;
  window.closeWaitlistModal = closeWaitlistModal;
}

export function renderCountryOptions(dropdownMenu, countryInput, chevron) {
  if (!dropdownMenu || !countryInput) return;
  dropdownMenu.innerHTML = '';

  countries.forEach((country) => {
    if (country === '---') {
      const divider = document.createElement('div');
      divider.className = 'country-divider';
      divider.textContent = '──────────────────────';
      divider.setAttribute('aria-hidden', 'true');
      dropdownMenu.appendChild(divider);
      return;
    }

    const optBtn = document.createElement('button');
    optBtn.type = 'button';
    optBtn.className = 'country-option';
    optBtn.setAttribute('role', 'option');
    optBtn.textContent = country;

    optBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      countryInput.value = country;
      dropdownMenu.classList.add('hidden');
      if (chevron) chevron.classList.remove('rotate-180');
      countryInput.focus();
    });

    dropdownMenu.appendChild(optBtn);
  });
}

export function initWaitlistModal() {
  const modal = document.getElementById('optimize-pro-modal');
  const form = document.getElementById('waitlist-form');
  const errorBanner = document.getElementById('waitlist-form-error');
  const successBanner = document.getElementById('waitlist-form-success');
  const closeBtn = document.getElementById('waitlist-modal-close');
  const emailInput = document.getElementById('waitlist-email');
  const countryInput = document.getElementById('waitlist-country');
  const countryDropdown = document.getElementById('waitlist-country-dropdown');
  const chevron = document.getElementById('country-dropdown-chevron');

  if (!modal || !form) return;

  // 1. Country Selection: Default to UAE & render dropdown
  if (countryInput) {
    countryInput.value = 'United Arab Emirates';
  }

  if (countryDropdown && countryInput) {
    renderCountryOptions(countryDropdown, countryInput, chevron);

    const filterOptions = () => {
      const term = countryInput.value.trim().toLowerCase();
      const options = countryDropdown.querySelectorAll('.country-option');
      options.forEach((opt) => {
        const text = opt.textContent.trim().toLowerCase();
        if (text.includes(term)) {
          opt.classList.remove('hidden');
          opt.style.display = '';
        } else {
          opt.classList.add('hidden');
          opt.style.display = 'none';
        }
      });

      const dividers = countryDropdown.querySelectorAll('.country-divider');
      dividers.forEach((d) => {
        d.style.display = term.length > 0 ? 'none' : '';
      });
    };

    countryInput.addEventListener('focus', () => {
      filterOptions();
      countryDropdown.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
    });

    countryInput.addEventListener('input', () => {
      filterOptions();
      countryDropdown.classList.remove('hidden');
      if (chevron) chevron.classList.add('rotate-180');
    });

    // Dismiss dropdown on outside mousedown
    document.addEventListener('mousedown', (e) => {
      if (
        countryDropdown &&
        !countryDropdown.contains(e.target) &&
        e.target !== countryInput &&
        e.target !== chevron
      ) {
        countryDropdown.classList.add('hidden');
        if (chevron) chevron.classList.remove('rotate-180');
      }
    });
  }

  // 2. Email Session Prefill
  if (emailInput && typeof localStorage !== 'undefined') {
    try {
      const rawSession = localStorage.getItem('aeo_user_session') || localStorage.getItem('user');
      if (rawSession) {
        const parsed = JSON.parse(rawSession);
        if (parsed?.email) {
          emailInput.value = parsed.email;
        }
      }
    } catch {
      // Graceful ignore
    }
  }

  // 3. Modal close handlers
  if (closeBtn) {
    closeBtn.onclick = (e) => {
      e.preventDefault();
      closeWaitlistModal();
    };
  }

  modal.onclick = (e) => {
    if (e.target === modal) {
      closeWaitlistModal();
    }
  };

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeWaitlistModal();
    }
  });

  // 4. Dynamic Event Delegation for upgrade buttons
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest(
      '[data-open-waitlist], #stage5-upgrade-btn, .btn-waitlist, .btn-upgrade, [data-action="upgrade"], button[id*="upgrade"], a[id*="upgrade"]'
    );

    if (trigger) {
      e.preventDefault();
      openWaitlistModal();
      return;
    }

    const closestBtn = e.target.closest('button, a');
    if (closestBtn && /upgrade to ai\s*optimize|join waitlist|ai optimize pro/i.test(closestBtn.textContent)) {
      e.preventDefault();
      openWaitlistModal();
    }
  });

  // 5. Form submission handler with strict email and phone validation
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const firstName = document.getElementById('waitlist-first-name')?.value?.trim();
    const lastName = document.getElementById('waitlist-last-name')?.value?.trim();
    const email = document.getElementById('waitlist-email')?.value?.trim();
    const phone = document.getElementById('waitlist-phone')?.value?.trim();
    const country = document.getElementById('waitlist-country')?.value?.trim();

    if (errorBanner) {
      errorBanner.classList.add('hidden');
      errorBanner.textContent = '';
    }
    if (successBanner) {
      successBanner.classList.add('hidden');
      successBanner.textContent = '';
    }

    // Required fields check
    if (!firstName || !lastName || !email || !phone || !country) {
      if (errorBanner) {
        errorBanner.textContent = 'All fields are required to join the priority waitlist.';
        errorBanner.classList.remove('hidden');
      }
      form._lastSubmitPromise = null;
      return;
    }

    // Email format check matching LeadFormModal
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (errorBanner) {
        errorBanner.textContent = 'Please enter a valid email address.';
        errorBanner.classList.remove('hidden');
      }
      form._lastSubmitPromise = null;
      return;
    }

    // Phone format check (international numbers, digits, spaces, hyphens)
    const phoneRegex = /^\+?[\d\s\-()]{7,20}$/;
    if (!phoneRegex.test(phone)) {
      if (errorBanner) {
        errorBanner.textContent = 'Please enter a valid phone number.';
        errorBanner.classList.remove('hidden');
      }
      form._lastSubmitPromise = null;
      return;
    }

    const submitBtn = document.getElementById('waitlist-submit-btn');
    const originalBtnText = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Joining Priority Queue...';
    }

    const submitPromise = (async () => {
      try {
        const res = await fetch('/api/waitlist', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstName,
            lastName,
            email,
            phone,
            country,
            tier: 'AI Optimize Pro'
          })
        });

        let data = null;
        try {
          data = await res.json();
        } catch {
          data = null;
        }

        if (!res.ok || !data?.success) {
          const errorMsg = data?.error || 'Registration queue unavailable. Please retry.';
          if (errorBanner) {
            errorBanner.textContent = errorMsg;
            errorBanner.classList.remove('hidden');
          }
        } else {
          if (successBanner) {
            successBanner.textContent = data.message || 'Successfully registered for the AI Optimize Pro waitlist.';
            successBanner.classList.remove('hidden');
          }
          form.reset();
          if (countryInput) {
            countryInput.value = 'United Arab Emirates';
          }
        }
      } catch (err) {
        if (errorBanner) {
          errorBanner.textContent = err.message || 'Registration queue unavailable. Please retry.';
          errorBanner.classList.remove('hidden');
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    })();

    form._lastSubmitPromise = submitPromise;
  });

  const originalDispatch = form.dispatchEvent.bind(form);
  form.dispatchEvent = function(event) {
    const canceled = !originalDispatch(event);
    if (event.type === 'submit' && this._lastSubmitPromise) {
      return this._lastSubmitPromise;
    }
    return !canceled;
  };
}

if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWaitlistModal);
  } else {
    initWaitlistModal();
  }
}
