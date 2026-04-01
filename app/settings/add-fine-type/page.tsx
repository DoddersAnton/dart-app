import FineTypeForm from "@/components/fines/add-fine-types";
import { Suspense } from "react";

export default function AddFineTypePage() {
  return (
    <div>
      <Suspense>
        <FineTypeForm />
      </Suspense>
    </div>
  );
}
