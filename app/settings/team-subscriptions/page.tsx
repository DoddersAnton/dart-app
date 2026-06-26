import { cookies } from "next/headers";
import { eq, inArray } from "drizzle-orm";
import { db } from "@/server";
import { playerTeams, subscriptions as subsTable, team as teamTable } from "@/server/schema";
import { isTeamAdmin } from "@/lib/permissions";
import { TeamSubscriptionsClient, SubGroup } from "@/components/subscriptions/team-subscriptions-client";

export const dynamic = "force-dynamic";

export default async function TeamSubscriptionsPage() {
  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  if (!activeTeamId) {
    return (
      <div className="mx-auto">
        <h1 className="text-2xl font-bold">Team subscriptions</h1>
        <p className="text-muted-foreground mt-2">Select an active team to manage subscriptions.</p>
      </div>
    );
  }

  const [teamRecord, memberships, allPlayers, seasons, canManage] = await Promise.all([
    db.query.team.findFirst({ where: eq(teamTable.id, activeTeamId) }),
    db.query.playerTeams.findMany({ where: eq(playerTeams.teamId, activeTeamId) }),
    db.query.players.findMany(),
    db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    isTeamAdmin(),
  ]);

  const teamPlayerIds = [...new Set(memberships.map((m) => m.playerId))];
  const playerName = (id: number) => {
    const p = allPlayers.find((x) => x.id === id);
    return p ? (p.nickname ? `${p.name} (${p.nickname})` : p.name) : "Unknown";
  };

  const subs = teamPlayerIds.length
    ? await db.query.subscriptions.findMany({ where: inArray(subsTable.playerId, teamPlayerIds) })
    : [];

  // Group into "raised" batches by season + type.
  const groupMap = new Map<string, SubGroup>();
  for (const s of subs) {
    const key = `${s.season}__${s.subscriptionType}__${s.amount}__${s.startDate?.toISOString() ?? ""}__${s.endDate?.toISOString() ?? ""}`;
    let g = groupMap.get(key);
    if (!g) {
      g = {
        key,
        season: s.season,
        subscriptionType: s.subscriptionType,
        description: s.description ?? "",
        amount: s.amount,
        startDate: s.startDate ? s.startDate.toISOString() : null,
        endDate: s.endDate ? s.endDate.toISOString() : null,
        totalCount: 0,
        paidCount: 0,
        paidPct: 0,
        totalValue: 0,
        paidValue: 0,
        subs: [],
      };
      groupMap.set(key, g);
    }
    const paid = s.status === "Paid";
    g.totalCount += 1;
    g.totalValue += s.amount;
    if (paid) {
      g.paidCount += 1;
      g.paidValue += s.amount;
    }
    g.subs.push({ id: s.id, playerId: s.playerId, playerName: playerName(s.playerId), status: paid ? "Paid" : "Unpaid", amount: s.amount });
  }

  const groups = [...groupMap.values()]
    .map((g) => ({
      ...g,
      paidPct: g.totalValue > 0 ? (g.paidValue / g.totalValue) * 100 : g.totalCount > 0 ? (g.paidCount / g.totalCount) * 100 : 0,
      subs: g.subs.sort((a, b) => a.playerName.localeCompare(b.playerName)),
    }))
    .sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));

  const seasonOptions = seasons.map((s) => ({
    name: s.name,
    startDate: s.startDate.toISOString(),
    endDate: s.endDate.toISOString(),
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Team subscriptions</h1>
      <p className="text-muted-foreground">Subscriptions raised for {teamRecord?.name ?? "your team"}, by season.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        <TeamSubscriptionsClient
          groups={groups}
          seasons={seasonOptions}
          teamName={teamRecord?.name ?? "your team"}
          playerCount={teamPlayerIds.length}
          canManage={canManage}
        />
      </div>
    </div>
  );
}
