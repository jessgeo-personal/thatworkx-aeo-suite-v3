import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';

describe('Restore DIY Mode BDD Test Suite', () => {
  it('Scenario 1: visualize.html contains view mode pill container with exec and dev pills', () => {
    const visPath = path.resolve(__dirname, '../visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const pillContainer = $('.view-mode-pill-container');
    expect(pillContainer.length).toBe(1);

    const execBtn = $('#pill-exec-mode');
    const devBtn = $('#pill-dev-mode');
    expect(execBtn.length).toBe(1);
    expect(devBtn.length).toBe(1);
  });

  it('Scenario 2: visualize.html contains #dev-mode-container for DIY developer view', () => {
    const visPath = path.resolve(__dirname, '../visualize.html');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const $ = cheerio.load(visHtml);

    const devContainer = $('#dev-mode-container');
    expect(devContainer.length).toBe(1);
  });

  it('Scenario 3: index.js defines and exposes setVisualizeViewMode', () => {
    const jsPath = path.resolve(__dirname, '../index.js');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(jsContent).toContain('setVisualizeViewMode');
  });

  it('Scenario 4: Vocabulary Gate - Zero occurrences of banned phrase AI-first', () => {
    const visPath = path.resolve(__dirname, '../visualize.html');
    const jsPath = path.resolve(__dirname, '../index.js');
    const visHtml = fs.readFileSync(visPath, 'utf8');
    const jsContent = fs.readFileSync(jsPath, 'utf8');

    expect(/AI-first/i.test(visHtml)).toBe(false);
    expect(/AI-first/i.test(jsContent)).toBe(false);
  });
});
