import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";
import { FinesTableClient } from "./fines-table-client";

export default async function PlayerFinesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) notFound();

  const fines = data.finesWithType.map((fine) => ({
    id: fine.id,
    title: fine.title,
    status: fine.status,
    amount: fine.amount ?? 0,
    createdAt: fine.createdAt ? fine.createdAt.toISOString() : null,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Fines</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Issues</CardTitle></CardHeader><CardContent>{data.finesWithType.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total value</CardTitle></CardHeader><CardContent>£{data.totalFinesIssuedValue.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid / Unpaid</CardTitle></CardHeader><CardContent>{data.paidFines.length} / {data.unpaidFines.length}</CardContent></Card>
      </div>

      <FinesTableClient fines={fines} playerId={playerId} />
    </div>
  );
}
