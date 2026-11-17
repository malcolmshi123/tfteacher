"use client";

import Link from "next/link";
import { useState } from "react";

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

// The two plans with a monthly / yearly switch that changes the Pro price itself.
export function PricingPlans() {
  const [yearly, setYearly] = useState(false);
  return (
    <div className="mt-10">
      <div role="radiogroup" aria-label="Billing" className="inline-flex rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1 text-[14px]">
        {[
          [false, "Monthly"],
          [true, "Yearly"],
        ].map(([v, label]) => (
          <button
            key={String(label)}
            role="radio"
            aria-checked={yearly === v}
            onClick={() => setYearly(v as boolean)}
            className={`flex items-center gap-2 rounded-lg px-4 py-1.5 font-medium transition-colors ${yearly === v ? "bg-[var(--panel-2)] text-[var(--ink)]" : "text-[var(--ink-2)] hover:text-[var(--ink)]"}`}
          >
            {label as string}
            {v && <span className="rounded-md bg-[color-mix(in_oklab,var(--good)_16%,transparent)] px-1.5 py-0.5 text-[12px] text-[var(--good)]">Save $12</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Plan name="Free" price="$0" cadence="forever" note="No card needed" items={FREE} cta="Download for Windows" href="/download" />
        <Plan
          name="Pro"
          price={yearly ? "$48" : "$5"}
          cadence={yearly ? "per year" : "per month"}
          note={yearly ? "$4 a month, billed once a year" : "Billed monthly, cancel any time"}
          items={PRO}
          cta="Try Pro free for 14 days"
          href={yearly ? "/download?plan=pro-yearly" : "/download?plan=pro"}
          featured
        />
      </div>
    </div>
  );
}

function Plan({ name, price, cadence, note, items, cta, href, featured }: { name: string; price: string; cadence: string; note?: string; items: string[]; cta: string; href: string; featured?: boolean }) {
  return (
    <div className={`flex flex-col rounded-2xl border p-7 ${featured ? "border-[color-mix(in_oklab,var(--brand)_60%,var(--line))] bg-[linear-gradient(180deg,color-mix(in_oklab,var(--brand)_9%,var(--panel-2)),var(--panel-2)_45%)]" : "border-[var(--line)] bg-[var(--panel)]"}`}>
      <div className="flex items-center justify-between">
        <h2 className="text-[18px] font-semibold">{name}</h2>
        {featured && <span className="rounded-full bg-[var(--brand)] px-2.5 py-0.5 text-[12px] font-semibold text-[#1a1306]">Recommended</span>}
      </div>
      <div className="mt-5 flex items-baseline gap-2">
        <span className="tnum text-[44px] font-semibold tracking-tight">{price}</span>
        <span className="text-[14px] text-[var(--muted)]">{cadence}</span>
      </div>
      <div className="h-5 text-[13px] text-[var(--ink-2)]">{note}</div>
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
