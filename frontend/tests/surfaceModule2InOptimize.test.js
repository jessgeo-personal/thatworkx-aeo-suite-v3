import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('Surface Module 2 in AIOptimize BDD Test Suite', () => {
  it('Scenario 1: optimize.html surfaces #dev-schema-builder-wrapper in default visible view (#opt-tool-jsonld)', () => {
    const optPath = path.resolve(__dirname, '../optimize.html');
    const optHtml = fs.readFileSync(optPath, 'utf8');
    const $ = cheerio.load(optHtml);

    const schemaWrapper = $('#dev-schema-builder-wrapper');
    expect(schemaWrapper.length).toBe(1);

    const jsonLdView = $('#opt-tool-jsonld');
    expect(jsonLdView.length).toBe(1);

    const styleAttr = jsonLdView.attr('style') || '';
    expect(styleAttr).toContain('display: block');
  });

  it('Scenario 2: index.js initializes Module 2 and activates JSON-LD view on optimize.html load', () => {
    const jsPath = path.resolve(__dirname, '../index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('buildDevSchemaBuilderHtml');
    expect(jsContent).toContain('updateSchemaBuilderCode');
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
