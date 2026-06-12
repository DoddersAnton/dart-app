"use server";

import { and, eq } from "drizzle-orm";
import { db } from "..";
import { teamJoinRequests } from "../schema";

export type TeamJoinRequest = {
  id: number;
  playerId: number;
  playerName: string;
  playerImgUrl: string | null;
  note: string | null;
  createdAt: string | null;
};

/** Pending join requests for a team, with requesting-player details. */
export async function getTeamJoinRequests(teamId: number): Promise<TeamJoinRequest[]> {
  try {
    const rows = await db.query.teamJoinRequests.findMany({
      where: and(eq(teamJoinRequests.teamId, teamId), eq(teamJoinRequests.status, "pending")),
      with: { player: true },
      orderBy: (r, { asc }) => [asc(r.createdAt)],
    });

    return rows.map((r) => ({
      id: r.id,
      playerId: r.playerId,
      playerName: r.player.name,
      playerImgUrl: r.player.imgUrl ?? null,
      note: r.note ?? null,
      createdAt: r.createdAt ? r.createdAt.toISOString() : null,
    }));
  } catch (error) {
    console.error(error);
    return [];
  }
}
