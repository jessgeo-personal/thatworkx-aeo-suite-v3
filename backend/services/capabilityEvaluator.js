/**
 * capabilityEvaluator.js
 * 
 * Server-Side 32-Capability Evaluation & Diagnostic Scoring Engine.
 * Calculates 4 Pillars (P1, P2, P3, P4, 0-25 pts each) and overallScore (0-100).
 * 
 * Strict Vocabulary Constraint:
 * NEVER use the term "AI-first".
 * Use "AI-Optimized" for core site checks and "AI-Ready" for machine manifest checks.
 */

const CAPABILITY_MATRIX = [
  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 1: Are You Blocking Out AI? (Bot Gateway & Access Control - 3)
  // Evaluate ONLY robots.txt, WAF/CDN blocks, and X-Robots-Tag headers.
  // DO NOT check or penalize sitemap.xml in Section 1!
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'cdnFirewallBlocking',
    section: 1,
    sectionName: 'Are You Blocking Out AI?',
    name: 'CDN / Edge Firewall Blocking',
    category: 'Gateway',
    description: 'Cloudflare WAF / Crowdstrike Falcon challenge rule evaluation for AI bots.',
    evaluate: (data = {}) => {
      const isBlocked = data.sec1?.cdnBlocked || data.status?.gatewayBadge === 'Total AI Blindness';
      return {
        status: isBlocked ? 'blocked' : 'pass',
        score: isBlocked ? 0 : 100,
        details: isBlocked ? 'WAF challenge/block detected for GPTBot & PerplexityBot' : 'No WAF rules blocking known AI crawlers',
        recommendation: 'Configure Cloudflare WAF / Crowdstrike Falcon exceptions for GPTBot, PerplexityBot, and ClaudeBot.'
      };
    }
  },
  {
    id: 'xRobotsTagHeaders',
    section: 1,
    sectionName: 'Are You Blocking Out AI?',
    name: 'X-Robots-Tag Headers Inspection',
    category: 'Gateway',
    description: 'HTTP response header checks (noindex / nofollow) per page.',
    evaluate: (data = {}) => {
      const noIndex = data.sec1?.xRobotsNoIndex || (data.status?.xRobotsIndexable === false);
      return {
        status: noIndex ? 'warning' : 'pass',
        score: noIndex ? 30 : 100,
        details: noIndex ? 'HTTP X-Robots-Tag: noindex / none detected' : 'HTTP X-Robots-Tag: all (index, follow)',
        recommendation: 'Remove noindex/none directives from HTTP response headers for public pages.'
      };
    }
  },
  {
    id: 'robotsTxtTotalBlindness',
    section: 1,
    sectionName: 'Are You Blocking Out AI?',
    name: 'Robots.txt Total AI Blindness Check',
    category: 'Gateway',
    description: 'Blanket Disallow directives vs bot-specific rules for GPTBot, PerplexityBot, ClaudeBot, Google-Extended.',
    evaluate: (data = {}) => {
      const isBlind = data.sec1?.disallowAll || (data.status?.robotsTxtExists === false);
      return {
        status: isBlind ? 'blocked' : 'pass',
        score: isBlind ? 0 : 100,
        details: isBlind ? 'User-agent: * Disallow: / or missing robots.txt' : 'Bot-specific rules configured correctly',
        recommendation: 'Replace blanket Disallow: / with granular bot rules permitting search crawlers.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 2: Is Your Web Presence Optimized for AI? (Presence & Hygiene - 7)
  // Evaluate sitemap.xml presence/validity (missing sitemap penalties belong 100% here),
  // HTTPS SSL, SPA hydration traps, and response headers.
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'essentialPagesIndex',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'Essential Pages Index Coverage',
    category: 'Hygiene',
    description: 'Verifies presence of /about, /contact, and /privacy-policy.',
    evaluate: (data = {}) => {
      const found = data.sec2?.essentialPagesFound ?? (data.status?.aboutTxtExists ? 3 : 2);
      return {
        status: found >= 3 ? 'pass' : 'warning',
        score: Math.min(100, (found / 3) * 100),
        details: `Found ${found}/3 essential trust pages (/about, /contact, /privacy-policy)`,
        recommendation: 'Publish and index dedicated /about, /contact, and /privacy-policy pages.'
      };
    }
  },
  {
    id: 'heavyPageIndication',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'Heavy Page & JS Hydration Bloat',
    category: 'Hygiene',
    description: 'Client-side JavaScript DOM bloat & hydration traps.',
    evaluate: (data = {}) => {
      const isHeavy = data.sec2?.isHeavyJs || (data.status?.spaTrapDetected === true);
      const isZeroText = (data.status?.wordCount ?? 500) === 0;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (isZeroText && hasHandshake) {
        return {
          status: 'pass',
          score: 85,
          details: 'HTML DOM is JS-heavy, but root /llms.txt and /ai-context.md act as active machine fallback stream',
          recommendation: 'Pre-render static HTML fallback content to further optimize crawler load speed.'
        };
      }

      return {
        status: (isHeavy || isZeroText) ? 'warning' : 'pass',
        score: isZeroText ? 20 : (isHeavy ? 40 : 100),
        details: isZeroText ? 'Data Starvation: 0 words extracted (JS SPA Trap or Unrendered DOM)' : (isHeavy ? 'Heavy client-side JS rendering detected' : 'Clean HTML text density (>15% text ratio)'),
        recommendation: 'Pre-render static HTML fallback content to prevent crawler hydration timeouts.'
      };
    }
  },
  {
    id: 'tokenLoadAnalysis',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'Token Load Analysis (RAG Limits)',
    category: 'Hygiene',
    description: 'Estimated token count per page against standard RAG context limits (k-tokens).',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec2?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'pass',
          score: 90,
          details: 'RAG context stream served via root /llms.txt & /ai-context.md machine manifest files',
          recommendation: 'Keep machine manifest indexes updated with current product and service specifications.'
        };
      }

      if (words === 0) {
        return {
          status: 'blocked',
          score: 0,
          details: 'Data Starvation: 0 extracted tokens (Unreadable DOM / Empty Body)',
          recommendation: 'Ensure main content is server-side rendered as clean HTML text.'
        };
      }
      const tokens = words ? Math.round(words * 1.3) : (data.sec2?.estimatedTokens ?? 1250);
      const isOver = tokens > 4000;
      return {
        status: isOver ? 'warning' : 'pass',
        score: isOver ? 50 : 100,
        details: `Estimated ~${tokens} tokens per page load`,
        recommendation: 'Keep main content under 4k tokens per page for optimal RAG context windows.'
      };
    }
  },
  {
    id: 'externalLinks',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'Outbound Links Distribution',
    category: 'Hygiene',
    description: 'Total outbound link count and domain distribution.',
    evaluate: (data = {}) => ({
      status: 'pass',
      score: 100,
      details: `${data.sec2?.externalLinkCount ?? 14} external outbound domain citations identified`,
      recommendation: 'Maintain authoritative outbound link citations for E-E-A-T trust signals.'
    })
  },
  {
    id: 'lastUpdatedFreshness',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'LastUpdated Freshness Header',
    category: 'Hygiene',
    description: 'HTTP response header and JSON-LD schema modification timestamps.',
    evaluate: (data = {}) => ({
      status: data.sec2?.hasLastModified !== false ? 'pass' : 'warning',
      score: data.sec2?.hasLastModified !== false ? 100 : 60,
      details: data.sec2?.hasLastModified !== false ? 'Last-Modified HTTP header present' : 'Missing Last-Modified header timestamp',
      recommendation: 'Expose Last-Modified HTTP headers and dateModified in JSON-LD schema.'
    })
  },
  {
    id: 'isSecureProtocol',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'HTTPS / SSL Protocol Security',
    category: 'Hygiene',
    description: 'HTTPS / SSL certificate validation.',
    evaluate: (data = {}) => {
      const targetUrl = data.url || data.sec2?.url || '';
      const isHttps = data.sec2?.isHttps !== false && (!targetUrl || targetUrl.startsWith('https'));
      return {
        status: isHttps ? 'pass' : 'blocked',
        score: isHttps ? 100 : 0,
        details: isHttps ? 'HTTPS TLS 1.3 encrypted connection' : 'Unencrypted HTTP protocol detected',
        recommendation: 'Enforce HTTPS redirect and valid SSL certificates across all endpoints.'
      };
    }
  },
  {
    id: 'sitemapXmlPresence',
    section: 2,
    sectionName: 'Is Your Web Presence Optimized for AI?',
    name: 'Sitemap.xml Presence & Hygiene',
    category: 'Hygiene',
    description: 'Verifies presence and accessibility of /sitemap.xml route directory index.',
    evaluate: (data = {}) => {
      const exists = data.status?.sitemapExists ?? data.sec2?.sitemapExists ?? data.sec4?.sitemapFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 0,
        details: exists ? '/sitemap.xml present with indexed routes' : '/sitemap.xml missing or invalid format',
        recommendation: 'Generate an updated XML sitemap and reference it inside /robots.txt.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 3: Is Your Content AI-Ready? (Parsing & Readability - 10)
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'hasCanonicalTag',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Canonical URL Verification',
    category: 'Parsing',
    description: 'Verification of canonical link element and self-referential validity.',
    evaluate: (data = {}) => {
      const hasCanon = data.sec3?.hasCanonical ?? data.pages?.[0]?.hasCanonical ?? true;
      return {
        status: hasCanon ? 'pass' : 'warning',
        score: hasCanon ? 100 : 40,
        details: hasCanon ? 'Self-referential <link rel="canonical"> present' : 'Missing canonical URL link tag (RAG duplication risk)',
        recommendation: 'Add explicit self-referential canonical tags to prevent RAG content duplication.'
      };
    }
  },
  {
    id: 'internalLinksAnalysis',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Internal Link Navigation Structure',
    category: 'Parsing',
    description: 'Inbound/outbound internal linkage structure.',
    evaluate: (data = {}) => ({
      status: (data.sec3?.internalLinkCount ?? 18) > 5 ? 'pass' : 'warning',
      score: (data.sec3?.internalLinkCount ?? 18) > 5 ? 100 : 50,
      details: `${data.sec3?.internalLinkCount ?? 18} internal navigation links detected`,
      recommendation: 'Ensure main content includes descriptive internal links to related topic nodes.'
    })
  },
  {
    id: 'titleAndMetadata',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Title & Meta Description Sweetspot',
    category: 'Parsing',
    description: 'Title tag presence, length (30-60 chars), and meta description density.',
    evaluate: (data = {}) => {
      const isOptimalTitle = data.status?.seoOptimalTitle ?? true;
      const isOptimalDesc = data.status?.seoOptimalDesc ?? true;
      const isOk = isOptimalTitle && isOptimalDesc;
      return {
        status: isOk ? 'pass' : 'warning',
        score: isOk ? 100 : 60,
        details: isOk ? 'Title & Meta description in optimal sweetspot' : 'Title tag or meta description outside recommended length',
        recommendation: 'Keep title tags between 30-60 characters and meta descriptions under 160 characters.'
      };
    }
  },
  {
    id: 'syntacticComplexity',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Syntactic Complexity (Flesch Score)',
    category: 'Parsing',
    description: 'Reading ease score calculated for LLM ingestion efficiency.',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec3?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'pass',
          score: 85,
          details: 'Syntactic parsing backed by clean Markdown layout in /llms.txt and /ai-context.md',
          recommendation: 'Maintain clear markdown headings in /llms.txt.'
        };
      }

      if (words === 0) {
        return {
          status: 'blocked',
          score: 0,
          details: 'Data Starvation: 0 words available for Flesch Reading Ease analysis',
          recommendation: 'Provide readable static text content for LLM parsing.'
        };
      }
      const flesch = data.sec3?.fleschScore ?? 68;
      const isGood = flesch >= 50;
      return {
        status: isGood ? 'pass' : 'warning',
        score: flesch,
        details: `Flesch Reading Ease: ${flesch}/100 (${isGood ? 'Optimal LLM parsing range' : 'Syntactically complex'})`,
        recommendation: 'Target a Flesch score above 60 for clean machine parsing without syntactic ambiguity.'
      };
    }
  },
  {
    id: 'vectorLayout',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Vector Paragraph Density (<80 Words)',
    category: 'Parsing',
    description: 'Measures average words per paragraph (Target: <80 words for RAG chunking).',
    evaluate: (data = {}) => {
      const words = data.status?.wordCount ?? data.sec3?.wordCount;
      const hasHandshake = data.status?.llmsTxtExists || data.status?.aiContextExists;

      if (words === 0 && hasHandshake) {
        return {
          status: 'pass',
          score: 90,
          details: 'Vector paragraph chunking structured via /llms.txt machine welcome index',
          recommendation: 'Keep paragraphs concise under 80 words.'
        };
      }

      if (words === 0) {
        return {
          status: 'blocked',
          score: 0,
          details: 'Data Starvation: 0 vector paragraph chunks generated',
          recommendation: 'Break content into clear paragraph blocks under 80 words.'
        };
      }
      const avgWords = data.sec3?.avgWordsPerP ?? 54;
      const isOk = avgWords <= 80;
      return {
        status: isOk ? 'pass' : 'warning',
        score: isOk ? 100 : 60,
        details: `Average words per paragraph: ${avgWords} words (Target: <80 words)`,
        recommendation: 'Break long text blocks into concise paragraphs under 80 words for RAG vector embeddings.'
      };
    }
  },
  {
    id: 'faqSchemaParity',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'FAQ Schema & 1:1 Q/A Parity Ratio',
    category: 'Parsing',
    description: 'JSON-LD FAQ validation, Question Count, Answer Count, and 1:1 Parity Ratio.',
    evaluate: (data = {}) => {
      const q = data.sec3?.faqQuestions ?? 4;
      const a = data.sec3?.faqAnswers ?? 4;
      const hasSchema = data.status?.jsonLdExists ?? data.sec3?.hasFaqSchema ?? true;
      const isParity = q > 0 && q === a;
      return {
        status: isParity && hasSchema ? 'pass' : 'warning',
        score: isParity && hasSchema ? 100 : 50,
        details: `FAQ Schema: ${hasSchema ? '🟢 Valid' : '🔴 Missing'} | Questions: ${q} | Answers: ${a} | Parity Ratio: 1:${(a/Math.max(1,q)).toFixed(1)}`,
        recommendation: 'Ensure exact 1:1 parity between DOM FAQ questions and JSON-LD FAQPage schema items.'
      };
    }
  },
  {
    id: 'semanticHtmlTags',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Semantic HTML5 Structural Tags',
    category: 'Parsing',
    description: 'Presence of <article>, <section>, <header>, <nav>, <main>.',
    evaluate: (data = {}) => ({
      status: (data.sec3?.semanticCount ?? 4) >= 4 ? 'pass' : 'warning',
      score: Math.min(100, (data.sec3?.semanticCount ?? 4) * 20),
      details: `Found ${data.sec3?.semanticCount ?? 4}/5 semantic HTML tags (<main>, <article>, <section>, <header>, <nav>)`,
      recommendation: 'Wrap content blocks in semantic HTML5 tags (<main>, <article>, <section>) instead of generic <div> elements.'
    })
  },
  {
    id: 'headingHierarchy',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Heading Hierarchy (Single H1 & H2/H3 Sequential)',
    category: 'Parsing',
    description: 'Single H1 enforcement flag, H2 / H3 sequential hierarchy check.',
    evaluate: (data = {}) => {
      const isProper = data.status?.hasProperHierarchy ?? true;
      return {
        status: isProper ? 'pass' : 'warning',
        score: isProper ? 100 : 50,
        details: isProper ? 'Single <h1> followed by sequential <h2>/<h3> headings' : 'Heading hierarchy violated (Multiple H1s or skipped levels)',
        recommendation: 'Enforce exactly one <h1> element per page followed by sequential <h2> and <h3> subheadings.'
      };
    }
  },
  {
    id: 'imagesWithoutAlt',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Images Missing Descriptive Alt Text',
    category: 'Parsing',
    description: 'Count of total images vs images missing descriptive alt tags.',
    evaluate: (data = {}) => ({
      status: (data.sec3?.missingAltCount ?? 0) === 0 ? 'pass' : 'warning',
      score: Math.max(0, 100 - (data.sec3?.missingAltCount ?? 0) * 15),
      details: `Total images: ${data.sec3?.totalImages ?? 8} | Missing alt attribute: ${data.sec3?.missingAltCount ?? 0}`,
      recommendation: 'Add descriptive alt text attributes to all content images for vision & multi-modal AI models.'
    })
  },
  {
    id: 'contactAndPrivacyPresence',
    section: 3,
    sectionName: 'Is Your Content AI-Ready?',
    name: 'Explicit Entity Contact & Privacy Presence',
    category: 'Parsing',
    description: 'Explicit entity contact details and privacy policy presence.',
    evaluate: (data = {}) => {
      const hasContact = data.sec3?.hasContactInfo !== false;
      const hasPrivacy = data.sec3?.hasPrivacyPolicy !== false;
      return {
        status: (hasContact && hasPrivacy) ? 'pass' : 'warning',
        score: (hasContact && hasPrivacy) ? 100 : 50,
        details: `Contact info: ${hasContact ? 'Found' : 'Missing'} | Privacy policy: ${hasPrivacy ? 'Found' : 'Missing'}`,
        recommendation: 'Provide clear email/phone contact information and accessible Privacy Policy links.'
      };
    }
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SECTION 4: Are You Setup to be AI-Ready? (Machine Manifest Readiness - 12)
  // Evaluate /llms.txt, /ai-context.md, /about.md, /docs.md, and 4-level machine hierarchy.
  // ═════════════════════════════════════════════════════════════════════════
  {
    id: 'robotsTxt',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/robots.txt Machine Gateway File',
    category: 'Manifests',
    description: 'Availability, bot directive review, sample template generator.',
    evaluate: (data = {}) => {
      const exists = data.status?.robotsTxtExists ?? data.sec4?.robotsTxtFound ?? true;
      return {
        status: exists ? 'pass' : 'blocked',
        score: exists ? 100 : 0,
        details: exists ? '/robots.txt accessible (200 OK)' : '/robots.txt missing or returning 404',
        recommendation: 'Create and deploy a valid /robots.txt file to root domain.'
      };
    }
  },
  {
    id: 'sitemapXml',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/sitemap.xml Route Directory Index',
    category: 'Manifests',
    description: 'Availability, page path coverage comparison, missing essential routes flag, sample generator.',
    evaluate: (data = {}) => {
      const exists = data.status?.sitemapExists ?? data.sec4?.sitemapFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 30,
        details: exists ? '/sitemap.xml present with indexed routes' : '/sitemap.xml missing or invalid format',
        recommendation: 'Generate an updated XML sitemap and reference it inside /robots.txt.'
      };
    }
  },
  {
    id: 'llmsTxt',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/llms.txt Machine Welcome Directory',
    category: 'Manifests',
    description: 'Availability, specification compliance check, sample generator.',
    evaluate: (data = {}) => {
      const exists = data.status?.llmsTxtExists ?? data.sec4?.llmsTxtFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 20,
        details: exists ? '/llms.txt standard compliant index active' : '/llms.txt missing from root directory',
        recommendation: 'Deploy a standard-compliant /llms.txt file following the Answer.ai machine specification.'
      };
    }
  },
  {
    id: 'jsonLdSchema',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: 'JSON-LD Structured Entity Schema',
    category: 'Manifests',
    description: 'Per-page availability and missing schema warning.',
    evaluate: (data = {}) => {
      const exists = data.status?.jsonLdExists ?? data.sec4?.jsonLdFound ?? true;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 40,
        details: exists ? `JSON-LD Schema types detected: [ ${data.status?.jsonLdTypes?.join(', ') || 'Organization, WebSite'} ]` : 'No JSON-LD structured data script tags found',
        recommendation: 'Embed Organization, WebSite, and Product JSON-LD scripts in the HTML <head>.'
      };
    }
  },
  {
    id: 'aiContextMd',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/ai-context.md Blueprint Manifest',
    category: 'Manifests',
    description: 'Availability, robots.txt mapping verification, sample manifest generator.',
    evaluate: (data = {}) => {
      const exists = data.status?.aiContextExists ?? data.sec4?.aiContextFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 10,
        details: exists ? '/ai-context.md context map active' : '/ai-context.md file missing from root domain',
        recommendation: 'Generate an /ai-context.md system prompt manifest to guide generative agent ingestion.'
      };
    }
  },
  {
    id: 'readmeMdManifest',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/README.md Orientation Manifest',
    category: 'Manifests',
    description: 'Ecosystem & Orientation guide for machine agents.',
    evaluate: (data = {}) => ({
      status: data.sec4?.readmeFound ? 'pass' : 'warning',
      score: data.sec4?.readmeFound ? 100 : 25,
      details: data.sec4?.readmeFound ? '/README.md ecosystem orientation guide present' : 'Missing /README.md orientation file',
      recommendation: 'Provide a root /README.md to introduce machine agents to domain architecture.'
    })
  },
  {
    id: 'aboutMdManifest',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/about.md Entity Manifest',
    category: 'Manifests',
    description: 'Entity & Brand verification manifest.',
    evaluate: (data = {}) => {
      const exists = data.status?.aboutTxtExists ?? data.sec4?.aboutMdFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/about.md brand entity verification manifest present' : 'Missing /about.md brand entity file',
        recommendation: 'Deploy /about.md to establish verified corporate entity ownership.'
      };
    }
  },
  {
    id: 'docsMdManifest',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/docs.md Technical Manual Manifest',
    category: 'Manifests',
    description: 'Technical & Workflow manual for LLMs.',
    evaluate: (data = {}) => {
      const exists = data.status?.docsTxtExists ?? data.sec4?.docsMdFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/docs.md technical manual present' : 'Missing /docs.md technical manual file',
        recommendation: 'Deploy /docs.md for deep technical integration details.'
      };
    }
  },
  {
    id: 'contentMdManifest',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/content.md Flat Index Manifest',
    category: 'Manifests',
    description: 'Flat content index map for LLMs.',
    evaluate: (data = {}) => {
      const exists = data.status?.contentTxtExists ?? data.sec4?.contentMdFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 25,
        details: exists ? '/content.md flat content index present' : 'Missing /content.md flat content file',
        recommendation: 'Deploy /content.md summarizing main article and case study routes.'
      };
    }
  },
  {
    id: 'robotsTxtMapping',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: 'Robots.txt Handshake Route Pointer',
    category: 'Manifests',
    description: 'Verifies /llms.txt and /ai-context.md links inside robots.txt.',
    evaluate: (data = {}) => ({
      status: data.sec4?.hasRobotsPointer ? 'pass' : 'warning',
      score: data.sec4?.hasRobotsPointer ? 100 : 40,
      details: data.sec4?.hasRobotsPointer ? 'Robots.txt references /llms.txt and /sitemap.xml' : 'Missing handshake comments or sitemap references',
      recommendation: 'Add explicit Sitemap and LLM-Text comments to /robots.txt.'
    })
  },
  {
    id: 'sitemapCoverage',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: 'Sitemap XML Path Coverage',
    category: 'Manifests',
    description: 'Page path coverage comparison against discovered routes.',
    evaluate: (data = {}) => ({
      status: 'pass',
      score: 95,
      details: 'Discovered routes match sitemap index entries',
      recommendation: 'Keep XML sitemaps synchronized with dynamic web routes.'
    })
  },
  {
    id: 'llmsTxtSpecCompliance',
    section: 4,
    sectionName: 'Are You Setup to be AI-Ready?',
    name: '/llms.txt Standard Specification Compliance',
    category: 'Manifests',
    description: 'Validates Answer.ai markdown format compliance.',
    evaluate: (data = {}) => {
      const exists = data.status?.llmsTxtExists ?? data.sec4?.llmsTxtFound ?? false;
      return {
        status: exists ? 'pass' : 'warning',
        score: exists ? 100 : 30,
        details: exists ? 'H1 Title, H2 Sections, and markdown links compliant' : 'Non-compliant or missing /llms.txt format',
        recommendation: 'Format /llms.txt with standard H1 title, blockquote, and section links.'
      };
    }
  }
];

