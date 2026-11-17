import { describe, expect, it } from "vitest";
import { allGames, gameById } from "../lib/game/games";
import { MY_COMPS } from "../lib/patch/radar";
import { analyze, unitsLostBy } from "../lib/review/engine";
import { WIN_GOLD, interest, passiveIncome, streakGold } from "../lib/game/rules";
import { buildFacts } from "../lib/ask/facts";
import { checkAnswer } from "../lib/ask/check";

// The same invariants the sample game is held to, for every game in the account.
describe.each(allGames().map((g) => [g.game.id, g] as const))("game %s", (_id, { game, comp }) => {
  const R = game.rounds;
  it("follows the income rules exactly and never goes negative", () => {
    // passive + interest + streak gold (every round while it lasts) + 1 for a player-fight win; PvE rounds may add drops
    let streak = 0;
    let wonLast = false;
    for (let i = 0; i < R.length; i++) {
      expect(R[i].goldEnd).toBeGreaterThanOrEqual(0);
      if (i > 0) {
        const later = R[i].stage >= "2-1";
        const due = passiveIncome(R[i].stage) + (later ? interest(R[i - 1].goldEnd) + streakGold(Math.abs(streak)) : 0) + (wonLast ? WIN_GOLD : 0);
        const got = R[i].gold - R[i - 1].goldEnd;
        if (R[i].kind === "pve") {
          expect(got, R[i].stage).toBeGreaterThanOrEqual(due);
          expect(got, R[i].stage).toBeLessThanOrEqual(due + 4);
        } else expect(got, R[i].stage).toBe(due);
      }
      wonLast = R[i].kind === "pvp" && R[i].outcome === "win";
      if (R[i].kind === "pvp" && R[i].outcome === "win") streak = streak > 0 ? streak + 1 : 1;
      if (R[i].kind === "pvp" && R[i].outcome === "loss") streak = streak < 0 ? streak - 1 : -1;
    }
  });
  it("takes stage damage plus 1 per surviving enemy unit on every loss", () => {
    for (const r of game.rounds) if (r.kind === "pvp" && r.outcome === "loss") {
      const n = unitsLostBy(r.stage, r.damageTaken);
      expect(n, r.stage).toBeGreaterThanOrEqual(1);
      expect(n, r.stage).toBeLessThanOrEqual(10);
    }
  });

  it("never fields more units than its level", () => {
    for (const r of R) expect(r.board.length, r.stage).toBeLessThanOrEqual(r.level);
  });
  it("only buys units that were in a shop", () => {
    for (const r of R) {
      if (r.kind === "carousel") continue;
      const seen: Record<string, number> = {};
      for (const u of r.shops.flat()) seen[u] = (seen[u] ?? 0) + 1;
      const need: Record<string, number> = {};
      for (const u of r.bought) need[u] = (need[u] ?? 0) + 1;
      for (const [u, n] of Object.entries(need)) expect(seen[u] ?? 0, `${r.stage} ${u}`).toBeGreaterThanOrEqual(n);
    }
  });
  it("loses HP only from damage taken, and goes out on its last round", () => {
    for (let i = 1; i < R.length; i++) expect(R[i].hp).toBe(R[i - 1].hp - R[i - 1].damageTaken);
    const last = R[R.length - 1];
    // the last hit can overkill
    if (game.placement > 1) expect(last.hp - last.damageTaken).toBeLessThanOrEqual(0);
  });
  it("leaves exactly the players who placed above it alive", () => {
    const last = R[R.length - 1];
    expect(last.roster.filter((o) => o.hp > 0).length).toBe(game.placement - 1);
    for (let i = 1; i < R.length; i++) R[i].roster.forEach((o, j) => expect(o.hp).toBeLessThanOrEqual(R[i - 1].roster[j].hp));
  });
  it("states only numbers the recording backs, in its headline and summary", () => {
    const review = analyze(game);
    const facts = buildFacts(review);
    for (const s of checkAnswer(`${review.headline} ${review.shortHeadline} ${review.summary}`, facts)) expect(s.unsupported, s.text).toEqual([]);
  });
  it("takes the lobby median HP over opponents still alive", () => {
    const s = analyze(game).series;
    game.rounds.forEach((r, i) => {
      const alive = r.roster.filter((o) => o.hp > 0).map((o) => o.hp);
      expect(s[i].lobbyAlive, r.stage).toBe(alive.length);
      if (alive.length) {
        expect(s[i].lobbyHp, r.stage).toBeGreaterThanOrEqual(Math.min(...alive));
        expect(s[i].lobbyHp, r.stage).toBeLessThanOrEqual(Math.max(...alive));
      }
    });
  });
  it("ends on its comp's core board", () => {
    const core = MY_COMPS.find((c) => c.id === comp)!.core;
    const board = new Set(R[R.length - 1].board.map((p) => p.unit));
    const shared = core.filter((u) => board.has(u)).length;
    expect(shared / core.length).toBeGreaterThanOrEqual(0.6);
  });
  it("reviews with findings that cite real rounds", () => {
    const review = analyze(game);
    expect(review.findings.length).toBeGreaterThan(0);
    const stages = new Set(R.map((r) => r.stage));
    for (const f of review.findings) for (const c of f.cites) expect(stages.has(c.stage), `${f.id} ${c.stage}`).toBe(true);
  });
});

describe("account", () => {
  it("lists games newest first and finds them by id", () => {
    const g = allGames();
    for (let i = 1; i < g.length; i++) expect(g[i - 1].game.playedAt >= g[i].game.playedAt).toBe(true);
    expect(gameById("sample")?.game.placement).toBe(8);
    expect(gameById("nope")).toBeUndefined();
  });
});
