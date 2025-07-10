"use client";
import { Calendar, HouseIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { getGamesByFixture } from "@/server/actions/get-games-by-fixture";
import React, { useEffect, useState } from "react";



type Fixture = {
  id: number;
  matchLocation: string;
  matchDate: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
   awayTeamScore: number;
  createdAt: string | null;
  league: string;
    season: string;
};

type Game = {
  id: number;
  fixtureId: number;
  homeTeamScore: number;
  awayTeamScore: number;
  gameType: string;
  players: Array<{
    id: number;
    name: string;
    nickname: string | null;}>;
}

function useGamesByFixture(fixtureId: number) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  
  useEffect(() => {
    async function fetchGames() {
      try {
        const response = await getGamesByFixture(fixtureId);
        if (response.error) {
          setError(response.error);
        } else {
          const gamesData = response.success;
          setGames(Array.isArray(gamesData) ? gamesData : gamesData ? [gamesData] : []);
        }
      } catch (err) {
        setError(`Failed to fetch games. ${err} `);
      } finally {
        setLoading(false);
      }
    }
    fetchGames();
  }, [fixtureId]);

  return { games, loading, error};
}



export default function FixtureCard({ fixtureData }: { fixtureData: Fixture }) {

  const {
    games,
    loading,
    error,
  } = useGamesByFixture(fixtureData.id);
 
    return ( 
        <Card>
      <CardHeader>
        <CardTitle>
            <span title="Winner" role="img" aria-label="Trophy">🏆</span>{" "}
            {fixtureData.awayTeamScore > fixtureData.homeTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`} - 
                {" "}
                  {fixtureData.awayTeamScore < fixtureData.homeTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}
        </CardTitle>
        <div className="flex flex-row items-center gap-6">
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Badge variant="secondary" className="cursor-pointer min-w-[100px] text-left" >
                    Spring / Summer 25 - {fixtureData.league}
                </Badge>
              </div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Badge variant="secondary" className="cursor-pointer min-w-[100px] text-left" >
                    {fixtureData.league}
                </Badge>
              </div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
              <div className="flex items-center gap-2">
              <div>
                <HouseIcon size={12} />
              </div>
              <div>{fixtureData.matchLocation}</div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Calendar size={12} />
              </div>
              <div>{fixtureData.matchDate}</div>
            </div>{" "}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
            <div>
                {loading ? (
                    <div>Loading games...</div>
                ) : error ? (
                    <div className="text-red-500">{error}</div>  
                ) : games.length > 0 ? (
                    games.map((game) => (
                        <div key={game.id} className="mb-4">
                            <h3 className="font-semibold">Game Type: {game.gameType}</h3>
                            <div className="flex flex-wrap gap-2">
                                {game.players.map((player) => (
                                    <Badge key={player.id} variant="outline" className="cursor-pointer min-w-[100px] text-left">
                                        {player.name} {player.nickname ? `(${player.nickname})` : ""}
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    ))
                ) : (
                    <div>No games found for this fixture.</div>
                )}
            </div>
            </CardContent>
        </Card>
    );
  }
