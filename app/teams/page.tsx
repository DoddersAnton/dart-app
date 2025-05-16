import { db } from "@/server";
import { TeamDataTable } from "./team-table";
import { teamColumns } from "./team-columns";




export default async function Team() {

    const teams = (await db.query.team.findMany()).map((team) => ({
        ...team,
        createdAt: team.createdAt ? team.createdAt.toISOString() : null,
      }));
    
      const total = teams.length; // Calculate all teams

      return (
        <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
    <TeamDataTable
                    columns={teamColumns}
                    data={teams}
                    total={total}
                  />
        </div>
      )

    
}