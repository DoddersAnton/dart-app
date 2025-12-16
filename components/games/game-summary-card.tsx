import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "../ui/item";
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

const gameTypeIcons: { [key: string]: React.ReactNode } = {
  "Team Game": <Users2Icon />,
  Doubles: <UsersIcon />,
  Singles: <UserIcon />,
  default: <TrophyIcon />,
};

interface GamesSummaryCardProps {
  handleDeleteGame: ({ id }: { id: number }) => Promise<void>;
  gameSummary: GameSummary;
}

export type GameSummary = {
  matchDate: string;
  homeTeam: string;
  awayTeam: string;
  id: number;
  fixtureId: number;
  homeTeamScore: number;
  awayTeamScore: number;
  gameType: string;
  isDilfWin: boolean;
  players: Array<{
    id: number;
    name: string;
    nickname: string | null;
  }>;
};

export default function GamesSummaryCard({
  gameSummary,
  handleDeleteGame,
}: GamesSummaryCardProps) {
  return (
    <>
      <Item variant="outline" key={gameSummary.id} className="mb-4">
        <ItemContent>
          <ItemTitle className="flex items-center justify-between">
            <span>
              {gameTypeIcons[gameSummary.gameType] || gameTypeIcons.default}
            </span>
            <div>{gameSummary.gameType} </div>
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
              {gameSummary.awayTeamScore > gameSummary.homeTeamScore
                ? `${gameSummary.awayTeam} (${gameSummary.awayTeamScore})`
                : `${gameSummary.homeTeam} (${gameSummary.homeTeamScore})`}{" "}
              -{" "}
              {gameSummary.awayTeamScore < gameSummary.homeTeamScore
                ? `${gameSummary.awayTeam} (${gameSummary.awayTeamScore})`
                : `${gameSummary.homeTeam} (${gameSummary.homeTeamScore})`}
            </div>
            <div className="flex flex-wrap gap-1 mb-1 mt-1">
              {gameSummary.players.map((player) => (
                <Badge
                  key={player.id}
                  variant="outline"
                  className="cursor-pointer pb-2 text-left mb-2"
                >
                  {player.name} {player.nickname ? `(${player.nickname})` : ""}
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
                  href={`/games/${gameSummary.id}`}
                  className="flex items-center gap-2"
                >
                  <EyeIcon className="h-4 w-4 hover:text-black" />
                  View Game
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                <Link
                  href={`/games/edit-game?id=${gameSummary.id}&fixtureId=${gameSummary.fixtureId}`}
                  className="flex items-center gap-2"
                >
                  <Pencil className="h-4 w-4 hover:text-black" />
                  Edit Game
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                <Link
                  href={`/games/dart-tracker?id=${gameSummary.id}`}
                  className="flex items-center gap-2"
                >
                  <Rocket className="h-4 w-4 hover:text-black" />
                  Open Dart Tracker
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteGame({ id: gameSummary.id })}
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
  );
}
