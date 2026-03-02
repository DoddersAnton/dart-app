import { Camera, Trophy } from "lucide-react";
import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPlayerDashboardData } from "./_lib/player-dashboard-data";

export default async function PlayerOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{data.player.name}</CardTitle>
            <p className="text-muted-foreground">Nickname: {data.player.nickname || "-"}</p>
          </div>
          <Button variant="outline" className="gap-2">
            <Camera className="h-4 w-4" />
            Change avatar
          </Button>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Fines total</CardTitle>
          </CardHeader>
          <CardContent>£{data.totalFinesIssuedValue.toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Subs total</CardTitle>
          </CardHeader>
          <CardContent>£{data.subs.reduce((acc, sub) => acc + sub.amount, 0).toFixed(2)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Headline performance</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500" />
            {data.totalGamesWon}W / {data.totalGamesLost}L
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Matches played</CardTitle>
          </CardHeader>
          <CardContent>{data.totalMatchesPlayed}</CardContent>
        </Card>
      </div>
    </div>
  );
}
