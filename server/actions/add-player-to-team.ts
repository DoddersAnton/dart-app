"use server";

import { db } from "..";
import { and, eq } from "drizzle-orm";
import { playerTeams } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Add an existing player to a team (creates a player_teams row). Marks the
// membership as default only when the player has no other membership yet.
export async function addPlayerToTeam(params: {
  playerId: number;
  teamId: number;
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireLeagueAdmin();

    const existing = await db.query.playerTeams.findFirst({
      where: and(eq(playerTeams.playerId, params.playerId), eq(playerTeams.teamId, params.teamId)),
    });
    if (existing) return { error: "Player is already on this team" };

    const anyMembership = await db.query.playerTeams.findFirst({
      where: eq(playerTeams.playerId, params.playerId),
    });

    await db.insert(playerTeams).values({
      playerId: params.playerId,
      teamId: params.teamId,
      isDefault: !anyMembership,
    });

    revalidatePath("/settings/teams");
    revalidatePath("/players");
    return { success: "Player added to team" };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) {
      return { error: error.message };
    }
    console.error("addPlayerToTeam error:", error);
    return { error: "Failed to add player to team" };
  }
}
