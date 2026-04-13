"use client";
import React, { useState, useEffect, useRef } from "react";
import { GameWithPlayers } from "@/types/game-with-players";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Flag, RotateCcw, ChevronDown, ArrowLeft, Target } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { createGameRounds } from "@/server/actions/create-game-rounds";
import { createGame } from "@/server/actions/create-game";
import { createPlayerFine } from "@/server/actions/create-player-fine";
import { getFines } from "@/server/actions/get-fines";
import { getPlayers } from "@/server/actions/get-players";
import CreateFineAlert from "./create-fine-alert";
import CreateRoundFine from "./create-round-fine";

type Round = {
  roundNumber: number;
  gameId: number;
  playerId?: number;
  player?: string;
  fineAdded: boolean;
  home?: number;
  away?: number;
};

type FineData = { id: number; title: string; description: string | null; amount: number; createdAt: string | null };
type PlayerData = { id: number; name: string; nickname: string | null; team: string | null; createdAt: Date };

const CHECKOUT_HINTS: Record<number, string> = {
  170: "T20 T20 Bull", 167: "T20 T19 Bull", 164: "T20 T18 Bull", 161: "T20 T17 Bull",
  160: "T20 T20 D20", 158: "T20 T20 D19", 157: "T20 T19 D20", 156: "T20 T20 D18",
  155: "T20 T19 D19", 154: "T20 T18 D20", 153: "T20 T19 D18", 152: "T20 T20 D16",
  151: "T20 T17 D20", 150: "T20 T18 D18", 149: "T20 T19 D16", 148: "T20 T16 D20",
  147: "T20 T17 D18", 146: "T20 T18 D16", 145: "T20 T15 D20", 144: "T20 T20 D12",
  143: "T20 T17 D16", 142: "T20 T14 D20", 141: "T20 T19 D12", 140: "T20 T20 D10",
  139: "T20 T13 D20", 138: "T20 T18 D12", 137: "T20 T15 D16", 136: "T20 T20 D8",
  135: "T20 T17 D12", 134: "T20 T14 D16", 133: "T20 T19 D8", 132: "T20 T16 D12",
  131: "T20 T13 D16", 130: "T20 T18 D8", 129: "T19 T16 D12", 128: "T18 T14 D16",
  127: "T20 T17 D8", 126: "T19 T19 D6", 125: "Bull T15 D20", 124: "T20 T16 D8",
  123: "T19 T16 D9", 122: "T18 T20 D4", 121: "T20 T11 D14", 120: "T20 20 D20",
  119: "T19 T12 D13", 118: "T20 18 D20", 117: "T20 17 D20", 116: "T20 16 D20",
  115: "T20 15 D20", 114: "T20 14 D20", 113: "T20 13 D20", 112: "T20 12 D20",
  111: "T20 11 D20", 110: "T20 10 D20", 109: "T20 9 D20", 108: "T20 16 D16",
  107: "T19 18 D16", 106: "T20 10 D18", 105: "T20 13 D16", 104: "T18 18 D16",
  103: "T19 10 D18", 102: "T20 10 D16", 101: "T17 10 D20", 100: "T20 D20",
  99: "T19 10 D16", 98: "T20 D19", 97: "T19 D20", 96: "T20 D18", 95: "T19 D19",
  94: "T18 D20", 93: "T19 D18", 92: "T20 D16", 91: "T17 D20", 90: "T18 D18",
  89: "T19 D16", 88: "T20 D14", 87: "T17 D18", 86: "T18 D16", 85: "T15 D20",
  84: "T20 D12", 83: "T17 D16", 82: "Bull D16", 81: "T19 D12", 80: "T20 D10",
  79: "T19 D11", 78: "T18 D12", 77: "T19 D10", 76: "T20 D8", 75: "T17 D12",
  74: "T14 D16", 73: "T19 D8", 72: "T16 D12", 71: "T13 D16", 70: "T18 D8",
  69: "T19 D6", 68: "T20 D4", 67: "T17 D8", 66: "T10 D18", 65: "T19 D4",
  64: "T16 D8", 63: "T13 D12", 62: "T10 D16", 61: "T15 D8", 60: "20 D20",
  59: "19 D20", 58: "18 D20", 57: "17 D20", 56: "16 D20", 55: "15 D20",
  54: "14 D20", 53: "13 D20", 52: "12 D20", 51: "19 D16", 50: "18 D16",
  49: "17 D16", 48: "16 D16", 47: "15 D16", 46: "14 D16", 45: "13 D16",
  44: "12 D16", 43: "11 D16", 42: "10 D16", 41: "9 D16", 40: "D20",
  39: "7 D16", 38: "D19", 37: "5 D16", 36: "D18", 35: "3 D16", 34: "D17",
  33: "1 D16", 32: "D16", 31: "15 D8", 30: "D15", 29: "13 D8", 28: "D14",
  27: "11 D8", 26: "D13", 25: "9 D8", 24: "D12", 23: "7 D8", 22: "D11",
  21: "5 D8", 20: "D10", 19: "3 D8", 18: "D9", 17: "1 D8", 16: "D8",
  15: "7 D4", 14: "D7", 13: "5 D4", 12: "D6", 11: "3 D4", 10: "D5",
  9: "1 D4", 8: "D4", 7: "3 D2", 6: "D3", 5: "1 D2", 4: "D2",
  3: "1 D1", 2: "D1",
};

