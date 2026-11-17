import Link from "next/link";
import { CiteText } from "@/components/review/CiteText";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { HighlightSwatch, UnitToken } from "@/components/UnitToken";
import { Timeline } from "@/components/review/Timeline";
import { buildSampleGame } from "@/lib/game/sample";
import { analyze, boardValue, shopMarks, placeColor } from "@/lib/review/engine";
import { UNIT_BY_ID } from "@/lib/game/set";
import { MY_COMPS } from "@/lib/patch/radar";

export default function Home() {
  const review = analyze(buildSampleGame());
  const top = review.findings[0];
  const i41 = review.game.rounds.findIndex((r) => r.stage === "4-1");
  const r41 = review.game.rounds[i41];
  // which slots were bought and which upgrades were left in the shop (same walk the review uses)
  const marks = shopMarks(review.game.rounds[i41 - 1], r41);
  // flex units for this comp that showed up, so you can see what else fit the board
  const flex = new Set(MY_COMPS[0].flex ?? []);
  const slotState = (si: number, k: number, u: string) => {
    const key = `${si}:${k}`;
    return marks.bought.has(key) ? "bought" : marks.missed.has(key) ? "missed" : flex.has(u) ? "flex" : "dim";
  };
  const anyMissed = marks.missed.size > 0;
  const xpCost = r41.xpBought * 4;
  const rollCost = r41.rerolls * 2;
  const buyCost = r41.bought.reduce((a, u) => a + UNIT_BY_ID[u].cost, 0);
  const soldFor = r41.soldGold;
  const soldNames = [...new Set(r41.sold.map((u) => UNIT_BY_ID[u].name))].join(", ");
  const last = review.game.rounds[review.game.rounds.length - 1];
  const r32 = review.game.rounds.find((r) => r.stage === "3-2")!;
  const r43 = review.game.rounds.find((r) => r.stage === "4-3")!;
  const r45 = review.game.rounds.find((r) => r.stage === "4-5")!;

  return (
    <>
      <SiteNav />
      <main>
        {/* hero */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-16 pt-12 md:px-6 md:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-14">
          <div className="lg:pt-14">
            <h1 className="text-[40px] font-semibold leading-[1.04] tracking-[-0.035em] text-balance md:text-[56px]">
              Find out why you went 8th.
            </h1>
            <p className="mt-5 max-w-[480px] text-[17px] leading-relaxed text-[var(--ink-2)]">
              TFTeacher records every round of your Teamfight Tactics game. When it ends, you get the few decisions that
              cost you placements, each one tied to the round it happened in.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link href="/download" className="rounded-xl bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[#1a1306] transition-opacity hover:opacity-90">
                Download for Windows
              </Link>
              <Link href="/review/sample" className="rounded-xl border border-[var(--line-2)] px-5 py-3 text-[15px] font-medium text-[var(--ink)] transition-colors hover:bg-[var(--panel-2)]">
                See a sample review
              </Link>
            </div>
            <p className="mt-4 text-[14px] text-[var(--ink-2)]">Free for 3 reviews a week. Works with any set.</p>
          </div>

          {/* hero visual: a real slice of the sample review */}
          <div className="relative">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] md:p-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <span className="tnum grid h-8 min-w-8 place-items-center rounded-lg px-1.5 text-[15px] font-semibold" style={{ color: placeColor(review.game.placement), background: `color-mix(in oklab, ${placeColor(review.game.placement)} 16%, var(--panel-2))` }}>{review.game.placement}</span>
                  <div>
                    <div className="text-[13px] font-medium">Sample game · Ranked · {review.game.patch}</div>
                    <div className="text-[12px] text-[var(--muted)]">Recorded round by round</div>
                  </div>
                </div>
                <span className="text-[12px] text-[var(--muted)]">{review.game.durationMin} min</span>
              </div>
              <div className="mt-3">
                <Timeline series={review.series} highlight={top.stages} selected={top.focus} compact width={560} />
              </div>
              <div className="mt-3 rounded-2xl border border-[var(--line)] bg-[var(--panel-2)] p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-[7px] block h-2 w-2 shrink-0 rounded-full bg-[var(--hp)]" />
                  <div>
                    <div className="text-[15px] font-semibold leading-snug tracking-tight">{top.title}</div>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--ink-2)]">{top.advice}</p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {top.cites.map((c, i) => (
                        <span key={i} className="tnum rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[12px] text-[var(--ink-2)]">
                          <CiteText c={c} />
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* final board vs whole game */}
        <section className="border-t border-[var(--line)]">
          <div className="mx-auto max-w-[1240px] px-4 py-20 md:px-6">
            <div className="max-w-[640px]">
              <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[34px]">Your final board is the least interesting part of the game.</h2>
              <p className="mt-4 text-[16px] leading-relaxed text-[var(--ink-2)]">
                Match history shows where you ended up. The game was decided earlier: a loss streak held too long, a 2-star
                you rolled past, gold you never spent.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-2 md:items-start">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
                <div className="text-[13px] font-medium text-[var(--muted)]">What match history shows</div>
                <div className="mt-5 flex flex-wrap gap-x-2.5 gap-y-3">
                  {last.board.map((p, i) => (
                    <UnitToken key={i} piece={p} size={50} />
                  ))}
                </div>
                <dl className="tnum mt-5 grid grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <dt className="text-[var(--muted)]">Placement</dt>
                    <dd className="text-[18px] font-semibold" style={{ color: placeColor(review.game.placement) }}>{review.game.placement}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Level</dt>
                    <dd className="text-[18px] font-semibold">{last.level}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Board value</dt>
                    <dd className="text-[18px] font-semibold">
                      {boardValue(last.board)} <span className="text-[13px] font-normal text-[var(--muted)]">gold</span>
                    </dd>
                  </div>
                </dl>
                <div className="mt-5 rounded-xl border border-dashed border-[var(--line-2)] px-4 py-6 text-center text-[13px] text-[var(--muted)]">
                  No shops, no gold, no HP. Nothing from rounds 1-1 to {last.stage}.
                </div>
                <p className="mt-5 text-[14px] leading-relaxed text-[var(--ink-2)]">Where you ended up, and nothing about how you got there.</p>
              </div>
              <div className="rounded-2xl border border-[var(--line-2)] bg-[var(--panel-2)] p-6">
                <div className="text-[13px] font-medium text-[var(--brand)]">What TFTeacher sees at 4-1 alone</div>
                <div className="mt-5 space-y-2">
                  {r41.shops.map((shop, si) => (
                    <div key={si} className="flex items-center gap-3">
                      <span className="w-12 text-[11px] text-[var(--muted)]">{si === 0 ? "Free" : `Roll ${si}`}</span>
                      <div className="flex gap-2.5">
                        {shop.map((u, k) => (
                          <UnitToken key={k} unitId={u} size={28} showName={false} state={slotState(si, k, u)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <dl className="tnum mt-5 grid grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <dt className="text-[var(--muted)]">HP after combat</dt>
                    <dd className="text-[18px] font-semibold text-[var(--hp)]">{Math.max(0, r41.hp - r41.damageTaken)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Gold</dt>
                    <dd className="text-[18px] font-semibold">
                      {r41.gold} <span className="text-[13px] font-normal text-[var(--muted)]">→ {r41.goldEnd}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Rerolls</dt>
                    <dd className="text-[18px] font-semibold">{r41.rerolls}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-[12px] text-[var(--ink-2)] [&>span]:gap-2">
                  <span className="flex items-center gap-1.5"><HighlightSwatch state="bought" />Bought</span>
                  {anyMissed && <span className="flex items-center gap-1.5"><HighlightSwatch state="missed" />Missed</span>}
                  <span className="flex items-center gap-1.5"><HighlightSwatch state="flex" />Flex option</span>
                </div>
                <p className="tnum mt-3 text-[13px] text-[var(--muted)]">
                  {r41.gold} gold: {xpCost > 0 && <>{xpCost} on XP, </>}{rollCost} on {r41.rerolls} rerolls, {buyCost} on {r41.bought.length} unit buys, plus {soldFor} for selling{" "}
                  {soldNames}. {r41.goldEnd} left.
                </p>
                <p className="mt-4 text-[14px] leading-relaxed text-[var(--ink-2)]">
                  Every shop, every reroll, gold and HP at the start of each round, your bench and the lobby around you.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* how */}
        <section className="border-t border-[var(--line)]">
          <h2 className="mx-auto max-w-[1240px] px-4 pt-20 text-[28px] font-semibold leading-tight tracking-[-0.02em] md:px-6 md:text-[34px]">How it works</h2>
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-20 pt-10 md:px-6 lg:grid-cols-3">
            <Step
              title="Play with the app open"
              visual={
                <div className="flex items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[13px]">
                  <span className="flex items-center gap-2 text-[var(--ink-2)]">
                    <span className="block h-2 w-2 rounded-full bg-[var(--hp)]" />
                    Recording
                  </span>
                  <span className="tnum text-[var(--muted)]">{review.game.rounds.findIndex((r) => r.stage === r32.stage) + 1} rounds saved so far</span>
                </div>
              }
            >
              The desktop app saves a snapshot of each round from the game&apos;s official event feed. It never shows anything
              during the game.
            </Step>
            <Step
              title="Read the review when you die"
              visual={
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[13px]">
                  <span className="truncate text-[var(--ink)]">Died on {last.stage} holding {last.goldEnd} gold</span>
                  <span className="tnum grid h-6 min-w-6 shrink-0 place-items-center rounded-md px-1 text-[13px] font-semibold" style={{ color: placeColor(review.game.placement), background: `color-mix(in oklab, ${placeColor(review.game.placement)} 16%, var(--panel-2))` }}>{review.game.placement}</span>
                </div>
              }
            >
              A few findings, most costly first. Click any round to see the board, the bench and every shop you saw.
            </Step>
            <Step
              title="Check Patch Radar on patch day"
              visual={
                <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-3 text-[13px]">
                  <span className="text-[var(--ink)]">{MY_COMPS[0].name}</span>
                  <span className="shrink-0 text-[12px] font-medium text-[var(--hp)]">Nerfed</span>
                </div>
              }
            >
              We read the patch notes against the comps you actually play and tell you which ones got better or worse.
            </Step>
          </div>
        </section>

        {/* trust */}
        <section className="border-t border-[var(--line)]">
          <div className="mx-auto grid max-w-[1240px] gap-10 px-4 py-20 md:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:items-center">
            <div>
              <h2 className="text-[28px] font-semibold leading-tight tracking-[-0.02em] md:text-[34px]">Every claim points at a round.</h2>
              <p className="mt-4 max-w-[520px] text-[16px] leading-relaxed text-[var(--ink-2)]">
                Findings are computed from your recording, not guessed by a chatbot. The written explanation is checked against
                those numbers before you see it, and anything it can&apos;t back up is cut.
              </p>
              <Link href="/how-it-works" className="mt-6 inline-block text-[15px] font-medium text-[var(--brand)] hover:underline">
                How reviews are checked
              </Link>
            </div>
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
              <p className="text-[15px] leading-relaxed text-[var(--ink)]">
                &ldquo;You entered <Cite round>4-3</Cite> at <Cite>{r43.hp} HP</Cite>, fought holding <Cite>{r43.goldEnd} gold</Cite> and lost{" "}
                <Cite>{r43.damageTaken} HP</Cite>. Two rounds later you entered <Cite round>4-5</Cite> at <Cite>{r45.hp} HP</Cite> and still fought holding{" "}
                <Cite>{r45.goldEnd} gold</Cite>.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-2 text-[12px] text-[var(--muted)]">
                <span className="block h-1.5 w-1.5 rounded-full bg-[var(--good)]" />5 numbers and 2 rounds, all match the recording
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-[1240px] flex-col items-start gap-6 px-4 py-16 md:flex-row md:items-center md:justify-between md:px-6">
            <div>
              <h2 className="text-[24px] font-semibold tracking-tight">Your next game is the one to record.</h2>
              <p className="mt-2 text-[15px] text-[var(--ink-2)]">3 free reviews a week. Pro is $5 a month for unlimited reviews.</p>
            </div>
            <div className="flex gap-3">
              <Link href="/download" className="rounded-xl bg-[var(--brand)] px-5 py-3 text-[15px] font-semibold text-[#1a1306] hover:opacity-90">
                Download for Windows
              </Link>
              <Link href="/pricing" className="rounded-xl border border-[var(--line-2)] px-5 py-3 text-[15px] font-medium hover:bg-[var(--panel-2)]">
                Compare plans
              </Link>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function Step({ title, children, visual }: { title: string; children: React.ReactNode; visual?: React.ReactNode }) {
  return (
    <div>
      {visual && <div className="mb-5">{visual}</div>}
      <h3 className="text-[18px] font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--ink-2)]">{children}</p>
    </div>
  );
}

// A checked value: a round (in brand color) or a number from that round.
function Cite({ round, children }: { round?: boolean; children: React.ReactNode }) {
  return (
    <span className={`tnum whitespace-nowrap rounded-md border border-[var(--line-2)] bg-[var(--bg)] px-1.5 py-0.5 text-[14px] ${round ? "font-medium text-[var(--brand)]" : "text-[var(--ink)]"}`}>
      {children}
    </span>
  );
}
