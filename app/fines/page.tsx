import { db } from "@/server";

import { desc } from "drizzle-orm";
import { PlayerFinesSummary } from "./player-fines-summary";
export const dynamic = "force-dynamic";

export default async function Page() {
  const players = await db.query.players.findMany();
  const fines = await db.query.fines.findMany();

  const dataTable = await db.query.playerFines.findMany({
    /* with: {
      players: true,
      fine: true,
    },*/
    orderBy: (f) => [desc(f.createdAt)],
  });


  const data = dataTable.map((item) => {
    const player = players.find((c) => c.id === item.playerId);
    const playerName = player?.name ?? "";
    const nickname = player?.nickname;
    const displayName = nickname ? `${playerName} (${nickname})` : playerName;
    
    return {
      id: item.id,
      player: displayName,
      fine: fines.find((c) => c.id === item.fineId)?.title ?? "unknown",
      matchDate: item.matchDate ? item.matchDate.toISOString() : null,
      notes: item.notes,
      amount: fines.find((c) => c.id === item.fineId)?.amount ?? 0,
      createdAt: item.createdAt ? item.createdAt.toISOString() : null,
      status: item.status ?? "Pending",
    };
  });

  return (
    <div className="w-full mt-22 lg:w-[80%] px-2 mx-auto">
      <PlayerFinesSummary
        playerFinesData={data}
      />
    </div>
  );
}
