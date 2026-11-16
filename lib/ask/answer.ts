import Anthropic from "@anthropic-ai/sdk";
import type { Review } from "../review/engine";
import { checkAnswer, type CheckedSentence } from "./check";
import { buildFacts, retrieve, type Fact } from "./facts";

export interface AskResult {
  question: string;
  sentences: CheckedSentence[]; // only the ones that passed the check
  removed: number; // sentences dropped by the claim check
  sources: { stage: string; text: string }[];
  mode: "model" | "offline";
  usage?: { input: number; cacheRead: number; output: number };
}

// Fixed instructions. Kept byte-identical across requests so the cached prefix
// (instructions + this game's facts) is reused for every follow-up question.
const SYSTEM = `You are TFTeacher, a coach reviewing one finished Teamfight Tactics game.
Answer the player's question in 2 to 4 short sentences, in plain words.
Use only the facts provided about this game. Every number you state must appear in those facts.
Name the round (like 4-2) whenever you state a number about a round.
If the facts can't answer the question, say what is missing instead of guessing.
Never mention augments.`;

function factBlock(facts: Fact[]) {
  return facts.map((f) => `[${f.stage}] ${f.text}`).join("\n");
}

export async function answer(review: Review, question: string): Promise<AskResult> {
  const facts = buildFacts(review);
  const hits = retrieve(facts, question);
  const sources = hits.map((f) => ({ stage: f.stage, text: f.text }));

  const key = process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN;
  if (!key) return offline(question, hits, facts, sources);

  const client = new Anthropic();
  const response = await client.beta.messages.create({
    model: process.env.TFTEACHER_MODEL || "claude-opus-5-5",
    max_tokens: 1024,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: { effort: "low" },
    system: [
      { type: "text", text: SYSTEM },
      // the whole game is the stable, cacheable part of the prompt
      { type: "text", text: `Facts about this game:\n${factBlock(facts)}`, cache_control: { type: "ephemeral" } },
    ],
    messages: [
      {
        role: "user",
        content: `Most relevant facts for this question:\n${factBlock(hits)}\n\nQuestion: ${question}`,
      },
    ],
  });

  if (response.stop_reason === "refusal") return offline(question, hits, facts, sources);

  const text = response.content
    .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
    .map((b) => b.text)
    .join(" ");
  const checked = checkAnswer(text, facts);
  return {
    question,
    sentences: checked.filter((s) => s.ok),
    removed: checked.filter((s) => !s.ok).length,
    sources,
    mode: "model",
    usage: {
      input: response.usage.input_tokens,
      cacheRead: response.usage.cache_read_input_tokens ?? 0,
      output: response.usage.output_tokens,
    },
  };
}

// No model available: answer from the best matching finding and round facts.
function offline(question: string, hits: Fact[], facts: Fact[], sources: AskResult["sources"]): AskResult {
  const finding = hits.find((f) => f.id.startsWith("f-"));
  const round = hits.find((f) => f.id.startsWith("r-"));
  const parts: string[] = [];
  if (finding) {
    const [title, ...rest] = finding.text.split(". ");
    parts.push(`${title}.`);
    const advice = finding.text.split("Advice: ")[1];
    if (advice) parts.push(advice);
    void rest;
  }
  if (round) parts.push(`At ${round.text}`);
  if (!parts.length) parts.push("I couldn't find anything in this game's recording that answers that. Try naming a round, like 4-2.");
  const checked = checkAnswer(parts.join(" "), facts);
  return { question, sentences: checked.filter((s) => s.ok), removed: checked.filter((s) => !s.ok).length, sources, mode: "offline" };
}
