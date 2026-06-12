"use server";

import { db } from "..";
import { eq } from "drizzle-orm";
import { team, teamPhotos, teamSponsors } from "../schema";

export type TeamHomepageData = {
  id: number;
  name: string;
  description: string | null;
  logoUrl: string | null;
  instagramUrl: string | null;
  finesEnabled: boolean;
  photos: { id: number; url: string; caption: string | null; orderIndex: number }[];
  sponsors: { id: number; name: string; logoUrl: string | null; websiteUrl: string | null; orderIndex: number }[];
};

export async function getTeamHomepageData(teamId: number): Promise<TeamHomepageData | null> {
  try {
    const [teamRecord, photos, sponsors] = await Promise.all([
      db.query.team.findFirst({ where: eq(team.id, teamId) }),
      db.query.teamPhotos.findMany({
        where: eq(teamPhotos.teamId, teamId),
        orderBy: (t, { asc }) => [asc(t.orderIndex), asc(t.createdAt)],
      }),
      db.query.teamSponsors.findMany({
        where: eq(teamSponsors.teamId, teamId),
        orderBy: (t, { asc }) => [asc(t.orderIndex), asc(t.createdAt)],
      }),
    ]);

    if (!teamRecord) return null;

    return {
      id: teamRecord.id,
      name: teamRecord.name,
      description: teamRecord.description ?? null,
      logoUrl: teamRecord.logoUrl ?? null,
      instagramUrl: teamRecord.instagramUrl ?? null,
      finesEnabled: teamRecord.finesEnabled,
      photos: photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption ?? null, orderIndex: p.orderIndex })),
      sponsors: sponsors.map((s) => ({ id: s.id, name: s.name, logoUrl: s.logoUrl ?? null, websiteUrl: s.websiteUrl ?? null, orderIndex: s.orderIndex })),
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}
