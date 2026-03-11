import { notFound } from "next/navigation";

import { getPlayerDashboardData } from "../_lib/player-dashboard-data";
import { FinancialSummaryClient } from "./financial-summary-client";

export default async function PlayerFinancialSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);
  const data = await getPlayerDashboardData(playerId);

  if (!data.player) notFound();

  const unpaidFinesTotal = data.unpaidFines.reduce((sum, fine) => sum + (fine.amount ?? 0), 0);
  const paidFinesTotal = data.paidFines.reduce((sum, fine) => sum + (fine.amount ?? 0), 0);
  const unpaidSubsTotal = data.unpaidSubs.reduce((sum, sub) => sum + sub.amount, 0);
  const paidSubsTotal = data.paidSubs.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Financial summary</h2>
      <FinancialSummaryClient
        playerId={playerId}
        unpaidFinesTotal={unpaidFinesTotal}
        paidFinesTotal={paidFinesTotal}
        unpaidSubsTotal={unpaidSubsTotal}
        paidSubsTotal={paidSubsTotal}
        unpaidFineIds={data.unpaidFines.map((fine) => fine.id)}
        unpaidSubIds={data.unpaidSubs.map((sub) => sub.id)}
      />
    </div>
  );
}
