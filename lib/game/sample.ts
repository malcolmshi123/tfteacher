import { SHOP_ODDS, UNITS, UNIT_BY_ID, XP_TO_NEXT, combineItems, copiesOf } from "./set";
import type {
  GameRecord,
  Opponent,
  Outcome,
  Piece,
  RoundKind,
  RoundSnapshot,
  Star,
} from "./types";

// Builds a realistic sample game in the recorder's shape. Gold, XP and shops are
// simulated with the real economy rules so the review engine reads consistent
// numbers. The player's choices are scripted to tell one believable story:
// a long loss streak into a late, thin rolldown, out first in 8th.

function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type BoardSpec = string; // "khazix:2:hoj,hoj,rabadon ornn:2 ..."

function parse(spec: string): Piece[] {
  if (!spec.trim()) return [];
  return spec
    .trim()
    .split(/\s+/)
    .map((tok) => {
      const [unit, star, items] = tok.split(":");
      if (!UNIT_BY_ID[unit]) throw new Error(`unknown unit ${unit}`);
      return { unit, star: Number(star) as Star, items: items ? combineItems(items.split(",")) : [] };
    });
}

interface Step {
  stage: string;
  kind: RoundKind;
  outcome: Outcome;
  dmg: number;
  rerolls?: number;
  xp?: number;
  board?: BoardSpec;
  bench?: BoardSpec;
  itemBench?: string;
  forceShop?: Record<number, string[]>; // shop index -> units placed in it
  shops?: string[][]; // hand-set shops for a showcase round (rng is still drawn so later rounds don't shift)
  goldDrop?: number;
}

