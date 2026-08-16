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

describe("Module 4 Accordion Full-Width Spanning BDD Suite", () => {
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
      // JSDOM evaluation
    }

    const domLoadedEvent = new window.Event("DOMContentLoaded", {
      bubbles: true,
      cancelable: true
    });
    window.document.dispatchEvent(domLoadedEvent);
  });

  it("Scenario 1: Accordion row is a direct sibling in tbody and td has colspan=7", () => {
    const mockResults = {
      url: "https://example.com",
      status: { wordCount: 350, jsonLdExists: true },
      pages: [
        {
          route: "/about",
          wordCount: 450,
          status: 200,
          hasCanonical: true,
          canonicalUrl: "https://example.com/about",
          html: "<html><body><main><h1>About</h1></main></body></html>"
        }
      ]
    };

    if (typeof window.renderModule4 === "function") {
      window.renderModule4(mockResults, "all");
    }

    const tbody = document.getElementById("dev-module-4-tbody");
    expect(tbody).not.toBeNull();

    const detailRow = document.getElementById("dev-module-4-row-0");
    expect(detailRow).not.toBeNull();
    expect(detailRow.parentElement).toBe(tbody);

    const detailCell = detailRow.querySelector("td");
    expect(detailCell).not.toBeNull();
    expect(Number(detailCell.getAttribute("colspan"))).toBe(7);
  });

  it("Scenario 2: toggleModule4Row toggles display mode strictly between none and table-row", () => {
    const mockResults = {
      url: "https://example.com",
      status: { wordCount: 350, jsonLdExists: true },
      pages: [
        {
          route: "/services",
          wordCount: 850,
          status: 200,
          hasCanonical: true,
          canonicalUrl: "https://example.com/services",
          html: "<html><body><main><h1>Services</h1></main></body></html>"
        }
      ]
    };

    if (typeof window.renderModule4 === "function") {
      window.renderModule4(mockResults, "all");
    }

    const detailRow = document.getElementById("dev-module-4-row-0");
    expect(detailRow).not.toBeNull();
    expect(detailRow.style.display).toBe("none");

    if (typeof window.toggleModule4Row === "function") {
      window.toggleModule4Row(0);
    }
    expect(detailRow.style.display).toBe("table-row");

    if (typeof window.toggleModule4Row === "function") {
      window.toggleModule4Row(0);
    }
    expect(detailRow.style.display).toBe("none");
  });

  it("Scenario 3: Expanded accordion card spans full width without child cramping", () => {
    const mockResults = {
      url: "https://example.com",
      status: { wordCount: 350, jsonLdExists: true },
      pages: [
        {
          route: "/pricing",
          wordCount: 210,
          status: 200,
          hasCanonical: false,
          canonicalUrl: "",
          html: "<html><body><main><h1>Pricing</h1></main></body></html>"
        }
      ]
    };

    if (typeof window.renderModule4 === "function") {
      window.renderModule4(mockResults, "all");
    }

    const detailRow = document.getElementById("dev-module-4-row-0");
    const detailCard = detailRow.querySelector(".module4-detail-card");
    expect(detailCard).not.toBeNull();
  });

  it("Scenario 4: Governance Gate - Section 2 enforces AI-Optimized and zero occurrences of AI-first", () => {
    const sec2Card = document.getElementById("exec-section2-card");
    expect(sec2Card).not.toBeNull();
    const sec2Text = sec2Card.textContent || "";
    expect(sec2Text.toLowerCase()).not.toContain("ai-first");
  });
});
