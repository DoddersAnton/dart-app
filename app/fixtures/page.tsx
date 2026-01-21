import { db } from "@/server";
import { FixtureSummary } from "./fixture-summary";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
export const dynamic = "force-dynamic";

export default async function Page() {

  const url = new URLSearchParams(
    (typeof window === "undefined" ? "" : window.location.search)
  );
  const seasonFilter = url.get("season"); 

  const fixtures = ((await db.query.fixtures.findMany())).map((fixture) => ({
    id: fixture.id,
    location: fixture.matchLocation,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeTeamScore: fixture.homeTeamScore,
    awayTeamScore: fixture.awayTeamScore,
    matchDate: fixture.matchDate ? fixture.matchDate.toISOString() : null,
    createdAt: fixture.createdAt ? fixture.createdAt.toISOString() : null,
    status: fixture.matchStatus,
    isAppTeamWin: fixture.isAppTeamWin,
    season: fixture.season,
    league: fixture.league,
  })).filter((fixture) => {
    if (seasonFilter) {
      return fixture.season === seasonFilter;
    }
    return true;
  }).sort((a, b) => {
    const dateA = a.matchDate ? Date.parse(a.matchDate) : 0;
    const dateB = b.matchDate ? Date.parse(b.matchDate) : 0;
    return dateB - dateA;
  }); // Sort by matchDate in descending order

    
 

  return (
    <div className="container mx-auto py-12 mt-12 p-1">
      <div className="flex items-center justify-between mb-1">
        <Link href="/fixtures/add-fixture" className="flex justify-center">
          <Button size="sm" className="mb-0" variant="outline">
            Add Match <Plus className="ml-2" size={16} />
          </Button>
        </Link>
        {(() => {
          const seasons = Array.from(
            new Set(
              fixtures
                .map((f) => (f.season))
                .filter(Boolean)
            )
          ).sort((a, b) => Number(b) - Number(a));

          if (seasons.length === 0) {
            return null;
          }

          return (
            <form method="get" className="flex items-center space-x-2">
              <label htmlFor="season" className="sr-only">
                Season
              </label>
              <select
                id="season"
                name="season"
                defaultValue=""
                className="rounded-md border px-2 py-1 text-sm"
              >
                <option value="">All seasons</option>
                {seasons.map((s) => (
                  <option key={s} value={s?.toString()}>
                    {s}
                  </option>
                ))}
              </select>

              <Button type="submit" size="sm" className="mb-0">
                Filter
              </Button>

              <Link href="/fixtures" className="flex">
                <Button size="sm" variant="ghost" className="mb-0">
                  Clear
                </Button>
              </Link>
            </form>
          );
        })()}
      </div>
       
     
      {(() => {
        const totalMatches = fixtures.length;
        
        const matchWon = fixtures.filter((f) => f.isAppTeamWin).length;
        const matchesLost = fixtures.filter((f) => !f.isAppTeamWin).length;
        const winPercentage = totalMatches > 0 ? ((matchWon / totalMatches) * 100).toFixed(2) : "0.00";
       
        const stats = [
          { id: "total", title: "Total Matches", value: totalMatches, icon: "📊" } ,
          { id: "won", title: "Total Won", value: matchWon, icon: "🏆" },
          { id: "lost", title: "Total Lost", value: matchesLost, icon: "❌" },
          { id: "%win", title: "Win %", value: winPercentage, icon: "📈" },  
        ];

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
        {stats.map((s) => (
          <Card key={s.id} className="p-4">
            <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{s.title}</p>
            <p className="mt-1 text-2xl font-semibold">{s.value}</p>
          </div>
          <div className="text-muted-foreground text-xs">
            {/* small contextual text or icon placeholder */}
            {/* replace with sparkline or icon if available */}
            <div className="text-2xl">
 {s.icon}
            </div>
           
          </div>
            </div>
          </Card>
        ))}
          </div>
        );
      })()}
      <FixtureSummary fixtures={fixtures} />
    </div>
  );
}
