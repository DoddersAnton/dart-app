import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";

export default async function PlayerSubsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDashboardData(Number(id));

  if (!data.player) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Subscriptions</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>All subs</CardTitle></CardHeader><CardContent>{data.subs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid / Unpaid</CardTitle></CardHeader><CardContent>{data.paidSubs.length} / {data.unpaidSubs.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total value</CardTitle></CardHeader><CardContent>£{data.subs.reduce((acc, sub) => acc + sub.amount, 0).toFixed(2)}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Subscription list</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Type</TableHead><TableHead>Season</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.subs.map((sub) => (
                <TableRow key={sub.id}>
                  <TableCell>{sub.subscriptionType}</TableCell>
                  <TableCell>{sub.season}</TableCell>
                  <TableCell>{sub.status}</TableCell>
                  <TableCell>£{sub.amount.toFixed(2)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
