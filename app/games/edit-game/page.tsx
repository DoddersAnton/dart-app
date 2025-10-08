import GameForm from "@/components/fixtures/add-game";
import { Suspense } from "react";


export default async function EditGame() {





  return (
    <div className="w-full px-2 mx-auto lg:w-[80%] mt-24">
        <Suspense>
            <GameForm   />
        </Suspense>
    </div>
  );
}
  
