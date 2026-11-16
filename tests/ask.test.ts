import { describe, expect, it } from "vitest";
import { checkAnswer } from "../lib/ask/check";
import { buildFacts, retrieve } from "../lib/ask/facts";
import { buildSampleGame } from "../lib/game/sample";
import { analyze } from "../lib/review/engine";

const review = analyze(buildSampleGame());
const facts = buildFacts(review);

describe("claim check", () => {
  it("keeps sentences whose numbers match the round they name", () => {
    const [s] = checkAnswer("At 4-3 you went into combat with 23 gold at 29 HP.", facts);
    expect(s.ok).toBe(true);
  });
  it("removes a sentence with a made-up number", () => {
    const [s] = checkAnswer("At 4-3 you went into combat with 37 gold.", facts);
    expect(s.ok).toBe(false);
    expect(s.unsupported).toContain(37);
  });
  it("removes a sentence that names a round that never happened", () => {
    const [s] = checkAnswer("At 6-2 you had 23 gold.", facts);
    expect(s.ok).toBe(false);
  });
  it("does not let a number from another round support a claim", () => {
    // 50 gold is true at 5-1, not at 3-3
    const [s] = checkAnswer("At 3-3 you held 50 gold.", facts);
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
    const bad = checkAnswer(`${review.headline} ${review.summary}`, facts).filter((s) => !s.ok);
    expect(bad.map((b) => `${b.text} [${b.unsupported.join(",")}]`)).toEqual([]);
  });
});
