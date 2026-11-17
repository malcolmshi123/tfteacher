import { buildSampleGame, simulate, type GameMeta, type Step } from "./sample";
import type { GameRecord } from "./types";

// The sample player's games on patch 18.5. The 8th-place Lunarwood game is the
// hand-written sample; the rest are built from short plans below and run
// through the same economy simulator, so every review reads real numbers.

interface Phase {
  board: string;
  bench?: string;
  items?: string; // components on the bench
}

interface Plan {
  meta: Omit<GameMeta, "lobby">;
  comp: string; // MY_COMPS id
  end: string; // the round you went out in (or the last round for 1st)
  results: string; // W or L for each player fight in order; spaces are ignored
  lastHp: number; // HP entering the last round; that fight takes all of it
  phases: Record<string, Phase>; // a board holds from its round until the next phase
  levels: Record<string, number>; // buy XP up to this level at that round
  rolls: Record<string, number>; // reroll down to this much gold at that round
}

const DROPS: Record<string, number> = { "1-2": 1, "1-3": 1, "1-4": 2, "2-7": 3, "3-7": 4, "4-7": 3, "5-7": 3, "6-7": 3 };

function rounds(end: string): { stage: string; kind: Step["kind"] }[] {
  const out: { stage: string; kind: Step["kind"] }[] = [
    { stage: "1-1", kind: "carousel" },
    { stage: "1-2", kind: "pve" },
    { stage: "1-3", kind: "pve" },
    { stage: "1-4", kind: "pve" },
  ];
  for (let s = 2; s <= 7; s++)
    for (let k = 1; k <= 7; k++) {
      const stage = `${s}-${k}`;
      out.push({ stage, kind: k === 4 ? "carousel" : k === 7 ? "pve" : "pvp" });
      if (stage === end) return out;
    }
  return out;
}

// small deterministic noise so each game's damage looks different
function noise(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1103515245 + 12345) & 0x7fffffff;
    return x / 0x7fffffff;
  };
}

function build(plan: Plan): GameRecord {
  const rs = rounds(plan.end);
  const results = plan.results.replace(/\s/g, "");
  const pvp = rs.filter((r) => r.kind === "pvp");
  if (pvp.length !== results.length) throw new Error(`${plan.meta.id}: ${pvp.length} fights but ${results.length} results`);
  const dies = plan.meta.placement > 1;
  if (dies && results[results.length - 1] !== "L") throw new Error(`${plan.meta.id}: the last fight must be a loss`);

  // damage: losses scale with the stage; all of them together bring you to lastHp
  const rnd = noise(plan.meta.seed);
  const losses = pvp.map((r, i) => ({ r, i })).filter(({ i }) => results[i] === "L" && !(dies && i === results.length - 1));
  const raw = losses.map(({ r }) => [0, 0, 4, 7, 10, 13, 15, 17][Number(r.stage[0])] + rnd() * 3);
  const target = 100 - plan.lastHp;
  const total = raw.reduce((a, b) => a + b, 0);
  const dmg = raw.map((v) => Math.max(2, Math.round((v / total) * target)));
  const fix = target - dmg.reduce((a, b) => a + b, 0);
  dmg[dmg.indexOf(Math.max(...dmg))] += fix;
  const dmgAt = new Map(losses.map(({ r }, k) => [r.stage, dmg[k]]));
  // the killing blow still follows the formula: stage damage plus at least 2 units
  if (dies) {
    const s = pvp[pvp.length - 1].stage;
    dmgAt.set(s, Math.max(plan.lastHp, [0, 0, 2, 5, 7, 9, 11, 17][Number(s[0])] + 2));
  }

  let phase: Phase = { board: "" };
  let fight = 0;
  const script: Step[] = rs.map(({ stage, kind }) => {
    phase = plan.phases[stage] ?? phase;
    const outcome = kind === "pvp" ? (results[fight++] === "W" ? "win" : "loss") : kind === "pve" ? "win" : "none";
    return {
      stage,
      kind,
      outcome,
      dmg: dmgAt.get(stage) ?? 0,
      board: phase.board,
      bench: phase.bench,
      itemBench: phase.items,
      goldDrop: DROPS[stage],
      levelTo: plan.levels[stage],
      // nobody banks past the interest cap: unless the plan says otherwise, gold
      // over 54 goes into rolls
      rollTo: plan.rolls[stage] ?? (kind === "pvp" && stage >= "2-1" ? 54 : undefined),
    } as Step;
  });
  return simulate(script, plan.meta);
}

