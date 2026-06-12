import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/server";
import { isNull } from "drizzle-orm";
import { players } from "@/server/schema";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { getPlayerTeams } from "@/server/actions/get-player-teams";
import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { SessionRestorer } from "@/components/onboarding/session-restorer";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  // If player is already linked and has teams, the user just cleared their
  // cookies. Restore the active-team cookie client-side then redirect.
  const player = await getPlayerByUserId(user.id);
  if (player) {
    const teams = await getPlayerTeams(player.id);
    if (teams.length > 0) return <SessionRestorer />;
  }

  const [unlinkedPlayers, allTeams] = await Promise.all([
    db.query.players.findMany({ where: isNull(players.userid) }),
    db.query.team.findMany(),
  ]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <OnboardingForm
        unlinkedPlayers={unlinkedPlayers.map((p) => ({
          id: p.id,
          name: p.name,
          nickname: p.nickname ?? null,
          imgUrl: p.imgUrl ?? null,
        }))}
        allTeams={allTeams.map((t) => ({ id: t.id, name: t.name }))}
        clerkUserId={user.id}
        existingPlayerId={player?.id ?? null}
      />
    </div>
  );
}
