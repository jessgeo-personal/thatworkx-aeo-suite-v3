import { evaluateOptimizeAccess, normalizeDomain } from './subscriptionGateService.js';

/**
 * Extracts title from HTML string
 */
function extractTitle(html) {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match ? match[1].trim() : '';
}

/**
 * Extracts meta description from HTML string
 */
function extractMetaDescription(html) {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["'][^>]*>/i) ||
                html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["'][^>]*>/i);
  return match ? match[1].trim() : '';
}

/**
 * Extracts canonical URL from HTML string
 */
function extractCanonicalUrl(html, fallbackUrl) {
  const match = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']*)["'][^>]*>/i);
  return match ? match[1].trim() : fallbackUrl;
}

/**
 * Extracts headings (h1, h2, h3) from HTML
 */
function extractHeadings(html) {
  const headingRegex = /<h([1-3])[^>]*>([\s\S]*?)<\/h\1>/gi;
  const headings = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const text = match[2].replace(/<[^>]+>/g, '').trim();
    if (text) headings.push(text);
  }
  return headings;
}

/**
 * Extracts clean main text content from HTML body (strips head, scripts, styles, headings, nav, footer)
 */
function extractMainText(html) {
  let cleaned = html.replace(/<head\b[^<]*(?:(?!<\/head>)<[^<]*)*<\/head>/gi, ' ');
  cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, ' ');
  cleaned = cleaned.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, ' ');
  cleaned = cleaned.replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, ' ');
  cleaned = cleaned.replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, ' ');
  cleaned = cleaned.replace(/<h[1-6]\b[^<]*(?:(?!<\/h[1-6]>)<[^<]*)*<\/h[1-6]>/gi, ' ');
  cleaned = cleaned.replace(/<[^>]+>/g, ' ');
  return cleaned.replace(/\s+/g, ' ').trim();
}

/**
 * 1. Website Source Ingestion
 * Enforces tier gating, headless review policy, and zero-fallback on crawl failure
 */
export async function ingestWebsiteSource(params = {}) {
  if (!params || typeof params !== 'object') {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'WEBSITE_UNREACHABLE',
      canInitiateRescan: true,
      message: 'Failed to crawl website source.'
    };
  }

  const {
    url,
    user = {},
    requestHeadless = false,
    htmlContent,
    _htmlStub,
    mockFetch,
    simulatedError
  } = params;

  // Check simulated failure or unreachable condition
  if (simulatedError) {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'WEBSITE_UNREACHABLE',
      canInitiateRescan: true,
      message: 'Failed to crawl website source.'
    };
  }

  if (!url || typeof url !== 'string') {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'WEBSITE_UNREACHABLE',
      canInitiateRescan: true,
      message: 'Failed to crawl website source.'
    };
  }

  const domain = normalizeDomain(url);
  if (!domain) {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'WEBSITE_UNREACHABLE',
      canInitiateRescan: true,
      message: 'Failed to crawl website source.'
    };
  }

  // Check access permissions and scan mode via subscription gate
  const access = evaluateOptimizeAccess(user, domain, { requestHeadless });
  if (!access.allowed && access.errorCode === 'DOMAIN_SUBSCRIPTION_REQUIRED') {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: access.errorCode,
      canInitiateRescan: false,
      message: access.message
    };
  }

  // Ingestion execution: use provided stub/htmlContent or fetch
  let html = _htmlStub || htmlContent;
  let statusCode = params.status || 200;

  if (!html) {
    try {
      if (typeof mockFetch === 'function') {
        const response = await mockFetch(url);
        statusCode = response.status || 200;
        if (statusCode >= 400) {
          throw new Error(`HTTP_${statusCode}`);
        }
        html = await response.text();
      } else {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 8000);
        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'User-Agent': 'AEO-Optimize-Bot/3.0' }
        });
        clearTimeout(timeout);
        statusCode = response.status;
        if (!response.ok) {
          throw new Error(`HTTP_${response.status}`);
        }
        html = await response.text();
      }
    } catch {
      return {
        success: false,
        source: 'WEBSITE',
        state: 'UNAUDITED',
        displayValue: '--',
        errorCode: 'WEBSITE_UNREACHABLE',
        canInitiateRescan: true,
        message: 'Failed to crawl website source.'
      };
    }
  }

  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    return {
      success: false,
      source: 'WEBSITE',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'WEBSITE_UNREACHABLE',
      canInitiateRescan: true,
      message: 'Website returned empty response body.'
    };
  }

  const title = extractTitle(html);
  const description = extractMetaDescription(html);
  const canonicalUrl = extractCanonicalUrl(html, url);
  const headings = extractHeadings(html);
  const mainText = extractMainText(html);

  return {
    success: true,
    source: 'WEBSITE',
    scanMode: access.scanMode || 'STATIC_ONLY',
    allowHeadless: Boolean(access.allowHeadless),
    tier: access.tier || 'TRIAL',
    metadata: {
      domain,
      title,
      description,
      headings,
      mainText,
      canonicalUrl,
      status: statusCode
    }
  };
}

