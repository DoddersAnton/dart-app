import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/server";
import { eq } from "drizzle-orm";
import { playerTeams } from "@/server/schema";
import Link from "next/link";
import { Plus } from "lucide-react";
import { cookies } from "next/headers";
import { isTeamAdmin } from "@/lib/permissions";
import { PlayerCardList } from "./player-card-list";
export const dynamic = "force-dynamic";

export default async function GetFineTypePage() {
  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  // Get player IDs for the active team, then fetch only those players
  const allPlayers = await db.query.players.findMany();
  const players = activeTeamId
    ? (() => {
        return db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) })
          .then((pts) => {
            const ids = new Set(pts.map((pt) => pt.playerId));
            return allPlayers.filter((p) => ids.has(p.id));
          });
      })()
    : Promise.resolve(allPlayers);

  const resolvedPlayers = (await players).map((player) => ({
    ...player,
    createdAt: player.createdAt ? player.createdAt.toISOString() : null,
    dateOfBirth: player.dateOfBirth ? player.dateOfBirth.toISOString() : null,
  }));

  // Role map: playerId → role (only populated when a team filter is active)
  const membershipRows = activeTeamId
    ? await db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) })
    : [];
  const roleMap: Record<number, string> = Object.fromEntries(
    membershipRows.map((m) => [m.playerId, m.role])
  );

  const total = resolvedPlayers.length;
  const canAddPlayer = await isTeamAdmin();

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-row">
            <div>Players</div>
            {canAddPlayer && (
              <div>
                <Link
                  href="/players/add-player"
                  className="flex justify-center"
                >
                  <Button size="sm" className="mb-4" variant="outline">
                    Add Player <Plus className="ml-2" size={16} />
                  </Button>
                </Link>
              </div>
            )}
          </CardTitle>
          <CardDescription>
            {activeTeamId ? `${total} players in this team` : `All ${total} players`}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 overflow-auto">
          <PlayerCardList players={resolvedPlayers} roleMap={roleMap} />
        </CardContent>
      </Card>
    </div>
  );
}
