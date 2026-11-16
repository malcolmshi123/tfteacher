import { ITEMS, UNIT_BY_ID, copiesOf } from "../game/set";
import type { GameRecord, Piece, RoundSnapshot } from "../game/types";

// Deterministic review rules over the round timeline. Every finding carries the
// exact rounds and numbers it used (cites), so any sentence written on top of it
// can be checked against the recording. Nothing here depends on one set.

export type Severity = "high" | "medium" | "low";

export interface Cite {
  stage: string;
  label: string;
}

export interface Finding {
  id: string;
  kind:
    | "unspent-gold"
    | "loss-streak"
    | "held-gold-low-hp"
    | "missed-upgrade"
    | "idle-items"
    | "level-tempo"
    | "early-strength";
  severity: Severity;
  positive?: boolean;
  title: string;
  detail: string;
  lines?: string[];
  advice: string;
  stages: string[]; // rounds this finding is about, for the timeline
  focus: string; // the one round to open first
  cites: Cite[];
  hpCost?: number;
  goldCost?: number;
  cost?: string; // short, quantified cost shown on the card
}

export interface SeriesPoint {
  stage: string;
  hp: number;
  gold: number;
  level: number;
  boardValue: number;
  lobbyBoardValue: number;
  lobbyLevel: number;
  lobbyHp: number;
  outcome: RoundSnapshot["outcome"];
  kind: RoundSnapshot["kind"];
  damage: number;
}

