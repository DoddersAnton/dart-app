"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { GameWithPlayers } from "@/types/game-with-players";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "../ui/dialog";
import { Flag, RotateCcw, ChevronDown, ArrowLeft, Target, GripVertical, Settings, Pencil, Check, X, Monitor, Plus, ArrowLeftRight } from "lucide-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Switch } from "../ui/switch";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { createGameRounds } from "@/server/actions/create-game-rounds";
import { createGame } from "@/server/actions/create-game";
import { createPlayerFine } from "@/server/actions/create-player-fine";
import { getFines } from "@/server/actions/get-fines";
import { getPlayers } from "@/server/actions/get-players";
import { saveRoundAuto } from "@/server/actions/save-round-auto";
import { deleteLastRound } from "@/server/actions/delete-last-round";
import { updateLegRoundPlayers } from "@/server/actions/update-leg-round-players";
import { broadcastGameState } from "@/server/actions/broadcast-game-state";
import { minDartsForCheckout } from "@/lib/dart-stats";
import CreateRoundFine from "./create-round-fine";

type Round = {
  roundNumber: number;
  gameId: number;
  homePlayerId?: number;
  awayPlayerId?: number;
  homePlayerName?: string;
  awayPlayerName?: string;
  fineAdded: boolean;
  home?: number;
  away?: number;
  homeDartsUsed?: number;
  awayDartsUsed?: number;
};

type FineData = { id: number; title: string; description: string | null; amount: number; createdAt: string | null };
type PlayerData = { id: number; name: string; nickname: string | null; createdAt: Date };

// A player on one side — real records carry an id; free-text opponents don't.
type SidePlayer = { id?: number; name: string; nickname?: string | null; imgUrl?: string | null };

function computeInitialState(gameData: GameWithPlayers, initialScore: number) {
  const legNums = [...new Set(gameData.rounds.map((r) => r.leg))].sort((a, b) => a - b);
  let homeLegs = 0;
  let awayLegs = 0;
  let currentLeg = 1;
  let homeScore = initialScore;
  let awayScore = initialScore;
  let restoredRounds: Round[] = [];

  for (const leg of legNums) {
    const legRounds = gameData.rounds.filter((r) => r.leg === leg).sort((a, b) => a.roundNumber - b.roundNumber);
    let h = initialScore;
    let a = initialScore;
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
      // This leg is in progress — restore it
      currentLeg = leg;
      homeScore = h;
      awayScore = a;
      restoredRounds = legRounds.map((r) => ({
        roundNumber: r.roundNumber,
        gameId: gameData.id,
        homePlayerId: r.homePlayerId ?? undefined,
        awayPlayerId: r.awayPlayerId ?? undefined,
        homePlayerName: r.homePlayerName ?? undefined,
        awayPlayerName: r.awayPlayerName ?? undefined,
        fineAdded: r.fineAdded,
        home: r.homeScore,
        away: r.awayScore,
        homeDartsUsed: r.homeDartsUsed ?? undefined,
        awayDartsUsed: r.awayDartsUsed ?? undefined,
      }));
      return { currentLeg, homeLegs, awayLegs, homeScore, awayScore, restoredRounds };
    } else {
      currentLeg = leg + 1;
    }
  }

  // All saved legs were complete — start fresh on next leg
  return { currentLeg, homeLegs, awayLegs, homeScore, awayScore, restoredRounds: [] };
}

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

type OpposingPlayer = { id: string; name: string };

function SortablePlayerRow({ player }: { player: SidePlayer }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id! });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const initials = player.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2 touch-none"
    >
      <button {...listeners} {...attributes} className="text-muted-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      {player.imgUrl ? (
        <Image src={player.imgUrl} alt={player.name} width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover shrink-0" />
      ) : (
        <div className="h-7 w-7 rounded-full bg-muted border flex items-center justify-center text-[10px] font-semibold shrink-0">{initials}</div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight truncate">{player.name}</p>
        {player.nickname && <p className="text-xs text-muted-foreground leading-tight">{player.nickname}</p>}
      </div>
    </div>
  );
}

