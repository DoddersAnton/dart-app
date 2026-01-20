import {
  ChevronDown,
  Home,
  Pencil,
  StarIcon,
  Trash,
  UserIcon,
  Users2Icon,
} from "lucide-react";
import { Button } from "../ui/button";
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
import Link from "next/link";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";

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
  isAppTeam
}: TeamCardProps) {
  return (
    <Item variant="outline" key={id} className="mb-4">
      <ItemHeader
        className={`${
          isAppTeam ? "bg-green-50" : "bg-gray-50"
        } dark:bg-gray-800 p-2 rounded-t-md`}
      >
        <ItemTitle>
          <div>
            {isAppTeam ? (
              <UserIcon className="inline-block mr-2" />
            ) : (
              <Users2Icon className="inline-block mr-2" />
            )}
          </div>
          <div className="flex flex-row items-center gap-2 justify-between"></div>
          <ItemTitle>{name}</ItemTitle>
          <div className="relative">
        </div>
            <ItemTitle className="float-end justify-end">  
                <span title="Is main app name"> {isAppTeam ? <StarIcon className="text-yellow-500" /> : null}</span></ItemTitle>
        </ItemTitle>
      </ItemHeader>
      <Separator />
      <ItemContent>
        <div className="flex justify-between items-center w-full align-middle">
          <div className="flex items-center gap-2 flex-row">
            {" "}
            <Home />{" "}
            <Dialog>
            <DialogTrigger asChild title="View Venue">
              <Button variant="link" color="secondary" className="p-0 m-0">
                {" "}
               {locationName || "No Venue Assigned"} 
                
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] lg:max-w-[600px] ml-2">
              <DialogHeader>
                <DialogTitle>View Venue</DialogTitle>
              </DialogHeader>
            <p>{locationAddress}</p>
              {locationGoogleMapsLink && (
                <div
                  className="w-[300x] h-[200px] h-l-[400px] w-l-full rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: locationGoogleMapsLink }}
                ></div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
                      href={`/settings/add-team?id=${id}`}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4 hover:text-black" />
                      Edit Team
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    //onClick={() => handleDeleteGame({ id: gameSummary.id })}
                    disabled={true}
                    className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                  >
                    <Trash className="h-4 w-4 hover:text-black" />
                    Delete Team
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
