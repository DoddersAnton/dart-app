"use server";

import { eq } from "drizzle-orm";
import { db } from "..";
import { playerTeams } from "../schema";

export type TeamPlayer = {
  id: number;
  name: string;
  nickname: string | null;
};

/**
 * Players who belong to a given team (via player_teams). Used to build the
 * home / away roster selectors when setting up a two-sided game.
 */
export async function getTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  try {
    const [allPlayers, memberships] = await Promise.all([
      db.query.players.findMany(),
      db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, teamId) }),
    ]);
    const ids = new Set(memberships.map((m) => m.playerId));
    return allPlayers
      .filter((p) => ids.has(p.id))
      .map((p) => ({ id: p.id, name: p.name, nickname: p.nickname }));
  } catch (error) {
    console.error("getTeamPlayers error:", error);
    return [];
  }
}
