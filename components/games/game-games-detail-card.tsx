
import { PlayerGameDetails } from "@/server/actions/get-player-games";

export function PlayerGamesDetailCard( PlayerGameDetails:PlayerGameDetails)
{
    return (
    <div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <strong>Game Type:</strong> {PlayerGameDetails.fixtureId}
            </div>
            
                
        </div>
    </div>);

}