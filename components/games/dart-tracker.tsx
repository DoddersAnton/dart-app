"use client";
import React, { useState } from "react";

import { GameWithPlayers } from "@/types/game-with-players";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Flag, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import CreateFineAlert from "./create-fine-alert";
import { useEffect } from "react";
import { getFines } from "@/server/actions/get-fines";
import { getPlayers } from "@/server/actions/get-players";
import { toast } from "sonner";
import { createPlayerFine } from "@/server/actions/create-player-fine";
import { useAction } from "next-safe-action/hooks";
import { Label } from "../ui/label";
import Link from "next/link";
import { createGameRounds } from "@/server/actions/create-game-rounds";
import { createGame } from "@/server/actions/create-game";
import CreateRoundFine from "./create-round-fine";


type Round = {
  roundNumber?: number;
  gameId: number;
  playerId?: number;
  player?: string;
  fineAdded: boolean;
  home?: number;
  away?: number;
};

export default function DartTracker({
  gameData,
}: {
  gameData: GameWithPlayers;
}) {
  const INITAL_SCORE =
    gameData.gameType === "Team Game"
      ? 801
      : gameData.gameType === "Doubles"
      ? 601
      : 501;

  const [homeScore, setHomeScore] = useState(INITAL_SCORE);
  const [awayScore, setAwayScore] = useState(INITAL_SCORE);
  const [awayLegs, setAwayLegs] = useState(0);
  const [homeLegs, setHomeLegs] = useState(0);
  const [rounds, setRounds] = useState<
    { player?: string; fineAdded: boolean; home?: number; away?: number }[]
  >([]);
  const [currentRound, setCurrentRound] = useState<Round>();
  const [currentLeg, setCurrentLeg] = useState<number>(1);
  const [winner, setWinner] = useState<string | null>(null);
  const [showFineDialog, setShowFineDialog] = useState(false);
  const [showRoundFineDialog, setShowRoundFineDialog] = useState(false);
  const [pendingFinePlayer, setPendingFinePlayer] = useState<string | null>(
    null
  );
  const [pendingFineId, setPendingFine] = useState<string | null>(null);
  const [pendingReason, setPendingReason] = useState<string | null>(null);
  const [finesData, setFinesData] = useState<{ id: number, title: string, description: string | null, amount: number, createdAt: string | null }[]>([]);
   const [playersListData, setPlayersListData] = useState<
    {
    id: number;
    name: string;
    nickname: string | null;
    team: string | null;
    createdAt: Date;
  }[]>([]);


useEffect(() => {
  async function fetchData() {
    const fines = await getFines();
    if (Array.isArray(fines)) {
      setFinesData(fines);
    } else {
      setFinesData([]);
      console.error(fines?.error);
    }

    const players = await getPlayers();
    if (Array.isArray(players)) {
      setPlayersListData(
        players.map((p) => ({
          ...p,
          createdAt: p.createdAt ? new Date(p.createdAt) : new Date(),
        }))
      );
    } else {
      setPlayersListData([]);
      console.error("Failed to fetch players:", players);
    }
  }

  fetchData();
}, []);

  const handleSubmitRound = () => {
    if (winner) return;

    let newHome = homeScore;
    let newAway = awayScore;

    if (!currentRound) return;

    if(!currentRound.player)  {
      toast.error("Please select a player for this round");
      return;
    }

    if (typeof currentRound.home === "number") {
      if(currentRound.home > 180)
      {
        toast.error("Score cannot be greater than 180");
        return;
      }

      if(currentRound.home < 0)
      {
        toast.error("Score cannot be negative");
        return;
      }

       if(currentRound.home <= 20 && gameData.homeTeam === "DILFS")
      {
          setPendingFinePlayer(currentRound.player ?? null);
          setPendingFine(finesData.filter(c=>c.title == "20 or under")[0].title ?? null);
          setShowFineDialog(true);
      }

      const updated = newHome - currentRound.home;
      newHome = updated >= 0 ? updated : newHome; // bust check
    }

    if (typeof currentRound.away === "number") {
      if(currentRound.away > 180)
      {
        toast.error("Score cannot be greater than 180");
        return;
      }

      if(currentRound.away <= 20 && gameData.awayTeam === "DILFS")
      {
          setPendingFinePlayer(currentRound.player ?? null);
          setPendingFine(finesData.filter(c=>c.title == "20 or under")[0].title ?? null);
          setShowFineDialog(true);
          setPendingReason("Scoring under 20 in DILFS");
      }


      const updated = newAway - currentRound.away;
      newAway = updated >= 0 ? updated : newAway; // bust check
    }

    // Save the round
    setRounds([...rounds, currentRound]);
    setHomeScore(newHome);
    setAwayScore(newAway);
    setCurrentRound({
      roundNumber: rounds.length + 1,
      gameId: gameData.id,
      fineAdded: false,
    }); // reset current round

    // Winner check
    if (newHome === 0) 
      {
        setWinner("Home")
        setHomeLegs(homeLegs + 1);
      }
    if (newAway === 0) {
      setWinner("Away")
      setAwayLegs(awayLegs + 1);
    }
  };

  const handleUndo = () => {
    if (rounds.length === 0) return;

    const lastRound = rounds[rounds.length - 1];

    // Restore scores
    const restoredHome = homeScore + (lastRound.home ?? 0);
    const restoredAway = awayScore + (lastRound.away ?? 0);

    setHomeScore(restoredHome);
    setAwayScore(restoredAway);
    setRounds(rounds.slice(0, -1));
    setWinner(null); // reset winner if undone
  };

  const { execute, status } = useAction(createPlayerFine, {
        onSuccess: (data) => {
          if (data.data?.error) {
            toast.error(data.data.error);
            return;
          }
          if (data.data?.success) {
            toast.success(data.data.success);
          }
        },
        onExecute: () => {
            toast.info("Creating fine...");
        },
      });   
      

  const submitFine = () => {
    if (pendingFinePlayer && pendingFineId) {

      const playerId = gameData.players.filter(p=>p.name == pendingFinePlayer)[0].id;
      const fineId = finesData.filter(c=>c.title == pendingFineId)[0].id;

      if (!playerId) {
        toast.error("Player not found");
        return;
      }

       execute({
         playerId, 
         fineId: fineId,
         matchDate: new Date(),
         quantity: 1,
         notes: `Fine added during game ${gameData.gameType}`,
       });
    }

      
  };

  const handleNewRound = async () => {

      

    await createGameRounds({gameId: gameData.id, gameRounds: rounds.map((r, idx) => ({
      roundNo: idx + 1,
      roundLeg: currentLeg,
      homeTeamScore: r.home ?? 0,
      awayTeamScore: r.away ?? 0,
      playerId: r.player ? gameData.players.filter(p=>p.name == r.player)[0].id: undefined,
    }))});

    const playerIds = gameData.players.map(p => p.id);
    if (playerIds.length > 0) {
      await createGame({
        id: gameData.id,
        fixtureId: gameData.fixtureId,
        homeTeamScore: homeLegs,
        awayTeamScore: awayLegs,
        gameType: gameData.gameType,
        playerList: playerIds as [number, ...number[]],
      });
    } else {
      toast.error("At least one player is required to finish the game.");
    }

    setCurrentLeg(currentLeg + 1);
    setHomeScore(INITAL_SCORE);
    setAwayScore(INITAL_SCORE);
    setRounds([]);
    setCurrentRound(undefined);
    setWinner(null);
  } 

  const handleFinishGame = async () => {
    
     await createGameRounds({gameId: gameData.id, gameRounds: rounds.map((r, idx) => ({
      roundNo: idx + 1,
      roundLeg: currentLeg,
      homeTeamScore: r.home ?? 0,
      awayTeamScore: r.away ?? 0,
      playerId: r.player ? gameData.players.filter(p=>p.name == r.player)[0].id: undefined,
    }))});
    toast.success("Game finished!");

    const playerIds = gameData.players.map(p => p.id);
    if (playerIds.length > 0) {
      await createGame({
        id: gameData.id,
        fixtureId: gameData.fixtureId,
        homeTeamScore: homeLegs,
        awayTeamScore: awayLegs,
        gameType: gameData.gameType,
        playerList: playerIds as [number, ...number[]],
      });
    } else {
      toast.error("At least one player is required to finish the game.");
    }

    //go back to /fixtures/[id]
    window.location.href = `/fixtures/${gameData.fixtureId}`;
  }

  // ...inside your return JSX, add the Dialog component:

  return (
    <div>
      <CreateFineAlert
        PopupProps={{
          showFineDialog,
          setShowFineDialog,
          submitFine: submitFine,
          player: pendingFinePlayer,
          fine: pendingFineId,
          reason: pendingReason,
        }}
      />
       {pendingFinePlayer  && (<CreateRoundFine
        PopupProps={{
          showRoundFineDialog,
          setShowRoundFineDialog,
          playerId: gameData.players.filter(p=>p.name == pendingFinePlayer)[0] ? gameData.players.filter(p=>p.name == pendingFinePlayer)[0].id : undefined,
          fineId: null,
          fineData: finesData,
          defaultPlayers: playersListData,
          roundLeg: currentLeg,
          roundNo: currentRound?.roundNumber ?? undefined,
        }}
      />) }
     
      <Card>
        <CardHeader>
          {status == "executing" && <p>Submitting fine...</p>}
          <CardTitle>Game Type: {gameData.gameType} - Leg {currentLeg}</CardTitle>
          <CardTitle>
            Players: {gameData.players.map((p) => p.name).join(", ")}
          </CardTitle>
            <CardTitle>
            Home: {gameData.homeTeam} vs Away: {gameData.awayTeam}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Link href={`/fixtures/${gameData.fixtureId}`}>
            <Button variant="outline">Exit</Button>
            </Link>
          </div>
          <div className="mb-4 grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="font-bold">Round</p>
              <p className="text-sm">Rounds: {rounds.length + 1}</p>
            </div>
            <div>
              <p className="font-bold">Fines</p>
            </div>
            <div>
              <p className="font-bold">Player</p>
            </div>
            <div>
              <p className="font-bold">Home</p>
              <p className="text-sm">Remaining: {homeScore}</p>
            </div>
            <div>
              <p className="font-bold">Away</p>
              <p className="text-sm">Remaining: {awayScore}</p>
            </div>
          </div>

          {/* Render past rounds */}
          {rounds.map((r, idx) => (
            <div key={idx} className="grid grid-cols-5 gap-2 text-center py-1">
              <div>{idx + 1}</div>
              <div>
                {r.fineAdded ? (
                  <Flag className="inline-block mr-1 text-red-500" />
                ) : (
                  ""
                )}
              </div>
              <div>{r.player ?? "-"}</div>

              <div>{r.home ?? "-"}</div>
              <div>{r.away ?? "-"}</div>
            </div>
          ))}

          {/* Current round input */}
          {!winner && (
            <div className="grid grid-cols-5 gap-2 text-center py-2 items-center">
              <div>{rounds.length + 1}</div>
              <Button onClick={() => { setPendingFinePlayer(currentRound?.player ?? null); setShowRoundFineDialog(true);}} variant="ghost" >
                Add Fine <Plus></Plus>
              </Button>
              <Select
                value={currentRound?.player ?? ""}
                onValueChange={(value) =>
                  setCurrentRound((prev) =>
                    prev
                      ? { ...prev, player: value, gameId: prev.gameId }
                      : {
                          roundNumber: rounds.length + 1,
                          gameId: gameData.id,
                          player: value,
                          fineAdded: false,
                        }
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a player to fine" />
                </SelectTrigger>

                <SelectContent>
                  {gameData.players.map((player) => (
                    <SelectItem key={player.id} value={player.name}>
                      {player.name}{" "}
                      {player.nickname ? `(${player.nickname})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div>
              
              <Input
                id="homeScore"
                type="number"
           
                value={currentRound?.home ?? ""}
                onChange={(e) =>
                  setCurrentRound((prev) =>
                    prev
                      ? {
                          ...prev,
                          home: Number(e.target.value),
                          gameId: prev.gameId,
                        }
                      : {
                          roundNumber: rounds.length + 1,
                          gameId: gameData.id,
                          home: Number(e.target.value),
                          fineAdded: false,
                        }
                  )
                }
                placeholder="Home score"
              />
              {homeScore < 170 ? (<Label color="red" htmlFor="homeScore">{checkHints[homeScore]}</Label>) : null}
              </div>
              <div className="flex flex-col">
             
              <Input
              id="awayScore"
                type="number"
                min={0}
                max={180}
                value={currentRound?.away ?? ""}
                onChange={(e) =>
                  setCurrentRound((prev) =>
                    prev
                      ? {
                          ...prev,
                          away: Number(e.target.value),
                          gameId: prev.gameId,
                        }
                      : {
                          roundNumber: rounds.length + 1,
                          gameId: gameData.id,
                          away: Number(e.target.value),
                          fineAdded: false,
                        }
                  )
                }
                placeholder="Away score"
              />
               {awayScore < 170 ? (<Label className="text-red-500 text-sm text-center" htmlFor="awayScore">Hint: {checkHints[awayScore]}</Label>) : null}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!winner && (
            <div className="mt-4 flex justify-center gap-4">
              <Button onClick={handleSubmitRound}>Submit Round</Button>
              <Button variant="destructive" onClick={handleUndo}>
                Remove Last Round
              </Button>
            </div>
          )}

          {/* Current totals */}
          <div className="mt-6 text-center">
            <p className="font-semibold">Home Remaining: {homeScore}</p>
            <p className="font-semibold">Away Remaining: {awayScore}</p>
          </div>

          {/* Winner */}
          {winner && (
            <div>
            <div className="mt-6 text-center text-green-600 font-bold text-xl">
              🎉 {winner} Wins!
            </div>
            <Button className="mt-4" variant="outline" onClick={() => handleNewRound()}>Start Next Leg</Button>
            <Button className="mt-4" variant="outline" onClick={() => handleFinishGame()}>Finish Game</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}



const checkHints: Record<number, string> = {
  170: "T20, T20, Bull",
  169: "No finish",
  168: "No finish",
  167: "T20, T19, Bull",
  166: "No finish",
  165: "No finish",
  164: "T20, T18, Bull",
  163: "No finish",
  162: "No finish",
  161: "T20, T17, Bull",
  160: "T20, T20, D20",
  159: "No finish",
  158: "T20, T20, D19",
  157: "T20, T19, D20",
  156: "T20, T20, D18",
  155: "T20, T19, D19",
  154: "T20, T18, D20",
  153: "T20, T19, D18",
  152: "T20, T20, D16",
  151: "T20, T17, D20",
  150: "T20, T18, D18",
  149: "T20, T19, D16",
  148: "T20, T16, D20",
  147: "T20, T17, D18",
  146: "T20, T18, D16",
  145: "T20, T15, D20",
  144: "T20, T20, D12",
  143: "T20, T17, D16",
  142: "T20, T14, D20",
  141: "T20, T19, D12",
  140: "T20, T20, D10",
  139: "T20, T13, D20",
  138: "T20, T18, D12",
  137: "T20, T15, D16",
  136: "T20, T20, D8",
  135: "T20, T17, D12",
  134: "T20, T14, D16",
  133: "T20, T19, D8",
  132: "T20, T16, D12",
  131: "T20, T13, D16",
  130: "T20, T18, D8",
  129: "T19, T16, D12",
  128: "T18, T14, D16",
  127: "T20, T17, D8",
  126: "T19, T19, D6",
  125: "Bull, T15, D20",
  124: "T20, T16, D8",
  123: "T19, T16, D9",
  122: "T18, T20, D4",
  121: "T20, T11, D14",
  120: "T20, 20, D20",
  119: "T19, T12, D13",
  118: "T20, 18, D20",
  117: "T20, 17, D20",
  116: "T20, 16, D20",
  115: "T20, 15, D20",
  114: "T20, 14, D20",
  113: "T20, 13, D20",
  112: "T20, 12, D20",
  111: "T20, 11, D20",
  110: "T20, 10, D20",
  109: "T20, 9, D20",
  108: "T20, 16, D16",
  107: "T19, 18, D16",
  106: "T20, 10, D18",
  105: "T20, 13, D16",
  104: "T18, 18, D16",
  103: "T19, 10, D18",
  102: "T20, 10, D16",
  101: "T17, 10, D20",
  100: "T20, D20",
  99: "T19, 10, D16",
  98: "T20, D19",
  97: "T19, D20",
  96: "T20, D18",
  95: "T19, D19",
  94: "T18, D20",
  93: "T19, D18",
  92: "T20, D16",
  91: "T17, D20",
  90: "T18, D18",
  89: "T19, D16",
  88: "T20, D14",
  87: "T17, D18",
  86: "T18, D16",
  85: "T15, D20",
  84: "T20, D12",
  83: "T17, D16",
  82: "Bull, D16",
  81: "T19, D12",
  80: "T20, D10",
  79: "T19, D11",
  78: "T18, D12",
  77: "T19, D10",
  76: "T20, D8",
  75: "T17, D12",
  74: "T14, D16",
  73: "T19, D8",
  72: "T16, D12",
  71: "T13, D16",
  70: "T18, D8",
  69: "T19, D6",
  68: "T20, D4",
  67: "T17, D8",
  66: "T10, D18",
  65: "T19, D4",
  64: "T16, D8",
  63: "T13, D12",
  62: "T10, D16",
  61: "T15, D8",
  60: "20, D20",
  59: "19, D20",
  58: "18, D20",
  57: "17, D20",
  56: "16, D20",
  55: "15, D20",
  54: "14, D20",
  53: "13, D20",
  52: "12, D20",
  51: "19, D16",
  50: "18, D16",
  49: "17, D16",
  48: "16, D16",
  47: "15, D16",
  46: "14, D16",
  45: "13, D16",
  44: "12, D16",
  43: "11, D16",
  42: "10, D16",
  41: "9, D16",
  40: "D20",
  39: "7, D16",
  38: "D19",
  37: "5, D16",
  36: "D18",
  35: "3, D16",
  34: "D17",
  33: "1, D16",
  32: "D16",
  31: "15, D8",
  30: "D15",
  29: "13, D8",
  28: "D14",
  27: "11, D8",
  26: "D13",
  25: "9, D8",
  24: "D12",
  23: "7, D8",
  22: "D11",
  21: "5, D8",
  20: "D10",
  19: "3, D8",
  18: "D9",
  17: "1, D8",
  16: "D8",
  15: "7, D4",
  14: "D7",
  13: "5, D4",
  12: "D6",
  11: "3, D4",
  10: "D5",
  9: "1, D4",
  8: "D4",
  7: "3, D2",
  6: "D3",
  5: "1, D2",
  4: "D2",
  3: "1, D1",
  2: "D1"
};