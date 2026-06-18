"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarDays,
  Download,
  Flag,
  Pencil,
  Rocket,
  Trash2,
  UserIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";
import { exportToCsv } from "@/lib/export-csv";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { GameWithPlayers, GameRound, GamePlayerEntry } from "@/types/game-with-players";
import { sideThreeDartAvg, computeAverages } from "@/lib/dart-stats";
import { deleteGameRounds } from "@/server/actions/delete-game-rounds";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
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

  const legHomeAvg = sideThreeDartAvg(rounds, "home");
  const legAwayAvg = sideThreeDartAvg(rounds, "away");

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

      <div className="rounded-lg border overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="bg-muted/40">
            <tr>
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">R</th>
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{homeTeam}</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Score</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Left</th>
              <th className="py-2 px-3 text-left font-medium text-muted-foreground">{awayTeam}</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Score</th>
              <th className="py-2 px-3 text-center font-medium text-muted-foreground">Left</th>
              <th className="py-2 px-1 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, idx) => (
              <tr key={r.id} className={`border-t border-border/50 ${idx % 2 === 0 ? "" : "bg-muted/20"}`}>
                <td className="py-1.5 px-3 text-muted-foreground tabular-nums">{r.roundNumber}</td>
                <td className="py-1.5 px-3 min-w-[80px] text-muted-foreground truncate">{r.homePlayerName ?? "–"}</td>
                <td className="py-1.5 px-3 text-center tabular-nums">
                  <span className={r.homeScore === 180 ? "font-black text-amber-500 underline decoration-2 underline-offset-2" : r.homeScore >= 100 ? "font-bold text-orange-500 underline underline-offset-2" : "font-medium"}>{r.homeScore}</span>
                </td>
                <td className={`py-1.5 px-3 text-center tabular-nums text-xs ${r.homeRemaining <= 170 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                  {r.homeRemaining}
                </td>
                <td className="py-1.5 px-3 min-w-[80px] text-muted-foreground truncate">{r.awayPlayerName ?? "–"}</td>
                <td className="py-1.5 px-3 text-center tabular-nums">
                  <span className={r.awayScore === 180 ? "font-black text-amber-500 underline decoration-2 underline-offset-2" : r.awayScore >= 100 ? "font-bold text-orange-500 underline underline-offset-2" : "font-medium"}>{r.awayScore}</span>
                </td>
                <td className={`py-1.5 px-3 text-center tabular-nums text-xs ${r.awayRemaining <= 170 ? "text-amber-500 font-semibold" : "text-muted-foreground"}`}>
                  {r.awayRemaining}
                </td>
                <td className="py-1.5 px-1 text-center">
                  {r.fineAdded && <Flag className="h-3 w-3 text-red-500 inline" />}
                </td>
              </tr>
            ))}
          </tbody>
          {(legHomeAvg !== null || legAwayAvg !== null) && (
            <tfoot className="border-t border-border bg-muted/30">
              <tr>
                <td colSpan={2} className="py-1.5 px-3 text-xs font-semibold text-muted-foreground">3-dart avg</td>
                <td className="py-1.5 px-3 text-center text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                  {legHomeAvg !== null ? legHomeAvg.toFixed(1) : "–"}
                </td>
                <td />
                <td />
                <td className="py-1.5 px-3 text-center text-xs font-semibold tabular-nums text-blue-600 dark:text-blue-400">
                  {legAwayAvg !== null ? legAwayAvg.toFixed(1) : "–"}
                </td>
                <td colSpan={2} />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

export default function GameCard({ gameData, maxLegsPerGame = 3 }: { gameData: GameWithPlayers; maxLegsPerGame?: number }) {
  const legs = [...new Set(gameData.rounds.map((r) => r.leg))].sort((a, b) => a - b);
  const hasRounds = gameData.rounds.length > 0;
  const { homeAvg, awayAvg, playerAverages } = computeAverages(gameData.rounds);

  const legsToWin = Math.ceil(maxLegsPerGame / 2);
  const gameComplete = gameData.homeTeamScore >= legsToWin || gameData.awayTeamScore >= legsToWin;

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { execute: execDeleteRounds, status: deleteStatus } = useAction(deleteGameRounds, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      else { toast.success("Rounds cleared"); setShowDeleteDialog(false); }
    },
    onError: () => toast.error("Failed to delete rounds"),
  });

  const homeWon = gameData.homeTeamScore > gameData.awayTeamScore;
  const awayWon = gameData.awayTeamScore > gameData.homeTeamScore;
  const isDraw = !homeWon && !awayWon && gameData.homeTeamScore === gameData.awayTeamScore;

  // Result from the active team's perspective; fall back to the legacy flag when no perspective.
  const myWon = gameData.mySide === "home" ? homeWon : gameData.mySide === "away" ? awayWon : gameData.isAppTeamWin;
  const resultBadge = isDraw
    ? <Badge variant="secondary">Draw</Badge>
    : myWon
    ? <Badge className="bg-green-600 hover:bg-green-700">Win</Badge>
    : <Badge variant="destructive">Loss</Badge>;

  const renderPlayerBadge = (p: GamePlayerEntry) => {
    const pAvg = playerAverages.find((pa) => pa.id === p.id);
    return (
      <div key={p.id} className="flex items-center gap-1.5 rounded-lg border bg-muted/30 px-2 py-1">
        {p.imgUrl ? (
          <Image src={p.imgUrl} alt={p.name} width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
            {getInitials(p.name)}
          </div>
        )}
        <div>
          <span className="text-sm font-medium">{p.name}</span>
          {p.nickname && <span className="text-xs text-muted-foreground ml-1">({p.nickname})</span>}
          {pAvg && (
            <p className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold leading-tight">
              avg {pAvg.avg.toFixed(1)}
            </p>
          )}
        </div>
      </div>
    );
  };

  const hasSplitRosters = gameData.homePlayers.length > 0 || gameData.awayPlayers.length > 0;

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
          {gameComplete ? (
            <Button variant="outline" size="sm" className="gap-1.5 opacity-50 cursor-not-allowed" disabled>
              <Rocket className="h-3.5 w-3.5" /> Game complete
            </Button>
          ) : (
            <Link href={`/games/dart-tracker?id=${gameData.id}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Rocket className="h-3.5 w-3.5" /> Tracker
              </Button>
            </Link>
          )}
          <Link href={`/games/edit-game?id=${gameData.id}&fixtureId=${gameData.fixtureId}`}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          </Link>
          {hasRounds && (
            <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={() => setShowDeleteDialog(true)}>
              <Trash2 className="h-3.5 w-3.5" /> Delete rounds
            </Button>
          )}
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
          <div className="rounded-lg bg-muted/50 overflow-hidden">
            <div className="flex items-center justify-center gap-6 py-4 px-4">
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
            {(homeAvg !== null || awayAvg !== null) && (
              <div className="flex items-center justify-center gap-6 border-t border-border/50 py-2 px-4 bg-muted/30">
                <div className="text-center min-w-[4rem]">
                  <p className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {homeAvg !== null ? homeAvg.toFixed(1) : "–"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">3-dart avg</p>
                </div>
                <p className="text-xs text-muted-foreground">avg</p>
                <div className="text-center min-w-[4rem]">
                  <p className="text-xs font-bold tabular-nums text-blue-600 dark:text-blue-400">
                    {awayAvg !== null ? awayAvg.toFixed(1) : "–"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">3-dart avg</p>
                </div>
              </div>
            )}
          </div>

          {/* Game type */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{gameTypeIcon[gameData.gameType]}</span>
            <span className="font-medium">{gameData.gameType}</span>
            <span className="text-muted-foreground">· {INITIAL_SCORE[gameData.gameType] ?? 501} start</span>
          </div>

          {/* Players + per-player averages */}
          {gameData.players.length > 0 && (
            <>
              <Separator />
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Players</p>
                {hasSplitRosters ? (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                    <div className="flex flex-wrap gap-2">
                      {gameData.homePlayers.length > 0
                        ? gameData.homePlayers.map(renderPlayerBadge)
                        : <span className="text-sm text-muted-foreground italic self-center">{gameData.homeTeam}</span>}
                    </div>
                    <span className="text-xs font-bold text-muted-foreground uppercase shrink-0">vs</span>
                    <div className="flex flex-wrap gap-2">
                      {gameData.awayPlayers.length > 0
                        ? gameData.awayPlayers.map(renderPlayerBadge)
                        : <span className="text-sm text-muted-foreground italic self-center">{gameData.awayTeam}</span>}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">{gameData.players.map(renderPlayerBadge)}</div>
                )}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Round-by-round breakdown */}
      {hasRounds ? (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Round breakdown</CardTitle>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs h-8" onClick={() => {
                const startScore = INITIAL_SCORE[gameData.gameType] ?? 501;
                const rows = legs.flatMap((leg) => {
                  let homeRem = startScore;
                  let awayRem = startScore;
                  return gameData.rounds.filter((r) => r.leg === leg).map((r) => {
                    homeRem = Math.max(0, homeRem - r.homeScore);
                    awayRem = Math.max(0, awayRem - r.awayScore);
                    return {
                      Leg: leg,
                      Round: r.roundNumber,
                      [`${gameData.homeTeam} Player`]: r.homePlayerName ?? "",
                      [`${gameData.homeTeam} Score`]: r.homeScore,
                      [`${gameData.homeTeam} Darts`]: r.homeDartsUsed ?? r.dartsUsed ?? "",
                      [`${gameData.homeTeam} Remaining`]: homeRem,
                      [`${gameData.awayTeam} Player`]: r.awayPlayerName ?? "",
                      [`${gameData.awayTeam} Score`]: r.awayScore,
                      [`${gameData.awayTeam} Darts`]: r.awayDartsUsed ?? r.dartsUsed ?? "",
                      [`${gameData.awayTeam} Remaining`]: awayRem,
                    };
                  });
                });
                exportToCsv(`game-${gameData.id}-rounds`, rows);
              }}>
                <Download className="h-3.5 w-3.5" /> Export CSV
              </Button>
            </div>
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
            {gameComplete ? (
              <Button variant="outline" size="sm" className="gap-1.5 mt-3 opacity-50 cursor-not-allowed" disabled>
                <Rocket className="h-3.5 w-3.5" /> Game complete
              </Button>
            ) : (
              <Link href={`/games/dart-tracker?id=${gameData.id}`} className="inline-block mt-3">
                <Button variant="outline" size="sm" className="gap-1.5">
                  <Rocket className="h-3.5 w-3.5" /> Launch Dart Tracker
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete all rounds?</DialogTitle>
            <DialogDescription>
              This will permanently remove all {gameData.rounds.length} round{gameData.rounds.length !== 1 ? "s" : ""} for this game and reset the score to 0–0. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={deleteStatus === "executing"}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={deleteStatus === "executing"}
              onClick={() => execDeleteRounds({ gameId: gameData.id })}
            >
              {deleteStatus === "executing" ? "Deleting..." : "Delete rounds"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
