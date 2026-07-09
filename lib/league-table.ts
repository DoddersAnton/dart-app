// Shared league-table types and constants. Kept free of server-only imports so
// both server actions and client components can use them.

// Sentinel used in the UI/query string to represent the "no division" bucket.
export const NO_DIVISION = "none";

export type LeagueRow = {
  rank: number;
  previousRank: number | null;
  teamId: number;
  teamName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  legsFor: number;
  legsAgainst: number;
  points: number;
};

export type LeagueTableData = {
  seasons: { id: number; name: string }[];
  selectedSeasonId: number | null;
  divisions: { id: number | null; name: string }[];
  selectedDivisionId: number | null;
  weekNo: number | null;
  rows: LeagueRow[];
  isComplete: boolean;
};
