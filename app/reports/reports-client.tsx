"use client";

import Image from "next/image";
import { useState } from "react";
import { FixtureKpiSummary } from "@/types/fixtures-summary";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Target, TrendingUp, PoundSterling, Wallet } from "lucide-react";

type LeaderboardEntry = {
  playerId: number;
  name: string;
  nickname: string | null;
  imgUrl: string | null;
  wins: number;
  losses: number;
  rank: number;
};

type FinesEntry = {
  playerId: number;
  name: string;
  nickname: string | null;
  imgUrl: string | null;
  count: number;
  total: number;
  unpaid: number;
};

type SubsSummary = {
  totalValue: number;
  paidValue: number;
  unpaidValue: number;
  paidCount: number;
  unpaidCount: number;
  totalCount: number;
};

type Financials = { totalFinesIssued: number; totalFinesPaid: number; totalFinesUnpaid: number };

const ALL_SEASONS = "all";

// Sum per-season KPIs into a single "All seasons" view.
function aggregateKpis(kpis: FixtureKpiSummary[]): FixtureKpiSummary | undefined {
  if (kpis.length === 0) return undefined;
  const sum = (f: keyof FixtureKpiSummary) => kpis.reduce((a, k) => a + ((k[f] as number) ?? 0), 0);
  const wins = sum("totalFixtureWins");
  const fixtures = sum("totalFixtures");
  return {
    ...kpis[0],
    season: "All seasons",
    totalFixtures: fixtures,
    totalFixtureWins: wins,
    totalFixtureLosses: sum("totalFixtureLosses"),
    totalFixturePercentWin: fixtures > 0 ? (wins / fixtures) * 100 : 0,
    totalPoints: sum("totalPoints"),
    totalHomeWins: sum("totalHomeWins"),
    totalHomeLosses: sum("totalHomeLosses"),
    totalAwayWins: sum("totalAwayWins"),
    totalAwayLosses: sum("totalAwayLosses"),
    totalSinglesGameWins: sum("totalSinglesGameWins"),
    totalSinglesGameLosses: sum("totalSinglesGameLosses"),
    totalDoublesGameWins: sum("totalDoublesGameWins"),
    totalDoublesGameLosses: sum("totalDoublesGameLosses"),
    totalTeamGameWins: sum("totalTeamGameWins"),
    totalteamGameLosses: sum("totalteamGameLosses"),
  };
}

type Props = {
  seasonKpis: FixtureKpiSummary[];
  standingsBySeason: Record<string, LeaderboardEntry[]>;
  finesLeaderboardBySeason: Record<string, FinesEntry[]>;
  financialsBySeason: Record<string, Financials>;
  subsSummaryBySeason: Record<string, SubsSummary>;
  latestSeason: string | null;
};

function Avatar({ imgUrl, name }: { imgUrl: string | null; name: string }) {
  return imgUrl ? (
    <Image src={imgUrl} alt={name} width={32} height={32} unoptimized className="h-8 w-8 rounded-full border object-cover shrink-0" />
  ) : (
    <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold shrink-0">
      {name.slice(0, 1).toUpperCase()}
    </div>
  );
}

function WinBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-0">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

