import { InfoIcon } from "lucide-react";
import { notFound } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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

  const unpaidFinesTotal = data.unpaidFines.reduce((sum, fine) => sum + (fine.amount ?? 0), 0);
  const paidFinesTotal = data.paidFines.reduce((sum, fine) => sum + (fine.amount ?? 0), 0);
  const unpaidSubsTotal = data.unpaidSubs.reduce((sum, sub) => sum + sub.amount, 0);
  const paidSubsTotal = data.paidSubs.reduce((sum, sub) => sum + sub.amount, 0);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Financial summary</h2>
      <Card className="overflow-auto">
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
          <CardDescription>
            This section provides a summary of the player&apos;s financials.
          </CardDescription>
          <div className="mt-4 flex flex-row items-center gap-1">
            <InfoIcon size={12} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              All transactions will incur a 35p processing fee.
            </span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold">Total Outstanding (payment required)</h4>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Total Out. Fines:</span>
              <span>£{unpaidFinesTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Total Out. Subscriptions:</span>
              <span>£{unpaidSubsTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span className={unpaidSubsTotal + unpaidFinesTotal > 0 ? "text-destructive" : "text-green-600"}>
                Total Out.:
              </span>
              <span className={unpaidSubsTotal + unpaidFinesTotal > 0 ? "text-destructive" : "text-green-600"}>
                £{(unpaidSubsTotal + unpaidFinesTotal).toFixed(2)}
              </span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Totals</h4>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Total Fines:</span>
              <span>£{(paidFinesTotal + unpaidFinesTotal).toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Total Subscriptions:</span>
              <span>£{(unpaidSubsTotal + paidSubsTotal).toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Fines Breakdown</h4>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Paid Fines:</span>
              <span>£{paidFinesTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Unpaid Fines:</span>
              <span>£{unpaidFinesTotal.toFixed(2)}</span>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-muted-foreground">Subscriptions Breakdown</h4>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Paid Subs:</span>
              <span>£{paidSubsTotal.toFixed(2)}</span>
            </div>
            <div className="flex w-full justify-between text-sm text-muted-foreground lg:w-[300px]">
              <span>Unpaid Subs:</span>
              <span>£{unpaidSubsTotal.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
