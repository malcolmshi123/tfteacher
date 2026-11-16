import { describe, expect, it } from "vitest";
import { NOTES, PATCH_SUMMARY, changePct, radar } from "../lib/patch/radar";
import { UNIT_BY_ID } from "../lib/game/set";

describe("patch radar", () => {
  it("measures single and tiered changes", () => {
    expect(changePct("Kha'Zix health 750 to 700")).toBeCloseTo(-6.67, 1);
    expect(changePct("Master Yi ability shield 250/325/450 to 280/360/500")).toBeCloseTo(11.3, 1);
    expect(changePct("Level 8 shop odds for 4-costs 24% to 22%")).toBeCloseTo(-8.33, 1);
  });
  it("gives every comp a verdict backed by at least one line", () => {
    for (const v of radar()) expect(v.lines.length).toBeGreaterThan(0);
  });
  it("backs every try and avoid pick with real lines that point the same way", () => {
    const byId = new Map(NOTES.map((n) => [n.id, n]));
    const check = (picks: typeof PATCH_SUMMARY.avoid, want: "buff" | "nerf") => {
      for (const pk of picks) {
        const lines = pk.lines.map((id) => byId.get(id));
        expect(lines.every(Boolean), pk.name).toBe(true);
        const net = lines.reduce((a, n) => a + (n!.direction === want ? n!.weight : -n!.weight), 0);
        expect(net, pk.name).toBeGreaterThan(0);
        for (const u of pk.units) expect(UNIT_BY_ID[u], u).toBeDefined();
      }
    };
    check(PATCH_SUMMARY.tryThese, "buff");
    check(PATCH_SUMMARY.avoid, "nerf");
  });
});
