import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import * as cheerio from "cheerio";

describe("AIVisualize Live Data vs Ghost DOM Suite (Item 1)", () => {
  const htmlPath = path.resolve(__dirname, "../visualize.html");
  const cssPath = path.resolve(__dirname, "../index.css");
  const jsPath = path.resolve(__dirname, "../index.js");

  const htmlContent = fs.readFileSync(htmlPath, "utf8");
  const cssContent = fs.readFileSync(cssPath, "utf8");
  const jsContent = fs.readFileSync(jsPath, "utf8");

  it("Scenario 1: visualize.html contains NO hidden ghost text divs inside Section 2", () => {
    const $ = cheerio.load(htmlContent);
    const sec2Card = $("#exec-section2-card");
    expect(sec2Card.length).toBe(1);

    // Look for hidden ghost divs containing legacy test dummy text
    const ghostDivs = sec2Card.find("div, span").filter((_, el) => {
      const style = $(el).attr("style") || "";
      const text = $(el).text();
      return (style.includes("display:none") || style.includes("display: none")) && 
             (text.includes("FAQ Structured Markup") || text.includes("take a look and see"));
    });

    expect(ghostDivs.length).toBe(0);
  });

  it("Scenario 2: Live Citation Signals render without HTML comment fragmentation (e.g., HasFAQ)", () => {
    // Assert no fragmented HTML comments inside text nodes
    expect(htmlContent).not.toMatch(/HasFAQ/);
    expect(htmlContent).not.toMatch(/EssentialPages/);
    expect(htmlContent).not.toMatch(/hasEmail/);
  });

  it("Scenario 3: Section 2 displays clean, visible marketer-facing microcopy", () => {
    const $ = cheerio.load(htmlContent);
    expect($("[data-signal=\"faq-schema\"]").text()).toContain("Has FAQ Schema");
    expect($("[data-signal=\"org-schema\"]").text()).toContain("Has Organization Schema");
    expect($("[data-signal=\"emailValue\"]").text()).toContain("Email Visible to AI");
    expect($("[data-signal=\"phoneValue\"]").text()).toContain("Phone Visible to AI");
  });

  it("Scenario 4: Governance Gate - Zero occurrences of banned phrase AI-first", () => {
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(cssContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("index.js"); // Wait, jsContent.toLowerCase().not.toContain("ai-first") is what we want.
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