export default function DartTracker({ gameData }: { gameData: GameWithPlayers }) {
  const INITIAL_SCORE = gameData.gameType === "Team Game" ? 801 : gameData.gameType === "Doubles" ? 601 : 501;

  const [homeScore, setHomeScore] = useState(INITIAL_SCORE);
  const [awayScore, setAwayScore] = useState(INITIAL_SCORE);
  const [homeLegs, setHomeLegs] = useState(0);
  const [awayLegs, setAwayLegs] = useState(0);
  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentRound, setCurrentRound] = useState<Partial<Round>>({});
  const [currentLeg, setCurrentLeg] = useState(1);
  const [winner, setWinner] = useState<"home" | "away" | null>(null);
  const [showFineDialog, setShowFineDialog] = useState(false);
  const [showRoundFineDialog, setShowRoundFineDialog] = useState(false);
  const [pendingFinePlayer, setPendingFinePlayer] = useState<string | null>(null);
  const [pendingFineId, setPendingFineId] = useState<string | null>(null);
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [finesData, setFinesData] = useState<FineData[]>([]);
  const [playersListData, setPlayersListData] = useState<PlayerData[]>([]);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [fines, players] = await Promise.all([getFines(), getPlayers()]);
      if (Array.isArray(fines)) setFinesData(fines);
      if (Array.isArray(players)) {
        setPlayersListData(players.map((p) => ({ ...p, createdAt: p.createdAt ? new Date(p.createdAt) : new Date() })));
      }
    }
    fetchData();
  }, []);

  // Scroll history to bottom when new round added
  useEffect(() => {
    if (historyRef.current) {
      historyRef.current.scrollTop = historyRef.current.scrollHeight;
    }
  }, [rounds]);

  const { execute: executeFine, status: fineStatus } = useAction(createPlayerFine, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      else if (data.data?.success) toast.success("Fine added");
    },
  });

  const handleSubmitRound = () => {
    if (winner) return;

    const home = currentRound.home;
    const away = currentRound.away;

    if (!currentRound.player) {
      toast.error("Select a player for this round");
      return;
    }
    if (typeof home !== "number" && typeof away !== "number") {
      toast.error("Enter at least one score");
      return;
    }
    if ((typeof home === "number" && home > 180) || (typeof away === "number" && away > 180)) {
      toast.error("Score cannot exceed 180");
      return;
    }
    if ((typeof home === "number" && home < 0) || (typeof away === "number" && away < 0)) {
      toast.error("Score cannot be negative");
      return;
    }

    let newHome = homeScore;
    let newAway = awayScore;

    if (typeof home === "number") {
      // Low score fine check
      if (home <= 20) {
        const lowFine = finesData.find((f) => f.title === "20 or under");
        if (lowFine) {
          setPendingFinePlayer(currentRound.player ?? null);
          setPendingFineId(lowFine.title);
          setPendingReason("Scored 20 or under");
          setShowFineDialog(true);
        }
      }
      const updated = newHome - home;
      newHome = updated >= 0 ? updated : newHome; // bust = no change
    }

    if (typeof away === "number") {
      if (away <= 20) {
        const lowFine = finesData.find((f) => f.title === "20 or under");
        if (lowFine) {
          setPendingFinePlayer(currentRound.player ?? null);
          setPendingFineId(lowFine.title);
          setPendingReason("Scored 20 or under");
          setShowFineDialog(true);
        }
      }
      const updated = newAway - away;
      newAway = updated >= 0 ? updated : newAway;
    }

    const newRound: Round = {
      roundNumber: rounds.length + 1,
      gameId: gameData.id,
      player: currentRound.player,
      playerId: gameData.players.find((p) => p.name === currentRound.player)?.id,
      home,
      away,
      fineAdded: false,
    };

    setRounds((prev) => [...prev, newRound]);
    setHomeScore(newHome);
    setAwayScore(newAway);
    setCurrentRound({});

    if (newHome === 0) { setWinner("home"); setHomeLegs((l) => l + 1); }
    else if (newAway === 0) { setWinner("away"); setAwayLegs((l) => l + 1); }
  };

  const handleUndo = () => {
    if (rounds.length === 0) return;
    const last = rounds[rounds.length - 1];
    setHomeScore((s) => s + (last.home ?? 0));
    setAwayScore((s) => s + (last.away ?? 0));
    setRounds((prev) => prev.slice(0, -1));
    setWinner(null);
  };

  const submitFine = () => {
    if (!pendingFinePlayer || !pendingFineId) return;
    const player = gameData.players.find((p) => p.name === pendingFinePlayer);
    const fine = finesData.find((f) => f.title === pendingFineId);
    if (!player || !fine) { toast.error("Player or fine not found"); return; }
    executeFine({ playerId: player.id, fineId: fine.id, matchDate: new Date(), quantity: 1, notes: `Fine during ${gameData.gameType}` });
  };

  const saveAndAdvance = async (finish: boolean) => {
    setSaving(true);
    try {
      await createGameRounds({
        gameId: gameData.id,
        gameRounds: rounds.map((r, idx) => ({
          roundNo: idx + 1,
          roundLeg: currentLeg,
          homeTeamScore: r.home ?? 0,
          awayTeamScore: r.away ?? 0,
          playerId: r.playerId,
        })),
      });

      const playerIds = gameData.players.map((p) => p.id);
      if (playerIds.length > 0) {
        const newHomeLegs = winner === "home" ? homeLegs : homeLegs;
        const newAwayLegs = winner === "away" ? awayLegs : awayLegs;
        await createGame({
          id: gameData.id,
          fixtureId: gameData.fixtureId,
          homeTeamScore: newHomeLegs,
          awayTeamScore: newAwayLegs,
          gameType: gameData.gameType,
          playerList: playerIds as [number, ...number[]],
        });
      }

      if (finish) {
        toast.success("Game saved!");
        window.location.href = `/fixtures/${gameData.fixtureId}`;
      } else {
        setCurrentLeg((l) => l + 1);
        setHomeScore(INITIAL_SCORE);
        setAwayScore(INITIAL_SCORE);
        setRounds([]);
        setCurrentRound({});
        setWinner(null);
        setShowHistory(false);
        toast.success("Leg saved — starting next leg");
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const homeCheckout = CHECKOUT_HINTS[homeScore];
  const awayCheckout = CHECKOUT_HINTS[awayScore];

  return (
    <div className="space-y-4">
      <CreateFineAlert
        PopupProps={{ showFineDialog, setShowFineDialog, submitFine, player: pendingFinePlayer, fine: pendingFineId, reason: pendingReason }}
      />
      {pendingFinePlayer && (
        <CreateRoundFine
          PopupProps={{
            showRoundFineDialog,
            setShowRoundFineDialog,
            playerId: gameData.players.find((p) => p.name === pendingFinePlayer)?.id,
            fineId: null,
            fineData: finesData,
            defaultPlayers: playersListData,
            roundLeg: currentLeg,
            roundNo: (rounds.length + 1),
          }}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <Link href={`/fixtures/${gameData.fixtureId}`}>
          <Button variant="ghost" size="sm" className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Exit
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{gameData.gameType}</span>
          <Badge variant="outline" className="text-xs">Leg {currentLeg}</Badge>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2">
        {/* Home */}
        <div className={`rounded-xl p-4 text-center space-y-1 ${winner === "home" ? "bg-green-500/20 border-2 border-green-500" : "bg-muted/60"}`}>
          <p className="text-xs font-medium text-muted-foreground truncate">{gameData.homeTeam}</p>
          <p className="text-5xl font-black tabular-nums leading-none">{homeScore}</p>
          {homeCheckout && homeScore <= 170 && (
            <p className="text-[10px] text-amber-500 font-medium leading-tight">{homeCheckout}</p>
          )}
        </div>

        {/* Legs */}
        <div className="flex flex-col items-center justify-center gap-1">
          <p className="text-xs text-muted-foreground">Legs</p>
          <p className="text-3xl font-bold tabular-nums">{homeLegs}<span className="text-muted-foreground mx-1 font-light">–</span>{awayLegs}</p>
          <p className="text-[10px] text-muted-foreground">of {INITIAL_SCORE}</p>
        </div>

        {/* Away */}
        <div className={`rounded-xl p-4 text-center space-y-1 ${winner === "away" ? "bg-green-500/20 border-2 border-green-500" : "bg-muted/60"}`}>
          <p className="text-xs font-medium text-muted-foreground truncate">{gameData.awayTeam}</p>
          <p className="text-5xl font-black tabular-nums leading-none">{awayScore}</p>
          {awayCheckout && awayScore <= 170 && (
            <p className="text-[10px] text-amber-500 font-medium leading-tight">{awayCheckout}</p>
          )}
        </div>
      </div>

      {/* Players */}
      <div className="flex flex-wrap gap-1.5 justify-center">
        {gameData.players.map((p) => (
          <Badge key={p.id} variant="secondary" className="text-xs">
            {p.nickname ?? p.name.split(" ")[0]}
          </Badge>
        ))}
      </div>

      {/* Winner banner */}
      {winner && (
        <div className="rounded-xl bg-green-500/10 border border-green-500 p-4 text-center space-y-3">
          <p className="text-lg font-bold text-green-600">
            🎯 {winner === "home" ? gameData.homeTeam : gameData.awayTeam} wins leg {currentLeg}!
          </p>
          <div className="flex gap-2 justify-center">
            <Button variant="outline" disabled={saving} onClick={() => saveAndAdvance(false)}>
              {saving ? "Saving..." : "Start next leg"}
            </Button>
            <Button disabled={saving} onClick={() => saveAndAdvance(true)}>
              {saving ? "Saving..." : "Finish game"}
            </Button>
          </div>
        </div>
      )}

      {/* Round history (collapsible) */}
      {rounds.length > 0 && (
        <div className="rounded-lg border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium bg-muted/40 hover:bg-muted/60"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span>Round history ({rounds.length})</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (
            <div ref={historyRef} className="max-h-48 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-muted/30 sticky top-0">
                  <tr>
                    <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">R</th>
                    <th className="py-1.5 px-2 text-left font-medium text-muted-foreground">Player</th>
                    <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">Home</th>
                    <th className="py-1.5 px-2 text-center font-medium text-muted-foreground">Away</th>
                    <th className="py-1.5 px-2 text-center font-medium text-muted-foreground"></th>
                  </tr>
                </thead>
                <tbody>
                  {rounds.map((r, idx) => (
                    <tr key={idx} className="border-t border-border/50">
                      <td className="py-1.5 px-2 text-muted-foreground">{idx + 1}</td>
                      <td className="py-1.5 px-2 font-medium truncate max-w-[80px]">{r.player?.split(" ")[0] ?? "–"}</td>
                      <td className="py-1.5 px-2 text-center tabular-nums">{r.home ?? "–"}</td>
                      <td className="py-1.5 px-2 text-center tabular-nums">{r.away ?? "–"}</td>
                      <td className="py-1.5 px-2 text-center">
                        {r.fineAdded && <Flag className="h-3 w-3 text-red-500 inline" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Input area */}
      {!winner && (
        <div className="rounded-xl border p-4 space-y-3">
          <p className="text-xs font-medium text-muted-foreground">Round {rounds.length + 1}</p>

          {/* Player selector */}
          <Select
            value={currentRound.player ?? ""}
            onValueChange={(val) => setCurrentRound((prev) => ({ ...prev, player: val }))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select player" />
            </SelectTrigger>
            <SelectContent>
              {gameData.players.map((p) => (
                <SelectItem key={p.id} value={p.name}>
                  {p.name}{p.nickname ? ` (${p.nickname})` : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Score inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">{gameData.homeTeam}</p>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={180}
                placeholder="0"
                className="text-center text-lg font-bold h-12"
                value={currentRound.home ?? ""}
                onChange={(e) => setCurrentRound((prev) => ({ ...prev, home: e.target.value === "" ? undefined : Number(e.target.value) }))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitRound()}
              />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground text-center">{gameData.awayTeam}</p>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={180}
                placeholder="0"
                className="text-center text-lg font-bold h-12"
                value={currentRound.away ?? ""}
                onChange={(e) => setCurrentRound((prev) => ({ ...prev, away: e.target.value === "" ? undefined : Number(e.target.value) }))}
                onKeyDown={(e) => e.key === "Enter" && handleSubmitRound()}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSubmitRound}>
              Submit round
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={rounds.length === 0}
              title="Undo last round"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setPendingFinePlayer(currentRound.player ?? null); setShowRoundFineDialog(true); }}
              title="Add fine"
            >
              <Flag className="h-4 w-4" />
            </Button>
          </div>
          {fineStatus === "executing" && <p className="text-xs text-center text-muted-foreground">Adding fine...</p>}
        </div>
      )}

      {/* Finish without winner */}
      {!winner && rounds.length > 0 && (
        <Button variant="ghost" size="sm" className="w-full text-muted-foreground" disabled={saving} onClick={() => saveAndAdvance(true)}>
          {saving ? "Saving..." : "Save & exit without finishing leg"}
        </Button>
      )}
    </div>
  );
}
