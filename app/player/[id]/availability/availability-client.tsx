"use client";

import { useState } from "react";
import { format } from "date-fns";
import { CalendarDays, CheckCircle2, XCircle, Clock, MapPin, ExternalLink } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import Link from "next/link";

import { updateAvailability } from "@/server/actions/update-availability";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
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

type PlayerEntry = { id: number; name: string };
type FixtureCounts = { going: PlayerEntry[]; notGoing: PlayerEntry[]; pending: PlayerEntry[] };

function FixtureAvailabilityCard({
  record,
  playerId,
  pending,
  counts,
}: {
  record: Record;
  playerId: number;
  pending: boolean;
  counts?: FixtureCounts;
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
            <Link href={`/fixtures/${record.fixtureId}`} className="hover:underline">
              <CardTitle className="text-base">
                {record.homeTeam} vs {record.awayTeam}
              </CardTitle>
            </Link>
            <p className="text-xs text-muted-foreground mt-0.5">{record.league} · {record.season}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!pending && (
              <Badge variant={record.attending ? "default" : "destructive"} className={record.attending ? "bg-green-600" : ""}>
                {record.attending ? "Going" : "Not going"}
              </Badge>
            )}
            {pending && (
              <Badge variant="outline" className="text-amber-500 border-amber-400">Pending</Badge>
            )}
          </div>
        </div>

        {/* Fixture availability summary */}
        {counts && (
          <div className="flex items-center gap-2 mt-2">
            <Popover>
              <PopoverTrigger asChild>
                <button className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-muted transition-colors">
                  <span className="flex items-center gap-1 text-xs text-green-600">
                    <CheckCircle2 className="h-3 w-3" /> {counts.going.length}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-destructive">
                    <XCircle className="h-3 w-3" /> {counts.notGoing.length}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-amber-500">
                    <Clock className="h-3 w-3" /> {counts.pending.length}
                  </span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-3 space-y-3" align="start">
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-green-600 mb-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Going ({counts.going.length})
                  </p>
                  {counts.going.length > 0
                    ? counts.going.map((p) => <p key={p.id} className="text-xs text-muted-foreground pl-5">{p.name}</p>)
                    : <p className="text-xs text-muted-foreground pl-5">None yet</p>}
                </div>
                <Separator />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1.5">
                    <XCircle className="h-3.5 w-3.5" /> Not going ({counts.notGoing.length})
                  </p>
                  {counts.notGoing.length > 0
                    ? counts.notGoing.map((p) => <p key={p.id} className="text-xs text-muted-foreground pl-5">{p.name}</p>)
                    : <p className="text-xs text-muted-foreground pl-5">None</p>}
                </div>
                <Separator />
                <div>
                  <p className="flex items-center gap-1.5 text-xs font-semibold text-amber-500 mb-1.5">
                    <Clock className="h-3.5 w-3.5" /> Pending ({counts.pending.length})
                  </p>
                  {counts.pending.length > 0
                    ? counts.pending.map((p) => <p key={p.id} className="text-xs text-muted-foreground pl-5">{p.name}</p>)
                    : <p className="text-xs text-muted-foreground pl-5">None</p>}
                </div>
              </PopoverContent>
            </Popover>
            <Link href={`/fixtures/${record.fixtureId}`} className="ml-auto">
              <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                <ExternalLink className="h-3 w-3" /> View match
              </Button>
            </Link>
          </div>
        )}
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
  fixtureCounts,
}: {
  playerId: number;
  records: Record[];
  fixtureCounts: { [fixtureId: number]: FixtureCounts };
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
              <FixtureAvailabilityCard key={record.id} record={record} playerId={playerId} pending counts={fixtureCounts[record.fixtureId]} />
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
              <FixtureAvailabilityCard key={record.id} record={record} playerId={playerId} pending={false} counts={fixtureCounts[record.fixtureId]} />
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
