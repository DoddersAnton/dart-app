import { Calendar, HouseIcon } from "lucide-react";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";




type Fixture = {
  id: number;
  matchLocation: string;
  matchDate: string | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamScore: number;
   awayTeamScore: number;
  createdAt: string | null;
  league: string;
    season: string;
};

export default function FixtureCard({ fixtureData }: { fixtureData: Fixture }) {
 
    return ( 
        <Card>
      <CardHeader>
        <CardTitle>
            <span title="Winner" role="img" aria-label="Trophy">🏆</span>{" "}
            {fixtureData.awayTeamScore > fixtureData.homeTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`} - 
                {" "}
                  {fixtureData.awayTeamScore < fixtureData.homeTeamScore
                ? `${fixtureData.awayTeam} (${fixtureData.awayTeamScore})`
                : `${fixtureData.homeTeam} (${fixtureData.homeTeamScore})`}
        </CardTitle>
        <div className="flex flex-row items-center gap-6">
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Badge variant="secondary" className="cursor-pointer min-w-[100px] text-left" >
                    Spring / Summer 25 - {fixtureData.league}
                </Badge>
              </div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Badge variant="secondary" className="cursor-pointer min-w-[100px] text-left" >
                    {fixtureData.league}
                </Badge>
              </div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
              <div className="flex items-center gap-2">
              <div>
                <HouseIcon size={12} />
              </div>
              <div>{fixtureData.matchLocation}</div>
            </div>{" "}
          </CardDescription>
          <CardDescription>
            <div className="flex items-center gap-2">
              <div>
                <Calendar size={12} />
              </div>
              <div>{fixtureData.matchDate}</div>
            </div>{" "}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="overflow-auto">
            <div>
                <div>{fixtureData.homeTeam} vs {fixtureData.awayTeam}</div>
                <div>{fixtureData.matchLocation} - {fixtureData.matchDate}</div>
                <div>Score: {fixtureData.homeTeamScore} - {fixtureData.awayTeamScore}</div>
            </div>
            </CardContent>
        </Card>
    );
}