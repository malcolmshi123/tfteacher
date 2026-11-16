import { UNIT_BY_ID } from "../game/set";

// Patch Radar: match the lines of a patch's notes against the comps a player
// actually plays. Every verdict lists the note lines it came from.

export interface NoteLine {
  id: string; // stable anchor, e.g. "u-kestrel-1"
  section: "Units" | "Traits" | "Items" | "Systems";
  target: string; // unit id, trait name, item id or system key
  text: string;
  direction: "buff" | "nerf" | "adjust";
  weight: number; // rough size of the change, 1 to 3
}

export interface PlayedComp {
  id: string;
  name: string;
  core: string[]; // unit ids
  traits: string[];
  games: number;
  avgPlace: number;
  top4: number; // percent
}

export interface CompVerdict {
  comp: PlayedComp;
  verdict: "stronger" | "weaker" | "mixed" | "unchanged";
  score: number;
  lines: NoteLine[];
  why: string;
}

export const PATCH = { from: "14.2", to: "14.3", date: "2026-11-12" };

export const NOTES: NoteLine[] = [
  { id: "u-kestrel-1", section: "Units", target: "kestrel", text: "Kestrel attack damage 62 to 56", direction: "nerf", weight: 2 },
  { id: "u-kestrel-2", section: "Units", target: "kestrel", text: "Kestrel ability bonus attacks 4 to 3", direction: "nerf", weight: 2 },
  { id: "u-liora-1", section: "Units", target: "liora", text: "Liora ability shield 250/325/450 to 280/360/500", direction: "buff", weight: 1 },
  { id: "u-ysolde-1", section: "Units", target: "ysolde", text: "Ysolde mana 90 to 80", direction: "buff", weight: 2 },
  { id: "u-dax-1", section: "Units", target: "dax", text: "Dax health 750 to 800", direction: "buff", weight: 1 },
  { id: "u-ombra-1", section: "Units", target: "ombra", text: "Ombra ability damage 280/420/1200 to 260/390/1200", direction: "nerf", weight: 1 },
  { id: "u-halvar-1", section: "Units", target: "halvar", text: "Halvar armor 45 to 50", direction: "buff", weight: 1 },
  { id: "t-tidecaller-1", section: "Traits", target: "Tidecaller", text: "Tidecaller (4) bonus mana regen 4 to 3", direction: "nerf", weight: 2 },
  { id: "t-ironclad-1", section: "Traits", target: "Ironclad", text: "Ironclad (2) armor 20 to 25", direction: "buff", weight: 1 },
  { id: "t-ashen-1", section: "Traits", target: "Ashen", text: "Ashen (3) burn 1% to 1.5% max health", direction: "buff", weight: 2 },
  { id: "i-bow-1", section: "Items", target: "bow", text: "Quickbow attack speed 15% to 12%", direction: "nerf", weight: 1 },
  { id: "s-shop-1", section: "Systems", target: "odds-8", text: "Level 8 shop odds for 4-costs 24% to 22%", direction: "nerf", weight: 1 },
];

export const MY_COMPS: PlayedComp[] = [
  { id: "c1", name: "Kestrel Sharpshot", core: ["kestrel", "eshe", "noor", "ilsa"], traits: ["Sharpshot", "Duelist"], games: 14, avgPlace: 3.9, top4: 57 },
  { id: "c2", name: "Tidecaller Liora", core: ["liora", "ysolde", "vessa", "nyx"], traits: ["Tidecaller", "Runebound"], games: 9, avgPlace: 4.4, top4: 44 },
  { id: "c3", name: "Ironclad Bastion", core: ["dax", "garrick", "thane", "halvar"], traits: ["Ironclad", "Bastion"], games: 6, avgPlace: 4.8, top4: 33 },
];

// "62 to 56" -> -9.7. Uses the last "a to b" pair in the line; tiered values compare the first tier.
export function changePct(text: string): number | undefined {
  const m = [...text.matchAll(/([\d.]+)%?(?:\/[\d.]+%?)*(?:\/([\d.]+))?%?\s+to\s+([\d.]+)%?(?:\/[\d.]+%?)*(?:\/([\d.]+))?/g)].pop();
  if (!m) return undefined;
  const from = Number(m[2] ?? m[1]);
  const to = Number(m[4] ?? m[3]);
  if (!from) return undefined;
  return ((to - from) / from) * 100;
}

function list(xs: string[]) {
  return xs.length <= 1 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs[xs.length - 1]}`;
}

export function radar(comps = MY_COMPS, notes = NOTES): CompVerdict[] {
  return comps.map((comp) => {
    const lines = notes.filter(
      (n) =>
        comp.core.includes(n.target) ||
        comp.traits.includes(n.target) ||
        (n.section === "Units" && comp.core.some((u) => UNIT_BY_ID[u]?.traits.includes(n.target))) ||
        // shop odds for a cost tier touch every comp built around that tier
        (n.target.startsWith("odds-") && comp.core.some((u) => UNIT_BY_ID[u]?.cost === 4)),
    );
    const score = lines.reduce((a, n) => a + (n.direction === "buff" ? n.weight : n.direction === "nerf" ? -n.weight : 0), 0);
    const buffs = lines.filter((n) => n.direction === "buff");
    const nerfs = lines.filter((n) => n.direction === "nerf");
    const verdict = !lines.length ? "unchanged" : buffs.length && nerfs.length && Math.abs(score) <= 1 ? "mixed" : score > 0 ? "stronger" : score < 0 ? "weaker" : "mixed";
    const name = (id: string) => UNIT_BY_ID[id]?.name ?? id;
    const why =
      verdict === "weaker"
        ? (() => {
            const carry = nerfs.filter((x) => x.target === comp.core[0]).length;
            const other = nerfs.length - carry;
            return `Your main carry ${name(comp.core[0])} was nerfed in ${carry} line${carry === 1 ? "" : "s"}${other ? `, and ${other} more line${other === 1 ? "" : "s"} hit the comp` : ""}. Expect it to place lower until you adjust items or the board around it.`;
          })()
        : verdict === "stronger"
          ? `${list(buffs.map((b) => name(b.target)).filter((v, i, a) => a.indexOf(v) === i))} all got stronger.${nerfs.length ? ` The only hit is smaller: ${nerfs.map((x) => x.text.charAt(0).toLowerCase() + x.text.slice(1)).join("; ")}.` : " Nothing in the comp was nerfed."}`
          : verdict === "mixed"
            ? `Buffs and nerfs roughly cancel out. Play it the same way and watch the first few games.`
            : "Nothing in this comp changed.";
    return { comp, verdict, score, lines, why };
  });
}
