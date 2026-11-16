"use client";

import { ItemChip, UnitToken } from "@/components/UnitToken";
import { copiesOf } from "@/lib/game/set";
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
}: {
  game: GameRecord;
  stage: string;
  series: SeriesPoint[];
  findings: Finding[];
  onPick: (id: string) => void;
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

  const result =
    r.kind === "carousel"
      ? "Shared draft"
      : r.kind === "pve"
        ? "Monster round"
        : r.outcome === "win"
          ? `Won vs ${r.opponent}`
          : `Lost to ${r.opponent}, took ${r.damageTaken}`;

  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="flex items-baseline justify-between gap-4 border-b border-[var(--line)] px-5 py-4">
        <div className="flex items-baseline gap-3">
          <h3 className="tnum text-[22px] font-semibold tracking-tight">Round {r.stage}</h3>
          <span className={`text-[13px] ${r.outcome === "loss" ? "text-[var(--hp)]" : r.outcome === "win" ? "text-[var(--good)]" : "text-[var(--muted)]"}`}>
            {result}
          </span>
        </div>
        <div className="flex gap-1">
          <NavBtn disabled={!prev} onClick={() => prev && onPick(prev.stage)} label="Previous round">‹</NavBtn>
          <NavBtn disabled={idx >= game.rounds.length - 1} onClick={() => game.rounds[idx + 1] && onPick(game.rounds[idx + 1].stage)} label="Next round">›</NavBtn>
        </div>
      </div>

      <dl className="grid grid-cols-4 border-b border-[var(--line)]">
        <Stat k="HP" v={`${r.hp}`} sub={r.damageTaken ? `→ ${r.hp - r.damageTaken}` : `lobby ${pt.lobbyHp}`} tone={r.hp <= 40 ? "hp" : undefined} />
        <Stat k="Gold" v={`${r.gold}`} sub={`→ ${r.goldEnd} into combat`} tone={r.goldEnd >= 20 && r.hp <= 40 ? "gold" : undefined} />
        <Stat k="Level" v={`${r.level}`} sub={`lobby ${pt.lobbyLevel}`} tone={r.level < pt.lobbyLevel ? "hp" : undefined} />
        <Stat k="Board" v={`${pt.boardValue}`} sub={`lobby ${pt.lobbyBoardValue}`} tone={pt.boardValue < pt.lobbyBoardValue ? "hp" : undefined} />
      </dl>

      <div className="space-y-5 px-5 py-5">
        <Section title="Board when combat started">
          <div className="flex flex-wrap gap-x-2 gap-y-3 pt-2">
            {r.board.map((p, i) => (
              <UnitToken key={i} piece={p} size={40} />
            ))}
          </div>
        </Section>

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

        {r.kind !== "carousel" && r.shops.length > 0 && (
          <Section title={`Shops seen · ${r.rerolls} reroll${r.rerolls === 1 ? "" : "s"}${r.xpBought ? ` · bought XP ${r.xpBought}×` : ""}`}>
            <div className="space-y-2 pt-1">
              {r.shops.map((shop, si) => (
                <div key={si} className="flex items-center gap-3">
                  <span className="tnum w-12 shrink-0 text-[11px] text-[var(--muted)]">{si === 0 ? "Free" : `Roll ${si}`}</span>
                  <div className="flex gap-1.5">
                    {shop.map((u, k) => {
                      const missed = (prevOwned[u] ?? 0) % 3 === 2 && !r.bought.includes(u);
                      const bought = boughtSlot[si][k];
                      return <UnitToken key={k} unitId={u} size={30} showName={false} state={missed ? "missed" : bought ? "bought" : "normal"} />;
                    })}
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
              <Legend color="var(--good)">bought</Legend>
              <Legend color="var(--hp)">would have made a 2-star</Legend>
            </p>
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
      </div>
    </div>
  );
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

function Stat({ k, v, sub, tone }: { k: string; v: string; sub?: string; tone?: "hp" | "gold" }) {
  return (
    <div className="border-r border-[var(--line)] px-5 py-3.5 last:border-r-0">
      <dt className="text-[12px] text-[var(--muted)]">{k}</dt>
      <dd className="tnum mt-0.5 text-[20px] font-semibold tracking-tight" style={{ color: tone === "hp" ? "var(--hp)" : tone === "gold" ? "var(--gold)" : undefined }}>
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
      <span className="block h-2.5 w-2.5 rounded-[3px] border-2" style={{ borderColor: color }} />
      {children}
    </span>
  );
}
