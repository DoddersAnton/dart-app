"use client";

import { useState } from "react";
import { InfoIcon } from "lucide-react";

import PaymentDrawer from "@/components/players/pay-drawer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  playerId: number;
  unpaidFinesTotal: number;
  paidFinesTotal: number;
  unpaidSubsTotal: number;
  paidSubsTotal: number;
  unpaidFineIds: number[];
  unpaidSubIds: number[];
};

export function FinancialSummaryClient({
  playerId,
  unpaidFinesTotal,
  paidFinesTotal,
  unpaidSubsTotal,
  paidSubsTotal,
  unpaidFineIds,
  unpaidSubIds,
}: Props) {
  const [open, setOpen] = useState(false);

  return (
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
        {/* Outstanding Total Overview */}
        {unpaidSubsTotal + unpaidFinesTotal > 0.3 ? (
          <PaymentDrawer
            amount={unpaidFinesTotal + unpaidSubsTotal + 0.35}
            playerId={playerId}
            fineList={unpaidFineIds}
            open={open}
            setOpen={setOpen}
            sublist={unpaidSubIds}
          />
        ) : (
          <span className="text-xs text-muted-foreground">
            Payment value must be over 30p to proceed to payment.
          </span>
        )}

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

        {/* Total Overview */}
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

        {/* Fines Breakdown */}
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

        {/* Subscriptions Breakdown */}
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
  );
}
