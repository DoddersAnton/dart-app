"use server";

import { db } from "..";
import { practiceGames, practicePlayers, practiceRounds, players } from "../schema";
import { eq, asc } from "drizzle-orm";

export type PracticeGameFull = {
  id: number;
  gameType: string;
  legs: number;
  status: string;
  gameMode: string;
  createdAt: Date | null;
  players: Array<{
    id: number;
    name: string;
    playerId: number | null;
    guestName: string | null;
    orderIndex: number;
    legsWon: number;
    imgUrl: string | null;
    team: string | null;
  }>;
  rounds: Array<{
    id: number;
    practicePlyrId: number;
    leg: number;
    throwNumber: number;
    score: number;
    remainingScore: number;
    dartsUsed: number;
  }>;
};

export async function getPracticeGame(id: number): Promise<PracticeGameFull | null> {
  const game = await db.query.practiceGames.findFirst({
    where: eq(practiceGames.id, id),
  });
  if (!game) return null;

  const pPlayers = await db
    .select({
      id: practicePlayers.id,
      playerId: practicePlayers.playerId,
      guestName: practicePlayers.guestName,
      orderIndex: practicePlayers.orderIndex,
      legsWon: practicePlayers.legsWon,
      team: practicePlayers.team,
      playerName: players.name,
      playerImgUrl: players.imgUrl,
    })
    .from(practicePlayers)
    .leftJoin(players, eq(practicePlayers.playerId, players.id))
    .where(eq(practicePlayers.practiceGameId, id))
    .orderBy(asc(practicePlayers.orderIndex));

  const rounds = await db
    .select()
    .from(practiceRounds)
    .where(eq(practiceRounds.practiceGameId, id))
    .orderBy(asc(practiceRounds.leg), asc(practiceRounds.throwNumber));

  return {
    id: game.id,
    gameType: game.gameType,
    legs: game.legs,
    status: game.status,
    gameMode: game.gameMode ?? "singles",
    createdAt: game.createdAt,
    players: pPlayers.map((p) => ({
      id: p.id,
      name: p.playerName ?? p.guestName ?? "Unknown",
      playerId: p.playerId,
      guestName: p.guestName,
      orderIndex: p.orderIndex,
      legsWon: p.legsWon,
      imgUrl: p.playerImgUrl,
      team: p.team ?? null,
    })),
    rounds: rounds.map((r) => ({
      id: r.id,
      practicePlyrId: r.practicePlyrId,
      leg: r.leg,
      throwNumber: r.throwNumber,
      score: r.score,
      remainingScore: r.remainingScore,
      dartsUsed: r.dartsUsed,
    })),
  };
}
