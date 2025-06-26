
import SubscriptionForm from "@/components/subscriptions/add-subscription";
import { Suspense } from "react";


export default function AddFineType() {
    return (
        <div>
            <Suspense>
                <SubscriptionForm />
            </Suspense>
        </div>
    );
}