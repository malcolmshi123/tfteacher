import { UNIT_BY_ID } from "../game/set";

// Patch Radar: match the lines of a patch's notes against the comps a player
// actually plays. Every verdict lists the note lines it came from.

export interface NoteLine {
  id: string; // stable anchor, e.g. "u-aphelios-1"
  section: "Units" | "Traits" | "Items" | "Systems";
  target: string; // unit id, trait name, item id or system key
  text: string;
  direction: "buff" | "nerf" | "adjust";
  weight: number; // rough size of the change, 1 to 3
  minUnits?: number; // trait lines: the breakpoint the change applies at
}

export interface PlayedComp {
  id: string;
  name: string;
  carry: string; // unit id of the main carry
  core: string[]; // unit ids, by cost
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

// Patch 18.5, from Riot's notes (published Oct 20, live Oct 21, 2026). Trait
// and champion changes only: augments, wisps and items aren't matched to comps.
export const PATCH = { from: "18.4", to: "18.5", date: "Oct 21, 2026" };

export const NOTES: NoteLine[] = [
  { id: "t-blackthorn-1", section: "Traits", target: "Blackthorn", text: "Blackthorn (6) enhanced bonus 60% to 50%", direction: "nerf", weight: 2, minUnits: 6 },
  { id: "t-blackthorn-2", section: "Traits", target: "Blackthorn", text: "Blackthorn base AP sacrifice damage amp 12% to 10%", direction: "nerf", weight: 1, minUnits: 2 },
  { id: "t-elderwood-1", section: "Traits", target: "Elderwood", text: "Elderwood (9) summon bonus health 140% to 125%", direction: "nerf", weight: 2, minUnits: 9 },
  { id: "t-fae-1", section: "Traits", target: "Fae", text: "Fae (2/4) heal 2.5/4% to 3/5%", direction: "buff", weight: 2, minUnits: 2 },
  { id: "t-fae-2", section: "Traits", target: "Fae", text: "Fae 4th Pixie threshold 30000 to 25000", direction: "buff", weight: 1, minUnits: 2 },
  { id: "t-fae-3", section: "Traits", target: "Fae", text: "Fae 5th Pixie threshold 70000 to 60000", direction: "buff", weight: 1, minUnits: 2 },
  { id: "t-fae-4", section: "Traits", target: "Fae", text: "Fae 6th Pixie threshold 110000 to 100000", direction: "buff", weight: 1, minUnits: 2 },
  { id: "t-flora-1", section: "Traits", target: "Flora Fatalis", text: "Flora Fatalis max health healing 8% to 7%", direction: "nerf", weight: 1, minUnits: 1 },
  { id: "t-rapidfire-1", section: "Traits", target: "Rapidfire", text: "Rapidfire attack speed per attack 3/5/8/12% to 3/5/7/10%", direction: "nerf", weight: 2, minUnits: 2 },
  { id: "t-riftbeast-1", section: "Traits", target: "Riftbeast", text: "Riftbeast (7) AD and AP 6% to 5%", direction: "nerf", weight: 2, minUnits: 7 },
  { id: "u-caitlyn-1", section: "Units", target: "caitlyn", text: "Caitlyn empowered auto damage 190/285/470 to 200/300/490", direction: "buff", weight: 1 },
  { id: "u-azir-1", section: "Units", target: "azir", text: "Azir ability damage 46/69/110 to 43/65/105", direction: "nerf", weight: 2 },
  { id: "u-khazix-1", section: "Units", target: "khazix", text: "Kha'Zix damage 255/360/515 to 250/345/500", direction: "nerf", weight: 2 },
  { id: "u-khazix-2", section: "Units", target: "khazix", text: "Kha'Zix isolated damage 285/410/605 to 280/390/590", direction: "nerf", weight: 2 },
  { id: "u-mamabeak-1", section: "Units", target: "mamabeak", text: "Mama Beak mana lock ends about 1 second sooner", direction: "buff", weight: 1 },
  { id: "u-mamabeak-2", section: "Units", target: "mamabeak", text: "Mama Beak ability damage 22/33/52 to 20/30/50", direction: "nerf", weight: 2 },
  { id: "u-masteryi-1", section: "Units", target: "masteryi", text: "Master Yi (AD) starting attack damage 60 to 63", direction: "buff", weight: 1 },
  { id: "u-masteryi-2", section: "Units", target: "masteryi", text: "Master Yi (AP) ability damage 125/190/285 to 135/200/320", direction: "buff", weight: 2 },
  { id: "u-tristana-1", section: "Units", target: "tristana", text: "Tristana mana 60 to 50", direction: "buff", weight: 2 },
  { id: "u-tristana-2", section: "Units", target: "tristana", text: "Tristana damage per attack 10/15/25 to 12/18/28", direction: "buff", weight: 2 },
  { id: "u-brambleback-1", section: "Units", target: "brambleback", text: "Brambleback Alpha Mark heal 4% to 5%", direction: "buff", weight: 2 },
  { id: "u-brambleback-2", section: "Units", target: "brambleback", text: "Brambleback armor ignore 20% to 25%", direction: "buff", weight: 2 },
  { id: "u-malphite-1", section: "Units", target: "malphite", text: "Malphite shield 700/850 to 735/885", direction: "buff", weight: 1 },
  { id: "u-morgana-1", section: "Units", target: "morgana", text: "Morgana initial curse damage 60/90 to 70/105", direction: "buff", weight: 2 },
  { id: "u-morgana-2", section: "Units", target: "morgana", text: "Morgana curse bonus damage 22/33 to 25/38", direction: "buff", weight: 2 },
  { id: "u-sentinel-1", section: "Units", target: "sentinel", text: "Sentinel stun duration 1 to 0.5 seconds", direction: "nerf", weight: 2 },
  { id: "u-sentinel-2", section: "Units", target: "sentinel", text: "Sentinel shield 350/450 to 375/475", direction: "buff", weight: 1 },
  { id: "u-sett-1", section: "Units", target: "sett", text: "Sett heal 225/275 to 250/300", direction: "buff", weight: 1 },
  { id: "u-sivir-1", section: "Units", target: "sivir", text: "Sivir ability damage 200/300 to 220/330", direction: "buff", weight: 2 },
  { id: "u-sivir-2", section: "Units", target: "sivir", text: "Sivir bounce damage 20% to 18% of the first hit", direction: "nerf", weight: 1 },
  { id: "u-soraka-1", section: "Units", target: "soraka", text: "Soraka first star damage 225/335 to 235/355", direction: "buff", weight: 1 },
  { id: "u-soraka-2", section: "Units", target: "soraka", text: "Soraka extra star damage 100/150 to 110/165", direction: "buff", weight: 1 },
  { id: "u-alune-1", section: "Units", target: "alune", text: "Alune Moonshard damage 55/83 to 58/88", direction: "buff", weight: 1 },
  { id: "u-alune-2", section: "Units", target: "alune", text: "Alune attack speed 0.8 to 0.85", direction: "buff", weight: 1 },
  { id: "u-alune-3", section: "Units", target: "alune", text: "Alune Attuned durability 7% to 5%", direction: "nerf", weight: 1 },
  { id: "u-ashe-1", section: "Units", target: "ashe", text: "Ashe damage over time 9/14 to 11/16", direction: "buff", weight: 2 },
  { id: "u-taric-1", section: "Units", target: "taric", text: "Taric resists 65 to 70", direction: "buff", weight: 1 },
  { id: "u-taric-2", section: "Units", target: "taric", text: "Taric empowered attack damage 100/150 to 130/200", direction: "buff", weight: 2 },
];

// active trait counts for a board
export function traitCounts(core: string[]): Map<string, number> {
  const n = new Map<string, number>();
  for (const id of core) for (const tr of UNIT_BY_ID[id]?.traits ?? []) n.set(tr, (n.get(tr) ?? 0) + 1);
  return n;
}

export function compTraits(core: string[]): string[] {
  return [...traitCounts(core)].filter(([, c]) => c >= 2).sort((a, b) => b[1] - a[1]).map(([tr]) => tr);
}

// Comp boards and names follow TFT Academy's Set 18 comp pages. Games and
// results are this sample player's from patch 18.4.
function comp(id: string, name: string, carry: string, core: string[], games: number, avgPlace: number, top4: number, flex?: string[]): PlayedComp {
  const board = [...core].sort((p, q) => (UNIT_BY_ID[p]?.cost ?? 0) - (UNIT_BY_ID[q]?.cost ?? 0));
  return { id, name, carry, core: board, traits: compTraits(board), games, avgPlace, top4, flex };
}

export const MY_COMPS: PlayedComp[] = [
  comp("c1", "Lunarwood Kha'Zix", "khazix", ["ornn", "leblanc", "khazix", "hecarim", "diana", "fiddlesticks", "soraka"], 9, 4.4, 44, ["azir", "ezreal", "kennen", "aphelios", "alune", "sentinel", "taric", "alistar", "gnar"]),
  comp("c2", "Ahri Morgana", "ahri", ["pebbles", "karma", "krug", "sentinel", "sett", "ahri", "morgana", "taric"], 6, 3.8, 67),
  comp("c3", "Tempo Riftbeast", "brambleback", ["pebbles", "murkwolf", "krug", "sentinel", "brambleback", "gnar", "taric", "elderdragon"], 4, 4.5, 50),
];

// The patch at a glance, beyond your own comps: what the changes add up to and
// which kinds of boards they favor. Every pick names the note lines behind it.
export interface PatchPick {
  name: string;
  why: string;
  units: string[];
  lines: string[]; // NoteLine ids
}

export const PATCH_SUMMARY: { lead: string; up: string[]; down: string[]; tryThese: PatchPick[]; avoid: PatchPick[] } = {
  lead: "18.5 mostly helps AP 4-costs, Fae and front lines.",
  up: ["Fae", "Morgana", "Soraka", "Sett", "Taric", "Brambleback"],
  down: ["Blackthorn", "Rapidfire", "Flora Fatalis healing", "Elderwood (9)", "Riftbeast (7)", "Kha'Zix damage", "Azir damage", "Mama Beak damage", "Sentinel stun"],
  tryThese: [
    {
      name: "Fae boards",
      why: "Fae heals more at 2 and 4 and its Pixies arrive sooner, and Tristana casts more often and hits harder.",
      units: ["xayah", "rakan", "tristana", "lillia"],
      lines: ["t-fae-1", "t-fae-2", "t-fae-3", "t-fae-4", "u-tristana-1", "u-tristana-2"],
    },
    {
      name: "AP 4-costs",
      why: "Morgana's curse and Soraka's stars both deal more damage, so AP boards built around them gain the most.",
      units: ["morgana", "soraka"],
      lines: ["u-morgana-1", "u-morgana-2", "u-soraka-1", "u-soraka-2"],
    },
    {
      name: "Sturdier front lines",
      why: "Taric gets more resists and much stronger empowered attacks, and Sett heals more, so boards that fit either hold the front longer.",
      units: ["taric", "sett"],
      lines: ["u-taric-1", "u-taric-2", "u-sett-1"],
    },
  ],
  avoid: [
    {
      name: "Blackthorn and Azir",
      why: "Blackthorn (6) gives less, its base sacrifice amp went down, and Azir deals less damage.",
      units: ["reksai", "veigar", "warwick", "azir"],
      lines: ["t-blackthorn-1", "t-blackthorn-2", "u-azir-1"],
    },
    {
      name: "Rapidfire around Mama Beak",
      why: "Rapidfire stacks less attack speed at 4 and 5, and Mama Beak's ability damage went down.",
      units: ["varus", "kayle", "mamabeak", "aphelios"],
      lines: ["t-rapidfire-1", "u-mamabeak-2"],
    },
    {
      name: "Kha'Zix carries",
      why: "Both of Kha'Zix's damage values went down, so boards built to carry with him lose the most.",
      units: ["khazix"],
      lines: ["u-khazix-1", "u-khazix-2"],
    },
  ],
};

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
    const counts = traitCounts(comp.core);
    // a unit line counts if the unit is on the board; a trait line only if the
    // board reaches the breakpoint it changes
    const lines = notes.filter((n) =>
      n.section === "Units" ? comp.core.includes(n.target) : n.section === "Traits" ? (counts.get(n.target) ?? 0) >= (n.minUnits ?? 1) : false,
    );
    const score = lines.reduce((a, n) => a + (n.direction === "buff" ? n.weight : n.direction === "nerf" ? -n.weight : 0), 0);
    const buffs = lines.filter((n) => n.direction === "buff");
    const nerfs = lines.filter((n) => n.direction === "nerf");
    const verdict = !lines.length ? "unchanged" : buffs.length && nerfs.length && Math.abs(score) <= 1 ? "mixed" : score > 0 ? "stronger" : score < 0 ? "weaker" : "mixed";
    const name = (id: string) => UNIT_BY_ID[id]?.name ?? id;
    const why =
      verdict === "weaker"
        ? (() => {
            const uniq = (xs: string[]) => xs.filter((v, i, a) => a.indexOf(v) === i);
            const carry = nerfs.filter((x) => x.target === comp.carry).length;
            const other = uniq(nerfs.filter((x) => x.target !== comp.carry).map((x) => name(x.target)));
            const buffed = uniq(buffs.map((x) => name(x.target)));
            const lead = carry ? `Your main carry ${name(comp.carry)} was nerfed in ${carry} line${carry === 1 ? "" : "s"}` : `${list(other)} got weaker`;
            const more = carry && other.length ? `, and ${list(other)} was nerfed too` : "";
            const offset = buffed.length ? ` ${list(buffed)} got buffed, but the nerfs to ${[name(comp.carry), ...other].length > 1 ? list([name(comp.carry), ...other]) : name(comp.carry)} weigh more.` : "";
            return `${lead}${more}.${offset} Expect it to place lower until you adjust items or the board around it.`;
          })()
        : verdict === "stronger"
          ? (() => {
              // units with lines both ways aren't called "stronger"; their nerf is spelled out
              const nerfed = new Set(nerfs.map((x) => x.target));
              const up = buffs.map((b) => b.target).filter((t, i, a) => a.indexOf(t) === i && !nerfed.has(t)).map(name);
              // a unit with lines both ways is called mixed, naming what went each way
              const mixed = [...nerfed].filter((t) => buffs.some((b) => b.target === t));
              const mixedText = mixed
                .map((t) => ` ${name(t)} is mixed: ${nerfs.filter((x) => x.target === t).map((x) => x.text.replace(`${name(t)} `, "")).join("; ")}, but ${buffs.filter((x) => x.target === t).map((x) => x.text.replace(`${name(t)} `, "")).join("; ")}.`)
                .join("");
              const pure = nerfs.filter((x) => !mixed.includes(x.target));
              return `${list(up)} got stronger.${mixedText}${pure.length ? ` One line went the other way: ${pure.map((x) => x.text).join("; ")}.` : ""}${nerfs.length ? "" : " Nothing in the comp was nerfed."}`;
            })()
          : verdict === "mixed"
            ? (() => {
                const big = [...lines].sort((p, q) => Math.abs(changePct(q.text) ?? 0) - Math.abs(changePct(p.text) ?? 0))[0];
                return `Close call. The biggest single change is a ${big.direction}: ${big.text}. The ${big.direction === "nerf" ? "buffs" : "nerfs"} on this card offset most of it${score < 0 ? ", so it comes out slightly weaker" : score > 0 ? ", so it comes out slightly stronger" : ""}. Play it the same way and watch your first few games.`;
              })()
            : "Nothing in this comp changed.";
    const missed = notes.filter((n) => n.section === "Traits" && (counts.get(n.target) ?? 0) > 0 && (counts.get(n.target) ?? 0) < (n.minUnits ?? 1));
    const note = missed
      .map((n) => ` ${n.target} (${n.minUnits}) was ${n.direction === "nerf" ? "nerfed" : "buffed"}, but this board runs ${counts.get(n.target)}, so it doesn't count here.`)
      .join("");
    return { comp, verdict, score, lines, why: why + note };
  });
}
