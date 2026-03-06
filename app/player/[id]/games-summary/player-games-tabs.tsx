"use client";

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

export function PlayerGamesTabs({
  seasons,
  currentPlayerId,
}: {
  seasons: SeasonSummary[];
  currentPlayerId: number;
}) {
  return (
    <Tabs defaultValue="rankings" className="overflow-auto">
      <TabsList>
        <TabsTrigger value="rankings">Rankings</TabsTrigger>
        <TabsTrigger value="stats">Stats</TabsTrigger>
      </TabsList>

      <TabsContent value="rankings">
        {seasons.length > 0 ? (
          <div className="space-y-6">
            {seasons.map((data) => {
              const sortedRows = [...data.allRows].sort((a, b) => (b.rankValue ?? 0) - (a.rankValue ?? 0));
              return (
                <Card key={data.season} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Season {data.season}</CardTitle>
                    <CardTitle className="text-lg semibold">Total matches: {data.totalMatches}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="mb-2 font-semibold">Overall</h3>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Player</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Wins</TableHead>
                            <TableHead>Losses</TableHead>
                            <TableHead>Rank</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sortedRows
                            .filter((summary) => summary.gameType === "Overall")
                            .map((summary) => (
                              <TableRow
                                key={`${summary.playerId}_overall`}
                                className={summary.playerId === currentPlayerId ? "bg-yellow-200" : ""}
                              >
                                <TableCell>{summary.playerName}</TableCell>
                                <TableCell>{summary.wins + summary.loses}</TableCell>
                                <TableCell>{summary.wins}</TableCell>
                                <TableCell>{summary.loses}</TableCell>
                                <TableCell>{summary.rankValue}</TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>

                    {["Singles", "Doubles", "Team Game"].map((type) => {
                      const gameTypeRows = sortedRows.filter((summary) => summary.gameType === type);

                      return (
                        <div key={type} className="mt-6">
                          <h3 className="mb-2 text-lg font-semibold">{type}</h3>
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Player</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Wins</TableHead>
                                <TableHead>Loses</TableHead>
                                <TableHead>Rank</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {gameTypeRows.map((summary) => (
                                <TableRow
                                  key={`${summary.playerId}_${type}`}
                                  className={summary.playerId === currentPlayerId ? "bg-yellow-200" : ""}
                                >
                                  <TableCell>{summary.playerName}</TableCell>
                                  <TableCell>{summary.wins + summary.loses}</TableCell>
                                  <TableCell>{summary.wins}</TableCell>
                                  <TableCell>{summary.loses}</TableCell>
                                  <TableCell>{summary.rankValue}</TableCell>
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
        {seasons.length > 0 ? (
          <div className="space-y-10">
            {seasons.map((season) => {
              const categories = ["Overall", "Singles", "Doubles", "Team Game"];

              return (
                <Card key={season.season} className="shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Season {season.season}</CardTitle>
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
                          <h3 className="mb-4 text-lg font-semibold">{cat}</h3>

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
  );
}
