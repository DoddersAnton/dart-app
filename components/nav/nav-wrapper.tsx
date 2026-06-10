import { currentUser } from "@clerk/nextjs/server";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { getPlayerTeams, PlayerTeamEntry } from "@/server/actions/get-player-teams";
import { Nav } from "./nav";

const PROTECTED = /^\/(fines|players|fixtures|settings|subscriptions|reports|practice|player|games)/;

export async function NavWrapper() {
  const user = await currentUser();

  if (!user) {
    return <Nav linkedPlayer={null} isSignedIn={false} playerTeams={[]} activeTeamId={null} />;
  }

  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";
  const isOnboarding = pathname.startsWith("/onboarding");
  const isProtected = PROTECTED.test(pathname);

  const player = await getPlayerByUserId(user.id);

  // On protected routes: enforce player + team registration
  if (isProtected && !isOnboarding) {
    if (!player) {
      redirect("/onboarding");
    }
    const teams = await getPlayerTeams(player.id);
    if (!teams.length) {
      redirect("/onboarding");
    }
  }

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

  return (
    <Nav
      linkedPlayer={player ? { id: player.id, name: player.name } : null}
      isSignedIn
      playerTeams={playerTeams}
      activeTeamId={activeTeamId}
    />
  );
}
