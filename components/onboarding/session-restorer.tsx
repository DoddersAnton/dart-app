"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { restoreActiveTeam } from "@/server/actions/restore-active-team";

export function SessionRestorer() {
  const router = useRouter();

  useEffect(() => {
    restoreActiveTeam().then((result) => {
      if ("teamId" in result) {
        router.replace("/fixtures");
      }
    });
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-sm text-muted-foreground animate-pulse">Restoring your session...</p>
    </div>
  );
}
