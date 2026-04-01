"use client";

import { MapPin, MoreHorizontal, Pencil, Trash } from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";

interface LocationCardProps {
  id: number;
  name: string;
  address: string | null;
  googleMapsLink?: string | null;
  createdAt?: string | null;
}

export default function LocationCard({
  id,
  name,
  address,
  googleMapsLink,
}: LocationCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/settings/add-location?id=${id}`} className="flex items-center gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" /> Edit location
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash className="h-4 w-4" /> Delete location
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {(address || googleMapsLink) && (
        <CardContent className="pt-0">
          <Dialog>
            <DialogTrigger asChild>
              <button className="flex items-start gap-2 text-sm text-muted-foreground hover:text-primary transition-colors text-left">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  {address && <p className="text-xs">{address}</p>}
                </div>
              </button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{name}</DialogTitle>
              </DialogHeader>
              {address && <p className="text-sm text-muted-foreground">{address}</p>}
              {googleMapsLink && (
                <div
                  className="w-full h-52 rounded-lg overflow-hidden border [&>iframe]:w-full [&>iframe]:h-full"
                  dangerouslySetInnerHTML={{ __html: googleMapsLink }}
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