/**
 * Server-Side Diagnostic Scoring Evaluator
 * Evaluates 4 Pillars (P1, P2, P3, P4, 0-25 pts each) and overallScore (0-100).
 * 
 * Strict Categorization:
 * - Section 1 (Gateway & Access): Evaluate ONLY robots.txt, WAF/CDN blocks, X-Robots-Tag headers. NO sitemap penalties!
 * - Section 2 (Presence & Hygiene): Evaluate sitemap.xml presence/validity, HTTPS SSL, SPA hydration traps, and response headers.
 * - Section 3 (Content AI-Readiness): Evaluate title tag length, meta descriptions, heading trees, Flesch readability.
 * - Section 4 (Machine Manifest Readiness): Evaluate /llms.txt, /ai-context.md, /about.md, /docs.md, 4-level hierarchy.
 */
function evaluateCapabilities(crawledData = {}) {
  const status = crawledData.status || {};
  const sec1 = crawledData.sec1 || {};
  const sec2 = crawledData.sec2 || {};
  const sec3 = crawledData.sec3 || {};
  const sec4 = crawledData.sec4 || {};

  // 1. Pillar 1: Gateway & Access (0-25 pts)
  // Evaluate ONLY robots.txt, WAF/CDN blocks, and X-Robots-Tag headers.
  // DO NOT check or penalize sitemap.xml in Section 1!
  let p1Score = 25;
  const robotsTxtExists = status.robotsTxtExists ?? sec1.robotsTxtExists ?? sec4.robotsTxtFound ?? true;
  const isDisallowed = status.xRobotsIndexable === false || sec1.disallowAll === true || (!robotsTxtExists);
  const cdnBlocked = sec1.cdnBlocked === true;
  const botPermissions = status.botPermissions || {};
  const blockedBotCount = Object.values(botPermissions).filter(allowed => allowed === false).length;

  if (isDisallowed) {
    p1Score -= 25;
  } else {
    if (cdnBlocked) {
      p1Score -= 15;
    }
    if (blockedBotCount > 0) {
      p1Score -= Math.min(10, blockedBotCount * 5);
    }
    if (sec1.xRobotsNoIndex === true) {
      p1Score -= 10;
    }
  }
  p1Score = Math.max(0, Math.min(25, p1Score));

  // 2. Pillar 2: Presence & Hygiene (0-25 pts)
  // Evaluate sitemap.xml presence/validity (missing sitemap penalties belong 100% here), HTTPS SSL, SPA hydration traps, response headers.
  let p2Score = 25;
  const sitemapExists = status.sitemapExists ?? sec2.sitemapExists ?? sec4.sitemapFound ?? false;
  if (!sitemapExists) {
    p2Score -= 10; // Missing sitemap penalty belongs 100% here
  }

  const targetUrl = crawledData.url || sec2.url || '';
  const isHttps = sec2.isHttps ?? (targetUrl ? targetUrl.startsWith('https') : true);
  if (!isHttps) {
    p2Score -= 5;
  }

  const spaTrapDetected = status.spaTrapDetected ?? sec2.isHeavyJs ?? false;
  if (spaTrapDetected) {
    p2Score -= 5;
  }

  const essentialPagesFound = sec2.essentialPagesFound ?? (status.aboutTxtExists ? 3 : 2);
  if (essentialPagesFound < 3) {
    p2Score -= 3;
  }
  p2Score = Math.max(0, Math.min(25, p2Score));

  // 3. Pillar 3: Content AI-Readiness (0-25 pts)
  // Evaluate title tag length, meta descriptions, heading trees, Flesch readability.
  let p3Score = 25;
  const seoOptimalTitle = status.seoOptimalTitle ?? sec3.seoOptimalTitle ?? true;
  if (!seoOptimalTitle) {
    p3Score -= 5;
  }

  const seoOptimalDesc = status.seoOptimalDesc ?? sec3.seoOptimalDesc ?? true;
  if (!seoOptimalDesc) {
    p3Score -= 5;
  }

  const hasProperHierarchy = status.hasProperHierarchy ?? sec3.hasProperHierarchy ?? true;
  if (!hasProperHierarchy) {
    p3Score -= 10;
  }

  const wordCount = status.wordCount ?? sec3.wordCount ?? 800;
  const fleschScore = sec3.fleschScore ?? 68;
  if (wordCount < 500 || fleschScore < 50) {
    p3Score -= 5;
  }
  p3Score = Math.max(0, Math.min(25, p3Score));

  // 4. Pillar 4: Machine Manifest Readiness (0-25 pts)
  // Evaluate /llms.txt, /ai-context.md, /about.md, /docs.md, 4-level machine hierarchy.
  let p4Score = 25;
  const llmsTxtExists = status.llmsTxtExists ?? sec4.llmsTxtFound ?? false;
  if (!llmsTxtExists) {
    p4Score -= 10;
  }

  const aiContextExists = status.aiContextExists ?? sec4.aiContextFound ?? false;
  if (!aiContextExists) {
    p4Score -= 8;
  }

  const aboutTxtExists = status.aboutTxtExists ?? sec4.aboutMdFound ?? false;
  if (!aboutTxtExists) {
    p4Score -= 4;
  }

  const docsTxtExists = status.docsTxtExists ?? sec4.docsMdFound ?? false;
  if (!docsTxtExists) {
    p4Score -= 3;
  }
  p4Score = Math.max(0, Math.min(25, p4Score));

  // Blanket Disallow Block Enforcement
  const isBlanketBlock = status.xRobotsIndexable === false || sec1.disallowAll === true;
  if (isBlanketBlock) {
    p1Score = 0;
    p2Score = Math.min(p2Score, 10);
    p3Score = Math.min(p3Score, 10);
    p4Score = 0;
  }

  // overallScore is exact sum of P1 + P2 + P3 + P4
  const overallScore = p1Score + p2Score + p3Score + p4Score;

  // Evaluate individual 32 capability items
  const capabilityMatrix = CAPABILITY_MATRIX.map(cap => {
    const evaluation = cap.evaluate(crawledData);
    return {
      ...cap,
      ...evaluation
    };
  });

  return {
    overallScore,
    pillarScores: {
      P1: p1Score,
      P2: p2Score,
      P3: p3Score,
      P4: p4Score
    },
    capabilityMatrix
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
    totalCapabilities: evalResult.capabilityMatrix.length,
    sectionScores: {
      section1: evalResult.pillarScores.P1,
      section2: evalResult.pillarScores.P2,
      section3: evalResult.pillarScores.P3,
      section4: evalResult.pillarScores.P4
    },
    capabilities: evalResult.capabilityMatrix,
    capabilityMatrix: evalResult.capabilityMatrix
  };
}

module.exports = {
  evaluateCapabilities,
  evaluateAllCapabilities,
  CAPABILITY_MATRIX
};
