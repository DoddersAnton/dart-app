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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { createAwardSchema, zAwardSchema } from "@/types/add-award-schema";
import { getAward } from "@/server/actions/get-award";
import { createAward } from "@/server/actions/create-award";
import { Suspense } from "react";

export default function AwardTypeForm() {
  const form = useForm<zAwardSchema>({
    resolver: zodResolver(createAwardSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      setLoading(true);
      getAward(parseInt(editMode)).then((data) => {
        if (data?.error) {
          toast.error(data.error);
          router.push("/settings/award-types");
          return;
        }
        if (data?.success) {
          form.setValue("id", data.success.id);
          form.setValue("title", data.success.title);
          form.setValue("description", data.success.description ?? "");
        }
        setLoading(false);
      });
    }
  }, []);

  const { execute, status } = useAction(createAward, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        return;
      }
      if (data.data?.success) {
        router.push("/settings/award-types");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      toast.info(editMode ? "Updating award type..." : "Creating award type...");
    },
  });

  function onSubmit(values: zAwardSchema) {
    execute(values);
  }

  return (
    <Suspense>
      <div className="flex items-center justify-center mt-22">
        {!loading && (
          <Card className="lg:w-[50%] mx-auto">
            <CardHeader>
              <CardTitle>{editMode ? "Edit" : "Create"} Award Type</CardTitle>
              <CardDescription>
                {editMode ? "Edit" : "Create"} an award type to assign to players each season.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit, (errors) =>
                    console.log("Form errors:", errors)
                  )}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Award Title</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="e.g. Player of the Season" />
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
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} placeholder="Describe this award" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <CardFooter className="flex justify-between px-0">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => router.push("/settings/award-types")}
                    >
                      Cancel
                    </Button>
                    <Button disabled={status === "executing"} type="submit">
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
