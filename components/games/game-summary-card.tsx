import Image from "next/image";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  EyeIcon,
  MoreHorizontal,
  Pencil,
  Rocket,
  Trash,
  TrophyIcon,
  UserIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";

const gameTypeIcons: { [key: string]: React.ReactNode } = {
  "Team Game": <Users2Icon className="h-4 w-4" />,
  Doubles: <UsersIcon className="h-4 w-4" />,
  Singles: <UserIcon className="h-4 w-4" />,
  default: <TrophyIcon className="h-4 w-4" />,
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
    imgUrl: string | null;
  }>;
};

export default function GamesSummaryCard({
  gameSummary,
  handleDeleteGame,
}: GamesSummaryCardProps) {
  const homeWon = gameSummary.homeTeamScore > gameSummary.awayTeamScore;
  const awayWon = gameSummary.awayTeamScore > gameSummary.homeTeamScore;
  const resultBadge = gameSummary.isDilfWin ? (
    <Badge className="bg-green-600 hover:bg-green-700">Win</Badge>
  ) : homeWon || awayWon ? (
    <Badge variant="destructive">Loss</Badge>
  ) : (
    <Badge variant="secondary">Draw</Badge>
  );

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        {/* Header row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">
              {gameTypeIcons[gameSummary.gameType] || gameTypeIcons.default}
            </span>
            <span className="text-sm font-semibold">{gameSummary.gameType}</span>
          </div>
          <div className="flex items-center gap-2">
            {resultBadge}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/games/${gameSummary.id}`} className="flex items-center gap-2 cursor-pointer">
                    <EyeIcon className="h-4 w-4" /> View game
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/games/edit-game?id=${gameSummary.id}&fixtureId=${gameSummary.fixtureId}`} className="flex items-center gap-2 cursor-pointer">
                    <Pencil className="h-4 w-4" /> Edit game
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/games/dart-tracker?id=${gameSummary.id}`} className="flex items-center gap-2 cursor-pointer">
                    <Rocket className="h-4 w-4" /> Dart tracker
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteGame({ id: gameSummary.id })}
                  className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash className="h-4 w-4" /> Delete game
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Score */}
        <div className="flex items-center justify-center gap-6 py-3 rounded-lg bg-muted/50">
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{gameSummary.homeTeam}</p>
            <p className="text-3xl font-extrabold">{gameSummary.homeTeamScore}</p>
          </div>
          <p className="text-xl font-light text-muted-foreground">–</p>
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-1">{gameSummary.awayTeam}</p>
            <p className="text-3xl font-extrabold">{gameSummary.awayTeamScore}</p>
          </div>
        </div>

        {/* Players */}
        {gameSummary.players.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {gameSummary.players.map((player) => (
              <Badge key={player.id} variant="outline" className="text-xs pl-0.5 pr-2 py-0.5 flex items-center gap-1.5">
                {player.imgUrl ? (
                  <Image
                    src={player.imgUrl}
                    alt={player.name}
                    width={20}
                    height={20}
                    unoptimized
                    className="h-5 w-5 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted flex items-center justify-center text-[9px] font-semibold shrink-0">
                    {player.name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("")}
                  </div>
                )}
                {player.name}{player.nickname ? ` (${player.nickname})` : ""}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
