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
.action(async ({ parsedInput: { id, name, nickname, team  } }) => {
    try {
      

    if(id) {

        await db
          .update(players)
          .set({
            name: name ?? "",
            nickname: nickname ?? "",
            team: team ?? "",
            createdAt: new Date()
          })
          .where(id ? eq(players.id, id) : undefined)
          .returning();

        revalidatePath("/players/add-player");
        return { success: `Player ${name} has been updated` };
      }

      await db
      .insert(players)
      .values({
       name: name ?? "(Unknown)",
            nickname: nickname ?? "",
            team: team ?? "",
        createdAt: new Date()
      })
      .returning();

      revalidatePath("/fines/add-player");
    return { success: `Player ${name} has been created` };
    } catch (error) {
      console.error(error);
      return { error: JSON.stringify(error) };
    }
  }
);
