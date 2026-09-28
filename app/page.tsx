import { currentUser } from "@clerk/nextjs/server";
import { Home } from "@/components/home/home";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { getTeamHomepageData } from "@/server/actions/get-team-homepage-data";
import { getHomeTeamSnapshot } from "@/server/actions/get-home-team-snapshot";
import { getActiveTeamId } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [user, activeTeamId] = await Promise.all([currentUser(), getActiveTeamId()]);

  let linkedPlayer: { id: number; name: string; imgUrl: string | null } | null = null;
  if (user) {
    const player = await getPlayerByUserId(user.id);
    if (player) {
      linkedPlayer = { id: player.id, name: player.name, imgUrl: player.imgUrl ?? null };
    }
  }

  const [teamData, snapshot] = activeTeamId
    ? await Promise.all([getTeamHomepageData(activeTeamId), getHomeTeamSnapshot(activeTeamId)])
    : [null, null];

  return (
    <div>
      <Home
        userName={user ? (user.fullName ?? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "") : null}
        userImageUrl={user?.imageUrl ?? null}
        linkedPlayer={linkedPlayer}
        teamData={teamData}
        snapshot={snapshot}
      />
    </div>
  );
}
