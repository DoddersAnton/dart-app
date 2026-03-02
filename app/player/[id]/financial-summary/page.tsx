import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerDashboardData } from "../_lib/player-dashboard-data";

export default async function PlayerFinancialSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Financial summary</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card><CardHeader><CardTitle>Fines issued</CardTitle></CardHeader><CardContent>{data.finesWithType.length} (£{data.totalFinesIssuedValue.toFixed(2)})</CardContent></Card>
        <Card><CardHeader><CardTitle>Fines paid / unpaid</CardTitle></CardHeader><CardContent>{data.paidFines.length} / {data.unpaidFines.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Subs paid / unpaid</CardTitle></CardHeader><CardContent>{data.paidSubs.length} / {data.unpaidSubs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Payments total</CardTitle></CardHeader><CardContent>£{data.totalPaymentsValue.toFixed(2)}</CardContent></Card>
      </div>
    </div>
  );
}
