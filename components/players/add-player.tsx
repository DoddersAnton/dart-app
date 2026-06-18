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
import { Textarea } from "../ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { Input } from "../ui/input";
import { getPlayer } from "@/server/actions/get-player";
import { getTeams } from "@/server/actions/get-teams";
import { getPlayerTeams } from "@/server/actions/get-player-teams";
import { zPlayerSchema, playerSchema } from "@/types/add-player-schema";
import { createPlayer } from "@/server/actions/create-player";
import { MultiSelect } from "../ui/multi-select";

export default function PlayerForm() {

    const form = useForm<zPlayerSchema>({
        resolver: zodResolver(playerSchema),
        defaultValues: {
          name: "",
        },
        mode: "onChange",
      });

      const router = useRouter();
      const searchParams = useSearchParams();
      const editMode = searchParams.get("id");

      const checkFine = async (id: number) => {
        if (editMode) {
          const data = await getPlayer(id);
          if (data?.error) {
            toast.error(data.error);
            router.push("/fines/fine-types");
            return;
          }
          if (data.success) {
            const id = parseInt(editMode);
            form.setValue("id", id);
            form.setValue("name", data.success.name ?? "");
            form.setValue("nickname", data.success.nickname ?? "");
            form.setValue("bio", data.success.bio ?? "");
            form.setValue("dartsUsed", data.success.dartsUsed ?? "");
            form.setValue("dartsWeight", data.success.dartsWeight ?? undefined);
            form.setValue("dateOfBirth", data.success.dateOfBirth
              ? new Date(data.success.dateOfBirth).toISOString().slice(0, 10)
              : "");
          }
        }
      };

    const [loading, setLoading] = useState(false);
    const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([]);
    const [initialTeamIds, setInitialTeamIds] = useState<string[]>([]);
    const [teamsReady, setTeamsReady] = useState(false);

    useEffect(() => {

      if (editMode) {
        checkFine(parseInt(editMode));
      }

      setLoading(false)
    }, []);

    // Load team options (and any existing memberships when editing) for the team picker.
    useEffect(() => {
      async function loadTeams() {
        const res = await getTeams();
        const list = "success" in res && res.success ? res.success : [];
        setTeamOptions(list.map((t) => ({ value: String(t.id), label: t.name })));
        if (editMode) {
          const memberships = await getPlayerTeams(parseInt(editMode));
          setInitialTeamIds(memberships.map((m) => String(m.teamId)));
          form.setValue("teamIds", memberships.map((m) => m.teamId));
        }
        setTeamsReady(true);
      }
      loadTeams();
    }, []);


      const { execute, status } = useAction(createPlayer, {
        onSuccess: (data) => {
          if (data.data?.error) {
            toast.error(data.data.error);
            router.push("/players");
            return;
          }
          if (data.data?.success) {
            router.push("/players");
            toast.success(data.data.success);
            
          }
        },
        onExecute: () => {
          if (editMode) {
            toast.info(`Editing player ${form.getValues("name")}...`);
            
          }
          if (!editMode) {
            toast.info(`Creating player ${form.getValues("name")}...`);
            
          }
        },
      });



      async function onSubmit(values: zPlayerSchema) {
        console.log("form", values);
        execute(values);
      }

    

    return (

      <div className="flex items-center justify-center mt-22">

      {loading && (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (


        <Card className="lg:w-[50%] mx-auto">
          <CardHeader>
            <CardTitle>{editMode ? "Edit" : "Create"} Player</CardTitle>
            <CardDescription>
              {editMode ? "Edit" : "Create"} team player.
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
                       <Input {...field} placeholder="add a name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nickname</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="add a nickname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {teamsReady && (
                  <FormField
                    control={form.control}
                    name="teamIds"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teams</FormLabel>
                        <MultiSelect
                          options={teamOptions}
                          defaultValue={initialTeamIds}
                          onValueChange={(values) => field.onChange(values.map((v) => parseInt(v, 10)))}
                          placeholder="Search and add teams"
                          variant="inverted"
                          animation={0}
                          maxCount={4}
                        />
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="dartsUsed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Darts Used</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Target Adrian Lewis" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dartsWeight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Darts Weight (g)</FormLabel>
                        <FormControl>
                          <Input {...field} type="number" step="0.5" placeholder="e.g. 22" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="A short bio about the player" rows={4} />
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
