import { FineTypeCardList } from "@/app/fines/fine-types/fine-type-card-list";
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
import { Banknote } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function FineTypesSettingsPage() {
  const fines = (await db.query.fines.findMany()).map((fine) => ({
    ...fine,
    description: fine.description ?? "No description available",
    createdAt: fine.createdAt ? fine.createdAt.toISOString() : null,
  }));

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Fine Types</h1>
      <p>Manage your fine types here.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {fines.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Banknote size={48} />
              </EmptyMedia>
              <EmptyTitle>No Fine Types Yet</EmptyTitle>
              <EmptyDescription>
                Start by creating a new fine type.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Link href="/settings/add-fine-type">
                  <Button>Create Fine Type</Button>
                </Link>
              </div>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            <div className="flex justify-end mb-4">
              <Link href="/settings/add-fine-type">
                <Button variant="outline" size="sm">Add Fine Type</Button>
              </Link>
            </div>
            <FineTypeCardList fines={fines} />
          </>
        )}
      </div>
    </div>
  );
}
