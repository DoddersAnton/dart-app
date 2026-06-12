import "dotenv/config";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/schema";
import { and, eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

// Set Anthony Dodwell (player linked to your Clerk account) as captain on team 1
async function main() {
  const player = await db.query.players.findFirst({
    where: (p) => eq(p.name, "Ant"),
  });

  if (!player) { console.error("Player not found"); process.exit(1); }

  await db.update(schema.playerTeams)
    .set({ role: "captain" })
    .where(and(eq(schema.playerTeams.playerId, player.id), eq(schema.playerTeams.teamId, 1)));

  console.log(`Set ${player.name} as captain on team 1`);
}

main().catch((err) => { console.error(err); process.exit(1); });
