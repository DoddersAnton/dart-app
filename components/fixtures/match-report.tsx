"use client";

import React from "react";
import { Badge } from "../ui/badge";
import { GameRound } from "@/types/game-with-players";
import { sideThreeDartAvg, sideTotals } from "@/lib/dart-stats";
import type { FixtureReportGame } from "@/server/actions/get-fixture-report";

const INITIAL_SCORE: Record<string, number> = {
  "Team Game": 801,
  Doubles: 601,
  Singles: 501,
};

const fmt = (n: number | null) => (n === null ? "–" : n.toFixed(1));
const fmtInt = (n: number) => n.toLocaleString();

type SideStats = {
  games: number;
  legs: number;
  legsTeam: number;
  legsDoubles: number;
  legsSingles: number;
  points: number;
  darts: number;
  first9Points: number;
  first9Darts: number;
  first15Points: number;
  first15Darts: number;
};

function emptyStats(): SideStats {
  return { games: 0, legs: 0, legsTeam: 0, legsDoubles: 0, legsSingles: 0, points: 0, darts: 0, first9Points: 0, first9Darts: 0, first15Points: 0, first15Darts: 0 };
}

function accumulate(games: FixtureReportGame[], side: "home" | "away"): SideStats {
  const s = emptyStats();
  for (const g of games) {
    const myLegs = side === "home" ? g.homeTeamScore : g.awayTeamScore;
    const theirLegs = side === "home" ? g.awayTeamScore : g.homeTeamScore;
    if (myLegs > theirLegs) s.games += 1;
    s.legs += myLegs;
    if (g.gameType === "Team Game") s.legsTeam += myLegs;
    else if (g.gameType === "Doubles") s.legsDoubles += myLegs;
    else if (g.gameType === "Singles") s.legsSingles += myLegs;
    const { points, darts } = sideTotals(g.rounds, side);
    s.points += points;
    s.darts += darts;

    // First 9 / first 15 darts = the first three / five visits of each leg.
    const legNums = [...new Set(g.rounds.map((r) => r.leg))];
    for (const leg of legNums) {
      const ordered = g.rounds
        .filter((r) => r.leg === leg)
        .sort((a, b) => a.roundNumber - b.roundNumber);
      ordered.forEach((r, i) => {
        const score = side === "home" ? r.homeScore : r.awayScore;
        const darts = (side === "home" ? r.homeDartsUsed : r.awayDartsUsed) ?? r.dartsUsed ?? 3;
        if (i < 3) { s.first9Points += score; s.first9Darts += darts; }
        if (i < 5) { s.first15Points += score; s.first15Darts += darts; }
      });
    }
  }
  return s;
}

const oneDA = (s: SideStats) => (s.darts > 0 ? s.points / s.darts : null);
const first9DA = (s: SideStats) => (s.first9Darts > 0 ? (s.first9Points / s.first9Darts) * 3 : null);
const first15DA = (s: SideStats) => (s.first15Darts > 0 ? (s.first15Points / s.first15Darts) * 3 : null);

function SummaryRow({ team, stats, totals = false }: { team: string; stats: SideStats; totals?: boolean }) {
  const one = oneDA(stats);
  const three = one === null ? null : one * 3;
  return (
    <tr className={`border-t border-border/50 ${totals ? "bg-muted/40 font-semibold" : ""}`}>
      <td className="py-1.5 px-3 text-left whitespace-nowrap">{team}</td>
      <td className="py-1.5 px-3 text-center tabular-nums">{stats.games}</td>
      <td className="py-1.5 px-3 text-center tabular-nums">{stats.legs}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-muted-foreground">{stats.legsTeam}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-muted-foreground">{stats.legsDoubles}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-muted-foreground">{stats.legsSingles}</td>
      <td className="py-1.5 px-3 text-center tabular-nums">{fmtInt(stats.points)}</td>
      <td className="py-1.5 px-3 text-center tabular-nums">{fmtInt(stats.darts)}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-blue-600 dark:text-blue-400">{fmt(one)}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-blue-600 dark:text-blue-400">{fmt(three)}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-blue-600 dark:text-blue-400">{fmt(first9DA(stats))}</td>
      <td className="py-1.5 px-3 text-center tabular-nums text-blue-600 dark:text-blue-400">{fmt(first15DA(stats))}</td>
    </tr>
  );
}

