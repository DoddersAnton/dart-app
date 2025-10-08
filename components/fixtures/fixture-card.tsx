"use client";
import {
  Calendar,
  ChevronDown,
  EyeIcon,
  HouseIcon,
  Pencil,
  Rocket,
  Trash,
  TrophyIcon,
  UserIcon,
  Users2Icon,
  UsersIcon,
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
import { Button } from "../ui/button";
import { toast } from "sonner";
import Link from "next/link";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
import { Skeleton } from "../ui/skeleton";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "../ui/empty";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import GameFormPopup from "./add-game-popup";

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

  const gameTypeIcons: { [key: string]: React.ReactNode } = {
    "Team Game": <Users2Icon />,
    "Doubles": <UsersIcon />,
    "Singles": <UserIcon />,
    default: <TrophyIcon />,
    
  };

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
              <Item variant="outline" key={game.id} className="mb-4">
                <ItemContent>
                  <ItemTitle className="flex items-center justify-between">
                    <span>{gameTypeIcons[game.gameType] || gameTypeIcons.default}</span>
                    <span>{game.gameType}</span>
                    <div className="flex gap-2 flex-row"></div>
                  </ItemTitle>
                  <ItemDescription className="mt-2">
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
                    <div className="flex flex-wrap gap-1 mb-1 mt-1">
                      {game.players.map((player) => (
                        <Badge
                          key={player.id}
                          variant="outline"
                          className="cursor-pointer pb-2 text-left mb-2"
                        >
                          {player.name}{" "}
                          {player.nickname ? `(${player.nickname})` : ""}
                        </Badge>
                      ))}
                    </div>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={"ghost"}
                        className=" flex items-center flex-row gap-1"
                        title="Game Actions"
                      >
                        Actions <span></span>
                        <ChevronDown className="h-8 w-8"/>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                       <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                        <Link
                          href={`/games/${game.id}`}
                          className="flex items-center gap-2"
                        >
                          <EyeIcon className="h-4 w-4 hover:text-black" />
                          View Game
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                        <Link
                          href={`/games/edit-game?id=${game.id}`}
                          className="flex items-center gap-2"
                        >
                          <Pencil className="h-4 w-4 hover:text-black" />
                          Edit Game
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                        <Link
                          href={`/games/dart-tracker?id=${game.id}`}
                          className="flex items-center gap-2"
                        >
                          <Rocket className="h-4 w-4 hover:text-black" />
                          Open Dart Tracker
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDeleteGame({ id: game.id })}
                        className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                      >
                        <Trash className="h-4 w-4 hover:text-black" />
                        Delete Game
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </ItemActions>
              </Item>
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
