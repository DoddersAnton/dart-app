"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { players } from "../schema";
import { playerSchema } from "../../types/add-player-schema";
import { requireTeamAdmin, canEditPlayerProfile } from "@/lib/permissions";

const actionClient = createSafeActionClient();

export const createPlayer = actionClient
.schema(playerSchema)
.action(async ({ parsedInput: { id, name, nickname, team, bio, dartsUsed, dartsWeight, dateOfBirth } }) => {
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
            team: team ?? undefined,
            bio: bio ?? undefined,
            dartsUsed: dartsUsed ?? undefined,
            dartsWeight: dartsWeight ?? undefined,
            dateOfBirth: dob,
          })
          .where(eq(players.id, id))
          .returning();

        revalidatePath("/players/add-player");
        revalidatePath(`/player/${id}`);
        return { success: `Player ${name} has been updated` };
      }

      // Creating a new profile: captain, secretary, or league admin only.
      await requireTeamAdmin();

      await db
      .insert(players)
      .values({
        name: name ?? "(Unknown)",
        nickname: nickname ?? undefined,
        team: team ?? undefined,
        bio: bio ?? undefined,
        dartsUsed: dartsUsed ?? undefined,
        dartsWeight: dartsWeight ?? undefined,
        dateOfBirth: dob,
        createdAt: new Date(),
      })
      .returning();

      revalidatePath("/players");
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
