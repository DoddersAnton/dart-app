import { fixtureSummaryColumns } from "./fixture-summary-columns";
import { FixtureSummaryDataTable } from "./fixture-summary-table";




interface FixtureSummaryProps {
  fixtures: {
    id: number;
    location: string;
    homeTeam: string;
    awayTeam: string;
    homeTeamScore: number;
    awayTeamscore: number;
    matchDate: string | null;
    createdAt: string | null;
  }[];
}

export function FixtureSummary({ fixtures }: FixtureSummaryProps) {


    return (
    <div className="flex flex-col gap-4">
        <FixtureSummaryDataTable
                    columns={fixtureSummaryColumns}
                    data={fixtures}
                    total={fixtures.length}
                    totalAwayScore={fixtures.reduce((acc, fixture) => acc + fixture.awayTeamscore, 0)}
                    totalHomeScore={fixtures.reduce((acc, fixture) => acc + fixture.homeTeamScore, 0)}
                  />

    </div>

    ); 

}