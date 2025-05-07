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
    FormDescription
  } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPlayerFineSchema, zPlayerFineSchema } from "@/types/add-fine-schema";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { createPlayerFine } from "@/server/actions/create-player-fine";
import { toast } from "sonner";
import { getFines } from "@/server/actions/get-fines";
import { useEffect, useState } from "react";
import { getPlayers } from "@/server/actions/get-players";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { getPlayerFine } from "@/server/actions/get-player-fine";

export default function FineForm() {

    const form = useForm<zPlayerFineSchema>({
        resolver: zodResolver(createPlayerFineSchema),
        defaultValues: {
          notes: "",
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

    const [playersList, setPlayersList] = useState<{ id: number, name: string, nickname: string | null, team: string | null, createdAt: Date | null }[]>([]);
    const [finesList, setFinesList] = useState<{ id: number; title:string, description: string,  amount: number, createdAt: Date }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);
    const [selectedFine, setSelectedFine] = useState<number | null>(null);

    useEffect(() => {

      if (editMode) {
        checkPlayerFine(parseInt(editMode));
      }

      async function fetchData() {
        try {
          const playersData = await getPlayers();
          const finesData = await getFines();
          if (Array.isArray(playersData)) {
            setPlayersList(playersData.map(player => ({
              id: player.id,
              name: player.name,
              nickname: player.nickname || null,
              team: player.team || null,
              createdAt: player.createdAt ? new Date(player.createdAt) : null,
            })));
          } else {
            console.error("Error fetching players:", playersData.error);
          }
          if (Array.isArray(finesData)) {
            setFinesList(
              finesData.map((fine) => ({
                id: fine.id,
                title: fine.title, // Map 'name' to 'title'
                description: fine.description || "", // Handle null description
                amount: fine.amount,
                createdAt: fine.createdAt ? new Date(fine.createdAt) : new Date(), // Convert string to Date
              }))
            );

            setLoading(false);

          } else {
            console.error("Error fetching fines:", finesData.error);
          }
        } catch (error) {
          console.error("Error fetching data:", error);
        }
      }
      fetchData();
    }, []);

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
        console.log("form", values);
        execute(values);
      }

    

    return (

      <div className="flex items-center justify-center h-screen bg-gray-100">

      {loading && (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (


        <Card className="w-[50%] mx-auto">
          <CardHeader>
            <CardTitle>{editMode ? "Edit" : "Create"} Player Fine</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} player fine for breaching the rules
              {selectedPlayer && selectedFine && (
                   <div className="mt-2 flex justify-start flex-col pt-2 border-input focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
                   {selectedPlayer && (
                     <div>Fine for: {playersList.find(player => player.id === selectedPlayer)?.name}</div>
                   )}
                   {selectedFine && (
                     <>
                     <div>reason: {finesList.find(fine => fine.id === selectedFine)?.title}</div>
                     <div className=" flex flex-row items-center gap-2 align-top">
                         
                     <div>£{finesList.find(fine => fine.id === selectedFine)?.amount.toPrecision(3)}</div>
     
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
                      <Select onValueChange={(value) => {
                        field.onChange(Number(value));
                        setSelectedPlayer(Number(value));
                      }}>
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a player to fine" defaultValue={selectedPlayer ?? 0} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {playersList.map((player) => (
                          <SelectItem key={player.id} value={player.id.toString()}>
                            {player.name} {player.nickname ? `(${player.nickname})` : ""}
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
                    <Select onValueChange={(value) => {
                        field.onChange(Number(value));
                        setSelectedFine(Number(value));
                      }}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a fine" defaultValue={selectedFine?.toString() ?? ""} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {finesList.map((fine) => (
                        <SelectItem 
                          key={fine.id} 
                          value={fine.id.toString()}
                        >
                          {fine.title} {fine.description ? `(${fine.description})` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedFine && (
                    <FormDescription>
                      This fine will cost player £{finesList.find(fine => fine.id === selectedFine)?.amount.toPrecision(3)}{" "}
                    </FormDescription>
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
                      date > new Date() || date < new Date("1900-01-01")
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
    
               
                <CardFooter className="flex justify-between">
                  <Button variant="outline">Cancel</Button>
                  <Button
                    disabled={
                      status == "executing" 
                    }
                    type="submit"
                  >
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
