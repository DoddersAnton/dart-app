"use client";

import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

interface Player {
  id: number;
  name: string;
  nickname: string | null;
  imgUrl?: string | null;
}

interface PlayerCardListProps {
  players: Player[];
  roleMap?: Record<number, string>;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerCardList({ players, roleMap = {} }: PlayerCardListProps) {
  const [search, setSearch] = useState("");
  const [avatarMap, setAvatarMap] = useState<Record<number, string>>({});

  useEffect(() => {
    const avatars = window.localStorage.getItem("players-avatars");
    if (avatars) {
      setAvatarMap(JSON.parse(avatars));
    }
  }, []);

  const filteredPlayers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return players;
    }

    return players.filter((player) => player.name.toLowerCase().includes(term));
  }, [players, search]);

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search players by name..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {filteredPlayers.length ? (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {filteredPlayers.map((player) => {
            const avatarSrc = player.imgUrl || avatarMap[player.id];

            return (
              <Link key={player.id} href={`/player/${player.id}`}>
                <div className="group aspect-square rounded-xl border bg-card p-5 hover:border-primary transition-colors flex flex-col items-center justify-center gap-3 relative">
                  {roleMap[player.id] === "captain" && (
                    <span className="absolute top-2 right-2 text-[9px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 px-1.5 py-0.5 rounded">
                      Captain
                    </span>
                  )}
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={`${player.name} avatar`}
                      width={80}
                      height={80}
                      unoptimized
                      className="h-20 w-20 rounded-full object-cover border"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full border flex items-center justify-center bg-muted text-sm font-semibold">
                      {getInitials(player.name)}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-semibold text-sm group-hover:text-primary transition-colors">{player.name}</p>
                    {player.nickname && <p className="text-xs text-muted-foreground mt-0.5">{player.nickname}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="py-8 text-center text-muted-foreground text-sm">No players found.</p>
      )}
    </div>
  );
}