export function ReportsClient({ seasonKpis, standingsBySeason, finesLeaderboardBySeason, financialsBySeason, subsSummaryBySeason, latestSeason }: Props) {
  const [selectedSeason, setSelectedSeason] = useState<string>(
    seasonKpis.at(-1)?.season ?? latestSeason ?? "all"
  );

  const kpi = selectedSeason === ALL_SEASONS
    ? aggregateKpis(seasonKpis)
    : seasonKpis.find((k) => k.season === selectedSeason) ?? seasonKpis.at(-1);

  // Every visual below reflects the selected season.
  const leaderboard = standingsBySeason[selectedSeason] ?? [];
  const finesLeaderboard = finesLeaderboardBySeason[selectedSeason] ?? [];
  const financials = financialsBySeason[selectedSeason] ?? { totalFinesIssued: 0, totalFinesPaid: 0, totalFinesUnpaid: 0 };
  const subsSummary = subsSummaryBySeason[selectedSeason] ?? { totalValue: 0, paidValue: 0, unpaidValue: 0, paidCount: 0, unpaidCount: 0, totalCount: 0 };

  const finesPaidPct = financials.totalFinesIssued > 0
    ? (financials.totalFinesPaid / financials.totalFinesIssued) * 100
    : 0;
  const subsPaidPct = subsSummary.totalValue > 0
    ? (subsSummary.paidValue / subsSummary.totalValue) * 100
    : subsSummary.totalCount > 0
    ? (subsSummary.paidCount / subsSummary.totalCount) * 100
    : 0;

  return (
    <div className="space-y-8">

      {/* Season selector */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">Season</span>
        <Select value={selectedSeason} onValueChange={setSelectedSeason}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select season" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_SEASONS}>All seasons</SelectItem>
            {seasonKpis.map((k) => (
              <SelectItem key={k.season} value={k.season}>{k.season}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Season KPI cards */}
      {kpi && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Matches</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.totalFixtures}</p>
              <p className="text-xs text-muted-foreground">{kpi.totalFixtureWins}W – {kpi.totalFixtureLosses}L</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Win rate</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.totalFixturePercentWin.toFixed(0)}%</p>
              <p className="text-xs text-muted-foreground">{kpi.totalPoints} pts scored</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Home</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.totalHomeWins}W</p>
              <p className="text-xs text-muted-foreground">{kpi.totalHomeLosses} losses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Away</CardTitle></CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{kpi.totalAwayWins}W</p>
              <p className="text-xs text-muted-foreground">{kpi.totalAwayLosses} losses</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Game type breakdown */}
      {kpi && (
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-4 w-4" /> Game breakdown — {kpi.season}</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              {[
                { label: "Singles", wins: kpi.totalSinglesGameWins, losses: kpi.totalSinglesGameLosses },
                { label: "Doubles", wins: kpi.totalDoublesGameWins, losses: kpi.totalDoublesGameLosses },
                { label: "Team Game", wins: kpi.totalTeamGameWins, losses: kpi.totalteamGameLosses },
              ].map(({ label, wins, losses }) => (
                <div key={label}>
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  <p className="text-lg font-bold">{wins}W – {losses}L</p>
                  <WinBar wins={wins} losses={losses} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2">

        {/* Player leaderboard */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Trophy className="h-4 w-4" /> Player standings — {selectedSeason === ALL_SEASONS ? "All seasons" : selectedSeason}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {leaderboard.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
            {leaderboard.map((p, i) => (
              <div key={p.playerId} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <Avatar imgUrl={p.imgUrl} name={p.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}{p.nickname ? ` (${p.nickname})` : ""}</p>
                  <WinBar wins={p.wins} losses={p.losses} />
                </div>
                <span className="text-xs text-muted-foreground shrink-0">{p.wins}W {p.losses}L</span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Fines leaderboard */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Target className="h-4 w-4" /> Fines leaderboard</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {finesLeaderboard.length === 0 && <p className="text-sm text-muted-foreground">No fines issued yet.</p>}
            {finesLeaderboard.map((p, i) => (
              <div key={p.playerId} className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground w-4 shrink-0">{i + 1}</span>
                <Avatar imgUrl={p.imgUrl} name={p.name} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}{p.nickname ? ` (${p.nickname})` : ""}</p>
                  <p className="text-xs text-muted-foreground">{p.count} fine{p.count !== 1 ? "s" : ""}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm font-semibold">£{p.total.toFixed(2)}</p>
                  {p.unpaid > 0 && <Badge variant="secondary" className="text-[10px]">£{p.unpaid.toFixed(2)} unpaid</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Fines — paid vs unpaid */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><PoundSterling className="h-4 w-4" /> Fines</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {financials.totalFinesIssued === 0 ? (
            <p className="text-sm text-muted-foreground">No fines issued.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total issued</p>
                  <p className="text-2xl font-bold">£{financials.totalFinesIssued.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Paid</p>
                  <p className="text-2xl font-bold text-emerald-500">£{financials.totalFinesPaid.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                  <p className="text-2xl font-bold text-amber-500">£{financials.totalFinesUnpaid.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <div className="h-2.5 w-full rounded-full bg-amber-500/30 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${finesPaidPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{finesPaidPct.toFixed(0)}% paid</span>
                  <span>{(100 - finesPaidPct).toFixed(0)}% outstanding</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Subscriptions — paid vs unpaid */}
      <Card>
        <CardHeader><CardTitle className="flex items-center gap-2 text-base"><Wallet className="h-4 w-4" /> Subscriptions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {subsSummary.totalCount === 0 ? (
            <p className="text-sm text-muted-foreground">No subscriptions recorded.</p>
          ) : (
            <>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Total subs</p>
                  <p className="text-2xl font-bold">£{subsSummary.totalValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{subsSummary.totalCount} sub{subsSummary.totalCount !== 1 ? "s" : ""}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Paid</p>
                  <p className="text-2xl font-bold text-emerald-500">£{subsSummary.paidValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{subsSummary.paidCount} paid</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Unpaid</p>
                  <p className="text-2xl font-bold text-amber-500">£{subsSummary.unpaidValue.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">{subsSummary.unpaidCount} unpaid</p>
                </div>
              </div>

              <div>
                <div className="h-2.5 w-full rounded-full bg-amber-500/30 overflow-hidden">
                  <div className="h-full rounded-full bg-emerald-500 transition-all" style={{ width: `${subsPaidPct}%` }} />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{subsPaidPct.toFixed(0)}% paid</span>
                  <span>{(100 - subsPaidPct).toFixed(0)}% outstanding</span>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
