"use client"

import { ColumnDef, Row } from "@tanstack/react-table"
import {  ArrowRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAction } from "next-safe-action/hooks"
import { deletePlayer } from "@/server/actions/delete-player"
import { toast } from "sonner"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"


export type PlayerColumn = {
    id: number;
  name: string;
  nickname: string | null;
  team: string | null;
  createdAt: string | null;
}

const ActionCell = ({ row }: { row: Row<PlayerColumn> }) => {
  const { execute } = useAction(deletePlayer, {
    onSuccess: (data: { error?: string; data?: { success?: string } }) => {
      if (data?.error) {
        toast.error(data.error)
      }
      if (data?.data?.success) {
        toast.success(data.data.success)
      }
    },
    onExecute: () => {
      toast.info("Deleting player...")
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
          <Link href={`/players/add-player?id=${event.id}`}>
            Edit Player
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => execute({ id: event.id })}
          className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
        >
          Delete Player
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const playerColumns: ColumnDef<PlayerColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
 
  {
    accessorKey: "name",
    header: "Player Name",
    cell: ({ row }) => {
      const playerName = row.getValue("name");
      return <div className="font-medium">
        <Link href={`/players/${row.original.id}`} className="text-blue-500 hover:underline">
        <Badge variant="outline"  className="cursor-pointer min-w-[100px] text-left">
          {String(playerName)}
          <ArrowRight className="hidden ml-1 hover:flex" size={14} />
          </Badge>
        </Link>
        </div>
    }
  },
  {
    accessorKey: "nickname",
    header: "Nickname",
  },
  
  {
    accessorKey: "team",
    header: "Team",
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
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]