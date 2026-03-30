"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { attendance, fixtures, locations } from "../schema";

export async function getPlayerAvailability(playerId: number) {
  const records = await db
    .select({
      id: attendance.id,
      attending: attendance.attending,
      note: attendance.note,
      fixtureId: fixtures.id,
      matchDate: fixtures.matchDate,
      homeTeam: fixtures.homeTeam,
      awayTeam: fixtures.awayTeam,
      matchStatus: fixtures.matchStatus,
      league: fixtures.league,
      season: fixtures.season,
      locationName: locations.name,
      locationAddress: locations.address,
      locationMapsLink: locations.googleMapsLink,
    })
    .from(attendance)
    .innerJoin(fixtures, eq(attendance.fixtureId, fixtures.id))
    .leftJoin(locations, eq(fixtures.matchLocationId, locations.id))
    .where(eq(attendance.playerId, playerId))
    .orderBy(fixtures.matchDate);

  return records;
}
