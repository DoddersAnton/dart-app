"use client";

import { useRouter } from "next/navigation";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, CheckCircle2, Lock, Minus, Trophy, Unlock } from "lucide-react";
import { NO_DIVISION, type LeagueTableData } from "@/lib/league-table";
import { setLeagueComplete } from "@/server/actions/set-league-complete";
import { ManualSubmissionDialog } from "./manual-submission-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Opt = { id: number; name: string };

function Movement({ rank, previousRank }: { rank: number; previousRank: number | null }) {
  if (previousRank == null) {
    return <span className="text-[10px] font-semibold text-blue-500 uppercase tracking-wide">New</span>;
  }
  const delta = previousRank - rank; // positive = moved up the table
  if (delta === 0) {
    return (
      <span className="flex items-center gap-0.5 text-muted-foreground" title="No change">
        <Minus className="h-3.5 w-3.5" />
      </span>
    );
  }
  if (delta > 0) {
    return (
      <span className="flex items-center gap-0.5 text-green-600 dark:text-green-500" title={`Up ${delta}`}>
        <ArrowUp className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold tabular-nums">{delta}</span>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-0.5 text-red-600 dark:text-red-500" title={`Down ${-delta}`}>
      <ArrowDown className="h-3.5 w-3.5" /><span className="text-[11px] font-semibold tabular-nums">{-delta}</span>
    </span>
  );
}

function MarkCompleteButton({ seasonId, divisionId, isComplete }: { seasonId: number; divisionId: number | null; isComplete: boolean }) {
  const router = useRouter();
  const { execute, status } = useAction(setLeagueComplete, {
    onSuccess: (res) => {
      if (res.data?.error) toast.error(res.data.error);
      else if (res.data?.success) { toast.success(res.data.success); router.refresh(); }
    },
    onError: () => toast.error("Failed to update league status"),
  });
  const busy = status === "executing";
  return (
    <Button
      variant="outline"
      size="sm"
      className="gap-1.5"
      disabled={busy}
      onClick={() => execute({ seasonId, divisionId, complete: !isComplete })}
    >
      {isComplete ? <><Unlock className="h-4 w-4" /> {busy ? "…" : "Reopen league"}</> : <><Lock className="h-4 w-4" /> {busy ? "…" : "Mark complete"}</>}
    </Button>
  );
}

// Medal tint for the final top three.
const medalClass = (rank: number) =>
  rank === 1 ? "bg-amber-100 dark:bg-amber-950/40"
  : rank === 2 ? "bg-zinc-100 dark:bg-zinc-800/40"
  : rank === 3 ? "bg-orange-100/70 dark:bg-orange-950/30"
  : "";

export function LeagueTableView({
  data,
  isAdmin,
  allSeasons,
  allDivisions,
  allTeams,
}: {
  data: LeagueTableData;
  isAdmin: boolean;
  allSeasons: Opt[];
  allDivisions: Opt[];
  allTeams: Opt[];
}) {
  const router = useRouter();

  const setParams = (season: number, division: number | null) => {
    const params = new URLSearchParams();
    params.set("season", String(season));
    params.set("division", division == null ? NO_DIVISION : String(division));
    router.push(`/fixtures/league-table?${params.toString()}`);
  };

  const divKey = (id: number | null) => (id == null ? NO_DIVISION : String(id));

  const adminBar = isAdmin && (
    <div className="flex flex-wrap items-center gap-2">
      <ManualSubmissionDialog
        seasons={allSeasons}
        divisions={allDivisions}
        teams={allTeams}
        defaultSeasonId={data.selectedSeasonId}
        defaultDivisionId={data.selectedDivisionId}
      />
      {data.selectedSeasonId != null && data.rows.length > 0 && (
        <MarkCompleteButton seasonId={data.selectedSeasonId} divisionId={data.selectedDivisionId} isComplete={data.isComplete} />
      )}
    </div>
  );

  if (data.seasons.length === 0 || data.selectedSeasonId == null) {
    return (
      <div className="space-y-4">
        {adminBar}
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <Trophy className="h-8 w-8 mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No league table yet. Submit a completed week from a season schedule, or add a manual submission.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <Select value={String(data.selectedSeasonId)} onValueChange={(v) => setParams(Number(v), data.selectedDivisionId)}>
          <SelectTrigger className="w-[200px]"><SelectValue placeholder="Season" /></SelectTrigger>
          <SelectContent>
            {data.seasons.map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}
          </SelectContent>
        </Select>

        {data.divisions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {data.divisions.map((d) => {
              const active = divKey(d.id) === divKey(data.selectedDivisionId);
              return (
                <button
                  key={divKey(d.id)}
                  onClick={() => setParams(data.selectedSeasonId!, d.id)}
                  className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground border-border"
                  }`}
                >
                  {d.name}
                </button>
              );
            })}
          </div>
        )}

        <div className="ml-auto">{adminBar}</div>
      </div>

      {data.rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No standings submitted for this division yet.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between px-4 py-2.5 border-b">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">{data.isComplete ? "Final standings" : "Standings"}</p>
                {data.isComplete && (
                  <Badge className="bg-green-600 hover:bg-green-600 gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Complete</Badge>
                )}
              </div>
              {data.weekNo != null && (
                <p className="text-xs text-muted-foreground">{data.isComplete ? `Final · week ${data.weekNo}` : `After week ${data.weekNo}`}</p>
              )}
            </div>

            {/* Champions banner when complete */}
            {data.isComplete && data.rows[0] && (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-900">
                <Trophy className="h-4 w-4 text-amber-500" />
                <p className="text-sm"><span className="font-semibold">{data.rows[0].teamName}</span> — champions</p>
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">#</th>
                    {!data.isComplete && <th className="py-2 px-2 text-center font-medium text-muted-foreground" title="Movement since last week">+/-</th>}
                    <th className="py-2 px-3 text-left font-medium text-muted-foreground">Team</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Played">P</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Wins">W</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Losses">L</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Legs for">F</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Legs against">A</th>
                    <th className="py-2 px-3 text-center font-medium text-muted-foreground" title="Leg difference">+/-</th>
                    <th className="py-2 px-3 text-center font-semibold text-foreground" title="Points">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((r) => {
                    const diff = r.legsFor - r.legsAgainst;
                    return (
                      <tr key={r.teamId} className={`border-t border-border/50 ${data.isComplete ? medalClass(r.rank) : ""}`}>
                        <td className="py-2 px-3 tabular-nums font-semibold">
                          <span className="inline-flex items-center gap-1">
                            {r.rank}
                            {data.isComplete && r.rank === 1 && <Trophy className="h-3.5 w-3.5 text-amber-500" />}
                          </span>
                        </td>
                        {!data.isComplete && (
                          <td className="py-2 px-2"><div className="flex justify-center"><Movement rank={r.rank} previousRank={r.previousRank} /></div></td>
                        )}
                        <td className="py-2 px-3 font-medium">{r.teamName}</td>
                        <td className="py-2 px-3 text-center tabular-nums text-muted-foreground">{r.played}</td>
                        <td className="py-2 px-3 text-center tabular-nums">{r.wins}</td>
                        <td className="py-2 px-3 text-center tabular-nums">{r.losses}</td>
                        <td className="py-2 px-3 text-center tabular-nums">{r.legsFor}</td>
                        <td className="py-2 px-3 text-center tabular-nums">{r.legsAgainst}</td>
                        <td className={`py-2 px-3 text-center tabular-nums font-medium ${diff > 0 ? "text-green-600 dark:text-green-500" : diff < 0 ? "text-red-600 dark:text-red-500" : "text-muted-foreground"}`}>
                          {diff > 0 ? `+${diff}` : diff}
                        </td>
                        <td className="py-2 px-3 text-center tabular-nums font-bold">{r.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="px-4 py-2 text-[11px] text-muted-foreground border-t">
              P = played, W = wins, L = losses, F/A = legs for/against, Pts = legs won.
              {data.isComplete ? " Final positions." : " Arrow shows rank movement since the previous submitted week."}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
