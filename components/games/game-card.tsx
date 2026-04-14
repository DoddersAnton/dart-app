"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Flag,
  Pencil,
  Rocket,
  UserIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";

import { GameWithPlayers, GameRound } from "@/types/game-with-players";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const INITIAL_SCORE: Record<string, number> = {
  "Team Game": 801,
  Doubles: 601,
  Singles: 501,
};

const gameTypeIcon: Record<string, React.ReactNode> = {
  "Team Game": <Users2Icon className="h-4 w-4" />,
  Doubles: <UsersIcon className="h-4 w-4" />,
  Singles: <UserIcon className="h-4 w-4" />,
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function LegTable({ leg, rounds, homeTeam, awayTeam, gameType }: {
  leg: number;
  rounds: GameRound[];
  homeTeam: string;
  awayTeam: string;
  gameType: string;
}) {
  const startScore = INITIAL_SCORE[gameType] ?? 501;
  let homeRemaining = startScore;
  let awayRemaining = startScore;

  const rows = rounds.map((r) => {
    homeRemaining = Math.max(0, homeRemaining - r.homeScore);
    awayRemaining = Math.max(0, awayRemaining - r.awayScore);
    return { ...r, homeRemaining, awayRemaining };
  });

  const homeWon = homeRemaining === 0;
  const awayWon = awayRemaining === 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Leg {leg}</p>
        {(homeWon || awayWon) && (
          <Badge className={homeWon ? "bg-green-600 hover:bg-green-700 text-xs" : "bg-destructive text-xs"}>
            {homeWon ? `${homeTeam} wins` : `${awayTeam} wins`}
          </Badge>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">R</th>
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">Player</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">{homeTeam}</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Left</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">{awayTeam}</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Left</th>
              <th className="py-2 px-1 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className={`border-t border-border/50 ${idx % 2 === 0 ? "" : "bg-muted/20"}`}>
                <td className="py-1.5 px-3 text-muted-foreground tabular-nums">{r.roundNumber}</td>
                <td className="py-1.5 px-3 font-medium max-w-[80px] truncate">{r.playerName.split(" ")[0]}</td>
                <td className="py-1.5 px-3 text-center tabular-nums font-medium">{r.homeScore}</td>
                <td className={`py-1.5 px-3 text-center tabular-nums text-xs ${r.homeRemaining <= 170 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                  {r.homeRemaining}
                </td>
                <td className="py-1.5 px-3 text-center tabular-nums font-medium">{r.awayScore}</td>
                <td className={`py-1.5 px-3 text-center tabular-nums text-xs ${r.awayRemaining <= 170 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                  {r.awayRemaining}
                </td>
                <td className="py-1.5 px-1 text-center">
                  {r.fineAdded && <Flag className="h-3 w-3 text-red-500 inline" />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function GameCard({ gameData }: { gameData: GameWithPlayers }) {
  const legs = [...new Set(gameData.rounds.map((r) => r.leg))].sort((a, b) => a - b);
  const hasRounds = gameData.rounds.length > 0;

  const homeWon = gameData.homeTeamScore > gameData.awayTeamScore;
  const awayWon = gameData.awayTeamScore > gameData.homeTeamScore;
  const isDraw = !homeWon && !awayWon && gameData.homeTeamScore === gameData.awayTeamScore;

  const resultBadge = gameData.isAppTeamWin
    ? <Badge className="bg-green-600 hover:bg-green-700">Win</Badge>
    : isDraw
    ? <Badge variant="secondary">Draw</Badge>
    : <Badge variant="destructive">Loss</Badge>;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link href={`/fixtures/${gameData.fixtureId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back to fixture
          </Button>
        </Link>
        <div className="flex gap-2">
          <Link href={`/games/dart-tracker?id=${gameData.id}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Rocket className="h-3.5 w-3.5" /> Tracker
            </Button>
          </Link>
          <Link href={`/games/edit-game?id=${gameData.id}&fixtureId=${gameData.fixtureId}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
        </div>
      </div>

      {/* Match details card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              {(gameData.league || gameData.season) && (
                <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                  {[gameData.season, gameData.league].filter(Boolean).join(" · ")}
                </p>
              )}
              <CardTitle className="text-xl">{gameData.homeTeam} vs {gameData.awayTeam}</CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {resultBadge}
              <span className="text-muted-foreground">
                {gameTypeIcon[gameData.gameType] ?? <Users2Icon className="h-4 w-4" />}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Match date */}
          {gameData.matchDate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-4 w-4 shrink-0" />
              <span>{format(new Date(gameData.matchDate), "EEEE d MMMM yyyy · HH:mm")}</span>
            </div>
          )}

          {/* Score (legs) */}
          <div className="flex items-center justify-center gap-6 py-4 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{gameData.homeTeam}</p>
              <p className="text-5xl font-black tabular-nums">{gameData.homeTeamScore}</p>
              <p className="text-xs text-muted-foreground mt-1">legs</p>
            </div>
            <p className="text-3xl font-light text-muted-foreground">–</p>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{gameData.awayTeam}</p>
              <p className="text-5xl font-black tabular-nums">{gameData.awayTeamScore}</p>
              <p className="text-xs text-muted-foreground mt-1">legs</p>
            </div>
          </div>

          {/* Game type */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{gameTypeIcon[gameData.gameType]}</span>
            <span className="font-medium">{gameData.gameType}</span>
            <span className="text-muted-foreground">· {INITIAL_SCORE[gameData.gameType] ?? 501} start</span>
          </div>

          {/* Players */}
          {gameData.players.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Players</p>
                <div className="flex flex-wrap gap-2">
                  {gameData.players.map((p) => (
                    <div key={p.id} className="flex items-center gap-1.5">
                      {p.imgUrl ? (
                        <Image src={p.imgUrl} alt={p.name} width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
                      ) : (
                        <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                          {getInitials(p.name)}
                        </div>
                      )}
                      <span className="text-sm font-medium">{p.name}</span>
                      {p.nickname && <span className="text-xs text-muted-foreground">({p.nickname})</span>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Round-by-round breakdown */}
      {hasRounds ? (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Round breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {legs.map((leg, idx) => (
              <React.Fragment key={leg}>
                {idx > 0 && <Separator />}
                <LegTable
                  leg={leg}
                  rounds={gameData.rounds.filter((r) => r.leg === leg)}
                  homeTeam={gameData.homeTeam}
                  awayTeam={gameData.awayTeam}
                  gameType={gameData.gameType}
                />
              </React.Fragment>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="py-10 text-center">
            <Rocket className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No rounds recorded yet.</p>
            <Link href={`/games/dart-tracker?id=${gameData.id}`} className="inline-block mt-3">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Rocket className="h-3.5 w-3.5" /> Launch Dart Tracker
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
