import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { ReviewView } from "@/components/review/ReviewView";
import { buildSampleGame } from "@/lib/game/sample";
import { analyze } from "@/lib/review/engine";

export const metadata = { title: "Game review · Afterboard" };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ round?: string }>;
}) {
  const { id } = await params;
  const { round } = await searchParams;
  if (id !== "sample") notFound();
  const review = analyze(buildSampleGame());
  const initial = review.game.rounds.some((r) => r.stage === round) ? round : undefined;
  return (
    <>
      <SiteNav active="/review/sample" />
      <main>
        <ReviewView review={review} initialRound={initial} />
      </main>
      <SiteFooter />
    </>
  );
}
