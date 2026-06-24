import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { db } from "@/server";
import { players } from "@/server/schema";
import { eq } from "drizzle-orm";
import { getPlayerPracticeGames } from "@/server/actions/get-player-practice-games";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Target, Plus, TrendingUp } from "lucide-react";

function ScoreBadge({ score }: { score: number }) {
  if (score === 180)
    return <span className="font-black text-amber-500 underline decoration-2 underline-offset-2">{score}</span>;
  if (score >= 100)
    return <span className="font-bold text-orange-500 underline underline-offset-2">{score}</span>;
  return <span>{score}</span>;
}

export default async function PlayerPracticePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const playerId = Number(id);

  const [player, practiceGames] = await Promise.all([
    db.query.players.findFirst({ where: eq(players.id, playerId) }),
    getPlayerPracticeGames(playerId),
  ]);

  if (!player) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Practice — {player.name}</h2>
        <Link href={`/practice/new?playerId=${playerId}`}>
          <Button size="sm" className="gap-1.5">
            <Plus className="h-4 w-4" /> New Session
          </Button>
        </Link>
      </div>

      {practiceGames.length === 0 ? (
        <div className="py-16 text-center space-y-3">
          <Target className="h-10 w-10 mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No practice sessions yet.</p>
          <Link href={`/practice/new?playerId=${playerId}`}>
            <Button variant="outline" size="sm" className="mt-2">Start first session</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {practiceGames.map((game) => (
            <Link key={game.id} href={`/practice/${game.id}`}>
              <Card className="hover:bg-muted/40 transition-colors cursor-pointer">
                <CardContent className="py-3 px-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold">{game.gameType}</span>
                        <span className="text-xs text-muted-foreground">Best of {game.legs}</span>
                        {game.status === "complete" ? (
                          <Badge className="bg-green-600 hover:bg-green-600 text-xs">Complete</Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-500 border-amber-400 text-xs">In progress</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">
                        {game.playerNames.join(" · ")}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-0.5">
                      {game.status === "complete" && (
                        <p className="text-sm font-semibold">{game.legsWon} leg{game.legsWon !== 1 ? "s" : ""} won</p>
                      )}
                      {game.avgScore !== null && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <TrendingUp className="h-3 w-3" />
                          avg <ScoreBadge score={game.avgScore} />
                        </p>
                      )}
                      {game.createdAt && (
                        <p className="text-xs text-muted-foreground">{format(game.createdAt, "d MMM yyyy")}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
