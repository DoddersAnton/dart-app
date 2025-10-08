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
import {
  Card,
  CardContent,
} from "@/components/ui/card"
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
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  total: number,
  totalHomeScore: number,
  totalAwayScore: number
}

export function FixtureSummaryDataTable<TData, TValue>({
  columns,
  data, 
  total,
  totalHomeScore,
  totalAwayScore,
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
    <div className=" w-full mx-auto mt-2">
      <Card>
        <CardContent className="mb-1 mp-2">
          <div>
          <div className="w-full mx-auto flex items-center justify-center lg:w-[80%] mb-4">
                <h2 className="text-lg lg:text-2xl font-bold">Match Summary ({total})</h2>
            </div>
            <div className="mb-2">
              <Input
                placeholder="Filter location name..."
                value={
                  (table.getColumn("location")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("location")?.setFilterValue(event.target.value)
                }
              />
            </div>
            <div className="hidden md:block w-full overflow-x-auto">
            <Table 
                  className="relative w-full caption-bottom text-sm">

              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <TableHead key={header.id}>
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      )
                    })}
                  </TableRow>
                ))}
              </TableHeader>
                <TableBody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => {
                  // Find the cell values for Home Team and Away Team
                  const homeTeam = row.getValue("homeTeam") as string;
                  const awayTeam = row.getValue("awayTeam") as string;
                  const homeTeamScore = row.getValue("homeTeamScore") as number;
                  const awayTeamScore = row.getValue("awayTeamScore") as number;
                  const isDilfsWinner =
                    (homeTeam && homeTeam.includes("DILFS") && homeTeamScore > awayTeamScore) ||
                    (awayTeam && awayTeam.includes("DILFS") && awayTeamScore > homeTeamScore);

                  return (
                    <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={isDilfsWinner ? "bg-secondary" : ""}
                    title={`${isDilfsWinner ? "DILFS Won!" : "DILFS Lost"}- ${homeTeam} ${homeTeamScore} : ${awayTeamScore} ${awayTeam}`}
                    >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                      </TableCell>
                    ))}
                    </TableRow>
                  );
                  })
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={6}>Total Games ({total})</TableCell>
                  <TableCell  colSpan={1}>{totalHomeScore}</TableCell>
                   <TableCell  colSpan={2}>{totalAwayScore}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
            </div>
            <div className="block md:hidden space-y-2 gap-2">
              {table.getRowModel().rows.map((row) => {
                // Find the cell values for Home Team and Away Team
                const homeTeam = row.getValue("homeTeam") as string;
                const awayTeam = row.getValue("awayTeam") as string;
                const homeTeamScore = row.getValue("homeTeamScore") as number;
                const awayTeamScore = row.getValue("awayTeamScore") as number;
                const isDilfsWinner =
                  (homeTeam && homeTeam.includes("DILFS") && homeTeamScore > awayTeamScore) ||
                  (awayTeam && awayTeam.includes("DILFS") && awayTeamScore > homeTeamScore);

                return (
                  <Card key={row.id} className={`p-3 ${isDilfsWinner ? "bg-secondary" : ""}`} title={`${isDilfsWinner ? "DILFS Won!" : "DILFS Lost"}- ${homeTeam} ${homeTeamScore} : ${awayTeamScore} ${awayTeam}`}>
                    {row.getVisibleCells().map((cell) => (
                      <div key={cell.id} className="flex justify-between items-center align-top border-b py-1 text-sm">
                        <span className="font-medium">
                          {cell.column.columnDef.header as string}
                        </span>
                        <span>{flexRender(cell.column.columnDef.cell, cell.getContext())}</span>
                      </div>
                    ))}
                  </Card>
                );
              })}
            </div>
            
            <div className="flex items-center justify-end gap-4 pt-4">
              <Button
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
                variant="outline"
              >
                <ChevronLeftIcon className="w-4 h-4" />
                <span>Previous Page</span>
              </Button>
              <Button
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
                variant="outline"
              >
                <span>Next page</span>
                <ChevronRightIcon className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}