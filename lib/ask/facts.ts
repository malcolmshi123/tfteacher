import { ITEMS, UNIT_BY_ID } from "../game/set";
import type { Review } from "../review/engine";

// Turns a review into a flat list of facts. Each fact belongs to one round (or
// to the whole game) and carries the numbers it states, so any answer can be
// checked number by number.

export interface Fact {
  id: string;
  stage: string | "game";
  text: string;
  numbers: number[];
  words: string[];
}

const STOP = new Set("the a an and or of to in on at for with my i you your was is it did do why what when how should have had be".split(" "));

export function tokens(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, " ")
    .split(/\s+/)
    .filter((w) => w && !STOP.has(w));
}

export function numbersIn(s: string): number[] {
  // stage refs like 4-2 are not numeric claims
  return (s.replace(/\b\d-\d\b/g, " ").match(/\d+(\.\d+)?/g) ?? []).map(Number);
}

function fact(id: string, stage: string, text: string): Fact {
  return { id, stage, text, numbers: numbersIn(text), words: tokens(text) };
}

export function buildFacts(review: Review): Fact[] {
  const { game, series, findings } = review;
  const out: Fact[] = [];
  const last = game.rounds[game.rounds.length - 1];
  out.push(fact("g-place", "game", `Placed ${game.placement} of 8 in ${game.queue}, ${game.patch}, ${game.durationMin} minutes, eliminated at ${last.stage}.`));
  out.push(fact("g-rolls", "game", `Rerolled ${game.rounds.reduce((a, r) => a + r.rerolls, 0)} times in the whole game.`));

  game.rounds.forEach((r, i) => {
    const p = series[i];
    const after = Math.max(0, r.hp - r.damageTaken);
    const result =
      r.kind === "carousel" ? "shared draft round" : r.kind === "pve" ? `monster round, ${r.outcome}` : r.outcome === "win" ? `won vs ${r.opponent}` : `lost to ${r.opponent}, took ${r.damageTaken} damage`;
    out.push(
      fact(
        `r-${r.stage}`,
        r.stage,
        `${r.stage}: started at ${r.hp} HP with ${r.gold} gold at level ${r.level}; ${r.rerolls} rerolls, bought XP ${r.xpBought} times, went into combat with ${r.goldEnd} gold; ${result}; ${after} HP after. Board value ${p.boardValue} vs lobby median ${p.lobbyBoardValue}; lobby median level ${p.lobbyLevel}, lobby median HP ${p.lobbyHp}.`,
      ),
    );
    if (r.board.length)
      out.push(fact(`b-${r.stage}`, r.stage, `${r.stage} board: ${r.board.map((b) => `${UNIT_BY_ID[b.unit].name} ${b.star}-star${b.items.length ? ` with ${b.items.map((x) => ITEMS[x]).join(", ")}` : ""}`).join("; ")}.`));
    if (r.itemBench.length) out.push(fact(`i-${r.stage}`, r.stage, `${r.stage} unused components on bench: ${r.itemBench.map((x) => ITEMS[x]).join(", ")}.`));
  });

  for (const f of findings) {
    out.push(fact(`f-${f.id}`, f.focus, `${f.title}. ${f.detail} ${(f.lines ?? []).join(". ")} Advice: ${f.advice}`));
  }
  return out;
}

// Simple lexical retrieval with a boost for rounds named in the question.
export function retrieve(facts: Fact[], question: string, k = 8): Fact[] {
  const q = tokens(question);
  const stages: string[] = Array.from(question.match(/\b\d-\d\b/g) ?? []);
  const scored = facts.map((f) => {
    let s = 0;
    for (const w of q) if (f.words.includes(w)) s += 1;
    if (stages.includes(f.stage)) s += 4;
    if (f.id.startsWith("f-")) s += 0.5;
    if (f.stage === "game") s += 0.25;
    return { f, s };
  });
  return scored
    .filter((x) => x.s > 0.6)
    .sort((a, b) => b.s - a.s)
    .slice(0, k)
    .map((x) => x.f);
}
