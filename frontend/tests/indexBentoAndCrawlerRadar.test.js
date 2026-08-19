/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(__dirname, "../index.html");
const jsPath = path.resolve(__dirname, "../index.js");

const htmlContent = fs.readFileSync(htmlPath, "utf8");
const jsContent = fs.readFileSync(jsPath, "utf8");

describe("Slice 2: 3-Pillar Bento & 12-Provider AI Logo Cloud BDD Suite", () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, {
      runScripts: "dangerously",
      resources: "usable",
      url: "http://localhost/index.html"
    });
    window = dom.window;
    document = window.document;
    window.API_BASE = "http://localhost:5000";

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings in JSDOM
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  describe("Scenario 2.1: 3-Pillar Ecosystem Bento Grid Structure & Value Props", () => {
    it("Verify #product-bento-grid container exists in static DOM", () => {
      const grid = document.getElementById("product-bento-grid");
      expect(grid).not.toBeNull();
    });

    it("Verify 3 distinct pillar cards exist: #bento-aivisualize, #bento-aioptimize, and #bento-aisocialize", () => {
      const visualize = document.getElementById("bento-aivisualize");
      const optimize = document.getElementById("bento-aioptimize");
      const socialize = document.getElementById("bento-aisocialize");

      expect(visualize).not.toBeNull();
      expect(optimize).not.toBeNull();
      expect(socialize).not.toBeNull();
    });

    it("Verify #bento-aivisualize details the 32-Capability Scorecard and Diagnostic Engine", () => {
      const card = document.getElementById("bento-aivisualize");
      expect(card).not.toBeNull();
      const text = card.textContent || "";
      expect(text).toContain("32-Capability Scorecard");
      expect(text).toContain("Diagnostic Engine");
    });

    it("Verify #bento-aioptimize details the 1-Click Code Remediation and Manifest Compiler", () => {
      const card = document.getElementById("bento-aioptimize");
      expect(card).not.toBeNull();
      const text = card.textContent || "";
      expect(text).toContain("1-Click Code Remediation");
      expect(text).toContain("Manifest Compiler");
    });

    it("Verify #bento-aisocialize details the Citation Graph Audit and Social Snippet Append Engine", () => {
      const card = document.getElementById("bento-aisocialize");
      expect(card).not.toBeNull();
      const text = card.textContent || "";
      expect(text).toContain("Citation Graph Audit");
      expect(text).toContain("Social Snippet Append Engine");
    });

    it("Verify direct CTA anchor links route correctly to visualize.html, optimize.html, and socialize.html", () => {
      const visualize = document.getElementById("bento-aivisualize");
      const optimize = document.getElementById("bento-aioptimize");
      const socialize = document.getElementById("bento-aisocialize");

      const linkVis = visualize.querySelector("a[href='visualize.html']");
      const linkOpt = optimize.querySelector("a[href='optimize.html']");
      const linkSoc = socialize.querySelector("a[href='socialize.html']");

      expect(linkVis).not.toBeNull();
      expect(linkOpt).not.toBeNull();
      expect(linkSoc).not.toBeNull();
    });
  });

  describe("Scenario 2.2: 12-Provider Global AI Ecosystem Logo Cloud (Aceternity Spotlight)", () => {
    it("Verify #ai-crawler-radar (or #ai-provider-cloud) container exists in static DOM", () => {
      const container = document.getElementById("ai-crawler-radar") || document.getElementById("ai-provider-cloud");
      expect(container).not.toBeNull();
    });

    it("Verify EXACTLY 12 provider cards exist with class .provider-logo-card", () => {
      const cards = document.querySelectorAll(".provider-logo-card");
      expect(cards.length).toBe(12);
    });

    it("Verify all 12 global provider brands are present in the DOM", () => {
      const container = document.getElementById("ai-crawler-radar") || document.getElementById("ai-provider-cloud");
      const text = container ? container.textContent : "";
      const brands = [
        "ChatGPT", "Claude", "Perplexity", "Google Gemini", "Apple Intelligence",
        "Microsoft Copilot", "Meta AI", "Mistral AI", "Amazon Q", "DeepSeek",
        "Doubao", "Alibaba Qwen"
      ];
      brands.forEach(brand => {
        expect(text).toContain(brand);
      });
    });

    it("Verify each of the 12 .provider-logo-card elements contains an inline <svg> icon with viewBox", () => {
      const cards = document.querySelectorAll(".provider-logo-card");
      expect(cards.length).toBe(12);
      cards.forEach(card => {
        const svg = card.querySelector("svg");
        expect(svg).not.toBeNull();
        expect(svg.getAttribute("viewBox")).not.toBeNull();
      });
    });

    it("Verify that legacy filter buttons (.bot-filter-btn) have been removed (zero filter elements)", () => {
      const filterBtns = document.querySelectorAll(".bot-filter-btn");
      expect(filterBtns.length).toBe(0);
    });
  });

  describe("Scenario 2.3: Strict Governance & Static Pre-rendering", () => {
    it("Verify zero occurrences of the banned phrase 'AI-first' across the entire DOM", () => {
      const bodyText = document.body.innerHTML;
      expect(bodyText.toLowerCase()).not.toContain("ai-first");
    });

    it("Verify the provider logo cards and 3-pillar bento grid are statically rendered in raw HTML string", () => {
      expect(htmlContent).toContain("product-bento-grid");
      expect(htmlContent).toContain("provider-logo-card");
    });
  });
});
