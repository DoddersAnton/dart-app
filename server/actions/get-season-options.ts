"use server";

import { db } from "..";

export type SeasonOption = { id: number; name: string; startDate: string; endDate: string };

// Seasons with raw ISO start/end dates — for season <select>s and the
// "which season contains this date" defaulting (getSeasons formats dates for display).
export async function getSeasonOptions(): Promise<SeasonOption[]> {
  try {
    const seasons = await db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] });
    return seasons.map((s) => ({
      id: s.id,
      name: s.name,
      startDate: s.startDate.toISOString(),
      endDate: s.endDate.toISOString(),
    }));
  } catch (error) {
    console.error("getSeasonOptions error:", error);
    return [];
  }
}
