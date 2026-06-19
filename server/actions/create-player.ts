"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { players, playerTeams } from "../schema";
import { playerSchema } from "../../types/add-player-schema";
import { requireTeamAdmin, canEditPlayerProfile } from "@/lib/permissions";

const actionClient = createSafeActionClient();

// Ensure player_teams rows exist for the given teams. Only sets a default when
// the player has no membership yet, so existing defaults are never clobbered.
async function ensureTeamMemberships(playerId: number, teamIds: number[]) {
  if (!teamIds.length) return;
  const existing = await db.query.playerTeams.findMany({ where: eq(playerTeams.playerId, playerId) });
  const existingTeamIds = new Set(existing.map((e) => e.teamId));
  let hasDefault = existing.some((e) => e.isDefault);
  for (const teamId of teamIds) {
    if (existingTeamIds.has(teamId)) continue;
    const isDefault = !hasDefault;
    if (isDefault) hasDefault = true;
    await db.insert(playerTeams).values({ playerId, teamId, isDefault });
  }
}

export const createPlayer = actionClient
.schema(playerSchema)
.action(async ({ parsedInput: { id, name, nickname, bio, dartsUsed, dartsWeight, dateOfBirth, teamIds } }) => {
    try {
      const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

    if(id) {
        // Editing an existing profile: own profile, captain, or league admin.
        if (!(await canEditPlayerProfile(id))) {
          return { error: "You don't have permission to edit this player's profile" };
        }

        await db
          .update(players)
          .set({
            name: name ?? "",
            nickname: nickname ?? undefined,
            bio: bio ?? undefined,
            dartsUsed: dartsUsed ?? undefined,
            dartsWeight: dartsWeight ?? undefined,
            dateOfBirth: dob,
          })
          .where(eq(players.id, id))
          .returning();

        if (teamIds?.length) await requireTeamAdmin();
        await ensureTeamMemberships(id, teamIds ?? []);

        revalidatePath("/players/add-player");
        revalidatePath(`/player/${id}`);
        return { success: `Player ${name} has been updated` };
      }

      // Creating a new profile: captain, secretary, or league admin only.
      await requireTeamAdmin();

      const [created] = await db
      .insert(players)
      .values({
        name: name ?? "(Unknown)",
        nickname: nickname ?? undefined,
        bio: bio ?? undefined,
        dartsUsed: dartsUsed ?? undefined,
        dartsWeight: dartsWeight ?? undefined,
        dateOfBirth: dob,
        createdAt: new Date(),
      })
      .returning();

      if (created) await ensureTeamMemberships(created.id, teamIds ?? []);

      revalidatePath("/players");
      revalidatePath("/settings/teams");
    return { success: `Player ${name} has been created` };
    } catch (error) {
      if (error instanceof Error && error.message.includes("Permission denied")) {
        return { error: error.message };
      }
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
