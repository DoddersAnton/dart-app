"use client"

import { ColumnDef } from "@tanstack/react-table"



export type FixtureSummaryColumn = {
  id: number;
    location: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamScore: number;
    awayTeamscore: number;
    matchDate: string | null;
}

export const fixtureSummaryColumns: ColumnDef<FixtureSummaryColumn>[] = [
    {
        accessorKey: "id",
        header: "ID",
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
            return <div className="font-medium text-xs">{formattedDate}</div>
        },
    },
    {
        accessorKey: "homeTeam",
        header: "Home Team",
        cell: ({ row }) => {
            const team = row.getValue("homeTeam");
            const homeTeamScore = Number(row.getValue("homeTeamScore"));
            const awayTeamScore = Number(row.getValue("awayTeamscore"));
            const isWinner = homeTeamScore > awayTeamScore;
            return (
                <div className="font-medium text-xs flex items-center gap-1">
                    {String(team)}
                    {isWinner && (
                        <span title="Winner" role="img" aria-label="Trophy">🏆</span>
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
            const awayTeamScore = Number(row.getValue("awayTeamscore"));
            const isWinner = awayTeamScore > homeTeamScore;
            return (
                <div className="font-medium text-xs flex items-center gap-1">
                    {String(team)}
                    {isWinner && (
                        <span title="Winner" role="img" aria-label="Trophy">🏆</span>
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
        accessorKey: "awayTeamscore",
        header: "Away Team Score",
    },
]