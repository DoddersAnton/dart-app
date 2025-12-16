

import GameCard from "@/components/games/game-card";
import { getGame } from "@/server/actions/get-game";

export default async function Game({
  params,
}: {
  params: Promise<{ id: number }>;
}) {


  const { id } = await params;
  const game = await getGame(id);

  if (game.error) {
    return <div className="mt-22">{game.error}</div>;
  }

  if (!game) {
    return (
      <div className="container mx-auto py-12 mt-22">
        <h1 className="text-2xl font-bold">Match not found, please try again</h1>
      </div>
    );
  }

  

if (game.success) {
 

  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
      <GameCard gameData={game.success} />
    </div>
  );
}
  
}