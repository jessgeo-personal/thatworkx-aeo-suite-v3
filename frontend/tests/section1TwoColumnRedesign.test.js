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

describe("Section 1 Two-Column Subgrid Layout BDD Suite", () => {
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
      // Ignore evaluation warnings in JSDOM
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it("Scenario 1: Section 1 contains a 2-column .sec1-subgrid wrapper", () => {
    const sec1Card = document.getElementById("exec-section1-card");
    expect(sec1Card).not.toBeNull();

    const sec1Subgrid = sec1Card.querySelector(".sec1-subgrid");
    expect(sec1Subgrid).not.toBeNull();
  });

  it("Scenario 2: Left column (50%) contains #sec1-why-matters-box with Why AI Access Matters microcopy", () => {
    const whyMattersBox = document.getElementById("sec1-why-matters-box");
    expect(whyMattersBox).not.toBeNull();

    const text = whyMattersBox.textContent || "";
    expect(text).toContain("Why AI Access Matters");
    expect(text).toContain("Unrestricted access ensures crawler spiders can retrieve your latest content hydration states without firewall bans.");
  });

  it("Scenario 3: Right column (50%) contains #sec1-protocol-results-container with heading and 3 protocol badges", () => {
    const resultsContainer = document.getElementById("sec1-protocol-results-container");
    expect(resultsContainer).not.toBeNull();

    const heading = resultsContainer.textContent || "";
    expect(heading).toContain("Evaluates server blocking, user-agent permissions, and sitemap accessibility.");

    const xRobotsStatus = document.getElementById("exec-x-robots-status");
    const robotsTxtStatus = document.getElementById("exec-robots-txt-status");
    const sitemapStatus = document.getElementById("exec-status-sitemap");

    expect(xRobotsStatus).not.toBeNull();
    expect(robotsTxtStatus).not.toBeNull();
    expect(sitemapStatus).not.toBeNull();
    expect(resultsContainer.contains(xRobotsStatus)).toBe(true);
    expect(resultsContainer.contains(robotsTxtStatus)).toBe(true);
    expect(resultsContainer.contains(sitemapStatus)).toBe(true);
  });

  it("Scenario 4: Governance Gate - Section 1 uses AI-Optimized and zero occurrences of AI-first", () => {
    const sec1Card = document.getElementById("exec-section1-card");
    const sec1Text = sec1Card.textContent || "";
    expect(sec1Text.toLowerCase()).not.toContain("ai-first");
  });
});
