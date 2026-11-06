"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "../ui/button";
import { getNextGame, type NextGame } from "@/server/actions/get-next-game";

export function describeNextGame(next: NextGame) {
  const home = next.homePlayers.join(" & ");
  const away = next.awayPlayers.join(" & ");
  return home && away ? `${home} vs ${away}` : home || away || "Players not set";
}

// Links to the dart tracker for the next unfinished game in the fixture's sequence.
// Renders nothing when there is no game left to play.
export default function NextGameButton({
  fixtureId,
  currentGameId,
  className,
}: {
  fixtureId: number;
  currentGameId?: number;
  className?: string;
}) {
  const [next, setNext] = useState<NextGame | null>(null);

  useEffect(() => {
    let active = true;
    getNextGame(fixtureId, currentGameId).then((g) => active && setNext(g));
    return () => { active = false; };
  }, [fixtureId, currentGameId]);

  if (!next) return null;

  return (
    <Link
      href={`/games/dart-tracker?id=${next.id}`}
      className={className}
      onClick={(event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        window.location.href = event.currentTarget.href;
      }}
    >
      <Button className="w-full h-auto justify-between gap-3 py-2.5">
        <span className="flex flex-col items-start text-left leading-tight min-w-0">
          <span className="text-sm font-semibold">Start next game · {next.gameType}</span>
          <span className="text-xs opacity-80 truncate max-w-full">{describeNextGame(next)}</span>
        </span>
        <ArrowRight className="h-4 w-4 shrink-0" />
      </Button>
    </Link>
  );
}
