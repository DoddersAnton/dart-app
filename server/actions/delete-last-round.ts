"use server";

import { db } from "..";
import { rounds } from "../schema";
import { and, eq } from "drizzle-orm";

export async function deleteLastRound(params: {
  gameId: number;
  leg: number;
  roundNumber: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db
      .delete(rounds)
      .where(
        and(
          eq(rounds.gameId, params.gameId),
          eq(rounds.leg, params.leg),
          eq(rounds.roundNumber, params.roundNumber)
        )
      );
    return { success: true };
  } catch (error) {
    console.error("deleteLastRound error:", error);
    return { success: false, error: JSON.stringify(error) };
  }
}
