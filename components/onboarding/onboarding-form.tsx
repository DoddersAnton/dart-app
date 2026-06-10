"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Target } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { completeOnboarding } from "@/server/actions/complete-onboarding";

type Player = { id: number; name: string; nickname: string | null; imgUrl: string | null };
type Team = { id: number; name: string };

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function OnboardingForm({
  unlinkedPlayers,
  allTeams,
  clerkUserId,
  existingPlayerId,
}: {
  unlinkedPlayers: Player[];
  allTeams: Team[];
  clerkUserId: string;
  existingPlayerId: number | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"player" | "teams">(existingPlayerId ? "teams" : "player");
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(existingPlayerId);
  const [selectedTeamIds, setSelectedTeamIds] = useState<number[]>([]);
  const [defaultTeamId, setDefaultTeamId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  const toggleTeam = (id: number) => {
    setSelectedTeamIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
    if (defaultTeamId === null) setDefaultTeamId(id);
  };

  const handleSave = async () => {
    if (!selectedPlayerId) { toast.error("Please select a player profile"); return; }
    if (!selectedTeamIds.length) { toast.error("Please select at least one team"); return; }
    const effectiveDefault = defaultTeamId ?? selectedTeamIds[0];

    setSaving(true);
    try {
      const result = await completeOnboarding(selectedPlayerId, selectedTeamIds, effectiveDefault);
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Profile set up successfully!");
      router.push("/fixtures");
      router.refresh();
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-7 w-7 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Welcome to Darts App</h1>
          <p className="text-sm text-muted-foreground">Set up your player profile to get started</p>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex items-center gap-2 text-sm">
        <span className={`font-medium ${step === "player" ? "text-primary" : "text-muted-foreground"}`}>
          1. Select player
        </span>
        <span className="text-muted-foreground">→</span>
        <span className={`font-medium ${step === "teams" ? "text-primary" : "text-muted-foreground"}`}>
          2. Select team(s)
        </span>
      </div>

      {/* Step 1: Player selection */}
      {step === "player" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Which player profile is yours?</CardTitle>
            <CardDescription>Select your name from the list of unlinked players</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {unlinkedPlayers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No unlinked players found. Ask an admin to add your player profile first.</p>
            ) : (
              <div className="max-h-72 overflow-y-auto space-y-1 pr-1">
                {unlinkedPlayers.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPlayerId(p.id)}
                    className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                      selectedPlayerId === p.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                  >
                    {p.imgUrl ? (
                      <Image src={p.imgUrl} alt={p.name} width={32} height={32} unoptimized className="h-8 w-8 rounded-full object-cover border shrink-0" />
                    ) : (
                      <div className="h-8 w-8 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                        {getInitials(p.name)}
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium">{p.name}</p>
                      {p.nickname && <p className="text-xs text-muted-foreground">{p.nickname}</p>}
                    </div>
                    {selectedPlayerId === p.id && <Check className="h-4 w-4 text-primary ml-auto shrink-0" />}
                  </button>
                ))}
              </div>
            )}
            <Button
              className="w-full mt-2"
              disabled={!selectedPlayerId}
              onClick={() => setStep("teams")}
            >
              Continue
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Team selection */}
      {step === "teams" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Which team(s) do you play for?</CardTitle>
            <CardDescription>Select one or more teams. Mark one as your default view.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {allTeams.map((t) => {
              const selected = selectedTeamIds.includes(t.id);
              const isDefault = defaultTeamId === t.id;
              return (
                <div
                  key={t.id}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <button
                    className="flex items-center gap-2 flex-1 text-left"
                    onClick={() => toggleTeam(t.id)}
                  >
                    {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    {!selected && <div className="h-4 w-4 rounded border border-muted-foreground/40 shrink-0" />}
                    <span className="text-sm font-medium">{t.name}</span>
                  </button>
                  {selected && (
                    <button
                      onClick={() => setDefaultTeamId(t.id)}
                      className={`text-xs px-2 py-0.5 rounded transition-colors ${
                        isDefault
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      }`}
                    >
                      {isDefault ? "Default" : "Set default"}
                    </button>
                  )}
                </div>
              );
            })}

            <div className="flex gap-2 pt-2">
              {!existingPlayerId && (
                <Button variant="outline" onClick={() => setStep("player")} className="flex-1">
                  Back
                </Button>
              )}
              <Button
                className="flex-1"
                disabled={!selectedTeamIds.length || saving}
                onClick={handleSave}
              >
                {saving ? "Saving..." : "Finish setup"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
