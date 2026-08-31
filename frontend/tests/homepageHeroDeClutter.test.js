/**
 * @vitest-environment jsdom
 */

import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";

const htmlPath = path.resolve(__dirname, "../index.html");
const htmlContent = fs.readFileSync(htmlPath, "utf8");

describe("Module 3: Homepage Hero De-Cluttering BDD Suite", () => {
  it("Scenario 1: Hero launcher deck buttons are hidden from the visible layout", () => {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;
    const visualizeBtn = document.getElementById("btn-tab-visualize");
    expect(visualizeBtn).not.toBeNull();
    
    // Traverse parent elements to check for display: none styling wrapper
    let parent = visualizeBtn.parentElement;
    let isHidden = false;
    while (parent) {
      if (parent.style && parent.style.display === "none") {
        isHidden = true;
        break;
      }
      parent = parent.parentElement;
    }
    expect(isHidden).toBe(true);
  });

  it("Scenario 2: Single input target URL field and Submit CTA exist in Hero", () => {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const input = document.getElementById("onboarding-target-url");
    const submitBtn = document.getElementById("onboarding-submit-btn");

    expect(input).not.toBeNull();
    expect(submitBtn).not.toBeNull();
    expect(submitBtn.textContent.trim()).toBe("Run Free AEO Diagnostic Scan →");
  });

  it("Scenario 3: Product Bento Grid and Demo Chips are preserved", () => {
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    const bentoGrid = document.getElementById("product-bento-grid");
    expect(bentoGrid).not.toBeNull();

    // Verify demo chips (shopify, stripe, airbnb) exist
    const text = document.body.textContent;
    expect(text).toContain("shopify.com");
    expect(text).toContain("stripe.com");
    expect(text).toContain("airbnb.com");
  });

  it("Scenario 4: Governance Gate - Zero occurrences of legacy phrase AI-first", () => {
    expect(htmlContent.toLowerCase()).not.toContain("ai-first");
  });
});
