"use server";

import { db } from "..";
import { eq } from "drizzle-orm";
import { team } from "../schema";
import { revalidatePath } from "next/cache";
import { requireCaptain } from "@/lib/permissions";

export async function updateTeamSettings(
  teamId: number,
  values: { finesEnabled?: boolean; logoUrl?: string | null; description?: string | null; instagramUrl?: string | null }
): Promise<{ success: string } | { error: string }> {
  try {
    await requireCaptain();
    await db.update(team).set(values).where(eq(team.id, teamId));
    revalidatePath("/settings/team-settings");
    return { success: "Team settings saved" };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save team settings" };
  }
}
