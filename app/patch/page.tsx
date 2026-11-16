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
  // lines that touch every comp are shown once, above the comps
  const shared = NOTES.filter((n) => verdicts.every((v) => v.lines.some((l) => l.id === n.id)));
  const sharedIds = new Set(shared.map((n) => n.id));
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
              We matched all {NOTES.length} lines of the patch notes against the {games} games you played last patch. This is the
              Pro view; Free shows your most played comp. Only
              the lines that touch your comps are below, each shown with the size of the change.
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

        {shared.length > 0 && (
          <section className="mt-10 rounded-2xl border border-[var(--line)] bg-[var(--panel)] px-5 py-4">
            <div className="text-[13px] text-[var(--muted)]">Touches all your comps</div>
            <ul className="mt-2 space-y-2">
              {shared.map((n) => (
                <NoteRow key={n.id} n={n} />
              ))}
            </ul>
          </section>
        )}

        <div className="mt-4 space-y-4">
          {verdicts.map((v) => (
            <CompCard key={v.comp.id} v={v} hide={sharedIds} />
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

function CompCard({ v, hide }: { v: CompVerdict; hide: Set<string> }) {
  const t = v.verdict === "mixed" && v.score !== 0 ? { ...TONE.mixed, label: v.score < 0 ? "Mixed, leans weaker" : "Mixed, leans stronger" } : TONE[v.verdict];
  return (
    <article className="grid overflow-hidden rounded-2xl border border-[var(--line)] bg-[var(--panel)] lg:grid-cols-[400px_minmax(0,1fr)]">
      <div className="flex flex-col border-b border-[var(--line)] p-6 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-2 text-[13px] font-medium" style={{ color: t.color }}>
          <span className="block h-2 w-2 rounded-full" style={{ background: t.color }} />
          {t.label}
        </div>
        <h3 className="mt-2 text-[22px] font-semibold tracking-tight">{v.comp.name}</h3>
        <Meter score={v.score} />
        <div className="mt-4 flex gap-1">
          {v.comp.core.map((u) => (
            <UnitToken key={u} unitId={u} size={44} />
          ))}
        </div>
        <dl className="tnum mt-auto grid grid-cols-3 gap-4 pt-5 text-[13px]">
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
          {v.lines
            .filter((l) => !hide.has(l.id))
            .map((l) => (
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

// Net size of the patch for this comp: weighted buffs minus nerfs, on a -6..6 scale.
function Meter({ score }: { score: number }) {
  const clamped = Math.max(-6, Math.min(6, score));
  const pct = (Math.abs(clamped) / 6) * 50;
  const color = score > 0 ? "var(--good)" : score < 0 ? "var(--hp)" : "var(--muted)";
  return (
    <div className="mt-3" aria-label={`Net patch effect ${score > 0 ? "+" : ""}${score}`}>
      <div className="relative h-2 rounded-full bg-[var(--panel-2)]">
        <span className="absolute left-1/2 top-[-4px] block h-4 w-0.5 -translate-x-1/2 rounded bg-[var(--ink-2)]" />
        {clamped === 0 && <span className="absolute left-1/2 top-1/2 block h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[var(--panel)]" style={{ background: "var(--gold)" }} />}
        <span
          className="absolute top-0 block h-full rounded-full"
          style={{ background: color, width: `${pct}%`, left: clamped < 0 ? `${50 - pct}%` : "50%" }}
        />
      </div>
      <div className="mt-1.5 flex justify-between text-[11px] text-[var(--muted)]">
        <span>Weaker</span>
        <span>Stronger</span>
      </div>
    </div>
  );
}

function Delta({ n }: { n: NoteLine }) {
  const pct = changePct(n.text);
  if (pct === undefined) return null;
  return (
    <span className="tnum w-24 shrink-0 text-right text-[13px] font-medium" style={{ color: n.direction === "buff" ? "var(--good)" : n.direction === "nerf" ? "var(--hp)" : "var(--ink-2)" }}>
      {Math.abs(pct).toFixed(Math.abs(pct) < 10 ? 1 : 0)}% {pct > 0 ? "higher" : "lower"}
      {n.direction === "buff" && pct < 0 ? <span className="block text-[11px] font-normal text-[var(--muted)]">lower is better</span> : null}
      {n.text.includes("/") ? <span className="block text-[11px] font-normal text-[var(--muted)]">average of tiers</span> : null}
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