export interface Review {
  game: GameRecord;
  findings: Finding[];
  series: SeriesPoint[];
  headline: string;
  summary: string;
  stats: { label: string; value: string; note?: string }[];
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function boardValue(board: Piece[]) {
  return board.reduce((a, p) => a + UNIT_BY_ID[p.unit].cost * copiesOf(p.star), 0);
}

function ownedCopies(r: RoundSnapshot) {
  const out: Record<string, number> = {};
  for (const p of [...r.board, ...r.bench]) out[p.unit] = (out[p.unit] ?? 0) + copiesOf(p.star);
  return out;
}

function median(xs: number[]) {
  if (!xs.length) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
}

function streakGold(n: number) {
  return n >= 6 ? 3 : n >= 5 ? 2 : n >= 2 ? 1 : 0;
}

export function buildSeries(game: GameRecord): SeriesPoint[] {
  return game.rounds.map((r) => {
    const alive = r.roster.filter((o) => o.hp > 0);
    return {
      stage: r.stage,
      hp: r.hp,
      gold: r.gold,
      level: r.level,
      boardValue: boardValue(r.board),
      lobbyBoardValue: Math.round(median(alive.map((o) => o.boardValue))),
      lobbyLevel: median(alive.map((o) => o.level)),
      lobbyHp: Math.round(median(alive.map((o) => o.hp))),
      outcome: r.outcome,
      kind: r.kind,
      damage: r.damageTaken,
    };
  });
}

export function analyze(game: GameRecord): Review {
  const R = game.rounds;
  const series = buildSeries(game);
  const findings: Finding[] = [];
  const last = R[R.length - 1];
  const hpAfter = (r: RoundSnapshot) => r.hp - r.damageTaken;

  // 1. Gold left when eliminated
  if (game.placement > 1 && last.goldEnd >= 10) {
    findings.push({
      id: "unspent-gold",
      kind: "unspent-gold",
      severity: last.goldEnd >= 30 ? "high" : "medium",
      title: `Eliminated at ${last.stage} holding ${last.goldEnd} gold`,
      detail: `You started your last round with ${last.gold} gold, rolled ${last.rerolls} times and went into combat with ${last.goldEnd} left at ${last.hp} HP. That gold could not help you after this fight.`,
      advice: "When one more loss ends your game, spend down to 0 before combat: roll for upgrades first, then level if no upgrade is close.",
      stages: [last.stage],
      focus: last.stage,
      cites: [
        { stage: last.stage, label: `${last.hp} HP at start` },
        { stage: last.stage, label: `${last.rerolls} rerolls` },
        { stage: last.stage, label: `${last.goldEnd} gold into combat` },
      ],
      goldCost: last.goldEnd,
    });
  }

  // 2. Longest loss streak: what it paid and what it cost
  let best: { from: number; to: number } | null = null;
  let start = -1;
  for (let i = 0; i < R.length; i++) {
    const r = R[i];
    if (r.kind !== "pvp") continue;
    if (r.outcome === "loss") {
      if (start < 0) start = i;
      const len = R.slice(start, i + 1).filter((x) => x.kind === "pvp").length;
      const bestLen = best ? R.slice(best.from, best.to + 1).filter((x) => x.kind === "pvp").length : 0;
      if (len > bestLen) best = { from: start, to: i };
    } else start = -1;
  }
  if (best) {
    const span = R.slice(best.from, best.to + 1).filter((x) => x.kind === "pvp");
    if (span.length >= 4) {
      const hpLost = span.reduce((a, r) => a + r.damageTaken, 0);
      let earned = 0;
      span.forEach((_, k) => (earned += streakGold(k)));
      const endHp = hpAfter(span[span.length - 1]);
      const first = span[0].stage;
      const lastS = span[span.length - 1].stage;
      findings.push({
        id: "loss-streak",
        kind: "loss-streak",
        severity: endHp < 45 ? "high" : hpLost > 30 ? "medium" : "low",
        title: `${span.length}-fight loss streak cost ${hpLost} HP for ${earned} streak gold`,
        detail: `From ${first} to ${lastS} you lost every player fight and fell to ${endHp} HP. The streak paid ${earned} extra gold in total, about ${Math.round(hpLost / Math.max(1, earned))} HP per gold. That left no room to lose a fight while you built your final board.`,
        advice: "A loss streak is worth it while HP stays above about 50. Below that, spend the streak gold on board strength and take the win.",
        stages: R.slice(best.from, best.to + 1).map((r) => r.stage),
        focus: span[span.length - 1].stage,
        cites: [
          { stage: first, label: `${span[0].hp} HP` },
          { stage: lastS, label: `${endHp} HP after combat` },
          { stage: lastS, label: `+${earned} streak gold` },
        ],
        hpCost: hpLost,
      });
    }
  }

  // 3. Holding gold while HP is low
  const held = R.filter((r) => r !== last && r.kind === "pvp" && r.hp <= 40 && r.goldEnd >= 20 && r.outcome === "loss");
  if (held.length) {
    const hpLost = held.reduce((a, r) => a + r.damageTaken, 0);
    findings.push({
      id: "held-gold-low-hp",
      kind: "held-gold-low-hp",
      severity: held.length >= 2 ? "high" : "medium",
      title: `Lost ${held.length} more fight${held.length > 1 ? "s" : ""} under 40 HP with 20+ gold unspent`,
      detail: "Each of these fights started with gold you could have turned into board strength.",
      lines: held.map((r) => `${r.stage}: ${r.hp} HP, went into combat with ${r.goldEnd} gold, lost ${r.damageTaken} HP`),
      advice: "Under 40 HP, interest is worth less than HP. Roll to stabilize, then rebuild economy only after you win.",
      stages: held.map((r) => r.stage),
      focus: held[0].stage,
      cites: held.map((r) => ({ stage: r.stage, label: `${r.goldEnd} gold, ${r.hp} HP` })),
      hpCost: hpLost,
    });
  }

  // 4. Upgrades offered in shop but not bought
  const missed: { stage: string; unit: string; gold: number; shop: number }[] = [];
  for (let i = 1; i < R.length; i++) {
    const r = R[i];
    if (r.kind === "carousel") continue;
    const owned = ownedCopies(R[i - 1]);
    r.shops.forEach((shop, si) => {
      for (const u of new Set(shop)) {
        if ((owned[u] ?? 0) % 3 === 2 && !r.bought.includes(u) && r.gold >= UNIT_BY_ID[u].cost) {
          if (!missed.some((m) => m.stage === r.stage && m.unit === u))
            missed.push({ stage: r.stage, unit: u, gold: r.gold, shop: si });
        }
      }
    });
  }
  if (missed.length) {
    findings.push({
      id: "missed-upgrade",
      kind: "missed-upgrade",
      severity: missed.length >= 2 ? "medium" : "low",
      title: `Passed on ${missed.length} upgrade${missed.length > 1 ? "s" : ""} the shop offered`,
      detail: "You owned two copies each time, so one purchase would have made a 2-star.",
      lines: missed.map((m) => `${m.stage}: ${UNIT_BY_ID[m.unit].name} in ${m.shop === 0 ? "your free shop" : `roll ${m.shop}`}, with ${m.gold} gold available`),
      advice: "A 2-star upgrade on a board unit is usually worth more than the interest it costs. Buy it, even if you sell something to fit it.",
      stages: missed.map((m) => m.stage),
      focus: missed[0].stage,
      cites: missed.map((m) => ({ stage: m.stage, label: `${UNIT_BY_ID[m.unit].name}, ${m.shop === 0 ? "free shop" : `roll ${m.shop}`}` })),
    });
  }

  // 5. Item components left on the bench
  const idle: Record<string, { from: string; rounds: number }> = {};
  const idleReport: { item: string; from: string; to: string; rounds: number }[] = [];
  for (let i = 0; i < R.length; i++) {
    const r = R[i];
    const seen = new Set<string>();
    for (const it of r.itemBench) {
      seen.add(it);
      if (!idle[it]) idle[it] = { from: r.stage, rounds: 0 };
      idle[it].rounds++;
    }
    for (const it of Object.keys(idle)) {
      if (!seen.has(it) || i === R.length - 1) {
        if (idle[it].rounds >= 4)
          idleReport.push({ item: it, from: idle[it].from, to: R[seen.has(it) ? i : i - 1].stage, rounds: idle[it].rounds });
        delete idle[it];
      }
    }
  }
  if (idleReport.length) {
    const total = idleReport.reduce((a, x) => a + x.rounds, 0);
    findings.push({
      id: "idle-items",
      kind: "idle-items",
      severity: total >= 15 ? "medium" : "low",
      title: `${idleReport.length} item components sat unused, one for ${Math.max(...idleReport.map((x) => x.rounds))} rounds`,
      detail: "Components only help once they are on a unit.",
      lines: idleReport.map((x) => `${x.from}: ${ITEMS[x.item]} sat on the bench until ${x.to}, ${x.rounds} rounds`),
      advice: "Components on the bench do nothing. While you are losing, slam a strong item on any unit you will keep, even if it is not perfect.",
      stages: idleReport.map((x) => x.from),
      focus: idleReport[0].from,
      cites: idleReport.map((x) => ({ stage: x.from, label: `${ITEMS[x.item]}, ${x.rounds} rounds` })),
    });
  }

  // 6. Level tempo against the lobby
  const behind = series.filter((p) => p.kind === "pvp" && p.stage >= "3-1" && p.level < p.lobbyLevel);
  if (behind.length >= 3) {
    const worst = behind.reduce((a, b) => (b.lobbyBoardValue - b.boardValue > a.lobbyBoardValue - a.boardValue ? b : a));
    findings.push({
      id: "level-tempo",
      kind: "level-tempo",
      severity: behind.length >= 5 ? "medium" : "low",
      title: `Below lobby level in ${behind.length} fights from stage 3 on`,
      detail: `The lobby's median level passed yours from ${behind[0].stage}. The biggest gap in board strength was at ${worst.stage}: your board was worth ${worst.boardValue} against a lobby median of ${worst.lobbyBoardValue}.`,
      advice: "Higher level means more units and better shop odds. If you are not rolling for a reroll comp, match the lobby's level by stage 4.",
      stages: behind.map((p) => p.stage),
      focus: worst.stage,
      cites: [
        { stage: behind[0].stage, label: `level ${behind[0].level} vs ${behind[0].lobbyLevel}` },
        { stage: worst.stage, label: `board ${worst.boardValue} vs ${worst.lobbyBoardValue}` },
      ],
    });
  }

  // 7. What went well
  const pvp = R.filter((r) => r.kind === "pvp");
  let opening = 0;
  while (opening < pvp.length && pvp[opening].outcome === "win") opening++;
  if (opening >= 2) {
    const wins = pvp.slice(0, opening);
    findings.push({
      id: "early-strength",
      kind: "early-strength",
      positive: true,
      severity: "low",
      title: `Won your first ${opening} player fights`,
      detail: `Your board at ${wins[0].stage} was worth ${boardValue(wins[0].board)} against a lobby median of ${series.find((p) => p.stage === wins[0].stage)?.lobbyBoardValue}. The opener was not where this game was lost.`,
      advice: "Keep opening this way. Spend the review time on stage 3 and 4.",
      stages: wins.map((r) => r.stage),
      focus: wins[0].stage,
      cites: wins.map((r) => ({ stage: r.stage, label: "win" })),
    });
  }

  for (const f of findings) {
    if (f.positive) continue;
    f.cost =
      f.hpCost !== undefined
        ? `${f.hpCost} HP`
        : f.goldCost !== undefined
          ? `${f.goldCost} gold unspent`
          : f.kind === "missed-upgrade"
            ? `${f.stages.length} upgrades`
            : f.kind === "idle-items"
              ? `${f.lines?.length ?? 0} components`
              : f.kind === "level-tempo"
                ? `${f.stages.length} fights behind`
                : undefined;
  }

  findings.sort((a, b) => Number(!!a.positive) - Number(!!b.positive) || RANK[a.severity] - RANK[b.severity] || (b.hpCost ?? 0) - (a.hpCost ?? 0));

  const top = findings.filter((f) => !f.positive && f.severity === "high");
  const peakHpLoss = findings.find((f) => f.kind === "loss-streak");
  const streak = findings.find((f) => f.kind === "loss-streak");
  const streakEndHp = streak ? Math.max(0, R.find((r) => r.stage === streak.focus)!.hp - R.find((r) => r.stage === streak.focus)!.damageTaken) : undefined;
  const headline =
    game.placement <= 4
      ? `Top 4. Here is what kept it from being a win.`
      : streak && streakEndHp !== undefined && last.goldEnd >= 10
        ? `You placed ${ordinal(game.placement)}: a loss streak left you at ${streakEndHp} HP by ${streak.focus}, and you went out at ${last.stage} holding ${last.goldEnd} gold.`
        : top.length
          ? `You placed ${ordinal(game.placement)}. ${top[0].title}.`
          : `You placed ${ordinal(game.placement)}. Here is what made the difference.`;

  const totalRolls = R.reduce((a, r) => a + r.rerolls, 0);
  const r41 = R.find((r) => r.stage === "4-1");
  const lobbyHp41 = r41 ? Math.round(median(r41.roster.filter((o) => o.hp > 0).map((o) => o.hp))) : undefined;
  let summary = "";
  if (peakHpLoss) {
    const k = R.findIndex((r) => r.stage === peakHpLoss.focus);
    const after = R.slice(k + 1);
    const rolls = after.reduce((a, r) => a + r.rerolls, 0);
    const losses = after.filter((r) => r.outcome === "loss").length;
    const peak = Math.max(...after.map((r) => r.hp));
    const gold = peakHpLoss.title.match(/for (\d+)/)?.[1];
    const allRolls = rolls === totalRolls ? `all ${rolls} of your rerolls came in the last ${after.length} rounds` : `you rolled ${rolls} times in the last ${after.length} rounds`;
    summary = `The streak took ${peakHpLoss.hpCost} HP for ${gold} gold. After it, ${allRolls}, you lost ${losses} more fights, and you never got above ${peak} HP again.`;
  } else {
    summary = `You rolled ${totalRolls} times and went out with ${last.goldEnd} gold.`;
  }

  return {
    game,
    findings,
    series,
    headline,
    summary,
    stats: [
      { label: "Fights lost", value: `${R.filter((r) => r.kind === "pvp" && r.outcome === "loss").length} of ${R.filter((r) => r.kind === "pvp").length}`, note: "player fights" },
      { label: "HP entering 4-1", value: String(R.find((r) => r.stage === "4-1")?.hp ?? "n/a"), note: lobbyHp41 !== undefined ? `lobby median ${lobbyHp41}` : undefined },
      { label: "Rerolls", value: String(totalRolls), note: "whole game" },
      { label: "Gold at death", value: String(last.goldEnd) },
    ],
  };
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
