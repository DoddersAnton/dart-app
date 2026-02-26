"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, FilterIcon, EraserIcon, LayoutDashboard, Table2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { PlayerFinesSummaryDataTable } from "./player-summary-table";
import { PlayerFinesDataTable } from "./playerfines-data-table";
import { summaryColumns } from "./player-summary-columns";
import { playerFinesColumns } from "./player-fines-columns";
import { FineChart } from "./fine-chart";
import { FineTypeBarChart } from "./fine-chart-byfinetype";

export interface FineSummaryProps {
  playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
    status: string | null;
  }[];
}

export function PlayerFinesSummary({ playerFinesData }: FineSummaryProps) {
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterPlayer, setFilterPlayer] = useState<string>("all");

  const dates = useMemo(
    () =>
      Array.from(
        new Set(
          playerFinesData
            .map((item) => item.matchDate)
            .filter((date): date is string => Boolean(date))
            .map((date) => new Date(date).toLocaleDateString("en-GB")),
        ),
      ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()),
    [playerFinesData],
  );

  const players = useMemo(
    () => Array.from(new Set(playerFinesData.map((item) => item.player))).sort(),
    [playerFinesData],
  );

  const filteredFines = useMemo(() => {
    return playerFinesData.filter((item) => {
      if (!item.matchDate) {
        return false;
      }

      const date = new Date(item.matchDate).toLocaleDateString("en-GB");
      const matchesDate = filterDate === "all" || date === filterDate;
      const matchesPlayer = filterPlayer === "all" || item.player === filterPlayer;

      return matchesDate && matchesPlayer;
    });
  }, [filterDate, filterPlayer, playerFinesData]);

  const totals = useMemo(() => {
    const total = filteredFines.reduce((acc, fine) => acc + fine.amount, 0);
    const paid = filteredFines
      .filter((fine) => fine.status === "Paid")
      .reduce((acc, fine) => acc + fine.amount, 0);
    const unpaid = filteredFines
      .filter((fine) => fine.status !== "Paid")
      .reduce((acc, fine) => acc + fine.amount, 0);

    return { total, paid, unpaid };
  }, [filteredFines]);

  const finesSummary = useMemo(
    () =>
      Object.values(
        filteredFines.reduce(
          (
            acc: Record<
              string,
              { player: string; total: number; count: number; games: number }
            >,
            fine,
          ) => {
            if (!acc[fine.player]) {
              acc[fine.player] = { player: fine.player, total: 0, count: 0, games: 0 };
            }

            acc[fine.player].total += fine.amount;
            acc[fine.player].count += 1;
            acc[fine.player].games = new Set(
              filteredFines
                .filter((f) => f.player === fine.player && f.matchDate)
                .map((f) => new Date(f.matchDate!).toLocaleDateString("en-GB")),
            ).size;

            return acc;
          },
          {},
        ),
      ).sort((a, b) => b.total - a.total),
    [filteredFines],
  );

  const averagePerMatch = useMemo(() => {
    const games = new Set(filteredFines.map((item) => item.matchDate)).size;
    return games > 0 ? totals.total / games : 0;
  }, [filteredFines, totals.total]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr]">
      <Card className="h-fit lg:sticky lg:top-24">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <FilterIcon className="h-4 w-4" /> Filters
          </CardTitle>
          <CardDescription>Refine player fines dashboard data.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link href="/fines/add-fine" className="block">
            <Button className="w-full" variant="outline">
              Add Fine <Plus className="ml-2 h-4 w-4" />
            </Button>
          </Link>

          <Separator />

          <Select value={filterDate} onValueChange={setFilterDate}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by match date" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All dates</SelectItem>
              {dates.map((date) => (
                <SelectItem key={date} value={date}>
                  {date}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterPlayer} onValueChange={setFilterPlayer}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by player" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All players</SelectItem>
              {players.map((player) => (
                <SelectItem key={player} value={player}>
                  {player}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="ghost"
            className="w-full"
            onClick={() => {
              setFilterDate("all");
              setFilterPlayer("all");
            }}
          >
            Clear Filters <EraserIcon className="ml-2 h-4 w-4" />
          </Button>

          <Separator />

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Rows: {filteredFines.length}</Badge>
            {filterDate !== "all" && <Badge>Date: {filterDate}</Badge>}
            {filterPlayer !== "all" && <Badge>Player: {filterPlayer}</Badge>}
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Fines</CardDescription>
              <CardTitle>£{totals.total.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Paid</CardDescription>
              <CardTitle className="text-emerald-600">£{totals.paid.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Unpaid</CardDescription>
              <CardTitle className="text-amber-600">£{totals.unpaid.toFixed(2)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <FineChart playerFinesData={filteredFines} />
          <FineTypeBarChart playerFinesData={filteredFines} />
        </div>

        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="summary" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Summary</TabsTrigger>
            <TabsTrigger value="details" className="gap-2"><Table2 className="h-4 w-4" /> Details</TabsTrigger>
          </TabsList>
          <TabsContent value="summary">
            <PlayerFinesSummaryDataTable
              columns={summaryColumns}
              data={finesSummary}
              total={totals.total}
              average={averagePerMatch}
            />
          </TabsContent>
          <TabsContent value="details">
            <PlayerFinesDataTable
              columns={playerFinesColumns}
              data={filteredFines}
              total={totals.total}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
