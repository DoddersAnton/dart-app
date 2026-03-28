import { notFound } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { getPlayerDashboardData } from "./_lib/player-dashboard-data";
import { PlayerOverviewClient } from "./player-overview-client";

function calcPct(wins: number, losses: number) {
  const total = wins + losses;
  if (total === 0) return 0;

  return Math.round((wins / total) * 100);
}

export default async function PlayerOverviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const [data, { userId: clerkUserId }] = await Promise.all([
    getPlayerDashboardData(playerId),
    auth(),
  ]);

  if (!data.player) {
    notFound();
  }

  const currentPlayerRows = data.seasonSummaries.flatMap((season) =>
    season.allRows.filter((row) => row.playerId === playerId),
  );

  const aggregate = (gameType: "Singles" | "Doubles" | "Team Game") => {
    const rows = currentPlayerRows.filter((row) => row.gameType === gameType);
    const wins = rows.reduce((acc, row) => acc + row.wins, 0);
    const losses = rows.reduce((acc, row) => acc + row.loses, 0);

    return { wins, losses, winPct: calcPct(wins, losses) };
  };

  const singles = aggregate("Singles");
  const doubles = aggregate("Doubles");
  const teamGames = aggregate("Team Game");

  const overallRows = currentPlayerRows.filter((row) => row.gameType === "Overall");
  const overallSummary = {
    played: overallRows.reduce((acc, row) => acc + (row.wins + row.loses), 0),
    wins: overallRows.reduce((acc, row) => acc + row.wins, 0),
    losses: overallRows.reduce((acc, row) => acc + row.loses, 0),
    legsFor: overallRows.reduce((acc, row) => acc + (row.legsFor ?? 0), 0),
    legsAgainst: overallRows.reduce((acc, row) => acc + (row.legsAgainst ?? 0), 0),
    result: overallRows.reduce((acc, row) => acc + (row.wins - row.loses), 0),
    rank: overallRows.at(-1)?.rankValue ?? 0,
  };


  const fineTypeChartData = Object.entries(
    data.finesWithType.reduce<Record<string, number>>((acc, fine) => {
      const key = fine.title || "Unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {}),
  ).map(([type, count]) => ({ type, count }));


  return (
    <PlayerOverviewClient
      player={{
        id: data.player.id,
        name: data.player.name,
        nickname: data.player.nickname,
        imgUrl: data.player.imgUrl,
        userid: data.player.userid ?? null,
      }}
      clerkUserId={clerkUserId}
      totalFinesIssuedValue={data.totalFinesIssuedValue}
      finesCount={data.finesWithType.length}
      paidFinesCount={data.paidFines.length}
      unpaidFinesCount={data.unpaidFines.length}
      paidFinesValue={data.paidFines.reduce((acc, fine) => acc + (fine.amount ?? 0), 0)}
      unpaidFinesValue={data.unpaidFines.reduce((acc, fine) => acc + (fine.amount ?? 0), 0)}
      subsTotalValue={data.subs.reduce((acc, sub) => acc + sub.amount, 0)}
      paidSubsCount={data.paidSubs.length}
      unpaidSubsCount={data.unpaidSubs.length}
      seasonsPlayed={data.seasonSummaries.filter((season) => season.totalGames > 0).length}
      totalGamesWon={data.totalGamesWon}
      totalGamesLost={data.totalGamesLost}
      totalMatchesPlayed={data.totalMatchesPlayed}
      singles={singles}
      doubles={doubles}
      teamGames={teamGames}
      fineTypeChartData={fineTypeChartData}
      overallSummary={overallSummary}
    />
  );
}
