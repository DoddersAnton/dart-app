import { MapPin, MoreHorizontal, Pencil, Star, Trash, Users2Icon, UserIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

interface TeamCardProps {
  id: number;
  name: string;
  defaultLocationId: number | null;
  locationName: string | null;
  locationAddress?: string | null;
  locationGoogleMapsLink?: string | null;
  isAppTeam?: boolean;
}

export default function TeamCard({
  id,
  name,
  locationName,
  locationAddress,
  locationGoogleMapsLink,
  isAppTeam,
}: TeamCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {isAppTeam ? (
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Users2Icon className="h-4 w-4 text-muted-foreground" />
            )}
            <CardTitle className="text-base">{name}</CardTitle>
            {isAppTeam && (
              <Badge className="bg-amber-500 hover:bg-amber-600 text-white text-xs">
                <Star className="h-3 w-3 mr-1" /> Our team
              </Badge>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/settings/add-team?id=${id}`} className="flex items-center gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" /> Edit team
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash className="h-4 w-4" /> Delete team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {locationName && (
        <CardContent className="pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{locationName}</p>
                  {locationAddress && <p className="text-xs">{locationAddress}</p>}
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{locationName}</DialogTitle>
              </DialogHeader>
              {locationAddress && <p className="text-sm text-muted-foreground">{locationAddress}</p>}
              {locationGoogleMapsLink && (
                <div
                  className="w-full h-52 rounded-lg overflow-hidden border [&>iframe]:w-full [&>iframe]:h-full"
                  dangerouslySetInnerHTML={{ __html: locationGoogleMapsLink }}
                />
              )}
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      )}
    </Card>
  );
}
