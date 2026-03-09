"use client";

import { useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Payment = {
  id: number;
  createdAt: string | null;
  amount: number;
  paymentMethod: string;
  paymentStatus: string;
};

const PAGE_SIZE = 10;

function getStatusBadgeClass(status: string) {
  const normalized = status.toLowerCase();
  if (normalized === "completed" || normalized === "paid" || normalized === "succeeded") {
    return "bg-green-600 text-white";
  }
  return "bg-muted text-muted-foreground";
}

export function PaymentsTableClient({ payments }: { payments: Payment[] }) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return payments;
    return payments.filter((payment) => payment.paymentStatus.toLowerCase() === statusFilter.toLowerCase());
  }, [payments, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Payment list</CardTitle>
        <select
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setPage(1);
          }}
        >
          <option value="all">All statuses</option>
          <option value="completed">Completed</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-3">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Date</TableHead><TableHead>Status</TableHead><TableHead>Method</TableHead><TableHead>Amount</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell>{payment.createdAt ? new Date(payment.createdAt).toLocaleDateString("en-GB") : "-"}</TableCell>
                <TableCell>
                  <Badge className={getStatusBadgeClass(payment.paymentStatus)}>{payment.paymentStatus}</Badge>
                </TableCell>
                <TableCell>{payment.paymentMethod}</TableCell>
                <TableCell>£{payment.amount.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Page {safePage} of {pageCount}</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage <= 1}>Prev</Button>
            <Button size="sm" variant="outline" onClick={() => setPage((p) => Math.min(pageCount, p + 1))} disabled={safePage >= pageCount}>Next</Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
