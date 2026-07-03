import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

// Backfill fixtures.week_no for fixtures that don't have one.
// Per season: earliest fixture date = week 1; week = round(daysFromAnchor / 7) + 1.
// Run with `--apply` to write; otherwise it's a dry run.
const APPLY = process.argv.includes("--apply");
const DAY = 86400000;

async function main() {
  const all = await db.query.fixtures.findMany();
  const toFill = all.filter((f) => f.weekNo == null && f.matchDate);

  const groups = new Map<string, typeof toFill>();
  for (const f of toFill) {
    const key = f.seasonsId != null ? `id:${f.seasonsId}` : `name:${f.season}`;
    const arr = groups.get(key) ?? [];
    arr.push(f);
    groups.set(key, arr);
  }

  let totalUpdated = 0;

  for (const [key, list] of groups) {
    list.sort((a, b) => a.matchDate.getTime() - b.matchDate.getTime());
    const anchor = list[0].matchDate.getTime();
    console.log(`\n=== ${list[0].season} (${key}) — ${list.length} fixtures ===`);

    const dateWeekCount = new Map<string, { week: number; n: number }>();
    for (const f of list) {
      const days = Math.round((f.matchDate.getTime() - anchor) / DAY);
      const week = Math.round(days / 7) + 1;
      const dstr = f.matchDate.toISOString().slice(0, 10);
      const rec = dateWeekCount.get(dstr) ?? { week, n: 0 };
      rec.n++;
      dateWeekCount.set(dstr, rec);
      if (APPLY) {
        await db.update(schema.fixtures).set({ weekNo: week }).where(eq(schema.fixtures.id, f.id));
        totalUpdated++;
      }
    }

    [...dateWeekCount.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([d, { week, n }]) => console.log(`  ${d} → week ${week}  (${n} fixture${n !== 1 ? "s" : ""})`));
  }

  console.log(
    APPLY
      ? `\nApplied: ${totalUpdated} fixtures updated.`
      : `\nDry run — no changes written. Re-run with --apply to commit.`,
  );
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
