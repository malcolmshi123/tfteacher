import Link from "next/link";
import { CiteText } from "@/components/review/CiteText";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { HighlightSwatch, UnitToken, ringReach } from "@/components/UnitToken";
import { Timeline } from "@/components/review/Timeline";
import { buildSampleGame } from "@/lib/game/sample";
import { analyze, boardValue, shopMarks } from "@/lib/review/engine";
import { PlaceBadge } from "@/components/PlaceBadge";
import { UNIT_BY_ID } from "@/lib/game/set";
import { MY_COMPS, PATCH, radar } from "@/lib/patch/radar";

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
  // the recording so far, up to the round the step chip has always shown
  const saved = review.game.rounds.slice(0, review.game.rounds.findIndex((r) => r.stage === r32.stage) + 1);
  const radar0 = radar()[0];
  // the claim's numbers and where each comes from in the recording
  const checks: [string, string, string][] = [
    [`${r43.hp} HP`, "4-3", "HP at the start of the round"],
    [`${r43.goldEnd} gold`, "4-3", "gold taken into combat"],
    [`${r43.damageTaken} HP`, "4-3", "damage taken"],
    [`${r45.hp} HP`, "4-5", "HP at the start of the round"],
    [`${r45.goldEnd} gold`, "4-5", "gold taken into combat"],
  ];

  return (
    <>
      <SiteNav />
      <main>
        {/* hero */}
        <section className="mx-auto grid max-w-[1240px] gap-10 px-4 pb-16 pt-12 md:px-6 md:pt-20 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-center lg:gap-14">
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
            <p className="mt-4 text-[14px] text-[var(--ink-2)]">Free for 3 round-by-round reviews a week. Works with any set.</p>
          </div>

          {/* hero visual: a real slice of the sample review */}
          <div className="relative">
            <div className="rounded-[20px] border border-[var(--line)] bg-[var(--panel)] p-4 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.7)] md:p-5">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2.5">
                  <PlaceBadge place={review.game.placement} size="md" />
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
            <div className="mt-10 grid gap-4 lg:grid-cols-[auto_minmax(0,1fr)] lg:items-start">
              <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6">
                <div className="text-[13px] font-medium text-[var(--muted)]">What match history shows</div>
                <div className="mt-5 flex flex-wrap gap-x-2.5 gap-y-4 lg:w-[510px]">
                  {last.board.map((p, i) => (
                    <UnitToken key={i} piece={p} size={42} showName={false} />
                  ))}
                </div>
                <dl className="tnum mt-5 grid grid-cols-3 gap-3 text-[13px]">
                  <div>
                    <dt className="text-[var(--muted)]">Placement</dt>
                    <dd className="mt-1"><PlaceBadge place={review.game.placement} size="md" /></dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Level</dt>
                    <dd className="text-[26px] font-semibold leading-tight tracking-tight">{last.level}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Board value</dt>
                    <dd className="text-[26px] font-semibold leading-tight tracking-tight">
                      {boardValue(last.board)} <span className="text-[15px] font-normal text-[var(--muted)]">gold</span>
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
                <div className="mt-5 grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)]">
                {/* highlighted neighbours: rings touch, never overlap */}
                <div className="flex flex-col" style={{ gap: 2 * ringReach(42) }}>
                  {r41.shops.map((shop, si) => (
                    <div key={si} className="flex items-center gap-3">
                      <span className="w-12 text-[11px] text-[var(--muted)]">{si === 0 ? "Free" : `Roll ${si}`}</span>
                      <div className="flex" style={{ gap: 2 * ringReach(42) }}>
                        {shop.map((u, k) => (
                          <UnitToken key={k} unitId={u} size={42} showName={false} state={slotState(si, k, u)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                <dl className="tnum grid content-start gap-4 text-[13px] sm:border-l sm:border-[var(--line)] sm:pl-5">
                  <div>
                    <dt className="text-[var(--muted)]">HP after combat</dt>
                    <dd className="text-[26px] font-semibold leading-tight tracking-tight text-[var(--hp)]">{Math.max(0, r41.hp - r41.damageTaken)}</dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Gold</dt>
                    <dd className="text-[26px] font-semibold leading-tight tracking-tight">
                      {r41.gold} <span className="text-[16px] font-normal text-[var(--muted)]">→ {r41.goldEnd}</span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[var(--muted)]">Rerolls</dt>
                    <dd className="text-[26px] font-semibold leading-tight tracking-tight">{r41.rerolls}</dd>
                  </div>
                </dl>
                </div>
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
                <StepFrame label={`${saved.length} rounds saved so far`}>
                  {/* the round strip from the review, as it fills during a game */}
                  <div className="flex gap-1.5">
                    {saved.slice(-6).map((r) => (
                      <div key={r.stage} className="flex h-[60px] w-12 shrink-0 flex-col items-center justify-between rounded-xl border border-[var(--line)] bg-[var(--bg)] py-2">
                        <span className="tnum text-[12px] text-[var(--ink-2)]">{r.stage}</span>
                        <span
                          className="block h-1 w-5 rounded-full"
                          style={{
                            background: r.kind === "pvp" ? (r.outcome === "win" ? "var(--good)" : "var(--hp)") : r.kind === "pve" ? "var(--line-2)" : "transparent",
                            border: r.kind === "carousel" ? "1px solid var(--ink-2)" : undefined,
                          }}
                        />
                        {r.kind === "carousel" ? <span className="h-[18px]" aria-hidden /> : <span className="tnum text-[13px] font-semibold">{Math.max(0, r.hp - r.damageTaken)}</span>}
                      </div>
                    ))}
                  </div>
                </StepFrame>
              }
            >
              The desktop app saves a snapshot of each round from the game&apos;s official event feed. It never shows anything
              during the game.
            </Step>
            <Step
              title="Read the review when you die"
              visual={
                <StepFrame label="The top finding">
                  {/* the review's first finding, as the review page shows it */}
                  <div className="flex items-start gap-2.5">
                    <span className="tnum grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[color-mix(in_oklab,var(--hp)_15%,transparent)] text-[12px] font-semibold text-[var(--hp)]">1</span>
                    <div className="min-w-0">
                      <div className="text-[14px] font-semibold leading-snug">{top.title}</div>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {top.cites.slice(0, 2).map((c, i) => (
                          <span key={i} className="tnum rounded-md border border-[var(--line)] bg-[var(--bg)] px-2 py-0.5 text-[12px] text-[var(--ink-2)]">
                            <CiteText c={c} />
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </StepFrame>
              }
            >
              A few findings, most costly first. Click any round to see the board, the bench and every shop you saw.
            </Step>
            <Step
              title="Check Patch Radar on patch day"
              visual={
                <StepFrame label={`Patch Radar, ${PATCH.from} to ${PATCH.to}`}>
                  {/* the comp header from Patch Radar */}
                  <div className="flex items-center gap-2 text-[12px] font-medium text-[var(--hp)]">
                    <span className="block h-1.5 w-1.5 rounded-full bg-[var(--hp)]" />
                    Nerfed overall
                  </div>
                  <div className="mt-1 text-[15px] font-semibold">{radar0.comp.name}</div>
                  <div className="mt-3 flex gap-1.5">
                    {radar0.comp.core.map((u) => (
                      <UnitToken key={u} unitId={u} size={30} showName={false} items={radar0.comp.items?.[u] ?? []} />
                    ))}
                  </div>
                </StepFrame>
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
            <div className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 md:p-7">
              <p className="text-[17px] leading-[1.7] text-[var(--ink)]">
                You entered <Cite round>4-3</Cite> at <Cite>{r43.hp} HP</Cite>, fought holding <Cite>{r43.goldEnd} gold</Cite> and lost{" "}
                <Cite>{r43.damageTaken} HP</Cite>. Two rounds later you entered <Cite round>4-5</Cite> at <Cite>{r45.hp} HP</Cite> and still fought holding{" "}
                <Cite>{r45.goldEnd} gold</Cite>.
              </p>
              <ul className="tnum mt-5 divide-y divide-[var(--line)] border-t border-[var(--line)] text-[13px]">
                {checks.map(([v, st, what]) => (
                  <li key={v + st + what} className="grid grid-cols-[18px_76px_40px_minmax(0,1fr)] items-center gap-2 py-2">
                    <svg width="12" height="12" viewBox="0 0 12 12" aria-label="matches">
                      <path d="M2.5 6.5 5 9l4.5-6" fill="none" stroke="var(--good)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="font-medium text-[var(--ink)]">{v}</span>
                    <span className="text-[var(--brand)]">{st}</span>
                    <span className="truncate text-[var(--ink-2)]">{what}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-[12px] text-[var(--muted)]">5 numbers and 2 rounds, all match the recording</div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--line)]">
          <div className="mx-auto flex max-w-[1240px] flex-col items-center px-4 py-24 text-center md:px-6">
            <h2 className="text-balance text-[30px] font-semibold leading-tight tracking-[-0.02em] md:text-[40px]">Your next game is the one to record.</h2>
            <p className="mt-3 text-[16px] text-[var(--ink-2)]">3 free round-by-round reviews a week. Pro is $5 a month for unlimited.</p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
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

// One frame for the step visuals: same height, a small label, a real piece of the product inside.
function StepFrame({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex h-[164px] flex-col overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--panel)] p-4">
      <div className="tnum mb-3 text-[12px] text-[var(--muted)]">{label}</div>
      <div className="min-h-0 flex-1">{children}</div>
    </div>
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
