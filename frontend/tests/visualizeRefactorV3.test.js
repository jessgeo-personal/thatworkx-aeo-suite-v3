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

  it("Scenario 1: Verify WAF 403 rendering contains Security Shield Active suffix", () => {
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
          p1: { score: 0, max: 25, badge: "CRITICAL" },
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
          blockMessage: "Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active"
        }
      }
    };

    window.updateExecutiveViewData(mockScanData);

    const robotsTxtStatus = document.getElementById("exec-robots-txt-status");
    const pillar1Score = document.getElementById("pillar-sec1-score");

    expect(robotsTxtStatus).not.toBeNull();
    expect(pillar1Score).not.toBeNull();

    expect(robotsTxtStatus.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active");
    expect(pillar1Score.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403) — Security Shield Active");
  });

  it("Scenario 2: Verify updated executive terminology across Sections 1-4 and Module 4 headings", () => {
    // We expect the terminology updates in the DOM or static HTML structure
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
    expect(textContent).toContain("Act as an Answer Engine Optimization (AEO) specialist. Rewrite my core pricing/service details into 3 clear H2 questions followed immediately by concise 40-word direct answers for conversational AI quotation:");
    expect(textContent).toContain("Copy GenAI Prompt");
    expect(textContent).toContain("Synthesize /ai-context.md in AIOptimize");

    const copyBtn = document.getElementById("copy-sec2-prompt-btn") || remediationContainer.querySelector("button");
    expect(copyBtn).not.toBeNull();
  });

  it("Scenario 4: Verify Section 4 Dual-Interface Blueprint markup", () => {
    const section4Details = document.getElementById("section-4-details");
    expect(section4Details).not.toBeNull();

    const text = section4Details.textContent;
    expect(text).toContain("Human-Facing Web Presence (AI-Optimized)");
    expect(text).toContain("Trust & UI");
    expect(text).toContain("Code Drag");
    expect(text).toContain("Machine Intelligence Interface (AI-Ready)");
    expect(text).toContain("50ms Ingestion");
    expect(text).toContain("No UI");
    expect(text).toContain("1-Click Manifest Compiler");
    expect(text).toContain("Manual Prompting");
  });

  it("Scenario 5: Assert zero occurrences of banned word AI-first", () => {
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
