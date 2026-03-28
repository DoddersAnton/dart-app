"use client";

import { useMemo, useState } from "react";

import PaymentDrawer from "@/components/players/pay-drawer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type Fine = {
  id: number;
  title: string;
  status: string | null;
  amount: number;
  createdAt: string | null;
};

const PAGE_SIZE = 10;

const isPaid = (status: string | null) => (status ?? "").toLowerCase() === "paid";

const STRIPE_FEE = 0.35;
const MIN_AMOUNT = 0.30;

export function FinesTableClient({ fines, playerId }: { fines: Fine[]; playerId: number }) {
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "unpaid">("all");
  const [page, setPage] = useState(1);
  const [selectedFineIds, setSelectedFineIds] = useState<number[]>([]);
  const [open, setOpen] = useState(false);
  const [payAllOpen, setPayAllOpen] = useState(false);

  const unpaidFines = useMemo(() => fines.filter((fine) => !isPaid(fine.status)), [fines]);
  const unpaidTotal = useMemo(() => unpaidFines.reduce((sum, fine) => sum + fine.amount, 0), [unpaidFines]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return fines;
    if (statusFilter === "paid") return fines.filter((fine) => isPaid(fine.status));
    return fines.filter((fine) => !isPaid(fine.status));
  }, [fines, statusFilter]);

  const selectedAmount = fines
    .filter((fine) => selectedFineIds.includes(fine.id) && !isPaid(fine.status))
    .reduce((sum, fine) => sum + fine.amount, 0);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        {unpaidFines.length === 0 ? (
          <span className="text-sm text-muted-foreground">No fines outstanding</span>
        ) : unpaidTotal > MIN_AMOUNT ? (
          <>
            <PaymentDrawer
              amount={unpaidTotal + STRIPE_FEE}
              playerId={playerId}
              fineList={unpaidFines.map((f) => f.id)}
              open={payAllOpen}
              setOpen={setPayAllOpen}
            />
            <span className="text-xs text-muted-foreground">35p transaction fee included</span>
          </>
        ) : (
          <span className="text-sm text-muted-foreground">Outstanding amount too low to pay (min 30p)</span>
        )}
      </div>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3">
        <CardTitle>Fine details</CardTitle>
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
        {selectedFineIds.length > 0 ? (
          selectedAmount > MIN_AMOUNT ? (
            <PaymentDrawer
              amount={selectedAmount + STRIPE_FEE}
              playerId={playerId}
              fineList={selectedFineIds}
              open={open}
              setOpen={setOpen}
            />
          ) : (
            <span className="text-xs text-muted-foreground">Payment value must be over 30p to proceed to payment.</span>
          )
        ) : null}

        <Table>
          <TableHeader>
            <TableRow><TableHead></TableHead><TableHead>Fine</TableHead><TableHead>Status</TableHead><TableHead>Amount</TableHead><TableHead>Date</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {paginated.map((fine) => {
              const unpaid = !isPaid(fine.status);
              return (
                <TableRow key={fine.id}>
                  <TableCell>
                    {unpaid ? (
                      <input
                        type="checkbox"
                        checked={selectedFineIds.includes(fine.id)}
                        onChange={(event) => {
                          setSelectedFineIds((prev) =>
                            event.target.checked ? [...prev, fine.id] : prev.filter((id) => id !== fine.id),
                          );
                        }}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell>{fine.title}</TableCell>
                  <TableCell>
                    <Badge className={unpaid ? "bg-muted text-muted-foreground" : "bg-green-600 text-white"}>{fine.status ?? "Unpaid"}</Badge>
                  </TableCell>
                  <TableCell>£{fine.amount.toFixed(2)}</TableCell>
                  <TableCell>{fine.createdAt ? new Date(fine.createdAt).toLocaleDateString("en-GB") : "-"}</TableCell>
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
    </div>
  );
}
