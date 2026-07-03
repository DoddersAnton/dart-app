"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  TouchSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CalendarIcon, Plus, X, AlertTriangle, GripVertical, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createWeekFixtures } from "@/server/actions/create-week-fixtures";

type Team = { id: number; name: string; hasLocation: boolean };
type Row = { home: number | null; away: number | null; date: string | null };

function TeamChip({ team, warn, active }: { team: Team; warn?: boolean; active?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `team:${team.id}` });
  const style = { transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.4 : 1 };
  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(
        "flex items-center gap-1 rounded-md border bg-card px-2 py-1 text-xs font-medium touch-none cursor-grab active:cursor-grabbing",
        warn && "border-amber-400 text-amber-600",
        active && "border-amber-400 ring-1 ring-amber-300",
      )}
      title={warn ? `${team.name} has no default location` : team.name}
    >
      {active && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
      <GripVertical className="h-3 w-3 text-muted-foreground shrink-0" />
      {team.name}
      {warn && <AlertTriangle className="h-3 w-3 shrink-0" />}
    </button>
  );
}

function Slot({ id, team, warn, active }: { id: string; team: Team | null; warn?: boolean; active?: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-9 flex items-center rounded-md border border-dashed px-1.5 py-1",
        isOver && "border-primary bg-primary/5",
        !team && "justify-center",
      )}
    >
      {team ? <TeamChip team={team} warn={warn} active={active} /> : <span className="text-[11px] text-muted-foreground">Drop team</span>}
    </div>
  );
}

