"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Camera, ImageUp } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { UploadThingImageUploader } from "@/components/players/uploadthing-image-uploader";

interface Player {
  id: number;
  name: string;
  nickname: string | null;
  team: string | null;
}

interface PlayerCardListProps {
  players: Player[];
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function PlayerCardList({ players }: PlayerCardListProps) {
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

  const updatePlayerAvatar = (playerId: number, dataUrl: string) => {
    setAvatarMap((prev) => {
      const next = { ...prev, [playerId]: dataUrl };
      window.localStorage.setItem("players-avatars", JSON.stringify(next));
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search players by name..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />

      {filteredPlayers.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlayers.map((player) => {
            const avatarSrc = avatarMap[player.id];

            return (
              <Card key={player.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {avatarSrc ? (
                        <Image
                          src={avatarSrc}
                          alt={`${player.name} avatar`}
                          width={44}
                          height={44}
                          unoptimized
                          className="h-11 w-11 rounded-full object-cover border"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full border flex items-center justify-center bg-muted text-xs font-semibold">
                          {getInitials(player.name)}
                        </div>
                      )}
                      <CardTitle className="text-lg">{player.name}</CardTitle>
                    </div>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="icon" variant="outline" aria-label="Add image">
                          <Camera className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2"><ImageUp className="h-4 w-4" /> Upload your image</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                          Upload your image for {player.name}. This is stored in your local browser for now.
                        </p>
                        <UploadThingImageUploader
                          playerId={player.id}
                          onUploadComplete={updatePlayerAvatar}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>Nickname: {player.nickname || "N/A"}</p>
                  <p>Team: {player.team || "N/A"}</p>
                  <Button asChild className="w-full" variant="outline">
                    <Link href={`/players/${player.id}`}>View Player</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
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
