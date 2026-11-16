import { COMP_LABELS, UNIT_BY_ID } from "../game/set";

// Patch Radar: match the lines of a patch's notes against the comps a player
// actually plays. Every verdict lists the note lines it came from.

export interface NoteLine {
  id: string; // stable anchor, e.g. "u-aphelios-1"
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
  flex?: string[]; // units that fit the board when the core is in place
}

export interface CompVerdict {
  comp: PlayedComp;
  verdict: "stronger" | "weaker" | "mixed" | "unchanged";
  score: number;
  lines: NoteLine[];
  why: string;
}

export const PATCH = { from: "18.2", to: "18.3", date: "2026-11-12" };

export const NOTES: NoteLine[] = [
  { id: "u-khazix-1", section: "Units", target: "khazix", text: "Kha'Zix ability damage 240/360/560 to 220/330/520", direction: "nerf", weight: 2 },
  { id: "u-khazix-2", section: "Units", target: "khazix", text: "Kha'Zix health 750 to 700", direction: "nerf", weight: 2 },
  { id: "u-masteryi-1", section: "Units", target: "masteryi", text: "Master Yi ability shield 250/325/450 to 280/360/500", direction: "buff", weight: 1 },
  { id: "u-ahri-1", section: "Units", target: "ahri", text: "Ahri mana 90 to 80", direction: "buff", weight: 2 },
  { id: "u-vi-1", section: "Units", target: "vi", text: "Vi health 750 to 800", direction: "buff", weight: 1 },
  { id: "u-morgana-1", section: "Units", target: "morgana", text: "Morgana ability damage 280/420/1200 to 260/390/1200", direction: "nerf", weight: 1 },
  { id: "u-rammus-1", section: "Units", target: "rammus", text: "Rammus armor 45 to 50", direction: "buff", weight: 1 },
  { id: "t-blossom-1", section: "Traits", target: "Blossom", text: "Blossom (3) Attack Damage and Ability Power 12% to 10%", direction: "nerf", weight: 3 },
  { id: "t-juggernaut-1", section: "Traits", target: "Juggernaut", text: "Juggernaut (2) Juggernaut Durability 20% to 22%", direction: "buff", weight: 1 },
  { id: "t-inferno-1", section: "Traits", target: "Inferno", text: "Inferno (2) Burn duration 3 to 4 seconds", direction: "buff", weight: 2 },
  { id: "i-bow-1", section: "Items", target: "bow", text: "Quickbow attack speed 15% to 12%", direction: "nerf", weight: 1 },
  { id: "s-shop-1", section: "Systems", target: "odds-8", text: "Level 8 shop odds for 4-costs 24% to 22%", direction: "nerf", weight: 1 },
];

// Comps are named the way players name them: the biggest trait, then the carry.
// Names come from the board, so any set works without a hand-kept list.
export function compTraits(core: string[]): string[] {
  const n = new Map<string, number>();
  for (const id of core) for (const tr of UNIT_BY_ID[id]?.traits ?? []) n.set(tr, (n.get(tr) ?? 0) + 1);
  return [...n].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).map(([tr]) => tr);
}

export function compName(core: string[]): string {
  const carry = UNIT_BY_ID[core[0]]?.name ?? core[0];
  const traits = compTraits(core);
  // players name some trait pairs as one word (Lunar + Elderwood is "Lunarwood")
  const present = new Set(core.flatMap((id) => UNIT_BY_ID[id]?.traits ?? []));
  const blend = COMP_LABELS.find((l) => l.traits.every((tr) => present.has(tr)));
  if (blend) return `${blend.label} ${carry}`;
  const top = traits[0];
  return top ? `${top} ${carry}` : carry;
}

function comp(id: string, core: string[], games: number, avgPlace: number, top4: number, flex?: string[]): PlayedComp {
  return { id, name: compName(core), core, traits: compTraits(core), games, avgPlace, top4, flex };
}

export const MY_COMPS: PlayedComp[] = [
  comp("c1", ["khazix", "hecarim", "diana", "fiddlesticks", "soraka"], 14, 3.9, 57, ["azir", "ezreal", "kennen", "aphelios", "alune", "sentinel", "taric", "alistar", "gnar"]),
  comp("c2", ["ahri", "masteryi", "yunara", "ashe"], 9, 4.4, 44),
  comp("c3", ["amumu", "vi", "sejuani", "rammus"], 6, 4.8, 33),
];

// "62 to 56" -> -9.7. Tiered values ("250/325/450 to 280/360/500") average the
// change across tiers.
export function changePct(text: string): number | undefined {
  const m = text.match(/([\d.]+%?(?:\/[\d.]+%?)*)\s+to\s+([\d.]+%?(?:\/[\d.]+%?)*)/);
  if (!m) return undefined;
  const a = m[1].split("/").map((v) => parseFloat(v));
  const b = m[2].split("/").map((v) => parseFloat(v));
  if (a.length !== b.length || a.some((v) => !v)) return undefined;
  const pcts = a.map((v, k) => ((b[k] - v) / v) * 100);
  return pcts.reduce((x, y) => x + y, 0) / pcts.length;
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
            return `Your main carry ${name(comp.core[0])} was nerfed in ${carry} line${carry === 1 ? "" : "s"}${other ? `, and the shared change above hits it too` : ""}. Expect it to place lower until you adjust items or the board around it.`;
          })()
        : verdict === "stronger"
          ? `${list(buffs.map((b) => name(b.target)).filter((v, i, a) => a.indexOf(v) === i))} all got stronger.${nerfs.length ? ` The one hit is shared by every comp: ${nerfs.map((x) => x.text).join("; ")}.` : " Nothing in the comp was nerfed."}`
          : verdict === "mixed"
            ? (() => {
                const big = [...lines].sort((p, q) => Math.abs(changePct(q.text) ?? 0) - Math.abs(changePct(p.text) ?? 0))[0];
                return `Close call. The biggest single change is a ${big.direction}: ${big.text}. The ${big.direction === "nerf" ? "buffs" : "nerfs"} on this card offset most of it${score < 0 ? ", so it comes out slightly weaker" : score > 0 ? ", so it comes out slightly stronger" : ""}. Play it the same way and watch your first few games.`;
              })()
            : "Nothing in this comp changed.";
    return { comp, verdict, score, lines, why };
  });
}
