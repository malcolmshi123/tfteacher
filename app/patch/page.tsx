import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { NOTES, PATCH, changePct, radar, type CompVerdict, type NoteLine } from "@/lib/patch/radar";

export const metadata = { title: "Patch Radar · TFTeacher" };

const TONE = {
  stronger: { color: "var(--good)", label: "Stronger for you" },
  weaker: { color: "var(--hp)", label: "Weaker for you" },
  mixed: { color: "var(--gold)", label: "Mixed" },
  unchanged: { color: "var(--muted)", label: "Unchanged" },
} as const;

export default function PatchPage() {
  const verdicts = radar();
  const used = new Set(verdicts.flatMap((v) => v.lines.map((l) => l.id)));
  const rest = NOTES.filter((n) => !used.has(n.id));
  const games = verdicts.reduce((a, v) => a + v.comp.games, 0);

  return (
    <>
      <SiteNav active="/patch" />
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-8 md:px-6 md:pt-10">
        <div className="grid gap-8 md:grid-cols-[minmax(0,1fr)_300px] md:items-end">
          <div className="max-w-[720px]">
            <p className="text-[13px] text-[var(--muted)]">
              Patch {PATCH.from} to {PATCH.to} · released Nov 12 ·{" "}
              <a href="#rest" className="text-[var(--ink-2)] underline-offset-2 hover:underline">
                all {NOTES.length} lines
              </a>
            </p>
            <h1 className="mt-3 text-[28px] font-semibold leading-[1.15] tracking-[-0.02em] text-balance md:text-[36px]">
              Your best comp got weaker this patch. One you play less got better.
            </h1>
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--ink-2)]">
              We matched all {NOTES.length} lines of the patch notes against the {games} games you played last patch. Only
              the lines that touch your comps are below, each linked to the note it came from.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-4">
            <div className="text-[12px] text-[var(--muted)]">Based on</div>
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
            <CompCard key={v.comp.id} v={v} />
          ))}
        </div>

        <section id="rest" className="mt-12 scroll-mt-20">
          <h2 className="text-[15px] font-medium">Rest of the patch</h2>
          <p className="mt-1 text-[13px] text-[var(--muted)]">These lines don&apos;t touch anything you play.</p>
          <ul className="mt-4 divide-y divide-[var(--line)] rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
            {rest.map((n) => (
              <li key={n.id} className="flex items-center gap-4 px-5 py-3 text-[14px]">
                <Dir d={n.direction} />
                <span className="hidden w-20 shrink-0 text-[12px] text-[var(--muted)] sm:block">{n.section}</span>
                <span className="tnum flex-1 text-[var(--ink-2)]">{n.text}</span>
                <Delta n={n} />
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function CompCard({ v }: { v: CompVerdict }) {
  const t = TONE[v.verdict];
  return (
    <article className="grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="border-b border-[var(--line)] p-6 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: t.color }}>
          <span className="block h-2 w-2 rounded-full" style={{ background: t.color }} />
          {t.label}
        </div>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight">{v.comp.name}</h3>
        <div className="mt-4 flex gap-1">
          {v.comp.core.map((u) => (
            <UnitToken key={u} unitId={u} size={44} />
          ))}
        </div>
        <dl className="tnum mt-5 grid grid-cols-3 gap-4 text-[13px]">
          <div>
            <dt className="text-[var(--muted)]">Games</dt>
            <dd className="mt-0.5 text-[18px] font-semibold">{v.comp.games}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Avg place</dt>
            <dd className="mt-0.5 text-[18px] font-semibold">{v.comp.avgPlace.toFixed(1)}</dd>
          </div>
          <div>
            <dt className="text-[var(--muted)]">Top 4</dt>
            <dd className="mt-0.5 text-[18px] font-semibold">{v.comp.top4}%</dd>
          </div>
        </dl>
      </div>
      <div className="p-6">
        <p className="max-w-[620px] text-[16px] font-medium leading-relaxed text-[var(--ink)]">{v.why}</p>
        <ul className="mt-5 space-y-2">
          {v.lines.map((l) => (
            <NoteRow key={l.id} n={l} />
          ))}
        </ul>
      </div>
    </article>
  );
}

function NoteRow({ n }: { n: NoteLine }) {
  return (
    <li className="flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--bg)] px-4 py-2.5 text-[14px]">
      <Dir d={n.direction} />
      <span className="tnum flex-1 text-[var(--ink-2)]">{n.text}</span>
      <Delta n={n} />
    </li>
  );
}

function Delta({ n }: { n: NoteLine }) {
  const pct = changePct(n.text);
  if (pct === undefined) return null;
  return (
    <span className="tnum w-16 shrink-0 text-right text-[13px] text-[var(--muted)]" title="Raw change in the number. The arrow shows whether it helps.">
      {pct > 0 ? "+" : "−"}
      {Math.abs(pct).toFixed(Math.abs(pct) < 10 ? 1 : 0)}%
    </span>
  );
}

function Dir({ d }: { d: NoteLine["direction"] }) {
  const c = d === "buff" ? "var(--good)" : d === "nerf" ? "var(--hp)" : "var(--muted)";
  return (
    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md" style={{ background: `color-mix(in oklab, ${c} 16%, transparent)`, color: c }} aria-label={d}>
      <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden>
        {d === "buff" ? <path d="M5 1.5 9 7.5H1z" fill="currentColor" /> : d === "nerf" ? <path d="M5 8.5 1 2.5h8z" fill="currentColor" /> : <rect x="1.5" y="4" width="7" height="2" rx="1" fill="currentColor" />}
      </svg>
    </span>
  );
}
