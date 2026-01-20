import TeamCard from "@/components/teams/team-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getTeams } from "@/server/actions/get-teams";
import {  User2Icon } from "lucide-react";
import Link from "next/link";

export default async function TeamsSettingsPage() {
  const teams = await getTeams();

  if ("error" in teams) {
    return <div className="mt-22">{teams.error}</div>;
  }

  return (
    <div className="mx-auto">
      <h1 className="text-2xl font-bold">Team Settings Page</h1>
      <p>Manage your teams & home location settings here.</p>

      <div className="container mx-auto mt-8 lg:w-[80%]">
        {!teams || teams.success.length === 0 ? (
          <div>
            {" "}
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <User2Icon size={48} />
                </EmptyMedia>
                <EmptyTitle>No Teams Yet</EmptyTitle>
                <EmptyDescription>
                  No Teams added yet. Start by creating a new Team.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Link href="/settings/add-team">
                    <Button>Create Team</Button>
                  </Link>
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4 overflow-auto">
        {teams &&
          teams.success.length > 0 &&
          teams.success.map((location) => (
            <TeamCard
              key={location.id}
              id={location.id}
              name={location.name}
              defaultLocationId={location.defaultLocationId}
              locationName={location.locationName}
                locationGoogleMapsLink={location.locationGoogleMapsLink}
                locationAddress={location.locationAddress}
                isAppTeam={location.isAppTeam}
             
            />
          ))}
          </div>
      </div>
    </div>
  );
}
