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

describe("Module 1: WAF Edge Block Detection BDD Suite", () => {
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

  it("Scenario 1: Set explicit WAF blocked status messages when scan reports HTTP 403 or 429 block", () => {
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
          p1: { score: 0, max: 25, badge: "BLOCKED", note: "Automated Bot Traffic Rejected (HTTP 403)" },
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
          status: "BLOCKED",
          blockMessage: "Automated Bot Traffic Rejected (HTTP 403)"
        }
      }
    };

    // Run display / render update logic
    try {
      window.updateExecutiveViewData(mockScanData);
    } catch (err) {
      console.error("CRITICAL ERROR IN updateExecutiveViewData:", err);
    }

    const robotsTxtStatus = document.getElementById("exec-robots-txt-status");
    const pillar1Score = document.getElementById("pillar-sec1-score");
    const sec1Banner = document.getElementById("sec1-remediation-banner");
    const easyScoreBadge = document.getElementById("section-1-easy-score-badge");

    expect(robotsTxtStatus).not.toBeNull();
    expect(pillar1Score).not.toBeNull();
    expect(sec1Banner).not.toBeNull();
    expect(easyScoreBadge).not.toBeNull();

    // Assertions updated for new spec
    expect(pillar1Score.textContent.trim().toLowerCase()).toBe("0/25 pts");
    
    expect(robotsTxtStatus.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403)");
    expect(robotsTxtStatus.className).toContain("status-badge--blocked");
    expect(robotsTxtStatus.className).not.toContain("status-badge--pass");

    expect(easyScoreBadge.textContent.trim()).toBe("[ 🔴 SECURITY SHIELD ACTIVE ]");
    expect(easyScoreBadge.className).toContain("status-badge--blocked");

    expect(sec1Banner.style.display).not.toBe("none");
    const remediationLink = document.getElementById("sec1-remediation-bridge-btn");
    expect(remediationLink.getAttribute("href")).toContain("optimize.html");

    const checks = ["chk-sec1-cdn", "chk-sec1-xrobots", "chk-sec1-useragents", "chk-sec1-aibots"];
    checks.forEach(id => {
      const element = document.getElementById(id);
      expect(element).not.toBeNull();
      expect(element.innerHTML).toContain("✗");
      expect(element.innerHTML).not.toContain("✓");
    });
  });
});
