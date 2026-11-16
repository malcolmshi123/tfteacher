import type { Cost, UnitDef } from "./types";

// Units from TFT Set 18, from Riot's public game data (via CommunityDragon).
// The product is set-agnostic: each set's units load in this same shape.

export const SET_NAME = "Set 18";

export const UNITS: UnitDef[] = [
  { id: "akali", name: "Akali", cost: 1, traits: ["Inferno", "Adaptor", "Ravager"] },
  { id: "camille", name: "Camille", cost: 1, traits: ["Coven", "Ravager"] },
  { id: "cinderling", name: "Cinderling", cost: 1, traits: ["Riftbeast", "Hunter"] },
  { id: "karma", name: "Karma", cost: 1, traits: ["Blossom", "Spellweaver"] },
  { id: "kobuko", name: "Kobuko", cost: 1, traits: ["Sprykin", "Brawler"] },
  { id: "leona", name: "Leona", cost: 1, traits: ["Solar", "Defender"] },
  { id: "ornn", name: "Ornn", cost: 1, traits: ["Elderwood", "Defender"] },
  { id: "pebbles", name: "Pebbles", cost: 1, traits: ["Riftbeast", "Invoker"] },
  { id: "rakan", name: "Rakan", cost: 1, traits: ["Fae", "Juggernaut", "Vanguard"] },
  { id: "reksai", name: "Rek'Sai", cost: 1, traits: ["Blackthorn", "Brawler"] },
  { id: "varus", name: "Varus", cost: 1, traits: ["Inferno", "Rapidfire"] },
  { id: "veigar", name: "Veigar", cost: 1, traits: ["Blackthorn", "Sprykin", "Spellweaver"] },
  { id: "xayah", name: "Xayah", cost: 1, traits: ["Elderwood", "Fae", "Rapidfire"] },
  { id: "yorick", name: "Yorick", cost: 1, traits: ["Blossom", "Juggernaut", "Summoner"] },
  { id: "alistar", name: "Alistar", cost: 2, traits: ["Elderwood", "Brawler"] },
  { id: "caitlyn", name: "Caitlyn", cost: 2, traits: ["Coven", "Hunter"] },
  { id: "elise", name: "Elise", cost: 2, traits: ["Coven", "Vanguard"] },
  { id: "gromp", name: "Gromp", cost: 2, traits: ["Riftbeast", "Adaptor"] },
  { id: "kayle", name: "Kayle", cost: 2, traits: ["Solar", "Rapidfire"] },
  { id: "leblanc", name: "LeBlanc", cost: 2, traits: ["Elderwood", "Spellweaver"] },
  { id: "murkwolf", name: "Murkwolf", cost: 2, traits: ["Riftbeast", "Ravager"] },
  { id: "scuttlecrab", name: "Scuttlecrab", cost: 2, traits: ["Riftbeast", "Juggernaut"] },
  { id: "sejuani", name: "Sejuani", cost: 2, traits: ["Solar", "Juggernaut"] },
  { id: "shen", name: "Shen", cost: 2, traits: ["Inferno", "Defender"] },
  { id: "teemo", name: "Teemo", cost: 2, traits: ["Sprykin", "Invoker"] },
  { id: "warwick", name: "Warwick", cost: 2, traits: ["Blackthorn", "Ravager"] },
  { id: "yunara", name: "Yunara", cost: 2, traits: ["Blossom", "Executioner"] },
  { id: "azir", name: "Azir", cost: 3, traits: ["Blackthorn", "Executioner", "Summoner"] },
  { id: "cassiopeia", name: "Cassiopeia", cost: 3, traits: ["Coven", "Spellweaver"] },
  { id: "diana", name: "Diana", cost: 3, traits: ["Lunar", "Ravager", "Vanguard"] },
  { id: "fiddlesticks", name: "Fiddlesticks", cost: 3, traits: ["Flora Fatalis", "Defender", "Spellweaver"] },
  { id: "hecarim", name: "Hecarim", cost: 3, traits: ["Elderwood", "Vanguard"] },
  { id: "khazix", name: "Kha'Zix", cost: 3, traits: ["Rival"] },
  { id: "kogmaw", name: "Kog'Maw", cost: 3, traits: ["Caustic", "Adaptor", "Invoker"] },
  { id: "krug", name: "Krug", cost: 3, traits: ["Riftbeast", "Brawler"] },
  { id: "mamabeak", name: "Mama Beak", cost: 3, traits: ["Riftbeast", "Summoner", "Rapidfire"] },
  { id: "masteryi", name: "Master Yi", cost: 3, traits: ["Blossom", "Adaptor"] },
  { id: "rammus", name: "Rammus", cost: 3, traits: ["Sprykin", "Defender"] },
  { id: "rengar", name: "Rengar", cost: 3, traits: ["Rival"] },
  { id: "tristana", name: "Tristana", cost: 3, traits: ["Fae", "Sprykin", "Hunter"] },
  { id: "vi", name: "Vi", cost: 3, traits: ["Primal", "Juggernaut"] },
  { id: "ahri", name: "Ahri", cost: 4, traits: ["Blossom", "Spellweaver"] },
  { id: "amumu", name: "Amumu", cost: 4, traits: ["Inferno", "Juggernaut"] },
  { id: "aphelios", name: "Aphelios", cost: 4, traits: ["Lunar", "Rapidfire"] },
  { id: "brambleback", name: "Brambleback", cost: 4, traits: ["Riftbeast", "Ravager"] },
  { id: "ezreal", name: "Ezreal", cost: 4, traits: ["Elderwood", "Executioner"] },
  { id: "lillia", name: "Lillia", cost: 4, traits: ["Fae", "Defender"] },
  { id: "malphite", name: "Malphite", cost: 4, traits: ["Blackthorn", "Monolith"] },
  { id: "morgana", name: "Morgana", cost: 4, traits: ["Coven", "Invoker"] },
  { id: "nidalee", name: "Nidalee", cost: 4, traits: ["Primal", "Adaptor"] },
  { id: "sentinel", name: "Sentinel", cost: 4, traits: ["Riftbeast", "Vanguard", "Invoker"] },
  { id: "sett", name: "Sett", cost: 4, traits: ["Blossom", "Brawler"] },
  { id: "sivir", name: "Sivir", cost: 4, traits: ["Primal", "Hunter"] },
  { id: "soraka", name: "Soraka", cost: 4, traits: ["Flora Fatalis", "Executioner"] },
  { id: "zyra", name: "Zyra", cost: 4, traits: ["Thornmaiden", "Summoner"] },
  { id: "alune", name: "Alune", cost: 5, traits: ["Attuned", "Lunar", "Spellweaver"] },
  { id: "ashe", name: "Ashe", cost: 5, traits: ["Blossom", "Hunter"] },
  { id: "draven", name: "Draven", cost: 5, traits: ["Bounty Seeker"] },
  { id: "elderdragon", name: "Elder Dragon", cost: 5, traits: ["Apex Predator", "Riftbeast"] },
  { id: "gnar", name: "Gnar", cost: 5, traits: ["Elderwood", "Sprykin", "Brawler"] },
  { id: "ivern", name: "Ivern", cost: 5, traits: ["Greenfather"] },
  { id: "kennen", name: "Kennen", cost: 5, traits: ["Inferno", "Executioner"] },
  { id: "lux", name: "Lux", cost: 5, traits: ["Avatar"] },
  { id: "maokai", name: "Maokai", cost: 5, traits: ["Old Growth", "Juggernaut"] },
  { id: "taric", name: "Taric", cost: 5, traits: ["Emerald Aspect", "Vanguard"] },
];

