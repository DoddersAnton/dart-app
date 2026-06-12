import { currentUser } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { Home } from "@/components/home/home";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { getTeamHomepageData } from "@/server/actions/get-team-homepage-data";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [user, cookieStore] = await Promise.all([currentUser(), cookies()]);

  const activeTeamId = cookieStore.get("active-team-id")?.value
    ? parseInt(cookieStore.get("active-team-id")!.value)
    : null;

  let linkedPlayer: { id: number; name: string; imgUrl: string | null } | null = null;
  if (user) {
    const player = await getPlayerByUserId(user.id);
    if (player) {
      linkedPlayer = { id: player.id, name: player.name, imgUrl: player.imgUrl ?? null };
    }
  }

  const teamData = activeTeamId ? await getTeamHomepageData(activeTeamId) : null;

  return (
    <div>
      <Home
        userName={user ? (user.fullName ?? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "") : null}
        userImageUrl={user?.imageUrl ?? null}
        linkedPlayer={linkedPlayer}
        teamData={teamData}
      />
    </div>
  );
}
