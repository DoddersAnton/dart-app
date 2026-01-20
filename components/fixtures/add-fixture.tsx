"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Form,
  FormDescription,
} from "@/components/ui/form";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { Button } from "../ui/button";
import { useAction } from "next-safe-action/hooks";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  createFixtureSchema,
  zFixtureSchema,
} from "@/types/add-fixture-schema";
import { createFixture } from "@/server/actions/create-fixture";
import { getFixture } from "@/server/actions/get-fixture";
import { getTeams } from "@/server/actions/get-teams";
import { getLocations } from "@/server/actions/get-locations";
import { getSeasons } from "@/server/actions/get-seasons";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Input } from "../ui/input";

type FixtureTeam = {
  id: number;
  name: string;
  locationid: number | null;
};

type FixtureLocation = {
  id: number;
  name: string;
};

type FixtureSeason = {
  id: number;
  name: string;
};

export default function FixtureForm() {
  const form = useForm<zFixtureSchema>({
    resolver: zodResolver(createFixtureSchema),
    defaultValues: {
      matchStatus: "scheduled",
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [teams, setTeams] = useState<FixtureTeam[]>([]);
  const [locations, setLocations] = useState<FixtureLocation[]>([]);
  const [seasons, setSeasons] = useState<FixtureSeason[]>([]);

  // ---------------------------
  // Load dropdown data
  // ---------------------------
  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [teamsRes, locationsRes, seasonsRes] = await Promise.all([
        getTeams(),
        getLocations(),
        getSeasons(),
      ]);

      if (teamsRes?.success) {
        setTeams(
          teamsRes.success.map((t) => ({
            id: t.id,
            name: t.name,
            locationid: t.defaultLocationId,
          }))
        );
      }

      if (locationsRes?.success) {
        setLocations(locationsRes.success);
      }

      if (seasonsRes?.success) {
        setSeasons(seasonsRes.success);
      }

      if (editMode) {
        await checkFixture(parseInt(editMode));
      }

      setLoading(false);
    }

    loadData();
  }, []);

  // ---------------------------
  // Load fixture for edit
  // ---------------------------
  const checkFixture = async (id: number) => {
    const data = await getFixture(id);

    if (data?.error) {
      toast.error(data.error);
      router.push("/fixtures");
      return;
    }

    if (data?.success) {
      form.reset({
        id: data.success.id,
        matchDate: new Date(data.success.matchDate),
        matchLocationId: data.success.matchLocationId ?? undefined,
        homeTeamId: data.success.homeTeamId ?? undefined,
        awayTeamId: data.success.awayTeamId ?? undefined,
        homeTeamScore: data.success.homeTeamScore ?? 0,
        awayTeamScore: data.success.awayTeamScore ?? 0,
        matchStatus: data.success.matchStatus ?? "scheduled",
        league: data.success.league ?? "",
        seasonId: data.success.seasonsId ?? undefined,
      });
    }
  };

  // ---------------------------
  // Auto-set location from home team
  // ---------------------------
  const homeTeamId = form.watch("homeTeamId");

  useEffect(() => {
    if (!homeTeamId || teams.length === 0) return;

    const team = teams.find((t) => t.id === Number(homeTeamId));
    if (team?.locationid) {
      form.setValue("matchLocationId", team.locationid, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [homeTeamId, teams]);

  // ---------------------------
  // Submit
  // ---------------------------
  const { execute, status } = useAction(createFixture, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        return;
      }
      if (data.data?.success) {
        toast.success(data.data.success);
        router.push("/fixtures");
      }
    },
    onExecute: () => {
      toast.info(editMode ? "Editing match..." : "Creating match...");
    },
  });

  async function onSubmit(values: zFixtureSchema) {
    execute(values);
  }

  // ---------------------------
  // UI
  // ---------------------------
  return (
    <div className="flex items-center justify-center">
      {loading && (
        <div className="flex items-center justify-center h-screen">
          Loading...
        </div>
      )}

      {!loading && (
        <Card className="mx-auto w-full lg:w-[60%]">
          <CardHeader>
            <CardTitle>{editMode ? "Edit" : "Create"} Match</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} a match to track the details of the
              game.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                {/* Match Date */}

                <Accordion
                  type="single"
                  collapsible
                  className="max-w-lg rounded-lg border"
                  defaultValue="details"
                >
                  <AccordionItem value="details">
                    <AccordionTrigger className="text-lg font-medium p-2">
                      Match Details
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4 p-4">
                      <p>Select the date, season and league</p>
                      <FormField
                        control={form.control}
                        name="matchDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Match Date</FormLabel>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-[240px] justify-start text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value
                                    ? format(field.value, "PPP")
                                    : "Pick a date"}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={field.value}
                                  onSelect={field.onChange}
                                  initialFocus
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Season */}
                      <FormField
                        control={form.control}
                        name="seasonId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Season</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value?.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select season" />
                                </SelectTrigger>
                                <SelectContent>
                                  {seasons.map((s) => (
                                    <SelectItem
                                      key={s.id}
                                      value={s.id.toString()}
                                    >
                                      {s.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* League */}
                      <FormField
                        control={form.control}
                        name="league"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>League</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select league" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Division 2">
                                    Division 2
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="teams">
                    <AccordionTrigger className="text-lg font-medium p-2">
                      Match Teams
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4 p-4">
                      <p>Select the teams, match location</p>
                      {/* Home Team */}
                      <FormField
                        control={form.control}
                        name="homeTeamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Team</FormLabel>
                            <FormDescription>This sets the match location</FormDescription>
                            <FormControl>
                              <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value?.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select home team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((t) => (
                                    <SelectItem
                                      key={t.id}
                                      value={t.id.toString()}
                                    >
                                      {t.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Location */}
                      <FormField
                        control={form.control}
                        name="matchLocationId"
                        disabled={true}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Location</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value?.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select location" />
                                </SelectTrigger>
                                <SelectContent>
                                  {locations.map((l) => (
                                    <SelectItem
                                      key={l.id}
                                      value={l.id.toString()}
                                    >
                                      {l.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Away Team */}
                      <FormField
                        control={form.control}
                        name="awayTeamId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Away Team</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={(v) => field.onChange(Number(v))}
                                value={field.value?.toString()}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select away team" />
                                </SelectTrigger>
                                <SelectContent>
                                  {teams.map((t) => (
                                    <SelectItem
                                      key={t.id}
                                      value={t.id.toString()}
                                    >
                                      {t.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="outcome">
                    <AccordionTrigger className="text-lg font-medium p-2">
                      Match Result
                    </AccordionTrigger>

                    <AccordionContent className="space-y-4 p-4">
                      <p>Select the scores & match status</p>
                      {/* Scores */}
                      <FormField
                        control={form.control}
                        name="homeTeamScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Home Score</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="awayTeamScore"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Away Score</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                className="input"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Status */}
                      <FormField
                        control={form.control}
                        name="matchStatus"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Status</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="scheduled">
                                    Scheduled
                                  </SelectItem>
                                  <SelectItem value="completed">
                                    Completed
                                  </SelectItem>
                                  <SelectItem value="cancelled">
                                    Cancelled
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                <CardFooter className="flex justify-between px-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/fixtures")}
                  >
                    Cancel
                  </Button>
                  <Button disabled={status === "executing"} type="submit">
                    Save
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
