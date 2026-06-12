import { db } from "@/server";
import { auth } from "@clerk/nextjs/server";

import { desc, eq } from "drizzle-orm";
import { players as playersTable, playerFines } from "@/server/schema";
import { PlayerFinesSummary } from "./player-fines-summary";
import { cookies } from "next/headers";
export const dynamic = "force-dynamic";

export default async function Page() {
  const { userId: clerkUserId } = await auth();

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  const [players, linkedPlayer] = await Promise.all([
    db.query.players.findMany(),
    clerkUserId
      ? db.query.players.findFirst({ where: eq(playersTable.userid, clerkUserId) })
      : Promise.resolve(undefined),
  ]);
  const fines = await db.query.fines.findMany();

  // Strictly filter fines by the active team — only show fines that belong to it
  const dataTable = await db.query.playerFines.findMany({
    where: activeTeamId ? eq(playerFines.teamId, activeTeamId) : undefined,
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
      playerImgUrl: player?.imgUrl ?? null,
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
        myPlayerId={linkedPlayer?.id ?? null}
      />
    </div>
  );
}
