import { buildSampleGame } from "../lib/game/sample";
const g = buildSampleGame();
for (const r of g.rounds)
  console.log(r.stage, r.kind, "hp", r.hp, "gold", r.gold, "->", r.goldEnd, "lvl", r.level, `${r.xp}/${r.xpToNext}`, "rr", r.rerolls, "xp", r.xpBought, "buy", r.bought.join(","), "sold", r.sold.join(","), r.outcome, r.damageTaken);
