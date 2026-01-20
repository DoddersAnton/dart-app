"use server"

import { db } from ".."

export async function getTeams() {
    try {
        const teams = await db.query.team.findMany();

        const locations = await db.query.locations.findMany();

         const teamList = teams.map((team) => ({
            id: team.id,
            name: team.name,
            defaultLocationId: team.defaultLocationId,
            locationName: locations.find(loc => loc.id === team.defaultLocationId)?.name || null,
            locationAddress: locations.find(loc => loc.id === team.defaultLocationId)?.address || null,
            locationGoogleMapsLink: locations.find(loc => loc.id === team.defaultLocationId)?.googleMapsLink || null,
            isAppTeam: team.isAppTeam,            
            createdAt: team.createdAt ? team.createdAt.toISOString() : null
        }));

        return { success: teamList };

    } catch (error) {
        console.error(error);
        return { error: "Failed to get teams" };
    }
}