import SeasonForm from "@/components/seasons/season-form";
import { Suspense } from "react";

export default function SeasonsPage() {
  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Add New Season</h1>
       <p>Manage your seasons settings here.</p>
      <div className="mt-8 px-2">
        <Suspense>
          <SeasonForm />
        </Suspense>
      </div>
    </div>
  );
}
