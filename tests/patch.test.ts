import { describe, expect, it } from "vitest";
import { changePct, radar } from "../lib/patch/radar";

describe("patch radar", () => {
  it("measures single and tiered changes", () => {
    expect(changePct("Kestrel attack damage 62 to 56")).toBeCloseTo(-9.68, 1);
    expect(changePct("Liora ability shield 250/325/450 to 280/360/500")).toBeCloseTo(11.3, 1);
    expect(changePct("Level 8 shop odds for 4-costs 24% to 22%")).toBeCloseTo(-8.33, 1);
  });
  it("gives every comp a verdict backed by at least one line", () => {
    for (const v of radar()) expect(v.lines.length).toBeGreaterThan(0);
  });
});
