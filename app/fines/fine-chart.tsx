"use client"

import { TrendingUp } from "lucide-react"
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { FineSummaryProps } from "./player-fines-summary"

export const description = "A chart showing total fines and cost by match date."


const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function FineChart( {playerFinesData }: FineSummaryProps) {


const matchdays = Array.from(
    new Set(
        playerFinesData
            .map((item) => item.matchDate)
            .filter((date): date is string => date !== null)
            .map((date) => new Date(date).toLocaleDateString("en-GB"))
    )
).sort((a, b) => {
    // Parse "en-GB" date strings (dd/mm/yyyy) to Date objects for correct sorting
    const [dayA, monthA, yearA] = a.split('/').map(Number);
    const [dayB, monthB, yearB] = b.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateA.getTime() - dateB.getTime();
});
// Example data: replace with your actual fine summary data as needed
const chartData = [
    ...matchdays.map((date) => {
        const finesForDate = playerFinesData.filter(
            (c) =>
                c.matchDate &&
                new Date(c.matchDate).toLocaleDateString("en-GB") === date
        );
        const totalFines = finesForDate.length || 0; // Count of fines for the date
        
        const totalCost = finesForDate.reduce(
            (acc, fine) => acc + (fine.amount ?? 0),
            0
        );

        const avgCost = totalCost / (totalFines || 1); // Avoid division by zero
        return {
            matchDate: date,
            totalFines: totalFines,
            totalCost: totalCost,
            avgCost: avgCost,
        };
    }),
]

return (
    <Card>
        <CardHeader>
            <CardTitle>Fines by Match</CardTitle>
            <CardDescription>
                Showing total fines and cost by match date
            </CardDescription>
        </CardHeader>
        <CardContent>
            <ChartContainer config={{
                totalFines: { label: "Total Fines", color: "var(--chart-1)" },
                totalCost: { label: "Total Cost", color: "var(--chart-2)" },
                avgCost: { label: "Avg. Cost", color: "var(--chart-3)" },
                ...chartConfig,
            }}>
                <AreaChart
                    accessibilityLayer
                    data={chartData}
                    margin={{
                        left: 12,
                        right: 12,
                    }}
                >
                    <CartesianGrid vertical={false} />
                    <XAxis
                        dataKey="matchDate"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        tickFormatter={(value) => value} // shows MM-DD
                    />
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                        dataKey="totalFines"
                        type="natural"
                        fill="var(--chart-1)"
                        fillOpacity={0.4}
                        stroke="var(--chart-1)"
                    />
                    <Area
                        dataKey="totalCost"
                        type="natural"
                        fill="var(--chart-2)"
                        fillOpacity={0.2}
                        stroke="var(--chart-2)"
                    />
                     <Area
                        dataKey="avgCost"
                        type="natural"
                        fill="var(--chart-3)"
                        fillOpacity={0.3}
                        stroke="var(--chart-3)"
                    />
                </AreaChart>
            </ChartContainer>
        </CardContent>
        <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                    {/*
                      Calculate the overall average fine per match (totalCost / number of matches)
                    */}
                    {(() => {
                      const totalCost = chartData.reduce((acc, d) => acc + d.totalCost, 0);
                      const numMatches = chartData.length;
                      const avgFinePerMatch = numMatches > 0 ? totalCost / numMatches : 0;
                      return (
                        <div className="flex items-center gap-2 leading-none font-medium">
                          Avg fine by match: £{avgFinePerMatch.toFixed(2)} <TrendingUp className="h-4 w-4" />
                        </div>
                      );
                    })()}
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        Fines from {matchdays[0]} to {matchdays[matchdays.length - 1]}
                    </div>
                </div>
            </div>
        </CardFooter>
    </Card>
)
}
