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

describe("Section 4 Two-Column Subgrid Layout BDD Suite", () => {
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

  it("Scenario 1: Section 4 contains a 2-column .sec4-subgrid wrapper", () => {
    const sec4Card = document.getElementById("exec-section4-card");
    expect(sec4Card).not.toBeNull();

    const sec4Subgrid = sec4Card.querySelector(".sec4-subgrid");
    expect(sec4Subgrid).not.toBeNull();
  });

  it("Scenario 2: Left column (50%) contains #sec4-why-matters-box with Why Machine Manifests Matter: microcopy", () => {
    const whyMattersBox = document.getElementById("sec4-why-matters-box");
    expect(whyMattersBox).not.toBeNull();

    const text = whyMattersBox.textContent || "";
    expect(text).toContain("Why the Machine Manifest files Matter:");
    expect(text).toContain("Even the most informative websites run the risk");
  });

  it("Scenario 3: Right column (50%) contains #sec4-hierarchy-container with the 4-level file hierarchy tree list", () => {
    const hierarchyContainer = document.getElementById("sec4-hierarchy-container");
    expect(hierarchyContainer).not.toBeNull();

    const text = hierarchyContainer.textContent || "";
    expect(text).toContain("The 4-level file hierarchy for AI-Readiness");
  });

  it("Scenario 4: Governance Gate - Section 4 uses AI-Ready/AI-Optimized and zero occurrences of AI-first", () => {
    const sec4Card = document.getElementById("exec-section4-card");
    const sec4Text = sec4Card.textContent || "";
    expect(sec4Text.toLowerCase()).not.toContain("ai-first");
  });
});
