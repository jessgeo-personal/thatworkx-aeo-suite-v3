import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AIVisualize Dashboard Refactor Phase 1 BDD Suite', () => {
  const htmlPath = path.resolve(__dirname, '../visualize.html');
  const jsPath = path.resolve(__dirname, '../index.js');

  const htmlContent = fs.readFileSync(htmlPath, 'utf8');
  const jsContent = fs.readFileSync(jsPath, 'utf8');

  it('Scenario 1: Scan Input Modal has minimized persistent container, New Scan button and `#new-scan-modal`', () => {
    // 1. Assert persistent container exists as id="scan-input-container"
    expect(htmlContent).toContain('id="scan-input-container"');
    
    // 2. Assert New Scan button exists
    expect(htmlContent).toContain('id="new-scan-btn"');
    
    // 3. Assert modal element exists
    expect(htmlContent).toContain('id="new-scan-modal"');

    // 4. Assert input field in modal exists
    expect(htmlContent).toContain('id="modal-target-url"');
    
    // 5. Assert JS logic to open modal and pre-fill input exists
    expect(jsContent).toContain('function openNewScanModal');
  });

  it('Scenario 2: Consolidated header bar exists with metadata and export actions', () => {
    // 1. Assert header bar exists (e.g. active-domain-header-bar)
    expect(htmlContent).toContain('id="active-domain-header-bar"');

    // 2. Assert Scanned URL display exists
    expect(htmlContent).toContain('id="display-scanned-domain"');

    // 3. Assert Last Scanned Timestamp display exists
    expect(htmlContent).toContain('id="display-scanned-time"');

    // 4. Assert Time to Scan (Duration) display exists
    expect(htmlContent).toContain('id="display-scan-duration"');

    // 5. Assert "Export PDF Summary" Button exists
    expect(htmlContent).toContain('Export PDF Summary');

    // 6. Assert "Export Raw JSON" Button exists
    expect(htmlContent).toContain('Export Raw JSON');
  });

  it('Scenario 3: Overall Score Preservation keeps overall score component intact', () => {
    // Assert elements of Overall AI Visibility Score Dial Gauge card exist
    expect(htmlContent).toContain('class="score-dial-card');
    expect(htmlContent).toContain('id="exec-overall-score"');
    expect(htmlContent).toContain('id="exec-score-classification-pill"');
    expect(htmlContent).toContain('id="exec-score-summary-text"');
  });

  it('Scenario 4: Validates zero occurrences of legacy phrase "AI-first"', () => {
    expect(/AI-first/i.test(htmlContent)).toBe(false);
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });
});
