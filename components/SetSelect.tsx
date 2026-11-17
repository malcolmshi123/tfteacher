"use client";

import { useRouter } from "next/navigation";

// Pick which set's reviews to show. Each set's games appear on one page, sectioned by patch.
export function SetSelect({ sets, value }: { sets: string[]; value: string }) {
  const router = useRouter();
  return (
    <label className="inline-flex items-center gap-2 text-[13px] text-[var(--ink-2)]">
      <span className="sr-only">Set</span>
      <span className="relative">
        <select
          value={value}
          onChange={(e) => router.push(`/reviews?set=${encodeURIComponent(e.target.value)}`)}
          className="appearance-none rounded-lg border border-[var(--line-2)] bg-[var(--panel)] py-1.5 pl-3 pr-8 text-[14px] font-medium text-[var(--ink)] outline-none transition-colors hover:border-[var(--ink-2)] focus-visible:border-[var(--brand)]"
        >
          {sets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <svg width="10" height="10" viewBox="0 0 10 10" className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" aria-hidden>
          <path d="M2.5 3.8 5 6.3l2.5-2.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
    </label>
  );
}
