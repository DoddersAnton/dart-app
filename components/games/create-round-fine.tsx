import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "../ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { CalendarIcon, Info } from "lucide-react";
import { Textarea } from "../ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Input } from "../ui/input";
import { format } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createRoundFineSchema, zRoundFineSchema } from "@/types/add-fine-schema";
import { toast } from "sonner";
import { useAction } from "next-safe-action/hooks";

import { createPlayerRoundFine } from "@/server/actions/create-round-fine";




type FineRoundProps = {
  setShowRoundFineDialog: (value: boolean) => void;
  showRoundFineDialog?: boolean;
  fineData: { id: number, title: string, description: string | null, amount: number, createdAt: string | null }[]
  playerId?: number | null;
  fineId?: number | null;
  defaultPlayers?: { id: number; name: string; nickname: string | null; team: string | null; createdAt: Date; }[]
  roundNo?: number | null;
  roundLeg?: number | null;
};

export default function CreateRoundFine({
  PopupProps,
}: {
  PopupProps: FineRoundProps;
}) {

    const playersListData = PopupProps.defaultPlayers ?? [];
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(PopupProps.playerId ?? null);
    const [selectedFine, setSelectedFine] = useState<number | null>(PopupProps.fineId ?? null);


      const form = useForm<zRoundFineSchema>({
          resolver: zodResolver(createRoundFineSchema),
          defaultValues: {
            notes: "",
            roundLeg: PopupProps.roundLeg ?? undefined,
            roundNo: PopupProps.roundNo ?? undefined,
            playerId: PopupProps.playerId ?? undefined,
            fineId: PopupProps.fineId ?? undefined,
            quantity:  1,
          },
          mode: "onChange",
        });

        const { execute, status } = useAction(createPlayerRoundFine, {
            onSuccess: (data) => {
              if (data.data?.error) {
                toast.error(data.data.error);
                PopupProps.setShowRoundFineDialog(false);
                return;
              }
              if (data.data?.success) {
                toast.success(data.data.success);
                PopupProps.setShowRoundFineDialog(false);
              }
            },
            onExecute: () => {

                toast.info("Creating fine...");
            },
          });

         async function onSubmit(values: zRoundFineSchema) {
            console.log("form", values);
            execute(values);
          }

  return (
      <Dialog
      open={PopupProps.showRoundFineDialog}
      onOpenChange={PopupProps.setShowRoundFineDialog}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Fine {PopupProps.defaultPlayers?.find(player => player.id === PopupProps.playerId) ? PopupProps.defaultPlayers?.find(player => player.id === PopupProps.playerId)?.name : "this player"}?</DialogTitle>
        </DialogHeader>
       <div className="flex items-center justify-center">
        <Card className="mx-auto w-full">
          <CardHeader>
            <CardTitle>Create Player Fine ({PopupProps.defaultPlayers?.length})</CardTitle>
            <CardDescription>
              Create player fine for breaching the rules
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
                          PopupProps.fineData.find((fine) => fine.id === selectedFine)
                            ?.title
                        }
                      </div>
                      <div className=" flex flex-row items-center gap-2 align-top">
                        <div>
                          £
                          {PopupProps.fineData
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
                onSubmit={form.handleSubmit(onSubmit, (errors) =>
                  console.log("Form errors:", errors)
                )}
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
                          field.onChange(Number(value));
                          setSelectedPlayer(Number(value));
                        }}
                        value={selectedPlayer?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Select a player to fine"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {playersListData?.map((player) => (
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
                          field.onChange(Number(value));
                          setSelectedFine(Number(value));
                        }}
                         value={selectedFine?.toString() ?? ""}
                      >
                        <FormControl>
                          <SelectTrigger className="w-full">
                            <SelectValue
                              placeholder="Select a fine"
                            />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PopupProps.fineData.map((fine) => (
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
                                    {PopupProps.fineData
                                      .find((fine) => fine.id === selectedFine)
                                      ?.amount.toPrecision(3)}{" "}
                                  </div>
                                  {
                                    PopupProps.fineData.find(
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
                              value={field.value}
                              min={1}
                              step={1}
                              //disabled={!!editMode} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => PopupProps.setShowRoundFineDialog(false)}>Cancel</Button>
                  <Button disabled={status == "executing"} type="submit">
                    Save
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </CardContent>
        </Card>
    </div>
        </DialogContent>
            </Dialog>
  );
}

