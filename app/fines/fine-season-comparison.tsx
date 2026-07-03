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
} from "@/components/ui/chart";

type FineRow = { fine: string; amount: number; season?: string | null };

// Tooltip: fine count + cost per season for the hovered fine type.
type TooltipEntry = { dataKey?: string; value?: number; color?: string; payload?: Record<string, number> };
function CompareTooltip({
  active,
  payload,
  label,
  config,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
  config: Record<string, { label?: React.ReactNode }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-md">
      <p className="font-medium mb-1">{label}</p>
      <div className="space-y-1">
        {payload.map((entry) => {
          const key = entry.dataKey ?? "";
          const cost = entry.payload?.[`${key}Cost`] ?? 0;
          const count = entry.value ?? 0;
          return (
            <div key={key} className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-[2px]" style={{ background: entry.color }} />
              <span className="text-muted-foreground">{config[key]?.label ?? key}</span>
              <span className="ml-auto font-mono tabular-nums">
                {count} fine{count !== 1 ? "s" : ""} · £{Number(cost).toFixed(2)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function FineSeasonComparison({
  playerFinesData,
  seasons,
  selectedSeasonId,
}: {
  playerFinesData: FineRow[];
  seasons: { id: number; name: string; startDate?: string; lastSeasonId?: number | null }[];
  // The fines-page season filter value (a season id string, or "all"/undefined).
  selectedSeasonId?: string;
}) {
  // The current season = the one with the highest start date. "This" season
  // follows the season filter when a specific season is selected.
  const byStartDesc = [...seasons].sort((a, b) => (b.startDate ?? "").localeCompare(a.startDate ?? ""));
  const currentSeason = byStartDesc[0] ?? null;
  const thisSeason =
    selectedSeasonId && selectedSeasonId !== "all"
      ? seasons.find((s) => String(s.id) === selectedSeasonId) ?? currentSeason
      : currentSeason;

  if (!thisSeason) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Season comparison</CardTitle>
          <CardDescription>No seasons to compare.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // "Last" season = the explicit lastSeasonId link, else the next-older season.
  const lastSeason =
    thisSeason.lastSeasonId != null
      ? seasons.find((s) => s.id === thisSeason.lastSeasonId) ?? null
      : byStartDesc[byStartDesc.findIndex((s) => s.id === thisSeason.id) + 1] ?? null;

  const thisName = thisSeason.name;
  const lastName = lastSeason?.name ?? null;

  // No prior season / no data for it → compare against zero values.
  const thisFines = playerFinesData.filter((f) => f.season === thisName);
  const lastFines = lastName ? playerFinesData.filter((f) => f.season === lastName) : [];
  const cost = (rows: FineRow[]) => rows.reduce((acc, f) => acc + (f.amount ?? 0), 0);

  const thisCount = thisFines.length;
  const lastCount = lastFines.length;
  const thisCost = cost(thisFines);
  const lastCost = cost(lastFines);

  // Change is by number of fines (more fines = worse = red).
  const pctChange = lastCount > 0 ? ((thisCount - lastCount) / lastCount) * 100 : thisCount > 0 ? 100 : 0;
  const up = thisCount > lastCount;
  const flat = thisCount === lastCount;

  // Count of fines per type (with cost carried for the tooltip), biggest first.
  const types = [...new Set([...thisFines, ...lastFines].map((f) => f.fine))];
  const chartData = types
    .map((type) => {
      const t = thisFines.filter((f) => f.fine === type);
      const l = lastFines.filter((f) => f.fine === type);
      return { type, thisSeason: t.length, lastSeason: l.length, thisSeasonCost: cost(t), lastSeasonCost: cost(l) };
    })
    .sort((a, b) => b.thisSeason + b.lastSeason - (a.thisSeason + a.lastSeason));

  const chartConfig = {
    thisSeason: { label: thisName, color: "var(--chart-1)" },
    lastSeason: { label: lastName ?? "Last season", color: "var(--chart-2)" },
  } satisfies ChartConfig;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Season comparison</CardTitle>
        <CardDescription>Fines for {thisName} vs {lastName ?? "prior season"}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Totals — number of fines (cost as sub-text) */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1 truncate">{thisName}</p>
            <p className="text-2xl font-bold tabular-nums">{thisCount}</p>
            <p className="text-xs text-muted-foreground">fine{thisCount !== 1 ? "s" : ""} · £{thisCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1 truncate">{lastName ?? "No prior season"}</p>
            <p className="text-2xl font-bold tabular-nums">{lastCount}</p>
            <p className="text-xs text-muted-foreground">fine{lastCount !== 1 ? "s" : ""} · £{lastCost.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Change</p>
            <p className={`text-2xl font-bold flex items-center justify-center gap-1 ${flat ? "" : up ? "text-red-500" : "text-emerald-500"}`}>
              {flat ? <ArrowRight className="h-5 w-5" /> : up ? <ArrowUpRight className="h-5 w-5" /> : <ArrowDownRight className="h-5 w-5" />}
              {pctChange > 0 ? "+" : ""}{pctChange.toFixed(0)}%
            </p>
            <p className="text-xs text-muted-foreground">fines vs last season</p>
          </div>
        </div>

        {/* Count of fines per type */}
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
              <ChartTooltip content={<CompareTooltip config={chartConfig} />} />
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
