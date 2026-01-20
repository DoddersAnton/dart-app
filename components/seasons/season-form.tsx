

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
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useAction } from "next-safe-action/hooks";
import { Input } from "../ui/input";
import { Suspense } from "react";
import { addSeasonSchema, zSeasonSchema } from "@/types/add-season-schema";
import { getSeason } from "@/server/actions/get-season";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns/format";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../calendar";
import { createSeason } from "@/server/actions/create-season";

export default function SeasonForm() {
  const form = useForm<zSeasonSchema>({
    resolver: zodResolver(addSeasonSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkSeason = async (id: number) => {
    if (editMode) {
      const data = await getSeason(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/settings/seasons");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);

        form.setValue("id", id);
        form.setValue("name", data.success.name ?? "");
        form.setValue("startDate", data.success.startDate ?? "");
        form.setValue("endDate", data.success.endDate ?? "");
     
      }
    }
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      checkSeason(parseInt(editMode));
    }

    setLoading(false);
  }, []);

  const { execute, status } = useAction(createSeason, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/settings/seasons");
        return;
      }
      if (data.data?.success) {
        router.push("/settings/seasons");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing season for ${form.getValues("name")}...`);
      }
      if (!editMode) {
        toast.info(`Creating season for ${form.getValues("name")}...`);
      }
    },
  });

  async function onSubmit(values: zSeasonSchema) {
    console.log("form", values);
    execute(values);
  }

  return (
    <Suspense>
      <div className="flex items-center justify-center">
        {loading && (
          <div className="flex items-center justify-center bg-gray-100">
            <div className="loader"></div>
          </div>
        )}

        {!loading && (
          <Card className="lg:w-[50%] mx-auto">
            <CardHeader>
              <CardTitle>{editMode ? "Edit" : "Create"} Season</CardTitle>
              <CardDescription>
                {editMode ? "Edit" : "Create"} season for linking to a match.
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
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="add a name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                       <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
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
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
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
    </Suspense>
  );
}
