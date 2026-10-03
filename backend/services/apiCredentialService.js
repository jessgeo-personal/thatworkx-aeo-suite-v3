import crypto from 'crypto';
import { normalizeDomain } from './subscriptionGateService.js';

// In-memory credential store (keyed by keyId and apiKey hash/lookup)
const credentialsStore = new Map();

/**
 * Generate a new API credential with domain scoping derived from the user's subscription
 */
export function generateApiKey(user = {}, options = {}) {
  const userId = user.id || user.userId || 'anonymous';
  const tier = (user.tier || 'TRIAL').toUpperCase();

  // 32-character hex token with ak_live_ prefix
  const rawHex = crypto.randomBytes(16).toString('hex');
  const apiKey = `ak_live_${rawHex}`;
  const keyId = `key_${crypto.randomBytes(8).toString('hex')}`;
  const keyHint = `ak_live_...${rawHex.slice(-4)}`;

  // Determine allowed domains based on user profile and active subscriptions
  const domainSet = new Set();
  if (user.domain) {
    const nd = normalizeDomain(user.domain);
    if (nd) domainSet.add(nd);
  }
  if (Array.isArray(user.proDomains)) {
    user.proDomains.forEach(d => {
      const nd = normalizeDomain(d);
      if (nd) domainSet.add(nd);
    });
  }
  if (Array.isArray(user.allowedDomains)) {
    user.allowedDomains.forEach(d => {
      const nd = normalizeDomain(d);
      if (nd) domainSet.add(nd);
    });
  }
  if (Array.isArray(user.subscriptions)) {
    user.subscriptions.forEach(sub => {
      if (sub && sub.status !== 'cancelled' && sub.domain) {
        const nd = normalizeDomain(sub.domain);
        if (nd) domainSet.add(nd);
      }
    });
  }

  const allowedDomains = Array.from(domainSet);
  const createdAt = new Date().toISOString();

  const record = {
    keyId,
    apiKey,
    keyHint,
    userId,
    name: options.name || 'Default API Key',
    tier,
    allowedDomains,
    status: 'ACTIVE',
    createdAt,
    revokedAt: null
  };

  credentialsStore.set(keyId, record);
  credentialsStore.set(apiKey, record);

  return {
    keyId,
    apiKey,
    keyHint,
    status: 'ACTIVE',
    createdAt,
    name: record.name,
    allowedDomains
  };
}

/**
 * List all API credentials owned by a user without exposing raw secrets
 */
export function listApiKeys(userId) {
  if (!userId) return [];
  const results = [];
  const seenKeyIds = new Set();

  for (const record of credentialsStore.values()) {
    if (record.userId === userId && !seenKeyIds.has(record.keyId)) {
      seenKeyIds.add(record.keyId);
      results.push({
        keyId: record.keyId,
        keyHint: record.keyHint,
        status: record.status,
        name: record.name,
        createdAt: record.createdAt,
        revokedAt: record.revokedAt,
        allowedDomains: [...record.allowedDomains]
      });
    }
  }

  return results;
}

/**
 * Instantly revoke an API credential by keyId
 */
export function revokeApiKey(userId, keyId) {
  if (!keyId) {
    return { success: false, errorCode: 'INVALID_KEY_ID' };
  }

  const record = credentialsStore.get(keyId);
  if (!record || (userId && record.userId !== userId)) {
    return { success: false, errorCode: 'KEY_NOT_FOUND', message: 'API key not found.' };
  }

  record.status = 'REVOKED';
  record.revokedAt = new Date().toISOString();

  return {
    success: true,
    keyId: record.keyId,
    status: 'REVOKED',
    revokedAt: record.revokedAt
  };
}

/**
 * Authenticate incoming API request and verify domain scoping
 */
export function verifyApiKeyAccess(rawKey, targetDomain) {
  // Scenario 6: Governance & Zero-Fallback Gate for invalid or missing keys
  if (!rawKey || typeof rawKey !== 'string' || !/^ak_live_[a-f0-9]{32}$/i.test(rawKey)) {
    return {
      authenticated: false,
      allowed: false,
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'INVALID_API_KEY',
      canInitiateRescan: true
    };
  }

  const record = credentialsStore.get(rawKey);
  if (!record) {
    return {
      authenticated: false,
      allowed: false,
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'INVALID_API_KEY',
      canInitiateRescan: true
    };
  }

  // Scenario 3: Revocation Check
  if (record.status === 'REVOKED') {
    return {
      authenticated: false,
      errorCode: 'API_KEY_REVOKED',
      message: 'API key has been revoked.'
    };
  }

  // Domain Normalization & Validation
  const normalizedTarget = normalizeDomain(targetDomain);
  if (!normalizedTarget) {
    return {
      authenticated: false,
      allowed: false,
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'INVALID_DOMAIN_INPUT',
      canInitiateRescan: true
    };
  }

  // Scenarios 4 & 5: Domain Scoping check
  const isCovered =
    record.allowedDomains.includes('*') ||
    record.allowedDomains.includes(normalizedTarget);

  if (!isCovered) {
    return {
      authenticated: false,
      allowed: false,
      errorCode: 'DOMAIN_FORBIDDEN_FOR_KEY',
      message: `API key is not authorized for domain: ${normalizedTarget}`
    };
  }

  // Authorized return payload
  const isHeadlessEligible = record.tier === 'PRO' || record.tier === 'ENTERPRISE';

  return {
    authenticated: true,
    allowed: true,
    allowHeadless: isHeadlessEligible,
    tier: record.tier,
    domain: normalizedTarget,
    scanMode: isHeadlessEligible ? 'HEADLESS_ENABLED' : 'STATIC_ONLY'
  };
}

/**
 * Testing helpers to reset credential store between test suites
 */
export function _resetCredentialStore() {
  credentialsStore.clear();
}

export const _resetStore = _resetCredentialStore;

export default {
  generateApiKey,
  listApiKeys,
  revokeApiKey,
  verifyApiKeyAccess,
  _resetCredentialStore,
  _resetStore
};
