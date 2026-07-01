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
import { db } from "@/server";
import { Sun } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SeasonsSettingsPage() {
  const raw = await db.query.seasons.findMany();

  const fmt = (d: Date | null) => {
    if (!d) return null;
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    return `${dd}/${mm}/${d.getFullYear()}`;
  };

  // Order newest-first by start date. Current = highest start date;
  // Last = the current season's linked predecessor (or the next-older one).
  const sorted = [...raw].sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  const currentId = sorted[0]?.id ?? null;
  const lastId = sorted[0]?.lastSeasonId ?? sorted[1]?.id ?? null;

  const seasons = sorted.map((s) => ({
    id: s.id,
    name: s.name,
    startDate: fmt(s.startDate),
    endDate: fmt(s.endDate),
    isCurrent: s.id === currentId,
    isLast: s.id === lastId,
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Seasons</h1>
      <p>Manage your seasons settings here.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {seasons.length === 0 ? (
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
              {seasons.map((season) => (
                <SeasonCard
                  key={season.id}
                  id={season.id}
                  name={season.name}
                  fromSeasonDate={season.startDate}
                  toSeasonDate={season.endDate}
                  isCurrent={season.isCurrent}
                  isLast={season.isLast}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
