import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = { title: "Pricing · TFTeacher" };

const FREE = [
  "3 round-by-round reviews a week",
  "Final-board reviews for games you didn't record",
  "Patch Radar summary for your top comp",
  "Last 20 games of history",
];
const PRO = [
  "Unlimited round-by-round reviews",
  "Ask follow-up questions about any round",
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
          <Plan name="Pro" price="$5" cadence="per month" note="or $48 a year, 2 months free" items={PRO} cta="Start 14 days free" href="/download?plan=pro" featured />
        </div>

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

function Plan({ name, price, cadence, note, items, cta, href, featured }: { name: string; price: string; cadence: string; note?: string; items: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border p-7 ${featured ? "border-[color-mix(in_oklab,var(--brand)_45%,var(--line))] bg-[var(--panel-2)]" : "border-[var(--line)] bg-[var(--panel)]"}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold">{name}</h2>
        {featured && <span className="text-[13px] text-[var(--muted)]">Cancel any time</span>}
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
