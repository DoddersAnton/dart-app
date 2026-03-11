import { eq } from "drizzle-orm";

import { db } from "@/server";
import { getGamesSummaryBySeason } from "@/server/actions/get-player-games-summary";

export async function getPlayerDashboardData(playerId: number) {
  const [player, fines, subs, payments, gamesSummary] = await Promise.all([
    db.query.players.findFirst({ where: (p) => eq(p.id, playerId) }),
    db.query.playerFines.findMany({ where: (f) => eq(f.playerId, playerId) }),
    db.query.subscriptions.findMany({ where: (s) => eq(s.playerId, playerId) }),
    db.query.payments.findMany({ where: (p) => eq(p.playerId, playerId) }),
    getGamesSummaryBySeason(),
  ]);

  const fineTypes = await db.query.fines.findMany();
  const finesWithType = fines.map((fine) => {
    const fineType = fineTypes.find((item) => item.id === fine.fineId);

    return {
      ...fine,
      title: fineType?.title ?? "Unknown fine",
      amount: fineType?.amount ?? 0,
    };
  });

  const paidFines = finesWithType.filter((fine) => fine.status === "Paid");
  const unpaidFines = finesWithType.filter((fine) => fine.status !== "Paid");

  const paidSubs = subs.filter((sub) => sub.status === "Paid");
  const unpaidSubs = subs.filter((sub) => sub.status !== "Paid");

  const totalFinesIssuedValue = finesWithType.reduce((acc, fine) => acc + (fine.amount ?? 0), 0);
  const totalPaymentsValue = payments.reduce((acc, payment) => acc + payment.amount, 0);

  const seasonSummaries = (gamesSummary.success ?? []).map((summary) => {
    const currentPlayerRows = (summary.gameTypesSummaries ?? []).filter(
      (row) => row.playerId === playerId,
    );

    const overall = currentPlayerRows.find((row) => row.gameType === "Overall");

    return {
      season: summary.season,
      totalMatches: overall?.matchesPlayed ?? 0,
      totalGames: overall?.gamesPlayed ?? 0,
      wins: overall?.wins ?? 0,
      losses: overall?.loses ?? 0,
      allRows: summary.gameTypesSummaries ?? [],
    };
  });

  const totalMatchesPlayed = seasonSummaries.reduce((acc, season) => acc + season.totalMatches, 0);
  const totalGamesWon = seasonSummaries.reduce((acc, season) => acc + season.wins, 0);
  const totalGamesLost = seasonSummaries.reduce((acc, season) => acc + season.losses, 0);

  return {
    player,
    finesWithType,
    paidFines,
    unpaidFines,
    subs,
    paidSubs,
    unpaidSubs,
    payments,
    totalFinesIssuedValue,
    totalPaymentsValue,
    seasonSummaries,
    totalMatchesPlayed,
    totalGamesWon,
    totalGamesLost,
  };
}
