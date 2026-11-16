import { buildSampleGame } from "../lib/game/sample";
import { analyze } from "../lib/review/engine";
const rv = analyze(buildSampleGame());
console.log(rv.headline); console.log(rv.summary); console.log(rv.stats);
for (const f of rv.findings) console.log(`\n[${f.severity}${f.positive ? " +" : ""}] ${f.title}\n  ${f.detail}\n  cites: ${f.cites.map(c => c.stage + " " + c.label).join(" | ")}`);
console.log(rv.series.map(p => `${p.stage} L${p.level}/${p.lobbyLevel} bv${p.boardValue}/${p.lobbyBoardValue}`).join("  "));
