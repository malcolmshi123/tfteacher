"use client";

import { useEffect, useRef } from "react";
import type { SeriesPoint } from "@/lib/review/engine";

// Phone version of the timeline: an HP sparkline you can read at 390px, and a
// scrollable strip of rounds with real tap targets.
export function MobileRounds({
  series,
  selected,
  highlight,
  onSelect,
}: {
  series: SeriesPoint[];
  selected: string;
  highlight?: string[];
  onSelect: (stage: string) => void;
}) {
  const strip = useRef<HTMLDivElement>(null);
  const hl = new Set(highlight ?? []);
  const W = 340;
  const H = 76;
  const n = series.length;
  const x = (i: number) => 4 + ((W - 8) * i) / (n - 1);
  const after = (p: SeriesPoint) => Math.max(0, p.hp - p.damage);
  const y = (hp: number) => 6 + (H - 12) * (1 - hp / 100);
  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(after(p))}`).join(" ");
  const lobby = series.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.lobbyHp)}`).join(" ");
  const si = series.findIndex((p) => p.stage === selected);
  const hlIdx = series.map((p, i) => (hl.has(p.stage) ? i : -1)).filter((i) => i >= 0);

  useEffect(() => {
    const el = strip.current?.querySelector<HTMLElement>(`[data-stage="${selected}"]`);
    el?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
  }, [selected]);

  return (
    <div>
      <div className="flex items-baseline justify-between px-1 text-[12px] text-[var(--muted)]">
        <span>HP after combat</span>
        <span className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="block h-0.5 w-3 bg-[var(--hp)]" />
            You
          </span>
          <span className="flex items-center gap-1.5">
            <span className="block h-0 w-3 border-t border-dashed border-[var(--ink-2)]" />
            Lobby
          </span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="mt-2 block h-auto w-full" aria-hidden>
        {hlIdx.length > 0 && (
          <rect x={x(hlIdx[0]) - 3} y={0} width={x(hlIdx[hlIdx.length - 1]) - x(hlIdx[0]) + 6} height={H} rx={4} fill="var(--brand)" opacity={0.1} />
        )}
        <line x1={0} x2={W} y1={y(50)} y2={y(50)} stroke="var(--line)" strokeDasharray="2 4" />
        <path d={lobby} fill="none" stroke="var(--ink-2)" strokeOpacity={0.55} strokeWidth={1.25} strokeDasharray="3 3" />
        <path d={line} fill="none" stroke="var(--hp)" strokeWidth={2.25} strokeLinejoin="round" />
        {si >= 0 && (
          <>
            <line x1={x(si)} x2={x(si)} y1={0} y2={H} stroke="var(--ink)" strokeOpacity={0.35} />
            <circle cx={x(si)} cy={y(after(series[si]))} r={4} fill="var(--bg)" stroke="var(--hp)" strokeWidth={2} />
          </>
        )}
      </svg>

      <div ref={strip} className="-mx-3 mt-3 flex snap-x gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none]" role="list" aria-label="Rounds">
        {series.map((p) => {
          const sel = p.stage === selected;
          const bar =
            p.kind === "carousel" ? "transparent" : p.kind === "pve" ? "var(--line-2)" : p.outcome === "win" ? "var(--good)" : "var(--hp)";
          return (
            <button
              key={p.stage}
              data-stage={p.stage}
              role="listitem"
              onClick={() => onSelect(p.stage)}
              className={`flex h-[60px] w-12 shrink-0 snap-center flex-col items-center justify-between rounded-xl border py-2 ${
                sel ? "border-[var(--ink)] bg-[var(--panel-2)]" : hl.has(p.stage) ? "border-[color-mix(in_oklab,var(--brand)_40%,var(--line))] bg-[color-mix(in_oklab,var(--brand)_7%,var(--panel))]" : "border-[var(--line)] bg-[var(--panel)]"
              }`}
              aria-label={`Round ${p.stage}, ${after(p)} HP after`}
            >
              <span className={`tnum text-[12px] ${sel ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>{p.stage}</span>
              <span
                className="block h-1.5 w-6 rounded-full"
                style={{ background: bar, border: p.kind === "carousel" ? "1px dashed var(--ink-2)" : undefined }}
              />
              <span className="tnum text-[12px] text-[var(--muted)]">{after(p)}</span>
            </button>
          );
        })}
      </div>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[12px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--good)]" />Won</span>
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--hp)]" />Lost</span>
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--line-2)]" />Monsters</span>
        <span>Tap a round to open it</span>
      </p>
    </div>
  );
}
