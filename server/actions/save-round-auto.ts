"use server";

import { db } from "..";
import { rounds } from "../schema";

export async function saveRoundAuto(params: {
  gameId: number;
  leg: number;
  roundNumber: number;
  homePlayerId?: number;
  awayPlayerId?: number;
  homeScore: number;
  awayScore: number;
  homeDartsUsed?: number;
  awayDartsUsed?: number;
  homeDartsAtDouble?: number;
  awayDartsAtDouble?: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    await db.insert(rounds).values({
      gameId: params.gameId,
      leg: params.leg,
      roundNumber: params.roundNumber,
      homePlayerId: params.homePlayerId,
      awayPlayerId: params.awayPlayerId,
      homeScore: params.homeScore,
      awayScore: params.awayScore,
      homeDartsUsed: params.homeDartsUsed,
      awayDartsUsed: params.awayDartsUsed,
      homeDartsAtDouble: params.homeDartsAtDouble ?? 0,
      awayDartsAtDouble: params.awayDartsAtDouble ?? 0,
    });
    return { success: true };
  } catch (error) {
    console.error("saveRoundAuto error:", error);
    return { success: false, error: JSON.stringify(error) };
  }
}
