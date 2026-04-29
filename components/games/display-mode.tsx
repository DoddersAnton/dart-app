"use client";

import { useEffect, useRef, useState } from "react";
import { getPusherClient } from "@/lib/pusher-client";
import { GameStateBroadcast } from "@/server/actions/broadcast-game-state";
import { GameWithPlayers } from "@/types/game-with-players";
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";

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

function buildInitialState(gameData: GameWithPlayers): GameStateBroadcast {
  const INITIAL_SCORE = gameData.gameType === "Team Game" ? 801 : gameData.gameType === "Doubles" ? 601 : 501;
  const legNums = [...new Set(gameData.rounds.map((r) => r.leg))].sort((a, b) => a - b);
  let homeLegs = 0;
  let awayLegs = 0;
  let currentLeg = 1;
  let homeScore = INITIAL_SCORE;
  let awayScore = INITIAL_SCORE;
  let currentRounds: GameStateBroadcast["rounds"] = [];

  for (const leg of legNums) {
    const legRounds = gameData.rounds.filter((r) => r.leg === leg).sort((a, b) => a.roundNumber - b.roundNumber);
    let h = INITIAL_SCORE;
    let a = INITIAL_SCORE;
    let legComplete = false;

    for (const r of legRounds) {
      const newH = h - r.homeScore;
      const newA = a - r.awayScore;
      if (newH >= 0) h = newH;
      if (newA >= 0) a = newA;
      if (h === 0) { homeLegs++; legComplete = true; break; }
      if (a === 0) { awayLegs++; legComplete = true; break; }
    }

    if (!legComplete) {
      currentLeg = leg;
      homeScore = h;
      awayScore = a;
      currentRounds = legRounds.map((r) => ({
        roundNumber: r.roundNumber,
        player: r.playerName,
        home: r.homeScore,
        away: r.awayScore,
      }));
      break;
    } else {
      currentLeg = leg + 1;
    }
  }

  return {
    homeScore,
    awayScore,
    homeLegs,
    awayLegs,
    currentLeg,
    winner: null,
    rounds: currentRounds,
    homeTeam: gameData.homeTeam,
    awayTeam: gameData.awayTeam,
  };
}

