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
    const memberships = await db.query.playerTeams.findMany({
      where: eq(playerTeams.teamId, teamId),
      with: { player: true },
    });
    return memberships.map((m) => ({
      id: m.player.id,
      name: m.player.name,
      nickname: m.player.nickname,
    }));
  } catch (error) {
    console.error("getTeamPlayers error:", error);
    return [];
  }
}
