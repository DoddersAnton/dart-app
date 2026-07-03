"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { Star, Pencil } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateFixtureSchedule } from "@/server/actions/update-fixture-schedule";

const STATUSES = [
  { value: "scheduled", label: "Scheduled" },
  { value: "in progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

function StatusBadge({ status }: { status: string }) {
  const s = (status ?? "").toLowerCase();
  if (s === "scheduled") return <Badge variant="outline" className="text-amber-500 border-amber-400 text-[10px] shrink-0">Scheduled</Badge>;
  if (s === "in progress") return <Badge className="bg-red-600 hover:bg-red-600 text-[10px] shrink-0">In progress</Badge>;
  if (s === "cancelled") return <Badge variant="outline" className="text-destructive border-destructive text-[10px] shrink-0">Cancelled</Badge>;
  return <Badge variant="secondary" className="text-[10px] shrink-0 capitalize">{status || "Played"}</Badge>;
}

function TeamName({ name, active }: { name: string; active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1 min-w-0">
      {active && <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />}
      <span className="truncate">{name}</span>
    </span>
  );
}

export type ScheduleFixture = {
  fixtureId: number;
  homeName: string;
  awayName: string;
  homeActive: boolean;
  awayActive: boolean;
  homeTeamScore: number;
  awayTeamScore: number;
  matchStatus: string;
  matchDate: string;
  weekNo: number | null;
  divisionId: number | null;
};

export function ScheduleFixtureRow({
  fixture,
  canManage,
  divisions = [],
}: {
  fixture: ScheduleFixture;
  canManage: boolean;
  divisions?: { id: number; name: string }[];
}) {
  const router = useRouter();
  const scheduled = (fixture.matchStatus ?? "").toLowerCase() === "scheduled";

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [week, setWeek] = useState(fixture.weekNo != null ? String(fixture.weekNo) : "");
  const [hs, setHs] = useState(String(fixture.homeTeamScore));
  const [as, setAs] = useState(String(fixture.awayTeamScore));
  const [status, setStatus] = useState((fixture.matchStatus || "scheduled").toLowerCase());
  const [divisionId, setDivisionId] = useState<number | null>(fixture.divisionId);

  const save = async () => {
    setSaving(true);
    const res = await updateFixtureSchedule({
      fixtureId: fixture.fixtureId,
      weekNo: week === "" ? null : Math.max(1, Number(week) || 1),
      homeTeamScore: Number(hs) || 0,
      awayTeamScore: Number(as) || 0,
      matchStatus: status,
      divisionId,
    });
    setSaving(false);
    if ("error" in res) return toast.error(res.error);
    toast.success(res.success);
    setOpen(false);
    router.refresh();
  };

  return (
    <div className="flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm">
      <Link href={`/fixtures/${fixture.fixtureId}`} className="flex flex-1 items-center gap-2 min-w-0 hover:opacity-80">
        <span className="flex-1 flex justify-end min-w-0">
          <TeamName name={fixture.homeName} active={fixture.homeActive} />
        </span>
        {scheduled ? (
          <span className="text-xs text-muted-foreground px-1 shrink-0">vs</span>
        ) : (
          <span className="font-semibold tabular-nums shrink-0 px-1">
            {fixture.homeTeamScore} <span className="text-muted-foreground font-normal">–</span> {fixture.awayTeamScore}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <TeamName name={fixture.awayName} active={fixture.awayActive} />
        </span>
        <span className="text-xs text-muted-foreground shrink-0 tabular-nums hidden sm:inline">{format(new Date(fixture.matchDate), "d MMM")}</span>
        <StatusBadge status={fixture.matchStatus} />
      </Link>

      {canManage && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <button className="text-muted-foreground hover:text-foreground shrink-0" title="Edit fixture">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 space-y-3">
            <p className="text-xs font-semibold truncate">{fixture.homeName} vs {fixture.awayName}</p>

            <div className="space-y-1">
              <Label className="text-xs">Week</Label>
              <Input type="number" min={1} value={week} onChange={(e) => setWeek(e.target.value)} className="h-8" />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Score (home – away)</Label>
              <div className="flex items-center gap-2">
                <Input type="number" min={0} value={hs} onChange={(e) => setHs(e.target.value)} className="h-8" />
                <span className="text-muted-foreground">–</span>
                <Input type="number" min={0} value={as} onChange={(e) => setAs(e.target.value)} className="h-8" />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Division</Label>
              <Select value={divisionId != null ? String(divisionId) : "none"} onValueChange={(v) => setDivisionId(v === "none" ? null : Number(v))}>
                <SelectTrigger className="h-8"><SelectValue placeholder="Division" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {divisions.map((d) => <SelectItem key={d.id} value={String(d.id)}>{d.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setOpen(false)} disabled={saving}>Cancel</Button>
              <Button size="sm" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save"}</Button>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
