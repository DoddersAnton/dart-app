import PlayerCard from "@/components/players/player-card";
import { db } from "@/server";
import { getPlayer } from "@/server/actions/get-player";

export default async function Player({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const player = await getPlayer(id);
  const fines = await db.query.fines.findMany();


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
    orderBy: (f, { desc }) => [desc(f.createdAt)],
  });


  
  
    const data = totalFines.map((item) => ({
      id: item.id,
      player: player.success.name ?? "unknown", // Explicitly cast to Player
      fine: fines.find((c) => c.id === item.fineId)?.title ?? "unknown", // Explicitly cast to Fine
      matchDate: item.matchDate ? item.matchDate.toISOString() : null,
      notes: item.notes,
      amount: fines.find((c) => c.id === item.fineId)?.amount ?? 0,
      status: item.status,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
    }));

  const total = totalFines.reduce((acc, item) => acc + item.fine.amount, 0); // Calculate the total amount

  const playerDetails = {
    ...player.success,
    totalFines: total ?? 0,
    createdAt: player.success.createdAt ? player.success.createdAt.toLocaleDateString("en-GB"): null,
    playerFinesData: data,
  };

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <PlayerCard playerData={playerDetails} />
    </div>
  );
}
  
}
