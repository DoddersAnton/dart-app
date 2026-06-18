"use server";

import { db } from "..";
import { and, eq } from "drizzle-orm";
import { playerTeams } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Remove a player from a team (deletes the player_teams row). If the removed
// membership was the player's default, promote another membership to default.
export async function removePlayerFromTeam(params: {
  playerId: number;
  teamId: number;
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireLeagueAdmin();

    const membership = await db.query.playerTeams.findFirst({
      where: and(eq(playerTeams.playerId, params.playerId), eq(playerTeams.teamId, params.teamId)),
    });
    if (!membership) return { error: "Player is not on this team" };

    await db.delete(playerTeams).where(eq(playerTeams.id, membership.id));

    // If we removed their default team, promote another membership (if any).
    if (membership.isDefault) {
      const remaining = await db.query.playerTeams.findMany({
        where: eq(playerTeams.playerId, params.playerId),
      });
      if (remaining.length > 0 && !remaining.some((r) => r.isDefault)) {
        await db.update(playerTeams).set({ isDefault: true }).where(eq(playerTeams.id, remaining[0].id));
      }
    }

    revalidatePath("/settings/teams");
    revalidatePath("/players");
    return { success: "Player removed from team" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) {
      return { error: error.message };
    }
    console.error("removePlayerFromTeam error:", error);
    return { error: "Failed to remove player from team" };
  }
}
