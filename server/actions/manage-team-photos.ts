"use server";

import { db } from "..";
import { eq } from "drizzle-orm";
import { teamPhotos } from "../schema";
import { revalidatePath } from "next/cache";

export async function addTeamPhoto(
  teamId: number,
  url: string,
  caption?: string
): Promise<{ success: true } | { error: string }> {
  try {
    const existing = await db.query.teamPhotos.findMany({ where: eq(teamPhotos.teamId, teamId) });
    await db.insert(teamPhotos).values({ teamId, url, caption: caption ?? null, orderIndex: existing.length });
    revalidatePath("/");
    revalidatePath("/settings/team-settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to add photo" };
  }
}

export async function deleteTeamPhoto(photoId: number): Promise<{ success: true } | { error: string }> {
  try {
    await db.delete(teamPhotos).where(eq(teamPhotos.id, photoId));
    revalidatePath("/");
    revalidatePath("/settings/team-settings");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { error: "Failed to delete photo" };
  }
}
