"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { deleteFine } from "@/server/actions/delete-fine";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useAction } from "next-safe-action/hooks";
import { useMemo, useState } from "react";
import { toast } from "sonner";

interface FineType {
  id: number;
  title: string;
  description: string;
  amount: number;
  createdAt: string | null;
}

interface FineTypeCardListProps {
  fines: FineType[];
}

export function FineTypeCardList({ fines }: FineTypeCardListProps) {
  const [search, setSearch] = useState("");

  const { execute } = useAction(deleteFine, {
    onSuccess: (data: { error?: string; data?: { success?: string } }) => {
      if (data?.error) {
        toast.error(data.error);
      }
      if (data?.data?.success) {
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      toast.info("Deleting fine type...");
    },
  });

  const filteredFines = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return fines;
    }

    return fines.filter((fine) => fine.title.toLowerCase().includes(term));
  }, [fines, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search fine types by title..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {filteredFines.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredFines.map((fine) => {
            const formattedAmount = new Intl.NumberFormat("en-GB", {
              currency: "GBP",
              style: "currency",
            }).format(fine.amount);

            const formattedDate = fine.createdAt
              ? new Date(fine.createdAt).toLocaleDateString("en-GB")
              : "N/A";

            return (
              <Card key={fine.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-lg">{fine.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer">
                          <Link href={`/fines/fine-types/add-fine-type?id=${fine.id}`}>
                            Edit Fine
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => execute({ id: fine.id })}
                          className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
                        >
                          Delete Fine
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p className="text-foreground font-medium">{formattedAmount}</p>
                  <p>Created: {formattedDate}</p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        View Description
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>{fine.title}</DialogTitle>
                      </DialogHeader>
                      <p className="text-sm text-muted-foreground">{fine.description}</p>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No fine types found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
