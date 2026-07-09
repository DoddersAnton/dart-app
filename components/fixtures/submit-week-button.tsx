"use client";

import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, Send } from "lucide-react";
import { submitWeekToLeague } from "@/server/actions/submit-week-to-league";
import { Button } from "@/components/ui/button";

export function SubmitWeekButton({
  seasonId,
  divisionId,
  weekNo,
  allComplete,
  alreadySubmitted,
}: {
  seasonId: number;
  divisionId: number | null;
  weekNo: number;
  allComplete: boolean;
  alreadySubmitted: boolean;
}) {
  const router = useRouter();
  const { execute, status } = useAction(submitWeekToLeague, {
    onSuccess: (data) => {
      if (data.data?.error) toast.error(data.data.error);
      else if (data.data?.success) {
        toast.success(data.data.success);
        router.refresh();
      }
    },
    onError: () => toast.error("Failed to submit week to the league."),
  });
  const busy = status === "executing";

  if (!allComplete && !alreadySubmitted) {
    return <span className="text-[11px] text-muted-foreground font-normal">Complete all games to submit</span>;
  }

  return (
    <Button
      size="sm"
      variant={alreadySubmitted ? "outline" : "default"}
      disabled={busy}
      onClick={() => execute({ seasonId, divisionId, weekNo })}
      className="gap-1.5 h-7 text-xs"
    >
      {alreadySubmitted ? (
        <><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> {busy ? "Updating…" : "Submitted — re-sync"}</>
      ) : (
        <><Send className="h-3.5 w-3.5" /> {busy ? "Submitting…" : "Submit to league"}</>
      )}
    </Button>
  );
}
