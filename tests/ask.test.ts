import { describe, expect, it } from "vitest";
import { checkAnswer } from "../lib/ask/check";
import { buildFacts, retrieve } from "../lib/ask/facts";
import { buildSampleGame } from "../lib/game/sample";
import { analyze } from "../lib/review/engine";

const review = analyze(buildSampleGame());
const facts = buildFacts(review);

describe("claim check", () => {
  const r43 = review.game.rounds.find((r) => r.stage === "4-3")!;
  it("keeps sentences whose numbers match the round they name", () => {
    const [s] = checkAnswer(`At 4-3 you went into combat with ${r43.goldEnd} gold at ${r43.hp} HP.`, facts);
    expect(s.ok).toBe(true);
  });
  it("removes a sentence with a made-up number", () => {
    const known = new Set(facts.filter((f) => f.stage === "4-3" || f.stage === "game").flatMap((f) => f.numbers));
    let fake = 37;
    while (known.has(fake)) fake++;
    const [s] = checkAnswer(`At 4-3 you went into combat with ${fake} gold.`, facts);
    expect(s.ok).toBe(false);
    expect(s.unsupported).toContain(fake);
  });
  it("removes a sentence that names a round that never happened", () => {
    const [s] = checkAnswer("At 6-2 you had 23 gold.", facts);
    expect(s.ok).toBe(false);
  });
  it("does not let a number from another round support a claim", () => {
    // pick a number that is true at 5-1 but appears nowhere in 3-3's facts
    const in33 = new Set(facts.filter((f) => f.stage === "3-3" || f.stage === "game").flatMap((f) => f.numbers));
    const n = facts.filter((f) => f.stage === "5-1").flatMap((f) => f.numbers).find((x) => !in33.has(x))!;
    const [s] = checkAnswer(`At 3-3 you held ${n} gold.`, facts);
    expect(s.ok).toBe(false);
  });
});

describe("retrieval", () => {
  it("puts the named round first", () => {
    expect(retrieve(facts, "what happened at 4-5?")[0].stage).toBe("4-5");
  });
});

describe("the review's own text passes the claim check", () => {
  for (const f of review.findings) {
    it(f.id, () => {
      const text = [f.title + ".", f.detail, ...(f.lines ?? []).map((l) => l + ".")].join(" ");
      const bad = checkAnswer(text, facts).filter((s) => !s.ok);
      expect(bad.map((b) => `${b.text} [${b.unsupported.join(",")}]`)).toEqual([]);
    });
  }
  it("headline and summary", () => {
    const bad = checkAnswer(`${review.headline} ${review.shortHeadline} ${review.summary}`, facts).filter((s) => !s.ok);
    expect(bad.map((b) => `${b.text} [${b.unsupported.join(",")}]`)).toEqual([]);
  });
});
