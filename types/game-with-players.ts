
export type GamePlayerEntry = {
  id: number;
  name: string;
  nickname: string | null;
  imgUrl: string | null;
};

export type GameRound = {
  id: number;
  roundNumber: number;
  leg: number;
  // @deprecated — single-sided attribution. Use homePlayerId/awayPlayerId. Kept for legacy rows.
  playerId: number | null;
  playerName: string | null;
  homePlayerId: number | null;
  awayPlayerId: number | null;
  homePlayerName: string | null;
  awayPlayerName: string | null;
  homeScore: number;
  awayScore: number;
  // @deprecated — shared darts. Use homeDartsUsed/awayDartsUsed.
  dartsUsed: number;
  homeDartsUsed: number | null;
  awayDartsUsed: number | null;
  fineAdded: boolean;
};

export type GameWithPlayers = {
  id: number;
  homeTeamScore: number;
  homeTeam: string;
  awayTeam: string;
  awayTeamScore: number;
  fixtureId: number;
  gameType: string;
  isAppTeamWin: boolean;
  // Active team's perspective: which side is "my" team, or null for no-perspective contexts (display).
  mySide: "home" | "away" | null;
  homeTeamId: number | null;
  awayTeamId: number | null;
  homeTeamFinesEnabled: boolean;
  awayTeamFinesEnabled: boolean;
  matchDate: string | null;
  league: string | null;
  season: string | null;
  // All rostered players (both sides) — kept for back-compat. Prefer homePlayers/awayPlayers.
  players: GamePlayerEntry[];
  homePlayers: GamePlayerEntry[];
  awayPlayers: GamePlayerEntry[];
  rounds: GameRound[];
};
