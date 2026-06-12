import PlayerForm from "@/components/players/add-player";
import { Suspense } from "react";
import { Lock } from "lucide-react";
import { isTeamAdmin } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function AddPlayer() {
  if (!(await isTeamAdmin())) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground mt-8">
        <Lock className="h-4 w-4" />
        <p className="text-sm">Only captains and secretaries can add players.</p>
      </div>
    );
  }

  return (
    <div>
      <Suspense>
        <PlayerForm />
      </Suspense>
    </div>
  );
}
