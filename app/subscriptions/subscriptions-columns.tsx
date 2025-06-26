"use client"

import { Badge } from "@/components/ui/badge";
import { ColumnDef } from "@tanstack/react-table"
import { ArrowRight } from "lucide-react";
import Link from "next/link";


export type SubscriptionColumn = {
    id: number;
  description: string;
  subscriptionType: string;
  amount: number;
    player: string;
    playerId: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
}



export const subscriptionColumns: ColumnDef<SubscriptionColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
 {
    accessorKey: "player",
    header: "Player Name",
    cell: ({ row }) => {
      const playerName = row.getValue("player");
      const playerId = row.getValue("playerId");
      return <div className="font-medium">
        <Link href={`/players/${playerId}`} className="text-blue-500 hover:underline">
        <Badge variant="outline"  className="cursor-pointer min-w-[100px] text-left">
          {String(playerName)}
          <ArrowRight className="hidden ml-1 hover:flex" size={14} />
          </Badge>
        </Link>
        </div>
    }
  },
  {
    accessorKey: "subscriptionType",
    header: "Type",
    
  },
  {
    accessorKey: "season",
    header: "Season",
    
  },
  {
    accessorKey: "description",
    header: "Description",

  },
  
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
        const timestamp = new Date(row.getValue("startDate"));      
         const formattedDate = timestamp.toLocaleDateString("en-GB");
        return <div className="font-medium text-xs">{formattedDate}</div>
        }
    
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
        const timestamp = new Date(row.getValue("endDate"));      
         const formattedDate = timestamp.toLocaleDateString("en-GB");
        return <div className="font-medium text-xs">{formattedDate}</div>
        }
    
  },
    {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("amount"))
      const formatted = new Intl.NumberFormat("en-GB", {
        currency: "GBP",
        style: "currency",
      }).format(price)
      return <div className="font-medium text-xs">{formatted}</div>
    },
  },
   
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => {
        const timestamp = new Date(row.getValue("createdAt"));
        const formattedDate = timestamp.toLocaleDateString("en-GB");
        return <div className="font-medium text-xs">{formattedDate}</div>
      },
  },
  
]