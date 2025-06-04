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

interface SummaryProps {
  playerFinesData: {
    id: number;
    player: string;
    fine: string;
    matchDate: string | null;
    notes: string | null;
    amount: number;
    createdAt: string | null;
  }[];
}

export function PlayerFinesSummary({ playerFinesData }: SummaryProps) {
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
              { player: string; total: number; count: number }
            >,
            fine
          ) => {
            const player = fine.player;
            if (!acc[player]) {
              acc[player] = {
                player: player,
                total: 0,
                count: 0,
              };
            }
            acc[player].total += fine.amount;
            acc[player].count += 1;
            return acc;
          },
          {} as Record<string, { player: string; total: number; count: number }>
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

        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
        </TabsList>
        <TabsContent value="summary">
          <PlayerFinesSummaryDataTable
            columns={summaryColumns}
            data={finesSummary}
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
      </Tabs>
    );
  }
}
