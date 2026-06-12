import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/schema";
import { and, eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

async function main() {
  const TARGET_TEAM_ID = 1;

  const players = await db.query.players.findMany();
  console.log(`Found ${players.length} players`);

  let created = 0;
  let skipped = 0;

  for (const player of players) {
    const existing = await db.query.playerTeams.findFirst({
      where: and(
        eq(schema.playerTeams.playerId, player.id),
        eq(schema.playerTeams.teamId, TARGET_TEAM_ID)
      ),
    });

    if (existing) {
      console.log(`  SKIP  ${player.name} (already linked)`);
      skipped++;
    } else {
      await db.insert(schema.playerTeams).values({
        playerId: player.id,
        teamId: TARGET_TEAM_ID,
        isDefault: true,
      });
      console.log(`  ADD   ${player.name}`);
      created++;
    }
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped`);
}

main().catch((err) => { console.error(err); process.exit(1); });
