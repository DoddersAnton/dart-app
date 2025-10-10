"use client";

import { TextShimmer } from "@/components/motion-primitives/text-shimmer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { deleteFixture } from "@/server/actions/delete-fixture";
import { ColumnDef, Row } from "@tanstack/react-table";
import {
  ArrowRight,
  MoreHorizontal,
  Pencil,
  Trash,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";

export type FixtureSummaryColumn = {
  id: number;
  location: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
  awayTeamScore: number;
  matchDate: string | null;
  status: string;
};

const ActionCell = ({ row }: { row: Row<FixtureSummaryColumn> }) => {
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const { execute } = useAction(deleteFixture, {
    onSuccess: (data: { error?: string; data?: { success?: string } }) => {
      if (data?.error) {
        toast.error(data.error);
      }
      if (data?.data?.success) {
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      toast.info("Deleting fixture...");
    },
  });
  const fixture = row.original;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={"ghost"} className="h-8 w-8 p-0">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer ">
          <Link
            className="flex flex-row items-center"
            href={`/fixtures/edit-fixture?id=${fixture.id}`}
            onClick={() => setLoadingEdit(true)}
          >
            {loadingEdit ? (
              <LoadingSpinner />
            ) : (
              <Pencil className="mr-2" size={14} />
            )}
            {loadingEdit ? (
              <TextShimmer>Loading match.. </TextShimmer>
            ) : (
              "Edit Fixture"
            )}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => (execute({ id: fixture.id }), setLoadingDelete(true))}
          className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer "
        >
          <div className="flex flex-row items-center">
            {loadingDelete ? (
              <LoadingSpinner />
            ) : (
              <Trash className="mr-2" size={14} />
            )}
            {loadingDelete ? (
              <TextShimmer>Deleting match.. </TextShimmer>
            ) : (
              "Delete Fixture"
            )}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const fixtureSummaryColumns: ColumnDef<FixtureSummaryColumn>[] = [
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "id",
    header: "View",
    cell: ({ row }) => {
      return (
        <div className="font-medium">
          <Link
            href={`/fixtures/${row.original.id}`}
            className="text-blue-500 hover:underline"
          >
            <Badge
              variant="outline"
              className="cursor-pointer min-w-[100px] text-left"
            >
              View
              <ArrowRight className="hidden ml-1 hover:flex" size={14} />
            </Badge>
          </Link>
        </div>
      );
    },
  },
  {
    accessorKey: "location",
    header: "Location",
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
    accessorKey: "homeTeam",
    header: "Home Team",
    cell: ({ row }) => {
      const team = row.getValue("homeTeam");
      const homeTeamScore = Number(row.getValue("homeTeamScore"));
      const awayTeamScore = Number(row.getValue("awayTeamScore"));
      const isWinner = homeTeamScore > awayTeamScore;
      return (
        <div className="font-medium text-xs flex items-center gap-1">
          {String(team)}
          {isWinner && (
            <span title="Winner" role="img" aria-label="Trophy">
              🏆
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "awayTeam",
    header: "Away Team",
    cell: ({ row }) => {
      const team = row.getValue("awayTeam");
      const homeTeamScore = Number(row.getValue("homeTeamScore"));
      const awayTeamScore = Number(row.getValue("awayTeamScore"));
      const isWinner = awayTeamScore > homeTeamScore;
      return (
        <div className="font-medium text-xs flex items-center gap-1">
          {String(team)}
          {isWinner && (
            <span title="Winner" role="img" aria-label="Trophy">
              🏆
            </span>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "homeTeamScore",
    header: "Home Team Score",
  },
  {
    accessorKey: "awayTeamScore",
    header: "Away Team Score",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      let statusColor: "default" | "outline" | "destructive" | "secondary" |  undefined = "default";
      if (status === "scheduled") {
        statusColor = "outline";
      } else if (status === "cancelled") {
        statusColor = "outline";
      } else if (status === "completed") {
        statusColor = "default";
      }
      return <Badge variant={statusColor} className="min-w-[100px] text-left">
                    {status.charAt(0).toUpperCase() + status.slice(1)}
             </Badge>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ActionCell,
  },
];
