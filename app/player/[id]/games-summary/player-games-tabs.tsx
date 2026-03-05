"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  playerId?: number;
  playerName?: string;
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
  const latestRows = seasons.at(-1)?.allRows ?? [];
  const chartData = latestRows
    .filter((row) => row.gameType === "Overall")
    .map((row) => ({
      playerName: row.playerName,
      wins: row.wins,
      losses: row.loses,
    }));

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

      <TabsContent value="stats" className="space-y-4">
        <ChartContainer
          config={{
            wins: { label: "Wins", color: "hsl(var(--chart-1))" },
            losses: { label: "Losses", color: "hsl(var(--chart-2))" },
          }}
          className="h-[320px] w-full"
        >
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="playerName" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="wins" stackId="a" fill="var(--color-wins)" />
            <Bar dataKey="losses" stackId="a" fill="var(--color-losses)" />
          </BarChart>
        </ChartContainer>
      </TabsContent>
    </Tabs>
  );
}
