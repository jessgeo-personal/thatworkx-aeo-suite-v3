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
          p1: { score: 0, max: 25, badge: "CRITICAL", note: "Automated Bot Traffic Rejected (HTTP 403)" },
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

    expect(robotsTxtStatus).not.toBeNull();
    expect(pillar1Score).not.toBeNull();
    expect(sec1Banner).not.toBeNull();

    expect(robotsTxtStatus.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403)");
    expect(pillar1Score.textContent.trim()).toBe("Automated Bot Traffic Rejected (HTTP 403)");
    expect(sec1Banner.style.display).not.toBe("none");
  });
});
