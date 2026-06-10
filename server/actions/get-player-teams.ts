"use server";

import { db } from "..";
import { eq } from "drizzle-orm";
import { playerTeams } from "../schema";

export type PlayerTeamEntry = {
  id: number;
  playerId: number;
  teamId: number;
  teamName: string;
  isDefault: boolean;
};

export async function getPlayerTeams(playerId: number): Promise<PlayerTeamEntry[]> {
  try {
    const rows = await db.query.playerTeams.findMany({
      where: eq(playerTeams.playerId, playerId),
      with: { team: true },
    });
    return rows.map((r) => ({
      id: r.id,
      playerId: r.playerId,
      teamId: r.teamId,
      teamName: r.team.name,
      isDefault: r.isDefault,
    }));
  } catch {
    return [];
  }
}
