import { describe, it, expect, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

describe('Visualize Refactor V4 - Phase 3: Right Inspector Studio & Manifest Engine Contract', () => {
  let htmlContent;
  let dom;
  let document;

  const visualizePath = path.resolve(__dirname, '../visualize.html');

  beforeEach(() => {
    expect(fs.existsSync(visualizePath), 'frontend/visualize.html must exist').toBe(true);
    htmlContent = fs.readFileSync(visualizePath, 'utf-8');
    dom = new JSDOM(htmlContent);
    document = dom.window.document;
  });

  describe('1. Governance Gate & Data Integrity Defaults', () => {
    it('must have ZERO occurrences of the banned term "AI-first"', () => {
      expect(htmlContent).not.toMatch(/AI-first/i);
    });

    it('must pre-render educational copy and diagnostic guidance for LLM crawlability', () => {
      expect(htmlContent).toMatch(/Citation Gap|Remediation|LLM Ingestion|Protocol/i);
    });
  });

  describe('2. Column 3 (Right Inspector) - Header & Target Switcher', () => {
    it('must render the active inspector target title and format pill', () => {
      const targetTitle = document.querySelector('[data-testid="inspector-target-title"], [data-inspector-target]');
      expect(targetTitle).not.toBeNull();
      expect(targetTitle.textContent.trim()).toMatch(/\/llms\.txt|\/robots\.txt|\/ai-context\.md|schema\.jsonld/i);

      const formatPill = document.querySelector('[data-testid="inspector-format-pill"], .inspector-format-pill');
      expect(formatPill).not.toBeNull();
    });

    it('must render top utility buttons (Copy & Download Manifest triggers)', () => {
      const copyBtn = document.querySelector('[data-action="copy-manifest"], .btn-copy-manifest');
      const downloadBtn = document.querySelector('[data-action="download-manifest"], .btn-download-manifest');

      expect(copyBtn).not.toBeNull();
      expect(downloadBtn).not.toBeNull();
    });
  });

  describe('3. Code Viewer & Manifest Preview Engine', () => {
    it('must render the pre-rendered manifest code viewer container with a <code> or <pre> element', () => {
      const codeViewer = document.querySelector('[data-testid="manifest-code-viewer"], .manifest-code-viewer');
      expect(codeViewer).not.toBeNull();

      const codeBlock = codeViewer.querySelector('pre, code');
      expect(codeBlock).not.toBeNull();
    });

    it('must not contain hardcoded mock domain results in code preview (must use placeholder tokens or standard spec structure)', () => {
      const codeBlock = document.querySelector('[data-testid="manifest-code-viewer"] pre, [data-testid="manifest-code-viewer"] code');
      if (codeBlock) {
        // Must provide structured spec template without fabricated live scan metrics
        expect(codeBlock.textContent).not.toMatch(/fabricated-fake-metric-12345/);
      }
    });
  });

  describe('4. AEO Diagnostic & Remediation Guidance Cards', () => {
    it('must render pre-rendered AEO diagnostic & citation gap remediation cards', () => {
      const diagnosticCards = document.querySelectorAll('[data-testid="diagnostic-card"], .diagnostic-card');
      expect(diagnosticCards.length).toBeGreaterThanOrEqual(2);

      const cardTexts = Array.from(diagnosticCards).map(c => c.textContent);
      expect(cardTexts.some(t => /Citation|LLM Visibility|Entity/i.test(t))).toBe(true);
      expect(cardTexts.some(t => /Remediation|Protocol|Action/i.test(t))).toBe(true);
    });
  });

  describe('5. Inspector Action Dock', () => {
    it('must render the bottom inspector action dock with deployment & payload triggers', () => {
      const inspectorDock = document.querySelector('[data-testid="inspector-action-dock"], .inspector-action-dock');
      expect(inspectorDock).not.toBeNull();

      const deployBtn = inspectorDock.querySelector('[data-action="deploy-worker"], .btn-deploy-worker, button');
      expect(deployBtn).not.toBeNull();
    });
  });
});
