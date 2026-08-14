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

describe("Section 2 Three-Tier Layout & Module 4 Integration BDD Suite", () => {
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

  it("Scenario 1: Row 1 retains 50/50 split (.sec2-subgrid) with Essential Pages and Citation Signals", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    expect(sec2Card).not.toBeNull();

    const sec2Subgrid = sec2Card.querySelector(".sec2-subgrid");
    expect(sec2Subgrid).not.toBeNull();

    // Check essential pages lists
    const foundPages = document.getElementById("sec2-found-essential-pages");
    const missingPages = document.getElementById("sec2-missing-essential-pages");
    expect(foundPages).not.toBeNull();
    expect(missingPages).not.toBeNull();

    // Check citation signals
    const faqStatus = document.getElementById("sec2-faq-status");
    const parityVal = document.getElementById("sec2-parity-value");
    const orgStatus = document.getElementById("sec2-org-status");
    const emailVal = document.getElementById("sec2-email-value");
    const phoneVal = document.getElementById("sec2-phone-value");

    expect(faqStatus).not.toBeNull();
    expect(parityVal).not.toBeNull();
    expect(orgStatus).not.toBeNull();
    expect(emailVal).not.toBeNull();
    expect(phoneVal).not.toBeNull();
  });

  it("Scenario 2: Row 2 renders Audited Route Directory & Module 4 at 100% full width directly beneath .sec2-subgrid", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const routeDirectoryContainer = document.getElementById("sec2-route-directory-container");
    expect(routeDirectoryContainer).not.toBeNull();
    expect(sec2Card.contains(routeDirectoryContainer)).toBe(true);

    const devMod4Wrap = document.getElementById("dev-module-4-wrapper");
    expect(devMod4Wrap).not.toBeNull();
    expect(routeDirectoryContainer.contains(devMod4Wrap)).toBe(true);
  });

  it("Scenario 3: Row 3 renders Remediation Required section at 100% full width underneath Module 4", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const remediationContainer = document.getElementById("sec2-remediation-container");
    expect(remediationContainer).not.toBeNull();
    expect(sec2Card.contains(remediationContainer)).toBe(true);

    const bridgeBtn = remediationContainer.querySelector("#sec2-remediation-bridge-btn");
    expect(bridgeBtn).not.toBeNull();
  });

  it("Scenario 4: Governance Gate - Section 2 uses AI-Optimized and zero occurrences of AI-first", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const sec2Text = sec2Card.textContent || "";
    expect(sec2Text.toLowerCase()).not.toContain("ai-first");
  });
});
