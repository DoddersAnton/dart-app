import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/server";
import Link from "next/link";
import { SubscriptionDataTable } from "./subscriptions-table";

import { Plus } from "lucide-react";
import { subscriptionColumns } from "./subscriptions-columns";
export const dynamic = "force-dynamic";

export default async function GetSubscriptions() {

    const players = await db.query.players.findMany(); 


  const subscriptions = (await db.query.subscriptions.findMany()).map((sub) => ({
    ...sub,
    player: players.find((p) => p.id === sub.playerId)?.name ?? "unknown",
    
  }));

  const total = subscriptions.length; // Calculate all players

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-row">
            <div>Subsriptions</div>
            <div>
              <Link
                href="/subscriptions/add-subscription"
                className="flex justify-center"
              >
                <Button size="sm" className="mb-4" variant="outline">
                  Add Subscription <Plus className="ml-2" size={16} />
                </Button>
              </Link>
            </div>
          </CardTitle>
          <CardDescription>List of all {total} players</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 overflow-auto">
          <SubscriptionDataTable
            columns={subscriptionColumns}
            data={subscriptions}
            total={total}
          />
        </CardContent>
      </Card>
    </div>
  );
}
