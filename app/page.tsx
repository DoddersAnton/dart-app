import { currentUser } from "@clerk/nextjs/server";
import { Home } from "@/components/home/home";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";

export default async function Page() {
  const user = await currentUser();

  let linkedPlayer: { id: number; name: string; imgUrl: string | null } | null = null;
  if (user) {
    const player = await getPlayerByUserId(user.id);
    if (player) {
      linkedPlayer = { id: player.id, name: player.name, imgUrl: player.imgUrl ?? null };
    }
  }

  return (
    <div>
      <Home
        userName={user ? (user.fullName ?? user.firstName ?? user.emailAddresses[0]?.emailAddress ?? "") : null}
        userImageUrl={user?.imageUrl ?? null}
        linkedPlayer={linkedPlayer}
      />
    </div>
  );
}
