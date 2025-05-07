import FineTypeForm from "@/components/fines/add-fine-types";
import { Suspense } from "react";


export default function AddFineType() {
    return (
        <div>
            <Suspense>
                <FineTypeForm />
            </Suspense>
        </div>
    );
}