/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(__dirname, "../visualize.html");
const jsPath = path.resolve(__dirname, "../index.js");

const htmlContent = fs.readFileSync(htmlPath, "utf8");
const jsContent = fs.readFileSync(jsPath, "utf8");

describe("Module 2: Boardroom Telemetry & Section 1-4 Refactor BDD Suite", () => {
  let dom;
  let window;
  let document;

  beforeEach(() => {
    dom = new JSDOM(htmlContent, {
      runScripts: "dangerously",
      resources: "usable",
      url: "http://localhost/visualize.html"
    });
    window = dom.window;
    document = window.document;
    window.API_BASE = "http://localhost:5000";

    try {
      window.eval(jsContent);
    } catch (err) {
      // Ignore evaluation warnings
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it("Scenario 1: Verify WAF 403 rendering contains correct blocked copy and scores", () => {
    const mockScanData = {
      url: "https://example-waf-blocked.com",
      status: {
        isWafBlocked: true,
        wafStatusCode: 403,
        robotsTxtExists: false,
        xRobotsIndexable: false
      },
      scoreCard: {
        overallScore: 0,
        pillars: {
          p1: { score: 0, max: 25, badge: "BLOCKED" },
          p2: { score: 0, max: 25 },
          p3: { score: 0, max: 25 },
          p4: { score: 0, max: 25 }
        }
      },
      executiveSections: {
        section1: {
          score: 0,
          max: 25,
          blocked: true,
          status: 'BLOCKED',
          blockMessage: "Automated Bot Traffic Rejected (HTTP 403)"
        }
      }
    };

    window.updateExecutiveViewData(mockScanData);

    const robotsTxtStatus = document.getElementById("exec-robots-txt-status");
    const pillar1Score = document.getElementById("pillar-sec1-score");

    expect(robotsTxtStatus).not.toBeNull();
    expect(pillar1Score).not.toBeNull();

    expect(robotsTxtStatus.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403)");
    expect(pillar1Score.textContent.trim().toLowerCase()).toBe("0/25 pts");
  });

  it("Scenario 2: Verify updated executive terminology across Sections 1-4 and Module 4 headings", () => {
    const bodyText = document.body.textContent;

    expect(bodyText).toContain("AI Search Permissions & Gateway Access");
    expect(bodyText).toContain("Content Readability & Answer Citation");
    expect(bodyText).toContain("Brand Authority & Entity Consensus");
    expect(bodyText).toContain("Dedicated Machine Manifests & 4-Tier Blueprint");
    expect(bodyText).toContain("Per-webpage AI Citation Audit");
  });

  it("Scenario 3: Verify Section 2 Two-Tier Remediation component markup and Copy Prompt action", () => {
    const remediationContainer = document.getElementById("sec2-remediation-container");
    expect(remediationContainer).not.toBeNull();

    const textContent = remediationContainer.textContent || "";
    expect(textContent).toContain("Act as an Answer Engine Optimization (AEO) specialist. Rewrite my core pricing and service details into 3 clear H2 questions followed immediately by concise 40-word direct answers formatted for conversational AI search engines: [Paste content here]");

    const copyBtn = document.getElementById("btn-copy-genai-prompt");
    expect(copyBtn).not.toBeNull();
    expect(copyBtn.textContent.trim()).toBe("📋 Copy GenAI Prompt");

    const bridgeLink = remediationContainer.querySelector("a.bridge-btn");
    expect(bridgeLink).not.toBeNull();
    expect(bridgeLink.getAttribute("href")).toBe("optimize.html?section=blueprint");
    expect(bridgeLink.textContent.trim()).toBe("⚡ Synthesize Machine Manifests in AIOptimize →");
  });

  it("Scenario 4: Verify Section 4 Dual-Interface Blueprint markup", () => {
    const section4Card = document.getElementById("section-4-card");
    expect(section4Card).not.toBeNull();

    const text = section4Card.textContent;
    expect(text).toContain("Human-Facing Web Presence (AI-Optimized)");
    expect(text).toContain("Visual Trust");
    expect(text).toContain("Token Drag");
    expect(text).toContain("Machine Intelligence Interface (AI-Ready)");
    expect(text).toContain("50ms Ingestion");
    expect(text).toContain("No UI");
    expect(text).toContain("Manual Page-by-Page Prompting (AIVisualize) — 2–4 hours");
    expect(text).toContain("Automated 1-Click Manifest Synthesizer (AIOptimize) — Under 60 seconds");
  });

  it("Scenario 5: Assert zero occurrences of banned word AI-first", () => {
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });

  it("Scenario 6: Assert #exec-action-triage container exists and renders dynamically on scan completion", () => {
    const triageContainer = document.getElementById("exec-action-triage");
    expect(triageContainer).not.toBeNull();

    const mockScanData = {
      url: "https://example.com",
      status: {
        isWafBlocked: false,
        robotsTxtExists: false,
        xRobotsIndexable: false,
        sitemapExists: false
      },
      scoreCard: {
        overallScore: 70,
        pillars: {
          p1: { score: 15, max: 25 },
          p2: { score: 20, max: 25 },
          p3: { score: 15, max: 25 },
          p4: { score: 20, max: 25 }
        }
      },
      executiveSections: {
        section1: { score: 15, max: 25, title: "AI Search Permissions" },
        section2: { score: 20, max: 25, title: "Content Readability" },
        section3: { score: 15, max: 25, title: "Brand Authority" },
        section4: { score: 20, max: 25, title: "Machine Manifests" }
      }
    };

    window.updateExecutiveViewData(mockScanData);

    expect(triageContainer.children.length).toBeGreaterThanOrEqual(1);
    expect(triageContainer.innerHTML).toContain("📋 Copy GenAI Prompt");
  });

  it("Scenario 7: Assert technical details drawers are present and toggleable", () => {
    const drawers = document.querySelectorAll("details.executive-drawer");
    expect(drawers.length).toBeGreaterThanOrEqual(4);
    drawers.forEach(drawer => {
      const summary = drawer.querySelector("summary");
      expect(summary).not.toBeNull();
      expect(summary.textContent).toContain("View Technical Diagnostics & Raw Server Evidence");
    });
  });

  it("Scenario 8: Assert #btn-copy-genai-prompt copies prompt text to clipboard", () => {
    let clipboardText = "";
    const mockClipboard = {
      writeText: async (text) => {
        clipboardText = text;
        return Promise.resolve();
      }
    };
    Object.defineProperty(window.navigator, "clipboard", {
      value: mockClipboard,
      configurable: true
    });

    const copyBtn = document.getElementById("btn-copy-genai-prompt");
    expect(copyBtn).not.toBeNull();
    copyBtn.click();

    expect(clipboardText).toContain("Act as an Answer Engine Optimization (AEO) specialist.");
  });
});
