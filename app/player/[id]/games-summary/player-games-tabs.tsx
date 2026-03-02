"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Row = {
  playerId?: number;
  playerName?: string;
  gameType: string;
  wins: number;
  loses: number;
};

export function PlayerGamesTabs({ rows, currentPlayerId }: { rows: Row[]; currentPlayerId: number }) {
  const chartData = rows
    .filter((row) => row.gameType === "Overall")
    .map((row) => ({
      playerName: row.playerName,
      wins: row.wins,
      losses: row.loses,
    }));

  return (
    <Tabs defaultValue="player-stats" className="space-y-4">
      <TabsList>
        <TabsTrigger value="player-stats">Player stats</TabsTrigger>
        <TabsTrigger value="chart">Chart</TabsTrigger>
      </TabsList>

      <TabsContent value="player-stats">
        <Table>
          <TableHeader>
            <TableRow><TableHead>Player</TableHead><TableHead>Type</TableHead><TableHead>Wins</TableHead><TableHead>Losses</TableHead></TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, index) => (
              <TableRow
                key={`${row.playerId}-${row.gameType}-${index}`}
                className={row.playerId === currentPlayerId ? "bg-yellow-100 hover:bg-yellow-100" : undefined}
              >
                <TableCell>{row.playerName}</TableCell>
                <TableCell>{row.gameType}</TableCell>
                <TableCell>{row.wins}</TableCell>
                <TableCell>{row.loses}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>

      <TabsContent value="chart">
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
