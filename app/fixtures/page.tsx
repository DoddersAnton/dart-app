
import EnhancedFixtureCard from "@/components/fixtures/fixture-list-card";
import { getFixtureKpis } from "@/server/actions/get-fixture-kpis";
import { getFixtureList } from "@/server/actions/get-fixture-list";
export const dynamic = "force-dynamic";



export default async function FixturesPage() {
    const fixtureList = await getFixtureList();

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

    const fixtureKpis = await getFixtureKpis();

    if( fixtureKpis.error) {
        return <div className="mt-22">{fixtureKpis.error}</div>;
    }

    if (!fixtureKpis.success) {
        return (
            <div className="container mx-auto py-12 mt-22">
                <h1 className="text-2xl font-bold">No fixture KPIs found</h1>
            </div>
        );
    }

    return (
        <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
          
            {/* Render fixture list here */}

            <EnhancedFixtureCard 
                data={fixtureList.success}
                kpis={fixtureKpis.success!} />
        </div>
    );
}
