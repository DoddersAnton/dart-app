import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerDashboardData } from "../_lib/player-dashboard-data";
import { PlayerGamesTabs } from "./player-games-tabs";

export default async function PlayerGamesSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) notFound();

  const seasonsPlayed = data.seasonSummaries.filter((season) => season.totalGames > 0).length;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Games summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Total matches</CardTitle></CardHeader><CardContent>{data.totalMatchesPlayed}</CardContent></Card>
        <Card><CardHeader><CardTitle>Seasons played</CardTitle></CardHeader><CardContent>{seasonsPlayed}</CardContent></Card>
        <Card><CardHeader><CardTitle>Games won</CardTitle></CardHeader><CardContent>{data.totalGamesWon}</CardContent></Card>
        <Card><CardHeader><CardTitle>Games lost</CardTitle></CardHeader><CardContent>{data.totalGamesLost}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Season stats and chart</CardTitle></CardHeader>
        <CardContent>
          <PlayerGamesTabs seasons={data.seasonSummaries} currentPlayerId={playerId} />
        </CardContent>
      </Card>
    </div>
  );
}
