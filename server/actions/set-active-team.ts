"use server";

import { cookies } from "next/headers";

export async function setActiveTeam(teamId: number): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("active-team-id", String(teamId), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
