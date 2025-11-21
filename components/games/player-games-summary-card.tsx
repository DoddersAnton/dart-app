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
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
import { Card, CardContent, CardTitle } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { Badge } from "../ui/badge";

interface PlayerGamesSummaryCardProps {
  handleDeleteGame: ({ id }: { id: number }) => Promise<void>;
  gameSummary: PlayerGameSummary;
}

export type PlayerGameSummary = {
  playerId: number;
  playerName: string;
  nickname: string | null;
  fixtureId: number;
  season: string;
  matchDate: string | null;
  homeTeam: string | null;
  awayTeam: string | null;
  homeTeamScore: number | null;
  awayTeamScore: number | null;
  isDilfsWin: boolean;
  games: {
    gameId: number | null;
    gameType: string | null;
    gameHomeTeamScore: number | null;
    gameAwayTeamScore: number | null;
    isDilfsWin: boolean;
    players?: {
      id: number;
      name: string;
      nickname?: string | null;
    }[];
  }[];
};

const gameTypeIcons: { [key: string]: React.ReactNode } = {
  "Team Game": <Users2Icon />,
  Doubles: <UsersIcon />,
  Singles: <UserIcon />,
  default: <TrophyIcon />,
};

export default function PlayerGamesSummaryCard({
  gameSummary,
  handleDeleteGame,
}: PlayerGamesSummaryCardProps) {
  return (
    <>
      <Card key={gameSummary.fixtureId} className="mb-4">
        <CardTitle className="flex items-center justify-between">
          <div>
            {gameSummary.season} - {gameSummary.playerName}{" "}
            {gameSummary.nickname ? `(${gameSummary.nickname})` : ""}
          </div>
          <div className="flex gap-2 flex-row">
            <div className="flex items-center gap-2" title="Home team">
              <HouseIcon size={12} />
              <div>{gameSummary.homeTeam}</div>
            </div>

            <div className="flex items-center gap-2" title="match date">
              <Calendar size={12} />
              <div>{gameSummary.matchDate}</div>
            </div>
          </div>
        </CardTitle>
        <CardContent className="mt-2">
          {gameSummary.games.map((game, idx) => (
            <Item
              variant="outline"
              key={game.gameId ?? `${gameSummary.fixtureId}-${idx}`}
              className="mb-4"
            >
              <ItemContent>
                <ItemTitle className="flex items-center justify-between">
                  <span>
                    {gameTypeIcons[game.gameType ?? ""] ||
                      gameTypeIcons.default}
                  </span>
                  <div>{game.gameType}</div>
                  <div className="flex gap-2 flex-row">
                    <div className="flex items-center gap-2" title="Home team">
                      <HouseIcon size={12} />
                      <div>{gameSummary.homeTeam}</div>
                    </div>

                    <div className="flex items-center gap-2" title="match date">
                      <Calendar size={12} />
                      <div>{gameSummary.matchDate}</div>
                    </div>
                  </div>
                </ItemTitle>
                <ItemDescription className="mt-2">
                  <div className="text-sm mb-2">
                    🏆{" "}
                    {(game.gameAwayTeamScore ?? 0) >
                    (game.gameHomeTeamScore ?? 0)
                      ? `${gameSummary.awayTeam} (${
                          game.gameAwayTeamScore ?? 0
                        })`
                      : `${gameSummary.homeTeam} (${
                          game.gameHomeTeamScore ?? 0
                        })`}{" "}
                    -{" "}
                    {(game.gameAwayTeamScore ?? 0) <
                    (game.gameHomeTeamScore ?? 0)
                      ? `${gameSummary.awayTeam} (${
                          game.gameAwayTeamScore ?? 0
                        })`
                      : `${gameSummary.homeTeam} (${
                          game.gameHomeTeamScore ?? 0
                        })`}
                  </div>
                  <div className="flex flex-wrap gap-1 mb-1 mt-1">
                    {(game.players ?? []).map((player) => (
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
                      <ChevronDown className="h-8 w-8" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                      <Link
                        href={`/games/${game.gameId}`}
                        className="flex items-center gap-2"
                      >
                        <EyeIcon className="h-4 w-4 hover:text-black" />
                        View Game
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                      <Link
                        href={`/games/edit-game?id=${game.gameId}&fixtureId=${gameSummary.fixtureId}`}
                        className="flex items-center gap-2"
                      >
                        <Pencil className="h-4 w-4 hover:text-black" />
                        Edit Game
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                      <Link
                        href={`/games/dart-tracker?id=${game.gameId}`}
                        className="flex items-center gap-2"
                      >
                        <Rocket className="h-4 w-4 hover:text-black" />
                        Open Dart Tracker
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteGame({ id: game.gameId ?? 0 })}
                      className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                    >
                      <Trash className="h-4 w-4 hover:text-black" />
                      Delete Game
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </ItemActions>
            </Item>
          ))}
        </CardContent>
      </Card>
    </>
  );
}
