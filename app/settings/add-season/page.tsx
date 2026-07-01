import SeasonForm from "@/components/seasons/season-form";
import { Suspense } from "react";
import { db } from "@/server";

export const dynamic = "force-dynamic";

export default async function SeasonsPage() {
  const seasons = (await db.query.seasons.findMany({ orderBy: (s, { desc }) => [desc(s.startDate)] }))
    .map((s) => ({ id: s.id, name: s.name }));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Add New Season</h1>
       <p>Manage your seasons settings here.</p>
      <div className="mt-8 px-2">
        <Suspense>
          <SeasonForm seasons={seasons} />
        </Suspense>
      </div>
    </div>
  );
}