export default function DisplayMode({ gameData }: { gameData: GameWithPlayers }) {
  const [state, setState] = useState<GameStateBroadcast>(() => buildInitialState(gameData));
  const [flashHome, setFlashHome] = useState(false);
  const [flashAway, setFlashAway] = useState(false);
  const [flashPending, setFlashPending] = useState(false);
  const [newRounds, setNewRounds] = useState<Set<number>>(new Set());
  const prevState = useRef(state);
  const seenRounds = useRef(new Set(state.rounds.map((r) => r.roundNumber)));
  const hadPending = useRef(!!state.pendingRound);

  useEffect(() => {
    const pusher = getPusherClient();
    const channel = pusher.subscribe(`game-${gameData.id}`);
    channel.bind("round-update", (data: GameStateBroadcast) => {
      setState(data);
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`game-${gameData.id}`);
    };
  }, [gameData.id]);

  useEffect(() => {
    const prev = prevState.current;

    if (state.homeScore !== prev.homeScore) {
      setFlashHome(false);
      requestAnimationFrame(() => setFlashHome(true));
      setTimeout(() => setFlashHome(false), 900);
    }
    if (state.awayScore !== prev.awayScore) {
      setFlashAway(false);
      requestAnimationFrame(() => setFlashAway(true));
      setTimeout(() => setFlashAway(false), 900);
    }

    if (state.pendingRound && !hadPending.current) {
      setFlashPending(false);
      requestAnimationFrame(() => setFlashPending(true));
      setTimeout(() => setFlashPending(false), 900);
    }
    hadPending.current = !!state.pendingRound;

    const fresh = new Set<number>();
    for (const r of state.rounds) {
      if (!seenRounds.current.has(r.roundNumber)) {
        fresh.add(r.roundNumber);
        seenRounds.current.add(r.roundNumber);
      }
    }
    if (fresh.size > 0) {
      setNewRounds(fresh);
      setTimeout(() => setNewRounds(new Set()), 900);
    }

    prevState.current = state;
  }, [state]);

  const homeCheckout = CHECKOUT_HINTS[state.homeScore];
  const awayCheckout = CHECKOUT_HINTS[state.awayScore];

  const allHomeScores = state.rounds.filter((r) => (r.home ?? 0) > 0).map((r) => r.home as number);
  const allAwayScores = state.rounds.filter((r) => (r.away ?? 0) > 0).map((r) => r.away as number);
  const homeAvg = allHomeScores.length > 0
    ? (allHomeScores.reduce((a, b) => a + b, 0) / allHomeScores.length).toFixed(1)
    : null;
  const awayAvg = allAwayScores.length > 0
    ? (allAwayScores.reduce((a, b) => a + b, 0) / allAwayScores.length).toFixed(1)
    : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 border-b">
        <div className="flex items-center gap-2">
          <Target className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{gameData.gameType}</span>
          <Badge variant="outline" className="text-xs">Leg {state.currentLeg}</Badge>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs text-muted-foreground">Live</span>
        </div>
      </div>

      {/* Main scoreboard */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-4 py-8 w-full max-w-3xl mx-auto">
        {/* Winner banner */}
        {state.winner && (
          <div className="w-full rounded-2xl bg-green-500/10 border-2 border-green-500 p-6 text-center">
            <p className="text-4xl font-black text-green-600">
              {state.winner === "home" ? state.homeTeam : state.awayTeam} wins!
            </p>
          </div>
        )}

        {/* Scoreboard — two score cards with legs in the middle */}
        <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-3 items-stretch">
          {/* Home */}
          <div className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 min-w-0 ${state.winner === "home" ? "bg-green-500/20 border-2 border-green-500" : "bg-muted/60"}`}>
            <p className="text-base font-semibold text-muted-foreground leading-tight truncate w-full">{state.homeTeam}</p>
            <p key={state.homeScore} className={`text-[clamp(3rem,10vw,6rem)] font-black tabular-nums leading-none rounded-lg px-2 ${flashHome ? "flash-yellow" : ""}`}>{state.homeScore}</p>
            {homeCheckout && state.homeScore <= 170 && (
              <p className="text-sm text-amber-500 font-semibold leading-tight">{homeCheckout}</p>
            )}
            {homeAvg && (
              <p className="text-xs text-blue-500 font-medium">avg {homeAvg}</p>
            )}
          </div>

          {/* Legs */}
          <div className="flex flex-col items-center justify-center gap-1 px-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide whitespace-nowrap">Legs</p>
            <p className="text-[clamp(2rem,6vw,3.5rem)] font-black tabular-nums whitespace-nowrap leading-none">
              {state.homeLegs}
              <span className="text-muted-foreground mx-1 font-light">–</span>
              {state.awayLegs}
            </p>
          </div>

          {/* Away */}
          <div className={`rounded-2xl p-5 text-center flex flex-col items-center justify-center gap-2 min-w-0 ${state.winner === "away" ? "bg-green-500/20 border-2 border-green-500" : "bg-muted/60"}`}>
            <p className="text-base font-semibold text-muted-foreground leading-tight truncate w-full">{state.awayTeam}</p>
            <p key={state.awayScore} className={`text-[clamp(3rem,10vw,6rem)] font-black tabular-nums leading-none rounded-lg px-2 ${flashAway ? "flash-yellow" : ""}`}>{state.awayScore}</p>
            {awayCheckout && state.awayScore <= 170 && (
              <p className="text-sm text-amber-500 font-semibold leading-tight">{awayCheckout}</p>
            )}
            {awayAvg && (
              <p className="text-xs text-blue-500 font-medium">avg {awayAvg}</p>
            )}
          </div>
        </div>

        {/* Round history */}
        {(state.rounds.length > 0 || state.pendingRound) && (
          <div className="w-full rounded-xl border overflow-hidden">
            <div className="px-4 py-2 bg-muted/40 border-b">
              <p className="text-sm font-medium">Round history ({state.rounds.length})</p>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/20 sticky top-0">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">R</th>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">Player</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground">{state.homeTeam}</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground">{state.awayTeam}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.pendingRound && (
                    <tr className={`border-t border-border/50 opacity-50 italic ${flashPending ? "flash-yellow" : ""}`}>
                      <td className="py-2 px-3 text-muted-foreground">{state.pendingRound.roundNumber}</td>
                      <td className="py-2 px-3 font-medium">{state.pendingRound.player?.split(" ")[0] ?? "–"}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{state.pendingRound.home ?? "…"}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{state.pendingRound.away ?? "…"}</td>
                    </tr>
                  )}
                  {[...state.rounds].reverse().map((r) => (
                    <tr key={r.roundNumber} className={`border-t border-border/50 ${newRounds.has(r.roundNumber) ? "flash-yellow" : ""}`}>
                      <td className="py-2 px-3 text-muted-foreground">{r.roundNumber}</td>
                      <td className="py-2 px-3 font-medium">{r.player?.split(" ")[0] ?? "–"}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{r.home ?? "–"}</td>
                      <td className="py-2 px-3 text-center tabular-nums">{r.away ?? "–"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {state.rounds.length === 0 && !state.pendingRound && !state.winner && (
          <p className="text-muted-foreground text-sm">Waiting for the first round...</p>
        )}
      </div>
    </div>
  );
}
