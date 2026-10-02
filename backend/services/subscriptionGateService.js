/**
 * Subscription Gate Service - AIOptimize Access & Headless Review Governance
 * Enforces tier gating: TRIAL (static only), PRO (domain-bound), ENTERPRISE (multi-domain)
 */

export function normalizeDomain(rawDomain) {
  if (!rawDomain || typeof rawDomain !== 'string') return null;
  let cleaned = rawDomain.trim().toLowerCase();
  cleaned = cleaned.replace(/^(https?:\/\/)?(www\.)?/i, '');
  cleaned = cleaned.split('/')[0].split('?')[0].split('#')[0].split(':')[0];
  const domainPattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
  return domainPattern.test(cleaned) ? cleaned : null;
}

export function evaluateOptimizeAccess(user = {}, targetDomain, options = {}) {
  const normalizedDomain = normalizeDomain(targetDomain);

  // Scenario 6: Governance & Zero-Fallback Gate for invalid/missing domain
  if (!normalizedDomain) {
    return {
      allowed: false,
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'INVALID_DOMAIN_INPUT',
      canInitiateRescan: true
    };
  }

  const tier = (user.tier || 'TRIAL').toUpperCase();
  const requestHeadless = Boolean(options.requestHeadless);

  // Scenario 1: Trial Tier Gate (Pre-purchase trial: headless access strictly OFF)
  if (tier === 'TRIAL') {
    return {
      allowed: true,
      allowHeadless: false,
      scanMode: 'STATIC_ONLY',
      tier: 'TRIAL',
      targetDomain: normalizedDomain,
      boundDomain: normalizedDomain,
      canInitiateRescan: true
    };
  }

  // Collect all subscribed Pro domains across potential user schema models
  const proDomains = new Set();
  if (user.domain) proDomains.add(normalizeDomain(user.domain));
  if (Array.isArray(user.proDomains)) {
    user.proDomains.forEach(d => {
      const nd = normalizeDomain(d);
      if (nd) proDomains.add(nd);
    });
  }
  if (Array.isArray(user.subscriptions)) {
    user.subscriptions.forEach(sub => {
      if (sub && (sub.tier || tier) === 'PRO' && sub.status !== 'cancelled' && sub.domain) {
        const nd = normalizeDomain(sub.domain);
        if (nd) proDomains.add(nd);
      }
    });
  }

  // Scenarios 2 & 3: Pro Tier Single-Domain Binding & Multi-Subscription Support
  if (tier === 'PRO') {
    if (proDomains.has(normalizedDomain)) {
      return {
        allowed: true,
        allowHeadless: true,
        scanMode: requestHeadless ? 'HEADLESS_ENABLED' : 'STATIC_ONLY',
        tier: 'PRO',
        targetDomain: normalizedDomain,
        boundDomain: normalizedDomain,
        canInitiateRescan: true
      };
    }

    return {
      allowed: false,
      allowHeadless: false,
      scanMode: 'STATIC_ONLY',
      errorCode: 'DOMAIN_SUBSCRIPTION_REQUIRED',
      message: `A valid Pro subscription is required for domain: ${normalizedDomain}`,
      canInitiateRescan: false
    };
  }

  // Scenario 4: Enterprise / Team Multi-Domain Tier
  if (tier === 'ENTERPRISE') {
    const allowedDomains = new Set();
    if (Array.isArray(user.allowedDomains)) {
      user.allowedDomains.forEach(d => {
        const nd = normalizeDomain(d);
        if (nd) allowedDomains.add(nd);
      });
    }

    const hasAccess = allowedDomains.has('*') || allowedDomains.has(normalizedDomain) || proDomains.has(normalizedDomain);

    if (hasAccess) {
      return {
        allowed: true,
        allowHeadless: true,
        scanMode: requestHeadless ? 'HEADLESS_ENABLED' : 'STATIC_ONLY',
        tier: 'ENTERPRISE',
        targetDomain: normalizedDomain,
        boundDomain: normalizedDomain,
        canInitiateRescan: true
      };
    }

    return {
      allowed: false,
      allowHeadless: false,
      scanMode: 'STATIC_ONLY',
      errorCode: 'DOMAIN_NOT_COVERED_BY_ENTERPRISE',
      message: `Domain ${normalizedDomain} is not covered under the current Enterprise plan.`,
      canInitiateRescan: false
    };
  }

  // Default fallback for unrecognized tiers
  return {
    allowed: false,
    state: 'UNAUDITED',
    displayValue: '--',
    errorCode: 'UNKNOWN_TIER',
    canInitiateRescan: false,
    message: `Unrecognized subscription tier: ${tier}`
  };
}

// Scenario 5: Enterprise Custom Plan / Contact Sales Flow
export function getEnterpriseInquiryPayload(inquiryData = {}) {
  return {
    status: 'CONTACT_SALES_REQUIRED',
    action: 'CONTACT_SALES',
    customPlanEligible: true
  };
}

export default {
  normalizeDomain,
  evaluateOptimizeAccess,
  getEnterpriseInquiryPayload
};
