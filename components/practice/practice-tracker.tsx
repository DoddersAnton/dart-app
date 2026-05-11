"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { RotateCcw, ChevronDown, Target, ArrowLeft, Trophy } from "lucide-react";
import { toast } from "sonner";
import { PracticeGameFull } from "@/server/actions/get-practice-game";
import { savePracticeThrow } from "@/server/actions/save-practice-throw";
import { deleteLastPracticeThrow } from "@/server/actions/delete-last-practice-throw";
import { completePracticeGame } from "@/server/actions/complete-practice-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

// ── Checkout hints ──────────────────────────────────────────────────────────
const CHECKOUT_HINTS: Record<number, string> = {
  170: "T20 T20 Bull", 167: "T20 T19 Bull", 164: "T20 T18 Bull", 161: "T20 T17 Bull",
  160: "T20 T20 D20", 158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18",
  155: "T20 T19 D19", 154: "T20 T18 D20", 153: "T20 T19 D18", 152: "T20 T20 D16",
  151: "T20 T17 D20", 150: "T20 T18 D18", 149: "T20 T19 D16", 148: "T20 T16 D20",
  147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T15 D20", 144: "T20 T20 D12",
  143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T20 D10",
  100: "T20 D20", 99: "T19 10 D16", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18",
  95: "T19 D19", 94: "T18 D20", 93: "T19 D18", 92: "T20 D16", 91: "T17 D20",
  90: "T18 D18", 89: "T19 D16", 88: "T20 D14", 87: "T17 D18", 86: "T18 D16",
  85: "T15 D20", 84: "T20 D12", 83: "T17 D16", 82: "Bull D16", 81: "T19 D12",
  80: "T20 D10", 79: "T19 D11", 78: "T18 D12", 77: "T19 D10", 76: "T20 D8",
  75: "T17 D12", 74: "T14 D16", 73: "T19 D8", 72: "T16 D12", 71: "T13 D16",
  70: "T18 D8", 60: "20 D20", 50: "18 D16", 40: "D20", 32: "D16", 24: "D12",
  20: "D10", 16: "D8", 10: "D5", 8: "D4", 6: "D3", 4: "D2", 2: "D1",
};

// ── Types ───────────────────────────────────────────────────────────────────
type LocalThrow = {
  id?: number;
  practicePlyrId: number;
  leg: number;
  throwNumber: number;
  score: number;
  remainingScore: number;
  dartsUsed: number;
};

type PracticePlayer = PracticeGameFull["players"][number];

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

function scoreClass(score: number) {
  if (score === 180) return "font-black text-amber-500 underline decoration-2 underline-offset-2";
  if (score >= 100) return "font-bold text-orange-500 underline underline-offset-2";
  return "";
}

// ── Initial state ───────────────────────────────────────────────────────────
function computeInitialState(
  players: PracticePlayer[],
  rounds: PracticeGameFull["rounds"],
  initialScore: number,
  maxLegs: number
) {
  const legsWon = players.map(() => 0);
  let currentLeg = 1;
  let currentLegThrows: LocalThrow[] = [];
  const allCompletedThrows: LocalThrow[] = [];

  const legNums = [...new Set(rounds.map((r) => r.leg))].sort((a, b) => a - b);

  for (const leg of legNums) {
    const legThrows = rounds
      .filter((r) => r.leg === leg)
      .sort((a, b) => a.throwNumber - b.throwNumber)
      .map((r) => ({ ...r, dartsUsed: r.dartsUsed ?? 3 }));

    const winnerThrow = legThrows.find((t) => t.remainingScore === 0);
    if (winnerThrow) {
      const idx = players.findIndex((p) => p.id === winnerThrow.practicePlyrId);
      if (idx >= 0) legsWon[idx]++;
      allCompletedThrows.push(...legThrows);
      currentLeg = leg + 1;
    } else {
      currentLeg = leg;
      currentLegThrows = legThrows;
    }
  }

  const scores = players.map((p) => {
    const playerThrows = currentLegThrows.filter((t) => t.practicePlyrId === p.id);
    return playerThrows.length > 0
      ? playerThrows[playerThrows.length - 1].remainingScore
      : initialScore;
  });

  const currentPlayerIdx = currentLegThrows.length % players.length;
  const legsToWin = Math.ceil(maxLegs / 2);
  const winnerIdx = legsWon.findIndex((l) => l >= legsToWin);

  return {
    legsWon,
    currentLeg,
    currentLegThrows,
    allCompletedThrows,
    scores,
    currentPlayerIdx,
    winnerIdx: winnerIdx >= 0 ? winnerIdx : null,
  };
}

