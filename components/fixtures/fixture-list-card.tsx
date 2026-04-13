"use client";
import {
  FixtureKpiSummary,
  FixtureListSummary,
} from "@/types/fixtures-summary";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Calendar,
  EyeIcon,
  HouseIcon,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Link from "next/link";
import { Separator } from "../ui/separator";
import React from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  GamesSummary,
} from "@/server/actions/get-player-games-summary";

interface EnhancedFixtureCardProps {
  data: FixtureListSummary[];
  kpis: FixtureKpiSummary[];
  playerGameSummary: GamesSummary[];
}

function PlayerStatsList({ summaries }: { summaries: GamesSummary["gameTypesSummaries"] }) {
  if (!summaries) return null;

  return (
    <div className="space-y-6">
      {["Overall", "Singles", "Doubles", "Team Game"].map((type) => {
        const rows = summaries
          .filter((s) => s.gameType === type && s.wins + s.loses > 0)
          .sort((a, b) => (a.rankValue ?? 999) - (b.rankValue ?? 999));

        if (rows.length === 0) return null;

        return (
          <div key={type}>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">{type}</p>
            <div className="space-y-2">
              {rows.map((s) => (
                <div key={s.playerId} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-5 shrink-0 text-right">#{s.rankValue}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {s.playerName}{s.nickname ? ` (${s.nickname})` : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {s.gamesPlayed ?? (s.wins + s.loses)}P · {s.legsFor ?? 0}F – {s.legsAgainst ?? 0}A
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {s.wins}W–{s.loses}L
                      <span className={`ml-1 ${s.wins - s.loses > 0 ? "text-green-600" : s.wins - s.loses < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                        ({s.wins - s.loses > 0 ? "+" : ""}{s.wins - s.loses})
                      </span>
                    </p>
                    <div className="w-20">
                      <WinBar wins={s.wins} losses={s.loses} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function seasonPlayerListItem({
  data,
  key,
}: {
  data: GamesSummary;
  key?: string | number;
}) {
  return (
    <Card key={key}>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Season {data.season}</CardTitle>
        <p className="text-xs text-muted-foreground">{data.totalMatches} matches played</p>
      </CardHeader>
      <CardContent>
        <PlayerStatsList summaries={data.gameTypesSummaries} />
      </CardContent>
    </Card>
  );
}

function WinBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  const pct = total > 0 ? Math.round((wins / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div className="h-full rounded-full bg-green-500" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
    </div>
  );
}

function seasonKpiItem({
  fixtureKpi,
  key,
}: {
  fixtureKpi: FixtureKpiSummary;
  key?: string | number;
}) {
  return (
    <div key={key ?? fixtureKpi.season} className="space-y-4">
      <h2 className="text-lg font-semibold">{fixtureKpi.season}</h2>
      {/* KPI grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
       
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Matches</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fixtureKpi.totalFixtures}</p>
            <p className="text-xs text-muted-foreground">{fixtureKpi.totalFixtureWins}W – {fixtureKpi.totalFixtureLosses}L</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Win rate</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fixtureKpi.totalFixturePercentWin.toFixed(0)}%</p>
            <p className="text-xs text-muted-foreground">{fixtureKpi.totalPoints} pts scored</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Home</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fixtureKpi.totalHomeWins}W</p>
            <p className="text-xs text-muted-foreground">{fixtureKpi.totalHomeLosses} losses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-1"><CardTitle className="text-xs text-muted-foreground font-normal">Away</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{fixtureKpi.totalAwayWins}W</p>
            <p className="text-xs text-muted-foreground">{fixtureKpi.totalAwayLosses} losses</p>
          </CardContent>
        </Card>
      </div>

      {/* Game breakdown */}
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-sm">Game breakdown</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Singles", wins: fixtureKpi.totalSinglesGameWins, losses: fixtureKpi.totalSinglesGameLosses },
              { label: "Doubles", wins: fixtureKpi.totalDoublesGameWins, losses: fixtureKpi.totalDoublesGameLosses },
              { label: "Team Game", wins: fixtureKpi.totalTeamGameWins, losses: fixtureKpi.totalteamGameLosses },
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
    </div>
  );
}

function fixtureItem({
  fixtureData,
  key,
}: {
  fixtureData: FixtureListSummary;
  key?: number;
}) {
  const isWin = fixtureData.isAppTeamWin;
  const isInProgress = fixtureData.matchStatus === "in progress";
  const isCancelled = fixtureData.matchStatus === "cancelled";
  const isScheduled = !isInProgress && !isCancelled && fixtureData.matchStatus === "scheduled";

  return (
    <Card key={key}>
      <CardHeader className="pb-3">
        {/* Meta row */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar size={12} />
            <span>{fixtureData.matchDate}</span>
            <span>·</span>
            <HouseIcon size={12} />
            <span>{fixtureData.matchLocation}</span>
          </div>
          <div className="flex items-center gap-1">
            <DropdownMenu key={fixtureData.id}>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                  <Link href={`/fixtures/${fixtureData.id}`} className="flex items-center gap-2">
                    <EyeIcon className="h-4 w-4" /> View Match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:focus:bg-yellow-100 focus:bg-yellow-100 cursor-pointer">
                  <Link href={`/fixtures/edit-fixture?id=${fixtureData.id}`} className="flex items-center gap-2">
                    <Pencil className="h-4 w-4" /> Edit Match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem disabled className="cursor-pointer flex items-center gap-2">
                  <Trash className="h-4 w-4" /> Delete Match
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {isInProgress ? (
              <span className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
                </span>
                <span className="text-xs font-medium text-red-500">In Progress</span>
              </span>
            ) : isCancelled ? (
              isWin
                ? <Badge variant="outline" className="text-green-600 border-green-500">Cancelled (win)</Badge>
                : <Badge variant="outline" className="text-destructive border-destructive">Cancelled (lost)</Badge>
            ) : (
              <Badge
                variant={isScheduled ? "outline" : isWin ? "default" : "destructive"}
                className={isScheduled ? "text-amber-500 border-amber-400" : isWin ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isScheduled ? "Scheduled" : isWin ? "Win" : "Loss"}
              </Badge>
            )}
          </div>
        </div>

          {/* Teams title */}
        <p className="text-base font-semibold mt-1">{fixtureData.homeTeam} vs {fixtureData.awayTeam}</p>
      </CardHeader>

      {!isScheduled && (
        <CardContent className="pt-0 pb-3">
          <div className="flex items-center justify-center gap-6 py-3 rounded-lg bg-muted/50">
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{fixtureData.homeTeam}</p>
              <p className="text-4xl font-extrabold">{fixtureData.homeTeamScore}</p>
            </div>
            <p className="text-2xl font-light text-muted-foreground">–</p>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">{fixtureData.awayTeam}</p>
              <p className="text-4xl font-extrabold">{fixtureData.awayTeamScore}</p>
            </div>
          </div>
        </CardContent>
      )}

      {!isScheduled && (
        <CardContent className="pt-0 pb-3">
          <Separator className="mb-3" />
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            {[
              { label: "Team Game", result: fixtureData.teamGameResult },
              { label: "Doubles", result: fixtureData.doublesGameResult },
              { label: "Singles", result: fixtureData.singlesGameResult },
            ].map(({ label, result }) => (
              <div key={label}>
                <p className="text-muted-foreground mb-0.5">{label}</p>
                <p className="font-medium">{result}</p>
              </div>
            ))}
          </div>
        </CardContent>
      )}

    </Card>
  );
}

export default function EnhancedFixtureCard(props: EnhancedFixtureCardProps) {
  const [seasonFilter, setSeasonFilter] = React.useState<string | null>(null);

  return (
    <div className="w-full lg:w-[50%] mx-auto">
      <h1 className="text-3xl font-bold mb-6">Fixtures</h1>
      <div className="flex justify-between items-center gap-2">
        <div>
          <Link href="/fixtures/add-fixture" className="">
            <Button size="sm" className="mb-0" variant="outline">
              Add Match <Plus className="ml-2" size={16} />
            </Button>
          </Link>
        </div>
        <div>
          {/* Placeholder for future filters or actions */}
          <Select
            key={seasonFilter ?? "all-seasons"}
            onValueChange={(value) => {
              if (value === "all-seasons") {
                setSeasonFilter(null);
              } else {
                setSeasonFilter(value);
              }
            }}
            value={seasonFilter ?? "all-seasons"}
            defaultValue="all-seasons"
          >
            <SelectTrigger className="w-[180px] mb-2">
              <SelectValue placeholder="Select a season" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Seasons</SelectLabel>
                <SelectItem value="all-seasons">All Seasons</SelectItem>
                {props.kpis.map((kpi) => (
                  <SelectItem key={kpi.season} value={kpi.season}>
                    {kpi.season}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full mt-2">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
           <TabsTrigger value="stats">Player Stats</TabsTrigger>
          {/** <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          */}
        </TabsList>
        <TabsContent value="overview">
          {props.kpis &&
            props.kpis
              .filter((f) => (seasonFilter ? f.season === seasonFilter : true))
              //.sort((a, b) => b..localeCompare(a.season))
              .map((fixtureKpi) => (
                <div
                  key={fixtureKpi.season}
                  className="mb-4 mx-auto flex-col gap-2"
                >
                  {seasonKpiItem({ fixtureKpi, key: fixtureKpi.season })}
                </div>
              ))}
        </TabsContent>
        <TabsContent value="details">
          {props.data
            .filter((f) => (seasonFilter ? f.season === seasonFilter : true))
            .sort((a, b) => {
              const dateA = a.matchDate
                ? Date.parse(a.matchDate.split("/").reverse().join("-"))
                : 0;
              const dateB = b.matchDate
                ? Date.parse(b.matchDate.split("/").reverse().join("-"))
                : 0;
              return dateB - dateA;
            }) // Sort by matchDate in descending order
            .map((fixture) => (
              <div key={fixture.id} className="mb-4 mx-auto">
                {fixtureItem({ fixtureData: fixture, key: fixture.id })}
              </div>
            ))}
        </TabsContent>
        <TabsContent value="stats">
            {props.playerGameSummary && props.playerGameSummary
              .filter((f) =>
                seasonFilter ? f.season === seasonFilter : true
              )
              .map((playerSummary) => (
                <div
                  key={playerSummary.season}
                  className="mb-4 mx-auto flex-col gap-2"
                >
                  {seasonPlayerListItem({
                    data: playerSummary,
                    key: playerSummary.season,
                  })}
                </div>
              ))}



        </TabsContent>
        <TabsContent value="charts"></TabsContent>
      </Tabs>
    </div>
  );
}
