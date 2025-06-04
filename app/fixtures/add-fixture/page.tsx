import FixtureForm from "@/components/fixtures/add-fixture";
import { Suspense } from "react";

export default function AddFixture() {
  return (
    <div className="container mx-auto py-12 mt-22">
      <Suspense>
        <FixtureForm />
      </Suspense>
    </div>
  );
}
