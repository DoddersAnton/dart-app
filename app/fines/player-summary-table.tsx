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
import Image from "next/image"
import { PlayerFineSummaryColumn } from "./player-summary-columns"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  total: number
  average: number
}

export function PlayerFinesSummaryDataTable<TData, TValue>({
  columns,
  data,
  total,
  average,
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
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Filter summary by player name..."
            value={(table.getColumn("player")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("player")?.setFilterValue(event.target.value)
            }
          />
        </div>

        {/* Mobile card list */}
        <div className="md:hidden space-y-2">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => {
              const item = row.original as PlayerFineSummaryColumn
              const avg = item.games > 0 ? item.total / item.games : 0
              return (
                <Card key={row.id}>
                  <CardContent className="p-3 flex items-center gap-3">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {item.playerImgUrl ? (
                        <Image src={item.playerImgUrl} alt={item.player} width={32} height={32} unoptimized className="h-8 w-8 rounded-full border object-cover shrink-0" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted text-xs font-semibold shrink-0">
                          {item.player.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium truncate">{item.player}</span>
                    </div>
                    <div className="flex flex-col items-end gap-0.5 shrink-0 text-xs">
                      <span className="font-semibold">£{item.total.toFixed(2)}</span>
                      <span className="text-muted-foreground">{item.count} fine{item.count !== 1 ? "s" : ""}</span>
                      <span className="text-muted-foreground">avg £{avg.toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <p className="text-center text-sm text-muted-foreground py-8">No results.</p>
          )}
          <p className="text-xs text-muted-foreground text-right">Avg per match: £{average.toFixed(2)} · Total: £{total.toFixed(2)}</p>
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
                <TableCell colSpan={columns.length}>
                  Avg per match: £{average.toFixed(2)} · Total: £{total.toFixed(2)}
                </TableCell>
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
