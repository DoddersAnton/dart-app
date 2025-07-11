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
import { Info } from "lucide-react";
import { addGameSchema, zGameSchema } from "@/types/add-game-schema";
import { Input } from "../ui/input";
import { getGame } from "@/server/actions/get-game";
import { createGame } from "@/server/actions/create-game";
import { MultiSelect } from "../ui/multi-select";
import { getPlayers } from "@/server/actions/get-players";
import { z } from "zod";



type GameFormProps = {
  fixtureId: number;
};

export default function GameForm({ fixtureId }: GameFormProps) {

    const [playersListData, setPlayersListData] = useState<
      { id: number; name: string; nickname: string | null; team: string | null; createdAt: string | null }[]
    >([]);

    useEffect(() => {
      
    }, []);
  
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
  const editMode = searchParams.get("id");

  const checkGame= async (gameId: number) => {
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
        form.setValue("gameType", data.success[0].gameType);
        form.setValue("homeTeamScore", data.success[0].homeTeamScore);
        form.setValue("awayTeamScore", data.success[0].awayTeamScore);
        const playerIds = data.success[0].players.map(player => player.id);
        if (playerIds.length > 0) {
          form.setValue("playerList", playerIds as [number, ...number[]]);
        } else {
          form.resetField("playerList");
        }
       
      }
    }
  };

  const [loading, setLoading] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState<
    string[] | undefined
  >(undefined);

  useEffect(() => {
    
    async function fetchPlayers() {
        const result = await getPlayers();
        if (Array.isArray(result)) {
          setPlayersListData(result);
        } else if ("error" in result) {
          toast.error(result.error);
        }
      }
      fetchPlayers();

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
        return;
      }
      if (data.data?.success) {
        router.push("/fixtures/" + fixtureId);
        toast.success(data.data.success);
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
    <div className="flex items-center justify-center">
      {loading && (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (
        <Card className="mx-auto w-full lg:w-[60%]">
          <CardHeader>
            <CardTitle>{editMode ? "Edit" : "Create"} Game</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} a match game.
            </CardDescription>
            <div className="text-red-500">
              {Object.entries(form.formState.errors).map(([key, error]) => (
                <div key={key} className="text-red-500">
                  Field {key}
                  {error.message}
                </div>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit, (errors) =>
                  console.log("Form errors:", errors)
                )}
                className="space-y-4"
              >
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
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select season" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Team Game">Team Game</SelectItem>
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
                        <FormLabel>Home Team Score</FormLabel>
                        <FormDescription>
                          <Info className="inline-block mr-2" size={14} />
                          You can override or set to 0 for future games.
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="add a amount"
                            type="number"
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
                        <FormLabel>Away Team Score</FormLabel>
                        <FormDescription>
                          <Info className="inline-block mr-2" size={14} />
                          You can override or set to 0 for future games.
                        </FormDescription>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="add a amount"
                            type="number"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <FormField
                    control={form.control}
                    name="playerList"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Player Names</FormLabel>
                        <MultiSelect
                          options={playersListData.map((player) => ({
                            value: player.id.toString(),
                            label:
                              player.name +
                              " " +
                              (player.nickname ? `(${player.nickname})` : ""),
                            
                          }))}
                          onValueChange={(values) => {
                            const playerIds = values.map((value) =>
                              parseInt(value, 10)
                            );
                            field.onChange(playerIds);
                            setSelectedPlayers(values);
                          }}
                          value={selectedPlayers}
                          placeholder="Select players"
                          variant="inverted"
                          animation={2}
                          maxCount={3}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />


                  

                 

                  

                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button disabled={status == "executing"} type="submit">
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
