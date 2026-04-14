
export type GameRound = {
  id: number;
  roundNumber: number;
  leg: number;
  playerId: number;
  playerName: string;
  homeScore: number;
  awayScore: number;
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
  isAppTeamHome: boolean;
  matchDate: string | null;
  league: string | null;
  season: string | null;
  players: Array<{
    id: number;
    name: string;
    nickname: string | null;
    imgUrl: string | null;
  }>;
  rounds: GameRound[];
};
