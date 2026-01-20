import TeamForm from "@/components/teams/team-form";
import { Suspense } from "react";

export default function TeamsPage() {
  return (
    <div className="container mx-auto">
      <h1 className="text-2xl font-bold">Teams</h1>
        <p>Manage teams and home locations here.</p>
      <div className="mt-8 px-2">
        <Suspense>
          <TeamForm />
        </Suspense>
      </div>
    </div>
  );
}
