import { ChevronDown, CloudIcon, Pencil, SunIcon, Trash } from "lucide-react";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemTitle,
} from "../ui/item";
import { Separator } from "../ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
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
  return (
    <Item variant="outline" key={id} className="mb-4">
      <ItemHeader className="bg-gray-50 dark:bg-gray-800 p-2 rounded-t-md">
        <ItemTitle>
          <div>

            { name.toLowerCase().includes("summer") ? (
                <SunIcon className="inline-block mr-2" />
            ) : name.toLowerCase().includes("winter") ? (
                <CloudIcon className="inline-block mr-2" />
                
            ) : null }
          </div>
          <div className="flex flex-row items-center gap-2 justify-between"></div>
          <ItemTitle>{name}</ItemTitle>
        </ItemTitle>
      </ItemHeader>
      <Separator />
      <ItemContent>
        <div className="flex justify-between items-center w-full align-middle">
          <div>
            {" "}
            {fromSeasonDate} to {toSeasonDate}
          </div>

          <div>
            <ItemActions>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={"ghost"}
                    className=" flex items-center flex-row gap-1"
                    title="Game Actions"
                  >
                    Actions <span></span>
                    <ChevronDown className="h-8 w-8" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem className="dark:focus:bg-primary focus:bg-primary/50 cursor-pointer text-black">
                    <Link
                      href={`/settings/add-season?id=${id}`}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4 hover:text-black" />
                      Edit Season
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    //onClick={() => handleDeleteGame({ id: gameSummary.id })}
                    disabled={true}
                    className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                  >
                    <Trash className="h-4 w-4 hover:text-black" />
                    Delete Season
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </ItemActions>
          </div>
        </div>
      </ItemContent>
    </Item>
  );
}
