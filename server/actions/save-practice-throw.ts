"use server";

import { db } from "..";
import { practiceRounds } from "../schema";

export async function savePracticeThrow(params: {
  practiceGameId: number;
  practicePlyrId: number;
  leg: number;
  throwNumber: number;
  score: number;
  remainingScore: number;
  dartsUsed?: number;
}): Promise<{ id: number }> {
  const [row] = await db
    .insert(practiceRounds)
    .values({
      practiceGameId: params.practiceGameId,
      practicePlyrId: params.practicePlyrId,
      leg: params.leg,
      throwNumber: params.throwNumber,
      score: params.score,
      remainingScore: params.remainingScore,
      dartsUsed: params.dartsUsed ?? 3,
    })
    .returning({ id: practiceRounds.id });
  return row;
}
