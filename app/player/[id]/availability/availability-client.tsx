"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, XCircle, Clock, MapPin } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { updateAvailability } from "@/server/actions/update-availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type Record = {
  id: number;
  attending: boolean | null;
  note: string | null;
  fixtureId: number;
  matchDate: Date;
  homeTeam: string;
  awayTeam: string;
  matchStatus: string;
  league: string;
  season: string;
  locationName: string | null;
  locationAddress: string | null;
  locationMapsLink: string | null;
};

function FixtureAvailabilityCard({
  record,
  playerId,
  pending,
}: {
  record: Record;
  playerId: number;
  pending: boolean;
}) {
  const [note, setNote] = useState(record.note ?? "");
  const [showNote, setShowNote] = useState(false);
  const { execute, isPending } = useAction(updateAvailability, {
    onSuccess: () => toast.success("Availability updated"),
    onError: () => toast.error("Failed to update availability"),
  });

  const respond = (attending: boolean) => {
    execute({ playerId, fixtureId: record.fixtureId, attending, note: note || undefined });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">
              {record.homeTeam} vs {record.awayTeam}
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">{record.league} · {record.season}</p>
          </div>
          {!pending && (
            <Badge variant={record.attending ? "default" : "destructive"} className={record.attending ? "bg-green-600" : ""}>
              {record.attending ? "Going" : "Not going"}
            </Badge>
          )}
          {pending && (
            <Badge variant="outline" className="text-amber-500 border-amber-400">Pending</Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Date */}
        <div className="flex items-center gap-2 text-sm">
          <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
          <span>{format(new Date(record.matchDate), "EEEE d MMMM yyyy · HH:mm")}</span>
        </div>

        {/* Location */}
        {record.locationName && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{record.locationName}</p>
              {record.locationAddress && (
                <p className="text-xs text-muted-foreground">{record.locationAddress}</p>
              )}
            </div>
          </div>
        )}

        {/* Google Maps embed */}
        {record.locationMapsLink && (
          <div className="space-y-2">
            <div
              className="w-full h-40 rounded-lg overflow-hidden border [&>iframe]:w-full [&>iframe]:h-full"
              dangerouslySetInnerHTML={{ __html: record.locationMapsLink }}
            />
      
          </div>
        )}

        {/* Note */}
        {(showNote || record.note) && (
          <Textarea
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-sm h-20 resize-none"
          />
        )}

        {/* Response buttons */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={record.attending === true ? "default" : "outline"}
            className={`flex-1 ${record.attending === true ? "bg-green-600 hover:bg-green-700" : ""}`}
            disabled={isPending}
            onClick={() => respond(true)}
          >
            <CheckCircle2 className="h-4 w-4 mr-1" /> Going
          </Button>
          <Button
            size="sm"
            variant={record.attending === false ? "destructive" : "outline"}
            className="flex-1"
            disabled={isPending}
            onClick={() => respond(false)}
          >
            <XCircle className="h-4 w-4 mr-1" /> Not going
          </Button>
          {!showNote && !record.note && (
            <Button size="sm" variant="ghost" onClick={() => setShowNote(true)} disabled={isPending}>
              Note
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function AvailabilityClient({
  playerId,
  records,
}: {
  playerId: number;
  records: Record[];
}) {
  const pending = records.filter((r) => r.attending === null);
  const responded = records.filter((r) => r.attending !== null);

  return (
    <Tabs defaultValue="pending">
      <TabsList>
        <TabsTrigger value="pending">
          <Clock className="h-3.5 w-3.5 mr-1.5" />
          Pending
          {pending.length > 0 && (
            <span className="ml-1.5 rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] text-white font-semibold leading-none">
              {pending.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="responded">
          <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
          Responded ({responded.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="pending" className="mt-4">
        {pending.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {pending.map((record) => (
              <FixtureAvailabilityCard key={record.id} record={record} playerId={playerId} pending />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No pending availability requests.
          </p>
        )}
      </TabsContent>

      <TabsContent value="responded" className="mt-4">
        {responded.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {responded.map((record) => (
              <FixtureAvailabilityCard key={record.id} record={record} playerId={playerId} pending={false} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-sm text-muted-foreground">
            No responses yet.
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
}
