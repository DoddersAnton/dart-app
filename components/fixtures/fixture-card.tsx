"use client";
import { Calendar, HouseIcon, Trash } from "lucide-react";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { getGamesByFixture } from "@/server/actions/get-games-by-fixture";
import React, { useEffect, useState } from "react";
import GameForm from "./add-game";
import { deleteGame } from "@/server/actions/delete-game";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { toast } from "sonner";

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
    nickname: string | null;
  }>;
};

function useGamesByFixture(fixtureId: number) {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await getGamesByFixture(fixtureId);
      if (response.error) {
        setError(response.error);
      } else {
        const gamesData = response.success;
        setGames(Array.isArray(gamesData) ? gamesData : gamesData ? [gamesData] : []);
      }
    } catch (err) {
      setError(`Failed to fetch games. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [fixtureId]);

  return { games, loading, error, fetchGames };
}

export default function FixtureCard({ fixtureData }: { fixtureData: Fixture }) {
  const { games, loading, error, fetchGames } = useGamesByFixture(fixtureData.id);

  const handleDeleteGame = async ({ id }: { id: number }) => {
    try {
      const response = await deleteGame({ id });
      if (response?.data?.error) {
        toast.error(`Failed to delete game. ${response?.data?.error}`);
      } else {
        toast.success(`Game has been deleted`);
        fetchGames(); // Refresh after deletion
      }
    } catch (error) {
      console.error(`Failed to delete game. ${error}`);
      toast.error(`Failed to delete game. ${error}`);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          🏆{" "}
          {fixtureData.awayTeamScore > fixtureData.homeTeamScore
            ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
            : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}{" "}
          -{" "}
          {fixtureData.awayTeamScore < fixtureData.homeTeamScore
            ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
            : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}
        </CardTitle>
        <div className="flex flex-row items-center gap-6">
          <CardDescription>
            <Badge variant="secondary" className="min-w-[100px] text-left">
              Spring / Summer 25 - {fixtureData.league}
            </Badge>
          </CardDescription>
          <CardDescription>
            <Badge variant="secondary" className="min-w-[100px] text-left">
              {fixtureData.league}
            </Badge>
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <HouseIcon size={12} />
              <div>{fixtureData.matchLocation}</div>
            </div>
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              <div>{fixtureData.matchDate}</div>
            </div>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <Separator className="my-4" />
        <Card className="border-none shadow-none mb-4">
          <CardHeader>
            <CardTitle>Games</CardTitle>
            <CardDescription>List of games played in this fixture</CardDescription>
            <GameForm fixtureId={fixtureData.id} onGameAdded={fetchGames} />
          </CardHeader>
        </Card>
        <Separator className="my-4" />
        {loading ? (
          <div>Loading games...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : games.length > 0 ? (
          games.map((game) => (
            <Card key={game.id} className="mb-4">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{game.gameType}</span>
                  <Button
                    variant="ghost"
                    onClick={() => handleDeleteGame({ id: game.id })}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
               <div className="text-sm mb-2">
                 🏆{" "}
          {game.awayTeamScore > game.homeTeamScore
            ? `${fixtureData.awayTeam} (${game.awayTeamScore})`
            : `${fixtureData.homeTeam} (${game.homeTeamScore})`}{" "}
          -{" "}
          {game.awayTeamScore < game.homeTeamScore
            ? `${fixtureData.awayTeam} (${game.awayTeamScore})`
            : `${fixtureData.homeTeam} (${game.homeTeamScore})`}
                </div>
                <div className="flex flex-wrap gap-2">
                  {game.players.map((player) => (
                    <Badge
                      key={player.id}
                      variant="outline"
                      className="cursor-pointer min-w-[100px] text-left"
                    >
                      {player.name} {player.nickname ? `(${player.nickname})` : ""}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div>No games found for this fixture.</div>
        )}
      </CardContent>
    </Card>
  );
}
