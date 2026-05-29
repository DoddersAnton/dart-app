"use server";
import { db } from "..";
import { eq } from "drizzle-orm";
import { awards } from "../schema";

export async function getAward(id: number) {
  try {
    const award = await db.query.awards.findFirst({ where: eq(awards.id, id) });
    if (!award) return { error: "Award not found" };
    return { success: award };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get award" };
  }
}
