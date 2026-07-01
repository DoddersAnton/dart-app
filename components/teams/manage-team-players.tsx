"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { UserPlus, UserIcon, UserRoundPlus, Plus, X } from "lucide-react";

import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { MultiSelect } from "../ui/multi-select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { getPlayers } from "@/server/actions/get-players";
import { addPlayerToTeam } from "@/server/actions/add-player-to-team";
import { removePlayerFromTeam } from "@/server/actions/remove-player-from-team";
import { quickAddTeamPlayers } from "@/server/actions/quick-add-team-players";

type QuickRow = { name: string; nickname: string };
const emptyRows = (): QuickRow[] => [
  { name: "", nickname: "" },
  { name: "", nickname: "" },
  { name: "", nickname: "" },
];

export type TeamMember = { id: number; name: string; nickname: string | null };

export default function ManageTeamPlayers({
  teamId,
  teamName,
  players,
}: {
  teamId: number;
  teamName: string;
  players: TeamMember[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [options, setOptions] = useState<{ value: string; label: string }[]>([]);
  const [selected, setSelected] = useState<number[]>([]);

  const [quickOpen, setQuickOpen] = useState(false);
  const [quickSaving, setQuickSaving] = useState(false);
  const [rows, setRows] = useState<QuickRow[]>(emptyRows());

  const memberIds = new Set(players.map((p) => p.id));

  const updateRow = (i: number, field: keyof QuickRow, val: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
  const addRow = () => setRows((prev) => [...prev, { name: "", nickname: "" }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const handleQuickOpenChange = (next: boolean) => {
    setQuickOpen(next);
    if (!next) setRows(emptyRows());
  };

  const handleQuickAdd = async () => {
    const filled = rows.filter((r) => r.name.trim().length > 0);
    if (filled.length === 0) {
      toast.error("Add at least one player name");
      return;
    }
    setQuickSaving(true);
    const res = await quickAddTeamPlayers({ teamId, players: filled });
    setQuickSaving(false);
    if ("error" in res) toast.error(res.error);
    else {
      toast.success(res.success);
      handleQuickOpenChange(false);
      router.refresh();
    }
  };

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (!next) {
      setSelected([]);
      return;
    }
    setLoading(true);
    try {
      const all = await getPlayers();
      const available = Array.isArray(all) ? all.filter((p) => !memberIds.has(p.id)) : [];
      setOptions(
        available.map((p) => ({
          value: String(p.id),
          label: p.name + (p.nickname ? ` (${p.nickname})` : ""),
        })),
      );
    } catch {
      toast.error("Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (selected.length === 0) {
      toast.error("Select at least one player");
      return;
    }
    setSaving(true);
    const results = await Promise.all(selected.map((playerId) => addPlayerToTeam({ playerId, teamId })));
    setSaving(false);

    const added = results.filter((r) => "success" in r).length;
    const failed = results.find((r) => "error" in r) as { error: string } | undefined;
    if (added > 0) toast.success(`Added ${added} player${added !== 1 ? "s" : ""} to ${teamName}`);
    if (failed && added === 0) toast.error(failed.error);

    setOpen(false);
    setSelected([]);
    router.refresh();
  };

  const handleRemove = async (playerId: number) => {
    setRemovingId(playerId);
    const res = await removePlayerFromTeam({ playerId, teamId });
    setRemovingId(null);
    if ("error" in res) toast.error(res.error);
    else {
      toast.success(res.success);
      router.refresh();
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Players ({players.length})
        </p>
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" className="h-7 flex-1 sm:flex-none gap-1.5 text-xs" onClick={() => setQuickOpen(true)}>
            <UserRoundPlus className="h-3.5 w-3.5" /> Quick add
          </Button>
          <Button variant="outline" size="sm" className="h-7 flex-1 sm:flex-none gap-1.5 text-xs" onClick={() => handleOpenChange(true)}>
            <UserPlus className="h-3.5 w-3.5" /> Add
          </Button>
        </div>
      </div>

      {players.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No players on this team yet.</p>
      ) : (
        <ul className="space-y-1">
          {players.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2 py-1">
              <span className="text-sm truncate">
                {p.name}
                {p.nickname && <span className="text-xs text-muted-foreground ml-1">({p.nickname})</span>}
              </span>
              <button
                onClick={() => handleRemove(p.id)}
                disabled={removingId === p.id}
                className="text-muted-foreground hover:text-destructive shrink-0 disabled:opacity-40"
                title={`Remove ${p.name} from ${teamName}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Add players to {teamName}</DialogTitle>
            <DialogDescription>Search existing players and add them to this team.</DialogDescription>
          </DialogHeader>

          {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading players…</p>
          ) : options.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">All players are already on this team.</p>
          ) : (
            <MultiSelect
              options={options.map((o) => ({ ...o, icon: UserIcon }))}
              onValueChange={(values) => setSelected(values.map((v) => parseInt(v, 10)))}
              placeholder="Search players"
              variant="inverted"
              animation={0}
              maxCount={4}
            />
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleAdd} disabled={saving || loading || selected.length === 0}>
              {saving ? "Adding…" : "Add to team"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Quick add — create new players in bulk */}
      <Dialog open={quickOpen} onOpenChange={handleQuickOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Quick add players to {teamName}</DialogTitle>
            <DialogDescription>New players are created and added to this team.</DialogDescription>
          </DialogHeader>

          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 px-1 text-[10px] uppercase tracking-wide text-muted-foreground">
              <span>Name</span>
              <span>Nickname</span>
              <span />
            </div>
            {rows.map((r, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2 items-center">
                <Input value={r.name} onChange={(e) => updateRow(i, "name", e.target.value)} placeholder="Name" className="h-8" />
                <Input value={r.nickname} onChange={(e) => updateRow(i, "nickname", e.target.value)} placeholder="Nickname" className="h-8" />
                <button
                  onClick={() => removeRow(i)}
                  disabled={rows.length <= 1}
                  className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                  title="Remove row"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full gap-1.5" onClick={addRow}>
            <Plus className="h-3.5 w-3.5" /> Add row
          </Button>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleQuickOpenChange(false)} disabled={quickSaving}>
              Cancel
            </Button>
            <Button onClick={handleQuickAdd} disabled={quickSaving}>
              {quickSaving ? "Adding…" : "Create & add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
