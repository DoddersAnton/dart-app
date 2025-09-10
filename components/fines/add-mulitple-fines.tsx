"use client";

import { createMulitplePlayerFines } from "@/server/actions/create-multiple-player-fines";
import {
  createMulitplePlayerFineSchema,
  zMulitplePlayerFineSchema,
} from "@/types/add-mulitple-fines.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { CalendarIcon, Info,  UserIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Textarea } from "../ui/textarea";
import { format } from "date-fns";
import { MultiSelect } from "../ui/multi-select";
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

export default function MultipleFineForm({playersListData, finesListData}: FormProps) {
  const form = useForm<zMulitplePlayerFineSchema>({
    resolver: zodResolver(createMulitplePlayerFineSchema),
    defaultValues: {
      notes: "",
    },
    mode: "onChange",
  });
  const [selectedFine, setSelectedFine] = useState<number | null>(null);
  const [selectedPlayers, setSelectedPlayers] = useState<
    string[] | undefined
  >(undefined);
  const router = useRouter();

  const { execute, status } = useAction(createMulitplePlayerFines, {
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
      toast.info("Creating fines...");
    },
  });

  async function onSubmit(values: zMulitplePlayerFineSchema) {
    console.log("form", values);
    execute(values);
  }

  return (
    <div className="flex items-center justify-center">
 
     
        <Card className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Create Mulitple Player Fines</CardTitle>
            <CardDescription>
              Group player fine for breaching the rules
                {selectedPlayers && selectedFine && (
                <div className="mt-2 flex flex-col gap-4">
                  {selectedPlayers.map((playerId) => {
                  const player = playersListData.find(
                    (p) => p.id.toString() === playerId
                  );
                  const fine = finesListData.find(
                    (fine) => fine.id === selectedFine
                  );

                  return (
                    <div
                    key={playerId}
                    className="pt-2 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    >
                    <div>
                      Player: {player?.name}{" "}
                      {player?.nickname ? `(${player.nickname})` : ""}
                    </div>
                    {fine && (
                      <>
                      <div>Reason: {fine.title}</div>
                      <div className="flex flex-row items-center gap-2 align-top">
                        <div>
                        £{fine.amount.toPrecision(3)}
                        </div>
                      </div>
                      </>
                    )}
                    </div>
                  );
                  })}
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
                onSubmit={form.handleSubmit(onSubmit, (errors) =>
                  console.log("Form errors:", errors)
                )}
                className="space-y-4"
              >
                <div className="grid w-full items-center gap-4"></div>
                  <FormField
                    control={form.control}
                    name="playerIds"
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
                            icon: UserIcon,
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

                <FormField
                  control={form.control}
                  name="fineId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fine</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          setSelectedFine(Number(value));
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Select a fine"
                              defaultValue={selectedFine?.toString() ?? ""}
                            />
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
                              defaultValue={1}
                              min={1}
                              step={1}
                             
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
    </div>
  );
}
