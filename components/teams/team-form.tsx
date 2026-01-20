



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
import { Button } from "../ui/button";
import { useAction } from "next-safe-action/hooks";
import { Input } from "../ui/input";
import { Suspense } from "react";
import { addTeamSchema, zTeamSchema } from "@/types/add-team-schema";
import { getTeam } from "@/server/actions/get-team";
import { createTeam } from "@/server/actions/create-team";
import { getLocations } from "@/server/actions/get-locations";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Checkbox } from "../ui/checkbox";



export default function TeamForm() {
  const form = useForm<zTeamSchema>({
    resolver: zodResolver(addTeamSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkTeam = async (id: number) => {
    if (editMode) {
      const data = await getTeam(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/settings/teams");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);

        form.setValue("id", id);
        form.setValue("name", data.success.name ?? "");
        form.setValue("defaultLocationId", data.success.defaultLocationId ?? null);
        
     
      }
    }
  };

  const [loading, setLoading] = useState(false);
  const [locations, setLocations] = useState<{ id: number; name: string; createdAt: Date | null; address: string | null; googleMapsLink: string | null; }[]>([]);

  useEffect(() => {
    if (editMode) {
      checkTeam(parseInt(editMode));
    }


    const locations = async () => {
        try {
            const res = await getLocations();
            if (res?.error) {
                toast.error(res.error);
                return;
            }
            if (res?.success) {
                // ensure you have: c
                setLocations(res.success);

                // if no defaultLocationId is set, pick the first location
                const currentDefault = form.getValues("defaultLocationId");
                if ((currentDefault === null || currentDefault === undefined) && res.success.length) {
                    form.setValue("defaultLocationId", res.success[0].id ?? null);
                }
            }
        } catch (e) {
            console.error(e);
            toast.error("Failed to load locations");
        }
    };
    
    locations();

    setLoading(false);
  }, []);

  const { execute, status } = useAction(createTeam, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/settings/teams");
        return;
      }
      if (data.data?.success) {
        router.push("/settings/teams");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing team for ${form.getValues("name")}...`);
      }
      if (!editMode) {
        toast.info(`Creating teams for ${form.getValues("name")}...`);
      }
    },
  });

  async function onSubmit(values: zTeamSchema) {
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
              <CardTitle>{editMode ? "Edit" : "Create"} Team</CardTitle>
              <CardDescription>
                {editMode ? "Edit" : "Create"} team for linking to a match.
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
                    name="isAppTeam"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Is App Team</FormLabel>
                        <FormDescription>
                          This should only be checked for one team, the main app team.
                        </FormDescription>
                        <FormControl>
                          <Checkbox
                            checked={!!field.value}
                            onCheckedChange={(checked) => field.onChange(!!checked)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                   <FormField
                  control={form.control}
                  name="defaultLocationId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Home Location Name</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          const next = Number(value);
                          const safeNext = Number.isNaN(next) ? undefined : next;
                          field.onChange(safeNext);
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
                          {locations.map((location) => (
                            <SelectItem
                              key={location.id}
                              value={location.id.toString()}
                            >
                              {location.name}{" "}
                    
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
