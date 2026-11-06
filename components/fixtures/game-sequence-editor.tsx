"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../ui/button";
import type { GameSummary } from "../games/game-summary-card";
import { reorderFixtureGames } from "@/server/actions/reorder-fixture-games";

// Lets the scorer set the order games are played in; the monitor follows this order.
export default function GameSequenceEditor({
  fixtureId,
  games,
  onDone,
}: {
  fixtureId: number;
  games: GameSummary[];
  onDone: (saved: boolean) => void;
}) {
  const [order, setOrder] = useState(games);
  const [saving, setSaving] = useState(false);

  const move = (idx: number, dir: -1 | 1) =>
    setOrder((prev) => {
      const next = [...prev];
      [next[idx], next[idx + dir]] = [next[idx + dir], next[idx]];
      return next;
    });

  const save = async () => {
    setSaving(true);
    const res = await reorderFixtureGames({ fixtureId, gameIds: order.map((g) => g.id) });
    setSaving(false);
    if (res?.data?.error || !res?.data?.success) {
      toast.error(res?.data?.error ?? "Failed to save game order");
      return;
    }
    toast.success(res.data.success);
    onDone(true);
  };

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Set the order games are played in. The monitor moves to the next game in this order.</p>
      <div className="space-y-1.5">
        {order.map((g, i) => (
          <div key={g.id} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
            <span className="w-5 text-xs font-semibold text-muted-foreground tabular-nums">{i + 1}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{g.gameType}</p>
              <p className="text-xs text-muted-foreground truncate">
                {g.players.length > 0 ? g.players.map((p) => p.name).join(", ") : "No players set"}
              </p>
            </div>
            <span className="text-xs tabular-nums text-muted-foreground">{g.homeTeamScore}–{g.awayTeamScore}</span>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Move up">
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7" disabled={i === order.length - 1} onClick={() => move(i, 1)} aria-label="Move down">
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={() => onDone(false)} disabled={saving}>Cancel</Button>
        <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save order"}</Button>
      </div>
    </div>
  );
}
