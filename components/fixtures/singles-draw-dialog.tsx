"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Shuffle, Swords } from "lucide-react";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { getFixture } from "@/server/actions/get-fixture";
import { getTeamPlayers, type TeamPlayer } from "@/server/actions/get-team-players";
import { createSinglesDraw } from "@/server/actions/create-singles-draw";

const PLAYERS_PER_SIDE = 4;

type Side = "home" | "away";
// A drawn player: an app player (id) or a free-text opponent name.
type DrawPlayer = { id?: number; name: string };
type Pairing = { home: DrawPlayer; away: DrawPlayer };

function shuffle<T>(list: T[]): T[] {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function SinglesDrawDialog({
  fixtureId,
  goingPlayerIds,
  onApplied,
}: {
  fixtureId: number;
  goingPlayerIds: number[];
  onApplied: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"pick" | "draw">("pick");
  const [teamNames, setTeamNames] = useState<Record<Side, string>>({ home: "Home", away: "Away" });
  const [rosters, setRosters] = useState<Record<Side, TeamPlayer[]>>({ home: [], away: [] });
  const [picked, setPicked] = useState<Record<Side, number[]>>({ home: [], away: [] });
  const [freeText, setFreeText] = useState<Record<Side, string[]>>({
    home: Array(PLAYERS_PER_SIDE).fill(""),
    away: Array(PLAYERS_PER_SIDE).fill(""),
  });
  const [pairings, setPairings] = useState<Pairing[]>([]);
  const [drawKey, setDrawKey] = useState(0);

  // A side with no app players is entered as free-text names (non-app opponent).
  const isFreeText = (side: Side) => rosters[side].length === 0;

  const { execute, status } = useAction(createSinglesDraw, {
    onSuccess: ({ data }) => {
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (data?.gameIds) seedFreeTextOpponents(data.gameIds);
      toast.success(data?.success ?? "Singles games created");
      setOpen(false);
      onApplied();
    },
    onError: () => toast.error("Failed to create singles games"),
  });

  // Pre-fill the dart tracker's free-text opponent for each game so the drawn
  // opponent's name shows up without retyping it.
  const seedFreeTextOpponents = (gameIds: number[]) => {
    const freeSide: Side | null = isFreeText("away") ? "away" : isFreeText("home") ? "home" : null;
    if (!freeSide) return;
    gameIds.forEach((gameId, i) => {
      const opponent = pairings[i]?.[freeSide];
      if (!opponent) return;
      try {
        localStorage.setItem(
          `opposing-players-${gameId}`,
          JSON.stringify([{ id: crypto.randomUUID(), name: opponent.name }])
        );
      } catch {}
    });
  };

  const loadRosters = async () => {
    setLoading(true);
    const res = await getFixture(fixtureId);
    if (res.success) {
      const f = res.success;
      const [home, away] = await Promise.all([
        f.homeTeamId ? getTeamPlayers(f.homeTeamId) : Promise.resolve([]),
        f.awayTeamId ? getTeamPlayers(f.awayTeamId) : Promise.resolve([]),
      ]);
      // Players marked as going come first.
      const byGoing = (a: TeamPlayer, b: TeamPlayer) =>
        Number(goingPlayerIds.includes(b.id)) - Number(goingPlayerIds.includes(a.id)) || a.name.localeCompare(b.name);
      setTeamNames({ home: f.homeTeam ?? "Home", away: f.awayTeam ?? "Away" });
      setRosters({ home: [...home].sort(byGoing), away: [...away].sort(byGoing) });
    } else {
      toast.error("Couldn't load the fixture's teams");
    }
    setLoading(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setStep("pick");
      setPicked({ home: [], away: [] });
      setFreeText({ home: Array(PLAYERS_PER_SIDE).fill(""), away: Array(PLAYERS_PER_SIDE).fill("") });
      setPairings([]);
      loadRosters();
    }
  };

  const togglePick = (side: Side, id: number) =>
    setPicked((prev) => {
      const current = prev[side];
      if (current.includes(id)) return { ...prev, [side]: current.filter((p) => p !== id) };
      if (current.length >= PLAYERS_PER_SIDE) return prev;
      return { ...prev, [side]: [...current, id] };
    });

  const lineup = (side: Side): DrawPlayer[] =>
    isFreeText(side)
      ? freeText[side].map((n) => n.trim()).filter(Boolean).map((name) => ({ name }))
      : picked[side].map((id) => ({ id, name: rosters[side].find((p) => p.id === id)?.name ?? "Unknown" }));

  const sideReady = (side: Side) => lineup(side).length === PLAYERS_PER_SIDE;
  const canDraw = sideReady("home") && sideReady("away") && !(isFreeText("home") && isFreeText("away"));

  const draw = () => {
    const home = shuffle(lineup("home"));
    const away = shuffle(lineup("away"));
    setPairings(home.map((h, i) => ({ home: h, away: away[i] })));
    setDrawKey((k) => k + 1);
    setStep("draw");
  };

  const apply = () =>
    execute({
      fixtureId,
      matches: pairings.map((p) => ({ homePlayerId: p.home.id, awayPlayerId: p.away.id })),
    });

  const renderSidePicker = (side: Side) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold truncate">{teamNames[side]}</p>
        <span className={`text-xs tabular-nums ${sideReady(side) ? "text-primary font-semibold" : "text-muted-foreground"}`}>
          {lineup(side).length}/{PLAYERS_PER_SIDE}
        </span>
      </div>
      {isFreeText(side) ? (
        <div className="space-y-1.5">
          <p className="text-[11px] text-muted-foreground">No app players for this team — enter names.</p>
          {freeText[side].map((value, i) => (
            <Input
              key={i}
              value={value}
              placeholder={`Player ${i + 1}`}
              className="h-8 text-sm"
              onChange={(e) =>
                setFreeText((prev) => ({ ...prev, [side]: prev[side].map((v, j) => (j === i ? e.target.value : v)) }))
              }
            />
          ))}
        </div>
      ) : (
        <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
          {rosters[side].map((p) => {
            const selected = picked[side].includes(p.id);
            const full = !selected && picked[side].length >= PLAYERS_PER_SIDE;
            return (
              <button
                key={p.id}
                type="button"
                disabled={full}
                onClick={() => togglePick(side, p.id)}
                className={`flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-sm transition-colors ${
                  selected ? "border-primary bg-primary/10" : "hover:bg-muted"
                } ${full ? "opacity-40" : ""}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                    selected ? "border-primary bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {selected && <Check className="h-3 w-3" />}
                </span>
                <span className="flex-1 truncate">{p.name}</span>
                {goingPlayerIds.includes(p.id) && (
                  <Badge variant="outline" className="h-5 border-green-500 px-1.5 text-[10px] text-green-600">
                    Going
                  </Badge>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Shuffle className="h-4 w-4" /> Draw singles
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{step === "pick" ? "Pick the singles players" : "The draw"}</DialogTitle>
          <DialogDescription>
            {step === "pick"
              ? `Choose ${PLAYERS_PER_SIDE} players from each team, then draw who plays who.`
              : "Matches are created in this order. Redraw if you need to."}
          </DialogDescription>
        </DialogHeader>

        {step === "pick" ? (
          loading ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Loading players…</p>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2">
              {renderSidePicker("home")}
              {renderSidePicker("away")}
            </div>
          )
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {pairings.map((p, i) => (
                <motion.div
                  key={`${drawKey}-${i}`}
                  initial={{ opacity: 0, rotateX: -90, y: -8 }}
                  animate={{ opacity: 1, rotateX: 0, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.25 }}
                  className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2.5"
                >
                  <span className="w-5 shrink-0 text-xs font-semibold text-muted-foreground">{i + 1}</span>
                  <span className="flex-1 truncate text-right text-sm font-medium">{p.home.name}</span>
                  <Swords className="h-4 w-4 shrink-0 text-primary" />
                  <span className="flex-1 truncate text-sm font-medium">{p.away.name}</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-2">
          {step === "pick" ? (
            <Button onClick={draw} disabled={!canDraw} className="gap-1.5">
              <Shuffle className="h-4 w-4" /> Draw matches
            </Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setStep("pick")} disabled={status === "executing"}>
                Back
              </Button>
              <Button variant="outline" onClick={draw} disabled={status === "executing"} className="gap-1.5">
                <Shuffle className="h-4 w-4" /> Redraw
              </Button>
              <Button onClick={apply} disabled={status === "executing"}>
                {status === "executing" ? "Creating…" : "Apply"}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
