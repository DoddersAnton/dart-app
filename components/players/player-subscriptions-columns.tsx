"use client"

import { ColumnDef } from "@tanstack/react-table"



export type SubscriptionColumn = {
    id: number;
  description: string;
  subscriptionType: string;
  amount: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date | null;
}



export const playerSubscriptionColumns: ColumnDef<SubscriptionColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
{
    accessorKey: "subscriptionType",
    header: "Type",
    
  },
  {
    accessorKey: "status",
    header: "Status",
    
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