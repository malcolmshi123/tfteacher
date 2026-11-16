import { describe, expect, it } from "vitest";
import { buildSampleGame } from "../lib/game/sample";
import { analyze, boardValue } from "../lib/review/engine";

const game = buildSampleGame();
const review = analyze(game);
const byStage = Object.fromEntries(game.rounds.map((r) => [r.stage, r]));

describe("sample game economy", () => {
  it("never goes negative and follows the interest rule", () => {
    for (let i = 1; i < game.rounds.length; i++) {
      const r = game.rounds[i];
      expect(r.goldEnd).toBeGreaterThanOrEqual(0);
      if (r.stage >= "2-1") {
        const prev = game.rounds[i - 1];
        const interest = Math.min(5, Math.floor(prev.goldEnd / 10));
        // income is base 5 + interest + streak (0 to 3) + monster drops
        expect(r.gold - prev.goldEnd).toBeGreaterThanOrEqual(5 + interest);
        expect(r.gold - prev.goldEnd).toBeLessThanOrEqual(5 + interest + 3 + 4);
      }
    }
  });
  it("never fields more units than the player's level", () => {
    for (const r of game.rounds) expect(r.board.length, r.stage).toBeLessThanOrEqual(r.level + (r.xpBought ? 1 : 0));
  });
  it("only buys units that were in a shop that round", () => {
    for (const r of game.rounds) {
      if (r.kind === "carousel") continue;
      const seen: Record<string, number> = {};
      for (const u of r.shops.flat()) seen[u] = (seen[u] ?? 0) + 1;
      const need: Record<string, number> = {};
      for (const u of r.bought) need[u] = (need[u] ?? 0) + 1;
      for (const [u, n] of Object.entries(need)) expect(seen[u] ?? 0, `${r.stage} ${u}`).toBeGreaterThanOrEqual(n);
    }
  });
  it("tracks HP from damage taken", () => {
    for (let i = 1; i < game.rounds.length; i++) {
      expect(game.rounds[i].hp).toBe(game.rounds[i - 1].hp - game.rounds[i - 1].damageTaken);
    }
  });
});

describe("every cite matches the recording", () => {
  for (const f of review.findings) {
    it(`${f.id} cites real rounds`, () => {
      for (const c of f.cites) expect(byStage[c.stage], `${f.id} -> ${c.stage}`).toBeDefined();
      for (const s of f.stages) expect(byStage[s]).toBeDefined();
      expect(byStage[f.focus]).toBeDefined();
    });
  }

  it("unspent gold finding uses the last round's numbers", () => {
    const f = review.findings.find((x) => x.kind === "unspent-gold")!;
    const last = game.rounds[game.rounds.length - 1];
    expect(f.title).toContain(String(last.goldEnd));
    expect(f.focus).toBe(last.stage);
  });

  it("loss streak HP equals the damage summed over its rounds", () => {
    const f = review.findings.find((x) => x.kind === "loss-streak")!;
    const sum = f.stages.reduce((a, s) => a + byStage[s].damageTaken, 0);
    expect(f.hpCost).toBe(sum);
    // the span is continuous; every player fight inside it was a loss
    for (const s of f.stages) if (byStage[s].kind === "pvp") expect(byStage[s].outcome).toBe("loss");
  });

  it("missed upgrades really were in a shop and not bought", () => {
    const f = review.findings.find((x) => x.kind === "missed-upgrade")!;
    for (const s of f.stages) {
      const r = byStage[s];
      const units = new Set(r.shops.flat());
      expect([...units].some((u) => !r.bought.includes(u))).toBe(true);
    }
  });

  it("held-gold rounds were losses under 40 HP with 20+ gold", () => {
    const f = review.findings.find((x) => x.kind === "held-gold-low-hp")!;
    for (const s of f.stages) {
      const r = byStage[s];
      expect(r.hp).toBeLessThanOrEqual(40);
      expect(r.goldEnd).toBeGreaterThanOrEqual(20);
      expect(r.outcome).toBe("loss");
    }
  });
});

describe("ordering", () => {
  it("puts costly findings first and positives last", () => {
    const sev = review.findings.map((f) => (f.positive ? 9 : f.severity === "high" ? 0 : f.severity === "medium" ? 1 : 2));
    expect([...sev].sort((a, b) => a - b)).toEqual(sev);
  });
  it("board value counts copies", () => {
    expect(boardValue([{ unit: "aphelios", star: 2, items: [] }])).toBe(12);
  });
});

describe("streak gold", () => {
  it("is paid on the round after each fight of a loss streak", () => {
    const pvp = game.rounds.filter((r) => r.kind === "pvp");
    const i41 = game.rounds.findIndex((r) => r.stage === "4-2");
    const prev = game.rounds[i41 - 1];
    const base = 5 + Math.min(5, Math.floor(prev.goldEnd / 10));
    expect(game.rounds[i41].gold - prev.goldEnd).toBeGreaterThan(base); // streak gold on top
    expect(pvp.length).toBeGreaterThan(0);
  });
});

describe("lobby", () => {
  it("opponent HP never goes up", () => {
    for (let i = 1; i < game.rounds.length; i++)
      game.rounds[i].roster.forEach((o, j) => expect(o.hp, `${game.rounds[i].stage} ${o.name}`).toBeLessThanOrEqual(game.rounds[i - 1].roster[j].hp));
  });
});

describe("placement", () => {
  it("is 8th, so no opponent is out before the player", () => {
    expect(game.placement).toBe(8);
    for (const r of game.rounds) for (const o of r.roster) expect(o.hp, `${r.stage} ${o.name}`).toBeGreaterThan(0);
  });
});
