import { numbersIn, type Fact } from "./facts";

// Claim check: every number in an answer sentence must appear in a fact for a
// round the sentence names (or in a whole-game fact if it names no round).
// Sentences that fail are removed and counted, never shown.

export interface CheckedSentence {
  text: string;
  stages: string[];
  ok: boolean;
  unsupported: number[];
}

export function splitSentences(text: string) {
  return text
    .replace(/\s+/g, " ")
    .split(/(?<=[.!?])\s+(?=[A-Z0-9"])/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function checkAnswer(answer: string, facts: Fact[]): CheckedSentence[] {
  const byStage = new Map<string, Fact[]>();
  for (const f of facts) byStage.set(f.stage, [...(byStage.get(f.stage) ?? []), f]);
  const gameNums = new Set((byStage.get("game") ?? []).flatMap((f) => f.numbers));

  return splitSentences(answer).map((text) => {
    const stages = Array.from(new Set(text.match(/\b\d-\d\b/g) ?? []));
    const nums = numbersIn(text);
    const pool = new Set<number>(gameNums);
    if (stages.length) for (const s of stages) for (const f of byStage.get(s) ?? []) f.numbers.forEach((n) => pool.add(n));
    else for (const f of facts) f.numbers.forEach((n) => pool.add(n));
    // small counting words like "2 rounds" in advice are allowed when they appear in any finding
    const unsupported = nums.filter((n) => !pool.has(n));
    const badStage = stages.some((s) => !byStage.has(s));
    return { text, stages, ok: unsupported.length === 0 && !badStage, unsupported };
  });
}
