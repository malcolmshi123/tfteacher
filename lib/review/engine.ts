import { ITEMS, UNIT_BY_ID, copiesOf } from "../game/set";
import type { GameRecord, Piece, RoundSnapshot } from "../game/types";
import { streakGold } from "../game/rules";

// Deterministic review rules over the round timeline. Every finding carries the
// exact rounds and numbers it used (cites), so any sentence written on top of it
// can be checked against the recording. Nothing here depends on one set.

export type Severity = "high" | "medium" | "low";

export interface Cite {
  stage: string;
  to?: string; // a range of rounds: "2-3 to 4-1"
  label: string;
}

// Placement colors as tactics.tools draws them: 1st gold, 2nd purple, 3rd blue, 4th green, 5th to 8th grey.
export function placeColor(place: number): string {
  return ["#f1c555", "#dc38c3", "#6eccff", "#37d488"][place - 1] ?? "#bbbbbb";
}

// Player damage after a loss is the stage's base damage plus 1 per enemy unit still standing.
export const STAGE_DAMAGE = [0, 0, 2, 5, 7, 9, 11, 17];
export function unitsLostBy(stage: string, damage: number): number {
  return damage - (STAGE_DAMAGE[Number(stage.split("-")[0])] ?? 0);
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
  goldEnd: number;
  level: number;
  boardValue: number;
  lobbyBoardValue: number;
  lobbyLevel: number;
  lobbyHp: number; // after this round's fights
  lobbyHpEntering: number; // before them (the previous round's roster)
  lobbyAlive: number; // opponents still in after this round; the HP median means little under 4
  lobbyAliveEntering: number;
  outcome: RoundSnapshot["outcome"];
  kind: RoundSnapshot["kind"];
  damage: number;
}

export interface Review {
  game: GameRecord;
  findings: Finding[];
  series: SeriesPoint[];
  headline: string;
  shortHeadline: string;
  summary: string;
  stats: { label: string; value: string; note?: string }[];
}

const RANK: Record<Severity, number> = { high: 0, medium: 1, low: 2 };

export function boardValue(board: Piece[]) {
  return board.reduce((a, p) => a + UNIT_BY_ID[p.unit].cost * copiesOf(p.star), 0);
}

