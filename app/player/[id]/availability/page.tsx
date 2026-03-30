import { notFound } from "next/navigation";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { players } from "@/server/schema";
import { getPlayerAvailability } from "@/server/actions/get-player-availability";
import { AvailabilityClient } from "./availability-client";

export default async function PlayerAvailabilityPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);

  const [player, records] = await Promise.all([
    db.query.players.findFirst({ where: eq(players.id, playerId) }),
    getPlayerAvailability(playerId),
  ]);

  if (!player) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Availability</h2>
      <AvailabilityClient playerId={playerId} records={records} />
    </div>
  );
}