const SCRIPT: Step[] = [
  { stage: "1-1", kind: "carousel", outcome: "none", dmg: 0, board: "xayah:1:belt" },
  { stage: "1-2", kind: "pve", outcome: "win", dmg: 0, board: "xayah:1:belt ornn:1", goldDrop: 1 },
  { stage: "1-3", kind: "pve", outcome: "win", dmg: 0, board: "xayah:1:belt ornn:1 rakan:1", itemBench: "tear", goldDrop: 1 },
  { stage: "1-4", kind: "pve", outcome: "win", dmg: 0, board: "xayah:1:belt ornn:1 rakan:1", bench: "ornn:1", itemBench: "tear,glove", goldDrop: 2 },
  { stage: "2-1", kind: "pvp", outcome: "win", dmg: 0, xp: 1, board: "ornn:2 xayah:1:belt rakan:1:hoj alistar:1" },
  { stage: "2-2", kind: "pvp", outcome: "win", dmg: 0, board: "ornn:2 xayah:1:belt rakan:1:hoj alistar:1", bench: "leblanc:1" },
  { stage: "2-3", kind: "pvp", outcome: "loss", dmg: 5, board: "ornn:2 xayah:1:belt rakan:1:hoj alistar:1", bench: "leblanc:1" },
  { stage: "2-4", kind: "carousel", outcome: "none", dmg: 0, board: "ornn:2 xayah:1:belt rakan:1:hoj alistar:1", bench: "leblanc:1", itemBench: "rod" },
  { stage: "2-5", kind: "pvp", outcome: "loss", dmg: 6, xp: 2, board: "ornn:2 xayah:1:belt alistar:1 khazix:1:hoj leblanc:1", itemBench: "rod" },
  { stage: "2-6", kind: "pvp", outcome: "loss", dmg: 5, board: "ornn:2 xayah:1:belt alistar:1 khazix:1:hoj leblanc:1", itemBench: "rod" },
  { stage: "2-7", kind: "pve", outcome: "win", dmg: 0, board: "ornn:2 xayah:1:belt alistar:1 khazix:1:hoj leblanc:1", itemBench: "rod,glove", goldDrop: 3 },
  { stage: "3-1", kind: "pvp", outcome: "loss", dmg: 7, xp: 3, board: "ornn:2 alistar:1 khazix:1:hoj leblanc:1 hecarim:1:belt diana:1", itemBench: "rod,glove" },
  { stage: "3-2", kind: "pvp", outcome: "loss", dmg: 8, xp: 4, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:1 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove", forceShop: { 0: ["khazix"] } },
  { stage: "3-3", kind: "pvp", outcome: "loss", dmg: 9, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:1 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove", forceShop: { 0: ["khazix"] } },
  { stage: "3-4", kind: "carousel", outcome: "none", dmg: 0, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:1 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove,rod" },
  { stage: "3-5", kind: "pvp", outcome: "loss", dmg: 9, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:2 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove,rod" },
  { stage: "3-6", kind: "pvp", outcome: "loss", dmg: 10, xp: 3, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:2 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove,rod" },
  { stage: "3-7", kind: "pve", outcome: "win", dmg: 0, board: "ornn:2 alistar:2 khazix:1:hoj leblanc:2 hecarim:1:belt diana:1", bench: "khazix:1", itemBench: "rod,glove,rod,tear,belt", goldDrop: 4 },
  // the level 7 rolldown: hand-set shops with level 7 odds (5 one-costs, 8 two-costs, 10 three-costs, 2 four-costs)
  {
    stage: "4-1", kind: "pvp", outcome: "loss", dmg: 12, xp: 4, rerolls: 4,
    board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1",
    shops: [
      ["veigar", "kayle", "hecarim", "rammus", "elise"],
      ["camille", "khazix", "sejuani", "tristana", "warwick"],
      ["diana", "teemo", "vi", "alistar", "akali"],
      ["yorick", "cassiopeia", "fiddlesticks", "caitlyn", "soraka"],
      ["hecarim", "diana", "ezreal", "kobuko", "shen"],
    ],
  },
  { stage: "4-2", kind: "pvp", outcome: "win", dmg: 0, rerolls: 3, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1" },
  { stage: "4-3", kind: "pvp", outcome: "loss", dmg: 11, rerolls: 2, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1" },
  { stage: "4-4", kind: "carousel", outcome: "none", dmg: 0, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1", itemBench: "cloak" },
  { stage: "4-5", kind: "pvp", outcome: "loss", dmg: 13, rerolls: 3, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1 khazix:1", itemBench: "cloak" },
  { stage: "4-6", kind: "pvp", outcome: "win", dmg: 0, rerolls: 2, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1 khazix:1", itemBench: "cloak" },
  { stage: "4-7", kind: "pve", outcome: "win", dmg: 0, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1 khazix:1", itemBench: "cloak", goldDrop: 3 },
  { stage: "5-1", kind: "pvp", outcome: "loss", dmg: 15, rerolls: 4, board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog,gargoyle,spirit diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 hecarim:1 khazix:1" },
];

const OPPONENTS: { id: string; name: string; place: number; strength: number }[] = [
  { id: "o1", name: "Kaito", place: 1, strength: 1.18 },
  { id: "o2", name: "Lumen", place: 2, strength: 1.12 },
  { id: "o3", name: "Rho", place: 3, strength: 1.06 },
  { id: "o4", name: "Bramblefox", place: 4, strength: 1.02 },
  { id: "o5", name: "Sev", place: 5, strength: 0.98 },
  { id: "o7", name: "Quietcarry", place: 6, strength: 0.9 },
  { id: "o8", name: "Pim", place: 7, strength: 0.84 },
];

function stageIndex(stage: string) {
  const [s, r] = stage.split("-").map(Number);
  return s * 10 + r;
}

function opponentAt(o: (typeof OPPONENTS)[number], stage: string, i: number, r: () => number): Opponent {
  const t = stageIndex(stage);
  // HP drops faster for weaker players; eliminations are scripted by placement.
  // the player is the first one out (8th), so nobody else is eliminated before 5-1
  const elimAt = 99;
  const lossRate = (1.3 - o.strength) * 4.6;
  const progressed = Math.max(0, t - 20);
  let hp = Math.round(100 - lossRate * progressed * (t > 30 ? 1.25 : 1) - r() * 3);
  if (o.place <= 2) hp = Math.max(hp, 52 - (o.place - 1) * 10);
  if (t >= elimAt) hp = 0;
  hp = Math.max(0, Math.min(100, hp));
  const level = Math.min(9, t < 20 ? 3 : t < 30 ? 4 + (t >= 25 ? 1 : 0) : t < 40 ? 6 + (o.strength > 1.05 && t >= 35 ? 1 : 0) : t < 50 ? 7 + (o.strength > 0.95 ? 1 : 0) : 8 + (o.strength > 1.1 ? 1 : 0));
  const base = t < 20 ? 3 : t < 30 ? 8 + (t - 20) * 1.3 : t < 40 ? 17 + (t - 30) * 1.6 : t < 50 ? 30 + (t - 40) * 2.4 : 46;
  const boardValue = hp === 0 ? 0 : Math.round(base * o.strength + r() * 3);
  return {
    id: o.id,
    name: o.name,
    hp,
    level,
    boardValue,
    eliminatedAt: undefined,
  };
  void i;
}

function rollShop(level: number, r: () => number): string[] {
  const odds = SHOP_ODDS[level];
  const shop: string[] = [];
  for (let k = 0; k < 5; k++) {
    let x = r() * 100;
    let cost = 1;
    for (let c = 0; c < 5; c++) {
      if (x < odds[c]) {
        cost = c + 1;
        break;
      }
      x -= odds[c];
    }
    const pool = UNITS.filter((u) => u.cost === cost);
    shop.push(pool[Math.floor(r() * pool.length)].id);
  }
  return shop;
}

function copies(pieces: Piece[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const p of pieces) out[p.unit] = (out[p.unit] ?? 0) + copiesOf(p.star);
  return out;
}

export function buildSampleGame(): GameRecord {
  const r = rng(1729);
  const rounds: RoundSnapshot[] = [];
  let gold = 0;
  let hp = 100;
  let level = 1;
  let xp = 0;
  let streak = 0; // positive win streak, negative loss streak
  let prevCopies: Record<string, number> = {};

  for (let i = 0; i < SCRIPT.length; i++) {
    const s = SCRIPT[i];
    const t = stageIndex(s.stage);

    // income at the start of the round
    if (i > 0) {
      if (t < 20) gold += t === 12 ? 2 : t === 13 ? 2 : 3;
      else {
        const interest = Math.min(5, Math.floor(gold / 10));
        const st = Math.abs(streak);
        const streakGold = st >= 6 ? 3 : st >= 5 ? 2 : st >= 2 ? 1 : 0;
        gold += 5 + interest + (s.kind === "pvp" ? streakGold : 0);
      }
      gold += s.goldDrop ?? 0;
      if (t >= 12) {
        xp += 2;
      }
    }
    while (level < 9 && xp >= XP_TO_NEXT[level]) {
      xp -= XP_TO_NEXT[level];
      level++;
    }
    if (level === 1 && t >= 12) level = 2;

    const startGold = gold;
    const startHp = hp;
    const startLevel = level;
    const startXp = xp;

    // planning phase
    const rerolls = s.rerolls ?? 0;
    const xpBought = s.xp ?? 0;
    // XP first so the rolldown happens at the new level
    xp += xpBought * 4;
    gold -= xpBought * 4;
    while (level < 9 && xp >= XP_TO_NEXT[level]) {
      xp -= XP_TO_NEXT[level];
      level++;
    }

    const shops: string[][] = [];
    for (let k = 0; k <= rerolls; k++) {
      const shop = rollShop(level, r);
      const forced = s.forceShop?.[k];
      if (forced) forced.forEach((u, j) => (shop[j] = u));
      shops.push(s.shops?.[k] ? [...s.shops[k]] : shop);
    }
    gold -= rerolls * 2;

    const board = parse(s.board ?? "");
    const bench = parse(s.bench ?? "");
    const now = copies([...board, ...bench]);
    const bought: string[] = [];
    const sold: string[] = [];
    for (const [u, n] of Object.entries(now)) {
      const d = n - (prevCopies[u] ?? 0);
      for (let k = 0; k < d; k++) bought.push(u);
    }
    for (const [u, n] of Object.entries(prevCopies)) {
      const d = n - (now[u] ?? 0);
      for (let k = 0; k < d; k++) sold.push(u);
    }
    // carousel picks are free
    if (s.kind !== "carousel" && t > 11) {
      gold -= bought.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0);
      gold += sold.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0);
    }
    if (gold < 0) throw new Error(`sample game went negative gold at ${s.stage}: ${gold}`);
    // every unit bought must have been in a shop that round
    if (s.kind !== "carousel") {
      const locked = new Set<string>();
      Object.entries(s.forceShop ?? {}).forEach(([si, us]) => us.forEach((_, j) => locked.add(`${si}:${j}`)));
      const seen: Record<string, number> = {};
      for (const shop of shops) for (const u of shop) seen[u] = (seen[u] ?? 0) + 1;
      const need: Record<string, number> = {};
      for (const u of bought) need[u] = (need[u] ?? 0) + 1;
      for (const [u, n] of Object.entries(need)) {
        for (let k = seen[u] ?? 0; k < n; k++) {
          const free: [number, number][] = [];
          shops.forEach((shop, si) => shop.forEach((x, j) => !locked.has(`${si}:${j}`) && !need[x] && free.push([si, j])));
          if (!free.length) throw new Error(`no shop slot for ${u} at ${s.stage}`);
          const [si, j] = free[Math.floor(r() * free.length)];
          shops[si][j] = u;
          locked.add(`${si}:${j}`);
        }
      }
    }
    prevCopies = now;

    hp -= s.dmg;
    // only player fights count toward a streak; monster rounds don't break it
    if (s.kind === "pvp" && s.outcome === "win") streak = streak > 0 ? streak + 1 : 1;
    if (s.kind === "pvp" && s.outcome === "loss") streak = streak < 0 ? streak - 1 : -1;

    // HP never goes up: each opponent's HP is capped at its previous value
    const roster = OPPONENTS.map((o, j) => {
      const op = opponentAt(o, s.stage, j, r);
      const prev = rounds[rounds.length - 1]?.roster[j];
      return prev ? { ...op, hp: Math.min(op.hp, prev.hp) } : op;
    });
    const alive = roster.filter((o) => o.hp > 0);

    rounds.push({
      stage: s.stage,
      kind: s.kind,
      hp: startHp,
      gold: startGold,
      level: startLevel,
      xp: startXp,
      xpToNext: XP_TO_NEXT[startLevel],
      shops,
      rerolls,
      xpBought,
      bought: s.kind === "carousel" ? [] : bought,
      sold,
      board,
      bench,
      itemBench: s.itemBench ? s.itemBench.split(",") : [],
      goldEnd: gold,
      opponent: s.kind === "pvp" ? alive[Math.floor(r() * alive.length)]?.name : undefined,
      outcome: s.outcome,
      damageTaken: s.dmg,
      roster,
    });
    void startLevel;
  }

  return {
    id: "sample",
    player: "you",
    placement: 8,
    patch: "Patch 18.3",
    setName: "Set 18",
    queue: "Ranked",
    playedAt: "2026-11-15T22:41:00-05:00",
    durationMin: 31,
    source: "recorder",
    rounds,
  };
}
