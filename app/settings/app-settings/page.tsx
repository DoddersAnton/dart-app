"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { getAppSettings } from "@/server/actions/get-app-settings";
import { updateAppSettings } from "@/server/actions/update-app-settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const schema = z.object({
  id: z.number(),
  maxTeamGamesPerMatch: z.coerce.number().int().min(1).max(10),
  maxDoublesGamesPerMatch: z.coerce.number().int().min(1).max(10),
  maxSinglesGamesPerMatch: z.coerce.number().int().min(1).max(10),
  maxLegsPerGame: z.coerce.number().int().min(1).max(10),
});

type FormValues = z.infer<typeof schema>;

export default function AppSettingsPage() {
  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 0,
      maxTeamGamesPerMatch: 1,
      maxDoublesGamesPerMatch: 2,
      maxSinglesGamesPerMatch: 4,
      maxLegsPerGame: 3,
    },
  });

  useEffect(() => {
    getAppSettings().then((res) => {
      if (res.success) {
        form.reset({
          id: res.success.id,
          maxTeamGamesPerMatch: res.success.maxTeamGamesPerMatch,
          maxDoublesGamesPerMatch: res.success.maxDoublesGamesPerMatch,
          maxSinglesGamesPerMatch: res.success.maxSinglesGamesPerMatch,
          maxLegsPerGame: res.success.maxLegsPerGame,
        });
      }
    });
  }, []);

  const { execute, status } = useAction(updateAppSettings, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      if (data.data?.success) toast.success(data.data.success);
    },
  });

  const fields: { name: keyof Omit<FormValues, "id">; label: string; description: string }[] = [
    { name: "maxTeamGamesPerMatch", label: "Team games per match", description: "Max number of team games per fixture" },
    { name: "maxDoublesGamesPerMatch", label: "Doubles games per match", description: "Max number of doubles games per fixture" },
    { name: "maxSinglesGamesPerMatch", label: "Singles games per match", description: "Max number of singles games per fixture" },
    { name: "maxLegsPerGame", label: "Legs per game", description: "Max number of legs per game" },
  ];

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">App Settings</h1>
      <p className="text-muted-foreground">Configure match and game limits.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        <Card>
          <CardHeader>
            <CardTitle>Match Configuration</CardTitle>
            <CardDescription>These settings control the structure of matches and games.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit((v) => execute(v))} className="space-y-4">
                {fields.map(({ name, label, description }) => (
                  <FormField
                    key={name}
                    control={form.control}
                    name={name}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{label}</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} max={10} {...field} />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">{description}</p>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <Button type="submit" disabled={status === "executing"}>
                  {status === "executing" ? "Saving..." : "Save Settings"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
