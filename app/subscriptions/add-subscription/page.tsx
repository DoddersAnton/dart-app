import { redirect } from "next/navigation";

// Subscriptions are now created from the Team Subscriptions settings page.
export default function AddSubscriptionPage() {
  redirect("/settings/team-subscriptions");
}
