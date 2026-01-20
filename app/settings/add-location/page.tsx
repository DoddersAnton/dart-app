import LocationsForm from "@/components/locations/locations-form";
import { Suspense } from "react";

export default function AddLocationPage() {
  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Add Location</h1>
      <p>Add a new Location</p>
      <div className="mt-8 px-2 lg:w-[80%]">
        <Suspense>
          <LocationsForm />
        </Suspense>
      </div>
    </div>
  );
}
