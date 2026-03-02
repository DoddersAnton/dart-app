import { notFound } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getPlayerDashboardData } from "../../_lib/player-dashboard-data";

export default async function PlayerFinesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = await getPlayerDashboardData(Number(id));

  if (!data.player) notFound();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-semibold">Fines</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardHeader><CardTitle>Issues</CardTitle></CardHeader><CardContent>{data.finesWithType.length}</CardContent></Card>
        <Card><CardHeader><CardTitle>Total value</CardTitle></CardHeader><CardContent>£{data.totalFinesIssuedValue.toFixed(2)}</CardContent></Card>
        <Card><CardHeader><CardTitle>Paid / Unpaid</CardTitle></CardHeader><CardContent>{data.paidFines.length} / {data.unpaidFines.length}</CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Fine details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow><TableHead>Fine</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow>
            </TableHeader>
            <TableBody>
              {data.finesWithType.map((fine) => (
                <TableRow key={fine.id}>
                  <TableCell>{fine.title}</TableCell>
                  <TableCell>{fine.status}</TableCell>
                  <TableCell>£{(fine.amount ?? 0).toFixed(2)}</TableCell>
                  <TableCell>{fine.createdAt ? new Date(fine.createdAt).toLocaleDateString("en-GB") : "-"}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
