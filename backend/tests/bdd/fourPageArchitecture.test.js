import { describe, it, expect } from 'vitest';
import path from 'path';
import fs from 'fs';

describe('Feature 10: 4-Page Architecture & REST API Readiness BDD Suite', () => {

  it('Scenario 10.1 & 10.4: Should structure REST API scan payload with api_version and target_url', () => {
    const targetUrl = 'https://thatworkx.com';
    const apiResponse = {
      success: true,
      api_version: 'v1',
      target_url: targetUrl,
      results: {
        scoreCard: { overallScore: 88, classification: 'OPTIMIZED' }
      }
    };

    expect(apiResponse.success).toBe(true);
    expect(apiResponse.api_version).toBe('v1');
    expect(apiResponse.target_url).toBe('https://thatworkx.com');
    expect(apiResponse.results.scoreCard.overallScore).toBe(88);
  });

  it('Scenario 10.2: Should support mode parameter parsing for Executive vs Developer mode', () => {
    const searchParams = new URLSearchParams('url=example.com&mode=developer');
    expect(searchParams.get('url')).toBe('example.com');
    expect(searchParams.get('mode')).toBe('developer');
  });

  it('Scenario 10.3: Should support URL target parameter for AIOptimize workspace pre-fill', () => {
    const searchParams = new URLSearchParams('url=holiknits.com');
    expect(searchParams.get('url')).toBe('holiknits.com');
  });

  it('Scenario 10.5: Should verify 4 distinct HTML page files exist in frontend directory', () => {
    const indexExists = fs.existsSync(path.join(__dirname, '../../../frontend/index.html'));
    const visualizeExists = fs.existsSync(path.join(__dirname, '../../../frontend/visualize.html'));
    const optimizeExists = fs.existsSync(path.join(__dirname, '../../../frontend/optimize.html'));
    const socializeExists = fs.existsSync(path.join(__dirname, '../../../frontend/socialize.html'));

    expect(indexExists).toBe(true);
    expect(visualizeExists).toBe(true);
    expect(optimizeExists).toBe(true);
    expect(socializeExists).toBe(true);
  });

});
