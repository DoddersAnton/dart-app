"use server";

import { db } from "..";
import { practiceRounds } from "../schema";
import { and, eq, desc } from "drizzle-orm";

export async function deleteLastPracticeThrow(
  practiceGameId: number,
  leg: number
): Promise<{ id: number } | null> {
  const last = await db.query.practiceRounds.findFirst({
    where: and(
      eq(practiceRounds.practiceGameId, practiceGameId),
      eq(practiceRounds.leg, leg)
    ),
    orderBy: desc(practiceRounds.throwNumber),
  });
  if (!last) return null;
  await db.delete(practiceRounds).where(eq(practiceRounds.id, last.id));
  return { id: last.id };
}
