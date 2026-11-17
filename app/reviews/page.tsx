import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { allGames } from "@/lib/game/games";
import { MY_COMPS } from "@/lib/patch/radar";
import { analyze, costTone, placeColor } from "@/lib/review/engine";

export const metadata = { title: "Reviews · TFTeacher" };


const COMP_NAME = Object.fromEntries(MY_COMPS.map((c) => [c.id, c.name]));

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ comp?: string }> }) {
  const { comp: only } = await searchParams;
  const all = allGames().map(({ game, comp }) => {
    const review = analyze(game);
    const top = review.findings.find((f) => !f.positive) ?? review.findings[0];
    return { game, comp, top, board: game.rounds[game.rounds.length - 1].board };
  });
  const filter = MY_COMPS.some((c) => c.id === only) ? only : undefined;
  const rows = filter ? all.filter((r) => r.comp === filter) : all;
  const n = rows.length;
  // placement over time, oldest first, for the trend line
  const trend = [...rows].reverse().map((r) => r.game.placement);
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
              Every game you play with the app open shows up here when it ends, with what cost you placements.
            </p>
            <p className="mt-1.5 text-[13px] text-[var(--muted)]">Showing {patch}. The 19 games on 18.4 are the ones Patch Radar read.</p>
          </div>
          <dl className="tnum grid grid-cols-[auto_auto_auto_120px] items-end gap-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-[13px]">
            <div>
              <dt className="text-[var(--muted)]">Games</dt>
              <dd className="mt-0.5 text-[18px] font-semibold">{n}</dd>
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
            <div>
              <dt className="text-[var(--muted)]" title="Oldest game on the left">Place trend</dt>
              <dd className="mt-1.5">
                <Trend places={trend} />
              </dd>
            </div>
          </dl>
        </div>

        <nav aria-label="Filter by comp" className="mt-8 flex flex-wrap gap-2">
          {[{ id: undefined as string | undefined, name: "All comps", count: all.length }, ...MY_COMPS.map((c) => ({ id: c.id as string | undefined, name: c.name, count: all.filter((r) => r.comp === c.id).length }))]
            .filter((c) => c.count > 0)
            .map((c) => {
              const on = c.id === filter;
              return (
                <Link
                  key={c.name}
                  href={c.id ? `/reviews?comp=${c.id}` : "/reviews"}
                  aria-current={on ? "page" : undefined}
                  className={`tnum rounded-full border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-[var(--ink-2)] bg-[var(--panel-2)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-2)]"}`}
                >
                  {c.name} <span className="text-[var(--muted)]">{c.count}</span>
                </Link>
              );
            })}
        </nav>
        <div className="mt-6 hidden grid-cols-[56px_220px_320px_minmax(0,1fr)_16px] gap-6 px-5 pb-2 text-[12px] text-[var(--ink-2)] md:grid">
          <span>Place</span>
          <span>Comp</span>
          <span>Final board</span>
          <span>Biggest mistake</span>
          <span />
        </div>
        <ul className="mt-4 space-y-3 md:mt-0">
          {rows.map(({ game, comp, top, board }) => {
            const color = placeColor(game.placement);
            const when = new Date(game.playedAt);
            return (
              <li key={game.id}>
                <Link
                  href={`/review/${game.id}`}
                  className="group grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--line-2)] hover:bg-[var(--panel-2)] md:grid-cols-[56px_220px_320px_minmax(0,1fr)_16px] md:items-center md:gap-6 md:px-5 md:py-4"
                >
                  <span
                    className="tnum flex h-12 w-12 items-center justify-center rounded-xl font-semibold md:h-14 md:w-14"
                    style={{ background: `color-mix(in oklab, ${color} 16%, var(--panel-2))`, color }}
                  >
                    <span className="text-[24px] leading-none">{game.placement}</span>
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
                      <UnitToken key={i} piece={p} size={30} showName={false} />
                    ))}
                  </div>
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <div className="text-[14px] leading-snug text-[var(--ink)]">{top.title}</div>
                    {top.cost && (
                      <span
                        className="tnum mt-1.5 inline-block rounded-full px-2 py-0.5 text-[12px]"
                        style={{ background: `color-mix(in oklab, ${costTone(top)} 13%, transparent)`, color: costTone(top) }}
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

// placement over time: 1st at the top, 8th at the bottom, top 4 in green
function Trend({ places }: { places: number[] }) {
  const W = 120;
  const H = 34;
  const x = (i: number) => (places.length < 2 ? W / 2 : 4 + ((W - 8) * i) / (places.length - 1));
  const y = (p: number) => 4 + ((H - 8) * (p - 1)) / 7;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-label={`Placements: ${places.join(", ")}`}>
      <line x1={0} x2={W} y1={y(4.5)} y2={y(4.5)} stroke="var(--line-2)" strokeDasharray="2 3" />
      <polyline points={places.map((p, i) => `${x(i)},${y(p)}`).join(" ")} fill="none" stroke="var(--ink-2)" strokeWidth={1.5} />
      {places.map((p, i) => (
        <circle key={i} cx={x(i)} cy={y(p)} r={3} fill={placeColor(p)} />
      ))}
    </svg>
  );
}
