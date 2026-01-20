"use server"


import { db } from ".."

export async function getSeasons() {
    try {
        const seasons = await db.query.seasons.findMany();

       
        const seasonMap = seasons.map((season) => ({
            id: season.id,
            name: season.name,
            createdAt: season.createdAt ? season.createdAt.toISOString() : null,
            startDate: season.startDate ? season.startDate.toISOString() : null,
            endDate: season.endDate ? season.endDate.toISOString() : null,
        }));
        const formatDate = (iso: string | null) => {
            if (!iso) return null;
            const d = new Date(iso);
            const dd = String(d.getDate()).padStart(2, "0");
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const yyyy = d.getFullYear();
            return `${dd}/${mm}/${yyyy}`;
        };

        seasonMap.forEach((s) => {
            s.createdAt = formatDate(s.createdAt as string | null);
            s.startDate = formatDate(s.startDate as string | null);
            s.endDate = formatDate(s.endDate as string | null);
        });

        return { success: seasonMap };
        

    } catch (error) {
        console.error(error);
        return { error: "Failed to get seasons" };
    }
}