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
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { Input } from "../ui/input";
import { Suspense } from "react";
import { subscriptionSchema, zsubscriptionSchema } from "@/types/add-subscription";
import router from "next/router";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Info } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { createSubscription } from "@/server/actions/create-subscription";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";



export default function SubscriptionForm() {
  const form = useForm<zsubscriptionSchema>({
    resolver: zodResolver(subscriptionSchema),
    mode: "onChange",
  });

  
  const [loading, setLoading] = useState(false);

  

  const { execute, status } = useAction(createSubscription, {
    onSuccess: (data) => {
      if (data.data?.error) {
        setLoading(false);
        toast.error(data.data.error);
        router.push("/subscriptions");
        return;
      }
      if (data.data?.success) {
         setLoading(false);
        router.push("/subscriptions");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
     setLoading(true);
        toast.info(`Creating subscription for ${form.getValues("season")}...`);
      
    },
  });

  async function onSubmit(values: zsubscriptionSchema) {
    console.log("form", values);
    execute(values);
  }

  return (
    <Suspense>
      <div className="flex items-center justify-center mt-22">
        {loading && (
          <div className="flex items-center justify-center bg-gray-100">
            <div className="loader"></div>
          </div>
        )}

        {!loading && (
          <Card className="lg:w-[50%] mx-auto">
            <CardHeader>
              <CardTitle>{"Create"} Subscription</CardTitle>
              <CardDescription>
                {"Create"} subscription, each record will be applied to all players.
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
                    name="subscriptionType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="add a type" />
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
                              <SelectValue placeholder="Select season" />
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
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Subscription Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="add a description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine Amount</FormLabel>
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
