"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { attendance, players } from "../schema";

export async function getFixtureAvailability(fixtureId: number) {
  const records = await db
    .select({
      attending: attendance.attending,
      note: attendance.note,
      playerId: players.id,
      playerName: players.name,
      playerNickname: players.nickname,
      playerImgUrl: players.imgUrl,
    })
    .from(attendance)
    .innerJoin(players, eq(attendance.playerId, players.id))
    .where(eq(attendance.fixtureId, fixtureId))
    .orderBy(players.name);

  return records;
}
