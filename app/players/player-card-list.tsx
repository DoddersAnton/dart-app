"use client";

import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useMemo, useState } from "react";

interface Player {
  id: number;
  name: string;
  nickname: string | null;
  team: string | null;
}

interface PlayerCardListProps {
  players: Player[];
}

export function PlayerCardList({ players }: PlayerCardListProps) {
  const [search, setSearch] = useState("");

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return players;
    }

    return players.filter((player) =>
      player.name.toLowerCase().includes(term),
    );
  }, [players, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search players by name..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {filteredPlayers.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => (
            <Card key={player.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{player.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                <p>Nickname: {player.nickname || "N/A"}</p>
                <p>Team: {player.team || "N/A"}</p>
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/players/${player.id}`}>View Player</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No players found.
          </CardContent>
        </Card>
      )}
    </div>
  );
}
