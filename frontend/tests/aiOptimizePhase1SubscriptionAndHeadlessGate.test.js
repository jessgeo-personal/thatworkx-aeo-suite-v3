import { describe, it, expect } from 'vitest';
import {
  evaluateOptimizeAccess,
  getEnterpriseInquiryPayload
} from '../../backend/services/subscriptionGateService.js';

describe('AIOptimize Subscription & Headless Browser Access Gate', () => {
  // Scenario 1: Trial Tier Gate
  it('Scenario 1 (Trial Tier Gate): TRIAL tier forces allowHeadless: false, scanMode: STATIC_ONLY, and allows evaluation without synthetic fallback', () => {
    const user = {
      id: 'usr_trial_01',
      tier: 'TRIAL'
    };
    const targetDomain = 'trial-domain.com';

    const result = evaluateOptimizeAccess(user, targetDomain, { requestHeadless: true });

    expect(result).toBeDefined();
    expect(result.allowed).toBe(true);
    expect(result.allowHeadless).toBe(false);
    expect(result.scanMode).toBe('STATIC_ONLY');
    expect(result.targetDomain).toBe('trial-domain.com');
  });

  // Scenario 2: Pro Tier Single-Domain Binding
  it('Scenario 2 (Pro Tier Single-Domain Binding): PRO subscription bound to domain allows headless access', () => {
    const user = {
      id: 'usr_pro_01',
      tier: 'PRO',
      subscriptions: [
        { domain: 'example.com', active: true }
      ]
    };

    const result = evaluateOptimizeAccess(user, 'example.com', { requestHeadless: true });

    expect(result).toBeDefined();
    expect(result.allowed).toBe(true);
    expect(result.allowHeadless).toBe(true);
    expect(result.scanMode).toBe('HEADLESS_ENABLED');
  });

  // Scenario 3: Pro Tier Multi-Subscription Support
  it('Scenario 3 (Pro Tier Multi-Subscription Support): grants headless access for subscribed domains and rejects unsubscribed third domain with DOMAIN_SUBSCRIPTION_REQUIRED', () => {
    const user = {
      id: 'usr_pro_multi',
      tier: 'PRO',
      subscriptions: [
        { domain: 'alpha.io', active: true },
        { domain: 'beta.io', active: true }
      ]
    };

    const alphaResult = evaluateOptimizeAccess(user, 'alpha.io', { requestHeadless: true });
    expect(alphaResult.allowed).toBe(true);
    expect(alphaResult.allowHeadless).toBe(true);
    expect(alphaResult.scanMode).toBe('HEADLESS_ENABLED');

    const betaResult = evaluateOptimizeAccess(user, 'beta.io', { requestHeadless: true });
    expect(betaResult.allowed).toBe(true);
    expect(betaResult.allowHeadless).toBe(true);
    expect(betaResult.scanMode).toBe('HEADLESS_ENABLED');

    const gammaResult = evaluateOptimizeAccess(user, 'gamma.io', { requestHeadless: true });
    expect(gammaResult.allowed).toBe(false);
    expect(gammaResult.allowHeadless).toBe(false);
    expect(gammaResult.errorCode).toBe('DOMAIN_SUBSCRIPTION_REQUIRED');
    expect(gammaResult.message).toBeDefined();
    expect(typeof gammaResult.message).toBe('string');
    expect(gammaResult.message.length).toBeGreaterThan(0);
  });

  // Scenario 4: Enterprise / Team Multi-Domain Subscription
  it('Scenario 4 (Enterprise / Team Multi-Domain Subscription): grants access and headless access across all covered domains', () => {
    const user = {
      id: 'usr_ent_01',
      tier: 'ENTERPRISE',
      allowedDomains: ['one.com', 'two.com', 'three.com'],
      active: true
    };

    for (const domain of ['one.com', 'two.com', 'three.com']) {
      const result = evaluateOptimizeAccess(user, domain, { requestHeadless: true });
      expect(result.allowed).toBe(true);
      expect(result.allowHeadless).toBe(true);
      expect(result.scanMode).toBe('HEADLESS_ENABLED');
    }
  });

  // Scenario 5: Enterprise Custom Plan / Contact Sales Flow
  it('Scenario 5 (Enterprise Custom Plan / Contact Sales Flow): returns contact sales payload with zero mock audit data', () => {
    const inquiry = {
      email: 'lead@enterprise.com',
      company: 'Enterprise Corp',
      requestedDomainsCount: 15
    };

    const payload = getEnterpriseInquiryPayload(inquiry);

    expect(payload).toEqual({
      status: 'CONTACT_SALES_REQUIRED',
      action: 'CONTACT_SALES',
      customPlanEligible: true
    });
    expect(payload.auditData).toBeUndefined();
    expect(payload.mockData).toBeUndefined();
  });

  // Scenario 6: Governance & Zero-Fallback Gate
  it('Scenario 6 (Governance & Zero-Fallback Gate): returns un-audited state and error when domain is missing or invalid without mock fallbacks', () => {
    const user = {
      id: 'usr_pro_01',
      tier: 'PRO',
      subscriptions: [{ domain: 'example.com', active: true }]
    };

    const invalidInputs = [null, undefined, '', '   ', 'not-a-valid-domain'];

    for (const invalidDomain of invalidInputs) {
      const result = evaluateOptimizeAccess(user, invalidDomain);

      expect(result).toEqual({
        allowed: false,
        state: 'UNAUDITED',
        displayValue: '--',
        errorCode: 'INVALID_DOMAIN_INPUT',
        canInitiateRescan: true
      });
    }
  });
});