// Short mark drawn on each unit tile: the first letter, or two letters when
// another unit shares that first letter.
export const UNIT_MARK: Record<string, string> = Object.fromEntries(
  UNITS.map((u) => [u.id, UNITS.some((o) => o.id !== u.id && o.name[0] === u.name[0]) ? u.name.slice(0, 2) : u.name[0]]),
);

// Names players use for trait pairs, per set. A comp with both traits is
// called by the label instead of its top trait.
export const COMP_LABELS: { traits: string[]; label: string }[] = [{ traits: ["Lunar", "Elderwood"], label: "Lunarwood" }];

export const UNIT_BY_ID: Record<string, UnitDef> = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
);

// Real item names. Components sit on the bench or a unit; two components on one
// unit combine into a completed item, as in the game.
export const ITEMS: Record<string, string> = {
  edge: "B.F. Sword",
  bow: "Recurve Bow",
  rod: "Needlessly Large Rod",
  tear: "Tear of the Goddess",
  vest: "Chain Vest",
  cloak: "Negatron Cloak",
  belt: "Giant's Belt",
  glove: "Sparring Gloves",
  hoj: "Hand of Justice",
  rabadon: "Rabadon's Deathcap",
  warmog: "Warmog's Armor",
  gargoyle: "Gargoyle Stoneplate",
  spirit: "Spirit Visage",
};

export const RECIPES: Record<string, [string, string]> = {
  hoj: ["tear", "glove"],
  rabadon: ["rod", "rod"],
  warmog: ["belt", "belt"],
  gargoyle: ["vest", "cloak"],
  spirit: ["tear", "belt"],
};

// Combine component pairs on one unit into their completed items.
export function combineItems(items: string[]): string[] {
  const left = [...items];
  const out: string[] = [];
  for (const [done, [a, b]] of Object.entries(RECIPES)) {
    const i = left.indexOf(a);
    const j = left.indexOf(b);
    if (i >= 0 && j >= 0 && i !== j) {
      out.push(done);
      left.splice(Math.max(i, j), 1);
      left.splice(Math.min(i, j), 1);
    }
  }
  return [...out, ...left];
}

// Shop odds by level, per cost (percent). Same idea every set; the numbers come
// from the live set's config.
export const SHOP_ODDS: Record<number, [number, number, number, number, number]> = {
  1: [100, 0, 0, 0, 0],
  2: [100, 0, 0, 0, 0],
  3: [75, 25, 0, 0, 0],
  4: [55, 30, 15, 0, 0],
  5: [45, 33, 20, 2, 0],
  6: [30, 40, 25, 5, 0],
  7: [19, 30, 40, 10, 1],
  8: [17, 24, 32, 24, 3],
  9: [15, 18, 25, 30, 12],
};

export const XP_TO_NEXT: Record<number, number> = {
  1: 2, 2: 2, 3: 6, 4: 10, 5: 20, 6: 36, 7: 48, 8: 76, 9: 0,
};

export const COST_LABEL: Record<Cost, string> = {
  1: "1-cost", 2: "2-cost", 3: "3-cost", 4: "4-cost", 5: "5-cost",
};

// What a unit sells for: its copies at cost, minus 1 for a 2 or 3-star of
// cost 2 or more (a 2-star 2-cost sells for 5, not 6).
export function sellValue(cost: number, star: number) {
  return copiesOf(star) * cost - (star >= 2 && cost >= 2 ? 1 : 0);
}

export function copiesOf(star: number) {
  return star === 1 ? 1 : star === 2 ? 3 : 9;
}
