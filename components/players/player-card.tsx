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
//import { PlayerFinesSummary } from "@/app/fines/player-fines-summary";
//import PayFinesForm from "./pay-fines";

export type Player = {
  id: number;
  name: string;
  nickname: string | null;
  team: string | null;
  createdAt: string | null;
  totalFines: number | null;
  playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    status: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
  }[];
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

function usePlayerPayments(playerId: number) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    getPaymentsByPlayer(playerId)
      .then((data) => {
        const rawPayments = Array.isArray(data.success)
          ? data.success
          : data.success
          ? [data.success]
          : [];
        const payments: Payment[] = rawPayments.map((p: Payment) => ({
          id: p.id,
          playerId: p.playerId,
          amount: p.amount,
          paymentMethod: p.paymentMethod || "",
          paymentType: p.paymentType || "",
          paymentStatus: p.paymentStatus || "",
          transactionId: p.transactionId || null,
          createdAt: p.createdAt ? (typeof p.createdAt === "string" ? new Date(p.createdAt) : p.createdAt) : null,
        }));
        setPayments(payments);
      })
      .catch((err) => setError(err.message || "Error fetching payments"))
      .finally(() => setLoading(false));
  }, [playerId]);

  return { payments, loading, error };
}

export default function PlayerCard({ playerData }: { playerData: Player }) {
  //<PayFinesForm playerFinesData={playerData.playerFinesData}  />
 const [open, setOpen] = useState(false);
  const { payments, loading, error } = usePlayerPayments(playerData.id);

  const paidFines = playerData.playerFinesData.filter(
    (fine) => fine.status === "Paid"
  );

  const unpaidFines = playerData.playerFinesData.filter(
    (fine) => fine.status === "Unpaid"
  );



  return (
    <Card >
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
      <CardContent>
        <div className="flex items-center justify-start mb-4">
          
          <div className="flex flex-col gap-1">
            <div className="text-sm text-muted-foreground">
              Total Fines: £
              {playerData.totalFines ? playerData.totalFines.toFixed(2) : "0.00"}
            </div>
            <div className="text-xs text-left text-muted-foreground">
               <div className="text-left">
                Paid Fines:{" "}
                £{paidFines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}
              </div>
              <div className="text-left">
                Unpaid Fines:{" "}
                £{unpaidFines.reduce((sum, fine) => sum + fine.amount, 0).toFixed(2)}
              </div>
              
              <div className="mt-4 flex items-center gap-1 flex-row">
                <InfoIcon size={12} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  All transactions will incur a 35p processing fee.
                </span> 
              </div>
              
             
            </div>
            {unpaidFines.length > 0 && unpaidFines.reduce((sum, fine) => sum + fine.amount, 0) > 0.30 ? (
              <PaymentDrawer
                amount={(playerData.totalFines ?? 0) + 0.35}
                playerId={playerData.id}
                fineList={unpaidFines.map(fine => fine.id)}
                open={open}
                setOpen={setOpen}
              />
            ) : (
              <span className="text-xs text-muted-foreground">
                Payment value must be over 30p to proceed to payment.
              </span>
            )}
        </div>
        </div>

        <Tabs defaultValue="fines">
          <TabsList>
            <TabsTrigger value="games">Games</TabsTrigger>
            <TabsTrigger value="fines">
              Fines (£
              {playerData.totalFines
                ? playerData.totalFines.toFixed(2)
                : "0.00"}
              )
            </TabsTrigger>
            <TabsTrigger value="subs">Subs</TabsTrigger>
            <TabsTrigger value="attendances">Attendance</TabsTrigger>
            <TabsTrigger value="payments">Payments</TabsTrigger>
          </TabsList>
          <TabsContent value="subs">
            <Card>
              <CardHeader>
                <CardTitle>Subs</CardTitle>
                <CardDescription> No Data</CardDescription>
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
                  playerFinesData={playerData.playerFinesData}
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
                          {payment.amount.toFixed(2)} ({payment.paymentType}) - {<Badge variant={"default"}>{payment.paymentStatus}</Badge>}
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
