"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, Plus, X, Target } from "lucide-react";
import { toast } from "sonner";
import { createPracticeGame } from "@/server/actions/create-practice-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Player = { id: number; name: string; nickname: string | null; imgUrl: string | null };

function getInitials(name: string) {
  return name.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export default function PracticeSetup({
  playerList,
  preselectedPlayerId,
}: {
  playerList: Player[];
  preselectedPlayerId?: number;
}) {
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<number[]>(
    preselectedPlayerId ? [preselectedPlayerId] : []
  );
  const [guests, setGuests] = useState<{ id: string; name: string }[]>([]);
  const [gameType, setGameType] = useState("501");
  const [legs, setLegs] = useState("3");
  const [loading, setLoading] = useState(false);

  const togglePlayer = (id: number) =>
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );

  const addGuest = () =>
    setGuests((prev) => [...prev, { id: Math.random().toString(36).slice(2), name: "" }]);

  const updateGuest = (id: string, name: string) =>
    setGuests((prev) => prev.map((g) => (g.id === id ? { ...g, name } : g)));

  const removeGuest = (id: string) =>
    setGuests((prev) => prev.filter((g) => g.id !== id));

  const totalPlayers = selectedIds.length + guests.filter((g) => g.name.trim()).length;

  const handleStart = async () => {
    if (totalPlayers < 1) {
      toast.error("Add at least one player");
      return;
    }
    setLoading(true);
    const players = [
      ...selectedIds.map((id) => ({ playerId: id })),
      ...guests.filter((g) => g.name.trim()).map((g) => ({ guestName: g.name.trim() })),
    ];
    const result = await createPracticeGame({ gameType, legs: Number(legs), players });
    if ("error" in result) {
      toast.error(result.error);
      setLoading(false);
      return;
    }
    router.push(`/practice/${result.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Target className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">New Practice Session</h1>
      </div>

      {/* Game settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Game Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Game Type</p>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="301">301</SelectItem>
                  <SelectItem value="501">501</SelectItem>
                  <SelectItem value="701">701</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Best of</p>
              <Select value={legs} onValueChange={setLegs}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 leg</SelectItem>
                  <SelectItem value="3">3 legs</SelectItem>
                  <SelectItem value="5">5 legs</SelectItem>
                  <SelectItem value="7">7 legs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Player selection */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Players</CardTitle>
            <span className="text-xs text-muted-foreground">{totalPlayers} selected</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
            {playerList.map((player) => {
              const selected = selectedIds.includes(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  {player.imgUrl ? (
                    <Image
                      src={player.imgUrl}
                      alt={player.name}
                      width={28}
                      height={28}
                      unoptimized
                      className="h-7 w-7 rounded-full object-cover border shrink-0"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(player.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{player.name}</p>
                    {player.nickname && (
                      <p className="text-xs text-muted-foreground">{player.nickname}</p>
                    )}
                  </div>
                  {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Guest players */}
          {guests.length > 0 && (
            <div className="pt-2 space-y-2 border-t">
              {guests.map((guest) => (
                <div key={guest.id} className="flex items-center gap-2">
                  <Input
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.id, e.target.value)}
                    placeholder="Guest name"
                    className="h-8 text-sm flex-1"
                  />
                  <button
                    onClick={() => removeGuest(guest.id)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={addGuest}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground pt-1"
          >
            <Plus className="h-3.5 w-3.5" /> Add guest player
          </button>
        </CardContent>
      </Card>

      <Button
        className="w-full"
        size="lg"
        disabled={loading || totalPlayers < 1}
        onClick={handleStart}
      >
        {loading ? "Starting..." : "Start Practice"}
      </Button>
    </div>
  );
}
