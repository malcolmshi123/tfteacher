"use client";

import { HighlightSwatch, ItemChip, UnitToken } from "@/components/UnitToken";
import { UNIT_BY_ID } from "@/lib/game/set";
import type { GameRecord } from "@/lib/game/types";
import { costTone, shopMarks, unitsLostBy, type Finding, type SeriesPoint } from "@/lib/review/engine";

export function RoundInspector({
  game,
  stage,
  series,
  findings,
  onPick,
  bare = false,
}: {
  game: GameRecord;
  stage: string;
  series: SeriesPoint[];
  findings: Finding[];
  onPick: (id: string) => void;
  bare?: boolean;
}) {
  const idx = game.rounds.findIndex((r) => r.stage === stage);
  const r = game.rounds[idx];
  const prev = game.rounds[idx - 1];
  const pt = series[idx];
  const here = findings.filter((f) => f.stages.includes(stage));
  // bought and missed slots, the same walk the review and the landing use
  const marks = prev ? shopMarks(prev, r) : { bought: new Set<string>(), missed: new Set<string>() };

  const prevPt = series[idx - 1];
  const takeaway =
    r.bought.length >= 5
      ? `Your board grew from ${prevPt?.boardValue ?? 0} to ${pt.boardValue} gold of units this round.`
      : r.kind === "pvp" && r.outcome === "loss" && r.hp <= 40 && r.goldEnd >= 20
        ? `Started at ${r.hp} HP and lost ${r.damageTaken} while holding ${r.goldEnd} gold.`
        : r.xpBought >= 3
          ? `Spent ${r.xpBought * 4} gold on XP${r.level < pt.lobbyLevel ? ", still a level behind the lobby" : ""}.`
          : here.find((f) => !f.positive)?.title;

  const by = unitsLostBy(r.stage, r.damageTaken);
  const result =
    r.kind === "carousel"
      ? "Carousel"
      : r.kind === "pve"
        ? "PvE"
        : r.outcome === "win"
          ? "Won"
          : idx === game.rounds.length - 1 && r.hp - r.damageTaken <= 0
            ? `Died, lost by ${by} unit${by === 1 ? "" : "s"}`
            : `Lost by ${by} unit${by === 1 ? "" : "s"}`;

  return (
    <div className={bare ? "" : "rounded-2xl border border-[var(--line)] bg-[var(--panel)]"}>
      <div className={`flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:px-5 sticky top-0 z-10 bg-[var(--panel)] ${bare ? "" : "rounded-t-2xl"}`}>
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h3 className="tnum whitespace-nowrap text-[22px] font-semibold tracking-tight">Round {r.stage}</h3>
          <span className={`text-[13px] ${r.outcome === "loss" ? "text-[var(--hp)]" : r.outcome === "win" ? "text-[var(--good)]" : "text-[var(--muted)]"}`}>
            {result}
          </span>
        </div>
        <div className="flex gap-1">
          <NavBtn disabled={!prev} onClick={() => prev && onPick(prev.stage)} label="Previous round">‹</NavBtn>
          <NavBtn disabled={idx >= game.rounds.length - 1} onClick={() => game.rounds[idx + 1] && onPick(game.rounds[idx + 1].stage)} label="Next round">›</NavBtn>
        </div>
      </div>

      {takeaway && <p className="text-pretty border-b border-[var(--line)] px-4 py-3 text-[14px] leading-snug text-[var(--ink)] sm:px-5">{takeaway}</p>}

      <dl className="grid grid-cols-2 border-b border-[var(--line)] lg:grid-cols-4">
        <Stat k="HP after combat" v={`${Math.max(0, r.hp - r.damageTaken)}`} sub={pt.lobbyAlive >= 4 ? `lobby ${pt.lobbyHp}` : `${pt.lobbyAlive} opponents left`} tone={pt.lobbyAlive < 4 ? undefined : r.hp - r.damageTaken < pt.lobbyHp ? "hp" : "good"} />
        <Stat k="Gold" v={`${r.gold}`} sub={`${r.goldEnd} into combat`} />
        <Stat k="Level" v={`${r.level}`} sub={pt.lobbyAlive >= 4 ? `lobby ${pt.lobbyLevel}` : undefined} tone={pt.lobbyAlive < 4 ? undefined : r.level < pt.lobbyLevel ? "hp" : r.level > pt.lobbyLevel ? "good" : undefined} />
        <Stat k="Board" v={`${pt.boardValue}`} sub={pt.lobbyAlive >= 4 ? `lobby ${pt.lobbyBoardValue}` : undefined} tone={pt.lobbyAlive < 4 ? undefined : pt.boardValue < pt.lobbyBoardValue ? "hp" : "good"} />
      </dl>

      <div className="space-y-5 px-4 py-5 sm:px-5">
        <Section title="Board when combat started">
          <div className="flex flex-wrap justify-center gap-y-4 pt-3 [&>*]:basis-1/4">
            {r.board.map((p, i) => (
              <UnitToken key={i} piece={p} size={bare ? 34 : 38} />
            ))}
          </div>
        </Section>

        {(r.bought.length > 0 || r.sold.length > 0 || r.xpBought > 0 || r.rerolls > 0) && (
          <Section title="Gold this round">
            <dl className="tnum mt-1 divide-y divide-[var(--line)] text-[13px]">
              {[
                ["Start of round", "", `${r.gold}`],
                ...(r.xpBought ? [["XP", `${r.xpBought} buy${r.xpBought === 1 ? "" : "s"}`, `−${r.xpBought * 4}`]] : []),
                ...(r.rerolls ? [["Rerolls", `${r.rerolls} roll${r.rerolls === 1 ? "" : "s"}`, `−${r.rerolls * 2}`]] : []),
                ...(r.bought.length ? [["Units", summarize(r.bought), `−${r.bought.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0)}`]] : []),
                ...(r.sold.length ? [["Sold", `${summarizeSold(r.sold)}, worth ${r.sold.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0)} on the board`, `+${r.soldGold}`]] : []),
                ["Into combat", "", `${r.goldEnd}`],
              ].map(([k, what, v], i, all) => (
                <div key={k} className={`grid grid-cols-[96px_minmax(0,1fr)_44px] items-baseline gap-3 py-2 ${i === 0 || i === all.length - 1 ? "font-medium text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
                  <dt>{k}</dt>
                  <dd className="text-[12px] leading-snug text-[var(--muted)]">{what}</dd>
                  <dd className="text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </Section>
        )}

        {r.bench.length > 0 && (
          <Section title="Bench">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {r.bench.map((p, i) => (
                <UnitToken key={i} piece={p} size={36} showName={false} />
              ))}
            </div>
          </Section>
        )}
        {r.itemBench.length > 0 && (
          <Section title="Spare item components">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {r.itemBench.map((it, i) => (
                <ItemChip key={i} id={it} />
              ))}
            </div>
          </Section>
        )}

        {here.length > 0 && (
          <Section title="Findings at this round">
            <ul className="space-y-1.5 pt-1">
              {here.map((f) => (
                <li key={f.id} className="flex items-start gap-2 text-[13px] leading-snug text-[var(--ink-2)]">
                  <span className="mt-[6px] block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: costTone(f) }} />
                  {f.title}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {r.kind !== "carousel" && r.shops.length > 0 && (
          <Section title={`Shops seen · ${r.rerolls ? `free shop and ${r.rerolls} roll${r.rerolls === 1 ? "" : "s"}` : "free shop only"}`}>
            <div className="space-y-2 pt-1">
              {r.shops.map((shop, si) => (
                <div key={si} className="flex items-center gap-3">
                  <span className="tnum w-12 shrink-0 text-[11px] text-[var(--muted)]">{si === 0 ? "Free" : `Roll ${si}`}</span>
                  <div className="flex gap-2">
                    {shop.map((u, k) => {
                      const key = `${si}:${k}`;
                      return <UnitToken key={k} unitId={u} size={34} showName={false} state={marks.bought.has(key) ? "bought" : marks.missed.has(key) ? "missed" : "normal"} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
              {marks.bought.size > 0 && <Legend state="bought">Bought</Legend>}
              {marks.missed.size > 0 && <Legend state="missed">Missed</Legend>}
            </p>
          </Section>
        )}

      </div>
    </div>
  );
}

function summarize(units: string[]) {
  const n: Record<string, number> = {};
  for (const u of units) n[u] = (n[u] ?? 0) + 1;
  return Object.entries(n)
    .map(([u, c]) => `${UNIT_BY_ID[u].name}${c > 1 ? ` ×${c}` : ""}`)
    .join(", ");
}

// sold copies as the units you actually sold: 3 copies of one unit is a 2-star
function summarizeSold(units: string[]) {
  const n: Record<string, number> = {};
  for (const u of units) n[u] = (n[u] ?? 0) + 1;
  return Object.entries(n)
    .flatMap(([u, c]) => {
      const name = UNIT_BY_ID[u].name;
      const out: string[] = [];
      for (let k = 0; k < Math.floor(c / 9); k++) out.push(`a 3-star ${name}`);
      for (let k = 0; k < Math.floor((c % 9) / 3); k++) out.push(`a 2-star ${name}`);
      if (c % 3) out.push(c % 3 > 1 ? `${name} ×${c % 3}` : name);
      return out;
    })
    .join(", ");
}

function NavBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-11 w-11 place-items-center rounded-lg text-[18px] leading-none text-[var(--muted)] transition-colors hover:bg-[var(--panel-2)] hover:text-[var(--ink)] disabled:opacity-30 sm:h-8 sm:w-8"
    >
      {children}
    </button>
  );
}

function Stat({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: "hp" | "good" }) {
  return (
    <div className="min-w-0 border-b border-r border-[var(--line)] px-4 py-3.5 even:border-r-0 sm:px-5 lg:border-b-0 lg:px-3 lg:py-3 lg:even:border-r lg:last:border-r-0 [&:nth-child(n+3)]:border-b-0">
      <dt className="truncate text-[12px] text-[var(--muted)] lg:text-[11px]">{k}</dt>
      <dd className="tnum mt-0.5 flex items-baseline text-[20px] font-semibold tracking-tight">
        {tone && (
          <span className="mr-1 text-[10px]" style={{ color: tone === "hp" ? "var(--hp)" : "var(--good)" }} aria-label={tone === "hp" ? "below the lobby" : "above the lobby"}>
            {tone === "hp" ? "▼" : "▲"}
          </span>
        )}
        {v}
      </dd>
      {sub && <dd className="tnum truncate text-[12px] text-[var(--muted)] lg:text-[11px]">{sub}</dd>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-[13px] font-medium text-[var(--ink)]">{title}</h4>
      {children}
    </section>
  );
}

function Legend({ state, children }: { state: "bought" | "missed"; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2">
      <HighlightSwatch state={state} />
      {children}
    </span>
  );
}
