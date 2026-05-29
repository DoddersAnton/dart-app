"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteAward } from "@/server/actions/delete-award";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface AwardType {
  id: number;
  title: string;
  description: string | null;
  createdAt: string | null;
}

export function AwardTypeCardList({ awards }: { awards: AwardType[] }) {
  const [search, setSearch] = useState("");

  const { execute } = useAction(deleteAward, {
    onSuccess: (data) => {
      if (data?.data?.error) toast.error(data.data.error);
      if (data?.data?.success) toast.success(data.data.success);
    },
    onExecute: () => toast.info("Deleting award type..."),
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return term ? awards.filter((a) => a.title.toLowerCase().includes(term)) : awards;
  }, [awards, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search award types..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {filtered.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((award) => (
            <Card key={award.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">{award.title}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                        <Link href={`/settings/add-award-type?id=${award.id}`}>
                          Edit Award
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => execute({ id: award.id })}
                        className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
                      >
                        Delete Award
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                {award.description && <p>{award.description}</p>}
                {award.createdAt && (
                  <p>Created: {new Date(award.createdAt).toLocaleDateString("en-GB")}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No award types found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
