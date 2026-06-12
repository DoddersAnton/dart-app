import { db } from "@/server";
import { eq } from "drizzle-orm";
import { getFixtureKpis } from "@/server/actions/get-fixture-kpis";
import { getGamesSummaryBySeason } from "@/server/actions/get-player-games-summary";
import { playerFines, playerTeams } from "@/server/schema";
import { ReportsClient } from "./reports-client";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  // Players on the active team (for fines leaderboard)
  const teamPlayerIds = activeTeamId
    ? (await db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) }))
        .map((pt) => pt.playerId)
    : null;

  const [kpisResult, summaryResult, players, fines, playerFinesData, payments] = await Promise.all([
    getFixtureKpis(activeTeamId),
    getGamesSummaryBySeason(activeTeamId),
    db.query.players.findMany(),
    db.query.fines.findMany(),
    // Strictly filter fines by active team (same policy as fines page)
    activeTeamId
      ? db.query.playerFines.findMany({ where: eq(playerFines.teamId, activeTeamId) })
      : db.query.playerFines.findMany(),
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

  // Fines leaderboard — scoped to active team's players and fines
  const finesPlayers = teamPlayerIds
    ? players.filter((p) => teamPlayerIds.includes(p.id))
    : players;

  const finesLeaderboard = finesPlayers
    .map((player) => {
      const pf = playerFinesData.filter((f) => f.playerId === player.id);
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
