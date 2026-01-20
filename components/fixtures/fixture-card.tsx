"use client";
import {
  Calendar,
  HouseIcon,
  TrophyIcon,
} from "lucide-react";
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
import GameForm from "./add-game-popup";
import { deleteGame } from "@/server/actions/delete-game";
import { Separator } from "../ui/separator";
import { toast } from "sonner";
import { Skeleton } from "../ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import GameFormPopup from "./add-game-popup";
import GamesSummaryCard, { GameSummary } from "../games/game-summary-card";

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
  isAppTeamWin: boolean;
};


function useGamesByFixture(fixtureId: number) {
  const [games, setGames] = useState<GameSummary[]>([]);
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
        setGames(
          Array.isArray(gamesData) ? gamesData : gamesData ? [gamesData] : []
        );
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
  const { games, loading, error, fetchGames } = useGamesByFixture(
    fixtureData.id
  );

 

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
    <Card className="p-1 pt-2">
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
        <div className="flex flex-col lg:flex-row items-start gap-2">
          <CardDescription>
            <Badge variant="secondary" className="min-w-[100px] text-left">
              {fixtureData.season} - {fixtureData.league}
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
            <CardDescription>
              List of games played in this fixture
            </CardDescription>
            <GameFormPopup fixtureId={fixtureData.id} onGameAdded={fetchGames} />
          </CardHeader>
        </Card>
        <Separator className="mb-4" />
        {loading ? (
          <>
            <div className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          </>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : games.length > 0 ? (
          games.map((game) => (
            <>
            <GamesSummaryCard gameSummary={game} handleDeleteGame={handleDeleteGame} />
             
            </>
          ))
        ) : (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <TrophyIcon />
              </EmptyMedia>
              <EmptyTitle>No games yet</EmptyTitle>
              <EmptyDescription>
                You haven&apos;t created any games yet. Get started by creating
                your first game.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <GameForm fixtureId={fixtureData.id} onGameAdded={fetchGames} />
              </div>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  );
}
