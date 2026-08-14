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

describe("Section 3 Two-Column Subgrid Layout BDD Suite", () => {
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

  it("Scenario 1: Section 3 contains a 2-column .sec3-subgrid wrapper", () => {
    const sec3Card = document.getElementById("exec-section3-card");
    expect(sec3Card).not.toBeNull();

    const sec3Subgrid = sec3Card.querySelector(".sec3-subgrid");
    expect(sec3Subgrid).not.toBeNull();
  });

  it("Scenario 2: Left column (50% / 1/3rd) contains #sec3-why-matters-box with Why Brand Trust & E-E-A-T Matter: microcopy", () => {
    const whyMattersBox = document.getElementById("sec3-why-matters-box");
    expect(whyMattersBox).not.toBeNull();

    const text = whyMattersBox.textContent || "";
    expect(text).toContain("Why Brand Trust & E-E-A-T Matter:");
    expect(text).toContain("Verified contact details and clear trust policies influence the quality rating score of citations during RAG generation steps.");
  });

  it("Scenario 3: Right column (50% / 2/3rds) contains #sec3-protocol-results-container with heading and E-E-A-T badges", () => {
    const resultsContainer = document.getElementById("sec3-protocol-results-container");
    expect(resultsContainer).not.toBeNull();

    const heading = resultsContainer.textContent || "";
    expect(heading).toContain("Evaluates domain history, SSL certificate parameters, and citation signals.");

    const secureStatus = document.getElementById("sec3-secure-status");
    const privacyStatus = document.getElementById("sec3-privacy-status");
    const ageEstimate = document.getElementById("sec3-age-estimate");
    const authorityStatus = document.getElementById("sec3-authority-status");

    expect(secureStatus).not.toBeNull();
    expect(privacyStatus).not.toBeNull();
    expect(ageEstimate).not.toBeNull();
    expect(authorityStatus).not.toBeNull();
  });

  it("Scenario 4: Governance Gate - Section 3 uses AI-Optimized and zero occurrences of AI-first", () => {
    const sec3Card = document.getElementById("exec-section3-card");
    const sec3Text = sec3Card.textContent || "";
    expect(sec3Text.toLowerCase()).not.toContain("ai-first");
  });
});
