"use server";

import { db } from "..";
import { players, playerTeams } from "../schema";
import { requireLeagueAdmin } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

// Bulk-create basic players (name + nickname) and add them to a team.
export async function quickAddTeamPlayers(params: {
  teamId: number;
  players: { name: string; nickname?: string }[];
}): Promise<{ success: string } | { error: string }> {
  try {
    await requireLeagueAdmin();

    const rows = params.players
      .map((p) => ({ name: p.name.trim(), nickname: p.nickname?.trim() || null }))
      .filter((p) => p.name.length > 0);
    if (rows.length === 0) return { error: "Add at least one player name" };

    const createdPlayers = await db.insert(players).values(rows).returning();

    if (createdPlayers.length > 0) {
      await db.insert(playerTeams).values(
        createdPlayers.map((p) => ({ playerId: p.id, teamId: params.teamId, isDefault: true })),
      );
    }

    revalidatePath("/settings/teams");
    revalidatePath("/players");
    return { success: `Added ${rows.length} player${rows.length !== 1 ? "s" : ""}` };
  } catch (error) {
    if (error instanceof Error && error.message.includes("Permission denied")) return { error: error.message };
    console.error("quickAddTeamPlayers error:", error);
    return { error: "Failed to add players" };
  }
}
