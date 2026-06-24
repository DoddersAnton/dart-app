import { db } from ".";

// Resolve the season whose [startDate, endDate] contains the given date.
// Returns null when there's no date or no matching season (fine stays unlinked).
export async function resolveSeasonIdForDate(date: Date | null | undefined): Promise<number | null> {
  if (!date) return null;
  const seasons = await db.query.seasons.findMany();
  const t = date.getTime();
  const match = seasons.find((s) => s.startDate.getTime() <= t && t <= s.endDate.getTime());
  return match?.id ?? null;
}
