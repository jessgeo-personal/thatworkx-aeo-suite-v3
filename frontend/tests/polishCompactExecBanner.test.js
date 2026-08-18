/**
 * @vitest-environment jsdom
 */

import { describe, it, expect, beforeEach } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(__dirname, "../visualize.html");
const jsPath = path.resolve(__dirname, "../index.js");
const cssPath = path.resolve(__dirname, "../index.css");

const htmlContent = fs.readFileSync(htmlPath, "utf8");
const jsContent = fs.readFileSync(jsPath, "utf8");
const cssContent = fs.readFileSync(cssPath, "utf8");

describe("Compact Exec Welcome Banner and Brand Showcase BDD Suite", () => {
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

  it("Scenario 1: Verify #exec-welcome-banner displays updated brand analysis headline & subtext clearly", () => {
    const banner = document.getElementById("exec-welcome-banner");
    expect(banner).not.toBeNull();

    const text = banner.textContent;
    expect(text).toContain("Analyse how AI Visualizes your brand using your human-friendly web presence");
    expect(text).toContain("Reviews how your current web presence might be ideal for your customers");
  });

  it("Scenario 2: Verify Control Header Card prominently features the AIVisualize brand logo", () => {
    const logoImg = document.querySelector(".aivisualize-header-logo");
    expect(logoImg).not.toBeNull();
    expect(logoImg.getAttribute("src")).toMatch(/aivisualize-logo|AIV-light-logo/i);
  });

  it("Scenario 3: Verify visualize.html retains Educational Onboarding Modal container (#exec-onboarding-modal) with close controls", () => {
    const modal = document.getElementById("exec-onboarding-modal");
    expect(modal).not.toBeNull();

    const closeBtn = document.getElementById("btn-close-tour-modal");
    expect(closeBtn).not.toBeNull();
    expect(modal.contains(closeBtn)).toBe(true);
  });

  it("Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase \"AI-first\" across index.css, visualize.html, and index.js", () => {
    expect(cssContent.toLowerCase()).not.toContain("ai-first");
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
