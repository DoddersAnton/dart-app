import { notFound } from "next/navigation";

import { getPlayerDashboardData } from "./_lib/player-dashboard-data";
import { PlayerOverviewClient } from "./player-overview-client";

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
    <PlayerOverviewClient
      player={{
        id: data.player.id,
        name: data.player.name,
        nickname: data.player.nickname,
        imgUrl: data.player.imgUrl,
      }}
      totalFinesIssuedValue={data.totalFinesIssuedValue}
      finesCount={data.finesWithType.length}
      paidFinesCount={data.paidFines.length}
      unpaidFinesCount={data.unpaidFines.length}
      subsTotalValue={data.subs.reduce((acc, sub) => acc + sub.amount, 0)}
      paidSubsCount={data.paidSubs.length}
      unpaidSubsCount={data.unpaidSubs.length}
      totalGamesWon={data.totalGamesWon}
      totalGamesLost={data.totalGamesLost}
      totalMatchesPlayed={data.totalMatchesPlayed}
    />
  );
}
