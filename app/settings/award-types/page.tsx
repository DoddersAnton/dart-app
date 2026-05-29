import { AwardTypeCardList } from "@/components/awards/award-type-card-list";
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
import { Trophy } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AwardTypesSettingsPage() {
  const awards = (await db.query.awards.findMany()).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description ?? null,
    createdAt: a.createdAt ? a.createdAt.toISOString() : null,
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Award Types</h1>
      <p>Manage the types of awards that can be assigned to players each season.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {awards.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Trophy size={48} />
              </EmptyMedia>
              <EmptyTitle>No Award Types Yet</EmptyTitle>
              <EmptyDescription>
                Start by creating a new award type.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Link href="/settings/add-award-type">
                  <Button>Create Award Type</Button>
                </Link>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Link href="/settings/add-award-type">
                <Button variant="outline" size="sm">Add Award Type</Button>
              </Link>
            </div>
            <AwardTypeCardList awards={awards} />
          </>
        )}
      </div>
    </div>
  );
}
