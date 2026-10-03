import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  verifyApiKeyAccess,
  _resetStore
} from '../../backend/services/apiCredentialService.js';

describe('AIOptimize API Credential Lifecycle & Security Governance', () => {
  beforeEach(() => {
    if (typeof _resetStore === 'function') {
      _resetStore();
    }
  });

  // Scenario 1: Key Generation & Formatting
  it('Scenario 1 (Key Generation & Formatting): generates an ak_live_ key with masking hint and binds allowed domains from subscription tier', () => {
    const user = {
      id: 'usr_pro_key_01',
      tier: 'PRO',
      domain: 'mybrand.com'
    };

    const record = generateApiKey(user, { name: 'Production Sync Key' });

    expect(record).toBeDefined();
    expect(record.keyId).toBeDefined();
    expect(typeof record.keyId).toBe('string');
    expect(record.name).toBe('Production Sync Key');
    expect(record.status).toBe('ACTIVE');
    expect(record.createdAt).toBeDefined();
    expect(record.apiKey).toMatch(/^ak_live_[a-f0-9]{32}$/);
    expect(record.keyHint).toMatch(/^ak_live_\.\.\.[a-f0-9]{4}$/);
    expect(record.apiKey.endsWith(record.keyHint.slice(-4))).toBe(true);
    expect(record.allowedDomains).toEqual(['mybrand.com']);
  });

  // Scenario 2: Key Masking & Listing
  it('Scenario 2 (Key Masking & Listing): returns user keys without ever exposing the raw apiKey secret in the list', () => {
    const user = {
      id: 'usr_pro_key_02',
      tier: 'PRO',
      domain: 'example.com'
    };

    const created = generateApiKey(user, { name: 'Audit Ingest Key' });
    const keys = listApiKeys(user.id);

    expect(Array.isArray(keys)).toBe(true);
    expect(keys.length).toBe(1);

    const listed = keys[0];
    expect(listed.keyId).toBe(created.keyId);
    expect(listed.name).toBe('Audit Ingest Key');
    expect(listed.status).toBe('ACTIVE');
    expect(listed.keyHint).toBe(created.keyHint);
    expect(listed.allowedDomains).toEqual(['example.com']);
    expect(listed.createdAt).toBeDefined();
    expect(listed.revokedAt).toBeNull();
    // Raw secret MUST NOT be exposed in list output
    expect(listed.apiKey).toBeUndefined();
  });

  // Scenario 3: Instant Revocation
  it('Scenario 3 (Instant Revocation): revoking a key updates status to REVOKED and immediately prevents authentication', () => {
    const user = {
      id: 'usr_pro_key_03',
      tier: 'PRO',
      domain: 'security-test.com'
    };

    const created = generateApiKey(user, { name: 'Temporary Deploy Key' });
    const revoked = revokeApiKey(user.id, created.keyId);

    expect(revoked.status).toBe('REVOKED');
    expect(revoked.revokedAt).toBeDefined();

    const authResult = verifyApiKeyAccess(created.apiKey, 'security-test.com');
    expect(authResult).toEqual({
      authenticated: false,
      errorCode: 'API_KEY_REVOKED',
      message: 'API key has been revoked.'
    });
  });

  // Scenario 4: Authentication & Domain Scoping (Pro Tier)
  it('Scenario 4 (Authentication & Domain Scoping - Pro Tier): authenticates target domain within scope and rejects out-of-scope domain with DOMAIN_FORBIDDEN_FOR_KEY', () => {
    const user = {
      id: 'usr_pro_key_04',
      tier: 'PRO',
      domain: 'mybrand.com'
    };

    const created = generateApiKey(user, { name: 'Pro Sync Key' });

    // Valid target domain
    const validResult = verifyApiKeyAccess(created.apiKey, 'mybrand.com');
    expect(validResult).toEqual({
      authenticated: true,
      allowed: true,
      allowHeadless: true,
      tier: 'PRO',
      domain: 'mybrand.com',
      scanMode: 'HEADLESS_ENABLED'
    });

    // Out-of-scope domain
    const forbiddenResult = verifyApiKeyAccess(created.apiKey, 'competitor.com');
    expect(forbiddenResult).toEqual({
      authenticated: false,
      allowed: false,
      errorCode: 'DOMAIN_FORBIDDEN_FOR_KEY',
      message: 'API key is not authorized for domain: competitor.com'
    });
  });

  // Scenario 5: Authentication & Multi-Domain Scoping (Enterprise Tier)
  it('Scenario 5 (Authentication & Multi-Domain Scoping - Enterprise Tier): grants access across all covered domains and rejects unlisted domains', () => {
    const user = {
      id: 'usr_ent_key_05',
      tier: 'ENTERPRISE',
      allowedDomains: ['domain-a.com', 'domain-b.com']
    };

    const created = generateApiKey(user, { name: 'Enterprise Fleet Key' });

    for (const d of ['domain-a.com', 'domain-b.com']) {
      const res = verifyApiKeyAccess(created.apiKey, d);
      expect(res.authenticated).toBe(true);
      expect(res.allowHeadless).toBe(true);
      expect(res.tier).toBe('ENTERPRISE');
      expect(res.domain).toBe(d);
      expect(res.scanMode).toBe('HEADLESS_ENABLED');
    }

    const forbidden = verifyApiKeyAccess(created.apiKey, 'unauthorized-domain.com');
    expect(forbidden.authenticated).toBe(false);
    expect(forbidden.allowed).toBe(false);
    expect(forbidden.errorCode).toBe('DOMAIN_FORBIDDEN_FOR_KEY');
    expect(forbidden.message).toBe('API key is not authorized for domain: unauthorized-domain.com');
  });

  // Scenario 6: Governance, Invalid Key & Zero-Fallback Gate
  it('Scenario 6 (Governance, Invalid Key & Zero-Fallback Gate): returns un-audited state and error for invalid or empty keys without mock data', () => {
    const invalidKeys = [null, undefined, '', 'invalid_format_key', 'ak_live_short'];

    for (const badKey of invalidKeys) {
      const res = verifyApiKeyAccess(badKey, 'sample.com');
      expect(res).toEqual({
        authenticated: false,
        allowed: false,
        state: 'UNAUDITED',
        displayValue: '--',
        errorCode: 'INVALID_API_KEY',
        canInitiateRescan: true
      });
      expect(res.mockData).toBeUndefined();
      expect(res.auditData).toBeUndefined();
    }
  });
});
