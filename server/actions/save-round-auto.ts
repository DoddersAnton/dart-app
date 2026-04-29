"use server";

import { db } from "..";
import { rounds } from "../schema";

export async function saveRoundAuto(params: {
  gameId: number;
  leg: number;
  roundNumber: number;
  playerId: number;
  homeScore: number;
  awayScore: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(rounds).values({
      gameId: params.gameId,
      leg: params.leg,
      roundNumber: params.roundNumber,
      playerId: params.playerId,
      homeScore: params.homeScore,
      awayScore: params.awayScore,
    });
    return { success: true };
  } catch (error) {
    console.error("saveRoundAuto error:", error);
    return { success: false, error: JSON.stringify(error) };
  }
}
