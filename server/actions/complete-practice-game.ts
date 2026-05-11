"use server";

import { db } from "..";
import { practiceGames, practicePlayers } from "../schema";
import { eq } from "drizzle-orm";

export async function completePracticeGame(
  id: number,
  legsWon: Array<{ practicePlyrId: number; legs: number }>
): Promise<void> {
  await Promise.all([
    db
      .update(practiceGames)
      .set({ status: "complete", completedAt: new Date() })
      .where(eq(practiceGames.id, id)),
    ...legsWon.map(({ practicePlyrId, legs }) =>
      db
        .update(practicePlayers)
        .set({ legsWon: legs })
        .where(eq(practicePlayers.id, practicePlyrId))
    ),
  ]);
}
