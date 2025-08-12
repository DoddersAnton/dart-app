import { Elements } from "@stripe/react-stripe-js";

import { Button } from "../ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import PaymentForm from "./payment-form";
import { useTheme } from "next-themes";
import getStripe from "@/lib/get-stripe";
import React from "react";

export type PaymentDrawerProps = {
  amount: number;
  playerId?: number;
  fineList?: number[];
  sublist?: number[];
  setOpen?: (open: boolean) => void;
  open?: boolean;
};

export default function PaymentDrawer({
  amount,
  playerId,
  fineList,
  setOpen,
  open = false,
  sublist
}: PaymentDrawerProps) {
  const stripe = getStripe();
  const { theme } = useTheme();

 
  //function to reload page on drawer close


  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Make Payment (£{amount.toFixed(2)})</Button>
      </DrawerTrigger>
      <DrawerContent className="fixed bottom-0 left-0 max-h-[70vh] min-h-[50vh]">
        <div className="">
          <DrawerHeader>
            <DrawerTitle>Payment (£{amount.toPrecision(2)})</DrawerTitle>
            <DrawerDescription>
              Enter your payment detail below
            </DrawerDescription>
          </DrawerHeader>
          <div className="max-h-80 w-full  overflow-y-auto">
            <Elements
              stripe={stripe}
              options={{
                mode: "payment",
                currency: "gbp",
                amount: Math.round(amount * 100),
                appearance: { theme: theme === "dark" ? "night" : "flat" },
              }}
            >
              <PaymentForm
                amount={Number(Math.round(amount).toFixed(2))}
                playerId={playerId}
                fineList={fineList}
                sublist={sublist}
                setOpen={setOpen}
              />
            </Elements>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
