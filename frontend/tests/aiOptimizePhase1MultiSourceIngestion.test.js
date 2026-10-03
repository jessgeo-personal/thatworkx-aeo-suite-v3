import { describe, it, expect } from 'vitest';
import {
  ingestWebsiteSource,
  ingestGitHubSource,
  ingestLocalDocumentSource
} from '../../backend/services/multiSourceIngestionService.js';

describe('AIOptimize Multi-Source Content Ingestion & Governance Gate', () => {
  // Scenario 1: Website Ingestion & Headless Policy Enforcement
  describe('Scenario 1: Website Ingestion & Headless Policy Enforcement', () => {
    it('forces static extraction for TRIAL tier users even when requestHeadless is true', async () => {
      const trialUser = {
        id: 'usr_trial_ingest',
        tier: 'TRIAL'
      };

      const result = await ingestWebsiteSource({
        url: 'https://trial-site.com',
        user: trialUser,
        requestHeadless: true,
        _htmlStub: `
          <!DOCTYPE html>
          <html>
            <head><title>Trial Title</title><meta name="description" content="Trial Desc" /><link rel="canonical" href="https://trial-site.com" /></head>
            <body><h1>Main Header</h1><p>Main content body text</p></body>
          </html>
        `
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.source).toBe('WEBSITE');
      expect(result.scanMode).toBe('STATIC_ONLY');
      expect(result.allowHeadless).toBe(false);
      expect(result.tier).toBe('TRIAL');
      expect(result.metadata).toEqual({
        domain: 'trial-site.com',
        title: 'Trial Title',
        description: 'Trial Desc',
        headings: ['Main Header'],
        mainText: 'Main content body text',
        canonicalUrl: 'https://trial-site.com',
        status: 200
      });
    });

    it('enables headless extraction for PRO tier users with subscribed domain', async () => {
      const proUser = {
        id: 'usr_pro_ingest',
        tier: 'PRO',
        domain: 'pro-domain.com'
      };

      const result = await ingestWebsiteSource({
        url: 'https://pro-domain.com/overview',
        user: proUser,
        requestHeadless: true,
        _htmlStub: `
          <!DOCTYPE html>
          <html>
            <head><title>Pro Title</title><meta name="description" content="Pro Desc" /></head>
            <body><h2>Pro Header</h2><p>Dynamic headless body</p></body>
          </html>
        `
      });

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.source).toBe('WEBSITE');
      expect(result.scanMode).toBe('HEADLESS_ENABLED');
      expect(result.allowHeadless).toBe(true);
      expect(result.tier).toBe('PRO');
      expect(result.metadata.domain).toBe('pro-domain.com');
      expect(result.metadata.title).toBe('Pro Title');
      expect(result.metadata.headings).toEqual(['Pro Header']);
      expect(result.metadata.mainText).toBe('Dynamic headless body');
      expect(result.metadata.status).toBe(200);
    });
  });

  // Scenario 2: GitHub Repository Ingestion
  describe('Scenario 2: GitHub Repository Ingestion', () => {
    it('extracts repository metadata and normalizes README, package.json, and docs into ingested files map', async () => {
      const repoPayload = {
        repoUrl: 'https://github.com/my-org/core-agent',
        branch: 'main',
        files: [
          { path: 'README.md', content: '# Core Agent\nAutonomous engine.' },
          { path: 'package.json', content: JSON.stringify({ name: 'core-agent', version: '1.0.0' }) },
          { path: 'docs/architecture.md', content: '## Architecture\nSystem design.' },
          { path: 'src/index.js', content: 'console.log("hello");' }
        ]
      };

      const result = await ingestGitHubSource(repoPayload);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.source).toBe('GITHUB');
      expect(result.repo).toBe('my-org/core-agent');
      expect(result.branch).toBe('main');
      expect(result.files).toBeDefined();
      expect(Array.isArray(result.files)).toBe(true);
      expect(result.files.length).toBe(4);
      expect(result.ingestedFilesMap).toBeDefined();
      expect(result.ingestedFilesMap['README.md']).toContain('Autonomous engine.');
      expect(result.ingestedFilesMap['package.json']).toContain('core-agent');
      expect(result.ingestedFilesMap['docs/architecture.md']).toContain('System design.');
    });

    it('supports repoString format org/repo', async () => {
      const result = await ingestGitHubSource({
        repoString: 'enterprise/ai-tools',
        files: [{ path: 'README.md', content: '# AI Tools' }]
      });

      expect(result.success).toBe(true);
      expect(result.repo).toBe('enterprise/ai-tools');
      expect(result.branch).toBe('main');
      expect(result.ingestedFilesMap['README.md']).toBe('# AI Tools');
    });
  });

  // Scenario 3: Local Document / File Ingestion
  describe('Scenario 3: Local Document / File Ingestion', () => {
    it('parses Markdown into normalized sections, headings, rawContent, and wordCount', async () => {
      const docInput = {
        filename: 'architecture.md',
        content: '# Heading\nBody text'
      };

      const result = await ingestLocalDocumentSource(docInput);

      expect(result).toBeDefined();
      expect(result.success).toBe(true);
      expect(result.source).toBe('LOCAL_DOCUMENT');
      expect(result.filename).toBe('architecture.md');
      expect(result.headings).toEqual(['Heading']);
      expect(result.rawContent).toBe('# Heading\nBody text');
      expect(result.wordCount).toBe(3);
    });
  });

  // Scenario 4: Zero-Fallback Gate (Unreachable Website Source)
  describe('Scenario 4: Zero-Fallback Gate (Unreachable Website Source)', () => {
    it('returns UNAUDITED error state when website is unreachable or fails with 404/500/network error', async () => {
      const failureCases = [
        { url: 'https://nonexistent-404-domain.xyz', simulatedError: 'NOT_FOUND', status: 404 },
        { url: 'https://down-server.com', simulatedError: 'SERVER_ERROR', status: 500 },
        { url: 'https://dns-unresolvable.org', simulatedError: 'DNS_FAILURE' }
      ];

      for (const fc of failureCases) {
        const result = await ingestWebsiteSource(fc);

        expect(result).toEqual({
          success: false,
          source: 'WEBSITE',
          state: 'UNAUDITED',
          displayValue: '--',
          errorCode: 'WEBSITE_UNREACHABLE',
          canInitiateRescan: true,
          message: 'Failed to crawl website source.'
        });
        expect(result.html).toBeUndefined();
        expect(result.mainText).toBeUndefined();
        expect(result.mockData).toBeUndefined();
      }
    });
  });

  // Scenario 5: Zero-Fallback Gate (Invalid or Unreachable GitHub Repository)
  describe('Scenario 5: Zero-Fallback Gate (Invalid or Unreachable GitHub Repository)', () => {
    it('returns UNAUDITED error state without synthetic README or files when repo is invalid or unreachable', async () => {
      const invalidRepoInputs = [
        null,
        undefined,
        {},
        { repoUrl: 'not_a_valid_url' },
        { repoString: 'invalid_format' },
        { repoUrl: 'https://github.com/broken/404-repo', simulatedError: 'REPO_NOT_FOUND' }
      ];

      for (const input of invalidRepoInputs) {
        const result = await ingestGitHubSource(input);

        expect(result).toEqual({
          success: false,
          source: 'GITHUB',
          state: 'UNAUDITED',
          displayValue: '--',
          errorCode: 'GITHUB_REPO_UNREACHABLE',
          canInitiateRescan: true,
          message: 'GitHub repository not found or inaccessible.'
        });
        expect(result.files).toBeUndefined();
        expect(result.ingestedFilesMap).toBeUndefined();
        expect(result.mockData).toBeUndefined();
      }
    });
  });

  // Scenario 6: Zero-Fallback Gate (Empty or Corrupted Local Document)
  describe('Scenario 6: Zero-Fallback Gate (Empty or Corrupted Local Document)', () => {
    it('returns UNAUDITED error state when local file content is empty, null, or corrupted whitespace', async () => {
      const emptyInputs = [
        null,
        undefined,
        {},
        { filename: 'empty.md', content: '' },
        { filename: 'whitespace.txt', content: '    \n\t   ' },
        { filename: 'corrupt.doc', content: null }
      ];

      for (const input of emptyInputs) {
        const result = await ingestLocalDocumentSource(input);

        expect(result).toEqual({
          success: false,
          source: 'LOCAL_DOCUMENT',
          state: 'UNAUDITED',
          displayValue: '--',
          errorCode: 'EMPTY_OR_CORRUPT_DOCUMENT',
          canInitiateRescan: true,
          message: 'Uploaded document is empty or unreadable.'
        });
        expect(result.rawContent).toBeUndefined();
        expect(result.wordCount).toBeUndefined();
        expect(result.mockData).toBeUndefined();
      }
    });
  });
});
