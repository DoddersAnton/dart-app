import { db } from ".";

// Resolve the season whose [startDate, endDate] contains the given date.
// Returns null when there's no date or no matching season (fine stays unlinked).
export async function resolveSeasonIdForDate(date: Date | null | undefined): Promise<number | null> {
  if (!date) return null;
const match = await db.query.seasons.findFirst({
  where: (s, { and, lte, gte }) => and(lte(s.startDate, date), gte(s.endDate, date)),
  orderBy: (s, { desc }) => [desc(s.startDate)],
});
return match?.id ?? null;
}
