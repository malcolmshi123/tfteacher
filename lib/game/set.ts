import type { Cost, UnitDef } from "./types";

// Units from TFT Set 18, from Riot's public game data (via CommunityDragon).
// The product is set-agnostic: each set's units load in this same shape.

export const SET_NAME = "Set 18";

export const UNITS: UnitDef[] = [
  { id: "leona", name: "Leona", cost: 1, traits: ["Solar", "Defender"] },
  { id: "xayah", name: "Xayah", cost: 1, traits: ["Elderwood", "Fae", "Rapidfire"] },
  { id: "reksai", name: "Rek'Sai", cost: 1, traits: ["Blackthorn", "Brawler"] },
  { id: "veigar", name: "Veigar", cost: 1, traits: ["Blackthorn", "Sprykin", "Spellweaver"] },
  { id: "ornn", name: "Ornn", cost: 1, traits: ["Elderwood", "Defender"] },
  { id: "varus", name: "Varus", cost: 1, traits: ["Inferno", "Rapidfire"] },
  { id: "yunara", name: "Yunara", cost: 2, traits: ["Blossom", "Executioner"] },
  { id: "sejuani", name: "Sejuani", cost: 2, traits: ["Solar", "Juggernaut"] },
  { id: "kayle", name: "Kayle", cost: 2, traits: ["Solar", "Rapidfire"] },
  { id: "teemo", name: "Teemo", cost: 2, traits: ["Sprykin", "Invoker"] },
  { id: "shen", name: "Shen", cost: 2, traits: ["Inferno", "Defender"] },
  { id: "masteryi", name: "Master Yi", cost: 3, traits: ["Blossom", "Adaptor"] },
  { id: "vi", name: "Vi", cost: 3, traits: ["Primal", "Juggernaut"] },
  { id: "mamabeak", name: "Mama Beak", cost: 3, traits: ["Riftbeast", "Summoner", "Rapidfire"] },
  { id: "rammus", name: "Rammus", cost: 3, traits: ["Sprykin", "Defender"] },
  { id: "cassiopeia", name: "Cassiopeia", cost: 3, traits: ["Coven", "Spellweaver"] },
  { id: "ahri", name: "Ahri", cost: 4, traits: ["Blossom", "Spellweaver"] },
  { id: "aphelios", name: "Aphelios", cost: 4, traits: ["Lunar", "Rapidfire"] },
  { id: "morgana", name: "Morgana", cost: 4, traits: ["Coven", "Invoker"] },
  { id: "amumu", name: "Amumu", cost: 4, traits: ["Inferno", "Juggernaut"] },
  { id: "kennen", name: "Kennen", cost: 5, traits: ["Inferno", "Executioner"] },
  { id: "ashe", name: "Ashe", cost: 5, traits: ["Blossom", "Hunter"] },
];

// Short mark drawn on each unit tile: the first letter, or two letters when
// another unit shares that first letter.
export const UNIT_MARK: Record<string, string> = Object.fromEntries(
  UNITS.map((u) => [u.id, UNITS.some((o) => o.id !== u.id && o.name[0] === u.name[0]) ? u.name.slice(0, 2) : u.name[0]]),
);

export const UNIT_BY_ID: Record<string, UnitDef> = Object.fromEntries(
  UNITS.map((u) => [u.id, u]),
);

export const ITEMS: Record<string, string> = {
  edge: "Keen Edge",
  bow: "Quickbow",
  rod: "Ember Rod",
  tear: "Mana Tear",
  vest: "Iron Vest",
  cloak: "Warded Cloak",
  belt: "Giant's Belt",
  glove: "Lucky Glove",
  staff: "Runic Staff",
  guard: "Bastion Guard",
  hunter: "Hunter's Mark",
};

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

export function copiesOf(star: number) {
  return star === 1 ? 1 : star === 2 ? 3 : 9;
}
