"use client";
import React from "react";

import { GameWithPlayers } from "@/types/game-with-players";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import Link from "next/link";




export default function DartTracker({
  gameData,
}: {
  gameData: GameWithPlayers;
}) {
  

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Game Type: {gameData.gameType}</CardTitle>
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
         

        </CardContent>
      </Card>
    </div>
  );
}



