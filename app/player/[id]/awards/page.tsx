import { notFound } from "next/navigation";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { players } from "@/server/schema";
import { getPlayerAwards } from "@/server/actions/get-player-awards";
import { getAwards } from "@/server/actions/get-awards";
import { getSeasons } from "@/server/actions/get-seasons";
import { PlayerAwardsClient } from "@/components/awards/player-awards-client";

export const dynamic = "force-dynamic";

export default async function PlayerAwardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);

  const [player, playerAwardsResult, awardTypesResult, seasonsResult] = await Promise.all([
    db.query.players.findFirst({ where: eq(players.id, playerId) }),
    getPlayerAwards(playerId),
    getAwards(),
    getSeasons(),
  ]);

  if (!player) notFound();

  const playerAwardsList = playerAwardsResult.success ?? [];
  const awardTypes = awardTypesResult.success ?? [];
  const seasons = (seasonsResult.success ?? []).map((s) => ({
    id: s.id,
    name: s.name,
  }));

  return (
    <PlayerAwardsClient
      playerId={playerId}
      playerName={player.name}
      playerAwards={playerAwardsList}
      awardTypes={awardTypes}
      seasons={seasons}
    />
  );
}
