"use server";

import { db } from "..";
import { eq, and } from "drizzle-orm";
import { playerTeams } from "../schema";
import { requireCaptain, TeamRole } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export async function updatePlayerTeamRole(
  playerId: number,
  teamId: number,
  role: TeamRole
): Promise<{ success: string } | { error: string }> {
  try {
    await requireCaptain();
    const membership = await db.query.playerTeams.findFirst({
      where: and(eq(playerTeams.playerId, playerId), eq(playerTeams.teamId, teamId)),
    });
    if (!membership) return { error: "Player is not a member of this team" };

    await db.update(playerTeams).set({ role }).where(eq(playerTeams.id, membership.id));
    revalidatePath("/settings/team-settings");
    return { success: `Role updated to ${role}` };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) {
      return { error: error.message };
    }
    console.error(error);
    return { error: "Failed to update role" };
  }
}
