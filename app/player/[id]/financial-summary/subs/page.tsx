import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";
import { SubsTableClient } from "./subs-table-client";

export default async function PlayerSubsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) notFound();

  const subs = data.subs.map((sub) => ({
    id: sub.id,
    subscriptionType: sub.subscriptionType,
    season: sub.season,
    status: sub.status,
    amount: sub.amount,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Subscriptions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>All subs</CardTitle></CardHeader><CardContent>{data.subs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid / Unpaid</CardTitle></CardHeader><CardContent>{data.paidSubs.length} / {data.unpaidSubs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total value</CardTitle></CardHeader><CardContent>£{data.subs.reduce((acc, sub) => acc + sub.amount, 0).toFixed(2)}</CardContent></Card>
      </div>

      <SubsTableClient subs={subs} playerId={playerId} />
    </div>
  );
}
