

import FixtureCard from "@/components/fixtures/fixture-card";
import { getFixture } from "@/server/actions/get-fixture";

export default async function Fixture({
  params,
}: {
  params: Promise<{ id: number }>;
}) {
  const { id } = await params;
  const match = await getFixture(id);

  if (match.error) {
    return <div className="mt-22">{match.error}</div>;
  }

  if (!match) {
    return (
      <div className="container mx-auto py-12 mt-22">
        <h1 className="text-2xl font-bold">Match not found</h1>
      </div>
    );
  }

if (match.success) {
  const matchDetails = {
    ...match.success,
    // ensure dates and optional string fields are actual strings to match the Fixture type
    createdAt: match.success.createdAt ? match.success.createdAt.toLocaleDateString("en-GB") : "",
    matchDate: match.success.matchDate ? match.success.matchDate.toLocaleDateString("en-GB") : "",
    season: match.success.season ?? "",
    location: match.success.location ?? "",
  };

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <FixtureCard fixtureData={matchDetails} />
    </div>
  );
}
  
}