import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { UnitToken } from "@/components/UnitToken";
import { PATCH, radar } from "@/lib/patch/radar";

export const metadata = { title: "Pricing · TFTeacher" };

const FREE = [
  "3 round-by-round reviews a week",
  "Final-board reviews for games you didn't record",
  "3 questions per review",
  "Patch Radar for your most played comp",
  "Last 20 games of history",
];
const PRO = [
  "Unlimited round-by-round reviews",
  "Unlimited questions about any round",
  "Patch Radar for every comp you play",
  "Trends across your games: where you lose HP, how you spend gold",
  "Full history",
];

export default function Pricing() {
  return (
    <>
      <SiteNav active="/pricing" />
      <main className="mx-auto max-w-[1240px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
        <div className="max-w-[620px]">
          <h1 className="text-balance text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">Review every game, or just the bad ones.</h1>
          <p className="mt-3 text-[16px] leading-relaxed text-[var(--ink-2)]">Both plans use the same review engine. Pro removes the weekly limit and adds the tools for climbing over a whole patch.</p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2">
          <Plan name="Free" price="$0" cadence="forever" note="No card needed" items={FREE} cta="Download for Windows" href="/download" />
          <Plan name="Pro" price="$5" cadence="per month" note="or $48 a year, save $12" items={PRO} cta="Try Pro free for 14 days" href="/download?plan=pro" featured />
        </div>

        <section className="mt-16 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)]">
            <table className="h-full w-full text-left text-[14px]">
              <thead className="bg-[var(--panel)] text-[13px] text-[var(--muted)]">
                <tr>
                  <th className="px-5 py-3 font-medium">Compare</th>
                  <th className="w-28 px-3 py-3 text-center font-medium">Free</th>
                  <th className="w-28 px-3 py-3 text-center font-medium text-[var(--brand)]">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--line)]">
                {COMPARE.map(([label, free, pro]) => (
                  <tr key={label}>
                    <td className="px-5 py-3 text-[var(--ink-2)]">{label}</td>
                    <td className="tnum px-3 py-3 text-center">{free}</td>
                    <td className="tnum px-3 py-3 text-center">{pro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <ProPreview />
        </section>

        <section className="mt-16 grid gap-x-12 gap-y-8 border-t border-[var(--line)] pt-12 md:grid-cols-2">
          <h2 className="text-[22px] font-semibold tracking-tight md:col-span-2">Questions</h2>
          <Faq q="Can I get banned for using this?">
            The app only reads the game&apos;s official event feed, saves it, and shows nothing until the game is over. It does
            not read game memory and gives no advice while you play.
          </Faq>
          <Faq q="Does it work when the set changes?">
            Yes. The review rules are about economy, HP, shops and levels, which every set has. Unit and trait data load from
            the live set on day one.
          </Faq>
          <Faq q="What about augments?">
            Riot doesn&apos;t allow third-party apps to show augment data, so reviews leave augments out.
          </Faq>
          <Faq q="I play on Mac.">
            You can still get final-board reviews on the web from your match history. Round-by-round recording needs the
            Windows app for now.
          </Faq>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

const COMPARE: [string, string, string][] = [
  ["Round-by-round reviews", "3 a week", "Unlimited"],
  ["Final-board reviews", "Yes", "Yes"],
  ["Questions per review", "3", "Unlimited"],
  ["Patch Radar", "Top comp", "Every comp"],
  ["Trends across games", "No", "Yes"],
  ["History", "20 games", "All games"],
];

const TREND = [
  // share of all HP lost over the 19 games, by stage; adds up to 100
  { stage: "Stage 2", hp: 9 },
  { stage: "Stage 3", hp: 36 },
  { stage: "Stage 4", hp: 32 },
  { stage: "Stage 5+", hp: 23 },
];

// Beside the compare table: what Pro adds, shown on the sample account's own data.
function ProPreview() {
  const verdicts = [...radar()].sort((a, b) => b.comp.games - a.comp.games);
  const games = verdicts.reduce((a, v) => a + v.comp.games, 0);
  const top = TREND.reduce((a, b) => (b.hp > a.hp ? b : a));
  return (
    <div className="flex h-full flex-col rounded-2xl border border-[var(--line)] bg-[var(--panel)]">
      <div className="border-b border-[var(--line)] px-6 py-4">
        <h3 className="text-[15px] font-semibold">What Pro adds, on the sample account</h3>
        <p className="mt-0.5 text-[13px] text-[var(--ink-2)]">
          {games} games on {PATCH.from}, checked against the {PATCH.to} notes
        </p>
      </div>

      <div className="px-6 pt-4">
        <div className="text-[13px] font-medium text-[var(--muted)]">Patch Radar</div>
        <ul className="mt-1 divide-y divide-[var(--line)]">
          {verdicts.map((v, i) => {
            const [label, color] =
              v.verdict === "weaker" ? ["Nerfed", "var(--hp)"] : v.verdict === "stronger" ? ["Buffed", "var(--good)"] : v.verdict === "mixed" ? ["Mixed", "var(--gold)"] : ["Unchanged", "var(--muted)"];
            return (
              <li key={v.comp.id} className="grid grid-cols-[32px_minmax(0,1fr)_auto_44px] items-center gap-3 py-2.5 text-[14px]">
                <UnitToken unitId={v.comp.carry} size={32} showName={false} />
                <span className="min-w-0 truncate">
                  {v.comp.name} <span className="tnum text-[13px] text-[var(--muted)]">{v.comp.games} games</span>
                </span>
                <span className="text-[13px] font-medium" style={{ color }}>
                  {label}
                </span>
                <span
                  className={`w-11 rounded-md py-0.5 text-center text-[12px] font-medium ${i === 0 ? "bg-[var(--panel-2)] text-[var(--ink-2)]" : "bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] text-[var(--brand)]"}`}
                >
                  {i === 0 ? "Free" : "Pro"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="mt-1 text-[12px] text-[var(--muted)]">Free checks your most played comp. Pro checks every comp you play.</p>
      </div>

      <div className="mt-auto border-t border-[var(--line)] px-6 py-4">
        <div className="flex items-baseline justify-between gap-3 text-[13px]">
          <span className="font-medium text-[var(--muted)]">Trends: where the HP went</span>
          <span className="w-11 shrink-0 rounded-md bg-[color-mix(in_oklab,var(--brand)_16%,transparent)] py-0.5 text-center text-[12px] font-medium text-[var(--brand)]">Pro</span>
        </div>
        {/* one bar of all HP lost over the games, split by stage */}
        <div className="mt-3 flex h-3 overflow-hidden rounded-full">
          {TREND.map((s) => (
            <span
              key={s.stage}
              className="h-full border-r-2 border-[var(--panel)] last:border-r-0"
              style={{ width: `${s.hp}%`, background: s === top ? "var(--hp)" : "color-mix(in oklab, var(--hp) 38%, var(--panel-2))" }}
            />
          ))}
        </div>
        {/* a legend, so even the thinnest segment is named */}
        <div className="tnum mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12px] text-[var(--ink-2)]">
          {TREND.map((s) => (
            <span key={s.stage} className="flex items-center gap-1.5" style={{ color: s === top ? "var(--ink)" : undefined }}>
              <span className="block h-2 w-2 rounded-sm" style={{ background: s === top ? "var(--hp)" : "color-mix(in oklab, var(--hp) 38%, var(--panel-2))" }} />
              {s.stage} {s.hp}%
            </span>
          ))}
        </div>
        <p className="mt-3 text-[14px] leading-relaxed text-[var(--ink-2)]">
          {top.stage} took {top.hp}% of all the HP this player lost. Their reviews point at the same habit: long loss streaks there leave too little HP for stage 4.
        </p>
      </div>
    </div>
  );
}

function Plan({ name, price, cadence, note, items, cta, href, featured }: { name: string; price: string; cadence: string; note?: string; items: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border p-7 ${featured ? "border-[color-mix(in_oklab,var(--brand)_60%,var(--line))] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand)_9%,var(--panel-2)),var(--panel-2)_45%)]" : "border-[var(--line)] bg-[var(--panel)]"}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold">{name}</h2>

      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="tnum text-[44px] font-semibold tracking-tight">{price}</span>
        <span className="text-[14px] text-[var(--muted)]">{cadence}</span>
      </div>
      <div className="h-5 text-[13px] text-[var(--muted)]">{note}</div>
      <ul className="mt-6 space-y-3">
        {items.map((it) => (
          <li key={it} className="flex gap-3 text-[15px] leading-snug text-[var(--ink-2)]">
            <svg width="16" height="16" viewBox="0 0 16 16" className="mt-[2px] shrink-0" aria-hidden>
              <path d="M3.5 8.5 6.5 11.5 12.5 4.5" fill="none" stroke={featured ? "var(--brand)" : "var(--ink-2)"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {it}
          </li>
        ))}
      </ul>
      <div className="flex-1" />
      <Link
        href={href}
        className={`mt-8 rounded-xl px-5 py-3 text-center text-[15px] font-semibold transition-opacity hover:opacity-90 ${featured ? "bg-[var(--brand)] text-[#1a1306]" : "border border-[var(--line-2)] text-[var(--ink)]"}`}
      >
        {cta}
      </Link>
      <p className="mt-2 text-center text-[13px] text-[var(--ink-2)]">{featured ? "No card needed for the trial. Cancel any time." : "No Windows? Final-board reviews work on the web."}</p>
    </div>
  );
}

function Faq({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-[16px] font-semibold">{q}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{children}</p>
    </div>
  );
}
