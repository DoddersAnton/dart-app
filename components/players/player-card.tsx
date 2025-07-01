"use client";

import { Calendar, InfoIcon, UserIcon, UsersIcon } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import PayFinesForm from "./pay-fines";
import { useEffect, useState } from "react";
import { getPaymentsByPlayer } from "@/server/actions/get-payments-by-player";
import { Badge } from "../ui/badge";
import PaymentDrawer from "./pay-drawer";
import { getPlayerSubscriptions } from "@/server/actions/get-player-subscriptions";
import { SubscriptionDataTable } from "@/app/subscriptions/subscriptions-table";
import { playerSubscriptionColumns } from "./player-subscriptions-columns";
import { getFinesByPlayer } from "@/server/actions/get-fines-by-player";

//import { PlayerFinesSummary } from "@/app/fines/player-fines-summary";
//import PayFinesForm from "./pay-fines";

export type Player = {
  id: number;
  name: string;
  nickname: string | null;
  team: string | null;
  createdAt: string | null;
  //totalFines: number | null;
  /*playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    status: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
  }[];*/
};

type Payment = {
  id: number;
  createdAt: Date | null;
  amount: number;
  playerId: number;
  paymentMethod: string;
  paymentType: string;
  paymentStatus: string;
  transactionId: string | null;
};

type Subscription = {
  id: number;
  playerId: number;
  amount: number;
  player: string;
  description: string;
  subscriptionType: string;
  season: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
};

type Fine = {
  id: number;
  player: string;
  playerId: number;
  fine: string;
  fineId: number;
  matchDate: string | null;
  status: string;
  notes: string | null;
  amount: number;
  createdAt: string | null;
};

function usePlayerData(playerId: number, playerName?: string) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [subs, setSubscriptions] = useState<Subscription[]>([]);
  const [fines, setFines] = useState<Fine[]>([]);
  const [unpaidFinesTotal, setUnpaidFinesTotal] = useState<number>(0);
  const [paidFinesTotal, setPaidFinesTotal] = useState<number>(0);
  const [unpaidSubsTotal, setUnpaidSubsTotal] = useState<number>(0);
  const [paidSubsTotal, setPaidSubsTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);

    getPlayerSubscriptions(playerId)
      .then((data) => {
        const rawSubscriptions = Array.isArray(data.success)
          ? data.success
          : data.success
          ? [data.success]
          : [];

        const subs: Subscription[] = rawSubscriptions.map((s) => ({
          id: s.id,
          playerId: s.playerId,
          player: playerName || "",
          description: s.description || "",
          subscriptionType: s.subscriptionType || "",
          amount: s.amount,
          status: s.status || "Unpaid",
          season: s.season || "",
          startDate: s.startDate ? new Date(s.startDate) : null,
          endDate: s.endDate ? new Date(s.endDate) : null,
          createdAt: s.createdAt ? new Date(s.createdAt) : null,
        }));

        setSubscriptions(subs);
        setUnpaidSubsTotal(
          subs
            .filter((sub) => sub.status === "Unpaid" || sub.status === "Active")
            .reduce((sum, sub) => sum + sub.amount, 0)
        );
        setPaidSubsTotal(
          subs
            .filter((sub) => sub.status === "Paid")
            .reduce((sum, sub) => sum + sub.amount, 0)
        );
      })
      .catch((err) => setError(err.message || "Error fetching subscriptions"));

    getPaymentsByPlayer(playerId)
      .then((data) => {
        const rawPayments = Array.isArray(data.success)
          ? data.success
          : data.success
          ? [data.success]
          : [];

        const payments: Payment[] = rawPayments.map((p) => ({
          id: p.id,
          playerId: p.playerId,
          amount: p.amount,
          paymentMethod: p.paymentMethod || "",
          paymentType: p.paymentType || "",
          paymentStatus: p.paymentStatus || "",
          transactionId: p.transactionId || null,
          createdAt: p.createdAt ? new Date(p.createdAt) : null,
        }));
        setPayments(payments);
      })
      .catch((err) => setError(err.message || "Error fetching payments"));

    getFinesByPlayer(playerId)
      .then((data) => {
        const rawFines = Array.isArray(data.success)
          ? data.success
          : data.success
          ? [data.success]
          : [];

        const fines = rawFines.map((f) => ({
          id: f.id,
          player: playerName || "",
          playerId: playerId,
          fine: f.fineName ?? "",
          fineId: f.fineId,
          matchDate: f.matchDate
            ? new Date(f.matchDate).toLocaleDateString("en-GB")
            : null,
          status: f.status ?? "Unpaid",
          notes: f.notes ?? null,
          amount: typeof f.amount === "number" ? f.amount : 0,
          createdAt: f.createdAt
            ? new Date(f.createdAt).toLocaleDateString("en-GB")
            : null,
        }));
        setFines(fines);
        setUnpaidFinesTotal(
          fines
            .filter((fine) => fine.status === "Unpaid")
            .reduce((sum, fine) => sum + fine.amount, 0)
        );
        setPaidFinesTotal(
          fines
            .filter((fine) => fine.status === "Paid")
            .reduce((sum, fine) => sum + fine.amount, 0)
        );
      })
      .catch((err) => setError(err.message || "Error fetching fines"))
      .finally(() => setLoading(false));
  }, [playerId]);

  return {
    payments,
    subs,
    fines,
    loading,
    error,
    unpaidFinesTotal,
    paidFinesTotal,
    unpaidSubsTotal,
    paidSubsTotal,
  };
}

