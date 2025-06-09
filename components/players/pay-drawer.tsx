


import { Button } from "../ui/button";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "../ui/drawer";

 type PaymentDrawerProps = {
    
    amount: number;
    
   
};


export default function PaymentDrawer({amount}: PaymentDrawerProps) {

    return (
 <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Pay fines (£{amount.toPrecision(2)})</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Fine Payment</DrawerTitle>
            <DrawerDescription>Enter your payment detail below</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
            <div className="flex items-center justify-center space-x-2">
              
                <div className="text-muted-foreground text-[0.70rem] uppercase">
                  
                </div>
              </div>
              
            </div>
            <div className="mt-3 h-[120px]">
             
            </div>
          </div>
          <DrawerFooter>
            
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
    
      </DrawerContent>
    </Drawer>
  );
}