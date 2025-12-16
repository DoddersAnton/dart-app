import { getGamesByPlayer, PlayerGameDetails } from "@/server/actions/get-player-games";
import { Player } from "./player-card";
import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";
import { DialogTrigger } from "../ui/dialog";
import { PlayerGamesDetailCard } from "../games/game-games-detail-card";



type PlayerGamesCardProps = {
    playerData: Player;
}

export default function PlayerGamesCard({playerData}: PlayerGamesCardProps) {
    const [games, setGames] = useState<PlayerGameDetails[]>([]);
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (playerData && open) {
            setLoading(true);
            getGamesByPlayer(playerData.id)
                .then((data) => {
                    setGames(data.success || []);
                })
                .finally(() => setLoading(false));
        }
    }, [playerData, open]);

    


    

    return (
        <div>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <button className="btn btn-primary">View Games</button>
                </DialogTrigger>
                <DialogContent className="max-w-3xl">
                    <h2 className="text-2xl font-bold mb-4">Games for {playerData.name}</h2>
                    {games.map((game) => (
                        <PlayerGamesDetailCard key={game.fixtureId} {...game} />
                    ))}     
          
                {loading && <div>Loading...</div>}  
                {games.length === 0 && !loading && <div>No games found for this player.</div>}              
                </DialogContent>
            </Dialog>
        </div>
    )
}   