"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, ChevronDown, ChevronUp, Plus, Target, Users, X } from "lucide-react";
import { toast } from "sonner";
import { createPracticeGame } from "@/server/actions/create-practice-game";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Player = { id: number; name: string; nickname: string | null; imgUrl: string | null };

type LineupEntry =
  | { kind: "player"; key: string; playerId: number; name: string; nickname: string | null; imgUrl: string | null }
  | { kind: "guest"; key: string; name: string };

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
  const [gameType, setGameType] = useState("501");
  const [legs, setLegs] = useState("3");
  const [gameMode, setGameMode] = useState<"singles" | "teams">("singles");
  const [loading, setLoading] = useState(false);

  const [lineup, setLineup] = useState<LineupEntry[]>(() => {
    if (preselectedPlayerId) {
      const p = playerList.find((pl) => pl.id === preselectedPlayerId);
      if (p) return [{ kind: "player", key: `p-${p.id}`, playerId: p.id, name: p.name, nickname: p.nickname, imgUrl: p.imgUrl }];
    }
    return [];
  });
  const [teamMap, setTeamMap] = useState<Record<string, "A" | "B">>({});

  const isInLineup = (id: number) => lineup.some((e) => e.kind === "player" && e.playerId === id);

  const togglePlayer = (p: Player) => {
    const key = `p-${p.id}`;
    if (isInLineup(p.id)) {
      setLineup((prev) => prev.filter((e) => e.key !== key));
    } else {
      setLineup((prev) => [...prev, { kind: "player", key, playerId: p.id, name: p.name, nickname: p.nickname, imgUrl: p.imgUrl }]);
    }
  };

  const addGuest = () => {
    const key = `g-${Math.random().toString(36).slice(2)}`;
    setLineup((prev) => [...prev, { kind: "guest", key, name: "" }]);
  };

  const updateGuest = (key: string, name: string) =>
    setLineup((prev) => prev.map((e) => (e.key === key ? { ...e, name } : e)));

  const removeEntry = (key: string) => {
    setLineup((prev) => prev.filter((e) => e.key !== key));
    setTeamMap((prev) => { const n = { ...prev }; delete n[key]; return n; });
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setLineup((prev) => { const n = [...prev]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; });
  };

  const moveDown = (idx: number) => {
    if (idx === lineup.length - 1) return;
    setLineup((prev) => { const n = [...prev]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; });
  };

  const setTeam = (key: string, team: "A" | "B") =>
    setTeamMap((prev) => ({ ...prev, [key]: team }));

  const validLineup = lineup.filter((e) => e.kind === "player" || (e.kind === "guest" && e.name.trim()));
  const totalPlayers = validLineup.length;

  const handleStart = async () => {
    if (totalPlayers < 1) { toast.error("Add at least one player"); return; }
    if (gameMode === "teams" && totalPlayers < 2) { toast.error("Teams mode requires at least 2 players"); return; }
    setLoading(true);
    const players = validLineup.map((e) => ({
      playerId: e.kind === "player" ? e.playerId : undefined,
      guestName: e.kind === "guest" ? e.name.trim() : undefined,
      team: gameMode === "teams" ? (teamMap[e.key] ?? "A") : undefined,
    }));
    const result = await createPracticeGame({ gameType, legs: Number(legs), gameMode, players });
    if ("error" in result) { toast.error(result.error); setLoading(false); return; }
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
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Game Type</p>
              <Select value={gameType} onValueChange={setGameType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="501">501</SelectItem>
                  <SelectItem value="601">601</SelectItem>
                  <SelectItem value="801">801</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Best of</p>
              <Select value={legs} onValueChange={setLegs}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 leg</SelectItem>
                  <SelectItem value="3">3 legs</SelectItem>
                  <SelectItem value="5">5 legs</SelectItem>
                  <SelectItem value="7">7 legs</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Game Mode</p>
              <Select value={gameMode} onValueChange={(v) => setGameMode(v as "singles" | "teams")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="singles">Singles / Free for all</SelectItem>
                  <SelectItem value="teams">Teams</SelectItem>
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
              const selected = isInLineup(player.id);
              return (
                <button
                  key={player.id}
                  onClick={() => togglePlayer(player)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-3 py-2 text-left transition-colors ${
                    selected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                  }`}
                >
                  {player.imgUrl ? (
                    <Image src={player.imgUrl} alt={player.name} width={28} height={28} unoptimized className="h-7 w-7 rounded-full object-cover border shrink-0" />
                  ) : (
                    <div className="h-7 w-7 rounded-full border bg-muted flex items-center justify-center text-xs font-semibold shrink-0">
                      {getInitials(player.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{player.name}</p>
                    {player.nickname && <p className="text-xs text-muted-foreground">{player.nickname}</p>}
                  </div>
                  {selected && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              );
            })}
          </div>

          {lineup.some((e) => e.kind === "guest") && (
            <div className="pt-2 space-y-2 border-t">
              {lineup.filter((e): e is Extract<LineupEntry, { kind: "guest" }> => e.kind === "guest").map((guest) => (
                <div key={guest.key} className="flex items-center gap-2">
                  <Input
                    value={guest.name}
                    onChange={(e) => updateGuest(guest.key, e.target.value)}
                    placeholder="Guest name"
                    className="h-8 text-sm flex-1"
                  />
                  <button onClick={() => removeEntry(guest.key)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button onClick={addGuest} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground pt-1">
            <Plus className="h-3.5 w-3.5" /> Add guest player
          </button>
        </CardContent>
      </Card>

      {/* Throw order + team assignment */}
      {lineup.length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">
                {gameMode === "teams" ? "Throw Order & Teams" : "Throw Order"}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {lineup.map((entry, idx) => {
              const name = entry.name || (entry.kind === "guest" ? "Guest" : "");
              const imgUrl = entry.kind === "player" ? entry.imgUrl : null;
              const currentTeam = teamMap[entry.key] ?? "A";
              return (
                <div key={entry.key} className="flex items-center gap-2 rounded-lg border px-3 py-2">
                  <span className="text-xs text-muted-foreground w-4 tabular-nums shrink-0">{idx + 1}</span>
                  {imgUrl ? (
                    <Image src={imgUrl} alt={name} width={24} height={24} unoptimized className="h-6 w-6 rounded-full object-cover border shrink-0" />
                  ) : (
                    <div className="h-6 w-6 rounded-full border bg-muted flex items-center justify-center text-[10px] font-semibold shrink-0">
                      {getInitials(name)}
                    </div>
                  )}
                  <span className="text-sm font-medium flex-1 min-w-0 truncate">{name || <span className="text-muted-foreground italic">Enter guest name above</span>}</span>
                  {gameMode === "teams" && (
                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setTeam(entry.key, "A")}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                          currentTeam === "A" ? "bg-blue-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >A</button>
                      <button
                        type="button"
                        onClick={() => setTeam(entry.key, "B")}
                        className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${
                          currentTeam === "B" ? "bg-red-500 text-white" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >B</button>
                    </div>
                  )}
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => moveUp(idx)} disabled={idx === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-25">
                      <ChevronUp className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => moveDown(idx)} disabled={idx === lineup.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-25">
                      <ChevronDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
            {gameMode === "teams" && (
              <p className="text-xs text-muted-foreground pt-1">
                Players alternate in listed order. Each team shares one score.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Button className="w-full" size="lg" disabled={loading || totalPlayers < 1} onClick={handleStart}>
        {loading ? "Starting..." : "Start Practice"}
      </Button>
    </div>
  );
}
