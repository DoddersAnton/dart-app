"use server";

import { db } from "..";
import { practiceGames, practicePlayers } from "../schema";

export async function createPracticeGame(params: {
  gameType: string;
  legs: number;
  players: Array<{ playerId?: number; guestName?: string }>;
}): Promise<{ id: number } | { error: string }> {
  try {
    const [game] = await db
      .insert(practiceGames)
      .values({ gameType: params.gameType, legs: params.legs })
      .returning({ id: practiceGames.id });

    await db.insert(practicePlayers).values(
      params.players.map((p, i) => ({
        practiceGameId: game.id,
        playerId: p.playerId ?? null,
        guestName: p.guestName ?? null,
        orderIndex: i,
      }))
    );

    return { id: game.id };
  } catch (error) {
    console.error("createPracticeGame error:", error);
    return { error: "Failed to create practice game" };
  }
}
