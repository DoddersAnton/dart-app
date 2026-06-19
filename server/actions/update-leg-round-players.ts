"use server";

import { and, eq } from "drizzle-orm";
import { db } from "..";
import { rounds } from "../schema";

// Re-attribute already-saved rounds in a leg to corrected players (used when the
// throwing order is switched mid-leg). Matches on gameId + leg + roundNumber.
export async function updateLegRoundPlayers(params: {
  gameId: number;
  leg: number;
  rounds: { roundNumber: number; homePlayerId?: number | null; awayPlayerId?: number | null }[];
}): Promise<{ success: boolean; error?: string }> {
  try {
    await Promise.all(
      params.rounds.map((r) =>
        db
          .update(rounds)
          .set({ homePlayerId: r.homePlayerId ?? null, awayPlayerId: r.awayPlayerId ?? null })
          .where(
            and(
              eq(rounds.gameId, params.gameId),
              eq(rounds.leg, params.leg),
              eq(rounds.roundNumber, r.roundNumber),
            ),
          ),
      ),
    );
    return { success: true };
  } catch (error) {
    console.error("updateLegRoundPlayers error:", error);
    return { success: false, error: JSON.stringify(error) };
  }
}
