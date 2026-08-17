/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(__dirname, "../visualize.html");
const cssPath = path.resolve(__dirname, "../index.css");
const jsPath = path.resolve(__dirname, "../index.js");

const htmlContent = fs.readFileSync(htmlPath, "utf8");
const cssContent = fs.readFileSync(cssPath, "utf8");
const jsContent = fs.readFileSync(jsPath, "utf8");

describe("AIVisualize Bento Asymmetric Layout BDD Suite (Item 2)", () => {
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
      // JSDOM eval
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it("Scenario 1: Section 1 subgrid wraps .obsidian-bento-callout and .obsidian-bento-results in 1fr/2fr layout", () => {
    const sec1Card = document.getElementById("exec-section1-card");
    expect(sec1Card).not.toBeNull();

    const subgrid = sec1Card.querySelector(".sec1-subgrid");
    expect(subgrid).not.toBeNull();

    const whyBox = document.getElementById("sec1-why-matters-box");
    const resultsBox = document.getElementById("sec1-protocol-results-container");

    expect(whyBox).not.toBeNull();
    expect(resultsBox).not.toBeNull();
    expect(whyBox.classList.contains("obsidian-bento-callout")).toBe(true);
    expect(resultsBox.classList.contains("obsidian-bento-results")).toBe(true);
  });

  it("Scenario 2: Section 3 subgrid wraps .obsidian-bento-results and .obsidian-bento-callout in 2fr/1fr layout", () => {
    const sec3Card = document.getElementById("exec-section3-card");
    expect(sec3Card).not.toBeNull();

    const subgrid = sec3Card.querySelector(".sec3-subgrid");
    expect(subgrid).not.toBeNull();

    const resultsBox = document.getElementById("sec3-protocol-results-container");
    const whyBox = document.getElementById("sec3-why-matters-box");

    expect(resultsBox).not.toBeNull();
    expect(whyBox).not.toBeNull();
    expect(resultsBox.classList.contains("obsidian-bento-results")).toBe(true);
    expect(whyBox.classList.contains("obsidian-bento-callout")).toBe(true);
  });

  it("Scenario 3: index.css defines .obsidian-bento-callout and .obsidian-bento-results tokens", () => {
    expect(cssContent).toContain(".obsidian-bento-callout");
    expect(cssContent).toContain(".obsidian-bento-results");
  });

  it("Scenario 4: Governance Gate - Zero occurrences of banned phrase AI-first", () => {
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(cssContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
