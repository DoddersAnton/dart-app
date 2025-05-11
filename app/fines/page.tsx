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


  const data = dataTable.map((item) => ({
    id: item.id,
    player: players.find((c) => c.id === item.playerId)?.name ?? "unknown", // Explicitly cast to Player
    fine: fines.find((c) => c.id === item.fineId)?.title ?? "unknown", // Explicitly cast to Fine
    matchDate: item.matchDate ? item.matchDate.toISOString() : null,
    notes: item.notes,
    amount: fines.find((c) => c.id === item.fineId)?.amount ?? 0,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
  }));

  return (
    <div className="mt-22">
      <PlayerFinesSummary
        playerFinesData={data}
      />
    </div>
  );
}
