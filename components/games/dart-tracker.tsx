"use client";
import React, { useState } from "react";

import { GameWithPlayers } from "@/types/game-with-players";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {  Flag, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";


type Round = {
    roundNumber?: number;
    gameId: number;
    playerId?: number;
    player?: string;
    fineAdded: boolean;
    home?: number;
    away?: number;
}



export default function DartTracker({ gameData }: { gameData: GameWithPlayers }) {
  const INITAL_SCORE = gameData.gameType === "Team Game" ? 801 : gameData.gameType === "Doubles"  ? 601 : 501;

  const [homeScore, setHomeScore] = useState(INITAL_SCORE);
  const [awayScore, setAwayScore] = useState(INITAL_SCORE);
  const [rounds, setRounds] = useState<{ player?: string; fineAdded:boolean; home?: number; away?: number }[]>([]);
  const [currentRound, setCurrentRound] = useState<Round>();
  const [winner, setWinner] = useState<string | null>(null);

  const handleSubmitRound = () => {
    if (winner) return;

    let newHome = homeScore;
    let newAway = awayScore;

    if (!currentRound) return;

    if (typeof currentRound.home === "number") {
      const updated = newHome - currentRound.home;
      newHome = updated >= 0 ? updated : newHome; // bust check
    }

    if (typeof currentRound.away === "number") {
      const updated = newAway - currentRound.away;
      newAway = updated >= 0 ? updated : newAway; // bust check
    }

    // Save the round
    setRounds([...rounds, currentRound]);
    setHomeScore(newHome);
    setAwayScore(newAway);
    setCurrentRound({roundNumber: (rounds.length +1), gameId: gameData.id, fineAdded: false}); // reset current round

    // Winner check
    if (newHome === 0) setWinner("Home");
    if (newAway === 0) setWinner("Away");
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

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Game Type: {gameData.gameType}</CardTitle>
          <CardTitle>Players: {gameData.players.map((p) => p.name).join(", ")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4 grid grid-cols-5 gap-2 text-center">
            <div>
                <p className="font-bold">Round</p>
                 <p className="text-sm">Rounds: {rounds.length +1}</p>
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
                {r.fineAdded ? <Flag className="inline-block mr-1 text-red-500"/> : ""}
 
              </div>
              <div>{r.player ?? "-"}
              </div>
             
              <div>{r.home ?? "-"}</div>
              <div>{r.away ?? "-"}</div>
            </div>
            
          ))}



          {/* Current round input */}
          {!winner && (
            <div className="grid grid-cols-5 gap-2 text-center py-2 items-center">
              <div>{rounds.length + 1}</div>
                <Button>Add Fine <Plus></Plus></Button>
                <Select
                        
                     

                         value={currentRound?.player ?? ""}
                onValueChange={(value) =>
                  setCurrentRound((prev) =>
                    prev
                      ? { ...prev, player: value, gameId: prev.gameId }
                      : { roundNumber: rounds.length + 1, gameId: gameData.id, player: value, fineAdded: false }
                  )
                }
                      >
                       
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Select a player to fine"
                            />
                          </SelectTrigger>
                   
                        <SelectContent>
                          {gameData.players.map((player) => (
                            <SelectItem
                              key={player.id}
                              value={player.id.toString()}
                            >
                              {player.name}{" "}
                              {player.nickname ? `(${player.nickname})` : ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                     
          
                           
              <Input
                type="number"
                min={0}
                max={homeScore}
                value={currentRound?.home ?? ""}
                onChange={(e) =>
                  setCurrentRound((prev) =>
                    prev
                      ? { ...prev, home: Number(e.target.value), gameId: prev.gameId }
                      : { roundNumber: rounds.length + 1, gameId: gameData.id, home: Number(e.target.value), fineAdded: false }
                  )
                }
                placeholder="Home score"
              />
              <Input
                type="number"
                min={0}
                max={awayScore}
                value={currentRound?.away ?? ""}
                onChange={(e) =>
                  setCurrentRound((prev) =>
                    prev
                      ? { ...prev, away: Number(e.target.value), gameId: prev.gameId }
                      : { roundNumber: rounds.length + 1, gameId: gameData.id, away: Number(e.target.value), fineAdded: false }
                  )
                }
                placeholder="Away score"
              />
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
            <div className="mt-6 text-center text-green-600 font-bold text-xl">
              🎉 {winner} Wins!
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