// Walks a round's shops in order. Each purchase takes the first slot showing that
// unit; a slot left behind while you held 2 (or 5, or 8) copies is a missed upgrade.
// Slot keys are "shop:slot".
export function shopMarks(prev: RoundSnapshot, r: RoundSnapshot) {
  const owned = ownedCopies(prev);
  const toBuy = [...r.bought];
  const bought = new Set<string>();
  const missed = new Set<string>();
  r.shops.forEach((shop, si) =>
    shop.forEach((u, k) => {
      const j = toBuy.indexOf(u);
      if (j >= 0) {
        toBuy.splice(j, 1);
        owned[u] = (owned[u] ?? 0) + 1;
        bought.add(`${si}:${k}`);
      } else if ((owned[u] ?? 0) % 3 === 2 && r.gold >= UNIT_BY_ID[u].cost) missed.add(`${si}:${k}`);
    }),
  );
  return { bought, missed };
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

// streak length entering each round, counted the way the game pays it
function streakBefore(R: RoundSnapshot[]): number[] {
  const out: number[] = [];
  let s = 0;
  for (const r of R) {
    out.push(s);
    if (r.kind === "pvp" && r.outcome === "win") s = s > 0 ? s + 1 : 1;
    if (r.kind === "pvp" && r.outcome === "loss") s = s < 0 ? s - 1 : -1;
  }
  return out;
}

export function buildSeries(game: GameRecord): SeriesPoint[] {
  return game.rounds.map((r, i) => {
    const alive = r.roster.filter((o) => o.hp > 0);
    // HP median counts knocked-out players at 0, so it can only go down
    const before = (game.rounds[i - 1] ?? r).roster;
    return {
      stage: r.stage,
      hp: r.hp,
      gold: r.gold,
      goldEnd: r.goldEnd,
      level: r.level,
      boardValue: boardValue(r.board),
      lobbyBoardValue: Math.round(median(alive.map((o) => o.boardValue))),
      lobbyLevel: median(alive.map((o) => o.level)),
      lobbyHp: Math.round(median(r.roster.map((o) => o.hp))),
      lobbyHpEntering: Math.round(median(before.map((o) => o.hp))),
      lobbyAlive: alive.length,
      lobbyAliveEntering: before.filter((o) => o.hp > 0).length,
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
      title: `Died on ${last.stage} holding ${last.goldEnd} gold`,
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
      // the streak gold actually paid: every round from the first loss up to the round after the last
      const before = streakBefore(R);
      let earned = 0;
      for (let i = best.from + 1; i <= Math.min(best.to + 1, R.length - 1); i++) if (before[i] < 0) earned += streakGold(-before[i]);
      const endHp = hpAfter(span[span.length - 1]);
      const first = span[0].stage;
      const lastS = span[span.length - 1].stage;
      findings.push({
        id: "loss-streak",
        kind: "loss-streak",
        severity: endHp < 45 ? "high" : hpLost > 30 ? "medium" : "low",
        title: `${span.length}-fight loss streak cost ${hpLost} HP for ${earned} streak gold`,
        detail: `From ${first} to ${lastS} you lost every player fight and fell to ${endHp} HP. The streak paid ${earned} extra gold in total, about ${Math.round(hpLost / Math.max(1, earned))} HP per gold. That left no room to lose a fight while you built your final board.`,
        advice: "A loss streak is worth it while HP stays above about 40. Below that, spend the streak gold on board strength and take the win.",
        stages: R.slice(best.from, best.to + 1).map((r) => r.stage),
        focus: span[span.length - 1].stage,
        cites: [
          { stage: first, label: `${span[0].hp} HP before combat` },
          { stage: lastS, label: `${endHp} HP after combat` },
          { stage: first, to: lastS, label: `+${earned} streak gold` },
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
      title: `Lost at ${held.map((r) => r.stage).join(" and ")} under 40 HP with ${held.map((r) => r.goldEnd).join(" and ")} gold unspent`,
      detail: held.length > 1 ? `Each of these fights started with gold you could have turned into board strength. Together they cost ${hpLost} HP.` : `This fight started with gold you could have turned into board strength. It cost ${hpLost} HP.`,
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
    for (const key of shopMarks(R[i - 1], r).missed) {
      const [si, k] = key.split(":").map(Number);
      const u = r.shops[si][k];
      if (!missed.some((m) => m.stage === r.stage && m.unit === u)) missed.push({ stage: r.stage, unit: u, gold: r.gold, shop: si });
    }
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
    // each copy of a component is tracked on its own ("rod#0", "rod#1")
    const seen = new Set<string>();
    const n: Record<string, number> = {};
    for (const base of r.itemBench) {
      const it = `${base}#${(n[base] = (n[base] ?? -1) + 1)}`;
      seen.add(it);
      if (!idle[it]) idle[it] = { from: r.stage, rounds: 0 };
      idle[it].rounds++;
    }
    for (const it of Object.keys(idle)) {
      if (!seen.has(it) || i === R.length - 1) {
        if (idle[it].rounds >= 4)
          idleReport.push({ item: it.split("#")[0], from: idle[it].from, to: R[seen.has(it) ? i : i - 1].stage, rounds: idle[it].rounds });
        delete idle[it];
      }
    }
  }
  if (idleReport.length) {
    findings.push({
      id: "idle-items",
      kind: "idle-items",
      severity: "medium",
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
  // slow-rolling a reroll comp on 7 is a plan, not a missed level: skip rounds at
  // level 7+ where the bench holds extra copies of a board unit costing 3 or less
  const rerolling = (r: RoundSnapshot) =>
    r.level >= 7 && r.bench.some((b) => UNIT_BY_ID[b.unit].cost <= 3 && r.board.some((p) => p.unit === b.unit));
  // a median needs at least 4 opponents; past that the chart drops it, so the finding does too
  const withLobby = (p: SeriesPoint) => p.kind === "pvp" && p.lobbyAlive >= 4;
  const behind = series.filter((p, i) => withLobby(p) && p.stage >= "3-1" && p.level < p.lobbyLevel && !rerolling(R[i]));
  if (behind.length >= 3) {
    const counted = series.filter((p) => withLobby(p) && p.stage >= behind[0].stage);
    const range = counted.length > 1 ? `from ${behind[0].stage} to ${counted[counted.length - 1].stage}` : `at ${behind[0].stage}`;
    const worst = behind.reduce((a, b) => (b.lobbyBoardValue - b.boardValue > a.lobbyBoardValue - a.boardValue ? b : a));
    findings.push({
      id: "level-tempo",
      kind: "level-tempo",
      severity: behind.length >= 5 ? "medium" : "low",
      title: `Below lobby level in ${behind.length} of ${counted.length} fights ${range}`,
      detail: `In the ${counted.length} fights ${range}, while at least 4 opponents were left, you were a level behind the lobby's median in ${behind.length}, and fewer slots meant a weaker board: at ${worst.stage} yours was worth ${worst.boardValue} against a lobby median of ${worst.lobbyBoardValue}.`,
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
      detail: `You won ${wins.map((w) => w.stage).join(" and ")} and kept all ${wins[0].hp} HP until your first loss.${game.placement > 4 ? " The opener was not where this game was lost." : " The opener set this game up."}`,
      advice: "Keep opening this way. Spend the review time on stage 3 and 4.",
      stages: wins.map((r) => r.stage),
      focus: wins[0].stage,
      cites: wins.map((r) => ({ stage: r.stage, label: "win" })),
    });
  }

  const plural = (n: number, w: string) => `${n} ${w}${n === 1 ? "" : "s"}`;
  for (const f of findings) {
    if (f.positive) continue;
    f.cost =
      f.hpCost !== undefined
        ? `−${f.hpCost} HP`
        : f.goldCost !== undefined
          ? `${f.goldCost} gold unspent`
          : f.kind === "missed-upgrade"
            ? plural(f.stages.length, "upgrade")
            : f.kind === "idle-items"
              ? plural(f.lines?.length ?? 0, "component")
              : f.kind === "level-tempo"
                ? `${plural(f.stages.length, "fight")} behind`
                : undefined;
  }

  // one order a reader can check from the badges: HP lost first (most first), then gold unspent, then the rest by severity
  const tier = (f: Finding) => (f.positive ? 3 : f.hpCost !== undefined ? 0 : f.goldCost !== undefined ? 1 : 2);
  findings.sort((a, b) => tier(a) - tier(b) || (b.hpCost ?? 0) - (a.hpCost ?? 0) || (b.goldCost ?? 0) - (a.goldCost ?? 0) || RANK[a.severity] - RANK[b.severity]);

  const peakHpLoss = findings.find((f) => f.kind === "loss-streak");
  const streak = findings.find((f) => f.kind === "loss-streak");
  const streakEndHp = streak ? Math.max(0, R.find((r) => r.stage === streak.focus)!.hp - R.find((r) => r.stage === streak.focus)!.damageTaken) : undefined;
  const place = ordinal(game.placement);
  const streakStory = !!streak && streakEndHp !== undefined && last.goldEnd >= 10;

  // Every other game: what went well (a strong opening), then the costliest mistake,
  // both said in the player's own numbers.
  const worst = findings.find((f) => !f.positive);
  const opener = findings.find((f) => f.kind === "early-strength");
  const listStages = (xs: string[]) => (xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`);
  const mistake = (f: Finding): string => {
    switch (f.kind) {
      case "held-gold-low-hp":
        return `lost at ${listStages(f.stages)} under 40 HP with ${listStages(f.stages.map((s) => String(R.find((r) => r.stage === s)!.goldEnd)))} gold unspent`;
      case "unspent-gold":
        return `died on ${last.stage} holding ${last.goldEnd} gold`;
      case "missed-upgrade":
        return `passed on ${f.stages.length} upgrade${f.stages.length === 1 ? "" : "s"} the shop offered`;
      case "idle-items":
        return `left ${f.lines?.length ?? 0} item components on your bench, one for ${f.title.match(/for (\d+) rounds/)?.[1] ?? "several"} rounds`;
      case "level-tempo":
        return `fell a level behind the lobby in ${f.stages.length} fights`;
      case "loss-streak":
        return `lost ${f.title.match(/^(\d+)/)?.[1]} fights in a row for ${f.hpCost} HP`;
      default:
        return f.title.charAt(0).toLowerCase() + f.title.slice(1);
    }
  };
  const good = opener ? `won your first ${opener.stages.length} player fights` : "";
  const bad = worst ? mistake(worst) : `died on ${last.stage}`;
  const story = bad;
  // the headline says what the mistake cost; the finding card below keeps the round-by-round title
  const verdict = (f: Finding): string => {
    switch (f.kind) {
      case "held-gold-low-hp":
        return `Gold you didn't spend under 40 HP cost you ${f.hpCost} HP at ${listStages(f.stages)}`;
      case "unspent-gold":
        return `You died on ${last.stage} with ${last.goldEnd} gold that never reached your board`;
      case "missed-upgrade":
        return `${f.stages.length} 2-star${f.stages.length === 1 ? "" : "s"} you could have bought stayed in the shop`;
      case "idle-items":
        return `${f.lines?.length ?? 0} item components never made it onto your board; one waited ${f.title.match(/for (\d+) rounds/)?.[1] ?? "several"} rounds`;
      case "level-tempo":
        return `A level behind the lobby in ${f.stages.length} fights left your board short of units`;
      default:
        return `You ${mistake(f)}`;
    }
  };

  const headline = streakStory
    ? `A loss streak left you at ${streakEndHp} HP after ${streak!.focus}, and you died on ${last.stage} holding ${last.goldEnd} gold.`
    : `${worst ? verdict(worst) : `You ${story}`}.`;

  const totalRolls = R.reduce((a, r) => a + r.rerolls, 0);
  let summary = "";
  if (peakHpLoss) {
    const k = R.findIndex((r) => r.stage === peakHpLoss.focus);
    const after = R.slice(k + 1);
    const rolls = after.reduce((a, r) => a + r.rerolls, 0);
    const losses = after.filter((r) => r.outcome === "loss").length;
    const gold = peakHpLoss.title.match(/for (\d+)/)?.[1];
    const allRolls = rolls === totalRolls ? `all ${rolls} of your rerolls came in the last ${after.length} rounds` : `you rolled ${rolls} times in the last ${after.length} rounds`;
    // rolls that bought no board strength are worth saying out loud
    const flat = boardValue(R[k].board) === boardValue(last.board) && rolls > 0;
    summary = `The streak took ${peakHpLoss.hpCost} HP for ${gold} gold. After it, ${allRolls}${flat ? `, yet your units were still worth ${boardValue(last.board)} gold at the end` : ""}, and you lost ${losses} of the ${after.filter((r) => r.kind === "pvp").length} fights that were left.`;
  } else {
    const fights = R.filter((r) => r.kind === "pvp");
    const lost = fights.filter((r) => r.outcome === "loss").length;
    summary =
      game.placement > 1
        ? `${good ? `You ${good}, lost ${lost} of ${fights.length} overall` : `You lost ${lost} of ${fights.length} player fights`} and died on ${last.stage}${last.goldEnd >= 10 ? ` holding ${last.goldEnd} gold` : ""}.`
        : `You lost ${lost} of ${fights.length} player fights and won the lobby.`;
  }

  return {
    game,
    findings,
    series,
    headline,
    shortHeadline: streakStory
      ? `${place}: down to ${streakEndHp} HP after ${streak!.focus}, died on ${last.stage} holding ${last.goldEnd} gold.`
      : `${place}: ${bad}.`,
    summary,
    stats: [
      { label: "Fights lost", value: `${R.filter((r) => r.kind === "pvp" && r.outcome === "loss").length} of ${R.filter((r) => r.kind === "pvp").length}`, note: "player fights" },
      // the HP stat follows the round this game turned on: the streak's end, else the costliest mistake
      (() => {
        const keyStage = streak?.focus ?? worst?.focus ?? "4-1";
        const k = R.findIndex((r) => r.stage === keyStage);
        if (k < 0) return { label: "HP after 4-1", value: "n/a" };
        const pt = series[k];
        return {
          label: `HP after ${keyStage}`,
          value: String(Math.max(0, R[k].hp - R[k].damageTaken)),
          note: pt.lobbyAlive >= 4 ? `lobby median ${pt.lobbyHp}` : `${pt.lobbyAlive} opponents left`,
        };
      })(),
      { label: "Rerolls", value: String(totalRolls), note: "whole game" },
      { label: "Gold at death", value: String(last.goldEnd), note: `unspent at ${last.stage}` },
    ],
  };
}

// Color for a finding's cost, the same on every page: HP and gold lost are red,
// counts (upgrades, components, fights behind) are amber, strengths are green.
export function costTone(f: Finding): string {
  if (f.positive) return "var(--good)";
  return f.hpCost !== undefined || f.goldCost !== undefined ? "var(--hp)" : "var(--gold)";
}

export function ordinal(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
