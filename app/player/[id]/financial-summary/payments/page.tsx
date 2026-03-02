import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";

export default async function PlayerPaymentsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDashboardData(Number(id));

  if (!data.player) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Payments</h2>
      <Card>
        <CardHeader><CardTitle>Totals</CardTitle></CardHeader>
        <CardContent>£{data.totalPaymentsValue.toFixed(2)} across {data.payments.length} payments</CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Payment list</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-GB") : "-"}</TableCell>
                  <TableCell>{payment.paymentStatus}</TableCell>
                  <TableCell>{payment.paymentMethod}</TableCell>
                  <TableCell>£{payment.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
