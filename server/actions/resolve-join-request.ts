"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "..";
import { playerTeams, teamJoinRequests } from "../schema";
import { getLinkedPlayerId, requireTeamAdmin } from "@/lib/permissions";

/**
 * Approve or reject a pending join request. Captain/secretary/league admin only.
 * On approval a team membership is created (default when it's the player's
 * first team).
 */
export async function resolveJoinRequest(
  requestId: number,
  approve: boolean
): Promise<{ success: string } | { error: string }> {
  try {
    await requireTeamAdmin();

    const request = await db.query.teamJoinRequests.findFirst({
      where: eq(teamJoinRequests.id, requestId),
    });
    if (!request) return { error: "Request not found" };
    if (request.status !== "pending") return { error: "This request has already been resolved" };

    const resolvedByPlayerId = await getLinkedPlayerId();

    if (approve) {
      const existing = await db.query.playerTeams.findFirst({
        where: and(eq(playerTeams.playerId, request.playerId), eq(playerTeams.teamId, request.teamId)),
      });
      if (!existing) {
        const otherTeams = await db.query.playerTeams.findMany({
          where: eq(playerTeams.playerId, request.playerId),
        });
        await db.insert(playerTeams).values({
          playerId: request.playerId,
          teamId: request.teamId,
          isDefault: otherTeams.length === 0,
        });
      }
    }

    await db
      .update(teamJoinRequests)
      .set({
        status: approve ? "approved" : "rejected",
        resolvedByPlayerId: resolvedByPlayerId ?? null,
        resolvedAt: new Date(),
      })
      .where(eq(teamJoinRequests.id, requestId));

    revalidatePath("/settings/team-settings");
    return { success: approve ? "Request approved" : "Request rejected" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Failed to resolve request" };
  }
}
