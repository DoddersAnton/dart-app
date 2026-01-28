
import { db } from "..";
import { FixtureListSummary } from "@/types/fixtures-summary";


  const formatDate = (d?: Date | string | null) => {
            if (!d) return "";
            const date = typeof d === "string" ? new Date(d) : d;
            const day = String(date.getDate()).padStart(2, "0");
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
        };

export async function  getFixtureList() {
 try {
        const fixtures = await db.query.fixtures.findMany();

      

        const fixtureList: FixtureListSummary[] = fixtures.map((f) => ({
            ...f,
            matchDate: formatDate(f.matchDate),
            createdAt: formatDate(f.createdAt),
            updatedAt: formatDate(f.updatedAt),
        }));

        return { success: fixtureList };
      
    } catch (error) {
        console.error(error);
        return { error: "Failed to get fixture" };
    }

}