function LegRows({ leg, rounds, gameType }: { leg: number; rounds: GameRound[]; gameType: string }) {
  const start = INITIAL_SCORE[gameType] ?? 501;
  let homeRem = start;
  let awayRem = start;
  const rows = rounds.map((r) => {
    homeRem = Math.max(0, homeRem - r.homeScore);
    awayRem = Math.max(0, awayRem - r.awayScore);
    return { ...r, homeRem, awayRem };
  });
  const homeAvg = sideThreeDartAvg(rounds, "home");
  const awayAvg = sideThreeDartAvg(rounds, "away");
  const homeWon = homeRem === 0;
  const awayWon = awayRem === 0;
  // Darts used on the checkout — the dart count of the round that reached zero.
  const homeCheckoutDarts = homeWon ? rows.find((r) => r.homeRem === 0)?.homeDartsUsed ?? null : null;
  const awayCheckoutDarts = awayWon ? rows.find((r) => r.awayRem === 0)?.awayDartsUsed ?? null : null;

  return (
    <>
      <tr className="bg-muted/30 border-t border-border">
        <td colSpan={7} className="py-1 px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
          Leg {leg}
          {homeWon && <span className="ml-2 text-green-600 normal-case">· home leg</span>}
          {awayWon && <span className="ml-2 text-green-600 normal-case">· away leg</span>}
        </td>
      </tr>
      {rows.map((r) => (
        <tr key={r.id} className="border-t border-border/50">
          <td className="py-1 px-3 text-muted-foreground tabular-nums">{r.roundNumber}</td>
          <td className="py-1 px-3 text-muted-foreground truncate max-w-[90px]">{r.homePlayerName ?? "–"}</td>
          <td className="py-1 px-3 text-center tabular-nums">
            <span className={r.homeScore === 180 ? "font-black text-amber-500" : r.homeScore >= 100 ? "font-bold text-orange-500" : ""}>{r.homeScore}</span>
          </td>
          <td className={`py-1 px-3 text-center tabular-nums ${r.homeRem <= 170 ? "text-amber-500" : "text-muted-foreground"}`}>{r.homeRem}</td>
          <td className={`py-1 px-3 text-center tabular-nums ${r.awayRem <= 170 ? "text-amber-500" : "text-muted-foreground"}`}>{r.awayRem}</td>
          <td className="py-1 px-3 text-center tabular-nums">
            <span className={r.awayScore === 180 ? "font-black text-amber-500" : r.awayScore >= 100 ? "font-bold text-orange-500" : ""}>{r.awayScore}</span>
          </td>
          <td className="py-1 px-3 text-muted-foreground truncate max-w-[90px]">{r.awayPlayerName ?? "–"}</td>
        </tr>
      ))}
      <tr className="border-t border-border/50 bg-muted/20">
        <td colSpan={2} className="py-1 px-3 text-[11px] font-semibold text-muted-foreground">3-dart avg</td>
        <td className="py-1 px-3 text-center text-[11px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {fmt(homeAvg)}
          {homeCheckoutDarts ? <span className="ml-1 font-normal text-muted-foreground">({homeCheckoutDarts}d co)</span> : null}
        </td>
        <td colSpan={2} />
        <td className="py-1 px-3 text-center text-[11px] font-semibold tabular-nums text-blue-600 dark:text-blue-400">
          {fmt(awayAvg)}
          {awayCheckoutDarts ? <span className="ml-1 font-normal text-muted-foreground">({awayCheckoutDarts}d co)</span> : null}
        </td>
        <td />
      </tr>
    </>
  );
}

export default function MatchReport({ games }: { games: FixtureReportGame[] }) {
  const withRounds = games.filter((g) => g.rounds.length > 0);
  if (withRounds.length === 0) {
    return <p className="text-sm text-muted-foreground">No round data recorded yet.</p>;
  }

  const homeTeam = withRounds[0].homeTeam;
  const awayTeam = withRounds[0].awayTeam;

  const homeStats = accumulate(withRounds, "home");
  const awayStats = accumulate(withRounds, "away");
  const totals: SideStats = {
    games: homeStats.games + awayStats.games,
    legs: homeStats.legs + awayStats.legs,
    legsTeam: homeStats.legsTeam + awayStats.legsTeam,
    legsDoubles: homeStats.legsDoubles + awayStats.legsDoubles,
    legsSingles: homeStats.legsSingles + awayStats.legsSingles,
    points: homeStats.points + awayStats.points,
    darts: homeStats.darts + awayStats.darts,
    first9Points: homeStats.first9Points + awayStats.first9Points,
    first9Darts: homeStats.first9Darts + awayStats.first9Darts,
    first15Points: homeStats.first15Points + awayStats.first15Points,
    first15Darts: homeStats.first15Darts + awayStats.first15Darts,
  };

  return (
    <div className="space-y-5">
      {/* Match summary */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Match summary</p>
        <div className="rounded-lg border overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/40">
              <tr>
                <th className="py-2 px-3 text-left font-medium text-muted-foreground">Team</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Games</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Legs</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Team</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Dbls</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Sgls</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Points</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">Darts</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">1DA</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">3DA</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">F9</th>
                <th className="py-2 px-3 text-center font-medium text-muted-foreground">F15</th>
              </tr>
            </thead>
            <tbody>
              <SummaryRow team={homeTeam} stats={homeStats} />
              <SummaryRow team={awayTeam} stats={awayStats} />
              <SummaryRow team="Totals" stats={totals} totals />
            </tbody>
          </table>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5">
          Team / Dbls / Sgls = legs won by game type. 1DA = points ÷ darts; 3DA = 1DA × 3. F9 / F15 = 3-dart avg over the first 9 / 15 darts of each leg.
        </p>
      </div>

      {/* Leg-by-leg detail */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Leg-by-leg detail</p>
        <div className="space-y-4">
          {withRounds.map((game) => {
            const legs = [...new Set(game.rounds.map((r) => r.leg))].sort((a, b) => a - b);
            return (
              <div key={game.id}>
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className="text-[10px]">{game.gameType}</Badge>
                  <span className="text-xs text-muted-foreground tabular-nums">{game.homeTeamScore}–{game.awayTeamScore} legs</span>
                </div>
                <div className="rounded-lg border overflow-x-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-muted/40">
                      <tr>
                        <th className="py-1.5 px-3 text-left font-medium text-muted-foreground">R</th>
                        <th className="py-1.5 px-3 text-left font-medium text-muted-foreground">{homeTeam}</th>
                        <th className="py-1.5 px-3 text-center font-medium text-muted-foreground">Score</th>
                        <th className="py-1.5 px-3 text-center font-medium text-muted-foreground">Left</th>
                        <th className="py-1.5 px-3 text-center font-medium text-muted-foreground">Left</th>
                        <th className="py-1.5 px-3 text-center font-medium text-muted-foreground">Score</th>
                        <th className="py-1.5 px-3 text-left font-medium text-muted-foreground">{awayTeam}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {legs.map((leg) => (
                        <LegRows key={leg} leg={leg} rounds={game.rounds.filter((r) => r.leg === leg)} gameType={game.gameType} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
