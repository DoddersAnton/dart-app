"use server";

import { pusherServer } from "@/lib/pusher";

export type GameStateBroadcast = {
  homeScore: number;
  awayScore: number;
  homeLegs: number;
  awayLegs: number;
  currentLeg: number;
  winner: "home" | "away" | null;
  isGameDecided?: boolean;
  rounds: Array<{
    roundNumber: number;
    player?: string;
    home?: number;
    away?: number;
  }>;
  pendingRound?: {
    roundNumber: number;
    player?: string;
    home?: number;
    away?: number;
  };
  homeTeam: string;
  awayTeam: string;
  currentThrowSide?: "home" | "away";
  appPlayers?: Array<{ name: string; isNext: boolean }>;
  opposingPlayers?: Array<{ name: string; isNext: boolean }>;
};

export async function broadcastGameState(
  gameId: number,
  state: GameStateBroadcast
): Promise<void> {
  try {
    await pusherServer.trigger(`game-${gameId}`, "round-update", state);
  } catch (error) {
    console.error("broadcastGameState error:", error);
  }
}
