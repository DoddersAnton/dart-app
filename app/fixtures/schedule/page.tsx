import Link from "next/link";
import { db } from "@/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarDays, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SchedulesIndexPage() {
  const [seasons, allFixtures] = await Promise.all([
    db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }),
    db.query.fixtures.findMany(),
  ]);

  const countBySeason = new Map<number, number>();
  for (const f of allFixtures) if (f.seasonsId) countBySeason.set(f.seasonsId, (countBySeason.get(f.seasonsId) ?? 0) + 1);

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24 space-y-4">
      <h1 className="text-2xl font-bold">Schedules</h1>
      <p className="text-muted-foreground">Pick a season to view or build its fixture schedule.</p>

      {seasons.length === 0 ? (
        <p className="text-sm text-muted-foreground">No seasons yet — create one in Settings → Seasons.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {seasons.map((s) => (
            <Link key={s.id} href={`/fixtures/schedule/${s.id}`}>
              <Card className="hover:bg-muted/40 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center justify-between gap-2">
                    <span className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-muted-foreground" /> {s.name}
                    </span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 text-sm text-muted-foreground">
                  {countBySeason.get(s.id) ?? 0} fixture{(countBySeason.get(s.id) ?? 0) !== 1 ? "s" : ""}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
