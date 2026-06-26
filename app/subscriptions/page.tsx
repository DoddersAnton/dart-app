import { redirect } from "next/navigation";

// The standalone subscriptions page has been folded into settings.
export default function SubscriptionsPage() {
  redirect("/settings/team-subscriptions");
}
