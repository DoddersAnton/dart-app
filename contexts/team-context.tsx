"use client";

import { createContext, useContext, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setActiveTeam } from "@/server/actions/set-active-team";

type TeamContextValue = {
  activeTeamId: number | null;
  switchTeam: (teamId: number) => Promise<void>;
  isPending: boolean;
};

const TeamContext = createContext<TeamContextValue>({
  activeTeamId: null,
  switchTeam: async () => {},
  isPending: false,
});

export function TeamProvider({
  children,
  initialTeamId,
}: {
  children: React.ReactNode;
  initialTeamId: number | null;
}) {
  const router = useRouter();
  const [activeTeamId, setActiveTeamId] = useState<number | null>(initialTeamId);
  const [isPending, startTransition] = useTransition();

  const switchTeam = async (teamId: number) => {
    await setActiveTeam(teamId);
    setActiveTeamId(teamId);
    startTransition(() => router.refresh());
  };

  return (
    <TeamContext.Provider value={{ activeTeamId, switchTeam, isPending }}>
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  return useContext(TeamContext);
}
