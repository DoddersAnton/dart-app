"use server";

import { db } from "..";
import { attendance } from "../schema";
import { sql } from "drizzle-orm";

export type FixtureAvailabilitySummary = {
  fixtureId: number;
  going: number;
  notGoing: number;
  pending: number;
  total: number;
};

export async function getFixturesAvailabilitySummary(): Promise<FixtureAvailabilitySummary[]> {
  const records = await db
    .select({
      fixtureId: attendance.fixtureId,
      going: sql<number>`count(case when ${attendance.attending} = true then 1 end)`,
      notGoing: sql<number>`count(case when ${attendance.attending} = false then 1 end)`,
      pending: sql<number>`count(case when ${attendance.attending} is null then 1 end)`,
      total: sql<number>`count(*)`,
    })
    .from(attendance)
    .groupBy(attendance.fixtureId);

  return records.map((r) => ({
    fixtureId: r.fixtureId,
    going: Number(r.going),
    notGoing: Number(r.notGoing),
    pending: Number(r.pending),
    total: Number(r.total),
  }));
}
