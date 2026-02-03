"use client";
import {
  FixtureKpiSummary,
  FixtureListSummary,
} from "@/types/fixtures-summary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import {
  Calendar,
  ChevronDown,
  EyeIcon,
  HouseIcon,
  Pencil,
  Plus,
  Trash,
  Trophy,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface EnhancedFixtureCardProps {
  data: FixtureListSummary[];
  kpis: FixtureKpiSummary[];
  playerGameSummary: GamesSummary[];
}

function seasonPlayerListItem({
  data,
  key,
}: {
  data: GamesSummary;
  key?: string | number;
}) {
  return (
    <Card key={key} className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-bold">
          Season {data.season}
        </CardTitle>
        <CardTitle className="text-lg semibold">
          <div>Total matches: {data.totalMatches}</div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/** Overall table first */}
        <div key={"_overall"}>
          <h3 className="font-semibold mb-2">Overall</h3>
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
            <TableBody key={"_overall_"}>
              {data.gameTypesSummaries &&
                data.gameTypesSummaries.length > 0 &&
                data.gameTypesSummaries
                  .filter((summary) => summary.gameType === "Overall" && summary.wins + summary.loses > 0)
                  .sort((a, b) => (b.rankValue ?? 0) - (a.rankValue ?? 0))
                  .map((summary) => (
                    <TableRow
                      key={summary.playerId + "_overall"}
                      
                    >
                         <TableCell>{summary.playerName}{summary.nickname ? ` (${summary.nickname})` : null}</TableCell>
                      <TableCell>{summary.wins + summary.loses}</TableCell>
                      <TableCell>{summary.wins}</TableCell>
                      <TableCell>{summary.loses}</TableCell>
                      <TableCell>{summary.rankValue}</TableCell>
                    </TableRow>
                  ))}
            </TableBody>
          </Table>
        </div>
        {data.gameTypesSummaries &&
          data.gameTypesSummaries.length > 0 &&
          ["Singles", "Doubles", "Team Game"].map((type) => {
            const gameTypeRows = data.gameTypesSummaries
              ?.sort((a, b) => (b.rankValue ?? 0) - (a.rankValue ?? 0))
              .filter((summary) => summary.gameType === type && summary.wins + summary.loses > 0);
            return (
              <div key={type} className="mt-6">
                <h3 className="text-lg font-semibold mb-2">{type}</h3>

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
                    {gameTypeRows
                      ?.filter((summary) => summary.gameType === type)
                      .map((summary) => (
                        <TableRow
                          key={summary.playerId}
                        >
                        <TableCell>{summary.playerName}{summary.nickname ? ` (${summary.nickname})` : null}</TableCell>
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
}

function seasonKpiItem({
  fixtureKpi,
  key,
}: {
  fixtureKpi: FixtureKpiSummary;
  key?: string | number;
}) {
  return (
    <Card key={key ?? fixtureKpi.season} className="p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{fixtureKpi.season}</p>
          <p className="mt-1 text-2xl font-semibold">
            Matches: {fixtureKpi.totalFixtures}
            {"  "}
            <br />
            <p className="mt-1 text-lg">Points {fixtureKpi.totalPoints}</p>
          </p>
          <p>
            wins ({fixtureKpi.totalFixtureWins}) losses (
            {fixtureKpi.totalFixtureLosses})
          </p>
          <p>
            home wins ({fixtureKpi.totalHomeWins}) vs losses: (
            {fixtureKpi.totalHomeLosses})
          </p>
          <p>
            away wins ({fixtureKpi.totalAwayWins}) vs losses: (
            {fixtureKpi.totalAwayLosses})
          </p>
        </div>
        <div className="text-muted-foreground text-xs">
          {/* small contextual text or icon placeholder */}
          {/* replace with sparkline or icon if available */}
          <div className="text-2xl">
            {" "}
            {fixtureKpi.totalFixturePercentWin.toFixed(1)}% 🏆
          </div>
        </div>
      </div>
      <Separator className="black" />
      <div className="flex items-center justify-between">
        <div>
          <p className="mt-1 text-2xl font-semibold">
            Games: {fixtureKpi.totalGames}
            {"  "}
            <br />
          </p>
          <p>
            Wins ({fixtureKpi.totalGamesWins}) Losses (
            {fixtureKpi.totalGamesLosses})
          </p>
          <p>
            Team Wins ({fixtureKpi.totalTeamGameWins}) vs Losses: (
            {fixtureKpi.totalteamGameLosses})
          </p>
          <p>
            Doubles Wins ({fixtureKpi.totalDoublesGameWins}) vs Losses: (
            {fixtureKpi.totalDoublesGameLosses})
          </p>
          <p>
            Singles Wins ({fixtureKpi.totalSinglesGameWins}) vs Losses: (
            {fixtureKpi.totalSinglesGameLosses})
          </p>
        </div>
        <div className="text-muted-foreground text-xs">
          {/* small contextual text or icon placeholder */}
          {/* replace with sparkline or icon if available */}
          <div className="text-2xl">
            {" "}
            {fixtureKpi.totalGamesPercentWin.toFixed(1)}% 🏆
          </div>
        </div>
      </div>
    </Card>
  );
}

function fixtureItem({
  fixtureData,
  key,
}: {
  fixtureData: FixtureListSummary;
  key?: number;
}) {
  return (
    <Card className="p-1 pt-2" key={key}>
      <CardHeader>
        <CardTitle>
          <div className="flex justify-between items-center">
            <div>
              🏆{" "}
              {fixtureData.homeTeamScore < fixtureData.awayTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}{" "}
              -{" "}
              {fixtureData.awayTeamScore < fixtureData.homeTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}{" "}
            </div>
            <div>
              <Badge
                variant={
                  fixtureData.matchStatus === "completed"
                    ? "default"
                    : fixtureData.matchStatus === "cancelled"
                    ? "secondary"
                    : "default"
                }
                className="ml-2"
              >
                {fixtureData.matchStatus}
              </Badge>
            </div>
          </div>
        </CardTitle>
        <div className="flex flex-col lg:flex-row items-start gap-2">
          <CardDescription>
            <Badge variant="secondary" className="min-w-[100px] text-left">
              {fixtureData.season} - {fixtureData.league}
            </Badge>
          </CardDescription>
          <CardDescription>
            <Badge variant="secondary" className="min-w-[100px] text-left">
              {fixtureData.league}
            </Badge>
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-2">
              <HouseIcon size={12} />
              <div>{fixtureData.matchLocation}</div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={12} />
              <div>{fixtureData.matchDate}</div>
            </div>
            <div>
              <Separator className="my-2" />
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={12} />
              <div>Team game: {fixtureData.teamGameResult}</div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={12} />
              <div>Doubles: {fixtureData.doublesGameResult}</div>
            </div>
            <div className="flex items-center gap-2">
              <Trophy size={12} />
              <div>Singles: {fixtureData.singlesGameResult}</div>
            </div>
          </div>
          <div>
            <DropdownMenu key={fixtureData.id}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant={"ghost"}
                  className=" flex items-center flex-row gap-1"
                  title="Fixture Actions"
                >
                  Actions <span></span>
                  <ChevronDown className="h-8 w-8" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                  <Link
                    href={`/fixtures/${fixtureData.id}`}
                    className="flex items-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4 hover:text-black" />
                    View Match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:focus:bg-yellow-100 focus:bg-yellow-100 cursor-pointer">
                  <Link
                    href={`/fixture/edit-fixtures?id=${fixtureData.id}`}
                    className="flex items-center gap-2"
                  >
                    <Pencil className="h-4 w-4 hover:text-black" />
                    Edit Match
                  </Link>
                </DropdownMenuItem>

                <DropdownMenuItem
                  disabled={true}
                  //onClick={() => handleDeleteMatch({ id: fixtureData.id })}
                  className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                >
                  <Trash className="h-4 w-4 hover:text-black" />
                  Delete Match
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
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
