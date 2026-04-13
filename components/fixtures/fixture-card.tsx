"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock,
  MapPin,
  MoreHorizontal,
  Pencil,
  TrophyIcon,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { useAction } from "next-safe-action/hooks";
import { getGamesByFixture } from "@/server/actions/get-games-by-fixture";
import { deleteGame } from "@/server/actions/delete-game";
import { updateFixtureNotes } from "@/server/actions/update-fixture-notes";
import { updateFixtureStatus } from "@/server/actions/update-fixture-status";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";
import { Textarea } from "../ui/textarea";
import GameFormPopup from "./add-game-popup";
import GamesSummaryCard, { GameSummary } from "../games/game-summary-card";

type AvailabilityRecord = {
  attending: boolean | null;
  note: string | null;
  playerId: number;
  playerName: string;
  playerNickname: string | null;
  playerImgUrl: string | null;
};

type Fixture = {
  id: number;
  matchLocation: string;
  locationAddress: string | null;
  locationMapsLink: string | null;
  matchDate: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  matchStatus: string;
  createdAt: string | null;
  league: string;
  season: string;
  isAppTeamWin: boolean;
  notes?: string | null;
};

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

function PlayerAvatar({ player }: { player: { playerName: string; playerImgUrl: string | null } }) {
  return (
    <div className="flex flex-col items-center gap-1">
      {player.playerImgUrl ? (
        <Image
          src={player.playerImgUrl}
          alt={player.playerName}
          width={36}
          height={36}
          unoptimized
          className="h-9 w-9 rounded-full object-cover border"
        />
      ) : (
        <div className="h-9 w-9 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold">
          {getInitials(player.playerName)}
        </div>
      )}
      <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[52px] truncate">
        {player.playerName.split(" ")[0]}
      </span>
    </div>
  );
}