/**
 * 2. GitHub Repository Source Ingestion
 * Normalizes repository files and enforces zero mock fallback on missing repo
 */
export function ingestGitHubSource(params = {}) {
  if (!params || typeof params !== 'object') {
    return {
      success: false,
      source: 'GITHUB',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'GITHUB_REPO_UNREACHABLE',
      canInitiateRescan: true,
      message: 'GitHub repository not found or inaccessible.'
    };
  }

  const { repoUrl, repoString, files = [], simulatedError } = params;

  if (simulatedError) {
    return {
      success: false,
      source: 'GITHUB',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'GITHUB_REPO_UNREACHABLE',
      canInitiateRescan: true,
      message: 'GitHub repository not found or inaccessible.'
    };
  }

  let targetRepo = repoString || '';

  if (!targetRepo && repoUrl && typeof repoUrl === 'string') {
    const match = repoUrl.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
    targetRepo = match.trim();
  }

  // Validate owner/repo pattern
  const repoPattern = /^[a-zA-Z0-9_\-\.]+\/[a-zA-Z0-9_\-\.]+$/;
  if (!targetRepo || !repoPattern.test(targetRepo)) {
    return {
      success: false,
      source: 'GITHUB',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'GITHUB_REPO_UNREACHABLE',
      canInitiateRescan: true,
      message: 'GitHub repository not found or inaccessible.'
    };
  }

  // Build normalized files map and list
  const ingestedFilesMap = {};
  const normalizedFilesList = [];

  if (Array.isArray(files)) {
    files.forEach(f => {
      if (f && f.path && typeof f.content === 'string') {
        ingestedFilesMap[f.path] = f.content;
        normalizedFilesList.push(f);
      }
    });
  }

  return {
    success: true,
    source: 'GITHUB',
    repo: targetRepo,
    branch: params.branch || 'main',
    files: normalizedFilesList,
    ingestedFilesMap,
    fileCount: normalizedFilesList.length
  };
}

/**
 * 3. Local Document Source Ingestion
 * Ingests Markdown, text, or documentation strings with empty content validation
 */
export function ingestLocalDocumentSource(params = {}) {
  if (!params || typeof params !== 'object') {
    return {
      success: false,
      source: 'LOCAL_DOCUMENT',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'EMPTY_OR_CORRUPT_DOCUMENT',
      canInitiateRescan: true,
      message: 'Uploaded document is empty or unreadable.'
    };
  }

  const { filename = 'document.md', content } = params;

  if (content === null || content === undefined || typeof content !== 'string' || content.trim().length === 0) {
    return {
      success: false,
      source: 'LOCAL_DOCUMENT',
      state: 'UNAUDITED',
      displayValue: '--',
      errorCode: 'EMPTY_OR_CORRUPT_DOCUMENT',
      canInitiateRescan: true,
      message: 'Uploaded document is empty or unreadable.'
    };
  }

  // Parse markdown headings
  const headings = [];
  const headingRegex = /^#{1,6}\s+(.+)$/gm;
  let match;
  while ((match = headingRegex.exec(content)) !== null) {
    const text = match[1].trim();
    if (text) headings.push(text);
  }

  // Strip Markdown markers (e.g. '#' tokens) when calculating word count
  const sanitizedForCount = content.replace(/^#{1,6}\s+/gm, ' ').trim();
  const wordCount = sanitizedForCount.split(/\s+/).filter(Boolean).length;

  return {
    success: true,
    source: 'LOCAL_DOCUMENT',
    filename,
    headings,
    rawContent: content,
    wordCount
  };
}

export default {
  ingestWebsiteSource,
  ingestGitHubSource,
  ingestLocalDocumentSource
};
