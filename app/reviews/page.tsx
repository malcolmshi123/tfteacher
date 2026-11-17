import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { allGames } from "@/lib/game/games";
import { MY_COMPS } from "@/lib/patch/radar";
import { analyze } from "@/lib/review/engine";
import { PlaceBadge } from "@/components/PlaceBadge";
import { SetSelect } from "@/components/SetSelect";

export const metadata = { title: "Reviews · TFTeacher" };


const COMP_NAME = Object.fromEntries(MY_COMPS.map((c) => [c.id, c.name]));
const patchNo = (patch: string) => patch.replace(/^Patch\s*/, "");
const setOf = (patch: string) => `Set ${patchNo(patch).split(".")[0]}`;
// newest patch first: compare 18.10 above 18.9
const byPatchDesc = (a: string, b: string) => {
  const [am, an] = patchNo(a).split(".").map(Number);
  const [bm, bn] = patchNo(b).split(".").map(Number);
  return bm - am || bn - an;
};

export default async function ReviewsPage({ searchParams }: { searchParams: Promise<{ comp?: string; set?: string }> }) {
  const { comp: only, set: setParam } = await searchParams;
  const everything = allGames();
  const sets = [...new Set(everything.map((g) => setOf(g.game.patch)))].sort((a, b) => Number(b.split(" ")[1]) - Number(a.split(" ")[1]));
  const set = sets.includes(setParam ?? "") ? setParam! : sets[0];
  const all = everything.filter((g) => setOf(g.game.patch) === set).map(({ game, comp }) => {
    const review = analyze(game);
    const top = review.findings.find((f) => !f.positive) ?? review.findings[0];
    return { game, comp, top, board: game.rounds[game.rounds.length - 1].board };
  });
  const filter = MY_COMPS.some((c) => c.id === only) ? only : undefined;
  const rows = filter ? all.filter((r) => r.comp === filter) : all;
  const n = rows.length;
  // placement over time, oldest first, for the trend line
  const avg = rows.reduce((a, r) => a + r.game.placement, 0) / n;
  const top4 = rows.filter((r) => r.game.placement <= 4).length;
  const patches = [...new Set(rows.map((r) => r.game.patch))].sort(byPatchDesc);

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
            <div className="mt-4">
              <SetSelect sets={sets} value={set} />
            </div>
          </div>
          <dl className="tnum grid grid-cols-[auto_auto_auto] items-end gap-6 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4 text-[13px]">
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
                  href={c.id ? `/reviews?set=${encodeURIComponent(set)}&comp=${c.id}` : `/reviews?set=${encodeURIComponent(set)}`}
                  aria-current={on ? "page" : undefined}
                  className={`tnum rounded-full border px-3 py-1.5 text-[13px] transition-colors ${on ? "border-[var(--ink-2)] bg-[var(--panel-2)] text-[var(--ink)]" : "border-[var(--line)] text-[var(--ink-2)] hover:border-[var(--line-2)]"}`}
                >
                  {c.name} <span className="text-[var(--muted)]">{c.count}</span>
                </Link>
              );
            })}
        </nav>
        {patches.map((pt) => {
          const inPatch = rows.filter((r) => r.game.patch === pt);
          return (
        <section key={pt} aria-label={pt} className="mt-8">
        <h2 className="tnum mb-3 flex items-baseline gap-2 px-1 text-[15px] font-semibold md:px-5">
          {pt}
          <span className="text-[13px] font-normal text-[var(--muted)]">
            {inPatch.length} game{inPatch.length === 1 ? "" : "s"}
          </span>
        </h2>
        <div className="hidden grid-cols-[56px_200px_374px_minmax(0,1fr)_16px] gap-6 px-5 pb-2 pt-1 text-[12px] text-[var(--ink-2)] md:grid">
          <span>Place</span>
          <span>Comp</span>
          <span>Final board</span>
          <span>Biggest mistake</span>
          <span />
        </div>
        <ul className="space-y-3">
          {inPatch.map(({ game, comp, top, board }) => {
            const when = new Date(game.playedAt);
            return (
              <li key={game.id}>
                <Link
                  href={`/review/${game.id}`}
                  className="group grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-4 gap-y-3 rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4 transition-colors hover:border-[var(--line-2)] hover:bg-[var(--panel-2)] md:grid-cols-[56px_200px_374px_minmax(0,1fr)_16px] md:items-center md:gap-6 md:px-5 md:py-4"
                >
                  <PlaceBadge place={game.placement} size="lg" />
                  <div className="min-w-0">
                    <div className="truncate text-[16px] font-semibold" title={COMP_NAME[comp]}>{COMP_NAME[comp]}</div>
                    <div className="tnum mt-1 text-[13px] text-[var(--muted)]">
                      {when.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" })} · {game.durationMin} min ·{" "}
                      {game.rounds[game.rounds.length - 1].stage}
                    </div>
                  </div>
                  <div className="col-span-2 flex flex-wrap gap-x-1.5 gap-y-3 pt-1 md:col-span-1 md:pt-0">
                    {board.map((p, i) => (
                      <UnitToken key={i} piece={p} size={32} showName={false} />
                    ))}
                  </div>
                  <div className="col-span-2 min-w-0 md:col-span-1">
                    <div className="truncate text-[14px] leading-snug text-[var(--ink)]" title={top.title}>{top.title}</div>
                  </div>
                  <span aria-hidden className="hidden text-[18px] text-[var(--muted)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--ink)] md:block">
                    ›
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
        </section>
          );
        })}
      </main>
      <SiteFooter />
    </>
  );
}