// ── Player score card ───────────────────────────────────────────────────────
function PlayerCard({
  player,
  score,
  legsWon,
  maxLegs,
  isActive,
  isWinner,
}: {
  player: PracticePlayer;
  score: number;
  legsWon: number;
  maxLegs: number;
  isActive: boolean;
  isWinner: boolean;
}) {
  return (
    <div
      className={`relative rounded-xl border-2 p-3 text-center transition-all ${
        isWinner
          ? "border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20"
          : isActive
          ? "border-primary animate-active-border"
          : "border-border"
      }`}
    >
      {isWinner && (
        <Trophy className="absolute top-2 right-2 h-4 w-4 text-yellow-500" />
      )}
      {player.imgUrl ? (
        <Image
          src={player.imgUrl}
          alt={player.name}
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 rounded-full object-cover border mx-auto mb-1"
        />
      ) : (
        <div className="h-9 w-9 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold mx-auto mb-1">
          {getInitials(player.name)}
        </div>
      )}
      <p className="text-xs font-medium truncate mb-1">{player.name.split(" ")[0]}</p>
      <p className={`text-3xl font-extrabold tabular-nums leading-tight ${isActive ? "text-primary" : ""}`}>
        {score}
      </p>
      <div className="flex justify-center gap-1 mt-1.5">
        {Array.from({ length: maxLegs }).map((_, i) => (
          <span
            key={i}
            className={`h-2 w-2 rounded-full ${i < legsWon ? "bg-primary" : "bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────────────
export default function PracticeTracker({ gameData }: { gameData: PracticeGameFull }) {
  const initialScore = gameData.gameType === "701" ? 701 : gameData.gameType === "301" ? 301 : 501;
  const init = computeInitialState(gameData.players, gameData.rounds, initialScore, gameData.legs);

  const [scores, setScores] = useState(init.scores);
  const [legsWon, setLegsWon] = useState(init.legsWon);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(init.currentPlayerIdx);
  const [currentLeg, setCurrentLeg] = useState(init.currentLeg);
  const [currentLegThrows, setCurrentLegThrows] = useState<LocalThrow[]>(init.currentLegThrows);
  const [allCompletedThrows, setAllCompletedThrows] = useState<LocalThrow[]>(init.allCompletedThrows);
  const [winner, setWinner] = useState<number | null>(init.winnerIdx);

  const [inputValue, setInputValue] = useState("");
  const [selectedDarts, setSelectedDarts] = useState<1 | 2 | 3>(3);
  const [lowScoreWarning, setLowScoreWarning] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(true);
  const [saving, setSaving] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (winner === null) inputRef.current?.focus();
  }, [currentPlayerIdx, currentLeg, winner]);

  const players = gameData.players;
  const legsToWin = Math.ceil(gameData.legs / 2);
  const currentPlayer = players[currentPlayerIdx];

  const score = parseInt(inputValue);
  const remaining = scores[currentPlayerIdx];
  const preview = !isNaN(score) && score >= 0 ? remaining - score : null;
  const isBust = preview !== null && (preview < 0 || preview === 1);
  const isCheckout = preview === 0;
  const hint = remaining <= 170 && CHECKOUT_HINTS[remaining] ? CHECKOUT_HINTS[remaining] : null;

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (saving || winner !== null) return;

    const s = parseInt(inputValue);
    if (isNaN(s) || s < 0 || s > 180) {
      toast.error("Enter a valid score (0–180)");
      return;
    }

    const rem = scores[currentPlayerIdx];
    const newRem = rem - s;

    if (newRem < 0 || newRem === 1) {
      toast.error("Bust!");
      setInputValue("");
      return;
    }

    setLowScoreWarning(null);
    if (s <= 20 && rem > 170) {
      setLowScoreWarning(`Low score: ${s}`);
    }

    setSaving(true);
    const throwNumber = currentLegThrows.length + 1;
    const dartsUsed = isCheckout ? selectedDarts : 3;

    try {
      const saved = await savePracticeThrow({
        practiceGameId: gameData.id,
        practicePlyrId: currentPlayer.id,
        leg: currentLeg,
        throwNumber,
        score: s,
        remainingScore: newRem,
        dartsUsed,
      });

      const newThrow: LocalThrow = {
        id: saved.id,
        practicePlyrId: currentPlayer.id,
        leg: currentLeg,
        throwNumber,
        score: s,
        remainingScore: newRem,
        dartsUsed,
      };

      const updatedLegThrows = [...currentLegThrows, newThrow];

      if (newRem === 0) {
        // Leg won
        setSelectedDarts(3);
        const newLegsWon = [...legsWon];
        newLegsWon[currentPlayerIdx]++;
        setLegsWon(newLegsWon);
        setAllCompletedThrows((prev) => [...prev, ...updatedLegThrows]);

        if (newLegsWon[currentPlayerIdx] >= legsToWin) {
          // Game over
          setWinner(currentPlayerIdx);
          await completePracticeGame(
            gameData.id,
            players.map((p, i) => ({ practicePlyrId: p.id, legs: newLegsWon[i] }))
          );
          toast.success(`${currentPlayer.name} wins!`);
        } else {
          toast.success(`${currentPlayer.name} wins leg ${currentLeg}!`);
          setCurrentLeg((l) => l + 1);
          setCurrentLegThrows([]);
          setScores(players.map(() => initialScore));
          setCurrentPlayerIdx(0);
        }
      } else {
        const newScores = [...scores];
        newScores[currentPlayerIdx] = newRem;
        setScores(newScores);
        setCurrentLegThrows(updatedLegThrows);
        setCurrentPlayerIdx((prev) => (prev + 1) % players.length);
      }

      setInputValue("");
    } catch {
      toast.error("Failed to save throw");
    } finally {
      setSaving(false);
    }
  };

  const handleUndo = async () => {
    if (currentLegThrows.length === 0 || saving) return;
    setSaving(true);
    try {
      await deleteLastPracticeThrow(gameData.id, currentLeg);
      const newThrows = currentLegThrows.slice(0, -1);
      setCurrentLegThrows(newThrows);
      const newScores = players.map((p) => {
        const pt = newThrows.filter((t) => t.practicePlyrId === p.id);
        return pt.length > 0 ? pt[pt.length - 1].remainingScore : initialScore;
      });
      setScores(newScores);
      setCurrentPlayerIdx(newThrows.length % players.length);
      setLowScoreWarning(null);
      setInputValue("");
    } catch {
      toast.error("Failed to undo");
    } finally {
      setSaving(false);
    }
  };

  // Group history by leg for display
  const historyLegs = (() => {
    const legMap = new Map<number, LocalThrow[]>();
    for (const t of [...allCompletedThrows, ...currentLegThrows]) {
      if (!legMap.has(t.leg)) legMap.set(t.leg, []);
      legMap.get(t.leg)!.push(t);
    }
    return Array.from(legMap.entries()).sort(([a], [b]) => b - a);
  })();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="javascript:history.back()">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <p className="text-xs text-muted-foreground">Practice · {gameData.gameType} · Best of {gameData.legs}</p>
            {gameData.createdAt && (
              <p className="text-xs text-muted-foreground">{format(gameData.createdAt, "d MMM yyyy")}</p>
            )}
          </div>
        </div>
        {winner === null && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleUndo}
            disabled={currentLegThrows.length === 0 || saving}
            title="Undo last throw"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Score cards */}
      <div className={`grid gap-3 ${players.length <= 2 ? "grid-cols-2" : "grid-cols-3"}`}>
        {players.map((p, i) => (
          <PlayerCard
            key={p.id}
            player={p}
            score={scores[i]}
            legsWon={legsWon[i]}
            maxLegs={gameData.legs}
            isActive={!winner && i === currentPlayerIdx}
            isWinner={winner === i}
          />
        ))}
      </div>

      {/* Winner banner */}
      {winner !== null && (
        <Card className="border-yellow-400 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="py-4 text-center space-y-3">
            <Trophy className="h-8 w-8 mx-auto text-yellow-500" />
            <p className="text-lg font-bold">{players[winner].name} wins!</p>
            <p className="text-sm text-muted-foreground">
              {legsWon[winner]}–{Math.max(...legsWon.filter((_, i) => i !== winner))}
            </p>
            <Link href={`/practice/new${players[winner]?.playerId ? `?playerId=${players[winner].playerId}` : ""}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Target className="h-4 w-4" /> Play again
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Input area */}
      {winner === null && (
        <div className="space-y-3">
          <p className="text-sm font-semibold text-center">
            {currentPlayer.name}&apos;s throw
            <span className="text-xs font-normal text-muted-foreground ml-1.5">· Leg {currentLeg}</span>
          </p>

          {hint && (
            <p className="text-xs text-center text-muted-foreground">
              Checkout: <span className="font-medium">{hint}</span>
            </p>
          )}

          {lowScoreWarning && (
            <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700 text-center dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400">
              ⚠ {lowScoreWarning}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                min={0}
                max={180}
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setLowScoreWarning(null); }}
                placeholder="Score"
                className={`text-center text-2xl font-bold h-14 ${
                  isBust ? "border-destructive text-destructive" : isCheckout ? "border-green-500" : ""
                }`}
                disabled={saving}
              />
              <Button type="submit" className="h-14 px-6 text-base" disabled={saving || !inputValue}>
                Enter
              </Button>
            </div>

            {preview !== null && !isBust && (
              <p className="text-xs text-center text-muted-foreground tabular-nums">
                Remaining: <span className="font-semibold">{preview}</span>
              </p>
            )}
            {isBust && (
              <p className="text-xs text-center text-destructive font-semibold">Bust!</p>
            )}

            {isCheckout && (
              <div className="space-y-1.5">
                <p className="text-xs text-green-600 text-center font-semibold">Checkout! 🎯</p>
                <div className="flex items-center gap-2 justify-center">
                  <p className="text-xs text-muted-foreground">Darts used:</p>
                  {([1, 2, 3] as const).map((n) => (
                    <Button
                      key={n}
                      type="button"
                      size="sm"
                      variant={selectedDarts === n ? "default" : "outline"}
                      className="h-8 w-10 font-bold text-sm"
                      onClick={() => setSelectedDarts(n)}
                    >
                      {n}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </form>
        </div>
      )}

      {/* History */}
      {historyLegs.length > 0 && (
        <div className="space-y-1">
          <button
            className="flex items-center justify-between w-full py-1.5 text-left"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span className="text-sm font-semibold">History</span>
            <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>

          {showHistory && (
            <div className="space-y-3">
              {historyLegs.map(([leg, throws]) => (
                <div key={leg}>
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Leg {leg}</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="text-muted-foreground border-b">
                        <th className="text-left pb-1 font-medium w-6">#</th>
                        <th className="text-left pb-1 font-medium">Player</th>
                        <th className="text-right pb-1 font-medium">Score</th>
                        <th className="text-right pb-1 font-medium">Rem.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {throws.map((t) => {
                        const p = players.find((pl) => pl.id === t.practicePlyrId);
                        return (
                          <tr key={t.throwNumber} className="border-b border-border/50 last:border-0">
                            <td className="py-1 text-muted-foreground">{t.throwNumber}</td>
                            <td className="py-1 font-medium">{p?.name.split(" ")[0] ?? "?"}</td>
                            <td className="py-1 text-right tabular-nums">
                              <span className={scoreClass(t.score)}>{t.score}</span>
                            </td>
                            <td className="py-1 text-right tabular-nums text-muted-foreground">
                              {t.remainingScore}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
