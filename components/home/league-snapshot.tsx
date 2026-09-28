"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Minus, TrendingDown, TrendingUp, Trophy } from "lucide-react";
import type { HomeLeagueSnapshot } from "@/server/actions/get-home-team-snapshot";

function MovementIcon({ rank, previousRank }: { rank: number; previousRank: number | null }) {
  if (previousRank == null) return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
  if (rank < previousRank) return <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />;
  if (rank > previousRank) return <TrendingDown className="h-3.5 w-3.5 text-rose-500" />;
  return <Minus className="h-3.5 w-3.5 text-muted-foreground" />;
}

export function LeagueSnapshot({ league }: { league: HomeLeagueSnapshot }) {
  if (league.rows.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
            {league.seasonName}
            {league.divisionName ? ` · ${league.divisionName}` : ""}
            {league.weekNo != null ? ` · Week ${league.weekNo}` : ""}
          </p>
          <h2 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <Trophy className="h-5 w-5 text-amber-500" />
            League table
            {league.isComplete && (
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                FINAL
              </span>
            )}
          </h2>
        </div>
        <Link href="/fixtures/league-table" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          Full table <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden rounded-xl border bg-card"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/40 text-left text-[11px] uppercase tracking-wide text-muted-foreground">
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Team</th>
              <th className="px-2 py-2 text-center font-medium">P</th>
              <th className="hidden px-2 py-2 text-center font-medium sm:table-cell">W</th>
              <th className="hidden px-2 py-2 text-center font-medium sm:table-cell">D</th>
              <th className="hidden px-2 py-2 text-center font-medium sm:table-cell">L</th>
              <th className="px-2 py-2 text-center font-medium">Pts</th>
            </tr>
          </thead>
          <tbody>
            {league.rows.map((row) => {
              const isMine = row.teamId === league.activeTeamId;
              return (
                <tr
                  key={row.teamId}
                  className={`border-b last:border-0 ${isMine ? "bg-primary/5 font-semibold" : ""}`}
                >
                  <td className="px-3 py-2">
                    <span className="inline-flex items-center gap-1">
                      <MovementIcon rank={row.rank} previousRank={row.previousRank} />
                      {row.rank}
                    </span>
                  </td>
                  <td className="max-w-[160px] truncate px-3 py-2">
                    {row.teamName}
                    {isMine && <span className="ml-1.5 text-[10px] text-primary">You</span>}
                  </td>
                  <td className="px-2 py-2 text-center text-muted-foreground">{row.played}</td>
                  <td className="hidden px-2 py-2 text-center text-muted-foreground sm:table-cell">{row.wins}</td>
                  <td className="hidden px-2 py-2 text-center text-muted-foreground sm:table-cell">{row.draws}</td>
                  <td className="hidden px-2 py-2 text-center text-muted-foreground sm:table-cell">{row.losses}</td>
                  <td className="px-2 py-2 text-center font-bold">{row.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </motion.div>
    </section>
  );
}
