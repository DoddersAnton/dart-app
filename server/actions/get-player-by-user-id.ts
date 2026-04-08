"use server";

import { eq } from "drizzle-orm";
import { db } from "..";

export async function getPlayerByUserId(userId: string) {
  try {
    const player = await db.query.players.findFirst({
      where: (p) => eq(p.userid, userId),
    });
    return player ?? null;
  } catch {
    return null;
  }
}