function SortableOpposingRow({
  player,
  onNameChange,
  onDelete,
}: {
  player: OpposingPlayer;
  onNameChange: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: player.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2 touch-none">
      <button {...listeners} {...attributes} className="text-muted-foreground cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4" />
      </button>
      <Input
        value={player.name}
        onChange={(e) => onNameChange(player.id, e.target.value)}
        className="flex-1 h-8 text-sm"
        placeholder="Player name"
      />
      <button onClick={() => onDelete(player.id)} className="text-muted-foreground hover:text-destructive shrink-0">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function DartTracker({ gameData, maxLegsPerGame }: { gameData: GameWithPlayers; maxLegsPerGame: number }) {
  const INITIAL_SCORE = gameData.gameType === "Team Game" ? 801 : gameData.gameType === "Doubles" ? 601 : 501;

  const init = computeInitialState(gameData, INITIAL_SCORE);

  const realHome = gameData.homePlayers;
  const realAway = gameData.awayPlayers;
  const homeIsReal = realHome.length > 0;
  const awayIsReal = realAway.length > 0;
  // The free-text opposing list fills whichever side has no real roster (the opponent).
  const freeTextSide: "home" | "away" | null =
    !homeIsReal && awayIsReal ? "home" : homeIsReal && !awayIsReal ? "away" : (!homeIsReal && !awayIsReal ? "away" : null);

  const [homeScore, setHomeScore] = useState(init.homeScore);
  const [awayScore, setAwayScore] = useState(init.awayScore);
  const [homeLegs, setHomeLegs] = useState(init.homeLegs);
  const [awayLegs, setAwayLegs] = useState(init.awayLegs);
  const [rounds, setRounds] = useState<Round[]>(init.restoredRounds);
  const [currentLeg, setCurrentLeg] = useState(init.currentLeg);

  // Per-side throwing order — real rosters can be reordered before the first round.
  const [homeOrder, setHomeOrder] = useState<SidePlayer[]>(realHome);
  const [awayOrder, setAwayOrder] = useState<SidePlayer[]>(realAway);
  const orderLocked = init.restoredRounds.length > 0 || rounds.length > 0;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const [opposingPlayers, setOpposingPlayers] = useState<OpposingPlayer[]>([]);

  // Resolved rosters used for rotation / attribution (real order, or free-text fallback).
  const homeRoster: SidePlayer[] = homeIsReal
    ? homeOrder
    : freeTextSide === "home" ? opposingPlayers.map((o) => ({ name: o.name })) : [];
  const awayRoster: SidePlayer[] = awayIsReal
    ? awayOrder
    : freeTextSide === "away" ? opposingPlayers.map((o) => ({ name: o.name })) : [];

  const shouldRotate = gameData.gameType === "Team Game" || gameData.gameType === "Doubles";
  const isSingles = gameData.gameType === "Singles";

  const initIndex = (len: number) =>
    shouldRotate && len > 0 ? init.restoredRounds.length % len : 0;
  const [homePlayerIndex, setHomePlayerIndex] = useState(initIndex(realHome.length));
  const [awayPlayerIndex, setAwayPlayerIndex] = useState(initIndex(realAway.length));

  const [currentRound, setCurrentRound] = useState<Partial<Round>>({});
  const [winner, setWinner] = useState<"home" | "away" | null>(null);
  const [showRoundFineDialog, setShowRoundFineDialog] = useState(false);
  const [pendingFinePlayerId, setPendingFinePlayerId] = useState<number | null>(null);
  const [pendingFineOffer, setPendingFineOffer] = useState<{ playerId: number; playerName: string; fineTitle: string; teamId: number | null } | null>(null);
  const [selectedDarts, setSelectedDarts] = useState<1 | 2 | 3 | null>(null);
  const [finesData, setFinesData] = useState<FineData[]>([]);
  const [playersListData, setPlayersListData] = useState<PlayerData[]>([]);
  const [saving, setSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(true);
  const [editingRoundIdx, setEditingRoundIdx] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<{ home: string; away: string }>({ home: "", away: "" });
  const [checkoutHintsEnabled, setCheckoutHintsEnabled] = useState(true);
  const [autoFinesEnabled, setAutoFinesEnabled] = useState(true);
  const [firstThrowTeam, setFirstThrowTeam] = useState<"home" | "away">(
    (init.currentLeg - 1) % 2 === 0 ? "home" : "away"
  );
  // savedRoundCount tracks how many completed rounds are persisted in DB for the current leg
  const [savedRoundCount, setSavedRoundCount] = useState(init.restoredRounds.length);
  const [currentThrowSide, setCurrentThrowSide] = useState<"home" | "away">(
    (init.currentLeg - 1) % 2 === 0 ? "home" : "away"
  );
  const [pendingThrowApplied, setPendingThrowApplied] = useState(0);
  const [showOpposingEdit, setShowOpposingEdit] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const hasPendingThrow = currentThrowSide !== firstThrowTeam;
  const pendingThrowScore = hasPendingThrow ? currentRound[firstThrowTeam] : undefined;

  // Current throwers per side, and the active one.
  const homeThrower = homeRoster[homePlayerIndex];
  const awayThrower = awayRoster[awayPlayerIndex];
  const currentThrower = currentThrowSide === "home" ? homeThrower : awayThrower;
  const currentSideIsReal = currentThrowSide === "home" ? homeIsReal : awayIsReal;

  const addOpposingPlayer = () =>
    setOpposingPlayers((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: "" }]);

  const updateOpposingPlayerName = (id: string, name: string) =>
    setOpposingPlayers((prev) => prev.map((p) => (p.id === id ? { ...p, name } : p)));

  const removeOpposingPlayer = (id: string) =>
    setOpposingPlayers((prev) => prev.filter((p) => p.id !== id));

  const setSideIndex = (side: "home" | "away", idx: number) =>
    side === "home" ? setHomePlayerIndex(idx) : setAwayPlayerIndex(idx);

  const handleHomeDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setHomeOrder((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      setHomePlayerIndex(0);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const handleAwayDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setAwayOrder((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      setAwayPlayerIndex(0);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

  const handleOpposingDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setOpposingPlayers((prev) => {
      const oldIdx = prev.findIndex((p) => p.id === active.id);
      const newIdx = prev.findIndex((p) => p.id === over.id);
      if (freeTextSide === "home") setHomePlayerIndex(0);
      else setAwayPlayerIndex(0);
      return arrayMove(prev, oldIdx, newIdx);
    });
  };

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

  // Load / persist free-text opposing players via localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`opposing-players-${gameData.id}`);
      if (stored) setOpposingPlayers(JSON.parse(stored));
    } catch {}
  }, [gameData.id]);
  useEffect(() => {
    try {
      localStorage.setItem(`opposing-players-${gameData.id}`, JSON.stringify(opposingPlayers));
    } catch {}
  }, [opposingPlayers, gameData.id]);

  const { execute: executeFine, status: fineStatus } = useAction(createPlayerFine, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      else if (data.data?.success) toast.success("Fine added");
    },
  });

  // Build the home/away broadcast roster arrays with the "next" flag.
  const broadcastRosters = (nextHomeIdx: number, nextAwayIdx: number) => ({
    homePlayers: homeRoster.map((p, i) => ({ name: p.name, isNext: shouldRotate ? i === nextHomeIdx : i === 0 })),
    awayPlayers: awayRoster.map((p, i) => ({ name: p.name, isNext: shouldRotate ? i === nextAwayIdx : i === 0 })),
  });

  const broadcastRoundList = (list: Round[]) =>
    list.map((r) => ({ roundNumber: r.roundNumber, homePlayerName: r.homePlayerName, awayPlayerName: r.awayPlayerName, home: r.home, away: r.away }));

  const handleSubmitRound = () => {
    if (winner) return;

    const score = currentRound[currentThrowSide];

    if (currentSideIsReal && !currentThrower) {
      toast.error("Select a player for this round");
      return;
    }
    if (typeof score !== "number") {
      toast.error("Enter a score");
      return;
    }
    if (score > 180) {
      toast.error("Score cannot exceed 180");
      return;
    }
    if (score < 0) {
      toast.error("Score cannot be negative");
      return;
    }

    // Clear pending fine offer on each new throw
    setPendingFineOffer(null);

    const remaining = currentThrowSide === "home" ? homeScore : awayScore;

    // Auto-fine check — fires for the throwing side if that team has fines enabled and the thrower is a real player.
    const throwerSideFinesEnabled = currentThrowSide === "home" ? gameData.homeTeamFinesEnabled : gameData.awayTeamFinesEnabled;
    if (autoFinesEnabled && throwerSideFinesEnabled && currentThrower?.id && score <= 20 && remaining > 170) {
      const lowFine = finesData.find((f) => f.title === "20 or under");
      if (lowFine) setPendingFineOffer({
        playerId: currentThrower.id,
        playerName: currentThrower.name,
        fineTitle: lowFine.title,
        teamId: currentThrowSide === "home" ? gameData.homeTeamId : gameData.awayTeamId,
      });
    }
    const updated = remaining - score;
    const newScore = updated >= 0 ? updated : remaining; // bust = no change
    const applied = updated >= 0 ? score : 0; // track actual deduction for undo

    if (currentThrowSide === "home") {
      setHomeScore(newScore);
    } else {
      setAwayScore(newScore);
    }

    const otherSide: "home" | "away" = currentThrowSide === "home" ? "away" : "home";
    const otherScore = currentRound[otherSide];

    // Shared helper: complete a checkout round immediately using pre-selected dart count
    const finishCheckout = (
      home: number, away: number, roundNumber: number,
      homePlayerId: number | undefined, awayPlayerId: number | undefined,
      homeDartsUsed: number | undefined, awayDartsUsed: number | undefined,
      finalHomeScore: number, finalAwayScore: number, roundWinner: "home" | "away",
    ) => {
      setSelectedDarts(null);
      setCurrentThrowSide(firstThrowTeam);
      setPendingThrowApplied(0);
      const newRound: Round = {
        roundNumber, gameId: gameData.id,
        homePlayerId, awayPlayerId,
        homePlayerName: homeThrower?.name, awayPlayerName: awayThrower?.name,
        home, away, fineAdded: false, homeDartsUsed, awayDartsUsed,
      };
      const updatedRounds = [...rounds, newRound];
      setRounds(updatedRounds);
      if (homePlayerId || awayPlayerId) {
        saveRoundAuto({ gameId: gameData.id, leg: currentLeg, roundNumber, homePlayerId, awayPlayerId, homeScore: home, awayScore: away, homeDartsUsed, awayDartsUsed })
          .then(() => setSavedRoundCount((c) => c + 1));
      }
      const newHomeLegs = roundWinner === "home" ? homeLegs + 1 : homeLegs;
      const newAwayLegs = roundWinner === "away" ? awayLegs + 1 : awayLegs;
      const isGameDecided = newHomeLegs >= Math.ceil(maxLegsPerGame / 2) || newAwayLegs >= Math.ceil(maxLegsPerGame / 2);
      if (roundWinner === "home") { setWinner("home"); setHomeLegs((l) => l + 1); }
      else { setWinner("away"); setAwayLegs((l) => l + 1); }
      const nextHomeIdx = shouldRotate && homeRoster.length > 0 ? (homePlayerIndex + 1) % homeRoster.length : homePlayerIndex;
      const nextAwayIdx = shouldRotate && awayRoster.length > 0 ? (awayPlayerIndex + 1) % awayRoster.length : awayPlayerIndex;
      if (shouldRotate) { setHomePlayerIndex(nextHomeIdx); setAwayPlayerIndex(nextAwayIdx); }
      setCurrentRound({});
      broadcastGameState(gameData.id, {
        homeScore: finalHomeScore, awayScore: finalAwayScore,
        homeLegs: newHomeLegs, awayLegs: newAwayLegs, currentLeg,
        winner: roundWinner, isGameDecided,
        rounds: broadcastRoundList(updatedRounds),
        homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam,
        currentThrowSide: firstThrowTeam,
        ...broadcastRosters(nextHomeIdx, nextAwayIdx),
      });
    };

    if (typeof otherScore !== "number") {
      // First throw path
      if (newScore === 0) {
        const minDarts = minDartsForCheckout(score) ?? 1;
        if (selectedDarts === null || selectedDarts < minDarts) {
          toast.error(`Select darts used for the checkout (minimum ${minDarts})`);
          return;
        }
        // Checkout on first throw — end round immediately, other team doesn't throw
        const home = currentThrowSide === "home" ? score : 0;
        const away = currentThrowSide === "away" ? score : 0;
        const finalHomeScore = currentThrowSide === "home" ? 0 : homeScore;
        const finalAwayScore = currentThrowSide === "away" ? 0 : awayScore;
        const roundWinner: "home" | "away" = currentThrowSide === "home" ? "home" : "away";
        const homePlayerId = currentThrowSide === "home" ? homeThrower?.id : undefined;
        const awayPlayerId = currentThrowSide === "away" ? awayThrower?.id : undefined;
        const homeDarts = currentThrowSide === "home" ? (selectedDarts ?? 3) : undefined;
        const awayDarts = currentThrowSide === "away" ? (selectedDarts ?? 3) : undefined;
        finishCheckout(home, away, rounds.length + 1, homePlayerId, awayPlayerId, homeDarts, awayDarts, finalHomeScore, finalAwayScore, roundWinner);
        return;
      }

      // Normal first throw — switch sides
      setPendingThrowApplied(applied);
      setCurrentThrowSide(otherSide);
      broadcastGameState(gameData.id, {
        homeScore: currentThrowSide === "home" ? newScore : homeScore,
        awayScore: currentThrowSide === "away" ? newScore : awayScore,
        homeLegs, awayLegs, currentLeg, winner: null,
        rounds: broadcastRoundList(rounds),
        pendingRound: {
          roundNumber: rounds.length + 1,
          homePlayerName: homeThrower?.name,
          awayPlayerName: awayThrower?.name,
          home: currentThrowSide === "home" ? score : undefined,
          away: currentThrowSide === "away" ? score : undefined,
        },
        homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam,
        currentThrowSide: otherSide,
        ...broadcastRosters(homePlayerIndex, awayPlayerIndex),
      });
      return;
    }

    // Both throws done
    const home = currentThrowSide === "home" ? score : otherScore;
    const away = currentThrowSide === "away" ? score : otherScore;
    const roundNumber = rounds.length + 1;
    const finalHomeScore = currentThrowSide === "home" ? newScore : homeScore;
    const finalAwayScore = currentThrowSide === "away" ? newScore : awayScore;
    const roundWinner = finalHomeScore === 0 ? "home" : finalAwayScore === 0 ? "away" : null;

    if (roundWinner) {
      const checkoutScore = roundWinner === "home" ? home : away;
      const minDarts = minDartsForCheckout(checkoutScore) ?? 1;
      if (selectedDarts === null || selectedDarts < minDarts) {
        toast.error(`Select darts used for the checkout (minimum ${minDarts})`);
        return;
      }
      const homeDarts = roundWinner === "home" ? (selectedDarts ?? 3) : 3;
      const awayDarts = roundWinner === "away" ? (selectedDarts ?? 3) : 3;
      finishCheckout(home, away, roundNumber, homeThrower?.id, awayThrower?.id, homeDarts, awayDarts, finalHomeScore, finalAwayScore, roundWinner);
      return;
    }

    // Normal round — no checkout
    const newRound: Round = {
      roundNumber, gameId: gameData.id,
      homePlayerId: homeThrower?.id, awayPlayerId: awayThrower?.id,
      homePlayerName: homeThrower?.name, awayPlayerName: awayThrower?.name,
      home, away, fineAdded: false, homeDartsUsed: 3, awayDartsUsed: 3,
    };
    const updatedRounds = [...rounds, newRound];
    setRounds(updatedRounds);
    setCurrentThrowSide(firstThrowTeam);
    setPendingThrowApplied(0);

    if (homeThrower?.id || awayThrower?.id) {
      saveRoundAuto({ gameId: gameData.id, leg: currentLeg, roundNumber, homePlayerId: homeThrower?.id, awayPlayerId: awayThrower?.id, homeScore: home, awayScore: away, homeDartsUsed: 3, awayDartsUsed: 3 })
        .then(() => setSavedRoundCount((c) => c + 1));
    }

    const nextHomeIdx = shouldRotate && homeRoster.length > 0 ? (homePlayerIndex + 1) % homeRoster.length : homePlayerIndex;
    const nextAwayIdx = shouldRotate && awayRoster.length > 0 ? (awayPlayerIndex + 1) % awayRoster.length : awayPlayerIndex;
    if (shouldRotate) { setHomePlayerIndex(nextHomeIdx); setAwayPlayerIndex(nextAwayIdx); }
    setCurrentRound({});

    broadcastGameState(gameData.id, {
      homeScore: finalHomeScore, awayScore: finalAwayScore,
      homeLegs, awayLegs, currentLeg, winner: null,
      rounds: broadcastRoundList(updatedRounds),
      homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam,
      currentThrowSide: firstThrowTeam,
      ...broadcastRosters(nextHomeIdx, nextAwayIdx),
    });
  };

  const handleUndo = () => {
    // If mid-round (first throw submitted, waiting for second), cancel it
    if (hasPendingThrow) {
      if (firstThrowTeam === "home") {
        setHomeScore((s) => s + pendingThrowApplied);
      } else {
        setAwayScore((s) => s + pendingThrowApplied);
      }
      setPendingThrowApplied(0);
      setCurrentThrowSide(firstThrowTeam);
      setCurrentRound((prev) => {
        const next = { ...prev };
        delete (next as Record<string, unknown>)[firstThrowTeam];
        return next;
      });
      return;
    }
    if (rounds.length === 0) return;
    const last = rounds[rounds.length - 1];
    setHomeScore((s) => s + (last.home ?? 0));
    setAwayScore((s) => s + (last.away ?? 0));
    const updatedRounds = rounds.slice(0, -1);
    setRounds(updatedRounds);
    setWinner(null);

    // Delete from DB if this round was auto-saved
    if (savedRoundCount >= rounds.length) {
      deleteLastRound({ gameId: gameData.id, leg: currentLeg, roundNumber: last.roundNumber });
      setSavedRoundCount((c) => Math.max(0, c - 1));
    }

    // Compute previous indices before rotation for the broadcast
    const prevHomeIdx = shouldRotate && homeRoster.length > 0 ? (homePlayerIndex - 1 + homeRoster.length) % homeRoster.length : homePlayerIndex;
    const prevAwayIdx = shouldRotate && awayRoster.length > 0 ? (awayPlayerIndex - 1 + awayRoster.length) % awayRoster.length : awayPlayerIndex;

    // Broadcast undo to display mode viewers
    broadcastGameState(gameData.id, {
      homeScore: homeScore + (last.home ?? 0),
      awayScore: awayScore + (last.away ?? 0),
      homeLegs,
      awayLegs,
      currentLeg,
      winner: null,
      rounds: broadcastRoundList(updatedRounds),
      homeTeam: gameData.homeTeam,
      awayTeam: gameData.awayTeam,
      currentThrowSide: firstThrowTeam,
      ...broadcastRosters(prevHomeIdx, prevAwayIdx),
    });

    // Step back one in the rotation
    if (shouldRotate) {
      setHomePlayerIndex(prevHomeIdx);
      setAwayPlayerIndex(prevAwayIdx);
    }
    setCurrentRound({});
  };

  // Swap the throwing order. For rotation games (Team/Doubles) this advances the
  // rotation by one position and re-credits the leg's saved rounds. For Singles
  // there's no rotation, so it just swaps which side throws first.
  // Either way home/away scores are left untouched.
  const handleSwitchOrder = async () => {
    if (winner || hasPendingThrow) return;

    // Singles: no rotation to re-credit — just flip who throws first.
    if (!shouldRotate) {
      const nextFirst: "home" | "away" = firstThrowTeam === "home" ? "away" : "home";
      setFirstThrowTeam(nextFirst);
      setCurrentThrowSide(nextFirst);
      broadcastGameState(gameData.id, {
        homeScore, awayScore, homeLegs, awayLegs, currentLeg, winner: null,
        rounds: broadcastRoundList(rounds),
        homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam,
        currentThrowSide: nextFirst,
        ...broadcastRosters(homePlayerIndex, awayPlayerIndex),
      });
      toast.success("Throwing order switched");
      return;
    }

    const homeLen = homeRoster.length;
    const awayLen = awayRoster.length;

    const updatedRounds = rounds.map((r, p) => {
      const newHome = homeLen > 0 ? homeRoster[(p + 1) % homeLen] : undefined;
      const newAway = awayLen > 0 ? awayRoster[(p + 1) % awayLen] : undefined;
      return {
        ...r,
        homePlayerId: homeIsReal ? newHome?.id : r.homePlayerId,
        awayPlayerId: awayIsReal ? newAway?.id : r.awayPlayerId,
        homePlayerName: newHome?.name ?? r.homePlayerName,
        awayPlayerName: newAway?.name ?? r.awayPlayerName,
      };
    });

    const nextHomeIdx = homeLen > 0 ? (homePlayerIndex + 1) % homeLen : homePlayerIndex;
    const nextAwayIdx = awayLen > 0 ? (awayPlayerIndex + 1) % awayLen : awayPlayerIndex;

    // Persist the re-attribution for rounds already written to the DB before updating local state,
    // so a failure leaves state consistent with what is in the database.
    const savedToUpdate = updatedRounds.slice(0, savedRoundCount).filter((r) => r.homePlayerId || r.awayPlayerId);
    if (savedToUpdate.length > 0) {
      const result = await updateLegRoundPlayers({
        gameId: gameData.id,
        leg: currentLeg,
        rounds: savedToUpdate.map((r) => ({ roundNumber: r.roundNumber, homePlayerId: r.homePlayerId, awayPlayerId: r.awayPlayerId })),
      });
      if (!result?.success) {
        toast.error("Failed to update player attribution — throwing order was not switched");
        return;
      }
    }

    setRounds(updatedRounds);
    setHomePlayerIndex(nextHomeIdx);
    setAwayPlayerIndex(nextAwayIdx);

    broadcastGameState(gameData.id, {
      homeScore, awayScore, homeLegs, awayLegs, currentLeg, winner: null,
      rounds: broadcastRoundList(updatedRounds),
      homeTeam: gameData.homeTeam, awayTeam: gameData.awayTeam,
      currentThrowSide: firstThrowTeam,
      ...broadcastRosters(nextHomeIdx, nextAwayIdx),
    });
    toast.success("Throwing order switched");
  };

  const submitPendingFine = () => {
    if (!pendingFineOffer) return;
    const fine = finesData.find((f) => f.title === pendingFineOffer.fineTitle);
    if (!fine) { toast.error("Fine not found"); return; }
    executeFine({ playerId: pendingFineOffer.playerId, fineId: fine.id, matchDate: new Date(), quantity: 1, notes: `Fine during ${gameData.gameType}`, teamId: pendingFineOffer.teamId ?? undefined });
    setPendingFineOffer(null);
  };

  const handleSaveEdit = (idx: number) => {
    const newHome = editValues.home === "" ? undefined : Number(editValues.home);
    const newAway = editValues.away === "" ? undefined : Number(editValues.away);

    if (newHome !== undefined && (isNaN(newHome) || newHome < 0 || newHome > 180)) {
      toast.error("Home score must be between 0 and 180");
      return;
    }
    if (newAway !== undefined && (isNaN(newAway) || newAway < 0 || newAway > 180)) {
      toast.error("Away score must be between 0 and 180");
      return;
    }

    const updatedRounds = rounds.map((r, i) =>
      i === idx ? { ...r, home: newHome, away: newAway } : r
    );

    // Recompute scores and winner from scratch for this leg
    let h = INITIAL_SCORE;
    let a = INITIAL_SCORE;
    let newWinner: "home" | "away" | null = null;
    for (const r of updatedRounds) {
      if (typeof r.home === "number") { const u = h - r.home; h = u >= 0 ? u : h; }
      if (typeof r.away === "number") { const u = a - r.away; a = u >= 0 ? u : a; }
      if (h === 0) newWinner = "home";
      else if (a === 0) newWinner = "away";
    }

    setRounds(updatedRounds);
    setHomeScore(h);
    setAwayScore(a);
    if (newWinner !== winner) setWinner(newWinner);
    setEditingRoundIdx(null);
  };

  const saveAndAdvance = async (finish: boolean) => {
    setSaving(true);
    try {
      // Rounds are auto-saved per throw — only save any that slipped through (e.g. no playerId)
      const unsavedRounds = rounds.slice(savedRoundCount);
      if (unsavedRounds.length > 0) {
        await createGameRounds({
          gameId: gameData.id,
          gameRounds: unsavedRounds.map((r, idx) => ({
            roundNo: savedRoundCount + idx + 1,
            roundLeg: currentLeg,
            homeTeamScore: r.home ?? 0,
            awayTeamScore: r.away ?? 0,
            homePlayerId: r.homePlayerId,
            awayPlayerId: r.awayPlayerId,
            homeDartsUsed: r.homeDartsUsed,
            awayDartsUsed: r.awayDartsUsed,
          })),
        });
      }

      const homePlayerIds = homeIsReal ? homeOrder.map((p) => p.id!).filter(Boolean) : [];
      const awayPlayerIds = awayIsReal ? awayOrder.map((p) => p.id!).filter(Boolean) : [];
      if (homePlayerIds.length > 0 || awayPlayerIds.length > 0) {
        await createGame({
          id: gameData.id,
          fixtureId: gameData.fixtureId,
          homeTeamScore: homeLegs,
          awayTeamScore: awayLegs,
          gameType: gameData.gameType,
          homePlayerList: homePlayerIds,
          awayPlayerList: awayPlayerIds,
        });
      }

      if (finish || gameDecided) {
        broadcastGameState(gameData.id, {
          homeScore: homeScore,
          awayScore: awayScore,
          homeLegs,
          awayLegs,
          currentLeg,
          winner,
          isGameDecided: true,
          rounds: broadcastRoundList(rounds),
          homeTeam: gameData.homeTeam,
          awayTeam: gameData.awayTeam,
          ...broadcastRosters(homePlayerIndex, awayPlayerIndex),
        });
        toast.success("Game saved!");
        window.location.href = `/fixtures/${gameData.fixtureId}`;
      } else {
        const nextLeg = currentLeg + 1;
        if (nextLeg > maxLegsPerGame) {
          toast.info("Maximum legs reached — game complete.");
          window.location.href = `/fixtures/${gameData.fixtureId}`;
          return;
        }
        const nextFirstThrowTeam: "home" | "away" = firstThrowTeam === "home" ? "away" : "home";
        setCurrentLeg(nextLeg);
        setHomeScore(INITIAL_SCORE);
        setAwayScore(INITIAL_SCORE);
        setRounds([]);
        setWinner(null);
        setShowHistory(false);
        setHomePlayerIndex(0);
        setAwayPlayerIndex(0);
        setFirstThrowTeam(nextFirstThrowTeam);
        setCurrentThrowSide(nextFirstThrowTeam);
        setPendingThrowApplied(0);
        setSavedRoundCount(0);
        setCurrentRound({});
        broadcastGameState(gameData.id, {
          homeScore: INITIAL_SCORE,
          awayScore: INITIAL_SCORE,
          homeLegs,
          awayLegs,
          currentLeg: nextLeg,
          winner: null,
          rounds: [],
          homeTeam: gameData.homeTeam,
          awayTeam: gameData.awayTeam,
          currentThrowSide: nextFirstThrowTeam,
          ...broadcastRosters(0, 0),
        });
        toast.success(`Leg ${currentLeg} saved — starting leg ${nextLeg}`);
      }
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const homeCheckout = CHECKOUT_HINTS[homeScore];
  const awayCheckout = CHECKOUT_HINTS[awayScore];
  const legsToWin = Math.ceil(maxLegsPerGame / 2);
  const gameDecided = homeLegs >= legsToWin || awayLegs >= legsToWin;

  // Per-player average for a side's player (DB rounds + current unsaved rounds).
  const playerAvgFor = (side: "home" | "away", playerId?: number): string | null => {
    if (!playerId) return null;
    const dbScores = gameData.rounds
      .filter((r) => (side === "home" ? r.homePlayerId : r.awayPlayerId) === playerId)
      .map((r) => (side === "home" ? r.homeScore : r.awayScore))
      .filter((s) => s > 0);
    const liveScores = rounds
      .filter((r) => (side === "home" ? r.homePlayerId : r.awayPlayerId) === playerId)
      .map((r) => (side === "home" ? (r.home ?? 0) : (r.away ?? 0)))
      .filter((s) => s > 0);
    const all = [...dbScores, ...liveScores];
    return all.length > 0 ? (all.reduce((a, b) => a + b, 0) / all.length).toFixed(1) : null;
  };

  // Game already complete (loaded from DB) — nothing more to track
  if (currentLeg > maxLegsPerGame || (gameDecided && !winner)) {
    return (
      <div className="space-y-4 max-w-sm mx-auto text-center pt-8">
        <div className="rounded-xl border border-destructive/40 bg-destructive/10 p-6 space-y-3">
          <Target className="h-10 w-10 mx-auto text-destructive" />
          <p className="text-lg font-semibold">Game complete</p>
          <p className="text-sm text-muted-foreground">
            This game has already been decided ({homeLegs}–{awayLegs} legs).
          </p>
          <Link href={`/games/${gameData.id}`}>
            <Button variant="outline" className="w-full mt-2">View game summary</Button>
          </Link>
          <Link href={`/fixtures/${gameData.fixtureId}`}>
            <Button variant="ghost" className="w-full">Back to fixture</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Render a side's roster — real player cards (with avg + drag) or the free-text editor.
  const renderRosterSection = (side: "home" | "away") => {
    const isReal = side === "home" ? homeIsReal : awayIsReal;
    const order = side === "home" ? homeOrder : awayOrder;
    const roster = side === "home" ? homeRoster : awayRoster;
    const activeIdx = side === "home" ? homePlayerIndex : awayPlayerIndex;
    const teamName = side === "home" ? gameData.homeTeam : gameData.awayTeam;
    const onDragEnd = side === "home" ? handleHomeDragEnd : handleAwayDragEnd;

    if (isReal) {
      return (
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">{teamName} players</p>
          {shouldRotate && !orderLocked && rounds.length === 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-center text-muted-foreground">Drag to set throwing order</p>
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
                <SortableContext items={order.map((p) => p.id!)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-2">
                    {order.map((p) => (
                      <SortablePlayerRow key={p.id} player={p} />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {order.map((p, idx) => {
                const isNext = shouldRotate && !winner && side === currentThrowSide && idx === activeIdx;
                const initials = p.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
                const playerAvg = playerAvgFor(side, p.id);
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border transition-all ${
                      isNext
                        ? "bg-amber-50 border-amber-400 dark:bg-amber-950/40 ring-1 ring-amber-400"
                        : "bg-muted/50 border-border"
                    }`}
                  >
                    {p.imgUrl ? (
                      <Image src={p.imgUrl} alt={p.name} width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-muted border flex items-center justify-center text-[10px] font-semibold shrink-0">
                        {initials}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-tight truncate">
                        {shouldRotate && <span className="text-muted-foreground mr-1">{idx + 1}.</span>}
                        {p.name}
                      </p>
                      {p.nickname && <p className="text-[10px] text-muted-foreground leading-tight truncate">{p.nickname}</p>}
                      {playerAvg && (
                        <p className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 leading-tight tabular-nums">
                          avg {playerAvg}
                        </p>
                      )}
                    </div>
                    {isNext && <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide ml-1">Next</span>}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    // Free-text opponent side
    return (
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{teamName} players</p>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs gap-1" onClick={() => setShowOpposingEdit(true)}>
            <Pencil className="h-3 w-3" /> Edit
          </Button>
        </div>
        {roster.length === 0 ? (
          <Button variant="outline" size="sm" className="w-full gap-1.5 text-xs h-8" onClick={() => setShowOpposingEdit(true)}>
            <Plus className="h-3.5 w-3.5" /> Add opposing players
          </Button>
        ) : (
          <div className="flex flex-wrap gap-2">
            {roster.map((p, idx) => {
              const isNext = shouldRotate && !winner && side === currentThrowSide && idx === activeIdx;
              const initials = p.name
                ? p.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
                : "?";
              return (
                <div
                  key={idx}
                  className={`flex items-center gap-2 rounded-lg px-3 py-1.5 border transition-all ${
                    isNext
                      ? "bg-amber-50 border-amber-400 dark:bg-amber-950/40 ring-1 ring-amber-400"
                      : "bg-muted/50 border-border"
                  }`}
                >
                  <div className="h-6 w-6 rounded-full bg-muted border flex items-center justify-center text-[10px] font-semibold shrink-0">
                    {initials}
                  </div>
                  <p className="text-xs font-semibold leading-tight">
                    {shouldRotate && <span className="text-muted-foreground mr-1">{idx + 1}.</span>}
                    {p.name || <span className="text-muted-foreground italic">Unnamed</span>}
                  </p>
                  {isNext && <span className="text-[9px] font-bold text-amber-600 uppercase tracking-wide ml-1">Next</span>}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {pendingFinePlayerId && (
        <CreateRoundFine
          PopupProps={{
            showRoundFineDialog,
            setShowRoundFineDialog,
            playerId: pendingFinePlayerId,
            fineId: null,
            fineData: finesData,
            defaultPlayers: playersListData,
            roundLeg: currentLeg,
            roundNo: (rounds.length + 1),
          }}
        />
      )}

      {/* Opposing players edit dialog */}
      <Dialog open={showOpposingEdit} onOpenChange={setShowOpposingEdit}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Opposing team players</DialogTitle>
            <DialogDescription>Add and order the opposing team&apos;s players for rotation tracking.</DialogDescription>
          </DialogHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleOpposingDragEnd}>
            <SortableContext items={opposingPlayers.map((p) => p.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2 py-1">
                {opposingPlayers.map((p) => (
                  <SortableOpposingRow
                    key={p.id}
                    player={p}
                    onNameChange={updateOpposingPlayerName}
                    onDelete={removeOpposingPlayer}
                  />
                ))}
                {opposingPlayers.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">No players added yet.</p>
                )}
              </div>
            </SortableContext>
          </DndContext>
          <DialogFooter className="flex-row gap-2 sm:justify-between">
            <Button variant="outline" size="sm" onClick={addOpposingPlayer} className="gap-1.5">
              <Plus className="h-4 w-4" /> Add player
            </Button>
            <Button size="sm" onClick={() => setShowOpposingEdit(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
          <Link href={`/games/${gameData.id}/display`} target="_blank">
            <Button variant="ghost" size="icon" className="h-7 w-7" title="Open display mode">
              <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </Link>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Settings className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-56 p-3 space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tracker settings</p>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium leading-tight">Checkout hints</p>
                  <p className="text-xs text-muted-foreground leading-tight">Show finish suggestions</p>
                </div>
                <Switch checked={checkoutHintsEnabled} onCheckedChange={setCheckoutHintsEnabled} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium leading-tight">Auto fines</p>
                  <p className="text-xs text-muted-foreground leading-tight">Prompt fine for ≤20 score</p>
                </div>
                <Switch checked={autoFinesEnabled} onCheckedChange={setAutoFinesEnabled} />
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Scoreboard */}
      <div className="grid grid-cols-3 gap-2">
        {/* Home */}
        <div className={`rounded-xl p-4 text-center space-y-1 transition-shadow ${
          winner === "home" ? "bg-green-500/20 border-2 border-green-500" :
          !winner && currentThrowSide === "home" ? "bg-muted/60 animate-active-border" :
          "bg-muted/60"
        }`}>
          <p className="text-xs font-medium text-muted-foreground truncate">{gameData.homeTeam}</p>
          <p className="text-5xl font-black tabular-nums leading-none">{homeScore}</p>
          {checkoutHintsEnabled && homeCheckout && homeScore <= 170 && (
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
        <div className={`rounded-xl p-4 text-center space-y-1 transition-shadow ${
          winner === "away" ? "bg-green-500/20 border-2 border-green-500" :
          !winner && currentThrowSide === "away" ? "bg-muted/60 animate-active-border" :
          "bg-muted/60"
        }`}>
          <p className="text-xs font-medium text-muted-foreground truncate">{gameData.awayTeam}</p>
          <p className="text-5xl font-black tabular-nums leading-none">{awayScore}</p>
          {checkoutHintsEnabled && awayCheckout && awayScore <= 170 && (
            <p className="text-[10px] text-amber-500 font-medium leading-tight">{awayCheckout}</p>
          )}
        </div>
      </div>

      {/* Averages row — all legs combined, 3-dart average */}
      {(() => {
        const allHomeRounds = [
          ...gameData.rounds.map((r) => ({ score: r.homeScore, darts: r.homeDartsUsed ?? r.dartsUsed ?? 3 })),
          ...rounds.filter((r) => typeof r.home === "number").map((r) => ({ score: r.home as number, darts: r.homeDartsUsed ?? 3 })),
        ].filter((r) => r.score > 0);
        const allAwayRounds = [
          ...gameData.rounds.map((r) => ({ score: r.awayScore, darts: r.awayDartsUsed ?? r.dartsUsed ?? 3 })),
          ...rounds.filter((r) => typeof r.away === "number").map((r) => ({ score: r.away as number, darts: r.awayDartsUsed ?? 3 })),
        ].filter((r) => r.score > 0);
        const homeAvgVal = allHomeRounds.length > 0
          ? (allHomeRounds.reduce((s, r) => s + r.score, 0) * 3 / allHomeRounds.reduce((s, r) => s + r.darts, 0)).toFixed(1)
          : null;
        const awayAvgVal = allAwayRounds.length > 0
          ? (allAwayRounds.reduce((s, r) => s + r.score, 0) * 3 / allAwayRounds.reduce((s, r) => s + r.darts, 0)).toFixed(1)
          : null;
        if (!homeAvgVal && !awayAvgVal) return null;
        return (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/40 py-1.5">
              <p className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">{homeAvgVal ?? "–"}</p>
              <p className="text-[10px] text-muted-foreground">3-dart avg</p>
            </div>
            <div className="flex items-center justify-center">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">avg</p>
            </div>
            <div className="rounded-lg bg-muted/40 py-1.5">
              <p className="text-sm font-bold tabular-nums text-blue-600 dark:text-blue-400">{awayAvgVal ?? "–"}</p>
              <p className="text-[10px] text-muted-foreground">3-dart avg</p>
            </div>
          </div>
        );
      })()}

      {/* Rosters */}
      {renderRosterSection("home")}
      {renderRosterSection("away")}

      {/* Winner banner */}
      {winner && (
        <div className="rounded-xl bg-green-500/10 border border-green-500 p-4 text-center space-y-3">
          {gameDecided ? (
            <p className="text-lg font-bold text-green-600">
              🏆 {winner === "home" ? gameData.homeTeam : gameData.awayTeam} wins the game {homeLegs}–{awayLegs}!
            </p>
          ) : (
            <p className="text-lg font-bold text-green-600">
              🎯 {winner === "home" ? gameData.homeTeam : gameData.awayTeam} wins leg {currentLeg}!
            </p>
          )}
          <div className="flex gap-2 justify-center">
            {!gameDecided && (
              <Button variant="outline" disabled={saving} onClick={() => saveAndAdvance(false)}>
                {saving ? "Saving..." : "Start next leg"}
              </Button>
            )}
            <Button disabled={saving} onClick={() => saveAndAdvance(true)}>
              {saving ? "Saving..." : "Finish game"}
            </Button>
          </div>
        </div>
      )}

      {/* Round history (collapsible) */}
      {(rounds.length > 0 || hasPendingThrow) && (
        <div className="rounded-lg border overflow-hidden">
          <button
            className="w-full flex items-center justify-between px-3 py-2 text-sm font-medium bg-muted/40 hover:bg-muted/60"
            onClick={() => setShowHistory((v) => !v)}
          >
            <span>Round history ({rounds.length})</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showHistory ? "rotate-180" : ""}`} />
          </button>
          {showHistory && (() => {
            let homeRem = INITIAL_SCORE;
            let awayRem = INITIAL_SCORE;
            const enriched = rounds.map((r, idx) => {
              homeRem = typeof r.home === "number" ? Math.max(0, homeRem - r.home) : homeRem;
              awayRem = typeof r.away === "number" ? Math.max(0, awayRem - r.away) : awayRem;
              return { ...r, idx, homeRem, awayRem };
            });
            return (
              <div ref={historyRef} className="max-h-48 overflow-y-auto">
                {/* Column headers */}
                <div className="grid grid-cols-2 divide-x border-b bg-muted/30 sticky top-0 z-10">
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground text-center uppercase tracking-wide truncate">{gameData.homeTeam}</p>
                  <p className="px-3 py-1.5 text-[10px] font-semibold text-muted-foreground text-center uppercase tracking-wide truncate">{gameData.awayTeam}</p>
                </div>
                {/* Pending throw */}
                {hasPendingThrow && (
                  <div className="grid grid-cols-2 divide-x border-t border-border/50 opacity-60 italic">
                    <p className="px-3 py-1.5 text-xs text-center tabular-nums">{firstThrowTeam === "home" ? pendingThrowScore : "…"}</p>
                    <p className="px-3 py-1.5 text-xs text-center tabular-nums">{firstThrowTeam === "away" ? pendingThrowScore : "…"}</p>
                  </div>
                )}
                {/* Round rows */}
                {enriched.map((r) => (
                  <div key={r.idx} className={`grid grid-cols-2 divide-x border-t border-border/50 ${r.idx % 2 !== 0 ? "bg-muted/10" : ""}`}>
                    {/* Home cell */}
                    {editingRoundIdx === r.idx ? (
                      <div className="px-2 py-1">
                        <Input type="number" inputMode="numeric" min={0} max={180}
                          className="h-7 w-full text-center text-xs px-1"
                          value={editValues.home}
                          onChange={(e) => setEditValues((v) => ({ ...v, home: e.target.value }))}
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 flex items-center justify-between gap-1">
                        <div className="flex items-baseline gap-1.5 flex-wrap">
                          <span className={`text-xs tabular-nums ${r.home === 180 ? "font-black text-amber-500 underline decoration-2 underline-offset-2" : (r.home ?? 0) >= 100 ? "font-bold text-orange-500 underline underline-offset-2" : "font-semibold"}`}>{r.home ?? "–"}</span>
                          {typeof r.home === "number" && (
                            <span className={`text-[10px] tabular-nums ${r.homeRem <= 170 ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>{r.homeRem}</span>
                          )}
                        </div>
                        {!hasPendingThrow && (
                          <button onClick={() => { setEditingRoundIdx(r.idx); setEditValues({ home: r.home !== undefined ? String(r.home) : "", away: r.away !== undefined ? String(r.away) : "" }); }}
                            className="text-muted-foreground hover:text-foreground shrink-0">
                            <Pencil className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    )}
                    {/* Away cell */}
                    {editingRoundIdx === r.idx ? (
                      <div className="px-2 py-1 flex items-center gap-1">
                        <Input type="number" inputMode="numeric" min={0} max={180}
                          className="h-7 flex-1 text-center text-xs px-1"
                          value={editValues.away}
                          onChange={(e) => setEditValues((v) => ({ ...v, away: e.target.value }))}
                        />
                        <button onClick={() => handleSaveEdit(r.idx)} className="text-green-600 hover:text-green-700 shrink-0"><Check className="h-3.5 w-3.5" /></button>
                        <button onClick={() => setEditingRoundIdx(null)} className="text-muted-foreground hover:text-foreground shrink-0"><X className="h-3.5 w-3.5" /></button>
                      </div>
                    ) : (
                      <div className="px-3 py-1.5 flex items-center gap-1.5 flex-wrap">
                        <span className={`text-xs tabular-nums ${r.away === 180 ? "font-black text-amber-500 underline decoration-2 underline-offset-2" : (r.away ?? 0) >= 100 ? "font-bold text-orange-500 underline underline-offset-2" : "font-semibold"}`}>{r.away ?? "–"}</span>
                        {typeof r.away === "number" && (
                          <span className={`text-[10px] tabular-nums ${r.awayRem <= 170 ? "text-amber-500 font-medium" : "text-muted-foreground"}`}>{r.awayRem}</span>
                        )}
                        {r.fineAdded && <Flag className="h-3 w-3 text-red-500 ml-auto" />}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })()}
        </div>
      )}

      {/* Inline fine offer */}
      {pendingFineOffer && (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 px-3 py-2">
          <p className="text-sm">
            Fine <span className="font-semibold">{pendingFineOffer.playerName}</span> for scoring 20 or under?
          </p>
          <div className="flex gap-1.5 shrink-0">
            <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-600 hover:bg-red-50" onClick={submitPendingFine}>
              <Flag className="h-3 w-3 mr-1" />Fine
            </Button>
            <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => setPendingFineOffer(null)}>Dismiss</Button>
          </div>
        </div>
      )}

      {/* Input area */}
      {!winner && (
        <div className="rounded-xl border p-4 space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-medium text-muted-foreground">Round {rounds.length + 1}</p>
            <p className="text-xs text-muted-foreground">
              {hasPendingThrow
                ? <span className="font-medium text-foreground">{currentThrowSide === "home" ? gameData.homeTeam : gameData.awayTeam}</span>
                : <span className="font-medium text-foreground">{firstThrowTeam === "home" ? gameData.homeTeam : gameData.awayTeam}</span>
              }
              {" "}to throw
            </p>
          </div>

          {/* Player selector for the throwing side */}
          {currentSideIsReal ? (
            isSingles ? (
              <p className="text-xs text-muted-foreground">
                Player: <span className="font-medium text-foreground">{currentThrower?.name}</span>
              </p>
            ) : (
              <div className="space-y-1">
                {shouldRotate && (
                  <p className="text-xs text-muted-foreground">
                    Up next: <span className="font-medium text-foreground">
                      {currentThrower?.name}
                      {currentThrower?.nickname && (
                        <span className="text-muted-foreground font-normal"> ({currentThrower.nickname})</span>
                      )}
                    </span>
                  </p>
                )}
                <Select
                  value={currentThrower?.name ?? ""}
                  onValueChange={(val) => {
                    const roster = currentThrowSide === "home" ? homeRoster : awayRoster;
                    const idx = roster.findIndex((p) => p.name === val);
                    if (idx !== -1) setSideIndex(currentThrowSide, idx);
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select player" />
                  </SelectTrigger>
                  <SelectContent>
                    {(currentThrowSide === "home" ? homeRoster : awayRoster).map((p, idx) => (
                      <SelectItem key={p.id ?? idx} value={p.name}>
                        <span className="font-medium">{p.name}</span>
                        {p.nickname && <span className="text-muted-foreground ml-1.5 text-xs">({p.nickname})</span>}
                        {shouldRotate && idx === (currentThrowSide === "home" ? homePlayerIndex : awayPlayerIndex) && (
                          <span className="ml-2 text-[10px] text-amber-500 font-semibold">↑ next</span>
                        )}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )
          ) : (
            <p className="text-xs text-muted-foreground">
              {currentThrower?.name
                ? <>Throwing: <span className="font-medium text-foreground">{currentThrower.name}</span></>
                : <>Add {currentThrowSide === "home" ? gameData.homeTeam : gameData.awayTeam} players above to track who threw.</>}
            </p>
          )}

          {/* Throws-first toggle — editable at any round boundary to fix a wrong starting team */}
          {!hasPendingThrow && (
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-muted-foreground">Throws first</p>
              <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
                <button
                  className={`px-3 py-1.5 transition-colors ${firstThrowTeam === "home" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => { setFirstThrowTeam("home"); setCurrentThrowSide("home"); }}
                >
                  {gameData.homeTeam}
                </button>
                <button
                  className={`px-3 py-1.5 transition-colors ${firstThrowTeam === "away" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"}`}
                  onClick={() => { setFirstThrowTeam("away"); setCurrentThrowSide("away"); }}
                >
                  {gameData.awayTeam}
                </button>
              </div>
            </div>
          )}

          {/* Pending score from first throw */}
          {hasPendingThrow && (
            <div className="rounded-lg bg-muted/40 px-3 py-2 flex items-center justify-between">
              <span className="text-xs text-muted-foreground">
                {firstThrowTeam === "home" ? gameData.homeTeam : gameData.awayTeam} scored
              </span>
              <span className="text-sm font-bold tabular-nums">{pendingThrowScore}</span>
            </div>
          )}

          {/* Score input — one team at a time */}
          {(() => {
            const field = currentThrowSide;
            const remaining = currentThrowSide === "home" ? homeScore : awayScore;
            const team = currentThrowSide === "home" ? gameData.homeTeam : gameData.awayTeam;
            const entered = currentRound[field];
            const isOver180 = typeof entered === "number" && entered > 180;
            const preview = typeof entered === "number" && entered > 0 && !isOver180
              ? remaining - entered
              : null;
            const isBust = preview !== null && preview < 0;
            const isCheckout = preview === 0;
            const hint = checkoutHintsEnabled && preview !== null && !isBust && preview > 0 && preview <= 170
              ? CHECKOUT_HINTS[preview]
              : null;
            const canCheckout = minDartsForCheckout(remaining) !== null;
            return (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground text-center font-medium">{team}</p>
                {canCheckout && !isCheckout && !isBust && !isOver180 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5 border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700 dark:hover:bg-green-950/30"
                    onClick={() => {
                      setCurrentRound((prev) => ({ ...prev, [field]: remaining }));
                      setSelectedDarts(null);
                    }}
                  >
                    <Target className="h-3.5 w-3.5" /> Checkout {remaining}
                  </Button>
                )}
                <Input
                  key={currentThrowSide}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={180}
                  placeholder="0"
                  autoFocus
                  className={`text-center text-2xl font-bold h-14 ${isOver180 ? "border-destructive" : isBust ? "border-destructive" : isCheckout ? "border-green-500" : ""}`}
                  value={currentRound[field] ?? ""}
                  onChange={(e) => {
                    const v = e.target.value === "" ? undefined : Number(e.target.value);
                    setCurrentRound((prev) => ({ ...prev, [field]: v }));
                    // Clear a stale dart selection unless the new entry is still a checkout.
                    if (!(typeof v === "number" && remaining - v === 0)) setSelectedDarts(null);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmitRound()}
                />
                {isOver180 && <p className="text-xs text-destructive text-center font-semibold">Max score is 180</p>}
                {!isOver180 && isBust && <p className="text-xs text-destructive text-center font-semibold">Bust!</p>}
                {!isOver180 && isCheckout && (() => {
                  const minDarts = minDartsForCheckout(remaining) ?? 1;
                  const needsSelection = selectedDarts === null || selectedDarts < minDarts;
                  return (
                    <div className="space-y-1.5">
                      <p className="text-xs text-green-600 text-center font-semibold">Checkout! 🎯</p>
                      <div className="flex items-center gap-2 justify-center">
                        <p className={`text-xs font-medium ${needsSelection ? "text-amber-500" : "text-muted-foreground"}`}>
                          {needsSelection ? "Select darts used:" : "Darts used:"}
                        </p>
                        {([1, 2, 3] as const).map((n) => {
                          const disabled = n < minDarts;
                          return (
                            <Button key={n} type="button" size="sm" disabled={disabled}
                              variant={selectedDarts === n ? "default" : "outline"}
                              className={`h-8 w-10 font-bold text-sm ${needsSelection && !disabled ? "border-amber-400" : ""}`}
                              onClick={() => setSelectedDarts(n)}
                            >{n}</Button>
                          );
                        })}
                      </div>
                      {needsSelection && (
                        <p className="text-[10px] text-amber-500 text-center">
                          Darts used is required to finish the leg{minDarts > 1 ? ` — at least ${minDarts} for this checkout` : ""}.
                        </p>
                      )}
                    </div>
                  );
                })()}
                {!isOver180 && !isBust && !isCheckout && preview !== null && (
                  <p className="text-xs text-muted-foreground text-center">
                    Leaves <span className={`font-semibold ${hint ? "text-amber-500" : "text-foreground"}`}>{preview}</span>
                    {hint && <span className="block text-[10px]">{hint}</span>}
                  </p>
                )}
              </div>
            );
          })()}

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={handleSubmitRound}
              disabled={(() => {
                const f = currentThrowSide === "home" ? currentRound.home : currentRound.away;
                const rem = currentThrowSide === "home" ? homeScore : awayScore;
                if (typeof f !== "number" || rem - f !== 0) return false; // not a checkout
                const min = minDartsForCheckout(rem) ?? 1;
                return selectedDarts === null || selectedDarts < min;
              })()}
            >
              {hasPendingThrow ? "Complete round" : "Submit throw"}
            </Button>
            {!hasPendingThrow && (rounds.length > 0 || isSingles) && (
              <Button
                variant="outline"
                size="icon"
                onClick={handleSwitchOrder}
                title={isSingles
                  ? "Switch which side throws first"
                  : "Switch throwing order — re-credit rounds to the next player in the rotation"}
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="outline"
              size="icon"
              onClick={handleUndo}
              disabled={rounds.length === 0 && !hasPendingThrow}
              title={hasPendingThrow ? "Cancel throw" : "Undo last round"}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => { setPendingFinePlayerId(currentThrower?.id ?? null); setShowRoundFineDialog(true); }}
              disabled={!currentThrower?.id}
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
