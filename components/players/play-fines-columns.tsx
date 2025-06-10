"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "../ui/checkbox";
import { Badge } from "../ui/badge";
import { PlayerFine } from "./pay-fines";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";


export const payFinesColumns: ColumnDef<PlayerFine>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && "indeterminate")
                }
                onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)} //change this line to handle toggle
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                disabled={row.getValue("status") === "Paid"}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "id",
        header: "#",
    },
    {
        accessorKey: "fine",
        header: "Fine",
        cell: ({ row }) => (
            <Popover>
                <PopoverTrigger asChild>
                    <button className="font-medium text-xs underline cursor-pointer bg-transparent border-0 p-0">
                        {row.getValue("fine")}
                    </button>
                </PopoverTrigger>
                <PopoverContent side="right" align="start" className="max-w-xs">
                    <div>
                        <div className="text-muted-foreground text-sm">Created On: {new Date(row.getValue("createdAt")).toLocaleDateString("en-GB")}</div>
                        <div className="text-muted-foreground text-sm">Player: {row.getValue("player")}</div>
                        <div className="font-semibold mb-1">Notes</div>
                        <div className="text-xs">
                            {row.getValue("notes") || <span className="text-muted-foreground">(No notes)</span>}
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        ),
    },
    {
        accessorKey: "matchDate",
        header: "Match Date",
        cell: ({ row }) => {
            const timestamp = new Date(row.getValue("matchDate"));
            const formattedDate = timestamp.toLocaleDateString("en-GB");
            return <div className="font-medium text-xs">{formattedDate}</div>;
        },
    },
    {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
            const status = row.getValue("status");
            if (status === "Paid") {
                return <div className="font-medium text-xs"><Badge variant="default">Paid</Badge></div>;
            } else {
                return <div className="font-medium text-xs"><Badge variant="secondary">Unpaid</Badge></div>;
            }
        },
    },
    {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ row }) => {
            const price = parseFloat(row.getValue("amount"));
            const formatted = new Intl.NumberFormat("en-GB", {
                currency: "GBP",
                style: "currency",
            }).format(price);
            return <div className="font-medium text-xs">{formatted}</div>;
        },
    },
];
