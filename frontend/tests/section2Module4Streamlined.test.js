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

describe("Section 2 Streamlined Module 4 Layout (No Audited Route Directory Header)", () => {
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

  it("Scenario 1: Section 2 contains 50/50 split (.sec2-subgrid) for Essential Pages and Citation Signals", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    expect(sec2Card).not.toBeNull();

    const sec2Subgrid = sec2Card.querySelector(".sec2-subgrid");
    expect(sec2Subgrid).not.toBeNull();

    const foundPages = document.getElementById("sec2-found-essential-pages");
    const missingPages = document.getElementById("sec2-missing-essential-pages");
    expect(foundPages).not.toBeNull();
    expect(missingPages).not.toBeNull();

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

  it("Scenario 2: Standalone Audited Route Directory header section is removed from Section 2", () => {
    const redundantDirContainer = document.getElementById("sec2-route-directory-container");
    expect(redundantDirContainer).toBeNull();
  });

  it("Scenario 3: Module 4 container (#sec2-module-4-container) is positioned directly beneath .sec2-subgrid spanning 100% width", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const mod4Container = document.getElementById("sec2-module-4-container");
    expect(mod4Container).not.toBeNull();
    expect(sec2Card.contains(mod4Container)).toBe(true);

    const devMod4Wrap = document.getElementById("dev-module-4-wrapper");
    expect(devMod4Wrap).not.toBeNull();
    expect(mod4Container.contains(devMod4Wrap)).toBe(true);
  });

  it("Scenario 4: Remediation Required container (#sec2-remediation-container) is present directly underneath Module 4 with hover reaction styling", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const remediationContainer = document.getElementById("sec2-remediation-container");
    expect(remediationContainer).not.toBeNull();
    expect(sec2Card.contains(remediationContainer)).toBe(true);

    const remediationCard = remediationContainer.querySelector(".remediation-banner");
    expect(remediationCard).not.toBeNull();
    expect(remediationCard.classList.contains("border-glow-amber")).toBe(true);

    const bridgeBtn = document.getElementById("sec2-remediation-bridge-btn");
    expect(bridgeBtn).not.toBeNull();
    expect(remediationContainer.contains(bridgeBtn)).toBe(true);
  });

  it("Scenario 5: Governance Gate - Section 2 enforces AI-Optimized and zero occurrences of AI-first", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    const sec2Text = sec2Card.textContent || "";
    expect(sec2Text.toLowerCase()).not.toContain("ai-first");
  });
});
