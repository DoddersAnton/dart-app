import DartTracker from "@/components/games/dart-tracker";
import { getGame } from "@/server/actions/get-game";
import { getAppSettings } from "@/server/actions/get-app-settings";

export default async function LaunchDartTracker({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const gameId = Number(id);

  if (!gameId) {
    return <div className="mt-24 container mx-auto py-12">No game specified.</div>;
  }

  const [game, settings] = await Promise.all([getGame(gameId), getAppSettings()]);

  if (game.error || !game.success) {
    return <div className="mt-24 container mx-auto py-12">{game.error ?? "Game not found"}</div>;
  }

  const maxLegsPerGame = settings.success?.maxLegsPerGame ?? 3;

  return (
    <div className="w-full px-2 mx-auto max-w-2xl mt-20 pb-8">
      <DartTracker gameData={game.success} maxLegsPerGame={maxLegsPerGame} />
    </div>
  );
}
