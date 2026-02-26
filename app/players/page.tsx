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
import { Plus } from "lucide-react";
import { PlayerCardList } from "./player-card-list";
export const dynamic = "force-dynamic";

export default async function GetFineTypePage() {
  const players = (await db.query.players.findMany()).map((player) => ({
    ...player,
    createdAt: player.createdAt ? player.createdAt.toISOString() : null,
  }));

  const total = players.length; // Calculate all players

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between flex-row">
            <div>Players</div>
            <div>
              <Link
                href="/players/add-player"
                className="flex justify-center"
              >
                <Button size="sm" className="mb-4" variant="outline">
                  Add Player <Plus className="ml-2" size={16} />
                </Button>
              </Link>
            </div>
          </CardTitle>
          <CardDescription>List of all {total} players</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 overflow-auto">
          <PlayerCardList players={players} />
        </CardContent>
      </Card>
    </div>
  );
}
