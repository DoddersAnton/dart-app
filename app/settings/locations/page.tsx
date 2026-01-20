import LocationCard from "@/components/locations/locations-card";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { getLocations } from "@/server/actions/get-locations";
import { Locate } from "lucide-react";
import Link from "next/link";
export const dynamic = "force-dynamic";

export default async function GetLocations() {
  const locations = await getLocations();

  if ("error" in locations) {
    return <div className="mt-22">{locations.error}</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold">Location Settings Page</h1>
      <p>
        The location entity links to a team and populates the match location.
      </p>

      <div className="container mx-auto mt-8 px-2 lg:w-[80%]">
        {!locations || locations.success.length === 0 ? (
          <div>
            {" "}
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Locate size={48} />
                </EmptyMedia>
                <EmptyTitle>No Locations Yet</EmptyTitle>
                <EmptyDescription>
                  No Locations added yet. Start by creating a new location.
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <div className="flex gap-2">
                  <Link href="/settings/add-location">
                    <Button>Create Location</Button>
                  </Link>
                </div>
              </EmptyContent>
            </Empty>
          </div>
        ) : null}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto">
          {locations &&
            locations.success.length > 0 &&
            locations.success.map((location) => (
              <LocationCard
                key={location.id}
                id={location.id}
                name={location.name}
                createdAt={
                  location.createdAt
                    ? new Date(location.createdAt).toLocaleDateString("en-GB")
                    : null
                }
                address={location.address}
                googleMapsLink={location.googleMapsLink}
              />
            ))}
        </div>
      </div>
    </div>
  );
}
