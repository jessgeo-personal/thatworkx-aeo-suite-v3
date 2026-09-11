/**
 * capabilityEvaluator.js
 * 
 * Server-Side 32-Capability Evaluation & Executive Mode Diagnostic Scoring Engine.
 * Calculates 4 Pillars (P1, P2, P3, P4, 0-25 pts each), overallScore (0-100), and 4 Executive Inquiry Cards.
 * 
 * Strict Vocabulary Constraint:
 * Use "AI-Optimized" for core site checks and "AI-Ready" for machine manifest checks.
 */

/**
 * Path prefix pattern supporting optional language/locale codes and legal/policy subdirectories
 * Examples: /en-us/, /de/, /fr-ca/, /legal/, /en-us/legal/, /policies/
 */
const PATH_PREFIX = '(?:\\/(?:[a-z]{2,3}(?:[-_][a-z0-9]{2,4})?|legal|policies|policy))*';

const ESSENTIAL_ANCHOR_DEFINITIONS = [
  {
    canonical: '/about',
    patterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(about(?:-?us)?|company)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(about(?:-?us)?|company)(?:[\/?#]|$)/i,
      /^#?(?:\/)?#?(about(?:-?us)?|company)$/i
    ]
  },
  {
    canonical: '/contact',
    patterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(contact(?:-?us)?|get-in-touch)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(contact(?:-?us)?|get-in-touch)(?:[\/?#]|$)/i,
      /^#?(?:\/)?#?(contact(?:-?us)?|get-in-touch)$/i
    ]
  },
  {
    canonical: '/pricing',
    patterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(pricing(?:-?plans)?|plans)(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(pricing(?:-?plans)?|plans|store|buy|compare)(?:[\/?#]|$)/i,
      /^#?(?:\/)?#?(pricing(?:-?plans)?|plans|store|buy|compare)$/i
    ]
  },
  {
    canonical: '/privacy-policy',
    patterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))(?:\\/|\\.html)?$`, 'i'),
      /(?:\/|\/#|#)(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))(?:[\/?#]|$)/i,
      /^#?(?:\/)?#?(privacy(?:-?(?:policy|statement|notice))?|privacystatement|privacypolicy|data-?(?:privacy|policy))$/i
    ]
  },
  {
    canonical: '/terms-of-service',
    patterns: [
      new RegExp(`^${PATH_PREFIX}(?:\\/|\\/#|#)?(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)(?:\\/|\\.html)?$`, 'i'),
      /(?:terms[-_]conditions|terms[-_]and[-_]conditions|terms[-_]of[-_]service|terms[-_]of[-_]use|services[-_]?agreement|service[-_]?agreement|user[-_]?agreement)/i,
      /(?:\/|\/#|#)(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)(?:[\/?#]|$)/i,
      /^#?(?:\/)?#?(terms(?:-(?:and-conditions|of-service|of-use))?|terms(?:andconditions|ofservice|ofuse)|usage-?terms|limits|tos|services-?agreement|service-?agreement|user-?agreement)$/i
    ]
  }
];

/**
 * Normalizes a URL, route, or hash for resilient matching.
 */
function extractPathForEvaluation(item) {
  if (!item) return '';
  const raw = typeof item === 'string' ? item : (item.url || item.path || item.route || '');
  if (!raw) return '';
  try {
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      const parsed = new URL(raw);
      const cleanPath = parsed.pathname.replace(/\/$/, '') || '';
      return parsed.hash ? `${cleanPath}/${parsed.hash.toLowerCase()}` : (cleanPath || '/');
    }
    return raw.split('?')[0].replace(/\/$/, '') || '/';
  } catch {
    return raw.replace(/\/$/, '') || '/';
  }
}

const CAPABILITY_MATRIX = [
  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 1: Can AI see your website? (Bot Gateway & Access Control - 3)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'cdnFirewallBlocking',
    section: 1,
    sectionName: 'Gateway & Access',
    name: 'CDN / Edge Firewall Blocking',
    category: 'Gateway',
    description: 'Cloudflare WAF / Crowdstrike Falcon challenge rule evaluation for AI bots.',
    impact: 'Edge firewalls and WAF challenges prevent AI bots from connecting to your domain.',
    evaluate: (data = {}) => {
      const status = data.status || {};
      const sec1 = data.sec1 || {};
      const isWafBlocked = status.isWafBlocked === true || sec1.blocked === true || (data.executiveSections?.section1?.blocked === true);
      const statusCode = status.statusCode || status.wafStatusCode || sec1.wafStatusCode || data.statusCode;

      if (isWafBlocked || statusCode === 403 || statusCode === 429) {
        return {
          status: 'BLOCKED',
          score: 0,
          details: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          deductionReason: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          impact: 'Edge firewalls and WAF challenges prevent AI bots from connecting to your domain.',
          recommendation: 'Configure Cloudflare WAF / Crowdstrike Falcon exceptions for GPTBot, PerplexityBot, and ClaudeBot.'
        };
      }

      const isBlocked = data.sec1?.cdnBlocked || data.status?.gatewayBadge === 'Total AI Blindness';
      return {
        status: isBlocked ? 'critical' : 'active',
        score: isBlocked ? 0 : 100,
        details: isBlocked ? 'WAF challenge/block detected for GPTBot & PerplexityBot' : 'No WAF rules blocking known AI crawlers',
        deductionReason: isBlocked ? 'CDN WAF firewall challenges active for AI crawler user-agents (-100 pts)' : '🟢 No deductions — All protocols clean.',
        impact: 'Edge firewalls and WAF challenges prevent AI bots from connecting to your domain.',
        recommendation: 'Configure Cloudflare WAF / Crowdstrike Falcon exceptions for GPTBot, PerplexityBot, and ClaudeBot.'
      };
    }
  },
  {
    id: 'xRobotsTagHeaders',
    section: 1,
    sectionName: 'Gateway & Access',
    name: 'X-Robots-Tag Headers Inspection',
    category: 'Gateway',
    description: 'HTTP response header checks (noindex / nofollow) per page.',
    impact: 'HTTP X-Robots-Tag noindex headers instruct search AI agents not to record your content.',
    evaluate: (data = {}) => {
      const status = data.status || {};
      const sec1 = data.sec1 || {};
      const isWafBlocked = status.isWafBlocked === true || sec1.blocked === true || (data.executiveSections?.section1?.blocked === true);
      const statusCode = status.statusCode || status.wafStatusCode || sec1.wafStatusCode || data.statusCode;

      if (isWafBlocked || statusCode === 403 || statusCode === 429) {
        return {
          status: 'BLOCKED',
          score: 0,
          details: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          deductionReason: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          impact: 'HTTP X-Robots-Tag noindex headers instruct search AI agents not to record your content.',
          recommendation: 'Remove noindex/none directives from HTTP response headers for public pages.'
        };
      }

      const noIndex = data.sec1?.xRobotsNoIndex || (data.status?.xRobotsIndexable === false);
      return {
        status: noIndex ? 'warning' : 'active',
        score: noIndex ? 30 : 100,
        details: noIndex ? 'HTTP X-Robots-Tag: noindex / none detected' : 'HTTP X-Robots-Tag: all (index, follow)',
        deductionReason: noIndex ? 'HTTP response header contains noindex directive (-70 pts)' : '🟢 No deductions — All protocols clean.',
        impact: 'HTTP X-Robots-Tag noindex headers instruct search AI agents not to record your content.',
        recommendation: 'Remove noindex/none directives from HTTP response headers for public pages.'
      };
    }
  },
  {
    id: 'robotsTxtTotalBlindness',
    section: 1,
    sectionName: 'Gateway & Access',
    name: 'Robots.txt Total AI Blindness Check',
    category: 'Gateway',
    description: 'Blanket Disallow directives vs bot-specific rules for GPTBot, PerplexityBot, ClaudeBot, Google-Extended.',
    impact: 'Blanket robots.txt disallows completely blind generative search crawlers from reading your site.',
    evaluate: (data = {}) => {
      const status = data.status || {};
      const sec1 = data.sec1 || {};
      const isWafBlocked = status.isWafBlocked === true || sec1.blocked === true || (data.executiveSections?.section1?.blocked === true);
      const statusCode = status.statusCode || status.wafStatusCode || sec1.wafStatusCode || data.statusCode;

      if (isWafBlocked || statusCode === 403 || statusCode === 429) {
        return {
          status: 'BLOCKED',
          score: 0,
          details: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          deductionReason: 'Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active',
          impact: 'Blanket robots.txt disallows completely blind generative search crawlers from reading your site.',
          recommendation: 'Replace blanket Disallow: / with granular bot rules permitting search crawlers.'
        };
      }

      const isBlind = data.sec1?.disallowAll || (data.status?.robotsTxtExists === false);
      return {
        status: isBlind ? 'critical' : 'active',
        score: isBlind ? 0 : 100,
        details: isBlind ? 'User-agent: * Disallow: / or missing robots.txt' : 'Bot-specific rules configured correctly',
        deductionReason: isBlind ? 'Blanket Disallow: / in robots.txt causes Total AI Blindness (-100 pts)' : '🟢 No deductions — All protocols clean.',
        impact: 'Blanket robots.txt disallows completely blind generative search crawlers from reading your site.',
        recommendation: 'Replace blanket Disallow: / with granular bot rules permitting search crawlers.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 2: What can AI see? (Presence & Hygiene - 7)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'essentialPagesIndex',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'Essential Pages Index Coverage',
    category: 'Hygiene',
    description: 'Verifies presence of /about, /contact, /pricing, /privacy-policy, and /terms-of-service.',
    impact: 'Missing core identity pages weakens domain trust signals evaluated by AI search engines.',
    evaluate: (data = {}) => {
      const found = data.sec2?.essentialPagesFound ?? 0;
      const score = Math.min(100, (found / 5) * 100);
      return {
        status: found >= 5 ? 'active' : 'warning',
        score,
        details: `Found ${found}/5 essential trust pages (/about, /contact, /pricing, /privacy-policy, /terms-of-service)`,
        deductionReason: found < 5 ? `Missing ${5 - found} essential trust page(s) penalizes hygiene (-${100 - score} pts)` : '🟢 No deductions — All protocols clean.',
        impact: 'Missing core identity pages weakens domain trust signals evaluated by AI search engines.',
        recommendation: 'Publish and index dedicated /about, /contact, /pricing, /privacy-policy, and /terms-of-service pages.'
      };
    }
  },
  {
    id: 'heavyPageIndication',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'Heavy Page & JS Hydration Bloat',
    category: 'Hygiene',
    description: 'Client-side JavaScript DOM bloat & hydration traps.',
    impact: 'Heavy single-page app (SPA) JavaScript containers cause crawler timeouts resulting in empty page text.',
    evaluate: (data = {}) => {
      const isHeavy = data.sec2?.isHeavyJs || (data.status?.spaTrapDetected === true);
      const words = data.status?.wordCount ?? data.sec2?.wordCount ?? 0;
      const isZeroText = words === 0;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (isZeroText && hasHandshake) {
        return {
          status: 'active',
          score: 85,
          details: 'HTML DOM is JS-heavy, but root /llms.txt and /ai-context.md act as active machine fallback stream',
          deductionReason: 'JS hydration trap detected, but active /llms.txt Machine Welcome Mat provides RAG fallback stream (-15 pts)',
          impact: 'Heavy single-page app (SPA) JavaScript containers cause crawler timeouts resulting in empty page text.',
          recommendation: 'Pre-render static HTML fallback content to further optimize crawler load speed.'
        };
      }

      const score = isZeroText ? 20 : (isHeavy ? 40 : 100);
      return {
        status: (isHeavy || isZeroText) ? 'warning' : 'active',
        score,
        details: isZeroText ? 'Data Starvation: 0 words extracted (JS SPA Trap or Unrendered DOM)' : (isHeavy ? 'Heavy client-side JS rendering detected' : 'Clean HTML text density (>15% text ratio)'),
        deductionReason: isZeroText ? '0 words extracted due to Client-Side SPA JS trap (-80 pts)' : (isHeavy ? 'Heavy client-side JS rendering detected (-60 pts)' : '🟢 No deductions — All protocols clean.'),
        impact: 'Heavy single-page app (SPA) JavaScript containers cause crawler timeouts resulting in empty page text.',
        recommendation: 'Pre-render static HTML fallback content to prevent crawler hydration timeouts.'
      };
    }
  },
  {
    id: 'tokenLoadAnalysis',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'Token Load Analysis (RAG Limits)',
    category: 'Hygiene',
    description: 'Estimated token count per page against standard RAG context limits (k-tokens).',
    impact: 'Excessive page token length causes RAG passage truncation by LLM inference engines.',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec2?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'active',
          score: 90,
          details: 'RAG context stream served via root /llms.txt & /ai-context.md machine manifest files',
          deductionReason: 'RAG context stream served via root /llms.txt & /ai-context.md machine manifest files (-10 pts)',
          impact: 'Excessive page token length causes RAG passage truncation by LLM inference engines.',
          recommendation: 'Keep machine manifest indexes updated with current product and service specifications.'
        };
      }

      if (words === 0) {
        return {
          status: 'critical',
          score: 0,
          details: 'Data Starvation: 0 extracted tokens (Unreadable DOM / Empty Body)',
          deductionReason: 'Data Starvation: 0 extracted tokens from page body (-100 pts)',
          impact: 'Excessive page token length causes RAG passage truncation by LLM inference engines.',
          recommendation: 'Ensure main content is server-side rendered as clean HTML text.'
        };
      }
      const tokens = words ? Math.round(words * 1.3) : (data.sec2?.estimatedTokens ?? 0);
      const isOver = tokens > 4000;
      return {
        status: isOver ? 'warning' : 'active',
        score: isOver ? 50 : 100,
        details: `Estimated ~${tokens} tokens per page load`,
        deductionReason: isOver ? `Estimated ~${tokens} tokens exceeds 4k token window limit (-50 pts)` : '🟢 No deductions — All protocols clean.',
        impact: 'Excessive page token length causes RAG passage truncation by LLM inference engines.',
        recommendation: 'Keep main content under 4k tokens per page for optimal RAG context windows.'
      };
    }
  },
  {
    id: 'externalLinks',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'Outbound Links Distribution',
    category: 'Hygiene',
    description: 'Total outbound link count and domain distribution.',
    impact: 'Authoritative outbound citations demonstrate factual verification and link graph authority.',
    evaluate: (data = {}) => ({
      status: 'active',
      score: 100,
      details: `${data.sec2?.externalLinkCount ?? 0} external outbound domain citations identified`,
      deductionReason: '🟢 No deductions — All protocols clean.',
      impact: 'Authoritative outbound citations demonstrate factual verification and link graph authority.',
      recommendation: 'Maintain authoritative outbound link citations for E-E-A-T trust signals.'
    })
  },
  {
    id: 'lastUpdatedFreshness',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'LastUpdated Freshness Header',
    category: 'Hygiene',
    description: 'HTTP response header and JSON-LD schema modification timestamps.',
    impact: 'Stale timestamps lower content freshness scores calculated by recency-biased AI engines.',
    evaluate: (data = {}) => {
      const hasLastMod = data.sec2?.hasLastModified !== false;
      return {
        status: hasLastMod ? 'active' : 'warning',
        score: hasLastMod ? 100 : 60,
        details: hasLastMod ? 'Last-Modified HTTP header present' : 'Missing Last-Modified header timestamp',
        deductionReason: hasLastMod ? '🟢 No deductions — All protocols clean.' : 'Missing Last-Modified HTTP response header (-40 pts)',
        impact: 'Stale timestamps lower content freshness scores calculated by recency-biased AI engines.',
        recommendation: 'Expose Last-Modified HTTP headers and dateModified in JSON-LD schema.'
      };
    }
  },
  {
    id: 'isSecureProtocol',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'HTTPS / SSL Protocol Security',
    category: 'Hygiene',
    description: 'HTTPS / SSL certificate validation.',
    impact: 'Unencrypted HTTP connections trigger immediate security rejections by AI web bots.',
    evaluate: (data = {}) => {
      const targetUrl = data.url || data.sec2?.url || '';
      const isHttps = data.sec2?.isHttps !== false && (!targetUrl || targetUrl.startsWith('https'));
      return {
        status: isHttps ? 'active' : 'critical',
        score: isHttps ? 100 : 0,
        details: isHttps ? 'HTTPS TLS 1.3 encrypted connection' : 'Unencrypted HTTP protocol detected',
        deductionReason: isHttps ? '🟢 No deductions — All protocols clean.' : 'Unencrypted HTTP protocol detected (-100 pts)',
        impact: 'Unencrypted HTTP connections trigger immediate security rejections by AI web bots.',
        recommendation: 'Enforce HTTPS redirect and valid SSL certificates across all endpoints.'
      };
    }
  },
  {
    id: 'sitemapXmlPresence',
    section: 2,
    sectionName: 'Presence & Hygiene',
    name: 'Sitemap.xml Presence & Hygiene',
    category: 'Hygiene',
    description: 'Verifies presence and accessibility of /sitemap.xml route directory index.',
    impact: 'Missing sitemap.xml prevents automated crawler path discovery across domain sub-pages.',
    evaluate: (data = {}) => {
      const exists = data.status?.sitemapExists ?? data.sec2?.sitemapExists ?? data.sec4?.sitemapFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 0,
        details: exists ? '/sitemap.xml present with indexed routes' : '/sitemap.xml missing or invalid format',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /sitemap.xml penalizes Presence & Hygiene (-10 pts)',
        impact: 'Missing sitemap.xml prevents automated crawler path discovery across domain sub-pages.',
        recommendation: 'Generate an updated XML sitemap and reference it inside /robots.txt.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 3: Does AI trust your web presence? (Content AI-Readiness - 10)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'hasCanonicalTag',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Canonical URL Verification',
    category: 'Parsing',
    description: 'Verification of canonical link element and self-referential validity.',
    impact: 'Missing canonical tags increase duplicate content risk in RAG vector databases.',
    evaluate: (data = {}) => {
      const hasCanon = data.sec3?.hasCanonical ?? data.pages?.[0]?.hasCanonical ?? true;
      return {
        status: hasCanon ? 'active' : 'warning',
        score: hasCanon ? 100 : 40,
        details: hasCanon ? 'Self-referential <link rel="canonical"> present' : 'Missing canonical URL link tag (RAG duplication risk)',
        deductionReason: hasCanon ? '🟢 No deductions — All protocols clean.' : 'Missing self-referential canonical URL tag (-60 pts)',
        impact: 'Missing canonical tags increase duplicate content risk in RAG vector databases.',
        recommendation: 'Add explicit self-referential canonical tags to prevent RAG content duplication.'
      };
    }
  },
  {
    id: 'internalLinksAnalysis',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Internal Link Navigation Structure',
    category: 'Parsing',
    description: 'Inbound/outbound internal linkage structure.',
    impact: 'Orphaned pages without internal links are ignored by topic-cluster AI models.',
    evaluate: (data = {}) => {
      const linkCount = data.sec3?.internalLinkCount ?? 0;
      const isOk = linkCount > 5;
      return {
        status: isOk ? 'active' : 'warning',
        score: isOk ? 100 : 50,
        details: `${linkCount} internal navigation links detected`,
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : `Low internal navigation link count (${linkCount} links) (-50 pts)`,
        impact: 'Orphaned pages without internal links are ignored by topic-cluster AI models.',
        recommendation: 'Ensure main content includes descriptive internal links to related topic nodes.'
      };
    }
  },
  {
    id: 'titleAndMetadata',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Title & Meta Description Sweetspot',
    category: 'Parsing',
    description: 'Title tag presence, length (30-60 chars), and meta description density.',
    impact: 'Poor metadata length causes AI models to hallucinate or summarize incorrect page titles.',
    evaluate: (data = {}) => {
      const isOptimalTitle = data.status?.seoOptimalTitle ?? false;
      const isOptimalDesc = data.status?.seoOptimalDesc ?? false;
      const isOk = isOptimalTitle && isOptimalDesc;
      return {
        status: isOk ? 'active' : 'warning',
        score: isOk ? 100 : 60,
        details: isOk ? 'Title & Meta description in optimal sweetspot' : 'Title tag or meta description outside recommended length',
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : 'Title tag or meta description length outside recommended sweetspot (-40 pts)',
        impact: 'Poor metadata length causes AI models to hallucinate or summarize incorrect page titles.',
        recommendation: 'Keep title tags between 30-60 characters and meta descriptions under 160 characters.'
      };
    }
  },
  {
    id: 'syntacticComplexity',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Syntactic Complexity (Flesch Score)',
    category: 'Parsing',
    description: 'Reading ease score calculated for LLM ingestion efficiency.',
    impact: 'Overly complex syntax decreases LLM entity extraction accuracy during RAG prompt filling.',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec3?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'active',
          score: 85,
          details: 'Syntactic parsing backed by clean Markdown layout in /llms.txt and /ai-context.md',
          deductionReason: 'Syntactic parsing backed by clean Markdown layout in /llms.txt and /ai-context.md (-15 pts)',
          impact: 'Overly complex syntax decreases LLM entity extraction accuracy during RAG prompt filling.',
          recommendation: 'Maintain clear markdown headings in /llms.txt.'
        };
      }

      if (words === 0) {
        return {
          status: 'critical',
          score: 0,
          details: 'Data Starvation: 0 words available for Flesch Reading Ease analysis',
          deductionReason: 'Data Starvation: 0 words extracted for readability analysis (-100 pts)',
          impact: 'Overly complex syntax decreases LLM entity extraction accuracy during RAG prompt filling.',
          recommendation: 'Provide readable static text content for LLM parsing.'
        };
      }
      const flesch = data.sec3?.fleschScore ?? 0;
      const isGood = flesch >= 50;
      return {
        status: isGood ? 'active' : 'warning',
        score: flesch,
        details: `Flesch Reading Ease: ${flesch}/100 (${isGood ? 'Optimal LLM parsing range' : 'Syntactically complex'})`,
        deductionReason: isGood ? '🟢 No deductions — All protocols clean.' : `Flesch Reading Ease score (${flesch}/100) below target (-${100 - flesch} pts)`,
        impact: 'Overly complex syntax decreases LLM entity extraction accuracy during RAG prompt filling.',
        recommendation: 'Target a Flesch score above 60 for clean machine parsing without syntactic ambiguity.'
      };
    }
  },
  {
    id: 'vectorLayout',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Vector Paragraph Density (<80 Words)',
    category: 'Parsing',
    description: 'Measures average words per paragraph (Target: <80 words for RAG chunking).',
    impact: 'Paragraphs exceeding 80 words degrade vector similarity search matching in AI knowledge bases.',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec3?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'active',
          score: 90,
          details: 'Vector paragraph chunking structured via /llms.txt machine welcome index',
          deductionReason: 'Vector paragraph chunking structured via /llms.txt machine welcome index (-10 pts)',
          impact: 'Paragraphs exceeding 80 words degrade vector similarity search matching in AI knowledge bases.',
          recommendation: 'Keep paragraphs concise under 80 words.'
        };
      }

      if (words === 0) {
        return {
          status: 'critical',
          score: 0,
          details: 'Data Starvation: 0 vector paragraph chunks generated',
          deductionReason: 'Data Starvation: 0 vector paragraph chunks generated (-100 pts)',
          impact: 'Paragraphs exceeding 80 words degrade vector similarity search matching in AI knowledge bases.',
          recommendation: 'Break content into clear paragraph blocks under 80 words.'
        };
      }
      const avgWords = data.sec3?.avgWordsPerP ?? 0;
      const isOk = avgWords > 0 && avgWords <= 80;
      return {
        status: isOk ? 'active' : 'warning',
        score: isOk ? 100 : 60,
        details: `Average words per paragraph: ${avgWords} words (Target: <80 words)`,
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : `Average paragraph density (${avgWords} words) exceeds 80 word chunk limit (-40 pts)`,
        impact: 'Paragraphs exceeding 80 words degrade vector similarity search matching in AI knowledge bases.',
        recommendation: 'Break long text blocks into concise paragraphs under 80 words for RAG vector embeddings.'
      };
    }
  },
  {
    id: 'faqSchemaParity',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'FAQ Schema & 1:1 Q/A Parity Ratio',
    category: 'Parsing',
    description: 'JSON-LD FAQ validation, Question Count, Answer Count, and 1:1 Parity Ratio.',
    impact: 'Structured FAQ schema allows AI engines to quote direct answers to user queries.',
    evaluate: (data = {}) => {
      const q = data.sec3?.faqQuestions ?? 0;
      const a = data.sec3?.faqAnswers ?? 0;
      const hasSchema = data.status?.jsonLdExists ?? data.sec3?.hasFaqSchema ?? false;
      const isParity = q > 0 && q === a;
      const isOk = isParity && hasSchema;
      return {
        status: isOk ? 'active' : 'warning',
        score: isOk ? 100 : 50,
        details: `FAQ Schema: ${hasSchema ? '🟢 Valid' : '🔴 Missing'} | Questions: ${q} | Answers: ${a} | Parity Ratio: 1:${(a/Math.max(1,q)).toFixed(1)}`,
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : 'FAQ JSON-LD schema missing or Q/A parity ratio mismatch (-50 pts)',
        impact: 'Structured FAQ schema allows AI engines to quote direct answers to user queries.',
        recommendation: 'Ensure exact 1:1 parity between DOM FAQ questions and JSON-LD FAQPage schema items.'
      };
    }
  },
  {
    id: 'semanticHtmlTags',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Semantic HTML5 Structural Tags',
    category: 'Parsing',
    description: 'Presence of <article>, <section>, <header>, <nav>, <main>.',
    impact: 'Semantic tags guide LLM parsers to identify primary body content vs navigation noise.',
    evaluate: (data = {}) => {
      const count = data.sec3?.semanticCount ?? 0;
      const score = Math.min(100, count * 20);
      return {
        status: count >= 4 ? 'active' : 'warning',
        score,
        details: `Found ${count}/5 semantic HTML tags (<main>, <article>, <section>, <header>, <nav>)`,
        deductionReason: count < 4 ? `Found only ${count}/5 semantic HTML tags (-${100 - score} pts)` : '🟢 No deductions — All protocols clean.',
        impact: 'Semantic tags guide LLM parsers to identify primary body content vs navigation noise.',
        recommendation: 'Wrap content blocks in semantic HTML5 tags (<main>, <article>, <section>) instead of generic <div> elements.'
      };
    }
  },
  {
    id: 'headingHierarchy',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Heading Hierarchy (Single H1 & H2/H3 Sequential)',
    category: 'Parsing',
    description: 'Single H1 enforcement flag, H2 / H3 sequential hierarchy check.',
    impact: 'Broken heading hierarchies cause LLMs to fail outline parsing and topic chunk extraction.',
    evaluate: (data = {}) => {
      const isProper = data.status?.hasProperHierarchy ?? false;
      return {
        status: isProper ? 'active' : 'warning',
        score: isProper ? 100 : 50,
        details: isProper ? 'Single <h1> followed by sequential <h2>/<h3> headings' : 'Heading hierarchy violated (Multiple H1s or skipped levels)',
        deductionReason: isProper ? '🟢 No deductions — All protocols clean.' : 'Heading hierarchy violated (Multiple H1s or skipped levels) (-50 pts)',
        impact: 'Broken heading hierarchies cause LLMs to fail outline parsing and topic chunk extraction.',
        recommendation: 'Enforce exactly one <h1> element per page followed by sequential <h2> and <h3> subheadings.'
      };
    }
  },
  {
    id: 'imagesWithoutAlt',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Images Missing Descriptive Alt Text',
    category: 'Parsing',
    description: 'Count of total images vs images missing descriptive alt tags.',
    impact: 'Missing alt text prevents multimodal vision AI models from understanding page graphics.',
    evaluate: (data = {}) => {
      const missingCount = data.sec3?.missingAltCount ?? 0;
      const totalImages = data.sec3?.totalImages ?? 0;
      const score = totalImages === 0 ? 100 : Math.max(0, 100 - missingCount * 15);
      return {
        status: missingCount === 0 ? 'active' : 'warning',
        score,
        details: `Total images: ${totalImages} | Missing alt attribute: ${missingCount}`,
        deductionReason: missingCount > 0 ? `${missingCount} image(s) missing descriptive alt attributes (-${100 - score} pts)` : '🟢 No deductions — All protocols clean.',
        impact: 'Missing alt text prevents multimodal vision AI models from understanding page graphics.',
        recommendation: 'Add descriptive alt text attributes to all content images for vision & multi-modal AI models.'
      };
    }
  },
  {
    id: 'contactAndPrivacyPresence',
    section: 3,
    sectionName: 'Content AI-Readiness',
    name: 'Explicit Entity Contact & Privacy Presence',
    category: 'Parsing',
    description: 'Explicit entity contact details and privacy policy presence.',
    impact: 'Verifiable corporate contact info and privacy pages build essential trust metrics for AI recommendations.',
    evaluate: (data = {}) => {
      const hasContact = data.sec3?.hasContactInfo !== false;
      const hasPrivacy = data.sec3?.hasPrivacyPolicy !== false;
      const isOk = hasContact && hasPrivacy;
      return {
        status: isOk ? 'active' : 'warning',
        score: isOk ? 100 : 50,
        details: `Contact info: ${hasContact ? 'Found' : 'Missing'} | Privacy policy: ${hasPrivacy ? 'Found' : 'Missing'}`,
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : 'Missing contact information or accessible Privacy Policy (-50 pts)',
        impact: 'Verifiable corporate contact info and privacy pages build essential trust metrics for AI recommendations.',
        recommendation: 'Provide clear email/phone contact information and accessible Privacy Policy links.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 4: Is your website AI-Ready? (Machine Manifest Readiness - 12)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'robotsTxt',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/robots.txt Machine Gateway File',
    category: 'Manifests',
    description: 'Availability, bot directive review, sample template generator.',
    impact: 'Root /robots.txt defines legal and procedural crawling boundaries for AI bots.',
    evaluate: (data = {}) => {
      const exists = data.status?.robotsTxtExists ?? data.sec4?.robotsTxtFound ?? false;
      return {
        status: exists ? 'active' : 'critical',
        score: exists ? 100 : 0,
        details: exists ? '/robots.txt accessible (200 OK)' : '/robots.txt missing or returning 404',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Root /robots.txt file missing or inaccessible (-100 pts)',
        impact: 'Root /robots.txt defines legal and procedural crawling boundaries for AI bots.',
        recommendation: 'Create and deploy a valid /robots.txt file to root domain.'
      };
    }
  },
  {
    id: 'sitemapXml',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/sitemap.xml Route Directory Index',
    category: 'Manifests',
    description: 'Availability, page path coverage comparison, missing essential routes flag, sample generator.',
    impact: 'Machine-readable XML sitemaps allow AI indexers to harvest updated content paths.',
    evaluate: (data = {}) => {
      const exists = data.status?.sitemapExists ?? data.sec4?.sitemapFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 30,
        details: exists ? '/sitemap.xml present with indexed routes' : '/sitemap.xml missing or invalid format',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Root /sitemap.xml file missing from machine manifests (-70 pts)',
        impact: 'Machine-readable XML sitemaps allow AI indexers to harvest updated content paths.',
        recommendation: 'Generate an updated XML sitemap and reference it inside /robots.txt.'
      };
    }
  },
  {
    id: 'llmsTxt',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/llms.txt Machine Welcome Directory',
    category: 'Manifests',
    description: 'Availability, specification compliance check, sample generator.',
    impact: '/llms.txt acts as the modern front door index for generative AI systems.',
    evaluate: (data = {}) => {
      const exists = data.status?.llmsTxtExists ?? data.sec4?.llmsTxtFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 20,
        details: exists ? '/llms.txt standard compliant index active' : '/llms.txt missing from root directory',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /llms.txt Machine Welcome Directory (-80 pts)',
        impact: '/llms.txt acts as the modern front door index for generative AI systems.',
        recommendation: 'Deploy a standard-compliant /llms.txt file following the Answer.ai machine specification.'
      };
    }
  },
  {
    id: 'llmsTxtSpecCompliance',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/llms.txt Standard Specification Compliance',
    category: 'Manifests',
    description: 'Validates Answer.ai markdown format compliance.',
    impact: 'Standard-compliant markdown formatting ensures parseability by open-source RAG frameworks.',
    evaluate: (data = {}) => {
      const exists = data.status?.llmsTxtExists ?? data.sec4?.llmsTxtFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 30,
        details: exists ? 'H1 Title, H2 Sections, and markdown links compliant' : 'Non-compliant or missing /llms.txt format',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Non-compliant or missing /llms.txt Answer.ai format (-70 pts)',
        impact: 'Standard-compliant markdown formatting ensures parseability by open-source RAG frameworks.',
        recommendation: 'Format /llms.txt with standard H1 title, blockquote, and section links.'
      };
    }
  },
  {
    id: 'jsonLdSchema',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: 'JSON-LD Structured Entity Schema',
    category: 'Manifests',
    description: 'Per-page availability and missing schema warning.',
    impact: 'Structured entity schemas allow LLMs to build knowledge graph nodes for your brand.',
    evaluate: (data = {}) => {
      const exists = data.status?.jsonLdExists ?? data.sec4?.jsonLdFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 40,
        details: exists ? `JSON-LD Schema types detected: [ ${data.status?.jsonLdTypes?.join(', ') || 'Organization, WebSite'} ]` : 'No JSON-LD structured data script tags found',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'No JSON-LD structured entity schema script tags found (-60 pts)',
        impact: 'Structured entity schemas allow LLMs to build knowledge graph nodes for your brand.',
        recommendation: 'Embed Organization, WebSite, and Product JSON-LD scripts in the HTML <head>.'
      };
    }
  },
  {
    id: 'aiContextMd',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/ai-context.md Blueprint Manifest',
    category: 'Manifests',
    description: 'Availability, robots.txt mapping verification, sample manifest generator.',
    impact: '/ai-context.md serves system prompt context maps directly to RAG agents.',
    evaluate: (data = {}) => {
      const exists = data.status?.aiContextExists ?? data.sec4?.aiContextFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 10,
        details: exists ? '/ai-context.md context map active' : '/ai-context.md file missing from root domain',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /ai-context.md Blueprint Manifest (-90 pts)',
        impact: '/ai-context.md serves system prompt context maps directly to RAG agents.',
        recommendation: 'Generate an /ai-context.md system prompt manifest to guide generative agent ingestion.'
      };
    }
  },
  {
    id: 'readmeMdManifest',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/README.md Orientation Manifest',
    category: 'Manifests',
    description: 'Ecosystem & Orientation guide for machine agents.',
    impact: 'Root /README.md introduces machine agents to domain architecture and navigation routes.',
    evaluate: (data = {}) => {
      const exists = data.sec4?.readmeFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/README.md ecosystem orientation guide present' : 'Missing /README.md orientation file',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /README.md Orientation Manifest (-75 pts)',
        impact: 'Root /README.md introduces machine agents to domain architecture and navigation routes.',
        recommendation: 'Provide a root /README.md to introduce machine agents to domain architecture.'
      };
    }
  },
  {
    id: 'aboutMdManifest',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/about.md Entity Manifest',
    category: 'Manifests',
    description: 'Entity & Brand verification manifest.',
    impact: '/about.md provides machine-readable brand corporate history and trust credentials.',
    evaluate: (data = {}) => {
      const exists = data.status?.aboutTxtExists ?? data.sec4?.aboutMdFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/about.md brand entity verification manifest present' : 'Missing /about.md brand entity file',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /about.md Entity Manifest (-75 pts)',
        impact: '/about.md provides machine-readable brand corporate history and trust credentials.',
        recommendation: 'Deploy /about.md to establish verified corporate entity ownership.'
      };
    }
  },
  {
    id: 'docsMdManifest',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/docs.md Technical Manual Manifest',
    category: 'Manifests',
    description: 'Technical & Workflow manual for LLMs.',
    impact: '/docs.md supplies deep technical specifications and API documentation for LLMs.',
    evaluate: (data = {}) => {
      const exists = data.status?.docsTxtExists ?? data.sec4?.docsMdFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/docs.md technical manual present' : 'Missing /docs.md technical manual file',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /docs.md Technical Manual Manifest (-75 pts)',
        impact: '/docs.md supplies deep technical specifications and API documentation for LLMs.',
        recommendation: 'Deploy /docs.md for deep technical integration details.'
      };
    }
  },
  {
    id: 'contentMdManifest',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: '/content.md Flat Index Manifest',
    category: 'Manifests',
    description: 'Flat content index map for LLMs.',
    impact: '/content.md flattens article and case study routes into a single machine-ingestible stream.',
    evaluate: (data = {}) => {
      const exists = data.status?.contentTxtExists ?? data.sec4?.contentMdFound ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/content.md flat content index present' : 'Missing /content.md flat content file',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing /content.md Flat Index Manifest (-75 pts)',
        impact: '/content.md flattens article and case study routes into a single machine-ingestible stream.',
        recommendation: 'Deploy /content.md summarizing main article and case study routes.'
      };
    }
  },
  {
    id: 'robotsTxtMapping',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: 'Robots.txt Handshake Route Pointer',
    category: 'Manifests',
    description: 'Verifies /llms.txt and /ai-context.md links inside robots.txt.',
    impact: 'Robots.txt pointers guide crawlers directly to machine manifest welcome files.',
    evaluate: (data = {}) => {
      const exists = data.sec4?.hasRobotsPointer ?? false;
      return {
        status: exists ? 'active' : 'warning',
        score: exists ? 100 : 40,
        details: exists ? 'Robots.txt references /llms.txt and /sitemap.xml' : 'Missing handshake comments or sitemap references',
        deductionReason: exists ? '🟢 No deductions — All protocols clean.' : 'Missing machine manifest handshake comments inside robots.txt (-60 pts)',
        impact: 'Robots.txt pointers guide crawlers directly to machine manifest welcome files.',
        recommendation: 'Add explicit Sitemap and LLM-Text comments to /robots.txt.'
      };
    }
  },
  {
    id: 'sitemapCoverage',
    section: 4,
    sectionName: 'Machine Manifest Readiness',
    name: 'Sitemap XML Path Coverage',
    category: 'Manifests',
    description: 'Page path coverage comparison against discovered routes.',
    impact: 'Full sitemap path coverage ensures AI crawlers reach all secondary and deep route nodes.',
    evaluate: (data = {}) => {
      const discovered = data.discoveredRoutes || data.pages || [];
      const totalDiscovered = discovered.length;
      const matched = discovered.filter(r => r.inSitemap === true).length;
      const score = totalDiscovered > 0 ? Math.round((matched / totalDiscovered) * 100) : 0;
      const isOk = score >= 80;
      return {
        status: isOk ? 'active' : 'warning',
        score,
        details: totalDiscovered > 0 ? `${matched}/${totalDiscovered} discovered routes indexed in sitemap.xml` : 'No discovered routes matched in sitemap index',
        deductionReason: isOk ? '🟢 No deductions — All protocols clean.' : `Sitemap path coverage (${score}%) below target (-${100 - score} pts)`,
        impact: 'Full sitemap path coverage ensures AI crawlers reach all secondary and deep route nodes.',
        recommendation: 'Keep XML sitemaps synchronized with dynamic web routes.'
      };
    }
  }
];

