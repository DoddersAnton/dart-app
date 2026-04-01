import { CalendarDays, CloudIcon, MoreHorizontal, Pencil, SunIcon, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import Link from "next/link";

interface SeasonCardProps {
  id: number;
  name: string;
  fromSeasonDate: string | null;
  toSeasonDate: string | null;
}

export default function SeasonCard({
  id,
  name,
  fromSeasonDate,
  toSeasonDate,
}: SeasonCardProps) {
  const icon = name.toLowerCase().includes("summer") ? (
    <SunIcon className="h-4 w-4 text-muted-foreground" />
  ) : name.toLowerCase().includes("winter") ? (
    <CloudIcon className="h-4 w-4 text-muted-foreground" />
  ) : (
    <CalendarDays className="h-4 w-4 text-muted-foreground" />
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            {icon}
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
                <Link href={`/settings/add-season?id=${id}`} className="flex items-center gap-2 cursor-pointer">
                  <Pencil className="h-4 w-4" /> Edit season
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="flex items-center gap-2 cursor-pointer text-destructive focus:text-destructive">
                <Trash className="h-4 w-4" /> Delete season
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {(fromSeasonDate || toSeasonDate) && (
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="h-4 w-4 shrink-0" />
            <span>{fromSeasonDate} – {toSeasonDate}</span>
          </div>
        </CardContent>
      )}
    </Card>
  );
}
