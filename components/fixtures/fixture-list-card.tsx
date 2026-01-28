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

interface EnhancedFixtureCardProps {
  data: FixtureListSummary[];
  kpis: FixtureKpiSummary[];
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
            wins ({fixtureKpi.totalGamesWins}) losses (
            {fixtureKpi.totalGamesLosses})
          </p>
          <p>
            team ({fixtureKpi.totalTeamGameWins}) vs losses: (
            {fixtureKpi.totalteamGameLosses})
          </p>
          <p>
            doubles ({fixtureKpi.totalDoublesGameWins}) vs losses: (
            {fixtureKpi.totalDoublesGameLosses})
          </p>
           <p>
            singles ({fixtureKpi.totalSinglesGameWins}) vs losses: (
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
          🏆{" "}
          {fixtureData.homeTeamScore < fixtureData.awayTeamScore
            ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
            : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}{" "}
          -{" "}
          {fixtureData.awayTeamScore < fixtureData.homeTeamScore
            ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
            : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}
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
                    href={`/fixture/${fixtureData.id}`}
                    className="flex items-center gap-2"
                  >
                    <EyeIcon className="h-4 w-4 hover:text-black" />
                    View Match
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                  <Link
                    href={`/fixture/edit-fixture?id=${fixtureData.id}`}
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
    <div>
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

      <Tabs defaultValue="overview" className="w-full lg:w-[50%] mx-auto mt-2">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          {/** <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          */}
        </TabsList>
        <TabsContent value="overview">
          {props.kpis &&
            props.kpis
              .filter((f) => (seasonFilter ? f.season === seasonFilter : true))
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
            .map((fixture) => (
              <div key={fixture.id} className="mb-4 mx-auto">
                {fixtureItem({ fixtureData: fixture, key: fixture.id })}
              </div>
            ))}
        </TabsContent>
        <TabsContent value="stats"></TabsContent>
        <TabsContent value="charts"></TabsContent>
      </Tabs>
    </div>
  );
}
