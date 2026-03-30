import { describe, expect, it } from "vitest";
import { matchGrants, GRANTS_DATABASE } from "./grantsData";

describe("grantsData", () => {
  it("should have grants in the database", () => {
    expect(GRANTS_DATABASE.length).toBeGreaterThan(0);
  });

  it("should return all grants when no filters applied", () => {
    const results = matchGrants({
      companyType: "",
      industry: "all",
      projectType: "all",
      region: "austria",
      fundingMin: 0,
      fundingMax: 0,
    });
    expect(results.length).toBeGreaterThan(0);
  });

  it("should filter by company type startup", () => {
    const results = matchGrants({
      companyType: "startup",
      industry: "all",
      projectType: "all",
      region: "austria",
      fundingMin: 0,
      fundingMax: 0,
    });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((g) => {
      expect(g.eligibleTypes).toContain("startup");
    });
  });

  it("should filter by industry tech", () => {
    const results = matchGrants({
      companyType: "startup",
      industry: "tech",
      projectType: "all",
      region: "austria",
      fundingMin: 0,
      fundingMax: 0,
    });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((g) => {
      expect(
        g.eligibleIndustries.includes("tech") || g.eligibleIndustries.includes("all")
      ).toBe(true);
    });
  });

  it("should filter by project type ai", () => {
    const results = matchGrants({
      companyType: "",
      industry: "all",
      projectType: "ai",
      region: "austria",
      fundingMin: 0,
      fundingMax: 0,
    });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((g) => {
      expect(g.projectTypes).toContain("ai");
    });
  });

  it("should filter by funding range", () => {
    const results = matchGrants({
      companyType: "",
      industry: "all",
      projectType: "all",
      region: "austria",
      fundingMin: 0,
      fundingMax: 50000,
    });
    results.forEach((g) => {
      expect(g.minAmount).toBeLessThanOrEqual(50000);
    });
  });

  it("should return vienna grants for vienna region", () => {
    const results = matchGrants({
      companyType: "",
      industry: "all",
      projectType: "all",
      region: "vienna",
      fundingMin: 0,
      fundingMax: 0,
    });
    expect(results.length).toBeGreaterThan(0);
    results.forEach((g) => {
      expect(
        g.regions.includes("vienna") || g.regions.includes("austria")
      ).toBe(true);
    });
  });

  it("should sort rolling grants first", () => {
    const results = matchGrants({
      companyType: "",
      industry: "all",
      projectType: "all",
      region: "austria",
      fundingMin: 0,
      fundingMax: 0,
    });
    const firstNonRollingIndex = results.findIndex((g) => !g.isRolling);
    const lastRollingIndex = results.map((g) => g.isRolling).lastIndexOf(true);
    if (firstNonRollingIndex !== -1 && lastRollingIndex !== -1) {
      expect(lastRollingIndex).toBeLessThan(firstNonRollingIndex);
    }
  });
});
