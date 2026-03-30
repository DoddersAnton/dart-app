"use client";

import { useState } from "react";
import { PoundSterling, Target } from "lucide-react";

import PaymentDrawer from "@/components/players/pay-drawer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
  const totalOutstanding = unpaidFinesTotal + unpaidSubsTotal;
  const canPay = totalOutstanding > 0.3;

  return (
    <div className="space-y-6">

      {/* Outstanding section */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Outstanding Balance</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Fines</p>
              <p className="text-xl font-bold text-amber-500">£{unpaidFinesTotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Subs</p>
              <p className="text-xl font-bold text-amber-500">£{unpaidSubsTotal.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total</p>
              <p className={`text-xl font-bold ${totalOutstanding > 0 ? "text-destructive" : "text-green-600"}`}>
                £{totalOutstanding.toFixed(2)}
              </p>
            </div>
          </div>
          <Separator />
          {canPay ? (
            <div className="space-y-1">
              <PaymentDrawer
                amount={totalOutstanding + 0.35}
                playerId={playerId}
                fineList={unpaidFineIds}
                open={open}
                setOpen={setOpen}
                sublist={unpaidSubIds}
              />
              <p className="text-xs text-muted-foreground text-center">35p transaction fee included</p>
            </div>
          ) : totalOutstanding > 0 ? (
            <p className="text-xs text-muted-foreground text-center">Payment value must be over 30p to proceed.</p>
          ) : (
            <p className="text-xs text-green-600 text-center font-medium">All paid up!</p>
          )}
        </CardContent>
      </Card>

      {/* Fines & Subs breakdown */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><PoundSterling className="h-4 w-4" /> Fines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-bold">£{(paidFinesTotal + unpaidFinesTotal).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">£{paidFinesTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                <p className="text-xl font-bold text-amber-500">£{unpaidFinesTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Subscriptions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="text-xl font-bold">£{(paidSubsTotal + unpaidSubsTotal).toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Paid</p>
                <p className="text-xl font-bold text-green-600">£{paidSubsTotal.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                <p className="text-xl font-bold text-amber-500">£{unpaidSubsTotal.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