const PLANS: Plan[] = [
  {
    meta: { id: "oct-31", seed: 3101, placement: 3, patch: "Patch 18.5", playedAt: "2026-10-31T21:12:00-04:00", durationMin: 37 },
    comp: "c2",
    end: "6-2",
    results: "WWWLW WLWWL LWWLW WLLWL LL",
    lastHp: 12,
    phases: {
      "1-1": { board: "pebbles:1:tear" },
      "1-2": { board: "pebbles:1:tear karma:1" },
      "1-3": { board: "pebbles:1:tear karma:1 kobuko:1", items: "rod" },
      "1-4": { board: "pebbles:1:tear karma:1 kobuko:1", bench: "karma:1", items: "rod,glove" },
      "2-1": { board: "pebbles:1:tear karma:2:jeweled kobuko:1 teemo:1" },
      "2-4": { board: "pebbles:1:tear karma:2:jeweled kobuko:1 teemo:1", items: "belt" },
      "2-5": { board: "pebbles:1:tear karma:2:jeweled kobuko:1 teemo:1 krug:1:belt" },
      "2-7": { board: "pebbles:1:tear karma:2:jeweled kobuko:1 teemo:1 krug:1:belt", items: "vest" },
      "3-1": { board: "pebbles:2:tear karma:2:jeweled kobuko:1 teemo:1 krug:1:belt yunara:1", items: "vest" },
      "3-4": { board: "pebbles:2:tear karma:2:jeweled kobuko:1 teemo:1 krug:1:belt yunara:1", items: "vest,belt" },
      "3-5": { board: "pebbles:2:tear karma:2:jeweled kobuko:1 teemo:2 krug:1:warmog yunara:1", items: "vest" },
      "3-7": { board: "pebbles:2:tear karma:2:jeweled kobuko:1 teemo:2 krug:1:warmog yunara:1", items: "vest,vest" },
      "4-1": { board: "pebbles:2:tear karma:2:jeweled teemo:2 krug:2:warmog yunara:1 sett:1:bramble morgana:1" },
      "4-2": { board: "pebbles:2 karma:2:jeweled teemo:2 krug:2:warmog sentinel:1 sett:1:bramble ahri:1:shojin morgana:1" },
      "4-4": { board: "pebbles:2 karma:2:jeweled teemo:2 krug:2:warmog sentinel:1 sett:1:bramble ahri:1:shojin morgana:1", items: "rod,belt" },
      "4-5": { board: "pebbles:2 karma:2:jeweled teemo:2 krug:2:warmog sentinel:1 sett:1:bramble ahri:2:shojin,morello morgana:2" },
      "5-1": { board: "pebbles:2 karma:2 krug:2 sentinel:1 sett:2:warmog,bramble ahri:2:shojin,jeweled morgana:2:morello taric:1" },
      "5-4": { board: "pebbles:2 karma:2 krug:2 sentinel:1 sett:2:warmog,bramble ahri:2:shojin,jeweled morgana:2:morello taric:1", items: "cloak" },
      "6-1": { board: "pebbles:2 karma:2 krug:2 sentinel:1 sett:2:warmog,bramble,claw ahri:2:jeweled,flail,shojin morgana:2:voidstaff,morello taric:1" },
    },
    levels: { "2-1": 4, "2-5": 5, "3-1": 6, "4-1": 7, "4-2": 8 },
    rolls: { "4-2": 12, "4-5": 14, "5-1": 10, "5-5": 20, "6-1": 0, "6-2": 0 },
  },
  {
    meta: { id: "oct-28", seed: 2801, placement: 5, patch: "Patch 18.5", playedAt: "2026-10-28T20:03:00-04:00", durationMin: 34 },
    comp: "c1",
    end: "5-6",
    results: "WLLWL LLWLL WWLWL WLWLL",
    lastHp: 14,
    phases: {
      "1-1": { board: "ornn:1:belt" },
      "1-2": { board: "ornn:1:belt xayah:1" },
      "1-3": { board: "ornn:1:belt xayah:1 veigar:1", items: "tear" },
      "1-4": { board: "ornn:1:belt xayah:1 veigar:1", bench: "ornn:1", items: "tear,glove" },
      "2-1": { board: "ornn:2:belt xayah:1:hoj veigar:1 leblanc:1" },
      "2-4": { board: "ornn:2:belt xayah:1:hoj veigar:1 leblanc:1", items: "rod" },
      "2-5": { board: "ornn:2:belt xayah:1:hoj leblanc:1 alistar:1 khazix:1", items: "rod" },
      "3-1": { board: "ornn:2:belt leblanc:2 alistar:1 khazix:1:hoj hecarim:1 diana:1", bench: "khazix:1", items: "rod" },
      "3-4": { board: "ornn:2:belt leblanc:2 alistar:1 khazix:1:hoj hecarim:1 diana:1", bench: "khazix:1", items: "rod,rod" },
      "3-5": { board: "ornn:2:belt leblanc:2 alistar:1 khazix:2:hoj hecarim:1 diana:1", items: "rod,rod" },
      "3-7": { board: "ornn:2:belt leblanc:2 alistar:1 khazix:2:hoj hecarim:1 diana:1", items: "rod,rod,belt" },
      "4-1": { board: "ornn:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 khazix:1" },
      "4-4": { board: "ornn:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog diana:1 fiddlesticks:1 soraka:1", bench: "diana:1 khazix:1", items: "vest" },
      "4-5": { board: "ornn:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog diana:2 fiddlesticks:1 soraka:1", bench: "khazix:1 hecarim:1", items: "vest" },
      "4-7": { board: "ornn:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog diana:2 fiddlesticks:1 soraka:1", bench: "khazix:1 hecarim:1", items: "vest,cloak" },
      "5-1": { board: "ornn:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog,gargoyle diana:2 fiddlesticks:1 soraka:1", bench: "khazix:1 hecarim:1" },
      "5-3": { board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog,gargoyle,spirit diana:2:ionic fiddlesticks:1 soraka:1 ezreal:1", bench: "khazix:1 hecarim:1" },
    },
    levels: { "2-1": 4, "2-5": 5, "3-1": 6, "4-1": 7, "5-3": 8 },
    rolls: { "4-1": 12, "4-5": 18, "5-1": 34, "5-3": 2, "5-5": 0, "5-6": 0 },
  },
  {
    meta: { id: "oct-25", seed: 2501, placement: 2, patch: "Patch 18.5", playedAt: "2026-10-25T16:40:00-04:00", durationMin: 41 },
    comp: "c3",
    end: "6-6",
    results: "WWWWL WWLWW WLWWW LWWLW WLWLL",
    lastHp: 9,
    phases: {
      "1-1": { board: "cinderling:1:bow" },
      "1-2": { board: "cinderling:1:bow pebbles:1" },
      "1-3": { board: "cinderling:1:bow pebbles:1 leona:1", items: "rod" },
      "1-4": { board: "cinderling:1:bow pebbles:1 leona:1", bench: "pebbles:1", items: "rod,edge" },
      "2-1": { board: "cinderling:1:guinsoo pebbles:2 leona:1 murkwolf:1", items: "edge" },
      "2-4": { board: "cinderling:1:guinsoo pebbles:2 leona:1 murkwolf:1", items: "edge,vest" },
      "2-5": { board: "cinderling:1:guinsoo pebbles:2 leona:1 murkwolf:1 gromp:1", items: "edge,vest" },
      "3-1": { board: "cinderling:1 pebbles:2 murkwolf:2:guinsoo gromp:1 krug:1 scuttlecrab:1", items: "edge,vest,belt" },
      "3-4": { board: "cinderling:1 pebbles:2 murkwolf:2:guinsoo gromp:1 krug:1:belt scuttlecrab:1", items: "edge,vest,belt" },
      "3-5": { board: "pebbles:2 murkwolf:2:guinsoo gromp:1 krug:2:warmog scuttlecrab:1 mamabeak:1 sentinel:1", items: "edge,vest" },
      "4-1": { board: "pebbles:2 murkwolf:2 krug:2:warmog sentinel:1 brambleback:1:guinsoo,eon mamabeak:1 scuttlecrab:1 gromp:1", items: "tear" },
      "4-4": { board: "pebbles:2 murkwolf:2 krug:2:warmog sentinel:1 brambleback:1:guinsoo,eon mamabeak:1 scuttlecrab:1 gromp:1", items: "tear,belt" },
      "4-5": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit sentinel:1 brambleback:2:guinsoo,eon mamabeak:1 scuttlecrab:1 gromp:1" },
      "4-7": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit sentinel:1 brambleback:2:guinsoo,eon mamabeak:1 scuttlecrab:1 gromp:1", items: "glove,cloak" },
      "5-1": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit sentinel:1 brambleback:2:guinsoo,eon,quicksilver gnar:1 mamabeak:1 scuttlecrab:1 gromp:1" },
      "5-4": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit sentinel:1 brambleback:2:guinsoo,eon,quicksilver gnar:1 mamabeak:1 scuttlecrab:1 gromp:1", items: "edge,glove" },
      "5-5": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit sentinel:2 brambleback:2:guinsoo,eon,quicksilver gnar:1 taric:1 elderdragon:1:ie mamabeak:1" },
      "6-1": { board: "pebbles:2 murkwolf:2 krug:2:warmog,spirit,gargoyle sentinel:2 brambleback:2:guinsoo,eon,quicksilver gnar:1 taric:1 elderdragon:1:ie,lw mamabeak:1" },
    },
    levels: { "2-1": 4, "2-5": 5, "3-1": 6, "3-5": 7, "4-1": 8, "5-1": 9 },
    rolls: { "4-1": 30, "4-5": 40, "5-1": 10, "5-5": 10, "6-1": 10, "6-5": 0, "6-6": 0 },
  },
  {
    meta: { id: "oct-23", seed: 2301, placement: 6, patch: "Patch 18.5", playedAt: "2026-10-23T19:26:00-04:00", durationMin: 33 },
    comp: "c1",
    end: "5-5",
    results: "LLWLL WLLLW LWLLW LWLL",
    lastHp: 11,
    phases: {
      "1-1": { board: "xayah:1:tear" },
      "1-2": { board: "xayah:1:tear ornn:1" },
      "1-3": { board: "xayah:1:tear ornn:1 rakan:1", items: "glove" },
      "1-4": { board: "xayah:1:tear ornn:1 rakan:1", bench: "ornn:1", items: "glove,belt" },
      "2-1": { board: "ornn:2:belt xayah:1:hoj rakan:1 alistar:1" },
      "2-4": { board: "ornn:2:belt xayah:1:hoj rakan:1 alistar:1", items: "rod" },
      "2-5": { board: "ornn:2:belt xayah:1:hoj alistar:1 leblanc:1 khazix:1", items: "rod" },
      "2-7": { board: "ornn:2:belt xayah:1:hoj alistar:1 leblanc:1 khazix:1", items: "rod,vest" },
      "3-1": { board: "ornn:2:belt alistar:1 leblanc:1 khazix:1:hoj hecarim:1 diana:1", items: "rod,vest" },
      "3-4": { board: "ornn:2:belt alistar:1 leblanc:1 khazix:1:hoj hecarim:1 diana:1", items: "rod,vest,rod" },
      "3-5": { board: "ornn:2:belt alistar:2 leblanc:1 khazix:1:hoj,rabadon hecarim:1 diana:1", bench: "khazix:1", items: "vest" },
      "3-7": { board: "ornn:2:belt alistar:2 leblanc:1 khazix:1:hoj,rabadon hecarim:1 diana:1", bench: "khazix:1", items: "vest,belt" },
      "4-1": { board: "ornn:2 alistar:2 leblanc:2 khazix:1:hoj,rabadon hecarim:1:warmog diana:1 fiddlesticks:1", bench: "khazix:1 hecarim:1", items: "vest" },
      "4-4": { board: "ornn:2 alistar:2 leblanc:2 khazix:1:hoj,rabadon hecarim:1:warmog diana:1 fiddlesticks:1", bench: "khazix:1 hecarim:1", items: "vest,cloak" },
      "4-5": { board: "ornn:2 alistar:2 leblanc:2 khazix:2:hoj,rabadon hecarim:2:warmog,gargoyle diana:1 fiddlesticks:1", bench: "diana:1" },
      "5-1": { board: "ornn:2 leblanc:2 khazix:2:hoj,hoj,rabadon hecarim:2:warmog,gargoyle,spirit diana:1:ionic fiddlesticks:1 soraka:1", bench: "diana:1" },
    },
    levels: { "2-1": 4, "2-5": 5, "3-1": 6, "4-1": 7 },
    rolls: { "4-1": 40, "4-5": 30, "5-1": 30, "5-3": 26, "5-5": 20 },
  },
];

export interface ListedGame {
  game: GameRecord;
  comp: string; // MY_COMPS id
}

let cache: ListedGame[] | null = null;

// Every game in the sample account, newest first.
export function allGames(): ListedGame[] {
  if (cache) return cache;
  const games: ListedGame[] = [{ game: buildSampleGame(), comp: "c1" }, ...PLANS.map((p) => ({ game: build(p), comp: p.comp }))];
  cache = games.sort((a, b) => b.game.playedAt.localeCompare(a.game.playedAt));
  return cache;
}

export function gameById(id: string): ListedGame | undefined {
  return allGames().find((g) => g.game.id === id);
}
