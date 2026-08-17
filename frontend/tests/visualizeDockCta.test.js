/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

describe("AIVisualize Floating Dock Conversion CTA BDD Suite (Item 3)", () => {
  const indexCssPath = path.resolve(__dirname, "../index.css");
  const visualizeHtmlPath = path.resolve(__dirname, "../visualize.html");
  const indexJsPath = path.resolve(__dirname, "../index.js");

  const cssContent = fs.readFileSync(indexCssPath, "utf8");
  const htmlContent = fs.readFileSync(visualizeHtmlPath, "utf8");
  const jsContent = fs.readFileSync(indexJsPath, "utf8");

  it("Scenario 1: Verify #floating-glass-dock contains 7 navigation links including AIOptimize Pro", () => {
    const $ = cheerio.load(htmlContent);
    const dock = $("#floating-glass-dock");
    expect(dock.length).toBe(1);

    const links = dock.find(".dock-link");
    expect(links.length).toBe(7);

    const linkTexts = links.map((i, el) => $(el).text().trim()).get();
    expect(linkTexts.some(t => t.includes("Scan"))).toBe(true);
    expect(linkTexts.some(t => t.includes("Summary"))).toBe(true);
    expect(linkTexts).toContain("1. AI Access");
    expect(linkTexts).toContain("2. Page Content");
    expect(linkTexts).toContain("3. Brand Trust");
    expect(linkTexts).toContain("4. AI Blueprint");
    expect(linkTexts.some(t => t.includes("AIOptimize Pro"))).toBe(true);
  });

  it("Scenario 2: Verify 7th dock link targets #aioptimize-action-banner and has .dock-link-cta class", () => {
    const $ = cheerio.load(htmlContent);
    const ctaLink = $(".dock-link-cta");
    expect(ctaLink.length).toBe(1);
    expect(ctaLink.attr("href")).toBe("#aioptimize-action-banner");
    expect(ctaLink.text()).toContain("AIOptimize Pro");
  });

  it("Scenario 3: Verify index.css defines .dock-link-cta with high-contrast glowing accent", () => {
    expect(cssContent).toContain(".dock-link-cta");
    expect(cssContent).toMatch(/\.dock-link-cta\s*\{[^}]*background:/);
  });

  it("Scenario 4: Vocabulary Gate - Zero occurrences of banned phrase AI-first", () => {
    expect(cssContent.toLowerCase()).not.toContain("ai-first");
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
