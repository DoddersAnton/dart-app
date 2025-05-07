import PlayerCard from "@/components/players/player-card";
import { db } from "@/server";
import { getPlayer } from "@/server/actions/get-player";
import { create } from "domain";

export default async function Player({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (player.error) {
    return <div>{player.error}</div>;
  }

  if (!player) {
    return (
      <div className="container mx-auto py-12 mt-22">
        <h1 className="text-2xl font-bold">Player not found</h1>
      </div>
    );
  }

if (player.success) {
  const totalFines = await db.query.playerFines.findMany({
    where: (f, { eq }) => eq(f.playerId, player.success.id ?? 0),
    with: {
      fine: true,
    },
  });

  const total = totalFines.reduce((acc, item) => acc + item.fine.amount, 0); // Calculate the total amount

  const playerWithFines = {
    ...player.success,
    totalFines: total ?? 0,
    createdAt: player.success.createdAt ? player.success.createdAt.toLocaleDateString("en-GB"): null,
  };

  return (
    <div className="mt-22 px-2 w-full mx-auto lg:w-[50%]">
      <PlayerCard playerData={playerWithFines} />
    </div>
  );
}
  
}
