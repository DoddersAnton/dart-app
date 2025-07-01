import { eq } from "drizzle-orm";
import { db } from "..";



export async function getFinesByPlayer(playerId: number) {
    try {
        const playerFines = await db.query.playerFines.findMany({
            where: (fine) => eq(fine.playerId, playerId),
        });

        if (!playerFines) {
            return { error: "No fines found for this player" };
        }

        // Get the fine details for this player's fine
        const fine = await db.query.fines.findMany();
        const playerFinesDetails = playerFines.map(playerFine => ({
            ...playerFine,
            fineName: fine ? fine.find(c => c.id === playerFine.fineId)?.title : null,
            amount: fine ? fine.find(c => c.id === playerFine.fineId)?.amount : 0,
        }));

        return { success: playerFinesDetails };
        
       
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get player fines" };
    }
}