import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../server/schema";
import { eq } from "drizzle-orm";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle({ client: sql, schema });

// The app team. Historically every tracked round/gamePlayer belonged to this team —
// the opponent was never stored as a real record. So we can only attribute one side.
const APP_TEAM_ID = 1;

async function main() {
  const [allGames, allFixtures, allRounds, allGamePlayers] = await Promise.all([
    db.query.games.findMany(),
    db.query.fixtures.findMany(),
    db.query.rounds.findMany(),
    db.query.gamePlayers.findMany(),
  ]);

  const fixtureById = new Map(allFixtures.map((f) => [f.id, f]));
  const gameById = new Map(allGames.map((g) => [g.id, g]));

  // For a fixture, which side is the app team on?  "home" | "away" | null
  const appSideForFixture = (fixtureId: number): "home" | "away" | null => {
    const fixture = fixtureById.get(fixtureId);
    if (!fixture) return null;
    if (fixture.homeTeamId === APP_TEAM_ID) return "home";
    if (fixture.awayTeamId === APP_TEAM_ID) return "away";
    return null; // legacy free-text fixture — cannot split
  };

  // ---- Backfill rounds ----
  let roundsUpdated = 0;
  let roundsUnmatched = 0;
  let roundsSkipped = 0;

  for (const round of allRounds) {
    if (round.homePlayerId || round.awayPlayerId) { roundsSkipped++; continue; } // already migrated
    if (!round.playerId) { roundsSkipped++; continue; }

    const game = gameById.get(round.gameId);
    if (!game) { roundsUnmatched++; continue; }

    const side = appSideForFixture(game.fixtureId);
    if (side === "home") {
      await db.update(schema.rounds)
        .set({ homePlayerId: round.playerId, homeDartsUsed: round.dartsUsed })
        .where(eq(schema.rounds.id, round.id));
      roundsUpdated++;
    } else if (side === "away") {
      await db.update(schema.rounds)
        .set({ awayPlayerId: round.playerId, awayDartsUsed: round.dartsUsed })
        .where(eq(schema.rounds.id, round.id));
      roundsUpdated++;
    } else {
      roundsUnmatched++; // legacy fixture with no team ids — left NULL
    }
  }

  // ---- Backfill gamePlayers (all historical rosters were the app team) ----
  let gpUpdated = 0;
  let gpUnmatched = 0;
  let gpSkipped = 0;

  for (const gp of allGamePlayers) {
    if (gp.teamId || gp.side) { gpSkipped++; continue; } // already migrated

    const game = gameById.get(gp.gameId);
    if (!game) { gpUnmatched++; continue; }

    const side = appSideForFixture(game.fixtureId);
    if (side === "home" || side === "away") {
      await db.update(schema.gamePlayers)
        .set({ teamId: APP_TEAM_ID, side })
        .where(eq(schema.gamePlayers.id, gp.id));
      gpUpdated++;
    } else {
      gpUnmatched++;
    }
  }

  console.log("Rounds:", { updated: roundsUpdated, unmatched: roundsUnmatched, skipped: roundsSkipped });
  console.log("GamePlayers:", { updated: gpUpdated, unmatched: gpUnmatched, skipped: gpSkipped });
  console.log("Done. Unmatched = legacy free-text fixtures (no home/away team id) — left NULL by design.");
}

main().catch((err) => { console.error(err); process.exit(1); });
