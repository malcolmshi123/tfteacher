import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

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
            <table className="w-full text-left text-[14px]">
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
          <TrendsPreview />
        </section>

        <section className="mt-16 grid gap-x-12 gap-y-8 border-t border-[var(--line)] pt-12 md:grid-cols-2">
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
  ["Patch Radar", "Most played comp", "Every comp"],
  ["Trends across games", "No", "Yes"],
  ["History", "20 games", "All games"],
];

const TREND = [
  { stage: "Stage 2", hp: 8 },
  { stage: "Stage 3", hp: 31 },
  { stage: "Stage 4", hp: 27 },
  { stage: "Stage 5+", hp: 14 },
];

function TrendsPreview() {
  const max = Math.max(...TREND.map((t) => t.hp));
  return (
    <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Pro trends: HP lost per game, by stage</h3>
        <span className="text-[12px] text-[var(--muted)]">Sample account, 19 games on patch 18.4</span>
      </div>
      <div className="mt-6 space-y-3">
        {TREND.map((t) => (
          <div key={t.stage} className="grid grid-cols-[72px_1fr_44px] items-center gap-3 text-[13px]">
            <span className="text-[var(--ink-2)]">{t.stage}</span>
            <span className="h-3 overflow-hidden rounded-full bg-[var(--panel-2)]">
              <span className="block h-full rounded-full" style={{ width: `${(t.hp / max) * 100}%`, background: t.hp === max ? "var(--hp)" : "color-mix(in oklab, var(--hp) 45%, var(--panel-2))" }} />
            </span>
            <span className="tnum text-right text-[var(--ink)]">{t.hp} HP</span>
          </div>
        ))}
      </div>
      <p className="mt-6 border-t border-[var(--line)] pt-4 text-[14px] leading-relaxed text-[var(--ink-2)]">
        Stage 3 costs this player the most HP per game. Their reviews point at the same habit: long loss streaks through stage 3 that leave too little HP for stage 4.
      </p>
    </div>
  );
}

function Plan({ name, price, cadence, note, items, cta, href, featured }: { name: string; price: string; cadence: string; note?: string; items: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border p-7 ${featured ? "border-[color-mix(in_oklab,var(--brand)_60%,var(--line))] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand)_9%,var(--panel-2)),var(--panel-2)_45%)] shadow-[0_30px_80px_-40px_color-mix(in_oklab,var(--brand)_40%,transparent)]" : "border-[var(--line)] bg-[var(--panel)]"}`}>
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
