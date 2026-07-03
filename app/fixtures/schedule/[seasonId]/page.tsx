import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, Layers } from "lucide-react";

import { db } from "@/server";
import { fixtures as fixturesTable, seasons as seasonsTable } from "@/server/schema";
import { isLeagueAdmin } from "@/lib/permissions";
import { WeekBuilder } from "@/components/fixtures/week-builder";
import { ScheduleFixtureRow, type ScheduleFixture } from "@/components/fixtures/schedule-fixture-row";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function SeasonSchedulePage({ params }: { params: Promise<{ seasonId: string }> }) {
  const { seasonId } = await params;
  const sid = Number(seasonId);

  const cookieStore = await cookies();
  const activeTeamId = cookieStore.get("active-team-id")?.value ? parseInt(cookieStore.get("active-team-id")!.value) : null;

  const season = await db.query.seasons.findFirst({ where: eq(seasonsTable.id, sid) });
  if (!season) notFound();

  const [seasonFixtures, teams, divisions, canManage] = await Promise.all([
    db.query.fixtures.findMany({
      where: eq(fixturesTable.seasonsId, sid),
      orderBy: (f, { asc }) => [asc(f.weekNo), asc(f.matchDate)],
    }),
    db.query.team.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
    db.query.division.findMany({ orderBy: (d, { asc }) => [asc(d.name)] }),
    isLeagueAdmin(),
  ]);

  type Fx = (typeof seasonFixtures)[number];

  const teamNameById = new Map(teams.map((t) => [t.id, t.name]));
  const resolveName = (id: number | null, fallback: string) => (id != null ? teamNameById.get(id) ?? fallback : fallback);

  const toRow = (f: Fx): ScheduleFixture => ({
    fixtureId: f.id,
    homeName: resolveName(f.homeTeamId, f.homeTeam),
    awayName: resolveName(f.awayTeamId, f.awayTeam),
    homeActive: f.homeTeamId != null && f.homeTeamId === activeTeamId,
    awayActive: f.awayTeamId != null && f.awayTeamId === activeTeamId,
    homeTeamScore: f.homeTeamScore,
    awayTeamScore: f.awayTeamScore,
    matchStatus: f.matchStatus,
    matchDate: f.matchDate.toISOString(),
    weekNo: f.weekNo,
    divisionId: f.divisionId,
  });

  // Builder inputs — week numbers run per (season, division).
  const defaultLeague = seasonFixtures.find((f) => f.league)?.league ?? "";
  const maxWeekByDivision = new Map<number, number>();
  const countByDivision = new Map<number, number>();
  for (const f of seasonFixtures) {
    if (f.divisionId == null) continue;
    countByDivision.set(f.divisionId, (countByDivision.get(f.divisionId) ?? 0) + 1);
    if (f.weekNo != null) maxWeekByDivision.set(f.divisionId, Math.max(maxWeekByDivision.get(f.divisionId) ?? 0, f.weekNo));
  }
  const builderDivisions = divisions.map((d) => ({ id: d.id, name: d.name, nextWeekNo: (maxWeekByDivision.get(d.id) ?? 0) + 1 }));
  const defaultDivisionId = [...countByDivision.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? divisions[0]?.id ?? null;

  const teamOptions = teams.map((t) => ({ id: t.id, name: t.name, hasLocation: t.defaultLocationId != null }));
  const divisionSelect = divisions.map((d) => ({ id: d.id, name: d.name }));

  // A division's fixtures grouped by week.
  const renderWeeks = (list: Fx[]) => {
    const weeks = new Map<number, Fx[]>();
    const noWeek: Fx[] = [];
    for (const f of list) {
      if (f.weekNo == null) noWeek.push(f);
      else {
        const arr = weeks.get(f.weekNo) ?? [];
        arr.push(f);
        weeks.set(f.weekNo, arr);
      }
    }
    const wns = [...weeks.keys()].sort((a, b) => a - b);
    return (
      <div className="space-y-4">
        {wns.map((wk) => {
          const wl = weeks.get(wk)!;
          const date = wl[0]?.matchDate;
          return (
            <Card key={wk}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex flex-wrap items-center gap-2">
                  Week {wk}
                  {date && (
                    <Badge variant="outline" className="gap-1">
                      <CalendarDays className="h-3 w-3" /> {format(new Date(date), "EEE d MMM yyyy")}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground font-normal ml-auto">{wl.length} game{wl.length !== 1 ? "s" : ""}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-1">
                {wl.map((f) => <ScheduleFixtureRow key={f.id} fixture={toRow(f)} canManage={canManage} divisions={divisionSelect} />)}
              </CardContent>
            </Card>
          );
        })}
        {noWeek.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base text-muted-foreground">Not assigned to a week</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-1">
              {noWeek.map((f) => <ScheduleFixtureRow key={f.id} fixture={toRow(f)} canManage={canManage} divisions={divisionSelect} />)}
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const divisionsWithFixtures = divisions.filter((d) => seasonFixtures.some((f) => f.divisionId === d.id));
  const noDivision = seasonFixtures.filter((f) => f.divisionId == null);

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24 space-y-6">
      <Link href="/fixtures/schedule">
        <Button variant="ghost" size="sm" className="gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Schedules
        </Button>
      </Link>

      <div>
        <h1 className="text-2xl font-bold">{season.name} schedule</h1>
        <p className="text-muted-foreground">{seasonFixtures.length} fixture{seasonFixtures.length !== 1 ? "s" : ""}.</p>
      </div>

      {canManage && (
        <WeekBuilder
          seasonId={sid}
          seasonName={season.name}
          teams={teamOptions}
          divisions={builderDivisions}
          defaultDivisionId={defaultDivisionId}
          defaultLeague={defaultLeague}
          defaultDate={season.startDate.toISOString()}
          activeTeamId={activeTeamId}
        />
      )}

      {seasonFixtures.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No fixtures scheduled yet.</CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {divisionsWithFixtures.map((d) => (
            <div key={d.id} className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Layers className="h-4 w-4 text-muted-foreground" /> {d.name}
              </h2>
              {renderWeeks(seasonFixtures.filter((f) => f.divisionId === d.id))}
            </div>
          ))}
          {noDivision.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-muted-foreground">
                <Layers className="h-4 w-4" /> No division
              </h2>
              {renderWeeks(noDivision)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
