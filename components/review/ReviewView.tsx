"use client";

import { useMemo, useState } from "react";
import type { Finding, Review } from "@/lib/review/engine";
import { RoundInspector } from "./RoundInspector";
import { Timeline } from "./Timeline";

const SOURCE_LABEL = {
  recorder: "Recorded round by round by the desktop app",
  screen: "Read from your screen recording",
  "match-api": "Final board only (no recording)",
} as const;

export function ReviewView({ review, initialRound }: { review: Review; initialRound?: string }) {
  const { game, findings, series } = review;
  const first = findings[0];
  const [active, setActive] = useState<string>(initialRound ? (findings.find((f) => f.stages.includes(initialRound))?.id ?? first.id) : first.id);
  const [round, setRound] = useState<string>(initialRound ?? first.focus);
  const activeFinding = useMemo(() => findings.find((f) => f.id === active), [findings, active]);

  const pick = (f: Finding) => {
    setActive(f.id);
    setRound(f.focus);
  };

  const played = new Date(game.playedAt);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 md:px-6 md:pt-10">
      {/* header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[760px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--muted)]">
            <span>{game.queue}</span>
            <Dot />
            <span>{game.patch}</span>
            <Dot />
            <span>{game.durationMin} min</span>
            <Dot />
            <span>
              {played.toLocaleDateString("en-US", { month: "short", day: "numeric" })},{" "}
              {played.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance md:text-[36px]">{review.headline}</h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-[var(--ink-2)]">{review.summary}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] py-3 pl-3 pr-5">
          <span className="tnum flex h-14 w-14 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--hp)_16%,var(--panel-2))] text-[24px] font-semibold text-[var(--hp)]">
            {game.placement}
            <span className="-ml-1 self-start pt-3 text-[12px] font-medium">th</span>
          </span>
          <div>
            <div className="text-[13px] text-[var(--ink-2)]">of 8 players</div>
            <div className="mt-0.5 max-w-[190px] text-[12px] leading-snug text-[var(--muted)]">{SOURCE_LABEL[game.source]}</div>
          </div>
        </div>
      </div>

      {/* stats */}
      <dl className="mt-8 grid grid-cols-2 overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] md:grid-cols-4">
        {review.stats.map((s, i) => (
          <div key={s.label} className={`px-5 py-4 ${i % 2 ? "" : "border-r"} border-[var(--line)] md:border-r ${i === 3 ? "md:border-r-0" : ""} ${i < 2 ? "border-b md:border-b-0" : ""}`}>
            <dt className="text-[12px] text-[var(--muted)]">{s.label}</dt>
            <dd className="tnum mt-1 text-[26px] font-semibold tracking-tight">{s.value}</dd>
            {s.note && <dd className="tnum text-[12px] text-[var(--muted)]">{s.note}</dd>}
          </div>
        ))}
      </dl>

      {/* timeline */}
      <section className="mt-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-3 pb-3 pt-4 md:px-5">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2 md:px-0">
          <h2 className="text-[15px] font-medium">Every round</h2>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)]">
            <Key color="var(--good)">Won fight</Key>
            <Key color="var(--hp)">Lost fight</Key>
            <Key color="var(--line-2)" solid>Monster round</Key>
            <Key color="var(--brand)" faint>
              Rounds in the selected finding
            </Key>
          </div>
        </div>
        <div className="-mx-1 overflow-x-auto md:mx-0">
          <div className="min-w-[900px] md:min-w-0">
            <Timeline series={series} selected={round} highlight={activeFinding?.stages} onSelect={setRound} />
          </div>
        </div>
      </section>

      {/* findings + inspector */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">What decided this game</h2>
            <span className="text-[12px] text-[var(--muted)]">{findings.filter((f) => !f.positive).length} findings, most costly first</span>
          </div>
          <ol className="space-y-3">
            {findings.map((f, i) => (
              <FindingCard key={f.id} f={f} lead={i === 0} active={f.id === active} onClick={() => pick(f)} onCite={(s) => { setActive(f.id); setRound(s); }}>
                <div className="mt-4 lg:hidden" onClick={(e) => e.stopPropagation()}>
                  <RoundInspector game={game} stage={round} series={series} findings={findings} onPick={setRound} />
                </div>
              </FindingCard>
            ))}
          </ol>
        </section>
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <RoundInspector game={game} stage={round} series={series} findings={findings} onPick={setRound} />
        </aside>
      </div>
    </div>
  );
}

function FindingCard({ f, active, lead, onClick, onCite, children }: { f: Finding; active: boolean; lead?: boolean; onClick: () => void; onCite: (stage: string) => void; children?: React.ReactNode }) {
  const quiet = (f.positive || f.severity === "low") && !active;
  const tone = f.positive ? "var(--good)" : f.severity === "high" ? "var(--hp)" : f.severity === "medium" ? "var(--gold)" : "var(--muted)";
  const label = f.positive ? "Went well" : f.severity === "high" ? "Cost you most" : f.severity === "medium" ? "Cost you some" : "Minor";
  return (
    <li
      className={`group cursor-pointer rounded-2xl border transition-colors ${lead ? "p-6" : quiet ? "px-5 py-4" : "p-5"} ${
        active ? "border-[var(--line-2)] bg-[var(--panel-2)]" : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--line-2)]"
      }`}
      style={lead ? { boxShadow: `inset 3px 0 0 ${tone}` } : undefined}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="mt-[7px] block h-2 w-2 shrink-0 rounded-full" style={{ background: tone }} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h3 className={`${lead ? "text-[20px]" : "text-[16px]"} font-semibold leading-snug tracking-tight`}>{f.title}</h3>
            <span className="text-[12px]" style={{ color: tone }}>
              {label}
            </span>
          </div>
          {!quiet && <p className={`mt-2 ${lead ? "text-[15px]" : "text-[14px]"} leading-relaxed text-[var(--ink-2)]`}>{f.detail}</p>}
          {!quiet && f.lines && (
            <ul className="tnum mt-2 space-y-1 text-[14px] leading-relaxed text-[var(--ink-2)]">
              {f.lines.map((l) => (
                <li key={l} className="flex gap-2">
                  <span className="mt-[10px] block h-px w-2.5 shrink-0 bg-[var(--line-2)]" />
                  {l}
                </li>
              ))}
            </ul>
          )}
          {(active || lead) && (
            <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ink)]">
              <span className="font-medium text-[var(--brand)]">Next game: </span>
              {f.advice}
            </p>
          )}
          {!quiet && <div className="mt-3 flex flex-wrap gap-1.5">
            {f.cites.map((c, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  onCite(c.stage);
                }}
                className="tnum inline-flex items-center gap-1.5 rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-1 text-[12px] text-[var(--ink-2)] transition-colors hover:border-[var(--line-2)] hover:text-[var(--ink)]"
              >
                <span className="font-medium text-[var(--ink)]">{c.stage}</span>
                {c.label}
              </button>
            ))}
          </div>}
        </div>
      </div>
      {active && children}
    </li>
  );
}

function Dot() {
  return <span className="block h-[3px] w-[3px] rounded-full bg-[var(--line-2)]" />;
}

function Key({ color, children, faint, solid }: { color: string; children: React.ReactNode; faint?: boolean; solid?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="block h-2.5 w-2.5 rounded-[3px]" style={{ background: color, opacity: faint ? 0.35 : solid ? 1 : 0.85 }} />
      {children}
    </span>
  );
}