export default function PlayerCard({ playerData }: { playerData: Player }) {
  //<PayFinesForm playerFinesData={playerData.playerFinesData}  />
  const [open, setOpen] = useState(false);
  const {
    payments,
    subs,
    fines,
    loading,
    error,
    unpaidFinesTotal,
    paidFinesTotal,
    unpaidSubsTotal,
    paidSubsTotal,
  } = usePlayerData(playerData.id, playerData.name);

  const unpaidFines = fines.filter((fine) => fine.status === "Unpaid");

  const unpaidSubs = subs.filter(
    (sub) => sub.status === "Unpaid" || sub.status === "Active"
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{playerData.name}</CardTitle>
        <div className="flex flex-row items-center gap-6">
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <UserIcon size={12} />
              </div>
              <div>{playerData.nickname}</div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <UsersIcon size={12} />
              </div>
              <div>{playerData.team}</div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Calendar size={12} />
              </div>
              <div>{playerData.createdAt}</div>
            </div>{" "}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Tabs defaultValue="finSum" className="overflow-auto">
          <TabsList>
            <TabsTrigger value="finSum">Financial Summary</TabsTrigger>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="fines">
              Fines (£
              {(paidFinesTotal + unpaidFinesTotal)?.toFixed(2) ?? "0.00"})
            </TabsTrigger>
            <TabsTrigger value="subs">
              Subs (£{(paidSubsTotal + unpaidSubsTotal)?.toFixed(2) ?? "0.00"})
            </TabsTrigger>
            <TabsTrigger value="attendances">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="finSum">
            <Card className="overflow-auto">
              <CardHeader>
                <CardTitle>Financial Summary</CardTitle>
                <CardDescription>
                  {`This section provides a summary of the player's financials.`}
                </CardDescription>
                <div className="mt-4 flex items-center gap-1 flex-row">
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
                    playerId={playerData.id}
                    fineList={unpaidFines.map((fine) => fine.id)}
                    open={open}
                    setOpen={setOpen}
                    sublist={unpaidSubs.map((sub) => sub.id)}
                  />
                ) : (
                  <span className="text-xs text-muted-foreground">
                    Payment value must be over 30p to proceed to payment.
                  </span>
                )}

                <div>
                  <h4 className="text-sm font-semibold mb-2">
                    Total Outstanding (payment required)
                  </h4>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Total Out. Fines:</span>
                    <span>£{unpaidFinesTotal?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Total Out. Subscriptions:</span>
                    <span>£{unpaidSubsTotal?.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span
                      className={
                        unpaidSubsTotal + unpaidFinesTotal > 0
                          ? "text-destructive"
                          : "text-green-600"
                      }
                    >
                      Total Out.:
                    </span>
                    <span
                      className={
                        unpaidSubsTotal + unpaidFinesTotal > 0
                          ? "text-destructive"
                          : "text-green-600"
                      }
                    >
                      £
                      {(unpaidSubsTotal + unpaidFinesTotal).toFixed(2) ??
                        "0.00"}
                    </span>
                  </div>
                </div>
                {/* Total Overview */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Totals
                  </h4>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Total Fines:</span>
                    <span>
                      £
                      {(paidFinesTotal + unpaidFinesTotal)?.toFixed(2) ??
                        "0.00"}
                    </span>
                  </div>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Total Subscriptions:</span>
                    <span>
                      £{(unpaidSubsTotal + paidSubsTotal)?.toFixed(2) ?? "0.00"}
                    </span>
                  </div>
                </div>

                {/* Fines Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Fines Breakdown
                  </h4>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Paid Fines:</span>
                    <span>£{paidFinesTotal.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Unpaid Fines:</span>
                    <span>£{unpaidFinesTotal.toFixed(2) ?? "0.00"}</span>
                  </div>
                </div>

                {/* Subscriptions Breakdown */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-muted-foreground">
                    Subscriptions Breakdown
                  </h4>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Paid Subs:</span>
                    <span>£{paidSubsTotal.toFixed(2) ?? "0.00"}</span>
                  </div>
                  <div className="w-full lg:w-[300px] flex justify-between text-sm text-muted-foreground">
                    <span>Unpaid Subs:</span>
                    <span>
                      £
                      {unpaidSubs
                        .reduce((sum, sub) => sum + sub.amount, 0)
                        .toFixed(2)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subs">
            <Card className="overflow-auto">
              <CardHeader>
                <CardTitle>Subs</CardTitle>
                {loading && <div>Loading subs...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {subs.length > 0 ? (
                  <div>
                    <SubscriptionDataTable
                      columns={playerSubscriptionColumns}
                      data={subs}
                      total={subs.length}
                    />
                  </div>
                ) : (
                  <CardDescription>
                    No subscriptions found for this player.
                  </CardDescription>
                )}
              </CardHeader>
              <CardContent className="grid gap-6">
                <div className="grid gap-3"></div>
                <div className="grid gap-3"></div>
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="fines">
            <Card>
              <CardContent className="grid gap-6 space-y-2 overflow-auto">
                <PayFinesForm
                  playerFinesData={fines}
                  playerId={playerData.id}
                  open={open}
                  setOpen={setOpen}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="games">
            <Card>
              <CardHeader>
                <CardTitle>Games</CardTitle>
                <CardDescription> No Data</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6"></CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="attendances">
            <Card>
              <CardHeader>
                <CardTitle>Attendance List</CardTitle>
                <CardDescription> No Data</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-6"></CardContent>
              <CardFooter></CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle className="font-semibold">Payment History</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-6">
                {loading && <div>Loading payments...</div>}
                {error && <div className="text-red-500">{error}</div>}
                {payments.length > 0 ? (
                  <div>
                    <ul className="list-disc pl-5">
                      {payments.map((payment) => (
                        <li key={payment.id}>
                          {payment.createdAt?.toLocaleDateString()} - £
                          {payment.amount.toFixed(2)} ({payment.paymentType}) -{" "}
                          {
                            <Badge variant={"default"}>
                              {payment.paymentStatus}
                            </Badge>
                          }
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div>No payments found for this player.</div>
                )}
              </CardContent>
              <CardFooter></CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
