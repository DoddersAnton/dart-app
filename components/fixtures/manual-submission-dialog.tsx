"use client";

import { useState } from "react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { submitManualWeek } from "@/server/actions/submit-manual-week";
import { NO_DIVISION } from "@/lib/league-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Opt = { id: number; name: string };
type Row = {
  key: string;
  teamId: number | null;
  played: string;
  wins: string;
  losses: string;
  legsFor: string;
  legsAgainst: string;
};

const emptyRow = (): Row => ({
  key: Math.random().toString(36).slice(2),
  teamId: null,
  played: "",
  wins: "",
  losses: "",
  legsFor: "",
  legsAgainst: "",
});

export function ManualSubmissionDialog({
  seasons,
  divisions,
  teams,
  defaultSeasonId,
  defaultDivisionId,
}: {
  seasons: Opt[];
  divisions: Opt[];
  teams: Opt[];
  defaultSeasonId: number | null;
  defaultDivisionId: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [seasonId, setSeasonId] = useState<number | null>(defaultSeasonId ?? seasons[0]?.id ?? null);
  const [divisionKey, setDivisionKey] = useState<string>(
    defaultDivisionId != null ? String(defaultDivisionId) : NO_DIVISION,
  );
  const [weekNo, setWeekNo] = useState<string>("");
  const [rows, setRows] = useState<Row[]>([emptyRow(), emptyRow()]);

  const { execute, status } = useAction(submitManualWeek, {
    onSuccess: (res) => {
      if (res.data?.error) toast.error(res.data.error);
      else if (res.data?.success) {
        toast.success(res.data.success);
        setOpen(false);
        setRows([emptyRow(), emptyRow()]);
        setWeekNo("");
        router.refresh();
      }
    },
    onError: () => toast.error("Failed to save submission"),
  });
  const busy = status === "executing";

  const updateRow = (key: string, patch: Partial<Row>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const usedTeamIds = new Set(rows.map((r) => r.teamId).filter((x): x is number => x != null));

  const submit = () => {
    if (seasonId == null) return toast.error("Pick a season");
    const wk = Number(weekNo);
    if (!Number.isInteger(wk) || wk < 1) return toast.error("Enter a valid week number");

    const filled = rows.filter((r) => r.teamId != null);
    if (filled.length === 0) return toast.error("Add at least one team");

    const num = (v: string) => (v.trim() === "" ? 0 : Number(v));
    const entries = filled.map((r) => ({
      teamId: r.teamId!,
      played: num(r.played),
      wins: num(r.wins),
      losses: num(r.losses),
      draws: Math.max(0, num(r.played) - num(r.wins) - num(r.losses)),
      legsFor: num(r.legsFor),
      legsAgainst: num(r.legsAgainst),
    }));

    for (const e of entries) {
      if ([e.played, e.wins, e.losses, e.legsFor, e.legsAgainst].some((n) => !Number.isFinite(n) || n < 0)) {
        return toast.error("All values must be 0 or more");
      }
      if (e.wins + e.losses > e.played) {
        return toast.error("Wins + losses can't exceed games played");
      }
    }

    execute({
      seasonId,
      divisionId: divisionKey === NO_DIVISION ? null : Number(divisionKey),
      weekNo: wk,
      entries,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Add manual submission
      </Button>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manual league submission</DialogTitle>
          <DialogDescription>
            Enter a week&apos;s standings by hand. Points are set to legs won; ranks and movement are computed automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Season</label>
            <Select value={seasonId != null ? String(seasonId) : ""} onValueChange={(v) => setSeasonId(Number(v))}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Season" /></SelectTrigger>
              <SelectContent>
                {seasons.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Division</label>
              <Select value={divisionKey} onValueChange={setDivisionKey}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Division" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_DIVISION}>No division</SelectItem>
                  {divisions.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Week</label>
              <Input type="number" inputMode="numeric" min={1} value={weekNo} onChange={(e) => setWeekNo(e.target.value)} placeholder="e.g. 5" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          {/* Column labels */}
          <div className="grid grid-cols-[1fr_repeat(5,44px)_24px] gap-1.5 px-1 text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
            <span>Team</span>
            <span className="text-center" title="Played">P</span>
            <span className="text-center" title="Wins">W</span>
            <span className="text-center" title="Losses">L</span>
            <span className="text-center" title="Legs for">F</span>
            <span className="text-center" title="Legs against">A</span>
            <span />
          </div>
          {rows.map((r) => (
            <div key={r.key} className="grid grid-cols-[1fr_repeat(5,44px)_24px] gap-1.5 items-center">
              <Select
                value={r.teamId != null ? String(r.teamId) : ""}
                onValueChange={(v) => updateRow(r.key, { teamId: Number(v) })}
              >
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Team" /></SelectTrigger>
                <SelectContent>
                  {teams
                    .filter((t) => t.id === r.teamId || !usedTeamIds.has(t.id))
                    .map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {(["played", "wins", "losses", "legsFor", "legsAgainst"] as const).map((f) => (
                <Input
                  key={f}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  className="h-8 px-1 text-center text-xs"
                  value={r[f]}
                  onChange={(e) => updateRow(r.key, { [f]: e.target.value })}
                />
              ))}
              <button
                onClick={() => setRows((prev) => (prev.length > 1 ? prev.filter((x) => x.key !== r.key) : prev))}
                className="text-muted-foreground hover:text-destructive flex justify-center"
                title="Remove"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <Button variant="outline" size="sm" className="gap-1.5 w-full" onClick={() => setRows((prev) => [...prev, emptyRow()])}>
            <Plus className="h-3.5 w-3.5" /> Add team
          </Button>
        </div>

        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
          <Button size="sm" onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save submission"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
