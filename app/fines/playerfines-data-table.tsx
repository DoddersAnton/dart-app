"use client"

import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Card, CardContent } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { PlayerFineColumn } from "./player-fines-columns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
}

export function PlayerFinesDataTable<TData, TValue>({
  columns,
  data,
  total,
}: DataTableProps<TData, TValue>) {
  const [sorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <Card className="mt-4">
      <CardContent className="space-y-4 pt-6">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by fine type..."
              value={(table.getColumn("fine")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("fine")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by player..."
              value={(table.getColumn("player")?.getFilterValue() as string) ?? ""}
              onChange={(event) =>
                table.getColumn("player")?.setFilterValue(event.target.value)
              }
            />
          </div>
          <select
            className="h-10 rounded-md border bg-background px-3 text-sm"
            value={(table.getColumn("status")?.getFilterValue() as string) ?? "all"}
            onChange={(event) => {
              const value = event.target.value
              table.getColumn("status")?.setFilterValue(value === "all" ? "" : value)
            }}
          >
            <option value="all">All statuses</option>
            <option value="Paid">Paid</option>
            <option value="Unpaid">Unpaid</option>
          </select>
        </div>

        {/* Mobile card list */}
        <div className="md:hidden space-y-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const fine = row.original as PlayerFineColumn
              const isPaid = fine.status === "Paid"
              return (
                <Card key={row.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {fine.playerImgUrl ? (
                        <Image src={fine.playerImgUrl} alt={fine.player} width={32} height={32} unoptimized className="h-8 w-8 rounded-full border object-cover shrink-0" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold shrink-0">
                          {fine.player.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{fine.player}</p>
                        <p className="text-xs text-muted-foreground truncate">{fine.fine}</p>
                        <p className="text-xs text-muted-foreground">{fine.matchDate ? new Date(fine.matchDate).toLocaleDateString("en-GB") : "-"}</p>
                      </div>
                    </div>
                    <div className="shrink-0">
                      {row.getVisibleCells().find(c => c.column.id === "actions") && (
                        flexRender(
                          row.getVisibleCells().find(c => c.column.id === "actions")!.column.columnDef.cell,
                          row.getVisibleCells().find(c => c.column.id === "actions")!.getContext()
                        )
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-semibold">£{fine.amount.toFixed(2)}</span>
                      <Badge className={isPaid ? "bg-green-600 text-white" : ""} variant={isPaid ? "default" : "secondary"}>
                        {fine.status ?? "Unpaid"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">No results.</p>
          )}
          <p className="text-xs text-muted-foreground text-right">Total: £{total.toFixed(2)}</p>
        </div>

        {/* Desktop table */}
        <div className="hidden md:block rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="whitespace-nowrap">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={columns.length}>Total: £{total.toFixed(2)}</TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>

        <div className="flex items-center justify-end gap-3">
          <Button
            disabled={!table.getCanPreviousPage()}
            onClick={() => table.previousPage()}
            variant="outline"
          >
            <ChevronLeftIcon className="h-4 w-4" /> Prev
          </Button>
          <Button
            disabled={!table.getCanNextPage()}
            onClick={() => table.nextPage()}
            variant="outline"
          >
            Next <ChevronRightIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
