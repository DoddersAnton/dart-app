"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EraserIcon, FilterIcon, Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PlayerFinesSummaryDataTable } from "./player-summary-table";
import { PlayerFinesDataTable } from "./playerfines-data-table";
import { summaryColumns } from "./player-summary-columns";
import { playerFinesColumns } from "./player-fines-columns";
import { useState } from "react";
import { FineChart } from "./fine-chart";

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
  {
    const [filterDate, setFilterDate] = useState<string | undefined>(undefined);
    const [key, setKey] = useState(+new Date());

    const dates = Array.from(
      new Set(
        playerFinesData
          .map((item) => item.matchDate)
          .filter((date): date is string => date !== null)
          .map((date) => new Date(date).toLocaleDateString("en-GB"))
      )
    );

    const finesSummary = Object.values(
      playerFinesData
        .filter(
          (c) =>
            c.matchDate &&
            new Date(c.matchDate).toLocaleDateString("en-GB") ===
              (filterDate !== undefined
                ? filterDate
                : new Date(c.matchDate).toLocaleDateString("en-GB"))
        )
        .reduce(
          (
            acc: Record<
              string,
              { player: string; total: number; count: number, games: number }
            >,
            fine
          ) => {
            const player = fine.player;
            if (!acc[player]) {
              acc[player] = {
                player: player,
                total: 0,
                count: 0,
                games: 0,
              };
            }
            acc[player].total += fine.amount;
            acc[player].count += 1;
            acc[player].games = new Set(
              playerFinesData
                .filter(f => f.player === player && f.matchDate)
                .map(f => new Date(f.matchDate!).toLocaleDateString("en-GB"))
            ).size;

            return acc;
          },
          {} as Record<string, { player: string; total: number; count: number; games: number }>
        )
    );

    const handleDateChange = (value: string) => {
      setFilterDate(value);
    };

    return (
      <Tabs
        defaultValue="summary"
        className="w-full px-2 mx-auto"
      >
        <div className="flex items-center flex-row gap-2 mb-2">
          <FilterIcon className="" />
          <Select
            key={key}
            onValueChange={(value) => handleDateChange(value)}
            value={filterDate}
          >
            <SelectTrigger className="w-[180px] mb-2">
              <SelectValue placeholder="Select a match date" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Match dates</SelectLabel>
                {dates.map((date) => (
                  <SelectItem key={date} value={date} defaultValue={date}>
                    {date}
                  </SelectItem>
                ))}
              </SelectGroup>
              <SelectSeparator />
            </SelectContent>
          </Select>
          <div className="flex justify-between flex-row gap-2">
            {filterDate !== undefined && (
              <Button
                variant="outline"
                size="sm"
                className="mb-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterDate(undefined);
                  setKey(+new Date());
                }}
              >
                Clear Filter <EraserIcon className="ml-2" size={16} />
              </Button>
            )}
            <Link href="/fines/add-fine" className="flex justify-center">
              <Button size="sm" className="mb-0" variant="outline">
                Add Fine <Plus className="ml-2" size={16} />
              </Button>
            </Link>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
            <PlayerFinesSummaryDataTable
            columns={summaryColumns}
            data={[...finesSummary].sort((a, b) => b.count - a.count)}
            total={playerFinesData
              .filter(
              (c) =>
                c.matchDate &&
                new Date(c.matchDate).toLocaleDateString("en-GB") ===
                (filterDate !== undefined
                  ? filterDate
                  : new Date(c.matchDate).toLocaleDateString("en-GB"))
              )
              .reduce((acc, item) => acc + item.amount, 0)}
            average={
              (() => {
              const filtered = playerFinesData.filter(
                (c) =>
                c.matchDate &&
                new Date(c.matchDate).toLocaleDateString("en-GB") ===
                  (filterDate !== undefined
                  ? filterDate
                  : new Date(c.matchDate).toLocaleDateString("en-GB"))
              );
              const total = filtered.reduce((acc, item) => acc + item.amount, 0);
              const games = new Set(filtered.map(item => item.matchDate)).size;
              return games > 0 ? total / games : 0;
              })()
            }
            />
            </TabsContent>
         <TabsContent value="details">
              <PlayerFinesDataTable
                columns={playerFinesColumns}
                data={playerFinesData.filter(
                  (c) =>
                    c.matchDate &&
                    new Date(c.matchDate).toLocaleDateString("en-GB") ===
                      (filterDate !== undefined
                        ? filterDate
                        : new Date(c.matchDate).toLocaleDateString("en-GB"))
                )}
                total={playerFinesData
                  .filter(
                    (c) =>
                      c.matchDate &&
                      new Date(c.matchDate).toLocaleDateString("en-GB") ===
                        (filterDate !== undefined
                          ? filterDate
                          : new Date(c.matchDate).toLocaleDateString("en-GB"))
                  )
                  .reduce((acc, item) => acc + item.amount, 0)}
              />
        </TabsContent>
        <TabsContent value="dashboard">
          <div className="flex justify-center items-center h-full">
          <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3 gap-4 w-full max-w-4xl">
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">Total Fines</span>
              <span className="text-2xl font-bold">
                £
                {playerFinesData.filter(
          (c) =>
            c.matchDate &&
            new Date(c.matchDate).toLocaleDateString("en-GB") ===
              (filterDate !== undefined
                ? filterDate
                : new Date(c.matchDate).toLocaleDateString("en-GB"))
        ).reduce((acc, item) => acc + item.amount, 0).toFixed(2)}
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Avg. cost: £
                {(() => {
                  const filtered = playerFinesData.filter(
                    (c) =>
                      c.matchDate &&
                      new Date(c.matchDate).toLocaleDateString("en-GB") ===
                        (filterDate !== undefined
                          ? filterDate
                          : new Date(c.matchDate).toLocaleDateString("en-GB"))
                  );
                  const matchDates = Array.from(
                    new Set(filtered.map((item) => item.matchDate))
                  );
                  const totalFines = filtered.reduce((acc, item) => acc + item.amount, 0);
                  return matchDates.length > 0
                    ? (totalFines / matchDates.length).toFixed(2)
                    : "0.00";
                })()}
              </span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">Top 3 Players Fined</span>
              <span className=" font-bold">
              {[...finesSummary]
                .sort((a, b) => b.total - a.total)
                .slice(0, 3)
                .map((player, idx) => {
                 
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={player.player} className="flex items-center gap-2 mb-1">
                      <span className={`text-[${idx*50}px]`}>{medals[idx]}</span>
                      <span className="font-medium">{player.player}</span>
                      <span className="ml-2 text-[10px] text-gray-500">£{player.total.toFixed(2)} ({player.count})</span>
                    </div>
                  );
                })}
              </span>
            </div>
            <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
              <span className="text-sm text-gray-500 mb-2">Total Fines Issued</span>
              <span className="text-2xl font-bold">
                {playerFinesData.filter(
          (c) =>
            c.matchDate &&
            new Date(c.matchDate).toLocaleDateString("en-GB") ===
              (filterDate !== undefined
                ? filterDate
                : new Date(c.matchDate).toLocaleDateString("en-GB"))
        ).length}
              </span>
              <span className="text-sm text-gray-500 mt-2">
                Avg. number : 
                {(() => {
                  const filtered = playerFinesData.filter(
                    (c) =>
                      c.matchDate &&
                      new Date(c.matchDate).toLocaleDateString("en-GB") ===
                        (filterDate !== undefined
                          ? filterDate
                          : new Date(c.matchDate).toLocaleDateString("en-GB"))
                  );
                  const matchDates = Array.from(
                    new Set(filtered.map((item) => item.matchDate))
                  );
                  const totalFines = filtered.length;
                  return matchDates.length > 0
                    ? (totalFines / matchDates.length)
                    : "0";
                })()}
              </span>
            </div>
                
            <div className="col-span-1 lg:col-span-3">
   <FineChart playerFinesData={playerFinesData.filter(
          (c) =>
            c.matchDate &&
            new Date(c.matchDate).toLocaleDateString("en-GB") ===
              (filterDate !== undefined
                ? filterDate
                : new Date(c.matchDate).toLocaleDateString("en-GB"))
        )} /> 
            </div>
          
          </div>
         
          </div>
        </TabsContent>
      </Tabs>
    );
  }
}
