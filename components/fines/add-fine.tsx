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
import {
  createPlayerFineSchema,
  zPlayerFineSchema,
} from "@/types/add-fine-schema";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createPlayerFine } from "@/server/actions/create-player-fine";
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
import { Textarea } from "../ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { CalendarIcon, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getPlayerFine } from "@/server/actions/get-player-fine";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Input } from "../ui/input";

interface FormProps {
  playersListData: {
    id: number;
    name: string;
    nickname: string | null;
    team: string | null;
    createdAt: Date;
  }[];
  finesListData: {
    createdAt: Date;
    id: number;
    title: string;
    description: string | null;
    amount: number;
  }[];
}

  export default function FineForm({
  playersListData,
  finesListData,
}: FormProps) {
  const form = useForm<zPlayerFineSchema>({
    resolver: zodResolver(createPlayerFineSchema),
    defaultValues: {
      notes: "",
      quantity: 1,
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkPlayerFine = async (id: number) => {
    if (editMode) {
      const data = await getPlayerFine(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/fines");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);
        form.setValue("playerId", data.success.playerId);

        setSelectedPlayer(data.success.playerId);
        setSelectedFine(data.success.fineId);

        form.setValue("fineId", data.success.fineId ?? "");
        form.setValue("id", id);
        form.setValue("notes", data.success.notes ?? "");
        form.setValue("matchDate", new Date(data.success.matchDate ?? ""));
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
  const [selectedFine, setSelectedFine] = useState<number | null>(null);

  useEffect(() => {
    if (!editMode) return;

    (async () => {
      setLoading(true);
      await checkPlayerFine(parseInt(editMode));
      setLoading(false);
    })();
  }, [editMode]);

  const { execute, status } = useAction(createPlayerFine, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/fines");
        return;
      }
      if (data.data?.success) {
        router.push("/fines");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing fine for ${selectedPlayer}`);
      }
      if (!editMode) {
        toast.info("Creating fine...");
      }
    },
  });

  async function onSubmit(values: zPlayerFineSchema) {
    // Coerce potentially-string inputs to numbers and guard against NaN
    const playerId = Number(values.playerId);
    const fineId = Number(values.fineId);
    const id =
      values.id === undefined || values.id === null ? undefined : Number(values.id);

    let quantity = Number(values.quantity ?? 1);

    if (Number.isNaN(playerId) || Number.isNaN(fineId)) {
      toast.error("Please select a valid player and fine.");
      return;
    }

    if (id !== undefined && Number.isNaN(id)) {
      toast.error("Invalid fine id.");
      return;
    }

    if (!Number.isFinite(quantity) || Number.isNaN(quantity) || quantity < 1) {
      quantity = 1;
    } else {
      quantity = Math.trunc(quantity);
    }

    execute({
      ...values,
      playerId,
      fineId,
      id,
      quantity,
    });
  }

  return (
    <div className="flex items-center justify-center">
      {loading && (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (
        <Card className="mx-auto w-full">
          <CardHeader>
            <CardTitle>{editMode ? "Edit" : "Create"} Player Fine</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} player fine for breaching the rules
              {selectedPlayer && selectedFine && (
                <div className="mt-2 flex justify-start flex-col pt-2 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                  {selectedPlayer && (
                    <div>
                      Fine for:{" "}
                      {
                        playersListData.find(
                          (player) => player.id === selectedPlayer
                        )?.name
                      }
                    </div>
                  )}
                  {selectedFine && (
                    <>
                      <div>
                        reason:{" "}
                        {
                          finesListData.find((fine) => fine.id === selectedFine)
                            ?.title
                        }
                      </div>
                      <div className=" flex flex-row items-center gap-2 align-top">
                        <div>
                          £
                          {finesListData
                            .find((fine) => fine.id === selectedFine)
                            ?.amount.toPrecision(3)}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
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
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-4"
                >
                <div className="grid w-full items-center gap-4"></div>
                <FormField
                  control={form.control}
                  name="playerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Player Name</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const next = Number(value);
                          const safeNext = Number.isNaN(next) ? undefined : next;
                          field.onChange(safeNext);
                          setSelectedPlayer(safeNext ?? null);
                        }}
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a player to fine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {playersListData.map((player) => (
                            <SelectItem
                              key={player.id}
                              value={player.id.toString()}
                            >
                              {player.name}{" "}
                              {player.nickname ? `(${player.nickname})` : ""}
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
                  name="fineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const next = Number(value);
                          const safeNext = Number.isNaN(next) ? undefined : next;
                          field.onChange(safeNext);
                          setSelectedFine(safeNext ?? null);
                        }}
                        value={
                          field.value === undefined || field.value === null
                            ? ""
                            : String(field.value)
                        }
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select a fine" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {finesListData.map((fine) => (
                            <SelectItem
                              key={fine.id}
                              value={fine.id.toString()}
                            >
                              {fine.title ?? fine.description}{" "}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedFine && (
                        <div>
                          <Dialog key={selectedFine}>
                            <DialogTrigger asChild>
                              <Button variant="outline">
                                <Info className="mr-2 h-4 w-4" />
                                See Fine Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                              <DialogHeader>
                                <DialogTitle>Fine Details</DialogTitle>
                                <DialogDescription className="whitespace-normal break-words">
                                  <div>
                                    This fine will cost player £
                                    {finesListData
                                      .find((fine) => fine.id === selectedFine)
                                      ?.amount.toPrecision(3)}{" "}
                                  </div>
                                  {
                                    finesListData.find(
                                      (fine) => fine.id === selectedFine
                                    )?.description
                                  }
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine notes</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="add some detail" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="matchDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Match Date</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-[240px] pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) =>
                                date > new Date() ||
                                date < new Date("1900-01-01")
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                      control={form.control}
                      name="quantity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormDescription>
                            <Info className="inline-block mr-2" size={14} />
                            You can add mulitple fines at once.
                          </FormDescription>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="add a quantity"
                              type="number"
                              value={field.value ?? 1}
                              onChange={(e) => {
                                const next = e.currentTarget.valueAsNumber;
                                field.onChange(Number.isNaN(next) ? 1 : next);
                              }}
                              min={1}
                              step={1}
                              disabled={!!editMode} 
                            />
                          </FormControl>
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
