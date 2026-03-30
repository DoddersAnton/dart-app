"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, LabelList, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  playerId?: number;
  playerName?: string;
  nickname?: string | null;
  gameType: string;
  wins: number;
  loses: number;
  rankValue?: number;
};

type SeasonSummary = {
  season: string;
  totalMatches: number;
  allRows: Row[];
};

function WinBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

export function PlayerGamesTabs({
  seasons,
  currentPlayerId,
}: {
  seasons: SeasonSummary[];
  currentPlayerId: number;
}) {
  const [seasonFilter, setSeasonFilter] = useState<string>("all");

  const visibleSeasons = useMemo(() => {
    if (seasonFilter === "all") return seasons;
    return seasons.filter((season) => season.season === seasonFilter);
  }, [seasons, seasonFilter]);

  return (
    <div className="space-y-4 overflow-auto">
      <div className="flex items-center justify-end">
        <select
          className="rounded-md border bg-background px-2 py-1 text-sm"
          value={seasonFilter}
          onChange={(event) => setSeasonFilter(event.target.value)}
        >
          <option value="all">All seasons</option>
          {seasons.map((season) => (
            <option key={season.season} value={season.season}>
              Season {season.season}
            </option>
          ))}
        </select>
      </div>

      <Tabs defaultValue="rankings" className="overflow-auto">
        <TabsList>
          <TabsTrigger value="rankings">Rankings</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="rankings">
          {visibleSeasons.length > 0 ? (
            <div className="space-y-6">
              {visibleSeasons.map((data) => {
                const sortedRows = [...data.allRows].sort((a, b) => (a.rankValue ?? 999) - (b.rankValue ?? 999));
                return (
                  <Card key={data.season} className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Season {data.season}</CardTitle>
                      <p className="text-xs text-muted-foreground">{data.totalMatches} matches played</p>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Overall</h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Player</TableHead>
                              <TableHead className="text-center">W – L</TableHead>
                              <TableHead>Win rate</TableHead>
                              <TableHead className="text-center">Rank</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedRows
                              .filter((summary) => summary.gameType === "Overall")
                              .map((summary) => (
                                <TableRow
                                  key={`${summary.playerId}_overall`}
                                  className={summary.playerId === currentPlayerId ? "bg-primary/10 font-semibold" : ""}
                                >
                                  <TableCell>{summary.playerName}</TableCell>
                                  <TableCell className="text-center">{summary.wins} – {summary.loses}</TableCell>
                                  <TableCell><WinBar wins={summary.wins} losses={summary.loses} /></TableCell>
                                  <TableCell className="text-center">#{summary.rankValue}</TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>

                      {["Singles", "Doubles", "Team Game"].map((type) => {
                        const gameTypeRows = sortedRows.filter((summary) => summary.gameType === type);

                        return (
                          <div key={type}>
                            <h3 className="mb-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{type}</h3>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Player</TableHead>
                                  <TableHead className="text-center">W – L</TableHead>
                                  <TableHead>Win rate</TableHead>
                                  <TableHead className="text-center">Rank</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {gameTypeRows.map((summary) => (
                                  <TableRow
                                    key={`${summary.playerId}_${type}`}
                                    className={summary.playerId === currentPlayerId ? "bg-primary/10 font-semibold" : ""}
                                  >
                                    <TableCell>{summary.playerName}</TableCell>
                                    <TableCell className="text-center">{summary.wins} – {summary.loses}</TableCell>
                                    <TableCell><WinBar wins={summary.wins} losses={summary.loses} /></TableCell>
                                    <TableCell className="text-center">#{summary.rankValue}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No ranking data available.</span>
          )}
        </TabsContent>

        <TabsContent value="stats">
          {visibleSeasons.length > 0 ? (
            <div className="space-y-10">
              {visibleSeasons.map((season) => {
                const categories = ["Overall", "Singles", "Doubles", "Team Game"];

                return (
                  <Card key={season.season} className="shadow-lg">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Season {season.season}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-10">
                      {categories.map((cat) => {
                        const rows =
                          season.allRows
                            ?.filter((g) => g.gameType === cat && g.wins + g.loses > 0)
                            .map((r) => ({
                              player: `${r.playerName}${r.nickname ? ` (${r.nickname})` : ""}`,
                              wins: r.wins,
                              losses: r.loses,
                              total: r.wins + r.loses,
                              winPercent:
                                r.wins + r.loses > 0
                                  ? `${r.wins + r.loses} (${((r.wins / (r.wins + r.loses)) * 100).toFixed(1)}%)`
                                  : `${r.wins + r.loses} (0.0%)`,
                            })) ?? [];

                        return (
                          <div key={cat}>
                            <h3 className="mb-4 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{cat}</h3>

                            <ChartContainer
                              config={{
                                wins: { label: "Wins", color: "hsl(var(--chart-1))" },
                                losses: { label: "Losses", color: "hsl(var(--chart-2))" },
                              }}
                            >
                              <BarChart data={rows} layout="vertical" margin={{ right: 80 }}>
                                <CartesianGrid horizontal={false} />
                                <YAxis
                                  dataKey="player"
                                  type="category"
                                  width={140}
                                  tickLine={false}
                                  axisLine={false}
                                />
                                <XAxis type="number" hide />
                                <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />

                                <Bar dataKey="wins" stackId="a" fill="#388E3C" radius={[4, 0, 0, 4]}>
                                  <LabelList
                                    dataKey="wins"
                                    position="inside"
                                    className="fill-white"
                                    fontSize={12}
                                  />
                                </Bar>

                                <Bar dataKey="losses" stackId="a" fill="#A5D6A7" radius={[0, 4, 4, 0]}>
                                  <LabelList
                                    dataKey="losses"
                                    position="inside"
                                    className="fill-foreground"
                                    fontSize={12}
                                  />
                                  <LabelList
                                    dataKey="winPercent"
                                    position="right"
                                    className="fill-black"
                                    fontSize={12}
                                  />
                                </Bar>
                              </BarChart>
                            </ChartContainer>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">No stats data available.</span>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
