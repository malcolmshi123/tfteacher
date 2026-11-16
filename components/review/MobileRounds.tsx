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
  const H = 156;
  const L = 26; // room for HP labels
  const GH = 48;
  const maxGold = Math.max(60, ...series.map((p) => p.gold));
  const n = series.length;
  const x = (i: number) => L + ((W - L - 14) * i) / (n - 1);
  const after = (p: SeriesPoint) => Math.max(0, p.hp - p.damage);
  const y = (hp: number) => 6 + (H - 12) * (1 - hp / 100);
  const line = series.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(after(p))}`).join(" ");
  const lobby = series.filter((p) => p.lobbyAlive >= 4).map((p, i) => `${i ? "L" : "M"}${x(series.indexOf(p))},${y(p.lobbyHp)}`).join(" ");
  const si = series.findIndex((p) => p.stage === selected);
  const hlIdx = series.map((p, i) => (hl.has(p.stage) ? i : -1)).filter((i) => i >= 0);

  useEffect(() => {
    // scroll only the strip sideways; never move the page
    const box = strip.current;
    const el = box?.querySelector<HTMLElement>(`[data-stage="${selected}"]`);
    // put the selected round third from the left, on a chip boundary
    if (box && el) box.scrollTo({ left: Math.max(0, el.offsetLeft - box.offsetLeft - 2 * (el.clientWidth + 6) - 12), behavior: "smooth" });
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
            Lobby median
          </span>
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H + 10 + GH + 18}`} className="mt-2 block h-auto w-full" aria-hidden>
        {hlIdx.length > 0 && (
          <rect x={x(hlIdx[0]) - 3} y={0} width={x(hlIdx[hlIdx.length - 1]) - x(hlIdx[0]) + 6} height={H} rx={4} fill="var(--brand)" opacity={0.16} />
        )}
        {[0, 50, 100].map((v) => (
          <g key={v}>
            <line x1={L} x2={W} y1={y(v)} y2={y(v)} stroke="var(--line)" strokeDasharray={v ? "2 4" : undefined} />
            <text x={L - 6} y={y(v) + 4} textAnchor="end" fontSize="12" fill="var(--ink-2)" className="tnum">{v}</text>
          </g>
        ))}
        <path d={lobby} fill="none" stroke="var(--ink-2)" strokeOpacity={0.55} strokeWidth={1.25} strokeDasharray="3 3" />
        <path d={line} fill="none" stroke="var(--hp)" strokeWidth={2.25} strokeLinejoin="round" />
        {series.map((p, i) =>
          p.stage.endsWith("-1") && p.stage !== "1-1" ? (
            <text key={`t${i}`} x={x(i)} y={H + 10 + GH + 14} textAnchor="middle" fontSize="12" fill={p.stage === selected ? "var(--ink)" : "var(--ink-2)"} className="tnum">
              {p.stage}
            </text>
          ) : null,
        )}
        {series.map((p, i) => {
          // solid: gold taken into combat; dashed cap: gold spent that round
          const held = (p.goldEnd / maxGold) * GH;
          const start = (p.gold / maxGold) * GH;
          const base = H + 10 + GH;
          const on = i === si ? 1 : 0.5;
          return (
            <g key={i}>
              {start > held && (
                <rect x={x(i) - 3.5} y={base - start + 0.5} width={7} height={start - held - 1} rx={1.5} fill="var(--gold)" fillOpacity={0.12 * on + 0.04} stroke="var(--gold)" strokeOpacity={0.5 * on + 0.1} strokeDasharray="2 2" />
              )}
              <rect x={x(i) - 4} y={base - held} width={8} height={held} rx={1.5} fill="var(--gold)" opacity={on} />
            </g>
          );
        })}
        {si >= 0 && (
          <>
            <line x1={x(si)} x2={x(si)} y1={0} y2={H + 10 + GH} stroke="var(--ink)" strokeOpacity={0.35} />
            <circle cx={x(si)} cy={y(after(series[si]))} r={4} fill="var(--bg)" stroke="var(--hp)" strokeWidth={2} />
          </>
        )}
      </svg>

      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 px-1 text-[12px] text-[var(--muted)]">
        <span className="flex items-center gap-3">
          Gold into combat
          <span className="flex items-center gap-1.5"><span className="block h-2.5 w-2.5 rounded-[2px] bg-[var(--gold)]" />Held</span>
          <span className="flex items-center gap-1.5"><span className="block h-2.5 w-2.5 rounded-[2px] border border-dashed border-[var(--gold)] bg-[color-mix(in_oklab,var(--gold)_14%,transparent)]" />Spent</span>
        </span>
        {si >= 0 && <span className="tnum w-full text-[var(--gold)]">{series[si].goldEnd} of {series[si].gold} into combat at {selected}</span>}
      </div>
      <div className="relative">
      <div ref={strip} className="-mx-3 mt-3 flex snap-x snap-mandatory scroll-pl-3 gap-1.5 overflow-x-auto px-3 pb-1 [scrollbar-width:none]" role="list" aria-label="Rounds">
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
              className={`flex h-[60px] w-12 shrink-0 snap-start flex-col items-center justify-between rounded-xl border py-2 ${
                sel ? "border-[var(--ink)] bg-[var(--panel-2)]" : hl.has(p.stage) ? "border-[color-mix(in_oklab,var(--brand)_40%,var(--line))] bg-[color-mix(in_oklab,var(--brand)_7%,var(--panel))]" : "border-[var(--line)] bg-[var(--panel)]"
              }`}
              aria-label={`Round ${p.stage}, ${after(p)} HP after`}
            >
              <span className={`tnum text-[13px] ${sel ? "font-semibold text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>{p.stage}</span>
              <span
                className="block h-1.5 w-6 rounded-full"
                style={{ background: bar, border: p.kind === "carousel" ? "1px dashed var(--ink-2)" : undefined }}
              />
              <span className="tnum text-[13px] text-[var(--ink-2)]">{after(p)}</span>
            </button>
          );
        })}
      </div>
      <span className="pointer-events-none absolute inset-y-0 -left-3 w-6 bg-gradient-to-r from-[var(--panel)] to-transparent" />
      <span className="pointer-events-none absolute inset-y-0 -right-3 w-6 bg-gradient-to-l from-[var(--panel)] to-transparent" />
      </div>
      <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 px-1 text-[13px] text-[var(--muted)]">
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--good)]" />Won</span>
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--hp)]" />Lost</span>
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full bg-[var(--line-2)]" />Monster round</span>
        <span className="flex items-center gap-1.5"><span className="block h-1.5 w-3 rounded-full border border-dashed border-[var(--ink-2)]" />Shared draft</span>
        <span className="w-full text-[var(--ink-2)]">Numbers on chips are HP after combat. Tap one to open it.</span>
      </p>
    </div>
  );
}
