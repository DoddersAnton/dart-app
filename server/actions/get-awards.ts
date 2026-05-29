"use server";
import { db } from "..";

export async function getAwards() {
  try {
    const rows = await db.query.awards.findMany();
    return {
      success: rows.map((a) => ({
        id: a.id,
        title: a.title,
        description: a.description ?? null,
        createdAt: a.createdAt ? a.createdAt.toISOString() : null,
      })),
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to get awards" };
  }
}
