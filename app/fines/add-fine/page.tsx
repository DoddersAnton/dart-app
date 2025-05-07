import FineForm from "@/components/fines/add-fine";
import { Suspense } from "react";


export default function AddFine() {
    return (
        <div>
             <Suspense>
            <FineForm />
            </Suspense>
        </div>
    );
}