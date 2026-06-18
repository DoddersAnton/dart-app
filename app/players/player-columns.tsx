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
  dateOfBirth: string | null;
  dartsUsed: string | null;
  dartsWeight: number | null;
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
    accessorKey: "dateOfBirth",
    header: "Date of Birth",
    cell: ({ row }) => {
      const dob = row.getValue("dateOfBirth") as string | null;
      if (!dob) return <span className="text-muted-foreground text-xs">—</span>;
      const age = Math.floor((Date.now() - new Date(dob).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
      return <div className="text-xs">{new Date(dob).toLocaleDateString("en-GB")} <span className="text-muted-foreground">({age})</span></div>;
    },
  },
  {
    accessorKey: "dartsUsed",
    header: "Darts",
    cell: ({ row }) => {
      const darts = row.getValue("dartsUsed") as string | null;
      const weight = row.original.dartsWeight;
      if (!darts && !weight) return <span className="text-muted-foreground text-xs">—</span>;
      return <div className="text-xs">{[darts, weight ? `${weight}g` : null].filter(Boolean).join(" · ")}</div>;
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
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]