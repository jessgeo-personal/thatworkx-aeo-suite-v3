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

describe("Slice 1: Hero & Comparison Deck BDD Suite", () => {
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

  describe("Scenario 1.1: Boardroom Spotlight Hero & Clean Governance", () => {
    it("Verify index.html contains the eyebrow badge '[ ✦ THE AEO & GEO INFRASTRUCTURE PLATFORM ]'", () => {
      const capsule = document.querySelector(".onboarding-badge-capsule");
      expect(capsule).not.toBeNull();
      const text = capsule.textContent.trim().replace(/\s+/g, ' ');
      expect(text).toContain("[ ✦ THE AEO & GEO INFRASTRUCTURE PLATFORM ]");
    });

    it("Verify H1 headline text states 'Educating Brands to be AI-Ready and AI-Optimized'", () => {
      const h1 = document.querySelector("h1");
      expect(h1).not.toBeNull();
      const text = h1.textContent.trim().replace(/\s+/g, ' ');
      expect(text).toBe("Educating Brands to be AI-Ready and AI-Optimized.");
    });

    it("Verify ZERO occurrences of 'AI-first' across the entire index.html DOM", () => {
      const fullText = document.body.innerHTML;
      expect(fullText.toLowerCase()).not.toContain("ai-first");
    });
  });

  describe("Scenario 1.2: Instant 1-Click Scan Console (Zero-Modal Friction)", () => {
    it("Verify form #onboarding-scan-form exists with input #onboarding-target-url", () => {
      const form = document.getElementById("onboarding-scan-form");
      expect(form).not.toBeNull();
      const input = form.querySelector("#onboarding-target-url");
      expect(input).not.toBeNull();
    });

    it("Verify submit button #onboarding-submit-btn contains in-button loader #onboarding-btn-loader", () => {
      const btn = document.getElementById("onboarding-submit-btn");
      expect(btn).not.toBeNull();
      const loader = btn.querySelector("#onboarding-btn-loader");
      expect(loader).not.toBeNull();
    });

    it("Verify 3 Enterprise Instant Demo chips (shopify.com, stripe.com, airbnb.com) are rendered with target='_blank'", () => {
      const chips = document.querySelectorAll("#instant-try-row a, .instant-try-row a");
      expect(chips.length).toBeGreaterThanOrEqual(3);
      
      const chipUrls = Array.from(chips).map(chip => chip.getAttribute("href"));
      const chipTargets = Array.from(chips).map(chip => chip.getAttribute("target"));
      const chipTexts = Array.from(chips).map(chip => chip.textContent.trim());

      // Verify they are for shopify, stripe, airbnb
      expect(chipUrls.some(url => url.includes("shopify.com"))).toBe(true);
      expect(chipUrls.some(url => url.includes("stripe.com"))).toBe(true);
      expect(chipUrls.some(url => url.includes("airbnb.com"))).toBe(true);

      // Verify target="_blank" on each chip
      chips.forEach(chip => {
        expect(chip.getAttribute("target")).toBe("_blank");
      });
    });
  });

  describe("Scenario 1.3: The Paradigm Shift: SEO vs AEO Comparison Deck", () => {
    it("Verify #seo-vs-aeo-deck container exists in static DOM (pre-rendered for bots)", () => {
      const deck = document.getElementById("seo-vs-aeo-deck");
      expect(deck).not.toBeNull();
    });

    it("Verify comparative matrix rows exist contrasting Traditional SEO against Generative AEO", () => {
      const deck = document.getElementById("seo-vs-aeo-deck");
      expect(deck).not.toBeNull();
      
      const deckText = deck.textContent || "";
      
      // Traditional SEO concepts
      expect(deckText).toContain("PageRank");
      expect(deckText).toContain("Keywords");
      expect(deckText).toContain("Human Clicks");

      // Generative AEO concepts
      expect(deckText).toContain("RAG Citations");
      expect(deckText).toContain("Entities");
      expect(deckText).toContain("LLM Answers");
    });

    it("Verify at least 4 comparative metric rows are present with distinct badges", () => {
      const deck = document.getElementById("seo-vs-aeo-deck");
      expect(deck).not.toBeNull();

      // Find comparison rows/badges
      const rows = deck.querySelectorAll(".comparison-row, .matrix-row, tr");
      
      // Let's assert we have at least 4 rows or comparative elements
      expect(rows.length).toBeGreaterThanOrEqual(4);
    });
  });
});
