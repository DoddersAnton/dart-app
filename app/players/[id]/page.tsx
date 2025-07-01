import PlayerCard from "@/components/players/player-card";
import { getPlayer } from "@/server/actions/get-player";

export default async function Player({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);

  if (player.error) {
    return <div className="mt-22">{player.error}</div>;
  }

  if (!player) {
    return (
      <div className="container mx-auto py-12 mt-22">
        <h1 className="text-2xl font-bold">Player not found</h1>
      </div>
    );
  }

if (player.success) {
  

  const playerDetails = {
    ...player.success,
    createdAt: player.success.createdAt ? player.success.createdAt.toLocaleDateString("en-GB"): null,
  };

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <PlayerCard playerData={playerDetails} />
    </div>
  );
}
  
}
