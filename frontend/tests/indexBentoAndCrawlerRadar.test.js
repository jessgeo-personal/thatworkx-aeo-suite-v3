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

describe("Slice 2: 3-Pillar Bento & 20-Bot Radar BDD Suite", () => {
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

  describe("Scenario 2.2: 20-Bot AI Crawler Live Radar Grid & Categorization Filters", () => {
    it("Verify #ai-crawler-radar container exists in static DOM", () => {
      const radar = document.getElementById("ai-crawler-radar");
      expect(radar).not.toBeNull();
    });

    it("Verify filter button controls exist with data-filter attributes: all, search, llm, scraper", () => {
      const radar = document.getElementById("ai-crawler-radar");
      expect(radar).not.toBeNull();

      const btnAll = radar.querySelector("[data-filter='all']");
      const btnSearch = radar.querySelector("[data-filter='search']");
      const btnLlm = radar.querySelector("[data-filter='llm']");
      const btnScraper = radar.querySelector("[data-filter='scraper']");

      expect(btnAll).not.toBeNull();
      expect(btnSearch).not.toBeNull();
      expect(btnLlm).not.toBeNull();
      expect(btnScraper).not.toBeNull();
    });

    it("Verify exactly 20 AI crawler bot cards are pre-rendered in static DOM (.bot-radar-card)", () => {
      const cards = document.querySelectorAll(".bot-radar-card");
      expect(cards.length).toBe(20);
    });

    it("Verify all 20 specified bot agents are present in the DOM", () => {
      const radar = document.getElementById("ai-crawler-radar");
      expect(radar).not.toBeNull();

      const bots = [
        "OAI-SearchBot", "GPTBot", "ChatGPT-User", "Googlebot", "Meta-WebIndexer",
        "Meta-ExternalAgent", "Bingbot", "PerplexityBot", "Applebot-Extended", "Amazonbot",
        "QwenBot", "Baidu-Ansur", "ERNIEBot", "Bytespider", "TencentBot", "Claude-SearchBot",
        "ClaudeBot", "MistralBot", "CCBot", "cohere-ai"
      ];

      const text = radar.textContent || "";
      bots.forEach(bot => {
        expect(text).toContain(bot);
      });
    });

    it("Verify default status badges display un-scanned state with zero fake default scores", () => {
      const cards = document.querySelectorAll(".bot-radar-card");
      cards.forEach(card => {
        const badge = card.querySelector(".bot-status-badge, .status-badge, .bot-score");
        expect(badge).not.toBeNull();
        const text = badge.textContent.trim().toUpperCase();
        
        // Assert it displays "UNAUDITED", "--", or "PENDING" but NOT numeric scores like "100" or active statuses
        const isUnscanned = text === "UNAUDITED" || text === "--" || text === "PENDING" || text === "NOT SCANNED" || text === "PENDING AUDIT";
        expect(isUnscanned).toBe(true);

        // Verify no fake default scores like "85/100" or similar exist by default
        expect(text).not.toMatch(/\d+/);
      });
    });
  });

  describe("Scenario 2.3: Strict Governance & Static DOM Indexability", () => {
    it("Verify zero occurrences of the banned phrase 'AI-first' across the entire file", () => {
      const fullText = document.body.innerHTML;
      expect(fullText.toLowerCase()).not.toContain("ai-first");
    });

    it("Verify all cards and educational copy are statically rendered in the HTML without requiring JS hydration", () => {
      // Assert that without executing scripts, they exist in raw HTML string
      expect(htmlContent).toContain("product-bento-grid");
      expect(htmlContent).toContain("ai-crawler-radar");
    });
  });
});
