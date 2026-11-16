import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { allGames } from "@/lib/game/games";
import { MY_COMPS } from "@/lib/patch/radar";
import { analyze, ordinal } from "@/lib/review/engine";

export const metadata = { title: "Reviews · TFTeacher" };

// same severity colors as the review page
const sev = (s: string) => (s === "high" ? "var(--hp)" : s === "medium" ? "var(--gold)" : "var(--ink-2)");

const COMP_NAME = Object.fromEntries(MY_COMPS.map((c) => [c.id, c.name]));

export default function ReviewsPage() {
  const rows = allGames().map(({ game, comp }) => {
    const review = analyze(game);
    const top = review.findings.find((f) => !f.positive) ?? review.findings[0];
    return { game, comp, top, board: game.rounds[game.rounds.length - 1].board };
  });
  const n = rows.length;
  const avg = rows.reduce((a, r) => a + r.game.placement, 0) / n;
  const top4 = rows.filter((r) => r.game.placement <= 4).length;
  const patch = rows[0]?.game.patch;

  return (
    <>
      <SiteNav active="/reviews" />
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 md:px-6 md:pt-10">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[640px]">
            <h1 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[36px]">Reviews</h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              Every game you play with the app open shows up here when it ends. Open one to see what cost you placements,
              round by round. This list shows patch 18.5; the 19 games on 18.4 are the ones Patch Radar read. This sample account is on Pro, so every game gets a full review.
            </p>
          </div>
          <dl className="tnum grid grid-cols-3 gap-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-[13px]">
            <div>
              <dt className="text-[var(--muted)]">{patch}</dt>
              <dd className="mt-0.5 text-[18px] font-semibold">{n} games</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Avg place</dt>
              <dd className="mt-0.5 text-[18px] font-semibold">{avg.toFixed(1)}</dd>
            </div>
            <div>
              <dt className="text-[var(--muted)]">Top 4</dt>
              <dd className="mt-0.5 text-[18px] font-semibold">
                {top4} of {n}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 hidden grid-cols-[56px_220px_320px_minmax(0,1fr)_16px] gap-6 px-5 pb-2 text-[12px] text-[var(--muted)] md:grid">
          <span>Place</span>
          <span>Comp</span>
          <span>Final board</span>
          <span>Costliest mistake</span>
          <span />
        </div>
        <ul className="space-y-3 md:mt-0 mt-8">
          {rows.map(({ game, comp, top, board }) => {
            const good = game.placement <= 4;
            const color = good ? "var(--good)" : "var(--hp)";
            const when = new Date(game.playedAt);
            return (
              <li key={game.id}>
                <Link
                  href={`/review/${game.id}`}
                  className="group grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--line-2)] hover:bg-[var(--panel-2)] md:grid-cols-[56px_220px_320px_minmax(0,1fr)_16px] md:items-center md:gap-6 md:p-5"
                >
                  <span
                    className="tnum flex h-12 w-12 items-center justify-center rounded-xl font-semibold md:h-14 md:w-14"
                    style={{ background: `color-mix(in oklab, ${color} 16%, var(--panel-2))`, color }}
                  >
                    <span className="text-[22px] leading-none">{game.placement}</span>
                    <span className="ml-[2px] self-start pt-[11px] text-[11px] leading-none md:pt-[14px]">{ordinal(game.placement).slice(String(game.placement).length)}</span>
                  </span>
                  <div className="min-w-0">
                    <div className="truncate text-[16px] font-semibold">{COMP_NAME[comp]}</div>
                    <div className="tnum mt-1 text-[13px] text-[var(--muted)]">
                      {when.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })} · {game.durationMin} min ·{" "}
                      {game.rounds[game.rounds.length - 1].stage}
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-1.5 pt-1 md:col-span-1 md:pt-0">
                    {board.map((p, i) => (
                      <UnitToken key={i} piece={{ ...p, items: [] }} size={30} showName={false} />
                    ))}
                  </div>
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <div className="text-[14px] leading-snug text-[var(--ink)]">{top.title}</div>
                    {top.cost && (
                      <span
                        className="tnum mt-1.5 inline-block rounded-full px-2 py-0.5 text-[12px]"
                        style={{ background: `color-mix(in oklab, ${sev(top.severity)} 13%, transparent)`, color: sev(top.severity) }}
                      >
                        {top.cost}
                      </span>
                    )}
                  </div>
                  <span aria-hidden className="hidden text-[18px] text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ink)] md:block">
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </>
  );
}
