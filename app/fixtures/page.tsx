
import EnhancedFixtureCard from "@/components/fixtures/fixture-list-card";
import { getFixtureKpis } from "@/server/actions/get-fixture-kpis";
import { getFixtureList } from "@/server/actions/get-fixture-list";
import { getGamesSummaryBySeason } from "@/server/actions/get-player-games-summary";
import { getFixturesAvailabilitySummary } from "@/server/actions/get-fixtures-availability-summary";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { currentUser } from "@clerk/nextjs/server";
export const dynamic = "force-dynamic";

export default async function FixturesPage() {
    const user = await currentUser();

    const [fixtureList, fixtureKpis, playerList, availabilitySummary, linkedPlayer] = await Promise.all([
        getFixtureList(),
        getFixtureKpis(),
        getGamesSummaryBySeason(),
        getFixturesAvailabilitySummary(),
        user ? getPlayerByUserId(user.id) : Promise.resolve(null),
    ]);

    if (fixtureList.error) {
        return <div className="mt-22">{fixtureList.error}</div>;
    }

    if (!fixtureList.success || fixtureList.success.length === 0) {
        return (
            <div className="container mx-auto py-12 mt-22">
                <h1 className="text-2xl font-bold">No fixtures found</h1>
            </div>
        );
    }

    if (fixtureKpis.error || !fixtureKpis.success) {
        return <div className="mt-22">{fixtureKpis.error ?? "No fixture KPIs found"}</div>;
    }

    if (playerList.error || !playerList.success) {
        return <div className="mt-22">{playerList.error ?? "No Season player list found"}</div>;
    }

    return (
        <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
            <EnhancedFixtureCard
                data={fixtureList.success}
                kpis={fixtureKpis.success}
                playerGameSummary={playerList.success}
                availabilitySummary={availabilitySummary}
                linkedPlayerId={linkedPlayer?.id ?? null}
            />
        </div>
    );
}
