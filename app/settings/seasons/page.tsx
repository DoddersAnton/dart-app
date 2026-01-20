import SeasonCard from "@/components/seasons/season-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getSeasons } from "@/server/actions/get-seasons";
import { Sun } from "lucide-react";
import Link from "next/link";

export default async function SeasonsSettingsPage() {
  const seasons = await getSeasons();

  if ("error" in seasons) {
    return <div className="mt-22">{seasons.error}</div>;
  }

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Seasons Settings Page</h1>
      <p>Manage your seasons settings here.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {!seasons || seasons.success.length === 0 ? (
          <div>
            {" "}
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Sun size={48} />
                </EmptyMedia>
                <EmptyTitle>No Seasons Yet</EmptyTitle>
                <EmptyDescription>
                  No Locations added yet. Start by creating a new location.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Link href="/settings/add-season">
                    <Button>Create Season</Button>
                  </Link>
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : null}
        {seasons &&
          seasons.success.length > 0 &&
          seasons.success.map((location) => (
            <SeasonCard
              key={location.id}
              id={location.id}
              name={location.name}
              fromSeasonDate={location.startDate}
              toSeasonDate={location.endDate}
            />
          ))}
      </div>
    </div>
  );
}
