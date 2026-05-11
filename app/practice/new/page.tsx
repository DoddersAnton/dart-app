import { db } from "@/server";
import { players } from "@/server/schema";
import { asc } from "drizzle-orm";
import PracticeSetup from "@/components/practice/practice-setup";

export default async function PracticeNewPage({
  searchParams,
}: {
  searchParams: Promise<{ playerId?: string }>;
}) {
  const { playerId } = await searchParams;

  const playerList = await db
    .select({ id: players.id, name: players.name, nickname: players.nickname, imgUrl: players.imgUrl })
    .from(players)
    .orderBy(asc(players.name));

  return (
    <div className="w-full px-4 mx-auto max-w-lg mt-24 pb-12">
      <PracticeSetup
        playerList={playerList}
        preselectedPlayerId={playerId ? Number(playerId) : undefined}
      />
    </div>
  );
}
