import { db } from "@/server";
import { playerFinesColumns } from "./player-fines-columns";
import { PlayerFinesDataTable } from "./playerfines-data-table";
import { desc } from "drizzle-orm";
import { PlayerFinesSummaryDataTable } from "./player-summary-table";
import { summaryColumns } from "./player-summary-columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function Page() {
  const players = await db.query.players.findMany();
  const fines = await db.query.fines.findMany();

  const dataTable = await db.query.playerFines.findMany({
    /* with: {
      players: true,
      fine: true,
    },*/
    orderBy: (f) => [desc(f.createdAt)],
  });

  console.log("DataTable", dataTable);
  console.log("Players", players);
  console.log("Fines", fines);

  // Map the data to the desired format

  const data = dataTable.map((item) => ({
    id: item.id,
    player: players.find((c) => c.id === item.playerId)?.name ?? "unknown", // Explicitly cast to Player
    fine: fines.find((c) => c.id === item.fineId)?.title ?? "unknown", // Explicitly cast to Fine
    matchDate: item.matchDate ? item.matchDate.toISOString() : null,
    notes: item.notes,
    amount: fines.find((c) => c.id === item.fineId)?.amount ?? 0,
    createdAt: item.createdAt ? item.createdAt.toISOString() : null,
  }));

  console.log("DataTable", dataTable);

  const total = data.reduce((acc, item) => acc + item.amount, 0); // Calculate the total amount

  const finesSummary = Object.values(
    data.reduce(
      (
        acc: Record<string, { player: string; total: number; count: number }>,
        fine
      ) => {
        const player = fine.player;
        if (!acc[player]) {
          acc[player] = {
            player: player,
            total: 0,
            count: 0,
          };
        }
        acc[player].total += fine.amount;
        acc[player].count += 1;
        return acc;
      },
      {} as Record<string, { player: string; total: number; count: number }>
    )
  );

  return (
    <div>
      <Tabs defaultValue="summary" className="w-full px-2 mx-auto lg:w-[80%] mt-22">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <Card>
            <CardHeader>
            <CardTitle className="flex items-center justify-between flex-row">
            <div>Player Totals</div>
            <div>
              <Link
                href="/fines/add-fine"
                className="flex justify-center"
              >
                <Button size="sm" className="mb-4" variant="outline">
                  Add Fine <Plus className="ml-2" size={16} />
                </Button>
              </Link>
            </div>
          </CardTitle>
              <CardDescription>Total fines per player</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <PlayerFinesSummaryDataTable
                columns={summaryColumns}
                data={finesSummary}
                total={total}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Player Fines</CardTitle>
              <CardDescription>
                Update, delete and edit player fines
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <PlayerFinesDataTable
                columns={playerFinesColumns}
                data={data}
                total={total}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
