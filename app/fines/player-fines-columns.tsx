"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAction } from "next-safe-action/hooks"
import { deletePlayerfine } from "@/server/actions/delete-player-fine"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"


export type PlayerFineColumn = {
    id: number;
  player: string;
  fine: string;
  matchDate: string | null;
  notes: string | null;
  amount: number;
  createdAt: string | null;
}

const ActionCell = ({ row }: { row: Row<PlayerFineColumn> }) => {
  const { execute } = useAction(deletePlayerfine, {
    onSuccess: (data: { error?: string; data?: { success?: string } }) => {
      if (data?.error) {
        toast.error(data.error)
      }
      if (data?.data?.success) {
        toast.success(data.data.success)
      }
    },
    onExecute: () => {
      toast.info("Deleting player fine...")
    },
  })
  const event = row.original

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
          <Link href={`/fines/edit-fine?id=${event.id}`}>
            Edit Fine
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => execute({ id: event.id })}
          className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
        >
          Delete Fine
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const playerFinesColumns: ColumnDef<PlayerFineColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
 
  {
    accessorKey: "player",
    header: "Player Name",
  },
  {
    accessorKey: "fine",
    header: "Fine",
  },
  {
    accessorKey: "matchDate",
    header: "Match Date",
    cell: ({ row }) => {
        const timestamp = new Date(row.getValue("matchDate"));
        const formattedDate = timestamp.toLocaleDateString("en-GB");
        return <div className="font-medium text-xs">{formattedDate}</div>
      },
  },
  {
    accessorKey: "fine",
    header: "Status",
    cell: ({ row }) => {
        const status = row.getValue("fine")
        if (status === "paid") {
        return <div className="font-medium text-xs"><Badge variant="default">Unpaid</Badge></div>
        } else {
          return <div className="font-medium text-xs"><Badge variant="destructive">Paid</Badge></div>
        }
      },
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
    accessorKey: "notes",
    header: "Notes",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]