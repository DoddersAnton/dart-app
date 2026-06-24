import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

// Links each player_fine to the season whose [startDate, endDate] contains the
// fine's date (matchDate, falling back to createdAt). Idempotent: only fills
// rows where season_id is still NULL, and ensures the column/FK exist first.
async function main() {
  // 1. Ensure the column + FK exist (mirrors migration 0024) — safe to re-run.
  await sql`ALTER TABLE "player_fines" ADD COLUMN IF NOT EXISTS "season_id" integer`;
  const fk = await sql`SELECT 1 FROM pg_constraint WHERE conname = 'player_fines_season_id_seasons_id_fk'`;
  if (fk.length === 0) {
    await sql`ALTER TABLE "player_fines" ADD CONSTRAINT "player_fines_season_id_seasons_id_fk" FOREIGN KEY ("season_id") REFERENCES "public"."seasons"("id") ON DELETE set null ON UPDATE no action`;
    console.log("Added season_id column + FK.");
  } else {
    console.log("season_id column + FK already present.");
  }

  // 2. Backfill from the fine date.
  const seasons = await db.query.seasons.findMany();
  const fines = await db.query.playerFines.findMany();

  const seasonForDate = (d: Date | null): number | null => {
    if (!d) return null;
    const t = d.getTime();
    const match = seasons.find((s) => s.startDate.getTime() <= t && t <= s.endDate.getTime());
    return match?.id ?? null;
  };

  let updated = 0;
  let alreadySet = 0;
  let noSeason = 0;
  for (const f of fines) {
    if (f.seasonId != null) { alreadySet++; continue; }
    const date = f.matchDate ?? f.createdAt ?? null;
    const seasonId = seasonForDate(date);
    if (seasonId == null) { noSeason++; continue; }
    await db.update(schema.playerFines).set({ seasonId }).where(eq(schema.playerFines.id, f.id));
    updated++;
  }

  console.log(`Backfill complete — ${fines.length} fines scanned: ${updated} linked, ${alreadySet} already set, ${noSeason} had no matching season.`);
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
