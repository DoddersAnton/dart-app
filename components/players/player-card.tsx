"use client";

import { Calendar, UserIcon, UsersIcon } from "lucide-react";
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

  const { payments, loading, error } = usePlayerPayments(playerData.id);


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
              <CardContent className="grid gap-6">
                <PayFinesForm
                  playerFinesData={playerData.playerFinesData}
                  playerId={playerData.id}
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
