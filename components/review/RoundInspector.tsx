"use client";

import { ItemChip, UnitToken } from "@/components/UnitToken";
import { UNIT_BY_ID, copiesOf } from "@/lib/game/set";
import type { GameRecord } from "@/lib/game/types";
import type { Finding, SeriesPoint } from "@/lib/review/engine";

function owned(pieces: { unit: string; star: number }[]) {
  const o: Record<string, number> = {};
  for (const p of pieces) o[p.unit] = (o[p.unit] ?? 0) + copiesOf(p.star);
  return o;
}

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
  const prevOwned = prev ? owned([...prev.board, ...prev.bench]) : {};
  const here = findings.filter((f) => f.stages.includes(stage));
  // mark exactly as many shop slots "bought" as copies were bought, first seen first
  const toMark: Record<string, number> = {};
  for (const u of r.bought) toMark[u] = (toMark[u] ?? 0) + 1;
  const boughtSlot = r.shops.map((shop) =>
    shop.map((u) => {
      if ((toMark[u] ?? 0) > 0) {
        toMark[u]--;
        return true;
      }
      return false;
    }),
  );

  const prevPt = series[idx - 1];
  const takeaway =
    r.bought.length >= 5
      ? `Rolldown: ${r.rerolls} rerolls and ${r.bought.length} units bought took your board from ${prevPt?.boardValue ?? 0} to ${pt.boardValue}.`
      : r.kind === "pvp" && r.outcome === "loss" && r.hp <= 40 && r.goldEnd >= 20
        ? `Lost at ${r.hp} HP while holding ${r.goldEnd} gold.`
        : r.xpBought >= 3
          ? `Spent ${r.xpBought * 4} gold on XP${r.level < pt.lobbyLevel ? ", still a level behind the lobby" : ""}.`
          : here.find((f) => !f.positive)?.title;

  const result =
    r.kind === "carousel"
      ? "Shared draft"
      : r.kind === "pve"
        ? "Monster round"
        : r.outcome === "win"
          ? `Won vs ${r.opponent}`
          : `Lost to ${r.opponent}, took ${r.damageTaken}`;

  return (
    <div className={bare ? "" : "rounded-2xl border border-[var(--line)] bg-[var(--panel)]"}>
      <div className="flex items-center justify-between gap-4 border-b border-[var(--line)] px-4 py-4 sm:px-5">
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

      <dl className="grid grid-cols-2 border-b border-[var(--line)] sm:grid-cols-4">
        <Stat k="HP entering" v={`${r.hp}`} sub={`lobby ${pt.lobbyHpEntering}`} tone={r.hp < pt.lobbyHpEntering ? "hp" : undefined} />
        <Stat k="Gold" v={`${r.gold}`} sub={`${r.goldEnd} at fight`} />
        <Stat k="Level" v={`${r.level}`} sub={`lobby ${pt.lobbyLevel}`} tone={r.level < pt.lobbyLevel ? "hp" : r.level > pt.lobbyLevel ? "good" : undefined} />
        <Stat k="Board" v={`${pt.boardValue}`} sub={`lobby ${pt.lobbyBoardValue}`} tone={pt.boardValue < pt.lobbyBoardValue ? "hp" : "good"} />
      </dl>
      <p className="flex gap-4 border-b border-[var(--line)] px-4 py-2 text-[12px] text-[var(--muted)] sm:px-5">
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-1.5 rounded-full bg-[var(--hp)]" />Behind the lobby</span>
        {(pt.boardValue > pt.lobbyBoardValue || r.level > pt.lobbyLevel) && (
          <span className="flex items-center gap-1.5"><span className="block h-1.5 w-1.5 rounded-full bg-[var(--good)]" />Ahead of it</span>
        )}
      </p>

      <div className="space-y-5 px-4 py-5 sm:px-5">
        <Section title="Board when combat started">
          <div className="flex flex-wrap gap-x-1 gap-y-4 pt-3">
            {r.board.map((p, i) => (
              <UnitToken key={i} piece={p} size={bare ? 34 : 38} />
            ))}
          </div>
        </Section>

        {(r.bought.length > 0 || r.sold.length > 0 || r.xpBought > 0) && (
          <p className="text-[13px] leading-relaxed text-[var(--ink-2)]">
            {[
              r.bought.length ? `Bought ${summarize(r.bought)} for ${r.bought.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0)} gold${r.bought.length > 1 ? " total" : ""}` : "",
              r.sold.length ? `sold ${summarize(r.sold)} (+${r.sold.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0)} gold)` : "",
              r.xpBought ? `bought XP ${r.xpBought}× (${r.xpBought * 4} gold)` : "",
              r.rerolls ? `rerolled ${r.rerolls}× (${r.rerolls * 2} gold)` : "",
            ]
              .filter(Boolean)
              .join(", ")
              .replace(/^./, (c) => c.toUpperCase())}
            .
          </p>
        )}

        {(r.bench.length > 0 || r.itemBench.length > 0) && (
          <Section title="Bench">
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {r.bench.map((p, i) => (
                <UnitToken key={i} piece={p} size={36} showName={false} />
              ))}
              {r.itemBench.map((it) => (
                <ItemChip key={it} id={it} />
              ))}
            </div>
          </Section>
        )}

        {here.length > 0 && (
          <Section title="Findings at this round">
            <ul className="space-y-1.5 pt-1">
              {here.map((f) => (
                <li key={f.id} className="flex items-start gap-2 text-[13px] leading-snug text-[var(--ink-2)]">
                  <span className="mt-[6px] block h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: f.positive ? "var(--good)" : f.severity === "high" ? "var(--hp)" : "var(--gold)" }} />
                  {f.title}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {r.kind !== "carousel" && r.shops.length > 0 && (
          <Section title={`Shops seen · ${r.rerolls} reroll${r.rerolls === 1 ? "" : "s"}${r.xpBought ? ` · bought XP ${r.xpBought}×` : ""}`}>
            <div className="space-y-2 pt-1">
              {r.shops.map((shop, si) => (
                <div key={si} className="flex items-center gap-3">
                  <span className="tnum w-12 shrink-0 text-[11px] text-[var(--muted)]">{si === 0 ? "Free" : `Roll ${si}`}</span>
                  <div className="flex gap-2">
                    {shop.map((u, k) => {
                      const missed = (prevOwned[u] ?? 0) % 3 === 2 && !r.bought.includes(u);
                      const bought = boughtSlot[si][k];
                      return <UnitToken key={k} unitId={u} size={34} showName={false} state={missed ? "missed" : bought ? "bought" : "normal"} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
              {r.bought.length > 0 && <Legend color="var(--ink)">Bought</Legend>}
              {r.shops.some((shop) => shop.some((u) => (prevOwned[u] ?? 0) % 3 === 2 && !r.bought.includes(u))) && (
                <Legend color="var(--hp)">Would have made a 2-star</Legend>
              )}
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

function NavBtn({ children, onClick, disabled, label }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; label: string }) {
  return (
    <button
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-lg border border-[var(--line)] text-[18px] leading-none text-[var(--ink-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--ink)] disabled:opacity-30"
    >
      {children}
    </button>
  );
}

function Stat({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: "hp" | "good" }) {
  return (
    <div className="border-b border-r border-[var(--line)] px-4 py-3.5 even:border-r-0 sm:border-b-0 sm:px-5 sm:even:border-r sm:last:border-r-0 [&:nth-child(n+3)]:border-b-0">
      <dt className="text-[12px] text-[var(--muted)]">{k}</dt>
      <dd className="tnum mt-0.5 text-[20px] font-semibold tracking-tight" style={{ color: tone === "hp" ? "var(--hp)" : tone === "good" ? "var(--good)" : undefined }}>
        {v}
      </dd>
      {sub && <dd className="tnum text-[12px] text-[var(--muted)]">{sub}</dd>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h4 className="text-[12px] font-medium text-[var(--muted)]">{title}</h4>
      {children}
    </section>
  );
}

function Legend({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {children}
    </span>
  );
}
