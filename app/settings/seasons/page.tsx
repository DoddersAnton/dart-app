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
      <h1 className="text-2xl font-bold">Seasons</h1>
      <p>Manage your seasons settings here.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {!seasons || seasons.success.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Sun size={48} />
              </EmptyMedia>
              <EmptyTitle>No Seasons Yet</EmptyTitle>
              <EmptyDescription>
                Start by creating a new season.
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
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Link href="/settings/add-season">
                <Button variant="outline" size="sm">Add Season</Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {seasons.success.map((season) => (
                <SeasonCard
                  key={season.id}
                  id={season.id}
                  name={season.name}
                  fromSeasonDate={season.startDate}
                  toSeasonDate={season.endDate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
