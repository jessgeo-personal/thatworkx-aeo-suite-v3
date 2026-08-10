import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('Move Module 3 to AIOptimize BDD Test Suite', () => {
  it('Scenario 1: optimize.html contains #dev-drawers-wrapper container for Module 3', () => {
    const optPath = path.resolve(__dirname, '../optimize.html');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const $ = cheerio.load(optHtml);

    const drawersWrapper = $('#dev-drawers-wrapper');
    expect(drawersWrapper.length).toBe(1);
  });

  it('Scenario 2: index.js initializes Module 3 (buildDevDrawersHtml) on optimize.html route', () => {
    const jsPath = path.resolve(__dirname, '../index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    const optimizeBlock = jsContent.split("currentPath.includes('optimize')")[1] || '';
    expect(optimizeBlock).toContain('buildDevDrawersHtml');
    expect(optimizeBlock).toContain('dev-drawers-wrapper');
  });

  it('Scenario 3: Vocabulary Gate - Zero occurrences of banned phrase AI-first', () => {
    const optPath = path.resolve(__dirname, '../optimize.html');
    const jsPath = path.resolve(__dirname, '../index.js');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(/AI-first/i.test(optHtml)).toBe(false);
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });
});
