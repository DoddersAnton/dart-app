"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { playerTeams, teamJoinRequests } from "../schema";

/**
 * Records a player's request to join a team. The captain/secretary approves or
 * rejects it — players never self-add to a team.
 */
export async function requestToJoinTeam(
  playerId: number,
  teamId: number,
  note?: string
): Promise<{ success: true } | { error: string }> {
  try {
    const existingMembership = await db.query.playerTeams.findFirst({
      where: and(eq(playerTeams.playerId, playerId), eq(playerTeams.teamId, teamId)),
    });
    if (existingMembership) return { error: "You're already a member of this team" };

    const existingPending = await db.query.teamJoinRequests.findFirst({
      where: and(
        eq(teamJoinRequests.playerId, playerId),
        eq(teamJoinRequests.teamId, teamId),
        eq(teamJoinRequests.status, "pending"),
      ),
    });
    if (existingPending) return { error: "You already have a pending request for this team" };

    await db.insert(teamJoinRequests).values({
      playerId,
      teamId,
      note: note?.trim() || null,
      status: "pending",
    });

    revalidatePath("/settings/team-settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to send join request" };
  }
}
