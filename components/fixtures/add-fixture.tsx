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
import { CalendarIcon, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createFixtureSchema, zFixtureSchema } from "@/types/add-fixture-schema";
import { createFixture } from "@/server/actions/create-fixture";
import { getFixture } from "@/server/actions/get-fixture";
import { Input } from "../ui/input";



export default function FixtureForm() {
  
  const form = useForm<zFixtureSchema>({
    resolver: zodResolver(createFixtureSchema),
    defaultValues: {
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkFixture= async (id: number) => {
    if (editMode) {
      const data = await getFixture(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/fines");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);

        form.setValue("id", id);
        form.setValue("matchDate", new Date(data.success.matchDate ?? ""));
      }
    }
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      setLoading(true);
      checkFixture(parseInt(editMode));
      setLoading(false);
    }

  }, []);

  const { execute, status } = useAction(createFixture, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/fixtures");
        return;
      }
      if (data.data?.success) {
        router.push("/fixtures");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing match`);
      }
      if (!editMode) {
        toast.info("Creating match...");
      }
    },
  });

  async function onSubmit(values: zFixtureSchema) {
    console.log("form", values);
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
            <CardTitle>{editMode ? "Edit" : "Create"} Match</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} a match to track the details of the game.
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
                    name="season"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Season</FormLabel>
                        <FormDescription>
                          <Info className="inline-block mr-2" size={14} />
                          Set Season.
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select match status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Spring/Summer 25</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                    <FormField
                    control={form.control}
                    name="league"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>League</FormLabel>
                        <FormDescription>
                          <Info className="inline-block mr-2" size={14} />
                          Set League.
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select match status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Division 2</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />



                

                <FormField
                  control={form.control}
                  name="matchLocation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="add a location" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="homeTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Team</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="add a home team" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                 <FormField
                  control={form.control}
                  name="awayTeam"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Away Team</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="add an away Team" />
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
                    name="matchStatus"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Match Status</FormLabel>
                        <FormDescription>
                          <Info className="inline-block mr-2" size={14} />
                          Set the status of the match.
                        </FormDescription>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select match status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="scheduled">Scheduled</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="cancelled">Cancelled</SelectItem>
                            </SelectContent>
                          </Select>
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
