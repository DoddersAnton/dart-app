"use client"

import { ColumnDef } from "@tanstack/react-table"



export type PlayerFineSummaryColumn = {
  player: string;
  count: number;
  total: number;
  games: number;

}

export const summaryColumns: ColumnDef<PlayerFineSummaryColumn>[] = [
 
  {
    accessorKey: "player",
    header: "Player Name",
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