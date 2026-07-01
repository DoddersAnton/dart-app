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

    for (const r of rows) {
      const [created] = await db.insert(players).values({ name: r.name, nickname: r.nickname }).returning();
      if (created) {
        // New player — this is their only team, so make it their default.
        await db.insert(playerTeams).values({ playerId: created.id, teamId: params.teamId, isDefault: true });
      }
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
