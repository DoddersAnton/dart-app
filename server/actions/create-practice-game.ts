"use server";

import { db } from "..";
import { practiceGames, practicePlayers } from "../schema";

export async function createPracticeGame(params: {
  gameType: string;
  legs: number;
  gameMode?: string;
  players: Array<{ playerId?: number; guestName?: string; team?: string }>;
}): Promise<{ id: number } | { error: string }> {
  try {
    const [game] = await db
      .insert(practiceGames)
      .values({ gameType: params.gameType, legs: params.legs, gameMode: params.gameMode ?? "singles" })
      .returning({ id: practiceGames.id });

    await db.insert(practicePlayers).values(
      params.players.map((p, i) => ({
        practiceGameId: game.id,
        playerId: p.playerId ?? null,
        guestName: p.guestName ?? null,
        orderIndex: i,
        team: p.team ?? null,
      }))
    );

    return { id: game.id };
  } catch (error) {
    console.error("createPracticeGame error:", error);
    return { error: "Failed to create practice game" };
  }
}
