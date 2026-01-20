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
import { zLocationSchema } from "@/types/add-location-schema";
import { addLocationSchema } from "@/types/add-location-schema";
import { createLocation } from "@/server/actions/create-location";
import { getLocation } from "@/server/actions/get-location";

export default function LocationsForm() {
  const form = useForm<zLocationSchema>({
    resolver: zodResolver(addLocationSchema),
    mode: "onChange",
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const editMode = searchParams.get("id");

  const checkLocation = async (id: number) => {
    if (editMode) {
      const data = await getLocation(id);
      if (data?.error) {
        toast.error(data.error);
        router.push("/settings/locations");
        return;
      }
      if (data.success) {
        const id = parseInt(editMode);

        form.setValue("id", id);
        form.setValue("name", data.success.name ?? "");
        form.setValue("address", data.success.address ?? "");
        form.setValue("googleMapsLink", data.success.googleMapsLink ?? "");
     
      }
    }
  };

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editMode) {
      checkLocation(parseInt(editMode));
    }

    setLoading(false);
  }, []);

  const { execute, status } = useAction(createLocation, {
    onSuccess: (data) => {
      if (data.data?.error) {
        toast.error(data.data.error);
        router.push("/settings/locations");
        return;
      }
      if (data.data?.success) {
        router.push("/settings/locations");
        toast.success(data.data.success);
      }
    },
    onExecute: () => {
      if (editMode) {
        toast.info(`Editing location ${form.getValues("name")}...`);
      }
      if (!editMode) {
        toast.info(`Creating location ${form.getValues("name")}...`);
      }
    },
  });

  async function onSubmit(values: zLocationSchema) {
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
          <Card className="w-[90%] lg:w-[50%] mx-auto">
            <CardHeader>
              <CardTitle>{editMode ? "Edit" : "Create"} Location</CardTitle>
              <CardDescription>
                {editMode ? "Edit" : "Create"} location for linking to a team and match.
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
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Address</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="add an address" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="googleMapsLink"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Google Maps Link</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} placeholder="add an maps link" />
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
