import { SiteFooter, SiteNav } from "@/components/SiteChrome";

export const metadata = { title: "Privacy · TFTeacher" };

const ITEMS = [
  { q: "What the app records", a: "One snapshot per round of your own game: gold, HP, level, the shops you saw, your board, bench and items, and the HP, level and boards of the other players as the game shows them. Nothing else on your computer." },
  { q: "When it's sent", a: "Only after the match ends. Nothing is sent or shown while a game is running." },
  { q: "What we keep", a: "Your recordings and the reviews made from them, so you can open old games and see trends. Delete any game, or your whole account, from settings at any time." },
  { q: "Questions you ask", a: "Your question and the facts from that game are sent to our language model provider to write the answer. They aren't used to train models." },
  { q: "What we never do", a: "Sell your data, show ads, or read game memory." },
];

export default function Privacy() {
  return (
    <>
      <SiteNav />
      <main className="mx-auto max-w-[760px] px-4 pb-24 pt-12 md:px-6 md:pt-16">
        <h1 className="text-[32px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">Privacy</h1>
        <p className="mt-4 text-[17px] leading-relaxed text-[var(--ink-2)]">The short version of what TFTeacher collects and why.</p>
        <dl className="mt-10 divide-y divide-[var(--line)] border-y border-[var(--line)]">
          {ITEMS.map((i) => (
            <div key={i.q} className="grid gap-2 py-6 md:grid-cols-[220px_1fr] md:gap-8">
              <dt className="text-[15px] font-semibold">{i.q}</dt>
              <dd className="text-[15px] leading-relaxed text-[var(--ink-2)]">{i.a}</dd>
            </div>
          ))}
        </dl>
      </main>
      <SiteFooter />
    </>
  );
}
