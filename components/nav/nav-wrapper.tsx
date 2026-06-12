import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { getPlayerTeams, PlayerTeamEntry } from "@/server/actions/get-player-teams";
import { Nav } from "./nav";

export async function NavWrapper() {
  const user = await currentUser();

  if (!user) {
    return <Nav linkedPlayer={null} isSignedIn={false} playerTeams={[]} activeTeamId={null} />;
  }

  const player = await getPlayerByUserId(user.id);

  let playerTeams: PlayerTeamEntry[] = [];
  if (player) {
    playerTeams = await getPlayerTeams(player.id);
  }

  // Resolve active team: prefer cookie, fall back to default, then first
  let activeTeamId: number | null = null;
  if (playerTeams.length > 0) {
    const cookieStore = await cookies();
    const cookieVal = cookieStore.get("active-team-id")?.value;
    const cookieTeamId = cookieVal ? parseInt(cookieVal) : null;
    const validCookie = cookieTeamId && playerTeams.some((t) => t.teamId === cookieTeamId);
    activeTeamId = validCookie
      ? cookieTeamId
      : (playerTeams.find((t) => t.isDefault)?.teamId ?? playerTeams[0].teamId);
  }

  const userRole = activeTeamId
    ? (playerTeams.find((t) => t.teamId === activeTeamId)?.role as "captain" | "player" | undefined) ?? null
    : null;

  return (
    <Nav
      linkedPlayer={player ? { id: player.id, name: player.name } : null}
      isSignedIn
      playerTeams={playerTeams}
      activeTeamId={activeTeamId}
      userRole={userRole}
    />
  );
}
