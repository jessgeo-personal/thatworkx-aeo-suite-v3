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
      // Ignore initial load evaluation errors
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it("Scenario 1: Verify #exec-welcome-banner prominently features the AIVisualize logo and updated brand analysis headline & subtext", () => {
    const banner = document.getElementById("exec-welcome-banner");
    expect(banner).not.toBeNull();

    // Verify prominent logo image
    const logoImg = banner.querySelector("img");
    expect(logoImg).not.toBeNull();
    expect(logoImg.getAttribute("src")).toMatch(/aivisualize-logo|AIV-light-logo/i);

    // Verify updated executive copy
    const text = banner.textContent;
    expect(text).toContain("Analyse how AI Visualizes your brand using your human-friendly web presence");
    expect(text).toContain("Reviews how your current web presence might be ideal for your customers");
  });

  it("Scenario 2: Verify visualize.html retains Educational Onboarding Modal container (#exec-onboarding-modal) with close controls", () => {
    const modal = document.getElementById("exec-onboarding-modal");
    expect(modal).not.toBeNull();

    const closeBtn = document.getElementById("btn-close-tour-modal");
    expect(closeBtn).not.toBeNull();
    expect(modal.contains(closeBtn)).toBe(true);
  });

  it("Scenario 3: Verify index.js safely handles modal lifecycle without DOM exception", () => {
    const modal = document.getElementById("exec-onboarding-modal");
    const closeBtn = document.getElementById("btn-close-tour-modal");

    expect(modal).not.toBeNull();
    expect(closeBtn).not.toBeNull();

    // Initial state: modal is hidden
    expect(modal.style.display).toBe("none");

    // Close button click keeps it hidden
    closeBtn.click();
    expect(modal.style.display).toBe("none");
  });

  it("Scenario 4: Vocabulary Gate - Assert zero occurrences of the banned phrase \"AI-first\" across index.css, visualize.html, and index.js", () => {
    expect(cssContent.toLowerCase()).not.toContain("ai-first");
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
    expect(jsContent.toLowerCase()).not.toContain("ai-first");
  });
});
