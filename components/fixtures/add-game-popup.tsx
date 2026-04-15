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

export default function GameFormPopup({ fixtureId, onGameAdded, gameId }: GameFormProps) {
  const [playersListData, setPlayersListData] = useState<
    {
      id: number;
      name: string;
      nickname: string | null;
      team: string | null;
      createdAt: string | null;
    }[]
  >([]);

  async function fetchPlayers() {
    const result = await getPlayers();
    if (Array.isArray(result)) {
      setPlayersListData(result);
    } else if ("error" in result) {
      toast.error(result.error);
    }
  }

  const form = useForm<z.infer<typeof addGameSchema>>({
    resolver: zodResolver(addGameSchema),
    defaultValues: {
      fixtureId: fixtureId ?? 0,
      homeTeamScore: 0,
      awayTeamScore: 0,
      gameType: "",
      playerList: [] as number[],
      // id is optional and can be omitted
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id") ?? gameId?.toString() ?? null;

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
        const playerIds = data.success.players.map((player) => player.id);
        if (playerIds.length > 0) {
          form.setValue("playerList", playerIds as [number, ...number[]]);
        } else {
          form.resetField("playerList");
        }
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPlayers, setSelectedPlayers] = useState<string[] | undefined>(undefined);
  const [maxLegs, setMaxLegs] = useState(3);
  const maxLegsWon = Math.ceil(maxLegs / 2);

  const homeScore = form.watch("homeTeamScore") ?? 0;
  const awayScore = form.watch("awayTeamScore") ?? 0;
  const homeMax = Math.min(maxLegsWon, maxLegs - awayScore);
  const awayMax = Math.min(maxLegsWon, maxLegs - homeScore);

  useEffect(() => {
    fetchPlayers();

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
    console.log("form", values);
    values.fixtureId = fixtureId;
    execute(values);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
                      name="playerList"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Player Names</FormLabel>
                          <MultipleSelector
                            defaultOptions={playersListData.map((player) => ({
                              value: player.id.toString(),
                              label:
                                player.name +
                                " " +
                                (player.nickname ? `(${player.nickname})` : ""),
                            }))}
                            value={
                              selectedPlayers
                                ? playersListData
                                    .filter((player) =>
                                      selectedPlayers.includes(
                                        player.id.toString()
                                      )
                                    )
                                    .map((player) => ({
                                      value: player.id.toString(),
                                      label:
                                        player.name +
                                        " " +
                                        (player.nickname
                                          ? `(${player.nickname})`
                                          : ""),
                                    }))
                                : undefined
                            }
                            placeholder="Select players"
                            // You may need to use a supported callback like 'onChange' if available in MultipleSelectorProps
                            onChange={(
                              values: { value: string; label: string }[]
                            ) => {
                              const playerIds = values.map((option) =>
                                parseInt(option.value, 10)
                              );
                              field.onChange(playerIds);
                              setSelectedPlayers(
                                values.map((option) => option.value)
                              );
                            }}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
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
