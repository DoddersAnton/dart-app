"use server";

import { db } from "..";
import { practiceGames, practicePlayers, practiceRounds, players } from "../schema";
import { eq, inArray, desc } from "drizzle-orm";

export type PlayerPracticeGame = {
  id: number;
  gameType: string;
  legs: number;
  status: string;
  createdAt: Date | null;
  playerNames: string[];
  legsWon: number;
  totalThrows: number;
  avgScore: number | null;
};

export async function getPlayerPracticeGames(playerId: number): Promise<PlayerPracticeGame[]> {
  const participated = await db
    .select({ practiceGameId: practicePlayers.practiceGameId, id: practicePlayers.id, legsWon: practicePlayers.legsWon })
    .from(practicePlayers)
    .where(eq(practicePlayers.playerId, playerId));

  if (participated.length === 0) return [];

  const gameIds = [...new Set(participated.map((p) => p.practiceGameId))];

  const [games, allPPlayers, allRounds] = await Promise.all([
    db
      .select()
      .from(practiceGames)
      .where(inArray(practiceGames.id, gameIds))
      .orderBy(desc(practiceGames.createdAt)),
    db
      .select({
        id: practicePlayers.id,
        practiceGameId: practicePlayers.practiceGameId,
        playerId: practicePlayers.playerId,
        guestName: practicePlayers.guestName,
        playerName: players.name,
      })
      .from(practicePlayers)
      .leftJoin(players, eq(practicePlayers.playerId, players.id))
      .where(inArray(practicePlayers.practiceGameId, gameIds)),
    db
      .select()
      .from(practiceRounds)
      .where(inArray(practiceRounds.practiceGameId, gameIds)),
  ]);

  return games.map((game) => {
    const gamePlayers = allPPlayers.filter((p) => p.practiceGameId === game.id);
    const gameRounds = allRounds.filter((r) => r.practiceGameId === game.id);

    const myPracticePlayer = participated.find((p) => p.practiceGameId === game.id);
    const myRounds = myPracticePlayer
      ? gameRounds.filter((r) => r.practicePlyrId === myPracticePlayer.id)
      : [];
    const avgScore =
      myRounds.length > 0
        ? Math.round(myRounds.reduce((s, r) => s + r.score, 0) / myRounds.length)
        : null;

    return {
      id: game.id,
      gameType: game.gameType,
      legs: game.legs,
      status: game.status,
      createdAt: game.createdAt,
      playerNames: gamePlayers.map((p) => p.playerName ?? p.guestName ?? "Unknown"),
      legsWon: myPracticePlayer?.legsWon ?? 0,
      totalThrows: myRounds.length,
      avgScore,
    };
  });
}
