"use client"

import { Pie, PieChart } from "recharts"

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

export const description = "A simple pie chart of fines by type"

const chartConfig = {
  visitors: {
    label: "Visitors",
  },
  chrome: {
    label: "Chrome",
    color: "var(--chart-1)",
  },
  safari: {
    label: "Safari",
    color: "var(--chart-2)",
  },
  firefox: {
    label: "Firefox",
    color: "var(--chart-3)",
  },
  edge: {
    label: "Edge",
    color: "var(--chart-4)",
  },
  other: {
    label: "Other",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig

export function FineTypeBarChart({playerFinesData }: FineSummaryProps) {
    
    // Create chart data as a summary of type names by count of fines
    const data =
      playerFinesData?.reduce<Record<string, number>>((acc, fine) => {
        acc[fine.fine] = (acc[fine.fine] || 0) + 1
        return acc
      }, {}) ?? {}

    const greenShades = [
      "#4CAF50", // Green 500
      "#388E3C", // Green 700
      "#81C784", // Green 300
      "#2E7D32", // Green 800
      "#A5D6A7", // Green 200
      "#66BB6A", // Green 400
    ]
    const chartData = Object.entries(data).map(([type, count], idx) => ({
      type,
      count,
      fill: greenShades[idx % greenShades.length],
    }))

    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle>Fines by Type</CardTitle>
          <CardDescription>Total fines by fine type</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[480px] w-full"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Pie
                data={chartData}
                dataKey="count"
                nameKey="type"
                label={({ type, percent }) =>
                  `${type}: ${(percent * 100).toFixed(0)}%`
                }
              />
            </PieChart>
          </ChartContainer>
        </CardContent>
        <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
                <div className="grid gap-2">
                    {/*
                      Calculate the overall average fine per match (totalCost / number of matches)
                    */}
                    {(() => {
                        // Calculate total cost and total count
                        const totalCost = playerFinesData.reduce((acc, d) => acc + d.amount, 0);
                        const totalCount = playerFinesData.length;

                        // Get sorted dates from fines
                        const sortedDates = playerFinesData
                            .map(d => d.matchDate ? new Date(d.matchDate) : undefined)
                            .sort((a, b) => {
                                if (!a && !b) return 0;
                                if (!a) return 1;
                                if (!b) return -1;
                                return a!.getTime() - b!.getTime();
                            });

                        const startDate = sortedDates[0];
                        const endDate = sortedDates[sortedDates.length - 1];
                    

                        return (
                            <>
                                <div className="flex items-center gap-2 leading-none font-medium">
                                    {totalCount} Fines - Total Cost: £{totalCost.toFixed(2)}
                                </div>
                                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                                    Fines from {startDate?.toLocaleDateString()} to {endDate?.toLocaleDateString()}
                                </div>
                            </>
                        );
                    })()}
                </div>
            </div>
        </CardFooter>
        
      </Card>
    )
}
