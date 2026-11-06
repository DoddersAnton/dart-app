import { getGame } from "@/server/actions/get-game";
import { getGamesByFixture } from "@/server/actions/get-games-by-fixture";
import { getAppSettings } from "@/server/actions/get-app-settings";
import DisplayMode from "@/components/games/display-mode";
import { notFound } from "next/navigation";
export const dynamic = "force-dynamic";

export default async function DisplayPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const gameId = Number(id);

  if (isNaN(gameId)) notFound();

  const [result, settings] = await Promise.all([getGame(gameId), getAppSettings()]);
  if (result.error || !result.success) notFound();

  const siblingsResult = await getGamesByFixture(result.success.fixtureId);
  const siblingGames = siblingsResult.success ?? [];
  const maxLegsPerGame = settings.success?.maxLegsPerGame ?? 3;

  return <DisplayMode gameData={result.success} siblingGames={siblingGames} maxLegsPerGame={maxLegsPerGame} />;
}
