import { currentUser } from "@clerk/nextjs/server";
import { getPlayerByUserId } from "@/server/actions/get-player-by-user-id";
import { Nav } from "./nav";

export async function NavWrapper() {
  const user = await currentUser();

  let linkedPlayer: { id: number; name: string } | null = null;
  if (user) {
    const player = await getPlayerByUserId(user.id);
    if (player) {
      linkedPlayer = { id: player.id, name: player.name };
    }
  }

  return <Nav linkedPlayer={linkedPlayer} isSignedIn={!!user} />;
}
