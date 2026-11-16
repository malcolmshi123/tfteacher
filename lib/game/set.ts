import type { Cost, UnitDef } from "./types";

// A fictional sample set. The product is set-agnostic: real data comes from the
// static data of whatever set is live, in this same shape.

export const SET_NAME = "Sample Set";

export const UNITS: UnitDef[] = [
  { id: "brann", name: "Brann", cost: 1, traits: ["Ironclad", "Warden"] },
  { id: "ilsa", name: "Ilsa", cost: 1, traits: ["Tidecaller", "Sharpshot"] },
  { id: "corvo", name: "Corvo", cost: 1, traits: ["Duelist", "Ashen"] },
  { id: "mira", name: "Mira", cost: 1, traits: ["Sparkwright", "Runebound"] },
  { id: "tobin", name: "Tobin", cost: 1, traits: ["Warden", "Ashen"] },
  { id: "pell", name: "Pell", cost: 1, traits: ["Sharpshot", "Ironclad"] },
  { id: "vessa", name: "Vessa", cost: 2, traits: ["Tidecaller", "Duelist"] },
  { id: "garrick", name: "Garrick", cost: 2, traits: ["Ironclad", "Bastion"] },
  { id: "noor", name: "Noor", cost: 2, traits: ["Runebound", "Sharpshot"] },
  { id: "sable", name: "Sable", cost: 2, traits: ["Ashen", "Sparkwright"] },
  { id: "rook", name: "Rook", cost: 2, traits: ["Warden", "Bastion"] },
  { id: "liora", name: "Liora", cost: 3, traits: ["Tidecaller", "Runebound"] },
  { id: "dax", name: "Dax", cost: 3, traits: ["Duelist", "Ironclad"] },
  { id: "eshe", name: "Eshe", cost: 3, traits: ["Sparkwright", "Sharpshot"] },
  { id: "halvar", name: "Halvar", cost: 3, traits: ["Bastion", "Ashen"] },
  { id: "quill", name: "Quill", cost: 3, traits: ["Runebound", "Warden"] },
  { id: "ysolde", name: "Ysolde", cost: 4, traits: ["Tidecaller", "Bastion"] },
  { id: "kestrel", name: "Kestrel", cost: 4, traits: ["Sharpshot", "Duelist"] },
  { id: "ombra", name: "Ombra", cost: 4, traits: ["Ashen", "Runebound"] },
  { id: "thane", name: "Thane", cost: 4, traits: ["Ironclad", "Warden"] },
  { id: "aurel", name: "Aurel", cost: 5, traits: ["Sparkwright", "Bastion"] },
  { id: "nyx", name: "Nyx", cost: 5, traits: ["Tidecaller", "Ashen"] },
];

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
