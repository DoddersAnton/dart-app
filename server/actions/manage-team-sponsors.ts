"use server";

import { db } from "..";
import { eq } from "drizzle-orm";
import { teamSponsors } from "../schema";
import { revalidatePath } from "next/cache";

export async function upsertTeamSponsor(
  teamId: number,
  values: { id?: number; name: string; logoUrl?: string | null; websiteUrl?: string | null }
): Promise<{ success: true } | { error: string }> {
  try {
    if (values.id) {
      await db.update(teamSponsors)
        .set({ name: values.name, logoUrl: values.logoUrl ?? null, websiteUrl: values.websiteUrl ?? null })
        .where(eq(teamSponsors.id, values.id));
    } else {
      const existing = await db.query.teamSponsors.findMany({ where: eq(teamSponsors.teamId, teamId) });
      await db.insert(teamSponsors).values({
        teamId,
        name: values.name,
        logoUrl: values.logoUrl ?? null,
        websiteUrl: values.websiteUrl ?? null,
        orderIndex: existing.length,
      });
    }
    revalidatePath("/");
    revalidatePath("/settings/team-settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to save sponsor" };
  }
}

export async function deleteTeamSponsor(sponsorId: number): Promise<{ success: true } | { error: string }> {
  try {
    await db.delete(teamSponsors).where(eq(teamSponsors.id, sponsorId));
    revalidatePath("/");
    revalidatePath("/settings/team-settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete sponsor" };
  }
}
