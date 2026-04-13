"use server";

import { db } from "..";
import { appSettings } from "../schema";

export async function getAppSettings() {
  try {
    let settings = await db.query.appSettings.findFirst();

    if (!settings) {
      const [created] = await db.insert(appSettings).values({}).returning();
      settings = created;
    }

    return { success: settings };
  } catch (error) {
    return { error: JSON.stringify(error) };
  }
}
