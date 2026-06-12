"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Target, UserPlus, Clock } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { claimPlayerProfile } from "@/server/actions/claim-player-profile";
import { createOwnProfile } from "@/server/actions/create-own-profile";
import { requestToJoinTeam } from "@/server/actions/request-to-join-team";

type Player = { id: number; name: string; nickname: string | null; imgUrl: string | null };
type Team = { id: number; name: string };

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
}

export function OnboardingForm({
  unlinkedPlayers,
  allTeams,
  existingPlayerId,
}: {
  unlinkedPlayers: Player[];
  allTeams: Team[];
  clerkUserId: string;
  existingPlayerId: number | null;
}) {
  const router = useRouter();
  const [step, setStep] = useState<"profile" | "team">(existingPlayerId ? "team" : "profile");
  // "claim" an existing profile, or "create" a brand-new one
  const [mode, setMode] = useState<"claim" | "create">(unlinkedPlayers.length ? "claim" : "create");
  const [selectedPlayerId, setSelectedPlayerId] = useState<number | null>(null);
  const [linkedPlayerId, setLinkedPlayerId] = useState<number | null>(existingPlayerId);
  const [createForm, setCreateForm] = useState({ name: "", nickname: "", dateOfBirth: "" });
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [requestSent, setRequestSent] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleClaim = async () => {
    if (!selectedPlayerId) { toast.error("Please select your profile"); return; }
    setSaving(true);
    try {
      const result = await claimPlayerProfile(selectedPlayerId);
      if ("error" in result) { toast.error(result.error); return; }
      if (result.hasTeam) {
        toast.success("Welcome back!");
        router.push("/fixtures");
        router.refresh();
        return;
      }
      setLinkedPlayerId(selectedPlayerId);
      setStep("team");
    } finally {
      setSaving(false);
    }
  };

  const handleCreate = async () => {
    if (!createForm.name.trim()) { toast.error("Please enter your name"); return; }
    setSaving(true);
    try {
      const result = await createOwnProfile({
        name: createForm.name,
        nickname: createForm.nickname || null,
        dateOfBirth: createForm.dateOfBirth || null,
      });
      if ("error" in result) { toast.error(result.error); return; }
      toast.success("Profile created");
      setLinkedPlayerId(result.playerId);
      setStep("team");
    } finally {
      setSaving(false);
    }
  };

  const handleRequest = async () => {
    if (!linkedPlayerId) { toast.error("No profile linked"); return; }
    if (!selectedTeamId) { toast.error("Please select a team"); return; }
    setSaving(true);
    try {
      const result = await requestToJoinTeam(linkedPlayerId, selectedTeamId);
      if ("error" in result) { toast.error(result.error); return; }
      setRequestSent(true);
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
        <span className={`font-medium ${step === "profile" ? "text-primary" : "text-muted-foreground"}`}>
          1. Your profile
        </span>
        <span className="text-muted-foreground">→</span>
        <span className={`font-medium ${step === "team" ? "text-primary" : "text-muted-foreground"}`}>
          2. Join a team
        </span>
      </div>

      {/* Step 1: Profile (claim or create) */}
      {step === "profile" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {mode === "claim" ? "Which player profile is yours?" : "Create your player profile"}
            </CardTitle>
            <CardDescription>
              {mode === "claim"
                ? "Select your name from the list, or create a new profile if you're not listed."
                : "Enter your details. A captain will add you to a team after you request to join."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {mode === "claim" ? (
              <>
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
                <Button className="w-full" disabled={!selectedPlayerId || saving} onClick={handleClaim}>
                  {saving ? "Linking..." : "Continue"}
                </Button>
                <button
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
                  onClick={() => setMode("create")}
                >
                  <UserPlus className="h-3.5 w-3.5" /> I&apos;m not listed — create my profile
                </button>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label>Name *</Label>
                  <Input
                    value={createForm.name}
                    onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Nickname</Label>
                  <Input
                    value={createForm.nickname}
                    onChange={(e) => setCreateForm((p) => ({ ...p, nickname: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Date of birth</Label>
                  <Input
                    type="date"
                    value={createForm.dateOfBirth}
                    onChange={(e) => setCreateForm((p) => ({ ...p, dateOfBirth: e.target.value }))}
                  />
                </div>
                <Button className="w-full" disabled={!createForm.name.trim() || saving} onClick={handleCreate}>
                  {saving ? "Creating..." : "Create profile"}
                </Button>
                {unlinkedPlayers.length > 0 && (
                  <button
                    className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setMode("claim")}
                  >
                    Back to the player list
                  </button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 2: Request to join a team */}
      {step === "team" && (
        <Card>
          {requestSent ? (
            <CardContent className="flex flex-col items-center text-center gap-3 py-8">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">Request sent</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your request to join is pending. A team captain will review and approve it.
                </p>
              </div>
              <Button variant="outline" onClick={() => router.push("/")}>Back to home</Button>
            </CardContent>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-base">Request to join a team</CardTitle>
                <CardDescription>
                  Pick a team to request. The captain decides who joins — you&apos;ll get access once approved.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {allTeams.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No teams available yet. Check back later.</p>
                ) : (
                  allTeams.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeamId(t.id)}
                      className={`w-full flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                        selectedTeamId === t.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                      }`}
                    >
                      {selectedTeamId === t.id ? (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded border border-muted-foreground/40 shrink-0" />
                      )}
                      <span className="text-sm font-medium">{t.name}</span>
                    </button>
                  ))
                )}
                <Button className="w-full" disabled={!selectedTeamId || saving} onClick={handleRequest}>
                  {saving ? "Sending..." : "Request to join"}
                </Button>
              </CardContent>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
