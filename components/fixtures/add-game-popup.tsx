"use client";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
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
import { Info, Minus, Plus } from "lucide-react";
import { addGameSchema, zGameSchema } from "@/types/add-game-schema";
import { getGame } from "@/server/actions/get-game";
import { createGame } from "@/server/actions/create-game";
import { getPlayers } from "@/server/actions/get-players";
import { getTeamPlayers, type TeamPlayer } from "@/server/actions/get-team-players";
import { getFixture } from "@/server/actions/get-fixture";
import { getAppSettings } from "@/server/actions/get-app-settings";

function ScoreStepper({
  value,
  onChange,
  min = 0,
  max,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max: number;
  label?: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="h-4 w-4" />
      </Button>
      <div className="flex flex-col items-center min-w-[3rem]">
        <span className="text-2xl font-bold tabular-nums leading-none">{value}</span>
        {label && <span className="text-xs text-muted-foreground mt-0.5">{label}</span>}
      </div>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="h-9 w-9 shrink-0"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="h-4 w-4" />
      </Button>
      <span className="text-xs text-muted-foreground">max {max}</span>
    </div>
  );
}

import { z } from "zod";

import MultipleSelector from "../ui/MultipleSelector";
import { Dialog } from "@radix-ui/react-dialog";
import { DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

type GameFormProps = {
  fixtureId: number;
  onGameAdded?: () => void;
  gameId?: number;
};

// Render a roster MultipleSelector bound to a form field of player ids.
function RosterField({
  field,
  roster,
}: {
  field: { value: number[]; onChange: (ids: number[]) => void };
  roster: TeamPlayer[];
}) {
  const options = roster.map((p) => ({
    value: p.id.toString(),
    label: p.name + " " + (p.nickname ? `(${p.nickname})` : ""),
  }));
  return (
    <MultipleSelector
      defaultOptions={options}
      value={options.filter((o) => (field.value ?? []).includes(parseInt(o.value, 10)))}
      placeholder="Select players"
      onChange={(values: { value: string; label: string }[]) =>
        field.onChange(values.map((o) => parseInt(o.value, 10)))
      }
    />
  );
}

export default function GameFormPopup({ fixtureId, onGameAdded, gameId }: GameFormProps) {
  const [homeRoster, setHomeRoster] = useState<TeamPlayer[]>([]);
  const [awayRoster, setAwayRoster] = useState<TeamPlayer[]>([]);
  const [homeTeamName, setHomeTeamName] = useState("Home");
  const [awayTeamName, setAwayTeamName] = useState("Away");
  const [awayIsAppTeam, setAwayIsAppTeam] = useState(true);

  const form = useForm<z.infer<typeof addGameSchema>>({
    resolver: zodResolver(addGameSchema),
    defaultValues: {
      fixtureId: fixtureId ?? 0,
      homeTeamScore: 0,
      awayTeamScore: 0,
      gameType: "",
      homePlayerList: [],
      awayPlayerList: [],
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id") ?? gameId?.toString() ?? null;

  async function loadRosters() {
    const fixtureRes = await getFixture(fixtureId);
    if (fixtureRes.success) {
      const f = fixtureRes.success;
      setHomeTeamName(f.homeTeam ?? "Home");
      setAwayTeamName(f.awayTeam ?? "Away");
      setHomeRoster(f.homeTeamId ? await getTeamPlayers(f.homeTeamId) : await allPlayersAsRoster());
      if (f.awayTeamId) {
        setAwayRoster(await getTeamPlayers(f.awayTeamId));
        setAwayIsAppTeam(true);
      } else {
        setAwayRoster([]);
        setAwayIsAppTeam(false);
      }
    } else {
      setHomeRoster(await allPlayersAsRoster());
    }
  }

  async function allPlayersAsRoster(): Promise<TeamPlayer[]> {
    const result = await getPlayers();
    if (Array.isArray(result)) {
      return result.map((p) => ({ id: p.id, name: p.name, nickname: p.nickname }));
    }
    return [];
  }

  const checkGame = async (gameId: number) => {
    if (editMode) {
      const data = await getGame(gameId);
      if (data?.error) {
        toast.error(data.error);
        router.push("/fixtures");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);
        form.setValue("fixtureId", fixtureId);
        form.setValue("id", id);
        form.setValue("gameType", data.success.gameType);
        form.setValue("homeTeamScore", data.success.homeTeamScore);
        form.setValue("awayTeamScore", data.success.awayTeamScore);
        form.setValue("homePlayerList", data.success.homePlayers.map((p) => p.id));
        form.setValue("awayPlayerList", data.success.awayPlayers.map((p) => p.id));
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [maxLegs, setMaxLegs] = useState(3);
  const maxLegsWon = Math.ceil(maxLegs / 2);

  const homeScore = form.watch("homeTeamScore") ?? 0;
  const awayScore = form.watch("awayTeamScore") ?? 0;
  const homeMax = Math.min(maxLegsWon, maxLegs - awayScore);
  const awayMax = Math.min(maxLegsWon, maxLegs - homeScore);

  useEffect(() => {
    loadRosters();

    getAppSettings().then((res) => {
      if (res.success?.maxLegsPerGame) setMaxLegs(res.success.maxLegsPerGame);
    });

    if (editMode) {
      setLoading(true);
      checkGame(parseInt(editMode));
      setLoading(false);
    }
  }, []);

  const { execute, status } = useAction(createGame, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push(`/fixtures/${fixtureId}`);
        window.location.reload();
        onGameAdded?.();
        setIsOpen(false);
        return;
      }
      if (data.data?.success) {
        router.push("/fixtures/" + fixtureId);
        toast.success(data.data.success);
        window.location.reload();
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing game`);
      }
      if (!editMode) {
        toast.info("Creating game...");
      }
    },
  });

  async function onSubmit(values: zGameSchema) {
    values.fixtureId = fixtureId;
    execute(values);
  }

  // Refetch rosters whenever the dialog opens so players added since the page
  // first loaded (e.g. a new opponent-team member) show up without a hard reload.
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open && !editMode) loadRosters();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline">
          {editMode ? "Edit" : "Add"} Game <Plus />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editMode ? "Edit" : "Create"} Game</DialogTitle>
          <DialogDescription>
            {editMode ? "Edit" : "Create"} a match game.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center">
          {loading && (
            <div className="flex items-center justify-center h-screen bg-gray-100">
              <div className="loader"></div>
            </div>
          )}

          {!loading && (
            <Card className=" w-[90%] mx-auto overflow-y-auto">
              <CardHeader>
                <div className="text-red-500">
                  {Object.entries(form.formState.errors).map(([key, error]) => (
                    <div key={key} className="text-red-500">
                      Field {key}
                      {error.message}
                    </div>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="overflow-y-auto max-h-[70vh]">
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit, (errors) =>
                      console.log("Form errors:", errors)
                    )}
                    className="space-y-4 "
                  >
                    <FormField
                      control={form.control}
                      name="homePlayerList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{homeTeamName} players</FormLabel>
                          <RosterField field={field} roster={homeRoster} />
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {awayIsAppTeam ? (
                      <FormField
                        control={form.control}
                        name="awayPlayerList"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{awayTeamName} players</FormLabel>
                            <RosterField field={field} roster={awayRoster} />
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <p className="text-xs text-muted-foreground">
                        <Info className="inline-block mr-1.5" size={13} />
                        {awayTeamName} isn&apos;t an app team — track their players in the dart tracker.
                      </p>
                    )}
                    <div className="grid w-full items-center gap-4"></div>

                    <FormField
                      control={form.control}
                      name="gameType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Game Type</FormLabel>
                          <FormDescription>
                            <Info className="inline-block mr-2" size={14} />
                            Set Game Type.
                          </FormDescription>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select season" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Team Game">
                                  Team Game
                                </SelectItem>
                                <SelectItem value="Doubles">Doubles</SelectItem>
                                <SelectItem value="Singles">Singles</SelectItem>
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="homeTeamScore"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Home Team Score (legs)</FormLabel>
                          <FormDescription>
                            <Info className="inline-block mr-2" size={14} />
                            Number of legs won by home team.
                          </FormDescription>
                          <FormControl>
                            <ScoreStepper
                              value={field.value ?? 0}
                              onChange={(v) => field.onChange(v)}
                              max={homeMax}
                              label="legs"
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
                          <FormLabel>Away Team Score (legs)</FormLabel>
                          <FormDescription>
                            <Info className="inline-block mr-2" size={14} />
                            Number of legs won by away team.
                          </FormDescription>
                          <FormControl>
                            <ScoreStepper
                              value={field.value ?? 0}
                              onChange={(v) => field.onChange(v)}
                              max={awayMax}
                              label="legs"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid w-full items-center gap-4"></div>
                    <Button disabled={status == "executing"} type="submit">
                      Save
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
