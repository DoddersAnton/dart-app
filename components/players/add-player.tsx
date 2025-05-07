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
import { getPlayer } from "@/server/actions/get-player";
import { zPlayerSchema, playerSchema } from "@/types/add-player-schema";
import { createPlayer } from "@/server/actions/create-player";

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
            form.setValue("team", data.success.team ?? "");
          }
        }
      };

    const [loading, setLoading] = useState(false);

    useEffect(() => {

      if (editMode) {
        checkFine(parseInt(editMode));
      }

      setLoading(false)
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

      <div className="flex items-center justify-center h-screen bg-gray-100">

      {loading && (
        <div className="flex items-center justify-center h-screen bg-gray-100">
          <div className="loader"></div>
        </div>
      )}

      {!loading && (


        <Card className="w-[50%] mx-auto">
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
                 <FormField
                  control={form.control}
                  name="nickname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Team</FormLabel>
                      <FormControl>
                       <Input {...field} placeholder="add a team name" />
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
