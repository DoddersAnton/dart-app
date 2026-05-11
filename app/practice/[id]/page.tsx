import { notFound } from "next/navigation";
import { getPracticeGame } from "@/server/actions/get-practice-game";
import PracticeTracker from "@/components/practice/practice-tracker";

export default async function PracticeGamePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const game = await getPracticeGame(Number(id));

  if (!game) notFound();

  return (
    <div className="w-full px-4 mx-auto max-w-2xl mt-20 pb-12">
      <PracticeTracker gameData={game} />
    </div>
  );
}
