import Link from "next/link";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = { title: "How reviews are checked · Afterboard" };

const SOURCES = [
  {
    name: "Desktop recorder",
    detail: "Saves a snapshot every round from the game's official event feed: gold, HP, level, every shop, your board and bench, items, and the lobby's HP and boards. Uploaded after the game ends.",
    depth: "Round by round",
    tone: "var(--good)",
  },
  {
    name: "Screen recording",
    detail: "If the event feed is unavailable, the app can read the same numbers from a recording of your screen after the game. Slower, and each value carries a confidence score.",
    depth: "Round by round, lower confidence",
    tone: "var(--gold)",
  },
  {
    name: "Match history",
    detail: "For games you didn't record, we use your final board and placement. The review says which findings are inferred, and asks what you remember when a detail would change the verdict.",
    depth: "Final board only",
    tone: "var(--muted)",
  },
];

export default function HowItWorks() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-[860px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">How reviews are checked</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink-2)]">
          A review is only useful if you can trust it. So the part that decides what went wrong is plain rules over your
          recording, and the part that writes it up is not allowed to add facts.
        </p>

        <h2 className="mt-14 text-[20px] font-semibold tracking-tight">Where the numbers come from</h2>
        <ul className="mt-5 space-y-3">
          {SOURCES.map((s) => (
            <li key={s.name} className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h3 className="text-[16px] font-semibold">{s.name}</h3>
                <span className="inline-flex items-center gap-2 text-[13px]" style={{ color: s.tone }}>
                  <span className="block h-1.5 w-1.5 rounded-full" style={{ background: s.tone }} />
                  {s.depth}
                </span>
              </div>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{s.detail}</p>
            </li>
          ))}
        </ul>

        <h2 className="mt-14 text-[20px] font-semibold tracking-tight">From recording to review</h2>
        <div className="mt-5 space-y-6 text-[15px] leading-relaxed text-[var(--ink-2)]">
          <p>
            <span className="font-medium text-[var(--ink)]">Findings are computed, not generated.</span> Rules look for
            things every set has: gold left when you were eliminated, loss streaks and what they paid, fights lost at low HP
            with gold in the bank, 2-star upgrades you saw in a shop and passed on, items left on the bench, and your level
            and board against the lobby. Each finding stores the rounds and numbers it used.
          </p>
          <p>
            <span className="font-medium text-[var(--ink)]">The write-up can only cite what the rules found.</span> When a
            language model turns findings into sentences or answers a follow-up question, every number and round it mentions
            is matched back to the recording. A sentence with a claim that doesn&apos;t match is removed before you see it.
          </p>
          <p>
            <span className="font-medium text-[var(--ink)]">The rules are tested.</span> A test suite replays recorded games
            and checks that every cited round exists, that HP and gold add up, and that each finding is true of the rounds it
            points at.
          </p>
          <p>
            <span className="font-medium text-[var(--ink)]">Some things stay out.</span> Riot doesn&apos;t allow apps to show
            augment data, so reviews never mention augments. Nothing is shown while a game is running.
          </p>
        </div>

        <div className="mt-14 flex flex-wrap gap-3">
          <Link href="/review/sample" className="rounded-xl bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[#1a1306] hover:opacity-90">
            Open the sample review
          </Link>
          <Link href="/download" className="rounded-xl border border-[var(--line-2)] px-5 py-3 text-[15px] font-medium hover:bg-[var(--panel-2)]">
            Get the desktop app
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