export function WeekBuilder({
  seasonId,
  seasonName,
  teams,
  divisions,
  defaultDivisionId,
  defaultLeague,
  defaultDate,
  activeTeamId,
}: {
  seasonId: number;
  seasonName: string;
  teams: Team[];
  divisions: { id: number; name: string; nextWeekNo: number }[];
  defaultDivisionId: number | null;
  defaultLeague: string;
  defaultDate: string;
  activeTeamId?: number | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const divisionNextWeek = (id: number | null) => divisions.find((d) => d.id === id)?.nextWeekNo ?? 1;
  const [divisionId, setDivisionId] = useState<number | null>(defaultDivisionId);
  const [weekNo, setWeekNo] = useState(divisionNextWeek(defaultDivisionId));
  // League isn't shown on the form — carried through from the season's existing fixtures.
  const league = defaultLeague;

  // Switching division resets the week to that division's next week.
  const onDivisionChange = (id: number | null) => {
    setDivisionId(id);
    setWeekNo(divisionNextWeek(id));
  };
  const [matchDate, setMatchDate] = useState<Date | undefined>(defaultDate ? new Date(defaultDate) : undefined);
  const [rows, setRows] = useState<Row[]>(() =>
    Array.from({ length: Math.max(1, Math.floor(teams.length / 2)) }, () => ({ home: null, away: null, date: null })),
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } }),
  );

  const teamById = useMemo(() => new Map(teams.map((t) => [t.id, t])), [teams]);
  const placedIds = useMemo(
    () => new Set(rows.flatMap((r) => [r.home, r.away]).filter((x): x is number => x != null)),
    [rows],
  );
  const pool = teams.filter((t) => !placedIds.has(t.id));

  // Complete rows whose home team has no default location can't be scheduled.
  const badHomeTeams = rows
    .filter((r) => r.home != null && r.away != null)
    .map((r) => teamById.get(r.home!))
    .filter((t): t is Team => !!t && !t.hasLocation);

  const placeTeam = (teamId: number, target: { type: "pool" } | { type: "slot"; row: number; side: "home" | "away" }) => {
    setRows((prev) => {
      const cleared = prev.map((r) => ({
        ...r,
        home: r.home === teamId ? null : r.home,
        away: r.away === teamId ? null : r.away,
      }));
      if (target.type === "slot") cleared[target.row] = { ...cleared[target.row], [target.side]: teamId };
      return cleared;
    });
  };

  const setRowDate = (i: number, date: string) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, date: date || null } : r)));

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over) return;
    const teamId = Number(String(active.id).split(":")[1]);
    const overId = String(over.id);
    if (overId === "pool") return placeTeam(teamId, { type: "pool" });
    if (overId.startsWith("slot:")) {
      const [, rowStr, side] = overId.split(":");
      placeTeam(teamId, { type: "slot", row: Number(rowStr), side: side as "home" | "away" });
    }
  };

  const addRow = () => setRows((prev) => [...prev, { home: null, away: null, date: null }]);
  const removeRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  const reset = () => {
    setRows(Array.from({ length: Math.max(1, Math.floor(teams.length / 2)) }, () => ({ home: null, away: null, date: null })));
    setWeekNo(divisionNextWeek(divisionId));
  };

  const handleCreate = async () => {
    if (!matchDate) return toast.error("Pick a match date");
    const pairings = rows
      .filter((r) => r.home != null && r.away != null)
      .map((r) => ({
        homeTeamId: r.home!,
        awayTeamId: r.away!,
        matchDate: r.date ? new Date(r.date).toISOString() : undefined,
      }));
    if (pairings.length === 0) return toast.error("Pair at least one matchup");
    if (badHomeTeams.length > 0) return toast.error(`Set a default location for: ${badHomeTeams.map((t) => t.name).join(", ")}`);

    setSaving(true);
    const res = await createWeekFixtures({
      seasonId,
      league: league.trim(),
      divisionId,
      weekNo,
      matchDate: matchDate.toISOString(),
      pairings,
    });
    setSaving(false);
    if ("error" in res) return toast.error(res.error);
    toast.success(res.success);
    setOpen(false);
    reset();
    router.refresh();
  };

  const PoolDrop = () => {
    const { setNodeRef, isOver } = useDroppable({ id: "pool" });
    return (
      <div
        ref={setNodeRef}
        className={cn("flex flex-wrap gap-1.5 rounded-md border p-2 min-h-[3rem]", isOver && "border-primary bg-primary/5")}
      >
        {pool.length === 0 ? (
          <span className="text-xs text-muted-foreground">All teams placed</span>
        ) : (
          pool.map((t) => <TeamChip key={t.id} team={t} warn={!t.hasLocation} active={t.id === activeTeamId} />)
        )}
      </div>
    );
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="gap-1.5">
        <Plus className="h-4 w-4" /> Add week
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Add week to {seasonName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Week meta */}
        <div className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Week</label>
            <Input
              type="number"
              min={1}
              value={weekNo}
              onChange={(e) => setWeekNo(Math.max(1, Number(e.target.value) || 1))}
              className="h-9 w-20"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Match date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("h-9 w-[200px] justify-start text-left font-normal", !matchDate && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {matchDate ? format(matchDate, "EEE d MMM yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar mode="single" selected={matchDate} onSelect={setMatchDate} autoFocus />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-1 flex-1 min-w-[140px]">
            <label className="text-xs text-muted-foreground">Division</label>
            <Select value={divisionId != null ? String(divisionId) : "none"} onValueChange={(v) => onDivisionChange(v === "none" ? null : Number(v))}>
              <SelectTrigger className="h-9 w-full"><SelectValue placeholder="Division" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {divisions.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DndContext sensors={sensors} onDragEnd={onDragEnd}>
          {/* Team pool */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Teams (drag into a matchup · leftover = bye)</p>
            <PoolDrop />
          </div>

          {/* Matchup rows */}
          <div className="space-y-2">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground px-1">Home · vs · Away · date</p>
            {rows.map((row, i) => {
              const home = row.home != null ? teamById.get(row.home) ?? null : null;
              const away = row.away != null ? teamById.get(row.away) ?? null : null;
              return (
                <div key={i} className="flex flex-wrap items-center gap-2">
                  <div className="flex-1 min-w-[120px]">
                    <Slot id={`slot:${i}:home`} team={home} warn={home != null && !home.hasLocation} active={home?.id === activeTeamId} />
                  </div>
                  <span className="text-xs text-muted-foreground">vs</span>
                  <div className="flex-1 min-w-[120px]">
                    <Slot id={`slot:${i}:away`} team={away} active={away?.id === activeTeamId} />
                  </div>
                  <input
                    type="date"
                    value={row.date ?? (matchDate ? format(matchDate, "yyyy-MM-dd") : "")}
                    onChange={(e) => setRowDate(i, e.target.value)}
                    className="h-9 rounded-md border bg-transparent px-2 text-xs"
                    title="Match date for this fixture"
                  />
                  <button
                    onClick={() => removeRow(i)}
                    disabled={rows.length <= 1}
                    className="text-muted-foreground hover:text-destructive disabled:opacity-30"
                    title="Remove matchup"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </DndContext>

        <Button variant="outline" size="sm" className="gap-1.5" onClick={addRow}>
          <Plus className="h-3.5 w-3.5" /> Add matchup
        </Button>

        {badHomeTeams.length > 0 && (
          <p className="text-xs text-amber-600 flex items-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" /> No default location for: {badHomeTeams.map((t) => t.name).join(", ")} (home venue needed).
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
          <Button onClick={handleCreate} disabled={saving}>{saving ? "Creating…" : "Create week"}</Button>
        </div>
      </CardContent>
    </Card>
  );
}
