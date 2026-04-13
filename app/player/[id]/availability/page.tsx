import { notFound } from "next/navigation";
import { db } from "@/server";
import { eq, inArray } from "drizzle-orm";
import { attendance, players } from "@/server/schema";
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

  const fixtureIds = records.map((r) => r.fixtureId);
  const allAttendance = fixtureIds.length > 0
    ? await db.query.attendance.findMany({ where: inArray(attendance.fixtureId, fixtureIds) })
    : [];

  const playerIds = [...new Set(allAttendance.map((a) => a.playerId))];
  const allPlayers = playerIds.length > 0
    ? await db.query.players.findMany({ where: inArray(players.id, playerIds) })
    : [];
  const playerMap = Object.fromEntries(allPlayers.map((p) => [p.id, p.name]));

  type FixtureAttendance = {
    going: { id: number; name: string }[];
    notGoing: { id: number; name: string }[];
    pending: { id: number; name: string }[];
  };

  const fixtureCounts = fixtureIds.reduce<Record<number, FixtureAttendance>>(
    (acc, fid) => {
      const rows = allAttendance.filter((a) => a.fixtureId === fid);
      const toEntry = (a: typeof rows[0]) => ({ id: a.playerId, name: playerMap[a.playerId] ?? "Unknown" });
      acc[fid] = {
        going: rows.filter((a) => a.attending === true).map(toEntry),
        notGoing: rows.filter((a) => a.attending === false).map(toEntry),
        pending: rows.filter((a) => a.attending === null).map(toEntry),
      };
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Availability</h2>
      <AvailabilityClient playerId={playerId} records={records} fixtureCounts={fixtureCounts} />
    </div>
  );
}
