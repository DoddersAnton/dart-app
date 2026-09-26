"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarDays, MapPin, ArrowRight } from "lucide-react";
import type { UpcomingFixture } from "@/server/actions/get-home-team-snapshot";

function formatMatchDate(iso: string) {
  const d = new Date(iso);
  return {
    day: d.toLocaleDateString("en-GB", { weekday: "short" }),
    date: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
    time: d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }),
  };
}

export function UpcomingFixtures({ fixtures }: { fixtures: UpcomingFixture[] }) {
  if (fixtures.length === 0) return null;

  return (
    <section className="py-12">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">Coming up</p>
          <h2 className="text-2xl font-bold tracking-tight">Upcoming fixtures</h2>
        </div>
        <Link href="/fixtures" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors">
          All fixtures <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {fixtures.map((f, i) => {
          const { day, date, time } = formatMatchDate(f.matchDate);
          return (
            <motion.div
              key={f.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link href={`/fixtures/${f.id}`}>
                <div className="group flex items-stretch gap-4 rounded-xl border bg-card p-4 transition-colors hover:border-primary">
                  <div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-lg bg-muted/60 py-2 text-center">
                    <span className="text-[10px] font-semibold uppercase text-muted-foreground">{day}</span>
                    <span className="text-sm font-bold leading-tight">{date}</span>
                    <span className="text-[10px] text-muted-foreground">{time}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${f.isHome ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400" : "bg-sky-500/15 text-sky-600 dark:text-sky-400"}`}>
                        {f.isHome ? "HOME" : "AWAY"}
                      </span>
                      <span className="truncate text-[11px] text-muted-foreground">{f.league}</span>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold">
                      {f.homeTeam} <span className="text-muted-foreground">vs</span> {f.awayTeam}
                    </p>
                    <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 shrink-0" /> {f.matchLocation}
                    </p>
                  </div>
                  <CalendarDays className="h-4 w-4 shrink-0 self-center text-muted-foreground transition-colors group-hover:text-primary" />
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
