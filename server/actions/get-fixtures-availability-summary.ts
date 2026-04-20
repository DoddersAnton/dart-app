"use server";

import { db } from "..";
import { attendance, players } from "../schema";
import { eq } from "drizzle-orm";

export type FixtureAvailabilityDetail = {
  fixtureId: number;
  going: { id: number; name: string }[];
  notGoing: { id: number; name: string }[];
  pending: { id: number; name: string }[];
};

export async function getFixturesAvailabilitySummary(): Promise<FixtureAvailabilityDetail[]> {
  const records = await db
    .select({
      fixtureId: attendance.fixtureId,
      attending: attendance.attending,
      playerId: players.id,
      playerName: players.name,
    })
    .from(attendance)
    .innerJoin(players, eq(attendance.playerId, players.id))
    .orderBy(players.name);

  const map = new Map<number, FixtureAvailabilityDetail>();

  for (const r of records) {
    if (!map.has(r.fixtureId)) {
      map.set(r.fixtureId, { fixtureId: r.fixtureId, going: [], notGoing: [], pending: [] });
    }
    const entry = map.get(r.fixtureId)!;
    const player = { id: r.playerId, name: r.playerName };
    if (r.attending === true) entry.going.push(player);
    else if (r.attending === false) entry.notGoing.push(player);
    else entry.pending.push(player);
  }

  return Array.from(map.values());
}
