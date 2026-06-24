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

  const [kpisResult, summaryResult, players, fines, playerFinesData, subscriptions, seasons] = await Promise.all([
    getFixtureKpis(activeTeamId),
    getGamesSummaryBySeason(activeTeamId),
    db.query.players.findMany(),
    db.query.fines.findMany(),
    // Strictly filter fines by active team (same policy as fines page)
    activeTeamId
      ? db.query.playerFines.findMany({ where: eq(playerFines.teamId, activeTeamId) })
      : db.query.playerFines.findMany(),
    db.query.subscriptions.findMany(),
    db.query.seasons.findMany(),
  ]);

  const seasonKpis = kpisResult.success ?? [];
  const seasonSummaries = summaryResult.success ?? [];

  // Active team's players / subs (everything below is scoped to the active team)
  const finesPlayers = teamPlayerIds ? players.filter((p) => teamPlayerIds.includes(p.id)) : players;
  const teamSubs = teamPlayerIds ? subscriptions.filter((s) => teamPlayerIds.includes(s.playerId)) : subscriptions;
  const fineAmount = (fineId: number) => fines.find((fi) => fi.id === fineId)?.amount ?? 0;

  type LeaderboardEntry = { playerId: number; name: string; nickname: string | null; imgUrl: string | null; wins: number; losses: number; rank: number };
  type FinesEntry = { playerId: number; name: string; nickname: string | null; imgUrl: string | null; count: number; total: number; unpaid: number };
  type SubsSummary = { totalValue: number; paidValue: number; unpaidValue: number; paidCount: number; unpaidCount: number; totalCount: number };
  type Financials = { totalFinesIssued: number; totalFinesPaid: number; totalFinesUnpaid: number };

  const buildStandings = (seasonName: string): LeaderboardEntry[] => {
    const ss = seasonSummaries.find((x) => x.season === seasonName);
    return (ss?.gameTypesSummaries ?? [])
      .filter((r) => r.gameType === "Overall")
      // Only rank players on the active team (excludes opponents / other-team players)
      .filter((r) => !teamPlayerIds || (r.playerId != null && teamPlayerIds.includes(r.playerId)))
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
  };

  const buildFinesLeaderboard = (seasonFines: typeof playerFinesData): FinesEntry[] =>
    finesPlayers
      .map((player) => {
        const pf = seasonFines.filter((f) => f.playerId === player.id);
        return {
          playerId: player.id,
          name: player.name,
          nickname: player.nickname ?? null,
          imgUrl: player.imgUrl ?? null,
          count: pf.length,
          total: pf.reduce((acc, f) => acc + fineAmount(f.fineId), 0),
          unpaid: pf.filter((f) => f.status !== "Paid").reduce((acc, f) => acc + fineAmount(f.fineId), 0),
        };
      })
      .filter((p) => p.count > 0)
      .sort((a, b) => b.total - a.total);

  const buildSubsSummary = (subs: typeof teamSubs): SubsSummary => {
    const paid = subs.filter((s) => s.status === "Paid");
    const unpaid = subs.filter((s) => s.status !== "Paid");
    return {
      totalValue: subs.reduce((acc, s) => acc + s.amount, 0),
      paidValue: paid.reduce((acc, s) => acc + s.amount, 0),
      unpaidValue: unpaid.reduce((acc, s) => acc + s.amount, 0),
      paidCount: paid.length,
      unpaidCount: unpaid.length,
      totalCount: subs.length,
    };
  };

  const buildFinancials = (fl: FinesEntry[]): Financials => {
    const totalFinesIssued = fl.reduce((acc, p) => acc + p.total, 0);
    const totalFinesUnpaid = fl.reduce((acc, p) => acc + p.unpaid, 0);
    return { totalFinesIssued, totalFinesPaid: totalFinesIssued - totalFinesUnpaid, totalFinesUnpaid };
  };

  // Per-season maps keyed by season name (the value the selector uses).
  const ALL = "all";
  const standingsBySeason: Record<string, LeaderboardEntry[]> = {};
  const finesLeaderboardBySeason: Record<string, FinesEntry[]> = {};
  const financialsBySeason: Record<string, Financials> = {};
  const subsSummaryBySeason: Record<string, SubsSummary> = {};

  for (const s of seasons) {
    const name = s.name;
    standingsBySeason[name] = buildStandings(name);
    const fl = buildFinesLeaderboard(playerFinesData.filter((f) => f.seasonId === s.id));
    finesLeaderboardBySeason[name] = fl;
    financialsBySeason[name] = buildFinancials(fl);
    subsSummaryBySeason[name] = buildSubsSummary(teamSubs.filter((sub) => sub.season === name));
  }

  // "All seasons" aggregate
  const allFines = buildFinesLeaderboard(playerFinesData);
  finesLeaderboardBySeason[ALL] = allFines;
  financialsBySeason[ALL] = buildFinancials(allFines);
  subsSummaryBySeason[ALL] = buildSubsSummary(teamSubs);

  const allStandings = new Map<number, LeaderboardEntry>();
  for (const ss of seasonSummaries) {
    for (const r of ss.gameTypesSummaries ?? []) {
      if (r.gameType !== "Overall" || r.playerId == null) continue;
      if (teamPlayerIds && !teamPlayerIds.includes(r.playerId)) continue;
      const e = allStandings.get(r.playerId) ?? {
        playerId: r.playerId,
        name: r.playerName ?? "",
        nickname: r.nickname ?? null,
        imgUrl: players.find((p) => p.id === r.playerId)?.imgUrl ?? null,
        wins: 0,
        losses: 0,
        rank: 0,
      };
      e.wins += r.wins;
      e.losses += r.loses;
      allStandings.set(r.playerId, e);
    }
  }
  standingsBySeason[ALL] = [...allStandings.values()].sort((a, b) => b.wins - a.wins || a.losses - b.losses);

  const latestSeason = seasonSummaries.at(-1)?.season ?? seasons.at(-1)?.name ?? null;


  return (
    <div className="w-full mt-22 lg:w-[80%] px-4 mx-auto space-y-8 pb-12">
      <h1 className="text-2xl font-bold">Reports</h1>
      <ReportsClient
        seasonKpis={seasonKpis}
        standingsBySeason={standingsBySeason}
        finesLeaderboardBySeason={finesLeaderboardBySeason}
        financialsBySeason={financialsBySeason}
        subsSummaryBySeason={subsSummaryBySeason}
        latestSeason={latestSeason}
      />
    </div>
  );
}
