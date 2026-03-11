"use client";

import { useMemo, useState } from "react";

import PaymentDrawer from "@/components/players/pay-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Sub = {
  id: number;
  subscriptionType: string;
  season: string;
  status: string;
  amount: number;
};

const PAGE_SIZE = 10;

const isPaid = (status: string) => status.toLowerCase() === "paid";

export function SubsTableClient({ subs, playerId }: { subs: Sub[]; playerId: number }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [page, setPage] = useState(1);
  const [selectedSubIds, setSelectedSubIds] = useState<number[]>([]);
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return subs;
    if (statusFilter === "paid") return subs.filter((sub) => isPaid(sub.status));
    return subs.filter((sub) => !isPaid(sub.status));
  }, [subs, statusFilter]);

  const selectedAmount = subs
    .filter((sub) => selectedSubIds.includes(sub.id) && !isPaid(sub.status))
    .reduce((sum, sub) => sum + sub.amount, 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Subscription list</CardTitle>
        <select
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value as "all" | "paid" | "unpaid");
            setPage(1);
          }}
        >
          <option value="all">All</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </CardHeader>
      <CardContent className="space-y-3">
        {selectedSubIds.length > 0 ? (
          selectedAmount > 0.3 ? (
            <PaymentDrawer
              amount={selectedAmount + 0.35}
              playerId={playerId}
              sublist={selectedSubIds}
              open={open}
              setOpen={setOpen}
            />
          ) : (
            <span className="text-xs text-muted-foreground">Payment value must be over 30p to proceed to payment.</span>
          )
        ) : null}

        <Table>
          <TableHeader>
            <TableRow><TableHead></TableHead><TableHead>Type</TableHead><TableHead>Season</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((sub) => {
              const unpaid = !isPaid(sub.status);
              return (
                <TableRow key={sub.id}>
                  <TableCell>
                    {unpaid ? (
                      <input
                        type="checkbox"
                        checked={selectedSubIds.includes(sub.id)}
                        onChange={(event) => {
                          setSelectedSubIds((prev) =>
                            event.target.checked ? [...prev, sub.id] : prev.filter((id) => id !== sub.id),
                          );
                        }}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>{sub.subscriptionType}</TableCell>
                  <TableCell>{sub.season}</TableCell>
                  <TableCell>
                    <Badge className={unpaid ? "bg-muted text-muted-foreground" : "bg-green-600 text-white"}>{sub.status}</Badge>
                  </TableCell>
                  <TableCell>£{sub.amount.toFixed(2)}</TableCell>
                </TableRow>
              );
            })}
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
