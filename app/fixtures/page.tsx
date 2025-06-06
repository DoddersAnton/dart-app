import { db } from "@/server";
import { FixtureSummary } from "./fixture-summary";
import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
export const dynamic = "force-dynamic";

export default async function Page() {
  const fixtures = (await db.query.fixtures.findMany()).map((fixture) => ({
    id: fixture.id,
    location: fixture.matchLocation,
    homeTeam: fixture.homeTeam,
    awayTeam: fixture.awayTeam,
    homeTeamScore: fixture.homeTeamScore,
    awayTeamscore: fixture.awayTeamScore,
    matchDate: fixture.matchDate ? fixture.matchDate.toISOString() : null,
    createdAt: fixture.createdAt ? fixture.createdAt.toISOString() : null,
  }));

  return (
    <div className="container mx-auto py-12 mt-22">
      <div className="flex items-center gap-2 mb-6 flex-row">
        ⚠️
        <CardDescription>
          Page under construction. Future match scores will be generated from games
        </CardDescription>
      </div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/fixtures/add-fixture" className="flex justify-center">
          <Button size="sm" className="mb-0" variant="outline">
            Add Match <Plus className="ml-2" size={16} />
          </Button>
        </Link>
      </div>
      <FixtureSummary fixtures={fixtures} />
    </div>
  );
}
