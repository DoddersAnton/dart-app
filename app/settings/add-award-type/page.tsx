import AwardTypeForm from "@/components/awards/add-award-type";
import { Suspense } from "react";

export default function AddAwardTypePage() {
  return (
    <Suspense>
      <AwardTypeForm />
    </Suspense>
  );
}
