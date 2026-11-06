"use server";

import { asc, eq, inArray, sql } from "drizzle-orm";
import { db } from "..";
import { gamePlayers, games, players } from "../schema";

export type NextGame = {
  id: number;
  gameType: string;
  homePlayers: string[];
  awayPlayers: string[];
};

/**
 * The next game to play in a fixture: the first unfinished game (no side has
 * reached the legs needed to win) after `currentGameId` in sequence order,
 * wrapping round to earlier unfinished games. Null when every game is finished.
 */
export async function getNextGame(fixtureId: number, currentGameId?: number): Promise<NextGame | null> {
  try {
    const [settings, fixtureGames] = await Promise.all([
      db.query.appSettings.findFirst(),
      db
        .select()
        .from(games)
        .where(eq(games.fixtureId, fixtureId))
        .orderBy(sql`${games.sequence} asc nulls last`, asc(games.id)),
    ]);

    const legsToWin = Math.ceil((settings?.maxLegsPerGame ?? 3) / 2);
    const isFinished = (g: (typeof fixtureGames)[number]) =>
      g.homeTeamScore >= legsToWin || g.awayTeamScore >= legsToWin;

    const currentIdx = currentGameId != null ? fixtureGames.findIndex((g) => g.id === currentGameId) : -1;
    const rotated = currentIdx >= 0
      ? [...fixtureGames.slice(currentIdx + 1), ...fixtureGames.slice(0, currentIdx)]
      : fixtureGames;
    const next = rotated.find((g) => !isFinished(g));
    if (!next) return null;

    const roster = await db
      .select({ side: gamePlayers.side, name: players.name })
      .from(gamePlayers)
      .innerJoin(players, eq(gamePlayers.playerId, players.id))
      .where(inArray(gamePlayers.gameId, [next.id]));

    return {
      id: next.id,
      gameType: next.gameType,
      homePlayers: roster.filter((r) => r.side === "home").map((r) => r.name),
      awayPlayers: roster.filter((r) => r.side === "away").map((r) => r.name),
    };
  } catch (error) {
    console.error("getNextGame error:", error);
    return null;
  }
}
