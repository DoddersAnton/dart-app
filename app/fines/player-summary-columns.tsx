"use client"

import { ColumnDef } from "@tanstack/react-table"
import Image from "next/image"

export type PlayerFineSummaryColumn = {
  player: string;
  playerImgUrl?: string | null;
  count: number;
  total: number;
  games: number;

}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export const summaryColumns: ColumnDef<PlayerFineSummaryColumn>[] = [
 
  {
    accessorKey: "player",
    header: "Player Name",
    cell: ({ row }) => {
      const player = row.original.player
      const avatar = row.original.playerImgUrl

      return (
        <div className="flex items-center gap-2">
          {avatar ? (
            <Image
              src={avatar}
              alt={`${player} avatar`}
              width={28}
              height={28}
              unoptimized
              className="h-7 w-7 rounded-full border object-cover"
            />
          ) : (
            <div className="flex h-7 w-7 items-center justify-center rounded-full border bg-muted text-[10px] font-semibold">
              {getInitials(player)}
            </div>
          )}
          <span>{player}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "count",
    header: "Count",
  },
  {
    accessorKey: "games",
    header: "Games Fined",
  },
  {
    accessorKey: "games",
    header: "Average",
    cell: ({ row }) => {
      const games = parseFloat(row.getValue("games"))
      const total = parseFloat(row.getValue("total"))
      const avg = total / games
      return <div className="font-medium text-xs">£{avg.toFixed(2)}</div>
    }
  },
  {
    accessorKey: "total",
    header: "Total",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("total"))
      const formatted = new Intl.NumberFormat("en-GB", {
        currency: "GBP",
        style: "currency",
      }).format(price)
      return <div className="font-medium text-xs">{formatted}</div>
    }
  }
]