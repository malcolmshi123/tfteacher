import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = { title: "Desktop app · Afterboard" };

export default async function Download({ searchParams }: { searchParams: Promise<{ joined?: string; error?: string }> }) {
  const { joined, error } = await searchParams;
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-[860px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">The desktop app is in private testing.</h1>
        <p className="mt-4 max-w-[620px] text-[17px] leading-relaxed text-[var(--ink-2)]">
          It records your games round by round on Windows and sends the recording for review when each game ends. Leave
          your email and we&apos;ll send a build when your region opens.
        </p>
        {joined ? (
          <p className="mt-8 max-w-[480px] rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[15px]">
            You&apos;re on the list. We&apos;ll email you once, when a build is ready.
          </p>
        ) : (
        <form className="mt-8 flex max-w-[480px] flex-col gap-3 sm:flex-row" action="/api/waitlist" method="post">
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="h-12 flex-1 rounded-xl border border-[var(--line-2)] bg-[var(--panel)] px-4 text-[15px] text-[var(--ink)] placeholder:text-[var(--muted)] focus:border-[var(--brand)] focus:outline-none"
          />
          <button className="h-12 rounded-xl bg-[var(--brand)] px-5 text-[15px] font-semibold text-[#1a1306] hover:opacity-90">Join the list</button>
        </form>
        )}
        {error && <p className="mt-3 text-[14px] text-[var(--hp)]">That email doesn&apos;t look right. Try again.</p>}
        <p className="mt-3 text-[13px] text-[var(--muted)]">One email when it&apos;s ready. Nothing else.</p>

        <dl className="mt-14 grid gap-6 border-t border-[var(--line)] pt-8 sm:grid-cols-3">
          <div>
            <dt className="text-[13px] text-[var(--muted)]">Platform</dt>
            <dd className="mt-1 text-[15px]">Windows 10 and 11</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--muted)]">While you play</dt>
            <dd className="mt-1 text-[15px]">Records only, shows nothing</dd>
          </div>
          <div>
            <dt className="text-[13px] text-[var(--muted)]">No app?</dt>
            <dd className="mt-1 text-[15px]">
              <Link href="/review/sample" className="text-[var(--brand)] hover:underline">
                Final-board reviews on the web
              </Link>
            </dd>
          </div>
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
