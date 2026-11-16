import { notFound } from "next/navigation";
import { SiteFooter, SiteNav } from "@/components/SiteChrome";
import { ReviewView } from "@/components/review/ReviewView";
import { gameById } from "@/lib/game/games";
import { analyze } from "@/lib/review/engine";

export const metadata = { title: "Game review · TFTeacher" };

export default async function ReviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ round?: string }>;
}) {
  const { id } = await params;
  const { round } = await searchParams;
  const found = gameById(id);
  if (!found) notFound();
  const review = analyze(found.game);
  const initial = review.game.rounds.some((r) => r.stage === round) ? round : undefined;
  return (
    <>
      <SiteNav active="/reviews" />
      <main>
        <ReviewView review={review} initialRound={initial} />
      </main>
      <SiteFooter />
    </>
  );
}
