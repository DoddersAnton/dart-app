"use client";

import {
  ChevronDown,
  HouseIcon,
  Pencil,
  PinIcon,
  Trash,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemHeader,
  ItemTitle,
} from "../ui/item";
import { Separator } from "../ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";

import React from "react";
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
    <Item variant="outline" key={id} className="mb-4">
      <ItemHeader className="bg-gray-50 dark:bg-gray-800 p-2 rounded-t-md">
        <ItemTitle>
          <div>
            <HouseIcon></HouseIcon>
          </div>
          <div className="flex flex-row items-center gap-2 justify-between"></div>
          <ItemTitle>{name}</ItemTitle>
          <Dialog>
            <DialogTrigger asChild title="View Venue">
              <Button variant="link" color="secondary" className="p-0 m-0">
                {" "}
                <PinIcon className="inline-block mr-2" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] lg:max-w-[600px] ml-2">
              <DialogHeader>
                <DialogTitle>View Venue</DialogTitle>
              </DialogHeader>

              {googleMapsLink && (
                <div
                  className="w-[300x] h-[200px] h-l-[400px] w-l-full rounded-lg overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: googleMapsLink }}
                ></div>
              )}

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </ItemTitle>
      </ItemHeader>
      <Separator />
      <ItemContent>
        <div className="flex justify-between items-center w-full align-middle">
         
            <div> {address}</div>
          
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
                      href={`/settings/add-location?id=${id}`}
                      className="flex items-center gap-2"
                    >
                      <Pencil className="h-4 w-4 hover:text-black" />
                      Edit Location
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    //onClick={() => handleDeleteGame({ id: gameSummary.id })}
                    disabled={true}
                    className="dark:focus:bg-destructive focus:bg-destructive/50 cursor-pointer flex items-center gap-2"
                  >
                    <Trash className="h-4 w-4 hover:text-black" />
                    Delete Location
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
