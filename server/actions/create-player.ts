"use server";
import { createSafeActionClient } from "next-safe-action";
//import { currentUser } from "@clerk/nextjs/server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { players } from "../schema";
import { playerSchema } from "../../types/add-player-schema";

const actionClient = createSafeActionClient();

export const createPlayer = actionClient
.schema(playerSchema)
.action(async ({ parsedInput: { id, name, nickname, team, bio, dartsUsed, dartsWeight, dateOfBirth } }) => {
    try {
      const dob = dateOfBirth ? new Date(dateOfBirth) : undefined;

    if(id) {

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
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
