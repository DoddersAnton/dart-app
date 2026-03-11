import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";
import { PaymentsTableClient } from "./payments-table-client";

export default async function PlayerPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDashboardData(Number(id));

  if (!data.player) notFound();

  const payments = data.payments.map((payment) => ({
    id: payment.id,
    createdAt: payment.createdAt ? payment.createdAt.toISOString() : null,
    amount: payment.amount,
    paymentMethod: payment.paymentMethod,
    paymentStatus: payment.paymentStatus,
  }));

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Payments</h2>
      <Card>
        <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
        <CardContent>£{data.totalPaymentsValue.toFixed(2)} across {data.payments.length} payments</CardContent>
      </Card>

      <PaymentsTableClient payments={payments} />
    </div>
  );
}
