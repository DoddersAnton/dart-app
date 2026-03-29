import { db } from "@/server";
import { getFixtureKpis } from "@/server/actions/get-fixture-kpis";
import { getGamesSummaryBySeason } from "@/server/actions/get-player-games-summary";
import { ReportsClient } from "./reports-client";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const [kpisResult, summaryResult, players, fines, playerFines, payments] = await Promise.all([
    getFixtureKpis(),
    getGamesSummaryBySeason(),
    db.query.players.findMany(),
    db.query.fines.findMany(),
    db.query.playerFines.findMany(),
    db.query.payments.findMany(),
  ]);

  const seasonKpis = kpisResult.success ?? [];
  const seasonSummaries = summaryResult.success ?? [];

  // Player leaderboard — latest season overall rankings
  const latestSeason = seasonSummaries.at(-1);
  const leaderboard = (latestSeason?.gameTypesSummaries ?? [])
    .filter((r) => r.gameType === "Overall")
    .sort((a, b) => (a.rankValue ?? 0) - (b.rankValue ?? 0))
    .map((r) => ({
      playerId: r.playerId!,
      name: r.playerName!,
      nickname: r.nickname ?? null,
      imgUrl: players.find((p) => p.id === r.playerId)?.imgUrl ?? null,
      wins: r.wins,
      losses: r.loses,
      rank: r.rankValue ?? 0,
    }));

  // Fines leaderboard
  const finesLeaderboard = players
    .map((player) => {
      const pf = playerFines.filter((f) => f.playerId === player.id);
      const total = pf.reduce((acc, f) => {
        const fine = fines.find((fi) => fi.id === f.fineId);
        return acc + (fine?.amount ?? 0);
      }, 0);
      return {
        playerId: player.id,
        name: player.name,
        nickname: player.nickname ?? null,
        imgUrl: player.imgUrl ?? null,
        count: pf.length,
        total,
        unpaid: pf.filter((f) => f.status !== "Paid").reduce((acc, f) => {
          const fine = fines.find((fi) => fi.id === f.fineId);
          return acc + (fine?.amount ?? 0);
        }, 0),
      };
    })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.total - a.total);

  // Financial summary
  const totalFinesIssued = finesLeaderboard.reduce((acc, p) => acc + p.total, 0);
  const totalFinesUnpaid = finesLeaderboard.reduce((acc, p) => acc + p.unpaid, 0);
  const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);

  return (
    <div className="w-full mt-22 lg:w-[80%] px-4 mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold">Reports</h1>
      <ReportsClient
        seasonKpis={seasonKpis}
        leaderboard={leaderboard}
        finesLeaderboard={finesLeaderboard}
        financials={{ totalFinesIssued, totalFinesUnpaid, totalPayments }}
        latestSeason={latestSeason?.season ?? null}
      />
    </div>
  );
}
