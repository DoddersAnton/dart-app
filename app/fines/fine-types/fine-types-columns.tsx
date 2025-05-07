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
import { deleteFine } from "@/server/actions/delete-fine"
import { toast } from "sonner"
import Link from "next/link"


export type FineTypeColumn = {
  id: number;
  title: string;
  description: string;
  amount: number;
  createdAt: string | null;
}

const ActionCell = ({ row }: { row: Row<FineTypeColumn> }) => {
  const { execute } = useAction(deleteFine, {
    onSuccess: (data: { error?: string; data?: { success?: string } }) => {
      if (data?.error) {
        toast.error(data.error)
      }
      if (data?.data?.success) {
        toast.success(data.data.success)
      }
    },
    onExecute: () => {
      toast.info("Deleting fine type...")
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
          <Link href={`/fines/add-fine?id=${event.id}`}>
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

export const fineTypeColumns: ColumnDef<FineTypeColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
 
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "description",
    header: "Description",
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
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
]