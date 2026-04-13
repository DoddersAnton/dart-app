import FixtureCard from "@/components/fixtures/fixture-card";
import { getFixture } from "@/server/actions/get-fixture";
import { getFixtureAvailability } from "@/server/actions/get-fixture-availability";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { currentUser } from "@clerk/nextjs/server";

export default async function FixturePage({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const user = await currentUser();

  const [match, availability, linkedPlayer] = await Promise.all([
    getFixture(id),
    getFixtureAvailability(Number(id)),
    user ? getPlayerByUserId(user.id) : Promise.resolve(null),
  ]);

  if (match.error || !match.success) {
    return <div className="mt-22 container mx-auto py-12">Match not found</div>;
  }

  const s = match.success;

  const matchDetails = {
    id: s.id,
    homeTeam: s.homeTeam,
    awayTeam: s.awayTeam,
    homeTeamScore: s.homeTeamScore,
    awayTeamScore: s.awayTeamScore,
    matchLocation: s.location ?? s.matchLocation,
    locationAddress: s.locationAddress ?? null,
    locationMapsLink: s.locationMapsLink ?? null,
    matchDate: s.matchDate ? s.matchDate.toISOString() : null,
    matchStatus: s.matchStatus,
    season: s.season ?? "",
    league: s.league,
    isAppTeamWin: s.isAppTeamWin,
    notes: s.notes ?? null,
    createdAt: s.createdAt ? s.createdAt.toLocaleDateString("en-GB") : "",
  };

  return (
    <div className="w-full px-4 mx-auto max-w-4xl mt-24 space-y-6">
      <FixtureCard fixtureData={matchDetails} availability={availability} linkedPlayerId={linkedPlayer?.id ?? null} />
    </div>
  );
}
