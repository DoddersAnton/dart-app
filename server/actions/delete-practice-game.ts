"use server";

import { db } from "..";
import { practiceGames } from "../schema";
import { eq } from "drizzle-orm";

export async function deletePracticeGame(id: number): Promise<void> {
  await db.delete(practiceGames).where(eq(practiceGames.id, id));
}
