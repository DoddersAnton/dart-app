"use client";

import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type FineRow = { fine: string; amount: number; season?: string | null };

export function FineSeasonComparison({
  playerFinesData,
  seasons,
}: {
  playerFinesData: FineRow[];
  seasons: { id: number; name: string }[];
}) {
  // seasons arrive newest-first, so [0] = this season, [1] = last season.
  const thisName = seasons[0]?.name ?? null;
  const lastName = seasons[1]?.name ?? null;

  if (!thisName || !lastName) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Season comparison</CardTitle>
          <CardDescription>Need at least two seasons of fines to compare.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const thisFines = playerFinesData.filter((f) => f.season === thisName);
  const lastFines = playerFinesData.filter((f) => f.season === lastName);
  const sum = (rows: FineRow[]) => rows.reduce((acc, f) => acc + (f.amount ?? 0), 0);

  const thisTotal = sum(thisFines);
  const lastTotal = sum(lastFines);
  const pctChange = lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : thisTotal > 0 ? 100 : 0;
  const up = thisTotal > lastTotal;
  const flat = thisTotal === lastTotal;

  // £ per fine type, both seasons, biggest combined first.
  const types = [...new Set([...thisFines, ...lastFines].map((f) => f.fine))];
  const chartData = types
    .map((type) => ({
      type,
      thisSeason: sum(thisFines.filter((f) => f.fine === type)),
      lastSeason: sum(lastFines.filter((f) => f.fine === type)),
    }))
    .sort((a, b) => b.thisSeason + b.lastSeason - (a.thisSeason + a.lastSeason));

  const chartConfig = {
    thisSeason: { label: thisName, color: "var(--chart-1)" },
    lastSeason: { label: lastName, color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season comparison</CardTitle>
        <CardDescription>Fines this season vs last season</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Totals */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1 truncate">{thisName}</p>
            <p className="text-2xl font-bold">£{thisTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{thisFines.length} fine{thisFines.length !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 truncate">{lastName}</p>
            <p className="text-2xl font-bold">£{lastTotal.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">{lastFines.length} fine{lastFines.length !== 1 ? "s" : ""}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Change</p>
            <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${flat ? "" : up ? "text-red-500" : "text-emerald-500"}`}>
              {flat ? <ArrowRight className="h-5 w-5" /> : up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {pctChange > 0 ? "+" : ""}{pctChange.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">vs last season</p>
          </div>
        </div>

        {/* By fine type */}
        {chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={chartData} margin={{ left: 12, right: 12 }}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="type"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                interval={0}
                tickFormatter={(value: string) => (value.length > 12 ? `${value.slice(0, 11)}…` : value)}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar dataKey="thisSeason" fill="var(--color-thisSeason)" radius={4} />
              <Bar dataKey="lastSeason" fill="var(--color-lastSeason)" radius={4} />
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
}
