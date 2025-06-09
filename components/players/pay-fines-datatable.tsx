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
  CardContent

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
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import PaymentDrawer from "./pay-drawer"

interface DataTableProps<TData extends { id: number }, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[],
  total: number,
   onSelectedIdsChange: (ids: number[]) => void 
}

export function PayFinesDataTable<TData extends { id: number }, TValue>({
  columns,
  data,
  total,
  onSelectedIdsChange
}: DataTableProps<TData, TValue>) {
  const [sorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [rowSelection, setRowSelection] = useState({})
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      rowSelection,
      sorting,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
  })

  useEffect(() => {
  const selectedIds = table
    .getSelectedRowModel()
    .rows.map((row) => (row.original)?.id) // 🔥 Grab IDs

    onSelectedIdsChange(selectedIds)
}, [table.getSelectedRowModel().rows, onSelectedIdsChange])

  return (
    <div className="w-full mx-auto mt-6">
      <Card>
        <CardContent className="mb-2 mp-2">
          <div>
            <div className="w-full mx-auto flex items-center justify-center lg:w-[80%] mb-2">
                <PaymentDrawer amount={total} />
            </div>
            <div>
              <Input
                placeholder="Filter fines..."
                value={
                  (table.getColumn("fine")?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn("fine")?.setFilterValue(event.target.value)
                }
              />
            </div>
            <Table>
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
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      data-state={row.getIsSelected() && "selected"}
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
                  ))
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
                  <TableCell colSpan={5}>Total</TableCell>
                  <TableCell  colSpan={5}>£{total.toFixed(2)}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
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