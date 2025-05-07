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
import { createFineSchema, zFineSchema } from "@/types/add-fine-type-schema";
import { getFine } from "@/server/actions/get-fine";
import { createFine } from "@/server/actions/create-fine";
import { Input } from "../ui/input";
import { Suspense } from "react";

export default function FineTypeForm() {
  const form = useForm<zFineSchema>({
    resolver: zodResolver(createFineSchema),
    defaultValues: {
      title: "",
    },
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkFine = async (id: number) => {
    if (editMode) {
      const data = await getFine(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/fines/fine-types");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);
        form.setValue("id", data.success.id);
        form.setValue("title", data.success.title ?? "");
        form.setValue("id", id);
        form.setValue("amount", data.success.amount ?? 0);
      }
    }
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      checkFine(parseInt(editMode));
    }

    setLoading(false);
  }, []);

  const { execute, status } = useAction(createFine, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/fines/fine-types");
        return;
      }
      if (data.data?.success) {
        router.push("/fines/fine-types");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing fine for ${form.getValues("title")}...`);
      }
      if (!editMode) {
        toast.info(`Creating fine for ${form.getValues("title")}...`);
      }
    },
  });

  async function onSubmit(values: zFineSchema) {
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
              <CardTitle>{editMode ? "Edit" : "Create"} Fine</CardTitle>
              <CardDescription>
                {editMode ? "Edit" : "Create"} fine type.
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
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fine notes</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="add a title" />
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
                        <FormLabel>Fine Description</FormLabel>
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
