import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { allGames } from "@/lib/game/games";
import { UNIT_BY_ID } from "@/lib/game/set";
import { NOTES, PATCH, PATCH_SUMMARY, changePct, radar, type CompVerdict, type NoteLine, type PatchPick } from "@/lib/patch/radar";

export const metadata = { title: "Patch Radar · TFTeacher" };

const TONE = {
  stronger: { color: "var(--good)", label: "Buffed" },
  weaker: { color: "var(--hp)", label: "Nerfed" },
  mixed: { color: "var(--gold)", label: "Mixed" },
  unchanged: { color: "var(--muted)", label: "Unchanged" },
} as const;

export default function PatchPage() {
  const verdicts = radar();
  // lines that touch two or more of your comps are shown once, above the cards
  const touches = (id: string) => verdicts.filter((v) => v.lines.some((l) => l.id === id)).map((v) => v.comp.name);
  const shared = NOTES.filter((n) => touches(n.id).length >= 2);
  const sharedIds = new Set(shared.map((n) => n.id));
  const games = verdicts.reduce((a, v) => a + v.comp.games, 0);
  // headline from the verdicts: most played comp first, then the rest
  const [main, ...others] = verdicts;
  const word = (x: CompVerdict) => (x.verdict === "weaker" ? "nerfed" : x.verdict === "stronger" ? "buffed" : x.verdict === "mixed" ? "mixed" : "unchanged");
  const same = others.every((o) => word(o) === word(others[0]));
  const net = (x: CompVerdict) => (x.verdict === "weaker" ? "came out weaker" : x.verdict === "stronger" ? "came out stronger" : x.verdict === "mixed" ? "came out about even" : "didn't change");
  const headline = `Your most played comp got ${word(main)}.${others.length ? (same ? ` Your other ${others.length === 2 ? "two" : others.length} ${net(others[0])} overall.` : "") : ""}`;

  return (
    <>
      <SiteNav active="/patch" />
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 md:px-6 md:pt-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-start">
          <div className="max-w-[720px]">
            <p className="text-[13px] text-[var(--muted)]">
              Patch {PATCH.from} to {PATCH.to} · live {PATCH.date}
            </p>
            <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance md:text-[36px]">
              {headline}
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              Your {PATCH.from} comps checked against the {PATCH.to} notes. Augments and items aren&apos;t included.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="flex items-center justify-between text-[12px] text-[var(--muted)]">
              <span>Based on</span>
              <span className="rounded-full bg-[var(--panel-2)] px-2 py-0.5 text-[var(--ink-2)]">Pro view: every comp</span>
            </div>
            <div className="tnum mt-1 text-[15px]">
              {games} ranked games, {verdicts.length} comps
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--panel-2)]">
              <div className="flex h-full">
                {verdicts.map((v) => (
                  <span key={v.comp.id} style={{ width: `${(v.comp.games / games) * 100}%`, background: TONE[v.verdict].color }} className="block h-full border-r-2 border-[var(--panel)] last:border-r-0" />
                ))}
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 text-[12px]">
              {verdicts.map((v) => (
                <li key={v.comp.id} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2 text-[var(--ink-2)]">
                    <span className="block h-2 w-2 rounded-full" style={{ background: TONE[v.verdict].color }} />
                    {v.comp.name}
                  </span>
                  <span className="tnum text-[var(--muted)]">{v.comp.games} games</span>
                </li>
              ))}
            </ul>
          </div>
        </div>


        <div className="mt-10 space-y-4">
          {verdicts.map((v) => (
            <CompCard key={v.comp.id} v={v} hide={sharedIds} />
          ))}
        </div>

        {shared.length > 0 && (
          <section className="mt-4 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4">
            <div className="text-[13px] font-medium text-[var(--ink)]">Shared by more than one of your comps</div>
            <ul className="mt-3 space-y-2">
              {shared.map((n) => (
                <NoteRow key={n.id} n={n} note={touches(n.id).length === verdicts.length ? "All your comps" : touches(n.id).join(", ")} />
              ))}
            </ul>
          </section>
        )}

        <section id="rest" className="mt-20 scroll-mt-20 border-t border-[var(--line)] pt-12">
          <h2 className="text-[28px] font-semibold tracking-[-0.02em]">The rest of {PATCH.to}</h2>
          <p className="mt-2 text-[17px] text-[var(--ink)]">{PATCH_SUMMARY.lead}</p>
          <dl className="mt-5 grid gap-3 text-[14px] sm:grid-cols-[96px_minmax(0,1fr)] sm:items-start">
            {([["Stronger", "var(--good)", PATCH_SUMMARY.up], ["Weaker", "var(--hp)", PATCH_SUMMARY.down]] as const).map(([k, c, items]) => (
              <div key={k} className="contents">
                <dt className="pt-1 font-medium" style={{ color: c }}>
                  {k}
                </dt>
                <dd className="flex flex-wrap gap-2">
                  {items.map((x) => (
                    <span key={x} className="rounded-full border px-3 py-1 text-[var(--ink)]" style={{ borderColor: `color-mix(in oklab, ${c} 40%, var(--line))`, background: `color-mix(in oklab, ${c} 8%, transparent)` }}>
                      {x}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <PickList title="Worth trying" tone="var(--good)" picks={PATCH_SUMMARY.tryThese} />
            <PickList title="Worth avoiding" tone="var(--hp)" picks={PATCH_SUMMARY.avoid} />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function PickList({ title, tone, picks }: { title: string; tone: string; picks: PatchPick[] }) {
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
      <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: tone }}>
        <span className="block h-2 w-2 rounded-full" style={{ background: tone }} />
        {title}
      </div>
      <ul className="mt-4 divide-y divide-[var(--line)]">
        {picks.map((pk) => (
          <li key={pk.name} className="py-4 first:pt-0 last:pb-0">
            <h3 className="text-[16px] font-semibold tracking-tight">{pk.name}</h3>
            <div className="mt-3 flex flex-wrap gap-x-2 gap-y-3">
              {pk.units.map((u) => (
                <UnitToken key={u} unitId={u} size={34} />
              ))}
            </div>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">{pk.why}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CompCard({ v, hide }: { v: CompVerdict; hide: Set<string> }) {
  const t = v.verdict === "mixed" && v.score !== 0 ? { ...TONE.mixed, label: v.score < 0 ? "Mixed, leans nerfed" : "Mixed, leans buffed" } : TONE[v.verdict];
  return (
    <article className="overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <header className="flex flex-col gap-5 border-b border-[var(--line)] p-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="lg:w-[340px] lg:shrink-0">
          <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: t.color }}>
            <span className="block h-2 w-2 rounded-full" style={{ background: t.color }} />
            {t.label}
          </div>
          <h3 className="mt-2 text-[22px] font-semibold tracking-tight">{v.comp.name}</h3>
          <p className="tnum mt-1 text-[13px] text-[var(--ink-2)]">{traitLine(v.comp.core)}</p>
          <p className="tnum mt-2 flex gap-2 text-[13px]">
            <span className="rounded-md bg-[color-mix(in_oklab,var(--hp)_13%,transparent)] px-2 py-0.5 text-[var(--hp)]">{(() => { const k = v.lines.filter((l) => l.direction === "nerf").length; return `${k} nerf${k === 1 ? "" : "s"}`; })()}</span>
            <span className="rounded-md bg-[color-mix(in_oklab,var(--good)_13%,transparent)] px-2 py-0.5 text-[var(--good)]">{(() => { const k = v.lines.filter((l) => l.direction === "buff").length; return `${k} buff${k === 1 ? "" : "s"}`; })()}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-x-1 gap-y-3">
          {v.comp.core.map((u) => (
            <UnitToken key={u} unitId={u} size={44} />
          ))}
        </div>
      </header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px]">
      <div className="p-6">
        {(() => {
          const cut = v.why.indexOf(". ");
          const lead = cut > 0 ? v.why.slice(0, cut + 1) : v.why;
          const rest = cut > 0 ? v.why.slice(cut + 2) : "";
          const hidden = v.lines.filter((l) => hide.has(l.id)).length;
          return (
            <>
              <p className="max-w-[620px] text-[17px] font-semibold leading-snug text-[var(--ink)]">{lead}</p>
              {rest && <p className="mt-2 max-w-[620px] text-[14px] leading-relaxed text-[var(--ink-2)]">{rest}</p>}
              {hidden > 0 && <p className="mt-2 text-[13px] text-[var(--muted)]">Also counts {hidden} shared change{hidden === 1 ? "" : "s"} listed below the cards.</p>}
            </>
          );
        })()}
        <ul className="mt-5 space-y-2">
          {v.lines
            .filter((l) => !hide.has(l.id))
            .map((l) => (
              <NoteRow key={l.id} n={l} />
            ))}
        </ul>
      </div>
      <div className="border-t border-[var(--line)] p-6 lg:border-l lg:border-t-0">
        {(() => {
          // last patch is the baseline the verdict was made from; this patch is how it's going now
          const now = allGames().filter((g) => g.comp === v.comp.id).map((g) => g.game.placement);
          const nowAvg = now.length ? now.reduce((x, y) => x + y, 0) / now.length : undefined;
          const nowTop4 = now.length ? Math.round((now.filter((x) => x <= 4).length / now.length) * 100) : undefined;
          const better = (was: number, is: number | undefined, lowerIsBetter: boolean) =>
            is === undefined || is === was ? undefined : lowerIsBetter ? is < was : is > was;
          const rows: [string, string, string, boolean | undefined][] = [
            ["Games", String(v.comp.games), String(now.length), undefined],
            ["Avg place", v.comp.avgPlace.toFixed(1), nowAvg === undefined ? "–" : nowAvg.toFixed(1), better(v.comp.avgPlace, nowAvg, true)],
            ["Top 4", `${v.comp.top4}%`, nowTop4 === undefined ? "–" : `${nowTop4}%`, better(v.comp.top4, nowTop4, false)],
          ];
          return (
            <table className="tnum w-full text-[14px]">
              <thead>
                <tr className="text-left text-[12px] text-[var(--muted)]">
                  <th className="pb-2 text-[13px] font-medium text-[var(--ink)]">How it&apos;s going</th>
                  <th className="pb-2 text-right font-normal">{PATCH.from}</th>
                  <th className="pb-2 text-right font-medium text-[var(--ink-2)]">{PATCH.to} so far</th>
                </tr>
              </thead>
              <tbody>
                {rows.map(([k, was, is, up]) => (
                  <tr key={k} className="border-t border-[var(--line)]">
                    <td className="py-2 text-[var(--ink-2)]">{k}</td>
                    <td className="py-2 text-right text-[var(--ink-2)]">{was}</td>
                    <td className={`py-2 text-right ${now.length < 5 ? "text-[15px] font-medium text-[var(--ink-2)]" : "text-[17px] font-semibold text-[var(--ink)]"}`}>
                      {is}
                      {up !== undefined && (
                        <span className="ml-1.5 text-[12px] font-medium" style={{ color: now.length < 5 ? "var(--muted)" : up ? "var(--good)" : "var(--hp)" }}>
                          {up ? "better" : "worse"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              {now.length > 0 && (
                <caption className="caption-bottom pt-4 text-left">
                  <span className="block text-[12px] text-[var(--muted)]">Your {PATCH.to} games, newest first</span>
                  <span className="mt-2 flex flex-wrap gap-1.5">
                    {now.map((pl, k) => (
                      <span
                        key={k}
                        className="tnum rounded-md px-2 py-1 text-[13px] font-semibold"
                        style={{ color: pl <= 4 ? "var(--good)" : "var(--hp)", background: `color-mix(in oklab, ${pl <= 4 ? "var(--good)" : "var(--hp)"} 14%, transparent)` }}
                      >
                        {pl}
                      </span>
                    ))}
                  </span>
                  {now.length < 5 && (
                    <span className="mt-2 block text-[12px] text-[var(--muted)]">
                      Only {now.length} game{now.length === 1 ? "" : "s"} on {PATCH.to} so far, so treat this column as early.
                    </span>
                  )}
                </caption>
              )}
            </table>
          );
        })()}
      </div>
      </div>
    </article>
  );
}

function NoteRow({ n, note }: { n: NoteLine; note?: string }) {
  return (
    <li className="grid grid-cols-[48px_minmax(0,1fr)] items-center gap-x-3 gap-y-2 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[14px] sm:grid-cols-[48px_minmax(0,1fr)_110px]">
      <Dir d={n.direction} />
      <span className="tnum text-[var(--ink-2)]">
        {n.text}
        {note && <span className="block text-[12px] text-[var(--muted)]">{note}</span>}
      </span>
      <span className="col-start-2 sm:col-start-auto sm:text-right">
        <Delta n={n} />
      </span>
    </li>
  );
}

// the traits a board runs at 2 or more units, biggest first
function traitLine(core: string[]) {
  const n = new Map<string, number>();
  for (const u of core) for (const t of UNIT_BY_ID[u]?.traits ?? []) n.set(t, (n.get(t) ?? 0) + 1);
  return [...n].filter(([, k]) => k >= 2).sort((a, b) => b[1] - a[1]).slice(0, 4).map(([t, k]) => `${k} ${t}`).join(" · ");
}

function Delta({ n }: { n: NoteLine }) {
  const pct = changePct(n.text);
  if (pct === undefined) return null;
  return (
    <span className="tnum w-24 shrink-0 text-right text-[13px] font-medium" style={{ color: n.direction === "buff" ? "var(--good)" : n.direction === "nerf" ? "var(--hp)" : "var(--ink-2)" }}>
      {Math.abs(pct).toFixed(1)}% {pct > 0 ? "higher" : "lower"}
      {n.direction === "buff" && pct < 0 ? <span className="block text-[11px] font-normal text-[var(--muted)]">lower is better</span> : null}
    </span>
  );
}

function Dir({ d }: { d: NoteLine["direction"] }) {
  const c = d === "buff" ? "var(--good)" : d === "nerf" ? "var(--hp)" : "var(--muted)";
  return (
    <span className="w-12 shrink-0 rounded-md py-0.5 text-center text-[12px] font-medium" style={{ background: `color-mix(in oklab, ${c} 14%, transparent)`, color: c }}>
      {d === "buff" ? "Buff" : d === "nerf" ? "Nerf" : "Change"}
    </span>
  );
}
