"use client";

import { useState } from "react";
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { MoreHorizontal, Plus, Trophy } from "lucide-react";
import { createPlayerAwardSchema, zPlayerAwardSchema } from "@/types/add-player-award-schema";
import { createPlayerAward } from "@/server/actions/create-player-award";
import { deletePlayerAward } from "@/server/actions/delete-player-award";

interface AwardType {
  id: number;
  title: string;
  description: string | null;
}

interface Season {
  id: number;
  name: string;
}

interface PlayerAward {
  id: number;
  playerId: number;
  awardId: number;
  seasonId: number | null;
  notes: string | null;
  awardedAt: string | null;
  award: AwardType;
  season: Season | null;
}

interface Props {
  playerId: number;
  playerAwards: PlayerAward[];
  awardTypes: AwardType[];
  seasons: Season[];
}

export function PlayerAwardsClient({ playerId, playerAwards, awardTypes, seasons }: Props) {
  const [open, setOpen] = useState(false);
  const [editingAward, setEditingAward] = useState<PlayerAward | null>(null);

  const form = useForm<zPlayerAwardSchema>({
    resolver: zodResolver(createPlayerAwardSchema),
    defaultValues: { playerId },
    mode: "onChange",
  });

  const { execute: execCreate, status: createStatus } = useAction(createPlayerAward, {
    onSuccess: (data) => {
      if (data.data?.error) { toast.error(data.data.error); return; }
      if (data.data?.success) {
        toast.success(data.data.success);
        setOpen(false);
        setEditingAward(null);
        form.reset({ playerId });
      }
    },
    onExecute: () => toast.info("Saving award..."),
  });

  const { execute: execDelete } = useAction(deletePlayerAward, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      if (data.data?.success) toast.success(data.data.success);
    },
    onExecute: () => toast.info("Removing award..."),
  });

  function openAdd() {
    setEditingAward(null);
    form.reset({ playerId });
    setOpen(true);
  }

  function openEdit(pa: PlayerAward) {
    setEditingAward(pa);
    form.reset({
      id: pa.id,
      playerId: pa.playerId,
      awardId: pa.awardId,
      seasonId: pa.seasonId ?? undefined,
      notes: pa.notes ?? "",
      awardedAt: pa.awardedAt ? pa.awardedAt.slice(0, 10) : "",
    });
    setOpen(true);
  }

  function onSubmit(values: zPlayerAwardSchema) {
    execCreate(values);
  }

  const grouped = seasons
    .map((s) => ({
      season: s,
      awards: playerAwards.filter((pa) => pa.seasonId === s.id),
    }))
    .filter((g) => g.awards.length > 0);

  const unlinked = playerAwards.filter((pa) => pa.seasonId === null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Awards</h2>
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setEditingAward(null); form.reset({ playerId }); } }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openAdd}>
              <Plus className="h-4 w-4 mr-1" /> Assign Award
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingAward ? "Edit Award" : "Assign Award"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="awardId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Award</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(parseInt(v))}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an award" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {awardTypes.map((a) => (
                            <SelectItem key={a.id} value={a.id.toString()}>
                              {a.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seasonId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Season</FormLabel>
                      <Select
                        onValueChange={(v) => field.onChange(v === "none" ? undefined : parseInt(v))}
                        value={field.value?.toString() ?? "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a season" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">No season</SelectItem>
                          {seasons.map((s) => (
                            <SelectItem key={s.id} value={s.id.toString()}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="awardedAt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date Awarded</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Optional notes about this award" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createStatus === "executing"}>
                    Save
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {playerAwards.length === 0 ? (
        <Card>
          <CardContent className="py-12 flex flex-col items-center gap-3 text-muted-foreground">
            <Trophy className="h-10 w-10 opacity-30" />
            <p>No awards yet. Assign the first one above.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ season, awards }) => (
            <div key={season.id}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {season.name}
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {awards.map((pa) => (
                  <AwardCard
                    key={pa.id}
                    pa={pa}
                    onEdit={() => openEdit(pa)}
                    onDelete={() => execDelete({ id: pa.id, playerId })}
                  />
                ))}
              </div>
            </div>
          ))}
          {unlinked.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                No Season
              </h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {unlinked.map((pa) => (
                  <AwardCard
                    key={pa.id}
                    pa={pa}
                    onEdit={() => openEdit(pa)}
                    onDelete={() => execDelete({ id: pa.id, playerId })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function AwardCard({
  pa,
  onEdit,
  onDelete,
}: {
  pa: PlayerAward;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-yellow-500 shrink-0" />
            <CardTitle className="text-base">{pa.award.title}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-7 w-7 p-0 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer"
                onClick={onDelete}
              >
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        {pa.season && <Badge variant="outline">{pa.season.name}</Badge>}
        {pa.awardedAt && (
          <p>{new Date(pa.awardedAt).toLocaleDateString("en-GB")}</p>
        )}
        {pa.notes && <p className="italic">{pa.notes}</p>}
      </CardContent>
    </Card>
  );
}
