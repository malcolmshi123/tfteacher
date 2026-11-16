"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ordinal, type Finding, type Review } from "@/lib/review/engine";
import { AskPanel } from "./AskPanel";
import { MobileRounds } from "./MobileRounds";
import { RoundInspector } from "./RoundInspector";
import { Timeline } from "./Timeline";

const SOURCE_LABEL = {
  recorder: "Recorded round by round by the desktop app",
  screen: "Read from your screen recording",
  "match-api": "Final board only (no recording)",
} as const;

// round numbers like 6-1 never split across lines
function keepRounds(s: string) {
  return s.replace(/(\d)-(\d)/g, "$1‑$2");
}

export function ReviewView({ review, initialRound }: { review: Review; initialRound?: string }) {
  const { game, findings, series } = review;
  const first = findings[0];
  const [active, setActive] = useState<string>(initialRound ? (findings.find((f) => f.stages.includes(initialRound))?.id ?? first.id) : first.id);
  const [round, setRound] = useState<string>(initialRound ?? first.focus);
  const activeFinding = useMemo(() => findings.find((f) => f.id === active), [findings, active]);

  const [sheet, setSheet] = useState(false);
  const isNarrow = () => typeof window !== "undefined" && window.matchMedia("(max-width: 1023px)").matches;
  useEffect(() => {
    if (!sheet) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setSheet(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheet]);

  const openRound = (stage: string) => {
    setRound(stage);
    if (isNarrow()) setSheet(true);
  };
  const pick = (f: Finding) => {
    setActive(f.id);
    setRound(f.focus);
  };

  const played = new Date(game.playedAt);

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-24 pt-6 md:px-6 md:pt-8" style={{ ["--place" as string]: game.placement <= 4 ? "var(--good)" : "var(--hp)" }}>
      <Link href="/reviews" className="mb-5 inline-flex items-center gap-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--ink)]">
        <span aria-hidden>‹</span> All reviews
      </Link>
      {/* header */}
      <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-[760px]">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] text-[var(--muted)]">
            <span className="tnum rounded-md bg-[color-mix(in_oklab,var(--place)_16%,var(--panel-2))] px-1.5 py-0.5 font-semibold text-[var(--place)] md:hidden">{ordinal(game.placement)} of 8</span>
            <span>{game.queue}</span>
            <Dot />
            <span>{game.patch}</span>
            <Dot />
            <span>{game.durationMin} min</span>
            <span className="hidden sm:block"><Dot /></span>
            <span className="hidden sm:inline">
              {played.toLocaleDateString("en-US", { month: "short", day: "numeric" })},{" "}
              {played.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
            </span>
          </div>
          <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance md:text-[36px]">
            <span className="md:hidden">{keepRounds(review.shortHeadline)}</span>
            <span className="hidden md:inline">{keepRounds(review.headline)}</span>
          </h1>
          <p className="mt-3 max-w-[640px] text-[15px] leading-relaxed text-[var(--ink-2)]">{keepRounds(review.summary)}</p>
        </div>
        <div className="hidden shrink-0 items-center gap-3 rounded-2xl border md:flex border-[var(--line)] bg-[var(--panel)] py-3 pl-3 pr-5">
          <span className="tnum flex h-14 w-14 items-center justify-center rounded-xl bg-[color-mix(in_oklab,var(--place)_16%,var(--panel-2))] font-semibold text-[var(--place)]">
            <span className="text-[24px] leading-none">{game.placement}</span>
            <span className="ml-[2px] self-start pt-[13px] text-[11px] leading-none">{ordinal(game.placement).slice(String(game.placement).length)}</span>
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
          <div className="hidden flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--muted)] md:flex">
            <Key color="var(--good)">Won fight</Key>
            <Key color="var(--hp)">Lost fight</Key>
            <Key color="var(--line-2)" solid>Monster round</Key>
            <Key color="transparent" dashed>Shared draft</Key>
            <Key color="var(--brand)" faint>
              Rounds in the selected finding
            </Key>
          </div>
        </div>
        <div className="hidden md:block">
          <Timeline series={series} selected={round} highlight={activeFinding?.stages} onSelect={openRound} />
        </div>
        <div className="px-1 md:hidden">
          <MobileRounds series={series} selected={round} highlight={activeFinding?.stages} onSelect={openRound} />
        </div>
      </section>

      {/* findings + inspector */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_460px]">
        <section>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-[15px] font-medium">What decided this game</h2>
            <span className="text-[12px] text-[var(--muted)]">
              {(() => {
                const bad = findings.filter((f) => !f.positive).length;
                const good = findings.length - bad;
                return `${bad} mistake${bad === 1 ? "" : "s"}, worst first${good ? ` · ${good} strength${good === 1 ? "" : "s"}` : ""}`;
              })()}
            </span>
          </div>
          <ol className="space-y-3">
            {findings.map((f, i) => (
              <FindingCard key={f.id} f={f} lead={i === 0} active={f.id === active} onClick={() => pick(f)} onCite={(s) => { setActive(f.id); openRound(s); }} />
            ))}
          </ol>
          <div className="mt-6">
            <AskPanel gameId={game.id} onCite={openRound} />
          </div>
        </section>
        <aside className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
          <RoundInspector game={game} stage={round} series={series} findings={findings} onPick={setRound} />
        </aside>
      </div>

      {/* phone: the round opens in a bottom sheet */}
      {sheet && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label={`Round ${round}`}>
          <button aria-label="Close" className="absolute inset-0 bg-black/80 backdrop-blur-[2px]" onClick={() => setSheet(false)} />
          <div className="absolute inset-x-0 bottom-0 max-h-[86dvh] overflow-y-auto rounded-t-2xl border-t border-[var(--line-2)] bg-[var(--panel)] pb-6 pt-2 shadow-[0_-20px_60px_rgba(0,0,0,0.6)]">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-[var(--panel)] px-4 pb-1 pt-1">
              <span className="w-9" />
              <span className="block h-1 w-10 rounded-full bg-[var(--ink-2)] opacity-40" aria-hidden />
              <button onClick={() => setSheet(false)} aria-label="Close round" className="grid h-9 w-9 place-items-center rounded-full bg-[var(--panel-2)] text-[var(--ink-2)]">
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden><path d="M3 3l8 8M11 3l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
              </button>
            </div>
            <RoundInspector game={game} stage={round} series={series} findings={findings} onPick={setRound} bare />
            <button onClick={() => setSheet(false)} className="mx-4 mt-3 w-[calc(100%-2rem)] rounded-xl border border-[var(--line-2)] py-3 text-[15px] font-medium">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function FindingCard({ f, active, lead, onClick, onCite, children }: { f: Finding; active: boolean; lead?: boolean; onClick: () => void; onCite: (stage: string) => void; children?: React.ReactNode }) {
  const quiet = !active && !lead;
  const tone = f.positive ? "var(--good)" : f.severity === "high" ? "var(--hp)" : f.severity === "medium" ? "var(--gold)" : "var(--muted)";
  const label = f.positive ? "Went well" : lead ? `Biggest cost · ${f.cost}` : f.cost ?? "Minor";
  return (
    <li
      className={`group cursor-pointer rounded-2xl border transition-colors ${lead ? "p-6" : quiet ? "px-5 py-4" : "p-5"} ${
        active ? "border-[var(--line-2)] bg-[var(--panel-2)]" : "border-[var(--line)] bg-[var(--panel)] hover:border-[var(--line-2)]"
      }`}
      style={lead ? { boxShadow: `inset 3px 0 0 ${tone}` } : undefined}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <span className="mt-[7px] hidden h-2 w-2 shrink-0 rounded-full sm:block" style={{ background: tone }} />
        <div className="min-w-0 flex-1">
          <div className={`flex items-start justify-between gap-x-3 gap-y-2 ${lead ? "flex-col-reverse sm:flex-row" : ""}`}>
            <h3 className={`${lead ? "text-[18px] sm:text-[20px]" : "text-[16px]"} font-semibold leading-snug tracking-tight`}>{f.title}</h3>
            <span className="tnum shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium" style={{ color: tone, background: `color-mix(in oklab, ${tone} 13%, transparent)` }}>
              {label}
            </span>
          </div>
          <p className={`mt-2 ${lead ? "text-[15px]" : "text-[14px]"} leading-relaxed text-[var(--ink-2)] ${quiet ? "hidden lg:block" : ""}`}>{f.detail}</p>
          {quiet && (
            <span className="mt-2 inline-flex items-center gap-1 text-[13px] text-[var(--muted)] group-hover:text-[var(--ink-2)]">
              {f.positive ? "Show rounds" : "Show rounds and fix"}
              <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
                <path d="M2.5 3.8 5 6.3l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          {!quiet && f.lines && (
            <ul className="tnum mt-3 space-y-1.5 text-[14px] leading-relaxed text-[var(--ink-2)]">
              {f.lines.map((l) => {
                const [stage, ...rest] = l.split(": ");
                return (
                  <li key={l}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCite(stage);
                      }}
                      className="flex w-full items-baseline gap-3 rounded-lg px-2 py-1 text-left transition-colors hover:bg-[var(--bg)]"
                    >
                      <span className="w-8 shrink-0 font-medium text-[var(--ink)]">{stage}</span>
                      <span>{rest.join(": ")}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
          {(active || lead) && (
            <p className="mt-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ink)]">
              <span className="font-medium text-[var(--brand)]">Next game: </span>
              {f.advice}
            </p>
          )}
          {!quiet && !f.lines && <div className="mt-3 flex flex-wrap gap-1.5">
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

function Key({ color, children, faint, solid, dashed }: { color: string; children: React.ReactNode; faint?: boolean; solid?: boolean; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`block h-2.5 w-2.5 rounded-[3px] ${dashed ? "border border-dashed border-[var(--ink-2)]" : ""} ${faint ? "border border-[color-mix(in_oklab,var(--brand)_55%,transparent)]" : ""}`}
        style={{ background: faint ? "color-mix(in oklab, var(--brand) 14%, transparent)" : color, opacity: solid || dashed || faint ? 1 : 0.85 }}
      />
      {children}
    </span>
  );
}