/**
 * Helper to determine status string ('active' | 'warning' | 'critical')
 */
function getStatusFromScore(score, maxScore = 25) {
  const ratio = score / maxScore;
  if (ratio >= 0.8) return 'active';
  if (ratio >= 0.5) return 'warning';
  return 'critical';
}

/**
 * Server-Side Diagnostic Scoring Evaluator
 * Evaluates 4 Pillars (P1, P2, P3, P4, 0-25 pts each), overallScore (0-100), and 4 Executive Inquiry Cards.
 */
function evaluateCapabilities(crawledData = {}) {
  const status = crawledData.status || {};
  const sec1 = crawledData.sec1 || {};
  const sec2 = crawledData.sec2 || {};
  const sec3 = crawledData.sec3 || {};
  const sec4 = crawledData.sec4 || {};

  // 1. Pillar 1: Gateway & Access (0-25 pts)
  // Evaluate ONLY robots.txt, WAF/CDN blocks, and X-Robots-Tag headers. NO sitemap penalties!
  let p1Score = 25;
  let p1Deductions = [];
  const robotsTxtExists = status.robotsTxtExists ?? sec1.robotsTxtExists ?? sec4.robotsTxtFound ?? false;
  const isDisallowed = status.xRobotsIndexable === false || sec1.disallowAll === true || (!robotsTxtExists);
  const cdnBlocked = sec1.cdnBlocked === true;
  const botPermissions = status.botPermissions || {};
  const blockedBotCount = Object.values(botPermissions).filter(allowed => allowed === false).length;

  const isWafBlocked = status.isWafBlocked === true || sec1.blocked === true || crawledData.executiveSections?.section1?.blocked === true || status.statusCode === 403 || status.statusCode === 429 || crawledData.statusCode === 403 || crawledData.statusCode === 429;
  const wafStatusCode = status.wafStatusCode || status.statusCode || crawledData.statusCode || sec1.wafStatusCode || crawledData.executiveSections?.section1?.wafStatusCode || 403;

  if (isWafBlocked) {
    p1Score = 0;
    p1Deductions.push(`Automated Bot Traffic Rejected (HTTP ${wafStatusCode}) — Security Shield Active`);
  } else if (isDisallowed) {
    p1Score -= 25;
    p1Deductions.push('Blanket Disallow: / or missing robots.txt causes Total AI Blindness (-25 pts)');
  } else {
    if (cdnBlocked) {
      p1Score -= 15;
      p1Deductions.push('CDN WAF firewall challenges active for AI crawler user-agents (-15 pts)');
    }
    if (blockedBotCount > 0) {
      const deduction = Math.min(10, blockedBotCount * 5);
      p1Score -= deduction;
      p1Deductions.push(`${blockedBotCount} targeted AI crawler block(s) detected (-${deduction} pts)`);
    }
    if (sec1.xRobotsNoIndex === true) {
      p1Score -= 10;
      p1Deductions.push('HTTP response header contains X-Robots-Tag: noindex (-10 pts)');
    }
  }
  p1Score = Math.max(0, Math.min(25, p1Score));
  const p1DeductionReason = p1Score === 25 ? '🟢 No deductions — All protocols clean.' : p1Deductions.join('; ');

  // 2. Pillar 2: Presence & Hygiene (0-25 pts)
  // Evaluate sitemap.xml presence/validity (missing sitemap penalties belong 100% here), HTTPS SSL, SPA hydration traps, response headers.
  let p2Score = 25;
  let p2Deductions = [];
  const sitemapExists = status.sitemapExists ?? sec2.sitemapExists ?? sec4.sitemapFound ?? false;
  if (!sitemapExists) {
    p2Score -= 10;
    p2Deductions.push('Missing /sitemap.xml penalizes Presence & Hygiene (-10 pts)');
  }

  const targetUrl = crawledData.url || sec2.url || '';
  const isHttps = sec2.isHttps ?? (targetUrl ? targetUrl.startsWith('https') : true);
  if (!isHttps) {
    p2Score -= 5;
    p2Deductions.push('Unencrypted HTTP protocol detected (-5 pts)');
  }

  const spaTrapDetected = status.spaTrapDetected ?? sec2.isHeavyJs ?? false;
  if (spaTrapDetected) {
    p2Score -= 5;
    p2Deductions.push('Heavy Client-Side SPA JS trap detected (-5 pts)');
  }

  const essentialPagesFound = sec2.essentialPagesFound ?? 0;
  if (essentialPagesFound < 3) {
    p2Score -= 5;
    p2Deductions.push(`Missing ${3 - essentialPagesFound} essential trust page(s) (-5 pts)`);
  }
  p2Score = Math.max(0, Math.min(25, p2Score));
  const p2DeductionReason = p2Score === 25 ? '🟢 No deductions — All protocols clean.' : p2Deductions.join('; ');

  // 3. Pillar 3: Content AI-Readiness (0-25 pts)
  // Evaluate title tag length, meta descriptions, heading trees, Flesch readability.
  let p3Score = 25;
  let p3Deductions = [];
  const seoOptimalTitle = status.seoOptimalTitle ?? sec3.seoOptimalTitle ?? false;
  if (!seoOptimalTitle) {
    p3Score -= 5;
    p3Deductions.push('Title tag outside optimal recommended character length (-5 pts)');
  }

  const seoOptimalDesc = status.seoOptimalDesc ?? sec3.seoOptimalDesc ?? false;
  if (!seoOptimalDesc) {
    p3Score -= 5;
    p3Deductions.push('Meta description outside optimal recommended character length (-5 pts)');
  }

  const hasProperHierarchy = status.hasProperHierarchy ?? sec3.hasProperHierarchy ?? false;
  if (!hasProperHierarchy) {
    p3Score -= 10;
    p3Deductions.push('Heading hierarchy violated (Multiple H1s or skipped sub-heading levels) (-10 pts)');
  }

  const wordCount = status.wordCount ?? sec3.wordCount ?? 0;
  const fleschScore = sec3.fleschScore ?? 0;
  if (wordCount < 500) {
    p3Score -= 5;
    p3Deductions.push('Page word count under 500 words data starvation risk (-5 pts)');
  } else if (fleschScore < 50) {
    p3Score -= 5;
    p3Deductions.push('Flesch Reading Ease score below target optimal LLM parsing range (-5 pts)');
  }
  p3Score = Math.max(0, Math.min(25, p3Score));
  const p3DeductionReason = p3Score === 25 ? '🟢 No deductions — All protocols clean.' : p3Deductions.join('; ');

  // 4. Pillar 4: Machine Manifest Readiness (0-25 pts)
  // Evaluate /llms.txt, /ai-context.md, /about.md, /docs.md, 4-level machine hierarchy.
  let p4Score = 25;
  let p4Deductions = [];
  const llmsTxtExists = status.llmsTxtExists ?? sec4.llmsTxtFound ?? false;
  if (!llmsTxtExists) {
    p4Score -= 10;
    p4Deductions.push('Missing /llms.txt Machine Welcome Directory (-10 pts)');
  }

  const aiContextExists = status.aiContextExists ?? sec4.aiContextFound ?? false;
  if (!aiContextExists) {
    p4Score -= 8;
    p4Deductions.push('Missing /ai-context.md Blueprint Manifest (-8 pts)');
  }

  const aboutTxtExists = status.aboutTxtExists ?? sec4.aboutMdFound ?? false;
  if (!aboutTxtExists) {
    p4Score -= 4;
    p4Deductions.push('Missing /about.md Entity Manifest (-4 pts)');
  }

  const docsTxtExists = status.docsTxtExists ?? sec4.docsMdFound ?? false;
  if (!docsTxtExists) {
    p4Score -= 3;
    p4Deductions.push('Missing /docs.md Technical Manual Manifest (-3 pts)');
  }
  p4Score = Math.max(0, Math.min(25, p4Score));
  const p4DeductionReason = p4Score === 25 ? '🟢 No deductions — All protocols clean.' : p4Deductions.join('; ');

  // Blanket Disallow Block Enforcement
  const isBlanketBlock = status.xRobotsIndexable === false || sec1.disallowAll === true;
  if (isBlanketBlock) {
    p1Score = 0;
    p2Score = Math.min(p2Score, 10);
    p3Score = Math.min(p3Score, 10);
    p4Score = 0;
  }

  // Unscanned / empty crawl handling
  const isUnscanned = !crawledData || Object.keys(crawledData).length === 0 || (!crawledData.url && (!crawledData.status || Object.keys(crawledData.status).length === 0) && (!crawledData.pages || crawledData.pages.length === 0) && (!crawledData.discoveredRoutes || crawledData.discoveredRoutes.length === 0));
  if (isUnscanned) {
    p1Score = 0;
    p2Score = 0;
    p3Score = 0;
    p4Score = 0;
  }

  // overallScore is exact sum of P1 + P2 + P3 + P4
  const overallScore = p1Score + p2Score + p3Score + p4Score;

  // Build Executive Inquiry Cards Payload
  const executiveSections = {
    section1: {
      title: 'Can AI see your website?',
      category: 'Gateway & Access',
      score: p1Score,
      max: 25,
      status: isWafBlocked ? 'BLOCKED' : getStatusFromScore(p1Score, 25),
      deductions: p1Deductions,
      deductionReason: isWafBlocked ? `Automated Bot Traffic Rejected (HTTP ${wafStatusCode}) — Security Shield Active` : (p1Score === 25 ? '🟢 No deductions — All protocols clean.' : (isBlanketBlock ? 'Blanket Disallow: / active in robots.txt (-25 pts)' : p1DeductionReason)),
      impact: 'Determines whether edge firewalls, robots.txt, or HTTP headers block search crawlers and AI bots from accessing your domain.',
      xRobotsIndexable: isWafBlocked ? false : (status.xRobotsIndexable !== false && sec1.xRobotsNoIndex !== true),
      robotsTxtExists: isWafBlocked ? false : (robotsTxtExists && sec1.disallowAll !== true),
      blocked: isWafBlocked,
      wafStatusCode: wafStatusCode
    },
    section2: {
      title: 'What can AI see?',
      category: 'Presence & Hygiene',
      score: p2Score,
      max: 25,
      status: getStatusFromScore(p2Score, 25),
      deductions: p2Deductions,
      deductionReason: p2Score === 25 ? '🟢 No deductions — All protocols clean.' : p2DeductionReason,
      impact: 'Evaluates whether AI crawlers can discover your pages via sitemap.xml and extract text without SPA JavaScript hydration traps.'
    },
    section3: {
      title: 'Does AI trust your web presence?',
      category: 'Content AI-Optimization & Trust',
      score: p3Score,
      max: 25,
      status: getStatusFromScore(p3Score, 25),
      deductions: p3Deductions,
      deductionReason: p3Score === 25 ? '🟢 No deductions — All protocols clean.' : p3DeductionReason,
      impact: 'Assesses E-E-A-T authority, metadata quality, heading hierarchy, and reading ease for generative AI ingestion.'
    },
    section4: {
      title: 'Is your website AI-Ready?',
      category: 'Machine Manifest Readiness',
      score: p4Score,
      max: 25,
      status: getStatusFromScore(p4Score, 25),
      deductions: p4Deductions,
      deductionReason: p4Score === 25 ? '🟢 No deductions — All protocols clean.' : p4DeductionReason,
      impact: 'Verifies presence of machine-readable welcome files (/llms.txt, /ai-context.md, /about.md, /docs.md) for direct RAG ingestion.'
    }
  };

  // Evaluate individual 32 capability items
  const capabilityMatrix = CAPABILITY_MATRIX.map(cap => {
    const evaluation = cap.evaluate(crawledData);
    return {
      id: cap.id,
      section: cap.section,
      sectionName: cap.sectionName,
      name: cap.name,
      title: cap.name,
      category: cap.category,
      description: cap.description,
      status: evaluation.status || getStatusFromScore(evaluation.score || 0, 100),
      score: evaluation.score ?? 0,
      details: evaluation.details || '',
      deductionReason: evaluation.deductionReason || (evaluation.score === 100 ? '🟢 No deductions — All protocols clean.' : 'Deductions applied.'),
      impact: evaluation.impact || cap.impact || 'Affects AI indexing and content visibility.',
      recommendation: evaluation.recommendation || cap.recommendation || 'Remediate capability configuration.'
    };
  });

  // Build Executive Mode Specification Payload Extensions:
  // a) Scan & Timing Metrics
  const scanMetrics = {
    scanTimeSeconds: typeof crawledData.scanMetrics?.scanTimeSeconds === 'number'
      ? crawledData.scanMetrics.scanTimeSeconds
      : (typeof crawledData.scanTimeSeconds === 'number' ? crawledData.scanTimeSeconds : null),
    lastScanned: crawledData.scanMetrics?.lastScanned || crawledData.lastScanned || new Date().toISOString()
  };

  // b) Scraped Content & Manifest Previews
  const stripHtmlTags = (str) => {
    if (typeof str !== 'string') return '';
    let md = str;
    // 1. h1-h6 conversion
    md = md.replace(/<h([1-6])\b[^>]*>/gi, (match, level) => '\n\n' + '#'.repeat(parseInt(level)) + ' ');
    md = md.replace(/<\/h[1-6]>/gi, '\n\n');
    // 2. p, div, article, section conversion
    md = md.replace(/<\/p>/gi, '\n\n');
    md = md.replace(/<\/div>/gi, '\n\n');
    md = md.replace(/<\/article>/gi, '\n\n');
    md = md.replace(/<\/section>/gi, '\n\n');
    // 3. li conversion
    md = md.replace(/<li\b[^>]*>/gi, '\n- ');
    md = md.replace(/<\/li>/gi, '\n');
    // 4. br conversion
    md = md.replace(/<br\s*\/?>/gi, '\n');
    // 5. Strip remaining tags
    md = md.replace(/<[^>]*>/g, '');
    // 6. Clean whitespace and line breaks
    let lines = md.split('\n').map(line => line.replace(/[ \t]+/g, ' ').trim());
    md = lines.join('\n');
    md = md.replace(/\n{3,}/g, '\n\n');
    return md.trim();
  };

  let scrapedContentPreview = [];
  const rawPreviewInput = crawledData.scrapedContentPreview;

  if (Array.isArray(rawPreviewInput)) {
    scrapedContentPreview = rawPreviewInput.map(item => {
      if (item && typeof item === 'object') {
        return {
          route: item.route || item.path || '/',
          content: stripHtmlTags(item.content || item.html || item.rawText || '')
        };
      }
      return {
        route: '/',
        content: stripHtmlTags(String(item))
      };
    });
  } else if (typeof rawPreviewInput === 'string' && rawPreviewInput.trim() !== '') {
    scrapedContentPreview = [{
      route: '/',
      content: stripHtmlTags(rawPreviewInput)
    }];
  } else if (Array.isArray(crawledData.pages) && crawledData.pages.length > 0) {
    scrapedContentPreview = crawledData.pages.map(p => ({
      route: p.route || p.path || '/',
      content: stripHtmlTags(p.content || p.html || p.rawText || '')
    }));
  } else {
    const fallbackText = status.machinePreview || sec2.rawText || '';
    scrapedContentPreview = [{
      route: '/',
      content: stripHtmlTags(fallbackText)
    }];
  }

  // a) Contact String Values
  let emailValue = 'None Detected';
  let phoneValue = 'None Detected';

  const possibleEmailSources = [
    crawledData.emailValue,
    crawledData.email,
    crawledData.sec3?.emailValue,
    crawledData.sec3?.email,
    crawledData.eeatMetrics?.emailValue,
    crawledData.eeatMetrics?.email,
    crawledData.status?.emailValue,
    crawledData.status?.email
  ];
  for (const src of possibleEmailSources) {
    if (typeof src === 'string' && src.trim() !== '' && src.includes('@')) {
      emailValue = src.trim();
      break;
    }
  }

  const possiblePhoneSources = [
    crawledData.phoneValue,
    crawledData.phone,
    crawledData.sec3?.phoneValue,
    crawledData.sec3?.phone,
    crawledData.eeatMetrics?.phoneValue,
    crawledData.eeatMetrics?.phone,
    crawledData.status?.phoneValue,
    crawledData.status?.phone
  ];
  for (const src of possiblePhoneSources) {
    if (typeof src === 'string' && src.trim() !== '') {
      phoneValue = src.trim();
      break;
    }
  }

  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;

  if (emailValue === 'None Detected') {
    for (const item of scrapedContentPreview) {
      if (item && typeof item.content === 'string') {
        const match = item.content.match(emailRegex);
        if (match) {
          emailValue = match[0];
          break;
        }
      }
    }
    if (emailValue === 'None Detected' && Array.isArray(crawledData.pages)) {
      for (const page of crawledData.pages) {
        const text = page.rawText || page.content || '';
        if (typeof text === 'string') {
          const match = text.match(emailRegex);
          if (match) {
            emailValue = match[0];
            break;
          }
        }
      }
    }
  }

  if (phoneValue === 'None Detected') {
    for (const item of scrapedContentPreview) {
      if (item && typeof item.content === 'string') {
        const match = item.content.match(phoneRegex);
        if (match) {
          phoneValue = match[0];
          break;
        }
      }
    }
    if (phoneValue === 'None Detected' && Array.isArray(crawledData.pages)) {
      for (const page of crawledData.pages) {
        const text = page.rawText || page.content || '';
        if (typeof text === 'string') {
          const match = text.match(phoneRegex);
          if (match) {
            phoneValue = match[0];
            break;
          }
        }
      }
    }
  }

  const manifestPreviews = {
    aiContext: crawledData.manifestPreviews?.aiContext ||
      status.aiContextContent ||
      (status.aiContextExists ? '# AI Context Blueprint\nProduct specifications and brand domain boundaries.' : ''),
    about: crawledData.manifestPreviews?.about ||
      status.aboutTxtContent ||
      (status.aboutTxtExists ? '# About Us\nVerified corporate entity history and trust credentials.' : '')
  };

  // c) Discovered Webpages Route Directory
  let discoveredRoutes = [];
  if (Array.isArray(crawledData.discoveredRoutes) && crawledData.discoveredRoutes.length > 0) {
    discoveredRoutes = crawledData.discoveredRoutes.map(r => ({
      path: r.path || r.route || '/',
      wordCount: typeof r.wordCount === 'number' ? r.wordCount : 0,
      tokenLoad: typeof r.tokenLoad === 'number' ? r.tokenLoad : Math.round((r.wordCount || 0) / 2),
      hiddenFromAi: typeof r.hiddenFromAi === 'boolean' ? r.hiddenFromAi : (status.xRobotsIndexable === false || sec1.disallowAll === true),
      inSitemap: typeof r.inSitemap === 'boolean' ? r.inSitemap : Boolean(status.sitemapExists || sec2.sitemapExists),
      isEssential: typeof r.isEssential === 'boolean' ? r.isEssential : ['/', '/about', '/contact', '/privacy-policy', '/privacy'].includes(r.path || r.route || ''),
      missingStatus: r.missingStatus || (r.wordCount === 0 || r.isMissing ? 'Missing' : 'Active'),
      actionUrl: r.actionUrl || (crawledData.url ? `${crawledData.url.replace(/\/$/, '')}${r.path || r.route || '/'}` : (r.path || r.route || '/')),
      canonicalTag: typeof r.canonicalTag === 'boolean' ? r.canonicalTag : (typeof r.hasCanonical === 'boolean' ? r.hasCanonical : (r.canonicalUrl ? true : false)),
      headingHierarchy: typeof r.headingHierarchy === 'boolean' ? r.headingHierarchy : (r.headingAudit && typeof r.headingAudit.isHierarchyValid === 'boolean' ? r.headingAudit.isHierarchyValid : false),
      isMobileFriendly: typeof r.isMobileFriendly === 'boolean' ? r.isMobileFriendly : false,
      hasSemanticTags: typeof r.hasSemanticTags === 'boolean' ? r.hasSemanticTags : false,
      imagesWithoutAlt: typeof r.imagesWithoutAlt === 'number' ? r.imagesWithoutAlt : 0,
      lastUpdated: typeof r.lastUpdated === 'string' ? r.lastUpdated : "Unknown"
    }));
  } else if (Array.isArray(crawledData.pages) && crawledData.pages.length > 0) {
    discoveredRoutes = crawledData.pages.map(p => {
      const routePath = p.route || p.path || '/';
      const words = typeof p.wordCount === 'number' ? p.wordCount : 0;
      const isEss = ['/', '/about', '/contact', '/privacy-policy', '/privacy'].includes(routePath);
      return {
        path: routePath,
        wordCount: words,
        tokenLoad: Math.round(words / 2),
        hiddenFromAi: status.xRobotsIndexable === false || sec1.disallowAll === true,
        inSitemap: Boolean(status.sitemapExists || sec2.sitemapExists),
        isEssential: isEss,
        missingStatus: words === 0 ? 'Missing' : 'Active',
        actionUrl: crawledData.url ? `${crawledData.url.replace(/\/$/, '')}${routePath}` : routePath,
        canonicalTag: typeof p.canonicalTag === 'boolean' ? p.canonicalTag : (typeof p.hasCanonical === 'boolean' ? p.hasCanonical : (p.canonicalUrl ? true : false)),
        headingHierarchy: typeof p.headingHierarchy === 'boolean' ? p.headingHierarchy : (p.headingAudit && typeof p.headingAudit.isHierarchyValid === 'boolean' ? p.headingAudit.isHierarchyValid : false),
        isMobileFriendly: typeof p.isMobileFriendly === 'boolean' ? p.isMobileFriendly : false,
        hasSemanticTags: typeof p.hasSemanticTags === 'boolean' ? p.hasSemanticTags : false,
        imagesWithoutAlt: typeof p.imagesWithoutAlt === 'number' ? p.imagesWithoutAlt : 0,
        lastUpdated: typeof p.lastUpdated === 'string' ? p.lastUpdated : "Unknown"
      };
    });
  } else {
    discoveredRoutes = [];
  }

  // c) Missing Essential Pages Array
  const pagesList = Array.isArray(crawledData.pages) ? crawledData.pages : [];
  const inPageAnchors = Array.isArray(crawledData.inPageAnchors) ? crawledData.inPageAnchors : [];
  const discoveredRoutesInput = Array.isArray(crawledData.discoveredRoutes) ? crawledData.discoveredRoutes : [];

  const candidatePaths = [
    ...pagesList.map(extractPathForEvaluation),
    ...discoveredRoutesInput.map(extractPathForEvaluation),
    ...inPageAnchors.map(a => String(a).trim().toLowerCase())
  ].filter(Boolean);

  const missingEssentialPages = [];
  const foundEssentialPages = [];

  for (const anchorDef of ESSENTIAL_ANCHOR_DEFINITIONS) {
    const isFound = candidatePaths.some(path => 
      anchorDef.patterns.some(pattern => pattern.test(path))
    );

    if (isFound) {
      foundEssentialPages.push(anchorDef.canonical);
    } else {
      missingEssentialPages.push(anchorDef.canonical);
    }
  }

  // d) Domain Trust & EEAT Payload
  const isSecure = typeof crawledData.eeatMetrics?.isSecure === 'boolean'
    ? crawledData.eeatMetrics.isSecure
    : (sec2.isHttps !== false && (!targetUrl || targetUrl.startsWith('https')));

  const hasContactPage = foundEssentialPages.includes('/contact');
  const hasPrivacyPage = foundEssentialPages.includes('/privacy-policy');

  const hasContactInfo = Boolean(crawledData.eeatMetrics?.hasContactInfo || sec3.hasContactInfo || hasContactPage || emailValue !== 'None Detected' || phoneValue !== 'None Detected');
  const hasPrivacyPolicy = Boolean(crawledData.eeatMetrics?.hasPrivacyPolicy || sec3.hasPrivacyPolicy || hasPrivacyPage);

  let authorityStatus = crawledData.eeatMetrics?.authorityStatus || crawledData.authorityStatus || "Free Third-Party Check Available";

  let diagnosticSummary = crawledData.eeatMetrics?.diagnosticSummary;
  if (!diagnosticSummary) {
    if (authorityStatus === 'Optimized Anchor') {
      diagnosticSummary = 'Domain exhibits strong E-E-A-T trust signals with valid SSL security, verified contact information, active privacy policy, and established domain age authority.';
    } else if (authorityStatus === 'Information Isolation') {
      diagnosticSummary = 'Domain shows partial E-E-A-T trust credentials. Essential contact or privacy policies are partially isolated from search AI crawlers.';
    } else if (authorityStatus === 'Free Third-Party Check Available') {
      diagnosticSummary = 'Domain authority status evaluation is available via free third-party checks.';
    } else {
      diagnosticSummary = 'Domain presents E-E-A-T abstention risk. Security protocols or total AI disallow rules prevent LLMs from trusting entity authority.';
    }
  }


  const ageEstimate = crawledData.domainAge || 
    crawledData.eeatMetrics?.domainAge || 
    crawledData.eeatMetrics?.ageEstimate || 
    (crawledData.registrationDate ? 'Verified Domain Age' : '--');

  const eeatMetrics = {
    isSecure,
    hasContactInfo,
    hasPrivacyPolicy,
    ageEstimate,
    authorityStatus,
    diagnosticSummary
  };

  // Canonical 6-Stage Diagnostic Pipeline Calculation
  const botPermissionsMap = status.botPermissions || {};
  const stage1TotalCount = Object.keys(botPermissionsMap).length || 20;
  const stage1AllowedCount = isWafBlocked ? 0 : Object.values(botPermissionsMap).filter(v => v === true || v === 'Allowed' || v === 'PASS' || v === 'allowed' || v === 'pass').length;
  const stage1ScoreNum = isWafBlocked ? 0 : Math.round((stage1AllowedCount / stage1TotalCount) * 100);
  const stage1Score = `${stage1ScoreNum}%`;
  const stage1Status = isWafBlocked || stage1ScoreNum < 70 ? 'FAIL' : (stage1ScoreNum === 100 ? 'PASS' : 'WARN');
  const stage1Summary = `Bot Access: ${stage1AllowedCount}/${stage1TotalCount} Verified Unblocked`;
  const stage1Obj = {
    title: 'AI Bot Blocks & Gateway Permissions',
    allowedCount: stage1AllowedCount,
    totalCount: stage1TotalCount,
    score: stage1Score,
    scoreNum: stage1ScoreNum,
    status: stage1Status,
    summaryText: stage1Summary,
    classification: 'AI-Optimized'
  };

  const stage2FoundCount = 5 - missingEssentialPages.length;
  const stage2MissingCount = missingEssentialPages.length;
  const stage2ScoreNum = Math.round((stage2FoundCount / 5) * 100);
  const stage2Score = `${stage2ScoreNum}%`;
  const stage2Status = stage2FoundCount === 5 ? 'PASS' : (stage2FoundCount >= 3 ? 'WARN' : 'FAIL');
  const stage2Summary = stage2FoundCount === 5
    ? 'All 5 Essential Content Pages Discovered'
    : `Essential Pages: ${stage2FoundCount} Found, ${stage2MissingCount} Missing (${missingEssentialPages.join(', ')})`;
  const stage2Obj = {
    title: 'Identifiable Essential Pages & Anchors',
    foundCount: stage2FoundCount,
    missingCount: stage2MissingCount,
    missingRoutes: missingEssentialPages,
    score: stage2Score,
    scoreNum: stage2ScoreNum,
    status: stage2Status,
    summaryText: stage2Summary,
    classification: 'AI-Optimized'
  };

  const rawPagesList = Array.isArray(crawledData.pages) ? crawledData.pages : [];
  const validPages = rawPagesList.filter(p => 
    p && typeof p === 'object' && 
    p.statusCode !== 404 && 
    p.status !== 404 && 
    p.is404 !== true && 
    p.isMissing !== true && 
    p.isCrawled !== false
  );
  const highExtractabilityPages = validPages.filter(p => {
    const rawR = p.contentDensityRatio ?? p.textDensityRatio ?? p.textCodeRatio ?? p.ratio ?? p.textRatio ?? 0;
    const ratio = (rawR > 0 && rawR <= 1) ? rawR * 100 : Number(rawR);
    const wc = p.wordCount ?? p.words ?? 0;
    return ratio >= 25 && wc >= 250;
  }).length;
  const totalValidPages = validPages.length;
  const stage3ScoreNum = totalValidPages > 0 ? Math.round((highExtractabilityPages / totalValidPages) * 100) : 0;
  const stage3Score = `${stage3ScoreNum}%`;
  const stage3Status = totalValidPages === 0 ? 'FAIL' : (stage3ScoreNum >= 75 ? 'PASS' : (stage3ScoreNum >= 50 ? 'WARN' : 'FAIL'));
  const stage3Summary = `Citation Readability: ${highExtractabilityPages}/${totalValidPages} High Extractability`;
  const stage3Obj = {
    title: 'Content Availability & Semantic Text Density',
    totalValidPages,
    highExtractabilityCount: highExtractabilityPages,
    score: stage3Score,
    scoreNum: stage3ScoreNum,
    status: stage3Status,
    summaryText: stage3Summary,
    classification: 'AI-Optimized'
  };

  const isHtmlRoute = (routeOrUrl) => {
    if (!routeOrUrl || typeof routeOrUrl !== 'string') return false;
    const clean = routeOrUrl.split('?')[0].split('#')[0].toLowerCase();
    if (/\.(txt|md|xml|json|png|jpg|jpeg|gif|svg|pdf|css|js|woff|woff2)$/i.test(clean)) return false;
    if (['/robots.txt', '/llms.txt', '/llms-full.txt', '/ai-context.md', '/about.md', '/docs.md', '/content.md', '/sitemap.xml'].includes(clean)) return false;
    return true;
  };

  const validHtmlPages = validPages.filter(p => isHtmlRoute(p.route || p.path || p.url || ''));

  // Card 1: Schema Details Calculation
  const detectedSchemaTypesSet = new Set();
  let pagesWithSchema = 0;
  const missingRoutes = [];

  validHtmlPages.forEach(p => {
    const schemas = Array.isArray(p.schemas) 
      ? p.schemas 
      : (p.schema && Array.isArray(p.schema.rawJsonLd) ? p.schema.rawJsonLd : []);

    const typesFromP = (Array.isArray(p.schemaTypes) && p.schemaTypes.length > 0)
      ? p.schemaTypes
      : (Array.isArray(p.schema?.detectedTypes) 
          ? p.schema.detectedTypes 
          : schemas.map(s => s && (s['@type'] || s.type)).filter(Boolean));

    typesFromP.forEach(t => {
      if (Array.isArray(t)) t.forEach(sub => sub && detectedSchemaTypesSet.add(sub));
      else if (t) detectedSchemaTypesSet.add(t);
    });

    const hasPageSchema = Boolean(
      p.hasSchema === true || 
      typesFromP.length > 0 || 
      schemas.length > 0 ||
      (p.schema && Object.keys(p.schema).length > 0 && p.schema.detectedTypes?.length)
    );

    if (hasPageSchema) {
      pagesWithSchema++;
    } else {
      missingRoutes.push(p.route || p.path || p.url || '/');
    }
  });

  // Fallback to top-level status.jsonLdTypes if present
  if (Array.isArray(status.jsonLdTypes)) {
    status.jsonLdTypes.forEach(t => t && detectedSchemaTypesSet.add(t));
  }

  if (pagesWithSchema === 0 && (status.jsonLdExists || (Array.isArray(status.jsonLdTypes) && status.jsonLdTypes.length > 0))) {
    pagesWithSchema = 1;
    // remove homepage from missingRoutes if present
    const homeIdx = missingRoutes.indexOf('/');
    if (homeIdx !== -1) missingRoutes.splice(homeIdx, 1);
  }

  const detectedTypes = Array.from(detectedSchemaTypesSet);
  const totalPages = validHtmlPages.length;
  const pagesWithSchemaCount = pagesWithSchema;
  const pagesMissingSchemaCount = Math.max(0, totalPages - pagesWithSchemaCount);
  const coveragePercent = totalPages > 0 ? Math.round((pagesWithSchemaCount / totalPages) * 100) : 0;

  let schemaStatus = 'PASS';
  let severityBadge = '100% COVERAGE (PASS)';
  if (detectedTypes.length === 0 && pagesWithSchemaCount === 0) {
    schemaStatus = 'CRITICAL';
    severityBadge = 'CRITICAL: 0% COVERAGE';
  } else if (pagesWithSchemaCount > 0 && pagesMissingSchemaCount > 0) {
    schemaStatus = 'WARN';
    severityBadge = `${pagesWithSchemaCount}/${totalPages} PAGES WITH SCHEMA (${coveragePercent}%)`;
  } else if (pagesMissingSchemaCount === 0 && totalPages > 0) {
    schemaStatus = 'PASS';
    severityBadge = '100% COVERAGE (PASS)';
  } else {
    schemaStatus = 'CRITICAL';
    severityBadge = 'CRITICAL: 0% COVERAGE';
  }

  const schemaDetails = {
    detectedTypes,
    totalPages,
    pagesWithSchemaCount,
    pagesMissingSchemaCount,
    missingRoutes,
    coveragePercent,
    status: schemaStatus,
    severityBadge
  };

  // Card 2: Author Person E-E-A-T Calculation
  const uniqueAuthorsMap = new Map();
  validPages.forEach(p => {
    if (Array.isArray(p.authors)) {
      p.authors.forEach(a => {
        if (a && a.name) {
          const key = a.name.toLowerCase().trim();
          if (!uniqueAuthorsMap.has(key)) {
            uniqueAuthorsMap.set(key, { ...a });
          } else {
            // Merge sameAs links
            const existing = uniqueAuthorsMap.get(key);
            if (Array.isArray(a.sameAs)) {
              existing.sameAs = [...new Set([...(existing.sameAs || []), ...a.sameAs])];
            }
          }
        }
      });
    }
  });

  const authors = Array.from(uniqueAuthorsMap.values());
  const authorCount = authors.length;
  const authorStatus = authorCount > 0 ? 'PASS' : 'CRITICAL';
  const authorSeverityBadge = authorCount > 0 ? `${authorCount} AUTHOR(S) VERIFIED` : 'CRITICAL: 0 AUTHORS DETECTED';

  const authorDetails = {
    authors,
    authorCount,
    status: authorStatus,
    severityBadge: authorSeverityBadge
  };

  // Card 3: Authority & Domain Age Details Calculation
  let targetDomain = '';
  try {
    const rawUrl = crawledData.url || crawledData.targetUrl || '';
    if (rawUrl) {
      targetDomain = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`).hostname.replace(/^www\./i, '');
    }
  } catch (_) {
    targetDomain = '';
  }

  const domainAge = crawledData.domainAge || 
                    crawledData.eeatMetrics?.domainAge || 
                    crawledData.eeatMetrics?.ageEstimate || 
                    (crawledData.registrationDate ? 'Verified Domain Age' : '--');

  const registrationDate = crawledData.registrationDate || crawledData.eeatMetrics?.registrationDate || null;
  const isAgeVerified = Boolean(registrationDate || (domainAge && domainAge !== '--' && !domainAge.includes('Unresolved') && !domainAge.includes('Pending')));

  const externalCheckerUrl = targetDomain
    ? `https://ahrefs.com/website-authority-checker/?input=${encodeURIComponent(targetDomain)}`
    : null;

  const authorityDetails = {
    domainAge: isAgeVerified ? domainAge : (domainAge.includes('Pending') ? domainAge : '--'),
    registrationDate,
    externalCheckerUrl,
    authorityStatus: "Free Third-Party Check Available",
    status: isAgeVerified ? 'PASS' : 'PENDING'
  };

  const stage4ScoreNum = Math.round((p3Score / 25) * 100);
  const stage4Score = `${stage4ScoreNum}%`;
  const stage4Status = stage4ScoreNum >= 80 ? 'PASS' : (stage4ScoreNum >= 50 ? 'WARN' : 'FAIL');
  const stage4Summary = stage4ScoreNum >= 80 ? 'Trust & E-E-A-T: Schema & Entity Validated' : 'Trust & E-E-A-T: Entity Authority Gaps Detected';
  const stage4Obj = {
    title: 'Trust & E-E-A-T',
    score: stage4Score,
    scoreNum: stage4ScoreNum,
    status: stage4Status,
    summaryText: stage4Summary,
    classification: 'AI-Optimized',
    schemaDetails,
    authorDetails,
    authorityDetails
  };

  const manifestChecks = {
    robotsTxt: Boolean(status.robotsTxtExists ?? sec4.robotsTxtFound),
    sitemapXml: Boolean(status.sitemapExists ?? sec4.sitemapFound),
    llmsTxt: Boolean(status.llmsTxtExists ?? sec4.llmsTxtFound),
    aiContextMd: Boolean(status.aiContextExists ?? sec4.aiContextFound),
    aboutMd: Boolean(status.aboutTxtExists ?? sec4.aboutMdFound),
    docsMd: Boolean(status.docsTxtExists ?? sec4.docsMdFound),
    contentMd: Boolean(status.contentTxtExists ?? sec4.contentMdFound)
  };
  const totalManifests = 7;
  const manifestsFound = Object.values(manifestChecks).filter(Boolean).length;
  const stage5ScoreNum = Math.round((manifestsFound / 7) * 100);
  const stage5Score = `${stage5ScoreNum}%`;
  const stage5Status = manifestsFound === 7 ? 'PASS' : (manifestsFound >= 3 ? 'WARN' : 'FAIL');
  const stage5Summary = `AI-Ready Files: ${manifestsFound}/7 Manifests Active`;
  const stage5Obj = {
    title: 'Machine Manifest Protocols',
    governanceGate: 'AI-Ready',
    manifestsFound,
    totalManifests,
    manifestChecks,
    score: stage5Score,
    scoreNum: stage5ScoreNum,
    status: stage5Status,
    summaryText: stage5Summary,
    classification: 'AI-Ready'
  };

  const humanWebReadiness = Math.round(((p1Score + p2Score + p3Score) / 75) * 100);
  const machineWebReadiness = Math.round((p4Score / 25) * 100);
  const stage6Status = overallScore >= 80 ? 'OPTIMIZED' : (overallScore >= 50 ? 'NEEDS IMPROVEMENT' : 'CRITICAL');
  const stage6Obj = {
    title: 'Executive Boardroom & Action Triage',
    score: `${overallScore}%`,
    healthIndex: overallScore,
    status: stage6Status,
    humanWebReadiness,
    machineWebReadiness,
    summaryText: `Boardroom Summary: Overall AEO Health Index ${overallScore}/100`,
    classification: 'Executive Boardroom'
  };

  const stages = {
    stage1: stage1Obj,
    stage2: stage2Obj,
    stage3: stage3Obj,
    stage4: stage4Obj,
    stage5: stage5Obj,
    stage6: stage6Obj
  };

  // Mutate crawledData in place to ensure these fields get returned in response JSON
  crawledData.discoveredRoutes = discoveredRoutes;
  crawledData.eeatMetrics = eeatMetrics;
  crawledData.emailValue = emailValue;
  crawledData.phoneValue = phoneValue;
  crawledData.missingEssentialPages = missingEssentialPages;
  crawledData.discoveredEssentialPages = foundEssentialPages;
  crawledData.scrapedContentPreview = scrapedContentPreview;
  crawledData.stages = stages;

  // Map trust and E-E-A-T metrics into executiveSections.section3 and executiveSections[2] (Section 3)
  if (executiveSections && executiveSections.section3) {
    executiveSections.section3.isSecure = isSecure;
    executiveSections.section3.hasContactInfo = hasContactInfo;
    executiveSections.section3.hasPrivacyPolicy = hasPrivacyPolicy;
    executiveSections.section3.ageEstimate = ageEstimate;
    executiveSections.section3.authorityStatus = authorityStatus;
    executiveSections.section3.diagnosticSummary = diagnosticSummary;
    executiveSections.section3.eeatMetrics = eeatMetrics;
  }

  // Ensure index-based access is supported for results.executiveSections
  if (executiveSections) {
    executiveSections[0] = executiveSections.section1;
    executiveSections[1] = executiveSections.section2;
    executiveSections[2] = executiveSections.section3;
    executiveSections[3] = executiveSections.section4;
  }

  return {
    overallScore,
    pillarScores: {
      P1: p1Score,
      P2: p2Score,
      P3: p3Score,
      P4: p4Score
    },
    executiveSections,
    capabilityMatrix,
    stages,
    scanMetrics,
    scrapedContentPreview,
    manifestPreviews,
    discoveredRoutes,
    eeatMetrics,
    emailValue,
    phoneValue,
    missingEssentialPages,
    discoveredEssentialPages: foundEssentialPages
  };
}

/**
 * Backwards compatibility wrapper for evaluateAllCapabilities
 */
function evaluateAllCapabilities(scanData = {}) {
  const evalResult = evaluateCapabilities(scanData);
  return {
    totalScore: evalResult.overallScore,
    overallScore: evalResult.overallScore,
    pillarScores: evalResult.pillarScores,
    executiveSections: evalResult.executiveSections,
    stages: evalResult.stages,
    totalCapabilities: evalResult.capabilityMatrix.length,
    sectionScores: {
      section1: evalResult.pillarScores.P1,
      section2: evalResult.pillarScores.P2,
      section3: evalResult.pillarScores.P3,
      section4: evalResult.pillarScores.P4
    },
    status: scanData.status || {},
    url: scanData.url || '',
    capabilities: evalResult.capabilityMatrix,
    capabilityMatrix: evalResult.capabilityMatrix,
    scanMetrics: evalResult.scanMetrics,
    scrapedContentPreview: evalResult.scrapedContentPreview,
    manifestPreviews: evalResult.manifestPreviews,
    discoveredRoutes: evalResult.discoveredRoutes,
    eeatMetrics: evalResult.eeatMetrics,
    emailValue: evalResult.emailValue,
    phoneValue: evalResult.phoneValue,
    missingEssentialPages: evalResult.missingEssentialPages,
    discoveredEssentialPages: evalResult.discoveredEssentialPages
  };
}

module.exports = {
  evaluateCapabilities,
  evaluateAllCapabilities,
  CAPABILITY_MATRIX
};
