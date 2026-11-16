import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2.5 ${className}`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <rect x="0.75" y="0.75" width="24.5" height="24.5" rx="7" fill="var(--panel-2)" stroke="var(--line-2)" strokeWidth="1.5" />
        <path d="M5 8.5h4.5v4H14v3h3.5V19H21" fill="none" stroke="var(--brand)" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx="14" cy="12.5" r="2.1" fill="var(--hp)" />
      </svg>
      <span className="text-[16px] font-semibold tracking-tight text-[var(--ink)]">TFTeacher</span>
    </Link>
  );
}

const NAV = [
  { href: "/reviews", label: "Reviews" },
  { href: "/patch", label: "Patch Radar" },
  { href: "/pricing", label: "Pricing" },
];

const SAMPLE_PAGES = ["/reviews", "/patch"];

export function SiteNav({ active }: { active?: string }) {
  return (
    <>
    {active && SAMPLE_PAGES.includes(active) && (
      <div className="border-b border-[var(--line)] bg-[color-mix(in_oklab,var(--brand)_8%,var(--bg))] px-4 py-2 text-center text-[13px] text-[var(--ink-2)]">
        <span className="sm:hidden">Sample account. Sign in to see yours.</span>
        <span className="hidden sm:inline">You&apos;re looking at a sample account. Install the app and sign in to see your own games.</span>
      </div>
    )}
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className={`rounded-md px-3 py-1.5 text-[14px] transition-colors ${
                  active === n.href ? "bg-[var(--panel-2)] text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]"
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/pricing" className="hidden rounded-md px-3 py-1.5 text-[14px] text-[var(--muted)] hover:text-[var(--ink)] sm:block">
            Sign in
          </Link>
          <Link
            href="/download"
            className="rounded-lg bg-[var(--ink)] px-3.5 py-1.5 text-[14px] font-medium text-[var(--bg)] transition-opacity hover:opacity-90"
          >
            Get the app
          </Link>
          <details className="group relative md:hidden">
            <summary aria-label="Menu" className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-lg border border-[var(--line)] text-[var(--ink-2)] [&::-webkit-details-marker]:hidden">
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </summary>
            <nav className="absolute right-0 top-11 w-52 rounded-xl border border-[var(--line)] bg-[var(--panel)] p-1.5 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)]">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className={`block rounded-lg px-3 py-2.5 text-[15px] ${active === n.href ? "bg-[var(--panel-2)] text-[var(--ink)]" : "text-[var(--ink-2)]"}`}>
                  {n.label}
                </Link>
              ))}
              <Link href="/pricing" className="block rounded-lg px-3 py-2.5 text-[15px] text-[var(--ink-2)]">
                Sign in
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)]">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-6 px-4 py-10 md:flex-row md:items-start md:justify-between md:px-6">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
            TFTeacher isn&apos;t endorsed by Riot Games and doesn&apos;t reflect the views or opinions of Riot Games or anyone
            officially involved in producing or managing Riot Games properties. Riot Games and all associated properties are
            trademarks or registered trademarks of Riot Games, Inc.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-[14px] text-[var(--muted)]">
          <Link href="/review/sample" className="hover:text-[var(--ink)]">Sample review</Link>
          <Link href="/download" className="hover:text-[var(--ink)]">Desktop app</Link>
          <Link href="/patch" className="hover:text-[var(--ink)]">Patch Radar</Link>
          <Link href="/how-it-works" className="hover:text-[var(--ink)]">How reviews are checked</Link>
          <Link href="/pricing" className="hover:text-[var(--ink)]">Pricing</Link>
          <Link href="/privacy" className="hover:text-[var(--ink)]">Privacy</Link>
        </div>
      </div>
    </footer>
  );
}
