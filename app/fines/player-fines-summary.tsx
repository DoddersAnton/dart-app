"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import Link from "next/link";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { Plus, FilterIcon, EraserIcon, LayoutDashboard, Table2, ChartColumn, Download, CalendarIcon } from "lucide-react";
import { exportToCsv } from "@/lib/export-csv";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

import { PlayerFinesSummaryDataTable } from "./player-summary-table";
import { PlayerFinesDataTable } from "./playerfines-data-table";
import { summaryColumns } from "./player-summary-columns";
import { playerFinesColumns } from "./player-fines-columns";
import { FineChart } from "./fine-chart";
import { FineTypeBarChart } from "./fine-chart-byfinetype";
import { FineSeasonComparison } from "./fine-season-comparison";

export interface FineSummaryProps {
  myPlayerId?: number | null;
  seasons?: { id: number; name: string }[];
  playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
    status: string | null;
    playerImgUrl?: string | null;
    seasonId?: number | null;
    season?: string | null;
  }[];
}

// Strip a date to midnight for inclusive day-level range comparisons.
const dayStart = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

export function PlayerFinesSummary({ playerFinesData, myPlayerId, seasons = [] }: FineSummaryProps) {
  const [filterDate, setFilterDate] = useState<string>("all");
  const [filterPlayer, setFilterPlayer] = useState<string>("all");
  const [filterSeason, setFilterSeason] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [filtersOpen, setFiltersOpen] = useState(false);

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
      if (!item.matchDate) return false;

      const date = new Date(item.matchDate).toLocaleDateString("en-GB");
      const matchesDate = filterDate === "all" || date === filterDate;
      const matchesPlayer = filterPlayer === "all" || item.player === filterPlayer;
      const matchesSeason = filterSeason === "all" || String(item.seasonId ?? "") === filterSeason;

      let matchesRange = true;
      if (dateRange?.from || dateRange?.to) {
        const d = dayStart(new Date(item.matchDate));
        if (dateRange.from && d < dayStart(dateRange.from)) matchesRange = false;
        if (dateRange.to && d > dayStart(dateRange.to)) matchesRange = false;
      }

      return matchesDate && matchesPlayer && matchesSeason && matchesRange;
    });
  }, [filterDate, filterPlayer, filterSeason, dateRange, playerFinesData]);

  const totals = useMemo(() => {
    const total = filteredFines.reduce((acc, fine) => acc + fine.amount, 0);
    const paidFines = filteredFines.filter((fine) => fine.status === "Paid");
    const unpaidFines = filteredFines.filter((fine) => fine.status !== "Paid");

    const paid = paidFines.reduce((acc, fine) => acc + fine.amount, 0);
    const unpaid = unpaidFines.reduce((acc, fine) => acc + fine.amount, 0);

    return {
      total,
      paid,
      unpaid,
      totalCount: filteredFines.length,
      paidCount: paidFines.length,
      unpaidCount: unpaidFines.length,
    };
  }, [filteredFines]);

  const finesSummary = useMemo(
    () =>
      Object.values(
        filteredFines.reduce(
          (
            acc: Record<string, { player: string; playerImgUrl?: string | null; total: number; count: number; games: number }>,
            fine,
          ) => {
            if (!acc[fine.player]) {
              acc[fine.player] = { player: fine.player, playerImgUrl: fine.playerImgUrl ?? null, total: 0, count: 0, games: 0 };
            }

            if (!acc[fine.player].playerImgUrl && fine.playerImgUrl) {
              acc[fine.player].playerImgUrl = fine.playerImgUrl;
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
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        {myPlayerId ? (
          <Link href={`/player/${myPlayerId}/financial-summary/fines`}>
            <Button variant="outline">My Fines</Button>
          </Link>
        ) : (
          <Button variant="outline" onClick={() => toast.error("Your account is not linked to a player. Visit a player profile and click the link button.")}>
            My Fines
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={() => {
          exportToCsv("fines-export", filteredFines.map((f) => ({
            Player: f.player,
            "Fine Type": f.fine,
            "Amount (£)": f.amount.toFixed(2),
            Status: f.status ?? "Unpaid",
            "Match Date": f.matchDate ? new Date(f.matchDate).toLocaleDateString("en-GB") : "",
            Notes: f.notes ?? "",
            "Created At": f.createdAt ? new Date(f.createdAt).toLocaleDateString("en-GB") : "",
          })));
        }}>
          <Download className="h-4 w-4 mr-1" /> Export CSV
        </Button>
        <Link href="/fines/add-fine" className="block">
          <Button variant="outline">
            Add Fine <Plus className="ml-2 h-4 w-4" />
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Fines</CardDescription>
            <CardTitle>£{totals.total.toFixed(2)}</CardTitle>
            <CardDescription>{totals.totalCount} fines</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paid</CardDescription>
            <CardTitle className="text-emerald-600">£{totals.paid.toFixed(2)}</CardTitle>
            <CardDescription>{totals.paidCount} fines</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unpaid</CardDescription>
            <CardTitle className="text-amber-600">£{totals.unpaid.toFixed(2)}</CardTitle>
            <CardDescription>{totals.unpaidCount} fines</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <FilterIcon className="h-4 w-4" /> Filters
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setFiltersOpen((v) => !v)}>
              {filtersOpen ? "Hide" : "Show"} Filters
            </Button>
          </div>
        </CardHeader>
        {filtersOpen && (
          <CardContent className="space-y-3">
            <Select value={filterDate} onValueChange={setFilterDate}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by exact match date" />
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

            {/* Date range — pick a single day or a from→to span */}
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !dateRange?.from && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from
                      ? dateRange.to
                        ? `${format(dateRange.from, "dd MMM yyyy")} – ${format(dateRange.to, "dd MMM yyyy")}`
                        : format(dateRange.from, "dd MMM yyyy")
                      : "Filter by date range"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={1}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {(dateRange?.from || dateRange?.to) && (
                <Button variant="ghost" size="sm" onClick={() => setDateRange(undefined)}>
                  Clear
                </Button>
              )}
            </div>

            <Select value={filterSeason} onValueChange={setFilterSeason}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by season" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All seasons</SelectItem>
                {seasons.map((season) => (
                  <SelectItem key={season.id} value={String(season.id)}>
                    {season.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPlayer} onValueChange={setFilterPlayer}>
              <SelectTrigger className="w-full">
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

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">Rows: {filteredFines.length}</Badge>
              {filterDate !== "all" && <Badge>Date: {filterDate}</Badge>}
              {(dateRange?.from || dateRange?.to) && (
                <Badge>
                  Range: {dateRange?.from ? format(dateRange.from, "dd/MM/yy") : "…"}–{dateRange?.to ? format(dateRange.to, "dd/MM/yy") : "…"}
                </Badge>
              )}
              {filterSeason !== "all" && (
                <Badge>Season: {seasons.find((s) => String(s.id) === filterSeason)?.name ?? filterSeason}</Badge>
              )}
              {filterPlayer !== "all" && <Badge>Player: {filterPlayer}</Badge>}
            </div>

            <Button
              variant="ghost"
              className="w-full"
              onClick={() => {
                setFilterDate("all");
                setFilterPlayer("all");
                setFilterSeason("all");
                setDateRange(undefined);
              }}
            >
              Clear Filters <EraserIcon className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary" className="gap-2"><LayoutDashboard className="h-4 w-4" /> Summary</TabsTrigger>
          <TabsTrigger value="details" className="gap-2"><Table2 className="h-4 w-4" /> Details</TabsTrigger>
          <TabsTrigger value="charts" className="gap-2"><ChartColumn className="h-4 w-4" /> Charts</TabsTrigger>
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
        <TabsContent value="charts" className="space-y-4">
          <FineSeasonComparison playerFinesData={playerFinesData} seasons={seasons} />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <FineChart playerFinesData={filteredFines} />
            <FineTypeBarChart playerFinesData={filteredFines} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
