import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { PricingPlans } from "@/components/PricingPlans";

export const metadata = { title: "Pricing · TFTeacher" };

const FAQ: [string, string][] = [
  [
    "Can I get banned for using this?",
    "The app only reads the game's official event feed, saves it, and shows nothing until the game is over. It does not read game memory and gives no advice while you play.",
  ],
  [
    "Does it work when the set changes?",
    "Yes. The review rules are about economy, HP, shops and levels, which every set has. Unit and trait data load from the live set on day one.",
  ],
  ["What about augments?", "Riot doesn't allow third-party apps to show augment data, so reviews leave augments out."],
  ["I play on Mac.", "You can still get final-board reviews on the web from your match history. Round-by-round recording needs the Windows app for now."],
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

        <PricingPlans />

        <section className="mt-16 border-t border-[var(--line)] pt-12">
          <h2 className="text-[22px] font-semibold tracking-tight">Questions</h2>
          <div className="mt-6 divide-y divide-[var(--line)] border-y border-[var(--line)]">
            {FAQ.map(([q, a], i) => (
              <details key={q} className="group" open={i === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-[16px] font-semibold [&::-webkit-details-marker]:hidden">
                  {q}
                  <svg width="14" height="14" viewBox="0 0 14 14" className="shrink-0 text-[var(--muted)] transition-transform group-open:rotate-45" aria-hidden>
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </summary>
                <p className="max-w-[760px] pb-5 text-[15px] leading-relaxed text-[var(--ink-2)]">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
