import FineForm from "@/components/fines/add-fine";
import MultipleFineForm from "@/components/fines/add-mulitple-fines";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getFines } from "@/server/actions/get-fines";
import { getPlayers } from "@/server/actions/get-players";
import { Suspense } from "react";

export default async function AddFine() {

    const playersData = await getPlayers();
    const finesData = await getFines();

    if (!playersData || ('error' in playersData)) {
        return (
            <div className="flex h-full w-full items-center justify-center mt-22 px-2">
                <p className="text-red-500">No players found</p>
            </div>
        );
    }

    if (!finesData || ('error' in finesData)) {
        return (
            <div className="flex h-full w-full items-center justify-center mt-22 px-2">
                <p className="text-red-500">No fines found</p>
            </div>
        );
    }

    const players = playersData.map((player) => ({
        ...player,
        createdAt: player.createdAt ? new Date(player.createdAt) : new Date(),
    }));

    const fines = finesData.map((fine) => ({
        ...fine,
        createdAt: fine.createdAt ? new Date(fine.createdAt) : new Date(),
    }));

  
//
    

  return (
    <div className="flex h-full w-full items-center justify-center mt-22 px-2">
      <Tabs defaultValue="single-fine" className="w-full lg:w-[50%]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="single-fine">Add Single Fine</TabsTrigger>
          <TabsTrigger value="group-fine">Add Group Fine</TabsTrigger>
        </TabsList>
        <TabsContent value="single-fine">
          <Suspense>
            <FineForm playersListData={players} finesListData={fines} />
          </Suspense>
        </TabsContent>
        <TabsContent value="group-fine">
          <Suspense>
            <MultipleFineForm  playersListData={players} finesListData={fines}/>
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
}
