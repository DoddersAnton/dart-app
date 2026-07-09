import { getLeagueTableData } from "@/server/actions/get-league-table";
import { NO_DIVISION } from "@/lib/league-table";
import { LeagueTableView } from "@/components/fixtures/league-table-view";
import { isLeagueAdmin } from "@/lib/permissions";
import { db } from "@/server";

export const dynamic = "force-dynamic";

export default async function LeagueTablePage({
  searchParams,
}: {
  searchParams: Promise<{ season?: string; division?: string }>;
}) {
  const { season, division } = await searchParams;

  const seasonId = season ? Number(season) : null;
  const divisionParam: number | "none" | null =
    division === NO_DIVISION ? NO_DIVISION : division ? Number(division) : null;

  const [data, isAdmin, allSeasons, allDivisions, allTeams] = await Promise.all([
    getLeagueTableData(seasonId, divisionParam),
    isLeagueAdmin(),
    db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    db.query.division.findMany({ orderBy: (d, { asc }) => [asc(d.name)] }),
    db.query.team.findMany({ orderBy: (t, { asc }) => [asc(t.name)] }),
  ]);

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">League Table</h1>
        <p className="text-muted-foreground">Division standings, updated as each week is submitted.</p>
      </div>
      <LeagueTableView
        data={data}
        isAdmin={isAdmin}
        allSeasons={allSeasons.map((s) => ({ id: s.id, name: s.name }))}
        allDivisions={allDivisions.map((d) => ({ id: d.id, name: d.name }))}
        allTeams={allTeams.map((t) => ({ id: t.id, name: t.name }))}
      />
    </div>
  );
}
