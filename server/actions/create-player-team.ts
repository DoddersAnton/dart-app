"use server";

import { db } from "..";
import { eq, and } from "drizzle-orm";
import { playerTeams } from "../schema";
import { revalidatePath } from "next/cache";

export async function createPlayerTeams(
  playerId: number,
  teamIds: number[],
  defaultTeamId: number
): Promise<{ success: true } | { error: string }> {
  try {
    for (const teamId of teamIds) {
      const existing = await db.query.playerTeams.findFirst({
        where: and(eq(playerTeams.playerId, playerId), eq(playerTeams.teamId, teamId)),
      });
      if (!existing) {
        await db.insert(playerTeams).values({
          playerId,
          teamId,
          isDefault: teamId === defaultTeamId,
        });
      } else if (teamId === defaultTeamId && !existing.isDefault) {
        await db.update(playerTeams)
          .set({ isDefault: true })
          .where(eq(playerTeams.id, existing.id));
      }
    }
    // Ensure only one default
    const allTeams = await db.query.playerTeams.findMany({ where: eq(playerTeams.playerId, playerId) });
    for (const pt of allTeams) {
      if (pt.teamId !== defaultTeamId && pt.isDefault) {
        await db.update(playerTeams).set({ isDefault: false }).where(eq(playerTeams.id, pt.id));
      }
    }
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to create player team links" };
  }
}