function useGamesByFixture(fixtureId: number) {
  const [games, setGames] = useState<GameSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGames = async () => {
    setLoading(true);
    try {
      const response = await getGamesByFixture(fixtureId);
      if (response.error) {
        setError(response.error);
      } else {
        const data = response.success;
        setGames(Array.isArray(data) ? data : data ? [data] : []);
      }
    } catch (err) {
      setError(`Failed to fetch games. ${err}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchGames(); }, [fixtureId]);

  return { games, loading, error, fetchGames };
}

export default function FixtureCard({
  fixtureData,
  availability,
  linkedPlayerId,
}: {
  fixtureData: Fixture;
  availability: AvailabilityRecord[];
  linkedPlayerId?: number | null;
}) {
  const { games, loading, error, fetchGames } = useGamesByFixture(fixtureData.id);

  const [notesOpen, setNotesOpen] = useState(!!(fixtureData.notes));
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(fixtureData.notes ?? "");
  const [savingNotes, setSavingNotes] = useState(false);
  const [currentStatus, setCurrentStatus] = useState(fixtureData.matchStatus);

  const { execute: executeStatusUpdate, status: statusUpdateStatus } = useAction(updateFixtureStatus, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      else if (data.data?.success) {
        toast.success(data.data.success);
        setCurrentStatus("in progress");
      }
    },
  });

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    const res = await updateFixtureNotes({ id: fixtureData.id, notes: notesValue || null });
    setSavingNotes(false);
    if (res?.data?.error) {
      toast.error(res.data.error);
    } else {
      toast.success("Notes saved");
      setEditingNotes(false);
    }
  };

  const handleDeleteGame = async ({ id }: { id: number }) => {
    try {
      const response = await deleteGame({ id });
      if (response?.data?.error) {
        toast.error(`Failed to delete game. ${response?.data?.error}`);
      } else {
        toast.success("Game deleted");
        fetchGames();
      }
    } catch (err) {
      toast.error(`Failed to delete game. ${err}`);
    }
  };

  const isInProgress = currentStatus === "in progress";
  const isCancelled = currentStatus === "cancelled";
  const isScheduled = !isInProgress && !isCancelled && (currentStatus === "scheduled" ||
    (fixtureData.matchDate ? new Date(fixtureData.matchDate) > new Date() : false));

  const going = availability.filter((r) => r.attending === true);
  const notGoing = availability.filter((r) => r.attending === false);
  const pending = availability.filter((r) => r.attending === null);

  const matchDate = fixtureData.matchDate ? new Date(fixtureData.matchDate) : null;

  // Result badge
  const statusBadge = isInProgress ? (
    <span className="flex items-center gap-1.5">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="text-xs font-medium text-red-500">In Progress</span>
    </span>
  ) : isCancelled ? (
    fixtureData.isAppTeamWin
      ? <Badge variant="outline" className="text-green-600 border-green-500">Cancelled (win)</Badge>
      : <Badge variant="outline" className="text-destructive border-destructive">Cancelled (lost)</Badge>
  ) : isScheduled ? (
    <Badge variant="outline" className="text-amber-500 border-amber-400">Scheduled</Badge>
  ) : fixtureData.isAppTeamWin ? (
    <Badge className="bg-green-600 hover:bg-green-700">Win</Badge>
  ) : fixtureData.homeTeamScore === fixtureData.awayTeamScore ? (
    <Badge variant="secondary">Draw</Badge>
  ) : (
    <Badge variant="destructive">Loss</Badge>
  );

  return (
    <div className="space-y-6">

      {/* Header card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{fixtureData.season} · {fixtureData.league}</p>
              <CardTitle className="text-xl">{fixtureData.homeTeam} vs {fixtureData.awayTeam}</CardTitle>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {statusBadge}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    disabled={currentStatus !== "scheduled" || statusUpdateStatus === "executing"}
                    onClick={() => executeStatusUpdate({ id: fixtureData.id, status: "in progress" })}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <span className="h-2 w-2 rounded-full bg-red-500" /> Start Match
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/fixtures/edit-fixture?id=${fixtureData.id}`} className="flex items-center gap-2 cursor-pointer">
                      <Pencil className="h-4 w-4" /> Edit Match
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Score */}
          {!isScheduled && (
            <div className="flex items-center justify-center gap-6 py-3 rounded-lg bg-muted/50">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{fixtureData.homeTeam}</p>
                <p className="text-4xl font-extrabold">{fixtureData.homeTeamScore}</p>
              </div>
              <p className="text-2xl font-light text-muted-foreground">–</p>
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">{fixtureData.awayTeam}</p>
                <p className="text-4xl font-extrabold">{fixtureData.awayTeamScore}</p>
              </div>
            </div>
          )}

          {/* Meta */}
          <div className="flex flex-col gap-2 text-sm">
            {matchDate && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="h-4 w-4 shrink-0" />
                <span>{format(matchDate, "EEEE d MMMM yyyy · HH:mm")}</span>
              </div>
            )}
            {fixtureData.matchLocation && (
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span>{fixtureData.matchLocation}</span>
                  {fixtureData.locationAddress && (
                    <p className="text-xs">{fixtureData.locationAddress}</p>
                  )}
                </div>
              </div>
            )}
          
          </div>

          {/* Maps embed */}
          {fixtureData.locationMapsLink && (
            <div
              className="w-full h-48 rounded-lg overflow-hidden border [&>iframe]:w-full [&>iframe]:h-full"
              dangerouslySetInnerHTML={{ __html: fixtureData.locationMapsLink }}
            />
          )}
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader className="pb-2">
          <button
            className="flex items-center justify-between w-full text-left"
            onClick={() => setNotesOpen((v) => !v)}
          >
            <CardTitle className="text-base">Notes</CardTitle>
            <div className="flex items-center gap-2">
              {!editingNotes && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={(e) => { e.stopPropagation(); setNotesOpen(true); setEditingNotes(true); }}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
              )}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${notesOpen ? "rotate-180" : ""}`} />
            </div>
          </button>
        </CardHeader>
        {notesOpen && (
          <CardContent className="pt-0">
            {editingNotes ? (
              <div className="space-y-2">
                <Textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Add match notes..."
                  className="min-h-[80px] text-sm"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" size="sm" onClick={() => { setEditingNotes(false); setNotesValue(fixtureData.notes ?? ""); }}>
                    Cancel
                  </Button>
                  <Button size="sm" disabled={savingNotes} onClick={handleSaveNotes}>
                    {savingNotes ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            ) : notesValue ? (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{notesValue}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No notes added.</p>
            )}
          </CardContent>
        )}
      </Card>

      {/* Availability */}
      {availability.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Availability</CardTitle>
              {linkedPlayerId && (
                <Link href={`/player/${linkedPlayerId}/availability`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs">My availability</Button>
                </Link>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Going */}
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-semibold text-green-600">Going ({going.length})</span>
              </div>
              {going.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {going.map((r) => <PlayerAvatar key={r.playerId} player={r} />)}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No one confirmed yet</p>
              )}
            </div>

            <Separator />

            {/* Not going */}
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle className="h-3.5 w-3.5 text-destructive" />
                <span className="text-xs font-semibold text-destructive">Not going ({notGoing.length})</span>
              </div>
              {notGoing.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {notGoing.map((r) => (
                    <Badge key={r.playerId} variant="outline" className="text-xs text-muted-foreground">
                      {r.playerName}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">None</p>
              )}
            </div>

            <Separator />

            {/* Pending */}
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-amber-500">Awaiting response ({pending.length})</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Games */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Games</CardTitle>
            <GameFormPopup fixtureId={fixtureData.id} onGameAdded={fetchGames} />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-20 w-full rounded-lg" />
            </div>
          ) : error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : games.length > 0 ? (
            <div className="space-y-3">
              {games.map((game) => (
                <GamesSummaryCard key={game.id} gameSummary={game} handleDeleteGame={handleDeleteGame} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center space-y-3">
              <TrophyIcon className="h-8 w-8 mx-auto text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No games recorded yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
